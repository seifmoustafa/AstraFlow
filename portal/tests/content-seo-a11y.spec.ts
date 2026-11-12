import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const AUDIT_ROUTES = [
  "/",
  "/packages",
  "/docs",
  "/docs/getting-started",
  "/guides",
  "/changelog",
  "/community",
] as const;

const MAIN_ROUTES = [
  "/",
  "/packages",
  "/docs",
  "/guides",
  "/changelog",
  "/community",
] as const;

test.describe("AstraFlow SEO Metadata, Custom 404, and WCAG 2.2 AA Accessibility", () => {
  test("verifies /sitemap.xml, /robots.txt, /opengraph-image, and Warm Forest 404 recovery page", async ({
    page,
    request,
  }) => {
    const sitemapRes = await request.get("/sitemap.xml");
    expect(sitemapRes.status()).toBe(200);
    const sitemapXml = await sitemapRes.text();
    expect(sitemapXml).toContain("<urlset");
    for (const route of MAIN_ROUTES) {
      expect(sitemapXml).toContain(route === "/" ? "<loc>" : route);
    }

    const robotsRes = await request.get("/robots.txt");
    expect(robotsRes.status()).toBe(200);
    const robotsTxt = await robotsRes.text();
    expect(robotsTxt.toLowerCase()).toContain("user-agent");

    const ogRes = await request.get("/opengraph-image");
    expect(ogRes.status()).toBe(200);
    expect(ogRes.headers()["content-type"]).toContain("image/png");
    const ogBytes = await ogRes.body();
    expect(ogBytes.byteLength).toBeGreaterThan(1000);

    const notFoundRes = await page.goto("/non-existent-astraflow-route", {
      waitUntil: "networkidle",
    });
    expect(notFoundRes?.status()).toBe(404);
    await expect(page.locator("html")).toHaveAttribute(
      "data-theme",
      "warm-forest",
    );
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByRole("link", { name: /home/i }).first()).toBeVisible();
  });

  for (const route of AUDIT_ROUTES) {
    test(`axe-core WCAG 2.0/2.1/2.2 A/AA audit reports 0 critical, serious, or moderate violations on ${route}`, async ({
      page,
    }) => {
      await page.goto(route, { waitUntil: "networkidle" });

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();

      const blocking = results.violations.filter((v) =>
        ["critical", "serious", "moderate"].includes(v.impact ?? ""),
      );

      expect(
        blocking.map((v) => ({
          id: v.id,
          impact: v.impact,
          description: v.description,
          nodes: v.nodes.slice(0, 5).map((n) => ({
            target: n.target,
            failureSummary: n.failureSummary,
          })),
        })),
      ).toEqual([]);
    });
  }
});
