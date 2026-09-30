#!/usr/bin/env node

import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { createAgentHireSchema, updateAgentPermissionsSchema } from "@paperclipai/shared";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const configPath = path.join(packageRoot, "config", "agent-catalog.json");
const schemaPath = path.join(packageRoot, "config", "agent-catalog.schema.json");
const packagePath = path.join(packageRoot, "package.json");

const EXPECTED_PROFILE_IDS = [
  "software-executor", "council-reviewer", "executive", "product", "architecture", "quality",
  "ux-accessibility", "security-privacy", "operations", "delivery", "economics", "strategy",
  "data-experimentation", "marketing", "sales-customer", "organization-talent",
  "legal-compliance", "board-communications",
];

const SKILL_PATHS = new Map([
  ["paperclip-executive.direct-advice", "skills/direct-advice/SKILL.md"],
  ["paperclip-executive.prepared-ticket-review", "skills/prepared-ticket-review/SKILL.md"],
  ["paperclip-executive.specialist-advisory", "skills/specialist-advisory/SKILL.md"],
  ["paperclip-executive.implementation-execution", "skills/implementation-execution/SKILL.md"],
  ["paperclip-executive.council-decision-review", "skills/council-decision-review/SKILL.md"],
  ["paperclip-executive.risk-review", "skills/risk-review/SKILL.md"],
  ["paperclip-executive.evidence-review", "skills/evidence-review/SKILL.md"],
  ["paperclip-executive.stakeholder-communication", "skills/stakeholder-communication/SKILL.md"],
]);

const ROOT_KEYS = new Set(["$schema", "schemaVersion", "catalogVersion", "sourceContract", "agents"]);
const AGENT_KEYS = new Set(["profileId", "profileVersion", "instructionsSource", "lifecycle", "nativeHireDraft", "nativePermissionPatch", "requirements", "skills"]);
const NATIVE_HIRE_KEYS = new Set(["name", "role", "title", "capabilities", "desiredSkills", "adapterType", "adapterConfig", "runtimeConfig", "budgetMonthlyCents", "permissions"]);
const NATIVE_ADAPTER_KEYS = new Set(["engine", "model", "modelReasoningEffort", "mode", "nonInteractivePermissions"]);
const LIFECYCLE_KEYS = new Set(["defaultState", "automaticProvisioning", "automaticActivation"]);
const INITIAL_PERMISSION_KEYS = new Set(["canCreateAgents", "canCreateSkills"]);
const PERMISSION_PATCH_KEYS = new Set(["canCreateAgents", "canCreateSkills", "canAssignTasks"]);
const REQUIREMENT_KEYS = new Set(["workspace", "tools", "authentication", "authorization"]);
const SKILL_KEYS = new Set(["key", "version", "assignment"]);
const NATIVE_ROLES = new Set(["ceo", "cto", "cmo", "cfo", "security", "engineer", "designer", "pm", "qa", "devops", "researcher", "general"]);
const SUPPORTED_MODEL_EFFORTS = new Map([
  ["gpt-6-astra", new Set(["medium", "high"])],
  ["gpt-6-sol", new Set(["medium", "high"])],
  ["gpt-5.6-sol", new Set(["medium", "high"])],
]);
const SKILL_OWNERS = new Map([["paperclip-executive.council-decision-review", "paperclip-council-authority-boundary"]]);

const args = new Set(process.argv.slice(2));
const configOnly = args.has("--config-only");
const selfTest = args.has("--self-test");
const failures = [];

function fail(code, detail) { failures.push(`${code}: ${detail}`); }
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function check(condition, report, code, detail) { if (!condition) report(code, detail); }

function unknownKeys(value, allowed, location, report) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    report("EXPECTED_OBJECT", location);
    return;
  }
  Object.keys(value).filter((key) => !allowed.has(key)).forEach((key) => report("UNSUPPORTED_FIELD", `${location}.${key}`));
}

function validateHeader(catalog, report) {
  unknownKeys(catalog, ROOT_KEYS, "catalog", report);
  check(catalog.schemaVersion === "paperclip-executive.agent-catalog.v1", report, "SCHEMA_VERSION", String(catalog.schemaVersion));
  check(/^\d+\.\d+\.\d+$/.test(catalog.catalogVersion ?? ""), report, "CATALOG_VERSION", String(catalog.catalogVersion));
  const expected = { repository: "paperclip", commit: "61b3fd57a695614dc4a37e2303f426a34a9795cf" };
  check(JSON.stringify(catalog.sourceContract) === JSON.stringify(expected), report, "SOURCE_CONTRACT", "expected paperclip@61b3fd57a695614dc4a37e2303f426a34a9795cf");
}

