# AstraFlow Portal Stabilization & Zero-CLS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring portal E2E verification to `120 passed, 0 failed`, eliminate remaining layout shifts across `/docs`, `/docs/[...slug]`, and `/community`, convert remaining scroll/hero motion to compositor-safe transforms, remove unused `lenis`, clean up lint/untracked artifacts, and synchronize legacy path references in agent rules.

**Architecture:** Preserve the Warm Forest design tokens, light theme, standard browser scrolling (`behavior: "auto"`), and `src/core` / `src/modules` module boundaries. Move documentation code-block headers/copy bars into SSR markdown HTML (`@core/content/markdown.ts`), stabilize ToC link geometry and hero readout boxes via CSS `min-height` and stacked opacity crossfades, share a single clipboard helper from `@core/ui`, and drive E2E release assertions dynamically from portal data modules.

**Tech Stack:** Next.js 16 (`next build --webpack`), React 19, TypeScript 5.8, `next-intl`, `marked`, GSAP `ScrollTrigger`, CSS Modules + `globals.css`, Playwright, ESLint 9.

**Spec:** `docs/superpowers/specs/2026-11-16-portal-zero-cls-and-stabilization-design.md`

## Global Constraints

- Preserve all routes (`/`, `/packages`, `/docs`, `/docs/[...slug]`, `/guides`, `/changelog`, `/community`), `SiteHeader`/`SiteFooter` shell, Warm Forest design tokens, WCAG 2.2 AA contrast, and `prefers-reduced-motion` behavior.
- Keep standard default browser scrolling (`behavior: "auto"`, no `Lenis`, no `scroll-behavior: smooth`, no `data-scroll-behavior="smooth"`).
- Native form controls (`<button>`, `<input>`, `<select>`, `<textarea>`) stay encapsulated in `portal/src/core/ui/` primitives across `.tsx` files (`tests/portal-architecture.spec.ts`).
- Do not violate feature-module boundaries (`@modules/<owner>` public barrel imports only) or expose internal governance terms (`ADR-*`, `AFAN*`, `AFD*`, `roadmap`, `future-ideas`).
- Do not run `git push`, `npm publish`, or NuGet commands. On Windows PowerShell 5, separate chained shell statements with `;` rather than `&&`.

---

## File Structure

- `portal/src/core/ui/clipboard.ts`, `portal/src/core/ui/index.ts`: Shared browser `copyTextToClipboard(text)` utility.
- `portal/src/core/content/markdown.ts`, `portal/src/modules/documentation/data/service.ts`: SSR `.docs-code-wrap` / `.docs-code-bar` emission with localized labels.
- `portal/src/core/design/globals.css`: Constant ToC link inset geometry + SSR `.docs-code-*` styling beside `.docs-prose pre.code-block`.
- `portal/src/modules/documentation/article/views/DocEnhancements.tsx`, `portal/src/modules/documentation/article/views/DocEnhancements.module.css`: Delegated SSR code-copy listener, rAF compositor `scaleX` reading progress bar, weight-neutral `.activeTocLink`, removal of imperative DOM code-block wrapper.
- `portal/src/modules/documentation/index/views/DocsHeroDesk.tsx`, `portal/src/modules/documentation/index/views/DocsHeroDesk.module.css`: Fixed `min-height` stacked opacity crossfade inside `.readoutBar`.
- `portal/src/modules/documentation/index/views/DocsSearch.tsx`: Shared `copyTextToClipboard` import and localized `t('readMinutes', ...)`.
- `portal/src/modules/community/contribution/views/CommunityContributionCurrent.module.css`: Responsive `min-height` on `.inspectorPanel` across desktop and mobile.
- `portal/src/core/motion/HeroChoreography.tsx`: Outer WAAPI container + inner `ScrollTrigger` scrub wrapper in `HeroStageEntrance`.
- `portal/src/app/layout.tsx`, `portal/tests/package-provenance.spec.ts`, `portal/tests/scenes-interaction.spec.ts`, `portal/tests/docs-domain.spec.ts`: Vercel Analytics guard verification, dynamic release-metadata assertions, and SSR code-block + ToC/CLS regressions.
- `portal/package.json`, `portal/package-lock.json`, `portal/eslint.config.mjs`, `.agents/rules/portal-and-content.md`, `AGENTS.md`: Uninstall `lenis`, ignore `artifacts/**`, remove untracked `portal/artifacts/` + `portal/debug.log`, update stale `src/lib/*` doc paths.

---

### Task 1: Shared Clipboard Utility & Localized Docs Search Read-Minutes

**Files:**
- Create: `portal/src/core/ui/clipboard.ts`
- Modify: `portal/src/core/ui/index.ts:1-4`
- Modify: `portal/src/modules/documentation/index/views/DocsSearch.tsx:1-68,241-254,483-491`
- Test: `portal/tests/docs-domain.spec.ts`

**Interfaces:**
- Produces: `copyTextToClipboard(text: string): Promise<boolean>` exported from `@core/ui` (`portal/src/core/ui/index.ts`).
- Consumes: `documentation.search.readMinutes` message key (`'{count} min read'`) in `DocsSearch.tsx`.

- [ ] **Step 1: Write failing Playwright assertion for localized `min read` label in `DocsSearch` preview**

Add a focused check in `portal/tests/scenes-interaction.spec.ts` inside test `"4. Docs DocsReferenceDesk..."` right after line `386` (checking preview metadata renders `min read` via locale formatting rather than hardcoded uppercase `MIN READ`):

