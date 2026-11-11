import fs from 'fs';
import path from 'path';

export interface ChangelogItem {
  type: 'breaking' | 'added' | 'changed' | 'fixed' | 'security' | 'deprecated' | 'removed' | 'other';
  text: string;
}

export interface ChangelogSection {
  title: string;
  type: 'breaking' | 'added' | 'changed' | 'fixed' | 'security' | 'deprecated' | 'removed' | 'other';
  items: string[];
}

export interface ChangelogRelease {
  version: string;
  rawHeader: string;
  status: 'published' | 'preview' | 'unverified' | 'historical';
  dateNotice?: string;
  summary?: string;
  sections: ChangelogSection[];
  totalChanges: number;
}

function getChangelogPath(): string {
  const candidates = [
    path.resolve(process.cwd(), '../CHANGELOG.md'),
    path.resolve(process.cwd(), 'CHANGELOG.md'),
    path.resolve(__dirname, '../../../../CHANGELOG.md'),
    'D:\\02_PACKAGES\\asp.net_packages\\AstraFlow\\CHANGELOG.md',
  ];

  for (const p of candidates) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  return 'D:\\02_PACKAGES\\asp.net_packages\\AstraFlow\\CHANGELOG.md';
}

function parseSectionType(header: string): ChangelogSection['type'] {
  const lower = header.toLowerCase();
  if (lower.includes('breaking')) return 'breaking';
  if (lower.includes('added')) return 'added';
  if (lower.includes('changed')) return 'changed';
  if (lower.includes('fixed')) return 'fixed';
  if (lower.includes('security')) return 'security';
  if (lower.includes('deprecated')) return 'deprecated';
  if (lower.includes('removed')) return 'removed';
  return 'other';
}

export function getChangelogData(): {
  releases: ChangelogRelease[];
  stats: {
    totalReleases: number;
    totalChanges: number;
    breakingCount: number;
    securityCount: number;
    latestPublished: string;
    inDevelopment: string;
  };
} {
  const filePath = getChangelogPath();
  if (!fs.existsSync(filePath)) {
    return {
      releases: [],
      stats: {
        totalReleases: 0,
        totalChanges: 0,
        breakingCount: 0,
        securityCount: 0,
        latestPublished: '2.3.0',
        inDevelopment: '2.4.0',
      },
    };
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split(/\r?\n/);

  const releases: ChangelogRelease[] = [];
  let currentRelease: ChangelogRelease | null = null;
  let currentSection: ChangelogSection | null = null;
  let summaryBuffer: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Match ## Version header
    const releaseMatch = line.match(/^##\s+(.+)$/);
    if (releaseMatch) {
      if (currentRelease) {
        if (currentSection && currentSection.items.length > 0) {
          currentRelease.sections.push(currentSection);
          currentSection = null;
        }
        if (summaryBuffer.length > 0 && !currentRelease.summary) {
          currentRelease.summary = summaryBuffer.join(' ').trim();
        }
        currentRelease.totalChanges = currentRelease.sections.reduce((acc, s) => acc + s.items.length, 0);
        releases.push(currentRelease);
      }

      const rawHeader = releaseMatch[1].trim();
      const versionMatch = rawHeader.match(/^([0-9]+\.[0-9]+(\.[0-9]+)?(-[a-zA-Z0-9.]+)?)/);
      const version = versionMatch ? versionMatch[1] : rawHeader.split(' ')[0];

      let status: 'published' | 'preview' | 'unverified' | 'historical' = 'published';
      const lowerHeader = rawHeader.toLowerCase();
      if (lowerHeader.includes('unreleased')) {
        status = 'preview';
      } else if (lowerHeader.includes('unverified')) {
        status = 'unverified';
      } else if (rawHeader.includes('1.x') || rawHeader.startsWith('1.') || rawHeader.startsWith('0.')) {
        status = 'historical';
      }

      currentRelease = {
        version,
        rawHeader,
        status,
        dateNotice: rawHeader.includes('(') ? rawHeader.replace(/^[^(]*\(([^)]+)\).*$/, '$1') : undefined,
        sections: [],
        totalChanges: 0,
      };
      currentSection = null;
      summaryBuffer = [];
      continue;
    }

    if (!currentRelease) continue;

    // Match ### Section header
    const sectionMatch = line.match(/^###\s+(.+)$/);
    if (sectionMatch) {
      if (currentSection && currentSection.items.length > 0) {
        currentRelease.sections.push(currentSection);
      }
      const sectionTitle = sectionMatch[1].trim();
      currentSection = {
        title: sectionTitle,
        type: parseSectionType(sectionTitle),
        items: [],
      };
      continue;
    }

    // Bullet items
    const bulletMatch = line.match(/^[-*]\s+(.+)$/);
    if (bulletMatch) {
      const itemText = bulletMatch[1].trim();
      if (itemText.toLowerCase() === 'none.' || itemText.toLowerCase() === 'none') {
        // Skip explicit empty sections or keep them if needed
        continue;
      }
      if (currentSection) {
        currentSection.items.push(itemText);
      } else {
        // Uncategorized bullet under version
        if (!currentSection) {
          currentSection = {
            title: 'General',
            type: 'added',
            items: [],
          };
        }
        currentSection.items.push(itemText);
      }
      continue;
    }

    // Capture summary text lines between ## Version and first ### Section
    if (!currentSection && line.trim().length > 0 && !line.startsWith('#')) {
      summaryBuffer.push(line.trim());
    }
  }

  // Push final release
  if (currentRelease) {
    if (currentSection && currentSection.items.length > 0) {
      currentRelease.sections.push(currentSection);
    }
    if (summaryBuffer.length > 0 && !currentRelease.summary) {
      currentRelease.summary = summaryBuffer.join(' ').trim();
    }
    currentRelease.totalChanges = currentRelease.sections.reduce((acc, s) => acc + s.items.length, 0);
    releases.push(currentRelease);
  }

  let totalChanges = 0;
  let breakingCount = 0;
  let securityCount = 0;

  for (const r of releases) {
    totalChanges += r.totalChanges;
    for (const s of r.sections) {
      if (s.type === 'breaking') breakingCount += s.items.length;
      if (s.type === 'security') securityCount += s.items.length;
    }
  }

  return {
    releases,
    stats: {
      totalReleases: releases.length,
      totalChanges,
      breakingCount,
      securityCount,
      latestPublished: '2.3.0',
      inDevelopment: '2.4.0 (unreleased)',
    },
  };
}
