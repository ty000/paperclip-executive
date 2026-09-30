#!/usr/bin/env node

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const hostRoot = "/home/davy-lp/workspace/paperclip";
const councilRoot = "/home/davy-lp/workspace/paperclip-council-l03";
const credentialPath = "/home/davy-lp/workspace/paperclip-executive/.paperclip-dev/dev-owner.json";
const runtimeInfoPath = "/home/davy-lp/workspace/paperclip-executive/.paperclip-dev/instances/executive-dev/runtime-info.json";
const syntheticRoot = "/home/davy-lp/workspace/paperclip-executive/.paperclip-dev/l03-synthetic";
const fixturePath = resolve(root, "scripts/fixtures/l03-codex-cli.mjs");
const evidenceDir = resolve(root, "docs/evidence");
const baseUrl = "http://127.0.0.1:3220";
const expectedHostCommit = "61b3fd57a695614dc4a37e2303f426a34a9795cf";
const protectedL02CompanyId = "331bf268-b21e-4874-9a3c-2137415c7e08";
const protectedL03CompanyId = "ba82ae5f-292f-4c13-a02a-70ddef6cb22b";

const args = process.argv.slice(2);
const mode = args[0];
const option = (name) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};
const executivePluginId = option("--executive-plugin-id") ?? process.env.EXECUTIVE_PLUGIN_ID;
const councilPluginId = option("--council-plugin-id") ?? process.env.COUNCIL_PLUGIN_ID;
assert(["preflight", "run", "resume"].includes(mode), "Usage: node scripts/qualify-l03-host.mjs preflight|run|resume --executive-plugin-id <uuid> --council-plugin-id <uuid>");
assert(executivePluginId && councilPluginId, "Both installed plugin instance IDs are required; candidate discovery must be explicit");
assert.notEqual(executivePluginId, councilPluginId);

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
function canonicalJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
}
const canonicalSha256 = (value) => sha256(canonicalJson(value));
const git = (cwd, ...argv) => execFileSync("git", argv, { cwd, encoding: "utf8" }).trim();

const hostCommit = git(hostRoot, "rev-parse", "HEAD");
assert.equal(hostCommit, expectedHostCommit, "Refusing a host revision outside the qualified contract");
const runtimeInfo = JSON.parse(readFileSync(runtimeInfoPath, "utf8"));
assert.equal(runtimeInfo.instanceId, "executive-dev");
assert.equal(runtimeInfo.port, 3220);
assert(existsSync(`/proc/${runtimeInfo.pid}`), "Recorded executive-dev process is not running");
const cmdline = readFileSync(`/proc/${runtimeInfo.pid}/cmdline`, "utf8").split("\0");
assert(cmdline.includes("--instance") && cmdline.includes("executive-dev"));
assert(cmdline.includes("--config") && cmdline.some((item) => item.endsWith("/.paperclip-dev/instances/executive-dev/config.json")));

mkdirSync(evidenceDir, { recursive: true });
const evidencePath = resolve(evidenceDir, mode === "preflight" ? "l03-host-preflight.json" : "l03-host-run.json");
if (mode === "run") assert(!existsSync(evidencePath), `Refusing an ambiguous rerun while ${evidencePath} exists`);
if (mode === "resume") assert(existsSync(evidencePath), `Cannot resume without ${evidencePath}`);

