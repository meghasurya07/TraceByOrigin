/**
 * The prompt bar.
 *
 * A textarea and four controls, and almost all of the design is in what happens when a
 * turn is already running. Two options existed: disable the input until the agent
 * finishes, or accept the text and route it as steering. Disabling is wrong — the moment
 * a user most wants to type is the moment they see the agent heading somewhere they did
 * not intend, and making them wait for a wrong answer to finish before they can say "no,
 * not that file" is the single most frustrating thing an agent UI can do. So the input
 * stays live, and while a turn is in flight Enter sends `session/steer` instead of
 * `session/prompt`. The hint line under the bar says which one is about to happen.
 *
 * `Escape` interrupts — unless the `@`/`/` menu is open, in which case it dismisses that
 * first. The menu sees every key before this component does, for the same reason: ↓ inside
 * an open menu moves a highlight, and ↓ with no menu moves the caret, and exactly one place
 * gets to decide which happened.
 *
 * Nothing here is auto-focused on mount. Focus arrives via the `trace:focus-prompt`
 * event, which the store dispatches for the menu command and after creating a session —
 * i.e. only ever as a result of something the user did.
 *
 * Copyright (c) 2026 Origin AI
 */

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowUp, FolderPlus, Square } from "lucide-react";

import type { Attachment } from "@trace/protocol";

import { bridge } from "../lib/bridge";
import { cn } from "../lib/cn";
import { applyTrigger } from "../lib/trigger";
import { useStore } from "../store";
import { AttachmentTray } from "./prompt/AttachmentTray";
import { ModelPicker } from "./prompt/ModelPicker";
import { ModePicker } from "./prompt/ModePicker";
import { TRIGGER_MENU_ID, TriggerMenu, triggerRowId } from "./prompt/TriggerMenu";
import { useTriggerMenu, type TriggerPick } from "./prompt/useTriggerMenu";

/** Tallest the textarea grows before it scrolls, in px. Roughly twelve lines. */
const MAX_HEIGHT = 280;

