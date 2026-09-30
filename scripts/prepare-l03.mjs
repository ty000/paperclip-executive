#!/usr/bin/env node
// Prepare the isolated L03 qualification company. This script never invokes an agent or provider.
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
const l02CompanyId = "331bf268-b21e-4874-9a3c-2137415c7e08";
const l02RunId = "2285549d-f090-4f92-ad46-64c2bce1d3cd";
const companyName = "Executive L03 Qualification 2026-09-30";
const companyDescription = "Isolated dormant L03 real-campaign qualification space; no automatic triggers or provider calls.";
const selectedProfiles = [
  "product", "architecture", "quality", "delivery", "economics",
  "software-executor", "council-reviewer",
];
const requiredSkillKeys = [
  "paperclip-executive.specialist-advisory",
  "paperclip-executive.evidence-review",
  "paperclip-executive.implementation-execution",
  "paperclip-executive.council-decision-review",
];
const expectedModels = new Set(["gpt-5.6-sol", "gpt-6-sol", "gpt-6-astra"]);
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
const get = (path) => request("GET", path, undefined, [200]);
const post = (path, body, expected = [200, 201]) => request("POST", path, body, expected);
const patch = (path, body, expected = [200]) => request("PATCH", path, body, expected);

function asList(value) {
  if (Array.isArray(value)) return value;
  for (const key of ["items", "skills", "data", "results"]) if (Array.isArray(value?.[key])) return value[key];
  throw new Error("Expected a list response");
}

function skillKey(skill) {
  return skill.key ?? skill.slug ?? skill.name;
}

function publicSkill(skill) {
  return {
    id: skill.id,
    key: skillKey(skill),
    name: skill.name ?? null,
    version: skill.version ?? skill.currentVersion?.version ?? null,
    sourceType: skill.sourceType ?? null,
    sourceLocator: skill.sourceLocator ?? skill.source ?? null,
    contentHash: skill.contentHash ?? skill.currentVersion?.contentHash ?? null,
    currentVersionId: skill.currentVersionId ?? skill.currentVersion?.id ?? null,
  };
}

async function readAgent(agentId) {
  const [detail, configuration, bundle, instructions, skills] = await Promise.all([
    get(`/api/agents/${agentId}`),
    get(`/api/agents/${agentId}/configuration`),
    get(`/api/agents/${agentId}/instructions-bundle`),
    get(`/api/agents/${agentId}/instructions-bundle/file?path=AGENTS.md`),
    get(`/api/agents/${agentId}/skills`),
  ]);
  return {
    id: agentId,
    name: configuration.name,
    status: configuration.status,
    profileId: detail.metadata?.profileId ?? null,
    adapterType: configuration.adapterType,
    adapterConfig: configuration.adapterConfig,
    runtimeConfig: configuration.runtimeConfig,
    budgetMonthlyCents: detail.budgetMonthlyCents,
    permissions: detail.permissions,
    bundle: {
      mode: bundle.mode,
      entryFile: bundle.entryFile,
      revisionId: instructions.revisionId ?? null,
      hash: instructions.hash ?? sha256(instructions.content ?? ""),
      contentSha256: sha256(instructions.content ?? ""),
    },
    skills: {
      adapterType: skills.adapterType,
      supported: skills.supported,
      mode: skills.mode,
      desiredSkills: skills.desiredSkills,
      desiredSkillEntries: skills.desiredSkillEntries,
      entries: (skills.entries ?? []).filter((entry) => entry.desired || entry.key.startsWith("company/")),
      warnings: skills.warnings ?? [],
    },
  };
}

const health = await get("/api/health");
assert.equal(health.status, "ok");
assert.equal(health.commit, hostCommit);
assert.equal(health.deploymentMode, "authenticated");
assert.equal(health.deploymentExposure, "private");
const cmdline = readFileSync(`/proc/${hostPid}/cmdline`, "utf8").split("\0").filter(Boolean);
assert(cmdline.includes("executive-dev"), "Runtime process is not the executive-dev instance");
assert(cmdline.includes(hostConfig), "Runtime process does not use the expected config");
const processEnv = readFileSync(`/proc/${hostPid}/environ`, "utf8").split("\0");
assert(processEnv.includes("HEARTBEAT_SCHEDULER_ENABLED=false"), "Scheduler must remain disabled");
const config = JSON.parse(readFileSync(hostConfig, "utf8"));
assert.equal(config.server.bind, "loopback");
assert.equal(config.server.port, 3220);

await post("/api/auth/sign-in/email", JSON.parse(readFileSync(credentialsPath, "utf8")), [200]);