let evidence = mode === "resume" ? JSON.parse(readFileSync(evidencePath, "utf8")) : {
  schemaVersion: 1,
  proofId: `paperclip-executive-l03-host-${mode}-2026-09-30`,
  startedAt: new Date().toISOString(),
  outcome: "RUNNING",
  environment: {
    baseUrl,
    hostCommit,
    runtimePid: runtimeInfo.pid,
    instanceId: runtimeInfo.instanceId,
    executiveSourceHead: git(root, "rev-parse", "HEAD"),
    councilSourceHead: git(councilRoot, "rev-parse", "HEAD"),
    providerCalls: 0,
    fixture: "codex_local CLI JSONL; local process only",
  },
  candidates: { executivePluginId, councilPluginId },
  protectedBaselines: {},
  synthetic: {},
  checks: {},
  steps: [],
};
const save = () => writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`, { mode: 0o600 });
if (mode === "resume") {
  assert.equal(evidence.outcome, "RUNNING", "Only the interrupted RUNNING packet may be resumed");
  evidence.resumes ??= [];
  const lastFailure = evidence.steps.findLast((step) => step.status >= 400);
  const lastFailureCode = lastFailure?.response?.code;
  evidence.resumes.push(lastFailure?.path?.endsWith("/documents/delivery-manifest") && lastFailure.status === 400 ? {
    at: new Date().toISOString(),
    reason: "The harness used a JSON document format while the native issue-document contract accepts markdown bodies for the JSON-encoded delivery manifest.",
    disposition: "Keep the exact JSON bytes in the body under the supported markdown document format and continue the already released packet.",
  } : String(lastFailure?.response?.error ?? "").includes("baseRevisionId") ? {
    at: new Date().toISOString(),
    reason: "The harness omitted the native optimistic baseRevisionId when replacing the V1 approach document with V2 bytes.",
    disposition: "Read the current native document revision and update from that exact revision before submitting the already authorized A2 identity.",
  } : lastFailureCode === "pinned_actor_not_operational" ? {
    at: new Date().toISOString(),
    reason: "The unauthorized-actor negative probe reached the operational actor guard before the role authorization guard because the executor was paused.",
    disposition: "Temporarily stage the executor as operational for that negative probe, prove it creates no run, then restore paused state before continuing the same packet.",
  } : lastFailureCode === "pair_ineligible" ? {
    at: new Date().toISOString(),
    reason: "The harness paused the executor before roster activation, while native composition activation requires every member to be operational.",
    disposition: "Activate the pair first, then pause the executor immediately before creating the assigned issue.",
  } : evidence.resumes.length === 0 ? {
    at: new Date().toISOString(),
    reason: "Harness assumed agentId in native create-key response; host contract omits that redundant field.",
    disposition: "Resume the same synthetic company after revoking the unused first key.",
  } : evidence.resumes.length === 1 ? {
    at: new Date().toISOString(),
    reason: "Harness bound ticket.sourceHash to the issue description instead of the supplied context bytes.",
    disposition: "Resume the same synthetic mission after correcting both context hashes to the same native bytes.",
  } : {
    at: new Date().toISOString(),
    reason: evidence.resumes.length === 2
      ? "The first resume reused a fixed secret display name, which the native secret store rejects as duplicate."
      : "The harness waited for a scheduled-retry run as though it were an actively executing run.",
    disposition: evidence.resumes.length === 2
      ? "Use a unique synthetic secret name and continue the same mission; the obsolete credential remains revoked."
      : "Reuse the already authenticated run context without treating scheduled_retry as a terminal wait target.",
  });
}
save();

let cookie = "";
const credentials = JSON.parse(readFileSync(credentialPath, "utf8"));
function redacted(path, value) {
  if (path.startsWith("/api/auth/")) return { userId: value?.user?.id ?? null };
  if (path.includes("/keys")) return { id: value?.id ?? null, agentId: value?.agentId ?? null, scope: value?.scope ?? null };
  if (path.includes("/secrets")) return { id: value?.id ?? null, key: value?.key ?? null, provider: value?.provider ?? null };
  if (path.endsWith("/config")) return { configured: true, pluginId: value?.pluginId ?? null };
  return value;
}
async function request(method, path, body, actor, record = true) {
  const headers = { origin: baseUrl };
  if (body !== undefined) headers["content-type"] = "application/json";
  if (actor?.token) {
    headers.authorization = `Bearer ${actor.token}`;
    headers["x-paperclip-run-id"] = actor.runId;
  } else if (cookie) headers.cookie = cookie;
  const response = await fetch(baseUrl + path, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(60_000),
  });
  if (!actor?.token && response.headers.getSetCookie().length) {
    cookie = response.headers.getSetCookie().map((entry) => entry.split(";", 1)[0]).join("; ");
  }
  const text = await response.text();
  let value;
  try { value = text ? JSON.parse(text) : null; } catch { value = text; }
  if (record) {
    evidence.steps.push({
      at: new Date().toISOString(), method, path,
      actor: actor ? { agentId: actor.agentId, runId: actor.runId } : "board",
      status: response.status,
      response: redacted(path, value),
    });
    save();
  }
  return { status: response.status, body: value, headers: response.headers };
}
async function expectStatus(method, path, body, status, actor, record = true) {
  const result = await request(method, path, body, actor, record);
  assert.equal(result.status, status, `${method} ${path}: HTTP ${result.status}: ${JSON.stringify(result.body)}`);
  return result.body;
}
async function poll(label, read, accept, timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs;
  let value;
  do {
    value = await read();
    if (accept(value)) return value;
    await new Promise((resolvePoll) => setTimeout(resolvePoll, 250));
  } while (Date.now() < deadline);
  throw new Error(`${label} did not reach the required state: ${JSON.stringify(value)}`);
}

await expectStatus("POST", "/api/auth/sign-in/email", credentials, 200);
const health = await expectStatus("GET", "/api/health", undefined, 200);
assert.equal(health.commit, expectedHostCommit);
assert.equal(health.deploymentMode, "authenticated");
assert.equal(health.deploymentExposure, "private");

const plugins = await expectStatus("GET", "/api/plugins", undefined, 200);
const executivePlugin = plugins.find((entry) => entry.id === executivePluginId);
const councilPlugin = plugins.find((entry) => entry.id === councilPluginId);
assert.equal(executivePlugin?.manifestJson?.id, "paperclip-executive.executive", "Executive plugin ID does not resolve to the candidate manifest");
assert.equal(councilPlugin?.manifestJson?.id, "private.paperclip-council", "Council plugin ID does not resolve to the candidate manifest");
assert.equal(executivePlugin.packagePath, resolve(root, "packages/executive"));
assert.equal(councilPlugin.packagePath, councilRoot);
const executiveHealth = await expectStatus("GET", `/api/plugins/${executivePluginId}/health`, undefined, 200);
const councilHealth = await expectStatus("GET", `/api/plugins/${councilPluginId}/health`, undefined, 200);
assert.equal(executiveHealth.status, "ready");
assert.equal(executiveHealth.healthy, true);
assert.equal(councilHealth.status, "ready");
assert.equal(councilHealth.healthy, true);
evidence.checks.candidateReadiness = {
  executive: {
    manifestId: executivePlugin.manifestJson.id, version: executivePlugin.manifestJson.version, health: executiveHealth.status,
    packagePath: executivePlugin.packagePath,
    workerSha256: sha256(readFileSync(resolve(executivePlugin.packagePath, "dist/worker.js"))),
    manifestSha256: sha256(readFileSync(resolve(executivePlugin.packagePath, "dist/manifest.js"))),
  },
  council: {
    manifestId: councilPlugin.manifestJson.id, version: councilPlugin.manifestJson.version, health: councilHealth.status,
    packagePath: councilPlugin.packagePath,
    workerSha256: sha256(readFileSync(resolve(councilPlugin.packagePath, "dist/worker.js"))),
    manifestSha256: sha256(readFileSync(resolve(councilPlugin.packagePath, "dist/manifest.js"))),
  },
};
const installedEvidence = JSON.parse(readFileSync(resolve(evidenceDir, "l03-installed.json"), "utf8"));
assert.equal(installedEvidence.host.commit, hostCommit);
for (const candidate of [evidence.checks.candidateReadiness.executive, evidence.checks.candidateReadiness.council]) {
  const installed = installedEvidence.candidates.find((entry) => entry.key === candidate.manifestId);
  assert(installed, `Installed lifecycle evidence is missing ${candidate.manifestId}`);
  assert.equal(installed.id, candidate.manifestId === "paperclip-executive.executive" ? executivePluginId : councilPluginId);
  assert.equal(installed.path, candidate.packagePath);
  assert.equal(installed.workerSha256, candidate.workerSha256);
  assert.equal(installed.manifestSha256, candidate.manifestSha256);
}
evidence.checks.candidateReadiness.installedObservedAt = installedEvidence.observedAt;

async function companyBaseline(companyId) {
  const agents = await expectStatus("GET", `/api/companies/${companyId}/agents`, undefined, 200);
  const runs = await expectStatus("GET", `/api/companies/${companyId}/heartbeat-runs?limit=1000`, undefined, 200);
  assert(runs.length < 1000, `Protected company ${companyId} run baseline is truncated`);
  return {
    agentCount: agents.length,
    agentStatuses: agents.map((agent) => ({ id: agent.id, status: agent.status })).sort((a, b) => a.id.localeCompare(b.id)),
    runIds: runs.map((run) => run.id).sort(),
  };
}
evidence.protectedBaselines.l02 = await companyBaseline(protectedL02CompanyId);
evidence.protectedBaselines.l03 = await companyBaseline(protectedL03CompanyId);
assert.equal(evidence.protectedBaselines.l03.agentCount, 7, "The protected real L03 company no longer has exactly seven agents");
assert(evidence.protectedBaselines.l03.agentStatuses.every((agent) => agent.status === "paused"), "Every protected real L03 agent must remain paused");
save();

if (mode === "preflight") {
  evidence.outcome = "PASS";
  evidence.finishedAt = new Date().toISOString();
  evidence.checks.boundary = "Candidate plugins ready; protected L02 and real L03 companies read only; no synthetic mutation attempted.";
  save();
  console.log(JSON.stringify({ outcome: evidence.outcome, evidencePath, checks: evidence.checks }, null, 2));
  process.exit(0);
}

chmodSync(fixturePath, 0o755);
mkdirSync(syntheticRoot, { recursive: true, mode: 0o700 });
const qualificationId = randomUUID();
const criterion = { id: "criterion-native-proof", text: "The exact immutable result is reviewed with native receipts and one bounded correction." };
const approachBodyV1 = [
  "# Bounded provider-free approach V1",
  "",
  "Use one Council-reserved Executive opinion, one native executor release, an immutable git bundle, and a fresh result review.",
  "[qualification:approach-correction-required]",
  "No provider, deployment, publication, or protected-company mutation is authorized.",
].join("\n");
const approachHashV1 = sha256(approachBodyV1);
const approachEvidenceRefV1 = `document:approach#sha256:${approachHashV1}`;
const approachBodyV2 = [
  "# Bounded provider-free approach V2",
  "",
  "Use one Council-reserved Executive opinion, one native executor release, an immutable git bundle, and a fresh result review.",
  "[qualification:approach-corrected]",
  "No provider, deployment, publication, or protected-company mutation is authorized.",
].join("\n");
const approachHashV2 = sha256(approachBodyV2);
const approachEvidenceRefV2 = `document:approach#sha256:${approachHashV2}`;
const suppliedContext = "Synthetic local qualification context; only the dedicated company and toy repository may change.";
const issueDescription = "Synthetic L03 host qualification ticket. No external delivery or provider call.";
const profilePath = resolve(root, "packages/executive/profiles/architecture/AGENTS.md");
const profileHash = sha256(readFileSync(profilePath));

