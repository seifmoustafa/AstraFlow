import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';

const sourcePath = (...parts: string[]) =>
  path.join(process.cwd(), 'src', ...parts);

function readSourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? readSourceFiles(entryPath) : [entryPath];
  });
}

test('locale configuration activates English and defines Arabic RTL direction for later activation', async () => {
  expect(existsSync(sourcePath('core', 'i18n', 'config.ts'))).toBe(true);

  const localeConfig = await import('../src/core/i18n/config');
  expect(localeConfig.ACTIVE_LOCALES).toEqual(['en']);
  expect(localeConfig.DEFAULT_LOCALE).toBe('en');
  expect(localeConfig.getDirection('en')).toBe('ltr');
  expect(localeConfig.getDirection('ar')).toBe('rtl');

  const requestConfig = await import('node:fs/promises').then(({ readFile }) =>
    readFile(sourcePath('core', 'i18n', 'request.ts'), 'utf8'),
  );
  expect(requestConfig).toContain('locale: DEFAULT_LOCALE');
  expect(requestConfig).not.toMatch(/requestLocale|setRequestLocale/);
});

test('each public route feature has its own module entry point', () => {
  const moduleEntrypoints = [
    ['modules', 'site', 'home', 'index.ts'],
    ['modules', 'catalog', 'packages', 'index.ts'],
    ['modules', 'documentation', 'index', 'index.ts'],
    ['modules', 'documentation', 'article', 'index.ts'],
    ['modules', 'learning', 'guides', 'index.ts'],
    ['modules', 'releases', 'changelog', 'index.ts'],
    ['modules', 'community', 'contribution', 'index.ts'],
  ];

  for (const entrypoint of moduleEntrypoints) {
    expect(existsSync(sourcePath(...entrypoint))).toBe(true);
  }
});

test('native form controls are encapsulated by shared core UI primitives', () => {
  const uiDirectory = sourcePath('core', 'ui');
  expect(existsSync(path.join(uiDirectory, 'Button.tsx'))).toBe(true);
  expect(existsSync(path.join(uiDirectory, 'Input.tsx'))).toBe(true);
  expect(existsSync(path.join(uiDirectory, 'Select.tsx'))).toBe(true);
  expect(existsSync(path.join(uiDirectory, 'Textarea.tsx'))).toBe(true);

  const violations = readSourceFiles(sourcePath())
    .filter((file) => !file.startsWith(uiDirectory))
    .filter((file) => file.endsWith('.tsx'))
    .flatMap((file) => {
      const source = readFileSync(file, 'utf8');
      const nativeControl = /<(button|input|select|textarea)\b/.exec(source);
      return nativeControl
        ? [`${path.relative(sourcePath(), file)} contains <${nativeControl[1]}>`]
        : [];
    });

  expect(violations).toEqual([]);
});

test('feature modules use another feature only through its public entry point', () => {
  const moduleDirectory = sourcePath('modules');
  const violations: string[] = [];

  for (const file of readSourceFiles(moduleDirectory)) {
    const relativePath = path.relative(moduleDirectory, file);
    const owner = relativePath.split(path.sep)[0];
    const source = readFileSync(file, 'utf8');
    const imports = source.matchAll(/from\s+['"](@modules\/[^'"]+)['"]/g);

    for (const match of imports) {
      const importedPath = match[1];
      const segments = importedPath.slice('@modules/'.length).split('/');
      const importedOwner = segments[0];
      const isPublicDocumentationClientData =
        importedPath === '@modules/documentation/data/client';

      if (
        importedOwner !== owner &&
        segments.length > 2 &&
        !isPublicDocumentationClientData
      ) {
        violations.push(`${relativePath} imports private path ${importedPath}`);
      }
    }
  }

  expect(violations).toEqual([]);
});

test('locale routing keeps current English paths unprefixed and does not expose Arabic', async () => {
  expect(existsSync(sourcePath('core', 'i18n', 'routing.ts'))).toBe(true);
  expect(existsSync(sourcePath('app', '(site)', 'layout.tsx'))).toBe(true);

  const { routing } = await import('../src/core/i18n/routing');
  expect(routing.locales).toEqual(['en']);
  expect(routing.defaultLocale).toBe('en');
  expect(routing.localePrefix).toBe('as-needed');
  expect(routing.localeDetection).toBe(false);
});
