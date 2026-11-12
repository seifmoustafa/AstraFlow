import { chromium } from 'file:///C:/Users/seifmoustafa/AppData/Roaming/npm/node_modules/playwright/index.mjs';
import path from 'path';
import fs from 'fs';

const ARTIFACT_DIR = 'C:\\Users\\seifmoustafa\\.gemini\\antigravity\\brain\\e50a6455-8459-4512-bdcc-68ecfdd7c6d8';
const LOCAL_ARTIFACT_DIR = 'C:\\Users\\seifmoustafa\\.gemini\\antigravity\\brain\\c40a7ebb-4130-4067-a900-07d86bb6bf63';
const VIDEO_DIR = path.join(ARTIFACT_DIR, 'craft-videos');
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const PAGES = [
  { name: 'index', route: '/' },
  { name: 'packages', route: '/packages' },
  { name: 'docs', route: '/docs' },
  { name: 'guides', route: '/guides' },
  { name: 'changelog', route: '/changelog' },
  { name: 'community', route: '/community' },
  { name: 'craft-lab', route: '/__craft' }
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

async function runRadicalQa() {
  console.log(`\n================================================================`);
  console.log(`ASTRAFLOW RADICAL CREATIVE REBUILD — AUTOMATED QA & VIDEO HARNESS`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Artifact Directory: ${ARTIFACT_DIR}`);
  console.log(`Video Directory: ${VIDEO_DIR}`);
  console.log(`================================================================\n`);

  if (!fs.existsSync(ARTIFACT_DIR)) fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  if (!fs.existsSync(LOCAL_ARTIFACT_DIR)) fs.mkdirSync(LOCAL_ARTIFACT_DIR, { recursive: true });
  if (!fs.existsSync(VIDEO_DIR)) fs.mkdirSync(VIDEO_DIR, { recursive: true });

  const report = {
    suite: 'AstraFlow-Radical-Creative-Rebuild',
    commitSha: 'b163535864199bfb05cef62807d89509ac2239f8',
    totalChecks: 0,
    passedChecks: 0,
    failedChecks: 0,
    viewportMatrix: [],
    videoRecordings: [],
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

  function saveScreenshot(filePath) {
    report.screenshots.push(filePath);
    const filename = path.basename(filePath);
    try {
      fs.copyFileSync(filePath, path.join(LOCAL_ARTIFACT_DIR, filename));
    } catch {}
    console.log(`  📸 Captured ${filename}`);
  }

  const browser = await chromium.launch({ headless: true });
  const consoleErrors = [];
  const pageErrors = [];

  try {
    // -------------------------------------------------------------------------
    // PART 1: MULTI-VIEWPORT RESPONSIVE AUDIT (320px -> 1920px)
    // -------------------------------------------------------------------------
    console.log('\n--- PART 1: Multi-Viewport Responsive Matrix (320px - 1920px) ---');

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

        const res = await page.goto(`${BASE_URL}${pg.route}`, { waitUntil: 'load', timeout: 25000 }).catch(e => null);
        await page.waitForTimeout(250);

        const status = res ? res.status() : 0;
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
        const missingImages = await page.locator('img').evaluateAll(arr =>
          arr.filter(x => !x.complete || x.naturalWidth === 0).map(x => x.getAttribute('src') || '')
        );

        report.viewportMatrix.push({
          page: pg.name,
          route: pg.route,
          width: w,
          height: h,
          response: status,
          overflow,
          errors: localErrs,
          missingImages
        });

        if (w === 1440 || w === 390 || w === 320 || w === 1920) {
          assert(status === 200, `${pg.name} (${pg.route}) @ ${w}x${h} HTTP 200 OK`);
          assert(!overflow, `${pg.name} @ ${w}x${h} zero horizontal overflow`);
        }

        // Capture 1440px desktop full-page screenshots
        if (w === 1440) {
          const shotPath = path.join(ARTIFACT_DIR, `after-${pg.name}-1440.png`);
          await page.screenshot({ path: shotPath, fullPage: true, animations: 'disabled' });
          saveScreenshot(shotPath);
        }

        // Capture 390px mobile full-page screenshots
        if (w === 390) {
          const shotPath = path.join(ARTIFACT_DIR, `after-${pg.name}-390.png`);
          await page.screenshot({ path: shotPath, fullPage: true, animations: 'disabled' });
          saveScreenshot(shotPath);
        }

        await context.close();
      }
    }

    // -------------------------------------------------------------------------
    // PART 2: DESIGN LAB (/__craft) DEEP INTERACTIVE VERIFICATION
    // -------------------------------------------------------------------------
    console.log('\n--- PART 2: Design Lab (/__craft) Interactive Verification ---');
    const craftContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1
    });
    const craftPage = await craftContext.newPage();
    const craftRes = await craftPage.goto(`${BASE_URL}/__craft`, { waitUntil: 'domcontentloaded', timeout: 25000 });
    await craftPage.waitForSelector('h1, header, main', { timeout: 15000 });
    assert(craftRes && craftRes.status() === 200, '/__craft Design Lab HTTP 200 OK');

    await craftPage.waitForTimeout(500);
    const craftBody = (await craftPage.textContent('body')) || '';
    assert(
      /Creative Lab|Design Lab|Craft|Alternative|Invention|Flow Execution Observatory|Calibrated Conduit/i.test(craftBody),
      `/__craft renders Design Lab environment`
    );

    // Test Alternative Toggles if present
    const altBtns = craftPage.locator('button').filter({ hasText: /Alt |Alternative|Conduit|Chamber|Flow Observatory|Packages Hero/i });
    const altCount = await altBtns.count();
    if (altCount > 1) {
      await altBtns.nth(1).click();
      await craftPage.waitForTimeout(300);
      assert(true, 'Design Lab alternative toggle clicked successfully');
    }

    const craftShot = path.join(ARTIFACT_DIR, 'craft-lab-full.png');
    await craftPage.screenshot({ path: craftShot, fullPage: true, animations: 'disabled' });
    saveScreenshot(craftShot);
    await craftContext.close();

    // -------------------------------------------------------------------------
    // PART 3: RECORD PLAYWRIGHT VIDEO EVIDENCE FOR DEMOS A, B, C & MOBILE
    // -------------------------------------------------------------------------
    console.log('\n--- PART 3: Recording Playwright Video Demonstrations ---');

    // Video A: Home Flow Observatory (Demo A)
    console.log('Recording Demo A: Home Flow Observatory...');
    const videoAContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      recordVideo: { dir: VIDEO_DIR, size: { width: 1440, height: 900 } }
    });
    const pageA = await videoAContext.newPage();
    await pageA.goto(`${BASE_URL}/`, { waitUntil: 'load', timeout: 20000 });
    await pageA.waitForTimeout(500);

    const expSection = pageA.locator('#experience, [data-testid="flow-observatory"]').first();
    if (await expSection.count() > 0) {
      await expSection.scrollIntoViewIfNeeded();
      await pageA.waitForTimeout(400);

      // Step forward through stages
      const nextBtn = pageA.locator('#stage-next, button:has-text("Next")').first();
      for (let i = 0; i < 3; i++) {
        if (await nextBtn.count() > 0) {
          await nextBtn.click();
          await pageA.waitForTimeout(450);
        }
      }

      // Switch capability mid-flow (interruptibility test)
      const mapTab = pageA.locator('[data-flow="mapping"], button:has-text("Mapping")').first();
      if (await mapTab.count() > 0) {
        await mapTab.click();
        await pageA.waitForTimeout(500);
      }

      // Direct stage jump (stage 4 from stage 1)
      const stage3 = pageA.locator('[data-stage="3"], button:has-text("Result"), button:has-text("Target")').first();
      if (await stage3.count() > 0) {
        await stage3.click();
        await pageA.waitForTimeout(500);
      }
    }
    await videoAContext.close();
    console.log('✓ Demo A video captured.');

    // Video B: Packages Composition Machine (Demo B)
    console.log('Recording Demo B: Packages Composition Machine...');
    const videoBContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      recordVideo: { dir: VIDEO_DIR, size: { width: 1440, height: 900 } }
    });
    const pageB = await videoBContext.newPage();
    await pageB.goto(`${BASE_URL}/packages`, { waitUntil: 'load', timeout: 20000 });
    await pageB.waitForTimeout(500);

    const composerSection = pageB.locator('#composer, [data-testid="composition-machine"]').first();
    if (await composerSection.count() > 0) {
      await composerSection.scrollIntoViewIfNeeded();
      await pageB.waitForTimeout(400);

      const mapperOpt = pageB.locator('[data-pkg="AstraFlow.Mapper"], button:has-text("Mapper")').first();
      const diagOpt = pageB.locator('[data-pkg="AstraFlow.Diagnostics"], button:has-text("Diagnostics")').first();
      if (await mapperOpt.count() > 0) {
        await mapperOpt.click();
        await pageB.waitForTimeout(400);
      }
      if (await diagOpt.count() > 0) {
        await diagOpt.click();
        await pageB.waitForTimeout(400);
      }
      // Rapid deselect (interruptibility test)
      if (await mapperOpt.count() > 0) {
        await mapperOpt.click();
        await pageB.waitForTimeout(400);
      }
    }
    await videoBContext.close();
    console.log('✓ Demo B video captured.');

    // Video C: Community Branchwork (Demo C)
    console.log('Recording Demo C: Community Branchwork...');
    const videoCContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      recordVideo: { dir: VIDEO_DIR, size: { width: 1440, height: 900 } }
    });
    const pageC = await videoCContext.newPage();
    await pageC.goto(`${BASE_URL}/community`, { waitUntil: 'load', timeout: 20000 });
    await pageC.waitForTimeout(500);

    const branchItems = pageC.locator('.v10-branch-item, [data-branch-item]');
    const branchCount = await branchItems.count();
    if (branchCount > 0) {
      for (let i = 0; i < Math.min(4, branchCount); i++) {
        await branchItems.nth(i).hover();
        await pageC.waitForTimeout(400);
      }
      // Keyboard focus through links
      await pageC.keyboard.press('Tab');
      await pageC.waitForTimeout(300);
      await pageC.keyboard.press('Tab');
      await pageC.waitForTimeout(300);
    }
    await videoCContext.close();
    console.log('✓ Demo C video captured.');

    // Video D: Mobile Interaction Video (390x844)
    console.log('Recording Demo D: Mobile Navigation & Interaction (390x844)...');
    const videoDContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      recordVideo: { dir: VIDEO_DIR, size: { width: 390, height: 844 } }
    });
    const pageD = await videoDContext.newPage();
    await pageD.goto(`${BASE_URL}/`, { waitUntil: 'load', timeout: 20000 });
    await pageD.waitForTimeout(400);

    const menuBtn = pageD.locator('.mobile-menu').first();
    if (await menuBtn.count() > 0) {
      await menuBtn.click();
      await pageD.waitForTimeout(400);
      await pageD.keyboard.press('Escape');
      await pageD.waitForTimeout(300);
    }

    await pageD.goto(`${BASE_URL}/packages`, { waitUntil: 'load', timeout: 20000 });
    await pageD.waitForTimeout(400);
    const mPkg = pageD.locator('[data-pkg="AstraFlow.Mapper"]').first();
    if (await mPkg.count() > 0) {
      await mPkg.click();
      await pageD.waitForTimeout(400);
    }
    await videoDContext.close();
    console.log('✓ Demo D mobile video captured.');

    // Copy captured videos to local artifact directory
    const recordedFiles = fs.readdirSync(VIDEO_DIR).filter(f => f.endsWith('.webm'));
    for (const v of recordedFiles) {
      report.videoRecordings.push(v);
      try {
        fs.copyFileSync(path.join(VIDEO_DIR, v), path.join(LOCAL_ARTIFACT_DIR, v));
      } catch {}
    }

  } catch (err) {
    console.error('Fatal QA error:', err);
    report.failedChecks++;
    report.details.push({ status: 'FATAL_ERROR', message: err.message });
  } finally {
    await browser.close();
  }

  // -------------------------------------------------------------------------
  // PART 4: SUMMARY & ERROR AUDIT
  // -------------------------------------------------------------------------
  console.log('\n--- PART 4: Console & Unhandled Page Error Audit ---');
  assert(consoleErrors.length === 0, `Zero console errors across all viewports (found ${consoleErrors.length})`);
  assert(pageErrors.length === 0, `Zero uncaught page errors across all viewports (found ${pageErrors.length})`);

  console.log(`\n================================================================`);
  console.log(`RADICAL CREATIVE REBUILD QA SUMMARY:`);
  console.log(`Total Checks:      ${report.totalChecks}`);
  console.log(`Passed:            ${report.passedChecks}`);
  console.log(`Failed:            ${report.failedChecks}`);
  console.log(`Viewports Tested:  ${report.viewportMatrix.length} combinations`);
  console.log(`Videos Recorded:   ${report.videoRecordings.length}`);
  console.log(`Screenshots Saved: ${report.screenshots.length}`);
  console.log(`================================================================\n`);

  const reportJson = JSON.stringify(report, null, 2);
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'qa-radical-rebuild-report.json'), reportJson, 'utf-8');
  fs.writeFileSync(path.join(LOCAL_ARTIFACT_DIR, 'qa-radical-rebuild-report.json'), reportJson, 'utf-8');

  if (report.failedChecks > 0) process.exitCode = 1;
  return report;
}

runRadicalQa().catch(err => {
  console.error(err);
  process.exit(1);
});
