/**
 * PR — not wired.
 *
 * The intended shape is the review loop Cursor's own panel has: the branch's pull request,
 * its checks, its comments, and a way to answer them without leaving the window. All of
 * that needs three things the app does not have yet — a git host credential, a `pr/*`
 * family in the protocol, and a decision about which hosts are supported on day one.
 *
 * Until then this tab says so. The alternative — a panel that renders a fake PR, or one
 * that silently shows nothing — teaches the user to distrust the whole strip.
 *
 * Copyright (c) 2026 Origin AI
 */

import { GitPullRequest } from "lucide-react";

import { PanelMessage } from "./shell";

export function PrPanel(): React.JSX.Element {
  return (
    <PanelMessage
      Icon={GitPullRequest}
      title="Pull requests are not wired up yet"
      detail="Reviewing a PR needs a connection to your git host, which Trace does not ask for yet. Until it does, the Diff tab shows every change in the work tree."
    />
  );
}
