'use client';

import React, { useState } from 'react';
import { ChangelogRelease } from '@/lib/changelog-loader';
import { Search, Filter, ShieldCheck, AlertTriangle, PlusCircle, RefreshCw, Wrench, Lock, CheckCircle2, Calendar } from 'lucide-react';

interface ChangelogClientViewProps {
  initialReleases: ChangelogRelease[];
  stats: {
    totalReleases: number;
    totalChanges: number;
    breakingCount: number;
    securityCount: number;
    latestPublished: string;
    inDevelopment: string;
  };
}

export function ChangelogClientView({ initialReleases, stats }: ChangelogClientViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'breaking' | 'added' | 'changed' | 'fixed' | 'security'>('all');

  // Filter releases and their items based on search and selectedFilter
  const filteredReleases = initialReleases
    .map((release) => {
      // Filter sections
      const matchingSections = release.sections
        .map((section) => {
          if (selectedFilter !== 'all' && section.type !== selectedFilter) {
            return null;
          }

          const matchingItems = section.items.filter((item) =>
            searchTerm.trim() === '' ? true : item.toLowerCase().includes(searchTerm.toLowerCase())
          );

          if (matchingItems.length === 0) return null;

          return {
            ...section,
            items: matchingItems,
          };
        })
        .filter((s): s is NonNullable<typeof s> => s !== null);

      const matchesSearchInReleaseHeader =
        searchTerm.trim() !== '' &&
        (release.version.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (release.summary && release.summary.toLowerCase().includes(searchTerm.toLowerCase())));

      if (matchingSections.length === 0 && !matchesSearchInReleaseHeader) {
        return null;
      }

      return {
        ...release,
        sections: matchingSections,
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  const getSectionBadge = (type: string) => {
    switch (type) {
      case 'breaking':
        return {
          icon: AlertTriangle,
          label: 'Breaking Changes',
          className: 'bg-[var(--af-danger)]/15 text-[var(--af-danger)] border-[var(--af-danger)]/30',
        };
      case 'added':
        return {
          icon: PlusCircle,
          label: 'Added',
          className: 'bg-[var(--af-accent)]/15 text-[var(--af-accent)] border-[var(--af-accent)]/30',
        };
      case 'changed':
        return {
          icon: RefreshCw,
          label: 'Changed',
          className: 'bg-[var(--af-warning)]/15 text-[var(--af-warning)] border-[var(--af-warning)]/30',
        };
      case 'fixed':
        return {
          icon: Wrench,
          label: 'Fixed',
          className: 'bg-[var(--af-success)]/15 text-[var(--af-success)] border-[var(--af-success)]/30',
        };
      case 'security':
        return {
          icon: Lock,
          label: 'Security',
          className: 'bg-[var(--af-copper)]/15 text-[var(--af-copper)] border-[var(--af-copper)]/30',
        };
      default:
        return {
          icon: CheckCircle2,
          label: type.charAt(0).toUpperCase() + type.slice(1),
          className: 'bg-[var(--af-bg-surface)] text-[var(--af-text-secondary)] border-[var(--af-border)]',
        };
    }
  };

  return (
    <div className="space-y-8">
      {/* Permanent Changelog Governance Rule Banner */}
      <div className="p-5 rounded-xl border border-[var(--af-border)] bg-[var(--af-bg-surface)] shadow-sm">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[var(--af-accent)] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[var(--af-text-primary)] font-display">
              Permanent Changelog Governance Rule (ADR-0021 & CI Baseline)
            </h3>
            <p className="text-xs text-[var(--af-text-secondary)] leading-relaxed">
              Every pull request affecting public behavior must update <code className="px-1 py-0.5 rounded bg-[var(--af-bg-canvas)] text-[var(--af-accent)] font-mono">CHANGELOG.md</code> before merging. Unclassified release modifications are rejected in CI via baseline drift verification.
            </p>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="mt-4 pt-4 border-t border-[var(--af-border)]/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-2.5 rounded-lg bg-[var(--af-bg-canvas)] border border-[var(--af-border)]/40">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--af-text-subtle)] block">
              Latest Published
            </span>
            <span className="text-sm font-mono font-bold text-[var(--af-accent)]">
              v{stats.latestPublished}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-[var(--af-bg-canvas)] border border-[var(--af-border)]/40">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--af-text-subtle)] block">
              In Development
            </span>
            <span className="text-sm font-mono font-bold text-[var(--af-copper)]">
              v{stats.inDevelopment}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-[var(--af-bg-canvas)] border border-[var(--af-border)]/40">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--af-text-subtle)] block">
              Recorded Releases
            </span>
            <span className="text-sm font-mono font-bold text-[var(--af-text-primary)]">
              {stats.totalReleases}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-[var(--af-bg-canvas)] border border-[var(--af-border)]/40">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--af-text-subtle)] block">
              Total Tracked Changes
            </span>
            <span className="text-sm font-mono font-bold text-[var(--af-text-primary)]">
              {stats.totalChanges}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Controls Bar: Search & Category Filter Chips */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-xl border border-[var(--af-border)] bg-[var(--af-bg-canvas)]">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--af-text-subtle)]" />
          <input
            type="text"
            placeholder="Search changes, components, PR features, or bug fixes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-[var(--af-bg-surface)] border border-[var(--af-border)] text-[var(--af-text-primary)] placeholder-[var(--af-text-subtle)] focus:outline-none focus:border-[var(--af-accent)] transition-colors"
          />
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-[var(--af-text-subtle)] flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {(['all', 'added', 'fixed', 'changed', 'security', 'breaking'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedFilter(cat)}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all cursor-pointer ${
                selectedFilter === cat
                  ? 'bg-[var(--af-accent)] text-[var(--af-accent-on)] font-semibold shadow-xs'
                  : 'bg-[var(--af-bg-surface)] text-[var(--af-text-secondary)] border border-[var(--af-border)] hover:text-[var(--af-text-primary)]'
              }`}
            >
              {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Release Timeline List */}
      <div className="space-y-8 relative before:absolute before:inset-0 before:left-4 md:before:left-6 before:w-0.5 before:bg-[var(--af-border)]/50">
        {filteredReleases.map((release) => {
          const isPreview = release.status === 'preview';
          const isUnverified = release.status === 'unverified';

          return (
            <div key={release.version} className="relative pl-10 md:pl-14 group">
              {/* Timeline Indicator Dot */}
              <div
                className={`absolute left-2.5 md:left-4.5 -translate-x-1/2 top-4 w-4 h-4 rounded-full border-2 transition-transform ${
                  isPreview
                    ? 'border-[var(--af-copper)] bg-[var(--af-bg-canvas)] ring-4 ring-[var(--af-copper)]/15 group-hover:scale-125'
                    : isUnverified
                    ? 'border-[var(--af-warning)] bg-[var(--af-bg-canvas)] ring-4 ring-[var(--af-warning)]/15 group-hover:scale-125'
                    : 'border-[var(--af-accent)] bg-[var(--af-bg-canvas)] ring-4 ring-[var(--af-accent)]/15 group-hover:scale-125'
                }`}
              />

              {/* Release Card */}
              <div
                className={`p-6 rounded-xl border bg-[var(--af-bg-surface)] transition-all shadow-sm ${
                  isPreview
                    ? 'border-[var(--af-copper)]/40 hover:border-[var(--af-copper)]'
                    : isUnverified
                    ? 'border-[var(--af-warning)]/40 hover:border-[var(--af-warning)]'
                    : 'border-[var(--af-border)] hover:border-[var(--af-accent)]'
                }`}
              >
                {/* Release Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--af-border)]/60 pb-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl sm:text-2xl font-bold font-mono text-[var(--af-text-primary)]">
                        v{release.version}
                      </h2>

                      {isPreview ? (
                        <span className="px-2.5 py-0.5 text-xs font-mono font-semibold rounded bg-[var(--af-copper)]/20 text-[var(--af-copper)] border border-[var(--af-copper)]/40">
                          Unreleased / Active Dev
                        </span>
                      ) : isUnverified ? (
                        <span className="px-2.5 py-0.5 text-xs font-mono font-semibold rounded bg-[var(--af-warning)]/20 text-[var(--af-warning)] border border-[var(--af-warning)]/40">
                          GitHub Release (NuGet unverified)
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 text-xs font-mono font-semibold rounded bg-[var(--af-success)]/15 text-[var(--af-success)] border border-[var(--af-success)]/30">
                          Published
                        </span>
                      )}
                    </div>

                    {release.dateNotice && (
                      <p className="text-xs text-[var(--af-text-subtle)] flex items-center gap-1.5 mt-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{release.dateNotice}</span>
                      </p>
                    )}
                  </div>

                  <div className="text-xs text-[var(--af-text-subtle)] font-mono">
                    {release.totalChanges} modifications
                  </div>
                </div>

                {/* Release Summary if present */}
                {release.summary && (
                  <p className="text-xs sm:text-sm text-[var(--af-text-secondary)] mb-6 italic leading-relaxed">
                    {release.summary}
                  </p>
                )}

                {/* Grouped Sections */}
                <div className="space-y-6">
                  {release.sections.map((section, sIdx) => {
                    const badge = getSectionBadge(section.type);
                    const Icon = badge.icon;

                    return (
                      <div key={sIdx} className="space-y-2.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold border ${badge.className}`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            {badge.label}
                          </span>
                        </div>

                        <ul className="space-y-2 pl-2">
                          {section.items.map((item, itemIdx) => (
                            <li
                              key={itemIdx}
                              className="text-xs sm:text-sm text-[var(--af-text-secondary)] leading-relaxed flex items-start gap-2"
                            >
                              <span className="text-[var(--af-text-subtle)] mt-1.5">•</span>
                              <span className="flex-1">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {filteredReleases.length === 0 && (
          <div className="p-12 text-center border border-dashed border-[var(--af-border)] rounded-xl">
            <p className="text-sm text-[var(--af-text-secondary)]">
              No changelog entries matched your search query "{searchTerm}".
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