function validateProfileIds(agents, report) {
  const ids = agents.map((agent) => agent?.profileId);
  check(ids.length === EXPECTED_PROFILE_IDS.length && new Set(ids).size === ids.length, report, "PROFILE_CARDINALITY", `found ${ids.length} entries and ${new Set(ids).size} unique ids`);
  EXPECTED_PROFILE_IDS.filter((id) => !ids.includes(id)).forEach((id) => report("PROFILE_MISSING", id));
  ids.filter((id) => !EXPECTED_PROFILE_IDS.includes(id)).forEach((id) => report("PROFILE_UNKNOWN", String(id)));
}

function validateIdentity(agent, at, report) {
  unknownKeys(agent, AGENT_KEYS, at, report);
  const expectedVersion = agent.profileId === "executive" ? "1.1.0" : "1.0.0";
  check(agent.profileVersion === expectedVersion, report, "PROFILE_VERSION", `${at}: expected ${expectedVersion}`);
  check(agent.instructionsSource === `profiles/${agent.profileId}/AGENTS.md`, report, "INSTRUCTIONS_SOURCE", at);
  unknownKeys(agent.lifecycle, LIFECYCLE_KEYS, `${at}.lifecycle`, report);
  const dormant = { defaultState: "paused", automaticProvisioning: false, automaticActivation: false };
  check(JSON.stringify(agent.lifecycle) === JSON.stringify(dormant), report, "DORMANT_DEFAULT", at);
}

function nativeError(result) {
  return result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
}

function validateNativeParse(result, input, at, kind, report) {
  if (!result.success) {
    report(`NATIVE_${kind}_SCHEMA`, `${at}: ${nativeError(result)}`);
    return;
  }
  const stripped = Object.keys(input).filter((key) => !Object.hasOwn(result.data, key));
  check(stripped.length === 0, report, `NATIVE_${kind}_FIELD_STRIPPED`, `${at}: ${stripped.join(", ")}`);
}

function validateNativeHire(hire, at, report) {
  unknownKeys(hire, NATIVE_HIRE_KEYS, `${at}.nativeHireDraft`, report);
  const parsed = createAgentHireSchema.safeParse(hire);
  validateNativeParse(parsed, hire, at, "HIRE", report);
  check(NATIVE_ROLES.has(hire.role), report, "NATIVE_ROLE", `${at}: ${hire.role}`);
  check(hire.adapterType === "codex_local", report, "ADAPTER_TYPE", at);
}

function validateAdapter(hire, at, report) {
  const adapter = Object(hire.adapterConfig);
  unknownKeys(adapter, NATIVE_ADAPTER_KEYS, `${at}.nativeHireDraft.adapterConfig`, report);
  check(adapter.engine === "acp", report, "ENGINE", at);
  check(Boolean(SUPPORTED_MODEL_EFFORTS.get(adapter.model)?.has(adapter.modelReasoningEffort)), report, "MODEL_EFFORT", `${at}: ${adapter.model}/${adapter.modelReasoningEffort}`);
  check(new Set(["persistent", "oneshot"]).has(adapter.mode), report, "SESSION_MODE", at);
  check(adapter.nonInteractivePermissions === "deny", report, "NONINTERACTIVE_PERMISSIONS", at);
  const heartbeat = Object(Object(hire.runtimeConfig).heartbeat);
  check(JSON.stringify(heartbeat) === JSON.stringify({ enabled: false, wakeOnDemand: false }), report, "HEARTBEAT_DEFAULT", at);
  check(hire.budgetMonthlyCents === 0, report, "BUDGET_DEFAULT", at);
}