```ts
await expect(preview).toContainText(/\d+\s+min read/i);
const previewText = await preview.innerText();
expect(previewText).not.toContain('MIN READ');
```

- [ ] **Step 2: Run the focused test to confirm current uppercase `MIN READ` fails**

Run:
```powershell
Set-Location "d:\02_PACKAGES\asp.net_packages\AstraFlow\portal"
npx playwright test tests/scenes-interaction.spec.ts --project=desktop-chromium -g "4\. Docs DocsReferenceDesk"
```
Expected: FAIL asserting `previewText` does not contain `'MIN READ'` (`DocsSearch.tsx:488` renders `{activeDoc.readingMinutes} MIN READ`).

- [ ] **Step 3: Create `portal/src/core/ui/clipboard.ts` and export from `portal/src/core/ui/index.ts`**

Create `portal/src/core/ui/clipboard.ts`:
```ts
export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback below for restricted clipboard permissions
    }
  }

  if (typeof document === 'undefined') {
    return false;
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}
```

Update `portal/src/core/ui/index.ts`:
```ts
export { Button } from './Button';
export { copyTextToClipboard } from './clipboard';
export { Input } from './Input';
export { Select } from './Select';
export { Textarea } from './Textarea';
```

- [ ] **Step 4: Refactor `DocsSearch.tsx` to use `copyTextToClipboard` and localized `t('readMinutes')`**

In `portal/src/modules/documentation/index/views/DocsSearch.tsx`:
- Import `copyTextToClipboard` alongside `Button, Input` from `@core/ui`.
- Delete lines `43-67` (`async function copyText(text: string)...`) and change `copyText(...)` at line `243` to `copyTextToClipboard(activeDoc.firstCodeSnippet.code)`.
- Replace line `488`:
```tsx
{t('readMinutes', { count: String(activeDoc.readingMinutes) })}
```

- [ ] **Step 5: Run focused `Docs` Playwright check and `npm run typecheck`**

Run:
```powershell
Set-Location "d:\02_PACKAGES\asp.net_packages\AstraFlow\portal"
npm run typecheck
npm run build
npx playwright test tests/scenes-interaction.spec.ts --project=desktop-chromium -g "4\. Docs DocsReferenceDesk"
```
Expected: PASS (`0` failures on `4. Docs` test; build & typecheck exit `0`).

---

### Task 2: Dynamic Release-Metadata Parity in E2E & Verify Analytics Guard

**Files:**
- Verify: `portal/src/app/layout.tsx:52-66`
- Modify: `portal/tests/package-provenance.spec.ts:28-47,193-210,258-270,294-308`
- Modify: `portal/tests/scenes-interaction.spec.ts:216-221,460,510-515,534,604-655`

**Interfaces:**
- Consumes: `LATEST_PUBLISHED_VERSION`, `LATEST_PUBLISHED_DATE`, `PREVIOUS_PUBLISHED_VERSION` from `../src/core/config/site-config`; `getAllPackages`, `getPackageReleaseLabel` from `../src/modules/catalog/packages`; `getAllChangelogReleases`, `selectFeaturedReleases`, `classifyReleaseProvenance` from `../src/modules/releases/changelog`.

- [ ] **Step 1: Verify `portal/src/app/layout.tsx:62` retains `{process.env.VERCEL === '1' ? <Analytics /> : null}`**

Confirm no unguarded `<Analytics />` exists anywhere under `portal/src/` (`Select-String -Pattern "<Analytics"` matches only the `process.env.VERCEL === '1'` guard).

- [ ] **Step 2: Parameterize `portal/tests/package-provenance.spec.ts` against portal release metadata**

Update imports and assertions in `portal/tests/package-provenance.spec.ts`:
- Import `getPublishedReleaseVersion` from `../src/modules/catalog/packages` and `LATEST_PUBLISHED_VERSION`, `LATEST_PUBLISHED_DATE`, `PREVIOUS_PUBLISHED_VERSION`, `KNOWN_RELEASE_DATES` from `../src/core/config/site-config`.
- Replace hardcoded version literals at lines `31-46`, `193-210`, `258-270`, and `294-308`:

```ts
test('package release metadata is complete, explicit, and valid', () => {
  const releases = validatePackageReleaseManifest(PACKAGE_ORDER, PACKAGE_RELEASES);

  expect([LATEST_PUBLISHED_VERSION, LATEST_PUBLISHED_DATE, PREVIOUS_PUBLISHED_VERSION]).toEqual([
    LATEST_PUBLISHED_VERSION,
    KNOWN_RELEASE_DATES[LATEST_PUBLISHED_VERSION] ?? LATEST_PUBLISHED_DATE,
    PREVIOUS_PUBLISHED_VERSION,
  ]);
  expect(LATEST_PUBLISHED_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  expect(LATEST_PUBLISHED_DATE).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  expect(releases.size).toBe(PACKAGE_ORDER.length);
  expect(releases.get('AstraFlow.Assertions')).toEqual({
    availability: 'published',
    version: getPublishedReleaseVersion('AstraFlow.Assertions'),
    publishedAt: LATEST_PUBLISHED_DATE,
  });
  expect(releases.get('AstraFlow.Mediator')).toEqual({
    availability: 'published',
    version: getPublishedReleaseVersion('AstraFlow.Mediator'),
    publishedAt: LATEST_PUBLISHED_DATE,
  });
});
```

