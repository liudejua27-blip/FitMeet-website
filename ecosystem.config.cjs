const path = require("node:path");
const fs = require("node:fs");

function protectedRuntimeEnv() {
  const sharedEnvPath = "/opt/fitmeet/website/shared/.env";
  const envPath = process.env.FITMEET_WEBSITE_ENV_PATH
    || (fs.existsSync(sharedEnvPath) ? sharedEnvPath : path.join(__dirname, ".env"));
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
    script: fs.existsSync(path.join(__dirname, "server.js"))
      ? path.join(__dirname, "server.js")
      : path.join(__dirname, "node_modules", "next", "dist", "bin", "next"),
    args: fs.existsSync(path.join(__dirname, "server.js")) ? undefined : "start -p 3100",
    cwd: __dirname,
    interpreter: "/usr/bin/node",
    instances: 1,
    exec_mode: "fork",
    autorestart: true,
    env: {
      ...protectedRuntimeEnv(),
      NODE_ENV: "production",
      PORT: "3100",
      HOSTNAME: "127.0.0.1",
    },
  }],
};
