import { chromium } from 'file:///C:/Users/seifmoustafa/AppData/Roaming/npm/node_modules/playwright/index.mjs';
import path from 'path';
import fs from 'fs';

const ARTIFACT_DIR = 'C:\\Users\\seifmoustafa\\.gemini\\antigravity\\brain\\e50a6455-8459-4512-bdcc-68ecfdd7c6d8';
const LOCAL_ARTIFACT_DIR = 'C:\\Users\\seifmoustafa\\.gemini\\antigravity\\brain\\c40a7ebb-4130-4067-a900-07d86bb6bf63';
const BASELINE_DIR = 'd:\\02_PACKAGES\\asp.net_packages\\AstraFlow\\AstraFlow-Final-Craft-v12\\screenshots-final';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const PAGES = [
  { name: 'index', route: '/' },
  { name: 'packages', route: '/packages' },
  { name: 'docs', route: '/docs' },
  { name: 'guides', route: '/guides' },
  { name: 'changelog', route: '/changelog' },
  { name: 'community', route: '/community' }
];

const VIEWPORTS = [
  [1440, 900],
  [390, 844],
  [320, 740],
  [360, 800],
  [768, 1024],
  [1024, 768],
  [1920, 1080]
];

async function runQa() {
  console.log(`\n================================================================`);
  console.log(`ASTRAFLOW DEFINITIVE WEBSITE REBUILD (v12) — PLAYWRIGHT QA SUITE`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Baseline Screenshots: ${BASELINE_DIR}`);
  console.log(`Artifact Directory: ${ARTIFACT_DIR}`);
  console.log(`Local Artifact Directory: ${LOCAL_ARTIFACT_DIR}`);
  console.log(`================================================================\n`);

  if (!fs.existsSync(ARTIFACT_DIR)) {
    fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  }
  if (!fs.existsSync(LOCAL_ARTIFACT_DIR)) {
    fs.mkdirSync(LOCAL_ARTIFACT_DIR, { recursive: true });
  }

  const report = {
    suite: 'AstraFlow-Final-Craft-v12',
    commitSha: 'b163535864199bfb05cef62807d89509ac2239f8',
    totalChecks: 0,
    passedChecks: 0,
    failedChecks: 0,
    viewportMatrix: [],
    baselineComparisons: [],
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

  function recordScreenshot(filePath, baselineName) {
    report.screenshots.push(filePath);
    const filename = path.basename(filePath);
    try {
      fs.copyFileSync(filePath, path.join(LOCAL_ARTIFACT_DIR, filename));
    } catch {}
    if (baselineName) {
      const baseFile = path.join(BASELINE_DIR, baselineName);
      const exists = fs.existsSync(baseFile);
      const genStat = fs.statSync(filePath);
      const baseStat = exists ? fs.statSync(baseFile) : null;
      report.baselineComparisons.push({
        screenshot: filename,
        baselineFile: baselineName,
        baselineExists: exists,
        capturedBytes: genStat.size,
        baselineBytes: baseStat ? baseStat.size : 0
      });
    }
    console.log(`  📸 Captured ${filename}`);
  }

  const browser = await chromium.launch({ headless: true });
  const consoleErrors = [];
  const pageErrors = [];

  try {
    // -------------------------------------------------------------------------
    // PART 1: MULTI-VIEWPORT MATRIX & SCREENSHOT BASELINES (320px -> 1920px)
    // -------------------------------------------------------------------------
    console.log('\n--- PART 1: Multi-Viewport Matrix & Visual Baselines ---');

    for (const [w, h] of VIEWPORTS) {
      console.log(`\n[Viewport ${w}x${h}]`);
      for (const pg of PAGES) {
        const context = await browser.newContext({
          viewport: { width: w, height: h },
          deviceScaleFactor: 1,
          reducedMotion: 'no-preference',
          permissions: ['clipboard-read', 'clipboard-write']
        });
        const page = await context.newPage();

        const localErrs = [];
        page.on('console', msg => {
          if (msg.type() === 'error') {
            const text = `[${pg.name}@${w}w Console Error] ${msg.text()}`;
            consoleErrors.push(text);
          }
        });
        page.on('pageerror', err => {
          const text = `[${pg.name}@${w}w Page Error] ${err.message}`;
          localErrs.push(text);
          pageErrors.push(text);
        });

        const res = await page.goto(`${BASE_URL}${pg.route}`, { waitUntil: 'load', timeout: 20000 });
        await page.waitForTimeout(250);

        const status = res ? res.status() : 0;
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
        const missingImages = await page.locator('img').evaluateAll(arr =>
          arr.filter(x => !x.complete || x.naturalWidth === 0).map(x => x.getAttribute('src') || '')
        );

        const rec = {
          page: pg.name,
          route: pg.route,
          width: w,
          height: h,
          response: status,
          overflow,
          errors: localErrs,
          missingImages
        };
        report.viewportMatrix.push(rec);

        if (w === 1440 || w === 390 || w === 320 || w === 1920) {
          assert(status === 200, `${pg.name} (${pg.route}) @ ${w}x${h} HTTP 200 OK`);
          assert(!overflow, `${pg.name} @ ${w}x${h} zero horizontal overflow`);
          assert(missingImages.length === 0, `${pg.name} @ ${w}x${h} all images loaded (${missingImages.length} missing)`);
        }

        // Capture 1440x900 Desktop Baselines & Run Interactive Tests
        if (w === 1440) {
          // Verify Single Theme & Locale Contract on first desktop load
          if (pg.name === 'index') {
            const themeAttr = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
            const dirAttr = await page.evaluate(() => document.documentElement.getAttribute('dir'));
            const langAttr = await page.evaluate(() => document.documentElement.getAttribute('lang'));
            assert(themeAttr === 'warm-forest', 'Root <html data-theme="warm-forest"> is active');
            assert(dirAttr === 'ltr' && langAttr === 'en', 'Root <html dir="ltr" lang="en"> is active');

            const themeSwitcherCount = await page.locator('button[aria-label*="theme" i], button[aria-label*="language" i]').count();
            assert(themeSwitcherCount === 0, 'No public theme or language switcher present in UI');
          }

          // Hero & Full-Page Screenshots matching screenshots-final/
          const heroPath = path.join(ARTIFACT_DIR, `${pg.name}-hero.png`);
          await page.screenshot({ path: heroPath, animations: 'disabled' });
          recordScreenshot(heroPath, `${pg.name}-hero.png`);

          const fullPath = path.join(ARTIFACT_DIR, `${pg.name}-full.png`);
          await page.screenshot({ path: fullPath, fullPage: true, animations: 'disabled' });
          recordScreenshot(fullPath, `${pg.name}-full.png`);

          // Page-Specific Interactive & Section Verifications at 1440px
          if (pg.name === 'index') {
            console.log('\n  -> Verifying Home Hero, Flow Explorer & Architecture Assembly...');

            // 1. Stationary Hero A & Headline Stability
            const heroLogo = page.locator('.v10-logo-svg').first();
            const heroHeading = page.locator('#v10-hero-heading, h1').first();
            assert(await heroLogo.count() > 0, 'Home Hero SignatureA (.v10-logo-svg) is present');
            const boxBefore = await heroLogo.boundingBox();
            const h1Before = await heroHeading.boundingBox();
            await page.waitForTimeout(350);
            const boxAfter = await heroLogo.boundingBox();
            const h1After = await heroHeading.boundingBox();
            assert(
              boxBefore && boxAfter && Math.abs(boxBefore.x - boxAfter.x) < 0.5 && Math.abs(boxBefore.y - boxAfter.y) < 0.5,
              'Home Hero SignatureA bounding box is pixel-stable (does not move)'
            );
            assert(
              h1Before && h1After && Math.abs(h1Before.x - h1After.x) < 0.5 && Math.abs(h1Before.y - h1After.y) < 0.5,
              'Home Hero headline bounding box is pixel-stable'
            );

            // 2. Section Screenshots: Flow Explorer (#experience) & Assembly (#composition)
            const expLoc = page.locator('#experience').first();
            assert(await expLoc.count() > 0, 'Home #experience (Flow Explorer) section is present');
            if (await expLoc.count() > 0) {
              const flowLabPath = path.join(ARTIFACT_DIR, 'home-flow-lab.png');
              await expLoc.screenshot({ path: flowLabPath, animations: 'disabled' });
              recordScreenshot(flowLabPath, 'home-flow-lab.png');
            }

            const compLoc = page.locator('#composition').first();
            assert(await compLoc.count() > 0, 'Home #composition (Architecture Assembly) section is present');
            if (await compLoc.count() > 0) {
              const assemblyPath = path.join(ARTIFACT_DIR, 'home-assembly.png');
              await compLoc.screenshot({ path: assemblyPath, animations: 'disabled' });
              recordScreenshot(assemblyPath, 'home-assembly.png');
            }

            // 3. Flow Explorer State Machine Verification (matching verify_v12.py)
            const stage2Btn = page.locator('[data-stage="2"]').first();
            if (await stage2Btn.count() > 0) {
              await stage2Btn.click();
              await page.waitForTimeout(350);

              const decisionCount = await page.locator('#v12-decision-count').textContent();
              const stageLabel = await page.locator('#stage-label').textContent();
              const flowCode = await page.locator('#flow-code').textContent();

              assert((decisionCount || '').trim() === '03', `Flow Explorer stage 2 updates #v12-decision-count to "03" (got "${(decisionCount || '').trim()}")`);
              assert((stageLabel || '').includes('EXECUTION'), `Flow Explorer stage 2 updates #stage-label to include "EXECUTION" (got "${(stageLabel || '').trim()}")`);
              assert((flowCode || '').includes('application logic'), 'Flow Explorer stage 2 updates #flow-code synchronously with handler code');
            }

            const mappingTab = page.locator('[data-flow="mapping"]').first();
            if (await mappingTab.count() > 0) {
              await mappingTab.click();
              await page.waitForTimeout(250);
              const flowTitle = await page.locator('#flow-title').textContent();
              assert((flowTitle || '').includes('Mapping is a decision.'), `Flow Explorer capability switch to mapping updates #flow-title (got "${(flowTitle || '').trim()}")`);
            }

            // 4. Hero Signal Motion Pause/Resume Toggle
            const motionToggle = page.locator('#v10-motion-toggle').first();
            const sigStage = page.locator('#v10-signature-stage').first();
            if (await motionToggle.count() > 0 && await sigStage.count() > 0) {
              await motionToggle.click();
              await page.waitForTimeout(150);
              const pausedAttr = await sigStage.getAttribute('data-signal-paused');
              assert(pausedAttr === 'true', 'Hero #v10-motion-toggle pauses signal trace (data-signal-paused="true")');
              await motionToggle.click();
              await page.waitForTimeout(150);
            }

            // 5. Architecture Assembly Layer Switching
            const layer0Btn = page.locator('[data-layer="0"]').first();
            if (await layer0Btn.count() > 0) {
              await layer0Btn.click();
              await page.waitForTimeout(200);
              const layerLabel = await page.locator('#v10-layer-label').textContent();
              assert((layerLabel || '').includes('01 / INPUT SELECTED'), `Architecture Assembly layer 0 updates #v10-layer-label (got "${(layerLabel || '').trim()}")`);
            }
          }

          if (pg.name === 'packages') {
            console.log('\n  -> Verifying Packages Composer & Inventory...');
            const mapperBtn = page.locator('[data-pkg="AstraFlow.Mapper"]').first();
            assert(await mapperBtn.count() > 0, 'Packages composer [data-pkg="AstraFlow.Mapper"] button is present');
            if (await mapperBtn.count() > 0) {
              await mapperBtn.click();
              await page.waitForTimeout(200);
              const installCmds = await page.locator('#install-commands').textContent();
              assert((installCmds || '').includes('AstraFlow.Mapper'), 'Selecting AstraFlow.Mapper adds package to #install-commands');
              assert(!(installCmds || '').includes('--version'), 'Install commands deliberately omit --version per contract');
            }
          }

          if (pg.name === 'docs') {
            console.log('\n  -> Verifying Docs Search & Reading Portal...');
            const docsQuery = page.locator('#docs-query').first();
            assert(await docsQuery.count() > 0, 'Docs search input (#docs-query) is present');
            if (await docsQuery.count() > 0) {
              await docsQuery.fill('diagnostics');
              await page.waitForTimeout(250);
              const visibleTiles = await page.locator('.docs-tile:visible').count();
              assert(visibleTiles >= 1, `Docs search "diagnostics" shows >= 1 matching topic tile (found ${visibleTiles})`);
              await docsQuery.fill('');
              await page.waitForTimeout(150);
            }
          }

          if (pg.name === 'guides') {
            console.log('\n  -> Verifying Guides Journey Rail...');
            const guideStep1 = page.locator('[data-guide="1"]').first();
            assert(await guideStep1.count() > 0, 'Guides timeline step [data-guide="1"] is present');
            if (await guideStep1.count() > 0) {
              await guideStep1.click();
              await page.waitForTimeout(200);
              const guideN = await page.locator('#guide-n').textContent();
              const guideTitle = await page.locator('#guide-title').textContent();
              assert((guideN || '').includes('02'), `Guides step 2 updates #guide-n to STEP / 02 (got "${(guideN || '').trim()}")`);
              assert((guideTitle || '').includes('Design a pipeline'), `Guides step 2 updates #guide-title (got "${(guideTitle || '').trim()}")`);
            }
          }

          if (pg.name === 'changelog') {
            console.log('\n  -> Verifying Changelog Release Folio & Provenance...');
            const toggleBtn = page.locator('.release-toggle').first();
            assert(await toggleBtn.count() > 0, 'Changelog .release-toggle button is present');
            if (await toggleBtn.count() > 0) {
              await toggleBtn.click();
              await page.waitForTimeout(200);
              const openDetailCount = await page.locator('.release-detail.open, .release-toggle[aria-expanded="true"]').count();
              assert(openDetailCount > 0, 'Clicking .release-toggle expands release details');
            }
            const bodyText = await page.textContent('body');
            assert((bodyText || '').includes('Unpublished') || (bodyText || '').includes('WORK IN PROGRESS'), 'Changelog distinguishes unpublished 2.4 work in progress');
          }

          if (pg.name === 'community') {
            console.log('\n  -> Verifying Community Contribution Network...');
            const branchItems = page.locator('.v10-branch-item');
            const branchCount = await branchItems.count();
            assert(branchCount === 4, `Community ContributionNetwork renders 4 branch routes (found ${branchCount})`);
            if (branchCount > 0) {
              await branchItems.first().hover();
              await page.waitForTimeout(150);
              const href0 = await branchItems.first().getAttribute('href');
              assert((href0 || '').includes('github.com/seifmoustafa/AstraFlow'), 'Community branch 01 links to real GitHub repository');
            }
          }
        }

        // Capture 390x844 Mobile Baselines & Test Mobile Menu
        if (w === 390) {
          const mobilePath = path.join(ARTIFACT_DIR, `${pg.name}-mobile.png`);
          await page.screenshot({ path: mobilePath, animations: 'disabled' });
          recordScreenshot(mobilePath, `${pg.name}-mobile.png`);

          const mobileMenuBtn = page.locator('.mobile-menu').first();
          if (await mobileMenuBtn.count() > 0) {
            await mobileMenuBtn.click();
            await page.waitForTimeout(200);
            const navOpenCount = await page.locator('.nav.open, #main-menu.open, .mobile-menu[aria-expanded="true"]').count();
            assert(navOpenCount >= 1, `${pg.name} @ 390px mobile menu button opens navigation`);
          }
        }

        await context.close();
      }
    }

    // -------------------------------------------------------------------------
    // PART 2: DEEP DOCS ARTICLE VERIFICATION (/docs/getting-started)
    // -------------------------------------------------------------------------
    console.log('\n--- PART 2: Deep Documentation Article Verification ---');
    const docContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
      permissions: ['clipboard-read', 'clipboard-write']
    });
    const docPage = await docContext.newPage();
    const docRes = await docPage.goto(`${BASE_URL}/docs/getting-started`, { waitUntil: 'load', timeout: 20000 });
    await docPage.waitForTimeout(300);
    assert(docRes && docRes.status() === 200, '/docs/getting-started HTTP 200 OK');
    const docOverflow = await docPage.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    assert(!docOverflow, '/docs/getting-started has zero horizontal overflow');
    const docH1 = await docPage.locator('h1, h2, h3').count();
    assert(docH1 > 0, '/docs/getting-started renders markdown headings');
    const docArticlePath = path.join(ARTIFACT_DIR, 'docs-article-full.png');
    await docPage.screenshot({ path: docArticlePath, fullPage: true, animations: 'disabled' });
    recordScreenshot(docArticlePath, null);
    await docContext.close();

    // -------------------------------------------------------------------------
    // PART 3: REDUCED MOTION & RTL STRUCTURAL FIXTURE VERIFICATION
    // -------------------------------------------------------------------------
    console.log('\n--- PART 3: Reduced Motion & RTL Foundation Fixture ---');
    const rmContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: 'reduce'
    });
    const rmPage = await rmContext.newPage();
    await rmPage.goto(`${BASE_URL}/`, { waitUntil: 'load', timeout: 20000 });
    await rmPage.waitForTimeout(250);
    const toggleDisabled = await rmPage.locator('#v10-motion-toggle').isDisabled();
    const stagePaused = await rmPage.locator('#v10-signature-stage').getAttribute('data-signal-paused');
    assert(
      toggleDisabled || stagePaused === 'true',
      'Under prefers-reduced-motion: reduce, #v10-motion-toggle is disabled and/or signal is paused'
    );

    // Developer-only RTL structural test fixture on <html dir="rtl" lang="ar">
    await rmPage.evaluate(() => {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', 'ar');
    });
    await rmPage.waitForTimeout(200);
    const rtlOverflow = await rmPage.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    assert(!rtlOverflow, 'Developer RTL structural fixture (<html dir="rtl">) produces zero horizontal overflow');
    await rmContext.close();

  } catch (err) {
    console.error('Fatal execution error during QA test suite:', err);
    report.failedChecks++;
    report.details.push({ status: 'FATAL_ERROR', message: err.message });
  } finally {
    await browser.close();
  }

  // -------------------------------------------------------------------------
  // PART 4: CONSOLE & PAGE ERROR SUMMARY
  // -------------------------------------------------------------------------
  console.log('\n--- PART 4: Console & Page Error Analysis ---');
  assert(consoleErrors.length === 0, `Zero console errors across all viewports and pages (found ${consoleErrors.length})`);
  assert(pageErrors.length === 0, `Zero uncaught page errors across all viewports and pages (found ${pageErrors.length})`);

  console.log(`\n================================================================`);
  console.log(`QA v12 VERIFICATION SUMMARY:`);
  console.log(`Total Checks:        ${report.totalChecks}`);
  console.log(`Passed:              ${report.passedChecks}`);
  console.log(`Failed:              ${report.failedChecks}`);
  console.log(`Viewports Tested:    ${report.viewportMatrix.length} page-viewport combinations`);
  console.log(`Screenshots Saved:   ${report.screenshots.length}`);
  console.log(`================================================================\n`);

  const reportJson = JSON.stringify(report, null, 2);
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'qa-verification-report.json'), reportJson, 'utf-8');
  fs.writeFileSync(path.join(LOCAL_ARTIFACT_DIR, 'qa-verification-report.json'), reportJson, 'utf-8');

  if (report.failedChecks > 0) {
    process.exitCode = 1;
  }
  return report;
}

runQa().catch(err => {
  console.error(err);
  process.exit(1);
});
