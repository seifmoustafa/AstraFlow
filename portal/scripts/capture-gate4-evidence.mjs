import { spawn } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const portalDir = path.resolve(__dirname, "..");
const repoRoot = path.resolve(portalDir, "..");
const referenceDir = path.join(
  repoRoot,
  "AstraFlow-Next-Reboot-LOCKED-v1",
  "reference-v12",
);
const artifactsDir = path.join(portalDir, "artifacts", "gate4");
const screenshotsDir = path.join(artifactsDir, "screenshots");
const comparisonsDir = path.join(artifactsDir, "comparisons");
const videosDir = path.join(artifactsDir, "videos");
const perfReportPath = path.join(artifactsDir, "performance-report.json");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
};

const ALL_SCREENSHOT_ROUTES = [
  { slug: "home", route: "/" },
  { slug: "packages", route: "/packages" },
  { slug: "docs", route: "/docs" },
  { slug: "docs-getting-started", route: "/docs/getting-started" },
  { slug: "guides", route: "/guides" },
  { slug: "changelog", route: "/changelog" },
  { slug: "community", route: "/community" },
];

const COMPARISON_ROUTES = [
  { slug: "home", refFile: "index.html", portalRoute: "/", label: "Home" },
  {
    slug: "packages",
    refFile: "packages.html",
    portalRoute: "/packages",
    label: "Packages",
  },
  { slug: "docs", refFile: "docs.html", portalRoute: "/docs", label: "Docs" },
  {
    slug: "guides",
    refFile: "guides.html",
    portalRoute: "/guides",
    label: "Guides",
  },
  {
    slug: "changelog",
    refFile: "changelog.html",
    portalRoute: "/changelog",
    label: "Changelog",
  },
  {
    slug: "community",
    refFile: "community.html",
    portalRoute: "/community",
    label: "Community",
  },
];

async function getFreePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.unref();
    srv.on("error", reject);
    srv.listen(0, "127.0.0.1", () => {
      const address = srv.address();
      if (!address || typeof address === "string") {
        srv.close(() => reject(new Error("Failed to resolve ephemeral port")));
        return;
      }
      const { port } = address;
      srv.close(() => resolve(port));
    });
  });
}

function startStaticServer(rootDir) {
  const server = http.createServer((req, res) => {
    const rawUrl = (req.url || "/").split("?")[0];
    const decoded = decodeURIComponent(rawUrl);
    const relPath = decoded === "/" ? "index.html" : decoded.replace(/^\/+/, "");
    const resolved = path.resolve(rootDir, relPath);

    if (!resolved.startsWith(path.resolve(rootDir))) {
      res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Forbidden");
      return;
    }

    let filePath = resolved;
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not Found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
    });
    fs.createReadStream(filePath).pipe(res);
  });

  return new Promise((resolve, reject) => {
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Failed to bind static reference server"));
        return;
      }
      resolve({
        server,
        baseUrl: `http://127.0.0.1:${address.port}`,
      });
    });
  });
}

async function waitForHttpOk(url, timeoutMs = 45000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // keep polling until timeout
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

function stopChildProcess(child) {
  if (!child || child.killed) return Promise.resolve();
  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (!settled) {
        settled = true;
        resolve();
      }
    };
    child.once("exit", finish);
    try {
      child.kill("SIGTERM");
    } catch {
      finish();
    }
    setTimeout(() => {
      try {
        if (!settled) child.kill("SIGKILL");
      } catch {
        // ignore
      }
      finish();
    }, 3000);
  });
}

async function captureScreenshots(browser, portalBaseUrl) {
  const captured = [];

  for (const spec of [
    { name: "desktop-1440x900", width: 1440, height: 900 },
    { name: "mobile-390x844", width: 390, height: 844 },
  ]) {
    const context = await browser.newContext({
      viewport: { width: spec.width, height: spec.height },
    });
    const page = await context.newPage();

    for (const item of ALL_SCREENSHOT_ROUTES) {
      await page.goto(`${portalBaseUrl}${item.route}`, {
        waitUntil: "networkidle",
      });
      await page.evaluate(() => document.fonts?.ready);
      await page.waitForTimeout(300);

      const fileName = `${item.slug}-${spec.name}.png`;
      const outPath = path.join(screenshotsDir, fileName);
      await page.screenshot({ path: outPath, fullPage: true });
      captured.push(outPath);
    }

    await context.close();
  }

  return captured;
}