let companyId;
let projectId;
let executor;
let reviewer;
let advisor;
if (mode === "resume") {
  companyId = evidence.synthetic.companyId;
  projectId = evidence.synthetic.projectId;
  assert(companyId && projectId && evidence.synthetic.agents, "Interrupted packet lacks synthetic identities");
  const existingAgents = await expectStatus("GET", `/api/companies/${companyId}/agents`, undefined, 200);
  executor = existingAgents.find((entry) => entry.id === evidence.synthetic.agents.executorId);
  reviewer = existingAgents.find((entry) => entry.id === evidence.synthetic.agents.reviewerId);
  advisor = existingAgents.find((entry) => entry.id === evidence.synthetic.agents.advisorId);
  assert(executor && reviewer && advisor, "Interrupted synthetic agents are no longer present");
  for (const agent of [executor, reviewer]) {
    const keys = await expectStatus("GET", `/api/agents/${agent.id}/keys`, undefined, 200);
    for (const key of keys.filter((entry) => entry.revokedAt === null)) {
      await expectStatus("DELETE", `/api/agents/${agent.id}/keys/${key.id}`, undefined, 200);
    }
  }
} else {
  const company = await expectStatus("POST", "/api/companies", {
    name: `L03 host qualification ${qualificationId.slice(0, 8)}`,
    description: "Isolated provider-free Executive/Council L03 native qualification.",
    budgetMonthlyCents: 0,
  }, 201);
  companyId = company.id;
  evidence.synthetic.companyId = companyId;
  const project = await expectStatus("POST", `/api/companies/${companyId}/projects`, {
    name: "L03 native qualification",
    description: "Synthetic local project with no remote repository.",
  }, 201);
  projectId = project.id;
  evidence.synthetic.projectId = projectId;
}

function agentDraft(name, role, fixtureRole) {
  return {
    name,
    role,
    adapterType: "codex_local",
    adapterConfig: {
      engine: "cli",
      command: fixturePath,
      cwd: syntheticRoot,
      timeoutSec: 120,
      env: {
        OPENAI_API_KEY: "",
        L03_FIXTURE_ROLE: fixtureRole,
        L03_FIXTURE_HOLD_MS: fixtureRole === "opinion" ? "0" : "12000",
        L03_FIXTURE_CONTROL_DIR: syntheticRoot,
        L03_FIXTURE_CRITERION_REF: criterion.id,
        L03_FIXTURE_EVIDENCE_REF: approachEvidenceRefV1,
      },
    },
    runtimeConfig: { heartbeat: { enabled: false, wakeOnDemand: true, maxConcurrentRuns: 1, maxDailyRuns: 8, maxDailyCostCents: 1 } },
    budgetMonthlyCents: 0,
    permissions: { canCreateAgents: false, canCreateSkills: false },
  };
}
if (mode !== "resume") {
  executor = await expectStatus("POST", `/api/companies/${companyId}/agents`, agentDraft("L03 synthetic executor", "engineer", "executor"), 201);
  reviewer = await expectStatus("POST", `/api/companies/${companyId}/agents`, agentDraft("L03 synthetic Council reviewer", "general", "reviewer"), 201);
  advisor = await expectStatus("POST", `/api/companies/${companyId}/agents`, agentDraft("L03 synthetic Architecture advisor", "cto", "opinion"), 201);
  evidence.synthetic.agents = { executorId: executor.id, reviewerId: reviewer.id, advisorId: advisor.id };
}

async function createKey(agent) {
  const key = await expectStatus("POST", `/api/agents/${agent.id}/keys`, {
    name: `l03-host-${qualificationId.slice(0, 8)}`,
    scope: { kind: "standard" },
  }, 201);
  assert(key.id && key.token, "Native key creation did not return its one-time credential");
  assert.equal(key.scope.kind, "standard");
  return { agentId: agent.id, token: key.token, runId: "" };
}
const executorActor = await createKey(executor);
const reviewerActor = await createKey(reviewer);
async function setAgentWakeState(agent, status, wakeOnDemand) {
  const updated = await expectStatus("PATCH", `/api/agents/${agent.id}`, {
    status,
    runtimeConfig: { heartbeat: { enabled: false, wakeOnDemand, maxConcurrentRuns: 1, maxDailyRuns: 8, maxDailyCostCents: 1 } },
  }, 200);
  assert.equal(updated.status, status);
  assert.equal(updated.runtimeConfig.heartbeat.wakeOnDemand, wakeOnDemand);
  return updated;
}
async function bareWake(agent, reason, idempotencyKey) {
  const run = await expectStatus("POST", `/api/agents/${agent.id}/wakeup`, {
    source: "on_demand", triggerDetail: "manual", reason, idempotencyKey, forceFreshSession: true,
    payload: { qualificationId },
  }, 202);
  assert.notEqual(run.status, "skipped", `Native bare wake was skipped: ${JSON.stringify(run)}`);
  const runId = run.id ?? run.runId;
  assert(runId, `Native bare wake did not return a run identity: ${JSON.stringify(run)}`);
  return poll("native bare run terminal",
    () => expectStatus("GET", `/api/heartbeat-runs/${runId}`, undefined, 200, undefined, false),
    (current) => ["succeeded", "failed", "timed_out", "cancelled"].includes(current.status), 90_000);
}
let preIssueExecutorRun = null;
if (mode !== "resume") {
  preIssueExecutorRun = await bareWake(executor, "Prepare authenticated L03 approach context", `l03-pre-issue-${qualificationId}`);
  assert.equal(preIssueExecutorRun.status, "succeeded");
  executorActor.runId = preIssueExecutorRun.id;
} else if (!evidence.synthetic.issueId) {
  const priorRuns = await expectStatus("GET", `/api/companies/${companyId}/heartbeat-runs?limit=1000`, undefined, 200);
  preIssueExecutorRun = priorRuns.find((run) => run.agentId === executor.id && run.status === "succeeded") ?? null;
  assert(preIssueExecutorRun?.id, "Interrupted pre-issue packet has no successful executor authentication run");
  executorActor.runId = preIssueExecutorRun.id;
}
const councilSecret = await expectStatus("POST", `/api/companies/${companyId}/secrets`, {
  name: `L03 synthetic Council agent API key ${qualificationId.slice(0, 8)}`,
  key: `L03_COUNCIL_${qualificationId.replaceAll("-", "_").toUpperCase()}`,
  provider: "local_encrypted",
  value: reviewerActor.token,
  description: "Dedicated provider-free L03 qualification credential.",
}, 201);
await expectStatus("POST", `/api/plugins/${councilPluginId}/config`, {
  companyId,
  configJson: {
    apiBaseUrl: baseUrl,
    councilAgentId: reviewer.id,
    councilApiKey: { type: "secret_ref", secretId: councilSecret.id },
  },
}, 200);

