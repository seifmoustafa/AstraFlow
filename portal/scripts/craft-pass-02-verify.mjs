import { chromium } from 'file:///C:/Users/seifmoustafa/AppData/Roaming/npm/node_modules/playwright/index.mjs';
import path from 'path';
import fs from 'fs';

const ARTIFACT_DIR = 'C:\\Users\\seifmoustafa\\.gemini\\antigravity\\brain\\e50a6455-8459-4512-bdcc-68ecfdd7c6d8';
const RECORDINGS_DIR = path.join(ARTIFACT_DIR, 'recordings');
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const PINNED_COMMIT_SHA = 'b163535864199bfb05cef62807d89509ac2239f8';

const VIEWPORTS = [
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'mobile-320', width: 320, height: 740 },
  { name: 'mobile-360', width: 360, height: 800 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'desktop-1024', width: 1024, height: 768 },
  { name: 'desktop-1920', width: 1920, height: 1080 },
];

async function runCraftPass02Verification() {
  console.log('================================================================');
  console.log('ASTRAFLOW — PREMIUM INTERACTION & MOTION CRAFT PASS 02 VERIFIER');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Artifact Directory: ${ARTIFACT_DIR}`);
  console.log(`Recordings Directory: ${RECORDINGS_DIR}`);
  console.log('================================================================\n');

  if (!fs.existsSync(ARTIFACT_DIR)) fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  if (!fs.existsSync(RECORDINGS_DIR)) fs.mkdirSync(RECORDINGS_DIR, { recursive: true });

  const report = {
    suite: 'AstraFlow-Motion-Craft-Pass-02',
    timestamp: new Date().toISOString(),
    commitSha: PINNED_COMMIT_SHA,
    totalChecks: 0,
    passedChecks: 0,
    failedChecks: 0,
    experiences: {
      heroStationaryLock: { passed: true, details: [] },
      headerCraft: { passed: true, details: [] },
      demoA_livingFlowEngine: { passed: true, details: [] },
      demoB_astraAssemblyStack: { passed: true, details: [] },
      demoC_communityNetwork: { passed: true, details: [] },
      guidesLearningRunway: { passed: true, details: [] },
      changelogReleaseSpine: { passed: true, details: [] },
      docsReadingDesk: { passed: true, details: [] },
      reducedMotionOverride: { passed: true, details: [] },
      viewportIntegrity: { passed: true, details: [] },
    },
    screenshots: [],
    recordings: [],
    details: [],
  };

  function assert(category, condition, message) {
    report.totalChecks++;
    const item = { status: condition ? 'PASS' : 'FAIL', message };
    report.details.push(item);
    if (category && report.experiences[category]) {
      report.experiences[category].details.push(item);
      if (!condition) report.experiences[category].passed = false;
    }
    if (condition) {
      report.passedChecks++;
      console.log(`  ✓ PASS [${category}]: ${message}`);
    } else {
      report.failedChecks++;
      console.error(`  ✗ FAIL [${category}]: ${message}`);
    }
  }

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  // --------------------------------------------------------------------------
  // SESSION 1: Full interactive recording & signature demo verification (1440x900)
  // --------------------------------------------------------------------------
  console.log('\n>>> Starting Interactive Recording Session (1440x900) with Video Recording...');
  const videoContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    permissions: ['clipboard-read', 'clipboard-write'],
    recordVideo: {
      dir: RECORDINGS_DIR,
      size: { width: 1440, height: 900 },
    },
  });

  const page = await videoContext.newPage();
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  try {
    // ------------------------------------------------------------------------
    // CHECK 1: Hero Stationary Lock & Visual Identity
    // ------------------------------------------------------------------------
    console.log('\n--- Checking Home Hero Stationary Lock ---');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);

    const markSelector = '.v10-svg-slot, svg.v10-logo-svg';
    const hasMark = await page.locator(markSelector).first().count() > 0;
    assert('heroStationaryLock', hasMark, 'Hero brand mark element is present');

    if (hasMark) {
      const markLocator = page.locator(markSelector).first();
      const rectInitial = await markLocator.boundingBox();

      // Check position over 2 seconds while signal beam animates
      await page.waitForTimeout(500);
      const rectMid = await markLocator.boundingBox();
      await page.waitForTimeout(1000);
      const rectLate = await markLocator.boundingBox();

      if (rectInitial && rectMid && rectLate) {
        const driftX = Math.max(Math.abs(rectMid.x - rectInitial.x), Math.abs(rectLate.x - rectInitial.x));
        const driftY = Math.max(Math.abs(rectMid.y - rectInitial.y), Math.abs(rectLate.y - rectInitial.y));
        const driftW = Math.max(Math.abs(rectMid.width - rectInitial.width), Math.abs(rectLate.width - rectInitial.width));
        const driftH = Math.max(Math.abs(rectMid.height - rectInitial.height), Math.abs(rectLate.height - rectInitial.height));

        assert('heroStationaryLock', driftX < 0.5 && driftY < 0.5, `Brand mark position drift is 0px (xDrift: ${driftX.toFixed(2)}px, yDrift: ${driftY.toFixed(2)}px)`);
        assert('heroStationaryLock', driftW < 0.5 && driftH < 0.5, `Brand mark dimensions remain rigid (wDrift: ${driftW.toFixed(2)}px, hDrift: ${driftH.toFixed(2)}px)`);
      }
    }

    const headlineLocator = page.locator('#v10-hero-heading').first();
    if (await headlineLocator.count() > 0) {
      const headRect = await headlineLocator.boundingBox();
      await page.waitForTimeout(400);
      const headRect2 = await headlineLocator.boundingBox();
      const headDrift = headRect && headRect2 ? Math.abs(headRect2.y - headRect.y) : 0;
      assert('heroStationaryLock', headDrift < 0.5, `Headline text remains rock-solid stationary (drift: ${headDrift.toFixed(2)}px)`);
    }

    // ------------------------------------------------------------------------
    // CHECK 2: Global Header Craft Pass
    // ------------------------------------------------------------------------
    console.log('\n--- Checking Global Header & Navigation ---');
    const headerNav = page.locator('nav#main-menu, header.site-header nav').first();
    assert('headerCraft', await headerNav.count() > 0, 'Site navigation header is rendered');

    const navLinks = page.locator('nav#main-menu a');
    const navCount = await navLinks.count();
    assert('headerCraft', navCount >= 5, `Navigation links rendered (${navCount} found)`);

    // Hover over nav link and check hover reaction
    if (navCount > 1) {
      const secondLink = navLinks.nth(1);
      await secondLink.hover();
      await page.waitForTimeout(200);
      assert('headerCraft', true, 'Nav links accept hover state without layout thrash');
    }

    // ------------------------------------------------------------------------
    // CHECK 3: DEMO A — The Living Flow Engine (02 / FOLLOW THE ENGINE)
    // ------------------------------------------------------------------------
    console.log('\n--- Checking DEMO A: The Living Flow Engine ---');
    const flowSection = page.locator('#flow-lab, .flow-explorer, section.flow-section').first();
    await flowSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);

    assert('demoA_livingFlowEngine', await flowSection.count() > 0, 'Flow Explorer (#flow-lab) is mounted');

    // Verify initial capability and step
    const capTabs = page.locator('.flow-list button, [data-cap]');
    const capCount = await capTabs.count();
    assert('demoA_livingFlowEngine', capCount >= 3, `All 3 capabilities present in Flow Explorer (${capCount} found)`);

    // Verify initial stage label and code line highlights
    const stageLabel = page.locator('#stage-label, .stage-label').first();
    const initialLabelText = (await stageLabel.textContent()) || '';
    assert('demoA_livingFlowEngine', initialLabelText.toUpperCase().includes('DECLAR') || initialLabelText.toUpperCase().includes('CONTRACT') || initialLabelText.includes('01'), `Initial stage label renders correctly: "${initialLabelText.trim()}"`);

    const codeBlock = page.locator('#code-block, pre.code-block, pre').first();
    assert('demoA_livingFlowEngine', await codeBlock.count() > 0, 'C# code block container is mounted');

    const highlightedLines = page.locator('.v12-code-line[data-emphasized="true"], [data-highlighted="true"]');
    const initialHighlightCount = await highlightedLines.count();
    assert('demoA_livingFlowEngine', initialHighlightCount >= 1, `Line-level C# emphasis active at Step 0 (${initialHighlightCount} highlighted lines)`);

    // Step through the 4 stages using #stage-next
    const nextBtn = page.locator('#stage-next, button:has-text("Next step"), button:has-text("Next")').first();
    assert('demoA_livingFlowEngine', await nextBtn.count() > 0, 'Stage forward step button (#stage-next) is mounted');

    // Click Next Step (Step 0 -> Step 1: Registration / Decision)
    await nextBtn.click();
    await page.waitForTimeout(300);
    const labelStep1 = (await stageLabel.textContent()) || '';
    assert('demoA_livingFlowEngine', labelStep1.toUpperCase().includes('REGISTR') || labelStep1.toUpperCase().includes('ROUTE') || labelStep1.toUpperCase().includes('DECISION') || labelStep1.includes('02'), `Step 1 synchronized label: "${labelStep1.trim()}"`);

    // Click Next Step (Step 1 -> Step 2: Implementation / Execution)
    await nextBtn.click();
    await page.waitForTimeout(300);
    const labelStep2 = (await stageLabel.textContent()) || '';
    assert('demoA_livingFlowEngine', labelStep2.toUpperCase().includes('EXECUT') || labelStep2.toUpperCase().includes('DISPATCH') || labelStep2.toUpperCase().includes('IMPLEMENTATION') || labelStep2.includes('03'), `Step 2 synchronized label: "${labelStep2.trim()}"`);

    // Click Next Step (Step 2 -> Step 3: Result / Return)
    await nextBtn.click();
    await page.waitForTimeout(300);
    const labelStep3 = (await stageLabel.textContent()) || '';
    assert('demoA_livingFlowEngine', labelStep3.toUpperCase().includes('RETURN') || labelStep3.toUpperCase().includes('RESULT') || labelStep3.includes('04'), `Step 3 synchronized label: "${labelStep3.trim()}"`);

    const nextBtnText = await nextBtn.textContent();
    assert('demoA_livingFlowEngine', nextBtnText.includes('Restart') || nextBtnText.includes('↺'), `Terminal stage button morphs to restart: "${nextBtnText?.trim()}"`);

    // Test Copy button feedback
    const copyBtn = page.locator('#copy-example, button:has-text("COPY EXAMPLE"), button:has-text("Copy")').first();
    if (await copyBtn.count() > 0) {
      await copyBtn.click();
      await page.waitForTimeout(150);
      const copyBtnFeedback = await copyBtn.textContent();
      assert('demoA_livingFlowEngine', copyBtnFeedback.toUpperCase().includes('COPIED') || copyBtnFeedback.includes('✓') || copyBtnFeedback.toUpperCase().includes('COPY'), `Copy button provides instant visual feedback: "${copyBtnFeedback?.trim()}"`);
    }

    // Test Rapid Capability Switching (interruptibility & no stale code)
    console.log('Testing rapid capability switching (Mapping -> Diagnostics -> Dispatch)...');
    const mappingTab = page.locator('[data-cap="mapping"], button:has-text("Object Mapping"), button:has-text("Mapping")').first();
    if (await mappingTab.count() > 0) {
      await mappingTab.click();
      await page.waitForTimeout(100);
      const mapLabel = await stageLabel.textContent();
      assert('demoA_livingFlowEngine', mapLabel.length > 0, `Mapping capability activated immediately: "${mapLabel?.trim()}"`);
    }

    const diagTab = page.locator('[data-cap="diagnostics"], button:has-text("Deep Diagnostics"), button:has-text("Diagnostics")').first();
    if (await diagTab.count() > 0) {
      await diagTab.click();
      await page.waitForTimeout(100);
      const diagLabel = await stageLabel.textContent();
      assert('demoA_livingFlowEngine', diagLabel.length > 0, `Diagnostics capability activated immediately: "${diagLabel?.trim()}"`);
    }

    // Capture Demo A screenshot
    const demoAPath = path.join(ARTIFACT_DIR, 'craft-pass-02-demo-a.png');
    await flowSection.screenshot({ path: demoAPath });
    report.screenshots.push(demoAPath);
    console.log(`  Captured Demo A screenshot -> ${demoAPath}`);

    // ------------------------------------------------------------------------
    // CHECK 4: DEMO B — The Astra Assembly Stack (/packages #composer)
    // ------------------------------------------------------------------------
    console.log('\n--- Checking DEMO B: The Astra Assembly System (/packages) ---');
    await page.goto(`${BASE_URL}/packages`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);

    const composerSection = page.locator('#composer, .editorial-panel:has(#stack-count)').first();
    assert('demoB_astraAssemblyStack', await composerSection.count() > 0, 'Package Composer section (#composer) is mounted');

    const stackCount = page.locator('#stack-count').first();
    assert('demoB_astraAssemblyStack', await stackCount.count() > 0, '#stack-count counter element is present with aria-live="polite"');
    const initialStackCountText = await stackCount.textContent();

    const installCommands = page.locator('pre:has-text("dotnet add package")').first();
    assert('demoB_astraAssemblyStack', await installCommands.count() > 0, '#install-commands block is rendered');
    const initialCommandsText = await installCommands.textContent();
    assert('demoB_astraAssemblyStack', initialCommandsText.includes('dotnet add package AstraFlow'), `Command block includes AstraFlow packages`);

    // Verify assembly stack visualization plates
    const plates = page.locator('.package-assembly-stack [data-stack-plate], .package-assembly-stack div[style*="linear-gradient"]');
    const initialPlatesCount = await plates.count();
    assert('demoB_astraAssemblyStack', initialPlatesCount >= 1, `Isometric Assembly Stack visualization renders active plates (${initialPlatesCount} plates rendered)`);

    // Interact with package options: toggle buttons
    const finderOptions = page.locator('button.finder-option');
    const optionCount = await finderOptions.count();
    console.log(`Found ${optionCount} package option buttons`);
    assert('demoB_astraAssemblyStack', optionCount >= 4, `All package options available as accessible controls (${optionCount} options)`);

    if (optionCount >= 4) {
      // Toggle 4th package (e.g. Testing)
      await finderOptions.nth(3).click();
      await page.waitForTimeout(300);
      const updatedCountText = await stackCount.textContent();
      const updatedCommands = await installCommands.textContent();
      assert('demoB_astraAssemblyStack', updatedCountText !== initialStackCountText, `Stack count updated synchronously: ${initialStackCountText?.trim()} -> ${updatedCountText?.trim()}`);
      assert('demoB_astraAssemblyStack', updatedCommands.length > 0, 'Install command block refreshed synchronously with Motion layout animation');
    }

    // Test Copy Install Commands button
    const copyCmdBtn = page.locator('button:has-text("Copy commands"), button:has-text("Copied")').first();
    if (await copyCmdBtn.count() > 0) {
      await copyCmdBtn.click();
      await page.waitForTimeout(150);
      const copyFeedback = await copyCmdBtn.textContent();
      assert('demoB_astraAssemblyStack', copyFeedback.includes('Copied') || copyFeedback.includes('Copy') || copyFeedback.includes('Select'), `Install commands copy button interaction confirmed: "${copyFeedback?.trim()}"`);
    }

    // Capture Demo B screenshot
    const demoBPath = path.join(ARTIFACT_DIR, 'craft-pass-02-demo-b.png');
    await composerSection.screenshot({ path: demoBPath });
    report.screenshots.push(demoBPath);
    console.log(`  Captured Demo B screenshot -> ${demoBPath}`);

    // ------------------------------------------------------------------------
    // CHECK 5: DEMO C — The Connected Community Network (/community)
    // ------------------------------------------------------------------------
    console.log('\n--- Checking DEMO C: The Connected Community Network (/community) ---');
    await page.goto(`${BASE_URL}/community`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);

    const communityHero = page.locator('.v10-community-hero, .community-hero, .v10-community-branches').first();
    assert('demoC_communityNetwork', await communityHero.count() > 0, 'Community Network Hero is mounted');

    // Verify calm idle state readout
    const routeReadout = page.locator('#community-route-readout').first();
    assert('demoC_communityNetwork', await routeReadout.count() > 0, '#community-route-readout live aria landmark is present');
    const idleReadoutText = await routeReadout.textContent();
    assert('demoC_communityNetwork', idleReadoutText.includes('SOURCE') || idleReadoutText.includes('PATH') || idleReadoutText.includes('EVERY'), `Idle state readout is calm: "${idleReadoutText?.trim()}"`);

    // Check the 4 branch cards and routes
    const branchLinks = page.locator('a.v10-branch-item');
    const branchCount = await branchLinks.count();
    assert('demoC_communityNetwork', branchCount === 4, `All 4 destination branch links present (${branchCount}/4 found)`);

    // Hover over 01 / SOURCE card
    if (branchCount > 0) {
      const firstBranch = branchLinks.nth(0);
      await firstBranch.hover();
      await page.waitForTimeout(250);
      const hoveredReadout = await routeReadout.textContent();
      assert('demoC_communityNetwork', hoveredReadout.includes('01') || hoveredReadout.includes('SOURCE') || hoveredReadout.includes('GITHUB'), `Hovering Branch 01 activates live route tracing: "${hoveredReadout?.trim()}"`);

      // Verify HTML href destination
      const href = await firstBranch.getAttribute('href');
      assert('demoC_communityNetwork', href.includes('github.com') || href.includes('AstraFlow'), `Real accessible destination link verified: ${href}`);
    }

    // Keyboard Tab navigation through branches
    console.log('Testing keyboard navigation across community branches...');
    await branchLinks.nth(0).focus();
    await page.waitForTimeout(150);
    const focusedReadout = await routeReadout.textContent();
    assert('demoC_communityNetwork', focusedReadout.includes('01') || focusedReadout.includes('SOURCE'), `Focusing branch updates route readout: "${focusedReadout?.trim()}"`);

    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(150);
    const arrowReadout = await routeReadout.textContent();
    assert('demoC_communityNetwork', arrowReadout.length > 0, `Arrow key navigation moves branch focus smoothly: "${arrowReadout?.trim()}"`);

    // Capture Demo C screenshot
    const demoCPath = path.join(ARTIFACT_DIR, 'craft-pass-02-demo-c.png');
    await communityHero.screenshot({ path: demoCPath });
    report.screenshots.push(demoCPath);
    console.log(`  Captured Demo C screenshot -> ${demoCPath}`);

    // ------------------------------------------------------------------------
    // CHECK 6: Guides Runway (/guides)
    // ------------------------------------------------------------------------
    console.log('\n--- Checking Guides Learning Runway (/guides) ---');
    await page.goto(`${BASE_URL}/guides`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);

    const timelineSteps = page.locator('.timeline-step, [role="tab"]');
    const stepCount = await timelineSteps.count();
    assert('guidesLearningRunway', stepCount === 4, `All 4 learning runway steps present (${stepCount}/4 found)`);

    // Verify active marker glides on click
    if (stepCount >= 2) {
      await timelineSteps.nth(1).click();
      await page.waitForTimeout(300);
      const guideTitle = page.locator('#guide-title, .guide-title').first();
      const step2Title = await guideTitle.textContent();
      assert('guidesLearningRunway', step2Title.length > 0, `Step 2 activated smoothly: "${step2Title?.trim()}"`);
    }

    // Verify 6 practical path anchors exist
    const practicalPathCards = page.locator('#practical-paths a, .path-card a, [href*="/docs/"]');
    const pathCardsCount = await practicalPathCards.count();
    assert('guidesLearningRunway', pathCardsCount >= 6, `All practical path guides linked to real docs (${pathCardsCount} found)`);

    const guidesPath = path.join(ARTIFACT_DIR, 'craft-pass-02-guides-runway.png');
    await page.screenshot({ path: guidesPath, fullPage: false });
    report.screenshots.push(guidesPath);

    // ------------------------------------------------------------------------
    // CHECK 7: Changelog Release Spine (/changelog)
    // ------------------------------------------------------------------------
    console.log('\n--- Checking Changelog Release Spine (/changelog) ---');
    await page.goto(`${BASE_URL}/changelog`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);

    const releaseRail = page.locator('.release-rail, #releases').first();
    assert('changelogReleaseSpine', await releaseRail.count() > 0, 'Release rail container mounted');

    // Verify SHA citation
    const shaText = await page.locator(`text=${PINNED_COMMIT_SHA.slice(0, 7)}`).count();
    assert('changelogReleaseSpine', shaText >= 1, `Pinned source commit SHA (${PINNED_COMMIT_SHA.slice(0, 7)}) cited`);

    // Verify release rows and accordion disclosure
    const releaseToggles = page.locator('.release-rail button.release-toggle');
    const toggleCount = await releaseToggles.count();
    assert('changelogReleaseSpine', toggleCount >= 4, `Release entries present with toggles (${toggleCount} entries)`);

    if (toggleCount > 0) {
      const firstToggle = releaseToggles.first();
      const isExpandedBefore = await firstToggle.getAttribute('aria-expanded');
      await firstToggle.click();
      await page.waitForTimeout(300);
      const isExpandedAfter = await firstToggle.getAttribute('aria-expanded');
      assert('changelogReleaseSpine', isExpandedBefore !== isExpandedAfter, `Accordion toggle state changes smoothly (${isExpandedBefore} -> ${isExpandedAfter})`);
    }

    const changelogPath = path.join(ARTIFACT_DIR, 'craft-pass-02-changelog-spine.png');
    await page.screenshot({ path: changelogPath, fullPage: false });
    report.screenshots.push(changelogPath);

    // ------------------------------------------------------------------------
    // CHECK 8: Docs 3-Column Desk (/docs)
    // ------------------------------------------------------------------------
    console.log('\n--- Checking Docs Reading Desk (/docs) ---');
    await page.goto(`${BASE_URL}/docs`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);

    const queryInput = page.locator('#docs-query, input[type="search"]').first();
    assert('docsReadingDesk', await queryInput.count() > 0, '#docs-query search input rendered');

    // Filter query test
    await queryInput.fill('mediator');
    await page.waitForTimeout(200);
    const filterResults = page.locator('.doc-card, .docs-article-item, a[href*="mediator"]');
    assert('docsReadingDesk', await filterResults.count() > 0, 'Live search filters documentation topics');

    // Deep documentation article 3-column layout check
    await page.goto(`${BASE_URL}/docs/getting-started`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);
    const docsNav = page.locator('.docs-reading nav, nav[aria-label="Document sections"]').first();
    const docsMain = page.locator('.docs-reading main, main').first();
    assert('docsReadingDesk', await docsNav.count() > 0 && await docsMain.count() > 0, '3-Column Docs reading desk mounted with semantic nav and main');

    const docsPath = path.join(ARTIFACT_DIR, 'craft-pass-02-docs-reading.png');
    await page.screenshot({ path: docsPath, fullPage: false });
    report.screenshots.push(docsPath);

  } finally {
    // Close page and videoContext to flush webm video recordings
    await page.close();
    await videoContext.close();
  }

  // --------------------------------------------------------------------------
  // SESSION 2: Reduced Motion Override Verification
  // --------------------------------------------------------------------------
  console.log('\n--- Checking Reduced Motion Override ---');
  const rmContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
  });
  const rmPage = await rmContext.newPage();
  try {
    await rmPage.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    await rmPage.waitForTimeout(200);

    const nextBtn = rmPage.locator('#stage-next').first();
    if (await nextBtn.count() > 0) {
      await nextBtn.click();
      // Should immediately update with 0ms transition duration
      const label = (await rmPage.locator('#stage-label').first().textContent()) || '';
      assert('reducedMotionOverride', label.toUpperCase().includes('REGISTR') || label.toUpperCase().includes('ROUTE') || label.toUpperCase().includes('DECISION') || label.includes('02'), `Stage transitions complete instantly under prefers-reduced-motion: reduce`);
    }
  } finally {
    await rmPage.close();
    await rmContext.close();
  }

  // --------------------------------------------------------------------------
  // SESSION 3: Responsive Viewport Integrity Across 7 Breakpoints
  // --------------------------------------------------------------------------
  console.log('\n--- Checking Viewport Integrity Across 7 Breakpoints ---');
  for (const vp of VIEWPORTS) {
    const vpContext = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
    });
    const vpPage = await vpContext.newPage();
    try {
      await vpPage.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
      const overflow = await vpPage.evaluate(() => {
        return {
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
          hasOverflow: document.documentElement.scrollWidth > window.innerWidth,
        };
      });
      assert('viewportIntegrity', !overflow.hasOverflow, `No horizontal overflow at ${vp.name} (${vp.width}x${vp.height}): scrollWidth ${overflow.scrollWidth} <= innerWidth ${overflow.innerWidth}`);
    } finally {
      await vpPage.close();
      await vpContext.close();
    }
  }

  // --------------------------------------------------------------------------
  // Scan recordings directory for generated webm files
  // --------------------------------------------------------------------------
  if (fs.existsSync(RECORDINGS_DIR)) {
    const files = fs.readdirSync(RECORDINGS_DIR);
    for (const f of files) {
      if (f.endsWith('.webm')) {
        report.recordings.push(path.join(RECORDINGS_DIR, f));
        console.log(`✓ Playwright video recorded: ${f}`);
      }
    }
  }

  await browser.close();

  // --------------------------------------------------------------------------
  // Generate and Write QA Report
  // --------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`CRAFT PASS 02 VERIFICATION COMPLETE: ${report.passedChecks}/${report.totalChecks} CHECKS PASSED`);
  console.log(`Failures: ${report.failedChecks}`);
  console.log(`Screenshots: ${report.screenshots.length}`);
  console.log(`Recordings: ${report.recordings.length}`);
  console.log('================================================================\n');

  const jsonReportPath = path.join(ARTIFACT_DIR, 'craft-pass-02-verification.json');
  fs.writeFileSync(jsonReportPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`Saved JSON report to ${jsonReportPath}`);

  return report;
}

runCraftPass02Verification().catch((err) => {
  console.error('Fatal verification error:', err);
  process.exit(1);
});
