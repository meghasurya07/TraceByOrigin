/**
 * Persisted main-process state.
 *
 * Deliberately small. Only what the *window* needs before the renderer exists —
 * bounds, which folders were open, which session was active — because those have to
 * be known at `BrowserWindow` construction time and the renderer is not running yet.
 * Anything the renderer can decide for itself (sidebar width, expanded tool cards)
 * belongs in `localStorage`, and anything the agent needs belongs in engine settings.
 *
 * A corrupt or missing file is not an error condition: it means "first run", which is
 * also what a half-written file after a power cut should mean. Losing your window
 * position is a shrug; refusing to start because a JSON file has a stray brace is not.
 *
 * Copyright (c) 2026 Origin AI
 */

import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

export interface WindowBounds {
  x?: number;
  y?: number;
  width: number;
  height: number;
}

export interface PersistedState {
  bounds: WindowBounds;
  maximized: boolean;
  /** Absolute paths, reopened on launch. Empty is valid — Trace supports "no repo". */
  workspaceRoots: string[];
  activeSessionId: string | null;
}

export const DEFAULT_STATE: PersistedState = {
  bounds: { width: 1440, height: 900 },
  maximized: false,
  workspaceRoots: [],
  activeSessionId: null,
};

/**
 * Windows holds a handle on a file it has just scanned, so `rename` over a fresh
 * temp file intermittently fails with `EPERM`/`EACCES`/`EBUSY`. The engine's session
 * store hit this first; the fix is the same and short enough to not be worth sharing
 * across a package boundary.
 */
const TRANSIENT_RENAME_CODES = new Set(["EPERM", "EACCES", "EBUSY"]);
const RENAME_RETRIES = 5;
const RENAME_BACKOFF_MS = 10;

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

async function writeAtomic(file: string, contents: string): Promise<void> {
  const temp = `${file}.tmp`;
  await writeFile(temp, contents, "utf8");

  for (let attempt = 0; ; attempt += 1) {
    try {
      await rename(temp, file);
      return;
    } catch (cause) {
      const code = (cause as { code?: string } | null)?.code ?? "";
      if (attempt >= RENAME_RETRIES || !TRANSIENT_RENAME_CODES.has(code)) {
        await unlink(temp).catch(() => undefined);
        throw cause;
      }
      await sleep(RENAME_BACKOFF_MS * (attempt + 1));
    }
  }
}

function coerce(raw: unknown): PersistedState {
  if (typeof raw !== "object" || raw === null) return { ...DEFAULT_STATE };
  const value = raw as Partial<PersistedState>;

  const bounds = value.bounds;
  const width =
    typeof bounds?.width === "number" && bounds.width > 320
      ? bounds.width
      : DEFAULT_STATE.bounds.width;
  const height =
    typeof bounds?.height === "number" && bounds.height > 240
      ? bounds.height
      : DEFAULT_STATE.bounds.height;

  return {
    bounds: {
      width,
      height,
      // Position is dropped rather than clamped when absent: Electron centres a
      // window with no x/y, which is the right answer on a machine whose monitor
      // layout changed since last launch.
      ...(typeof bounds?.x === "number" ? { x: bounds.x } : {}),
      ...(typeof bounds?.y === "number" ? { y: bounds.y } : {}),
    },
    maximized: value.maximized === true,
    workspaceRoots: Array.isArray(value.workspaceRoots)
      ? value.workspaceRoots.filter((root): root is string => typeof root === "string")
      : [],
    activeSessionId: typeof value.activeSessionId === "string" ? value.activeSessionId : null,
  };
}

export class StateStore {
  #state: PersistedState;
  #writing: Promise<void> = Promise.resolve();
  #dirty = false;

  private constructor(
    private readonly file: string,
    state: PersistedState,
  ) {
    this.#state = state;
  }

  static async open(userDataDir: string): Promise<StateStore> {
    const file = path.join(userDataDir, "window-state.json");
    let state = { ...DEFAULT_STATE };
    try {
      state = coerce(JSON.parse(await readFile(file, "utf8")));
    } catch {
      // First run, or a file we cannot make sense of. Both mean defaults.
    }
    return new StateStore(file, state);
  }

  get(): PersistedState {
    return this.#state;
  }

  /**
   * Merge and schedule a write.
   *
   * Coalesced through a single promise chain because the caller is a resize handler:
   * dragging a window edge fires dozens of times a second, and each one must not
   * become its own temp-file-plus-rename.
   */
  update(patch: Partial<PersistedState>): void {
    this.#state = { ...this.#state, ...patch };
    if (this.#dirty) return;
    this.#dirty = true;
    this.#writing = this.#writing.then(async () => {
      await sleep(250);
      this.#dirty = false;
      await this.flush();
    });
  }

  /** Write now. Called on quit, where "eventually" is not soon enough. */
  async flush(): Promise<void> {
    try {
      await mkdir(path.dirname(this.file), { recursive: true });
      await writeAtomic(this.file, `${JSON.stringify(this.#state, null, 2)}\n`);
    } catch {
      // Window position is not worth a dialog, a log spam loop, or a failed quit.
    }
  }

  /** Await any scheduled write. Used on `before-quit`. */
  async settle(): Promise<void> {
    await this.#writing;
    await this.flush();
  }
}