async function captureComparisons(browser, referenceBaseUrl, portalBaseUrl) {
  const captured = [];
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const refPage = await context.newPage();
  const portalPage = await context.newPage();
  const compositePage = await context.newPage();

  for (const item of COMPARISON_ROUTES) {
    await refPage.goto(`${referenceBaseUrl}/${item.refFile}`, {
      waitUntil: "networkidle",
    });
    await refPage.waitForTimeout(250);
    const beforeBuf = await refPage.screenshot({ type: "png" });

    await portalPage.goto(`${portalBaseUrl}${item.portalRoute}`, {
      waitUntil: "networkidle",
    });
    await portalPage.evaluate(() => document.fonts?.ready);
    await portalPage.waitForTimeout(250);
    const afterBuf = await portalPage.screenshot({ type: "png" });

    const beforeDataUri = `data:image/png;base64,${beforeBuf.toString("base64")}`;
    const afterDataUri = `data:image/png;base64,${afterBuf.toString("base64")}`;

    await compositePage.setViewportSize({ width: 1440, height: 900 });
    await compositePage.setContent(
      `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8" />
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            width: 1440px;
            height: 900px;
            background: #f7f3eb;
            color: #0f1d19;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 36px 32px;
          }
          header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            border-bottom: 1px solid rgba(25, 58, 45, 0.18);
            padding-bottom: 16px;
          }
          h1 {
            font-size: 28px;
            font-weight: 700;
            letter-spacing: -0.02em;
            color: #0f1d19;
          }
          .meta {
            font-size: 13px;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: #3f584d;
            font-weight: 600;
          }
          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            align-items: start;
          }
          .card {
            background: #fbf8f2;
            border: 1px solid rgba(25, 58, 45, 0.16);
            border-radius: 14px;
            padding: 14px;
            box-shadow: 0 12px 30px rgba(15, 29, 25, 0.08);
          }
          .card-head {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 0.06em;
            text-transform: uppercase;
          }
          .tag-before { color: #3f584d; }
          .tag-after { color: #dd6b20; }
          img {
            display: block;
            width: 100%;
            height: auto;
            border-radius: 8px;
            border: 1px solid rgba(25, 58, 45, 0.12);
          }
          footer {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: #3f584d;
            border-top: 1px solid rgba(25, 58, 45, 0.14);
            padding-top: 12px;
          }
        </style>
      </head>
      <body>
        <header>
          <h1>AstraFlow Visual Comparison — ${item.label}</h1>
          <span class="meta">Warm Forest Parity · 1440×900 Paired Capture</span>
        </header>
        <section class="grid">
          <div class="card">
            <div class="card-head">
              <span class="tag-before">BEFORE · Locked Reference</span>
              <span>reference-v12/${item.refFile}</span>
            </div>
            <img src="${beforeDataUri}" alt="Reference v12 ${item.label}" />
          </div>
          <div class="card">
            <div class="card-head">
              <span class="tag-after">AFTER · Next.js 16 Portal</span>
              <span>${item.portalRoute}</span>
            </div>
            <img src="${afterDataUri}" alt="Next.js portal ${item.label}" />
          </div>
        </section>
        <footer>
          <span>AstraFlow Gate 4 Visual Evidence</span>
          <span>${item.refFile} vs ${item.portalRoute}</span>
        </footer>
      </body>
      </html>`,
      { waitUntil: "load" },
    );
    await compositePage.waitForTimeout(150);

    const outPath = path.join(comparisonsDir, `${item.slug}-before-after.png`);
    await compositePage.screenshot({ path: outPath });
    captured.push(outPath);
  }

  await context.close();
  return captured;
}

