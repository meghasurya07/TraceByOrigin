/**
 * Read-before-write bookkeeping.
 *
 * Two failure modes this exists to prevent, both of which destroy user trust the
 * first time they happen:
 *
 * 1. **Blind overwrite.** The agent calls `write_file` on a file it never read,
 *    guessing at the contents it is replacing. Requiring a prior read forces it to
 *    work from what is actually there.
 *
 * 2. **Clobbering a concurrent edit.** The user changes a file in their editor while
 *    a turn is running. The agent's `old_string` was captured before that change, so
 *    applying it silently discards the user's work. Comparing mtime and size against
 *    the values recorded at read time turns that into an explicit "re-read the file"
 *    error the agent can recover from.
 *
 * Scoped per session: two concurrent agents on the same workspace each keep their
 * own view, which is correct — one having read a file says nothing about the other.
 *
 * Copyright (c) 2026 Origin AI
 */

export interface FileStamp {
  mtimeMs: number;
  size: number;
}

export class FileStateTracker {
  private readonly reads = new Map<string, FileStamp>();

  markRead(absolutePath: string, stamp: FileStamp): void {
    this.reads.set(absolutePath, stamp);
  }

  /** Called after a successful write so the agent can edit again without re-reading. */
  markWritten(absolutePath: string, stamp: FileStamp): void {
    this.reads.set(absolutePath, stamp);
  }

  hasRead(absolutePath: string): boolean {
    return this.reads.has(absolutePath);
  }

  forget(absolutePath: string): void {
    this.reads.delete(absolutePath);
  }

  clear(): void {
    this.reads.clear();
  }

  /**
   * Explain why a pending write is unsafe, or `undefined` when it is fine.
   *
   * mtime granularity is coarse on some filesystems (1 s on HFS+, 2 s on FAT), so
   * size is compared too. That still misses a same-size edit landing inside the
   * same mtime tick — a real but vanishingly rare race, and one git itself has.
   */
  staleReason(absolutePath: string, current: FileStamp): string | undefined {
    const recorded = this.reads.get(absolutePath);
    if (!recorded) return "the file has not been read in this session";
    if (recorded.mtimeMs !== current.mtimeMs || recorded.size !== current.size) {
      return "the file changed on disk after it was read";
    }
    return undefined;
  }
}
