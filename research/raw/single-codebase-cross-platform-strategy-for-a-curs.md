# Single-codebase cross-platform strategy for a Cursor-class product.

## URLs fetched
- https://v2.tauri.app/start/
- https://code.visualstudio.com/updates
- https://www.electronjs.org/docs/latest/tutorial/electron-timelines
- https://raw.githubusercontent.com/microsoft/vscode/main/package.json
- https://v3.wails.io/
- https://v2.tauri.app/start/prerequisites/
- https://raw.githubusercontent.com/microsoft/vscode/main/.npmrc
- https://releases.electronjs.org/schedule
- https://wails.io/
- https://cursor.com/changelog
- https://cursor.com/mobile
- https://wails.io/docs/introduction
- https://neutralino.js.org/docs/
- https://raw.githubusercontent.com/microsoft/monaco-editor/main/README.md
- https://raw.githubusercontent.com/wailsapp/wails/master/README.md
- https://raw.githubusercontent.com/TypeFox/monaco-languageclient/main/README.md
- https://codemirror.net/docs/
- https://raw.githubusercontent.com/gitpod-io/openvscode-server/main/README.md
- https://codemirror.net/docs/guide/
- https://raw.githubusercontent.com/zed-industries/zed/main/crates/gpui/README.md
- https://raw.githubusercontent.com/coder/code-server/main/README.md
- https://v2.tauri.app/plugin/shell/

## Content

I'll research this facet thoroughly. Let me start with parallel searches on the key decision areas.

---

[FETCH RESULT]
total 16
drwxr-xr-x 1 bodep 197609 0 Aug 31 11:47 .
drwxr-xr-x 1 bodep 197609 0 Aug 31 11:47 ..

---

[FETCH RESULT]
API Error: 400 Anthropic Claude bad request: InvokeModelWithResponseStream: operation error Bedrock Runtime: InvokeModelWithResponseStream, https response error StatusCode: 400, RequestID: ae569d7a-8c14-49d7-b7a2-d0beb22131e3, ValidationException: Tool 'web_search' not found in provided tools (request id: ed033edaa1c029c300fbf82c07c04926) [trace_id=b59a45114dd24510c4bde34fd4b44f9e] (request id: 20260901130401323404536sjvszzGda1eX0)

---

Empty working directory — this is greenfield research. Let me retry the web search.

---

[FETCH RESULT]
API Error: 400 Anthropic Claude bad request: InvokeModelWithResponseStream: operation error Bedrock Runtime: InvokeModelWithResponseStream, https response error StatusCode: 400, RequestID: 0eca8c7a-7852-4644-809b-e9a024112996, ValidationException: Tool 'web_search' not found in provided tools (request id: 3b91ac82376d0ce34668d363dc6b17f8) [trace_id=879d03e7850ad9da4a20ba9077981487] (request id: 202609011305113098225314xdzsHveCmEaC)

---

WebSearch is unavailable on this backend. Let me test WebFetch, which uses a different path.

---

[FETCH RESULT]
**Latest version:** VS Code 1.135, with a stated "_Release date: August 26, 2026_."

**Electron / Node.js / Chromium versions:** Not present. These release notes contain no mention of Electron, Node.js, or Chromium version numbers — the page's own table of contents lists only four sections: Agents, Chat, Deprecated features and settings, and Thank you. Historically that kind of runtime detail would appear elsewhere; here it simply isn't included.

**What the 1.135 notes do cover**, per the summary, is that the release "helps you continue agent sessions across applications, get a second opinion on agent work, and understand chat usage." Highlights include:

- **External agent sessions** — recent Copilot or Claude sessions started in other apps now surface in the Sessions list, controlled by `chat.agentSessions.showExternal`, which by default "shows up to two recently updated external sessions."
- **Rubber Duck (Experimental)** — invoked via `/rubber-duck`, it "helps surface missed details or edge cases" by consulting a complementary model.
- **Agents window layout** — the single-pane side layout (`sessions.layout.singlePaneDetailPanel`) is "now enabled by default for the Agents window on desktop," alongside a decluttered session header and session-info pills moved above the chat input.
- **Detailed chat usage** — hovering the redesigned response footer reveals "a per-model breakdown of the input, cached input, and output tokens."
- **Sandboxing rollback** — the local agent harness sandbox default returned to 0%, though it "remains available as an opt-in feature through the UI."

One version-adjacent note: the Node-related contribution about a "package.json hover metadata broken in npm 12+" fix references npm, not a bundled Node runtime version.

To find Electron/Chromium/Node details, you'd need to check a different source, such as the VS Code repository or the About dialog in the application itself.

---

[FETCH RESULT]
## What the page actually covers

**Version numbers present**
- Only two Tauri release numbers appear as links: a "Tauri 1.0 blog post" and the "Tauri 2.0 audit report" (a Radically Open Security PDF). Migration pages are listed for "Upgrade from Tauri 1.0" and "Upgrade from Tauri 2.0 Beta."
- The one concrete technical figure: "a minimal Tauri app can be less than 600KB in size."
- Site/branch markers indicate v2 docs (v2.tauri.app, `v2` doc-edit branch, `plugins-workspace/tree/v2`). Page footer shows a last-updated date of Jul 22, 2026.

