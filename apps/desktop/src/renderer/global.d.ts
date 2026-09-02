/**
 * The one global the renderer has.
 *
 * This augmentation lives here rather than in `src/shared/ipc.ts` because it needs
 * `lib.dom`'s `Window`, and `shared/` is compiled by the main process's project too —
 * where `Window` does not exist. See the header of `shared/ipc.ts`.
 *
 * `readonly` is doing real work: it makes `window.trace = …` a compile error, so the
 * bridge cannot be monkey-patched by a component that finds it inconvenient.
 *
 * Copyright (c) 2026 Origin AI
 */

import type { TraceBridge } from "../shared/ipc";

declare global {
  interface Window {
    readonly trace: TraceBridge;
  }
}