const beforeCompanies = await get("/api/companies");
const l02Company = beforeCompanies.find((company) => company.id === l02CompanyId);
assert.equal(l02Company?.name, "Executive Dev", "L02 company identity changed");
const [l02AgentsBefore, l02RunsBefore] = await Promise.all([
  get(`/api/companies/${l02CompanyId}/agents`),
  get(`/api/companies/${l02CompanyId}/heartbeat-runs?limit=1000`),
]);
const preservedL02Run = l02RunsBefore.find((run) => run.id === l02RunId);
assert.equal(preservedL02Run?.status, "succeeded", "L02 run must remain completed");

let company = beforeCompanies.find((candidate) => candidate.name === companyName);
let companyCreated = false;
if (!company) {
  company = await post("/api/companies", {
    name: companyName,
    description: companyDescription,
    budgetMonthlyCents: 700,
  }, [201]);
  companyCreated = true;
} else {
  assert.equal(company.description, companyDescription, "Refusing ambiguous same-name L03 company");
}
assert.notEqual(company.id, l02CompanyId);
assert.equal(company.requireBoardApprovalForNewAgents, false);

const [modelInventory, adapterDoc, pluginList] = await Promise.all([
  get(`/api/companies/${company.id}/adapters/codex_local/models`),
  get("/api/llms/agent-configuration/codex_local.txt"),
  get("/api/plugins"),
]);
const advertisedModels = new Set(asList(modelInventory).map((model) => model.id ?? model.name));
for (const model of expectedModels) assert(advertisedModels.has(model), `Catalogue model not advertised: ${model}`);
assert.match(String(adapterDoc), /codex_local/i);

const catalog = JSON.parse(readFileSync(resolve(root, "packages/executive/config/agent-catalog.json"), "utf8"));
assert.equal(catalog.catalogVersion, "1.0.0");
assert.equal(catalog.sourceContract.commit, hostCommit);
const profiles = selectedProfiles.map((profileId) => {
  const profile = catalog.agents.find((candidate) => candidate.profileId === profileId);
  assert(profile, `Missing catalogue profile: ${profileId}`);
  return profile;
});

let companySkills = asList(await get(`/api/companies/${company.id}/skills`));
const importedSkills = [];
const sourceToCompanySkillKey = new Map();
for (const key of requiredSkillKeys) {
  const folder = key.slice("paperclip-executive.".length);
  const expectedContent = readFileSync(resolve(root, "packages/executive/skills", folder, "SKILL.md"), "utf8");
  let skill = companySkills.find((candidate) => candidate.slug === folder);
  if (!skill) {
    skill = await post(`/api/companies/${company.id}/skills`, {
      idempotencyKey: `l03-catalog-${catalog.catalogVersion}-${folder}`,
      name: key,
      slug: folder,
      description: `Exact Paperclip Executive ${key}@1.0.0 source for the isolated L03 qualification campaign.`,
      markdown: expectedContent,
    }, [201]);
    companySkills = asList(await get(`/api/companies/${company.id}/skills`));
    skill = companySkills.find((candidate) => candidate.id === skill.id);
  }
  assert(skill, `Required skill was not imported: ${key}`);
  const detail = await get(`/api/companies/${company.id}/skills/${skill.id}`);
  const skillFile = await get(`/api/companies/${company.id}/skills/${skill.id}/files?path=SKILL.md`);
  const observedContent = skillFile.content ?? "";
  assert(observedContent.includes(`name: ${key}`), `Imported content mismatch for ${key}`);
  assert.equal(sha256(observedContent), sha256(expectedContent), `Imported bytes differ for ${key}`);
  sourceToCompanySkillKey.set(key, detail.key);
  importedSkills.push({ catalogKey: key, ...publicSkill(detail), sourceContentSha256: sha256(expectedContent), observedContentSha256: sha256(observedContent) });
}

