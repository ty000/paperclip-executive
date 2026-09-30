#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFileSync, renameSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = "/home/davy-lp/.codex/worktrees/executive-l03/paperclip-executive";
const baseUrl = "http://127.0.0.1:3220";
const sourcePath = resolve(root, "docs/evidence/l03-host-run.json");
const targetPath = resolve(root, `docs/evidence/l03-host-${process.argv[2] ?? "attempt3"}.json`);
const failureCode = process.argv[3] ?? "expired_invocation_scope_on_observation_emit";
const credentialPath = "/home/davy-lp/workspace/paperclip-executive/.paperclip-dev/dev-owner.json";
const protectedIds = {
  l02: "331bf268-b21e-4874-9a3c-2137415c7e08",
  l03: "ba82ae5f-292f-4c13-a02a-70ddef6cb22b",
};

const evidence = JSON.parse(readFileSync(sourcePath, "utf8"));
assert.equal(evidence.outcome, "RUNNING");
assert(evidence.synthetic?.companyId && evidence.synthetic?.missionId && evidence.synthetic?.agents);
let cookie = "";

function compact(path, value) {
  if (path.startsWith("/api/auth/")) return { userId: value?.user?.id ?? null };
  if (path.includes("/heartbeat-runs")) {
    const runs = Array.isArray(value) ? value : [value];
    return runs.filter(Boolean).map((run) => ({
      id: run.id, agentId: run.agentId, status: run.status,
      inputTokens: run.usageJson?.inputTokens ?? null,
      outputTokens: run.usageJson?.outputTokens ?? null,
      cachedInputTokens: run.usageJson?.cachedInputTokens ?? null,
      errorCode: run.errorCode ?? null,
    }));
  }
  if (path.includes("/agents/")) {
    return { id: value?.id ?? null, status: value?.status ?? null, wakeOnDemand: value?.runtimeConfig?.heartbeat?.wakeOnDemand ?? null };
  }
  return value;
}

async function request(method, path, body) {
  const headers = { origin: baseUrl };
  if (cookie) headers.cookie = cookie;
  if (body !== undefined) headers["content-type"] = "application/json";
  const response = await fetch(baseUrl + path, {
    method, headers, body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(60_000),
  });
  if (response.headers.getSetCookie().length) {
    cookie = response.headers.getSetCookie().map((entry) => entry.split(";", 1)[0]).join("; ");
  }
  const text = await response.text();
  let value;
  try { value = text ? JSON.parse(text) : null; } catch { value = text; }
  evidence.steps.push({ at: new Date().toISOString(), method, path, actor: "board", status: response.status, response: compact(path, value) });
  writeFileSync(sourcePath, `${JSON.stringify(evidence, null, 2)}\n`, { mode: 0o600 });
  assert.equal(response.status, 200, `${method} ${path}: ${response.status} ${text}`);
  return value;
}

await request("POST", "/api/auth/sign-in/email", JSON.parse(readFileSync(credentialPath, "utf8")));
const { companyId, missionId, agents } = evidence.synthetic;
const runs = await request("GET", `/api/companies/${companyId}/heartbeat-runs?limit=1000`);
for (const run of runs.filter((entry) => ["queued", "running", "scheduled_retry"].includes(entry.status))) {
  await request("POST", `/api/heartbeat-runs/${run.id}/cancel`, {});
}
for (const agentId of [agents.executorId, agents.reviewerId, agents.advisorId]) {
  await request("PATCH", `/api/agents/${agentId}`, {
    status: "paused",
    runtimeConfig: { heartbeat: { enabled: false, wakeOnDemand: false, maxConcurrentRuns: 1, maxDailyRuns: 8, maxDailyCostCents: 1 } },
  });
}
const finalRuns = await request("GET", `/api/companies/${companyId}/heartbeat-runs?limit=1000`);
assert(finalRuns.every((run) => !["queued", "running", "scheduled_retry"].includes(run.status)), "Synthetic packet still has a nonterminal run");

