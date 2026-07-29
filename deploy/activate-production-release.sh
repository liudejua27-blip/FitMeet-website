#!/usr/bin/env bash
set -euo pipefail

if [[ ${EUID} -ne 0 ]]; then
  echo "Run this activation script as root." >&2
  exit 1
fi

archive_path="${1:-}"
checksum_path="${2:-${archive_path}.sha256}"
releases_root="/opt/fitmeet/website/releases"
current_link="/opt/fitmeet/website/current"
shared_env="/opt/fitmeet/website/shared/.env"
pm2_home="/home/deploy/.pm2"

test -n "${archive_path}"
test -f "${archive_path}"
test -f "${checksum_path}"
test -f "${shared_env}"

expected_checksum="$(awk '{print $1}' "${checksum_path}")"
actual_checksum="$(sha256sum "${archive_path}" | awk '{print $1}')"
if [[ "${expected_checksum}" != "${actual_checksum}" ]]; then
  echo "Website release checksum mismatch." >&2
  exit 1
fi

# Locate the release by its manifest instead of trusting the first archive
# entry. macOS can prepend AppleDouble entries such as `._<release-id>`, and
# with `set -o pipefail` piping `tar` into `head` also makes a valid archive
# fail with SIGPIPE (exit 141).
release_id="$(
  tar --warning=no-unknown-keyword -tzf "${archive_path}" |
    awk -F/ '$2 == "release-manifest.json" { print $1 }' |
    sort -u
)"
if [[ ! "${release_id}" =~ ^[0-9]{8}T[0-9]{6}Z-[0-9a-f]{7,12}-[0-9a-f]{12}$ ]]; then
  echo "Unexpected website release directory: ${release_id}" >&2
  exit 1
fi

release_dir="${releases_root}/${release_id}"
previous_release=""
if [[ -L "${current_link}" ]]; then
  previous_release="$(readlink -f "${current_link}")"
fi

install -d -m 755 -o deploy -g deploy "${releases_root}"
if [[ -e "${release_dir}" ]]; then
  echo "Release already exists: ${release_dir}" >&2
  exit 1
fi

tar --warning=no-unknown-keyword \
  --exclude='._*' \
  --exclude='*/._*' \
  -C "${releases_root}" -xzf "${archive_path}"
test -f "${release_dir}/server.js"
test -f "${release_dir}/ecosystem.config.cjs"
test -f "${release_dir}/release-manifest.json"
test -d "${release_dir}/.next/static"
test -d "${release_dir}/public"
chown -R deploy:deploy "${release_dir}"

rollback() {
  if [[ -n "${previous_release}" && -d "${previous_release}" ]]; then
    ln -sfn "${previous_release}" "${current_link}"
    runuser -u deploy -- env PM2_HOME="${pm2_home}" pm2 delete fitmeet-website >/dev/null 2>&1 || true
    runuser -u deploy -- env PM2_HOME="${pm2_home}" pm2 start "${previous_release}/ecosystem.config.cjs" --only fitmeet-website --update-env
    runuser -u deploy -- env PM2_HOME="${pm2_home}" pm2 save
  fi
}

trap 'rollback' ERR

ln -sfn "${release_dir}" "${current_link}"
runuser -u deploy -- env PM2_HOME="${pm2_home}" pm2 delete fitmeet-website >/dev/null 2>&1 || true
runuser -u deploy -- env PM2_HOME="${pm2_home}" pm2 start "${release_dir}/ecosystem.config.cjs" --only fitmeet-website --update-env

for _ in {1..30}; do
  if curl -fsS --max-time 3 http://127.0.0.1:3100/terms >/dev/null \
    && curl -fsS --max-time 3 http://127.0.0.1:3100/privacy >/dev/null; then
    break
  fi
  sleep 1
done

curl -fsS --max-time 5 http://127.0.0.1:3100/terms >/dev/null
curl -fsS --max-time 5 http://127.0.0.1:3100/privacy >/dev/null

active_cwd="$(
  runuser -u deploy -- env PM2_HOME="${pm2_home}" pm2 jlist |
    node -e 'let d="";process.stdin.on("data",c=>d+=c);process.stdin.on("end",()=>{const p=JSON.parse(d).find(x=>x.name==="fitmeet-website");process.stdout.write(p?.pm2_env?.pm_cwd||"")})'
)"
if [[ "${active_cwd}" != "${release_dir}" ]]; then
  echo "PM2 cwd mismatch: ${active_cwd}" >&2
  exit 1
fi

runuser -u deploy -- env PM2_HOME="${pm2_home}" pm2 save
trap - ERR

echo "Activated FitMeet website release ${release_id}."
echo "Verify https://fitmeet.cn/terms and https://fitmeet.cn/privacy."
