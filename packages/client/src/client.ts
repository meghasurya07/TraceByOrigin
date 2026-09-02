/**
 * `EngineClient` over an `RpcPeer`.
 *
 * Used by the desktop **main** process and by the CLI — the two places that hold a
 * real transport. The Electron renderer does not use this; it gets a bridge-backed
 * implementation instead, which is the whole reason `EngineClient` is an interface
 * rather than a class.
 *
 * Two things this adds over calling `RpcPeer` directly, both of which exist because
 * engines crash:
 *
 * - **Subscriptions outlive the peer.** `replacePeer` swaps the transport under a
 *   live set of listeners. Without it, every respawn would require the layer above to
 *   re-subscribe, and the one that forgot would go quiet in a way nobody notices
 *   until a user reports that the transcript stopped updating.
 * - **Requests fail fast while disconnected**, with `EngineUnavailable` rather than a
 *   timeout. A thirty-second hang followed by a generic error is the worst possible
 *   rendering of "the engine died".
 *
 * Copyright (c) 2026 Origin AI
 */

import { ErrorCode, RpcError } from "@trace/protocol";
import type {
  NotificationMethod,
  NotificationParamsOf,
  ParamsOf,
  RequestMethod,
  ResultOf,
  RpcPeer,
} from "@trace/protocol";

import type { EngineClient, EngineStatus, Unsubscribe } from "./types.js";

export interface RpcEngineClientOptions {
  peer: RpcPeer;
  /** Defaults to `{ phase: "starting" }` — the handshake has not completed yet. */
  status?: EngineStatus;
  /**
   * Applied to any request that does not pass its own.
   *
   * Generous on purpose. The ceiling that matters is the turn's, and a turn is
   * driven by notifications; the requests this covers are short (`fs/read`,
   * `git/status`), so a long timeout only ever fires on a genuinely wedged engine.
   */
  defaultTimeoutMs?: number;
  /**
   * Called when a notification handler throws.
   *
   * Handlers are UI callbacks and one of them throwing must not stop the others from
   * seeing the event — a render error in the diff panel should not silently freeze
   * the transcript.
   */
  onHandlerError?: (error: unknown, method: string) => void;
}

type AnyHandler = (params: never) => void;

const DEFAULT_TIMEOUT_MS = 60_000;

export class RpcEngineClient implements EngineClient {
  #peer: RpcPeer;
  #status: EngineStatus;
  readonly #defaultTimeoutMs: number;
  readonly #onHandlerError: ((error: unknown, method: string) => void) | undefined;

  /** method → our own subscribers. Survives `replacePeer`. */
  readonly #handlers = new Map<string, Set<AnyHandler>>();
  /** method → the single unsubscribe for our forwarding handler on the current peer. */
  readonly #peerUnsubs = new Map<string, Unsubscribe>();
  readonly #statusWatchers = new Set<(status: EngineStatus) => void>();

  constructor(options: RpcEngineClientOptions) {
    this.#peer = options.peer;
    this.#status = options.status ?? { phase: "starting" };
    this.#defaultTimeoutMs = options.defaultTimeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.#onHandlerError = options.onHandlerError;
  }

  async request<M extends RequestMethod>(
    method: M,
    params: ParamsOf<M>,
    options?: { timeoutMs?: number },
  ): Promise<ResultOf<M>> {
    if (this.#status.phase === "restarting" || this.#status.phase === "failed") {
      throw new RpcError(
        ErrorCode.EngineUnavailable,
        this.#status.phase === "restarting"
          ? "The engine is restarting."
          : `The engine could not be started: ${this.#status.error}`,
      );
    }

    return this.#peer.request(method, params, {
      timeoutMs: options?.timeoutMs ?? this.#defaultTimeoutMs,
    });
  }

  on<M extends NotificationMethod>(
    method: M,
    handler: (params: NotificationParamsOf<M>) => void,
  ): Unsubscribe {
    let subscribers = this.#handlers.get(method);
    if (subscribers === undefined) {
      subscribers = new Set();
      this.#handlers.set(method, subscribers);
      this.#attach(method);
    }

    const erased = handler as AnyHandler;
    subscribers.add(erased);

    let live = true;
    return () => {
      if (!live) return;
      live = false;
      subscribers.delete(erased);
      // The forwarding handler stays attached even when the set empties. It costs one
      // map entry, and keeping it means a component that unmounts and remounts — which
      // React does constantly in development — does not churn peer subscriptions.
    };
  }

  status(): EngineStatus {
    return this.#status;
  }

  onStatusChange(handler: (status: EngineStatus) => void): Unsubscribe {
    this.#statusWatchers.add(handler);
    return () => {
      this.#statusWatchers.delete(handler);
    };
  }

  // -- host-only surface, not part of `EngineClient` -------------------------

  /** Publish a lifecycle transition. Only the process that supervises the engine calls this. */
  setStatus(status: EngineStatus): void {
    this.#status = status;
    for (const watcher of [...this.#statusWatchers]) {
      try {
        watcher(status);
      } catch (error) {
        this.#onHandlerError?.(error, "engine/status");
      }
    }
  }

  /**
   * Point every existing subscription at a freshly spawned engine.
   *
   * Requests in flight against the dead peer are not retried. They cannot be: the
   * engine that would have answered is gone, and a `session/prompt` replayed against
   * a new process would start a second turn.
   */
  replacePeer(peer: RpcPeer): void {
    for (const unsub of this.#peerUnsubs.values()) unsub();
    this.#peerUnsubs.clear();
    this.#peer = peer;
    for (const method of this.#handlers.keys()) this.#attach(method);
  }

  get peer(): RpcPeer {
    return this.#peer;
  }

  #attach(method: string): void {
    const unsub = this.#peer.on(method as NotificationMethod, (params) => {
      // Snapshot: a handler is allowed to unsubscribe itself, and mutating a Set
      // mid-iteration silently skips the next entry.
      for (const handler of [...(this.#handlers.get(method) ?? [])]) {
        try {
          (handler as (params: unknown) => void)(params);
        } catch (error) {
          this.#onHandlerError?.(error, method);
        }
      }
    });
    this.#peerUnsubs.set(method, unsub);
  }
}
