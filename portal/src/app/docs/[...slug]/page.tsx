import React from "react";
import { notFound } from "next/navigation";
import {
  getAllCategories,
  getDocBySlug,
  getAllDocSlugs,
} from "@/lib/docs-loader";
import { MarkdownRenderer } from "@/components/docs/MarkdownRenderer";
import { DocsShell } from "@/components/docs/DocsShell";

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
    return { title: "Document Not Found — AstraFlow" };
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
    <DocsShell doc={doc} categories={categories}>
      <MarkdownRenderer content={doc.content} />
    </DocsShell>
  );
}
