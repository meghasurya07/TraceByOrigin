/**
 * Canvas — not wired.
 *
 * The tab exists because `WorkPanelTarget` has six members and the strip is built from
 * that union, so leaving it out would mean either a hole in the keyboard shortcuts or a
 * tab that opens an empty box with no explanation. This is the explanation.
 *
 * What it will be: the surface for artefacts that are neither a file nor a terminal — a
 * rendered diagram, a chart the agent produced, an HTML preview it wants to show. The
 * protocol has no `canvas/*` method yet, and inventing a client for a server that does
 * not exist is how you end up maintaining two guesses at once.
 *
 * Copyright (c) 2026 Origin AI
 */

import { PenTool } from "lucide-react";

import { PanelMessage } from "./shell";

export function CanvasPanel(): React.JSX.Element {
  return (
    <PanelMessage
      Icon={PenTool}
      title="Canvas is not wired up yet"
      detail="It will hold the things the agent renders rather than writes — diagrams, charts, previews. The engine has no method for them yet, so this tab has nothing to ask for."
    />
  );
}
