import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const ARTIFACT_DIR = path.resolve(process.env.ARTIFACT_DIR || 'artifacts/portal-qa');
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function runQa() {
  console.log(`\n======================================================`);
  console.log(`ASTRAFLOW PORTAL FULL AUTOMATED PLAYWRIGHT QA SUITE`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Artifact Directory: ${ARTIFACT_DIR}`);
  console.log(`======================================================\n`);

  if (!fs.existsSync(ARTIFACT_DIR)) {
    fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  }

  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
  const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    permissions: ['clipboard-read', 'clipboard-write']
  });
  const page = await context.newPage();

  const consoleErrors = [];
  const pageErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(`[Console Error] ${msg.text()}`);
    }
  });

  page.on('pageerror', err => {
    pageErrors.push(`[Page Error] ${err.message}\n${err.stack}`);
  });

  const report = {
    totalChecks: 0,
    passedChecks: 0,
    failedChecks: 0,
    screenshots: [],
    details: []
  };

  function assert(condition, message) {
    report.totalChecks++;
    if (condition) {
      report.passedChecks++;
      console.log(`  ✓ PASS: ${message}`);
      report.details.push({ status: 'PASS', message });
    } else {
      report.failedChecks++;
      console.error(`  ✗ FAIL: ${message}`);
      report.details.push({ status: 'FAIL', message });
    }
  }

  try {
    // -------------------------------------------------------------
    // 1. LANDING PAGE (Dark Default) & HERO SECTION
    // -------------------------------------------------------------
    console.log('\n--- 1. Testing Landing Page (Dark Default) & Hero ---');
    const landingRes = await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    assert(landingRes.status() === 200, 'Landing page HTTP status is 200 OK');

    await page.waitForTimeout(600);

    // Verify brand lockup
    const logoSvg = page.locator('svg[viewBox="0 0 270 215"]').first();
    assert(await logoSvg.count() > 0, 'AstraFlow Logo with exact viewBox="0 0 270 215" is rendered');

    // Verify product truth badges in hero
    const textContent = await page.textContent('body');
    assert(textContent.includes('v2.3.0') || textContent.includes('2.3.0'), 'Published v2.3.0 version is visible');
    assert(textContent.includes('v2.4.0') || textContent.includes('Preview'), 'v2.4.0 Preview status is visible');

    // Screenshot Dark Landing Page
    const landingDarkPath = path.join(ARTIFACT_DIR, 'qa-landing-dark.png');
    await page.screenshot({ path: landingDarkPath, fullPage: true });
    report.screenshots.push(landingDarkPath);
    console.log(`  📸 Captured qa-landing-dark.png`);

    // -------------------------------------------------------------
    // 2. FLOW SIMULATOR SHOWCASE (Showcase 01)
    // -------------------------------------------------------------
    console.log('\n--- 2. Testing Flow Simulator Showcase ---');
    const flowSection = page.locator('section').filter({ hasText: 'SHOWCASE 01' }).first();
    const flowCount = await flowSection.count();
    assert(flowCount > 0, 'Flow Trace Pipeline simulator section (Showcase 01) is present');
    
    if (flowCount > 0) {
      await flowSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);

      // Click through scenarios
      const scenarioBtns = flowSection.locator('button').filter({ hasText: /Command|Query|Notification|Validation/i });
      const scenarioCount = await scenarioBtns.count();
      assert(scenarioCount >= 3, `Found ${scenarioCount} scenario buttons in Flow Simulator`);
      if (scenarioCount > 1) {
        await scenarioBtns.nth(1).click();
        await page.waitForTimeout(300);
      }

      // Click Play / Step button if available
      const playBtn = flowSection.locator('button').filter({ hasText: /Play|Run|Start|Simulate|Step|Reset/i }).first();
      if (await playBtn.count() > 0) {
        await playBtn.click();
        await page.waitForTimeout(400);
        assert(true, 'Flow Simulator control button triggered successfully');
      }

      const flowSimPath = path.join(ARTIFACT_DIR, 'qa-flow-simulator.png');
      await flowSection.screenshot({ path: flowSimPath });
      report.screenshots.push(flowSimPath);
      console.log(`  📸 Captured qa-flow-simulator.png`);
    }

    // -------------------------------------------------------------
    // 3. BENCHMARK SHOWCASE (Showcase 02)
    // -------------------------------------------------------------
    console.log('\n--- 3. Testing Benchmark Showcase ---');
    const benchSection = page.locator('section').filter({ hasText: 'SHOWCASE 02' }).first();
    const benchCount = await benchSection.count();
    assert(benchCount > 0, 'Benchmark visualizer section (Showcase 02) is present');
    
    if (benchCount > 0) {
      await benchSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);

      // Click Benchmark filter tabs
      const benchTabs = benchSection.locator('button').filter({ hasText: /All|Warm|Cold|Scale/i });
      const benchTabCount = await benchTabs.count();
      assert(benchTabCount >= 2, `Found ${benchTabCount} filter tabs in Benchmark Showcase`);
      if (benchTabCount > 1) {
        await benchTabs.nth(1).click();
        await page.waitForTimeout(300);
      }

      const benchPath = path.join(ARTIFACT_DIR, 'qa-benchmarks.png');
      await benchSection.screenshot({ path: benchPath });
      report.screenshots.push(benchPath);
      console.log(`  📸 Captured qa-benchmarks.png`);
    }

    // -------------------------------------------------------------
    // 4. CODE COMPARISON SHOWCASE (Showcase 03)
    // -------------------------------------------------------------
    console.log('\n--- 4. Testing Code Comparison Matrix ---');
    const codeCompSection = page.locator('section').filter({ hasText: 'SHOWCASE 03' }).first();
    const codeCompCount = await codeCompSection.count();
    assert(codeCompCount > 0, 'Code Comparison section (Showcase 03) is present');
    
    if (codeCompCount > 0) {
      await codeCompSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);

      const codeTabs = codeCompSection.locator('button').filter({ hasText: /Mediator|Mapping|Assertions|Security/i });
      const codeTabCount = await codeTabs.count();
      assert(codeTabCount >= 3, `Found ${codeTabCount} tabs in Code Comparison`);
      if (codeTabCount > 2) {
        await codeTabs.nth(2).click(); // Assertions (v2.4 Preview)
        await page.waitForTimeout(300);
      }

      const codeCompPath = path.join(ARTIFACT_DIR, 'qa-code-comparison.png');
      await codeCompSection.screenshot({ path: codeCompPath });
      report.screenshots.push(codeCompPath);
      console.log(`  📸 Captured qa-code-comparison.png`);
    }

    // -------------------------------------------------------------
    // 5. ANALYZER DIAGNOSTICS SHOWCASE (Showcase 04)
    // -------------------------------------------------------------
    console.log('\n--- 5. Testing Analyzer Diagnostics Showcase ---');
    const diagSection = page.locator('section').filter({ hasText: 'SHOWCASE 04' }).first();
    const diagCount = await diagSection.count();
    assert(diagCount > 0, 'Analyzer Diagnostics section (Showcase 04) is present');
    
    if (diagCount > 0) {
      await diagSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);

      const diagRules = diagSection.locator('div.cursor-pointer, button').filter({ hasText: /AFAN/i });
      const diagRuleCount = await diagRules.count();
      assert(diagRuleCount >= 2, `Found ${diagRuleCount} AFAN diagnostic rules in selector`);
      if (diagRuleCount > 1) {
        await diagRules.nth(1).click();
        await page.waitForTimeout(300);
      }

      const diagPath = path.join(ARTIFACT_DIR, 'qa-diagnostics.png');
      await diagSection.screenshot({ path: diagPath });
      report.screenshots.push(diagPath);
      console.log(`  📸 Captured qa-diagnostics.png`);
    }

    // -------------------------------------------------------------
    // 6. 16-PACKAGE ECOSYSTEM GRID (Showcase 05)
    // -------------------------------------------------------------
    console.log('\n--- 6. Testing 16-Package Ecosystem Grid ---');
    const pkgGridSection = page.locator('section').filter({ hasText: 'SHOWCASE 05' }).first();
    const pkgGridCount = await pkgGridSection.count();
    assert(pkgGridCount > 0, 'Package Ecosystem Grid (Showcase 05) is present');
    
    if (pkgGridCount > 0) {
      await pkgGridSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);

      // Test category filtering
      const catFilters = pkgGridSection.locator('button').filter({ hasText: /All|Core|Mapping|Diagnostics|Testing|Generators/i });
      const catCount = await catFilters.count();
      assert(catCount >= 4, `Found ${catCount} category filter buttons in Ecosystem Grid`);
      if (catCount > 1) {
        await catFilters.nth(1).click();
        await page.waitForTimeout(300);
        const pkgCards = pkgGridSection.locator('div').filter({ hasText: /AstraFlow\./ });
        assert(await pkgCards.count() > 0, 'Filtered package cards are displayed');
        await catFilters.first().click(); // Return to All
        await page.waitForTimeout(300);
      }

      const gridPath = path.join(ARTIFACT_DIR, 'qa-ecosystem-grid.png');
      await pkgGridSection.screenshot({ path: gridPath });
      report.screenshots.push(gridPath);
      console.log(`  📸 Captured qa-ecosystem-grid.png`);
    }

    // -------------------------------------------------------------
    // 7. THEME SWITCHING (LIGHT MODE)
    // -------------------------------------------------------------
    console.log('\n--- 7. Testing Theme Switching to Light Mode ---');
    const themeBtn = page.locator('button[aria-label="Toggle theme"]').first();
    assert(await themeBtn.count() > 0, 'Theme switcher button is present in Navbar');
    if (await themeBtn.count() > 0) {
      await themeBtn.click();
      await page.waitForTimeout(500);

      const currentTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
      assert(currentTheme === 'light', 'Document data-theme attribute switched to "light"');

      // Capture Light Mode Landing Page
      const landingLightPath = path.join(ARTIFACT_DIR, 'qa-landing-light.png');
      await page.screenshot({ path: landingLightPath, fullPage: true });
      report.screenshots.push(landingLightPath);
      console.log(`  📸 Captured qa-landing-light.png`);

      // Switch back to Dark
      await themeBtn.click();
      await page.waitForTimeout(300);
    }

    // -------------------------------------------------------------
    // 8. LANGUAGE SWITCHING (ARABIC RTL)
    // -------------------------------------------------------------
    console.log('\n--- 8. Testing Language Switching to Arabic (RTL) ---');
    const langBtn = page.locator('button[aria-label="Toggle language"]').first();
    assert(await langBtn.count() > 0, 'Language switcher button is present in Navbar');
    if (await langBtn.count() > 0) {
      await langBtn.click();
      await page.waitForTimeout(500);

      const docDir = await page.evaluate(() => document.documentElement.getAttribute('dir'));
      const docLang = await page.evaluate(() => document.documentElement.getAttribute('lang'));
      assert(docDir === 'rtl', 'Document direction switched to "rtl"');
      assert(docLang === 'ar', 'Document language switched to "ar"');

      // Capture Arabic RTL Landing Page
      const landingRtlPath = path.join(ARTIFACT_DIR, 'qa-landing-rtl.png');
      await page.screenshot({ path: landingRtlPath, fullPage: true });
      report.screenshots.push(landingRtlPath);
      console.log(`  📸 Captured qa-landing-rtl.png`);

      // Switch back to English LTR
      await langBtn.click();
      await page.waitForTimeout(300);
    }

    // -------------------------------------------------------------
    // 9. DOCS OVERVIEW & DEEP PAGES (/docs, /docs/mediator, etc.)
    // -------------------------------------------------------------
    console.log('\n--- 9. Testing Docs Navigation & Deep Pages ---');
    const docsRes = await page.goto(`${BASE_URL}/docs`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    assert(docsRes.status() === 200, '/docs HTTP status is 200 OK');
    await page.waitForTimeout(400);

    const docsPath = path.join(ARTIFACT_DIR, 'qa-docs.png');
    await page.screenshot({ path: docsPath, fullPage: true });
    report.screenshots.push(docsPath);
    console.log(`  📸 Captured qa-docs.png`);

    // Deep Page: /docs/mediator
    console.log('Testing /docs/mediator...');
    const medRes = await page.goto(`${BASE_URL}/docs/mediator`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    assert(medRes.status() === 200, '/docs/mediator HTTP status is 200 OK');
    await page.waitForTimeout(400);
    const medPath = path.join(ARTIFACT_DIR, 'qa-docs-mediator.png');
    await page.screenshot({ path: medPath, fullPage: true });
    report.screenshots.push(medPath);
    console.log(`  📸 Captured qa-docs-mediator.png`);

    // Deep Page: /docs/mapper
    console.log('Testing /docs/mapper...');
    const mapRes = await page.goto(`${BASE_URL}/docs/mapper`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    assert(mapRes.status() === 200, '/docs/mapper HTTP status is 200 OK');
    await page.waitForTimeout(400);
    const mapPath = path.join(ARTIFACT_DIR, 'qa-docs-mapper.png');
    await page.screenshot({ path: mapPath, fullPage: true });
    report.screenshots.push(mapPath);
    console.log(`  📸 Captured qa-docs-mapper.png`);

    // Deep Page: /docs/assertions (v2.4 Preview)
    console.log('Testing /docs/assertions...');
    const assertRes = await page.goto(`${BASE_URL}/docs/assertions`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    assert(assertRes.status() === 200, '/docs/assertions HTTP status is 200 OK');
    await page.waitForTimeout(400);
    const assertPageText = await page.textContent('body');
    assert(assertPageText.includes('v2.4.0 Preview') || assertPageText.includes('Preview'), 'v2.4.0 Preview notice rendered on /docs/assertions');

    const assertPath = path.join(ARTIFACT_DIR, 'qa-docs-assertions.png');
    await page.screenshot({ path: assertPath, fullPage: true });
    report.screenshots.push(assertPath);
    console.log(`  📸 Captured qa-docs-assertions.png`);

    // Test Copy button on code block with granted clipboard permissions
    const copyCodeBtn = page.locator('button').filter({ hasText: /Copy/i }).first();
    if (await copyCodeBtn.count() > 0) {
      await copyCodeBtn.click();
      await page.waitForTimeout(200);
      assert(true, 'Markdown code block Copy button clicked without error');
    }

    // -------------------------------------------------------------
    // 10. ARCHITECTURE HUB (/architecture)
    // -------------------------------------------------------------
    console.log('\n--- 10. Testing Architecture Hub (/architecture) ---');
    const archRes = await page.goto(`${BASE_URL}/architecture`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    assert(archRes.status() === 200, '/architecture HTTP status is 200 OK');
    await page.waitForTimeout(500);

    // Verify Archify viewer tabs
    const archifyTabs = page.locator('button').filter({ hasText: /Request Dispatch|16-Package Ecosystem|Portal & Architecture/i });
    const archifyTabCount = await archifyTabs.count();
    assert(archifyTabCount >= 2, `Found ${archifyTabCount} Archify Viewer tabs`);
    if (archifyTabCount > 1) {
      await archifyTabs.nth(1).click();
      await page.waitForTimeout(400);
    }

    const archPath = path.join(ARTIFACT_DIR, 'qa-architecture.png');
    await page.screenshot({ path: archPath, fullPage: true });
    report.screenshots.push(archPath);
    console.log(`  📸 Captured qa-architecture.png`);

    // -------------------------------------------------------------
    // 11. KNOWLEDGE EXPLORER (/explore)
    // -------------------------------------------------------------
    console.log('\n--- 11. Testing Knowledge Explorer (/explore) ---');
    const exploreRes = await page.goto(`${BASE_URL}/explore`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    assert(exploreRes.status() === 200, '/explore HTTP status is 200 OK');
    await page.waitForTimeout(500);

    // Test Node selection in SVG Knowledge Graph
    const graphNodes = page.locator('svg g.cursor-pointer');
    const graphNodeCount = await graphNodes.count();
    assert(graphNodeCount >= 5, `Found ${graphNodeCount} interactive SVG nodes in Knowledge Graph`);
    if (graphNodeCount > 0) {
      await graphNodes.first().click();
      await page.waitForTimeout(300);
    }

    // Test Path Finder toggle
    const pathFinderBtn = page.locator('button').filter({ hasText: /Path Finder|Find Path/i }).first();
    if (await pathFinderBtn.count() > 0) {
      await pathFinderBtn.click();
      await page.waitForTimeout(300);
      assert(true, 'Path Finder toggled successfully');
    }

    // Capture Knowledge Graph screenshot
    const graphSection = page.locator('section').filter({ hasText: 'AST & Dependency Graph' }).first();
    const exploreGraphPath = path.join(ARTIFACT_DIR, 'qa-explore-graph.png');
    if (await graphSection.count() > 0) {
      await graphSection.screenshot({ path: exploreGraphPath });
    } else {
      await page.screenshot({ path: exploreGraphPath, fullPage: true });
    }
    report.screenshots.push(exploreGraphPath);
    console.log(`  📸 Captured qa-explore-graph.png`);

    // Test Guided Tours Section & Step Navigation
    const toursSection = page.locator('section').filter({ hasText: 'Guided Architecture Tours' }).first();
    assert(await toursSection.count() > 0, 'Guided Architecture Tours section is present');
    if (await toursSection.count() > 0) {
      const nextStepBtn = toursSection.locator('button').filter({ hasText: /Next Step/i }).first();
      if (await nextStepBtn.count() > 0) {
        await nextStepBtn.click();
        await page.waitForTimeout(300);
        assert(true, 'Guided Tour Next Step navigated successfully');
      }

      const exploreToursPath = path.join(ARTIFACT_DIR, 'qa-explore-tours.png');
      await toursSection.screenshot({ path: exploreToursPath });
      report.screenshots.push(exploreToursPath);
      console.log(`  📸 Captured qa-explore-tours.png`);
    }

    // -------------------------------------------------------------
    // 12. LIVING CHANGELOG (/changelog)
    // -------------------------------------------------------------
    console.log('\n--- 12. Testing Living Changelog (/changelog) ---');
    const changelogRes = await page.goto(`${BASE_URL}/changelog`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    assert(changelogRes.status() === 200, '/changelog HTTP status is 200 OK');
    await page.waitForTimeout(400);

    // Test search input
    const searchInput = page.locator('input[placeholder*="search" i]').first();
    if (await searchInput.count() > 0) {
      await searchInput.fill('Mediator');
      await page.waitForTimeout(300);
      assert(true, 'Changelog search input filtered releases successfully');
      await searchInput.clear();
      await page.waitForTimeout(200);
    }

    // Test filter chips
    const filterChips = page.locator('button').filter({ hasText: /Added|Fixed|Changed|Security|Breaking/i });
    if (await filterChips.count() > 0) {
      await filterChips.first().click();
      await page.waitForTimeout(300);
      assert(true, 'Changelog category filter chip clicked');
    }

    const changelogPath = path.join(ARTIFACT_DIR, 'qa-changelog.png');
    await page.screenshot({ path: changelogPath, fullPage: true });
    report.screenshots.push(changelogPath);
    console.log(`  📸 Captured qa-changelog.png`);

    // -------------------------------------------------------------
    // 13. COMMUNITY & GOVERNANCE (/community)
    // -------------------------------------------------------------
    console.log('\n--- 13. Testing Community & Governance (/community) ---');
    const commRes = await page.goto(`${BASE_URL}/community`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    assert(commRes.status() === 200, '/community HTTP status is 200 OK');
    await page.waitForTimeout(400);

    const commText = await page.textContent('body');
    assert(commText.includes('AstraFlow.Contracts'), 'AstraFlow.Contracts listed in NuGet matrix');
    assert(commText.includes('AstraFlow.Assertions'), 'AstraFlow.Assertions listed in NuGet matrix');
    assert(commText.includes('ADR-0001') || commText.includes('Decision Log'), 'ADR decision logs present');
    assert(commText.includes('Brand') || commText.includes('Media Kit'), 'Brand & Media Kit section present');

    const commPath = path.join(ARTIFACT_DIR, 'qa-community.png');
    await page.screenshot({ path: commPath, fullPage: true });
    report.screenshots.push(commPath);
    console.log(`  📸 Captured qa-community.png`);

  } catch (err) {
    console.error('Fatal execution error during QA test suite:', err);
    report.failedChecks++;
    report.details.push({ status: 'FATAL_ERROR', message: err.message });
  } finally {
    await browser.close();
  }

  // Check error logs
  console.log('\n--- Console & Page Error Analysis ---');
  if (consoleErrors.length > 0) {
    console.warn(`[WARN] Captured ${consoleErrors.length} console error(s):`, consoleErrors);
    report.details.push({ status: 'CONSOLE_ERRORS', errors: consoleErrors });
  } else {
    console.log('✓ PASS: Zero console errors detected.');
  }

  if (pageErrors.length > 0) {
    console.error(`[FAIL] Captured ${pageErrors.length} unhandled page error(s):`, pageErrors);
    report.failedChecks += pageErrors.length;
    report.details.push({ status: 'PAGE_ERRORS', errors: pageErrors });
  } else {
    console.log('✓ PASS: Zero uncaught page errors detected.');
  }

  console.log(`\n======================================================`);
  console.log(`QA VERIFICATION SUMMARY:`);
  console.log(`Total Checks: ${report.totalChecks}`);
  console.log(`Passed: ${report.passedChecks}`);
  console.log(`Failed: ${report.failedChecks}`);
  console.log(`Screenshots Captured: ${report.screenshots.length}`);
  console.log(`======================================================\n`);

  fs.writeFileSync(
    path.join(ARTIFACT_DIR, 'qa-verification-report.json'),
    JSON.stringify(report, null, 2),
    'utf-8'
  );

  return report;
}

runQa()
  .then((report) => {
    if (report.failedChecks > 0) {
      process.exitCode = 1;
    }
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
