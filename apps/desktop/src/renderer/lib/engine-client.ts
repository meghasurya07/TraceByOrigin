/**
 * The bridge, as an `EngineClient`.
 *
 * `@trace/client` — the reducer, the selectors, the store — is written against the
 * `EngineClient` interface and knows nothing about Electron. This is the adapter that
 * satisfies it from inside a renderer, and it is the only file under `src/renderer/`
 * that depends on how main forwards engine traffic.
 *
 * That constraint is what makes a second surface cheap. A browser tab would replace
 * this one file with a WebSocket-backed equivalent; a CLI already has its own. Nothing
 * above this line changes.
 *
 * Copyright (c) 2026 Origin AI
 */

import type { EngineClient, EngineStatus, Unsubscribe } from "@trace/client";
import type {
  NotificationMethod,
  NotificationParamsOf,
  ParamsOf,
  RequestMethod,
  ResultOf,
} from "@trace/protocol";

import type { TraceBridge } from "../../shared/ipc";

/**
 * Notifications arrive on one channel and are dispatched here by method.
 *
 * Main forwards every engine notification over a single `engineNotify` push, so the
 * fan-out has to happen somewhere. Doing it here rather than in each component means
 * one IPC listener for the life of the window instead of one per subscription, and it
 * is what lets `on()` return an unsubscriber with the same semantics as the real
 * `RpcEngineClient` — which the store relies on.
 */
type Handler = (params: never) => void;

export class BridgeEngineClient implements EngineClient {
  #status: EngineStatus = { phase: "starting" };
  readonly #handlers = new Map<string, Set<Handler>>();
  readonly #statusListeners = new Set<(status: EngineStatus) => void>();
  readonly #teardown: Unsubscribe[] = [];

  constructor(private readonly bridge: TraceBridge) {
    this.#teardown.push(
      bridge.onEngineNotify((notification) => {
        const set = this.#handlers.get(notification.method);
        if (set === undefined) return;
        // Copied before iterating: a handler that unsubscribes itself — which the
        // store's one-shot hydration listeners do — would otherwise mutate the set
        // mid-iteration.
        for (const handler of [...set]) handler(notification.params as never);
      }),
    );

    this.#teardown.push(
      bridge.onEngineStatus((status) => {
        this.#status = status;
        for (const listener of [...this.#statusListeners]) listener(status);
      }),
    );
  }

  request<M extends RequestMethod>(
    method: M,
    params: ParamsOf<M>,
    options?: { timeoutMs?: number },
  ): Promise<ResultOf<M>> {
    return this.bridge.request(method, params, options);
  }

  on<M extends NotificationMethod>(
    method: M,
    handler: (params: NotificationParamsOf<M>) => void,
  ): Unsubscribe {
    const set = this.#handlers.get(method) ?? new Set<Handler>();
    this.#handlers.set(method, set);
    set.add(handler as Handler);

    let live = true;
    return () => {
      // Idempotent, per the contract on `Unsubscribe`. React's strict mode calls
      // effect cleanups twice in development, so this is exercised on every mount.
      if (!live) return;
      live = false;
      set.delete(handler as Handler);
      if (set.size === 0) this.#handlers.delete(method);
    };
  }

  status(): EngineStatus {
    return this.#status;
  }

  onStatusChange(handler: (status: EngineStatus) => void): Unsubscribe {
    this.#statusListeners.add(handler);
    return () => {
      this.#statusListeners.delete(handler);
    };
  }

  /** Only meaningful for a hot reload; the window's own teardown covers the rest. */
  dispose(): void {
    for (const off of this.#teardown) off();
    this.#teardown.length = 0;
    this.#handlers.clear();
    this.#statusListeners.clear();
  }
}
