#!/usr/bin/env node
/*
 * Renders brochure.html to brochure/Power-Equipment-Schedule.pdf.
 * Needs Node and Playwright with Chromium:  npm i -g playwright && npx playwright install chromium
 * Run from anywhere:                        node brochure/build.js
 */
const http = require("http");
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const out = path.join(__dirname, "Power-Equipment-Schedule.pdf");
const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".webp": "image/webp", ".woff2": "font/woff2", ".svg": "image/svg+xml" };

const server = http.createServer((req, res) => {
  const file = path.join(root, decodeURIComponent(req.url.split("?")[0]));
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});

server.listen(0, async () => {
  const { port } = server.address();
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    page.on("pageerror", (e) => { console.error(e); process.exitCode = 1; });
    await page.goto(`http://localhost:${port}/brochure/brochure.html`, { waitUntil: "networkidle" });
    await page.waitForSelector("html[data-ready], html[data-error]", { timeout: 60000 });
    const err = await page.getAttribute("html", "data-error");
    if (err) throw new Error("Brochure failed to render: " + err);
    await page.pdf({ path: out, preferCSSPageSize: true, printBackground: true });
    const pages = await page.locator(".page").count();
    console.log(`Wrote ${path.relative(process.cwd(), out)} (${pages} pages)`);
  } finally {
    await browser.close();
    server.close();
  }
});
