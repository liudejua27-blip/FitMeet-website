#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const version = "v5.129";
const evidenceRel = "output/qa/v5.129-award-preflight.json";
const evidencePath = path.join(root, evidenceRel);

const checks = [];
const failures = [];
const warnings = [];

function relPath(...parts) {
  return path.join(...parts).replaceAll(path.sep, "/");
}

function abs(rel) {
  return path.join(root, rel);
}

function record(name, status, details = {}) {
  checks.push({ name, status, ...details });
}

function pass(name, details = {}) {
  record(name, "pass", details);
}

function fail(name, message, details = {}) {
  const item = { name, message, ...details };
  failures.push(item);
  record(name, "fail", { message, ...details });
}

function warn(name, message, details = {}) {
  const item = { name, message, ...details };
  warnings.push(item);
  record(name, "warn", { message, ...details });
}

function exists(rel, name = rel) {
  if (fs.existsSync(abs(rel))) {
    pass(name, { path: rel });
    return true;
  }
  fail(name, `Missing required file: ${rel}`, { path: rel });
  return false;
}

function readJson(rel, name = rel) {
  try {
    const data = JSON.parse(fs.readFileSync(abs(rel), "utf8"));
    pass(name, { path: rel });
    return data;
  } catch (error) {
    fail(name, `Cannot parse JSON: ${error.message}`, { path: rel });
    return null;
  }
}

function readText(rel, name = rel) {
  try {
    const text = fs.readFileSync(abs(rel), "utf8");
    pass(name, { path: rel });
    return text;
  } catch (error) {
    fail(name, `Cannot read file: ${error.message}`, { path: rel });
    return "";
  }
}

function walk(dirRel, out = []) {
  const dir = abs(dirRel);
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", ".next", ".git", "dist", "output"].includes(entry.name)) continue;
    const childRel = relPath(dirRel, entry.name);
    if (entry.isDirectory()) walk(childRel, out);
    else out.push(childRel);
  }
  return out;
}

const coreRoutes = [
  "app/page.tsx",
  "app/product/page.tsx",
  "app/scenes/page.tsx",
  "app/community/page.tsx",
  "app/safety/page.tsx",
  "app/about/page.tsx",
  "app/journal/page.tsx",
  "app/contact/page.tsx",
];

const systemRoutes = [
  "app/privacy/page.tsx",
  "app/terms/page.tsx",
  "app/cookies/page.tsx",
  "app/not-found/page.tsx",
  "app/thank-you/page.tsx",
  "app/not-found.tsx",
];

const canonicalRoutePaths = [
  "/",
  "/product",
  "/scenes",
  "/community",
  "/safety",
  "/about",
  "/journal",
  "/contact",
  "/privacy",
  "/terms",
  "/cookies",
  "/thank-you",
  "/not-found",
];

const legacyRedirects = [
  { route: "app/agent/page.tsx", target: "/product" },
  { route: "app/cities/page.tsx", target: "/community" },
  { route: "app/faq/page.tsx", target: "/safety" },
  { route: "app/investors/page.tsx", target: "/about" },
  { route: "app/join/page.tsx", target: "/contact#waitlist" },
  { route: "app/partners/page.tsx", target: "/contact#enterprise" },
  { route: "app/press/page.tsx", target: "/journal" },
  { route: "app/stories/page.tsx", target: "/journal" },
  { route: "app/world/page.tsx", target: "/community" },
];

const canonicalDocs = [
  "README.MD",
  "DESIGN.md",
  "FITMEET_INFORMATION_ARCHITECTURE.md",
  "FITMEET_COPY_SYSTEM.md",
  "FITMEET_MEDIA_PRODUCTION_PLAYBOOK.md",
  "FITMEET_STATIC_MEDIA_GOVERNANCE.md",
  "FITMEET_MOTION_SYSTEM.md",
  "FITMEET_WEBSITE_EXECUTION_PLAYBOOK.md",
  "FITMEET_PAGE_ACCEPTANCE_AGENT.md",
  "FITMEET_FULLSITE_VISUAL_ACCEPTANCE_MATRIX.md",
  "FITMEET_PRODUCTION_CHECKLIST.md",
  "FITMEET_FINAL_VISUAL_SIGNOFF_REPORT.md",
  "FITMEET_EVIDENCE_PROTOCOL.md",
];

