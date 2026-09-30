import { describe, expect, it } from "vitest";
import { SqlContributionRepository } from "../src/contribution-repository.js";
import {
  CONTRIBUTION_METHOD, CONTRIBUTION_SCHEMA_VERSION, ContributionService, parseContributionResult,
  type ContributionRecord, type ContributionRepository, type ContributionResult, type ContributionSessionClient,
} from "../src/contribution.js";

class MemoryContributions implements ContributionRepository {
  records = new Map<string, ContributionRecord>();
  failDispatching = false; failRunning = false; failComplete = false;
  async claim(input: Omit<ContributionRecord, "createdAt" | "updatedAt">) {
    const existing = [...this.records.values()].find((item) => item.companyId === input.companyId && item.requestKey === input.requestKey);
    if (existing) return { record: existing, inserted: false };
    const record = { ...input, createdAt: "2026-09-30T00:00:00.000Z", updatedAt: "2026-09-30T00:00:00.000Z" };
    this.records.set(record.contributionId, record); return { record, inserted: true };
  }
  async get(companyId: string, id: string) { const value = this.records.get(id); return value?.companyId === companyId ? value : null; }
  async getByRequestKey(companyId: string, requestKey: string) { return [...this.records.values()].find((item) => item.companyId === companyId && item.requestKey === requestKey) ?? null; }
  async list(companyId: string) { return [...this.records.values()].filter((item) => item.companyId === companyId); }
  async markInterruptedUnknown(companyId: string) { for (const item of this.records.values()) if (item.companyId === companyId && ["prepared", "dispatching", "running"].includes(item.status)) this.patch(item, { status: "outcome_unknown", error: "Worker restarted before a correlated terminal contribution was durably observed" }); }
  async markDispatching(companyId: string, id: string, sessionId: string) {
    if (this.failDispatching) throw new Error("persistence unavailable"); const item = await this.required(companyId, id); this.patch(item, { status: "dispatching", sessionId });
  }
  async markRunning(companyId: string, id: string, sessionId: string, runId: string) {
    if (this.failRunning) throw new Error("persistence unavailable"); const item = await this.required(companyId, id);
    if (item.sessionId === sessionId && ["dispatching", "running"].includes(item.status) && (!item.runId || item.runId === runId)) this.patch(item, { status: "running", runId });
  }
  async complete(companyId: string, id: string, sessionId: string, runId: string, result: ContributionResult) {
    if (this.failComplete) throw new Error("completion persistence unavailable");
    const item = await this.required(companyId, id);
    if (item.sessionId !== sessionId || (item.runId && item.runId !== runId) || !["dispatching", "running", "outcome_unknown"].includes(item.status)) return false;
    this.patch(item, { status: "completed", runId, result, error: null }); return true;
  }
  async fail(companyId: string, id: string, status: "failed" | "outcome_unknown", error: string, runId: string | null = null, sessionId: string | null = null) {
    const item = await this.required(companyId, id);
    if (item.status === "completed" || item.status === "failed" || (sessionId && item.sessionId && item.sessionId !== sessionId) || (runId && item.runId && item.runId !== runId)) return;
    this.patch(item, { status, error, runId: runId ?? item.runId, sessionId: sessionId ?? item.sessionId });
  }
  private async required(companyId: string, id: string) { const item = await this.get(companyId, id); if (!item) throw new Error("missing"); return item; }
  private patch(item: ContributionRecord, patch: Partial<ContributionRecord>) { this.records.set(item.contributionId, { ...item, ...patch }); }
}

class Sessions implements ContributionSessionClient {
  creates = 0; sends = 0; failSend = false;
  onEvent: Parameters<ContributionSessionClient["sendMessage"]>[2]["onEvent"] | null = null;
  synchronousEvents: Parameters<ContributionSessionClient["sendMessage"]>[2]["onEvent"] extends (event: infer E) => void ? E[] : never[] = [];
  async create() { this.creates += 1; return { sessionId: "00000000-0000-4000-8000-000000000011" }; }
  async sendMessage(_session: string, _company: string, options: Parameters<ContributionSessionClient["sendMessage"]>[2]) {
    this.sends += 1; this.onEvent = options.onEvent; if (this.failSend) throw new Error("connection lost");
    for (const event of this.synchronousEvents) options.onEvent(event);
    return { runId: "00000000-0000-4000-8000-000000000012" };
  }
}

