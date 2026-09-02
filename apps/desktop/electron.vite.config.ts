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
import type { Plugin } from "vite";

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

/**
 * Lets HMR connect in dev, and only in dev.
 *
 * `index.html` sets `connect-src 'none'`, which is a true statement about the shipped app —
 * the renderer reaches the outside world only through the preload bridge. It also blocks
 * Vite's HMR websocket, so every renderer edit under `electron-vite dev` needed a manual
 * reload, and the only evidence was a CSP violation in a DevTools console nobody had open.
 *
 * Rewriting the served HTML rather than loosening the file keeps the production CSP exactly
 * as written: `apply: "serve"` means this never runs during a build, so there is no way for
 * the dev allowance to reach a release. The origin is spelled out rather than widened to
 * `ws:` so a stray websocket to anywhere else still fails.
 *
 * The trailing semicolon in the search string is load-bearing. The comment above the meta
 * tag quotes the directive too, and a string `replace` takes the first match — without the
 * semicolon this rewrote the prose and left the policy alone, which looks identical in the
 * diff and fails identically at runtime.
 */
function allowDevHmr(): Plugin {
  return {
    name: "trace:allow-dev-hmr",
    apply: "serve",
    transformIndexHtml: {
      order: "pre",
      handler(html, context) {
        const port = context.server?.config.server.port ?? 5173;
        const origin = `localhost:${String(port)}`;
        return html.replace("connect-src 'none';", `connect-src ws://${origin} http://${origin};`);
      },
    },
  };
}

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
    plugins: [react(), tailwindcss(), allowDevHmr()],
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