At lines `193-210` (`published Assertions package metadata matches its current release`):
```ts
test('published Assertions package metadata matches its current release', () => {
  const packages = getAllPackages();
  const assertions = packages.find((pkg) => pkg.id === 'AstraFlow.Assertions');
  const expectedVersion = getPublishedReleaseVersion('AstraFlow.Assertions');

  expect(assertions).toMatchObject({
    release: { availability: 'published', version: expectedVersion },
    sourceVersion: expectedVersion,
    distribution: {
      nugetUrl: `https://www.nuget.org/packages/AstraFlow.Assertions/${expectedVersion}`,
      installCommand: `dotnet add package AstraFlow.Assertions --version ${expectedVersion}`,
      packageReferenceXml: `<PackageReference Include="AstraFlow.Assertions" Version="${expectedVersion}" />`,
    },
  });
});
```

At lines `258-270`:
```ts
  const assertionsStack = resolvePackageStack([
    'AstraFlow.Assertions',
    'AstraFlow.Mediator',
  ]);
  const mediatorVersion = getPublishedReleaseVersion('AstraFlow.Mediator');
  const assertionsVersion = getPublishedReleaseVersion('AstraFlow.Assertions');
  expect(assertionsStack.combinedBlock).toContain(
    `dotnet add package AstraFlow.Mediator --version ${mediatorVersion}`,
  );
  expect(assertionsStack.combinedBlock).toContain(
    `dotnet add package AstraFlow.Assertions --version ${assertionsVersion}`,
  );
```

At lines `294-308`:
```ts
  const expectedSupportedCount = releases.filter(
    (release) => (parseSemver(release.version)?.major ?? 0) >= SUPPORTED_MIN_MAJOR,
  ).length;
  expect(supportedLineReleases).toHaveLength(expectedSupportedCount);
  expect(supportedLineReleases.length).toBeGreaterThanOrEqual(5);
  for (const release of supportedLineReleases) {
    expect(release.isDeprecated).toBe(false);
  }

  const featured = selectFeaturedReleases(releases);
  expect(featured.length).toBeGreaterThan(0);
  expect(featured.length).toBeLessThanOrEqual(6);
  const featuredVersions = featured.map((release) => release.version);
  expect(featuredVersions[0]).toBe(LATEST_PUBLISHED_VERSION);
  expect(featuredVersions).toContain(PREVIOUS_PUBLISHED_VERSION);
  expect(featuredVersions).toContain('2.0.0');

- [ ] **Step 3: Parameterize `portal/tests/scenes-interaction.spec.ts` release assertions**

Import from top of `portal/tests/scenes-interaction.spec.ts`:
```ts
import {
  LATEST_PUBLISHED_VERSION,
  PREVIOUS_PUBLISHED_VERSION,
} from '../src/core/config/site-config';
import { getPackageReleaseLabel } from '../src/modules/catalog/packages';
import { getAllChangelogReleases } from '../src/modules/releases/changelog';
```

Update lines `218-221` (`Testing` tab badge):
```ts
await expect(
  page.getByRole("tabpanel").getByText(getPackageReleaseLabel('AstraFlow.Testing')),
).toBeVisible();
```

Update line `460`:
```ts
test("5. Guides GuidesKineticRunway milestones 01..06 mouse & keyboard + published suite", async ({
```
And update line `513`:
```ts
  await expect(runwayWorkbench).toContainText(`AstraFlow ${LATEST_PUBLISHED_VERSION} Suite`);
```

Update line `534`:
```ts
test("6. Changelog ChangelogFolioHero & ChangelogChronicle provenance filters & latest release notes", async ({
```
And replace lines `604-679` inside test `"6. Changelog..."`:
```ts
  const releases = getAllChangelogReleases();
  const latestMeta = releases.find((r) => r.status === 'latest') ?? releases[0];
  const featureMeta = releases.find((r) => r.status === 'feature');
  const majorMeta = releases.find((r) => r.status === 'major');
  const minorArchiveMeta = featureMeta
    ? releases.find((r) => r.status === 'feature' && r.version !== featureMeta.version)
    : undefined;

  await latestPill.click();
  const latestRelease = releasesSection.getByRole("button", {
    name: new RegExp(`^v${latestMeta.version.replace(/\./g, "\\.")} ${latestMeta.statusLabel}`),
  });
  await expect(latestRelease).toBeVisible();
  await latestRelease.click();
  await expect(page.locator(`article[id="${latestMeta.anchorId}"]`)).toBeVisible();

  await majorPill.click();
  if (majorMeta) {
    await expect(page.locator(`article[id="${majorMeta.anchorId}"]`)).toBeVisible();
  }

  await featurePill.click();
  if (featureMeta) {
    await expect(page.locator(`article[id="${featureMeta.anchorId}"]`)).toBeVisible();
  }

  await archivePill.click();
  await expect(releasesSection).toBeVisible();

  await breakingPill.click();
  await expect(releasesSection).toBeVisible();

  await deprecatedPill.click();
  const legacyButton = releasesSection.getByRole("button", {
    name: /^v1\.13\.1 Deprecated · 1\.x/,
  });
  await expect(legacyButton).toBeVisible();
  await legacyButton.click();
  const legacyArticle = page.locator('article[id="v1.13.1"]');
  await expect(legacyArticle).toBeVisible();
  await expect(legacyArticle).toContainText(/Deprecated · 1\.x Archive/i);
  await expect(legacyArticle).toContainText(/deprecated on NuGet\.org/i);

  await allPill.click();

  expect(latestMeta.version).toBe(LATEST_PUBLISHED_VERSION);
  const spineTargets = [latestMeta, featureMeta, minorArchiveMeta].filter(
    (entry): entry is NonNullable<typeof entry> => Boolean(entry),
  );
  expect(spineTargets.some((entry) => entry.version === PREVIOUS_PUBLISHED_VERSION)).toBe(true);

  for (const rel of spineTargets) {
    const versionRegex = new RegExp(`^v${rel.version.replace(/\./g, "\\.")}$`);
    const spineBtn = releasesSection
      .locator("ol button")
      .filter({ has: page.locator("span", { hasText: versionRegex }) })
      .first();
    await expect(spineBtn).toBeVisible();
    await spineBtn.click();

    const article = page.locator(`article[id="${rel.anchorId}"]`);
    await expect(article).toBeVisible();
    await expect(article).toContainText(rel.statusLabel);

    const toggleBtn = article
      .locator(`button[aria-controls="${rel.anchorId}-detail"]`)
      .first();
    const wasExpanded = await toggleBtn.getAttribute("aria-expanded");
    if (wasExpanded === "true") {
      await toggleBtn.click();
      await expect(toggleBtn).toHaveAttribute("aria-expanded", "false");
      await toggleBtn.click();
    } else {
      await toggleBtn.click();
    }
    await expect(toggleBtn).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator(`[id="${rel.anchorId}-detail"]`)).toBeVisible();
  }
```

