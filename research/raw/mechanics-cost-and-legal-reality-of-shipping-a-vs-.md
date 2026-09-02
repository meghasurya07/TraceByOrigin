# Mechanics, cost, and legal reality of shipping a VS Code fork (needed 

## URLs fetched
- https://github.com/microsoft/vscode/blob/main/product.json
- https://github.com/microsoft/vscode/blob/main/LICENSE.txt
- https://github.com/VSCodium/vscodium/blob/master/DOCS.md
- https://cdn.vsassets.io/v/M190_20210811.1/_content/Microsoft-Visual-Studio-Marketplace-Terms-of-Use.pdf
- https://cursor.com/docs/configuration/kb#extensions
- https://cursor.com/docs
- https://forum.cursor.com/t/extension-marketplace-changes-transition-to-openvsx/109138
- https://cursor.com/help/customization/extensions
- https://github.com/eclipse/openvsx/wiki/Using-Open-VSX-in-VS-Code

## Content

I'll research this facet thoroughly. Let me start with parallel searches on the key areas.

---

[FETCH RESULT]
The vscode repository's LICENSE.txt is an MIT License.

**Header and copyright line:**
> "MIT License"

> "Copyright (c) 2015 - present Microsoft Corporation"

**Key permission grant (abbreviated):** the file grants anyone obtaining a copy the right "to use, copy, modify, merge, publish, distribute, sublicense, and/or sell" copies, provided the copyright and permission notices stay with "all copies or substantial portions of the Software." It also disclaims warranties, stating the software is provided "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED," and limits author/copyright-holder liability.

**Trademark notice:** none appears in the file content shown above — the 21-line LICENSE.txt contains only the MIT terms, with no separate trademark or branding clause on this page.

---

[FETCH RESULT]
## Requested fields (present in this file)

| Field | Value |
|---|---|
| `nameShort` | `"Code - OSS"` |
| `nameLong` | `"Code - OSS"` |
| `applicationName` | `"code-oss"` |
| `dataFolderName` | `".vscode-oss"` |
| `urlProtocol` | `"code-oss"` |
| `licenseName` | `"MIT"` |
| `licenseUrl` | `"https://github.com/microsoft/vscode/blob/main/LICENSE.txt"` |
| `serverApplicationName` | `"code-server-oss"` |
| `serverDataFolderName` | `".vscode-server-oss"` |
| `tunnelApplicationName` | `"code-tunnel-oss"` |

`builtInExtensions` is an array with three entries, each having `name`, `version`, `sha256`, `repo`, and `metadata`:
- `"ms-vscode.js-debug-companion"`, version `"1.1.3"`
- `"ms-vscode.js-debug"`, version `"1.117.0"`
- `"ms-vscode.vscode-js-profile-table"`, version `"1.0.11"`

All three list `"publisherName": "ms-vscode"` and `"publisherDisplayName": "Microsoft"`.

## Requested fields NOT in this file

`extensionsGallery`, `quality`, and `updateUrl` do not appear anywhere in this OSS build's configuration — those keys are typically supplied only in Microsoft's branded distribution, not the open-source repo.

## Other top-level keys present

`sharedDataFolderName` (`".vscode-oss-shared"`), `win32MutexName` (`"vscodeoss"`), `serverLicenseUrl`, `serverGreeting`, `serverLicense`, `serverLicensePrompt`, `win32DirName` / `win32NameVersion` (both `"Microsoft Code OSS"`), `win32RegValueName` (`"CodeOSS"`), the four app-ID keys (`win32x64AppId`, `win32arm64AppId`, `win32x64UserAppId`, `win32arm64UserAppId`), `win32AppUserModelId` (`"Microsoft.CodeOSS"`), `win32ShellNameShort` (`"C&ode - OSS"`), `win32TunnelServiceMutex`, `win32TunnelMutex`, `darwinBundleIdentifier` (`"com.visualstudio.code.oss"`), `darwinProfileUUID`, `darwinProfilePayloadUUID`, `linuxIconName` (`"code-oss"`), `licenseFileName` (`"LICENSE.txt"`), `reportIssueUrl`, `nodejsArtifactFeed`, `electronArtifactFeed`, `agentsTelemetryAppName` (`"agents"`), `webviewContentExternalBaseUrlTemplate` (a vscode-cdn.net template URL containing a `{{uuid}}` placeholder and a commit hash), `defaultChatAgent`, `trustedExtensionAuthAccess`, `onboardingKeymaps`, `onboardingThemes`, `builtInExtensionsEnabledWithAutoUpdates`, `sessionsWindowAllowedExtensions`, and `voiceWsUrl`.

The file is stated as 248 lines / 7.72 KB. Content comes from the MIT-licensed vscode repository.

---

Let me dig into VSCodium's build/patch approach and the marketplace legal terms.

---

[FETCH RESULT]
The server returned HTTP 404 Not Found.

The response body was not retrieved. If this URL requires authentication, use an authenticated tool (e.g. `gh` for GitHub, or an MCP-provided fetch tool) instead of WebFetch.

---

[FETCH RESULT]
API Error: 400 content-blocked (request id: 20260901130244450221376sm2v4lhHEVO1d)

---

