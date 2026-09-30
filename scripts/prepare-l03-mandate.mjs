#!/usr/bin/env node
// Prepare dormant Council rosters, decision credentials, and exact future mission requests.
// This script does not activate a roster, create a mission, wake an agent, or invoke a provider.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const base = "http://127.0.0.1:3220";
const hostCommit = "61b3fd57a695614dc4a37e2303f426a34a9795cf";
const hostPid = 1074721;
const hostConfig = "/home/davy-lp/workspace/paperclip-executive/.paperclip-dev/instances/executive-dev/config.json";
const credentialsPath = "/home/davy-lp/workspace/paperclip-executive/.paperclip-dev/dev-owner.json";
const companyId = "ba82ae5f-292f-4c13-a02a-70ddef6cb22b";
const l02CompanyId = "331bf268-b21e-4874-9a3c-2137415c7e08";
const l02RunId = "2285549d-f090-4f92-ad46-64c2bce1d3cd";
const projectId = "fdd1f84b-cf18-4d8e-8015-2c517f6de76e";
const issueId = "a378ad22-d01b-43f7-99d8-785076310607";
const executivePluginId = "paperclip-executive.executive";
const councilPluginId = "cb1d37ab-e723-4d63-bed1-3e87442afc51";
const teamRosterId = "a95139d3-b826-4ddb-83b6-38663491048d";
const councilRosterId = "8bc68301-2979-4383-919d-dc733d155267";
const missionId = "4b91a4b3-ecf6-41ef-9de9-d2057dddc54a";
const missionCommandId = "4057ebbb-6720-4045-a557-06a8d5fe0fb8";
const governanceExpiresAt = "2026-10-07T20:00:00.000Z";
const agentIds = {
  product: "481caab0-d0b3-442b-a5f4-5fe1d6563edb",
  architecture: "63e53a4a-1c89-4490-9739-05699be031fa",
  quality: "cc0fe155-dfeb-4157-9827-4abe01c98daf",
  delivery: "ff2d8928-78f9-4f7f-9c81-af6bded5bd1e",
  economics: "80d1e926-718d-4e7a-8311-c31e09e410fd",
  "software-executor": "9acab613-9c24-45df-8f26-e600fc61d615",
  "council-reviewer": "e39b0edd-435e-4aa7-bdd5-9d29753680ff",
};
const keyName = "L03 Council decision adapter";
const secretName = "L03 Council reviewer API key";
const secretKey = "l03_council_reviewer_api_key";
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
  let result = null;
  try { result = text ? JSON.parse(text) : null; } catch { result = text; }
  if (!expected.includes(response.status)) {
    throw new Error(`${method} ${path}: HTTP ${response.status}: ${typeof result === "string" ? result : JSON.stringify(result)}`);
  }
  return result;
}
const get = (path) => request("GET", path);
const post = (path, body, expected = [200, 201]) => request("POST", path, body, expected);
const pluginPath = (suffix) => `/api/plugins/${councilPluginId}/api${suffix}`;

const health = await get("/api/health");
assert.equal(health.status, "ok");
assert.equal(health.commit, hostCommit);
assert.equal(health.deploymentMode, "authenticated");
assert.equal(health.deploymentExposure, "private");
const cmdline = readFileSync(`/proc/${hostPid}/cmdline`, "utf8").split("\0").filter(Boolean);
assert(cmdline.includes("executive-dev"));
assert(cmdline.includes(hostConfig));
assert(readFileSync(`/proc/${hostPid}/environ`, "utf8").split("\0").includes("HEARTBEAT_SCHEDULER_ENABLED=false"));
await post("/api/auth/sign-in/email", JSON.parse(readFileSync(credentialsPath, "utf8")), [200]);