const councilBase = `/api/plugins/${evidence.candidates.councilPluginId}/api/companies/${companyId}/l03`;
const councilList = await request("GET", `${councilBase}?companyId=${companyId}`);
const councilState = councilList.missions.find((entry) => entry.governance.missionId === missionId);
assert(councilState, "Council mission missing at failure seal");
const executiveState = await request("POST", `/api/plugins/${evidence.candidates.executivePluginId}/data/advice-state`, {
  companyId, params: { companyId },
});
const failedSlot = councilState.governance.consultationSlots[0];
const reservationId = failedSlot?.admissionRequest?.reservationId ?? failedSlot?.admissionGrant?.slot?.reservationId;
const contribution = executiveState.data.councilContributions.find((entry) => entry.reservationId === reservationId);
assert.equal(contribution?.status, "completed");
let failureSummary;
let issueAtFailure = null;
if (failureCode === "expired_invocation_scope_on_observation_emit") {
  assert.match(contribution.observationError ?? "", /invocation scope/);
  failureSummary = "The Executive session completed with a valid opinion, but its later terminal callback could not emit through an expired worker invocation scope.";
} else if (failureCode === "released_run_ownership_window_expired") {
  assert.equal(councilState.governance.phase, "executing");
  issueAtFailure = await request("GET", `/api/issues/${evidence.synthetic.issueId}`);
  assert.equal(issueAtFailure.status, "in_progress");
  assert.equal(issueAtFailure.executionRunId, null);
  assert.equal(issueAtFailure.checkoutRunId, null);
  const releaseRef = councilState.governance.approachDirections.at(-1)?.actualEffect?.observationRef;
  assert.match(releaseRef ?? "", /^paperclip:run:/);
  const releaseRun = finalRuns.find((run) => run.id === releaseRef.slice("paperclip:run:".length));
  assert.equal(releaseRun?.status, "succeeded");
  failureSummary = "Harness delays allowed the single Council-released executor run to finish before issue submission, so native run ownership correctly refused the late agent mutation; no duplicate wake was sent.";
} else if (failureCode === "reviewer_run_missing_issue_context") {
  assert.equal(councilState.governance.phase, "awaiting_result_effect");
  issueAtFailure = await request("GET", `/api/issues/${evidence.synthetic.issueId}`);
  assert.equal(issueAtFailure.status, "in_review");
  assert.equal(issueAtFailure.assigneeAgentId, agents.reviewerId);
  const resultDecision = councilState.governance.resultDecisions.at(-1);
  assert.equal(resultDecision?.verdict, "revise");
  assert.equal(resultDecision?.actualEffect, null);
  const receipt = councilState.receipts.find((entry) => entry.operationId === resultDecision.receiptRef);
  assert(receipt, "Indeterminate result receipt is missing");
  assert.equal(receipt.state, "indeterminate");
  assert.equal(receipt.blockReason, "native_http_error");
  assert.equal(receipt.nativeObservation?.status, 403);
  assert.equal(receipt.nativeObservation?.usable, false);
  assert.equal(receipt.nativeObservation?.body?.code, "cross_issue_influence_run_context_required");
  const reviewerRun = finalRuns.find((run) => run.id === receipt.runId);
  assert(reviewerRun, "Receipt reviewer run is missing from the synthetic run ledger");
  const fullReviewerRun = await request("GET", `/api/heartbeat-runs/${receipt.runId}`);
  assert.equal(fullReviewerRun.agentId, agents.reviewerId);
  assert.equal(fullReviewerRun.contextSnapshot?.issueId, undefined);
  assert.equal(fullReviewerRun.contextSnapshot?.taskId, undefined);
  evidence.checks.reviewerContextFailure = {
    decision: resultDecision,
    receipt,
    run: {
      id: fullReviewerRun.id,
      agentId: fullReviewerRun.agentId,
      companyId: fullReviewerRun.companyId,
      status: fullReviewerRun.status,
      contextSnapshot: fullReviewerRun.contextSnapshot,
      errorCode: fullReviewerRun.errorCode,
    },
  };
  failureSummary = "The harness manually woke the reviewer without issueId/taskId in its native run context; the host correctly rejected the Council issue mutation with the retained 403 receipt. The Council adapter did send the configured run ID header.";
} else {
  assert.equal(failureCode, "native_correction_wakeup_missing");
  assert.equal(councilState.governance.phase, "result_correction_required");
  issueAtFailure = await request("GET", `/api/issues/${evidence.synthetic.issueId}`);
  assert.equal(issueAtFailure.status, "in_progress");
  assert.equal(issueAtFailure.assigneeAgentId, agents.executorId);
  assert.equal(issueAtFailure.executionState?.status, "changes_requested");
  const executor = await request("GET", `/api/agents/${agents.executorId}`);
  assert.equal(executor.status, "paused");
  assert.equal(executor.runtimeConfig?.heartbeat?.wakeOnDemand, false);
  const executorBeforeSeal = evidence.checks.boundedRelease?.executorControl;
  assert.equal(executorBeforeSeal?.status, "idle");
  assert.equal(executorBeforeSeal?.wakeOnDemand, true);
  assert.equal(executorBeforeSeal?.maxConcurrentRuns, 1);
  const resultDecision = councilState.governance.resultDecisions.at(-1);
  assert.equal(resultDecision?.verdict, "revise");
  assert.equal(resultDecision?.actualEffect?.status, "confirmed");
  const receipt = councilState.receipts.find((entry) => entry.operationId === resultDecision.receiptRef);
  assert(receipt, "Confirmed correction receipt is missing");
  assert.equal(receipt.state, "native_observed");
  assert.equal(receipt.nativeObservation?.status, 200);
  assert.equal(receipt.nativeObservation?.usable, true);
  const correctionRuns = finalRuns.filter((run) =>
    run.agentId === agents.executorId
    && run.contextSnapshot?.issueId === evidence.synthetic.issueId
    && run.contextSnapshot?.wakeReason === "execution_changes_requested");
  assert.equal(correctionRuns.length, 0);
  evidence.checks.correctionWakeFailure = {
    decision: resultDecision,
    receipt,
    issue: issueAtFailure,
    executorBeforeSeal,
    correctionRunDelta: correctionRuns,
  };
  failureSummary = "The authenticated V1 revise decision and native changes-requested issue transition were confirmed, but no issue-scoped execution_changes_requested run was created for the pinned operational executor within the bounded observation window. No manual replacement wake was sent.";
}