const rosterBase = `/api/plugins/${councilPluginId}/api/companies/${companyId}/rosters`;
let issueId;
let missionId;
if (mode === "resume" && evidence.synthetic.issueId && evidence.synthetic.missionId) {
  issueId = evidence.synthetic.issueId;
  missionId = evidence.synthetic.missionId;
  const existingIssue = await expectStatus("GET", `/api/issues/${issueId}`, undefined, 200);
  assert.equal(existingIssue.companyId, companyId);
  assert.equal(existingIssue.projectId, projectId);
  assert.equal(existingIssue.assigneeAgentId, executor.id);
} else {
  const team = await expectStatus("POST", rosterBase, {
    companyId, command: "create", roster: {
      kind: "team", name: "L03 synthetic delivery", projectId,
      members: [{ agentId: executor.id, responsibilities: ["integration_lead"] }],
      integrationLeadAgentId: executor.id, finalReviewerAgentId: null, requiredPerspectives: [],
    },
  }, 201);
  const council = await expectStatus("POST", rosterBase, {
    companyId, command: "create", roster: {
      kind: "council", name: "L03 synthetic council", projectId,
      members: [
        { agentId: reviewer.id, responsibilities: ["final_reviewer"] },
        { agentId: advisor.id, responsibilities: ["architecture"] },
      ],
      integrationLeadAgentId: null, finalReviewerAgentId: reviewer.id, requiredPerspectives: ["architecture"],
    },
  }, 201);
  await setAgentWakeState(executor, "idle", true);
  const activation = await expectStatus("POST", rosterBase, {
    companyId, command: "activate-pair",
    teamRosterId: team.head.rosterId, teamExpectedVersion: team.head.version,
    councilRosterId: council.head.rosterId, councilExpectedVersion: council.head.version,
  }, 200);

  const executionPolicy = {
    mode: "normal", commentRequired: true,
    stages: [{ id: randomUUID(), type: "review", approvalsNeeded: 1, participants: [{ id: randomUUID(), type: "agent", agentId: reviewer.id }] }],
  };
  const issue = await expectStatus("POST", `/api/companies/${companyId}/issues`, {
    title: "L03 bounded native result",
    description: issueDescription,
    projectId,
    status: "backlog",
    executionPolicy,
  }, 201);
  issueId = issue.id;
  evidence.synthetic.issueId = issueId;

  missionId = randomUUID();
  const missionBase = `/api/plugins/${councilPluginId}/api/companies/${companyId}/missions`;
  const mission = await expectStatus("POST", missionBase, {
    companyId, command: "create", commandId: randomUUID(), missionId,
    rootIssueId: issueId, projectId,
    teamRosterId: team.head.rosterId, teamRevision: activation.team.revision.revision,
    councilRosterId: council.head.rosterId, councilRevision: activation.council.revision.revision,
    mandate: {
      objective: "Qualify the provider-free native L03 path in one synthetic company.",
      acceptanceCriteria: [criterion.text],
      commitments: ["No provider, deployment, publication, or protected-company mutation."],
      limits: { taskPolicy: "One bounded local synthetic mission", periodPolicy: "This qualification only", correctionLimit: 2, elapsedMinutes: 30 },
    },
  }, 201);
  assert.equal(mission.mission.version, 1);
  evidence.synthetic.missionId = missionId;
  const beforeAssignmentRunIds = (await expectStatus("GET", `/api/companies/${companyId}/heartbeat-runs?limit=1000`, undefined, 200)).map((run) => run.id).sort();
  await setAgentWakeState(executor, "paused", false);
  const assignedIssue = await expectStatus("PATCH", `/api/issues/${issueId}`, {
    status: "in_progress", assigneeAgentId: executor.id,
  }, 200);
  assert.equal(assignedIssue.status, "in_progress");
  assert.equal(assignedIssue.assigneeAgentId, executor.id);
  const afterAssignmentRunIds = (await expectStatus("GET", `/api/companies/${companyId}/heartbeat-runs?limit=1000`, undefined, 200)).map((run) => run.id).sort();
  assert.deepEqual(afterAssignmentRunIds, beforeAssignmentRunIds, "Paused issue assignment created a premature executor run");
  evidence.checks.noPrematureAssignmentRun = { beforeAssignmentRunIds, afterAssignmentRunIds };
}

const l03Base = `/api/plugins/${councilPluginId}/api/companies/${companyId}/l03`;
const expiresAt = new Date(Date.now() + 25 * 60_000).toISOString();
let state;
const existingL03 = mode === "resume"
  ? (await expectStatus("GET", `${l03Base}?companyId=${companyId}`, undefined, 200)).missions
    .find((entry) => entry.governance.missionId === missionId)
  : null;
if (existingL03) {
  state = existingL03;
  assert(["awaiting_approach", "collecting_approach_opinions", "awaiting_approach_direction", "approach_revision_required", "executing"].includes(state.governance.phase),
    `Cannot resume safely from L03 phase ${state.governance.phase}`);
  const approachDocument = await expectStatus("GET", `/api/issues/${issueId}/documents/approach`, undefined, 200);
  assert([approachBodyV1, approachBodyV2].includes(approachDocument.body), "Interrupted approach document bytes are not a qualified V1 or V2 subject");
} else {
  state = await expectStatus("POST", l03Base, {
    companyId, missionId, expectedMissionVersion: 1, mandateRevision: 1,
    executorAgentId: executor.id, finalReviewerAgentId: reviewer.id, councilAgentId: reviewer.id,
    executivePluginActorId: "paperclip-executive.executive", expiresAt,
    ticket: {
      issueId, sourceRef: `paperclip:issue:${issueId}`, sourceVersion: "1", sourceHash: sha256(suppliedContext),
      suppliedContext: { sourceRef: "inline:l03-synthetic-context", sourceHash: sha256(suppliedContext), content: suppliedContext },
      criteria: [criterion], exclusions: ["provider calls", "deployment", "publication", "protected-company mutation"],
    },
    limits: { envelope: 6, approach: 2, result: 2, consultation: 2, correction: 2 },
  }, 200);
  assert.equal(state.governance.phase, "awaiting_approach");

  await expectStatus("PUT", `/api/issues/${issueId}/documents/approach`, {
    title: "Bounded approach", format: "markdown", body: approachBodyV1,
    changeSummary: "Add exact provider-free L03 qualification approach V1.",
  }, 201);
}

async function wake(agentId, reason, idempotencyKey, fixtureHoldForMutation = false) {
  const run = await expectStatus("POST", `/api/agents/${agentId}/wakeup`, {
    source: "on_demand", triggerDetail: "manual", reason, idempotencyKey, forceFreshSession: true,
    payload: { issueId, missionId, qualificationId, fixtureHoldForMutation },
  }, 202);
  assert.notEqual(run.status, "skipped", `Native wake was skipped: ${JSON.stringify(run)}`);
  const runId = run.id ?? run.runId ?? run.executionRunId;
  assert(runId, `Native wake did not return a run identity: ${JSON.stringify(run)}`);
  const started = await poll("native run start", () => expectStatus("GET", `/api/heartbeat-runs/${runId}`, undefined, 200, undefined, false),
    (current) => current.status === "running" || ["succeeded", "failed", "timed_out", "cancelled"].includes(current.status));
  if (fixtureHoldForMutation) {
    assert.equal(started.contextSnapshot?.issueId, issueId, "Mutation run lacks the native issueId context");
  }
  return started;
}
async function waitTerminal(runId) {
  return poll("native run terminal", () => expectStatus("GET", `/api/heartbeat-runs/${runId}`, undefined, 200, undefined, false),
    (current) => ["succeeded", "failed", "timed_out", "cancelled"].includes(current.status), 90_000);
}
function releaseFixtureRun(runId) {
  assert(runId, "A native run ID is required before releasing its local fixture hold");
  const marker = resolve(syntheticRoot, `release-${runId}`);
  writeFileSync(marker, `${new Date().toISOString()}\n`, { mode: 0o600 });
  return marker;
}
let executorApproachRun;
if (preIssueExecutorRun) {
  executorApproachRun = preIssueExecutorRun;
} else if (existingL03) {
  const existingRuns = await expectStatus("GET", `/api/companies/${companyId}/heartbeat-runs?limit=1000`, undefined, 200);
  executorApproachRun = existingRuns
    .filter((run) => run.agentId === executor.id && !["cancelled", "failed", "timed_out"].includes(run.status))
    .sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt)))[0];
  assert(executorApproachRun?.id, "No native executor run exists for the admitted approach packet");
} else {
  executorApproachRun = await wake(executor.id, "Author the bounded L03 approach", `l03-approach-${qualificationId}`);
}
executorActor.runId = executorApproachRun.id;
const commandPath = `${l03Base}/${missionId}/commands`;