const [company, project, issue, plugins, beforeAgents, beforeRuns, l02AgentsBefore, l02RunsBefore] = await Promise.all([
  get(`/api/companies/${companyId}`),
  get(`/api/projects/${projectId}`),
  get(`/api/issues/${issueId}`),
  get("/api/plugins"),
  get(`/api/companies/${companyId}/agents`),
  get(`/api/companies/${companyId}/heartbeat-runs?limit=1000`),
  get(`/api/companies/${l02CompanyId}/agents`),
  get(`/api/companies/${l02CompanyId}/heartbeat-runs?limit=1000`),
]);
assert.equal(company.status, "active");
assert(company.defaultResponsibleUserId, "Company owner must be configured");
assert.equal(project.companyId, companyId);
assert.equal(issue.companyId, companyId);
assert.equal(issue.projectId, projectId);
assert.equal(issue.parentId, null);
assert.equal(issue.assigneeAgentId, agentIds["software-executor"]);
assert.equal(issue.status, "backlog");
assert.equal(beforeRuns.length, 0);
assert.equal(l02RunsBefore.find((run) => run.id === l02RunId)?.status, "succeeded");
assert.equal(plugins.find((plugin) => plugin.id === councilPluginId)?.status, "ready");

for (const [profileId, agentId] of Object.entries(agentIds)) {
  const agent = beforeAgents.find((candidate) => candidate.id === agentId);
  assert(agent, `Missing ${profileId}`);
  assert.equal(agent.status, "paused", `${profileId} must remain paused`);
  assert.equal(agent.runtimeConfig?.heartbeat?.enabled, false);
  assert.equal(agent.runtimeConfig?.heartbeat?.wakeOnDemand, false);
}

const rosterDrafts = [
  {
    rosterId: teamRosterId,
    roster: {
      kind: "team",
      name: "L03 Budget Fixture Executor Team",
      projectId,
      members: [{ agentId: agentIds["software-executor"], responsibilities: ["software-executor"] }],
      integrationLeadAgentId: agentIds["software-executor"],
      requiredPerspectives: [],
    },
  },
  {
    rosterId: councilRosterId,
    roster: {
      kind: "council",
      name: "L03 Budget Fixture Council",
      projectId,
      members: [
        { agentId: agentIds["council-reviewer"], responsibilities: ["council-reviewer"] },
        ...["product", "architecture", "quality", "delivery", "economics"].map((profileId) => ({
          agentId: agentIds[profileId],
          responsibilities: [profileId],
        })),
      ],
      finalReviewerAgentId: agentIds["council-reviewer"],
      requiredPerspectives: ["product", "architecture", "quality", "delivery", "economics"],
    },
  },
];

let rosters = (await get(pluginPath(`/companies/${companyId}/rosters?companyId=${companyId}`))).rosters;
for (const draft of rosterDrafts) {
  let roster = rosters.find((candidate) => candidate.head.rosterId === draft.rosterId);
  if (!roster) {
    roster = await post(pluginPath(`/companies/${companyId}/rosters`), {
      companyId,
      command: "create",
      rosterId: draft.rosterId,
      roster: draft.roster,
    }, [201]);
    rosters = (await get(pluginPath(`/companies/${companyId}/rosters?companyId=${companyId}`))).rosters;
    roster = rosters.find((candidate) => candidate.head.rosterId === draft.rosterId);
  }
  const desiredContent = {
    members: draft.roster.members,
    integrationLeadAgentId: draft.roster.integrationLeadAgentId ?? null,
    finalReviewerAgentId: draft.roster.finalReviewerAgentId ?? null,
    requiredPerspectives: draft.roster.requiredPerspectives,
  };
  if (roster && JSON.stringify(roster.revision.content) !== JSON.stringify(desiredContent)) {
    await post(pluginPath(`/companies/${companyId}/rosters/${draft.rosterId}/commands`), {
      companyId,
      command: "revise",
      expectedVersion: roster.head.version,
      roster: draft.roster,
    });
    rosters = (await get(pluginPath(`/companies/${companyId}/rosters?companyId=${companyId}`))).rosters;
    roster = rosters.find((candidate) => candidate.head.rosterId === draft.rosterId);
  }
  assert(roster, `Roster readback missing: ${draft.rosterId}`);
  assert.equal(roster.head.lifecycle, "draft");
  assert.deepEqual(roster.revision.content, desiredContent);
}
const team = rosters.find((roster) => roster.head.rosterId === teamRosterId);
const council = rosters.find((roster) => roster.head.rosterId === councilRosterId);

