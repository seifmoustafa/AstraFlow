import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const PORT = 3101;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const OUT_DIR = path.resolve(process.cwd(), 'artifacts', 'gate1');
fs.mkdirSync(OUT_DIR, { recursive: true });

const ROUTES = [
  { name: 'home', path: '/' },
  { name: 'packages', path: '/packages' },
  { name: 'docs', path: '/docs' },
  { name: 'guides', path: '/guides' },
  { name: 'changelog', path: '/changelog' },
  { name: 'community', path: '/community' },
];

async function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`Server did not become ready within ${timeoutMs}ms`);
}

function startServer() {
  const nextBin = path.resolve(process.cwd(), 'node_modules', 'next', 'dist', 'bin', 'next');
  const child = spawn(process.execPath, [nextBin, 'start', '-p', String(PORT), '-H', '127.0.0.1'], {
    cwd: process.cwd(),
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stdout.on('data', (d) => process.stdout.write(`[next] ${d}`));
  child.stderr.on('data', (d) => process.stderr.write(`[next:err] ${d}`));
  return child;
}

const server = startServer();
const failures = [];

try {
  await waitForServer(`${BASE_URL}/`);
  const browser = await chromium.launch();

  try {
    // Desktop 1440x900
    const desktopCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await desktopCtx.newPage();

    for (const route of ROUTES) {
      const consoleErrors = [];
      page.removeAllListeners('console');
      page.removeAllListeners('pageerror');
      page.on('console', (m) => {
        if (m.type() === 'error') consoleErrors.push(m.text());
      });
      page.on('pageerror', (e) => consoleErrors.push(String(e)));

      const resp = await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle' });
      if (!resp || resp.status() !== 200) {
        failures.push(`${route.name} HTTP status ${resp?.status()}`);
      }

      const check = await page.evaluate(() => {
        const html = document.documentElement;
        const bodyBg = getComputedStyle(document.body).backgroundColor;
        const hero = document.querySelector('main .hero');
        const heroBg = hero ? getComputedStyle(hero).backgroundColor : 'none';
        const headerImg = document.querySelector('.site-header .brand img');
        const footerImg = document.querySelector('.footer .brand img');
        const wordmarkColor = getComputedStyle(document.querySelector('.site-header .brand strong')).color;
        const footerWordmarkColor = getComputedStyle(document.querySelector('.footer .brand strong')).color;
        const toggles = [...document.querySelectorAll('button, select, input')].filter((el) =>
          /\b(ivory|dark mode|light mode|theme|arabic|english|rtl|ltr)\b/i.test(
            (el.textContent || '') + ' ' + (el.getAttribute('aria-label') || '')
          )
        );
        return {
          lang: html.lang,
          dir: html.dir,
          theme: html.dataset.theme,
          bodyBg,
          heroBg,
          headerImgLoaded: !!headerImg && headerImg.complete && headerImg.naturalWidth > 0,
          headerImgFilter: headerImg ? getComputedStyle(headerImg).filter : null,
          footerImgLoaded: !!footerImg && footerImg.complete && footerImg.naturalWidth > 0,
          footerImgFilter: footerImg ? getComputedStyle(footerImg).filter : null,
          wordmarkColor,
          footerWordmarkColor,
          overflowX: document.documentElement.scrollWidth > window.innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
          suspiciousToggles: toggles.map((t) => t.textContent?.trim()),
        };
      });

      if (check.lang !== 'en' || check.dir !== 'ltr' || check.theme !== 'warm-forest') {
        failures.push(`${route.name}: invalid html attrs ${JSON.stringify(check)}`);
      }
      if (check.bodyBg !== 'rgb(247, 243, 235)') {
        failures.push(`${route.name}: body background is ${check.bodyBg}, expected rgb(247, 243, 235)`);
      }
      if (!check.headerImgLoaded || !check.footerImgLoaded) {
        failures.push(`${route.name}: logo image failed to load`);
      }
      if (check.headerImgFilter !== 'none' || check.footerImgFilter !== 'none') {
        failures.push(`${route.name}: forbidden filter on logo`);
      }
      if (check.overflowX) {
        failures.push(`${route.name} desktop overflow: ${check.scrollWidth} > ${check.innerWidth}`);
      }
      if (check.suspiciousToggles.length > 0) {
        failures.push(`${route.name} suspicious theme/lang toggle: ${check.suspiciousToggles.join(', ')}`);
      }
      if (consoleErrors.length > 0) {
        failures.push(`${route.name} desktop console errors: ${consoleErrors.join(' | ')}`);
      }

      await page.screenshot({ path: path.join(OUT_DIR, `${route.name}-desktop-top.png`), fullPage: false });
      await page.screenshot({ path: path.join(OUT_DIR, `${route.name}-desktop-full.png`), fullPage: true });
      console.log(`[gate1:desktop] ${route.name}: ${JSON.stringify(check)}`);
    }

    await desktopCtx.close();

    // Mobile 390x844
    const mobileCtx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const mPage = await mobileCtx.newPage();

    for (const route of ROUTES) {
      await mPage.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle' });
      const mCheck = await mPage.evaluate(() => ({
        overflowX: document.documentElement.scrollWidth > window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
      }));
      if (mCheck.overflowX) {
        failures.push(`${route.name} mobile 390 overflow: ${mCheck.scrollWidth} > ${mCheck.innerWidth}`);
      }
      await mPage.screenshot({ path: path.join(OUT_DIR, `${route.name}-mobile-top.png`), fullPage: false });
      await mPage.screenshot({ path: path.join(OUT_DIR, `${route.name}-mobile-full.png`), fullPage: true });
      console.log(`[gate1:mobile] ${route.name}: ${JSON.stringify(mCheck)}`);
    }

    await mobileCtx.close();
  } finally {
    await browser.close();
  }
} finally {
  server.kill('SIGTERM');
}

if (failures.length > 0) {
  console.error('GATE 1 FAILURES:\n' + failures.join('\n'));
  process.exit(1);
}
console.log('GATE 1 BRAND-LOCK & VISUAL SHELL PASSED.');