const signalFiles = [
  "components/signal-prism-homepage/SignalPrismHomepage.tsx",
  "components/signal-prism-homepage/MouseFieldProvider.tsx",
  "components/signal-prism-homepage/SignalPrism.tsx",
  "components/signal-prism-homepage/SignalLineCanvas.tsx",
  "components/signal-prism-homepage/ActivityOrbit.tsx",
  "components/signal-prism-homepage/SafetyShell.tsx",
  "components/signal-prism-homepage/CinematicImage.tsx",
  "components/signal-prism-homepage/enterpriseAssets.ts",
  "components/signal-prism-homepage/signal-prism-homepage.module.css",
];

const enterpriseImages = [
  "public/images/enterprise/night-run.png",
  "public/images/enterprise/coffee.png",
  "public/images/enterprise/badminton.png",
  "public/images/enterprise/court.png",
  "public/images/enterprise/travel-photo.png",
  "public/images/enterprise/medical-companion.png",
  "public/images/enterprise/board-game.png",
  "public/images/enterprise/park-picnic.png",
  "public/images/enterprise/gym.png",
  "public/images/enterprise/climbing.png",
  "public/images/enterprise/cycling.png",
  "public/images/enterprise/cos-partner.png",
  "public/images/enterprise/cos-photo.png",
  "public/images/enterprise/gaming.png",
  "public/images/enterprise/music-festival.png",
  "public/images/enterprise/dog-walk.png",
  "public/images/enterprise/camping-bbq.png",
  "public/images/enterprise/hiking.png",
];

coreRoutes.forEach((route) => exists(route, `core route:${route}`));
systemRoutes.forEach((route) => exists(route, `system route:${route}`));
legacyRedirects.forEach(({ route }) => exists(route, `legacy redirect route:${route}`));
canonicalDocs.forEach((doc) => exists(doc, `canonical doc:${doc}`));
signalFiles.forEach((file) => exists(file, `signal prism file:${file}`));
enterpriseImages.forEach((file) => exists(file, `enterprise image:${file}`));

const pkg = readJson("package.json", "package json");
if (pkg?.scripts) {
  ["build", "typecheck", "qa:award-preflight", "qa:chrome-fullsite", "qa:goal-audit", "qa:goal-audit:report"].forEach((script) => {
    if (pkg.scripts[script]) pass(`package script:${script}`, { command: pkg.scripts[script] });
    else fail(`package script:${script}`, `Missing package script: ${script}`);
  });
}

const siteSource = readText("lib/site.ts", "site route and metadata helper");
const layoutSource = readText("app/layout.tsx", "global metadata and structured data");
const manifestSource = readText("app/manifest.ts", "web app manifest");
const openGraphSource = readText("app/opengraph-image.tsx", "OpenGraph image route");

for (const routePath of canonicalRoutePaths) {
  if (siteSource.includes(`path: "${routePath}"`)) pass(`canonical sitemap route:${routePath}`);
  else fail(`canonical sitemap route:${routePath}`, `Missing canonical route in lib/site.ts siteRoutes: ${routePath}`);
}

const legacyRouteLeaks = legacyRedirects
  .map(({ route, target }) => {
    const text = fs.existsSync(abs(route)) ? fs.readFileSync(abs(route), "utf8") : "";
    const canonicalCandidate = `/${route.replace(/^app\//, "").replace(/\/page\.tsx$/, "")}`;
    return {
      route,
      target,
      hasPermanentRedirect: text.includes("permanentRedirect"),
      redirectsToTarget: text.includes(`permanentRedirect("${target}")`),
      leakedIntoSitemap: siteSource.includes(`path: "${canonicalCandidate}"`),
    };
  })
  .filter((item) => !item.hasPermanentRedirect || !item.redirectsToTarget || item.leakedIntoSitemap);