**Platform support**
- Stated broadly as "all major desktop and mobile platforms" — no OS version minimums (no Windows/macOS/Linux/iOS/Android version requirements) are given on this page.
- Platform coverage is inferable only from navigation links: desktop distribution via Windows Installer, Microsoft Store, DMG, macOS Application Bundle, App Store, AppImage, Debian, RPM, AUR, Flathub, Snapcraft; mobile via Google Play plus iOS/Android code signing. Mobile-specific guides listed include multi-window and file associations on mobile, and mobile plugin development.

**Prerequisites**
- No dependency versions are listed here (no Rust, Node, or SDK versions). The page only directs readers to "follow the [prerequisites guide]" to install "all of the dependencies required by Tauri."
- Scaffolding commands shown for Bash, PowerShell, Fish, npm, Yarn, pnpm, deno, bun, and Cargo — e.g., `npm create tauri-app@latest` and `cargo install create-tauri-app --locked`.

**Feature claims (v2 docs framing)**
- Security: built on Rust for "memory, thread, and type-safety"; the project "undergoes a security audit for major and minor releases," covering upstream dependencies too.
- Size: uses the OS's existing web view rather than shipping a browser engine.
- Architecture: any frontend compiling to HTML/JS/CSS; backend logic in Rust, Swift, or Kotlin; JS↔Rust calls via the `invoke` function; windowing by TAO and web view rendering by WRY.

**Bottom line:** beyond the ~600KB size figure and 1.0/2.0 references, this overview page contains no specific version requirements or per-platform minimums — those live on the linked prerequisites page.

---

WebFetch works, WebSearch doesn't. I'll fetch primary sources directly. Starting with desktop shells.

---

[FETCH RESULT]
The server returned HTTP 403 Forbidden.

The response body was not retrieved. If this URL requires authentication, use an authenticated tool (e.g. `gh` for GitHub, or an MCP-provided fetch tool) instead of WebFetch.

---

[FETCH RESULT]
**The page doesn't contain a timeline table with per-release version numbers.** No list of Electron/Chromium/Node.js version triplets appears in this content, and no specific "most recent releases" are named. The page instead links out to that data:

- The schedule lives externally: "[Electron's Release Schedule](https://releases.electronjs.org/schedule) lists a schedule of Electron major releases" including alpha, beta, stable, and end-of-life dates plus dependency versions.
- For Chromium timing, the doc points to "Chromium's public release schedule" at chromiumdash.appspot.com/schedule.
- Node.js timing is shown only as an embedded image of the nodejs/Release schedule SVG, not as text.

**The only concrete version pairings given are illustrative examples:**

| Electron | Chromium |
|---|---|
| 26 | 116 |
| 27 | 118 |

These come from the explanation that "Electron targets Chromium even-number versions, releasing every 8 weeks in concert with Chromium's 4-week release schedule."

**Support status rules (not tied to actual current versions):**

- Support covers "the latest 3 stable releases," and only the newest minor in each series qualifies.
- The doc's hypothetical: if 42.1.x were newest, then 41.0.x and 40.2.x would also be supported — a security fix would land in 42.1.x, but no fresh 42.0.x build would ship.
- Fix distribution is tiered: the newest stable line takes everything from `main`, the prior line gets most fixes depending on capacity, and "The oldest supported release line will receive only security fixes directly."
- Node.js updates flow into stable lines after release — patch bumps become Electron patch releases, minor bumps become Electron minor releases, while security-only branches take just the security changes.

**One historical exception noted:** support for Electron 22 was stretched to October 10, 2023, tied to extended end-of-life for Windows 7/8/8.1.

To get the actual version triplets and current support status, you'd need the linked releases.electronjs.org/schedule page.

---

[FETCH RESULT]
## Not Found

**`electron`** — there is no `electron` entry in `devDependencies`. The closest matches are:
- `"@vscode/gulp-electron": "^1.43.0"` (devDependencies)
- a script named `"electron"` that runs `"node build/lib/electron.ts"`

**`chokidar`** — absent entirely.

**`@vscode/ripgrep`** — not a declared dependency. It appears only under `allowScripts` as `"@vscode/ripgrep@1.17.1": true`. The actual dependency is `"@vscode/ripgrep-universal": "^1.18.0"`.

## Found

| Package | Version | Location |
|---|---|---|
| `node-pty` | `^1.2.0-beta.15` | dependencies |
| `@parcel/watcher` | `^2.5.6` | dependencies |
| `@vscode/tree-sitter-wasm` | `^0.3.1` | dependencies (WASM, not the native `tree-sitter` binding) |

## Other native / native-adjacent modules (all in `dependencies`)

