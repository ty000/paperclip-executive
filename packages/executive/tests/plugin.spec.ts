import { describe, expect, it } from "vitest";
import manifest from "../src/manifest.js";
import { SqlAdviceRepository } from "../src/repository.js";
import {
  AdviceService,
  assertUnambiguousCompanyOwner,
  parseAdviceResult,
  type AdviceRecord,
  type AdviceRepository,
  type AdviceResult,
  type ExecutiveSettings,
  type SessionClient,
} from "../src/advice.js";

class MemoryRepository implements AdviceRepository {
  settings = new Map<string, ExecutiveSettings>();
  records = new Map<string, AdviceRecord>();
  failMarkRunning = false;

  async getSettings(companyId: string) { return this.settings.get(companyId) ?? null; }
  async saveSettings(input: { companyId: string; ownerUserId: string; executiveAgentId: string; expectedRevision: number }) {
    const current = this.settings.get(input.companyId);
    if ((current?.revision ?? 0) !== input.expectedRevision) throw new Error("Stale settings revision; refresh and review");
    const saved = { companyId: input.companyId, ownerUserId: input.ownerUserId, executiveAgentId: input.executiveAgentId, revision: input.expectedRevision + 1 };
    this.settings.set(input.companyId, saved);
    return saved;
  }
  async findByRequestKey(companyId: string, requestKey: string) {
    return [...this.records.values()].find((item) => item.companyId === companyId && item.requestKey === requestKey) ?? null;
  }
  async get(companyId: string, contextId: string) {
    const record = this.records.get(contextId);
    return record?.companyId === companyId ? record : null;
  }
  async list(companyId: string) { return [...this.records.values()].filter((item) => item.companyId === companyId); }
  async markInterruptedUnknown(companyId: string) {
    for (const record of this.records.values()) {
      if (record.companyId === companyId && ["pending", "dispatching", "running"].includes(record.status)) {
        this.change(record.companyId, record.contextId, {
          status: "outcome_unknown",
          error: "Worker restarted before a terminal result was durably observed",
        });
      }
    }
  }
  async create(input: Omit<AdviceRecord, "createdAt" | "updatedAt">) {
    const now = "2026-09-30T00:00:00.000Z";
    const record = { ...input, createdAt: now, updatedAt: now };
    this.records.set(record.contextId, record);
    return record;
  }
  async markDispatching(companyId: string, contextId: string, sessionId: string) {
    this.change(companyId, contextId, { status: "dispatching", sessionId });
  }
  async markRunning(companyId: string, contextId: string, runId: string) {
    if (this.failMarkRunning) throw new Error("persistence unavailable");
    const current = await this.get(companyId, contextId);
    if (current && !["completed", "failed", "outcome_unknown"].includes(current.status)) {
      this.change(companyId, contextId, { status: "running", runId });
    }
  }
  async complete(companyId: string, contextId: string, runId: string, result: AdviceResult) {
    this.change(companyId, contextId, { status: "completed", runId, result, error: null });
  }
  async fail(
    companyId: string,
    contextId: string,
    status: "failed" | "outcome_unknown",
    error: string,
    runId: string | null = null,
  ) {
    const current = await this.get(companyId, contextId);
    if (current && current.status !== "completed") this.change(companyId, contextId, { status, error, runId: runId ?? current.runId });
  }
  private change(companyId: string, contextId: string, patch: Partial<AdviceRecord>) {
    const current = this.records.get(contextId);
    if (!current || current.companyId !== companyId) throw new Error("Wrong company");
    this.records.set(contextId, { ...current, ...patch });
  }
}

class MemorySessions implements SessionClient {
  creates = 0;
  sends = 0;
  failSend = false;
  onEvent: Parameters<SessionClient["sendMessage"]>[2]["onEvent"] | null = null;
  async create() { this.creates += 1; return { sessionId: "00000000-0000-4000-8000-000000000001" }; }
  async sendMessage(_sessionId: string, _companyId: string, options: Parameters<SessionClient["sendMessage"]>[2]) {
    this.sends += 1;
    this.onEvent = options.onEvent;
    if (this.failSend) throw new Error("connection lost");
    return { runId: "00000000-0000-4000-8000-000000000002" };
  }
}

