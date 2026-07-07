#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const version = "v5.105";
const strictFinal = process.argv.includes("--strict-final");
const evidenceRel = "output/qa/v5.105-video-asset-audit.json";
const evidencePath = path.join(root, evidenceRel);

const hardFailures = [];
const finalMediaBlockers = [];
const warnings = [];
const checks = [];

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

function warn(name, message, details = {}) {
  warnings.push({ name, message, ...details });
  record(name, "warn", { message, ...details });
}

function block(name, message, details = {}) {
  finalMediaBlockers.push({ name, message, ...details });
  record(name, "blocked", { message, ...details });
}

function readJson(rel) {
  try {
    return JSON.parse(fs.readFileSync(abs(rel), "utf8"));
  } catch (error) {
    fail(`json:${rel}`, `Cannot read JSON: ${error.message}`, { path: rel });
    return null;
  }
}

function probe(rel) {
  const file = abs(rel);
  if (!fs.existsSync(file)) return { exists: false, path: rel };
  const result = spawnSync("ffprobe", ["-v", "error", "-print_format", "json", "-show_streams", "-show_format", file], { encoding: "utf8" });
  if (result.status !== 0) {
    return { exists: true, path: rel, error: result.stderr.trim() || result.stdout.trim() || "ffprobe failed" };
  }
  const data = JSON.parse(result.stdout || "{}");
  const streams = Array.isArray(data.streams) ? data.streams : [];
  const videoStreams = streams.filter((stream) => stream.codec_type === "video");
  const audioStreams = streams.filter((stream) => stream.codec_type === "audio");
  const firstVideo = videoStreams[0] ?? {};
  return {
    exists: true,
    path: rel,
    width: Number(firstVideo.width || 0),
    height: Number(firstVideo.height || 0),
    duration: Number(data.format?.duration || firstVideo.duration || 0),
    videoStreams: videoStreams.length,
    audioStreams: audioStreams.length,
    format: data.format?.format_name ?? "unknown",
    size: Number(data.format?.size || 0),
  };
}

function validateVideo(slug, kind, probeResult) {
  const name = `${kind}:${slug}`;
  if (!probeResult.exists) {
    fail(name, `Missing ${kind} asset`, { path: probeResult.path });
    return;
  }
  if (probeResult.error) {
    fail(name, `ffprobe failed for ${kind}`, { path: probeResult.path, error: probeResult.error });
    return;
  }
  if (probeResult.width !== 1920 || probeResult.height !== 1080) {
    fail(name, `Expected 1920x1080, received ${probeResult.width}x${probeResult.height}`, probeResult);
    return;
  }
  if (probeResult.duration < 4 || probeResult.duration > 6.2) {
    fail(name, `Expected 4-6 second loop, received ${probeResult.duration}s`, probeResult);
    return;
  }
  if (probeResult.audioStreams !== 0) {
    fail(name, "Video must not contain audio streams", probeResult);
    return;
  }
  if (probeResult.size > 4_000_000) {
    warn(name, "Video is technically valid but heavier than the preferred homepage loop target.", probeResult);
    return;
  }
  pass(name, probeResult);
}

function validatePoster(slug, probeResult) {
  const name = `poster:${slug}`;
  if (!probeResult.exists) {
    fail(name, "Missing poster asset", { path: probeResult.path });
    return;
  }
  if (probeResult.error) {
    fail(name, "ffprobe failed for poster", { path: probeResult.path, error: probeResult.error });
    return;
  }
  if (probeResult.width !== 1920 || probeResult.height !== 1080) {
    fail(name, `Expected 1920x1080 poster, received ${probeResult.width}x${probeResult.height}`, probeResult);
    return;
  }
  pass(name, probeResult);
}

const manifest = readJson("FITMEET_VIDEO_ASSET_MANIFEST.json");
const expectedFilenames = manifest?.batchIngest?.expectedFilenames ?? [
  "hero-night-run-social-world.mp4",
  "partner-arrival-value.mp4",
  "scene-public-plan-plaza.mp4",
  "vision-arrival-network.mp4",
  "scene-court-dispatch.mp4",
  "scene-citywalk-case.mp4",
  "scene-night-run.mp4",
  "scene-weekend-trip.mp4",
];
const slugs = expectedFilenames.map((file) => file.replace(/\.(mp4|mov)$/i, ""));
const downloadsDir = manifest?.batchIngest?.downloadsDirectory ?? "output/runway-downloads/home-v5";

if (slugs.length === 8) pass("expected media line count", { count: slugs.length });
else fail("expected media line count", `Expected 8 media lines, received ${slugs.length}`, { slugs });

const mediaResults = [];
for (const slug of slugs) {
  const mp4 = probe(`public/videos/home-v5/${slug}.mp4`);
  const webm = probe(`public/videos/home-v5/${slug}.webm`);
  const poster = probe(`public/images/home-v5/${slug}-poster.jpg`);
  validateVideo(slug, "mp4", mp4);
  validateVideo(slug, "webm", webm);
  validatePoster(slug, poster);

  const acceptedCandidates = [
    `${downloadsDir}/${slug}.mp4`,
    `${downloadsDir}/${slug}.mov`,
  ];
  const accepted = acceptedCandidates.find((candidate) => fs.existsSync(abs(candidate)));
  if (accepted) {
    pass(`accepted source export:${slug}`, { path: accepted });
  } else {
    block(`accepted source export:${slug}`, "Accepted Runway/Pika source export is not present in downloads directory yet.", { expected: acceptedCandidates });
  }

  mediaResults.push({ slug, mp4, webm, poster, acceptedSourceExport: accepted ?? null });
}

let status = "pass";
if (hardFailures.length > 0) status = "fail";
else if (finalMediaBlockers.length > 0) status = strictFinal ? "fail-final-media-missing" : "pass-technical-blocked-final-media";
else if (warnings.length > 0) status = "pass-with-warnings";

const evidence = {
  version,
  generatedAt: new Date().toISOString(),
  status,
  strictFinal,
  purpose: "FitMeet video asset audit for 2026 award-level desktop homepage media: technical format, public asset readiness, and accepted Runway/Pika source-export handoff separation.",
  requirements: {
    loopDurationSeconds: "4-6",
    resolution: "1920x1080",
    noAudio: true,
    posterRequired: true,
    acceptedSourceExportsRequiredForFinalGoal: true,
  },
  checks,
  hardFailures,
  finalMediaBlockers,
  warnings,
  mediaResults,
};

fs.mkdirSync(path.dirname(evidencePath), { recursive: true });
fs.writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);

console.log(`[fitmeet-video-asset-audit] ${status.toUpperCase()} ${version}`);
console.log(`checks=${checks.length} hardFailures=${hardFailures.length} finalMediaBlockers=${finalMediaBlockers.length} warnings=${warnings.length}`);
console.log(`evidence=${evidenceRel}`);
if (hardFailures.length) hardFailures.forEach((item) => console.error(`FAIL ${item.name}: ${item.message}`));
if (finalMediaBlockers.length) finalMediaBlockers.forEach((item) => console.warn(`BLOCKED ${item.name}: ${item.message}`));
if (warnings.length) warnings.forEach((item) => console.warn(`WARN ${item.name}: ${item.message}`));

process.exit(hardFailures.length || (strictFinal && finalMediaBlockers.length) ? 1 : 0);
