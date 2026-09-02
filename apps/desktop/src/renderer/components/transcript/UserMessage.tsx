/**
 * The user's own turn, as it appears in the transcript.
 *
 * Deliberately not a chat bubble on the right. This is a work log, not a messaging
 * app: the agent's output is the material being read and should own the full column,
 * while the prompt is a heading above it. So the user's text sits in an inset card with
 * an accent edge — findable when scrolling back for "what did I ask?", and never
 * competing with the reply for width.
 *
 * The text is rendered as markdown because people paste code and lists into prompts,
 * and showing that as one run of prose loses the shape of what they asked.
 *
 * Copyright (c) 2026 Origin AI
 */

import { memo } from "react";
import { FileText, FolderOpen, TextSelect } from "lucide-react";

import type { Attachment } from "@trace/protocol";
import type { ItemOf } from "@trace/client";

import { baseName, shortenPath } from "../../lib/format";
import { Markdown } from "./Markdown";

export const UserMessage = memo(function UserMessage(props: {
  item: ItemOf<"user_message">;
}): React.JSX.Element {
  const { item } = props;

  return (
    <div className="mt-4 mb-1 border-l-2 border-accent pl-3">
      <Markdown text={item.text} className="text-fg" />
      {item.attachments.length === 0 ? null : (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {item.attachments.map((attachment, index) => (
            <AttachmentChip key={`a${String(index)}`} attachment={attachment} />
          ))}
        </div>
      )}
    </div>
  );
});

function AttachmentChip({ attachment }: { attachment: Attachment }): React.JSX.Element {
  if (attachment.type === "image") {
    return (
      <img
        src={`data:${attachment.mediaType};base64,${attachment.data}`}
        alt="Pasted image"
        className="max-h-32 rounded border border-line object-contain"
      />
    );
  }

  const Icon =
    attachment.type === "file"
      ? FileText
      : attachment.type === "directory"
        ? FolderOpen
        : TextSelect;

  const label =
    attachment.type === "selection"
      ? `${baseName(attachment.path)}:${String(attachment.startLine)}-${String(attachment.endLine)}`
      : baseName(attachment.path);

  return (
    <span
      title={
        attachment.type === "selection"
          ? `${shortenPath(attachment.path)}\n\n${attachment.text}`
          : shortenPath(attachment.path)
      }
      className="flex max-w-64 items-center gap-1.5 rounded border border-line bg-surface-raised px-1.5 py-0.5 text-2xs text-fg-muted"
    >
      <Icon size={10} className="shrink-0 text-fg-subtle" />
      <span className="truncate font-mono">{label}</span>
    </span>
  );
}