- [ ] **Step 4: Run `package-provenance.spec.ts` and `scenes-interaction.spec.ts`**

Run:
```powershell
Set-Location "d:\02_PACKAGES\asp.net_packages\AstraFlow\portal"
npx playwright test tests/package-provenance.spec.ts tests/scenes-interaction.spec.ts
```
Expected: ALL tests in both specs PASS on both `desktop-chromium` and `mobile-chromium` (`0` failed).

---

### Task 3: Zero-CLS Live Heroes (`/docs` & `/community`)

**Files:**
- Modify: `portal/src/modules/documentation/index/views/DocsHeroDesk.tsx:492-538`
- Modify: `portal/src/modules/documentation/index/views/DocsHeroDesk.module.css:436-508`
- Modify: `portal/src/modules/community/contribution/views/CommunityContributionCurrent.module.css:155-244,305-315`
- Test: headless Chromium CLS check + `portal/tests/scenes-interaction.spec.ts`

**Interfaces:**
- Preserves existing `DocsHeroDeskProps`, `data-testid`, `id="codex-lens-${activeVolume.id}"`, `aria-live="polite"`, and `CommunityContributionCurrentProps`.

- [ ] **Step 1: Verify baseline CLS before editing heroes**

Confirm current `/docs` CLS (`~0.01898`) and `/community` CLS (`~0.01736`) stem from `.readoutBar` (`AnimatePresence mode="wait"`) and `.inspectorPanel` unreserved height (observed in `task-862`).

- [ ] **Step 2: Replace height-jumping `mode="wait"` in `DocsHeroDesk.tsx` & reserve `.readoutBar` height**

In `portal/src/modules/documentation/index/views/DocsHeroDesk.tsx` (`lines 492-538`):
- Wrap the animated volume swap in `<div className={styles.readoutContentSlot}>` using `display: grid` (`grid-template-columns: minmax(0, 1fr)`) so entering & exiting `motion.div` children occupy `grid-area: 1 / 1` simultaneously with opacity-only transition (`mode="sync"`, `initial={false}`):

```tsx
      <div
        aria-live="polite"
        className={styles.readoutBar}
        id={`codex-lens-${activeVolume.id}`}
      >
        <div className={styles.readoutContent}>
          <AnimatePresence initial={false} mode="sync">
            <motion.div
              animate={{ opacity: 1 }}
              className={styles.readoutMotionLayer}
              exit={reducedMotion ? undefined : { opacity: 0 }}
              initial={reducedMotion ? false : { opacity: 0 }}
              key={activeVolume.id}
              transition={{ duration: reducedMotion ? 0 : 0.16 }}
            >
              <div className={styles.readoutMeta}>
                <span>
                  {t('folioLabel', {
                    number: activeVolume.num,
                    title: activeVolumeCopy.shelfTitle,
                  })}
                </span>
                {categoryCount > 0 ? (
                  <span>{t('guideCount', { count: String(categoryCount) })}</span>
                ) : null}
                <span>
                  {t('minutesRead', {
                    count: String(flagshipDoc?.readingMinutes ?? activeVolume.defaultMinutes),
                  })}
                </span>
                <code className={styles.readoutApi}>{activeVolume.apiBadge}</code>
              </div>
              <h2 className={styles.readoutTitle}>
                {flagshipDoc?.title ?? activeVolumeCopy.flagshipTitle}
              </h2>
              <p className={styles.readoutSummary}>{activeVolumeCopy.summary}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <Link
          className={styles.readoutCta}
          href={`/docs/${activeVolume.flagshipSlug}`}
        >
          {t('openTrackGuide')} <span aria-hidden="true">↗</span>
        </Link>
      </div>
```

In `portal/src/modules/documentation/index/views/DocsHeroDesk.module.css`:
```css
.readoutBar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 14px 18px;
  min-height: 118px;
  padding: 15px 18px;
  border-radius: 10px;
  background: var(--forest-deep);
  color: #fff8ef;
  border: 1px solid rgba(255, 210, 189, 0.22);
  border-inline-start: 4px solid var(--signal);
}

.readoutContent {
  flex: 1 1 250px;
  min-width: 0;
  display: grid;
  align-items: start;
}

.readoutMotionLayer {
  grid-area: 1 / 1;
  min-width: 0;
}
```
And at `@media (max-width: 640px)`:
```css
  .readoutBar {
    min-height: 168px;
  }
```
*(After Task 3 build, verify across all 5 `FOLIO_VOLUMES` in headless Chromium that no volume exceeds `118px` desktop / `168px` mobile; tune `min-height` to `Math.ceil(maxHeight)` if needed so height is 100% invariant.)*

