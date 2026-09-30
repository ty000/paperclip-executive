#!/usr/bin/env node
// Apply the final dormant safety configuration and create the isolated L03 toy fixture.
// This script never resumes, wakes, invokes, or assigns work to an agent.
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const base = "http://127.0.0.1:3220";
const hostCommit = "61b3fd57a695614dc4a37e2303f426a34a9795cf";
const companyId = "ba82ae5f-292f-4c13-a02a-70ddef6cb22b";
const l02CompanyId = "331bf268-b21e-4874-9a3c-2137415c7e08";
const l02RunId = "2285549d-f090-4f92-ad46-64c2bce1d3cd";
const credentialsPath = "/home/davy-lp/workspace/paperclip-executive/.paperclip-dev/dev-owner.json";
const fixtureRoot = "/home/davy-lp/workspace/paperclip-executive/.paperclip-dev/l03-real";
const projectName = "L03 Campaign Budget Fixture";
const agentIds = [
  "481caab0-d0b3-442b-a5f4-5fe1d6563edb",
  "63e53a4a-1c89-4490-9739-05699be031fa",
  "cc0fe155-dfeb-4157-9827-4abe01c98daf",
  "ff2d8928-78f9-4f7f-9c81-af6bded5bd1e",
  "80d1e926-718d-4e7a-8311-c31e09e410fd",
  "9acab613-9c24-45df-8f26-e600fc61d615",
  "e39b0edd-435e-4aa7-bdd5-9d29753680ff",
];
const sha256 = (value) => createHash("sha256").update(value).digest("hex");