- `"@vscode/deviceid": "^0.1.1"`
- `"@vscode/fs-copyfile": "2.0.0"`
- `"@vscode/native-watchdog": "^1.4.6"`
- `"@vscode/policy-watcher": "^1.4.0"`
- `"@vscode/spdlog": "^0.15.8"`
- `"@vscode/sqlite3": "5.1.12-vscode"`
- `"@vscode/sudo-prompt": "9.3.2"`
- `"@vscode/windows-mutex": "^0.5.0"`
- `"@vscode/windows-process-tree": "^0.8.0"`
- `"@vscode/windows-registry": "^1.2.0"`
- `"kerberos": "2.1.1"`
- `"native-is-elevated": "0.9.0"`
- `"native-keymap": "^3.3.5"`
- `"node-addon-api": "^6.0.0"`
- `"vscode-oniguruma": "1.7.0"`
- optionalDependencies: `"windows-foreground-love": "0.6.1"`

## Version discrepancies worth noting

Several `allowScripts` entries pin exact builds that differ from the declared ranges — e.g. `native-keymap@3.3.9` vs. the declared `^3.3.5`, `@vscode/deviceid@0.1.5` vs. `^0.1.1`, `@vscode/windows-mutex@0.5.3` vs. `^0.5.0`. Also present only in `allowScripts`: `@vscode/windows-ca-certs@0.3.4`, `bufferutil@4.1.0`, `utf-8-validate@5.0.10`, `fsevents@2.3.2` / `fsevents@1.2.13`, plus disabled entries for `cpu-features`, `koffi@3.1.2`, and `ssh2`.

There is also an override forcing `node-addon-api` to `7.1.0` for `kerberos@2.1.1`, and a global `"node-gyp-build": "4.8.1"` override.

---

[FETCH RESULT]
## Tauri v2 Prerequisites (per the page above)

**Rust** — Required; no minimum version number is given on this page. Install via `rustup` (`curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh` on Linux/macOS; on Windows use the installer or `winget install --id Rustlang.Rustup`). On Windows the MSVC toolchain must be the default host triple — one of `x86_64-pc-windows-msvc`, `i686-pc-windows-msvc`, or `aarch64-pc-windows-msvc`; fix an existing install with `rustup default stable-msvc`. Restart your terminal afterward.

**Node.js** — Optional, "Only if you intend to use a JavaScript frontend framework." The guidance is to install the LTS release; the doc shows sample output (`v20.10.0` / npm `10.2.3`) as verification, not as a floor. `corepack enable` if you want pnpm/yarn.

**Operating systems** — "macOS Catalina (10.15) and later" and "Windows 7 and later"; Linux support depends on distro packages.

**Windows specifics**
- Microsoft C++ Build Tools, selecting the "Desktop development with C++" workload.
- WebView2: bundled already — "WebView 2 is already installed on Windows 10 (from version 1803 onward) and later versions of Windows." Older systems need the Evergreen Bootstrapper from Microsoft's WebView2 download page.
- VBSCRIPT optional feature must be enabled only if building MSI targets; symptom of it missing is a `failed to run light.exe` error. It's noted as being deprecated by Microsoft.

**Linux / WebKitGTK** — WebKitGTK 4.1 is the target across distros, though package names vary: `libwebkit2gtk-4.1-dev` (Debian), `webkit2gtk-4.1` (Arch), `webkit2gtk4.1-devel` (Fedora/OSTree), `net-libs/webkit-gtk:4.1` (Gentoo), `webkit2gtk-4.1-dev` (Alpine); openSUSE is listed as `webkit2gtk3-devel`. Alongside it you need a build toolchain plus curl, wget, file, OpenSSL, librsvg, an appindicator library, and libxdo (where applicable). Alpine has two extra caveats: containers ship no fonts, so add something like `font-dejavu`, and musl static linking may require matching `*-static` packages. Nix/NixOS users are pointed to the NixOS Wiki.

**macOS** — Full Xcode from the App Store or Apple Developer site (launch it once to finish setup). Desktop-only developers can instead run `xcode-select --install`.

**Android** — Android Studio; set `JAVA_HOME` to the bundled JBR; via SDK Manager install SDK Platform, Platform-Tools, "NDK (Side by side)", Build-Tools, and Command-line Tools; set `ANDROID_HOME` and `NDK_HOME`; add targets `aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android`. No minimum API level is stated here.

**iOS** — macOS-only and requires full Xcode rather than just Command Line Tools. Add targets `aarch64-apple-ios x86_64-apple-ios aarch64-apple-ios-sim`, then install Homebrew and `brew install cocoapods`. No minimum iOS version appears on this page.

**Gaps to note:** this page pins no exact Rust, Node, Android API, or iOS version minimums — you'd need the release notes or MSRV in the repo for those.

---

[FETCH RESULT]
The server returned HTTP 403 Forbidden.

The response body was not retrieved. If this URL requires authentication, use an authenticated tool (e.g. `gh` for GitHub, or an MCP-provided fetch tool) instead of WebFetch.

---

[FETCH RESULT]
Here are the Electron‑related settings found in the configuration snippet:

- **Target version:** `"target="42.10.0""` — the Electron release the native modules are compiled against.
- **Runtime:** `"runtime="electron""` — signals that headers should come from Electron rather than Node.
- **Build ID:** `"ms_build_id="15109253""`
- **Dist URL:** `"disturl="https://electronjs.org/headers""` — where the matching header files are fetched from.

