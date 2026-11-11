"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePortal } from "@/context/PortalContext";
import { Search, X, BookOpen, Layers, Sparkles, FileText, ArrowRight } from "lucide-react";

export function SearchModal() {
  const { isSearchOpen, setIsSearchOpen, t } = usePortal();
  const [query, setQuery] = useState("");

  if (!isSearchOpen) return null;

  const quickLinks = [
    { title: "Mediator Getting Started", category: "Documentation", href: "/docs#mediator", icon: BookOpen },
    { title: "Source Generator Mappings", category: "Guides", href: "/docs#mapper", icon: Sparkles },
    { title: "Observability & OpenTelemetry", category: "Diagnostics", href: "/docs#diagnostics", icon: Layers },
    { title: "Architecture Blueprint", category: "Architecture", href: "/architecture", icon: Layers },
    { title: "Changelog v2.3.0 & v2.4.0", category: "Releases", href: "/changelog", icon: FileText },
  ];

  const filteredLinks = query.trim()
    ? quickLinks.filter((link) =>
        link.title.toLowerCase().includes(query.toLowerCase()) ||
        link.category.toLowerCase().includes(query.toLowerCase())
      )
    : quickLinks;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={() => setIsSearchOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-[var(--af-bg-surface)] border border-[var(--af-border)] rounded-[var(--af-radius-dialog)] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-[var(--af-border)] gap-3 bg-[var(--af-bg-canvas)]">
          <Search className="w-5 h-5 text-[var(--af-accent)] shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.nav.searchPlaceholder}
            className="w-full bg-transparent text-sm text-[var(--af-text-primary)] placeholder-[var(--af-text-subtle)] focus:outline-none"
          />
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1 rounded text-[var(--af-text-subtle)] hover:text-[var(--af-text-primary)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Links / Results */}
        <div className="p-3 max-h-80 overflow-y-auto space-y-1">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--af-text-subtle)] px-3 py-1">
            Quick Navigation & Queries
          </div>
          {filteredLinks.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={idx}
                href={item.href}
                onClick={() => setIsSearchOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-[var(--af-radius-control)] hover:bg-[var(--af-bg-canvas)] group transition-af"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-[var(--af-text-subtle)] group-hover:text-[var(--af-accent)] transition-af" />
                  <div>
                    <div className="text-sm font-medium text-[var(--af-text-primary)]">
                      {item.title}
                    </div>
                    <div className="text-[11px] font-mono text-[var(--af-text-subtle)]">
                      {item.category}
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[var(--af-text-subtle)] group-hover:text-[var(--af-accent)] group-hover:translate-x-0.5 transition-af" />
              </Link>
            );
          })}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-[var(--af-bg-canvas)] border-t border-[var(--af-border-subtle)] flex items-center justify-between text-[11px] font-mono text-[var(--af-text-subtle)]">
          <span>Esc to close</span>
          <span>Tab to navigate</span>
        </div>
      </div>
    </div>
  );
}