- [ ] **Step 3: Reserve `.inspectorPanel` height in `CommunityContributionCurrent.module.css`**

In `portal/src/modules/community/contribution/views/CommunityContributionCurrent.module.css` (`lines 155-160, 236-243, 305-308`):
```css
.inspectorPanel {
  padding: 18px 20px 20px;
  background: var(--paper-raised);
  display: grid;
  grid-template-rows: auto auto 1fr auto auto;
  align-content: start;
  gap: 10px;
  min-height: 274px;
}
```
And inside `.inspectorFooter`: Keep bottom-aligned footer steady; inside `@media (max-width: 640px)`:
```css
  .inspectorPanel {
    padding: 14px;
    min-height: 320px;
  }
```
*(Verify in headless Chromium across all 6 cycling pathways at `1440x900` and `390x844` and tune to exact tallest-pathway fit so zero layout shift occurs on cycle or hover/focus.)*

- [ ] **Step 4: Build and verify `/docs` & `/community` CLS via headless Chromium**

Run `npm run build` in `portal/`, run the Chromium scroll + cycle CLS verification script (`inspect-cls-and-changelog.mjs` / `verify-portal-scroll.mjs`), and verify CLS drops to `0` (`<= 0.001`) on `/docs` and `/community` and all `brand-lock`, `scenes-interaction` tests `4` & `7` pass.

---

### Task 4: SSR Code-Block Headers, Delegated Copy & Constant ToC Geometry (`/docs/[...slug]`)

**Files:**
- Modify: `portal/src/core/content/markdown.ts:17-25,390-405`
- Modify: `portal/src/modules/documentation/data/service.ts:65-72`
- Modify: `portal/src/core/design/globals.css:2045-2068,2184-2202`
- Modify: `portal/src/modules/documentation/article/views/DocEnhancements.module.css:172-180,392-452`
- Modify: `portal/src/modules/documentation/article/views/DocEnhancements.tsx:32-60,322-409`
- Test: `portal/tests/docs-domain.spec.ts`, `portal/tests/scenes-interaction.spec.ts`, `portal/tests/portal-architecture.spec.ts`

**Interfaces:**
- Consumes: `copyTextToClipboard` from `@core/ui` (Task 1); `documentationEn.enhancements.copyCommand` / `copiedCommand` in `service.ts`; `t('copyCommand')` / `t('copiedCommand')` in `DocEnhancements.tsx`.
- Produces: Optional `codeBlockLabels?: { copy: string; copied: string }` on `RenderMarkdownOptions`; SSR `<div class="docs-code-wrap" data-docs-code-block>` HTML contract preserving `button[aria-label^="Copy "]` inside `.docs-prose`.

- [ ] **Step 1: Add SSR code-block header test in `portal/tests/docs-domain.spec.ts`**

Add a test in `portal/tests/docs-domain.spec.ts` verifying `getDocBySlug('getting-started')?.html` already renders SSR `.docs-code-wrap`, `.docs-code-bar`, and `data-docs-copy-btn` without client DOM injection:

```ts
test('documentation markdown emits SSR code-block copy bars with localized labels', () => {
  const doc = getDocBySlug('getting-started');
  expect(doc).not.toBeNull();
  expect(doc?.html).toContain('data-docs-code-block');
  expect(doc?.html).toContain('data-docs-copy-btn');
  expect(doc?.html).toContain('class="docs-code-bar"');
  expect(doc?.html).toContain('tabindex="0"');
});
```

- [ ] **Step 2: Run the new unit check in `docs-domain.spec.ts` to verify it fails before implementation**

Run:
```powershell
Set-Location "d:\02_PACKAGES\asp.net_packages\AstraFlow\portal"
npx playwright test tests/docs-domain.spec.ts -g "SSR code-block copy bars"
```
Expected: FAIL because `markdown.ts` currently emits bare `<pre class="code-block" ...>` without `data-docs-code-block`.

- [ ] **Step 3: Emit `.docs-code-wrap` + `.docs-code-bar` in `portal/src/core/content/markdown.ts` and pass localized labels in `service.ts`**

In `portal/src/core/content/markdown.ts`:
- Extend `RenderMarkdownOptions`:
```ts
export interface CodeBlockLabels {
  copy: string;
  copied: string;
}

export interface RenderMarkdownOptions {
  /** Repo-relative POSIX source path, e.g. `docs/adr/0001-generated-mapper.md` or `README.md`. */
  sourcePath?: string;
  /** Canonical doc slug paths known to the portal, e.g. `getting-started`, `adr/0001-generated-mapper`. */
  docSlugs?: ReadonlySet<string>;
  /** Optional slug alias map, e.g. `quick-start` -> `getting-started`. */
  docAliases?: ReadonlyMap<string, string>;
  /** Localized button labels for SSR fenced code block headers. */
  codeBlockLabels?: CodeBlockLabels;
}
```
- Update `code(token: Tokens.Code)` at line `390`:
```ts
      code(token: Tokens.Code): string {
        const normalizedLang = normalizeCodeLanguage(token.lang);
        const displayLang = normalizedLang.toUpperCase();
        const highlighted = highlightCode(token.text, normalizedLang);
        const copyLabel = options.codeBlockLabels?.copy ?? 'Copy';
        const copiedLabel = options.codeBlockLabels?.copied ?? 'Copied ✓';
        const ariaLabel = `${copyLabel} ${displayLang} code`;
        const blockHtml =
          `<div class="docs-code-wrap" data-docs-code-block>` +
          `<div class="docs-code-bar">` +
          `<span class="docs-code-lang">${escapeHtml(displayLang)}</span>` +
          `<button type="button" class="docs-code-copy" data-docs-copy-btn data-copy-label="${escapeHtml(copyLabel)}" data-copied-label="${escapeHtml(copiedLabel)}" aria-label="${escapeHtml(ariaLabel)}">${escapeHtml(copyLabel)}</button>` +
          `</div>` +
          `<pre class="code-block" data-lang="${escapeHtml(normalizedLang)}" tabindex="0"><code class="language-${escapeHtml(normalizedLang)}">${highlighted}</code></pre>` +
          `</div>\n`;

        if (firstCodeSnippet === null && token.text.trim().length > 0) {
          firstCodeSnippet = {
            lang: normalizedLang,
            code: token.text,
            html: highlighted,
          };
        }

        return blockHtml;
      },
```

