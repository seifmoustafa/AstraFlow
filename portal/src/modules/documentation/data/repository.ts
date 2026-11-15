import * as fs from 'node:fs';
import * as path from 'node:path';
import { resolveRepoPath } from '@core/server/repo-paths';
import type { DocMarkdownSource } from './model';

function resolvePortalDocsDirectory(): string {
  const cwdCandidate = path.join(process.cwd(), 'src', 'content', 'docs');
  if (fs.existsSync(cwdCandidate)) return cwdCandidate;

  const repoCandidate = resolveRepoPath('portal', 'src', 'content', 'docs');
  return fs.existsSync(repoCandidate) ? repoCandidate : cwdCandidate;
}

function discoverMarkdownPaths(directory: string, prefix = ''): string[] {
  if (!fs.existsSync(directory)) return [];

  const files: string[] = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...discoverMarkdownPaths(fullPath, relativePath));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
      files.push(relativePath);
    }
  }
  return files;
}

/** Reads the authored Markdown files that form the portal documentation corpus. */
export function readPortalDocSources(): DocMarkdownSource[] {
  const directory = resolvePortalDocsDirectory();
  return discoverMarkdownPaths(directory).map((relativePath) => ({
    relativePath,
    markdown: fs.readFileSync(path.join(directory, relativePath), 'utf8'),
  }));
}