async function recordInteractionVideo(browser, fileName, actionFn) {
  const tmpDir = fs.mkdtempSync(path.join(videosDir, ".tmp-"));
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    recordVideo: { dir: tmpDir, size: { width: 1280, height: 800 } },
  });
  const page = await context.newPage();
  const video = page.video();

  try {
    await actionFn(page);
    await page.waitForTimeout(600);
  } finally {
    await page.close();
    await context.close();
  }

  const targetPath = path.join(videosDir, fileName);
  if (video) {
    await video.saveAs(targetPath);
  }
  await new Promise((r) => setTimeout(r, 200));
  fs.rmSync(tmpDir, { recursive: true, force: true });

  const stats = fs.statSync(targetPath);
  if (stats.size <= 10240) {
    throw new Error(
      `Recorded video ${fileName} is too small (${stats.size} bytes)`,
    );
  }
  return { file: targetPath, bytes: stats.size };
}

async function captureVideos(browser, portalBaseUrl) {
  const results = [];

  // 1. 01-home-hero-signal.webm
  results.push(
    await recordInteractionVideo(
      browser,
      "01-home-hero-signal.webm",
      async (page) => {
        await page.goto(`${portalBaseUrl}/`, { waitUntil: "networkidle" });
        await page.waitForTimeout(1300);
        const toggle = page.locator("#v10-motion-toggle");
        await toggle.click();
        await page.waitForTimeout(900);
        await toggle.click();
        await page.waitForTimeout(1200);
      },
    ),
  );

  // 2. 02-home-flow-atlas-and-architecture.webm
  results.push(
    await recordInteractionVideo(
      browser,
      "02-home-flow-atlas-and-architecture.webm",
      async (page) => {
        await page.goto(`${portalBaseUrl}/`, { waitUntil: "networkidle" });
        await page.locator("section#experience").scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);
        await page.locator("#flow-cap-tab-mapping").click();
        await page.waitForTimeout(550);
        await page.locator("#flow-stage-tab-1").click();
        await page.waitForTimeout(550);
        await page.locator("#flow-cap-tab-diagnostics").click();
        await page.waitForTimeout(550);
        await page.locator("#flow-stage-tab-2").click();
        await page.waitForTimeout(550);

        const comp = page.locator("section#composition");
        await comp.scrollIntoViewIfNeeded();
        await page.waitForTimeout(450);
        await comp
          .getByRole("button", { name: /Exploded view|Assembled stack/i })
          .first()
          .click();
        await page.waitForTimeout(600);
        await comp
          .locator("button[aria-pressed]")
          .filter({ hasText: /Compose behavior/i })
          .first()
          .click();
        await page.waitForTimeout(550);
        await comp
          .locator("button[aria-pressed]")
          .filter({ hasText: /Verify decisions/i })
          .first()
          .click();
        await page.waitForTimeout(550);
      },
    ),
  );

  // 3. 03-packages-loom-and-composer.webm
  results.push(
    await recordInteractionVideo(
      browser,
      "03-packages-loom-and-composer.webm",
      async (page) => {
        await page.goto(`${portalBaseUrl}/packages`, {
          waitUntil: "networkidle",
        });
        await page.waitForTimeout(500);
        const loom = page.getByRole("tablist", {
          name: "AstraFlow capability modules",
        });
        await loom.getByRole("tab", { name: /Mediator/i }).click();
        await page.waitForTimeout(500);
        await loom.getByRole("tab", { name: /Testing/i }).click();
        await page.waitForTimeout(500);
        await page
          .getByRole("button", { name: /Stage in Stack Composer/i })
          .click();
        await page.waitForTimeout(600);

        const composer = page.locator("section#composer");
        const search = page.getByLabel("Filter 16 AstraFlow packages");
        await search.fill("Assertions");
        await page.waitForTimeout(400);
        await composer
          .locator("button[aria-pressed]")
          .filter({ hasText: "AstraFlow.Assertions" })
          .first()
          .click();
        await page.waitForTimeout(600);
        await composer
          .getByRole("tab", { name: "PackageReference XML" })
          .click();
        await page.waitForTimeout(600);
        await composer.getByRole("tab", { name: "dotnet CLI" }).click();
        await page.waitForTimeout(500);
      },
    ),
  );

  // 4. 04-changelog-living-edition.webm
  results.push(
    await recordInteractionVideo(
      browser,
      "04-changelog-living-edition.webm",
      async (page) => {
        await page.goto(`${portalBaseUrl}/changelog`, {
          waitUntil: "networkidle",
        });
        await page.waitForTimeout(500);
        const tabs = page
          .getByRole("tablist", {
            name: "Key AstraFlow release provenance milestones",
          })
          .getByRole("tab");
        if ((await tabs.count()) >= 3) {
          await tabs.nth(1).click();
          await page.waitForTimeout(500);
          await tabs.nth(2).click();
          await page.waitForTimeout(500);
          await tabs.nth(0).click();
          await page.waitForTimeout(450);
        }

        await page.locator("section#releases").scrollIntoViewIfNeeded();
        await page.waitForTimeout(450);
        await page
          .getByRole("button", { name: /Published Confirmed/i })
          .first()
          .click();
        await page.waitForTimeout(550);
        await page
          .getByRole("button", { name: /Unreleased Source/i })
          .first()
          .click();
        await page.waitForTimeout(550);
        await page.getByRole("button", { name: /^All\b/i }).first().click();
        await page.waitForTimeout(450);

        const toggle24 = page
          .locator('article[id="v2.4.0"] button[aria-expanded]')
          .first();
        await toggle24.click();
        await page.waitForTimeout(450);
        await toggle24.click();
        await page.waitForTimeout(550);
      },
    ),
  );

  // 5. 05-community-contribution-current.webm
  results.push(
    await recordInteractionVideo(
      browser,
      "05-community-contribution-current.webm",
      async (page) => {
        await page.goto(`${portalBaseUrl}/community`, {
          waitUntil: "networkidle",
        });
        const group = page.getByRole("group", {
          name: "AstraFlow contribution pathways",
        });
        await group.scrollIntoViewIfNeeded();
        await page.waitForTimeout(450);
        const nodes = group.locator("button");
        await nodes.nth(0).hover();
        await page.waitForTimeout(500);
        await nodes.nth(0).focus();
        for (let i = 1; i < 6; i++) {
          await page.keyboard.press("ArrowRight");
          await page.waitForTimeout(500);
        }
        await page.keyboard.press("Escape");
        await page.waitForTimeout(450);
      },
    ),
  );

  // 6. 06-guides-kinetic-runway.webm
  results.push(
    await recordInteractionVideo(
      browser,
      "06-guides-kinetic-runway.webm",
      async (page) => {
        await page.goto(`${portalBaseUrl}/guides`, {
          waitUntil: "networkidle",
        });
        const runway = page.getByRole("tablist", {
          name: "AstraFlow learning milestones",
        });
        await runway.scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);
        const nextBtn = page.getByRole("button", { name: /Next milestone/i });
        for (let i = 0; i < 5; i++) {
          await nextBtn.click();
          await page.waitForTimeout(550);
        }
        await page.waitForTimeout(700);
      },
    ),
  );

  return results;
}

