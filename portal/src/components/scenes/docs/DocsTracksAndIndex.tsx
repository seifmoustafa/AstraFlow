import Link from 'next/link';
import type { DocCategoryGroup, DocSummary } from '@/lib/docs';
import styles from './DocsTracksAndIndex.module.css';

export interface DocsTracksAndIndexProps {
  categories: DocCategoryGroup[];
  docs: DocSummary[];
}

interface ReadingTrack {
  id: string;
  number: string;
  title: string;
  description: string;
  slugs: string[];
}

const READING_TRACKS: readonly ReadingTrack[] = [
  {
    id: 'first-15-minutes',
    number: 'Track 01',
    title: 'First 15 Minutes',
    description:
      'Pick the right packages, inspect the contracts boundary, and wire AstraFlow into a solution.',
    slugs: ['getting-started', 'package-selection', 'architecture', 'compatibility'],
  },
  {
    id: 'request-and-mapping-core',
    number: 'Track 02',
    title: 'Mediator & Mapping Core',
    description:
      'Dispatch requests, configure pipeline behaviors, define convention maps, and project EF Core queries.',
    slugs: ['mediator', 'mapper', 'convention-mapping', 'projections'],
  },
  {
    id: 'compile-time-and-inspection',
    number: 'Track 03',
    title: 'Generators, Analyzers & CLI',
    description:
      'Move hot mapping and handler wiring to compile time while auditing registrations with the CLI.',
    slugs: ['generators', 'analyzers', 'diagnostics', 'cli'],
  },
  {
    id: 'testing-web-and-telemetry',
    number: 'Track 04',
    title: 'Testing, ASP.NET Core & Telemetry',
    description:
      'Add test doubles and source assertions alongside HTTP endpoint integration and observability.',
    slugs: ['testing', 'assertions', 'aspnetcore', 'observability'],
  },
];

function categoryAnchorId(category: string): string {
  return `doc-cat-${category
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')}`;
}

export function DocsTracksAndIndex({ categories, docs }: DocsTracksAndIndexProps) {
  const bySlug = new Map<string, DocSummary>();
  for (const doc of docs) {
    bySlug.set(doc.slugPath, doc);
  }

  return (
    <>
      <section aria-labelledby="reading-tracks-heading" className={styles.tracksSection} id="reading-tracks">
        <div className={styles.inner}>
          <header className={styles.sectionHeader}>
            <div>
              <div className={styles.eyebrow}>
                <span aria-hidden="true" className={styles.eyebrowRule} />
                Curated Reading Tracks
              </div>
              <h2 className={styles.title} id="reading-tracks-heading">
                Four guided sequences across the repository
              </h2>
            </div>
            <p className={styles.lead}>
              Follow a linear reading sequence when onboarding to the mediator, mapper, source
              generators, or verification surface—every card opens directly into the underlying Markdown guide.
            </p>
          </header>

          <div className={styles.tracksGrid}>
            {READING_TRACKS.map((track) => {
              const resolvedSteps = track.slugs
                .map((slug) => bySlug.get(slug))
                .filter((doc): doc is DocSummary => Boolean(doc));

              const totalMinutes = resolvedSteps.reduce((acc, doc) => acc + doc.readingMinutes, 0);

              return (
                <article className={styles.trackCard} key={track.id}>
                  <div className={styles.trackTop}>
                    <span className={styles.trackNum}>{track.number}</span>
                    <span className={styles.trackDuration}>
                      {resolvedSteps.length} guides · ~{totalMinutes} min
                    </span>
                  </div>
                  <div>
                    <h3 className={styles.trackTitle}>{track.title}</h3>
                    <p className={styles.trackDesc}>{track.description}</p>
                  </div>

                  <ol className={styles.stepList}>
                    {resolvedSteps.map((doc, idx) => (
                      <li key={doc.slugPath}>
                        <Link className={styles.stepLink} href={doc.href}>
                          <span className={styles.stepOrder}>
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <span className={styles.stepText}>
                            <span className={styles.stepName}>{doc.title}</span>
                            <span className={styles.stepPath}>{doc.sourcePath}</span>
                          </span>
                          <span className={styles.stepMeta}>{doc.readingMinutes} min ↗</span>
                        </Link>
                      </li>
                    ))}
                  </ol>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section aria-labelledby="category-index-heading" className={styles.indexSection} id="category-index">
        <div className={styles.inner}>
          <header className={styles.sectionHeader}>
            <div>
              <div className={styles.eyebrow}>
                <span aria-hidden="true" className={styles.eyebrowRule} />
                Complete Repository Index
              </div>
              <h2 className={styles.title} id="category-index-heading">
                All {docs.length} documents by domain
              </h2>
            </div>
            <p className={styles.lead}>
              Full directory synced from repository Markdown files—every guide, architecture decision
              record, compatibility table, and release note is statically rendered below.
            </p>
          </header>

          <nav aria-label="Documentation categories" className={styles.categoryNav}>
            {categories.map((group) => (
              <a
                className={styles.categoryChip}
                href={`#${categoryAnchorId(group.category)}`}
                key={group.category}
              >
                <span>{group.category}</span>
                <span className={styles.chipCount}>{group.docs.length}</span>
              </a>
            ))}
          </nav>

          <div className={styles.categoriesGrid}>
            {categories.map((group) => (
              <section
                aria-labelledby={`${categoryAnchorId(group.category)}-heading`}
                className={styles.categoryCard}
                id={categoryAnchorId(group.category)}
                key={group.category}
              >
                <div className={styles.categoryHeader}>
                  <h3 className={styles.categoryTitle} id={`${categoryAnchorId(group.category)}-heading`}>
                    {group.category}
                  </h3>
                  <span className={styles.categoryCount}>
                    {group.docs.length} {group.docs.length === 1 ? 'doc' : 'docs'}
                  </span>
                </div>

                <ul className={styles.docList}>
                  {group.docs.map((doc) => (
                    <li key={doc.slugPath}>
                      <Link className={styles.docLink} href={doc.href}>
                        <div>
                          <div className={styles.docTitle}>{doc.title}</div>
                          <p className={styles.docSummary}>{doc.summary}</p>
                        </div>
                        <div className={styles.docRight}>
                          <span className={styles.docMinutes}>{doc.readingMinutes}m</span>
                          <span className={styles.docSource}>
                            {doc.sourcePath.replace(/^docs\//, '')}
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