if (legacyRouteLeaks.length === 0) pass("legacy route permanent redirect hygiene", { redirects: legacyRedirects.length });
else fail("legacy route permanent redirect hygiene", "Legacy routes must use permanentRedirect() and stay out of canonical sitemap.", { hits: legacyRouteLeaks });

const socialWorldMetadataSignals = [
  { file: "app/layout.tsx", text: layoutSource, needle: "FitMeet | Social World" },
  { file: "app/layout.tsx", text: layoutSource, needle: "Social World：一句想法，变成一次真实到场。" },
  { file: "app/layout.tsx", text: layoutSource, needle: "面向青年群体的城市生活社交平台官网" },
  { file: "app/manifest.ts", text: manifestSource, needle: "Social World：一句想法，变成一次真实到场。" },
  { file: "app/manifest.ts", text: manifestSource, needle: "theme_color: \"#050101\"" },
  { file: "app/opengraph-image.tsx", text: openGraphSource, needle: "FitMeet Social World - 一句想法，变成一次真实到场" },
  { file: "app/opengraph-image.tsx", text: openGraphSource, needle: "想法" },
  { file: "app/opengraph-image.tsx", text: openGraphSource, needle: "公开场景" },
  { file: "app/opengraph-image.tsx", text: openGraphSource, needle: "同频到场" },
  { file: "lib/site.ts", text: siteSource, needle: "FitMeet Social World - 一句想法，变成一次真实到场" },
];

for (const item of socialWorldMetadataSignals) {
  if (item.text.includes(item.needle)) pass(`Social World metadata signal:${item.file}:${item.needle}`);
  else fail(`Social World metadata signal:${item.file}:${item.needle}`, `Missing Social World metadata/share signal in ${item.file}`);
}

const readme = readText("README.MD", "README no-video contract");
const design = readText("DESIGN.md", "DESIGN no-video contract");
const staticMediaGovernance = readText("FITMEET_STATIC_MEDIA_GOVERNANCE.md", "static media governance contract");
const evidenceProtocol = readText("FITMEET_EVIDENCE_PROTOCOL.md", "evidence protocol contract");
const motion = readText("FITMEET_MOTION_SYSTEM.md", "motion no-video contract");
const acceptance = readText("FITMEET_PAGE_ACCEPTANCE_AGENT.md", "acceptance no-video contract");
const enterpriseAssetsSource = readText("components/signal-prism-homepage/enterpriseAssets.ts", "static media data source");

const requiredDocSignals = [
  { file: "README.MD", text: readme, needle: "SignalPrism 交互" },
  { file: "README.MD", text: readme, needle: "核心官网页面不得使用 `<video>`" },
  { file: "README.MD", text: readme, needle: "FITMEET_STATIC_MEDIA_GOVERNANCE.md" },
  { file: "README.MD", text: readme, needle: "FITMEET_EVIDENCE_PROTOCOL.md" },
  { file: "DESIGN.md", text: design, needle: "V5.111 No-Video SignalPrism Standard" },
  { file: "DESIGN.md", text: design, needle: "V5.128 Static Media Governance Standard" },
  { file: "FITMEET_STATIC_MEDIA_GOVERNANCE.md", text: staticMediaGovernance, needle: "企业官网 PNG -> public/images/enterprise -> enterpriseAssets.ts -> CinematicImage" },
  { file: "FITMEET_STATIC_MEDIA_GOVERNANCE.md", text: staticMediaGovernance, needle: "`ActivityOrbit` 是三层城市信号带，不是图库轮播" },
  { file: "FITMEET_STATIC_MEDIA_GOVERNANCE.md", text: staticMediaGovernance, needle: "未进入数据源的图片不得被官网页面直接引用" },
  { file: "FITMEET_EVIDENCE_PROTOCOL.md", text: evidenceProtocol, needle: "output/qa/v5.129-award-preflight.json" },
  { file: "FITMEET_EVIDENCE_PROTOCOL.md", text: evidenceProtocol, needle: "output/qa/v5.129-fullsite-award-qa.json" },
  { file: "FITMEET_EVIDENCE_PROTOCOL.md", text: evidenceProtocol, needle: "output/qa/v5.129-goal-completion-audit.json" },
  { file: "FITMEET_MOTION_SYSTEM.md", text: motion, needle: "No-Video Motion Contract" },
  { file: "FITMEET_PAGE_ACCEPTANCE_AGENT.md", text: acceptance, needle: "核心页面 `<video>` 节点数必须为 `0`" },
  { file: "FITMEET_PAGE_ACCEPTANCE_AGENT.md", text: acceptance, needle: "V5.128 Static Media Acceptance" },
];

