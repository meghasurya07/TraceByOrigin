/**
 * `window.trace`, resolved once.
 *
 * Every other file under `src/renderer/` imports `bridge` from here rather than
 * reaching for the global, which keeps the renderer's dependency on Electron to a
 * single line and makes the failure mode legible: if the preload did not run, this
 * throws with a sentence that says so, instead of a `Cannot read properties of
 * undefined (reading 'hostInfo')` fifteen frames deep in a component.
 *
 * Copyright (c) 2026 Origin AI
 */

import type { TraceBridge } from "../../shared/ipc";

function resolve(): TraceBridge {
  const candidate: TraceBridge | undefined = window.trace;
  if (candidate === undefined) {
    throw new Error(
      "The preload bridge is missing. This build's `webPreferences.preload` did not load — " +
        "check that `out/preload/index.cjs` exists and that the window was created by `window.ts`.",
    );
  }
  return candidate;
}

export const bridge: TraceBridge = resolve();
