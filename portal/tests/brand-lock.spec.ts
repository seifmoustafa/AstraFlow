import { expect, test } from "@playwright/test";

const MAIN_ROUTES = [
  "/",
  "/packages",
  "/docs",
  "/guides",
  "/changelog",
  "/community",
] as const;

const ALL_CORE_ROUTES = [
  "/",
  "/packages",
  "/docs",
  "/docs/getting-started",
  "/guides",
  "/changelog",
  "/community",
] as const;

const WARM_IVORY_RGB = "rgb(247, 243, 235)";
const FORBIDDEN_CYANS = new Set([
  "rgb(114, 213, 222)", // #72d5de
  "rgb(12, 20, 32)", // #0c1420
]);

function parseRgb(rgbString: string): [number, number, number] | null {
  const match = rgbString.match(/rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)/i);
  if (!match) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const toLinear = (channel: number) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return (
    0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
  );
}

test.describe("AstraFlow Brand Lock Verification", () => {
  for (const route of ALL_CORE_ROUTES) {
    test(`enforces Warm Forest tokens, no toggles, no cyan, and valid SVGs on ${route}`, async ({
      page,
    }) => {
      await page.goto(route, { waitUntil: "networkidle" });

      // 1. HTML attributes and light color scheme
      const htmlState = await page.evaluate(() => {
        const html = document.documentElement;
        return {
          lang: html.getAttribute("lang"),
          dir: html.getAttribute("dir"),
          dataTheme: html.getAttribute("data-theme"),
          colorScheme: getComputedStyle(html).colorScheme,
          bodyBg: getComputedStyle(document.body).backgroundColor,
        };
      });

      expect(htmlState.lang).toBe("en");
      expect(htmlState.dir).toBe("ltr");
      expect(htmlState.dataTheme).toBe("warm-forest");
      expect(htmlState.colorScheme).toBe("light");
      expect(htmlState.bodyBg).toBe(WARM_IVORY_RGB);

      // 2. Non-dark hero across all 6 main pages
      if ((MAIN_ROUTES as readonly string[]).includes(route)) {
        const hero = page.locator("section.hero").first();
        await expect(hero).toBeVisible();
        const heroColors = await hero.evaluate((el) => {
          const style = getComputedStyle(el);
          return {
            backgroundColor: style.backgroundColor,
            backgroundImage: style.backgroundImage,
            color: style.color,
          };
        });

        const parsedBg = parseRgb(heroColors.backgroundColor);
        expect(parsedBg).not.toBeNull();
        // Either transparent over Warm Ivory body or light/warm background surface
        if (heroColors.backgroundColor !== "rgba(0, 0, 0, 0)") {
          expect(relativeLuminance(parsedBg!)).toBeGreaterThan(0.65);
        }
        // Ink on hero must remain dark forest ink, not light-on-dark
        const parsedInk = parseRgb(heroColors.color);
        expect(parsedInk).not.toBeNull();
        expect(relativeLuminance(parsedInk!)).toBeLessThan(0.25);
        expect(heroColors.backgroundImage.toLowerCase()).not.toContain(
          "12, 20, 32",
        );
      }

      // 3. ZERO theme toggles, ZERO IVORY/DARK switches, ZERO language/RTL switches
      const forbiddenSwitches = await page.evaluate(() => {
        const controls = Array.from(
          document.querySelectorAll(
            'button, [role="switch"], [role="combobox"], select, input[type="checkbox"], input[type="radio"], a',
          ),
        );
        const matches: string[] = [];
        for (const el of controls) {
          const id = el.getAttribute("id") || "";
          const testId = el.getAttribute("data-testid") || "";
          const ariaLabel = el.getAttribute("aria-label") || "";
          const text = (el.textContent || "").trim();
          const combined = `${id} ${testId} ${ariaLabel} ${text}`;
          if (
            /\b(ivory\s*\/\s*dark|dark\s*mode|light\s*mode|toggle\s*theme|theme\s*toggle|rtl\s*mode|switch\s*language|ar\s*\/\s*en|en\s*\/\s*ar)\b/i.test(
              combined,
            ) ||
            /theme[-_]?toggle|lang[-_]?switch|dir[-_]?switch/i.test(
              `${id} ${testId} ${el.className?.toString() || ""}`,
            )
          ) {
            matches.push(combined.slice(0, 120));
          }
        }
        const bodyText = document.body.innerText || "";
        if (/\bIVORY\s*\/\s*DARK\b/i.test(bodyText)) {
          matches.push("body text contains IVORY/DARK");
        }
        return matches;
      });
      expect(forbiddenSwitches).toEqual([]);

      // 4. ZERO forbidden cyan / electric-blue colors in computed styles
      const cyanViolations = await page.evaluate((forbiddenList) => {
        const forbidden = new Set(forbiddenList);
        const hits: string[] = [];
        const all = document.querySelectorAll("*");
        for (const el of all) {
          const cs = getComputedStyle(el);
          const props: Array<[string, string]> = [
            ["backgroundColor", cs.backgroundColor],
            ["color", cs.color],
            ["borderTopColor", cs.borderTopColor],
            ["borderRightColor", cs.borderRightColor],
            ["borderBottomColor", cs.borderBottomColor],
            ["borderLeftColor", cs.borderLeftColor],
            ["fill", cs.fill],
            ["stroke", cs.stroke],
          ];
          for (const [prop, val] of props) {
            if (val && forbidden.has(val.toLowerCase())) {
              hits.push(`${el.tagName}.${el.className} ${prop}=${val}`);
            }
          }
          const bgImg = cs.backgroundImage || "";
          if (
            bgImg.includes("114, 213, 222") ||
            bgImg.includes("12, 20, 32") ||
            bgImg.toLowerCase().includes("#72d5de") ||
            bgImg.toLowerCase().includes("#0c1420")
          ) {
            hits.push(`${el.tagName} backgroundImage=${bgImg}`);
          }
        }
        return hits;
      }, Array.from(FORBIDDEN_CYANS));
      expect(cyanViolations).toEqual([]);

      // 5. Header and footer brand SVGs + visible non-clipped wordmarks
      const headerLogo = page.locator(".site-header .brand img");
      await expect(headerLogo).toBeVisible();
      await expect(headerLogo).toHaveAttribute("src", "/brand/mark-on-light.svg");
      const headerImgCheck = await headerLogo.evaluate((img) => {
        const el = img as HTMLImageElement;
        return {
          complete: el.complete,
          naturalWidth: el.naturalWidth,
          filter: getComputedStyle(el).filter,
        };
      });
      expect(headerImgCheck.complete).toBe(true);
      expect(headerImgCheck.naturalWidth).toBeGreaterThan(0);
      expect(headerImgCheck.filter).toBe("none");

      const headerWordmark = page.locator(".site-header .brand strong");
      await expect(headerWordmark).toBeVisible();
      await expect(headerWordmark).toHaveText("AstraFlow");
      const headerWordmarkMetrics = await headerWordmark.evaluate((el) => {
        const rect = el.getBoundingClientRect();
        return {
          width: rect.width,
          height: rect.height,
          right: rect.right,
          viewportWidth: window.innerWidth,
          scrollWidth: el.scrollWidth,
          clientWidth: el.clientWidth,
        };
      });
      expect(headerWordmarkMetrics.width).toBeGreaterThan(20);
      expect(headerWordmarkMetrics.height).toBeGreaterThan(8);
      expect(headerWordmarkMetrics.right).toBeLessThanOrEqual(
        headerWordmarkMetrics.viewportWidth + 1,
      );
      expect(headerWordmarkMetrics.scrollWidth).toBeLessThanOrEqual(
        headerWordmarkMetrics.clientWidth + 1,
      );

      const footerLogo = page.locator(".footer .brand img");
      await footerLogo.scrollIntoViewIfNeeded();
      await expect(footerLogo).toBeVisible();
      await expect(footerLogo).toHaveAttribute("src", "/brand/mark-on-dark.svg");
      const footerImgCheck = await footerLogo.evaluate((img) => {
        const el = img as HTMLImageElement;
        return {
          complete: el.complete,
          naturalWidth: el.naturalWidth,
          filter: getComputedStyle(el).filter,
        };
      });
      expect(footerImgCheck.complete).toBe(true);
      expect(footerImgCheck.naturalWidth).toBeGreaterThan(0);
      expect(footerImgCheck.filter).toBe("none");

      const footerWordmark = page.locator(".footer .brand strong");
      await expect(footerWordmark).toBeVisible();
      await expect(footerWordmark).toHaveText("AstraFlow");
      const footerWordmarkMetrics = await footerWordmark.evaluate((el) => {
        const rect = el.getBoundingClientRect();
        return {
          width: rect.width,
          height: rect.height,
          right: rect.right,
          viewportWidth: window.innerWidth,
          scrollWidth: el.scrollWidth,
          clientWidth: el.clientWidth,
        };
      });
      expect(footerWordmarkMetrics.width).toBeGreaterThan(20);
      expect(footerWordmarkMetrics.height).toBeGreaterThan(8);
      expect(footerWordmarkMetrics.right).toBeLessThanOrEqual(
        footerWordmarkMetrics.viewportWidth + 1,
      );
      expect(footerWordmarkMetrics.scrollWidth).toBeLessThanOrEqual(
        footerWordmarkMetrics.clientWidth + 1,
      );

      // 6. Zero visible pause/stop/resume signal/motion toggle buttons anywhere
      const forbiddenMotionButtons = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll("button"));
        return btns
          .filter((btn) => {
            const style = getComputedStyle(btn);
            const rect = btn.getBoundingClientRect();
            const isVisible =
              style.display !== "none" &&
              style.visibility !== "hidden" &&
              rect.width > 0 &&
              rect.height > 0;
            const text =
              `${btn.textContent ?? ""} ${btn.getAttribute("aria-label") ?? ""}`.trim();
            return (
              isVisible &&
              /\b(pause|stop|resume)\s+(signal|pulse|animation|motion)\b/i.test(
                text,
              )
            );
          })
          .map(
            (btn) => btn.textContent?.trim() || btn.getAttribute("aria-label"),
          );
      });
      expect(forbiddenMotionButtons).toEqual([]);
    });
  }

  test("keeps Home Hero A mark and h1 stationary across 1200ms with continuous signal and full-bleed Proof Strip band", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    const signatureA = page.locator(".v10-logo-svg .signature-a").first();
    const heroHeading = page.locator("#v10-hero-heading");
    const signatureRoute = page.locator("#signature-route").first();
    const proofBand = page.locator(".proof-strip-band").first();

    await expect(signatureA).toBeVisible();
    await expect(heroHeading).toBeVisible();
    await expect(signatureRoute).toBeVisible();
    await expect(proofBand).toBeVisible();
    await expect(page.locator("#v10-motion-toggle")).toHaveCount(0);

    const boxAStart = await signatureA.boundingBox();
    const boxH1Start = await heroHeading.boundingBox();
    expect(boxAStart).not.toBeNull();
    expect(boxH1Start).not.toBeNull();

    await page.waitForTimeout(1200);

    const boxAEnd = await signatureA.boundingBox();
    const boxH1End = await heroHeading.boundingBox();
    expect(boxAEnd).not.toBeNull();
    expect(boxH1End).not.toBeNull();

    for (const key of ["x", "y", "width", "height"] as const) {
      expect(Math.abs(boxAEnd![key] - boxAStart![key])).toBeLessThanOrEqual(1);
      expect(Math.abs(boxH1End![key] - boxH1Start![key])).toBeLessThanOrEqual(1);
    }

    const playState = await signatureRoute.evaluate(
      (el) => getComputedStyle(el).animationPlayState,
    );
    expect(playState).toBe("running");

    const proofBandMetrics = await proofBand.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return {
        width: rect.width,
        innerWidth: window.innerWidth,
        backgroundColor: getComputedStyle(el).backgroundColor,
      };
    });
    expect(
      Math.abs(proofBandMetrics.width - proofBandMetrics.innerWidth),
    ).toBeLessThanOrEqual(2);

    const proofBgRgb = parseRgb(proofBandMetrics.backgroundColor);
    expect(proofBgRgb).not.toBeNull();
    expect(relativeLuminance(proofBgRgb!)).toBeGreaterThan(0.94);
  });

  test("displays header GitHub repository icon link cleanly on desktop and inside opened mobile drawer", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    const viewportWidth = page.viewportSize()?.width ?? 1440;
    if (viewportWidth > 900) {
      const desktopGhLink = page
        .locator(
          '.site-header .header-actions a[aria-label="AstraFlow GitHub repository"]',
        )
        .first();
      await expect(desktopGhLink).toBeVisible();
      await expect(desktopGhLink).toHaveAttribute(
        "href",
        "https://github.com/seifmoustafa/AstraFlow",
      );
      await expect(desktopGhLink.locator("svg").first()).toBeVisible();
      const rect = await desktopGhLink.boundingBox();
      expect(rect).not.toBeNull();
      expect(rect!.width).toBeGreaterThan(16);
      expect(rect!.height).toBeGreaterThan(16);
      expect(rect!.x + rect!.width).toBeLessThanOrEqual(viewportWidth + 1);
    } else {
      const menuBtn = page.locator("button.mobile-menu");
      const mobileGhLink = page.locator(
        'nav#main-menu a[aria-label="AstraFlow GitHub repository"]',
      );
      await expect(menuBtn).toBeVisible();
      await expect(mobileGhLink).not.toBeVisible();

      await menuBtn.click();
      await expect(mobileGhLink).toBeVisible();
      await expect(mobileGhLink).toHaveAttribute(
        "href",
        "https://github.com/seifmoustafa/AstraFlow",
      );
      await expect(mobileGhLink.locator("svg").first()).toBeVisible();

      await page.keyboard.press("Escape");
      await expect(menuBtn).toHaveAttribute("aria-expanded", "false");
    }
  });
});
