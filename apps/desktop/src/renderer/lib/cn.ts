/**
 * `cn` — conditional class names, with Tailwind conflicts resolved.
 *
 * `clsx` alone produces `"px-2 px-4"` when a component's default is overridden by a
 * prop, and CSS source order then decides the winner rather than the caller.
 * `twMerge` makes the last one win, which is what every caller expects.
 *
 * Copyright (c) 2026 Origin AI
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
