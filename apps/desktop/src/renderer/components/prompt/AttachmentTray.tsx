/**
 * Attachments staged for the next prompt.
 *
 * Chips above the textarea rather than inline tokens in the text, because an attachment
 * is not part of the sentence — the user can delete every word they typed and the file
 * they dragged in is still attached, which is what they meant.
 *
 * Images render as thumbnails. A base64 blob has no filename to show, so the only honest
 * label for one is the image itself.
 *
 * Copyright (c) 2026 Origin AI
 */

import { memo } from "react";
import { FileText, FolderOpen, TextSelect, X } from "lucide-react";

import type { Attachment } from "@trace/protocol";

import { baseName, shortenPath } from "../../lib/format";

export const AttachmentTray = memo(function AttachmentTray(props: {
  attachments: readonly Attachment[];
  onRemove: (index: number) => void;
}): React.JSX.Element {
  return (
    <div className="mb-1.5 flex flex-wrap gap-1.5">
      {props.attachments.map((attachment, index) => (
        <Chip
          key={`a${String(index)}`}
          attachment={attachment}
          onRemove={() => {
            props.onRemove(index);
          }}
        />
      ))}
    </div>
  );
});

function Chip(props: { attachment: Attachment; onRemove: () => void }): React.JSX.Element {
  const { attachment } = props;

  if (attachment.type === "image") {
    return (
      <span className="group relative inline-flex">
        <img
          src={`data:${attachment.mediaType};base64,${attachment.data}`}
          alt="Attached image"
          className="h-14 rounded border border-line object-contain"
        />
        <Remove onClick={props.onRemove} floating />
      </span>
    );
  }

  const Icon =
    attachment.type === "file" ? FileText : attachment.type === "directory" ? FolderOpen : TextSelect;

  const label =
    attachment.type === "selection"
      ? `${baseName(attachment.path)}:${String(attachment.startLine)}-${String(attachment.endLine)}`
      : baseName(attachment.path);

  return (
    <span
      title={shortenPath(attachment.path, 5)}
      className="flex max-w-64 items-center gap-1.5 rounded border border-line bg-surface-raised px-1.5 py-0.5 text-2xs text-fg-muted"
    >
      <Icon size={10} className="shrink-0 text-fg-subtle" />
      <span className="truncate font-mono">{label}</span>
      <Remove onClick={props.onRemove} />
    </span>
  );
}

function Remove(props: { onClick: () => void; floating?: boolean }): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={props.onClick}
      aria-label="Remove attachment"
      title="Remove"
      className={
        props.floating === true
          ? "absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full border border-line-strong bg-surface-overlay text-fg-subtle opacity-0 transition-opacity group-hover:opacity-100 hover:text-fg"
          : "-mr-0.5 flex size-3.5 shrink-0 items-center justify-center rounded text-fg-subtle hover:bg-surface-hover hover:text-fg"
      }
    >
      <X size={props.floating === true ? 9 : 8} />
    </button>
  );
}
