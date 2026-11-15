import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const PORTAL_DIR = process.cwd();
const PUBLIC_DIR = path.join(PORTAL_DIR, "public");
const SOURCE_SVG_PATH = path.join(PUBLIC_DIR, "favicon.svg");

const PNG_TARGETS = [
  { size: 96, file: "favicon-96x96.png" },
  { size: 180, file: "apple-touch-icon.png" },
  { size: 192, file: "web-app-manifest-192x192.png" },
  { size: 512, file: "web-app-manifest-512x512.png" },
];

const ICO_SIZES = [16, 32, 48];

function buildIcoBuffer(entries) {
  const headerSize = 6;
  const dirEntrySize = 16;
  const directoryOffset = headerSize + dirEntrySize * entries.length;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(entries.length, 4);

  const dirBuffers = [];
  const dataBuffers = [];
  let currentOffset = directoryOffset;

  for (const entry of entries) {
    const dir = Buffer.alloc(dirEntrySize);
    const dimByte = entry.size >= 256 ? 0 : entry.size;
    dir.writeUInt8(dimByte, 0);
    dir.writeUInt8(dimByte, 1);
    dir.writeUInt8(0, 2);
    dir.writeUInt8(0, 3);
    dir.writeUInt16LE(1, 4);
    dir.writeUInt16LE(32, 6);
    dir.writeUInt32LE(entry.buffer.length, 8);
    dir.writeUInt32LE(currentOffset, 12);

    dirBuffers.push(dir);
    dataBuffers.push(entry.buffer);
    currentOffset += entry.buffer.length;
  }

  return Buffer.concat([header, ...dirBuffers, ...dataBuffers]);
}

async function renderSvgAtSize(browser, svgMarkup, size) {
  const context = await browser.newContext({
    viewport: { width: size, height: size },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        width: ${size}px;
        height: ${size}px;
        background: transparent;
        overflow: hidden;
      }
      svg {
        display: block;
        width: ${size}px;
        height: ${size}px;
      }
    </style>
  </head>
  <body>${svgMarkup}</body>
</html>`;

  await page.setContent(html, { waitUntil: "load" });
  const pngBuffer = await page.screenshot({
    type: "png",
    omitBackground: true,
    clip: { x: 0, y: 0, width: size, height: size },
  });
  await context.close();
  return pngBuffer;
}

async function main() {
  if (!fs.existsSync(SOURCE_SVG_PATH)) {
    throw new Error(`Missing source SVG at ${SOURCE_SVG_PATH}`);
  }

  const svgMarkup = fs.readFileSync(SOURCE_SVG_PATH, "utf8");
  const browser = await chromium.launch();

  try {
    const icoEntries = [];
    for (const size of ICO_SIZES) {
      const buffer = await renderSvgAtSize(browser, svgMarkup, size);
      icoEntries.push({ size, buffer });
    }

    const icoBuffer = buildIcoBuffer(icoEntries);
    fs.writeFileSync(path.join(PUBLIC_DIR, "favicon.ico"), icoBuffer);

    for (const target of PNG_TARGETS) {
      const buffer = await renderSvgAtSize(browser, svgMarkup, target.size);
      fs.writeFileSync(path.join(PUBLIC_DIR, target.file), buffer);
    }

    console.log(
      `Generated circular Warm Ivory medallion favicons: favicon.ico (${ICO_SIZES.join("/")}), ${PNG_TARGETS.map((t) => `${t.file} (${t.size}px)`).join(", ")}`
    );
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
