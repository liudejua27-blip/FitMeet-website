#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const version = "v5.129";
const reportOnly = process.argv.includes("--report-only");
const evidenceRel = "output/qa/v5.129-goal-completion-audit.json";
const evidencePath = path.join(root, evidenceRel);

const checks = [];
const hardFailures = [];
const blockers = [];
const warnings = [];

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
  hardFailures.push({ name, message, ...details });
  record(name, "fail", { message, ...details });
}

function block(name, message, details = {}) {
  blockers.push({ name, message, ...details });
  record(name, "blocked", { message, ...details });
}

function warn(name, message, details = {}) {
  warnings.push({ name, message, ...details });
  record(name, "warn", { message, ...details });
}

function readJson(rel, label = rel, required = true) {
  try {
    const parsed = JSON.parse(fs.readFileSync(abs(rel), "utf8"));
    pass(`json:${label}`, { path: rel });
    return parsed;
  } catch (error) {
    if (required) fail(`json:${label}`, `Cannot read or parse JSON: ${error.message}`, { path: rel });
    else warn(`json:${label}`, `Optional JSON evidence is missing or unreadable: ${error.message}`, { path: rel });
    return null;
  }
}

function readText(rel, label = rel, required = true) {
  try {
    const text = fs.readFileSync(abs(rel), "utf8");
    pass(`file:${label}`, { path: rel });
    return text;
  } catch (error) {
    if (required) fail(`file:${label}`, `Cannot read file: ${error.message}`, { path: rel });
    else warn(`file:${label}`, `Optional file is missing or unreadable: ${error.message}`, { path: rel });
    return "";
  }
}

const award = readJson("output/qa/v5.129-award-preflight.json", "no-video and static-media award preflight evidence");
if (award) {
  if (award.status === "pass" && (award.failures?.length ?? 0) === 0) pass("no-video and static-media award preflight", { status: award.status, warnings: award.warnings?.length ?? 0 });
  else fail("no-video and static-media award preflight", "No-video and static-media award preflight is not passing.", { status: award.status, failures: award.failures ?? [] });
}

const buildLogRel = "output/qa/v5.129-build.log";
const buildLog = readText(buildLogRel, "Next.js build log", false);
if (buildLog) {
  if (buildLog.includes("Compiled successfully") && buildLog.includes("Route (app)")) {
    pass("Next.js production build", { log: buildLogRel });
  } else {
    fail("Next.js production build", "Build log does not prove successful production build.", { log: buildLogRel });
  }
  if (buildLog.includes("`z-index` is currently not supported")) {
    fail("OpenGraph z-index warning", "Build still emits the Satori/OpenGraph z-index unsupported warning.", { log: buildLogRel });
  } else {
    pass("OpenGraph z-index warning removed", { log: buildLogRel });
  }
} else {
  block("current production build evidence", "Run npm run build and save output to output/qa/v5.122-build.log before final completion audit.", { expectedLog: buildLogRel });
}

const fullsiteQaRel = "output/qa/v5.129-fullsite-award-qa.json";
const fullsiteQa = readJson(fullsiteQaRel, "full-site no-video Chrome QA", false);
if (fullsiteQa) {
  if (fullsiteQa.status === "blocked") {
    block("full-site no-video Chrome QA", "Full-site Chrome QA is blocked; do not infer pass or fail for DOM/video/horizontal-overflow checks from missing runtime evidence.", {
      status: fullsiteQa.status,
      blocker: fullsiteQa.blocker,
      path: fullsiteQaRel,
    });
  } else {
    if (fullsiteQa.status === "pass") pass("full-site no-video Chrome QA", { status: fullsiteQa.status, routeCount: fullsiteQa.routeResults?.length ?? 0 });
    else fail("full-site no-video Chrome QA", "Full-site no-video Chrome QA did not pass.", { status: fullsiteQa.status, failures: fullsiteQa.failures ?? [] });

    if (fullsiteQa.maxVideoCount === 0) pass("core pages no video DOM", { maxVideoCount: fullsiteQa.maxVideoCount });
    else fail("core pages no video DOM", "Core website pages must not render video elements in the no-video SignalPrism direction.", { maxVideoCount: fullsiteQa.maxVideoCount });

    if ((fullsiteQa.videoResourceRequests?.length ?? 0) === 0) pass("core pages no video resource requests", { requestCount: 0 });
    else fail("core pages no video resource requests", "Core website pages must not request MP4/WebM resources.", { requests: fullsiteQa.videoResourceRequests });

    if ((fullsiteQa.horizontalOverflowFailures?.length ?? 0) === 0) pass("full-site no horizontal overflow", { routeCount: fullsiteQa.routeResults?.length ?? 0 });
    else fail("full-site no horizontal overflow", "One or more routes has horizontal overflow.", { failures: fullsiteQa.horizontalOverflowFailures });
  }
} else {
  block("full-site no-video Chrome QA", "Run desktop Chrome QA and save output/qa/v5.123-fullsite-award-qa.json before completion audit.", { expectedJson: fullsiteQaRel });
}

