#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";

const root = process.cwd();
const version = "v5.129";
const baseUrl = (process.env.FITMEET_QA_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const evidenceRel = `output/qa/${version}-fullsite-award-qa.json`;
const screenshotDirRel = `output/qa/${version}-fullsite-award-screenshots`;
const evidencePath = path.join(root, evidenceRel);
const screenshotDir = path.join(root, screenshotDirRel);
const chromePath = process.env.FITMEET_CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const viewports = [
  { width: 1366, height: 900 },
  { width: 1440, height: 1000 },
  { width: 1920, height: 1080 },
];

const routes = [
  { path: "/", name: "home", snippets: ["Social World", "社交不是筛选", "真实计划"] },
  { path: "/product", name: "product", snippets: ["真实计划", "先有计划", "Agent"] },
  { path: "/scenes", name: "scenes", snippets: ["先有具体的事", "真实场景", "夜跑"] },
  { path: "/community", name: "community", snippets: ["Social World", "城市", "公开"] },
  { path: "/safety", name: "safety", snippets: ["先确认边界", "公开地点", "退出"] },
  { path: "/about", name: "about", snippets: ["真实生活", "Social World", "城市"] },
  { path: "/journal", name: "journal", snippets: ["Social World", "产品进展", "城市观察"] },
  { path: "/contact", name: "contact", snippets: ["15253005312@163.com", "企业合作", "真实需求"] },
  { path: "/privacy", name: "privacy", snippets: ["隐私边界", "真实需求", "企业合作"] },
  { path: "/terms", name: "terms", snippets: ["真实社交", "边界", "公开场景"] },
  { path: "/cookies", name: "cookies", snippets: ["Cookie", "可解释", "透明"] },
  { path: "/not-found", name: "not-found", snippets: ["这条路线暂时没有计划", "Social World"] },
  { path: "/thank-you", name: "thank-you", snippets: ["真实需求已进入计划队列", "Social World"] },
];

const legacyRedirects = [
  { from: "/agent", to: "/product" },
  { from: "/cities", to: "/community" },
  { from: "/faq", to: "/safety" },
  { from: "/investors", to: "/about" },
  { from: "/join", to: "/contact#waitlist" },
  { from: "/partners", to: "/contact#enterprise" },
  { from: "/press", to: "/journal" },
  { from: "/stories", to: "/journal" },
  { from: "/world", to: "/community" },
];

const bannedTerms = [
  "陌生人速配",
  "附近异性",
  "灵魂伴侣",
  "AI 革命",
  "重新定义社交",
  "Tinder",
  "dating",
];

const checks = [];
const failures = [];
const warnings = [];
const routeResults = [];
const redirectResults = [];
const videoResourceRequests = [];
const horizontalOverflowFailures = [];
const screenshotFiles = [];

function record(name, status, details = {}) {
  checks.push({ name, status, ...details });
}

function pass(name, details = {}) {
  record(name, "pass", details);
}

function fail(name, message, details = {}) {
  failures.push({ name, message, ...details });
  record(name, "fail", { message, ...details });
}

function warn(name, message, details = {}) {
  warnings.push({ name, message, ...details });
  record(name, "warn", { message, ...details });
}

function outputEvidence(status, extra = {}) {
  const evidence = {
    version,
    generatedAt: new Date().toISOString(),
    status,
    baseUrl,
    screenshotDir: screenshotDirRel,
    purpose:
      "FitMeet desktop Chrome full-site award QA for no-video Social World route integrity, visible copy, redirects, static-media resource hygiene, and horizontal overflow.",
    tool: extra.tool ?? "unknown",
    viewports,
    routes: routes.map((route) => route.path),
    legacyRedirects,
    checks,
    failures,
    warnings,
    routeResults,
    redirectResults,
    videoResourceRequests,
    horizontalOverflowFailures,
    screenshotFiles,
    ...extra,
  };

  fs.mkdirSync(path.dirname(evidencePath), { recursive: true });
  fs.writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(`[fitmeet-chrome-fullsite-award-qa] ${status.toUpperCase()} ${version}`);
  console.log(`checks=${checks.length} failures=${failures.length} warnings=${warnings.length}`);
  console.log(`evidence=${evidenceRel}`);
  if (failures.length) failures.forEach((item) => console.error(`FAIL ${item.name}: ${item.message}`));
  if (warnings.length) warnings.forEach((item) => console.warn(`WARN ${item.name}: ${item.message}`));
}

async function loadPlaywright() {
  try {
    return await import("playwright");
  } catch (error) {
    warn(
      "playwright availability",
      "Playwright is not installed; falling back to local Google Chrome DevTools Protocol.",
      { error: error.message }
    );
    return null;
  }
}

function pageUrl(routePath) {
  return `${baseUrl}${routePath}`;
}

function expectedTarget(to) {
  const url = new URL(to, baseUrl);
  return `${url.pathname}${url.hash}`;
}

function safeScreenshotName(name, viewport) {
  return `${name.replace(/[^a-z0-9-]+/gi, "-")}-${viewport.width}x${viewport.height}.png`;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.json();
}

function wsCall(ws, method, params = {}) {
  const id = ++ws._id;
  ws.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => ws._pending.set(id, { resolve, reject }));
}