for (const item of requiredDocSignals) {
  if (item.text.includes(item.needle)) pass(`doc no-video signal:${item.file}:${item.needle}`);
  else fail(`doc no-video signal:${item.file}:${item.needle}`, `Missing no-video canonical signal in ${item.file}`);
}

const enterpriseImagePathLeaks = [];
const appAndComponentSources = [...walk("app"), ...walk("components")]
  .filter((file) => /\.(tsx?|jsx?|css|module\.css)$/.test(file));

for (const file of appAndComponentSources) {
  if (file === "components/signal-prism-homepage/enterpriseAssets.ts") continue;
  const text = fs.readFileSync(abs(file), "utf8");
  const matches = text.match(/\/images\/enterprise\/[^"'`)\\\s]+/g) ?? [];
  if (matches.length) enterpriseImagePathLeaks.push({ file, matches: [...new Set(matches)] });
}

if (enterpriseImagePathLeaks.length === 0) {
  pass("static media source of truth", { source: "components/signal-prism-homepage/enterpriseAssets.ts" });
} else {
  fail("static media source of truth", "Enterprise image paths must enter pages through enterpriseAssets.ts, not scattered component hardcoding.", { hits: enterpriseImagePathLeaks });
}

const enterpriseAssetFileNames = enterpriseImages.map((file) => path.basename(file));
const missingEnterpriseAssetData = enterpriseAssetFileNames
  .filter((fileName) => !enterpriseAssetsSource.includes(fileName));

if (missingEnterpriseAssetData.length === 0) {
  pass("enterprise image data source coverage", { assets: enterpriseAssetFileNames.length });
} else {
  fail("enterprise image data source coverage", "Every enterprise image required by the homepage media system must be represented in enterpriseAssets.ts.", { missing: missingEnterpriseAssetData });
}

const requiredStaticRoles = [
  "Hero Signal",
  "Need Input",
  "Agent Plan",
  "City Signal",
  "Business Value",
  "Safety Layer",
  "Sport Signal",
  "Social Signal",
  "Interest Signal",
  "Life Signal",
];

const missingStaticRoles = requiredStaticRoles.filter((role) => !enterpriseAssetsSource.includes(`role: "${role}"`));
if (missingStaticRoles.length === 0) pass("enterprise asset role coverage", { roles: requiredStaticRoles.length });
else fail("enterprise asset role coverage", "enterpriseAssets.ts must keep explicit role labels for media governance.", { missing: missingStaticRoles });

const requiredOrbitAssets = [
  "night-run",
  "gym",
  "climbing",
  "badminton",
  "cycling",
  "park-picnic",
  "board-game",
  "coffee",
  "dog-walk",
  "camping-bbq",
  "cos-partner",
  "cos-photo",
  "gaming",
  "music-festival",
  "hiking",
];

const missingOrbitAssets = requiredOrbitAssets.filter((id) => !enterpriseAssetsSource.includes(`id: "${id}"`));
if (missingOrbitAssets.length === 0) pass("ActivityOrbit media allocation coverage", { assets: requiredOrbitAssets.length });
else fail("ActivityOrbit media allocation coverage", "ActivityOrbit must keep all three lanes backed by governed enterprise assets.", { missing: missingOrbitAssets });

const homeEntry = readText("app/page.tsx", "homepage entry");
if (homeEntry.includes("SignalPrismHomepage")) pass("homepage uses SignalPrismHomepage");
else fail("homepage uses SignalPrismHomepage", "app/page.tsx must render SignalPrismHomepage.");

const signalSource = signalFiles
  .filter((file) => fs.existsSync(abs(file)))
  .map((file) => ({ file, text: fs.readFileSync(abs(file), "utf8") }));

const homepageForbiddenMediaHits = [];
for (const { file, text } of [{ file: "app/page.tsx", text: homeEntry }, ...signalSource]) {
  const patterns = [
    { label: "video tag", re: /<\s*video\b/i },
    { label: "mp4 reference", re: /\.mp4\b/i },
    { label: "webm reference", re: /\.webm\b/i },
    { label: "CinematicVideoMedia", re: /CinematicVideoMedia/ },
  ];
  for (const pattern of patterns) {
    if (pattern.re.test(text)) homepageForbiddenMediaHits.push({ file, issue: pattern.label });
  }
}

if (homepageForbiddenMediaHits.length === 0) pass("homepage no-video source contract", { scannedFiles: signalFiles.length + 1 });
else fail("homepage no-video source contract", "Homepage SignalPrism source must not use video/mp4/webm/CinematicVideoMedia.", { hits: homepageForbiddenMediaHits });

const sourceFiles = ["app", "components", "lib"].flatMap((dir) => walk(dir)).filter((file) => /\.(ts|tsx|js|jsx|mdx|css|scss)$/i.test(file));
const bannedPatterns = [
  { label: "陌生人速配", re: /陌生人速配/g },
  { label: "附近异性", re: /附近异性/g },
  { label: "灵魂伴侣", re: /灵魂伴侣/g },
  { label: "刷人", re: /刷人/g },
  { label: "AI 革命", re: /AI\s*革命/g },
  { label: "重新定义社交", re: /重新定义社交/g },
  { label: "dating", re: /\bdating\b/gi },
  { label: "Tinder", re: /\bTinder\b/g },
  { label: "附近的人", re: /附近的人/g },
];

const bannedHits = [];
let emailFound = false;
let scrollTriggerFound = false;
let gsapMarkerFound = false;
let signalPrismFound = false;
let canvasFound = false;
let activityOrbitFound = false;
let safetyShellFound = false;

for (const file of sourceFiles) {
  const text = fs.readFileSync(abs(file), "utf8");
  if (text.includes("15253005312@163.com")) emailFound = true;
  if (text.includes("ScrollTrigger") || text.includes("useGSAP")) scrollTriggerFound = true;
  if (/markers\s*:\s*true/.test(text)) gsapMarkerFound = true;
  if (text.includes("SignalPrism")) signalPrismFound = true;
  if (text.includes("SignalLineCanvas")) canvasFound = true;
  if (text.includes("ActivityOrbit")) activityOrbitFound = true;
  if (text.includes("SafetyShell")) safetyShellFound = true;
  for (const pattern of bannedPatterns) {
    if (pattern.re.test(text)) bannedHits.push({ file, term: pattern.label });
    pattern.re.lastIndex = 0;
  }
}

if (bannedHits.length === 0) pass("source banned language scan", { scannedFiles: sourceFiles.length });
else fail("source banned language scan", "Forbidden visible product language found in source files", { hits: bannedHits });

const appForbiddenMediaHits = [];
for (const file of sourceFiles) {
  const text = fs.readFileSync(abs(file), "utf8");
  const patterns = [
    { label: "video tag", re: /<\s*video\b/i },
    { label: "mp4 reference", re: /\.mp4\b/i },
    { label: "webm reference", re: /\.webm\b/i },
    { label: "CinematicVideoMedia", re: /CinematicVideoMedia/ },
    { label: "video prop", re: /\bvideo\s*=/ },
    { label: "video data field", re: /\bvideo\s*:/ },
    { label: "poster prop", re: /\bposter\s*=/ },
    { label: "poster data field", re: /\bposter\s*:/ },
  ];
  for (const pattern of patterns) {
    if (pattern.re.test(text)) appForbiddenMediaHits.push({ file, issue: pattern.label });
  }
}

if (appForbiddenMediaHits.length === 0) {
  pass("full app no-video source contract", { scannedFiles: sourceFiles.length });
} else {
  fail("full app no-video source contract", "Core app/components/lib source must not use video/mp4/webm/poster media contracts in the current no-video SignalPrism direction.", { hits: appForbiddenMediaHits });
}

if (emailFound) pass("enterprise cooperation email", { email: "15253005312@163.com" });
else fail("enterprise cooperation email", "Contact/cooperation email is missing from app/components/lib source.");

if (scrollTriggerFound) pass("GSAP/react animation integration signal");
else warn("GSAP/react animation integration signal", "No ScrollTrigger/useGSAP signal found in app/components/lib source.");

if (!gsapMarkerFound) pass("no production GSAP markers");
else fail("no production GSAP markers", "Found markers: true in source files.");

if (signalPrismFound && canvasFound && activityOrbitFound && safetyShellFound) {
  pass("SignalPrism homepage interaction stack", { signalPrismFound, canvasFound, activityOrbitFound, safetyShellFound });
} else {
  fail("SignalPrism homepage interaction stack", "Missing one or more required no-video interaction components.", { signalPrismFound, canvasFound, activityOrbitFound, safetyShellFound });
}

if (fs.existsSync(abs("FITMEET_VIDEO_ASSET_MANIFEST.json"))) {
  warn("legacy video manifest present", "Video manifest remains as legacy/future promo infrastructure but is not a current website completion gate.", { path: "FITMEET_VIDEO_ASSET_MANIFEST.json" });
}

const evidence = {
  version,
  generatedAt: new Date().toISOString(),
  status: failures.length === 0 ? "pass" : "fail",
  purpose: "FitMeet 2026 no-video SignalPrism website preflight for routes, docs, source language, static assets, interaction stack, SEO/Trust prerequisites, and production animation hygiene.",
  requirementsScope: {
    desktopFirst: true,
    noVideoHomepage: true,
    noVideoCoreWebsite: true,
    canonicalRoutesOnly: true,
    socialWorldShareSurface: true,
    canonicalFlow: "页面结构 -> 品牌叙事 -> 关键视觉 -> SignalPrism 交互 -> GSAP 滚动 -> SEO/Trust/性能 -> Chrome 验收",
    coreIdea: "Social World：一句想法，变成一次真实到场。",
    routeCount: { core: coreRoutes.length, system: systemRoutes.length },
    homepageStack: ["SignalPrism", "MouseFieldProvider", "SignalLineCanvas", "ActivityOrbit", "SafetyShell"],
  },
  checks,
  failures,
  warnings,
};

fs.mkdirSync(path.dirname(evidencePath), { recursive: true });
fs.writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);

console.log(`[fitmeet-award-preflight] ${evidence.status.toUpperCase()} ${version}`);
console.log(`checks=${checks.length} failures=${failures.length} warnings=${warnings.length}`);
console.log(`evidence=${evidenceRel}`);
if (failures.length) failures.forEach((failure) => console.error(`FAIL ${failure.name}: ${failure.message}`));
if (warnings.length) warnings.forEach((item) => console.warn(`WARN ${item.name}: ${item.message}`));
process.exit(failures.length ? 1 : 0);
