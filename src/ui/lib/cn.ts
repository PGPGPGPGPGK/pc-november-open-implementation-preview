/**
 * `cn` — class-name merger. Resolves Tailwind conflicts deterministically
 * (e.g. `cn("px-2", "px-4")` ⇒ `"px-4"`) and filters falsy values.
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