[FETCH RESULT]
-rw-r--r-- 1 bodep 197609 4582 Sep  1 10:32 vscodium_docs.md
[
  {
    "name": ".editorconfig",
    "path": ".editorconfig",
    "sha": "3850f49a331da3f62aa710f91f325facc4960176",
    "size": 370,
    "url": "https://api.github.com/repos/VSCodium/vscodium/contents/.editorconfig?ref=master",
    "html_url": "https://github.com/VSCodium/vscodium/blob/master/.editorconfig",
    "git_url": "https://api.github.com/repos/VSCodium/vscodium/git/blobs/3850f49a331da3f62aa710f91f325facc4960176",
    "download_url": "https://raw.githubusercontent.com/VSCodium/vscodium/master/.editorconfig",
    "type": "file",
    "_links": {
      "self": "https://api.github.com/repos/VSCodium/vscodium/contents/.editorconfig?ref=master",
      "git": "https://api.github.com/repos/VSCodium/vscodium/git/blobs/3850f49a331da3f62aa710f91f325facc4960176",
      "html": "https://github.com/VSCodium/vscodium/blob/master/.editorconfig"
    }
  },
  {
    "name": ".github",
    "path": ".github",
    "sha": "cd7fad52e32042770db5f3f807269addc5f69fef",
    "size": 0,
    "url": "https://api.github.com/repos/VSCodium/vscodium/contents/.github?ref=master",
    "html_url": "https://github.com/VSCodium/vscodium/tree/master/.github",
    "git_url": "https://api.github.com/repos/VSCodium/vscodium/git/trees/cd7fad52e32042770db5f3f807269addc5f69fef",
    "download_url": null,
    "type": "dir",
    "_links": {
      "self": "https://api.github.com/repos/VSCodium/vscodium/contents/.github?ref=master",
      "git": "https://api.github.com/repos/VSCodium/vscodium/git/trees/cd7fad52e32042770db5f3f807269addc5f69fef",
      "html": "https://github.com/VSCodium/vscodium/tree/master/.github"
    }
  },
  {
    "name": ".gitignore",
    "path": ".gitignore",
    "sha": "7119d29d9e9283af880299cca0b38352cfd7c3ae",
    "size": 490,
    "url": "https://api.github.com/repos/VSCodium/vscodium/contents/.gitignore?ref=master",
    "html_url": "https://github.com/VSCodium/vscodium/blob/master/.gitignore",
    "git_url": "https://api.github.com/repos/VSCodium/vscodium/git/blobs/7119d29d9e9283af880299cca0b38352cfd7c3ae",
    "download_url": "https://raw.githubusercontent.com/VSCodium/vscodium/master/.gitignore",
    "type": "file",
    "_links": {
      "self": "https://api.github.com/repos/VSCodium/vscodium/contents/.gitignore?ref=master",
      "git": "https://api.github.com/repos/VSCodium/vscodium/git/blobs/7119d29d9e9283af880299cca0b38352cfd7c3ae",
      "html": "https://github.com/VSCodium/vscodium/blob/master/.gitignore"
    }
  },
  {
    "name": ".nvmrc",
    "path": ".nvmrc",
    "sha": "5bf4400f22922e8a6dc6359b196314a37e653eed",
    "size": 8,
    "url": "https://api.github.com/repos/VSCodium/vscodium/contents/.nvmrc?ref=master",
    "html_url": "https://github.com/VSCodium/vscodium/blob/master/.nvmrc",
    "git_url": "https://api.github.com/repos/VSCodium/vscodium/git/blobs/5bf4400f22922e8a6dc6359b196314a37e653eed",
    "download_url": "https://raw.githubusercontent.com/VSCodium/vscodium/master/.nvmrc",
    "type": "file",
    "_links": {
      "self": "https://api.github.com/repos/VSCodium/vscodium/contents/.nvmrc?ref=master",
      "git": "https://api.github.com/repos/VSCodium/vscodium/git/blobs/5bf4400f22922e8a6dc6359b196314a37e653eed",
      "html": "https://github.com/VSCodium/vscodium/blob/master/.nvmrc"
    }
  },
  {
    "name": "CODE_OF_CONDUCT.md",
    "path": "CODE_OF_CONDUCT.md",
    "sha": "6503f4bebaec74af5cb1434e04354dd677d883b6",
    "size": 4994,
    "url": "https://api.github.com/repos/VSCodium/vscodium/contents/CODE_OF_CONDUCT.md?ref=master",
    "html_url": "https://github.com/VSCodium/vscodium/blob/master/CODE_OF_CONDUCT.md",
    "git_url": "https://api.github.com/repos/VSCodium/vscodium/git/blobs/6503f4bebaec74af5cb1434e04354dd677d883b6",
    "download_url": "https://raw.githubusercontent.com/VSCodium/vscodium/master/CODE_OF_CONDUCT.md",
    "type": "file",
    "_links": {
      "self": "https://api.github.com/repos/VSCodium/vscodium/contents/CODE_OF_CONDUCT.md?ref=master",
      "git": "https://api.github.com/repos/VSCodium/vscodium/git/blobs/6503f4bebaec74af5cb1434e04354dd677d883b6",
      "html": "https://github.com/VSCodium/vscodium/blob/master/CODE_OF_CONDUCT.md"
    }
  },
  {
    "name": "CONTRIBUTING.md",
    "path": "CONTRIBUTING.md",
    "sha": "2fc0756cfefea87f960e31a0260dea680672ce03",
    "size": 2187,
    "url": "https://api.github.com/repos/VSCodium/vscodium/contents/CONTRIBUTING.md?ref=master",
    "html_url": "https://github.com/VSCodium/vscodium/blob/master/CONTRIBUTING.md",
    "git_url": "https://api.github.com/repos/VSCodium/vscodium/git/blobs/2fc0756cfefea87f960e31a0260dea680672ce03",
    "download_url": "https://raw.githubusercontent.com/VSCodium/vscodium/master/CONTRIBUTING.md",
    "type": "file",
    "_links": {
      "self": "https://api.github.com/repos/VSCodium/vscodium/contents/CONTRIBUTING.md?ref=master",
      "git": "https://api.github.com/repos/VSCodium/vscodium/git/blobs/2fc0756cfefea87f960e31a0260dea680672ce03",
      "html": "https://github.com/VSCodium/vscodium/blob/master/CONTRIBUTING.md"
    }
  },
  {
    "name": "FUNDING.json",
    "path": "FUNDING.json",

---

[FETCH RESULT]
API Error: 400 Anthropic Claude bad request: InvokeModelWithResponseStream: operation error Bedrock Runtime: InvokeModelWithResponseStream, https response error StatusCode: 400, RequestID: 751bdc7f-961a-449b-88c2-63aa523f9a48, ValidationException: Tool 'web_search' not found in provided tools (request id: a7884e3a9a07525d7a71afad90c4fc4d) [trace_id=efb00fe7844f499c6d80ee6ea2b8df11] (request id: 20260901130311361513098dds85FchqdGNt)

---

[FETCH RESULT]
     .editorconfig	     370
     .github	     0
     .gitignore	     490
     .nvmrc	     8
     CODE_OF_CONDUCT.md	     4994
     CONTRIBUTING.md	     2187
     FUNDING.json	     107
     LICENSE	     1184
     README.md	     11914
     announcements-builtin.json	     4
     announcements-extra.json	     278
     build.sh	     2420
     build	     0
     build_cli.sh	     4158
     check_cron_or_pr.sh	     921
     check_tags.sh	     5226
     dev	     0
     docs	     0
     font-size	     0
     get_pr.sh	     604
     get_repo.sh	     3393
     icons	     0
     justfile	     134
     npmrc	     64
     patches	     0
     prepare_assets.sh	     1970
     prepare_checksums.sh	     322
     prepare_src.sh	     874
     prepare_vscode.sh	     11826
     product.json	     15862
     release.sh	     3991
     release_notes.md	     15142
     src	     0
     stores	     0
     undo_telemetry.sh	     1304
     update_upstream.sh	     832
     update_version.sh	     7128
     upload_sourcemaps.sh	     2418
     upstream	     0
     utils.sh	     2443
     version.sh	     545
=== patches dir ===
    name: 00-binary-fix-name.patch	    size: 1587	    type: file
    name: 00-brand-remove-branding.patch	    size: 161335	    type: file
    name: 00-build-disable-esbuild.patch	    size: 251	    type: file
    name: 00-build-disable-mangle.patch	    size: 1456	    type: file
    name: 00-build-download-extensions-from-gh.patch	    size: 493	    type: file
    name: 00-build-replace-unicode.patch	    size: 746	    type: file
    name: 00-build-update-electron.patch.no	    size: 17185	    type: file
    name: 00-build-update-sourcemap-url.patch	    size: 4470	    type: file
    name: 00-cloud-remove.patch	    size: 3093	    type: file
    name: 00-community-add-announcements.patch	    size: 4588	    type: file
    name: 00-copilot-disable-terminal-suggest.patch	    size: 1725	    type: file
    name: 00-copilot-fix-action-condition.patch	    size: 12212	    type: file
    name: 00-ext-git-ai-coauthor-off.patch	    size: 468	    type: file
    name: 00-ext-github-authentication-use-pat.patch	    size: 1430	    type: file
    name: 00-ext-github-remove-vscodedev.patch	    size: 7414	    type: file
    name: 00-extension-disable-signature-verification.patch	    size: 1068	    type: file
    name: 00-remote-add-missing-dependencies.patch	    size: 745	    type: file
    name: 00-remote-add-url.patch	    size: 1064	    type: file
    name: 00-remote-disable-client-validation.patch	    size: 2845	    type: file
    name: 00-remote-remove-missing-vsda.patch	    size: 4966	    type: file
    name: 00-security-add-command-filter.patch	    size: 8114	    type: file
    name: 00-settings-gallery.patch	    size: 2226	    type: file
    name: 00-settings-user-product.patch	    size: 3551	    type: file
    name: 00-telemetry-disable.patch	    size: 4031	    type: file
    name: 00-tunnel-disable-recommendation.patch	    size: 706	    type: file
    name: 00-ui-custom-font.patch	    size: 258873	    type: file
    name: 00-ui-improve-eol-banner.patch	    size: 3074	    type: file
    name: 00-ui-report-issue.patch	    size: 5741	    type: file
    name: 00-update-disable.patch.yet	    size: 499	    type: file
    name: 00-update-rename-cache-path.patch	    size: 782	    type: file
    name: 00-vsce-use-custom-lib.patch	    size: 14332	    type: file
    name: 10-version-add-release.patch	    size: 1625	    type: file
    name: 11-update-use-github-release.patch	    size: 27785	    type: file
    name: 12-update-add-cooldown.patch	    size: 3897	    type: file
    name: 20-keymap-use-custom-lib.patch	    size: 5892	    type: file
    name: 21-policy-use-custom-lib.patch	    size: 20656	    type: file
    name: 30-build-add-missing-dependencies.patch	    size: 1523	    type: file
    name: 40-cli-use-reh-archive.patch	    size: 12098	    type: file
    name: 50-build-improve-gulp-tasks.patch	    size: 2535	    type: file
    name: 51-build-disable-non-ascii.patch	    size: 1091	    type: file
    name: 52-ext-copilot-remove-it.json	    size: 4774	    type: file
    name: 53-ext-copilot-remove-it.patch	    size: 69583	    type: file
    name: 60-security-add-option-for-malicious-ext.patch	    size: 1482	    type: file
    name: 61-extension-close-connection.patch	    size: 944	    type: file
    name: 80-ui-disable-onboarding.json	    size: 108	    type: file
    name: 81-ui-disable-onboarding.patch	    size: 3071	    type: file
    name: alpine	    size: 0	    type: dir
    name: helper	    size: 0	    type: dir
    name: insider	    size: 0	    type: dir
    name: linux	    size: 0	    type: dir
    name: osx	    size: 0	    type: dir
    name: user	    size: 0	    type: dir
    name: windows	    size: 0	    type: dir

---

[FETCH RESULT]
295 pv.sh
#!/usr/bin/env bash
# shellcheck disable=SC1091,2154

set -e

if [[ "${VSCODE_QUALITY}" == "insider" ]]; then
  cp -rp src/insider/* vscode/
else
  cp -rp src/stable/* vscode/
fi

cp -f LICENSE vscode/LICENSE.txt

cd vscode || { echo "'vscode' dir not found"; exit 1; }

{ set +x; } 2>/dev/null

# {{{ product.json
cp product.json{,.bak}

setpath() {
  local jsonTmp
  { set +x; } 2>/dev/null
  jsonTmp=$( jq --arg 'value' "${3}" "setpath(path(.${2}); \$value)" "${1}.json" )
  echo "${jsonTmp}" > "${1}.json"
  set -x
}

setpath_json() {
  local jsonTmp
  { set +x; } 2>/dev/null
  jsonTmp=$( jq --argjson 'value' "${3}" "setpath(path(.${2}); \$value)" "${1}.json" )
  echo "${jsonTmp}" > "${1}.json"
  set -x
}

setpath "product" "checksumFailMoreInfoUrl" "https://go.microsoft.com/fwlink/?LinkId=828886"
setpath "product" "documentationUrl" "https://go.microsoft.com/fwlink/?LinkID=533484#vscode"
setpath_json "product" "extensionsGallery" '{"serviceUrl": "https://open-vsx.org/vscode/gallery", "itemUrl": "https://open-vsx.org/vscode/item", "latestUrlTemplate": "https://open-vsx.org/vscode/gallery/{publisher}/{name}/latest", "controlUrl": "https://raw.githubusercontent.com/EclipseFdn/publish-extensions/refs/heads/master/extension-control/extensions.json"}'

setpath "product" "introductoryVideosUrl" "https://go.microsoft.com/fwlink/?linkid=832146"
setpath "product" "keyboardShortcutsUrlLinux" "https://go.microsoft.com/fwlink/?linkid=832144"
setpath "product" "keyboardShortcutsUrlMac" "https://go.microsoft.com/fwlink/?linkid=832143"
setpath "product" "keyboardShortcutsUrlWin" "https://go.microsoft.com/fwlink/?linkid=832145"
setpath "product" "licenseUrl" "https://github.com/VSCodium/vscodium/blob/master/LICENSE"
setpath_json "product" "linkProtectionTrustedDomains" '["https://open-vsx.org"]'
setpath "product" "releaseNotesUrl" "https://go.microsoft.com/fwlink/?LinkID=533483#vscode"
setpath "product" "reportIssueUrl" "https://github.com/VSCodium/vscodium/issues/new"
setpath "product" "requestFeatureUrl" "https://go.microsoft.com/fwlink/?LinkID=533482"
setpath "product" "tipsAndTricksUrl" "https://go.microsoft.com/fwlink/?linkid=852118"
setpath "product" "twitterUrl" "https://go.microsoft.com/fwlink/?LinkID=533687"

if [[ "${DISABLE_UPDATE}" != "yes" ]]; then
  setpath "product" "updateUrl" "https://raw.githubusercontent.com/VSCodium/versions/refs/heads/master"

  if [[ "${VSCODE_QUALITY}" == "insider" ]]; then
    setpath "product" "downloadUrl" "https://github.com/VSCodium/vscodium-insiders/releases"
  else
    setpath "product" "downloadUrl" "https://github.com/VSCodium/vscodium/releases"
  fi

  # if [[ "${OS_NAME}" == "windows" ]]; then
  #   setpath_json "product" "win32VersionedUpdate" "true"
  # fi
fi

if [[ "${VSCODE_QUALITY}" == "insider" ]]; then
  setpath "product" "nameShort" "VSCodium - Insiders"
  setpath "product" "nameLong" "VSCodium - Insiders"
  setpath "product" "applicationName" "codium-insiders"
  setpath "product" "dataFolderName" ".vscodium-insiders"
  setpath "product" "linuxIconName" "vscodium-insiders"
  setpath "product" "quality" "insider"
  setpath "product" "urlProtocol" "vscodium-insiders"
  setpath "product" "serverApplicationName" "codium-server-insiders"
  setpath "product" "serverDataFolderName" ".vscodium-server-insiders"
  setpath "product" "darwinBundleIdentifier" "com.vscodium.VSCodiumInsiders"
  setpath "product" "win32AppUserModelId" "VSCodium.VSCodiumInsiders"
  setpath "product" "win32DirName" "VSCodium Insiders"
  setpath "product" "win32MutexName" "vscodiuminsiders"
  setpath "product" "win32NameVersion" "VSCodium Insiders"
  setpath "product" "win32RegValueName" "VSCodiumInsiders"
  setpath "product" "win32ShellNameShort" "VSCodium Insiders"
  setpath "product" "win32AppId" "{{EF35BB36-FA7E-4BB9-B7DA-D1E09F2DA9C9}"
  setpath "product" "win32x64AppId" "{{B2E0DDB2-120E-4D34-9F7E-8C688FF839A2}"
  setpath "product" "win32arm64AppId" "{{44721278-64C6-4513-BC45-D48E07830599}"
  setpath "product" "win32UserAppId" "{{ED2E5618-3E7E-4888-BF3C-A6CCC84F586F}"
  setpath "product" "win32x64UserAppId" "{{20F79D0D-A9AC-4220-9A81-CE675FFB6B41}"
  setpath "product" "win32arm64UserAppId" "{{2E362F92-14EA-455A-9ABD-3E656BBBFE71}"
  setpath "product" "tunnelApplicationName" "codium-insiders-tunnel"
  setpath "product" "win32TunnelServiceMutex" "vscodiuminsiders-tunnelservice"
  setpath "product" "win32TunnelMutex" "vscodiuminsiders-tunnel"
  setpath "product" "win32ContextMenu.x64.clsid" "90AAD229-85FD-43A3-B82D-8598A88829CF"
  setpath "product" "win32ContextMenu.arm64.clsid" "7544C31C-BDBF-4DDF-B15E-F73A46D6723D"
else
  setpath "product" "nameShort" "VSCodium"
  setpath "product" "nameLong" "VSCodium"
  setpath "product" "applicationName" "codium"
  setpath "product" "linuxIconName" "vscodium"
  setpath "product" "quality" "stable"
  setpath "product" "urlProtocol" "vscodium"
  setpath "product" "serverApplicationName" "codium-server"
  setpath "product" "serverDataFolderName" ".vscodium-server"
  setpath "product" "darwinBundleIdentifier" "com.vscodium"
  setpath "product" "win32AppUserModelId" "VSCodium.VSCodium"
  setpath "product" "win32DirName" "VSCodium"
  setpath "product" "win32MutexName" "vscodium"
  setpath "product" "win32NameVersion" "VSCodium"
  setpath "product" "win32RegValueName" "VSCodium"
  setpath "product" "win32ShellNameShort" "VSCodium"
  setpath "product" "win32AppId" "{{763CBF88-25C6-4B10-952F-326AE657F16B}"
  setpath "product" "win32x64AppId" "{{88DA3577-054F-4CA1-8122-7D820494CFFB}"
  setpath "product" "win32arm64AppId" "{{67DEE444-3D04-4258-B92A-BC1F0FF2CAE4}"
  setpath "product" "win32UserAppId" "{{0FD05EB4-651E-4E78-A062-515204B47A3A}"
  setpath "product" "win32x64UserAppId" "{{2E1F05D1-C245-4562-81EE-28188DB6FD17}"
  setpath "product" "win32arm64UserAppId" "{{57FD70A5-1B8D-4875-9F40-C5553F094828}"
  setpath "product" "tunnelApplicationName" "codium-tunnel"
  setpath "product" "win32TunnelServiceMutex" "vscodium-tunnelservice"
  setpath "product" "win32TunnelMutex" "vscodium-tunnel"
  setpath "product" "win32ContextMenu.x64.clsid" "D910D5E6-B277-4F4A-BDC5-759A34EEE25D"
  setpath "product" "win32ContextMenu.arm64.clsid" "4852FC55-4A84-4EA1-9C86-D53BE3DF83C0"
fi

setpath_json "product" "tunnelApplicationConfig" '{}'

jsonTmp=$( jq -s '.[0] * .[1]' product.json ../product.json )
echo "${jsonTmp}" > product.json && unset jsonTmp

cat product.json
# }}}

# include common functions
. ../utils.sh

# {{{ apply patches

echo "APP_NAME=\"${APP_NAME}\""
echo "APP_NAME_LC=\"${APP_NAME_LC}\""
echo "ASSETS_REPOSITORY=\"${ASSETS_REPOSITORY}\""
echo "BINARY_NAME=\"${BINARY_NAME}\""
echo "GH_REPO_PATH=\"${GH_REPO_PATH}\""
echo "GLOBAL_DIRNAME=\"${GLOBAL_DIRNAME}\""
echo "ORG_NAME=\"${ORG_NAME}\""
echo "TUNNEL_APP_NAME=\"${TUNNEL_APP_NAME}\""

if [[ "${DISABLE_UPDATE}" == "yes" ]]; then
  mv ../patches/00-update-disable.patch.yet ../patches/00-update-disable.patch
fi

for file in ../patches/*.json; do
  if [[ -f "${file}" ]]; then
    apply_actions "${file}"
  fi
done

for file in ../patches/*.patch; do
  if [[ -f "${file}" ]]; then
    apply_patch "${file}"
  fi
done

if [[ "${VSCODE_QUALITY}" == "insider" ]]; then
  for file in ../patches/insider/*.patch; do
    if [[ -f "${file}" ]]; then
      apply_patch "${file}"
    fi
  done
fi

if [[ -d "../patches/${OS_NAME}/" ]]; then
  for file in "../patches/${OS_NAME}/"*.patch; do
    if [[ -f "${file}" ]]; then
      apply_patch "${file}"
    fi
  done
fi

for file in ../patches/user/*.patch; do
  if [[ -f "${file}" ]]; then
    apply_patch "${file}"
  fi
done
# }}}

set -x

# {{{ install dependencies
export ELECTRON_SKIP_BINARY_DOWNLOAD=1
export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

if [[ "${OS_NAME}" == "linux" ]]; then
  export VSCODE_SKIP_NODE_VERSION_CHECK=1

   if [[ "${npm_config_arch}" == "arm" ]]; then
    export npm_config_arm_version=7
  fi
elif [[ "${OS_NAME}" == "windows" ]]; then
  if [[ "${npm_config_arch}" == "arm" ]]; then
    export npm_config_arm_version=7
  fi
else
  if [[ "${CI_BUILD}" != "no" ]]; then
    clang++ --version
  fi
fi

node build/npm/preinstall.ts

mv .npmrc .npmrc.bak
cp ../npmrc .npmrc

for i in {1..5}; do # try 5 times
  if [[ "${CI_BUILD}" != "no" && "${OS_NAME}" == "osx" ]]; then
    CXX=clang++ npm ci && break
  else
    npm ci && break
  fi

  if [[ $i == 5 ]]; then
    echo "Npm install failed too many times" >&2
    exit 1
  fi
  echo "Npm install failed $i, trying again..."

  sleep $(( 15 * (i + 1)))
done

mv .npmrc.bak .npmrc
# }}}

# package.json
cp package.json{,.bak}

setpath "package" "version" "${RELEASE_VERSION%-insider}"

replace 's|Microsoft Corporation|VSCodium|' package.json

cp resources/server/manifest.json{,.bak}

if [[ "${VSCODE_QUALITY}" == "insider" ]]; then
  setpath "resources/server/manifest" "name" "VSCodium - Insiders"
  setpath "resources/server/manifest" "short_name" "VSCodium - Insiders"
else
  setpath "resources/server/manifest" "name" "VSCodium"
  setpath "resources/server/manifest" "short_name" "VSCodium"
fi

# announcements
replace "s|\\[\\/\\* BUILTIN_ANNOUNCEMENTS \\*\\/\\]|$( tr -d '\n' < ../announcements-builtin.json )|" src/vs/workbench/contrib/welcomeGettingStarted/browser/gettingStarted.ts

../undo_telemetry.sh

replace 's|Microsoft Corporation|VSCodium|' build/lib/electron.ts
replace 's|([0-9]) Microsoft|\1 VSCodium|' build/lib/electron.ts

if [[ "${OS_NAME}" == "linux" ]]; then
  # microsoft adds their apt repo to sources
  # unless the app name is code-oss
  # as we are renaming the application to vscodium
  # we need to edit a line in the post install template
  if [[ "${VSCODE_QUALITY}" == "insider" ]]; then
    sed -i "s/code-oss/codium-insiders/" resources/linux/debian/postinst.template
  else
    sed -i "s/code-oss/codium/" resources/linux/debian/postinst.template
  fi

  # fix the packages metadata
  # code.appdata.xml
  sed -i 's|Visual Studio Code|VSCodium|g' resources/linux/code.appdata.xml
  sed -i 's|https://code.visualstudio.com/docs/setup/linux|https://github.com/VSCodium/vscodium#download-install|' resources/linux/code.appdata.xml
  sed -i 's|https://code.visualstudio.com/home/home-screenshot-linux-lg.png|https://vscodium.com/img/vscodium.png|' resources/linux/code.appdata.xml
  sed -i 's|https://code.visualstudio.com|https://vscodium.com|' resources/linux/code.appdata.xml

  # control.template
  sed -i 's|Microsoft Corporation <vscode-linux@microsoft.com>|VSCodium Team https://github.com/VSCodium/vscodium/graphs/contributors|'  resources/linux/debian/control.template
  sed -i 's|Visual Studio Code|VSCodium|g' resources/linux/debian/control.template
  sed -i 's|https://code.visualstudio.com/docs/setup/linux|https://github.com/VSCodium/vscodium#download-install|' resources/linux/debian/control.template
  sed -i 's|https://code.visualstudio.com|https://vscodium.com|' resources/linux/debian/control.template

  # code.spec.template
  sed -i 's|Microsoft Corporation|VSCodium Team|' resources/linux/rpm/code.spec.template
  sed -i 's|Visual Studio Code Team <vscode-linux@microsoft.com>|VSCodium Team https://github.com/VSCodium/vscodium/graphs/contributors|' resources/linux/rpm/code.spec.template
  sed -i 's|Visual Studio Code|VSCodium|' resources/linux/rpm/code.spec.template
  sed -i 's|https://code.visualstudio.com/docs/setup/linux|https://github.com/VSCodium/vscodium#download-install|' resources/linux/rpm/code.spec.template
  sed -i 's|https://code.visualstudio.com|https://vscodium.com|' resources/linux/rpm/code.spec.template

  # snapcraft.yaml
  sed -i 's|Visual Studio Code|VSCodium|' resources/linux/rpm/code.spec.template
elif [[ "${OS_NAME}" == "windows" ]]; then
  # code.iss
  sed -i 's|https://code.visualstudio.com|https://vscodium.com|' build/win32/code.iss
  sed -i 's|Microsoft Corporation|VSCodium|' build/win32/code.iss
fi

cd ..

---

[FETCH RESULT]
########## build.sh ##########
#!/usr/bin/env bash
# shellcheck disable=SC1091

set -ex

. version.sh

if [[ "${SHOULD_BUILD}" == "yes" ]]; then
  echo "MS_COMMIT=\"${MS_COMMIT}\""

  . prepare_vscode.sh

  cd vscode || { echo "'vscode' dir not found"; exit 1; }

  export NODE_OPTIONS="--max-old-space-size=8192"
  export VSCODE_PUBLISH_COUNTER=1

  npm run gulp vscode-min-prepack

  if [[ "${OS_NAME}" == "osx" ]]; then
    # remove win32 node modules
    rm -f .build/extensions/ms-vscode.js-debug/src/win32-app-container-tokens.*.node

    # generate Group Policy definitions
    npm run copy-policy-dto --prefix build
    node build/lib/policies/policyGenerator.ts build/lib/policies/policyData.jsonc darwin

    npm run gulp "vscode-darwin-${VSCODE_ARCH}-min-packing"

    find "../VSCode-darwin-${VSCODE_ARCH}" -print0 | xargs -0 touch -c

    . ../build_cli.sh

    VSCODE_PLATFORM="darwin"
  elif [[ "${OS_NAME}" == "windows" ]]; then
    # in CI, packaging will be done by a different job
    if [[ "${CI_BUILD}" == "no" ]]; then
      . ../build/windows/rtf/make.sh

      # generate Group Policy definitions
      npm run copy-policy-dto --prefix build
      node build/lib/policies/policyGenerator.ts build/lib/policies/policyData.jsonc win32

      npm run gulp "vscode-win32-${VSCODE_ARCH}-min-packing"

      if [[ "${VSCODE_ARCH}" != "x64" ]]; then
        SHOULD_BUILD_REH="no"
        SHOULD_BUILD_REH_WEB="no"
      fi

      . ../build_cli.sh
    fi

    VSCODE_PLATFORM="win32"
  else # linux
    # remove win32 node modules
    rm -f .build/extensions/ms-vscode.js-debug/src/win32-app-container-tokens.*.node

    # in CI, packaging will be done by a different job
    if [[ "${CI_BUILD}" == "no" ]]; then
      # generate Group Policy definitions
      npm run copy-policy-dto --prefix build
      node build/lib/policies/policyGenerator.ts build/lib/policies/policyData.jsonc linux

      npm run gulp "vscode-linux-${VSCODE_ARCH}-min-packing"

      find "../VSCode-linux-${VSCODE_ARCH}" -print0 | xargs -0 touch -c

      . ../build_cli.sh
    fi

    VSCODE_PLATFORM="linux"
  fi

  if [[ "${SHOULD_BUILD_REH}" != "no" ]]; then
    npm run gulp minify-vscode-reh
    npm run gulp "vscode-reh-${VSCODE_PLATFORM}-${VSCODE_ARCH}-min-ci"
  fi

  if [[ "${SHOULD_BUILD_REH_WEB}" != "no" ]]; then
    npm run gulp minify-vscode-reh-web
    npm run gulp "vscode-reh-web-${VSCODE_PLATFORM}-${VSCODE_ARCH}-min-ci"
  fi

  cd ..
fi
########## get_repo.sh ##########
#!/usr/bin/env bash
# shellcheck disable=SC2129

set -e

# git workaround
if [[ "${CI_BUILD}" != "no" ]]; then
  git config --global --add safe.directory "/__w/$( echo "${GITHUB_REPOSITORY}" | awk '{print tolower($0)}' )"
fi

if [[ -z "${RELEASE_VERSION}" ]]; then
  if [[ "${VSCODE_LATEST}" == "yes" ]] || [[ ! -f "./upstream/${VSCODE_QUALITY}.json" ]]; then
    echo "Retrieve lastest version"
    UPDATE_INFO=$( curl --silent --fail "https://update.code.visualstudio.com/api/update/darwin/${VSCODE_QUALITY}/0000000000000000000000000000000000000000" )
  else
    echo "Get version from ${VSCODE_QUALITY}.json"
    MS_COMMIT=$( jq -r '.commit' "./upstream/${VSCODE_QUALITY}.json" )
    MS_TAG=$( jq -r '.tag' "./upstream/${VSCODE_QUALITY}.json" )
  fi

  if [[ -z "${MS_COMMIT}" ]]; then
    MS_COMMIT=$( echo "${UPDATE_INFO}" | jq -r '.version' )
    MS_TAG=$( echo "${UPDATE_INFO}" | jq -r '.name' )

    if [[ "${VSCODE_QUALITY}" == "insider" ]]; then
      MS_TAG="${MS_TAG/\-insider/}"
    fi
  fi

  TIME_PATCH=$( printf "%04d" $(($(date +%-j) * 24 + $(date +%-H))) )

  if [[ "${VSCODE_QUALITY}" == "insider" ]]; then
    RELEASE_VERSION="${MS_TAG}${TIME_PATCH}-insider"
  else
    RELEASE_VERSION="${MS_TAG}${TIME_PATCH}"
  fi
else
  if [[ "${VSCODE_QUALITY}" == "insider" ]]; then
    if [[ "${RELEASE_VERSION}" =~ ^([0-9]+\.[0-9]+\.[0-5])[0-9]+-insider$ ]];
    then
      MS_TAG="${BASH_REMATCH[1]}"
    else
      echo "Error: Bad RELEASE_VERSION: ${RELEASE_VERSION}"
      exit 1
    fi
  else
    if [[ "${RELEASE_VERSION}" =~ ^([0-9]+\.[0-9]+\.[0-5])[0-9]+$ ]];
    then
      MS_TAG="${BASH_REMATCH[1]}"
    else
      echo "Error: Bad RELEASE_VERSION: ${RELEASE_VERSION}"
      exit 1
    fi
  fi

  if [[ "${MS_TAG}" == "$( jq -r '.tag' "./upstream/${VSCODE_QUALITY}.json" )" ]]; then
    MS_COMMIT=$( jq -r '.commit' "./upstream/${VSCODE_QUALITY}.json" )
  else
    echo "Error: No MS_COMMIT for ${RELEASE_VERSION}"
    exit 1
  fi
fi

echo "RELEASE_VERSION=\"${RELEASE_VERSION}\""

mkdir -p vscode
cd vscode || { echo "'vscode' dir not found"; exit 1; }

git init -q
git remote add origin https://github.com/Microsoft/vscode.git

# figure out latest tag by calling MS update API
if [[ -z "${MS_TAG}" ]]; then
  UPDATE_INFO=$( curl --silent --fail "https://update.code.visualstudio.com/api/update/darwin/${VSCODE_QUALITY}/0000000000000000000000000000000000000000" )
  MS_COMMIT=$( echo "${UPDATE_INFO}" | jq -r '.version' )
  MS_TAG=$( echo "${UPDATE_INFO}" | jq -r '.name' )
elif [[ -z "${MS_COMMIT}" ]]; then
  REFERENCE=$( git ls-remote --tags | grep -x ".*refs\/tags\/${MS_TAG}" | head -1 )

  if [[ -z "${REFERENCE}" ]]; then
    echo "Error: The following tag can't be found: ${MS_TAG}"
    exit 1
  elif [[ "${REFERENCE}" =~ ^([[:alnum:]]+)[[:space:]]+refs\/tags\/([0-9]+\.[0-9]+\.[0-5])$ ]]; then
    MS_COMMIT="${BASH_REMATCH[1]}"
    MS_TAG="${BASH_REMATCH[2]}"
  else
    echo "Error: The following reference can't be parsed: ${REFERENCE}"
    exit 1
  fi
fi

echo "MS_TAG=\"${MS_TAG}\""
echo "MS_COMMIT=\"${MS_COMMIT}\""

git fetch --depth 1 origin "${MS_COMMIT}"
git checkout FETCH_HEAD

cd ..

# for GH actions
if [[ "${GITHUB_ENV}" ]]; then
  echo "MS_TAG=${MS_TAG}" >> "${GITHUB_ENV}"
  echo "MS_COMMIT=${MS_COMMIT}" >> "${GITHUB_ENV}"
  echo "RELEASE_VERSION=${RELEASE_VERSION}" >> "${GITHUB_ENV}"
fi

export MS_TAG
export MS_COMMIT
export RELEASE_VERSION
########## utils.sh ##########
#!/usr/bin/env bash

APP_NAME="${APP_NAME:-VSCodium}"
APP_NAME_LC="$( echo "${APP_NAME}" | awk '{print tolower($0)}' )"
ASSETS_REPOSITORY="${ASSETS_REPOSITORY:-VSCodium/vscodium}"
BINARY_NAME="${BINARY_NAME:-codium}"
GH_REPO_PATH="${GH_REPO_PATH:-VSCodium/vscodium}"
ORG_NAME="${ORG_NAME:-VSCodium}"
TUNNEL_APP_NAME="${TUNNEL_APP_NAME:-"${BINARY_NAME}-tunnel"}"

if [[ "${VSCODE_QUALITY}" == "insider" ]]; then
  GLOBAL_DIRNAME="${GLOBAL_DIRNAME:-"${APP_NAME_LC}"}-insiders"
else
  GLOBAL_DIRNAME="${GLOBAL_DIRNAME:-"${APP_NAME_LC}"}"
fi

# All common functions can be added to this file

apply_actions() {
  jq -c '.[]' "$1" | while IFS= read -r ENTRY; do
    ENTRY_ACTION=$( jq -r '.action // empty' <<< "${ENTRY}" )

    case "${ENTRY_ACTION}" in
      remove)
        jq -r '.paths[]' <<< "${ENTRY}" | while IFS= read -r ENTRY_PATH; do
          ENTRY_PATH="${ENTRY_PATH%$'\r'}"

          if [[ -e "${ENTRY_PATH}" ]]; then
            if rm -rf -- "${ENTRY_PATH}"; then
              echo "Removed: ${ENTRY_PATH}"
            else
              echo "Failed to remove: ${ENTRY_PATH}" >&2
              exit 4
            fi
          else
            echo "Not found: ${ENTRY_PATH}" >&2
            exit 4
          fi
        done
      ;;
    esac
  done
}

apply_patch() {
  if [[ -z "$2" ]]; then
    echo applying patch: "$1";
  fi
  # grep '^+++' "$1"  | sed -e 's#+++ [ab]/#./vscode/#' | while read line; do shasum -a 256 "${line}"; done

  cp $1{,.bak}

  replace "s|!!APP_NAME!!|${APP_NAME}|g" "$1"
  replace "s|!!APP_NAME_LC!!|${APP_NAME_LC}|g" "$1"
  replace "s|!!ASSETS_REPOSITORY!!|${ASSETS_REPOSITORY}|g" "$1"
  replace "s|!!BINARY_NAME!!|${BINARY_NAME}|g" "$1"
  replace "s|!!GH_REPO_PATH!!|${GH_REPO_PATH}|g" "$1"
  replace "s|!!GLOBAL_DIRNAME!!|${GLOBAL_DIRNAME}|g" "$1"
  replace "s|!!ORG_NAME!!|${ORG_NAME}|g" "$1"
  replace "s|!!RELEASE_VERSION!!|${RELEASE_VERSION}|g" "$1"
  replace "s|!!TUNNEL_APP_NAME!!|${TUNNEL_APP_NAME}|g" "$1"

  if ! git apply --ignore-whitespace "$1"; then
    echo failed to apply patch "$1" >&2
    exit 1
  fi

  mv -f $1{.bak,}
}

exists() { type -t "$1" &> /dev/null; }

is_gnu_sed() {
  sed --version &> /dev/null
}

replace() {
  if is_gnu_sed; then
    sed -i -E "${1}" "${2}"
  else
    sed -i '' -E "${1}" "${2}"
  fi
}

if ! exists gsed; then
  if is_gnu_sed; then
    function gsed() {
      sed -i -E "$@"
    }
  else
    function gsed() {
      sed -i '' -E "$@"
    }
  fi
fi
########## prepare_src.sh ##########
#!/usr/bin/env bash
# shellcheck disable=SC1091

set -e

npm install -g checksum

sum_file() {
  if [[ -f "${1}" ]]; then
    echo "Calculating checksum for ${1}"
    checksum -a sha256 "${1}" > "${1}".sha256
    checksum "${1}" > "${1}".sha1
  fi
}

mkdir -p assets

git archive --format tar.gz --output="./assets/${APP_NAME}-${RELEASE_VERSION}-src.tar.gz" HEAD
git archive --format zip --output="./assets/${APP_NAME}-${RELEASE_VERSION}-src.zip" HEAD

if [[ "${VSCODE_QUALITY}" == "insider" ]]; then
  COMMIT_ID=$( git rev-parse HEAD )

  jsonTmp=$( jq -n --arg 'tag' "${RELEASE_VERSION}" --arg 'id' "${BUILD_SOURCEVERSION}" --arg 'commit' "${COMMIT_ID}" '{ "tag": $tag, "id": $id, "commit": $commit }' )
  echo "${jsonTmp}" > "./assets/buildinfo.json" && unset jsonTmp
fi

cd assets

for FILE in *; do
  if [[ -f "${FILE}" ]]; then
    sum_file "${FILE}"
  fi
done

cd ..
########## update_upstream.sh ##########
#!/usr/bin/env bash
# shellcheck disable=SC2129

set -e

if [[ "${SHOULD_BUILD}" != "yes" ]]; then
  echo "Will not update version JSON because we did not build"
  exit 0
fi

jsonTmp=$( cat "./upstream/${VSCODE_QUALITY}.json" | jq --arg 'tag' "${MS_TAG/\-insider/}" --arg 'commit' "${MS_COMMIT}" '. | .tag=$tag | .commit=$commit' )
echo "${jsonTmp}" > "./upstream/${VSCODE_QUALITY}.json" && unset jsonTmp

# stage notary files
git add upstream/*

# discard changed files
git restore .

CHANGES=$( git status --porcelain )

if [[ -n "${CHANGES}" ]]; then
  git commit -S -m "build(${VSCODE_QUALITY}): update to commit ${MS_COMMIT:0:7}"

  BRANCH_NAME=$( git rev-parse --abbrev-ref HEAD )

  if ! git push origin "${BRANCH_NAME}" --quiet; then
    git pull origin "${BRANCH_NAME}"
    git push origin "${BRANCH_NAME}" --quiet
  fi
fi

---

[FETCH RESULT]
The server returned HTTP 404 Not Found.

The response body was not retrieved. If this URL requires authentication, use an authenticated tool (e.g. `gh` for GitHub, or an MCP-provided fetch tool) instead of WebFetch.

---

[FETCH RESULT]
API Error: 400 Anthropic Claude bad request: InvokeModelWithResponseStream: operation error Bedrock Runtime: InvokeModelWithResponseStream, https response error StatusCode: 400, RequestID: 0637d780-ec44-4407-8d05-b18d599af096, ValidationException: Tool 'web_search' not found in provided tools (request id: e8e14ee4a339d56cc9908aad429807b8) [trace_id=052f754387db07c1fccebe4fc1702000] (request id: 202609011305129507219922c9x9HuHHNvXy)

---

[FETCH RESULT]
href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fgithub.com%2Fjxtngx%2Fcursor%2Dextension%2Dfactory%2Ftree%2Fmain%2F&amp;rut=2574862b4482335cdf32f04e827668e9d732949279a02aa7df23b834f0e99fdc"
href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fgithub.com%2Fjxtngx%2Fcursor%2Dextension%2Dfactory%2Ftree%2Fmain%2F&amp;rut=2574862b4482335cdf32f04e827668e9d732949279a02aa7df23b834f0e99fdc"
href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fgithub.com%2Fjxtngx%2Fcursor%2Dextension%2Dfactory%2Ftree%2Fmain%2F&amp;rut=2574862b4482335cdf32f04e827668e9d732949279a02aa7df23b834f0e99fdc"
href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fgithub.com%2Fjxtngx%2Fcursor%2Dextension%2Dfactory%2Ftree%2Fmain%2F&amp;rut=2574862b4482335cdf32f04e827668e9d732949279a02aa7df23b834f0e99fdc"
href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fforum.cursor.com%2Ft%2Fextension%2Dmarketplace%2Dchanges%2Dtransition%2Dto%2Dopenvsx%2F109138&amp;rut=f6002cdadc52f901513fc1fdca0ae669476a05a831d37003510da1ce95be5399"
href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fforum.cursor.com%2Ft%2Fextension%2Dmarketplace%2Dchanges%2Dtransition%2Dto%2Dopenvsx%2F109138&amp;rut=f6002cdadc52f901513fc1fdca0ae669476a05a831d37003510da1ce95be5399"
href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fforum.cursor.com%2Ft%2Fextension%2Dmarketplace%2Dchanges%2Dtransition%2Dto%2Dopenvsx%2F109138&amp;rut=f6002cdadc52f901513fc1fdca0ae669476a05a831d37003510da1ce95be5399"
href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fforum.cursor.com%2Ft%2Fextension%2Dmarketplace%2Dchanges%2Dtransition%2Dto%2Dopenvsx%2F109138&amp;rut=f6002cdadc52f901513fc1fdca0ae669476a05a831d37003510da1ce95be5399"
href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fcursor.com%2Fhelp%2Fcustomization%2Fextensions&amp;rut=201a4a4466dae7f81409434df872f4840c6a99c20de2098032d5acd12a760d50"
href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fcursor.com%2Fhelp%2Fcustomization%2Fextensions&amp;rut=201a4a4466dae7f81409434df872f4840c6a99c20de2098032d5acd12a760d50"
href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fcursor.com%2Fhelp%2Fcustomization%2Fextensions&amp;rut=201a4a4466dae7f81409434df872f4840c6a99c20de2098032d5acd12a760d50"
href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fcursor.com%2Fhelp%2Fcustomization%2Fextensions&amp;rut=201a4a4466dae7f81409434df872f4840c6a99c20de2098032d5acd12a760d50"
href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fdredyson.com%2Fopenvsx%2Dvs%2Dvscode%2Dmarketplace%2Di%2Dtested%2Devery%2Dworkaround%2Dfor%2Dcursors%2Dextension%2Dtransition%2Dheres%2Dwhat%2Dworks%2Dbest%2F&amp;rut=4029fcd4e0bc2c6596a763570164fc2c15dafdeb6af63181118a0b70c8438811"
href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fdredyson.com%2Fopenvsx%2Dvs%2Dvscode%2Dmarketplace%2Di%2Dtested%2Devery%2Dworkaround%2Dfor%2Dcursors%2Dextension%2Dtransition%2Dheres%2Dwhat%2Dworks%2Dbest%2F&amp;rut=4029fcd4e0bc2c6596a763570164fc2c15dafdeb6af63181118a0b70c8438811"
href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fdredyson.com%2Fopenvsx%2Dvs%2Dvscode%2Dmarketplace%2Di%2Dtested%2Devery%2Dworkaround%2Dfor%2Dcursors%2Dextension%2Dtransition%2Dheres%2Dwhat%2Dworks%2Dbest%2F&amp;rut=4029fcd4e0bc2c6596a763570164fc2c15dafdeb6af63181118a0b70c8438811"
href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fdredyson.com%2Fopenvsx%2Dvs%2Dvscode%2Dmarketplace%2Di%2Dtested%2Devery%2Dworkaround%2Dfor%2Dcursors%2Dextension%2Dtransition%2Dheres%2Dwhat%2Dworks%2Dbest%2F&amp;rut=4029fcd4e0bc2c6596a763570164fc2c15dafdeb6af63181118a0b70c8438811"
href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fopen%2Dvsx.org%2F&amp;rut=bd9fd41816c9b0881925bff6cb55b2f38ec45438926ac3bf0ea41774041b689d"
href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fopen%2Dvsx.org%2F&amp;rut=bd9fd41816c9b0881925bff6cb55b2f38ec45438926ac3bf0ea41774041b689d"
href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fopen%2Dvsx.org%2F&amp;rut=bd9fd41816c9b0881925bff6cb55b2f38ec45438926ac3bf0ea41774041b689d"
href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fopen%2Dvsx.org%2F&amp;rut=bd9fd41816c9b0881925bff6cb55b2f38ec45438926ac3bf0ea41774041b689d"

---

[FETCH RESULT]
## Documentation sections listed on this page

**Start here**
- Get started — described as going "from install to your first useful change in Cursor"
- Models & Pricing — `https://cursor.com/docs/models-and-pricing.md`
- Changelog

**What you can do with Cursor**
- Understand your code
- Plan and build features
- Find and fix bugs
- Review changes
- Customize Cursor — covers adding "plugins, skills, MCPs, and rules from one place"
- Connect your workflow — integrations including "GitHub, GitLab, Azure DevOps, Bitbucket, JetBrains, Slack, Linear"

**Models** — a table of ~45 models from Anthropic, Cursor, Google, OpenAI, Z.ai, and Moonshot

**More resources**
- Downloads — "Get Cursor for your computer"
- Help
- Support contact for account and billing

## Requested URLs: extensions, marketplace, installation, VS Code migration

The page does not expose sitemap URLs for these topics. Only three links appear anywhere in the content:

| URL | Topic |
|---|---|
| `/llms.txt` | Sitemap — labeled an "Overview of all docs pages" |
| `https://cursor.com/docs/models-and-pricing.md` | Model attributes and pricing |
| `/docs-static/images/agent/homepage-hero.png` | Hero image asset |

The nearest thematic matches are **Downloads** (obtaining Cursor for a machine), **Get started** (references installation), and **Customize Cursor** (plugins, skills, MCPs, rules) — but no destination URLs are given for any of them. Nothing on the page addresses a marketplace or a VS Code migration path.

To retrieve the actual paths, you would need to fetch `/llms.txt`, which is the only sitemap pointer provided here.

---

[FETCH RESULT]
**Marketplace:** Cursor pulls third-party extensions from Open VSX rather than the Microsoft Marketplace, but requests don't go straight there — they're routed "through its own marketplace proxy (`marketplace.cursorapi.com`)". Automated malware and supply-chain scanning runs before an extension appears in search or is served, and failing ones get blocked.

**Installing:**
1. Open the Extensions panel — Cmd + Shift + X on Mac, Ctrl + Shift + X on Windows/Linux
2. Search for what you want
3. Hit **Install** — "The extension activates immediately."

To turn one off, find it in the same panel and click **Disable**, either globally or just for the current workspace.

**What's unavailable:** Coverage is broad but incomplete — "not every Microsoft Marketplace extension is listed there." The page also flags an identity caveat: an identical `publisher.extension` ID "can point to different publishers or code on Open VSX," so you should treat IDs like dependencies and stick to trusted publishers. Where a widely used extension is missing, Cursor ships first-party **Anysphere** replacements described as "audited Anysphere builds."

**On your specific question about named Microsoft extensions:** the page doesn't identify any. It refers generally to "some Microsoft Marketplace-only extensions" being swapped for Anysphere builds, but lists no extension names and recommends no specific alternatives. If you need to know whether a particular extension has a substitute, you'd have to search the Extensions panel directly.

**Also covered (team/enterprise controls):**
- **Marketplace Install Cooldown** — admins delay installs/updates until a version has been public for a set number of hours, guarding against "short-lived malicious uploads." Default is `0`; once above zero it applies fleet-wide and overrides individual `extensions.installCooldownHours` values. Users can set that themselves only absent an enforced team cooldown.
- **Allowed extensions** — limit installs to approved publishers or IDs via the team dashboard or MDM (`AllowedExtensions`).
- **Signature verification** — require valid Open VSX signatures pre-install.

The docs stress these are client-side and "do not replace, marketplace-layer analysis and blocking."

**Publisher verification:** Publishers can request a badge by linking their OpenVSX listing from a site with its own domain (a GitHub readme won't do), pointing the listing's "homepage" field at that site, reusing the same extension ID across marketplaces, then posting in the forum's Extension Verification category. The badge attests to identity only — "Verification confirms publisher identity" — so allowlists and cooldowns are still advised for extensions touching production code or credentials.

---

[FETCH RESULT]
## What changed

Cursor moved its in-app extension library to **OpenVSX**. The announcement, posted by **danperks (Dan)** on **June 25, 2025, 2:31pm** in Announcements → Release Discussions, says the change was made "recently" and that the in-app library now uses OpenVSX "as the underlying library."

The prior backend is never explicitly named in the post; later replies from users refer to it as the "official VSCode library" / "VSCode marketplace," and one workaround involves switching the backend back to it — so the practical shift is from the Microsoft-hosted marketplace to OpenVSX.

## Versions / dates

- **June 25, 2025** — announcement thread opens.
- **v1.1.3 and above** — users can change which marketplace backend they use, but Dan notes "switching the marketplace is not officially supported."
- A newer upstream VS Code base was requested on June 26 (many extensions now require newer VS Code releases); Dan replied on June 27: "Should be coming soon!"

## Cursor's replacement extensions

Cursor says it now publishes and maintains its own builds of many popular extensions to keep them working in Cursor. They appear under the publisher **"Anysphere"** and are described as "mostly drop-in replacements for core extensions you may have used previously."

Specific Anysphere-published alternatives named by participants: **Python, C++ (cpp), and Dev Containers**.

## Extensions reported as missing, stale, or broken

Note: your list doesn't fully match this thread. **Pylance, C# Dev Kit, Remote-SSH, WSL, and Copilot Chat are not mentioned anywhere in this page.** What *is* reported:

- **ms-python and pyright** — changxiaoqiang (June 30): could not find either on OpenVSX, so Python tooling couldn't be installed.
- **Microsoft MSSQL** — troutgoingupstream (June 28) describes the OpenVSX copy as "being 5 years old," calling the situation "barely usable and definitely unreliable for us" and stating "Right now OpenVSX is terrible."
- **Dev Containers / devcontainer** — mjvk (June 30) can't find Microsoft's version; says the Anysphere build "does not allow cloning into container and such." A linked related topic also covers being unable to search for MS's Dev Containers extension.
- **Claude Code** — Christopher_Webster (July 1): stopped working after a Cursor update, and reinstalling from the marketplace tab (Dean Rie's first suggestion) had already been done.

## Workarounds discussed

- **Manual .vsix installs**: drag `.vsix` files into Cursor's extensions pane (from the announcement), or use `CTRL-SHIFT-P` → "Extensions: Install from VSIX...". engels74 links a VSIX Downloader web UI and notes files may need renaming from `.VSIXPackage` to `.vsix`, adding that "Auto Updating probably won't work."
- **Missing extension?** Cursor's guidance is to ask the extension's developer/maintainer to publish to OpenVSX.
- **Backend switching**: troutgoingupstream describes installing Anysphere extensions first, switching to the VS Code library for the rest, then losing Anysphere updates and having to repeat the switch.

## Cursor employee statements

- **danperks (Dan)** — announcement author; confirmed a newer VS Code base is "coming soon"; flagged marketplace switching as unsupported.
- **ravirahman (Ravi Rahman)** on updates (June 28): "No need to reinstall any extensions; updates will be delivered automatically when they are available on OpenVSX."
- **ravirahman** on shipping Anysphere extensions to Microsoft's marketplace (June 28): "No, we do not plan on publishing our extensions there." He added that Cursor is "looking at supporting multiple active marketplaces client-side."
- **deanrie (Dean Rie)** on the Claude Code breakage: install it from the marketplace tab, then "Try updating Claude Code in the terminal by running `claude update`."

## Unanswered questions on this page

- curious_coder (June 29): how extensions differ from MCPs.
- changxiaoqiang (June 30): "how to switch" the marketplace.
- LionSR (July 1): whether Cursor's OpenVSX host propagates download counts upstream.
- Caranell (June 30) requested publisher **verification badges**, noting some OpenVSX entries carry warning signs that aren't surfaced in-app — only on the marketplace webpage.

The discussion continues onto a second page not included here.

---

[FETCH RESULT]
=== cursorapi gallery probe ===
{"code":"unavailable","message":"[unavailable] Error","details":[{"type":"aiserver.v1.ErrorDetails","debug":{"details":{"title":"Service Unavailable","detail":"Service Unavailable","isRetryable":false},"isExpected":false},"value":"EiwKE1NlcnZpY2UgVW5hdmFpbGFibGUSE1NlcnZpY2UgVW5hdmFpbGFibGUgABgA"}]}
=== open-vsx gallery serviceUrl probe ===
404
=== cursor update api ===
{"message":"Route GET:/updates/api/update/darwin-arm64/stable/1.0.0 not found","error":"Not Found","statusCode":404}

---

[FETCH RESULT]
## Pointing `extensionsGallery` at Open VSX

The Open VSX wiki explains that VS Code's `product.json` holds basic application properties, and that Open VSX ships "an adapter to the VS Code Marketplace API." You add (or edit) the `extensionsGallery` section:

```json
"extensionsGallery": {
    "serviceUrl": "https://open-vsx.org/vscode/gallery",
    "itemUrl": "https://open-vsx.org/vscode/item",
    "resourceUrlTemplate": "https://open-vsx.org/vscode/unpkg/{publisher}/{name}/{version}/{path}",
    "extensionUrlTemplate": "https://open-vsx.org/vscode/gallery/{publisher}/{name}/latest"
}
```

What the fields do, per the wiki:
- `serviceUrl` — "used to search extensions"
- `itemUrl` — sends you to the extension's detail page when its name is clicked in the editor
- `resourceUrlTemplate` — described as "an optional configuration that provides an URL template for fetching extension resources"
- `extensionUrlTemplate` — resolves the latest version of a given publisher/extension

### Suppressing domain warnings

The editor may show a warning before launching a browser toward the open-vsx.org domain. You can either adjust trusted domains via the button in the dialog, or add:

```json
"linkProtectionTrustedDomains": [
    "https://open-vsx.org"
]
```

### Fields you asked about that aren't here

`controlUrl`, `publisherUrl`, and any environment variables are **not** documented in this page, so I can't supply values for them without inventing them. The page notes that `product.json`'s schema lives in VS Code's `productService.ts`, which would be the place to confirm additional supported keys.

### Publishing, `ovsx` CLI, and the namespace/token model

This page doesn't cover publishing at all — it's purely about client-side gallery configuration. The wiki's page index lists separate pages that would hold that material: **Publishing Extensions**, **Namespace Access**, and **Registry API**. Their contents weren't included in what I was given, so I'd be guessing if I described `ovsx` commands, namespace ownership, or access-token issuance. Check those pages directly.

### One contextual note

The wiki observes that Microsoft's official builds include information absent from the open source version, and characterizes whether forks may use the Marketplace as "an open question," linking to a VS Code issue. I'm not a lawyer and won't assess that question — but it's the stated reason a self-hosted or alternative gallery like Open VSX is configured this way.

---

[FETCH RESULT]
=== proposed API d.ts files in microsoft/vscode ===

=== count ===
0

---

[FETCH RESULT]
17 ps.ts
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IProductConfiguration } from '../../../base/common/product.js';
import { createDecorator } from '../../instantiation/common/instantiation.js';

export const IProductService = createDecorator<IProductService>('productService');

export interface IProductService extends Readonly<IProductConfiguration> {

	readonly _serviceBrand: undefined;

}

export const productSchemaId = 'vscode://schemas/vscode-product';

---

[FETCH RESULT]
468 prod.ts
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IStringDictionary } from './collections.js';
import { PlatformName } from './platform.js';
import { IExtensionConfigurationPolicyReference, IPolicy } from './policy.js';

export interface IBuiltInExtension {
	readonly name: string;
	readonly version: string;
	readonly repo: string;
	readonly metadata: unknown;
}

export interface IProductWalkthrough {
	id: string;
	steps: IProductWalkthroughStep[];
}

export interface IProductWalkthroughStep {
	id: string;
	title: string;
	when: string;
	description: string;
	media:
	| { type: 'image'; path: string | { hc: string; hcLight?: string; light: string; dark: string }; altText: string }
	| { type: 'svg'; path: string; altText: string }
	| { type: 'markdown'; path: string };
}

export interface IFeaturedExtension {
	readonly id: string;
	readonly title: string;
	readonly description: string;
	readonly imagePath: string;
}

export interface IChatSessionRecommendation {
	readonly extensionId: string;
	readonly extensionName: string;
	readonly displayName: string;
	readonly name: string;
	readonly description: string;
	readonly postInstallCommand?: string;
}

export type ConfigurationSyncStore = {
	url: string;
	insidersUrl: string;
	stableUrl: string;
	canSwitch?: boolean;
	authenticationProviders: IStringDictionary<{ scopes: string[] }>;
};

export type ExtensionUntrustedWorkspaceSupport = {
	readonly default?: boolean | 'limited';
	readonly override?: boolean | 'limited';
};

export type ExtensionVirtualWorkspaceSupport = {
	readonly default?: boolean;
	readonly override?: boolean;
};

/**
 * Per-SDK configuration for downloading an agent SDK on demand. The
 * runtime substitutes `{sdkTarget}` in `urlTemplate` against the host's
 * `(platform, arch, libc)` triple via `resolveSdkTarget()` in the agent
 * SDK downloader.
 *
 * `urlTemplate` uses `format2()`-style named placeholders. Today only
 * `{sdkTarget}` is recognised; the build emits e.g.
 * `https://main.vscode-cdn.net/agent-sdk/claude/0.3.168/{sdkTarget}.tgz`
 * and the runtime substitutes `darwin-arm64`, `linux-x64-musl`, etc.
 *
 * See `src/vs/platform/agentHost/node/claude/roadmap.md` Phase 15 for
 * the rationale (macOS Universal compatibility, trust model).
 */
export interface IAgentSdkProductConfig {
	readonly version: string;
	readonly urlTemplate: string;
}

/**
 * Configuration for downloading the on-device dictation native runtime (the
 * Foundry Local addon + core libraries) on demand. Produced per platform build
 * and stamped by `build/dictation-runtime/produce.ts`; consumed by
 * `foundryLocalRuntime.ts`, which substitutes `{target}` in `urlTemplate`
 * against the host's `<platform>-<arch>` key. Absent in local dev builds, in
 * which case the runtime falls back to the SDK's own `node_modules` payload.
 */
export interface IDictationRuntimeProductConfig {
	readonly version: string;
	readonly urlTemplate: string;
}

export interface IProductConfiguration {
	readonly version: string;
	readonly date?: string;
	readonly quality?: string;
	readonly commit?: string;

	readonly nameShort: string;
	readonly nameLong: string;

	readonly win32AppUserModelId?: string;
	readonly win32MutexName?: string;
	readonly win32SetupMutexName?: string;
	readonly win32RegValueName?: string;
	readonly win32NameVersion?: string;
	readonly win32VersionedUpdate?: boolean;
	readonly win32ContextMenu?: { readonly [arch: string]: { readonly clsid: string } };
	readonly applicationName: string;
	readonly embedderIdentifier?: string;
	readonly agentsTelemetryAppName?: string;

	readonly urlProtocol: string;
	readonly dataFolderName: string; // location for extensions (e.g. ~/.vscode-insiders)
	readonly sharedDataFolderName: string; // location for shared data (e.g. ~/.vscode-insiders-shared)

	readonly builtInExtensions?: IBuiltInExtension[];
	readonly walkthroughMetadata?: IProductWalkthrough[];
	readonly featuredExtensions?: IFeaturedExtension[];

	readonly downloadUrl?: string;
	readonly updateUrl?: string;
	readonly webUrl?: string;
	readonly webEndpointUrlTemplate?: string;
	readonly webviewContentExternalBaseUrlTemplate?: string;
	readonly target?: string;
	readonly nlsCoreBaseUrl?: string;

	readonly settingsSearchBuildId?: number;
	readonly settingsSearchUrl?: string;

	readonly tasConfig?: {
		endpoint: string;
		telemetryEventName: string;
		assignmentContextTelemetryPropertyName: string;
	};

	readonly extensionsGallery?: {
		readonly serviceUrl: string;
		readonly controlUrl: string;
		readonly extensionUrlTemplate: string;
		readonly resourceUrlTemplate: string;
		readonly nlsBaseUrl: string;
		readonly accessSKUs?: string[];
	};

	readonly agentSdks?: { readonly [packageId: string]: IAgentSdkProductConfig };

	readonly copilotVersions?: {
		readonly runtime: string;
		readonly sdk: string;
	};

	readonly dictationRuntime?: IDictationRuntimeProductConfig;

	readonly mcpGallery?: {
		readonly serviceUrl: string;
		readonly itemWebUrl: string;
		readonly publisherUrl: string;
		readonly supportUrl: string;
		readonly privacyPolicyUrl: string;
		readonly termsOfServiceUrl: string;
		readonly reportUrl: string;
	};

	readonly extensionPublisherOrgs?: readonly string[];
	readonly trustedExtensionPublishers?: readonly string[];

	readonly extensionRecommendations?: IStringDictionary<IExtensionRecommendations>;
	readonly configBasedExtensionTips?: IStringDictionary<IConfigBasedExtensionTip>;
	readonly exeBasedExtensionTips?: IStringDictionary<IExeBasedExtensionTip>;
	readonly remoteExtensionTips?: IStringDictionary<IRemoteExtensionTip>;
	readonly virtualWorkspaceExtensionTips?: IStringDictionary<IVirtualWorkspaceExtensionTip>;
	readonly extensionKeywords?: IStringDictionary<string[]>;
	readonly keymapExtensionTips?: readonly string[];
	readonly webExtensionTips?: readonly string[];
	readonly languageExtensionTips?: readonly string[];
	readonly trustedExtensionUrlPublicKeys?: IStringDictionary<string[]>;
	readonly trustedExtensionAuthAccess?: string[] | IStringDictionary<string[]>;
	readonly trustedMcpAuthAccess?: string[] | IStringDictionary<string[]>;
	readonly inheritAuthAccountPreference?: IStringDictionary<string[]>;
	readonly trustedExtensionProtocolHandlers?: readonly string[];

	readonly commandPaletteSuggestedCommandIds?: string[];

	readonly crashReporter?: {
		readonly companyName: string;
		readonly productName: string;
	};

	readonly removeTelemetryMachineId?: boolean;
	readonly enabledTelemetryLevels?: { error: boolean; usage: boolean };
	readonly enableTelemetry?: boolean;
	readonly openToWelcomeMainPage?: boolean;
	readonly aiConfig?: {
		readonly ariaKey: string;
	};

	readonly documentationUrl?: string;
	readonly serverDocumentationUrl?: string;
	readonly releaseNotesUrl?: string;
	readonly keyboardShortcutsUrlMac?: string;
	readonly keyboardShortcutsUrlLinux?: string;
	readonly keyboardShortcutsUrlWin?: string;
	readonly introductoryVideosUrl?: string;
	readonly tipsAndTricksUrl?: string;
	readonly newsletterSignupUrl?: string;
	readonly youTubeUrl?: string;
	readonly requestFeatureUrl?: string;
	readonly reportIssueUrl?: string;
	readonly reportMarketplaceIssueUrl?: string;
	readonly licenseUrl?: string;
	readonly serverLicenseUrl?: string;
	readonly privacyStatementUrl?: string;
	readonly showTelemetryOptOut?: boolean;

	readonly serverGreeting?: string[];
	readonly serverLicense?: string[];
	readonly serverLicensePrompt?: string;
	readonly serverApplicationName: string;
	readonly serverDataFolderName?: string;

	readonly tunnelApplicationName?: string;
	readonly tunnelApplicationConfig?: ITunnelApplicationConfig;

	readonly npsSurveyUrl?: string;
	readonly surveys?: readonly ISurveyData[];

	readonly checksums?: { [path: string]: string };
	readonly checksumFailMoreInfoUrl?: string;

	readonly appCenter?: IAppCenterConfiguration;

	readonly portable?: string;

	readonly extensionKind?: { readonly [extensionId: string]: ('ui' | 'workspace' | 'web')[] };
	readonly extensionPointExtensionKind?: { readonly [extensionPointId: string]: ('ui' | 'workspace' | 'web')[] };
	readonly extensionSyncedKeys?: { readonly [extensionId: string]: string[] };

	readonly extensionEnabledApiProposals?: { readonly [extensionId: string]: string[] };
	readonly extensionUntrustedWorkspaceSupport?: { readonly [extensionId: string]: ExtensionUntrustedWorkspaceSupport };
	readonly extensionVirtualWorkspacesSupport?: { readonly [extensionId: string]: ExtensionVirtualWorkspaceSupport };
	readonly extensionProperties: IStringDictionary<{
		readonly hasPrereleaseVersion?: boolean;
		readonly excludeVersionRange?: string;
	}>;
	readonly extensionsForceVersionByQuality?: readonly string[];
	readonly builtInExtensionsEnabledWithAutoUpdates: readonly string[];
	readonly sessionsWindowAllowedExtensions?: readonly string[];

	readonly msftInternalDomains?: string[];
	readonly linkProtectionTrustedDomains?: readonly string[];

	readonly authClientIdMetadataUrl?: string;

	readonly 'configurationSync.store'?: ConfigurationSyncStore;

	readonly 'editSessions.store'?: Omit<ConfigurationSyncStore, 'insidersUrl' | 'stableUrl'>;
	readonly darwinUniversalAssetId?: string;
	readonly darwinBundleIdentifier?: string;
	readonly profileTemplatesUrl?: string;

	readonly commonlyUsedSettings?: string[];
	readonly aiGeneratedWorkspaceTrust?: IAiGeneratedWorkspaceTrust;

	readonly defaultChatAgent: IDefaultChatAgent;
	readonly chatParticipantRegistry?: string;
	readonly chatSessionRecommendations?: IChatSessionRecommendation[];
	readonly emergencyAlertUrl?: string;
	readonly voiceWsUrl?: string;

	readonly remoteDefaultExtensionsIfInstalledLocally?: string[];

	/**
	 * Maps an extension-contributed setting key to either a full enterprise {@link IPolicy}
	 * (the setting owns/"parents" the policy — the original syntax) or an
	 * {@link IExtensionConfigurationPolicyReference} (`{ policyReference: { name } }`), attaching the
	 * setting to a policy owned by an in-code setting. References let a `product.json`-provided
	 * setting be governed by a policy whose `value` callback — which JSON cannot carry — lives in code.
	 */
	readonly extensionConfigurationPolicy?: IStringDictionary<IPolicy | IExtensionConfigurationPolicyReference>;

	readonly onboardingKeymaps?: readonly IProductOnboardingKeymap[];
	readonly onboardingThemes?: readonly IProductOnboardingTheme[];

	/**
	 * When running as an embedded app, the parent VS Code's policy
	 * identity (win32RegValueName / darwinBundleIdentifier) so that
	 * enterprise policies deployed to the parent also apply here.
	 */
	parentPolicyConfig?: {
		win32RegValueName?: string;
		darwinBundleIdentifier?: string;
		urlProtocol?: string;
	};
}

export interface IProductOnboardingKeymap {
	readonly id: string;
	readonly label: string;
	readonly extensionId?: string;
	readonly description: string;
}

export interface IProductOnboardingTheme {
	readonly id: string;
	readonly label: string;
	readonly themeId: string;
	readonly type: 'dark' | 'light' | 'hcDark' | 'hcLight';
}

export interface ITunnelApplicationConfig {
	authenticationProviders: IStringDictionary<{ scopes: string[] }>;
	editorWebUrl: string;
	extension: IRemoteExtensionTip;
}

export interface IExtensionRecommendations {
	readonly onFileOpen: IFileOpenCondition[];
	readonly onSettingsEditorOpen?: ISettingsEditorOpenCondition;
}

export interface ISettingsEditorOpenCondition {
	readonly prerelease?: boolean | string;
	readonly descriptionOverride?: string;
}

export interface IExtensionRecommendationCondition {
	readonly important?: boolean;
	readonly whenInstalled?: string[];
	readonly whenNotInstalled?: string[];
}

export type IFileOpenCondition = IFileLanguageCondition | IFilePathCondition | IFileContentCondition;

export interface IFileLanguageCondition extends IExtensionRecommendationCondition {
	readonly languages: string[];
}

export interface IFilePathCondition extends IExtensionRecommendationCondition {
	readonly pathGlob: string;
}

export type IFileContentCondition = (IFileLanguageCondition | IFilePathCondition) & { readonly contentPattern: string };

export interface IAppCenterConfiguration {
	readonly 'win32-x64': string;
	readonly 'win32-arm64': string;
	readonly 'linux-x64': string;
	readonly 'darwin': string;
	readonly 'darwin-universal': string;
	readonly 'darwin-arm64': string;
}

export interface IConfigBasedExtensionTip {
	configPath: string;
	configName: string;
	configScheme?: string;
	recommendations: IStringDictionary<{
		name: string;
		contentPattern?: string;
		important?: boolean;
		isExtensionPack?: boolean;
		whenNotInstalled?: string[];
	}>;
}

export interface IExeBasedExtensionTip {
	friendlyName: string;
	windowsPath?: string;
	important?: boolean;
	recommendations: IStringDictionary<{ name: string; important?: boolean; isExtensionPack?: boolean; whenNotInstalled?: string[] }>;
}

export interface IRemoteExtensionTip {
	friendlyName: string;
	extensionId: string;
	supportedPlatforms?: PlatformName[];
	startEntry?: {
		helpLink: string;
		startConnectLabel: string;
		startCommand: string;
		priority: number;
	};
}

export interface IVirtualWorkspaceExtensionTip {
	friendlyName: string;
	extensionId: string;
	supportedPlatforms?: PlatformName[];
	startEntry: {
		helpLink: string;
		startConnectLabel: string;
		startCommand: string;
		priority: number;
	};
}

export interface ISurveyData {
	surveyId: string;
	surveyUrl: string;
	languageId: string;
	editCount: number;
	userProbability: number;
}

export interface IAiGeneratedWorkspaceTrust {
	readonly title: string;
	readonly checkboxText: string;
	readonly trustOption: string;
	readonly dontTrustOption: string;
	readonly startupTrustRequestLearnMore: string;
}

export interface IDefaultChatAgent {
	readonly extensionId: string;
	readonly chatExtensionId: string;

	readonly chatExtensionOutputId: string;
	readonly chatExtensionOutputExtensionStateCommand: string;

	readonly documentationUrl: string;
	readonly skusDocumentationUrl: string;
	readonly optimizeUsageDocumentationUrl: string;
	readonly publicCodeMatchesUrl: string;
	readonly managePlanUrl: string;
	readonly upgradePlanUrl: string;
	readonly signUpUrl: string;
	readonly termsStatementUrl: string;
	readonly privacyStatementUrl: string;

	readonly provider: {
		default: { id: string; name: string };
		enterprise: { id: string; name: string };
		google: { id: string; name: string };
		apple: { id: string; name: string };
		microsoft: { id: string; name: string };
	};

	readonly providerExtensionId: string;
	readonly providerUriSetting: string;
	readonly providerScopes: string[][];

	readonly entitlementUrl: string;
	readonly entitlementSignupLimitedUrl: string;
	readonly tokenEntitlementUrl: string;
	readonly mcpRegistryDataUrl: string;
	readonly managedSettingsUrl: string;

	readonly chatQuotaExceededContext: string;
	readonly completionsQuotaExceededContext: string;

	readonly walkthroughCommand: string;
	readonly completionsMenuCommand: string;
	readonly chatRefreshTokenCommand: string;
	readonly generateCommitMessageCommand: string;
	readonly resolveMergeConflictsCommand: string;

	readonly completionsAdvancedSetting: string;
	readonly completionsEnablementSetting: string;
	readonly nextEditSuggestionsSetting: string;
}

---

[FETCH RESULT]
=== try vscode-dts path variants ===
-- src/vscode-dts
{"message":"API rate limit exceeded for 49.43.223.215. (But here's the good news: Authenticated requests get a higher rate limit. Check out the documentation for more details.)","documentation_url":"https://docs.github.com/rest/overview/resources-in-the-rest-api#rate-limiting"}

-- src/vs/vscode-dts
{"message":"API rate limit exceeded for 49.43.223.215. (But here's the good news: Authenticated requests get a higher rate limit. Check out the documentation for more details.)","documentation_url":"https://docs.github.com/rest/overview/resources-in-the-rest-api#rate-limiting"}

-- extensions/vscode-api-tests
{"message":"API rate limit exceeded for 49.43.223.215. (But here's the good news: Authenticated requests get a higher rate limit. Check out the documentation for more details.)","documentation_url":"https://docs.github.com/rest/overview/resources-in-the-rest-api#rate-limiting"}

---

[FETCH RESULT]
/usr/bin/bash: line 1: gh: command not found
---
/usr/bin/bash: line 1: gh: command not found

---

[FETCH RESULT]
545 eap.ts
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

=== proposal names ===
	activeComment 	agentEditorComments 	agentSessionsWorkspace 	agentsWindowConfiguration 	aiRelatedInformation 	aiSettingsSearch 	aiTextSearchProvider 	authIssuers 	authLearnMore 	authProviderSpecific 	authSession 	authSessionAccountIcon 	authSessionAudience 	authenticationChallenges 	browser 	canonicalUriProvider 	chatContextProvider 	chatDebug 	chatHooks 	chatInputNotification 	chatOutputRenderer 	chatParticipantAdditions 	chatParticipantPrivate 	chatPromptFiles 	chatProvider 	chatReferenceBinaryData 	chatReferenceDiagnostic 	chatSessionCustomizationProvider 	chatSessionsProvider 	chatStatusItem 	chatTab 	codeActionAI 	codeActionRanges 	codiconDecoration 	commentReactor 	commentReveal 	commentThreadApplicability 	commentingRangeHint 	commentsDraftState 	contribAccessibilityHelpContent 	contribChatEditorInlineGutterMenu 	contribCommentEditorActionsMenu 	contribCommentPeekContext 	contribCommentThreadAdditionalMenu 	contribCommentsViewThreadMenus 	contribDebugCreateConfiguration 	contribDiffEditorGutterToolBarMenus 	contribEditSessions 	contribEditorContentMenu 	contribLabelFormatterWorkspaceTooltip 	contribLanguageModelToolSets 	contribMenuBarHome 	contribMergeEditorMenus 	contribMultiDiffEditorMenus 	contribNotebookStaticPreloads 	contribRemoteHelp 	contribShareMenu 	contribSourceControlArtifactGroupMenu 	contribSourceControlArtifactMenu 	contribSourceControlHistoryItemMenu 	contribSourceControlHistoryTitleMenu 	contribSourceControlInputBoxMenu 	contribSourceControlTitleMenu 	contribStatusBarItems 	contribViewContainerTitle 	contribViewsRemote 	contribViewsWelcome 	css 	customEditorDiffs 	customEditorMove 	dataChannels 	debugVisualization 	defaultChatParticipant 	devDeviceId 	diffCommand 	diffContentOptions 	documentDiff 	documentFiltersExclusive 	documentSyntaxHighlighting 	editSessionIdentityProvider 	editorHoverVerbosityLevel 	editorInsets 	embeddings 	envIsConnectionMetered 	environmentPower 	extensionAffinity 	extensionRuntime 	extensionsAny 	externalUriOpener 	fileSearchProvider 	fileSearchProvider2 	findFiles2 	findTextInFiles 	findTextInFiles2 	fsChunks 	inlineCompletionsAdditions 	interactive 	interactiveWindow 	ipc 	languageModelCapabilities 	languageModelPricing 	languageModelProxy 	languageModelSystem 	languageModelThinkingPart 	languageModelToolResultAudience 	languageModelToolSupportsModel 	languageStatusText 	linkPresentation 	mappedEditsProvider 	markdownAlertSyntax 	mcpServerDefinitions 	mcpToolDefinitions 	multiDocumentHighlightProvider 	nativeWindowHandle 	newSymbolNamesProvider 	notebookCellExecution 	notebookControllerAffinityHidden 	notebookDeprecated 	notebookExecution 	notebookKernelSource 	notebookLiveShare 	notebookMessaging 	notebookMime 	notebookReplDocument 	notebookVariableProvider 	portsAttributes 	profileContentHandlers 	quickDiffProvider 	quickPickItemTooltip 	quickPickSortByLabel 	remoteCodingAgents 	resolvers 	scmActionButton 	scmArtifactProvider 	scmHistoryProvider 	scmMultiDiffEditor 	scmProviderOptions 	scmSelectedProvider 	scmTextDocument 	scmValidation 	shareProvider 	speech 	statusBarItemTooltip 	tabInputMultiDiff 	tabInputTextMerge 	taskExecutionTerminal 	taskPresentationGroup 	taskProblemMatcherStatus 	taskRunOptions 	telemetry 	terminalCompletionProvider 	terminalDataWriteEvent 	terminalDimensions 	terminalExecuteCommandEvent 	terminalQuickFixProvider 	terminalRemoteResolver 	terminalSelection 	terminalShellEnv 	terminalTitle 	testObserver 	testRelatedCode 	textDocumentChangeReason 	textEditorDiffInformation 	textSearchComplete2 	textSearchProvider 	textSearchProvider2 	timeline 	tokenInformation 	toolInvocationApproveCombination 	toolProgress 	treeItemMarkdownLabel 	treeViewActiveItem 	treeViewMarkdownMessage 	treeViewReveal 	tunnelFactory 	tunnels 	valueSelectionInQuickPick 	workspaceTrust

---

[FETCH RESULT]
########## extensionsProposedApi.ts ##########
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { isNonEmptyArray } from '../../../../base/common/arrays.js';
import { localize } from '../../../../nls.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { ExtensionIdentifier, IExtensionDescription, IExtensionManifest } from '../../../../platform/extensions/common/extensions.js';
import { allApiProposals, ApiProposalName } from '../../../../platform/extensions/common/extensionsApiProposals.js';
import { SyncDescriptor } from '../../../../platform/instantiation/common/descriptors.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.js';
import { Extensions, IExtensionFeatureMarkdownRenderer, IExtensionFeaturesRegistry, IRenderedData } from '../../extensionManagement/common/extensionFeatures.js';
import { IMarkdownString, MarkdownString } from '../../../../base/common/htmlContent.js';
import { Mutable } from '../../../../base/common/types.js';

export class ExtensionsProposedApi {

	private readonly _envEnablesProposedApiForAll: boolean;
	private readonly _envEnabledExtensions: Set<string>;
	private readonly _productEnabledExtensions: Map<string, string[]>;

	constructor(
		@ILogService private readonly _logService: ILogService,
		@IWorkbenchEnvironmentService private readonly _environmentService: IWorkbenchEnvironmentService,
		@IProductService productService: IProductService
	) {

		this._envEnabledExtensions = new Set((_environmentService.extensionEnabledProposedApi ?? []).map(id => ExtensionIdentifier.toKey(id)));

		this._envEnablesProposedApiForAll =
			!_environmentService.isBuilt || // always allow proposed API when running out of sources
			(_environmentService.isExtensionDevelopment && productService.quality !== 'stable') || // do not allow proposed API against stable builds when developing an extension
			(this._envEnabledExtensions.size === 0 && Array.isArray(_environmentService.extensionEnabledProposedApi)); // always allow proposed API if --enable-proposed-api is provided without extension ID

		this._productEnabledExtensions = new Map<string, ApiProposalName[]>();


		// NEW world - product.json spells out what proposals each extension can use
		if (productService.extensionEnabledApiProposals) {
			for (const [k, value] of Object.entries(productService.extensionEnabledApiProposals)) {
				const key = ExtensionIdentifier.toKey(k);
				const proposalNames = value.filter(name => {
					if (!allApiProposals[<ApiProposalName>name]) {
						_logService.warn(`Via 'product.json#extensionEnabledApiProposals' extension '${key}' wants API proposal '${name}' but that proposal DOES NOT EXIST. Likely, the proposal has been finalized (check 'vscode.d.ts') or was abandoned.`);
						return false;
					}
					return true;
				});
				this._productEnabledExtensions.set(key, proposalNames);
			}
		}
	}

	updateEnabledApiProposals(extensions: IExtensionDescription[]): void {
		for (const extension of extensions) {
			this.doUpdateEnabledApiProposals(extension);
		}
	}

	private doUpdateEnabledApiProposals(extension: Mutable<IExtensionDescription>): void {

		const key = ExtensionIdentifier.toKey(extension.identifier);

		// warn about invalid proposal and remove them from the list
		if (isNonEmptyArray(extension.enabledApiProposals)) {
			extension.enabledApiProposals = extension.enabledApiProposals.filter(name => {
				const result = Boolean(allApiProposals[<ApiProposalName>name]);
				if (!result) {
					this._logService.error(`Extension '${key}' wants API proposal '${name}' but that proposal DOES NOT EXIST. Likely, the proposal has been finalized (check 'vscode.d.ts') or was abandoned.`);
				}
				return result;
			});
		}


		if (this._productEnabledExtensions.has(key)) {
			// NOTE that proposals that are listed in product.json override whatever is declared in the extension
			// itself. This is needed for us to know what proposals are used "in the wild". Merging product.json-proposals
			// and extension-proposals would break that.

			const productEnabledProposals = this._productEnabledExtensions.get(key)!;

			// check for difference between product.json-declaration and package.json-declaration
			const productSet = new Set(productEnabledProposals);
			const extensionSet = new Set(extension.enabledApiProposals);
			const diff = new Set([...extensionSet].filter(a => !productSet.has(a)));
			if (diff.size > 0) {
				this._logService.error(`Extension '${key}' appears in product.json but enables LESS API proposals than the extension wants.\npackage.json (LOSES): ${[...extensionSet].join('\n')}\nproduct.json (WINS): ${[...productSet].join('\n')}\nDELTA: ${[...diff].join('\n')}`);

				if (this._environmentService.isExtensionDevelopment) {
					this._logService.error(`Proceeding with EXTRA proposals (${[...diff].join(', ')}) because extension is in development mode. Still, this EXTENSION WILL BE BROKEN unless product.json is updated.`);
					productEnabledProposals.push(...diff);
				}
			}

			extension.enabledApiProposals = productEnabledProposals;
			return;
		}

		if (this._envEnablesProposedApiForAll || this._envEnabledExtensions.has(key)) {
			// proposed API usage is not restricted and allowed just like the extension
			// has declared it
			return;
		}

		if (!extension.isBuiltin && isNonEmptyArray(extension.enabledApiProposals)) {
			// restrictive: extension cannot use proposed API in this context and its declaration is nulled
			this._logService.error(`Extension '${extension.identifier.value} CANNOT USE these API proposals '${extension.enabledApiProposals?.join(', ') || '*'}'. You MUST start in extension development mode or use the --enable-proposed-api command line flag`);
			extension.enabledApiProposals = [];
		}
	}
}

class ApiProposalsMarkdowneRenderer extends Disposable implements IExtensionFeatureMarkdownRenderer {

	readonly type = 'markdown';

	shouldRender(manifest: IExtensionManifest): boolean {
		return !!manifest.originalEnabledApiProposals?.length || !!manifest.enabledApiProposals?.length;
	}

	render(manifest: IExtensionManifest): IRenderedData<IMarkdownString> {
		const enabledApiProposals = manifest.originalEnabledApiProposals ?? manifest.enabledApiProposals ?? [];
		const data = new MarkdownString();
		if (enabledApiProposals.length) {
			for (const proposal of enabledApiProposals) {
				data.appendMarkdown(`- \`${proposal}\`\n`);
			}
		}
		return {
			data,
			dispose: () => { }
		};
	}
}

Registry.as<IExtensionFeaturesRegistry>(Extensions.ExtensionFeaturesRegistry).registerExtensionFeature({
	id: 'enabledApiProposals',
	label: localize('enabledProposedAPIs', "API Proposals"),
	access: {
		canToggle: false
	},
	renderer: new SyncDescriptor(ApiProposalsMarkdowneRenderer),
});

---

[FETCH RESULT]
name code-oss-dev version 1.137.0
engines None
electronVersion None
distro 5c03086397d13f66eb8c46dc97043a91d9e97c9f
  dev @playwright/cli ^0.1.9
  dev @playwright/test ^1.61.1
  dev @types/gulp-svgmin ^1.2.1
  dev @typescript-eslint/utils 8.66.0
  dev @typescript/native npm:typescript@^7.0.2
  dev @vscode/gulp-electron ^1.43.0
  dev @vscode/test-electron ^2.4.0
  dev gulp ^4.0.0
  dev gulp-azure-storage ^0.12.1
  dev gulp-bom ^3.0.0
  dev gulp-buffer 0.0.2
  dev gulp-filter ^5.1.0
  dev gulp-flatmap ^1.0.2
  dev gulp-gunzip ^1.0.0
  dev gulp-gzip ^1.4.2
  dev gulp-json-editor ^2.5.0
  dev gulp-plumber ^1.2.0
  dev gulp-rename ^1.2.0
  dev gulp-replace ^0.5.4
  dev gulp-sourcemaps ^3.0.0
  dev gulp-svgmin ^4.1.0
  dev typescript npm:@typescript/typescript6@^6.0.2
  dev typescript-eslint 8.66.0
--- scripts of interest ---
  test-build-scripts = cd build && npm run test
  markdown-editor-package-json-check = npm --prefix extensions/markdown-language-features run check-markdown-editor-package-json
  compile = npm-run-all2 -lp compile-client compile-copilot
  compile-client = npm run gulp compile
  compile-copilot = npm --prefix extensions/copilot run compile
  build-fast = node build/next/index.ts build-fast
  build-fast-extensions = npm run gulp copy-codicons compile-extensions compile-extension-media
  watch = npm-run-all2 -lp watch-client-transpile watch-client watch-extensions watch-copilot
  watch-transpile = npm-run-all2 -lp watch-client-transpile watch-extensions watch-copilot
  watchd = deemon npm run watch
  watch-webd = deemon npm run watch-web
  kill-watchd = deemon --kill npm run watch
  kill-watch-webd = deemon --kill npm run watch-web
  restart-watchd = deemon --restart npm run watch
  restart-watch-webd = deemon --restart npm run watch-web
  watch-client = npm run gulp watch-client
  watch-clientd = deemon npm run watch-client
  kill-watch-clientd = deemon --kill npm run watch-client
  watch-client-transpile = node build/next/index.ts transpile --watch
  watch-client-transpiled = deemon npm run watch-client-transpile
  kill-watch-client-transpiled = deemon --kill npm run watch-client-transpile
  watch-extensions = npm run gulp watch-extensions watch-extension-media
  watch-extensionsd = deemon npm run watch-extensions
  kill-watch-extensionsd = deemon --kill npm run watch-extensions
  watch-copilot = npm --prefix extensions/copilot run watch
  watch-copilotd = deemon npm run watch-copilot
  kill-watch-copilotd = deemon --kill npm run watch-copilot
  gulp = node --experimental-strip-types --max-old-space-size=8192 ./node_modules/gulp/bin/gulp.js
  electron = node build/lib/electron.ts
  smoketest-no-compile = cd test/smoke && node test/index.js
  monaco-compile-check = tsc --project src/tsconfig.monaco.json --noEmit
  tsec-compile-check = node --max-old-space-size=8192 node_modules/tsec/bin/tsec -p src/tsconfig.tsec.json
  vscode-dts-compile-check = tsc --project src/tsconfig.vscode-dts.json && tsc --project src/tsconfig.vscode-proposed-dts.json
  compile-cli = npm run gulp compile-cli
  compile-web = npm run gulp compile-web
  watch-web = npm run gulp watch-web
  watch-cli = npm run gulp watch-cli
  compile-build = npm run gulp compile-build-with-mangling
  compile-extensions-build = npm run gulp compile-extensions-build
  update-build-ts-version = npm install -D typescript@npm:@typescript/typescript6@^6.0.2 && npm install -D @typescript/native@npm:typescript@next && (cd build && npm run typecheck)

---

[FETCH RESULT]
=== .npmrc ===
disturl="https://electronjs.org/headers"
target="42.10.0"
ms_build_id="15109253"
runtime="electron"
ignore-scripts=false
build_from_source="true"
legacy-peer-deps="true"
timeout=180000

=== .nvmrc ===
24.18.0

=== VSCodium npmrc ===
build_from_source="true"
legacy-peer-deps="true"
timeout=180000

=== VSCodium .nvmrc ===
24.15.0

---

[FETCH RESULT]
########## build/mixin.ts ##########
404: Not Found
[HTTP 404]
########## build/mixin.js ##########
404: Not Found
[HTTP 404]
########## build/npm/preinstall.ts ##########
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import path from 'path';
import * as fs from 'fs';
import * as child_process from 'child_process';
import * as os from 'os';
import { isUpToDate, forceInstallMessage } from './installStateHash.ts';

if (!process.env['VSCODE_SKIP_NODE_VERSION_CHECK']) {
	// Get the running Node.js version
	const nodeVersion = /^(\d+)\.(\d+)\.(\d+)/.exec(process.versions.node);
	const majorNodeVersion = parseInt(nodeVersion![1]);
	const minorNodeVersion = parseInt(nodeVersion![2]);
	const patchNodeVersion = parseInt(nodeVersion![3]);

	// Get the required Node.js version from .nvmrc
	const nvmrcPath = path.join(import.meta.dirname, '..', '..', '.nvmrc');
	const requiredVersion = fs.readFileSync(nvmrcPath, 'utf8').trim();
	const requiredVersionMatch = /^(\d+)\.(\d+)\.(\d+)/.exec(requiredVersion);

	if (!requiredVersionMatch) {
		console.error('\x1b[1;31m*** Unable to parse required Node.js version from .nvmrc\x1b[0;0m');
		throw new Error();
	}

	const requiredMajor = parseInt(requiredVersionMatch[1]);
	const requiredMinor = parseInt(requiredVersionMatch[2]);
	const requiredPatch = parseInt(requiredVersionMatch[3]);

	if (majorNodeVersion !== requiredMajor ||
		minorNodeVersion < requiredMinor ||
		(minorNodeVersion === requiredMinor && patchNodeVersion < requiredPatch)) {
		console.error(`\x1b[1;31m*** Please use Node.js v${requiredVersion} or newer with the same major version (${requiredMajor}) as specified in .nvmrc. Currently using v${process.versions.node}.\x1b[0;0m`);
		throw new Error();
	}
}

if (process.env.npm_execpath?.includes('yarn')) {
	console.error('\x1b[1;31m*** Seems like you are using `yarn` which is not supported in this repo any more, please use `npm i` instead. ***\x1b[0;0m');
	throw new Error();
}

const npmUserAgent = process.env.npm_config_user_agent;
const npmVersionMatch = npmUserAgent?.match(/npm\/(\d+)\.(\d+)\.(\d+)/);
if (npmVersionMatch) {
	const npmMajor = parseInt(npmVersionMatch[1]);
	if (npmMajor >= 13) {
		console.error(`\x1b[1;31m*** Please use npm version < 13.0.0. Currently using v${npmUserAgent}.\x1b[0;0m`);
		throw new Error();
	}
}

// Fast path: if nothing changed since last successful install, skip everything.
// This makes `npm i` near-instant when dependencies haven't changed.
if (!process.env['VSCODE_FORCE_INSTALL'] && isUpToDate()) {
	console.log(`\x1b[32mAll dependencies up to date.\x1b[0m ${forceInstallMessage}`);
	process.exit(0);
}
########## build/gulpfile.vscode.js ##########
404: Not Found
[HTTP 404]

---

[FETCH RESULT]
### Q1 marketplace tos in-scope

### Q2 vscode issue marketplace fork

### Q3 azure trusted signing price

---

[FETCH RESULT]
202
14277 r1.html
http://www.w3.org/TR/html4/loose.dtd

---

[FETCH RESULT]
== https://marketplace.visualstudio.com/terms
404 -> https://marketplace.visualstudio.com/terms
== https://aka.ms/vsmarketplace-ToU
200 -> https://cdn.vsassets.io/v/M264_20251020.18/_content/Microsoft-Visual-Studio-Marketplace-Terms-of-Use.pdf
== https://cdn.vsassets.io/v/M255_20250515.1/_content/Microsoft-Visual-Studio-Marketplace-Terms-of-Use.pdf
404 -> https://cdn.vsassets.io/v/M255_20250515.1/_content/Microsoft-Visual-Studio-Marketplace-Terms-of-Use.pdf
== https://www.microsoft.com/en-us/legal/terms-of-use
200 -> https://www.microsoft.com/en-us/legal/terms-of-use

---

Failed to authenticate. API Error: 403 pre-consume quota failed, user quota: ＄0.316856, need quota: ＄0.457320 (request id: 20260901130922707995553t8hrsNrUjUUPI)