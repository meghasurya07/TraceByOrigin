/**
 * Build config for all three Electron targets.
 *
 * ## Why `external` is written out here instead of using `externalizeDepsPlugin()`
 *
 * `electron` must never be bundled. The npm `electron` package is not the runtime module —
 * its `index.js` is a stub whose whole body is `module.exports = getElectronPath()`, a
 * `path.txt` lookup relative to `__dirname`. Inline it into `out/main/index.js` and that
 * `__dirname` becomes `out/main`, where there is no `path.txt`, so the app dies on load with
 * "Electron failed to install correctly" — while the real `electron` module, the one Electron
 * injects into the main process at runtime, is never consulted.
 *
 * electron-vite ships `externalizeDepsPlugin()` for exactly this, and under Vite 8 it does
 * nothing: it mutates `config.build` inside its `config` hook rather than returning a partial
 * to merge, and Vite 8 discards that. The same is true of electron-vite's own main/preload
 * presets, which is where the `['electron', ...builtinModules]` default is supposed to come
 * from. A probe of the resolved config shows `build.rollupOptions.external: undefined` in
 * every environment, and the SSR environment carries `resolve.noExternal: true` — so
 * everything reachable gets inlined. Values in *this* file are honoured, so the list lives
 * here. Delete it and the app builds clean and fails at startup.
 *
 * Everything else is bundled deliberately, which is the other half of the reason not to use
 * the plugin: it externalizes whatever is in `dependencies`, and this app's two dependencies
 * are the `@trace/*` workspace packages. Those have no runtime dependencies of their own, and
 * bundling them means the packaged app needs no `node_modules` inside the asar and no
 * pnpm symlink survives into a release — a symlinked workspace package is the single most
 * common way an Electron build works in dev and breaks when packaged.
 *
 * The renderer gets no `external` at all: it has no `node_modules` to resolve from at
 * runtime, so everything it uses must be in the bundle. Its `@trace/client` import being
 * bundled rather than externalized is also what keeps that code runnable in a browser later.
 *
 * Copyright (c) 2026 Origin AI
 */

import { builtinModules } from "node:module";
import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "electron-vite";

/**
 * Left to the runtime, never bundled.
 *
 * Both spellings of every built-in, because Electron's main process and a dependency's
 * CommonJS internals disagree about the `node:` prefix and Rolldown matches the specifier
 * as written.
 */
const RUNTIME_ONLY = [
  "electron",
  /^electron\/.+/,
  ...builtinModules.flatMap((name) => [name, `node:${name}`]),
];

export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        external: RUNTIME_ONLY,
        input: { index: resolve(__dirname, "src/main/index.ts") },
      },
    },
  },
  /**
   * Emitted as CommonJS, deliberately, in an ESM package.
   *
   * Electron only loads an ESM preload when `sandbox: false`. Chromium's renderer
   * sandbox is worth more than module-syntax consistency in a 60-line file that does
   * nothing but wire `ipcRenderer` to `contextBridge`, so the preload ships as `.cjs`
   * and the window keeps `sandbox: true`. A sandboxed preload's `require` is limited to
   * `electron` and a short allow-list — which is all this one asks for.
   */
  preload: {
    build: {
      rollupOptions: {
        external: RUNTIME_ONLY,
        input: { index: resolve(__dirname, "src/preload/index.ts") },
        output: { format: "cjs", entryFileNames: "[name].cjs" },
      },
    },
  },
  renderer: {
    root: resolve(__dirname, "src/renderer"),
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": resolve(__dirname, "src/renderer"),
        "@shared": resolve(__dirname, "src/shared"),
      },
    },
    build: {
      rollupOptions: {
        input: { index: resolve(__dirname, "src/renderer/index.html") },
      },
    },
  },
});
