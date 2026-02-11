import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { toString } from 'mdast-util-to-string';
import type { Root, Content } from 'mdast';

export interface ParsedMarkdown {
  frontMatter: Record<string, unknown>;
  ast: Root;
  content: string; // raw content without front matter
  rawContent: string; // full raw file including front matter
}

export function parseMarkdown(raw: string): ParsedMarkdown {
  const { data, content } = matter(raw);
  const ast = unified().use(remarkParse).parse(content) as Root;
  return {
    frontMatter: data,
    ast,
    content,
    rawContent: raw,
  };
}

export function nodeToString(node: Content | Root): string {
  return toString(node);
}

/**
 * Count words in plain text, excluding code blocks and front matter.
 */
export function countWords(text: string): number {
  // Remove code blocks
  const withoutCode = text.replace(/```[\s\S]*?```/g, '');
  // Remove inline code
  const withoutInline = withoutCode.replace(/`[^`]+`/g, '');
  // Remove HTML tags
  const withoutHtml = withoutInline.replace(/<[^>]+>/g, '');
  const words = withoutHtml.trim().split(/\s+/).filter((w) => w.length > 0);
  return words.length;
}

/**
 * Split text into sentences using simple heuristic.
 */
export function splitSentences(text: string): string[] {
  // Remove code blocks
  const withoutCode = text.replace(/```[\s\S]*?```/g, '');
  // Split on sentence-ending punctuation followed by space or end
  const sentences = withoutCode
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  return sentences;
}

/**
 * Get the line number (1-based) for a character offset in text.
 */
export function getLineNumber(text: string, offset: number): number {
  const prefix = text.slice(0, offset);
  return prefix.split('\n').length;
}