if (state.governance.phase === "awaiting_approach") {
  const invalidReference = await request("POST", commandPath, {
    companyId, type: "submit-approach", expectedVersion: 1,
    approach: { approachId: randomUUID(), authorAgentId: executor.id, contentRef: "../escape", contentHash: approachHashV1,
      criterionRefs: [criterion.id], evidenceRefs: [approachEvidenceRefV1], supersedesApproachId: null, addressesFindingIds: [] },
  }, executorActor);
  assert.equal(invalidReference.status, 422);
  assert.equal(invalidReference.body.code, "invalid_approach_reference");

  const beforeApproachActorRunIds = (await expectStatus("GET", `/api/companies/${companyId}/heartbeat-runs?limit=1000`, undefined, 200)).map((run) => run.id).sort();
  await setAgentWakeState(executor, "idle", true);
  state = await expectStatus("POST", commandPath, {
    companyId, type: "submit-approach", expectedVersion: 1,
    approach: { approachId: "approach-v1", authorAgentId: executor.id, contentRef: "approach", contentHash: approachHashV1,
      criterionRefs: [criterion.id], evidenceRefs: [approachEvidenceRefV1], supersedesApproachId: null, addressesFindingIds: [] },
  }, 200, executorActor);
  await setAgentWakeState(executor, "paused", false);
  const afterApproachActorRunIds = (await expectStatus("GET", `/api/companies/${companyId}/heartbeat-runs?limit=1000`, undefined, 200)).map((run) => run.id).sort();
  assert.deepEqual(afterApproachActorRunIds, beforeApproachActorRunIds, "Operational approach submission created a premature executor run");
  evidence.checks.noPrematureApproachRun = { beforeApproachActorRunIds, afterApproachActorRunIds };
}
let releaseRunId;
if (state.governance.phase === "executing") {
  const currentRuns = await expectStatus("GET", `/api/companies/${companyId}/heartbeat-runs?limit=1000`, undefined, 200);
  const existingReviewerRun = currentRuns.find((run) => run.agentId === reviewer.id && !["cancelled", "failed", "timed_out"].includes(run.status));
  assert(existingReviewerRun?.id, "Executing packet has no authenticated reviewer run");
  reviewerActor.runId = existingReviewerRun.id;
  const direction = state.governance.approachDirections.at(-1);
  assert.equal(direction?.verdict, "proceed");
  assert.equal(direction.actualEffect?.status, "confirmed");
  assert.match(direction.actualEffect.observationRef, /^paperclip:run:/);
  releaseRunId = direction.actualEffect.observationRef.slice("paperclip:run:".length);
  assert(currentRuns.some((run) => run.id === releaseRunId && run.agentId === executor.id));
  executorActor.runId = releaseRunId;
  assert.equal(state.governance.consultationSlots.filter((slot) => slot.contribution).length, 2);
  assert.equal(state.governance.approaches.length, 2);
  assert.equal(state.governance.approachDirections[0]?.verdict, "revise");
  assert.equal(state.governance.approachDirections[0]?.actualEffect, null);
} else {
assert(["collecting_approach_opinions", "awaiting_approach_direction", "approach_revision_required"].includes(state.governance.phase));

const reviewerReserveRun = state.governance.phase !== "collecting_approach_opinions"
  ? (await expectStatus("GET", `/api/companies/${companyId}/heartbeat-runs?limit=1000`, undefined, 200))
    .find((run) => run.agentId === reviewer.id && !["cancelled", "failed", "timed_out"].includes(run.status))
  : await wake(reviewer.id, "Reserve the required Executive opinion", `l03-reserve-${qualificationId}`);
assert(reviewerReserveRun?.id, "No authenticated reviewer run is available for the current approach direction");
reviewerActor.runId = reviewerReserveRun.id;
if (state.governance.phase === "collecting_approach_opinions") {
  const missingOpinion = await request("POST", commandPath, {
    companyId, type: "decide-approach", expectedVersion: state.governance.version,
    decisionId: "premature-direction", approachId: "approach-v1", verdict: "proceed",
    rationale: "This must be refused because no required opinion exists.", findingIds: [], receiptRef: `premature:${qualificationId}`,
  }, reviewerActor);
  assert.equal(missingOpinion.status, 409);
  assert.equal(missingOpinion.body.code, "required_contribution_missing");
}
function makeReservation(slotId, evidenceRef, contentHash, content) {
  return {
    companyId, missionId, missionVersion: 1, mandateRevision: 1,
    slotId, reservationId: randomUUID(), reservationVersion: 1, status: "reserved",
    reservedExecutiveAgentId: advisor.id,
    profile: { id: "architecture", version: "1.0.0", sourceHash: profileHash },
    method: { id: "paperclip-executive.council-reserved-opinion", version: "1.0.0" },
    criterionRefs: [criterion.id], evidenceRefs: [evidenceRef],
    context: { sourceRef: "approach", sourceHash: contentHash, content },
    expiresAt: new Date(Date.now() + 5 * 60_000).toISOString(),
  };
}
async function reserveAndObserve(subjectApproachId, reservation) {
  state = await expectStatus("POST", commandPath, {
    companyId, type: "reserve-consultation", expectedVersion: state.governance.version,
    subjectApproachId, reservation, required: true,
    reservationEventRef: `council:reservation:${reservation.reservationId}`,
    costExposure: { status: "known", reference: `provider-free:zero-token-fixture:${subjectApproachId}` },
  }, 200, reviewerActor);
  state = await poll(`Council contribution persistence for ${subjectApproachId}`, async () => {
    const listed = await expectStatus("GET", `${l03Base}?companyId=${companyId}`, undefined, 200, undefined, false);
    return listed.missions.find((entry) => entry.governance.missionId === missionId);
  }, (entry) => entry?.governance.phase === "awaiting_approach_direction"
    && entry.governance.consultationSlots.some((slot) => slot.slot.reservationId === reservation.reservationId && slot.contribution), 90_000);
  const slot = state.governance.consultationSlots.find((entry) => entry.slot.reservationId === reservation.reservationId);
  assert(slot?.contribution?.opinion, `Council did not persist the Executive opinion for ${subjectApproachId}`);
  const executiveState = await expectStatus("POST", `/api/plugins/${executivePluginId}/data/advice-state`, {
    companyId, params: { companyId },
  }, 200);
  const executiveContribution = executiveState.data.councilContributions.find((entry) => entry.reservationId === reservation.reservationId);
  assert.equal(executiveContribution?.status, "completed");
  assert.equal(executiveContribution.runId, slot.observations[0].runId);
  return { slot, executiveContribution };
}

let reservationV1;
let observedV1;
if (["awaiting_approach_direction", "approach_revision_required"].includes(state.governance.phase)) {
  const slot = state.governance.consultationSlots.find((entry) => entry.subjectApproachId === "approach-v1" && entry.contribution);
  assert(slot, "Interrupted packet has no completed V1 opinion");
  reservationV1 = slot.slot;
  const executiveState = await expectStatus("POST", `/api/plugins/${executivePluginId}/data/advice-state`, {
    companyId, params: { companyId },
  }, 200);
  const executiveContribution = executiveState.data.councilContributions.find((entry) => entry.reservationId === reservationV1.reservationId);
  assert.equal(executiveContribution?.status, "completed");
  observedV1 = { slot, executiveContribution };
} else {
  reservationV1 = makeReservation("architecture-slot-v1", approachEvidenceRefV1, approachHashV1, approachBodyV1);
  observedV1 = await reserveAndObserve("approach-v1", reservationV1);
}
assert.equal(observedV1.slot.contribution.opinion.recommendation, "revise");
assert(observedV1.slot.contribution.opinion.findings.some((finding) => finding.id === "approach-gap-v1" && finding.class === "must_fix"));

if (!evidence.steps.some((step) => step.response?.code === "version_conflict")) {
  const staleDirection = await request("POST", commandPath, {
    companyId, type: "decide-approach", expectedVersion: state.governance.version - 1,
    decisionId: "stale-direction", approachId: "approach-v1", verdict: "proceed",
    rationale: "This stale aggregate version must be refused.", findingIds: [], receiptRef: `stale:${qualificationId}`,
  }, reviewerActor);
  assert.equal(staleDirection.status, 409);
  assert.equal(staleDirection.body.code, "version_conflict");
}
if (!evidence.steps.some((step) => step.response?.code === "actor_not_authorized")) {
  const beforeUnauthorizedRunIds = (await expectStatus("GET", `/api/companies/${companyId}/heartbeat-runs?limit=1000`, undefined, 200)).map((run) => run.id).sort();
  await setAgentWakeState(executor, "idle", true);
  const unauthorizedDirection = await request("POST", commandPath, {
    companyId, type: "decide-approach", expectedVersion: state.governance.version,
    decisionId: "unauthorized-direction", approachId: "approach-v1", verdict: "proceed",
    rationale: "The executor cannot act as final reviewer.", findingIds: [], receiptRef: `unauthorized:${qualificationId}`,
  }, executorActor);
  await setAgentWakeState(executor, "paused", false);
  assert.equal(unauthorizedDirection.status, 403);
  assert.equal(unauthorizedDirection.body.code, "actor_not_authorized");
  const afterUnauthorizedRunIds = (await expectStatus("GET", `/api/companies/${companyId}/heartbeat-runs?limit=1000`, undefined, 200)).map((run) => run.id).sort();
  assert.deepEqual(afterUnauthorizedRunIds, beforeUnauthorizedRunIds, "Unauthorized direction staging created an executor run");
}

let beforeApproachRevisionRunIds;
let afterApproachRevisionRunIds;
if (state.governance.phase !== "approach_revision_required") {
  const beforeReemitRunIds = (await expectStatus("GET", `/api/companies/${companyId}/heartbeat-runs?limit=1000`, undefined, 200)).map((run) => run.id).sort();
  await expectStatus("POST", commandPath, { companyId, type: "reemit-reservation", reservationId: reservationV1.reservationId }, 200);
  await new Promise((resolveSettle) => setTimeout(resolveSettle, 750));
  const afterReemitRunIds = (await expectStatus("GET", `/api/companies/${companyId}/heartbeat-runs?limit=1000`, undefined, 200)).map((run) => run.id).sort();
  assert.deepEqual(afterReemitRunIds, beforeReemitRunIds, "Duplicate reservation created a new native run");
  beforeApproachRevisionRunIds = afterReemitRunIds;
  state = await expectStatus("POST", commandPath, {
    companyId, type: "decide-approach", expectedVersion: state.governance.version,
    decisionId: "direction-revise-v1", approachId: "approach-v1", verdict: "revise",
    rationale: "The attributed must-fix finding requires one bounded approach correction before release.",
    findingIds: ["approach-gap-v1"], receiptRef: `direction-revise-v1:${qualificationId}`,
  }, 200, reviewerActor);
  afterApproachRevisionRunIds = (await expectStatus("GET", `/api/companies/${companyId}/heartbeat-runs?limit=1000`, undefined, 200)).map((run) => run.id).sort();
} else {
  beforeApproachRevisionRunIds = (await expectStatus("GET", `/api/companies/${companyId}/heartbeat-runs?limit=1000`, undefined, 200)).map((run) => run.id).sort();
  afterApproachRevisionRunIds = beforeApproachRevisionRunIds;
}
assert.equal(state.governance.phase, "approach_revision_required");
assert.equal(state.governance.approachDirections.at(-1).executionAttempt, null);
assert.equal(state.governance.approachDirections.at(-1).actualEffect, null);
assert.deepEqual(afterApproachRevisionRunIds, beforeApproachRevisionRunIds, "A revise direction released an executor run");

const currentApproachDocument = await expectStatus("GET", `/api/issues/${issueId}/documents/approach`, undefined, 200);
if (currentApproachDocument.body === approachBodyV1) {
  await expectStatus("PUT", `/api/issues/${issueId}/documents/approach`, {
    title: "Bounded approach", format: "markdown", body: approachBodyV2,
    changeSummary: "Replace V1 with the bounded corrected approach V2.", baseRevisionId: currentApproachDocument.latestRevisionId,
  }, 200);
} else {
  assert.equal(currentApproachDocument.body, approachBodyV2);
}
const beforeApproachV2RunIds = afterApproachRevisionRunIds;
await setAgentWakeState(executor, "idle", true);
state = await expectStatus("POST", commandPath, {
  companyId, type: "submit-approach", expectedVersion: state.governance.version,
  approach: { approachId: "approach-v2", authorAgentId: executor.id, contentRef: "approach", contentHash: approachHashV2,
    criterionRefs: [criterion.id], evidenceRefs: [approachEvidenceRefV2], supersedesApproachId: "approach-v1", addressesFindingIds: ["approach-gap-v1"] },
}, 200, executorActor);
await setAgentWakeState(executor, "paused", false);
assert.equal(state.governance.phase, "collecting_approach_opinions");
const afterApproachV2RunIds = (await expectStatus("GET", `/api/companies/${companyId}/heartbeat-runs?limit=1000`, undefined, 200)).map((run) => run.id).sort();
assert.deepEqual(afterApproachV2RunIds, beforeApproachV2RunIds, "Corrected approach submission created an executor run");
evidence.checks.approachCorrection = {
  v1DecisionId: "direction-revise-v1",
  v1FindingId: "approach-gap-v1",
  v2ApproachId: "approach-v2",
  beforeRunIds: beforeApproachRevisionRunIds,
  afterRunIds: afterApproachV2RunIds,
  zeroExecutorRelease: true,
};

const reservationV2 = makeReservation("architecture-slot-v2", approachEvidenceRefV2, approachHashV2, approachBodyV2);
const observedV2 = await reserveAndObserve("approach-v2", reservationV2);
assert.equal(observedV2.slot.contribution.opinion.recommendation, "proceed");
evidence.checks.authenticatedOpinionBridge = {
  v1: {
    reservationId: reservationV1.reservationId,
    contributionId: observedV1.executiveContribution.contributionId,
    sessionId: observedV1.executiveContribution.sessionId,
    runId: observedV1.executiveContribution.runId,
    observedEventRef: observedV1.slot.contribution.observedEventRef,
  },
  v2: {
    reservationId: reservationV2.reservationId,
    contributionId: observedV2.executiveContribution.contributionId,
    sessionId: observedV2.executiveContribution.sessionId,
    runId: observedV2.executiveContribution.runId,
    observedEventRef: observedV2.slot.contribution.observedEventRef,
  },
};
const beforeV2ReemitRunIds = (await expectStatus("GET", `/api/companies/${companyId}/heartbeat-runs?limit=1000`, undefined, 200)).map((run) => run.id).sort();
await expectStatus("POST", commandPath, { companyId, type: "reemit-reservation", reservationId: reservationV2.reservationId }, 200);
await new Promise((resolveSettle) => setTimeout(resolveSettle, 750));
const afterV2ReemitRunIds = (await expectStatus("GET", `/api/companies/${companyId}/heartbeat-runs?limit=1000`, undefined, 200)).map((run) => run.id).sort();
assert.deepEqual(afterV2ReemitRunIds, beforeV2ReemitRunIds, "Duplicate corrected reservation created a new native run");

const beforeDirectionRuns = await expectStatus("GET", `/api/companies/${companyId}/heartbeat-runs?limit=1000`, undefined, 200);
const prearmedExecutor = await setAgentWakeState(executor, "idle", true);
assert.equal(prearmedExecutor.runtimeConfig.heartbeat.maxConcurrentRuns, 1);
assert(prearmedExecutor.runtimeConfig.heartbeat.maxDailyRuns > 0);
assert(prearmedExecutor.runtimeConfig.heartbeat.maxDailyCostCents > 0);
state = await expectStatus("POST", commandPath, {
  companyId, type: "decide-approach", expectedVersion: state.governance.version,
  decisionId: "direction-proceed-v2", approachId: "approach-v2", verdict: "proceed",
  rationale: "The bounded native evidence and attributed opinion support one executor release.",
  findingIds: ["opinion-useful-native-readback"], receiptRef: `direction:${qualificationId}`,
}, 200, reviewerActor);
assert.equal(state.governance.phase, "executing");
const direction = state.governance.approachDirections.at(-1);
assert.equal(direction.actualEffect.status, "confirmed");
assert.match(direction.actualEffect.observationRef, /^paperclip:run:/);
releaseRunId = direction.actualEffect.observationRef.slice("paperclip:run:".length);
assert(releaseRunId);
const afterDirectionRuns = await expectStatus("GET", `/api/companies/${companyId}/heartbeat-runs?limit=1000`, undefined, 200);
const directionRunDelta = afterDirectionRuns.filter((run) => !beforeDirectionRuns.some((prior) => prior.id === run.id));
assert.deepEqual(directionRunDelta.map((run) => run.id), [releaseRunId], "Approach direction must create exactly its one confirmed executor run");
assert.equal(directionRunDelta[0].agentId, executor.id);
evidence.checks.boundedRelease = {
  attemptId: direction.executionAttempt.attemptId,
  runId: releaseRunId,
  observed: true,
  executorControl: {
    status: prearmedExecutor.status,
    wakeOnDemand: prearmedExecutor.runtimeConfig.heartbeat.wakeOnDemand,
    maxConcurrentRuns: prearmedExecutor.runtimeConfig.heartbeat.maxConcurrentRuns,
    maxDailyRuns: prearmedExecutor.runtimeConfig.heartbeat.maxDailyRuns,
    maxDailyCostCents: prearmedExecutor.runtimeConfig.heartbeat.maxDailyCostCents,
  },
  automaticRunDelta: directionRunDelta.map((run) => ({ id: run.id, agentId: run.agentId, status: run.status })),
};
}