function validatePermissions(agent, at, report) {
  const initial = agent.nativeHireDraft?.permissions;
  const patch = agent.nativePermissionPatch;
  unknownKeys(initial, INITIAL_PERMISSION_KEYS, `${at}.nativeHireDraft.permissions`, report);
  check(JSON.stringify(initial) === JSON.stringify({ canCreateAgents: false, canCreateSkills: false }), report, "INITIAL_PERMISSIONS", at);
  unknownKeys(patch, PERMISSION_PATCH_KEYS, `${at}.nativePermissionPatch`, report);
  const parsed = updateAgentPermissionsSchema.safeParse(patch);
  validateNativeParse(parsed, patch, at, "PERMISSION", report);
  check(JSON.stringify(patch) === JSON.stringify({ canCreateAgents: false, canCreateSkills: false, canAssignTasks: false }), report, "PERMISSION_PATCH", at);
}

function validateRequirements(agent, at, report) {
  unknownKeys(agent.requirements, REQUIREMENT_KEYS, `${at}.requirements`, report);
  check(new Set(["none", "project-read-only", "isolated-project-write"]).has(agent.requirements?.workspace), report, "WORKSPACE_REQUIREMENT", at);
  ["tools", "authentication", "authorization"].filter((key) => !Array.isArray(agent.requirements?.[key]) || agent.requirements[key].length === 0).forEach((key) => report("REQUIREMENT_EMPTY", `${at}.${key}`));
}

function validateSkills(agent, at, report) {
  const refs = Array.isArray(agent.skills) ? agent.skills : [];
  const required = refs.filter((skill) => skill.assignment === "required").map((skill) => skill.key).sort();
  const desired = Array.isArray(agent.nativeHireDraft?.desiredSkills) ? [...agent.nativeHireDraft.desiredSkills].sort() : [];
  check(JSON.stringify(required) === JSON.stringify(desired), report, "DESIRED_SKILLS_MISMATCH", at);
  refs.forEach((skill) => {
    unknownKeys(skill, SKILL_KEYS, `${at}.skills`, report);
    check(SKILL_PATHS.has(skill.key), report, "SKILL_UNKNOWN", `${at}: ${skill.key}`);
    check(skill.version === "1.0.0", report, "SKILL_VERSION", `${at}: ${skill.key}@${skill.version}`);
    check(new Set(["required", "conditional"]).has(skill.assignment), report, "SKILL_ASSIGNMENT", `${at}: ${skill.key}`);
  });
}

function validateNoRuntimeMaterial(agent, at, report) {
  const serialized = JSON.stringify(agent);
  check(!/\b(?:api[_-]?key|access[_-]?token|client[_-]?secret|password)\b/i.test(serialized), report, "SECRET_MATERIAL", at);
  check(!/\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i.test(serialized), report, "RUNTIME_ID", at);
  check(!/[<{][A-Z][A-Z0-9_:-]*[>}]|\{\{[^}]+\}\}/.test(serialized), report, "PLACEHOLDER", at);
}

function validateAgent(agent, report) {
  const at = `agents.${agent?.profileId ?? "<missing>"}`;
  validateIdentity(agent, at, report);
  validateNativeHire(agent.nativeHireDraft, at, report);
  validateAdapter(agent.nativeHireDraft, at, report);
  validatePermissions(agent, at, report);
  validateRequirements(agent, at, report);
  validateSkills(agent, at, report);
  validateNoRuntimeMaterial(agent, at, report);
}

function validateCatalog(catalog, report = fail) {
  validateHeader(catalog, report);
  check(Array.isArray(catalog.agents), report, "AGENTS_ARRAY", "agents must be an array");
  const agents = Array.isArray(catalog.agents) ? catalog.agents : [];
  validateProfileIds(agents, report);
  agents.forEach((agent) => validateAgent(agent, report));
}

async function exists(file) {
  try { return (await stat(file)).isFile(); } catch { return false; }
}

function readFrontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return new Map();
  return new Map(match[1].split("\n").map((line) => line.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.+)$/)).filter(Boolean).map((parts) => [parts[1], parts[2].trim()]));
}