let cookie = "";
async function request(method, path, body, expected = [200]) {
  const response = await fetch(base + path, {
    method,
    headers: { origin: base, cookie, "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(60_000),
  });
  const cookies = response.headers.getSetCookie();
  if (cookies.length) cookie = cookies.map((value) => value.split(";", 1)[0]).join("; ");
  const text = await response.text();
  let value = null;
  try { value = text ? JSON.parse(text) : null; } catch { value = text; }
  if (!expected.includes(response.status)) {
    throw new Error(`${method} ${path}: HTTP ${response.status}: ${typeof value === "string" ? value : JSON.stringify(value)}`);
  }
  return value;
}
const get = (path) => request("GET", path);
const post = (path, body, expected = [200, 201]) => request("POST", path, body, expected);
const patch = (path, body) => request("PATCH", path, body, [200]);

function isConfiguredPlainBinding(value) {
  return value === "false" || (
    value && typeof value === "object" && value.type === "plain" && value.value === "***REDACTED***"
  );
}

function writeExact(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  if (existsSync(path)) {
    assert.equal(readFileSync(path, "utf8"), content, `Refusing to overwrite divergent fixture file: ${path}`);
    return;
  }
  writeFileSync(path, content, { flag: "wx" });
}

const fixtureFiles = {
  ".gitignore": "node_modules/\ncoverage/\n",
  "package.json": `${JSON.stringify({
    name: "paperclip-executive-l03-campaign-fixture",
    version: "1.0.0",
    private: true,
    type: "module",
    scripts: { test: "node --test test/*.test.ts" },
  }, null, 2)}\n`,
  "README.md": `# L03 campaign budget fixture

Implement \`allocateCampaignBudget(input)\` in \`src/allocateCampaignBudget.ts\`.

The function must return a deterministic plan or a typed refusal. It accepts only the seven declared roles, rejects duplicates and invalid numeric values, permits at most two calls per specialist/executor and three for the Council reviewer, permits no more than fourteen calls total, and permits no more than 700 cents total. The authenticated executor approach precedes Council reservation; reservation precedes the five specialists; direction review precedes execution; result review follows execution. The executor cannot review its own result. Invalid input must fail without a partial plan.

This repository is disposable and belongs only to Paperclip company \`${companyId}\`. No deploy, publication, external API, credential, customer data, or network action is allowed.
`,
  "src/allocateCampaignBudget.ts": `export type CampaignRole =
  | "product"
  | "architecture"
  | "quality"
  | "delivery"
  | "economics"
  | "council-reviewer"
  | "software-executor";

export type CampaignRequest = {
  role: CampaignRole;
  phase: "reserve" | "specialist" | "approach" | "direction" | "execution" | "result";
  calls: number;
  centsPerCall: number;
};

export type CampaignPlan =
  | { ok: true; totalCalls: number; totalCents: number; ordered: CampaignRequest[] }
  | { ok: false; code: string; reason: string };

export function allocateCampaignBudget(_input: CampaignRequest[]): CampaignPlan {
  throw new Error("L03 fixture intentionally unimplemented");
}
`,
  "test/allocateCampaignBudget.test.ts": `import assert from "node:assert/strict";
import test from "node:test";
import { allocateCampaignBudget, type CampaignRequest } from "../src/allocateCampaignBudget.ts";

const nominal: CampaignRequest[] = [
  { role: "software-executor", phase: "approach", calls: 1, centsPerCall: 40 },
  { role: "council-reviewer", phase: "reserve", calls: 1, centsPerCall: 10 },
  { role: "product", phase: "specialist", calls: 1, centsPerCall: 100 },
  { role: "architecture", phase: "specialist", calls: 1, centsPerCall: 100 },
  { role: "quality", phase: "specialist", calls: 1, centsPerCall: 100 },
  { role: "delivery", phase: "specialist", calls: 1, centsPerCall: 100 },
  { role: "economics", phase: "specialist", calls: 1, centsPerCall: 100 },
  { role: "council-reviewer", phase: "direction", calls: 1, centsPerCall: 40 },
  { role: "software-executor", phase: "execution", calls: 1, centsPerCall: 60 },
  { role: "council-reviewer", phase: "result", calls: 1, centsPerCall: 50 },
];

test("accepts the exact ten-run nominal sequence", () => {
  assert.deepEqual(allocateCampaignBudget(nominal), {
    ok: true, totalCalls: 10, totalCents: 700, ordered: nominal,
  });
});

test("rejects an over-budget plan without partial output", () => {
  const result = allocateCampaignBudget(nominal.map((entry) => ({ ...entry, centsPerCall: 100 })));
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.code, "budget_exceeded");
});

test("rejects result review before execution", () => {
  const reordered = [...nominal];
  [reordered[8], reordered[9]] = [reordered[9]!, reordered[8]!];
  const result = allocateCampaignBudget(reordered);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.code, "invalid_sequence");
});

test("rejects more than two calls for a specialist role", () => {
  const result = allocateCampaignBudget([...nominal, { role: "product", phase: "specialist", calls: 2, centsPerCall: 0 }]);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.code, "role_call_limit");
});
`,
};

const health = await get("/api/health");
assert.equal(health.commit, hostCommit);
assert.equal(health.deploymentMode, "authenticated");
assert.equal(health.deploymentExposure, "private");
await post("/api/auth/sign-in/email", JSON.parse(readFileSync(credentialsPath, "utf8")), [200]);

const preparation = JSON.parse(readFileSync(resolve(root, "docs/evidence/l03-preparation.json"), "utf8"));
const installed = JSON.parse(readFileSync(resolve(root, "docs/evidence/l03-installed.json"), "utf8"));
assert.equal(preparation.company.id, companyId);
assert.equal(installed.providerCalls, 0);

const [plugins, l02AgentsBefore, l02RunsBefore, l03RunsBefore] = await Promise.all([
  get("/api/plugins"),
  get(`/api/companies/${l02CompanyId}/agents`),
  get(`/api/companies/${l02CompanyId}/heartbeat-runs?limit=1000`),
  get(`/api/companies/${companyId}/heartbeat-runs?limit=1000`),
]);
assert.equal(l02RunsBefore.find((run) => run.id === l02RunId)?.status, "succeeded");
assert.equal(l03RunsBefore.length, 0, "Safety preparation must start before any L03 run");

const pluginEvidence = [];
for (const candidate of installed.candidates) {
  const plugin = plugins.find((entry) => entry.id === candidate.id);
  assert.equal(plugin?.status, "ready", `${candidate.key} is not ready`);
  assert.equal(plugin?.manifestJson?.version, candidate.version, `${candidate.key} version drift`);
  const pluginHealth = await get(`/api/plugins/${candidate.id}/health`);
  assert(pluginHealth.healthy !== false, `${candidate.key} worker is unhealthy`);
  pluginEvidence.push({ id: candidate.id, key: candidate.key, version: candidate.version, status: plugin.status, health: pluginHealth });
}

const safeAgents = [];
for (const agentId of agentIds) {
  const before = await get(`/api/agents/${agentId}/configuration`);
  const isReviewer = before.name === "Council Reviewer";
  const expectedTimeoutSec = isReviewer ? 600 : 300;
  const expectedMaxDailyRuns = isReviewer ? 3 : 2;
  assert.equal(before.companyId, companyId);
  assert.equal(before.status, "paused");
  assert.equal(before.runtimeConfig?.heartbeat?.enabled, false);
  assert.equal(before.runtimeConfig?.heartbeat?.wakeOnDemand, false);
  const currentEnv = before.adapterConfig?.env && typeof before.adapterConfig.env === "object"
    ? before.adapterConfig.env
    : {};
  if (
    before.adapterConfig?.dangerouslyBypassApprovalsAndSandbox !== false ||
    !isConfiguredPlainBinding(currentEnv.PAPERCLIP_CODEX_ACP_NETWORK_ACCESS) ||
    before.adapterConfig?.timeoutSec !== expectedTimeoutSec ||
    before.runtimeConfig?.heartbeat?.maxDailyRuns !== expectedMaxDailyRuns
  ) {
    await patch(`/api/agents/${agentId}`, {
      adapterConfig: {
        dangerouslyBypassApprovalsAndSandbox: false,
        timeoutSec: expectedTimeoutSec,
        env: { ...currentEnv, PAPERCLIP_CODEX_ACP_NETWORK_ACCESS: "false" },
      },
      runtimeConfig: {
        heartbeat: {
          ...before.runtimeConfig.heartbeat,
          enabled: false,
          wakeOnDemand: false,
          maxConcurrentRuns: 1,
          maxDailyRuns: expectedMaxDailyRuns,
          maxDailyCostCents: 100,
        },
      },
    });
  }
  const [after, bundle, instructions, skills] = await Promise.all([
    get(`/api/agents/${agentId}/configuration`),
    get(`/api/agents/${agentId}/instructions-bundle`),
    get(`/api/agents/${agentId}/instructions-bundle/file?path=AGENTS.md`),
    get(`/api/agents/${agentId}/skills`),
  ]);
  assert.equal(after.status, "paused");
  assert.equal(after.adapterConfig.dangerouslyBypassApprovalsAndSandbox, false);
  assert(isConfiguredPlainBinding(after.adapterConfig.env?.PAPERCLIP_CODEX_ACP_NETWORK_ACCESS));
  assert.equal(after.runtimeConfig.heartbeat.enabled, false);
  assert.equal(after.runtimeConfig.heartbeat.wakeOnDemand, false);
  assert.equal(after.runtimeConfig.heartbeat.maxConcurrentRuns, 1);
  assert.equal(after.runtimeConfig.heartbeat.maxDailyRuns, expectedMaxDailyRuns);
  assert.equal(after.runtimeConfig.heartbeat.maxDailyCostCents, 100);
  const prepared = preparation.agents.find((entry) => entry.id === agentId);
  assert(prepared, `Missing preparation evidence for ${agentId}`);
  assert.equal(sha256(instructions.content ?? ""), prepared.sourceContentSha256);
  for (const required of prepared.requiredSkills) {
    assert(skills.desiredSkills.includes(required.companyKey), `Desired skill missing: ${required.companyKey}`);
    assert(skills.entries.some((entry) => entry.key === required.companyKey && entry.desired && entry.state === "configured"));
  }
  safeAgents.push({
    id: agentId,
    profileId: prepared.profileId,
    status: after.status,
    model: after.adapterConfig.model,
    effort: after.adapterConfig.modelReasoningEffort,
    safety: {
      dangerouslyBypassApprovalsAndSandbox: after.adapterConfig.dangerouslyBypassApprovalsAndSandbox,
      acpNetworkAccessRequested: "false",
      acpNetworkAccessReadback: "plain binding present; value redacted by native configuration API",
      timeoutSec: after.adapterConfig.timeoutSec,
      heartbeat: after.runtimeConfig.heartbeat,
    },
    instructions: { mode: bundle.mode, entryFile: bundle.entryFile, sha256: sha256(instructions.content ?? "") },
    requiredSkills: prepared.requiredSkills,
    skillSnapshot: {
      supported: skills.supported,
      mode: skills.mode,
      configured: skills.entries.filter((entry) => entry.desired).map((entry) => ({ key: entry.key, state: entry.state, currentVersionId: entry.currentVersionId ?? null })),
      warnings: skills.warnings ?? [],
    },
  });
}

for (const [relativePath, content] of Object.entries(fixtureFiles)) {
  writeExact(resolve(fixtureRoot, relativePath), content);
}
if (!existsSync(resolve(fixtureRoot, ".git"))) {
  execFileSync("git", ["init", "-b", "main"], { cwd: fixtureRoot, stdio: "pipe" });
  execFileSync("git", ["add", "."], { cwd: fixtureRoot, stdio: "pipe" });
  execFileSync("git", ["-c", "user.name=Paperclip L03 Fixture", "-c", "user.email=l03-fixture@example.invalid", "commit", "-m", "fixture: seed L03 campaign budget task"], { cwd: fixtureRoot, stdio: "pipe" });
}
assert.equal(execFileSync("git", ["status", "--porcelain"], { cwd: fixtureRoot, encoding: "utf8" }), "");
const fixtureCommit = execFileSync("git", ["rev-parse", "HEAD"], { cwd: fixtureRoot, encoding: "utf8" }).trim();
const baselineTest = spawnSync("npm", ["test"], { cwd: fixtureRoot, encoding: "utf8" });
assert.notEqual(baselineTest.status, 0, "Fixture must remain intentionally unimplemented before the campaign");
assert.match(`${baselineTest.stdout}\n${baselineTest.stderr}`, /intentionally unimplemented/);

let projects = await get(`/api/companies/${companyId}/projects`);
let project = projects.find((entry) => entry.name === projectName);
if (!project) {
  project = await post(`/api/companies/${companyId}/projects`, {
    idempotencyKey: "l03-real-campaign-budget-fixture-v1",
    name: projectName,
    description: "Disposable isolated repository for the operator-approved ten-run L03 campaign.",
    status: "planned",
    workspace: {
      name: "L03 real fixture",
      sourceType: "git_repo",
      cwd: fixtureRoot,
      repoRef: fixtureCommit,
      defaultRef: "main",
      isPrimary: true,
      runtimeConfig: { desiredState: "manual" },
      metadata: { qualification: "L03", fixtureVersion: "1.0.0", baselineCommit: fixtureCommit },
    },
  }, [200, 201]);
}
assert.equal(project.companyId, companyId);
if (project.description !== "Disposable isolated repository for the operator-approved ten-run L03 campaign.") {
  project = await patch(`/api/projects/${project.id}`, {
    description: "Disposable isolated repository for the operator-approved ten-run L03 campaign.",
  });
}
const workspaces = await get(`/api/projects/${project.id}/workspaces`);
assert.equal(workspaces.length, 1);
let workspace = workspaces[0];
assert.equal(workspace.cwd, fixtureRoot);
assert.equal(workspace.isPrimary, true);
if (workspace.repoRef !== fixtureCommit || workspace.metadata?.baselineCommit !== fixtureCommit) {
  workspace = await patch(`/api/projects/${project.id}/workspaces/${workspace.id}`, {
    repoRef: fixtureCommit,
    defaultRef: "main",
    runtimeConfig: { desiredState: "manual" },
    metadata: { qualification: "L03", fixtureVersion: "1.0.0", baselineCommit: fixtureCommit },
  });
}
if (
  project.executionWorkspacePolicy?.defaultProjectWorkspaceId !== workspace.id ||
  project.executionWorkspacePolicy?.enabled !== true ||
  project.executionWorkspacePolicy?.workspaceStrategy?.baseRef !== fixtureCommit
) {
  project = await patch(`/api/projects/${project.id}`, {
    executionWorkspacePolicy: {
      enabled: true,
      sharedWorkspaceConcurrency: "serialize",
      defaultMode: "shared_workspace",
      allowIssueOverride: false,
      defaultProjectWorkspaceId: workspace.id,
      workspaceStrategy: { type: "project_primary", baseRef: fixtureCommit },
      runtimePolicy: { desiredState: "manual" },
    },
  });
}
project = await get(`/api/projects/${project.id}`);

const issueTitle = "Implement the L03 campaign budget allocator";
const issueDescription = [
  "Implement allocateCampaignBudget(input) in the isolated L03 fixture.",
  `Pinned baseline commit: ${fixtureCommit}.`,
  "Campaign order: executor approach; Council reservation; Product, Architecture, Quality, Delivery, and Economics contributions; Council direction; executor implementation; Council result decision.",
  "Acceptance: declared roles only; role and global call caps; 700-cent admission threshold; strict phase ordering; independent result review; deterministic typed refusal without partial output.",
  "Exclusions: no L02 resource, deploy, publication, external system, credential, customer data, recursive delegation, schedule, background wake, or provider call before explicit campaign approval.",
  "Roster, mission, mandate, reservation, and decision configuration must be bound and read back before release from backlog.",
].join("\n\n");
let issues = await get(`/api/companies/${companyId}/issues?limit=1000`);
if (!Array.isArray(issues)) issues = issues.items ?? issues.data ?? [];
let issue = issues.find((entry) => entry.projectId === project.id && entry.title === issueTitle);
if (!issue) {
  issue = await post(`/api/companies/${companyId}/issues`, {
    idempotencyKey: "l03-real-campaign-root-issue-v1",
    projectId: project.id,
    projectWorkspaceId: workspace.id,
    title: issueTitle,
    description: issueDescription,
    status: "backlog",
    priority: "medium",
    workMode: "standard",
    assigneeAgentId: "9acab613-9c24-45df-8f26-e600fc61d615",
    executionWorkspacePreference: "shared_workspace",
  }, [200, 201]);
}
issue = await get(`/api/issues/${issue.id}`);
assert.equal(issue.projectId, project.id);
assert.equal(issue.projectWorkspaceId, workspace.id);
assert.equal(issue.assigneeAgentId, "9acab613-9c24-45df-8f26-e600fc61d615");
assert.equal(issue.status, "backlog");
assert.equal(issue.description, issueDescription);

const [l02AgentsAfter, l02RunsAfter, l03RunsAfter, l03AgentsAfter] = await Promise.all([
  get(`/api/companies/${l02CompanyId}/agents`),
  get(`/api/companies/${l02CompanyId}/heartbeat-runs?limit=1000`),
  get(`/api/companies/${companyId}/heartbeat-runs?limit=1000`),
  get(`/api/companies/${companyId}/agents`),
]);
assert.deepEqual(l02AgentsAfter.map((entry) => entry.id).sort(), l02AgentsBefore.map((entry) => entry.id).sort());
assert.deepEqual(l02RunsAfter.map((entry) => entry.id).sort(), l02RunsBefore.map((entry) => entry.id).sort());
assert.equal(l03RunsAfter.length, 0);
assert.equal(l03AgentsAfter.length, 7);
assert(l03AgentsAfter.every((entry) => entry.status === "paused"));

const evidence = {
  schemaVersion: "paperclip-executive.l03-safety.v1",
  observedAt: new Date().toISOString(),
  authorization: {
    providerCalls: false,
    agentResumeOrWake: false,
    writes: "seven L03 agent safety patches plus one isolated fixture repository/project",
  },
  runtime: { base, hostCommit, instance: "executive-dev", schedulerEnabled: false },
  candidates: pluginEvidence,
  companyId,
  agents: safeAgents,
  fixture: {
    root: fixtureRoot,
    commit: fixtureCommit,
    clean: true,
    intentionallyUnimplemented: true,
    baselineTest: { command: "npm test", expectedStatus: "failing", observedExitCode: baselineTest.status },
    expectedNominalRuns: 10,
    initialCampaignRetryPolicy: "none",
  },
  project: {
    id: project.id,
    name: project.name,
    status: project.status,
    workspaceId: workspace.id,
    workspaceCwd: workspace.cwd,
    workspaceDesiredState: workspace.runtimeConfig?.desiredState ?? null,
    executionWorkspacePolicy: project.executionWorkspacePolicy,
  },
  issue: {
    id: issue.id,
    identifier: issue.identifier,
    title: issue.title,
    status: issue.status,
    assigneeAgentId: issue.assigneeAgentId,
    projectId: issue.projectId,
    projectWorkspaceId: issue.projectWorkspaceId,
    executionWorkspacePreference: issue.executionWorkspacePreference,
    baselineCommit: fixtureCommit,
    releaseBlockedOn: ["explicit campaign approval", "roster configuration", "mission configuration", "mandate configuration and readback"],
  },
  preservation: {
    l02CompanyId,
    l02RunId,
    l02AgentIdsBefore: l02AgentsBefore.map((entry) => entry.id).sort(),
    l02AgentIdsAfter: l02AgentsAfter.map((entry) => entry.id).sort(),
    l02RunIdsBefore: l02RunsBefore.map((entry) => entry.id).sort(),
    l02RunIdsAfter: l02RunsAfter.map((entry) => entry.id).sort(),
    unchanged: true,
  },
  runReadback: { l03RunCount: 0, queuedOrRunning: false },
  proof: {
    installed: "verified for Executive 0.3.0 and Council 0.5.0 registry/health",
    desired: "verified for instructions and required skill assignments",
    loaded: "unverified until an authorized exact-profile run observes the effective mount",
    activated: "false; every agent remains paused and automatic wake paths are disabled",
    executed: "false; no L03 run or provider call exists",
  },
};
writeFileSync(resolve(root, "docs/evidence/l03-safety.json"), JSON.stringify(evidence, null, 2) + "\n");
console.log(JSON.stringify({
  status: "safe-and-dormant",
  companyId,
  projectId: project.id,
  workspaceId: workspace.id,
  fixtureCommit,
  agents: safeAgents.map((entry) => ({ profileId: entry.profileId, id: entry.id, status: entry.status })),
  l03RunCount: 0,
}, null, 2));