In `portal/src/modules/documentation/data/service.ts`:
- Import `documentationEn` from `../documentation.en`.
- Pass `codeBlockLabels: { copy: documentationEn.enhancements.copyCommand, copied: documentationEn.enhancements.copiedCommand }` to `renderMarkdown(...)` at line `66`.

- [ ] **Step 4: Move `.docs-code-*` rules & constant `.docs-toc a` inset geometry into `globals.css`, and simplify `DocEnhancements.module.css` + `DocEnhancements.tsx`**

In `portal/src/core/design/globals.css`:
- Update `.docs-toc` link spacing (`lines 2052-2067`) so inactive links pre-allocate the 2px inset border and padding, preventing horizontal shifts or wraps:
```css
.docs-toc a {
  display: block;
  padding-block: 6px;
  padding-inline-start: 10px;
  margin-inline-start: -12px;
  border-inline-start: 2px solid transparent;
  color: var(--ink-secondary);
  line-height: 1.4;
}

.docs-toc a:hover {
  color: var(--action);
}

.docs-toc a[data-level="3"] {
  padding-inline-start: 22px;
  font-size: 11px;
  color: var(--muted);
}
```
- Style `.docs-code-wrap`, `.docs-code-bar`, `.docs-code-lang`, `.docs-code-copy`, `.docs-code-copy--copied`, and `.docs-code-wrap pre.code-block` alongside `.docs-prose pre` (`around line 2193`):
```css
.docs-prose .docs-code-wrap {
  margin-block: 20px 24px;
  border-radius: 8px;
  border: 1px solid #20493e;
  overflow: hidden;
  background: #072720;
  max-width: 100%;
}

.docs-prose .docs-code-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 14px;
  background: var(--forest);
  border-block-end: 1px solid #20493e;
}

.docs-prose .docs-code-lang {
  font: 700 10.5px/1 var(--font-mono);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--peach);
}

.docs-prose .docs-code-copy {
  appearance: none;
  border: 1px solid #376053;
  background: var(--forest-deep);
  color: #ffffff;
  border-radius: 4px;
  padding: 5px 10px;
  font: 700 11px/1.2 var(--font-mono);
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease;
}

.docs-prose .docs-code-copy:hover,
.docs-prose .docs-code-copy:focus-visible {
  border-color: var(--signal);
  outline: none;
}

.docs-prose .docs-code-copy--copied {
  background: #a8321b;
  border-color: var(--peach);
  color: #fffaf2;
}

.docs-prose .docs-code-wrap pre.code-block {
  margin: 0;
  border: 0;
  border-radius: 0;
  max-width: 100%;
  overflow-x: auto;
}
```

In `portal/src/modules/documentation/article/views/DocEnhancements.module.css`:
- Replace `.activeTocLink` (`lines 172-179`) without `font-weight: 700` width expansion (keeping constant text glyph metrics + bold color contrast):
```css
.activeTocLink {
  color: var(--action) !important;
  border-inline-start-color: var(--signal) !important;
  text-shadow: 0 0 0.01px currentColor;
}
```
- Remove obsolete `.codeBlockWrap`, `.codeBlockBar`, `.codeBlockLang`, `.codeCopyButton`, `.codeCopyButtonCopied`, `.codeBlockPreEnhanced` (`lines 392-451`).

In `portal/src/modules/documentation/article/views/DocEnhancements.tsx`:
- Import `copyTextToClipboard` from `@core/ui` and remove the local definition at lines `32-60`.
- Remove lines `322-407` (`preBlocks` imperative `document.createElement` wrapper loop) and replace with a single delegated click listener on `article` for `[data-docs-copy-btn]` that keeps `aria-label` intact for Playwright's button locator and toggles `.docs-code-copy--copied`:

```tsx
    const resetTimers = new Map<HTMLButtonElement, number>();

    const handleCodeCopyClick = async (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const button = target.closest<HTMLButtonElement>('[data-docs-copy-btn]');
      if (!button || !article.contains(button)) return;

      const wrap = button.closest('[data-docs-code-block]');
      const pre = wrap?.querySelector<HTMLPreElement>('pre.code-block');
      const codeText =
        pre?.querySelector('code')?.textContent ?? pre?.textContent ?? '';
      if (!codeText) return;

      const ok = await copyTextToClipboard(codeText);
      if (!ok) return;

      const copyLabel = button.dataset.copyLabel || t('copyCommand');
      const copiedLabel = button.dataset.copiedLabel || t('copiedCommand');
      const rawLang = (pre?.dataset.lang || 'text').toUpperCase();

      button.textContent = copiedLabel;
      button.classList.add('docs-code-copy--copied');
      setLiveStatus(`${rawLang} code copied to clipboard.`);

      const existingTimer = resetTimers.get(button);
      if (existingTimer !== undefined) {
        window.clearTimeout(existingTimer);
      }
      const nextTimer = window.setTimeout(() => {
        button.textContent = copyLabel;
        button.classList.remove('docs-code-copy--copied');
        resetTimers.delete(button);
      }, 1800);
      resetTimers.set(button, nextTimer);
    };

    article.addEventListener('click', handleCodeCopyClick, { signal });

    return () => {
      abortController.abort();
      observer?.disconnect();
      for (const timerId of resetTimers.values()) {
        window.clearTimeout(timerId);
      }
      resetTimers.clear();
    };
```

