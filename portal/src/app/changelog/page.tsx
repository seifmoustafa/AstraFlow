import React from 'react';
import { getChangelogData } from '@/lib/changelog-loader';
import { ChangelogClientView } from '@/components/changelog/ChangelogClientView';
import { History, ShieldAlert, FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Living Changelog — AstraFlow Release History & Governance',
  description: 'Searchable, automated release audit trail for AstraFlow, parsed directly from repository source.',
};

export default function ChangelogPage() {
  const { releases, stats } = getChangelogData();

  return (
    <div className="min-h-screen bg-[var(--af-bg-canvas)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Page Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--af-accent)]/10 text-[var(--af-accent)] text-xs font-mono font-semibold border border-[var(--af-accent)]/20">
            <History className="w-3.5 h-3.5" />
            <span>Living Repository History</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--af-text-primary)] tracking-tight font-display">
            AstraFlow Changelog
          </h1>
          <p className="text-base sm:text-lg text-[var(--af-text-secondary)] leading-relaxed">
            Directly synchronized with the canonical repository audit log. Inspect additions, breaking changes, and security postures across all versions.
          </p>
        </div>

        {/* Client Interactive View with Search and Filter Chips */}
        <ChangelogClientView initialReleases={releases} stats={stats} />
      </div>
    </div>
  );
}