let companyAgents = await get(`/api/companies/${company.id}/agents`);
const preparedAgents = [];
for (const profile of profiles) {
  let agent = companyAgents.find((candidate) => candidate.metadata?.profileId === profile.profileId);
  const requiredKeys = profile.skills.filter((skill) => skill.assignment === "required").map((skill) => skill.key);
  assert(requiredKeys.every((key) => requiredSkillKeys.includes(key)), `Unexpected required skill for ${profile.profileId}`);
  const instructionContent = readFileSync(resolve(root, "packages/executive", profile.instructionsSource), "utf8");
  const draft = structuredClone(profile.nativeHireDraft);
  assert.equal(draft.adapterType, "codex_local");
  assert(advertisedModels.has(draft.adapterConfig.model), `Model is not advertised for ${profile.profileId}`);
  const timeoutSec = profile.profileId === "council-reviewer" ? 600 : 300;
  const maxDailyRuns = profile.profileId === "council-reviewer" ? 3 : 2;
  draft.adapterConfig.timeoutSec = timeoutSec;
  draft.desiredSkills = requiredKeys.map((key) => {
    const mapped = sourceToCompanySkillKey.get(key);
    assert(mapped, `No company-library mapping for ${key}`);
    return mapped;
  });
  draft.instructionsBundle = { entryFile: "AGENTS.md", files: { "AGENTS.md": instructionContent } };
  draft.runtimeConfig = {
    ...draft.runtimeConfig,
    heartbeat: {
      enabled: false,
      wakeOnDemand: false,
      maxConcurrentRuns: 1,
      maxDailyRuns,
      maxDailyCostCents: 100,
    },
  };
  draft.budgetMonthlyCents = 100;
  draft.permissions = { canCreateAgents: false, canCreateSkills: false };
  draft.metadata = {
    qualification: "L03",
    profileId: profile.profileId,
    profileVersion: profile.profileVersion,
    catalogVersion: catalog.catalogVersion,
  };
  if (!agent) {
    const hired = await post(`/api/companies/${company.id}/agent-hires`, draft, [200, 201]);
    agent = hired.agent;
    assert(agent?.id, `Hire response missing agent for ${profile.profileId}`);
    if (agent.status === "idle") {
      agent = await post(`/api/agents/${agent.id}/pause`, undefined, [200]);
    } else {
      assert.equal(agent.status, "pending_approval", `Unexpected hire status for ${profile.profileId}`);
    }
    companyAgents = await get(`/api/companies/${company.id}/agents`);
  }
  assert.equal(agent.name, draft.name);
  assert(["paused", "pending_approval"].includes(agent.status), `${profile.profileId} is not dormant`);
  if (
    agent.adapterConfig?.timeoutSec !== timeoutSec ||
    agent.runtimeConfig?.heartbeat?.maxDailyCostCents !== 100 ||
    agent.runtimeConfig?.heartbeat?.maxDailyRuns !== maxDailyRuns ||
    agent.runtimeConfig?.heartbeat?.maxConcurrentRuns !== 1
  ) {
    agent = await patch(`/api/agents/${agent.id}`, {
      adapterConfig: { timeoutSec },
      runtimeConfig: draft.runtimeConfig,
    });
  }
  if (agent.permissions?.canAssignTasks !== false) {
    await patch(`/api/agents/${agent.id}/permissions`, {
      canCreateAgents: false,
      canCreateSkills: false,
      canAssignTasks: false,
    });
  }
  const readback = await readAgent(agent.id);
  assert.equal(readback.adapterType, draft.adapterType);
  assert.equal(readback.adapterConfig.model, draft.adapterConfig.model);
  assert.equal(readback.adapterConfig.modelReasoningEffort, draft.adapterConfig.modelReasoningEffort);
  assert.equal(readback.runtimeConfig.heartbeat.enabled, false);
  assert.equal(readback.runtimeConfig.heartbeat.wakeOnDemand, false);
  assert.equal(readback.runtimeConfig.heartbeat.maxConcurrentRuns, 1);
  assert.equal(readback.runtimeConfig.heartbeat.maxDailyRuns, maxDailyRuns);
  assert.equal(readback.runtimeConfig.heartbeat.maxDailyCostCents, 100);
  assert.equal(readback.adapterConfig.timeoutSec, timeoutSec);
  assert.equal(readback.budgetMonthlyCents, 100);
  assert.equal(readback.permissions.canCreateAgents, false);
  assert.equal(readback.permissions.canCreateSkills, false);
  assert.equal(readback.permissions.canAssignTasks, false);
  assert.equal(readback.bundle.contentSha256, sha256(instructionContent));
  for (const desiredKey of draft.desiredSkills) {
    assert(readback.skills.desiredSkills.includes(desiredKey), `Desired skill missing for ${profile.profileId}: ${desiredKey}`);
    assert(readback.skills.entries.some((entry) => entry.key === desiredKey && entry.desired && entry.state === "configured"), `Configured skill snapshot missing for ${profile.profileId}: ${desiredKey}`);
  }
  preparedAgents.push({
    profileId: profile.profileId,
    profileVersion: profile.profileVersion,
    source: profile.instructionsSource,
    sourceContentSha256: sha256(instructionContent),
    requiredSkills: requiredKeys.map((key) => ({ catalogKey: key, companyKey: sourceToCompanySkillKey.get(key) })),
    ...readback,
  });
}

