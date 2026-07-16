import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";

const root = process.cwd();
const artifactDir = path.join(root, "verificacion");
const baseUrl = "http://127.0.0.1:4173/";
const referenceUrl = "https://banhmivietnam.xyz/";
const desktopViewport = { width: 1440, height: 1000 };
const mobileViewport = { width: 390, height: 844 };

await mkdir(artifactDir, { recursive: true });

const server = spawn(
  process.execPath,
  [path.join(root, "node_modules/vite/bin/vite.js"), "--host", "127.0.0.1", "--port", "4173", "--strictPort"],
  { cwd: root, detached: true, stdio: ["ignore", "pipe", "pipe"] },
);

let serverOutput = "";
server.stdout.on("data", (chunk) => (serverOutput += chunk));
server.stderr.on("data", (chunk) => (serverOutput += chunk));

async function waitForServer() {
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {
      // Vite is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`Vite did not become ready.\n${serverOutput}`);
}

async function launchChromium() {
  let lastError;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      return await chromium.launch({ headless: true });
    } catch (error) {
      lastError = error;
      console.error(`Chromium launch attempt ${attempt} failed: ${error.message}`);
    }
  }
  throw new Error(`Chromium did not start after two attempts: ${lastError?.message}`);
}

function attachStrictDiagnostics(page, label) {
  const issues = [];

  page.on("pageerror", (error) => issues.push(`${label} pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") {
      issues.push(`${label} console.error: ${message.text()}`);
    }
  });
  page.on("requestfailed", (request) => {
    if (["document", "script", "stylesheet", "image", "font"].includes(request.resourceType())) {
      issues.push(
        `${label} request failed: ${request.resourceType()} ${request.url()} (${request.failure()?.errorText ?? "unknown"})`,
      );
    }
  });

  return issues;
}

async function waitForSettledHero(page) {
  await page.waitForFunction(() => {
    const preload = document.querySelector(".preload");
    return preload && getComputedStyle(preload).display === "none";
  }, { timeout: 20_000 });
  await page.evaluate(async () => {
    await document.fonts.ready;
    const images = [...document.querySelectorAll(".hero img")];
    await Promise.all(
      images.map((image) =>
        image.complete
          ? Promise.resolve()
          : new Promise((resolve, reject) => {
              image.addEventListener("load", resolve, { once: true });
              image.addEventListener("error", reject, { once: true });
            }),
      ),
    );
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(500);
}

async function openSettledPage(context, url, { strict = false, label = "page" } = {}) {
  const page = await context.newPage();
  const issues = strict ? attachStrictDiagnostics(page, label) : [];
  const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });
  assert(response?.ok(), `${label} did not respond successfully`);
  await waitForSettledHero(page);
  return { page, issues };
}

async function captureReference(browser, viewport, filename) {
  const context = await browser.newContext({ viewport, reducedMotion: "no-preference" });
  const { page } = await openSettledPage(context, referenceUrl, { label: `reference ${filename}` });
  await page.screenshot({ path: path.join(artifactDir, filename), animations: "disabled" });
  await context.close();
}

async function checkDesktop(browser) {
  const context = await browser.newContext({ viewport: desktopViewport, reducedMotion: "no-preference" });
  const { page, issues } = await openSettledPage(context, baseUrl, { strict: true, label: "desktop" });

  await page.screenshot({ path: path.join(artifactDir, "replica-desktop.png"), animations: "disabled" });

  assert.equal(await page.title(), "Bánh Mì Vietnam");
  assert.equal(await page.locator(".hero-h1").allTextContents().then((items) => items.map((text) => text.trim()).join(" / ")), "Banh mi / Viet nam");
  assert.match(await page.locator(".hero-b2").innerText(), /legendary, crispy\s+flavor/);
  assert.equal(await page.locator(".hero img").count(), 2);

  const designTokens = await page.evaluate(() => ({
    brand: getComputedStyle(document.documentElement).getPropertyValue("--brand").trim(),
    surface: getComputedStyle(document.documentElement).getPropertyValue("--surface").trim(),
    red: getComputedStyle(document.documentElement).getPropertyValue("--surface-red").trim(),
    green: getComputedStyle(document.documentElement).getPropertyValue("--surface-green").trim(),
    headingFont: getComputedStyle(document.querySelector(".hero-h1")).fontFamily,
    bodyFont: getComputedStyle(document.querySelector(".hero-b2")).fontFamily,
    horizontalOverflow: document.documentElement.scrollWidth - window.innerWidth,
    remoteImages: [...document.images].every((image) => image.src.startsWith("https://banhmivietnam.xyz/img/")),
    imageCount: document.images.length,
  }));
  assert.deepEqual(
    [designTokens.brand, designTokens.surface, designTokens.red, designTokens.green],
    ["#f5ecd7", "#d4a373", "#bc4749", "#6a994e"],
  );
  assert.match(designTokens.headingFont.toLowerCase(), /asap condensed/);
  assert.match(designTokens.bodyFont.toLowerCase(), /poppins/);
  assert(designTokens.horizontalOverflow <= 1, `desktop horizontal overflow: ${designTokens.horizontalOverflow}px`);
  assert(designTokens.remoteImages && designTokens.imageCount >= 40, "the page must reuse all original image URLs");

  const expectedSectionText = [
    ["#evolution", "The Evolution of bánh mì"],
    ["#msTop", "The arrival"],
    ["#ms2", "The rebirth"],
    ["#ms3", "Global recognition"],
    ["#anatomy", "Discover the delicate balance"],
    ["#fillings", "Types of"],
    ["#street", "Bánh mì can easily be found"],
    ["footer", "©2026. Created by"],
  ];
  for (const [selector, text] of expectedSectionText) {
    await assert.doesNotReject(() => page.locator(selector).getByText(text, { exact: false }).first().waitFor());
  }

  const menuTargets = ["#evolution", "#anatomy", "#fillings", "#street"];
  for (const target of menuTargets) {
    await page.locator(`.hero-top a[href="${target}"]`).evaluate((link) => link.click());
    await page.waitForTimeout(250);
    assert.equal(await page.evaluate(() => window.location.hash), target, `${target} menu link did not respond`);
  }
  await page.locator('footer a[href="#hero"]').evaluate((link) => link.click());
  await page.waitForTimeout(250);
  assert.equal(await page.evaluate(() => window.location.hash), "#hero");

  await page.evaluate(() => window.scrollTo({ top: 1800, behavior: "instant" }));
  await page.waitForTimeout(800);
  const scrollState = await page.evaluate(() => ({
    progress: Number.parseFloat(getComputedStyle(document.querySelector(".progress-bar")).width),
    fixedMenu: document.querySelector(".fixed-menu").classList.contains("is-appear"),
  }));
  assert(scrollState.progress > 0, "progress bar did not update");
  assert(scrollState.fixedMenu, "fixed desktop menu did not appear after scrolling");

  await page.evaluate(() => {
    const wrapper = document.querySelector(".fl-wrapper");
    window.scrollTo({ top: wrapper.offsetTop + window.innerHeight * 2, behavior: "instant" });
  });
  await page.waitForTimeout(1600);
  await page.locator(".fl-slide-wrap.swiper-initialized").waitFor({ state: "attached" });

  const track = page.locator(".fl-slide");
  const autoplayBefore = await track.evaluate((element) => getComputedStyle(element).transform);
  await page.waitForTimeout(2300);
  const autoplayAfter = await track.evaluate((element) => getComputedStyle(element).transform);
  assert.notEqual(autoplayAfter, autoplayBefore, "carousel autoplay did not move");

  const activeCard = page.locator(".fl-img.swiper-slide-active").first();
  await activeCard.hover();
  await page.waitForTimeout(400);
  const hoveredTransform = await activeCard.locator("img").evaluate((image) => getComputedStyle(image).transform);
  assert.notEqual(hoveredTransform, "none", "filling card hover did not transform the image");

  await page.mouse.move(10, 10);
  const buttonBefore = await track.evaluate((element) => getComputedStyle(element).transform);
  await page.locator("#btnNext").click({ force: true });
  await page.waitForTimeout(700);
  const buttonAfter = await track.evaluate((element) => getComputedStyle(element).transform);
  assert.notEqual(buttonAfter, buttonBefore, "next carousel control did not move the track");

  assert.deepEqual(issues, [], issues.join("\n"));
  await context.close();
}

async function checkMobile(browser) {
  const context = await browser.newContext({ viewport: mobileViewport, reducedMotion: "no-preference" });
  const { page, issues } = await openSettledPage(context, baseUrl, { strict: true, label: "mobile" });

  await page.screenshot({ path: path.join(artifactDir, "replica-mobile.png"), animations: "disabled" });

  const mobileLayout = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - window.innerWidth,
    desktopLinkDisplay: getComputedStyle(document.querySelector(".hero-top .navlink")).display,
    mobileMenuDisplay: getComputedStyle(document.querySelector(".hero-top .menu-mobile")).display,
  }));
  assert(mobileLayout.overflow <= 1, `mobile horizontal overflow: ${mobileLayout.overflow}px`);
  assert.equal(mobileLayout.desktopLinkDisplay, "none");
  assert.equal(mobileLayout.mobileMenuDisplay, "flex");

  await page.locator(".hero-top .menu-mobile").click();
  await page.waitForTimeout(350);
  assert.equal(await page.locator(".navmobile-wrap").evaluate((element) => getComputedStyle(element).display), "flex");
  await page.locator('.navmobile a[href="#anatomy"]').click();
  await page.waitForTimeout(800);
  assert.equal(await page.evaluate(() => window.location.hash), "#anatomy");
  assert.equal(await page.locator(".navmobile-wrap").evaluate((element) => getComputedStyle(element).display), "none");

  assert.deepEqual(issues, [], issues.join("\n"));
  await context.close();
}

let browser;
try {
  await waitForServer();
  browser = await launchChromium();

  await captureReference(browser, desktopViewport, "original-desktop.png");
  await captureReference(browser, mobileViewport, "original-mobile.png");
  await checkDesktop(browser);
  await checkMobile(browser);

  await writeFile(
    path.join(artifactDir, "resultados.json"),
    `${JSON.stringify({ qa: "passed", checkedAt: new Date().toISOString() }, null, 2)}\n`,
  );
  console.log("QA funcional aprobado: desktop, mobile, navegación, hover, carousel y diagnósticos.");
} finally {
  await browser?.close();
  if (server.pid) {
    try {
      process.kill(-server.pid, "SIGTERM");
    } catch {
      server.kill("SIGTERM");
    }
  }
}