async function baseline(id) {
  const companyAgents = await request("GET", `/api/companies/${id}/agents`);
  const companyRuns = await request("GET", `/api/companies/${id}/heartbeat-runs?limit=1000`);
  return {
    agentCount: companyAgents.length,
    agentStatuses: companyAgents.map((agent) => ({ id: agent.id, status: agent.status })).sort((a, b) => a.id.localeCompare(b.id)),
    runIds: companyRuns.map((run) => run.id).sort(),
  };
}
const protectedAfter = { l02: await baseline(protectedIds.l02), l03: await baseline(protectedIds.l03) };
assert.deepEqual(protectedAfter, evidence.protectedBaselines);

evidence.checks.failureDisposition = {
  code: failureCode,
  summary: failureSummary,
  executiveContribution: contribution,
  councilPhase: councilState.governance.phase,
  councilVersion: councilState.governance.version,
  admissionRequest: councilState.governance.consultationSlots[0]?.admissionRequest ?? null,
  admissionGrant: councilState.governance.consultationSlots[0]?.admissionGrant ?? null,
  councilContribution: councilState.governance.consultationSlots[0]?.contribution ?? null,
  issueAtFailure,
  syntheticRuns: finalRuns.map((run) => ({
    id: run.id, agentId: run.agentId, status: run.status,
    inputTokens: run.usageJson?.inputTokens ?? null,
    outputTokens: run.usageJson?.outputTokens ?? null,
    cachedInputTokens: run.usageJson?.cachedInputTokens ?? null,
  })),
  protectedAfter,
};
evidence.checks.protectedCompaniesPreserved = true;
evidence.outcome = "FAIL";
evidence.finishedAt = new Date().toISOString();
writeFileSync(sourcePath, `${JSON.stringify(evidence, null, 2)}\n`, { mode: 0o600 });
renameSync(sourcePath, targetPath);
console.log(JSON.stringify({ outcome: evidence.outcome, targetPath, failure: evidence.checks.failureDisposition.code }, null, 2));
