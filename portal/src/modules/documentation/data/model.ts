import type { CodeSnippet, TocItem } from './markdown';

export type DocCategory =
  | 'Getting Started'
  | 'Mediator & Pipelines'
  | 'Mapping & Projections'
  | 'Framework Integrations'
  | 'Testing, Diagnostics & Tooling';

export interface DocNavLink {
  slug: string[];
  slugPath: string;
  href: string;
  title: string;
  category: DocCategory;
}

export interface DocSummary {
  slug: string[];
  slugPath: string;
  href: string;
  sourcePath: string;
  category: DocCategory;
  title: string;
  summary: string;
  readingMinutes: number;
  wordCount: number;
  plainExcerpt: string;
  searchText: string;
  firstCodeSnippet: CodeSnippet | null;
  githubUrl: string;
  prevSlug: string[] | null;
  nextSlug: string[] | null;
  prev: DocNavLink | null;
  next: DocNavLink | null;
  toc: TocItem[];
  isUnreleasedSource: boolean;
}

export interface DocDetail extends DocSummary {
  html: string;
  resolvedFromAlias: string | null;
}

export interface DocCategoryGroup {
  category: DocCategory;
  docs: DocSummary[];
}

export interface RawDocEntry {
  slug: string[];
  slugPath: string;
  sourcePath: string;
  markdown: string;
  category: DocCategory;
  title: string;
}

export interface DocMarkdownSource {
  relativePath: string;
  markdown: string;
}
