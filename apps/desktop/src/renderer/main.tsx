/**
 * Renderer entry.
 *
 * Three jobs and then it gets out of the way: mount React, boot the store, and put a
 * last-resort error boundary between a component bug and a black window.
 *
 * `StrictMode` is on. It double-invokes effects in development, which is exactly the
 * pressure this app needs: the components subscribe to the store and to window events,
 * and a subscription without a matching unsubscribe shows up here immediately instead
 * of as a slow leak in a session that has been open all afternoon. `boot` itself is
 * called outside the React tree precisely so it is *not* subject to that — it must run
 * exactly once.
 *
 * Copyright (c) 2026 Origin AI
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import { App } from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { useStore } from "./store";

const container = document.getElementById("root");
if (container === null) {
  throw new Error("index.html has no #root — the renderer cannot mount.");
}

/**
 * Boot before the first render, not in an effect.
 *
 * The store's subscriptions must exist before any event can arrive, and an effect runs
 * *after* paint. In practice the window is created in parallel with the engine
 * handshake, so events can be waiting the moment the bundle evaluates.
 *
 * The promise is deliberately not awaited: `boot` records its own failures as notices,
 * and blocking the mount on it would trade a working shell with an error banner for a
 * blank window.
 */
void useStore.getState().boot();

createRoot(container).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
