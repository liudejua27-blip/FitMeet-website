#!/usr/bin/env bash
set -euo pipefail

repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${repository_root}"

if [[ -n "$(git status --porcelain)" && "${FITMEET_ALLOW_DIRTY_RELEASE:-0}" != "1" ]]; then
  echo "Refusing to package an uncommitted website worktree." >&2
  echo "Commit the reviewed release, or set FITMEET_ALLOW_DIRTY_RELEASE=1 only for an explicitly traceable test build." >&2
  exit 1
fi

test -f .next/standalone/server.js
test -d .next/static
test -d public

commit="$(git rev-parse --short=12 HEAD)"
dirty="false"
if [[ -n "$(git status --porcelain)" ]]; then
  dirty="true"
fi
content_fingerprint="$(
  {
    git diff --binary HEAD
    git ls-files -o --exclude-standard -z | sort -z | xargs -0 shasum -a 256 2>/dev/null || true
  } | shasum -a 256 | awk '{print substr($1,1,12)}'
)"
release_id="$(date -u +%Y%m%dT%H%M%SZ)-${commit}-${content_fingerprint}"
output_dir="${FITMEET_RELEASE_OUTPUT_DIR:-${repository_root}/output/releases}"
stage_dir="$(mktemp -d)"
release_dir="${stage_dir}/${release_id}"
archive_path="${output_dir}/fitmeet-website-${release_id}.tar.gz"

cleanup() {
  rm -rf "${stage_dir}"
}
trap cleanup EXIT

install -d "${release_dir}/.next" "${output_dir}"
cp -R .next/standalone/. "${release_dir}/"
cp -R .next/static "${release_dir}/.next/static"
cp -R public "${release_dir}/public"
cp ecosystem.config.cjs "${release_dir}/ecosystem.config.cjs"

node --input-type=module - "${release_dir}/release-manifest.json" "${release_id}" "${commit}" "${dirty}" <<'NODE'
import fs from 'node:fs';

const [path, releaseId, commit, dirty] = process.argv.slice(2);
fs.writeFileSync(path, `${JSON.stringify({
  service: 'fitmeet-website',
  releaseId,
  commit,
  dirty: dirty === 'true',
  builtAt: new Date().toISOString(),
  port: 3100
}, null, 2)}\n`);
NODE

tar -C "${stage_dir}" -czf "${archive_path}" "${release_id}"
shasum -a 256 "${archive_path}" > "${archive_path}.sha256"

echo "${archive_path}"
echo "${archive_path}.sha256"