async function waitForChrome(port) {
  for (let i = 0; i < 80; i += 1) {
    try {
      return await requestJson(`http://127.0.0.1:${port}/json/version`);
    } catch {
      await wait(100);
    }
  }
  throw new Error("Chrome DevTools endpoint did not start");
}

function handleRequestUrl(url, route) {
  if (/\.(mp4|webm)(\?|$)/i.test(url)) {
    videoResourceRequests.push({ url, route });
  }
}

function evaluateRouteMetrics() {
  const bodyText = document.body?.innerText ?? "";
  const description = document.querySelector('meta[name="description"]')?.getAttribute("content") ?? "";
  const performanceEntries = performance.getEntriesByType("resource").map((entry) => entry.name);
  return {
    bodyText,
    title: document.title,
    description,
    videoCount: document.querySelectorAll("video").length,
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
    performanceEntries,
  };
}

async function collectRouteResult(result, metrics) {
  result.title = metrics.title;
  result.description = metrics.description;
  result.videoCount = metrics.videoCount;
  result.hasHorizontalOverflow = metrics.scrollWidth > metrics.innerWidth + 2;
  result.missingSnippets = result.snippets.filter((snippet) => !metrics.bodyText.includes(snippet));
  result.bannedHits = bannedTerms.filter((term) => new RegExp(term, "i").test(metrics.bodyText));
  metrics.performanceEntries.forEach((url) => handleRequestUrl(url, result.path));

  if (metrics.videoCount === 0) pass(`route no video DOM:${result.path}:${result.viewport.width}x${result.viewport.height}`);
  else fail(`route no video DOM:${result.path}:${result.viewport.width}x${result.viewport.height}`, "Route rendered one or more <video> elements.", result);

  if (!result.hasHorizontalOverflow) pass(`route no horizontal overflow:${result.path}:${result.viewport.width}x${result.viewport.height}`);
  else {
    horizontalOverflowFailures.push({ route: result.path, viewport: result.viewport, scrollWidth: metrics.scrollWidth, innerWidth: metrics.innerWidth });
    fail(`route no horizontal overflow:${result.path}:${result.viewport.width}x${result.viewport.height}`, "Route has horizontal overflow.", {
      route: result.path,
      viewport: result.viewport,
      scrollWidth: metrics.scrollWidth,
      innerWidth: metrics.innerWidth,
    });
  }

  if (result.missingSnippets.length === 0) pass(`route visible copy:${result.path}:${result.viewport.width}x${result.viewport.height}`);
  else {
    fail(`route visible copy:${result.path}:${result.viewport.width}x${result.viewport.height}`, "Route is missing required visible copy snippets.", {
      route: result.path,
      viewport: result.viewport,
      missingSnippets: result.missingSnippets,
    });
  }

  if (result.bannedHits.length === 0) pass(`route banned copy:${result.path}:${result.viewport.width}x${result.viewport.height}`);
  else {
    fail(`route banned copy:${result.path}:${result.viewport.width}x${result.viewport.height}`, "Route contains banned positioning/dating language.", {
      route: result.path,
      viewport: result.viewport,
      bannedHits: result.bannedHits,
    });
  }
}

