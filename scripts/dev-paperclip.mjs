#!/usr/bin/env node
// Use the existing Paperclip checkout with a separate, project-local instance.
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(process.env.PAPERCLIP_SOURCE ?? resolve(root, "../paperclip"));
const home = resolve(root, ".paperclip-dev");
const instance = "executive-dev";
const dir = resolve(home, "instances", instance);
const configPath = resolve(dir, "config.json");
const [command = "start", ...args] = process.argv.slice(2);
if (!["start", "stop", "setup", "cli"].includes(command)) {
  throw new Error("Usage: node scripts/dev-paperclip.mjs [start | stop | setup | cli <arguments>]");
}
if (command === "stop") {
  const runtimePath = resolve(dir, "runtime-info.json");
  if (!existsSync(runtimePath)) { console.log("Executive dev is not running."); process.exit(0); }
  const runtime = JSON.parse(readFileSync(runtimePath, "utf8"));
  const argv = readFileSync(`/proc/${runtime.pid}/cmdline`, "utf8").split("\0");
  if (runtime.instanceId !== instance || !argv.includes(configPath)) throw new Error("Process does not match this instance; refusing to stop it");
  process.kill(runtime.pid, "SIGTERM");
  console.log("Requested graceful shutdown of Executive dev.");
  process.exit(0);
}
const tsx = resolve(source, "cli/node_modules/tsx/dist/cli.mjs");
if (!existsSync(tsx)) throw new Error(`Install the Paperclip workspace dependencies first: ${source}`);
mkdirSync(dir, { recursive: true, mode: 0o700 });
if (!existsSync(configPath)) {
  const config = {
    $meta: { version: 1, updatedAt: new Date().toISOString(), source: "configure" },
    database: {
      mode: "embedded-postgres",
      embeddedPostgresDataDir: resolve(dir, "db"), embeddedPostgresPort: 54349,
      backup: { enabled: false, intervalMinutes: 60, retentionDays: 7, dir: resolve(dir, "backups") },
    },
    logging: { mode: "file", logDir: resolve(dir, "logs") },
    server: {
      deploymentMode: "authenticated", exposure: "private", bind: "loopback",
      host: "127.0.0.1", port: 3220, allowedHostnames: ["127.0.0.1", "localhost"], serveUi: true,
    },
    auth: { baseUrlMode: "explicit", publicBaseUrl: "http://127.0.0.1:3220", disableSignUp: false },
    storage: { provider: "local_disk", localDisk: { baseDir: resolve(dir, "storage") } },
    secrets: { provider: "local_encrypted", localEncrypted: { keyFilePath: resolve(dir, "secrets/master.key") } },
    telemetry: { enabled: false }, updates: { checkEnabled: false },
  };
  writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n", { mode: 0o600, flag: "wx" });
}
const envPath = resolve(dir, ".env");
if (!existsSync(envPath)) {
  writeFileSync(envPath, `BETTER_AUTH_SECRET=${randomBytes(32).toString("hex")}\n`, { mode: 0o600, flag: "wx" });
}

if (command === "setup") {
  const base = "http://127.0.0.1:3220";
  let cookie = "";
  async function request(method, path, body) {
    const response = await fetch(base + path, {
      method, headers: { "content-type": "application/json", origin: base, cookie },
      body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(60_000),
    });
    if (!response.ok) throw new Error(`${method} ${path}: HTTP ${response.status}`);
    const cookies = response.headers.getSetCookie();
    if (cookies.length) cookie = cookies.map(value => value.split(";", 1)[0]).join("; ");
    return response.json();
  }
  const health = await request("GET", "/api/health");
  if (health.deploymentMode !== "authenticated" || health.deploymentExposure !== "private") {
    throw new Error("Expected the private authenticated Executive development instance");
  }
  const credentialsPath = resolve(home, "dev-owner.json");
  if (!existsSync(credentialsPath)) {
    if (health.bootstrapStatus !== "bootstrap_pending") throw new Error("Instance already claimed; use its existing owner through the UI");
    writeFileSync(credentialsPath, JSON.stringify({
      email: "executive-dev@example.test", password: randomBytes(24).toString("hex"), name: "Executive development owner",
    }, null, 2) + "\n", { mode: 0o600, flag: "wx" });
  }
  const credentials = JSON.parse(readFileSync(credentialsPath, "utf8"));
  try {
    await request("POST", "/api/auth/sign-in/email", credentials);
  } catch (error) {
    if (health.bootstrapStatus !== "bootstrap_pending" || !error.message.endsWith("HTTP 401")) throw error;
    await request("POST", "/api/auth/sign-up/email", credentials);
    await request("POST", "/api/auth/sign-in/email", credentials);
  }
  if (health.bootstrapStatus === "bootstrap_pending") await request("POST", "/api/bootstrap/claim", {});
  const companies = await request("GET", "/api/companies");
  const company = companies.find(value => value.name === "Executive Dev") ??
    await request("POST", "/api/companies", { name: "Executive Dev" });
  const plugins = await request("GET", "/api/plugins");
  const plugin = plugins.find(value => value.manifestJson?.id === "paperclip-executive.executive") ??
    await request("POST", "/api/plugins/install", { packageName: resolve(root, "packages/executive"), isLocalPath: true });
  const pluginHealth = await request("GET", `/api/plugins/${plugin.id}/health`);
  const evidence = { checkedAt: new Date().toISOString(), baseUrl: base, hostCommit: health.commit, companyId: company.id, pluginId: plugin.id, pluginHealth };
  writeFileSync(resolve(home, "setup-result.json"), JSON.stringify(evidence, null, 2) + "\n", { mode: 0o600 });
  console.log(JSON.stringify(evidence, null, 2));
  console.log(`Local development login is saved in ${credentialsPath}; keep this file private.`);
  process.exitCode = pluginHealth.healthy ? 0 : 1;
} else {
  // Do not inherit another instance's database, provider credentials or API target.
  const env = {};
  for (const key of ["PATH", "HOME", "USER", "LOGNAME", "LANG", "TERM", "XDG_RUNTIME_DIR", "DBUS_SESSION_BUS_ADDRESS"]) {
    if (process.env[key] !== undefined) env[key] = process.env[key];
  }
  Object.assign(env, {
    PAPERCLIP_HOME: home, PAPERCLIP_INSTANCE_ID: instance, PAPERCLIP_CONFIG: configPath,
    PAPERCLIP_DISABLE_CWD_ENV_FILE: "true", PAPERCLIP_API_URL: "http://127.0.0.1:3220",
    PAPERCLIP_UI_DEV_MIDDLEWARE: "true", PAPERCLIP_TELEMETRY_ENABLED: "false",
    HEARTBEAT_SCHEDULER_ENABLED: "false", OTEL_SDK_DISABLED: "true",
  });
  const cliArgs = command === "start" ? ["run", "--instance", instance, "--config", configPath] : args;
  console.log(`Executive dev: http://127.0.0.1:3220 | data: ${home} | host source: ${source}`);
  const child = spawn(process.execPath, [tsx, resolve(source, "cli/src/index.ts"), ...cliArgs], {
    cwd: source, env, stdio: "inherit",
  });
  for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal));
  child.on("error", (error) => { console.error(error.message); process.exitCode = 1; });
  child.on("exit", (code, signal) => { process.exitCode = code ?? (signal ? 1 : 0); });
}
