import { expect, test } from "@playwright/test";

const MAIN_ROUTES = [
  "/",
  "/packages",
  "/docs",
  "/guides",
  "/changelog",
  "/community",
] as const;

const RESPONSIVE_ROUTES = [
  "/",
  "/packages",
  "/docs",
  "/docs/getting-started",
  "/guides",
  "/changelog",
  "/community",
] as const;

const RESPONSIVE_WIDTHS = [320, 390, 768, 1024, 1440, 1920] as const;

test.describe("AstraFlow Interactive Scenes, Keyboard, Reduced Motion & Responsive Verification", () => {
  test("1-2. Home SignalArchitectureHero, LivingFlowAtlas (incl. 12 rapid clicks), and HomeExplodedArchitecture", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(`console.error: ${msg.text()}`);
    });

    await page.goto("/", { waitUntil: "networkidle" });

    // SignalArchitectureHero continuous signal (zero pause/resume toggle)
    await expect(page.locator("#v10-motion-toggle")).toHaveCount(0);
    await expect(page.locator(".v10-live-status").first()).toContainText(
      /LIVE SIGNAL/i,
    );
    const sigPlayState = await page
      .locator("#signature-route")
      .first()
      .evaluate((el) => getComputedStyle(el).animationPlayState);
    expect(sigPlayState).toBe("running");

    // LivingFlowAtlas capability tabs & synchronized C# highlight lines
    const capDispatch = page.locator("#flow-cap-tab-dispatch");
    const capMapping = page.locator("#flow-cap-tab-mapping");
    const capDiagnostics = page.locator("#flow-cap-tab-diagnostics");
    const capTesting = page.locator("#flow-cap-tab-testing");

    await capDispatch.scrollIntoViewIfNeeded();
    await expect(capDispatch).toHaveAttribute("aria-selected", "true");

    const activeLines = page.locator(
      'section#experience ol[aria-label$="C# example"] li[data-active-line="true"]',
    );
    const initialActiveText = await activeLines.allInnerTexts();
    expect(initialActiveText.length).toBeGreaterThan(0);

    // Keyboard ArrowRight across capability tabs
    await capDispatch.focus();
    await page.keyboard.press("ArrowRight");
    await expect(capMapping).toHaveAttribute("aria-selected", "true");
    const mappingCodeLabel = await page
      .locator('section#experience ol[aria-label$="C# example"]')
      .getAttribute("aria-label");
    expect(mappingCodeLabel).toMatch(/Mapping/i);

    await page.keyboard.press("End");
    await expect(capTesting).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("Home");
    await expect(capDispatch).toHaveAttribute("aria-selected", "true");

    // Stage plinths click + ArrowRight / ArrowLeft
    const stage0 = page.locator("#flow-stage-tab-0");
    const stage1 = page.locator("#flow-stage-tab-1");
    const stage2 = page.locator("#flow-stage-tab-2");
    await expect(stage0).toHaveAttribute("aria-selected", "true");
    await stage1.click();
    await expect(stage1).toHaveAttribute("aria-selected", "true");
    const stage1ActiveLines = await activeLines.allInnerTexts();
    expect(stage1ActiveLines).not.toEqual(initialActiveText);

    await stage1.focus();
    await page.keyboard.press("ArrowRight");
    await expect(stage2).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("ArrowLeft");
    await expect(stage1).toHaveAttribute("aria-selected", "true");

    // Rapid-click stress test: 12 rapid clicks across capability tabs and stages
    const rapidTargets = [
      capMapping,
      stage2,
      capDiagnostics,
      stage0,
      capTesting,
      stage1,
      capDispatch,
      stage2,
      capMapping,
      stage0,
      capDiagnostics,
      capDispatch,
    ];
    for (const target of rapidTargets) {
      await target.click({ force: false });
    }
    await expect(capDispatch).toHaveAttribute("aria-selected", "true");
    await expect(activeLines.first()).toBeVisible();

    // HomeExplodedArchitecture: toggle Assembled / Exploded view + layer selection + keyboard
    const composition = page.locator("section#composition");
    await composition.scrollIntoViewIfNeeded();

    const explodedToggle = composition
      .getByRole("button", { name: /Exploded view|Assembled stack/i })
      .first();
    const initialPressed = await explodedToggle.getAttribute("aria-pressed");
    await explodedToggle.click();
    const toggledPressed = await explodedToggle.getAttribute("aria-pressed");
    expect(toggledPressed).not.toBe(initialPressed);

    // Keyboard toggle back
    await explodedToggle.focus();
    await page.keyboard.press("Enter");
    await expect(explodedToggle).toHaveAttribute(
      "aria-pressed",
      initialPressed!,
    );

    const layerExecution = composition
      .locator("button")
      .filter({ hasText: /Compose behavior/i });
    const layerInspection = composition
      .locator("button")
      .filter({ hasText: /Verify decisions/i });
    await layerExecution.click();
    await expect(layerExecution).toHaveAttribute("aria-pressed", "true");
    await expect(composition).toContainText(/ACTIVE:/i);

    await layerInspection.focus();
    await page.keyboard.press("Space");
    await expect(layerInspection).toHaveAttribute("aria-pressed", "true");

    // Section 05 / THE DETAILS MATTER: depth plane focus pills & Hairline SVG
    const details = page.locator("section#details");
    await details.scrollIntoViewIfNeeded();
    await expect(details).toContainText("Geometry with meaning.");
    await expect(
      details.locator(
        '[role="img"][aria-label="Exploded isometric AstraFlow architecture figure"]',
      ),
    ).toBeVisible();

    const planeGroup = details.getByRole("group", {
      name: "Inspect architectural depth planes",
    });
    const plane01 = planeGroup.getByRole("button", {
      name: /Contracts Plane/i,
    });
    const plane02 = planeGroup.getByRole("button", {
      name: /Execution Spine/i,
    });
    const plane03 = planeGroup.getByRole("button", {
      name: /Verification Base/i,
    });
    await expect(plane01).toHaveAttribute("aria-pressed", "true");
    await plane02.click();
    await expect(plane02).toHaveAttribute("aria-pressed", "true");
    await plane03.focus();
    await page.keyboard.press("Space");
    await expect(plane03).toHaveAttribute("aria-pressed", "true");

    // Section 06 / READY WHEN YOU ARE full-bleed ending CTA band
    const endingBand = page.locator(
      'section.ending-cta-band[aria-labelledby="ending-cta-heading"]',
    );
    await endingBand.scrollIntoViewIfNeeded();
    await expect(endingBand).toContainText("Begin with one");
    await expect(endingBand).toContainText("responsibility.");
    await expect(
      endingBand.getByRole("link", { name: /Read the quick start/i }),
    ).toHaveAttribute("href", "/docs/getting-started");

    expect(errors).toEqual([]);
  });

  test("3. Packages PackagesModuleLoom and PackagesStackComposer", async ({
    page,
    context,
  }) => {
    await context
      .grantPermissions(["clipboard-read", "clipboard-write"])
      .catch(() => {});
    await page.goto("/packages", { waitUntil: "networkidle" });

    // PackagesModuleLoom tabs via mouse + keyboard
    const loomTablist = page.getByRole("tablist", {
      name: "AstraFlow capability modules",
    });
    const mediatorTab = loomTablist.getByRole("tab", { name: /Mediator/i });
    const mapperTab = loomTablist.getByRole("tab", { name: /Mapper/i });
    const testingTab = loomTablist.getByRole("tab", { name: /Testing/i });

    await expect(mediatorTab).toHaveAttribute("aria-selected", "true");
    await mediatorTab.focus();
    await page.keyboard.press("ArrowRight");
    await expect(mapperTab).toHaveAttribute("aria-selected", "true");

    await testingTab.click();
    await expect(testingTab).toHaveAttribute("aria-selected", "true");

    // Stage active capability into Stack Composer
    const stageBtn = page.getByRole("button", {
      name: /Stage in Stack Composer/i,
    });
    await stageBtn.click();

    const composer = page.locator("section#composer");
    await expect(composer).toBeVisible();

    // Verify AstraFlow.Mediator toggles AstraFlow.Contracts dependency resolution
    const searchInput = page.getByLabel("Filter 16 AstraFlow packages");
    await page.getByRole("button", { name: "Reset" }).click();

    await searchInput.fill("Mediator");
    const mediatorPkgToggle = composer
      .locator('button[aria-pressed]')
      .filter({ hasText: "AstraFlow.Mediator" })
      .first();
    await mediatorPkgToggle.click();
    await expect(mediatorPkgToggle).toHaveAttribute("aria-pressed", "true");

    const cliTab = composer.getByRole("tab", { name: "dotnet CLI" });
    const xmlTab = composer.getByRole("tab", { name: "PackageReference XML" });
    const toolTab = composer.getByRole("tab", { name: ".NET Tool CLI" });

    await cliTab.click();
    const outputPre = composer.locator("pre").first();
    await expect(outputPre).toContainText("AstraFlow.Mediator");
    await expect(composer).toContainText(
      "Transitive project references included: AstraFlow.Contracts",
    );

    // PackageReference XML tab + PrivateAssets="all" on Generators/Analyzers
    await searchInput.fill("Generators");
    const generatorToggle = composer
      .locator('button[aria-pressed]')
      .filter({ hasText: "AstraFlow.Generators" })
      .first();
    await generatorToggle.click();

    await xmlTab.click();
    await expect(outputPre).toContainText('PrivateAssets="all"');

    // AstraFlow.Assertions: 2.4.0 unreleased source notice + NO `dotnet add package AstraFlow.Assertions`
    await searchInput.fill("Assertions");
    const assertionsToggle = composer
      .locator('button[aria-pressed]')
      .filter({ hasText: "AstraFlow.Assertions" })
      .first();
    await assertionsToggle.click();

    const assertionsAlert = composer.locator('[role="alert"]').first();
    await expect(assertionsAlert).toBeVisible();
    await expect(assertionsAlert).toContainText("2.4.0");
    await expect(assertionsAlert).toContainText(/unreleased|source/i);

    await cliTab.click();
    await expect(outputPre).not.toContainText(
      "dotnet add package AstraFlow.Assertions",
    );

    // AstraFlow.Cli uses `dotnet tool install`
    await searchInput.fill("AstraFlow.Cli");
    const cliPkgToggle = composer
      .locator('button[aria-pressed]')
      .filter({ hasText: "AstraFlow.Cli" })
      .first();
    await cliPkgToggle.click();
    await toolTab.click();
    await expect(outputPre).toContainText("dotnet tool install");

    // Keyboard switch back to PackageReference XML
    await toolTab.focus();
    await page.keyboard.press("ArrowLeft");
    await expect(xmlTab).toHaveAttribute("aria-selected", "true");

    // PackagesModuleLoom SVG contains zero legacy DISPATCH/PROJECTIONS 2.3.0 sub-labels
    const loomSvgTexts = await page
      .locator('svg:has([data-testid="loom-plate-contracts"]) text')
      .allInnerTexts();
    expect(loomSvgTexts.length).toBeGreaterThan(0);
    expect(
      loomSvgTexts.some((txt) =>
        /(DISPATCH|PROJECTIONS)\s*·\s*2\.3\.0/i.test(txt),
      ),
    ).toBe(false);

    // section#composer (01 / THE ASSEMBLY BENCH) spans full viewport width
    const composerWidthMetrics = await composer.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { width: rect.width, innerWidth: window.innerWidth };
    });
    expect(
      Math.abs(composerWidthMetrics.width - composerWidthMetrics.innerWidth),
    ).toBeLessThanOrEqual(2);
  });

  test("4. Docs DocsReferenceDesk, DocArticleEnhancer, /docs/quick-start alias, and ADR route", async ({
    page,
    context,
  }) => {
    await context
      .grantPermissions(["clipboard-read", "clipboard-write"])
      .catch(() => {});
    await page.goto("/docs", { waitUntil: "networkidle" });

    // DocsHeroDesk codex volumes + Active Volume Lens + zero internal draft leaks
    const volumeTabs = page
      .getByRole("tablist", { name: "Documentation track volumes" })
      .getByRole("tab");
    await expect(volumeTabs).toHaveCount(5);

    const volumeBtns = page
      .getByRole("group", { name: "Select codex volume" })
      .locator("button");
    await expect(volumeBtns).toHaveCount(5);

    const lens = page.locator('[id^="codex-lens-"]').first();
    const lensLink = lens.getByRole("link", { name: /Open track guide/i });
    await expect(lensLink).toBeVisible();
    const initialLensHref = await lensLink.getAttribute("href");

    await volumeBtns.nth(1).click();
    await expect(volumeBtns.nth(1)).toHaveAttribute("aria-pressed", "true");
    await expect(volumeTabs.nth(1)).toHaveAttribute("aria-selected", "true");
    const nextLensHref = await lensLink.getAttribute("href");
    expect(nextLensHref).not.toBe(initialLensHref);

    await volumeTabs.nth(1).focus();
    await page.keyboard.press("ArrowRight");
    await expect(volumeTabs.nth(2)).toHaveAttribute("aria-selected", "true");
    await expect(volumeBtns.nth(2)).toHaveAttribute("aria-pressed", "true");
    await volumeBtns.nth(0).click();

    const docsMainText = await page.locator("main").innerText();
    expect(docsMainText).not.toMatch(/(plans\/|strategy\/|future-ideas)/i);
    const docsHrefs = await page
      .locator("main a[href]")
      .evaluateAll((els) => els.map((a) => a.getAttribute("href") ?? ""));
    expect(
      docsHrefs.some((href) => /(plans\/|strategy\/|future-ideas)/i.test(href)),
    ).toBe(false);

    const searchInput = page.getByLabel("Search all AstraFlow documentation");
    const preview = page.getByLabel("Live document inspector preview");

    // Press `/` shortcut to focus search
    await page.locator("h1").click();
    await page.keyboard.press("/");
    await expect(searchInput).toBeFocused();

    // Filter by query + verify results & keyboard ArrowDown preview switch + Escape
    const resultsRegion = page.getByRole("region", {
      name: "Matching documentation results",
    });
    await searchInput.fill("mapper");
    const mapperMatch = resultsRegion
      .getByRole("button", { name: /mapper/i })
      .first();
    await expect(mapperMatch).toBeVisible();
    await searchInput.press("ArrowDown");
    await mapperMatch.click();
    await expect(preview).toContainText(/mapper/i);

    await searchInput.focus();
    await searchInput.press("Escape");
    await expect(searchInput).toHaveValue("");

    // Category pill filter
    const architecturePill = page
      .getByRole("button", { name: /^Architecture/i })
      .first();
    await architecturePill.click();
    await expect(preview).toBeVisible();

    // Navigate directly to /docs/getting-started and test 1-click Copy on code block
    await page.goto("/docs/getting-started", { waitUntil: "networkidle" });
    await expect(page.locator("h1")).toBeVisible();

    const firstCopyLabel = await page
      .locator('.docs-prose button[aria-label^="Copy "]')
      .first()
      .getAttribute("aria-label");
    expect(firstCopyLabel).toBeTruthy();
    const copyBtn = page
      .locator(`.docs-prose button[aria-label="${firstCopyLabel}"]`)
      .first();
    await expect(copyBtn).toBeVisible();
    await copyBtn.click();
    await expect(copyBtn).toContainText(/Copied/i);

    // Verify /docs/quick-start alias banner
    await page.goto("/docs/quick-start", { waitUntil: "networkidle" });
    await expect(page.locator("main")).toContainText(/ALIASED ROUTE/i);
    await expect(page.locator("main")).toContainText("/docs/getting-started");

    // Verify ADR route /docs/adr/0001-generated-mapper
    const adrResp = await page.goto("/docs/adr/0001-generated-mapper", {
      waitUntil: "networkidle",
    });
    expect(adrResp?.status()).toBe(200);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("main")).toContainText(/mapper/i);
  });

  test("5. Guides GuidesKineticRunway milestones 01..06 mouse & keyboard + Milestone 06 2.4.0 badge", async ({
    page,
  }) => {
    await page.goto("/guides", { waitUntil: "networkidle" });

    const tablist = page.getByRole("tablist", {
      name: "AstraFlow learning milestones",
    });
    const tabs = tablist.getByRole("tab");
    await expect(tabs).toHaveCount(6);

    const m01 = tabs.nth(0);
    const m06 = tabs.nth(5);
    await expect(m01).toHaveAttribute("aria-selected", "true");

    // Hero milestone quick-jump buttons synchronize with the runway tablist
    const quickJumpBtns = page
      .getByRole("group", { name: "Quick jump to learning milestone" })
      .locator("button");
    await expect(quickJumpBtns).toHaveCount(6);
    await quickJumpBtns.nth(2).click();
    await expect(tabs.nth(2)).toHaveAttribute("aria-selected", "true");
    await quickJumpBtns.nth(0).click();
    await expect(m01).toHaveAttribute("aria-selected", "true");

    const checkDesktopPreNoOverflow = async (label: string) => {
      if ((page.viewportSize()?.width ?? 1440) < 1200) return;
      const preMetrics = await page
        .locator("#runway-workbench-panel pre")
        .first()
        .evaluate((el) => ({
          scrollWidth: el.scrollWidth,
          clientWidth: el.clientWidth,
        }));
      expect(
        preMetrics.scrollWidth,
        `${label} C# snippet pre overflowed (${preMetrics.scrollWidth} > ${preMetrics.clientWidth})`,
      ).toBeLessThanOrEqual(preMetrics.clientWidth + 2);
    };

    await checkDesktopPreNoOverflow("Milestone 01");

    // Step through milestones 01 -> 06 via ArrowRight
    await m01.focus();
    for (let i = 1; i < 6; i++) {
      await page.keyboard.press("ArrowRight");
      await expect(tabs.nth(i)).toHaveAttribute("aria-selected", "true");
    }

    // Verify Milestone 06 shows 2.4.0 preview badge, C# snippet, and CLI verification command
    const runwayWorkbench = page.locator("#runway-workbench-panel");
    await expect(runwayWorkbench).toContainText("2.4.0");
    await checkDesktopPreNoOverflow("Milestone 06");
    await expect(
      runwayWorkbench.getByRole("button", { name: /Copy snippet/i }),
    ).toBeVisible();
    await expect(
      runwayWorkbench.getByRole("button", { name: /Copy CLI check/i }),
    ).toBeVisible();

    // ArrowLeft back and click Next milestone button
    await m06.focus();
    await page.keyboard.press("ArrowLeft");
    await expect(tabs.nth(4)).toHaveAttribute("aria-selected", "true");

    await page
      .getByRole("button", { name: /Next milestone/i })
      .click();
    await expect(m06).toHaveAttribute("aria-selected", "true");
  });

  test("6. Changelog ChangelogFolioHero & ChangelogChronicle provenance filters & 2.4.0 / 2.3.0 notes", async ({
    page,
  }) => {
    await page.goto("/changelog", { waitUntil: "networkidle" });

    const folioTablist = page.getByRole("tablist", {
      name: "Key AstraFlow release provenance milestones",
    });
    const folioTabs = folioTablist.getByRole("tab");
    const count = await folioTabs.count();
    expect(count).toBeGreaterThanOrEqual(4);

    // Keyboard navigation on Folio Hero tabs + jump CTA sync
    await folioTabs.first().focus();
    await page.keyboard.press("ArrowRight");
    await expect(folioTabs.nth(1)).toHaveAttribute("aria-selected", "true");
    await expect(
      page.getByRole("button", { name: /Jump to v.*notes/i }).first(),
    ).toBeVisible();

    const releasesSection = page.locator("section#releases");

    // Search filter + reset
    const releaseSearch = page.getByLabel(/Search \d+ AstraFlow releases/i);
    await releaseSearch.fill("2.3.0");
    await expect(
      releasesSection
        .locator("ol button")
        .filter({ has: page.locator("span", { hasText: /^v2\.3\.0$/ }) }),
    ).toBeVisible();
    await releaseSearch.fill("");

    // Provenance filter pills
    const nugetPill = releasesSection
      .getByRole("button", { name: /Published Confirmed/i })
      .first();
    const unreleasedPill = releasesSection
      .getByRole("button", { name: /Unreleased Source/i })
      .first();
    const breakingPill = releasesSection
      .getByRole("button", { name: /Breaking Changes/i })
      .first();
    const allPill = releasesSection.getByRole("button", { name: /^All\b/i }).first();

    await nugetPill.click();
    await expect(page.locator('article[id="v2.3.0"]')).toBeVisible();

    await unreleasedPill.click();
    await expect(page.locator('article[id="v2.4.0"]')).toBeVisible();

    await breakingPill.click();
    await expect(releasesSection).toBeVisible();

    await allPill.click();

    // Master-Detail Chronological Spine + Edition Stage inspection for v2.4.0 and v2.3.0
    for (const item of [
      {
        id: "v2.4.0",
        versionText: /^v2\.4\.0$/,
        provenancePattern: /Not on NuGet|Unreleased/i,
      },
      {
        id: "v2.3.0",
        versionText: /^v2\.3\.0$/,
        provenancePattern: /NuGet|2026-11-10/i,
      },
    ]) {
      const spineBtn = releasesSection
        .locator("ol button")
        .filter({ has: page.locator("span", { hasText: item.versionText }) })
        .first();
      await expect(spineBtn).toBeVisible();
      await spineBtn.click();

      const article = page.locator(`article[id="${item.id}"]`);
      await expect(article).toBeVisible();
      await expect(article).toContainText(item.provenancePattern);

      const toggleBtn = article
        .locator(`button[aria-controls="${item.id}-detail"]`)
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
      await expect(page.locator(`[id="${item.id}-detail"]`)).toBeVisible();
    }
  });

  test("7. Community CommunityContributionCurrent 6 nodes mouse/keyboard + zero fake Discord/Slack stats", async ({
    page,
  }) => {
    await page.goto("/community", { waitUntil: "networkidle" });

    const group = page.getByRole("group", {
      name: "AstraFlow contribution pathways",
    });
    const nodes = group.locator("button");
    await expect(nodes).toHaveCount(6);

    // Keyboard arrow navigation across all 6 nodes (highlights + updates inspector; Enter pins)
    await nodes.nth(0).focus();
    await expect(page.locator("main")).toContainText(/SIGNAL ACTIVE/i);
    for (let i = 1; i < 6; i++) {
      await page.keyboard.press("ArrowRight");
      await expect(nodes.nth(i)).toHaveAttribute("data-highlighted", "true");
    }
    await nodes.nth(1).click();
    await expect(nodes.nth(1)).toHaveAttribute("aria-pressed", "true");

    // Hover & verify real destination href
    await nodes.nth(0).hover();
    const destLink = page
      .getByRole("link", { name: /Open destination/i })
      .first();
    const href = await destLink.getAttribute("href");
    expect(href).toBeTruthy();
    expect(href).toMatch(/github\.com|\/docs/i);

    // Escape returns to idle
    await nodes.nth(0).focus();
    await page.keyboard.press("Escape");
    await expect(page.locator("main")).toContainText(/IDLE/i);

    // Section 03 / BUILT TO BE STUDIED interactive study cards + <Relay> SVG
    const studySection = page.locator(
      'section[aria-labelledby="community-study-heading"]',
    );
    await studySection.scrollIntoViewIfNeeded();
    await expect(studySection).toContainText("03 / BUILT TO BE STUDIED");
    await expect(studySection).toContainText("One codebase.");
    await expect(studySection).toContainText("Many good questions.");

    const studyCards = studySection
      .getByRole("group", {
        name: "Architectural study questions across AstraFlow subsystems",
      })
      .locator("button[aria-expanded]");
    await expect(studyCards).toHaveCount(4);
    await studyCards.nth(1).click();
    await expect(studyCards.nth(1)).toHaveAttribute("aria-expanded", "true");
    await expect(
      studySection
        .getByRole("link", { name: /Read the documentation/i })
        .first(),
    ).toBeVisible();

    await expect(
      studySection.locator(
        '[role="img"][aria-label="Interactive four-branch AstraFlow codebase study topology"]',
      ),
    ).toBeVisible();

    const branchBtns = studySection
      .getByRole("group", { name: "Synchronized architecture branch selectors" })
      .locator("button[aria-pressed]");
    await expect(branchBtns).toHaveCount(4);
    await branchBtns.nth(2).click();
    await expect(branchBtns.nth(2)).toHaveAttribute("aria-pressed", "true");

    // Zero fake Discord / Slack / vanity stats
    const fullText = await page.locator("body").innerText();
    expect(fullText).not.toMatch(/\bDiscord\b|\bSlack\b/i);
  });

  for (const route of ["/", "/packages", "/guides", "/changelog", "/community"]) {
    test(`prefers-reduced-motion: reduce renders cleanly with zero errors on ${route}`, async ({
      page,
    }) => {
      const errors: string[] = [];
      page.on("pageerror", (err) => errors.push(err.message));
      page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text());
      });

      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(route, { waitUntil: "networkidle" });

      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator("main")).toBeVisible();

      if (route === "/") {
        const animName = await page
          .locator("#signature-route")
          .first()
          .evaluate((el) => getComputedStyle(el).animationName);
        expect(animName).toBe("none");
      }

      expect(errors).toEqual([]);
    });
  }

  test("responsive widths 320..1920 have zero horizontal overflow or console/HTTP errors + working 390px drawer", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    const errors: string[] = [];
    const failedResponses: string[] = [];
    page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(`console.error: ${msg.text()}`);
    });
    page.on("response", (res) => {
      if (res.status() >= 400 && !res.url().includes("non-existent")) {
        failedResponses.push(`${res.status()} ${res.url()}`);
      }
    });

    for (const width of RESPONSIVE_WIDTHS) {
      await page.setViewportSize({ width, height: 844 });
      for (const route of RESPONSIVE_ROUTES) {
        await page.goto(route, { waitUntil: "load" });
        await page.evaluate(() => document.fonts?.ready);
        const overflow = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
        }));
        expect(
          overflow.scrollWidth,
          `${route} at width ${width} overflowed (${overflow.scrollWidth} > ${overflow.innerWidth})`,
        ).toBeLessThanOrEqual(overflow.innerWidth);
      }
    }

    // Mobile drawer check at 390px
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "networkidle" });
    const menuBtn = page.locator("button.mobile-menu");
    const navMenu = page.locator("nav#main-menu");
    await expect(menuBtn).toBeVisible();
    await expect(menuBtn).toHaveAttribute("aria-expanded", "false");
    await menuBtn.click();
    await expect(menuBtn).toHaveAttribute("aria-expanded", "true");
    await expect(navMenu).toHaveClass(/\bopen\b/);
    await expect(navMenu.getByRole("link", { name: "Packages" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(menuBtn).toHaveAttribute("aria-expanded", "false");

    expect(errors).toEqual([]);
    expect(failedResponses).toEqual([]);
  });

  test("200% desktop zoom simulation (720x450) has zero overflow and unclipped primary buttons across all 6 main routes", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === "mobile-chromium",
      "Desktop 200% zoom layout test",
    );
    await page.setViewportSize({ width: 720, height: 450 });

    for (const route of MAIN_ROUTES) {
      await page.goto(route, { waitUntil: "networkidle" });
      const check = await page.evaluate(() => {
        const overflowX =
          document.documentElement.scrollWidth > window.innerWidth;
        const buttons = Array.from(
          document.querySelectorAll(
            "main .btn, .hero .btn, .site-header .small-btn",
          ),
        );
        const clipped: string[] = [];
        for (const btn of buttons) {
          const rect = btn.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) continue;
          if (rect.right > window.innerWidth + 1 || rect.left < -1) {
            clipped.push(
              `${btn.textContent?.trim()} [${rect.left}..${rect.right} > ${window.innerWidth}]`,
            );
          }
        }
        return { overflowX, clipped };
      });
      expect(check.overflowX, `Overflow on ${route} at 720x450`).toBe(false);
      expect(check.clipped, `Clipped buttons on ${route} at 720x450`).toEqual(
        [],
      );
    }
  });
});
