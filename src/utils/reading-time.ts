import { countWords } from './markdown.js';

/**
 * Compute reading time in minutes from word count (200 wpm).
 * Excludes front matter, code blocks, and HTML tags.
 */
export function computeReadingTime(content: string): number {
  const words = countWords(content);
  return Math.ceil(words / 200);
}
