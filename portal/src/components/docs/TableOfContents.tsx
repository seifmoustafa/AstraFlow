'use client';

import React from 'react';
import Link from 'next/link';
import { AlignLeft } from 'lucide-react';

interface TableOfContentsProps {
  headings: { id: string; text: string; level: number }[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  if (!headings || headings.length === 0) {
    return null;
  }

  return (
    <div className="hidden xl:block w-64 shrink-0 pl-6 border-l border-[var(--af-border)] sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-thin">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--af-text-primary)] mb-4 font-display">
        <AlignLeft className="w-3.5 h-3.5 text-[var(--af-accent)]" />
        <span>On this page</span>
      </div>

      <ul className="space-y-2 text-xs">
        {headings.map((h, i) => (
          <li
            key={i}
            style={{ paddingLeft: `${(h.level - 2) * 12}px` }}
            className="transition-colors"
          >
            <a
              href={`#${h.id}`}
              className="text-[var(--af-text-secondary)] hover:text-[var(--af-accent)] hover:underline block leading-relaxed truncate"
              title={h.text}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
