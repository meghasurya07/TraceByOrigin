/**
 * Browser.
 *
 * One job: look at the dev server the agent just started. Not a browser in any real sense
 * — no history, no tabs, no devtools — because the moment it grows those it is competing
 * with the browser the user already has open on the other half of the screen, and losing.
 *
 * The preview is an `<iframe sandbox>`, which is why `frame-src http: https:` is in the
 * CSP and nothing else is. Two consequences the UI has to be honest about: a site that
 * sends `X-Frame-Options: DENY` will simply stay blank and cannot tell us it refused, and
 * an iframe's navigation history is not readable cross-origin, so there is no Back button
 * to offer. The escape hatch for both is the button that opens the URL in the real
 * browser.
 *
 * `allow-same-origin` is in the sandbox list because a dev server without its own
 * `localStorage` is not a useful preview. It grants the framed page its own origin, not
 * ours — the only document that could reach `window.trace` through it is one served from
 * the renderer's own origin, which in a packaged build is `file://` and can never be an
 * `http:` frame.
 *
 * Copyright (c) 2026 Origin AI
 */

import { useEffect, useState } from "react";
import { ExternalLink, Globe } from "lucide-react";

import { bridge } from "../../lib/bridge";
import { PANEL_BUTTON, PANEL_INPUT, PanelBar, PanelMessage, RefreshButton } from "./shell";

/**
 * A bare host that means the machine this is running on.
 *
 * Worth special-casing: `localhost:3000` is the single most typed string in this panel,
 * and defaulting it to `https://` — correct for everything else — would fail on every dev
 * server that has not bothered with a certificate, which is nearly all of them.
 */
const LOCAL = /^(localhost|127\.\d+\.\d+\.\d+|\[::1\])(:\d+)?(\/|$)/i;

const HAS_SCHEME = /^[a-z][a-z0-9+.-]*:\/\//i;

/** The absolute http(s) URL a typed string means, or null if it means nothing loadable. */
function toUrl(input: string): string | null {
  const trimmed = input.trim();
  if (trimmed === "") return null;
  const candidate = HAS_SCHEME.test(trimmed)
    ? trimmed
    : `${LOCAL.test(trimmed) ? "http" : "https"}://${trimmed}`;
  try {
    const parsed = new URL(candidate);
    // The CSP would refuse anything else anyway; failing here means the input keeps the
    // text the user typed instead of the frame silently staying blank.
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.href : null;
  } catch {
    return null;
  }
}

export function BrowserPanel(props: { openRef: string | undefined }): React.JSX.Element {
  const [draft, setDraft] = useState("");
  const [url, setUrl] = useState<string | null>(null);
  const [rejected, setRejected] = useState(false);
  // Bumped to remount the frame. `iframe.contentWindow.location.reload()` is a
  // cross-origin call the browser refuses, so a new element is the only reload available.
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (props.openRef === undefined) return;
    const next = toUrl(props.openRef);
    setDraft(props.openRef);
    setRejected(next === null);
    setUrl(next);
  }, [props.openRef]);

  const commit = (): void => {
    const next = toUrl(draft);
    setRejected(next === null && draft.trim() !== "");
    if (next !== null) {
      setDraft(next);
      setUrl(next);
      setNonce((value) => value + 1);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <PanelBar>
        <Globe size={11} className="shrink-0 text-fg-subtle" />
        <input
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
            setRejected(false);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commit();
            }
          }}
          spellCheck={false}
          placeholder="localhost:3000"
          aria-label="Address"
          aria-invalid={rejected}
          className={`${PANEL_INPUT} flex-1`}
        />
        <RefreshButton
          busy={false}
          onClick={() => {
            if (url === null) commit();
            else setNonce((value) => value + 1);
          }}
        />
        <button
          type="button"
          className={PANEL_BUTTON}
          title="Open in your browser"
          disabled={url === null}
          onClick={() => {
            if (url !== null) void bridge.openExternal(url);
          }}
        >
          <ExternalLink size={11} />
        </button>
      </PanelBar>

      {url === null ? (
        <PanelMessage
          Icon={Globe}
          title={rejected ? "That is not a web address" : "Nothing loaded"}
          detail={
            rejected
              ? "Only http and https can be previewed here."
              : "Type an address above and press Enter. A site that refuses to be framed stays blank — the ↗ button opens it in your real browser instead."
          }
        />
      ) : (
        <iframe
          key={`${url}#${String(nonce)}`}
          src={url}
          title="Preview"
          referrerPolicy="no-referrer"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          className="min-h-0 flex-1 border-0 bg-white"
        />
      )}
    </div>
  );
}
