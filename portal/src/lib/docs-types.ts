import type { ProvenanceNotice } from './provenance';

export interface DocItem {
  slug: string;
  title: string;
  description?: string;
  category: string;
  categorySlug: string;
  versionNotice?: ProvenanceNotice;
  filename: string;
  order: number;
}

export interface DocCategory {
  title: string;
  slug: string;
  order: number;
  items: DocItem[];
}

export interface DocPageData {
  slug: string;
  title: string;
  category: string;
  versionNotice?: string;
  content: string;
  headings: { id: string; text: string; level: number }[];
  prev?: { title: string; href: string };
  next?: { title: string; href: string };
}