async function runPlaywrightQA(chromium) {
  fs.mkdirSync(screenshotDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ colorScheme: "dark", reducedMotion: "no-preference" });

  try {
    const page = await context.newPage();
    page.on("request", (request) => handleRequestUrl(request.url(), page.url()));

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      for (const route of routes) {
        const result = {
          path: route.path,
          name: route.name,
          snippets: route.snippets,
          viewport,
          status: "unknown",
          screenshot: null,
          videoCount: 0,
          hasHorizontalOverflow: false,
          missingSnippets: [],
          bannedHits: [],
          title: "",
          description: "",
        };

        const response = await page.goto(pageUrl(route.path), { waitUntil: "networkidle", timeout: 45000 });
        const status = response?.status() ?? 0;
        result.statusCode = status;
        if (status >= 200 && status < 400) pass(`route status:${route.path}:${viewport.width}x${viewport.height}`, { status });
        else fail(`route status:${route.path}:${viewport.width}x${viewport.height}`, `Unexpected HTTP status ${status}`, { route: route.path, status });

        const metrics = await page.evaluate(evaluateRouteMetrics);
        await collectRouteResult(result, metrics);

        if (viewport.width === 1440) {
          const screenshotRel = `${screenshotDirRel}/${safeScreenshotName(route.name, viewport)}`;
          await page.screenshot({ path: path.join(root, screenshotRel), fullPage: false });
          result.screenshot = screenshotRel;
          screenshotFiles.push(screenshotRel);
        }
        delete result.snippets;
        routeResults.push(result);
      }
    }

    for (const redirect of legacyRedirects) {
      await page.setViewportSize({ width: 1440, height: 1000 });
      const response = await page.goto(pageUrl(redirect.from), { waitUntil: "networkidle", timeout: 45000 });
      const final = new URL(page.url());
      const finalPath = `${final.pathname}${final.hash}`;
      const target = expectedTarget(redirect.to);
      const result = { from: redirect.from, to: redirect.to, expected: target, final: finalPath, statusCode: response?.status() ?? 0, passed: finalPath === target };
      redirectResults.push(result);
      if (result.passed) pass(`legacy redirect:${redirect.from}`, result);
      else fail(`legacy redirect:${redirect.from}`, `Expected final route ${target}, got ${finalPath}`, result);
    }
  } finally {
    await browser.close();
  }
}