**Other pins / flags present:**
- `"build_from_source="true""` — forces local compilation instead of using prebuilt binaries.
- `"legacy-peer-deps="true""` and `"ignore-scripts=false"`
- `"timeout=180000"` (in milliseconds)

**Node version pins:** none appear in this content — no `nodedir`, Node `target`, or engine constraint is specified; the only version pinned is the Electron one above.

---

[FETCH RESULT]
## Electron Release Schedule (v33 – v46)

| Version | Chromium | Node.js | Stable | End of Life |
|---|---|---|---|---|
| 46.0.0 | M160 | v24.20.0 | Jan 5, 2027 | Jun 22, 2027 |
| 45.0.0 | M156 | v24.19.0 | Oct 20, 2026 | Apr 27, 2027 |
| 44.0.0 | M152 | v24.18.1 | Aug 25, 2026 | Mar 2, 2027 |
| 43.0.0 | M150 | v24.17.0 | Jun 30, 2026 | Jan 5, 2027 |
| 42.0.0 | M148 | v24.15.0 | May 5, 2026 | Oct 20, 2026 |
| 41.0.0 | M146 | v24.14.0 | Mar 10, 2026 | Aug 25, 2026 |
| 40.0.0 | M144 | v24.11.1 | Jan 13, 2026 | Jun 30, 2026 |
| 39.0.0 | M142 | v22.20.0 | Oct 28, 2025 | May 5, 2026 |
| 38.0.0 | M140 | v22.18.0 | Sep 2, 2025 | Mar 10, 2026 |
| 37.0.0 | M138 | v22.16.0 | Jun 24, 2025 | Jan 13, 2026 |
| 36.0.0 | M136 | v22.14.0 | Apr 29, 2025 | Oct 28, 2025 |
| 35.0.0 | M134 | v22.14.0 | Mar 4, 2025 | Sep 2, 2025 |
| 34.0.0 | M132 | v20.18.1 | Jan 14, 2025 | Jun 24, 2025 |
| 33.0.0 | M130 | v20.18.0 | Oct 15, 2024 | Apr 29, 2025 |

**Notable patterns**

- Majors ship roughly every eight weeks, and each line's support window ends about eight months after it goes stable — typically coinciding with the stable date of the release three versions later.
- Node.js moves from the 20.x line (v33–34) to 22.x (v35–39) and then 24.x starting with v40.
- Chromium advances two milestones per Electron major from M130 onward, apart from the M152 → M156 → M160 jumps at the top of the table.

**Caveat from the page:** these are targets, not commitments — dates "may be adjusted at any time for significant reasons, such as security bugfixes," and prerelease Chromium/Node.js numbers "are estimates and may be upgraded before the stable release."

---

[FETCH RESULT]
## Recent Cursor changelog entries (all Aug 2026)

**No version numbers appear anywhere on this page** — Cursor's changelog is organized by date and feature title, not semantic releases. Five entries are listed:

| Date | Entry | Gist |
|---|---|---|
| Aug 27, 2026 | Start from scratch, without a repo | Cloud Agents can be prompted with no GitHub/third-party SCM connected; work is later saved to an Origin repo |
| Aug 19, 2026 | Cloud Agents and Cursor Harness Improvements | Subscriptions, custom modes, subagents on separate VMs, `/goal`, steering |
| Aug 17, 2026 | Origin Code Hosting | Cursor-hosted repos, PRs, code browsing, GitHub sync — "early beta on all paid plans" |
| Aug 13, 2026 | Cloud Agents Start 3x Faster with Builds | Pre-warmed environment copies; described as "3x faster time to first token" |
| Aug 3, 2026 | Google Workspace Plugins | Gmail, Drive, Calendar plugins for coding agents |

## Platforms

- **Browser / web:** Strongest emphasis. The Aug 27 entry says Cursor "port-forwards your cloud agent's live environment straight to your browser," enabling preview and design mode. Web surfaces also include the new **Codebase** tab, the Cloud Agents dashboard (with a **Builds** tab), and repo URLs in the form `cursor.com/codebase/acme-corp`.
- **CLI:** Referenced in the Origin entry — creating a repo shows you how to install the CLI plus clone/push commands. Also a standalone nav item, but no CLI-specific release notes in these five entries.
- **Mobile:** Appears only as a site navigation link (`/mobile`). **No mobile app changes are described in any of the five entries.**
- **Desktop:** Not explicitly versioned or discussed; only implied by the Download link and the note that plugins can be installed "from the Customize page in Cursor."
- **Slack:** Used as an event source for subscriptions, e.g. asking `@cursor` to check back in an hour and continue.

## Agent-related highlights

- **Subscriptions** — agents wake on events; they "automatically subscribe to PRs they create and drive them to completion," fixing CI and bot comments. Cloud-only for now.
- **Custom modes** — any skill can be pinned in chat as an always-on mode (`/` then ⌥⏎ / Alt+Enter).
- **Subagents** — each can run on its own VM with an isolated project copy and clean context.
- **`/goal`** — a long-lived objective the agent works toward until complete; pairs with `/loop`.
- **Steering** — follow-up messages now wait for the next tool call rather than interrupting mid-action.
- **Builds** — agents boot into prepared environments and fall back to "the last successful build" if one breaks; included at no extra cost.
- **Agents in repos** — Origin puts code, PRs, and agents together so agents can answer questions, edit, update PRs, or push branches.
- **Apps ecosystem** — Vercel (PR preview deployments, publish-to-live-URL), Depot, and Buildkite integrations.

