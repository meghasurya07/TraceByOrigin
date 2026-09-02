/**
 * Bundle the engine for shipping.
 *
 * `tsc -b` emits `packages/engine/dist/*.js` as a tree of ES modules that still import
 * `@anthropic-ai/sdk`, `@trace/protocol`, `zod`, `ignore` and `picomatch` by bare
 * specifier. That is exactly right in the repo, where pnpm has laid those out, and useless
 * inside an installer: `extraResources` copies files, not a module graph, so a packaged
 * engine would fail its very first import and the app would launch to a dead engine.
 *
 * So the engine is bundled the same way the main process is — one file, dependencies
 * inlined — into `out/engine/dist/main.js`, which `electron-builder.yml` then copies to
 * `resources/engine/dist/main.js`. That path is not incidental: it is what
 * `engineEntry()` in `src/main/engine-host.ts` already looks for when `app.isPackaged`,
 * so nothing in the app changes, and `engine.ts` reading `../package.json` for its version
 * string still lands on the engine's own manifest one directory up.
 *
 * ## Why this lives in the desktop app
 *
 * The engine has no bundler of its own and does not need one to run from source; it is
 * only ever bundled because *this* app ships it inside an installer. Vite is already a
 * dependency here, so the app that has the requirement also has the tool.
 *
 * ## What stays out
 *
 * `node-pty` is a native addon: it cannot be bundled, and its prebuilt `.node` files have
 * to sit in a real directory on disk. It is left external and shipped as a package beside
 * the bundle, where the `createRequire(import.meta.url)` in `terminal.ts` finds it.
 *
 * `@vscode/ripgrep` is the opposite case and worth spelling out, because it looks like it
 * should be external too. It is bundled — it is nine lines of JavaScript — but all it does
 * is `require.resolve("@vscode/ripgrep-<platform>-<arch>/bin/rg")`, so the *platform*
 * package must be on disk beside the bundle. That is why `electron-builder.yml` names a
 * different ripgrep package per target.
 *
 * Run: `node scripts/bundle-engine.mjs` (after `tsc -b`). `pnpm package` does both.
 *
 * Copyright (c) 2026 Origin AI
 */