export function PromptBar(): React.JSX.Element {
  const live = useStore((state) =>
    state.activeSessionId === null ? null : (state.views[state.activeSessionId]?.live ?? null),
  );
  const sending = useStore((state) => state.host.sending);
  const sendPrompt = useStore((state) => state.sendPrompt);
  const steer = useStore((state) => state.steer);
  const interrupt = useStore((state) => state.interrupt);

  const [text, setText] = useState("");
  const [caret, setCaret] = useState(0);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  /**
   * A caret position to force back into the DOM after a pick.
   *
   * Assigning `value` on a textarea collapses the selection to the end of the text, which
   * after splicing a command body into the middle of a prompt is wrong by however much
   * followed it. A fresh object every time, so two picks that land on the same index still
   * re-run the effect.
   */
  const [restore, setRestore] = useState<{ at: number } | null>(null);
  const area = useRef<HTMLTextAreaElement>(null);

  // Grow to fit, then scroll. Assigning `auto` first is what lets it shrink again when
  // the user deletes a line — `scrollHeight` never reports less than the current height.
  useLayoutEffect(() => {
    const node = area.current;
    if (node === null) return;
    node.style.height = "auto";
    node.style.height = `${String(Math.min(node.scrollHeight, MAX_HEIGHT))}px`;
  }, [text]);

  useEffect(() => {
    const onFocusPrompt = (): void => {
      area.current?.focus();
    };
    window.addEventListener("trace:focus-prompt", onFocusPrompt);
    return () => {
      window.removeEventListener("trace:focus-prompt", onFocusPrompt);
    };
  }, []);

  const onPick = (pick: TriggerPick): void => {
    const next = applyTrigger(text, pick.trigger, pick.insertion);
    setText(next.text);
    setCaret(next.caret);
    setRestore({ at: next.caret });

    const added = pick.attachment;
    if (added !== undefined) {
      setAttachments((previous) =>
        previous.some(
          (item) => "path" in item && item.type === added.type && item.path === added.path,
        )
          ? previous
          : [...previous, added],
      );
    }
    pick.run?.();
  };

  const menu = useTriggerMenu({ text, caret, onPick });

  useLayoutEffect(() => {
    if (restore === null) return;
    const node = area.current;
    if (node === null) return;
    node.focus();
    node.setSelectionRange(restore.at, restore.at);
  }, [restore]);

  const turning = live !== null;
  const stoppable = live !== null && !live.interruptRequested;
  const canSend = (text.trim() !== "" || attachments.length > 0) && !sending;

  const submit = (): void => {
    if (!canSend) return;
    const body = text;
    const files = attachments;
    // Cleared before the await lands: the message is the user's, and leaving it in the
    // box while the request is in flight makes a slow network look like a dropped key.
    setText("");
    setCaret(0);
    setAttachments([]);

    if (turning) {
      void steer(body);
      return;
    }
    void sendPrompt({
      text: body,
      ...(files.length === 0 ? {} : { attachments: files }),
    });
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    // First refusal. Enter commits a row, Escape closes the menu rather than the turn.
    if (menu.handleKeyDown(event)) return;
    // `isComposing` guards IME input: mid-composition Enter commits the candidate and
    // must not also send the message.
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
      return;
    }
    if (event.key === "Escape" && stoppable) {
      event.preventDefault();
      void interrupt();
    }
  };

  /**
   * Pasted images become attachments.
   *
   * Only images: a pasted file of any other kind arrives without a path in a sandboxed
   * renderer, so there is nothing the engine could be told to read. Pasting a path as
   * text still works, and the agent can open it.
   */
  const onPaste = (event: React.ClipboardEvent<HTMLTextAreaElement>): void => {
    const images = [...event.clipboardData.items].filter(
      (item) => item.kind === "file" && item.type.startsWith("image/"),
    );
    if (images.length === 0) return;
    event.preventDefault();

    for (const item of images) {
      const file = item.getAsFile();
      if (file === null) continue;
      const mediaType = file.type;
      void file.arrayBuffer().then((buffer) => {
        setAttachments((previous) => [
          ...previous,
          { type: "image", mediaType, data: toBase64(buffer) },
        ]);
      });
    }
  };

  const attachFolder = (): void => {
    void bridge.pickDirectory({ title: "Attach a folder" }).then((path) => {
      if (path === null) return;
      setAttachments((previous) =>
        previous.some((item) => item.type === "directory" && item.path === path)
          ? previous
          : [...previous, { type: "directory", path }],
      );
    });
  };

  return (
    <div className="shrink-0 border-t border-line bg-surface px-4 py-2">
      <div className="relative mx-auto w-full max-w-3xl">
        <TriggerMenu menu={menu} />

        {attachments.length === 0 ? null : (
          <AttachmentTray
            attachments={attachments}
            onRemove={(index) => {
              setAttachments((previous) => previous.filter((_, i) => i !== index));
            }}
          />
        )}

        <div
          className={cn(
            "rounded-lg border bg-surface-raised transition-colors focus-within:border-accent",
            turning ? "border-accent/40" : "border-line-strong",
          )}
        >
          <textarea
            ref={area}
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setCaret(event.target.selectionStart);
            }}
            // Fires for caret movement as well as selection, which is what the menu needs:
            // arrowing back into an `@foo` token has to reopen it.
            onSelect={(event) => {
              setCaret(event.currentTarget.selectionStart);
            }}
            onBlur={menu.dismiss}
            onKeyDown={onKeyDown}
            onPaste={onPaste}
            rows={1}
            spellCheck={false}
            role="combobox"
            aria-expanded={menu.open}
            aria-autocomplete="list"
            {...(menu.open && menu.items.length > 0
              ? {
                  "aria-controls": TRIGGER_MENU_ID,
                  "aria-activedescendant": triggerRowId(menu.activeIndex),
                }
              : {})}
            placeholder={
              turning ? "Steer the agent…" : "Ask Trace to build, fix, or explain something…"
            }
            className="selectable block max-h-[280px] w-full resize-none bg-transparent px-3 pt-2.5 pb-1.5 text-sm leading-relaxed text-fg outline-none placeholder:text-fg-subtle"
          />

          <div className="flex items-center gap-1 px-1.5 pb-1.5">
            <ModelPicker />
            <ModePicker />
            <span className="flex-1" />
            <IconButton label="Attach a folder" onClick={attachFolder}>
              <FolderPlus size={12} />
            </IconButton>
            {stoppable ? (
              <button
                type="button"
                onClick={() => {
                  void interrupt();
                }}
                title="Stop (Esc)"
                className="flex size-6 items-center justify-center rounded border border-line-strong bg-surface text-fg-muted transition-colors hover:border-danger/60 hover:text-danger"
              >
                <Square size={9} fill="currentColor" />
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={!canSend}
                title={turning ? "Steer (Enter)" : "Send (Enter)"}
                className="flex size-6 items-center justify-center rounded bg-accent text-fg-inverse transition-colors hover:bg-accent-hover disabled:bg-surface-active disabled:text-fg-subtle"
              >
                <ArrowUp size={12} />
              </button>
            )}
          </div>
        </div>

        <p className="mt-1 px-1 text-2xs text-fg-subtle">
          {menu.open
            ? menu.kind === "command"
              ? "↑↓ to move · Enter to insert · Esc to dismiss"
              : "↑↓ to move · Enter to attach · Esc to dismiss"
            : live !== null && live.interruptRequested
              ? "Stopping…"
              : turning
                ? "Enter sends a steering message · Esc stops the turn"
                : "Enter to send · Shift+Enter for a new line · @ for files · / for commands"}
        </p>
      </div>
    </div>
  );
}

function IconButton(props: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={props.onClick}
      title={props.label}
      aria-label={props.label}
      className="flex size-6 items-center justify-center rounded text-fg-subtle transition-colors hover:bg-surface-hover hover:text-fg"
    >
      {props.children}
    </button>
  );
}

/**
 * `ArrayBuffer` → base64, chunked.
 *
 * `String.fromCharCode(...bytes)` on a whole screenshot overflows the argument limit and
 * throws, which is a fun bug to find in production. 8 KiB per call is well under every
 * engine's cap.
 */
function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let index = 0; index < bytes.length; index += 8_192) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 8_192));
  }
  return btoa(binary);
}