const owner = { type: "user" as const, userId: "owner-1", companyId: "company-1", verifiedCompanyOwner: true };
const issue = { id: "issue-1", companyId: "company-1", identifier: "EXE-42", projectId: "project-1", title: "Prepared ticket", description: "Bounded ticket", status: "todo", assigneeAgentId: "executor-1", updatedAt: "2026-09-30T00:00:00.000Z" };
const contributor = { id: "contributor-1", companyId: "company-1", name: "Reviewer", role: "engineer", title: "Reviewer", status: "idle", adapterType: "codex_local" };
const input = {
  requestKey: "contribution-key", issueId: "issue-1", contributorAgentId: "contributor-1", sourceReference: "LIN-42",
  objective: "Deliver the bounded behavior", acceptanceCriteria: ["A works"], exclusions: ["No deployment"], dependencies: [],
  approach: "Implement the smallest vertical slice", evidenceReferences: ["TAD AD-03"], decisiveUnknowns: ["None identified"], constraints: ["No price supplied"],
};
const validResult = {
  schemaVersion: CONTRIBUTION_SCHEMA_VERSION, recommendation: "Proceed with the bounded vertical slice.",
  perspectiveNotes: { product: "The objective is explicit.", technical: "The scope is testable.", delivery_cost: "No price or duration was supplied." },
  findings: [], assumptions: ["The supplied criteria are current."], limitations: ["References were not independently verified."],
};
function setup(overrides: { issue?: Partial<Omit<typeof issue, "assigneeAgentId">> & { assigneeAgentId?: string | null }; contributor?: Partial<typeof contributor> } = {}) {
  const repository = new MemoryContributions(); const sessions = new Sessions();
  const issueValue = { ...issue, ...overrides.issue }; const contributorValue = { ...contributor, ...overrides.contributor };
  const service = new ContributionService(repository, sessions,
    { get: async (id, companyId) => id === issueValue.id && companyId === issueValue.companyId ? issueValue : null },
    { get: async (id, companyId) => id === contributorValue.id && companyId === contributorValue.companyId ? contributorValue : null },
    (value) => `hash:${value}`);
  return { repository, sessions, service, contributorValue };
}

