#!/usr/bin/env node
// Exercise only an existing completed request; never generate a new request key.
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const home = resolve(root, ".paperclip-dev");
const [mode, contributionId] = process.argv.slice(2);
assert(["capture", "replay", "verify"].includes(mode) && contributionId, "Usage: node scripts/qualify-l02.mjs capture|replay|verify <existing-contribution-id>");
const setup = JSON.parse(readFileSync(resolve(home, "setup-result.json"), "utf8"));
const base = "http://127.0.0.1:3220";
assert.equal(setup.baseUrl, base);
let cookie = "";
async function request(path, body) {
  const response = await fetch(base + path, {
    method: body === undefined ? "GET" : "POST",
    headers: { cookie, origin: base, "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(30_000),
  });
  if (response.headers.getSetCookie().length) cookie = response.headers.getSetCookie().map(v => v.split(";", 1)[0]).join("; ");
  return { status: response.status, body: await response.json() };
}
async function ok(path, body) {
  const result = await request(path, body);
  assert.equal(result.status, 200, `${path}: HTTP ${result.status}`);
  return result.body;
}
await ok("/api/auth/sign-in/email", JSON.parse(readFileSync(resolve(home, "dev-owner.json"), "utf8")));
const scope = { companyId: setup.companyId, params: { companyId: setup.companyId } };
const dataPath = `/api/plugins/${setup.pluginId}/data/advice-state`;
async function snapshot() {
  const state = (await ok(dataPath, scope)).data;
  const contribution = state.contributions.find(c => c.contributionId === contributionId);
  assert(contribution, "Existing contribution must be readable before any replay");
  assert.equal(contribution.status, "completed");
  const run = await ok(`/api/heartbeat-runs/${contribution.runId}`);
  assert.equal(run.status, "succeeded");
  assert.equal(run.agentId, contribution.contributor.agentId);
  const issue = await ok(`/api/issues/${contribution.issue.id}`);
  const agents = await ok(`/api/companies/${setup.companyId}/agents`);
  const executor = agents.find(a => a.id === contribution.issue.executorAgentId);
  assert.equal(executor?.status, "paused", "Qualification must not start the executor");
  const runs = await ok(`/api/companies/${setup.companyId}/heartbeat-runs?limit=1000`);
  assert(runs.length < 1000, "Run comparison would be truncated");
  assert(!runs.some(r => ["running", "queued"].includes(r.status)), "Wait for active company runs before qualification/restart");
  return {
    contribution, contributionIds: state.contributions.map(c => c.contributionId).sort(),
    runIds: runs.map(r => r.id).sort(), runStatus: run.status,
    issue: { id: issue.id, status: issue.status, assigneeAgentId: issue.assigneeAgentId, updatedAt: issue.updatedAt, executionPolicy: issue.executionPolicy },
    executorStatus: executor.status,
  };
}
const before = await snapshot();
const baselinePath = resolve(home, `l02-${contributionId}.before.json`);
if (mode !== "verify") {
  const c = before.contribution;
  const params = {
    requestKey: c.requestKey, issueId: c.issue.id, contributorAgentId: c.contributor.agentId,
    sourceReference: c.source.reference, objective: c.source.objective,
    acceptanceCriteria: c.source.acceptanceCriteria, exclusions: c.source.exclusions, dependencies: c.source.dependencies,
    approach: c.approach.summary, evidenceReferences: c.approach.evidenceReferences,
    decisiveUnknowns: c.approach.decisiveUnknowns, constraints: c.approach.constraints,
  };
  if (mode === "capture") {
    writeFileSync(baselinePath, JSON.stringify(before, null, 2) + "\n", { mode: 0o600, flag: "wx" });
  } else {
    assert.deepEqual(before, JSON.parse(readFileSync(baselinePath, "utf8")), "Replay must use the preserved baseline");
  }
  const actionPath = `/api/plugins/${setup.pluginId}/actions/submit-contribution`;
  const repeated = (await ok(actionPath, { companyId: setup.companyId, params })).data;
  assert.deepEqual(repeated, c, "Duplicate must return the unchanged persisted contribution");
  const conflict = await request(actionPath, { companyId: setup.companyId, params: { ...params, approach: params.approach + "\nQualification check: modified approach." } });
  assert.equal(conflict.status, 502);
  assert.match(JSON.stringify(conflict.body), /different captured input/);
  assert.deepEqual(await snapshot(), before, "Duplicate/conflict must preserve contribution, issue, and run set");
} else {
  assert.deepEqual(before, JSON.parse(readFileSync(baselinePath, "utf8")), "Readback must survive restart without a new run");
}
const result = { checkedAt: new Date().toISOString(), mode, contributionId, runId: before.contribution.runId, runCount: before.runIds.length, status: "pass" };
writeFileSync(resolve(home, `l02-${contributionId}.${mode}.json`), JSON.stringify(result, null, 2) + "\n", { mode: 0o600 });
console.log(JSON.stringify(result, null, 2));