---

Key find: VS Code main pins Electron 42.10.0. Now Cursor's platform surface and the remaining shells.

---

[FETCH RESULT]
The server returned HTTP 403 Forbidden.

The response body was not retrieved. If this URL requires authentication, use an authenticated tool (e.g. `gh` for GitHub, or an MCP-provided fetch tool) instead of WebFetch.

---

[FETCH RESULT]
## What it is

Neutralinojs is described as "a lightweight and portable desktop application development framework" for building cross-platform desktop apps with JavaScript, HTML, and CSS.

## Architecture / runtime

Rather than shipping its own browser engine, it "doesn't bundle Chromium and uses the existing web browser library in the operating system," with gtk-webkit2 cited as the Linux example. Internally it "implements a WebSocket connection for native operations and embeds a static web server to serve the web content," plus a bundled JavaScript client library for developers.

## Differences from Electron / NW.js

The page frames the contrast around dependencies and weight: with Electron and NW.js "you have to install Node.js and hundreds of dependency libraries," and bundling Chromium plus Node "can make simple applications unnecessarily large and resource-intensive." Neutralinojs positions itself as the lighter alternative, requiring no compilation by app developers and "No additional dependencies required for users."

## Binary size claims

No specific numbers are given here. The only size/resource claim is comparative — apps are "Less resource intensive compared to chromium-node-based frameworks" — plus two linked external comparisons (one against Electron, NW.js, Tauri, NodeGui, Flutter, and .NET MAUI; one 2018 evaluation).

## Version info

There's no single "current version" stated. Versions appear only in the context of CPU support: ARM Linux (armhf/arm64) binaries from framework v4.6.0 onward, and arm64 Darwin binaries from v4.10.0 onward. The CLI ships prebuilt x64 binaries for Linux, macOS, and Windows, and source builds are possible for other architectures.

## Native APIs

The page links to an API reference rather than enumerating it, giving only examples: "Read files, run system commands, etc." Targets listed are Linux, Windows, macOS, and Web.

## Child processes, native modules, extensions

Yes to two of the three. The framework can be extended "with any programming language (via extensions IPC)," and used "as a part of any source file (via child processes IPC)." It's also pitched for use "as a cloud message broker" and as an IPC broker linking multiple processes. There is **no mention of pty support or native modules** anywhere in this content.

---

[FETCH RESULT]
## Form factor and platform

The page describes a **native app for iOS only** — Cursor on the go via "the native mobile app on iOS." Both the hero link and the QR code point to an Apple App Store listing ("Cursor for iOS"), and the closing CTA is "Try Cursor for iOS." **No Android, PWA, or mobile web version is mentioned anywhere**, though the site nav does list Mobile alongside desktop/CLI products.

## Described features

**Agent management across environments** — the pitch is "The best of local and cloud": handle "all your agents on mobile, no matter where they run."

- **Cloud Agents** — "Launch always-on agents in parallel," where each one "gets its own isolated VM with a full development environment to test and iterate on PRs." Mockups show a multi-repo list of concurrently working agents.
- **Remote Control** — drive agents running on your own machine from the phone, with an option to keep that computer awake during the session.

**Development lifecycle features** ("From ideas to production"):

- **Move work forward** — start new agents and keep prompting existing ones from the phone.
- **Get demos of work** — cloud agents verify their own output and hand back "artifacts like videos, screenshots, and logs."
- **Stay in the loop** — "Check real-time status with Live Activities" plus notifications when an agent finishes or needs input.
- **Talk to Cursor** — voice input for describing ideas aloud; a mockup shows "Grok 4.6" as the model.
- **Give visual feedback** — a markup tool to annotate images and attach comments to a pinned spot.
- **Ship code from your phone** — "Review and merge PRs with focused diffs and source control management designed for mobile," illustrated with passing checks, reviewers, a squash-merge action, and preview deployments.

## Can you edit code?

**Not as described.** The page never mentions a hand-editing code editor. Code interaction is presented as *indirect*: you instruct agents, then read diffs and merge PRs. The one code snippet shown is a read-only diff view of a `.tsx` file inside a pull request, not an editing surface.

---

[FETCH RESULT]
## What it is

"The Monaco Editor is the fully featured code editor from" VS Code, generated directly from VS Code's sources with shims for the services it needs to run in a browser. The README points readers to the interactive playground as the best route for learning features, testing versions, and building minimal bug repros.

## Current version

**Not stated in the text.** The page shows only npm version badges (latest and `next` tags) that link out to npmjs.com — no numeric release is written in the README body. It does note that `monaco.d.ts` "specifies the API of the editor," and that this is the only versioned surface: everything else "is considered private and might break with any release."

## The "This npm module is …" line

