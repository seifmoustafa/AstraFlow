'use client';

import React, { useState } from 'react';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const blocks = parseMarkdownBlocks(content);

  return (
    <div className="markdown-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'heading': {
            const HeadingTag = `h${Math.min(6, Math.max(2, block.level))}` as 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
            const fontSize =
              block.level === 1
                ? 'clamp(28px, 3vw, 38px)'
                : block.level === 2
                  ? 'clamp(22px, 2.3vw, 30px)'
                  : block.level === 3
                    ? '20px'
                    : '17px';

            return (
              <HeadingTag
                key={index}
                id={block.id}
                style={{
                  fontSize,
                  letterSpacing: '-0.04em',
                  lineHeight: 1.15,
                  marginTop: block.level <= 2 ? '28px' : '18px',
                  marginBottom: '6px',
                  paddingBottom: block.level <= 2 ? '10px' : '0',
                  borderBottom: block.level <= 2 ? '1px solid var(--line)' : 'none',
                  color: 'var(--ink)',
                }}
              >
                <a href={`#${block.id}`}>{block.text}</a>
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
                style={{
                  margin: '8px 0',
                  padding: '14px 20px',
                  borderInlineStart: '2px solid var(--signal)',
                  background: '#efe9de',
                  color: 'var(--ink)',
                  fontStyle: 'italic',
                }}
              >
                <InlineRenderer text={block.text} />
              </blockquote>
            );
          case 'list':
            return (
              <ul
                key={index}
                style={{
                  margin: '4px 0 8px',
                  paddingInlineStart: '20px',
                  lineHeight: 1.65,
                  color: 'var(--ink)',
                }}
              >
                {block.items.map((item, itemIdx) => (
                  <li key={itemIdx} style={{ marginBottom: '6px' }}>
                    <InlineRenderer text={item} />
                  </li>
                ))}
              </ul>
            );
          case 'paragraph':
          default:
            return (
              <p key={index} style={{ margin: 0, lineHeight: 1.72, color: '#355044' }}>
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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1700);
    } catch {
      // Fallback
    }
  };

  return (
    <div
      style={{
        background: 'var(--ink)',
        borderRadius: '6px',
        padding: '18px 20px',
        margin: '8px 0',
        color: '#ddf1dc',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
          paddingBottom: '8px',
          borderBottom: '1px solid rgba(255,255,255,0.14)',
        }}
      >
        <span className="tiny" style={{ color: '#97b6a3' }}>
          {(language || 'code').toUpperCase()}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy code block"
          className="v11-code-copy"
          style={{ marginTop: 0, padding: '5px 10px' }}
        >
          {copied ? 'COPIED ✓' : 'COPY CODE ↗'}
        </button>
      </div>
      <pre
        tabIndex={0}
        style={{
          margin: 0,
          padding: 0,
          background: 'transparent',
          color: '#ddf1dc',
          overflowX: 'auto',
          font: "12px/1.8 'Courier New', monospace",
          whiteSpace: 'pre-wrap',
          overflowWrap: 'anywhere',
        }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}

function TableBlock({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div style={{ width: '100%', overflowX: 'auto', border: '1px solid var(--line)', background: 'var(--paper2)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--line)', background: 'var(--sand)' }}>
            {headers.map((h, i) => (
              <th key={i} style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--ink)' }}>
                <InlineRenderer text={h} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rIdx) => (
            <tr key={rIdx} style={{ borderBottom: '1px solid var(--line)' }}>
              {row.map((cell, cIdx) => (
                <td key={cIdx} style={{ padding: '10px 14px', color: '#355044', verticalAlign: 'top' }}>
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
  return (
    <div
      style={{
        padding: '15px 22px',
        background: '#efe9de',
        borderInlineStart: '2px solid var(--signal)',
        margin: '8px 0',
      }}
    >
      <strong className="tiny" style={{ display: 'block', color: 'var(--action)', marginBottom: '6px' }}>
        {calloutType.toUpperCase()}
      </strong>
      <div style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--ink)' }}>
        <InlineRenderer text={text} />
      </div>
    </div>
  );
}

function InlineRenderer({ text }: { text: string }) {
  if (!text) return null;

  const parts: React.ReactNode[] = [];
  const regex = /(`[^`]+`)|(\[([^\]]+)\]\(([^)]+)\))|(\*\*([^*]+)\*\*)|(\*([^*]+)\*)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    if (match[1]) {
      const code = match[1].slice(1, -1);
      parts.push(
        <code
          key={match.index}
          dir="ltr"
          style={{
            padding: '2px 6px',
            borderRadius: '3px',
            background: '#ece5d9',
            color: 'var(--ink)',
            fontFamily: "'Courier New', monospace",
            fontSize: '12px',
          }}
        >
          {code}
        </code>
      );
    } else if (match[2]) {
      const linkText = match[3];
      const href = match[4];
      const isExternal = href.startsWith('http');
      parts.push(
        <a
          key={match.index}
          href={href}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          style={{
            color: 'var(--action)',
            textDecoration: 'underline',
            textUnderlineOffset: '3px',
            fontWeight: 600,
          }}
        >
          {linkText}
        </a>
      );
    } else if (match[5]) {
      parts.push(
        <strong key={match.index} style={{ fontWeight: 700, color: 'var(--ink)' }}>
          {match[6]}
        </strong>
      );
    } else if (match[7]) {
      parts.push(
        <em key={match.index} style={{ fontStyle: 'italic' }}>
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
        calloutType,
        text: calloutLines.join(' ').trim(),
      });
      continue;
    }

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

    if (line.includes('|') && i + 1 < lines.length && lines[i + 1].includes('|') && lines[i + 1].includes('-')) {
      const parseCells = (row: string) =>
        row
          .split('|')
          .slice(1, -1)
          .map((c) => c.trim());

      const headers = parseCells(line);
      i += 2;
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

    if (line.trim().length === 0) {
      i++;
      continue;
    }

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