async function validateProfileAsset(agent) {
  const profilePath = path.join(packageRoot, agent.instructionsSource);
  const present = await exists(profilePath);
  check(present, fail, "PROFILE_FILE_MISSING", agent.instructionsSource);
  if (!present) return;
  const profile = await readFile(profilePath, "utf8");
  check(profile.length >= 700 && /^# /m.test(profile) && /^## /m.test(profile), fail, "PROFILE_TOO_THIN", agent.instructionsSource);
  check(/(must not|never|forbidden|prohibited|do not)/i.test(profile), fail, "PROFILE_AUTHORITY_BOUNDARY_MISSING", agent.instructionsSource);
}

async function validateSkillAsset([key, relative]) {
  const skillPath = path.join(packageRoot, relative);
  const present = await exists(skillPath);
  check(present, fail, "SKILL_FILE_MISSING", `${key} -> ${relative}`);
  if (!present) return;
  const skill = await readFile(skillPath, "utf8");
  const frontmatter = readFrontmatter(skill);
  const allowedOwner = SKILL_OWNERS.get(key) ?? "paperclip-executive";
  const actual = [frontmatter.get("name"), frontmatter.get("version"), frontmatter.get("owner")];
  const metadataMatches = JSON.stringify(actual) === JSON.stringify([key, "1.0.0", allowedOwner]);
  check(metadataMatches, fail, "SKILL_FRONTMATTER", relative);
  check(Boolean(frontmatter.get("source")), fail, "SKILL_SOURCE", relative);
  check(Boolean(frontmatter.get("description")), fail, "SKILL_DESCRIPTION", relative);
  check(/(stop|halt|escalat|block)/i.test(skill), fail, "SKILL_STOP_CONDITION_MISSING", relative);
}

async function validateAssets(catalog) {
  await Promise.all(catalog.agents.map(validateProfileAsset));
  await Promise.all([...SKILL_PATHS].map(validateSkillAsset));
}

async function validatePackageFiles() {
  const pkg = JSON.parse(await readFile(packagePath, "utf8"));
  const entries = new Set(pkg.files ?? []);
  const scripts = pkg.scripts;
  ["config", "profiles", "skills", "provenance", "scripts"].filter((entry) => !entries.has(entry)).forEach((entry) => fail("PACKAGE_ASSET_MISSING", entry));
  check(scripts["validate:agent-catalog"] === "node ./scripts/validate-agent-catalog.mjs", fail, "PACKAGE_SCRIPT_MISSING", "validate:agent-catalog");
  check(String(scripts.test).includes("validate:agent-catalog"), fail, "TEST_INTEGRATION_MISSING", "test must execute validate:agent-catalog");
}

function runSelfTests(catalog) {
  const cases = [
    ["duplicate profile", (copy) => copy.agents.push(clone(copy.agents[0])), "PROFILE_CARDINALITY"],
    ["automatic activation", (copy) => { copy.agents[0].lifecycle.automaticActivation = true; }, "DORMANT_DEFAULT"],
    ["native status", (copy) => { copy.agents[0].nativeHireDraft.status = "paused"; }, "UNSUPPORTED_FIELD"],
    ["unsafe bypass", (copy) => { copy.agents[0].nativeHireDraft.adapterConfig.dangerouslyBypassApprovalsAndSandbox = true; }, "UNSUPPORTED_FIELD"],
    ["missing desired skill", (copy) => { copy.agents[0].nativeHireDraft.desiredSkills = []; }, "DESIRED_SKILLS_MISMATCH"],
    ["embedded runtime id", (copy) => { copy.agents[0].requirements.authorization.push("123e4567-e89b-42d3-a456-426614174000"); }, "RUNTIME_ID"],
  ];
  for (const [name, mutate, expected] of cases) {
    const copy = clone(catalog);
    mutate(copy);
    const findings = [];
    validateCatalog(copy, (code, detail) => findings.push(`${code}: ${detail}`));
    if (!findings.some((entry) => entry.startsWith(`${expected}:`))) fail("NEGATIVE_CASE_NOT_CAUGHT", `${name} expected ${expected}`);
  }
}

const catalog = JSON.parse(await readFile(configPath, "utf8"));
const schema = JSON.parse(await readFile(schemaPath, "utf8"));
if (schema.$id !== "https://paperclip-executive.local/schemas/agent-catalog.v1.json") fail("SCHEMA_ID", String(schema.$id));
validateCatalog(catalog);
await validatePackageFiles();
if (!configOnly) await validateAssets(catalog);
if (selfTest) runSelfTests(catalog);

if (failures.length > 0) {
  console.error(`agent catalog validation failed (${failures.length})`);
  for (const finding of failures) console.error(`- ${finding}`);
  process.exitCode = 1;
} else {
  console.log(`agent catalog validation passed: ${catalog.agents.length} profiles, ${SKILL_PATHS.size} skills${configOnly ? ", config-only" : ""}${selfTest ? ", negative cases" : ""}`);
}