const owner = { type: "user" as const, userId: "user-1", companyId: "company-1", verifiedCompanyOwner: true };
const hash = (value: string) => `hash:${value}`;

function configuredService() {
  const repository = new MemoryRepository();
  repository.settings.set("company-1", {
    companyId: "company-1", ownerUserId: "user-1", executiveAgentId: "agent-1", revision: 1,
  });
  const sessions = new MemorySessions();
  return { repository, sessions, service: new AdviceService(repository, sessions, hash) };
}

describe("Paperclip Executive L01", () => {
  it("declares the real database, session, managed profile, and page surfaces", () => {
    expect(manifest.database?.migrationsDir).toBe("migrations");
    expect(manifest.capabilities).toEqual(expect.arrayContaining([
      "access.members.read", "agent.sessions.create", "agent.sessions.send", "database.namespace.write", "ui.page.register",
    ]));
    expect(manifest.agents?.[0]).toMatchObject({ agentKey: "executive", status: "paused" });
    expect(manifest.ui?.slots?.[0]).toMatchObject({ type: "page", routePath: "executive" });
  });

  it("requires one active owner membership for the authenticated host identity", () => {
    const membership = {
      companyId: "company-1", principalType: "user", principalId: "user-1", status: "active", membershipRole: "owner",
    };
    expect(assertUnambiguousCompanyOwner(owner, [membership])).toEqual({ companyId: "company-1", userId: "user-1" });
    expect(() => assertUnambiguousCompanyOwner(owner, [{ ...membership, membershipRole: "admin" }])).toThrow("missing or ambiguous");
    expect(() => assertUnambiguousCompanyOwner(owner, [membership, membership])).toThrow("missing or ambiguous");
  });

  it("requires configuration, a verified user, the bound owner, and the correct company", async () => {
    const repository = new MemoryRepository();
    const service = new AdviceService(repository, new MemorySessions(), hash);
    await expect(service.submit(owner, { requestKey: "one", question: "Choose A or B?" })).rejects.toThrow("not configured");
    repository.settings.set("company-1", { companyId: "company-1", ownerUserId: "user-1", executiveAgentId: "agent-1", revision: 1 });
    await expect(service.submit({ ...owner, type: "agent" }, { requestKey: "one", question: "Choose A or B?" })).rejects.toThrow("verified company owner");
    await expect(service.submit({ ...owner, userId: "user-2" }, { requestKey: "one", question: "Choose A or B?" })).rejects.toThrow("configured company owner");
    await expect(service.submit({ ...owner, companyId: "company-2" }, { requestKey: "one", question: "Choose A or B?" })).rejects.toThrow("not configured");
  });

  it("rejects a stale settings revision", async () => {
    const { service } = configuredService();
    await expect(service.configure(owner, { executiveAgentId: "agent-2", expectedRevision: 0 })).rejects.toThrow("Stale settings revision");
  });

  it("lets a newly verified host owner take over configuration after ownership changes", async () => {
    const { service, repository } = configuredService();
    const newOwner = { ...owner, userId: "user-2" };
    const saved = await service.configure(newOwner, { executiveAgentId: "agent-2", expectedRevision: 1 });
    expect(saved).toMatchObject({ ownerUserId: "user-2", executiveAgentId: "agent-2", revision: 2 });
    expect(repository.settings.get("company-1")?.ownerUserId).toBe("user-2");
  });

  it("persists an owner transfer with company-and-revision CAS in the SQL repository", async () => {
    const executes: Array<{ sql: string; params?: unknown[] }> = [];
    const repository = new SqlAdviceRepository({
      namespace: "plugin_executive_test",
      execute: async (sql: string, params?: unknown[]) => { executes.push({ sql, params }); return { rowCount: 1 }; },
      query: async <T>() => ([{
        company_id: "company-1", owner_user_id: "user-2", executive_agent_id: "agent-2", revision: 2,
      }] as T[]),
    });
    await repository.saveSettings({
      companyId: "company-1", ownerUserId: "user-2", executiveAgentId: "agent-2", expectedRevision: 1,
    });
    expect(executes[0]?.sql).toContain("SET owner_user_id = $1, executive_agent_id = $2");
    expect(executes[0]?.sql).toContain("WHERE company_id = $3 AND revision = $4");
    expect(executes[0]?.params).toEqual(["user-2", "agent-2", "company-1", 1]);
  });

  it("persists correlation and dispatches a known duplicate only once", async () => {
    const { service, sessions } = configuredService();
    const first = await service.submit(owner, { requestKey: "stable-key", question: "Choose A or B?", context: "B is reversible." });
    const duplicate = await service.submit(owner, { requestKey: "stable-key", question: "Choose A or B?", context: "B is reversible." });
    expect(first.contextId).toBe(duplicate.contextId);
    expect(sessions.creates).toBe(1);
    expect(sessions.sends).toBe(1);
    expect(first.sessionId).toBeTruthy();
    expect(first.runId).toBeTruthy();
    await expect(service.submit(owner, { requestKey: "stable-key", question: "Different input" })).rejects.toThrow("different input");
  });

  it("persists a structured terminal result attributed to the session run", async () => {
    const { service, sessions, repository } = configuredService();
    const submitted = await service.submit(owner, { requestKey: "result-key", question: "Choose A or B?" });
    sessions.onEvent?.({
      sessionId: submitted.sessionId!, runId: "run-final", seq: 1, eventType: "done", stream: "stdout",
      message: JSON.stringify({ recommendation: "Choose B.", assumptions: ["Reversibility matters."], limitations: ["No cost data."] }), payload: null,
    });
    await new Promise((resolve) => setTimeout(resolve, 0));
    const stored = await repository.get("company-1", submitted.contextId);
    expect(stored).toMatchObject({ status: "completed", runId: "run-final" });
    expect(stored?.result?.recommendation).toBe("Choose B.");
  });

  it("keeps a possibly dispatched interruption visible and never reports a fake result", async () => {
    const { service, sessions } = configuredService();
    sessions.failSend = true;
    const submitted = await service.submit(owner, { requestKey: "unknown-key", question: "Choose A or B?" });
    expect(submitted.status).toBe("outcome_unknown");
    expect(submitted.error).toContain("may have reached Paperclip");
    expect(submitted.result).toBeNull();
  });

  it("preserves a returned run id when the following persistence transition fails", async () => {
    const { service, repository } = configuredService();
    repository.failMarkRunning = true;
    const submitted = await service.submit(owner, { requestKey: "run-id-key", question: "Choose A or B?" });
    expect(submitted).toMatchObject({
      status: "outcome_unknown",
      runId: "00000000-0000-4000-8000-000000000002",
    });
  });

  it("marks in-flight work unknown on restart and accepts an explicitly delivered terminal result", async () => {
    const { service, sessions, repository } = configuredService();
    const submitted = await service.submit(owner, { requestKey: "restart-key", question: "Choose A or B?" });
    await repository.markInterruptedUnknown("company-1");
    expect((await repository.get("company-1", submitted.contextId))?.status).toBe("outcome_unknown");
    sessions.onEvent?.({
      sessionId: submitted.sessionId!, runId: "run-recovered", seq: 2, eventType: "done", stream: "stdout",
      message: JSON.stringify({ recommendation: "Choose A.", assumptions: [], limitations: ["Recovered terminal event."] }), payload: null,
    });
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(await repository.get("company-1", submitted.contextId)).toMatchObject({ status: "completed", runId: "run-recovered" });
  });

  it("validates the recommendation, assumptions, and limitations contract", () => {
    expect(parseAdviceResult('{"recommendation":"Choose B.","assumptions":[],"limitations":["Evidence missing."]}')).toEqual({
      recommendation: "Choose B.", assumptions: [], limitations: ["Evidence missing."],
    });
    expect(() => parseAdviceResult("Choose B")).toThrow("required JSON contract");
  });
});