describe("Paperclip Executive L02 contribution", () => {
  it("A1 refuses missing decisive input and invalid issue/contributor identities before dispatch", async () => {
    const cases = [
      { setup: setup(), input: { ...input, acceptanceCriteria: [] }, message: "acceptanceCriteria" },
      { setup: setup({ issue: { companyId: "company-2" } }), input, message: "does not belong" },
      { setup: setup({ issue: { assigneeAgentId: null } }), input, message: "assigned executor" },
      { setup: setup({ contributor: { id: "executor-1" } }), input: { ...input, contributorAgentId: "executor-1" }, message: "distinct" },
      { setup: setup({ contributor: { status: "paused" } }), input, message: "not available" },
    ];
    for (const entry of cases) {
      await expect(entry.setup.service.submit(owner, entry.input)).rejects.toThrow(entry.message);
      expect(entry.setup.sessions.creates).toBe(0); expect(entry.setup.sessions.sends).toBe(0);
    }
  });

  it("A2 claims concurrent duplicates once and rejects changed captured content", async () => {
    const { service, sessions, contributorValue } = setup();
    const [first, duplicate] = await Promise.all([service.submit(owner, input), service.submit(owner, input)]);
    expect(first.contributionId).toBe(duplicate.contributionId); expect(sessions.creates).toBe(1); expect(sessions.sends).toBe(1);
    contributorValue.status = "running";
    const replayAfterDispatch = await service.submit(owner, input);
    expect(replayAfterDispatch.contributionId).toBe(first.contributionId);
    await expect(service.submit(owner, { ...input, approach: "A changed approach" })).rejects.toThrow("different captured input");
    expect(sessions.creates).toBe(1);
  });

  it("A2 replays completed and outcome-unknown contributions after the contributor is paused", async () => {
    for (const terminalStatus of ["completed", "outcome_unknown"] as const) {
      const { service, sessions, repository, contributorValue } = setup();
      const first = await service.submit(owner, input);
      const persisted = await repository.get("company-1", first.contributionId);
      expect(persisted).not.toBeNull();
      repository.records.set(first.contributionId, {
        ...persisted!, status: terminalStatus,
        result: terminalStatus === "completed" ? validResult : null,
      });
      contributorValue.status = "paused";

      const replay = await service.submit(owner, input);

      expect(replay).toMatchObject({ contributionId: first.contributionId, status: terminalStatus });
      expect(sessions.creates).toBe(1); expect(sessions.sends).toBe(1);
    }
  });

  it("A2 keeps changed-input conflicts and rejects new requests while the contributor is paused without side effects", async () => {
    const { service, sessions, repository, contributorValue } = setup();
    await service.submit(owner, input);
    contributorValue.status = "paused";

    await expect(service.submit(owner, { ...input, approach: "A changed approach" })).rejects.toThrow("different captured input");
    await expect(service.submit(owner, { ...input, requestKey: "new-paused-request" })).rejects.toThrow("not available");

    expect(await repository.getByRequestKey("company-1", "new-paused-request")).toBeNull();
    expect(sessions.creates).toBe(1); expect(sessions.sends).toBe(1);
  });

  it("A2 uses atomic SQL INSERT ON CONFLICT plus request-key readback", async () => {
    const executes: string[] = []; const queries: string[] = [];
    const row = {
      company_id: "company-1", contribution_id: "contribution-1", request_key: "key", author_user_id: "owner-1", input_hash: "hash", input_version: 1,
      issue_snapshot: { id: "issue", identifier: null, projectId: null, title: "T", description: null, status: "todo", executorAgentId: "executor", updatedAt: "2026-09-30T00:00:00.000Z" },
      source_snapshot: { reference: "LIN-1", objective: "O", acceptanceCriteria: ["A"], exclusions: ["E"], dependencies: [] },
      approach_snapshot: { summary: "S", evidenceReferences: [], decisiveUnknowns: ["None"], constraints: ["None"] },
      contributor_snapshot: { agentId: "agent", name: "A", role: "engineer", title: null, status: "idle", adapterType: "codex_local" }, method_snapshot: CONTRIBUTION_METHOD,
      session_id: null, run_id: null, status: "prepared", result: null, error: null, created_at: "2026-09-30", updated_at: "2026-09-30",
    };
    const repository = new SqlContributionRepository({ namespace: "plugin_executive_test", execute: async (sql) => { executes.push(sql); return { rowCount: 0 }; }, query: async <T>(sql: string) => { queries.push(sql); return [row] as T[]; } });
    const result = await repository.claim({ companyId: "company-1", contributionId: "new", requestKey: "key", authorUserId: "owner-1", inputHash: "hash", inputVersion: 1,
      issue: row.issue_snapshot, source: row.source_snapshot, approach: row.approach_snapshot, contributor: row.contributor_snapshot, method: CONTRIBUTION_METHOD,
      sessionId: null, runId: null, status: "prepared", result: null, error: null });
    expect(executes[0]).toContain("ON CONFLICT (company_id, request_key) DO NOTHING"); expect(queries[0]).toContain("request_key = $2"); expect(result.inserted).toBe(false);
  });

  it("A2 marks only an inserted claim outcome-unknown when request-key readback fails", async () => {
    const claimInput = {
      companyId: "company-1", contributionId: "inserted-contribution", requestKey: "key", authorUserId: "owner-1", inputHash: "hash", inputVersion: 1,
      issue: { id: "issue", identifier: null, projectId: null, title: "T", description: null, status: "todo", executorAgentId: "executor", updatedAt: "2026-09-30T00:00:00.000Z" },
      source: { reference: "LIN-1", objective: "O", acceptanceCriteria: ["A"], exclusions: ["E"], dependencies: [] },
      approach: { summary: "S", evidenceReferences: [], decisiveUnknowns: ["None"], constraints: ["None"] },
      contributor: { agentId: "agent", name: "A", role: "engineer", title: null, status: "idle", adapterType: "codex_local" }, method: CONTRIBUTION_METHOD,
      sessionId: null, runId: null, status: "prepared" as const, result: null, error: null,
    };
    for (const failure of ["query-error", "missing-row"] as const) {
      const winnerExecutes: Array<{ sql: string; params: unknown[] | undefined }> = [];
      const winner = new SqlContributionRepository({ namespace: "plugin_executive_test",
        execute: async (sql, params) => { winnerExecutes.push({ sql, params }); return { rowCount: 1 }; },
        query: async <T>() => {
          if (failure === "query-error") throw new Error("readback unavailable");
          return [] as T[];
        },
      });
      await expect(winner.claim(claimInput)).rejects.toThrow(failure === "query-error" ? "readback unavailable" : "could not be read back");
      expect(winnerExecutes).toHaveLength(2);
      expect(winnerExecutes[1]?.sql).toContain("SET status = $1");
      expect(winnerExecutes[1]?.params).toMatchObject({ 0: "outcome_unknown", 4: "company-1", 5: "inserted-contribution" });
    }

    const duplicateExecutes: string[] = [];
    const duplicate = new SqlContributionRepository({ namespace: "plugin_executive_test",
      execute: async (sql) => { duplicateExecutes.push(sql); return { rowCount: 0 }; },
      query: async () => { throw new Error("readback unavailable"); },
    });
    await expect(duplicate.claim({ ...claimInput, contributionId: "losing-contribution" })).rejects.toThrow("readback unavailable");
    expect(duplicateExecutes).toHaveLength(1);
  });

  it("A3 accepts zero must-fix findings and classifies optional polish as defer", () => {
    expect(parseContributionResult(JSON.stringify(validResult)).findings).toEqual([]);
    const proportional = parseContributionResult(JSON.stringify({ ...validResult, findings: [{ id: "F-1", class: "defer", perspective: "product", criterionRef: "Optional polish", evidence: [], reasons: ["Not required for acceptance"], smallestUsefulAction: "Revisit after usage evidence." }] }));
    expect(proportional.findings[0]?.class).toBe("defer");
  });

  it("A3 recommends a smaller slice for an evidence-based overlarge approach", () => {
    const overlarge = parseContributionResult(JSON.stringify({ ...validResult,
      recommendation: "Reduce the approach to the auth boundary and defer reporting integrations.",
      findings: [{ id: "F-SCOPE", class: "must_fix", perspective: "delivery_cost", criterionRef: "Acceptance criterion A works",
        evidence: ["The supplied approach combines auth, reporting, migration, and deployment."],
        reasons: ["Only auth is required by the captured acceptance criterion."], smallestUsefulAction: "Implement and verify the auth boundary first." }],
    }));
    expect(overlarge.recommendation).toContain("Reduce");
    expect(overlarge.findings[0]).toMatchObject({ id: "F-SCOPE", class: "must_fix", criterionRef: "Acceptance criterion A works" });
  });

  it("A4 rejects globally oversized output, excessive findings, overlong items, and cumulative arrays", () => {
    expect(() => parseContributionResult("x".repeat(200_001))).toThrow("exceeds 200000");
    expect(() => parseContributionResult(JSON.stringify({ ...validResult, findings: Array.from({ length: 51 }, (_, index) => ({
      id: `F-${index}`, class: "defer", perspective: "product", criterionRef: "optional", evidence: [], reasons: [], smallestUsefulAction: "Wait."
    })) }))).toThrow("findings exceeds 50");
    expect(() => parseContributionResult(JSON.stringify({ ...validResult, assumptions: ["x".repeat(2_001)] }))).toThrow("item over 2000");
    expect(() => parseContributionResult(JSON.stringify({ ...validResult, limitations: Array.from({ length: 11 }, () => "x".repeat(1_900)) }))).toThrow("cumulative characters");
    expect(() => parseContributionResult(JSON.stringify({ ...validResult, findings: [{
      id: "F-1", class: "must_fix", perspective: "technical", criterionRef: "A1",
      evidence: Array.from({ length: 6 }, () => "x".repeat(1_900)), reasons: [], smallestUsefulAction: "Bound it."
    }] }))).toThrow("cumulative characters");
    expect(() => parseContributionResult(JSON.stringify({ ...validResult, findings: Array.from({ length: 27 }, (_, index) => ({
      id: `F-EVIDENCE-${index}`, class: "useful_now", perspective: "technical", criterionRef: "A1",
      evidence: ["x".repeat(1_900)], reasons: [], smallestUsefulAction: "Bound aggregate evidence."
    })) }))).toThrow("finding evidence exceeds 50000");
  });

  it("A4 waits for and persists the returned run id before accepting a synchronous terminal callback", async () => {
    const correct = setup();
    correct.sessions.synchronousEvents = [{ sessionId: "00000000-0000-4000-8000-000000000011", runId: "00000000-0000-4000-8000-000000000012", seq: 1, eventType: "done", stream: "stdout", message: JSON.stringify(validResult), payload: null }];
    const completed = await correct.service.submit(owner, input);
    expect(completed).toMatchObject({ status: "completed", runId: "00000000-0000-4000-8000-000000000012" });

    const wrong = setup();
    wrong.sessions.synchronousEvents = [{ sessionId: "00000000-0000-4000-8000-000000000011", runId: "wrong-run", seq: 1, eventType: "done", stream: "stdout", message: JSON.stringify(validResult), payload: null }];
    const stillRunning = await wrong.service.submit(owner, input);
    expect(stillRunning).toMatchObject({ status: "running", runId: "00000000-0000-4000-8000-000000000012", result: null });
  });

  it("A4 keeps a synchronous terminal outcome unknown when persisting its returned run id fails", async () => {
    const { service, sessions, repository } = setup(); repository.failRunning = true;
    sessions.synchronousEvents = [{ sessionId: "00000000-0000-4000-8000-000000000011", runId: "00000000-0000-4000-8000-000000000012", seq: 1, eventType: "done", stream: "stdout", message: JSON.stringify(validResult), payload: null }];
    const result = await service.submit(owner, input);
    expect(result).toMatchObject({ status: "outcome_unknown", runId: "00000000-0000-4000-8000-000000000012", result: null });
    expect(sessions.creates).toBe(1); expect(sessions.sends).toBe(1);
  });

  it("A4 marks valid completion persistence failure outcome-unknown and accepts later correlated recovery", async () => {
    const { service, sessions, repository } = setup(); repository.failComplete = true;
    const doneEvent = { sessionId: "00000000-0000-4000-8000-000000000011", runId: "00000000-0000-4000-8000-000000000012", seq: 1,
      eventType: "done" as const, stream: "stdout" as const, message: JSON.stringify(validResult), payload: null };
    sessions.synchronousEvents = [doneEvent];

    const unknown = await service.submit(owner, input);
    expect(unknown).toMatchObject({ status: "outcome_unknown", result: null, error: expect.stringContaining("completion persistence unavailable") });

    repository.failComplete = false;
    sessions.onEvent?.({ ...doneEvent, seq: 2 });
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(await repository.get("company-1", unknown.contributionId)).toMatchObject({ status: "completed", result: validResult, error: null });
  });

  it("A4 persists a correlated terminal result and ignores wrong session/run callbacks", async () => {
    const { service, sessions, repository } = setup(); const submitted = await service.submit(owner, input);
    sessions.onEvent?.({ sessionId: "wrong-session", runId: submitted.runId!, seq: 1, eventType: "done", stream: "stdout", message: JSON.stringify(validResult), payload: null });
    sessions.onEvent?.({ sessionId: submitted.sessionId!, runId: "wrong-run", seq: 2, eventType: "done", stream: "stdout", message: JSON.stringify(validResult), payload: null });
    await new Promise((resolve) => setTimeout(resolve, 0)); expect((await repository.get("company-1", submitted.contributionId))?.status).toBe("running");
    sessions.onEvent?.({ sessionId: submitted.sessionId!, runId: submitted.runId!, seq: 3, eventType: "done", stream: "stdout", message: JSON.stringify(validResult), payload: null });
    await new Promise((resolve) => setTimeout(resolve, 0)); expect(await repository.get("company-1", submitted.contributionId)).toMatchObject({ status: "completed", result: validResult });
  });

  it("A4 exposes invalid output and uncertain dispatch without retry", async () => {
    const invalid = setup(); const submitted = await invalid.service.submit(owner, input);
    invalid.sessions.onEvent?.({ sessionId: submitted.sessionId!, runId: submitted.runId!, seq: 1, eventType: "done", stream: "stdout", message: "not json", payload: null });
    await new Promise((resolve) => setTimeout(resolve, 0)); expect((await invalid.repository.get("company-1", submitted.contributionId))?.status).toBe("failed");
    const uncertain = setup(); uncertain.sessions.failSend = true; const unknown = await uncertain.service.submit(owner, input);
    expect(unknown.status).toBe("outcome_unknown"); expect(uncertain.sessions.creates).toBe(1); expect(uncertain.sessions.sends).toBe(1);
    const duplicate = await uncertain.service.submit(owner, input); expect(duplicate.contributionId).toBe(unknown.contributionId); expect(uncertain.sessions.creates).toBe(1);
  });

  it("A4 preserves a created session when pre-send persistence fails", async () => {
    const { service, sessions, repository } = setup(); repository.failDispatching = true;
    const result = await service.submit(owner, input); expect(result).toMatchObject({ status: "outcome_unknown", sessionId: "00000000-0000-4000-8000-000000000011", runId: null });
    expect(sessions.creates).toBe(1); expect(sessions.sends).toBe(0);
  });

  it("A4 marks nonterminal contributions outcome_unknown after an interrupted worker", async () => {
    const { service, repository } = setup(); const submitted = await service.submit(owner, input);
    expect(submitted.status).toBe("running");
    await repository.markInterruptedUnknown("company-1");
    expect(await repository.get("company-1", submitted.contributionId)).toMatchObject({ status: "outcome_unknown", result: null });
  });
});
