import type { DocCategory, DocSummary } from './model';

/** Shared deterministic ranking for server-side search and the interactive browser search. */
export function searchDocSummaries(
  docs: readonly DocSummary[],
  query: string,
  selectedCategory: DocCategory | 'All' = 'All',
): DocSummary[] {
  const categoryPool =
    selectedCategory === 'All'
      ? docs
      : docs.filter((doc) => doc.category === selectedCategory);
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [...categoryPool];

  return categoryPool
    .map((doc) => {
      const title = doc.title.toLowerCase();
      const slug = doc.slugPath.toLowerCase();
      let score = 0;
      for (const term of terms) {
        if (title === term || slug === term) score += 100;
        else if (title.includes(term)) score += 40;
        else if (slug.includes(term)) score += 25;
        else if (doc.summary.toLowerCase().includes(term)) score += 15;
        else if (doc.searchText.includes(term)) score += 5;
        else return null;
      }
      return { doc, score };
    })
    .filter((entry): entry is { doc: DocSummary; score: number } => entry !== null)
    .sort((left, right) => right.score - left.score)
    .map((entry) => entry.doc);
}