import { builtinModules, createRequire } from "node:module";
import { existsSync } from "node:fs";
import { copyFile, cp, readdir, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { build } from "vite";

const DESKTOP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ENGINE = path.resolve(DESKTOP, "../../packages/engine");
const ENTRY = path.join(ENGINE, "dist/main.js");
const OUT = path.join(DESKTOP, "out/engine");
const STAGED = path.join(OUT, "node_modules");

/** Left to be resolved on disk at runtime. See the header. */
const EXTERNAL = ["node-pty", ...builtinModules.flatMap((name) => [name, `node:${name}`])];

/**
 * The prebuild directory `node-pty/lib/utils.js` will look for, and the ripgrep package
 * `@vscode/ripgrep` will ask for.
 *
 * Host platform, deliberately: the staged binaries only ever have to match the machine the
 * installer is built on, because a macOS DMG has to be built and signed on a Mac and a deb
 * on Linux regardless. Cross-staging would produce an installer whose terminal and search
 * are broken in a way nothing on the build machine could catch.
 */
const HOST = `${process.platform}-${process.arch}`;

if (!existsSync(ENTRY)) {
  console.error(`No engine build at ${ENTRY}. Run \`pnpm -F @trace/engine build\` first.`);
  process.exit(1);
}

await build({
  // Without this, Vite finds `electron.vite.config.ts` two directories up and tries to
  // build the app instead.
  configFile: false,
  root: ENGINE,
  logLevel: "warn",
  // `node` and not the browser field: the engine imports `@anthropic-ai/sdk`, which ships
  // a browser build that swaps `node:fs` for stubs and would silently lose file uploads.
  resolve: { conditions: ["node"] },
  /**
   * `noExternal: true` is the whole point of this script.
   *
   * A Vite SSR build externalizes every bare import by default — correct for a server that
   * runs next to its `node_modules`, and the exact failure this file exists to prevent.
   * Without it the "bundle" comes out at 249 kB still importing `@anthropic-ai/sdk`, `zod`,
   * `ignore` and `picomatch`, which is the unpackageable tree `tsc` already produced.
   *
   * `external` here rather than only in `rollupOptions` because `noExternal: true` is
   * absolute: the resolver has to be told which specifiers survive it.
   */
  ssr: { target: "node", noExternal: true, external: ["node-pty"] },
  build: {
    // The floor from the root `engines` field. Electron 44 runs Node 24, so this only
    // decides how much syntax gets down-levelled — and nothing here needs any of it.
    target: "node22",
    outDir: OUT,
    emptyOutDir: true,
    // A stack trace from a user's machine is the only debugging available once this
    // ships, and minified engine frames would make every bug report unusable.
    minify: false,
    sourcemap: true,
    reportCompressedSize: false,
    ssr: true,
    rollupOptions: {
      input: ENTRY,
      external: EXTERNAL,
      output: { format: "es", entryFileNames: "dist/main.js", chunkFileNames: "dist/[name].js" },
    },
  },
});

/**
 * The manifest, copied rather than generated.
 *
 * `type: "module"` is what lets Node load the `.js` bundle as ESM, and `version` is what
 * `initialize` reports to the client. Writing a trimmed one by hand would put the version
 * in two places, which is the drift `ENGINE_VERSION` exists to avoid.
 */
await copyFile(path.join(ENGINE, "package.json"), path.join(OUT, "package.json"));

/**
 * Stage the two dependencies that have to exist as directories on disk.
 *
 * Resolved through `createRequire` from the engine's own manifest rather than named by
 * path, because that is precisely what the engine does at runtime — `terminal.ts` requires
 * `node-pty`, and the bundled `@vscode/ripgrep` requires its platform package. Resolving
 * them the same way is what makes "it staged" and "it will load" the same statement, and it
 * survives pnpm changing its store layout underneath.
 *
 * They land in `out/engine/node_modules/`, one directory above the bundle, which is the
 * first `node_modules` Node checks when resolving from `resources/engine/dist/main.js`.
 */
const requireFromEngine = createRequire(path.join(ENGINE, "package.json"));

const ptyRoot = path.dirname(requireFromEngine.resolve("node-pty/package.json"));

/**
 * `lib/`, the manifest, and one prebuild — nothing else.
 *
 * The published package is 63 MB: it carries prebuilds for four platforms, and 29 of the
 * 30 MB in `prebuilds/win32-x64` are `.pdb` symbol files. Copying it whole would put a
 * quarter of a gigabyte of other platforms' debug symbols in every installer. `src/`,
 * `deps/` and `third_party/` go too — they are inputs to `node-gyp`, and `lib/utils.js`
 * loads the `.node` from `prebuilds/` at runtime and never looks at them.
 */
function shipWithPty(src) {
  const rel = path.relative(ptyRoot, src).replaceAll("\\", "/");
  if (rel === "") return true;
  if (rel.endsWith(".pdb")) return false;
  const parts = rel.split("/");
  if (parts[0] === "package.json" || parts[0] === "lib") return true;
  // The directory itself, then only the host's subtree inside it.
  if (parts[0] === "prebuilds") return parts.length < 2 || parts[1] === HOST;
  return false;
}

await cp(ptyRoot, path.join(STAGED, "node-pty"), {
  recursive: true,
  dereference: true,
  filter: shipWithPty,
});

if (!existsSync(path.join(STAGED, "node-pty", "prebuilds", HOST))) {
  // Only Windows and macOS have prebuilds; Linux builds node-pty from source, which needs
  // the toolchain present on the build machine. Failing loudly here beats shipping an
  // installer whose Terminal tab refuses with a message about a missing native module.
  console.error(
    `node-pty has no prebuild for ${HOST}. Run \`pnpm rebuild node-pty\` on this machine first.`,
  );
  process.exit(1);
}

/**
 * ripgrep's platform package, resolved the way the wrapper resolves it.
 *
 * `require.resolve` runs *from the wrapper*, not from the engine: the platform packages are
 * the wrapper's own optional dependencies and are invisible from anywhere else.
 */
const rgPackage = `@vscode/ripgrep-${HOST}`;
const requireFromRipgrep = createRequire(requireFromEngine.resolve("@vscode/ripgrep"));
const rgRoot = path.dirname(requireFromRipgrep.resolve(`${rgPackage}/package.json`));
await cp(rgRoot, path.join(STAGED, "@vscode", path.basename(rgRoot)), {
  recursive: true,
  dereference: true,
});

/** Report the result, since a bundle that quietly shrank is worth noticing. */
const bundled = path.join(OUT, "dist/main.js");
const { size } = await stat(bundled);
const files = await readdir(path.join(OUT, "dist"));

/** Total bytes under a directory, so the staged natives can be reported honestly. */
async function weigh(dir) {
  let total = 0;
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const child = path.join(dir, entry.name);
    total += entry.isDirectory() ? await weigh(child) : (await stat(child)).size;
  }
  return total;
}

const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;
console.log(
  `engine bundled → out/engine/dist/main.js  ${(size / 1024).toFixed(1)} kB` +
    ` (${String(files.filter((name) => name.endsWith(".js")).length)} js files)`,
);
console.log(`staged node-pty (${HOST})  ${mb(await weigh(path.join(STAGED, "node-pty")))}`);
console.log(`staged ${rgPackage}  ${mb(await weigh(path.join(STAGED, "@vscode")))}`);