const releaseRun = await poll("released executor run", () => expectStatus("GET", `/api/heartbeat-runs/${releaseRunId}`, undefined, 200, undefined, false),
  (run) => run.status === "running" || run.status === "succeeded");
assert.equal(releaseRun.agentId, executor.id);
executorActor.runId = releaseRunId;

function prepareBundle(label) {
  const repo = resolve(syntheticRoot, `repo-${qualificationId}`);
  mkdirSync(syntheticRoot, { recursive: true, mode: 0o700 });
  if (!existsSync(resolve(repo, ".git"))) {
    mkdirSync(repo, { recursive: true, mode: 0o700 });
    git(repo, "init", "-b", "main");
    git(repo, "config", "user.name", "L03 Synthetic Fixture");
    git(repo, "config", "user.email", "l03-fixture@example.test");
    writeFileSync(resolve(repo, "result.txt"), "base\n");
    git(repo, "add", "result.txt");
    git(repo, "commit", "-m", "synthetic base");
  }
  const baseCommit = git(repo, "rev-list", "--max-parents=0", "HEAD");
  writeFileSync(resolve(repo, "result.txt"), `${label}\n`);
  git(repo, "add", "result.txt");
  git(repo, "commit", "-m", label);
  const candidateCommit = git(repo, "rev-parse", "HEAD");
  git(repo, "branch", "-f", "base", baseCommit);
  git(repo, "branch", "-f", "candidate", candidateCommit);
  const bundlePath = resolve(syntheticRoot, `${label}.bundle`);
  rmSync(bundlePath, { force: true });
  git(repo, "bundle", "create", bundlePath, "base", "candidate");
  const bytes = readFileSync(bundlePath);
  return { repo, bundlePath, bytes, baseCommit, candidateCommit, sha256: sha256(bytes) };
}
async function uploadBundle(bundle) {
  const form = new FormData();
  form.append("file", new Blob([bundle.bytes], { type: "application/octet-stream" }), "candidate.bundle");
  const response = await fetch(`${baseUrl}/api/companies/${companyId}/issues/${issueId}/attachments`, {
    method: "POST", headers: { cookie, origin: baseUrl }, body: form, signal: AbortSignal.timeout(60_000),
  });
  const body = await response.json();
  evidence.steps.push({ at: new Date().toISOString(), method: "POST", path: `/api/companies/${companyId}/issues/${issueId}/attachments`, actor: "board", status: response.status,
    response: { id: body.id ?? null, sha256: body.sha256 ?? null, byteSize: body.byteSize ?? null } });
  save();
  assert.equal(response.status, 201, JSON.stringify(body));
  assert.equal(body.sha256, bundle.sha256);
  return body;
}
async function prepareResult(label) {
  const bundle = prepareBundle(label);
  const attachment = await uploadBundle(bundle);
  const deliveryManifest = {
    repository: "https://github.com/example/l03-synthetic.git", branch: "codex/l03-synthetic",
    baseCommit: bundle.baseCommit, approvedCommit: bundle.candidateCommit,
    bundleAttachmentId: attachment.id, bundleSha256: bundle.sha256,
    deliveryWorkspacePath: syntheticRoot, assigneeAgentId: executor.id,
  };
  const documentBody = {
    title: "Delivery manifest", format: "markdown", body: JSON.stringify(deliveryManifest),
    changeSummary: `Bind exact ${label} bytes.`,
  };
  if (label === "result-v1") {
    await expectStatus("PUT", `/api/issues/${issueId}/documents/delivery-manifest`, documentBody, 201);
  } else {
    const currentManifest = await expectStatus("GET", `/api/issues/${issueId}/documents/delivery-manifest`, undefined, 200);
    await expectStatus("PUT", `/api/issues/${issueId}/documents/delivery-manifest`, {
      ...documentBody, baseRevisionId: currentManifest.latestRevisionId,
    }, 200);
  }
  const artifactRef = `attachment:${attachment.id}#sha256:${bundle.sha256}`;
  const artifacts = [{ ref: artifactRef, sha256: bundle.sha256, byteVerificationRef: artifactRef }];
  return { bundle, attachment, artifactRef, artifacts, artifactSetHash: canonicalSha256(artifacts) };
}