const finalSignoffRel = "FITMEET_FINAL_VISUAL_SIGNOFF_REPORT.md";
const finalSignoff = readText(finalSignoffRel, "final visual signoff report", false);
if (finalSignoff) {
  const hasSignedOffDecision = /(^|\n)\s*(Final decision|Decision|Required final statement)\s*:\s*`?Signed off`?/i.test(finalSignoff);
  const hasNotSignedOffDecision = /(^|\n)\s*(Final decision|Decision|Current status|Status|Required final statement)\s*:\s*`?Not signed off`?/i.test(finalSignoff);
  const pendingCount = (finalSignoff.match(/`Pending`|\bPending\b/g) ?? []).length;
  const tbdCount = (finalSignoff.match(/`TBD`|\bTBD\b/g) ?? []).length;

  if (hasSignedOffDecision && !hasNotSignedOffDecision && pendingCount === 0 && tbdCount === 0) {
    pass("final visual signoff report", { path: finalSignoffRel });
  } else {
    block("final visual signoff report", "Final visual signoff report is not complete. Fill command evidence, screenshot evidence, page verdicts, global invariants, and final decision before marking the goal complete.", {
      path: finalSignoffRel,
      hasSignedOffDecision,
      hasNotSignedOffDecision,
      pendingCount,
      tbdCount,
    });
  }
} else {
  block("final visual signoff report", "Create and fill FITMEET_FINAL_VISUAL_SIGNOFF_REPORT.md before final completion audit.", { path: finalSignoffRel });
}

const staticMediaGovernanceRel = "FITMEET_STATIC_MEDIA_GOVERNANCE.md";
const staticMediaGovernance = readText(staticMediaGovernanceRel, "static media governance", false);
if (staticMediaGovernance) {
  const requiredSignals = [
    "public/images/enterprise -> enterpriseAssets.ts",
    "`ActivityOrbit` 是三层城市信号带，不是图库轮播",
    "无水印",
    "无 in-image 文案",
    "未进入数据源的图片不得被官网页面直接引用",
  ];
  const missingSignals = requiredSignals.filter((needle) => !staticMediaGovernance.includes(needle));
  if (missingSignals.length === 0) pass("static media governance document", { path: staticMediaGovernanceRel });
  else fail("static media governance document", "Static media governance is missing required no-video asset rules.", { missing: missingSignals });
} else {
  fail("static media governance document", "FITMEET_STATIC_MEDIA_GOVERNANCE.md must exist before final completion audit.", { path: staticMediaGovernanceRel });
}

const completionRequirements = [
  "8 core pages and 5 system pages implemented with SEO metadata and CTA",
  "canonical sitemap includes only the 8 core pages and 5 system pages",
  "legacy routes are permanent redirects and do not become separate design surfaces",
  "global metadata, manifest, OpenGraph, and Twitter share surfaces all express Social World",
  "core website pages use no video and do not request MP4/WebM assets",
  "static homepage media comes through enterpriseAssets.ts and FITMEET_STATIC_MEDIA_GOVERNANCE.md",
  "ActivityOrbit has governed image allocation for sport, low-pressure, and interest lanes",
  "homepage renders SignalPrism, Canvas signal lines, ActivityOrbit, and SafetyShell",
  "desktop Chrome verifies homepage at 1366x900, 1440x1000, and 1920x1080",
  "no visible banned dating/fake-positioning language",
  "Trust & Safety, Privacy, Terms, Cookies, 404, Thank You are present",
  "enterprise cooperation email 15253005312@163.com is present",
  "Next.js typecheck and production build pass",
  "final visual signoff report is filled and marked Signed off",
  "final human visual review confirms the full website, not only homepage, reaches the 2026 award-level target",
];

block("full-site final visual signoff", "Current audit proves no-video technical gates when evidence exists. The active goal remains broader: all core pages must be judged against the 2026 award-level enterprise website target.", {
  required: "Chrome review of all target pages, canonical redirects, and share/SEO surfaces after no-video Social World direction is accepted",
});

const status = hardFailures.length === 0 && blockers.length === 0 ? "complete" : "incomplete";
const evidence = {
  version,
  generatedAt: new Date().toISOString(),
  status,
  reportOnly,
  purpose: "FitMeet active goal completion audit for the full-site no-video SignalPrism direction. This does not redefine success; it checks whether current evidence proves the requested 2026 award-level enterprise website objective.",
  completionRequirements,
  checks,
  hardFailures,
  blockers,
  warnings,
};

fs.mkdirSync(path.dirname(evidencePath), { recursive: true });
fs.writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);

console.log(`[fitmeet-goal-completion-audit] ${status.toUpperCase()} ${version}`);
console.log(`checks=${checks.length} hardFailures=${hardFailures.length} blockers=${blockers.length} warnings=${warnings.length}`);
console.log(`evidence=${evidenceRel}`);
if (hardFailures.length) hardFailures.forEach((item) => console.error(`FAIL ${item.name}: ${item.message}`));
if (blockers.length) blockers.forEach((item) => console.warn(`BLOCKED ${item.name}: ${item.message}`));
if (warnings.length) warnings.forEach((item) => console.warn(`WARN ${item.name}: ${item.message}`));

process.exit(status === "complete" || reportOnly ? 0 : 1);