**This phrasing does not appear in the provided content.** Older Monaco READMEs opened the install section that way; this version instead says `npm install monaco-editor` yields an ESM build under `/esm` (webpack-compatible) plus the `monaco.d.ts` type definitions.

## Stated limitations

**Mobile / touch** — the FAQ is a flat refusal:

> "Is the editor supported in mobile browsers or mobile web app frameworks?"

> "No."

No further qualification, workaround, or roadmap note is offered.

**Browser / environment** — there is no browser support matrix. The only environment constraint given concerns web workers: "HTML5 does not allow pages loaded on `file://` to create web workers." The fix is serving over `http://` or `https://`. Language services spawn workers to move heavy computation off the UI thread; the README says their overhead is negligible.

**Module format** — a warning flags that "the `AMD` support is deprecated and will be removed in future versions," retained only for backwards compatibility.

**Language server support** — not bundled. Monaco exposes "Providers" for smart features such as completion and hover, described as "not the same as, but often maps to" language server protocol features. Some providers depend on file URIs, so model URIs matter for TypeScript import resolution and JSON schema matching.

**VS Code extensions** — asked whether an extension will run in browser-based Monaco, the answer is "No," with a caveat that a fully LSP-based extension whose server is written in JavaScript could work.

**TextMate grammars** — unsupported natively; the README redirects to the third-party `monaco-tm` project combining `vscode-oniguruma` and `vscode-textmate`.

**Version coupling with VS Code** — explicitly "None." Monaco's version reflects its own source, not a VS Code release.

## Other notes

Core concepts covered: models (content, language, edit history), URIs (unique per model; default `inmemory://model/1`), editors (the DOM-attached view), providers, and disposables — `dispose()` frees resources and releases a URI for reuse. Licensed under MIT; the project follows the Microsoft Open Source Code of Conduct.

---

Critical: Monaco's own FAQ says mobile support = "No", and Cursor mobile is native iOS only with no code editor. Next batch.

---

[FETCH RESULT]
**Short answer: this page can't tell you.** What you've provided is only CodeMirror's documentation landing page — a table of contents. It contains no technical detail on mobile support, the state/view/transaction/facet model, bundle size, or iOS/Android browsers.

Here's what the page actually offers, and where each of your questions would likely be answered:

| Your question | Best destination listed on the page |
|---|---|
| Architecture: state, view, transactions, facets | **System Guide** — described as "A description of the system, and a guide to accomplishing some common goals." Also the **Reference Manual**, "A full listing and description of the public API exported by the library." |
| Extension model | **List of Core Extensions** — "An ordered collection of the extensions available in the core packages." |
| Mobile / touch / on-screen keyboards, iOS & Android | Not addressed anywhere on this page. The System Guide or the **Forum** ("A discussion board for asking questions and giving feedback.") would be the places to look. |
| Bundle size | Not mentioned. Possibly touched on in the guide; otherwise measure the published packages yourself. |

A couple of other things visible here that may be relevant to you:

- There's a **Migration Guide**, summarized as covering "the way the interface changed from version 5.x" — useful if you're weighing 6 against the still-linked Version 5.
- A **Community Packages** directory and a **Changelog** are both linked, plus **Examples**, "A collection of examples showing how to implement various use cases."

If you can paste the contents of the System Guide or Reference Manual pages, I can give you concrete answers on the architecture and any documented mobile behavior.

---

[FETCH RESULT]
# Wails README — Requested Details

## Current stable version
The README lists two active branches rather than a specific release number: v2 is marked **Stable**, v3 is marked **Beta**. As it states, "Wails has two active versions".

| Version | Status | Install | Docs |
|---|---|---|---|
| v2 | Stable | `go install github.com/wailsapp/wails/v2/cmd/wails@latest` | wails.io |
| v3 | Beta | `go install github.com/wailsapp/wails/v3/cmd/wails3@latest` | v3.wails.io |

No numeric version (e.g., v2.x.y) appears in the text; the version badge is an image only.

## WebView per platform
**Not present in this document.** The README only makes a generic claim that Wails "Uses native rendering engines - _no embedded browser_!" and separately lists "Multiplatform" as a feature. There is no mention of Windows WebView2, macOS WebKit, or Linux GTK/WebKit2GTK. The one reference to "WebView" is in the naming anecdote, where the author explains the name began as a pun on "Webview on Rails" and doubles as a homophone for Wales.

## Binary size claims
**No size figures are given.** The closest statement is that Wails can "wrap both Go code and a web frontend into a single binary" — a packaging claim, not a measurement. No MB/KB numbers appear anywhere in the page.

## Comparison to Electron
Addressed in one FAQ entry, without benchmarks:
- Whether it's an Electron alternative: "Depends on your requirements."
- It targets Go developers who want lightweight desktop apps or a UI layer for existing programs.
- Because it ships native menus and dialogs, "it could be considered a lightweight electron alternative".

## Wails v3 status and roadmap
- Status: Beta, installed via the `wails3` command, documented separately at v3.wails.io.
- Roadmap lives in GitHub Discussion **#1484** (the only substantive number in this section).
- Process change: added features and public behavior changes now go through a "Wails Enhancement Proposal" (WEP), located under `v3/wep/`, and are "submitted as a draft pull request rather than a feature-request issue".