const validation = await post(pluginPath(`/companies/${companyId}/rosters`), {
  companyId,
  command: "validate-pair",
  teamRosterId,
  councilRosterId,
});
assert.equal(validation.eligible, false, "Paused agents must prevent activation");
assert(validation.errors.some((finding) => finding.code === "agent_ineligible"));
assert.equal(team.head.lifecycle, "draft");
assert.equal(council.head.lifecycle, "draft");

// Create one standard reviewer key and move its one-time value directly into the native vault.
// If a prior run created only one side, stop: the key material cannot be recovered safely.
let keys = await get(`/api/agents/${agentIds["council-reviewer"]}/keys`);
let secrets = await get(`/api/companies/${companyId}/secrets`);
let key = keys.find((candidate) => candidate.name === keyName && !candidate.revokedAt);
let secret = secrets.find((candidate) => candidate.key === secretKey);
assert.equal(Boolean(key), Boolean(secret), "Reviewer key/secret preparation is partial; do not create a replacement blindly");
if (!key) {
  let createdKey = await post(`/api/agents/${agentIds["council-reviewer"]}/keys`, { name: keyName, scope: { kind: "standard" } }, [201]);
  let oneTimeValue = createdKey.token;
  assert.equal(typeof oneTimeValue, "string");
  assert(oneTimeValue.length > 0);
  secret = await post(`/api/companies/${companyId}/secrets`, {
    name: secretName,
    key: secretKey,
    managedMode: "paperclip_managed",
    value: oneTimeValue,
    description: "Dedicated native Council reviewer key for the isolated L03 qualification company.",
  }, [201]);
  oneTimeValue = null;
  key = { id: createdKey.id, name: createdKey.name, scope: createdKey.scope, createdAt: createdKey.createdAt, revokedAt: createdKey.revokedAt ?? null };
  createdKey = null;
}
assert(key?.id && secret?.id);

const requestedConfig = {
  apiBaseUrl: base,
  councilAgentId: agentIds["council-reviewer"],
  councilApiKey: { type: "secret_ref", secretId: secret.id, version: "latest" },
};
let config = await get(`/api/plugins/${councilPluginId}/config?companyId=${companyId}`);
if (!config) {
  await post(`/api/plugins/${councilPluginId}/config`, { companyId, configJson: requestedConfig });
  config = await get(`/api/plugins/${councilPluginId}/config?companyId=${companyId}`);
}
assert.deepEqual(config.configJson, requestedConfig);