const resultV1 = await prepareResult("result-v1");
await waitTerminal(reviewerActor.runId);
await setAgentWakeState(reviewer, "paused", false);
const issueSubmittedV1 = await expectStatus("PATCH", `/api/issues/${issueId}`, {
  status: "done", comment: "L03 synthetic result V1 submitted for independent review.",
}, 200, executorActor);
assert.equal(issueSubmittedV1.status, "in_review");
assert.equal(issueSubmittedV1.assigneeAgentId, reviewer.id);

state = await expectStatus("POST", commandPath, {
  companyId, type: "submit-result", expectedVersion: state.governance.version,
  result: {
    resultId: "result-v1", authorAgentId: executor.id, rootIssueId: issueId, segmentIssueId: issueId,
    repository: "https://github.com/example/l03-synthetic.git", baseCommit: resultV1.bundle.baseCommit, candidateCommit: resultV1.bundle.candidateCommit,
    attachmentId: resultV1.attachment.id, sha256: resultV1.bundle.sha256,
    artifacts: resultV1.artifacts, artifactSetHash: resultV1.artifactSetHash,
    evidenceRefs: [resultV1.artifactRef], criterionRefs: [criterion.id], supersedesResultId: null, addressesFindingIds: [],
  },
}, 200, executorActor);
assert.equal(state.governance.phase, "awaiting_result_review");
releaseFixtureRun(releaseRunId);
await waitTerminal(releaseRunId);

await setAgentWakeState(reviewer, "idle", true);
const reviewerV1Run = await wake(reviewer.id, "Review exact L03 result V1", `l03-review-v1-${qualificationId}`, true);
reviewerActor.runId = reviewerV1Run.id;
const resultGap = {
  id: "result-gap-v1", class: "must_fix", criterionRef: criterion.id,
  evidenceRefs: [resultV1.artifactRef], reasons: ["The V1 payload lacks the bounded correction marker."],
  smallestUsefulAction: "Replace only result.txt with the corrected V2 marker and submit fresh bundle bytes.",
};
const beforeCorrectionRuns = await expectStatus("GET", `/api/companies/${companyId}/heartbeat-runs?limit=1000`, undefined, 200);
state = await expectStatus("POST", commandPath, {
  companyId, type: "decide-result", expectedVersion: state.governance.version,
  decisionId: "result-review-v1", resultId: "result-v1", verdict: "revise",
  rationale: "One bounded correction is required.", findings: [resultGap], receiptRef: `result-review-v1:${qualificationId}`,
}, 200, reviewerActor);
assert.equal(state.governance.phase, "result_correction_required");
releaseFixtureRun(reviewerV1Run.id);
const correctionDecision = state.governance.resultDecisions.at(-1);
assert.equal(correctionDecision.actualEffect.status, "confirmed");
assert.equal(correctionDecision.actualEffect.observationRef, `council:receipt:${correctionDecision.receiptRef}`);
const afterCorrectionRuns = await poll("native correction run identity", () =>
  expectStatus("GET", `/api/companies/${companyId}/heartbeat-runs?limit=1000`, undefined, 200, undefined, false),
  (runs) => runs.some((run) => !beforeCorrectionRuns.some((prior) => prior.id === run.id) && run.agentId === executor.id), 30_000);