async function capturePerformance(browser, portalBaseUrl) {
  const routes = [
    "/",
    "/packages",
    "/docs",
    "/guides",
    "/changelog",
    "/community",
  ];
  const report = {
    generatedAt: new Date().toISOString(),
    viewport: "1440x900",
    routes: {},
  };

  for (const route of routes) {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();

    await page.addInitScript(() => {
      window.__gate4Perf = { lcp: 0, cls: 0 };
      try {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const last = entries[entries.length - 1];
          if (last) {
            window.__gate4Perf.lcp = Math.round(last.startTime * 100) / 100;
          }
        }).observe({ type: "largest-contentful-paint", buffered: true });
      } catch {
        // unsupported
      }
      try {
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              window.__gate4Perf.cls += entry.value;
            }
          }
        }).observe({ type: "layout-shift", buffered: true });
      } catch {
        // unsupported
      }
    });

    await page.goto(`${portalBaseUrl}${route}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    const metrics = await page.evaluate(() => {
      const nav = performance.getEntriesByType("navigation")[0];
      const paints = performance.getEntriesByType("paint");
      const fcpEntry = paints.find((p) => p.name === "first-contentful-paint");
      const resources = performance.getEntriesByType("resource");
      const jsResources = resources.filter(
        (r) =>
          r.initiatorType === "script" ||
          r.name.split("?")[0].endsWith(".js"),
      );
      const totalJsTransferBytes = jsResources.reduce((acc, r) => {
        const size = r.transferSize > 0 ? r.transferSize : r.encodedBodySize;
        return acc + (size || 0);
      }, 0);

      const ttfb = nav
        ? Math.round((nav.responseStart - nav.requestStart) * 100) / 100
        : 0;
      const fcp = fcpEntry ? Math.round(fcpEntry.startTime * 100) / 100 : 0;

      return {
        ttfbMs: ttfb,
        fcpMs: fcp,
        lcpMs: window.__gate4Perf?.lcp ?? fcp,
        cls: Math.round((window.__gate4Perf?.cls ?? 0) * 10000) / 10000,
        resourceCount: resources.length,
        jsResourceCount: jsResources.length,
        totalJsTransferBytes,
      };
    });

    report.routes[route] = metrics;
    await context.close();
  }

  fs.writeFileSync(perfReportPath, `${JSON.stringify(report, null, 2)}\n`);
  return report;
}

async function main() {
  if (!fs.existsSync(referenceDir)) {
    throw new Error(`Missing reference-v12 directory: ${referenceDir}`);
  }

  fs.mkdirSync(screenshotsDir, { recursive: true });
  fs.mkdirSync(comparisonsDir, { recursive: true });
  fs.mkdirSync(videosDir, { recursive: true });

  const staticSrv = await startStaticServer(referenceDir);
  const nextPort = await getFreePort();
  const portalBaseUrl = `http://127.0.0.1:${nextPort}`;
  const nextBin = path.join(portalDir, "node_modules", "next", "dist", "bin", "next");

  const nextChild = spawn(
    process.execPath,
    [nextBin, "start", "-p", String(nextPort), "-H", "127.0.0.1"],
    {
      cwd: portalDir,
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, NODE_ENV: "production" },
    },
  );

  let serverLogs = "";
  nextChild.stdout?.on("data", (d) => {
    serverLogs += d.toString();
  });
  nextChild.stderr?.on("data", (d) => {
    serverLogs += d.toString();
  });

  let browser;
  try {
    await waitForHttpOk(portalBaseUrl, 45000);
    await waitForHttpOk(`${staticSrv.baseUrl}/index.html`, 10000);

    browser = await chromium.launch({ headless: true });

    const screenshots = await captureScreenshots(browser, portalBaseUrl);
    const comparisons = await captureComparisons(
      browser,
      staticSrv.baseUrl,
      portalBaseUrl,
    );
    const videos = await captureVideos(browser, portalBaseUrl);
    const perf = await capturePerformance(browser, portalBaseUrl);

    console.log(
      JSON.stringify(
        {
          screenshotsCount: screenshots.length,
          comparisonsCount: comparisons.length,
          videos,
          performanceRoutes: Object.keys(perf.routes),
          perfReportPath,
        },
        null,
        2,
      ),
    );
  } catch (err) {
    console.error("Gate 4 capture failed:", err);
    if (serverLogs) {
      console.error("Next.js server output:\n", serverLogs);
    }
    process.exitCode = 1;
  } finally {
    await browser?.close();
    await stopChildProcess(nextChild);
    await new Promise((resolve) => staticSrv.server.close(() => resolve()));
  }
}

await main();