## Mobile support
**Not mentioned.** Nothing in the README discusses iOS, Android, or mobile targets for v3 or any version.

## Other numbers in the page
The README is translated into 12 languages, lists 13 albums as "Inspiration," and points contributors to a credits page hosted on wails.io rather than listing them inline. Support acknowledgments cover sponsors (an SVG image) and JetBrains under its open-source program.

---

[FETCH RESULT]
## What it is

`monaco-languageclient` is an npm package published from the TypeFox monorepo whose purpose is "to connect [Monaco editor](https://microsoft.github.io/monaco-editor/) with [language servers]". It ships alongside three sibling packages in the same repository:

| Package | Role | Version listed |
|---|---|---|
| `monaco-languageclient` | Monaco ↔ LSP bridge | `11.0.0-next.2` (unreleased) |
| `vscode-ws-jsonrpc` | JSON-RPC transport | `4.0.0-next.2` (unreleased) |
| `@typefox/monaco-editor-react` | React component wrapper | `8.0.0-next.2` (unreleased) |
| `monaco-languageclient-examples` | Reusable examples | (version not stated) |

All four are licensed MIT.

## Transport

Two transports are documented:

1. **WebSocket** — `vscode-ws-jsonrpc` "implements communication between a jsonrpc client and server over WebSocket," used to reach a language server running as a separate process (Node/Express or a Java process, often in Docker).
2. **In-browser web worker** — the Langium and clangd examples run the server client-side; the page notes these communicate "via `vscode-languageserver-protocol/browser` instead of a web socket."

## Dependencies / alignment

The stated alignment for the current versions is:

- `@codingame/monaco-vscode-[editor]-api`: `36.0.0`
- `vscode`: `1.129.1`
- `monaco-editor`: `0.56.0`

**Note:** the page does **not** state a `vscode-languageclient` version — that detail isn't in the supplied content, so I can't report it. A full compatibility table is linked in `docs/versions-and-history.md`.

## How the bridge works

The examples show that `monaco-languageclient` is consumed by higher-level wrappers (`monaco-editor-wrapper` or the React component) to produce "an editor that is connected to a language server." The editor is backed by `@codingame/monaco-vscode-*-api`, which supplies VSCode API/service implementations — the Application Playground example, for instance, "uses the view service provider from `@codingame/monaco-vscode-editor-api`" to expose more VSCode features. Editors can be launched in either *classic* or *extended* mode (the JSON example provides one client of each). The stated design goal is that "different language servers can be intergrated in a common way," speaking WebSocket to the browser front end. [sic on typos in quoted text]

## Caveats and limitations stated

- **Prototypes:** both the Cpp/Clangd example (clangd compiled to wasm) and the Application Playground carry the warning "This is a prototype and still evolving."
- **Angular:** `monaco-languageclient` "currently does not support the angular build as it breaks the development and produstion build" [sic]; the verification example substitutes `@analogjs/vite-plugin-angular` (Vite-based).
- **Verification examples are excluded from the workspace** because some "bring substantial amount of npm dependencies that pollute the main node_modules dependencies," so they must be built and run separately.
- **Backend required:** JSON, Python, Groovy and Java clients only work if their matching server is already running; Groovy, Java and the Graalpy debugger need `docker-compose`.
- **Legacy path:** the plain browser example "can now be considered legacy" since web workers make client-side language servers easier, though it still works.
- **Docs maturity:** official documentation only began at version 10 and is described as being continuously extended; a migration guide accompanied the v10 release.

---

[FETCH RESULT]
## What openvscode-server is

Per the README, it is "a version of VS Code that runs a server on a remote machine and allows access through a modern web browser," built on "the very same architecture used by" Gitpod and GitHub Codespaces. The motivation: earlier community attempts to remote-ify VS Code were "complex and error prone" because they required sweeping changes; after the VS Code team began a browser-oriented refactor in 2019, Gitpod and GitHub adopted it but "the important bits have not been open-sourced, until now." Gitpod's stated contribution is publishing "the minimal set of changes needed" so users can "rely on the latest version of VS Code, have a straightforward upgrade path and low maintenance effort."

## How it's built / patched

- Explicitly minimal fork: "This project only adds minimal bits required to run VS Code in a server scenario." And: "We have no intention of changing VS Code in any way or to add additional features to VS Code itself." Non-server-specific bugs and features are redirected upstream to microsoft/vscode.
- Release/build artifacts live in a separate repo (`gitpod-io/openvscode-releases`), which holds the Docker image's `Dockerfile`; images are published as `gitpod/openvscode-server` with a `nightly` tag, plus tarball releases and GitHub pre-releases for nightly testing.
- Standard VS Code bundled extensions ship in the `extensions` folder (grammars, snippets, `*-language-features` packages). Dev builds need roughly "4 Cores and 6 GB of RAM (8 GB recommended)".

## Version tracking

The README does not name a specific upstream version. The only concrete signal is the versioning convention mirroring VS Code releases — e.g. "Since OpenVSCode Server v1.64" — plus `openvscode-server-v${OPENVSCODE_SERVER_VERSION}.tar.gz` artifacts and `nightly`/pre-release channels for the newest changes.