const correctionRunDelta = afterCorrectionRuns.filter((run) => !beforeCorrectionRuns.some((prior) => prior.id === run.id));
assert.equal(correctionRunDelta.length, 1, "Revise decision must create exactly one native correction run");
assert.equal(correctionRunDelta[0].agentId, executor.id);
const correctionRunId = correctionRunDelta[0].id;

const currentIssue = await expectStatus("GET", `/api/issues/${issueId}`, undefined, 200);
assert.equal(currentIssue.status, "in_progress");
assert.equal(currentIssue.assigneeAgentId, executor.id);
const correctionRun = await poll("native correction executor release",
  () => expectStatus("GET", `/api/heartbeat-runs/${correctionRunId}`, undefined, 200, undefined, false),
  (run) => run.status === "running" || run.status === "succeeded", 30_000);
executorActor.runId = correctionRun.id;
evidence.checks.boundedCorrectionRelease = {
  decisionId: correctionDecision.decisionId,
  runId: correctionRunId,
  automaticRunDelta: correctionRunDelta.map((run) => ({ id: run.id, agentId: run.agentId, status: run.status })),
};
const resultV2 = await prepareResult("result-v2-corrected");
await waitTerminal(reviewerActor.runId);
await setAgentWakeState(reviewer, "paused", false);
const issueSubmittedV2 = await expectStatus("PATCH", `/api/issues/${issueId}`, {
  status: "done", comment: "L03 synthetic result V2 corrects only the required marker.",
}, 200, executorActor);
assert.equal(issueSubmittedV2.status, "in_review");

state = await expectStatus("POST", commandPath, {
  companyId, type: "submit-result", expectedVersion: state.governance.version,
  result: {
    resultId: "result-v2", authorAgentId: executor.id, rootIssueId: issueId, segmentIssueId: issueId,
    repository: "https://github.com/example/l03-synthetic.git", baseCommit: resultV2.bundle.baseCommit, candidateCommit: resultV2.bundle.candidateCommit,
    attachmentId: resultV2.attachment.id, sha256: resultV2.bundle.sha256,
    artifacts: resultV2.artifacts, artifactSetHash: resultV2.artifactSetHash,
    evidenceRefs: [resultV2.artifactRef], criterionRefs: [criterion.id], supersedesResultId: "result-v1", addressesFindingIds: [resultGap.id],
  },
}, 200, executorActor);
assert.equal(state.governance.phase, "awaiting_result_review");
releaseFixtureRun(correctionRunId);
await waitTerminal(correctionRunId);

await setAgentWakeState(reviewer, "idle", true);
const reviewerV2Run = await wake(reviewer.id, "Fresh review of exact corrected L03 result V2", `l03-review-v2-${qualificationId}`, true);
reviewerActor.runId = reviewerV2Run.id;
state = await expectStatus("POST", commandPath, {
  companyId, type: "decide-result", expectedVersion: state.governance.version,
  decisionId: "result-review-v2", resultId: "result-v2", verdict: "accept",
  rationale: "Fresh review confirms the exact corrected bundle satisfies the preserved criterion.",
  findings: [], receiptRef: `result-review-v2:${qualificationId}`,
}, 200, reviewerActor);
assert.equal(state.governance.phase, "accepted");
releaseFixtureRun(reviewerV2Run.id);
assert.equal(state.governance.results.length, 2);
assert.equal(state.governance.resultDecisions.length, 2);
assert.deepEqual(state.governance.counters, {
  envelope: { admitted: 6, limit: 6 },
  approach: { admitted: 2, limit: 2 },
  result: { admitted: 2, limit: 2 },
  consultation: { admitted: 2, limit: 2, activeReservations: 0 },
  correction: { admitted: 2, limit: 2 },
  unknownCostExposureRefs: [],
});
assert.equal(state.governance.resultDecisions.at(-1).actualEffect.status, "confirmed");
const persistedFinalList = await expectStatus("GET", `${l03Base}?companyId=${companyId}`, undefined, 200);
const persistedFinal = persistedFinalList.missions.find((entry) => entry.governance.missionId === missionId);
assert(persistedFinal, "Accepted L03 mission is missing from native plugin readback");
assert.deepEqual(persistedFinal.governance, state.governance, "Native final readback differs from the accepted command result");
state = persistedFinal;

await waitTerminal(reviewerV2Run.id);
const finalIssue = await expectStatus("GET", `/api/issues/${issueId}`, undefined, 200);
assert.equal(finalIssue.status, "done");

for (const agent of [executor, reviewer, advisor]) await setAgentWakeState(agent, "paused", false);
const finalSyntheticRuns = await expectStatus("GET", `/api/companies/${companyId}/heartbeat-runs?limit=1000`, undefined, 200);
assert(finalSyntheticRuns.every((run) => ["succeeded", "failed", "timed_out", "cancelled"].includes(run.status)), "A synthetic native run remains nonterminal");
assert.equal(finalSyntheticRuns.length, 8, "The bounded packet created an unexpected number of native runs");
assert.deepEqual(
  Object.fromEntries([executor.id, reviewer.id, advisor.id].map((agentId) => [agentId, finalSyntheticRuns.filter((run) => run.agentId === agentId).length])),
  { [executor.id]: 3, [reviewer.id]: 3, [advisor.id]: 2 },
  "Native run counts do not match the bounded executor/reviewer/advisor plan",
);
assert(finalSyntheticRuns.every((run) => run.status === "succeeded"
  || (run.status === "cancelled" && ["issue_reassigned", "task_completed"].includes(run.errorCode))),
"A provider-free native fixture run ended outside the bounded issue lifecycle");
assert(finalSyntheticRuns.every((run) => run.usageJson === null || (run.usageJson?.inputTokens === 0
  && run.usageJson?.cachedInputTokens === 0 && run.usageJson?.outputTokens === 0)), "A synthetic fixture run reported token usage");

const protectedL02After = await companyBaseline(protectedL02CompanyId);
const protectedL03After = await companyBaseline(protectedL03CompanyId);
assert.deepEqual(protectedL02After, evidence.protectedBaselines.l02, "Protected L02 company changed during qualification");
assert.deepEqual(protectedL03After, evidence.protectedBaselines.l03, "Protected real L03 company changed during qualification");
evidence.checks.protectedCompaniesPreserved = true;
evidence.checks.finalGovernance = state;
evidence.checks.finalIssue = finalIssue;
evidence.checks.syntheticRuns = finalSyntheticRuns;
evidence.checks.resultSubjects = {
  v1: { resultId: "result-v1", candidateCommit: resultV1.bundle.candidateCommit, attachmentId: resultV1.attachment.id, sha256: resultV1.bundle.sha256 },
  v2: { resultId: "result-v2", candidateCommit: resultV2.bundle.candidateCommit, attachmentId: resultV2.attachment.id, sha256: resultV2.bundle.sha256 },
};
evidence.outcome = "PASS";
evidence.finishedAt = new Date().toISOString();
save();
console.log(JSON.stringify({ outcome: evidence.outcome, evidencePath, companyId, missionId, issueId }, null, 2));
