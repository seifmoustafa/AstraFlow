import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllCategories, getDocBySlug, getAllDocSlugs } from '@/lib/docs-loader';
import { DocsSidebar } from '@/components/docs/DocsSidebar';
import { MarkdownRenderer } from '@/components/docs/MarkdownRenderer';
import { TableOfContents } from '@/components/docs/TableOfContents';
import { ChevronRight, ArrowLeft, ArrowRight, ShieldCheck, Clock, ExternalLink } from 'lucide-react';

interface DocPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export async function generateStaticParams() {
  const slugs = getAllDocSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: DocPageProps) {
  const { slug } = await params;
  const doc = getDocBySlug(slug);
  if (!doc) {
    return { title: 'Document Not Found — AstraFlow' };
  }
  return {
    title: `${doc.title} — AstraFlow Docs`,
    description: `Official AstraFlow documentation for ${doc.title}. Category: ${doc.category}.`,
  };
}

export default async function DynamicDocPage({ params }: DocPageProps) {
  const { slug } = await params;
  const doc = getDocBySlug(slug);

  if (!doc) {
    notFound();
  }

  const categories = getAllCategories();

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
      {/* Left Categorized Sidebar */}
      <DocsSidebar categories={categories} />

      {/* Main Content Pane */}
      <main className="flex-1 min-w-0 max-w-4xl mx-auto px-4 sm:px-8 py-8 lg:py-10">
        {/* Breadcrumb Trail */}
        <nav className="flex items-center gap-2 text-xs text-[var(--af-text-subtle)] mb-6 font-mono">
          <Link href="/docs" className="hover:text-[var(--af-accent)] transition-colors">
            Docs
          </Link>
          <ChevronRight className="w-3 h-3 text-[var(--af-border)]" />
          <span className="text-[var(--af-text-secondary)]">{doc.category}</span>
          <ChevronRight className="w-3 h-3 text-[var(--af-border)]" />
          <span className="text-[var(--af-accent)] font-medium truncate">{doc.title}</span>
        </nav>

        {/* Version Notice Banner */}
        {doc.versionNotice && (
          <div
            className={`mb-6 p-3 rounded-lg border text-xs flex items-center justify-between ${
              doc.versionNotice === 'v2.4.0 Preview'
                ? 'border-[var(--af-copper)]/40 bg-[var(--af-copper)]/10 text-[var(--af-copper)]'
                : 'border-[var(--af-accent)]/30 bg-[var(--af-accent)]/5 text-[var(--af-accent)]'
            }`}
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>
                <strong>Document Lifecycle Status:</strong> {doc.versionNotice}
              </span>
            </div>
            {doc.versionNotice === 'v2.4.0 Preview' && (
              <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--af-copper)]/20 font-bold">
                In Active Development
              </span>
            )}
          </div>
        )}

        {/* Header Title */}
        <div className="mb-8 border-b border-[var(--af-border)] pb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--af-text-primary)] tracking-tight font-display">
            {doc.title}
          </h1>
        </div>

        {/* Markdown Rendered Content */}
        <MarkdownRenderer content={doc.content} />

        {/* Prev / Next Page Navigation */}
        <div className="mt-16 pt-8 border-t border-[var(--af-border)] flex flex-col sm:flex-row items-center justify-between gap-4">
          {doc.prev ? (
            <Link
              href={doc.prev.href}
              className="w-full sm:w-auto p-4 rounded-lg border border-[var(--af-border)] bg-[var(--af-bg-surface)] hover:border-[var(--af-accent)] transition-all flex items-center gap-3 text-left group"
            >
              <ArrowLeft className="w-4 h-4 text-[var(--af-accent)] group-hover:-translate-x-1 transition-transform" />
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--af-text-subtle)] block">
                  Previous
                </span>
                <span className="text-sm font-semibold text-[var(--af-text-primary)] group-hover:text-[var(--af-accent)] transition-colors">
                  {doc.prev.title}
                </span>
              </div>
            </Link>
          ) : (
            <div />
          )}

          {doc.next ? (
            <Link
              href={doc.next.href}
              className="w-full sm:w-auto p-4 rounded-lg border border-[var(--af-border)] bg-[var(--af-bg-surface)] hover:border-[var(--af-accent)] transition-all flex items-center justify-between gap-3 text-right group ml-auto"
            >
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--af-text-subtle)] block">
                  Next
                </span>
                <span className="text-sm font-semibold text-[var(--af-text-primary)] group-hover:text-[var(--af-accent)] transition-colors">
                  {doc.next.title}
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-[var(--af-accent)] group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <div />
          )}
        </div>
      </main>

      {/* Right Hand Table of Contents */}
      <TableOfContents headings={doc.headings} />
    </div>
  );
}