## Extension registry (the "Marketplace" question)

The pre-install example points at **Open VSX**, not Microsoft's Marketplace: extensions are listed "From https://open-vsx.org/ registry directly" (e.g. `gitpod.gitpod-theme`), and anything missing is side-loaded as a `.vsix` — the comment notes "Direct download links to external .vsix not available on https://open-vsx.org/" (their examples: rust-analyzer, VSCodeVim). Installation uses `${OPENVSCODE}/bin/openvscode-server --install-extension`. The page never discusses Marketplace terms of service.

## Running it and access control

- Docker: `docker run -it --init -p 3000:3000 -v "$(pwd):/home/workspace:cached" gitpod/openvscode-server`; custom images use `USER root` to install packages, then `USER openvscode-server`.
- Key flags: `--port` (default 3000), `--host` (defaults to `localhost`, so `--host 0.0.0.0` for remote access), `--without-connection-token` (the Docker default), and `--connection-token` / `--connection-token-file`.
- Auth posture: "Since OpenVSCode Server v1.64, you can access the Web UI without authentication" — a token must be opted into. With the Docker image you must edit the `ENTRYPOINT` or override it via docker-compose's `entrypoint`.

## Licensing / legal statements present

The README carries a license badge linking to `LICENSE.txt` but does not spell out the license identifier in this text, and it closes with: "This project is not affiliated with Microsoft Corporation." Docs live in the `docs` branch; deployment guides in the `guides` branch. Backers listed include GitLab, VMware, Uber, SAP, Sourcegraph, RStudio, SUSE, Tabnine, Render, and TypeFox.

## Not answerable from this source

This page contains **no** mention of code-server (Coder) or of Microsoft's own VS Code Server product, so any comparison of the three — or of MIT-versus-proprietary terms, telemetry, and Marketplace entitlement — cannot be sourced here. I'd need the actual LICENSE.txt and the other projects' documentation, and interpretation of those terms is a question for qualified counsel rather than something I can assess.

---

[FETCH RESULT]
Failed to authenticate. API Error: 403 pre-consume quota failed, user quota: ＄0.126048, need quota: ＄0.297392 (request id: 20260901130912766420241sm2v4zucIjlJz)

---

[FETCH RESULT]
Failed to authenticate. API Error: 403 pre-consume quota failed, user quota: ＄0.126048, need quota: ＄0.262952 (request id: 20260901130915802996425fht8sNBCifTjb)

---

[FETCH RESULT]
The server returned HTTP 404 Not Found.

The response body was not retrieved. If this URL requires authentication, use an authenticated tool (e.g. `gh` for GitHub, or an MCP-provided fetch tool) instead of WebFetch.

---

[FETCH RESULT]
## What the shell plugin does

Per the docs, it gives you "Access the system shell. Allows you to spawn child processes." Note that `shell.open` has moved — the page redirects you to the **Opener plugin** for opening URLs/paths.

**Requirements:** Rust "1.77.2" or newer.

## Platform limits

| Platform | Note |
|---|---|
| windows, linux, macos | Full support |
| android, ios | "Only allows to open URLs via `open`" |

## APIs (exact names)

**JavaScript** — package `@tauri-apps/plugin-shell`:
- `Command` (also `window.__TAURI__.shell` when `"withGlobalTauri": true`)
- `Command.create('exec-sh', ['-c', "echo 'Hello World!'"])` then `.execute()`

**Rust** — crate `tauri-plugin-shell`:
- trait `tauri_plugin_shell::ShellExt`, initialized via `tauri_plugin_shell::init()`
- `app_handle.shell()` → `.command("echo")` → `.args([...])` → `.output().await`
- Result inspection via `output.status.success()`, `output.stdout`, `output.status.code()`

## Sidecars and pty

- **Sidecar:** the scope object supports a `"sidecar"` boolean field (shown as `false` in the example), but this page documents no sidecar-specific JS/Rust method; embedding external binaries is covered in a separate guide.
- **Pty:** nothing about pseudo-terminals appears anywhere on this page — no pty API is documented here.

## Permissions / capabilities

Dangerous commands are blocked by default: "You must modify the permissions in your `capabilities` configuration to enable these."

- **Default permission set** only includes `allow-open`, scoped to `http(s)://`, `tel:` and `mailto:` links.
- **Available identifiers** (each with an `allow-`/`deny-` pair): `execute`, `kill`, `open`, `spawn`, `stdin-write` — e.g. `shell:allow-execute` "Enables the execute command without any pre-configured scope."
- **Scoped example** in `src-tauri/capabilities/default.json` uses `shell:allow-execute` with an `allow` entry containing `name` (`exec-sh`), `cmd` (`sh`), `args` (`-c` plus a `validator` regex `\\S+`), and `sidecar: false`. The `name` must match the string passed to `Command.create`.

---

Failed to authenticate. API Error: 403 pre-consume quota failed, user quota: ＄0.308180, need quota: ＄0.390272 (request id: 202609011309368622518624xdzsAAMOEMj8)