const [l02AgentsAfter, l02RunsAfter, l03Runs, l03AgentsAfter] = await Promise.all([
  get(`/api/companies/${l02CompanyId}/agents`),
  get(`/api/companies/${l02CompanyId}/heartbeat-runs?limit=1000`),
  get(`/api/companies/${company.id}/heartbeat-runs?limit=1000`),
  get(`/api/companies/${company.id}/agents`),
]);
assert.deepEqual(l02AgentsAfter.map((agent) => agent.id).sort(), l02AgentsBefore.map((agent) => agent.id).sort(), "L02 agent set changed");
assert.deepEqual(l02RunsAfter.map((run) => run.id).sort(), l02RunsBefore.map((run) => run.id).sort(), "L02 run set changed");
assert.equal(l02RunsAfter.find((run) => run.id === l02RunId)?.status, "succeeded");
assert.equal(l03Runs.length, 0, "L03 preparation must not create model runs");
assert.equal(l03AgentsAfter.length, selectedProfiles.length);

const executivePlugin = pluginList.find((plugin) => plugin.id === "2f5ead19-69e1-4065-9fe4-93bd7699e510");
assert(executivePlugin, "Executive plugin is not installed");
assert.equal(executivePlugin.status, "ready");
const evidence = {
  schemaVersion: "paperclip-executive.l03-preparation.v1",
  checkedAt: new Date().toISOString(),
  operation: "prepare isolated dormant L03 company, skills, and seven agent profiles without provider calls",
  authorization: {
    instance: "executive-dev",
    baseUrl: base,
    actorUserId: "KaI1pP8ivXcLOjTFmIYwWwCDqehxzXRZ",
    modelProviderCallsAuthorized: false,
    automaticTriggersAuthorized: false,
  },
  runtime: {
    pid: hostPid,
    configPath: hostConfig,
    hostCommit,
    deploymentMode: health.deploymentMode,
    deploymentExposure: health.deploymentExposure,
    schedulerEnabled: false,
  },
  preservation: {
    l02CompanyId,
    l02RunId,
    l02RunStatus: "succeeded",
    agentIdsBefore: l02AgentsBefore.map((agent) => agent.id).sort(),
    agentIdsAfter: l02AgentsAfter.map((agent) => agent.id).sort(),
    runIdsBefore: l02RunsBefore.map((run) => run.id).sort(),
    runIdsAfter: l02RunsAfter.map((run) => run.id).sort(),
    unchanged: true,
  },
  plugin: {
    id: executivePlugin.id,
    version: executivePlugin.manifestJson.version,
    status: executivePlugin.status,
    candidateInstallOrUpgradeAttempted: false,
  },
  company: {
    id: company.id,
    name: company.name,
    description: company.description,
    createdForThisPreparation: true,
    createdDuringThisInvocation: companyCreated,
    status: company.status,
    budgetMonthlyCents: company.budgetMonthlyCents,
    requireBoardApprovalForNewAgents: company.requireBoardApprovalForNewAgents,
  },
  catalogue: {
    path: "packages/executive/config/agent-catalog.json",
    version: catalog.catalogVersion,
    sourceContract: catalog.sourceContract,
    selectedProfiles,
  },
  modelInventory: asList(modelInventory).map((model) => ({ id: model.id ?? model.name, label: model.label ?? null })),
  skills: importedSkills,
  operationLedger: [
    {
      operation: "local-path skill import from the L03 source worktree",
      result: "denied before skill creation",
      httpStatus: 403,
      code: "skill_workspace_boundary_denied",
      recovery: "Used the supported company managed-skill creation endpoint with the exact source markdown and idempotency keys; no retry of the denied import was attempted.",
    },
    {
      operation: "company managed-skill creation and agent provisioning",
      result: "verified by native readback",
      resources: "four exact skills and seven paused agents",
    },
  ],
  agents: preparedAgents,
  runReadback: { count: l03Runs.length, runs: [] },
  evidenceLayers: {
    declared: "verified",
    installed: `verified for the four company-library skills and current Executive plugin ${executivePlugin.manifestJson.version}; this script performed no plugin install or upgrade`,
    desired: "verified from each agent configuration and skill snapshot",
    loaded: "unverified without an authorized adapter run; library and desired state only",
    activated: "false: all agents paused or pending approval and heartbeat triggers disabled",
    executed: "false: zero L03 runs and no provider call was authorized",
  },
  unresolved: [
    "Actual Codex profile skill mount and provider authentication remain unverified until a separately authorized run.",
  ],
};
writeFileSync(resolve(root, "docs/evidence/l03-preparation.json"), JSON.stringify(evidence, null, 2) + "\n");
console.log(JSON.stringify({ status: "prepared", companyId: company.id, companyName: company.name, agentIds: preparedAgents.map((agent) => ({ profileId: agent.profileId, id: agent.id, status: agent.status })), skillKeys: importedSkills.map((skill) => skill.key), runCount: 0 }, null, 2));