- [ ] **Step 5: Verify `docs-domain`, `portal-architecture`, `scenes-interaction`, and `/docs/getting-started` CLS**

Run:
```powershell
Set-Location "d:\02_PACKAGES\asp.net_packages\AstraFlow\portal"
npm run build
npx playwright test tests/docs-domain.spec.ts tests/portal-architecture.spec.ts tests/scenes-interaction.spec.ts -g "SSR code-block|native form controls|4\. Docs"
```
Expected: ALL pass and `/docs/getting-started` Chromium CLS drops from `0.00949` to `~0`.

---

### Task 5: Compositor Reading Progress Bar & `HeroStageEntrance` Transform Isolation

**Files:**
- Modify: `portal/src/modules/documentation/article/views/DocEnhancements.tsx:198-223,414-426`
- Modify: `portal/src/modules/documentation/article/views/DocEnhancements.module.css:13-17`
- Modify: `portal/src/core/motion/HeroChoreography.tsx:110-174`

- [ ] **Step 1: Convert `DocEnhancements` reading bar to rAF + GPU `scaleX` via ref**

In `portal/src/modules/documentation/article/views/DocEnhancements.module.css`:
```css
.readingProgressBar {
  width: 100%;
  height: 100%;
  background: var(--signal);
  transform-origin: left center;
  transform: scaleX(0);
  will-change: transform;
}

:global([dir='rtl']) .readingProgressBar {
  transform-origin: right center;
}
```
In `portal/src/modules/documentation/article/views/DocEnhancements.tsx`:
- Remove `const [progress, setProgress] = useState(0);`, add `progressTrackRef = useRef<HTMLDivElement | null>(null)` and `progressBarRef = useRef<HTMLDivElement | null>(null)`, and throttle scroll/resize reads inside `requestAnimationFrame`:

```tsx
  useEffect(() => {
    let rafId: number | null = null;
    let lastPercent = -1;

    const applyProgress = () => {
      rafId = null;
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      const ratio =
        scrollable <= 0 ? 0 : Math.min(1, Math.max(0, window.scrollY / scrollable));
      if (progressBarRef.current) {
        progressBarRef.current.style.transform = `scaleX(${ratio})`;
      }
      const nextPercent = Math.round(ratio * 100);
      if (nextPercent !== lastPercent && progressTrackRef.current) {
        lastPercent = nextPercent;
        progressTrackRef.current.setAttribute('aria-valuenow', String(nextPercent));
      }
    };

    const scheduleUpdate = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(applyProgress);
    };

    applyProgress();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });
    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, []);
```

Render JSX:
```tsx
      <div
        aria-label={t('readingProgressAriaLabel')}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={0}
        className={styles.readingProgressTrack}
        ref={progressTrackRef}
        role="progressbar"
      >
        <div className={styles.readingProgressBar} ref={progressBarRef} />
      </div>
```

- [ ] **Step 2: Isolate `HeroStageEntrance` WAAPI entrance vs GSAP `ScrollTrigger` `y` scrub**

In `portal/src/core/motion/HeroChoreography.tsx` (`lines 108-174`):
```tsx
  const stageRef = useRef<HTMLDivElement | null>(null);
  const scrubRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const outerEl = stageRef.current;
    const scrubEl = scrubRef.current;
    if (!outerEl || !scrubEl || typeof window === "undefined") {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let entranceAnim: Animation | null = null;
    if (typeof outerEl.animate === "function") {
      try {
        entranceAnim = outerEl.animate(
          [
            {
              transform: "translate3d(0, 16px, 0) scale(0.975)",
              opacity: 1,
            },
            {
              transform: "translate3d(0, 0, 0) scale(1)",
              opacity: 1,
            },
          ],
          {
            duration: 640,
            easing: "cubic-bezier(0.16, 1, 0.3, 1)",
            fill: "none",
          },
        );
      } catch {
        entranceAnim = null;
      }
    }

    let ctx: gsap.Context | null = null;
    if (parallax) {
      ensureScrollTrigger();
      ctx = gsap.context(() => {
        gsap.to(scrubEl, {
          y: 14,
          ease: "none",
          scrollTrigger: {
            trigger: outerEl,
            start: "top top",
            end: "bottom top",
            scrub: 0.5,
            invalidateOnRefresh: true,
          },
        });
      }, outerEl);
    }

    return () => {
      entranceAnim?.cancel();
      ctx?.revert();
    };
  }, [parallax]);

  return (
    <div ref={stageRef} data-hero-stage="true" className={className}>
      <div ref={scrubRef}>{children}</div>
    </div>
  );
```

- [ ] **Step 3: Typecheck and run brand-lock + reduced-motion Playwright tests**