async function openDevtoolsTab(port, url) {
  const tab = await requestJson(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(url)}`, { method: "PUT" });
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  ws._id = 0;
  ws._pending = new Map();
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && ws._pending.has(msg.id)) {
      const pending = ws._pending.get(msg.id);
      ws._pending.delete(msg.id);
      msg.error ? pending.reject(new Error(JSON.stringify(msg.error))) : pending.resolve(msg.result);
    }
  };
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });
  await wsCall(ws, "Page.enable");
  await wsCall(ws, "Runtime.enable");
  await wsCall(ws, "Network.enable");
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && ws._pending.has(msg.id)) {
      const pending = ws._pending.get(msg.id);
      ws._pending.delete(msg.id);
      msg.error ? pending.reject(new Error(JSON.stringify(msg.error))) : pending.resolve(msg.result);
      return;
    }
    if (msg.method === "Network.requestWillBeSent") handleRequestUrl(msg.params?.request?.url ?? "", msg.params?.documentURL ?? url);
  };
  return ws;
}

async function devtoolsEvaluate(ws, expression, awaitPromise = true) {
  const result = await wsCall(ws, "Runtime.evaluate", { expression, returnByValue: true, awaitPromise });
  return result.result?.value;
}

async function runDevtoolsQA() {
  if (!fs.existsSync(chromePath)) {
    outputEvidence("blocked", {
      tool: "Google Chrome DevTools Protocol",
      blocker: `Google Chrome not found at ${chromePath}`,
    });
    process.exit(2);
  }

  fs.mkdirSync(screenshotDir, { recursive: true });
  const port = 9900 + Math.floor(Math.random() * 300);
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "fitmeet-fullsite-chrome-"));
  const chrome = spawn(chromePath, [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    "--disable-gpu",
    "--hide-scrollbars",
    "--no-first-run",
    "--no-default-browser-check",
    "--window-size=1440,1000",
    "about:blank",
  ], { stdio: "ignore" });

  try {
    await waitForChrome(port);
    const ws = await openDevtoolsTab(port, pageUrl("/"));
    for (const viewport of viewports) {
      await wsCall(ws, "Emulation.setDeviceMetricsOverride", { width: viewport.width, height: viewport.height, deviceScaleFactor: 1, mobile: false });
      for (const route of routes) {
        const result = {
          path: route.path,
          name: route.name,
          snippets: route.snippets,
          viewport,
          status: "unknown",
          screenshot: null,
          videoCount: 0,
          hasHorizontalOverflow: false,
          missingSnippets: [],
          bannedHits: [],
          title: "",
          description: "",
        };

        const response = await wsCall(ws, "Page.navigate", { url: pageUrl(route.path) });
        await wait(1200);
        const status = response?.errorText ? 0 : 200;
        result.statusCode = status;
        if (status >= 200 && status < 400) pass(`route status:${route.path}:${viewport.width}x${viewport.height}`, { status });
        else fail(`route status:${route.path}:${viewport.width}x${viewport.height}`, `Unexpected navigation error ${response?.errorText ?? "unknown"}`, { route: route.path, status });

        const metrics = await devtoolsEvaluate(ws, `(${evaluateRouteMetrics.toString()})()`);
        await collectRouteResult(result, metrics);

        if (viewport.width === 1440) {
          const screenshotRel = `${screenshotDirRel}/${safeScreenshotName(route.name, viewport)}`;
          const shot = await wsCall(ws, "Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
          fs.writeFileSync(path.join(root, screenshotRel), Buffer.from(shot.data, "base64"));
          result.screenshot = screenshotRel;
          screenshotFiles.push(screenshotRel);
        }
        delete result.snippets;
        routeResults.push(result);
      }
    }

    await wsCall(ws, "Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
    for (const redirect of legacyRedirects) {
      await wsCall(ws, "Page.navigate", { url: pageUrl(redirect.from) });
      await wait(800);
      const finalHref = await devtoolsEvaluate(ws, "window.location.href");
      const final = new URL(finalHref);
      const finalPath = `${final.pathname}${final.hash}`;
      const target = expectedTarget(redirect.to);
      const result = { from: redirect.from, to: redirect.to, expected: target, final: finalPath, statusCode: 200, passed: finalPath === target };
      redirectResults.push(result);
      if (result.passed) pass(`legacy redirect:${redirect.from}`, result);
      else fail(`legacy redirect:${redirect.from}`, `Expected final route ${target}, got ${finalPath}`, result);
    }
    ws.close();
  } finally {
    chrome.kill("SIGTERM");
    setTimeout(() => { try { fs.rmSync(profile, { recursive: true, force: true }); } catch {} }, 1000);
  }
}

const playwright = await loadPlaywright();
if (playwright?.chromium) await runPlaywrightQA(playwright.chromium);
else await runDevtoolsQA();

if (videoResourceRequests.length === 0) pass("no MP4/WebM resource requests", { count: 0 });
else fail("no MP4/WebM resource requests", "One or more MP4/WebM requests were made.", { requests: videoResourceRequests });

outputEvidence(failures.length === 0 ? "pass" : "fail", { tool: playwright?.chromium ? "Playwright Chromium" : "Google Chrome DevTools Protocol" });
process.exit(failures.length ? 1 : 0);
