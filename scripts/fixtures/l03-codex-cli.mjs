#!/usr/bin/env node

// Provider-free Codex CLI protocol fixture for the isolated L03 host qualification.
// It deliberately ignores Codex CLI arguments, consumes stdin, emits only the
// JSONL events the native codex_local adapter parses, and never opens a socket.

import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

let prompt = "";
for await (const chunk of process.stdin) prompt += chunk;

const role = process.env.L03_FIXTURE_ROLE ?? "worker";
const holdMs = Number.parseInt(process.env.L03_FIXTURE_HOLD_MS ?? "0", 10);
if (!Number.isSafeInteger(holdMs) || holdMs < 0 || holdMs > 120_000) {
  process.stderr.write("Invalid L03_FIXTURE_HOLD_MS\n");
  process.exit(2);
}

let message;
if (role === "opinion") {
  const criterionLine = prompt.match(/^Allowed criterion references: (.+)$/m)?.[1];
  const evidenceLine = prompt.match(/^Allowed evidence references: (.+)$/m)?.[1];
  const criterionRefs = criterionLine ? JSON.parse(criterionLine) : [];
  const evidenceRefs = evidenceLine ? JSON.parse(evidenceLine) : [];
  const criterionRef = criterionRefs[0] ?? process.env.L03_FIXTURE_CRITERION_REF;
  const evidenceRef = evidenceRefs[0] ?? process.env.L03_FIXTURE_EVIDENCE_REF;
  if (!criterionRef || !evidenceRef) {
    process.stderr.write("Opinion fixture requires criterion and evidence references\n");
    process.exit(2);
  }
  const requiresCorrection = prompt.includes("[qualification:approach-correction-required]");
  message = JSON.stringify({
    schemaVersion: "council-reserved-opinion.v1",
    recommendation: requiresCorrection ? "revise" : "proceed",
    summary: requiresCorrection
      ? "The first approach needs one bounded correction before any executor release."
      : "The corrected bounded approach preserves the criterion and identifies native evidence.",
    findings: [{
      id: requiresCorrection ? "approach-gap-v1" : "opinion-useful-native-readback",
      class: requiresCorrection ? "must_fix" : "useful_now",
      criterionRef,
      evidenceRefs: [evidenceRef],
      reasons: [requiresCorrection
        ? "The first approach carries the explicit synthetic correction marker."
        : "The approach binds its native issue document bytes before execution."],
      smallestUsefulAction: requiresCorrection
        ? "Replace the approach document with corrected immutable bytes and request a fresh opinion."
        : "Preserve the same evidence reference through result review.",
    }],
    limitations: ["Synthetic provider-free qualification; no external provider was contacted."],
    dissent: [],
  });
} else {
  message = JSON.stringify({
    fixture: "paperclip-l03-provider-free",
    role,
    promptBytes: Buffer.byteLength(prompt),
  });
}

const sessionId = `l03-fixture-${randomUUID()}`;
process.stdout.write(`${JSON.stringify({ type: "thread.started", thread_id: sessionId })}\n`);
process.stdout.write(`${JSON.stringify({
  type: "item.completed",
  item: { type: "agent_message", text: message },
})}\n`);
process.stdout.write(`${JSON.stringify({
  type: "turn.completed",
  usage: { input_tokens: 0, cached_input_tokens: 0, output_tokens: 0 },
})}\n`);

const wakeReason = process.env.PAPERCLIP_WAKE_REASON ?? "";
const cooperativeHold = (role === "executor" && wakeReason !== "Prepare authenticated L03 approach context")
  || (role === "reviewer" && (wakeReason.startsWith("Review exact L03 result") || wakeReason.startsWith("Fresh review of exact corrected L03 result")));
if (cooperativeHold) {
  const controlDir = process.env.L03_FIXTURE_CONTROL_DIR;
  const runId = process.env.PAPERCLIP_RUN_ID;
  if (!controlDir || !runId) {
    process.stderr.write("Cooperative fixture hold requires its control directory and native run ID\n");
    process.exit(2);
  }
  const releasePath = resolve(controlDir, `release-${runId}`);
  const deadline = Date.now() + 120_000;
  while (!existsSync(releasePath) && Date.now() < deadline) {
    await new Promise((resolveWait) => setTimeout(resolveWait, 100));
  }
  if (!existsSync(releasePath)) {
    process.stderr.write("Cooperative fixture hold expired without a release marker\n");
    process.exit(3);
  }
} else if (holdMs > 0) {
  await new Promise((resolveHold) => setTimeout(resolveHold, holdMs));
}
