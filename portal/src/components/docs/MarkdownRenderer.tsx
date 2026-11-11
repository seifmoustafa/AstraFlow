'use client';

import React, { useState } from 'react';
import { Check, Copy, AlertCircle, Info, AlertTriangle, ShieldCheck, ExternalLink } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Parse blocks
  const blocks = parseMarkdownBlocks(content);

  return (
    <div className="markdown-body space-y-6 text-[var(--af-text-secondary)] leading-relaxed font-sans">
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'heading': {
            const headingClasses = {
              1: 'text-3xl sm:text-4xl font-bold tracking-tight text-[var(--af-text-primary)] mt-10 mb-4 border-b border-[var(--af-border)] pb-3 font-display',
              2: 'text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--af-text-primary)] mt-8 mb-3 border-b border-[var(--af-border)]/50 pb-2 font-display',
              3: 'text-xl sm:text-2xl font-semibold text-[var(--af-text-primary)] mt-6 mb-2',
              4: 'text-lg font-medium text-[var(--af-text-primary)] mt-4 mb-2',
            }[block.level] || 'text-base font-medium text-[var(--af-text-primary)]';

            const HeadingTag = `h${block.level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

            return (
              <HeadingTag key={index} id={block.id} className={`group flex items-center gap-2 ${headingClasses}`}>
                <a href={`#${block.id}`} className="hover:text-[var(--af-accent)] transition-colors">
                  {block.text}
                </a>
                <span className="opacity-0 group-hover:opacity-100 text-[var(--af-accent)] text-sm transition-opacity">
                  #
                </span>
              </HeadingTag>
            );
          }
          case 'code':
            return <CodeBlock key={index} code={block.code} language={block.language} />;
          case 'table':
            return <TableBlock key={index} headers={block.headers} rows={block.rows} />;
          case 'callout':
            return <CalloutBlock key={index} calloutType={block.calloutType} text={block.text} />;
          case 'blockquote':
            return (
              <blockquote
                key={index}
                className="border-l-4 border-[var(--af-accent)]/60 bg-[var(--af-bg-surface)]/40 px-4 py-3 rounded-r-lg italic text-[var(--af-text-primary)] my-4"
              >
                <InlineRenderer text={block.text} />
              </blockquote>
            );
          case 'list':
            return (
              <ul key={index} className="space-y-2 list-disc list-inside pl-2 marker:text-[var(--af-accent)]">
                {block.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="text-[var(--af-text-secondary)]">
                    <InlineRenderer text={item} />
                  </li>
                ))}
              </ul>
            );
          case 'paragraph':
          default:
            return (
              <p key={index} className="text-base text-[var(--af-text-secondary)] leading-7">
                <InlineRenderer text={block.text} />
              </p>
            );
        }
      })}
    </div>
  );
}

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-6 rounded-lg border border-[var(--af-border)] bg-[var(--af-bg-canvas)] overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--af-border)]/60 bg-[var(--af-bg-surface)] text-xs text-[var(--af-text-subtle)] font-mono">
        <span className="uppercase tracking-wider font-semibold text-[var(--af-accent)]">
          {language || 'text'}
        </span>
        <button
          onClick={handleCopy}
          aria-label="Copy code block"
          className="flex items-center gap-1.5 px-2 py-1 rounded bg-[var(--af-bg-canvas)] hover:bg-[var(--af-bg-surface)] border border-[var(--af-border)]/60 text-[var(--af-text-secondary)] hover:text-[var(--af-text-primary)] transition-all cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[var(--af-success)]" />
              <span className="text-[var(--af-success)] font-medium">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed text-[var(--af-text-primary)] scrollbar-thin">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function TableBlock({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="my-6 w-full overflow-x-auto border border-[var(--af-border)] rounded-lg shadow-sm">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-[var(--af-border)] bg-[var(--af-bg-surface)]">
            {headers.map((h, i) => (
              <th
                key={i}
                className="py-3 px-4 font-semibold text-[var(--af-text-primary)] whitespace-nowrap"
              >
                <InlineRenderer text={h} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--af-border)]/40 bg-[var(--af-bg-canvas)]">
          {rows.map((row, rIdx) => (
            <tr
              key={rIdx}
              className="hover:bg-[var(--af-bg-surface)]/50 transition-colors"
            >
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="py-2.5 px-4 text-[var(--af-text-secondary)] align-top">
                  <InlineRenderer text={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CalloutBlock({ calloutType, text }: { calloutType: string; text: string }) {
  const configs = {
    warning: {
      border: 'border-[var(--af-warning)]',
      bg: 'bg-[var(--af-warning)]/10',
      text: 'text-[var(--af-warning)]',
      icon: AlertTriangle,
      label: 'Warning',
    },
    danger: {
      border: 'border-[var(--af-danger)]',
      bg: 'bg-[var(--af-danger)]/10',
      text: 'text-[var(--af-danger)]',
      icon: AlertCircle,
      label: 'Danger',
    },
    security: {
      border: 'border-[var(--af-accent)]',
      bg: 'bg-[var(--af-accent)]/10',
      text: 'text-[var(--af-accent)]',
      icon: ShieldCheck,
      label: 'Security Notice',
    },
    note: {
      border: 'border-[var(--af-copper)]',
      bg: 'bg-[var(--af-copper)]/10',
      text: 'text-[var(--af-copper)]',
      icon: Info,
      label: 'Note',
    },
    info: {
      border: 'border-[var(--af-accent)]',
      bg: 'bg-[var(--af-accent)]/10',
      text: 'text-[var(--af-accent)]',
      icon: Info,
      label: 'Information',
    },
  };

  const current = configs[calloutType as keyof typeof configs] || configs.info;
  const Icon = current.icon;

  return (
    <div className={`my-5 border-l-4 ${current.border} ${current.bg} p-4 rounded-r-lg shadow-sm`}>
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className={`w-4 h-4 ${current.text}`} />
        <span className={`text-xs font-bold uppercase tracking-wider ${current.text}`}>
          {current.label}
        </span>
      </div>
      <div className="text-sm text-[var(--af-text-primary)] leading-normal">
        <InlineRenderer text={text} />
      </div>
    </div>
  );
}

function InlineRenderer({ text }: { text: string }) {
  if (!text) return null;

  // Simple token parser for code, bold, links, etc.
  // [link](url), `code`, **bold**, *italic*
  const parts: React.ReactNode[] = [];
  const regex = /(`[^`]+`)|(\[([^\]]+)\]\(([^)]+)\))|(\*\*([^*]+)\*\*)|(\*([^*]+)\*)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    if (match[1]) {
      // Inline code
      const code = match[1].slice(1, -1);
      parts.push(
        <code
          key={match.index}
          className="px-1.5 py-0.5 rounded bg-[var(--af-bg-surface)] text-[var(--af-accent)] border border-[var(--af-border)]/50 font-mono text-xs sm:text-[13px]"
        >
          {code}
        </code>
      );
    } else if (match[2]) {
      // Link [text](href)
      const linkText = match[3];
      const href = match[4];
      const isExternal = href.startsWith('http');
      parts.push(
        <a
          key={match.index}
          href={href}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          className="text-[var(--af-accent)] hover:underline inline-flex items-center gap-0.5 font-medium"
        >
          {linkText}
          {isExternal && <ExternalLink className="w-3 h-3 opacity-70" />}
        </a>
      );
    } else if (match[5]) {
      // Bold
      parts.push(
        <strong key={match.index} className="font-semibold text-[var(--af-text-primary)]">
          {match[6]}
        </strong>
      );
    } else if (match[7]) {
      // Italic
      parts.push(
        <em key={match.index} className="italic text-[var(--af-text-secondary)]">
          {match[8]}
        </em>
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return <>{parts}</>;
}

// Markdown block parser
type MarkdownBlock =
  | { type: 'heading'; level: number; text: string; id: string }
  | { type: 'code'; code: string; language: string }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'callout'; calloutType: string; text: string }
  | { type: 'blockquote'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'paragraph'; text: string };

function parseMarkdownBlocks(rawMarkdown: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  const lines = rawMarkdown.split(/\r?\n/);
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (line.startsWith('```')) {
      const language = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      blocks.push({
        type: 'code',
        code: codeLines.join('\n'),
        language,
      });
      i++;
      continue;
    }

    // Callout box syntax [!NOTE], [!WARNING], [!SECURITY], [!TIP]
    const calloutMatch = line.match(/^>\s+\[!(NOTE|WARNING|CAUTION|IMPORTANT|TIP|SECURITY)\]\s*(.*)$/i);
    if (calloutMatch) {
      const calloutType = calloutMatch[1].toLowerCase();
      const calloutLines: string[] = [];
      if (calloutMatch[2]) calloutLines.push(calloutMatch[2]);
      i++;
      while (i < lines.length && lines[i].startsWith('>')) {
        calloutLines.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      blocks.push({
        type: 'callout',
        calloutType: calloutType === 'caution' ? 'danger' : calloutType === 'important' ? 'warning' : calloutType,
        text: calloutLines.join(' ').trim(),
      });
      continue;
    }

    // Generic blockquote
    if (line.startsWith('>')) {
      const bqLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('>')) {
        bqLines.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      blocks.push({
        type: 'blockquote',
        text: bqLines.join(' ').trim(),
      });
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2].trim().replace(/[*_`]/g, '');
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
      blocks.push({
        type: 'heading',
        level,
        text,
        id,
      });
      i++;
      continue;
    }

    // Table detection: line with | and next line has |-
    if (line.includes('|') && i + 1 < lines.length && lines[i + 1].includes('|') && lines[i + 1].includes('-')) {
      const parseCells = (row: string) =>
        row
          .split('|')
          .slice(1, -1)
          .map((c) => c.trim());

      const headers = parseCells(line);
      i += 2; // skip header and delimiter line
      const rows: string[][] = [];

      while (i < lines.length && lines[i].includes('|') && lines[i].trim().length > 0) {
        rows.push(parseCells(lines[i]));
        i++;
      }

      blocks.push({
        type: 'table',
        headers,
        rows,
      });
      continue;
    }

    // List item
    if (line.match(/^[-*]\s+/)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^[-*]\s+/)) {
        items.push(lines[i].replace(/^[-*]\s+/, '').trim());
        i++;
      }
      blocks.push({
        type: 'list',
        items,
      });
      continue;
    }

    // Empty lines
    if (line.trim().length === 0) {
      i++;
      continue;
    }

    // Regular paragraph
    const pLines: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim().length > 0 &&
      !lines[i].startsWith('#') &&
      !lines[i].startsWith('```') &&
      !lines[i].startsWith('>') &&
      !lines[i].match(/^[-*]\s+/) &&
      !lines[i].includes('|')
    ) {
      pLines.push(lines[i]);
      i++;
    }
    blocks.push({
      type: 'paragraph',
      text: pLines.join(' ').trim(),
    });
  }

  return blocks;
}
