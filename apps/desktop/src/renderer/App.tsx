/**
 * The frame.
 *
 * The layout *is* the product thesis, so it is worth stating in one place. Chat is not
 * a sidebar bolted to an editor — it is the window. The work panel is a viewport the
 * agent (or the user) summons when there is something to look at, and it closes again.
 * That is the difference between Cursor 3.0's shape and Cursor 1.0's, and it is why the
 * transcript gets the centre column and the file tree does not.
 *
 * Everything here is layout and wiring. No component below this file reads the store's
 * whole state; each one selects the slice it renders, so a `text_delta` sixty times a
 * second re-renders the transcript and nothing else.
 *
 * Copyright (c) 2026 Origin AI
 */

import { useEffect } from "react";

import { EngineBanner } from "./components/EngineBanner";
import { NoticeBar } from "./components/NoticeBar";
import { PromptBar } from "./components/PromptBar";
import { ReviewBar } from "./components/ReviewBar";
import { SessionSearch } from "./components/SessionSearch";
import { SessionSidebar } from "./components/SessionSidebar";
import { SettingsDialog } from "./components/SettingsDialog";
import { StatusBar } from "./components/StatusBar";
import { TitleBar } from "./components/TitleBar";
import { Transcript } from "./components/Transcript";
import { WorkPanel } from "./components/WorkPanel";
import { useStore } from "./store";

export function App(): React.JSX.Element {
  const sidebarOpen = useStore((state) => state.host.sidebarOpen);
  const panelOpen = useStore((state) => state.workPanel.open);
  const refreshAccount = useStore((state) => state.refreshAccount);

  // Usage figures go stale while the window is in the background — another machine, or
  // a teammate on the same plan, has been spending. Refreshing on focus is how every
  // metered product keeps its own number honest without polling.
  useEffect(() => {
    const onFocus = (): void => {
      void refreshAccount();
    };
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
    };
  }, [refreshAccount]);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-surface text-fg">
      <TitleBar />

      <div className="flex min-h-0 flex-1">
        {sidebarOpen ? <SessionSidebar /> : null}

        <main className="flex min-w-0 flex-1 flex-col">
          <EngineBanner />
          <NoticeBar />

          <div className="flex min-h-0 flex-1">
            {/* The chat column. `min-w-0` on both halves is what stops a long
                unbreakable token in the transcript from pushing the work panel off
                screen — flex items default to `min-width: auto`. */}
            <div className="flex min-w-0 flex-1 flex-col">
              <Transcript />
              {/* Between the transcript and the prompt on purpose: the agent has just
                  finished, and this is the last thing in the way of typing again. */}
              <ReviewBar />
              <PromptBar />
            </div>

            {panelOpen ? <WorkPanel /> : null}
          </div>
        </main>
      </div>

      <StatusBar />

      <SettingsDialog />
      <SessionSearch />
    </div>
  );
}
