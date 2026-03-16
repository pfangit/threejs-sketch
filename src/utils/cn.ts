import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class values into a single string
 * This function is typically used for conditionally joining CSS class names
 * @param inputs - A list of class values that can be strings, objects, arrays, or undefined
 * @returns A merged string of all class values
 */
export function cn(...inputs: ClassValue[]): string {
  // Merge the inputs using twMerge and clsx utilities
  // twMerge handles conflicting Tailwind classes
  // clsx handles conditional class names
  return twMerge(clsx(inputs));
}
