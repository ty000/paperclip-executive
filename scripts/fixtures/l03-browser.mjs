#!/usr/bin/env node

import assert from "node:assert/strict";
import { chmodSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const hostRoot = "/home/davy-lp/workspace/paperclip";
const credentialPath = "/home/davy-lp/workspace/paperclip-executive/.paperclip-dev/dev-owner.json";
const baseUrl = "http://127.0.0.1:3220";
const sourceEvidencePath = resolve(process.argv[2] ?? resolve(root, "docs/evidence/l03-host-attempt1.json"));
const label = process.argv[3] ?? "attempt1";
assert(/^[a-z0-9-]+$/.test(label), "Evidence label must be filesystem-safe");
assert(existsSync(sourceEvidencePath), `Missing source evidence: ${sourceEvidencePath}`);

const source = JSON.parse(readFileSync(sourceEvidencePath, "utf8"));
const { companyId, missionId } = source.synthetic;
assert(companyId && missionId, "Source evidence lacks the synthetic company and mission");
const evidencePath = resolve(root, `docs/evidence/l03-host-browser-${label}.json`);
const councilScreenshot = resolve(root, `docs/evidence/l03-browser-council-${label}.png`);
const executiveScreenshot = resolve(root, `docs/evidence/l03-browser-executive-${label}.png`);
const executableCandidates = [
  process.env.PAPERCLIP_BROWSER_EXECUTABLE,
  "/home/davy-lp/.cache/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell",
  "/home/davy-lp/.cache/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-linux64/chrome-headless-shell",
].filter(Boolean);
const executablePath = executableCandidates.find((candidate) => existsSync(candidate));
assert(executablePath, "No existing Chromium executable is available");
const { chromium } = createRequire(resolve(hostRoot, "package.json"))("@playwright/test");

const browser = await chromium.launch({ headless: true, executablePath });
const evidence = {
  schemaVersion: 1,
  sourceEvidencePath,
  sourceOutcome: source.outcome,
  checkedAt: new Date().toISOString(),
  companyId,
  missionId,
  tooling: { package: "@playwright/test", hostRoot, executablePath },
  screenshots: { council: councilScreenshot, executive: executiveScreenshot },
  checks: [],
  pageErrors: [],
  outcome: "RUNNING",
  closureEffect: source.outcome === "PASS"
    ? "browser rendering and reload evidence for the natively accepted packet; native API evidence remains authoritative"
    : "pending-state defect evidence only; never evidence of L03 success",
};
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } });
  const auth = await context.request.post(`${baseUrl}/api/auth/sign-in/email`, {
    headers: { origin: baseUrl },
    data: JSON.parse(readFileSync(credentialPath, "utf8")),
  });
  assert.equal(auth.status(), 200);
  const companiesResponse = await context.request.get(`${baseUrl}/api/companies`);
  assert.equal(companiesResponse.status(), 200);
  const company = (await companiesResponse.json()).find((entry) => entry.id === companyId);
  assert(company?.issuePrefix, "Synthetic company route prefix is unavailable");
  evidence.issuePrefix = company.issuePrefix;

  async function capture(route, kind, assertions, stableTexts, screenshotPath) {
    const page = await context.newPage();
    page.on("pageerror", (error) => evidence.pageErrors.push({ kind, message: error.message }));
    const url = `${baseUrl}/${company.issuePrefix}/${route}`;
    await page.goto(url, { waitUntil: "networkidle" });
    for (const assertion of assertions) {
      await page.getByText(assertion.text, { exact: assertion.exact ?? false }).first().waitFor();
    }
    const mission = page.locator("article").filter({ hasText: missionId }).first();
    await mission.waitFor();
    const beforeReload = await mission.innerText();
    for (const text of stableTexts) assert(beforeReload.includes(text), `${kind} omitted ${text}`);
    await mission.screenshot({ path: screenshotPath });
    await page.reload({ waitUntil: "networkidle" });
    const afterReload = await page.locator("article").filter({ hasText: missionId }).first().innerText();
    for (const text of stableTexts) assert(afterReload.includes(text), `${kind} reload omitted ${text}`);
    evidence.checks.push({ kind, url, assertions: assertions.map((entry) => entry.text), stableTexts, reloadStable: true });
    await page.close();
  }

  if (source.outcome === "PASS") {
    const final = source.checks?.finalGovernance?.governance;
    const result = final?.results?.at(-1);
    const v1Decision = final?.resultDecisions?.at(-2);
    const v2Decision = final?.resultDecisions?.at(-1);
    assert.equal(final?.phase, "accepted");
    assert.equal(v2Decision?.verdict, "accept");
    assert(result?.candidateCommit && result?.sha256);
    assert(v1Decision?.receiptRef && v2Decision?.receiptRef);
    await capture("council-l03", "Council", [
      { text: "Council missions", exact: true },
      { text: "accepted" },
      { text: `Result: ${result.resultId}` },
      { text: result.candidateCommit },
      { text: `bundle digest: ${result.sha256}` },
      { text: "Result decision: accept" },
      { text: "Observation: completed" },
      { text: "The corrected bounded approach preserves the criterion" },
      { text: `Receipt ${v1Decision.receiptRef}` },
      { text: `Receipt ${v2Decision.receiptRef}` },
      { text: `Native observation: council:receipt:${v2Decision.receiptRef}` },
      { text: "envelope: 6 / 6" },
      { text: "approach: 2 / 2" },
      { text: "result: 2 / 2" },
      { text: "consultation: 2 / 2" },
      { text: "correction: 2 / 2" },
    ], ["accepted", result.candidateCommit, result.sha256, "Observation: completed", `Receipt ${v2Decision.receiptRef}`, "correction: 2 / 2"], councilScreenshot);
    await capture("executive", "Executive", [
      { text: "Council missions and next actions", exact: true },
      { text: "accepted" },
      { text: result.candidateCommit },
      { text: "result decision: accept" },
      { text: "Observation: completed" },
      { text: "The corrected bounded approach preserves the criterion" },
      { text: `Receipt ${v1Decision.receiptRef}` },
      { text: `Receipt ${v2Decision.receiptRef}` },
      { text: `Native observation: council:receipt:${v2Decision.receiptRef}` },
      { text: "envelope: 6/6" },
      { text: "approach: 2/2" },
      { text: "result: 2/2" },
      { text: "consultation: 2/2" },
      { text: "correction: 2/2" },
    ], ["accepted", result.candidateCommit, "result decision: accept", "Observation: completed", `Receipt ${v2Decision.receiptRef}`, "correction: 2/2"], executiveScreenshot);
  } else if (source.checks?.failureDisposition?.code === "native_correction_wakeup_missing") {
    const final = source.checks?.correctionWakeFailure;
    const decision = final?.decision;
    const receipt = final?.receipt;
    const governanceResult = source.steps
      .map((step) => step.response?.governance)
      .filter(Boolean)
      .at(-1)?.results?.at(-1);
    assert.equal(decision?.verdict, "revise");
    assert.equal(receipt?.state, "native_observed");
    assert.equal(receipt?.nativeObservation?.status, 200);
    assert.equal(receipt?.nativeObservation?.usable, true);
    assert(governanceResult?.candidateCommit && governanceResult?.sha256);
    await capture("council-l03", "Council", [
      { text: "Council missions", exact: true },
      { text: "result correction required" },
      { text: `Result: ${governanceResult.resultId}` },
      { text: governanceResult.candidateCommit },
      { text: `bundle digest: ${governanceResult.sha256}` },
      { text: "Result decision: revise" },
      { text: "native observation confirmed" },
      { text: `Receipt ${decision.receiptRef}` },
      { text: "native_observed" },
      { text: "HTTP 200; usable: true" },
      { text: "envelope: 6 / 6" },
      { text: "approach: 2 / 2" },
      { text: "result: 2 / 2" },
      { text: "consultation: 2 / 2" },
      { text: "correction: 2 / 2" },
    ], ["result correction required", governanceResult.candidateCommit, governanceResult.sha256,
      `Receipt ${decision.receiptRef}`, "native_observed", "correction: 2 / 2"], councilScreenshot);
    await capture("executive", "Executive", [
      { text: "Council missions and next actions", exact: true },
      { text: "result correction required" },
      { text: governanceResult.candidateCommit },
      { text: "result decision: revise" },
      { text: "native observation confirmed" },
      { text: `Receipt ${decision.receiptRef}` },
      { text: "native_observed" },
      { text: "HTTP 200; usable: true" },
      { text: "envelope: 6/6" },
      { text: "approach: 2/2" },
      { text: "result: 2/2" },
      { text: "consultation: 2/2" },
      { text: "correction: 2/2" },
    ], ["result correction required", governanceResult.candidateCommit, "result decision: revise",
      `Receipt ${decision.receiptRef}`, "native_observed", "correction: 2/2"], executiveScreenshot);
  } else {
    const slot = source.checks?.failureDisposition?.admissionGrant
      ? "admitted; completion not observed"
      : "admission not observed";
    await capture("council-l03", "Council", [
      { text: "Council missions", exact: true },
      { text: slot },
      { text: "No confirmed observation" },
    ], ["collecting approach opinions", "architecture", "opinion missing"], councilScreenshot);
    await capture("executive", "Executive", [
      { text: "Council missions and next actions", exact: true },
      { text: "Observation: missing", exact: true },
      { text: "Native observation: missing", exact: true },
    ], ["collecting approach opinions", "architecture", "opinion missing"], executiveScreenshot);
  }
  assert.deepEqual(evidence.pageErrors, []);
  evidence.outcome = source.outcome === "PASS" ? "PASS"
    : source.checks?.failureDisposition?.code === "native_correction_wakeup_missing"
      ? "PASS_BLOCKED_STATE_RENDERED"
      : "PASS_PENDING_DEFECT_RENDERED";
  writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`, { mode: 0o600 });
  chmodSync(evidencePath, 0o600);
  console.log(JSON.stringify({ outcome: evidence.outcome, evidencePath, screenshots: evidence.screenshots }, null, 2));
} catch (error) {
  evidence.outcome = "FAIL";
  evidence.error = error instanceof Error ? error.message : String(error);
  writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`, { mode: 0o600 });
  chmodSync(evidencePath, 0o600);
  throw error;
} finally {
  await browser.close();
}
