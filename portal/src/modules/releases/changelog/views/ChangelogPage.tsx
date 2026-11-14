import type { Metadata } from "next";
import { getTranslations } from 'next-intl/server';
import {
  getAllChangelogReleases,
  getChangelogStats,
} from '../data/changelog-service';
import { ChangelogShell } from './index';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('releases.changelog.seo');
  return {
    title: t('title'),
    description: t('description'),
    alternates: { canonical: '/changelog' },
  };
}

export default function ChangelogPage() {
  const releases = getAllChangelogReleases();
  const stats = getChangelogStats();

  return <ChangelogShell releases={releases} stats={stats} />;
}
