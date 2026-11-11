'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DocCategory } from '@/lib/docs-loader';
import { Search, ChevronRight, BookOpen, Layers, Terminal, Shield, FileText } from 'lucide-react';

interface DocsSidebarProps {
  categories: DocCategory[];
}

export function DocsSidebar({ categories }: DocsSidebarProps) {
  const pathname = usePathname();
  const [filter, setFilter] = useState('');

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'getting-started':
        return <BookOpen className="w-4 h-4 text-[var(--af-accent)]" />;
      case 'core-packages':
        return <Layers className="w-4 h-4 text-[var(--af-accent)]" />;
      case 'compiler-tooling':
        return <Terminal className="w-4 h-4 text-[var(--af-accent)]" />;
      case 'enterprise-ops':
        return <Shield className="w-4 h-4 text-[var(--af-accent)]" />;
      case 'governance-releases':
        return <FileText className="w-4 h-4 text-[var(--af-copper)]" />;
      default:
        return <BookOpen className="w-4 h-4 text-[var(--af-accent)]" />;
    }
  };

  const filteredCategories = categories.map((cat) => ({
    ...cat,
    items: cat.items.filter((item) =>
      filter.trim() === ''
        ? true
        : item.title.toLowerCase().includes(filter.toLowerCase()) ||
          item.slug.toLowerCase().includes(filter.toLowerCase())
    ),
  })).filter((cat) => cat.items.length > 0);

  return (
    <aside className="w-full lg:w-72 shrink-0 border-r border-[var(--af-border)] bg-[var(--af-bg-canvas)] flex flex-col h-full lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)]">
      {/* Search Filter Header */}
      <div className="p-4 border-b border-[var(--af-border)]">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--af-text-subtle)]" />
          <input
            type="text"
            placeholder="Filter documentation..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md bg-[var(--af-bg-surface)] border border-[var(--af-border)] text-[var(--af-text-primary)] placeholder-[var(--af-text-subtle)] focus:outline-none focus:border-[var(--af-accent)] transition-colors"
          />
        </div>
      </div>

      {/* Categories & Links */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
        {filteredCategories.map((category) => (
          <div key={category.slug} className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--af-text-primary)] font-display">
              {getCategoryIcon(category.slug)}
              <span>{category.title}</span>
            </div>

            <ul className="space-y-1 pl-2 border-l border-[var(--af-border)]/50">
              {category.items.map((item) => {
                const href = `/docs/${item.slug}`;
                const isActive = pathname === href || pathname === `/docs/${category.slug}/${item.slug}`;

                return (
                  <li key={item.slug}>
                    <Link
                      href={href}
                      className={`group flex items-center justify-between px-2.5 py-1.5 text-xs rounded-md transition-all ${
                        isActive
                          ? 'bg-[var(--af-accent)]/15 text-[var(--af-accent)] font-semibold border-l-2 border-[var(--af-accent)]'
                          : 'text-[var(--af-text-secondary)] hover:text-[var(--af-text-primary)] hover:bg-[var(--af-bg-surface)]'
                      }`}
                    >
                      <span className="truncate">{item.title}</span>
                      {item.versionNotice === 'v2.4.0 Preview' ? (
                        <span className="ml-1.5 px-1 py-0.2 text-[9px] font-mono rounded bg-[var(--af-copper)]/15 text-[var(--af-copper)] shrink-0 font-medium border border-[var(--af-copper)]/30">
                          v2.4 Preview
                        </span>
                      ) : (
                        <ChevronRight
                          className={`w-3 h-3 shrink-0 transition-transform ${
                            isActive ? 'text-[var(--af-accent)] translate-x-0.5' : 'opacity-0 group-hover:opacity-100 text-[var(--af-text-subtle)]'
                          }`}
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