const acceptanceCriteria = [
  { id: "roles", text: "Accept only the seven declared profile IDs." },
  { id: "per-role", text: "Permit at most two native run admissions per specialist or executor and three for the Council reviewer." },
  { id: "native-run-envelope", text: "Permit at most fourteen native run admissions overall; the initial authorized proposal uses exactly ten sends and no retry." },
  { id: "admission-allocation", text: "Refuse a plan whose admission allocation exceeds 700 cents, while treating native billed cost as authoritative and potentially higher after a run starts." },
  { id: "approach-first", text: "Require the authenticated executor approach before Council reservation." },
  { id: "specialists-after-reservation", text: "Require Council reservation before the five profile-bound specialist contributions." },
  { id: "direction-before-execution", text: "Require a favorable Council direction before executor implementation." },
  { id: "independent-result-review", text: "Require Council result review after implementation and forbid executor self-review." },
  { id: "atomic-refusal", text: "Reject invalid roles, duplicates, invalid numeric values, invalid ordering, or excess allocation with a typed refusal and no partial plan." },
];
const exclusions = [
  "No L02 resource mutation.", "No deploy or publication.", "No external API or network action.",
  "No credential or customer-data access.", "No recursive delegation, schedule, or background wake.",
  "No retry or live correction in the initial campaign.",
];
const suppliedContext = [
  `Issue ${issue.identifier}: ${issue.title}`,
  `Project ${projectId}; fixture baseline 53d784e2373cc7715da1c86e34dfbc6fe8795322.`,
  ...acceptanceCriteria.map((criterion) => `${criterion.id}: ${criterion.text}`),
  ...exclusions.map((exclusion) => `Exclusion: ${exclusion}`),
].join("\n");
const contextHash = sha256(suppliedContext);
const missionRequest = {
  companyId,
  command: "create",
  commandId: missionCommandId,
  missionId,
  rootIssueId: issueId,
  projectId,
  teamRosterId,
  teamRevision: team.revision.revision,
  councilRosterId,
  councilRevision: council.revision.revision,
  mandate: {
    objective: "Implement and independently review the deterministic L03 campaign budget allocator in the isolated fixture.",
    acceptanceCriteria: acceptanceCriteria.map((criterion) => `${criterion.id}: ${criterion.text}`),
    commitments: [
      "Initial campaign: ten native agent runs/sends in the prepared order, with no retry.",
      "Before each approved send, patch only the exact role to wakeOnDemand true while heartbeat.enabled remains false, read back the patch and an empty queued-wake state, then restore wakeOnDemand false and pause the role immediately after terminal outcome or stop.",
      "Any unexpected native run counts against the ten-run initial campaign and stops further dispatch; it is never replaced with a hidden extra run.",
      "A native run may contain multiple provider turns or requests; provider request count is not hard bounded by codex_local.",
      "The 700-cent figure is an admission allocation, not an enforceable billed-cost ceiling.",
      "Any uncertain outcome, timeout, missing skill mount, provider/auth failure, stale state, or safety mismatch stops the campaign.",
    ],
    limits: {
      taskPolicy: "Exactly ten native agent runs/sends for the initial campaign, including any unexpected native run; no retry, hidden replacement, or live correction. Enable wakeOnDemand only JIT for the exact authorized role and restore false plus paused immediately after terminal outcome or stop.",
      periodPolicy: "One manually released qualification campaign before the governance expiry; reconcile after every terminal run.",
      correctionLimit: 1,
      elapsedMinutes: 1440,
    },
  },
};
const governanceRequest = {
  companyId,
  missionId,
  expectedMissionVersion: 1,
  mandateRevision: 1,
  executorAgentId: agentIds["software-executor"],
  finalReviewerAgentId: agentIds["council-reviewer"],
  councilAgentId: agentIds["council-reviewer"],
  executivePluginActorId: executivePluginId,
  expiresAt: governanceExpiresAt,
  ticket: {
    issueId,
    sourceRef: `/api/issues/${issueId}`,
    sourceVersion: issue.updatedAt,
    sourceHash: contextHash,
    suppliedContext: { sourceRef: `prepared:l03:${missionId}`, sourceHash: contextHash, content: suppliedContext },
    criteria: acceptanceCriteria,
    exclusions,
  },
  limits: { envelope: 14, approach: 2, result: 2, consultation: 5, correction: 1 },
};
const activationRequest = {
  companyId,
  command: "activate-pair",
  teamRosterId,
  teamExpectedVersion: team.head.version,
  councilRosterId,
  councilExpectedVersion: council.head.version,
};

const [afterAgents, afterRuns, missionList, rosterReadTeam, rosterReadCouncil, secretUsage, l02AgentsAfter, l02RunsAfter] = await Promise.all([
  get(`/api/companies/${companyId}/agents`),
  get(`/api/companies/${companyId}/heartbeat-runs?limit=1000`),
  get(pluginPath(`/companies/${companyId}/missions?companyId=${companyId}`)),
  get(pluginPath(`/companies/${companyId}/rosters/${teamRosterId}?companyId=${companyId}`)),
  get(pluginPath(`/companies/${companyId}/rosters/${councilRosterId}?companyId=${companyId}`)),
  get(`/api/secrets/${secret.id}/usage`),
  get(`/api/companies/${l02CompanyId}/agents`),
  get(`/api/companies/${l02CompanyId}/heartbeat-runs?limit=1000`),
]);
assert.equal(afterRuns.length, 0);
assert.equal(missionList.missions.length, 0);
for (const agent of afterAgents.filter((candidate) => Object.values(agentIds).includes(candidate.id))) {
  assert.equal(agent.status, "paused");
  assert.equal(agent.runtimeConfig?.heartbeat?.enabled, false);
  assert.equal(agent.runtimeConfig?.heartbeat?.wakeOnDemand, false);
}
assert.equal(rosterReadTeam.roster.head.lifecycle, "draft");
assert.equal(rosterReadCouncil.roster.head.lifecycle, "draft");
assert.deepEqual(
  l02AgentsAfter.map((agent) => [agent.id, agent.status]).sort(),
  l02AgentsBefore.map((agent) => [agent.id, agent.status]).sort(),
);
assert.deepEqual(
  l02RunsAfter.map((run) => [run.id, run.status]).sort(),
  l02RunsBefore.map((run) => [run.id, run.status]).sort(),
);

