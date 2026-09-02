/**
 * The last line of defence.
 *
 * A thrown render is fatal in React 19 — the tree unmounts and the user gets a black
 * window with no way to report it. This catches it and shows the stack, because the app
 * that is most likely to hit an unexpected shape is the one rendering model output.
 *
 * Deliberately a class. `componentDidCatch` has no hook equivalent, and the one thing
 * this file must not do is be clever.
 *
 * Copyright (c) 2026 Origin AI
 */

import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
  stack: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null, stack: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    // The console is the devtools' and the packaged app's only record of this.
    console.error("[renderer] unhandled render error", error, info.componentStack);
    this.setState({ stack: info.componentStack ?? null });
  }

  override render(): ReactNode {
    const { error, stack } = this.state;
    if (error === null) return this.props.children;

    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-surface p-8">
        <div className="w-full max-w-2xl rounded-lg border border-danger/40 bg-danger-muted/40 p-5">
          <h1 className="text-sm font-semibold text-fg">Trace hit an error it could not recover from.</h1>
          <p className="mt-1 text-xs text-fg-muted">
            Your sessions are on disk and were not affected. Reloading the window is safe.
          </p>

          <pre className="selectable mt-4 max-h-64 overflow-auto rounded border border-line bg-surface p-3 font-mono text-2xs leading-relaxed text-danger">
            {error.message}
            {stack === null ? "" : `\n${stack}`}
          </pre>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => {
                window.location.reload();
              }}
              className="rounded border border-line-strong bg-surface-overlay px-3 py-1.5 text-xs hover:bg-surface-hover"
            >
              Reload window
            </button>
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard.writeText(
                  `${error.message}\n${error.stack ?? ""}\n${stack ?? ""}`,
                );
              }}
              className="rounded border border-line bg-transparent px-3 py-1.5 text-xs text-fg-muted hover:bg-surface-hover hover:text-fg"
            >
              Copy details
            </button>
          </div>
        </div>
      </div>
    );
  }
}