Run:
```powershell
Set-Location "d:\02_PACKAGES\asp.net_packages\AstraFlow\portal"
npm run typecheck
npm run build
npx playwright test tests/brand-lock.spec.ts tests/scenes-interaction.spec.ts -g "Home Hero|prefers-reduced-motion|4\. Docs"
```
Expected: All pass cleanly (`0` failed).

---

### Task 6: Remove Unused `lenis`, Fix Lint Ignores, Clean Untracked Artifacts, Update Rule Docs & Run Full Verification

**Files:**
- Modify: `portal/package.json`, `portal/package-lock.json` (via `npm uninstall lenis --offline`)
- Modify: `portal/eslint.config.mjs:8-16`
- Delete untracked: `portal/artifacts/`, `portal/debug.log`
- Modify: `.agents/rules/portal-and-content.md:8-21`, `AGENTS.md:24`

- [ ] **Step 1: Confirm zero remaining imports of `lenis` across `portal/`**

Run:
```powershell
Get-ChildItem "d:\02_PACKAGES\asp.net_packages\AstraFlow\portal\src","d:\02_PACKAGES\asp.net_packages\AstraFlow\portal\tests" -Recurse -File | Select-String -Pattern "\blenis\b"
```
Expected: `0` matches.

- [ ] **Step 2: Uninstall `lenis` from `portal/` without modifying unrelated packages**

Run:
```powershell
Set-Location "d:\02_PACKAGES\asp.net_packages\AstraFlow\portal"
npm uninstall lenis --offline --no-audit --no-fund
```
Confirm only `lenis` is removed from `portal/package.json` and `portal/package-lock.json`.

- [ ] **Step 3: Update `portal/eslint.config.mjs`, remove untracked `portal/artifacts/` & `portal/debug.log`, and update rule paths**

In `portal/eslint.config.mjs` (`lines 8-16`):
```js
    ignores: [
      ".next/**",
      "artifacts/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "playwright-report/**",
      "test-results/**",
    ],
```

Remove untracked `portal/artifacts` and `portal/debug.log`:
```powershell
Remove-Item -LiteralPath "d:\02_PACKAGES\asp.net_packages\AstraFlow\portal\artifacts" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath "d:\02_PACKAGES\asp.net_packages\AstraFlow\portal\debug.log" -Force -ErrorAction SilentlyContinue
```

In `.agents/rules/portal-and-content.md` (`lines 8-21`) and `AGENTS.md` (`line 24`), replace legacy `portal/src/lib/*` and `portal/src/content/ui-copy.ts` paths with current module locations:

In `.agents/rules/portal-and-content.md`:
```markdown
- Keep these portal source-of-truth modules and product guides aligned with `Directory.Build.props`, `src/*/*.csproj`, shipped C# contracts, and `CHANGELOG.md`:
  - `portal/src/core/config/site-config.ts`
  - `portal/src/modules/catalog/packages/` (`data/catalog.ts`, `data/release-manifest.ts`, `data/presets.ts`, `packages.en.ts`)
  - `portal/src/content/docs/*.md`
  - `portal/src/modules/learning/guides/` (`data/catalog.ts`, `guides.en.ts`)
  - `portal/src/modules/releases/changelog/` (`data/policy.ts`, `changelog.en.ts`)
  - `portal/src/core/locales/` and module `*.en.ts` translation files
```
And line 20:
```markdown
  - Adding new packages or interactive stack layers requires updating `portal/src/modules/catalog/packages/data/` (`catalog.ts`, `presets.ts`, `release-manifest.ts`, and `packages.en.ts`); `PackagesModuleLoom`, `PackagesStackComposer`, and `portal/src/modules/catalog/packages/views/stack-resolver.ts` scale heights, plates, and camera fit automatically from catalog metadata.
```

In `AGENTS.md` line 24:
```markdown
- **Hard Rule — Portal Sync, Warm Forest Preservation & Collaborative Brainstorming**: Every AstraFlow version bump, new package, public API change, or release update MUST synchronize `portal/` (`portal/src/core/config/site-config.ts`, `portal/src/modules/catalog/packages/`, `portal/src/content/docs/*.md`, `portal/src/modules/learning/guides/`, `portal/src/modules/releases/changelog/`, and `portal/src/core/locales/` + `portal/src/modules/*/*.en.ts`) in the same task, strictly preserving the approved Warm Forest design system, route layout, and product-only content firewall (see `.agents/rules/portal-and-content.md`). Whenever a new portal component, new section, layout change, or UX enhancement is needed, you MUST first engage the user via `/using-superpowers` and `/brainstorming` before implementing UI changes.
```

- [ ] **Step 4: Run full verification suite & live 7-route Chromium scroll + CLS audit**

Run sequentially in `portal/`:
```powershell
Set-Location "d:\02_PACKAGES\asp.net_packages\AstraFlow\portal"
npm run typecheck
npx eslint . --max-warnings 0
npm run build
npm run test:e2e
```
Expected:
- `npm run typecheck`: exit `0`
- `npx eslint . --max-warnings 0`: exit `0` (`0` warnings, finishes promptly with `artifacts/**` ignored)
- `npm run build`: exit `0` (`62/62` static pages)
- `npm run test:e2e`: `120 passed, 0 failed`

Then run `verify-portal-scroll.mjs` & `inspect-cls-and-changelog.mjs` against the production build on `http://127.0.0.1:3100` to confirm:
- All 7 routes (`/`, `/packages`, `/docs`, `/docs/getting-started`, `/guides`, `/changelog`, `/community`): `computedScrollBehavior: "auto"`, `hasLenisClass: false`, `reverseJumps: 0`, and near-`0` CLS (`0` on `/`, `/packages`, `/docs`, `/guides`, `/community`).