const evidence = {
  observedAt: new Date().toISOString(),
  host: { base, commit: hostCommit, pid: hostPid, instance: "executive-dev", schedulerEnabled: false },
  company: { id: companyId, ownerUserId: company.defaultResponsibleUserId },
  project: { id: projectId },
  rootIssue: { id: issueId, identifier: issue.identifier, status: issue.status, assigneeAgentId: issue.assigneeAgentId },
  rosters: {
    team: { ...rosterReadTeam.roster, history: rosterReadTeam.history },
    council: { ...rosterReadCouncil.roster, history: rosterReadCouncil.history },
    validation,
    activationAttempted: false,
    activationRequest,
    profileIdCorrection: {
      reason: "Runtime matching requires bare catalogue profile IDs; prefixed profile.* values are invalid.",
      supersededTeamRevision: "00012858-ed3c-4560-b855-9cc0c824a118",
      supersededCouncilRevision: "fd0f5a0e-32a8-44ff-8827-2df128cfd969",
      currentTeamRevision: rosterReadTeam.roster.revision.revision,
      currentCouncilRevision: rosterReadCouncil.roster.revision.revision,
      priorRevisionsPreservedInHistory: true,
    },
  },
  councilCredential: {
    agentKey: { id: key.id, name: key.name, scope: key.scope, revokedAt: key.revokedAt ?? null },
    secret: { id: secret.id, name: secret.name, key: secret.key, provider: secret.provider, managedMode: secret.managedMode, latestVersion: secret.latestVersion },
    secretUsage,
    rawValueRetained: false,
    recovery: {
      revokedOrphanKeyId: "85bf0b20-485d-40f5-98b5-16ffb02a26d9",
      reason: "The first local preparation attempt created the key but stopped before secret creation after reading the wrong one-time response field; readback proved no secret existed, so that isolated key was revoked before one replacement was created.",
    },
  },
  councilConfig: { pluginId: councilPluginId, readback: config, secretRefVerified: true },
  preparedRequests: {
    activation: activationRequest,
    mission: missionRequest,
    governance: governanceRequest,
    submitted: { activation: false, mission: false, governance: false },
  },
  campaignBoundary: {
    initialNativeAgentRunsOrSends: 10,
    retryPolicy: "none",
    futureGovernanceEnvelope: 14,
    admissionAllocationCents: 700,
    billedCostHardCap: false,
    providerRequestHardBound: false,
    providerRequestReason: "codex_local exposes a wall-clock timeout but no max-turn or provider-request limit; one native run can contain multiple model turns or requests.",
  },
  state: { agentsPaused: true, triggersEnabled: false, l03RunCount: afterRuns.length, missionCount: missionList.missions.length, providerCalls: 0 },
  l02Preserved: { companyId: l02CompanyId, completedRunId: l02RunId, agentIds: l02AgentsAfter.map((agent) => agent.id).sort() },
  proofBoundary: "Draft/configured/request-ready is not activated, executed, provider-authenticated, skill-mounted, or model-run proof.",
};
writeFileSync(resolve(root, "docs/evidence/l03-mandate.json"), JSON.stringify(evidence, null, 2) + "\n");
console.log(JSON.stringify({
  companyId,
  teamRosterId,
  teamRevision: team.revision.revision,
  councilRosterId,
  councilRevision: council.revision.revision,
  councilSecretId: secret.id,
  councilConfigReady: true,
  activationAttempted: false,
  missionSubmitted: false,
  governanceSubmitted: false,
  l03RunCount: afterRuns.length,
  providerCalls: 0,
}, null, 2));
