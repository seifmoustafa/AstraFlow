import * as fs from 'node:fs';
import * as path from 'node:path';
import { readRepoText, resolveRepoPath } from '@core/server/repo-paths';
import { GITHUB_URL } from '@core/config/site-config';
import type {
  DirectoryBuildInfo,
  ExternalPackageDependency,
  PackageProjectSource,
} from './model';

function decodeXmlEntities(value: string): string {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function readXmlTag(xml: string, tagName: string): string | null {
  const match = xml.match(
    new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i'),
  );
  return match ? decodeXmlEntities(match[1].trim()) : null;
}

function readAttribute(attributes: string, name: string): string | null {
  const match = attributes.match(
    new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i'),
  );
  return match
    ? decodeXmlEntities((match[1] ?? match[2] ?? '').trim())
    : null;
}

function parseProjectReferences(xml: string): string[] {
  const references: string[] = [];
  const pattern = /<ProjectReference\b([^>]*)\/?>/gi;
  let match: RegExpExecArray | null = pattern.exec(xml);
  while (match) {
    const include = readAttribute(match[1], 'Include');
    if (include) {
      const normalized = include.replace(/\\/g, '/');
      const name = path.posix.basename(normalized, '.csproj');
      if (name && !references.includes(name)) references.push(name);
    }
    match = pattern.exec(xml);
  }
  return references;
}

function parsePackageReferences(xml: string): ExternalPackageDependency[] {
  const dependencies: ExternalPackageDependency[] = [];
  const groups = /<ItemGroup(?:\s+([^>]*))?>([\s\S]*?)<\/ItemGroup>/gi;
  let group: RegExpExecArray | null = groups.exec(xml);

  while (group) {
    const condition = readAttribute(group[1] ?? '', 'Condition');
    const references = /<PackageReference\b([^>]*)\/?>/gi;
    let reference: RegExpExecArray | null = references.exec(group[2]);
    while (reference) {
      const attributes = reference[1];
      const id = readAttribute(attributes, 'Include');
      if (id) {
        dependencies.push({
          id,
          version: readAttribute(attributes, 'Version') ?? '',
          privateAssets:
            (readAttribute(attributes, 'PrivateAssets') ?? '').toLowerCase() ===
            'all',
          condition,
        });
      }
      reference = references.exec(group[2]);
    }
    group = groups.exec(xml);
  }

  return dependencies;
}

function parseFrameworkReferences(xml: string): string[] {
  const references: string[] = [];
  const pattern = /<FrameworkReference\b([^>]*)\/?>/gi;
  let match: RegExpExecArray | null = pattern.exec(xml);
  while (match) {
    const id = readAttribute(match[1], 'Include');
    if (id && !references.includes(id)) references.push(id);
    match = pattern.exec(xml);
  }
  return references;
}

export function readDirectoryBuildInfo(): DirectoryBuildInfo {
  const propsXml = readRepoText('Directory.Build.props');
  const sourceVersion = readXmlTag(propsXml, 'Version');
  if (!sourceVersion) {
    throw new Error('Directory.Build.props does not declare the package source version.');
  }
  return {
    sourceVersion,
    license: readXmlTag(propsXml, 'PackageLicenseExpression') ?? 'MIT',
    repositoryUrl: readXmlTag(propsXml, 'RepositoryUrl') ?? GITHUB_URL,
    authors: readXmlTag(propsXml, 'Authors') ?? 'AstraFlow Contributors',
  };
}

export function readPackageProjectSources(): PackageProjectSource[] {
  const sourceDirectory = resolveRepoPath('src');
  const projects: PackageProjectSource[] = [];

  for (const entry of fs.readdirSync(sourceDirectory, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const absolutePath = path.join(
      sourceDirectory,
      entry.name,
      `${entry.name}.csproj`,
    );
    if (!fs.existsSync(absolutePath)) continue;

    const xml = fs.readFileSync(absolutePath, 'utf8').replace(/^\uFEFF/, '');
    const id = readXmlTag(xml, 'PackageId') ?? entry.name;
    const tags = (readXmlTag(xml, 'PackageTags') ?? '')
      .split(';')
      .map((tag) => tag.trim())
      .filter(Boolean);
    const frameworkValue =
      readXmlTag(xml, 'TargetFrameworks') ??
      readXmlTag(xml, 'TargetFramework') ??
      '';
    const targetFrameworks = frameworkValue
      .split(';')
      .map((framework) => framework.trim())
      .filter(Boolean);

    projects.push({
      id,
      directoryName: entry.name,
      title: readXmlTag(xml, 'Title') ?? id,
      description: readXmlTag(xml, 'Description'),
      tags,
      targetFrameworks,
      packAsTool: (readXmlTag(xml, 'PackAsTool') ?? '').toLowerCase() === 'true',
      toolCommandName: readXmlTag(xml, 'ToolCommandName'),
      includesBuildOutput:
        (readXmlTag(xml, 'IncludeBuildOutput') ?? 'true').toLowerCase() !==
        'false',
      projectReferences: parseProjectReferences(xml),
      externalDependencies: parsePackageReferences(xml),
      frameworkReferences: parseFrameworkReferences(xml),
      csprojPath: `src/${entry.name}/${path.basename(absolutePath)}`,
    });
  }

  return projects;
}
