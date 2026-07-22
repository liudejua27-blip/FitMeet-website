const path = require("node:path");
const fs = require("node:fs");

function protectedRuntimeEnv() {
  const envPath = path.join(__dirname, ".env");
  if (!fs.existsSync(envPath)) return {};
  return Object.fromEntries(fs.readFileSync(envPath, "utf8").split(/\r?\n/).flatMap((line) => {
    const separator = line.indexOf("=");
    if (separator <= 0 || line.trim().startsWith("#")) return [];
    const key = line.slice(0, separator).trim();
    const raw = line.slice(separator + 1).trim();
    try { return [[key, JSON.parse(raw)]]; } catch { return [[key, raw]]; }
  }));
}

module.exports = {
  apps: [{
    name: "fitmeet-website",
    script: path.join(__dirname, "node_modules", "next", "dist", "bin", "next"),
    args: "start -p 3001",
    cwd: __dirname,
    interpreter: "/usr/bin/node",
    instances: 1,
    exec_mode: "fork",
    autorestart: true,
    env: {
      ...protectedRuntimeEnv(),
      NODE_ENV: "production",
      PORT: "3001",
    },
  }],
};
