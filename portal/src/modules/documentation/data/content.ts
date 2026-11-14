import * as path from 'node:path';

function titleCaseFromSlug(slugPath: string): string {
  const base = path.posix.basename(slugPath);
  return base
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function stripInlineMarkdown(line: string): string {
  return line
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/[*_~]{1,3}([^*_~]+)[*_~]{1,3}/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function extractTitle(markdown: string, slugPath: string): string {
  const lines = markdown.split('\n');
  let inFence = false;
  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const match = line.match(/^#\s+(.+)$/);
    if (match) {
      return stripInlineMarkdown(match[1]);
    }
  }
  return titleCaseFromSlug(slugPath);
}

export function extractPlainProse(markdown: string): {
  summary: string;
  plainExcerpt: string;
  searchText: string;
  wordCount: number;
} {
  const lines = markdown.split('\n');
  const paragraphs: string[] = [];
  const allPlainTokens: string[] = [];
  let currentParagraph: string[] = [];
  let inFence = false;

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const joined = stripInlineMarkdown(currentParagraph.join(' '));
      if (joined) {
        paragraphs.push(joined);
        allPlainTokens.push(joined);
      }
      currentParagraph = [];
    }
  };

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (trimmed.startsWith('```')) {
      flushParagraph();
      inFence = !inFence;
      continue;
    }
    if (inFence) {
      continue;
    }
    if (!trimmed) {
      flushParagraph();
      continue;
    }
    if (/^#\s+/.test(trimmed)) {
      flushParagraph();
      allPlainTokens.push(stripInlineMarkdown(trimmed.replace(/^#+\s+/, '')));
      continue;
    }
    if (/^#{2,6}\s+/.test(trimmed)) {
      flushParagraph();
      allPlainTokens.push(stripInlineMarkdown(trimmed.replace(/^#+\s+/, '')));
      continue;
    }
    if (/^!\[.*\]\(.*\)$/.test(trimmed)) {
      flushParagraph();
      continue;
    }
    if (/^\|[-:\s|]+\|$/.test(trimmed)) {
      continue;
    }
    if (trimmed.startsWith('|')) {
      flushParagraph();
      const cells = trimmed
        .split('|')
        .map((c) => stripInlineMarkdown(c))
        .filter(Boolean);
      if (cells.length > 0) {
        allPlainTokens.push(cells.join(' '));
      }
      continue;
    }
    if (/^[-*+]\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed)) {
      flushParagraph();
      const itemText = stripInlineMarkdown(
        trimmed.replace(/^([-*+]|\d+\.)\s+/, ''),
      );
      if (itemText) {
        allPlainTokens.push(itemText);
      }
      continue;
    }
    if (trimmed.startsWith('>')) {
      const quoteText = trimmed.replace(/^>+\s*/, '');
      if (quoteText) {
        currentParagraph.push(quoteText);
      }
      continue;
    }
    if (/^[-_*]{3,}$/.test(trimmed)) {
      flushParagraph();
      continue;
    }
    currentParagraph.push(trimmed);
  }
  flushParagraph();

  const joinedSearch = allPlainTokens.join(' ').replace(/\s+/g, ' ').trim();
  const wordCount = joinedSearch ? joinedSearch.split(/\s+/).length : 0;

  const firstParagraph =
    paragraphs[0] ??
    allPlainTokens.find((token) => token.length > 20) ??
    'Repository-backed technical reference documentation for AstraFlow.';

  const truncateAtWord = (text: string, maxLen: number): string => {
    if (text.length <= maxLen) return text;
    const sliced = text.slice(0, maxLen);
    const lastSpace = sliced.lastIndexOf(' ');
    const cut = lastSpace > maxLen * 0.55 ? sliced.slice(0, lastSpace) : sliced;
    return `${cut.trimEnd()}…`;
  };

  const summary = truncateAtWord(firstParagraph, 190);
  const plainExcerpt = truncateAtWord(
    paragraphs.slice(0, 2).join(' ') || firstParagraph,
    240,
  );

  return {
    summary,
    plainExcerpt,
    searchText: joinedSearch.toLowerCase(),
    wordCount,
  };
}

