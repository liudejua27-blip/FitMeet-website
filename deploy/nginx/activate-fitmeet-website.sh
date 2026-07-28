#!/usr/bin/env bash
set -euo pipefail

if [[ ${EUID} -ne 0 ]]; then
  echo "Run this activation script as root." >&2
  exit 1
fi

certificate_archive="/26090175_fitmeet.cn_nginx.zip"
nginx_source="/opt/fitmeet/incoming/fitmeet.cn.conf"
certificate_dir="/etc/nginx/ssl/fitmeet.cn"

test -f "${certificate_archive}"
test -f "${nginx_source}"

install -d -m 700 "${certificate_dir}"
unzip -jo "${certificate_archive}" fitmeet.cn.pem fitmeet.cn.key -d "${certificate_dir}"
chown root:root "${certificate_dir}/fitmeet.cn.pem" "${certificate_dir}/fitmeet.cn.key"
chmod 600 "${certificate_dir}/fitmeet.cn.pem" "${certificate_dir}/fitmeet.cn.key"
install -m 644 "${nginx_source}" /etc/nginx/conf.d/fitmeet.cn.conf

nginx -t
systemctl enable --now nginx
systemctl reload nginx

env PATH="${PATH}:/usr/local/bin" pm2 startup systemd -u deploy --hp /home/deploy
# The website was initially started manually by the deploy user.  Stop that
# daemon before starting its systemd owner, otherwise Type=forking cannot
# observe the expected PM2 PID and systemd marks a healthy process as failed.
runuser -u deploy -- env PATH="${PATH}:/usr/local/bin" PM2_HOME=/home/deploy/.pm2 pm2 kill || true
systemctl daemon-reload
systemctl reset-failed pm2-deploy
systemctl enable pm2-deploy
systemctl start pm2-deploy
systemctl is-active --quiet pm2-deploy

echo "FitMeet website HTTPS is active. Verify https://fitmeet.cn/nginx-health"
