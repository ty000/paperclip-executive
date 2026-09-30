import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import type { AgentSessionEvent, PluginEvent } from "@paperclipai/plugin-sdk";
import {
  COUNCIL_ADMISSION_GRANT_EVENT,
  COUNCIL_PLUGIN_ACTOR_ID,
  COUNCIL_RESERVATION_EVENT,
  FilePackagedProfileResolver,
  L03ContributionService,
  L03_METHOD,
  type L03ContributionRecord,
  type L03ContributionRepository,
  type L03ContributorSnapshot,
  type L03EventPublisher,
  type L03Opinion,
  type L03SessionClient,
  type PackagedProfileResolver,
  type PackagedProfileSnapshot,
  type ReservedConsultationSlot,
  parseL03OpinionResult,
  sha256Canonical,
} from "../src/l03-contribution.js";

const now = new Date("2026-09-30T12:00:00.000Z");
const profileHash = "2b9158b84262c01e1e6435641eea8cffc7d35af46f22941a2b8cd7e87aede9e1";
const contextContent = "Ticket context pinned by Council";
const contextHash = "2372658cd2e490a2a557365b571e0681705048aec0bb6da0caa8caf6990af51b";

const slot: ReservedConsultationSlot = {
  companyId: "00000000-0000-4000-8000-000000000001",
  missionId: "00000000-0000-4000-8000-000000000002",
  missionVersion: 1,
  mandateRevision: 2,
  slotId: "00000000-0000-4000-8000-000000000003",
  reservationId: "00000000-0000-4000-8000-000000000004",
  reservationVersion: 1,
  status: "reserved",
  reservedExecutiveAgentId: "00000000-0000-4000-8000-000000000005",
  profile: { id: "product", version: "1.0.0", sourceHash: profileHash },
  method: L03_METHOD,
  criterionRefs: ["AC-1", "AC-2"],
  evidenceRefs: ["EV-1", "EV-2"],
  context: { sourceRef: "linear://PEZ-1", sourceHash: contextHash, content: contextContent },
  expiresAt: "2026-09-30T12:05:00.000Z",
};

const opinion: L03Opinion = {
  schemaVersion: "council-reserved-opinion.v1",
  recommendation: "revise",
  summary: "The approach needs one bounded correction.",
  findings: [{
    id: "F-1",
    class: "must_fix",
    criterionRef: "AC-1",
    evidenceRefs: ["EV-1"],
    reasons: ["The supplied evidence does not cover the failure path."],
    smallestUsefulAction: "Add the failure-path assertion.",
  }],
  limitations: ["No live runtime was observed."],
  dissent: ["A broader redesign was considered and deferred."],
};

function councilEvent(eventType: typeof COUNCIL_RESERVATION_EVENT | typeof COUNCIL_ADMISSION_GRANT_EVENT, payload: unknown, overrides: Partial<PluginEvent> = {}): PluginEvent {
  return {
    eventId: "00000000-0000-4000-8000-000000000010",
    eventType,
    occurredAt: now.toISOString(),
    actorType: "plugin",
    actorId: COUNCIL_PLUGIN_ACTOR_ID,
    companyId: slot.companyId,
    payload,
    ...overrides,
  };
}

function nativeTerminalEvent(overrides: Partial<PluginEvent> = {}): PluginEvent {
  const runId = "00000000-0000-4000-8000-000000000021";
  return {
    eventId: "00000000-0000-4000-8000-000000000040",
    eventType: "agent.run.finished",
    occurredAt: now.toISOString(),
    actorType: "agent",
    actorId: slot.reservedExecutiveAgentId,
    entityId: runId,
    entityType: "heartbeat_run",
    companyId: slot.companyId,
    payload: { runId, agentId: slot.reservedExecutiveAgentId, status: "succeeded" },
    ...overrides,
  };
}

function optionalIdentityMatches(stored: string | null, supplied: string | null): boolean {
  if (!stored || !supplied) return true;
  return stored === supplied;
}

function failureTargetMatches(record: L03ContributionRecord | null, runId: string | null, sessionId: string | null): record is L03ContributionRecord {
  if (!record || ["completed", "failed"].includes(record.status)) return false;
  return optionalIdentityMatches(record.sessionId, sessionId) && optionalIdentityMatches(record.runId, runId);
}

class MemoryRepository implements L03ContributionRepository {
  records = new Map<string, L03ContributionRecord>();

  async claimTrigger(input: Omit<L03ContributionRecord, "createdAt" | "updatedAt">) {
    const existing = [...this.records.values()].find((record) => record.companyId === input.companyId && record.reservationId === input.reservationId);
    if (existing) return { record: existing, inserted: false };
    const record = { ...input, createdAt: now.toISOString(), updatedAt: now.toISOString() };
    this.records.set(record.contributionId, record);
    return { record, inserted: true };
  }
  async get(companyId: string, contributionId: string) {
    const record = this.records.get(contributionId);
    return record?.companyId === companyId ? record : null;
  }
  async getByReservation(companyId: string, reservationId: string) {
    return [...this.records.values()].find((record) => record.companyId === companyId && record.reservationId === reservationId) ?? null;
  }
  async getByRequest(companyId: string, requestId: string) {
    return [...this.records.values()].find((record) => record.companyId === companyId && record.requestId === requestId) ?? null;
  }
  async list(companyId: string) { return [...this.records.values()].filter((record) => record.companyId === companyId); }
  async markInterruptedUnknown(companyId: string) {
    for (const [id, record] of this.records) {
      if (record.companyId === companyId && ["prepared", "dispatching", "running"].includes(record.status)) {
        this.records.set(id, { ...record, status: "outcome_unknown", error: "interrupted" });
      }
    }
  }
  async recordAdmissionRequest(companyId: string, contributionId: string, requestedAt: string, error: string | null) {
    const record = await this.get(companyId, contributionId);
    if (record?.status === "awaiting_grant") this.records.set(contributionId, { ...record, admissionRequestedAt: requestedAt, admissionError: error });
  }
  async acceptGrant(input: { companyId: string; contributionId: string; requestId: string; grantId: string; grantGrantedAt: string; grantExpiresAt: string; slotHash: string; inputHash: string; profile: PackagedProfileSnapshot; contributor: L03ContributorSnapshot }) {
    const candidate = this.records.get(input.contributionId);
    const record = candidate?.companyId === input.companyId ? candidate : null;
    if (!record || record.status !== "awaiting_grant" || record.grantId || record.requestId !== input.requestId || record.slotHash !== input.slotHash) return false;
    this.records.set(input.contributionId, {
      ...record,
      grantId: input.grantId,
      grantGrantedAt: input.grantGrantedAt,
      grantExpiresAt: input.grantExpiresAt,
      inputHash: input.inputHash,
      profile: input.profile,
      contributor: input.contributor,
      status: "prepared",
    });
    return true;
  }
  async markDispatching(companyId: string, contributionId: string, sessionId: string) {
    const record = await this.get(companyId, contributionId);
    if (!record || record.status !== "prepared") throw new Error("concurrent");
    this.records.set(contributionId, { ...record, sessionId, status: "dispatching" });
  }
  async markRunning(companyId: string, contributionId: string, sessionId: string, runId: string) {
    const record = await this.get(companyId, contributionId);
    if (!record || record.sessionId !== sessionId || !["dispatching", "running"].includes(record.status)) throw new Error("concurrent");
    this.records.set(contributionId, { ...record, runId, status: "running" });
  }
  async complete(companyId: string, contributionId: string, sessionId: string, runId: string, result: L03Opinion) {
    const record = await this.get(companyId, contributionId);
    if (!record || record.sessionId !== sessionId || (record.runId !== null && record.runId !== runId) || !["dispatching", "running", "outcome_unknown"].includes(record.status)) return false;
    this.records.set(contributionId, { ...record, runId, status: "completed", opinion: result, error: null });
    return true;
  }
  async fail(companyId: string, contributionId: string, status: "failed" | "outcome_unknown", error: string, runId: string | null = null, sessionId: string | null = null) {
    const record = await this.get(companyId, contributionId);
    if (!failureTargetMatches(record, runId, sessionId)) return;
    this.records.set(contributionId, { ...record, status, error, runId: runId ?? record.runId, sessionId: sessionId ?? record.sessionId });
  }
  async recordObservation(companyId: string, contributionId: string, emittedAt: string, error: string | null) {
    const record = await this.get(companyId, contributionId);
    if (record) this.records.set(contributionId, { ...record, observationEmittedAt: emittedAt, observationError: error });
  }
}

class Sessions implements L03SessionClient {
  creates = 0;
  sends = 0;
  afterCreate: (() => void) | null = null;
  synchronousEvents: AgentSessionEvent[] = [];
  onEvent: ((event: AgentSessionEvent) => void) | null = null;
  async create(_agentId: string, _companyId: string, options: { taskKey: string; reason: string }) {
    // Mirrors the unchanged host's native session ownership query, not a permissive mock.
    if (!options.taskKey.startsWith("plugin:paperclip-executive.executive:session:")) throw new Error("Session not found");
    this.creates += 1;
    this.afterCreate?.();
    return { sessionId: "00000000-0000-4000-8000-000000000020" };
  }
  async sendMessage(_sessionId: string, _companyId: string, options: { onEvent: (event: AgentSessionEvent) => void }) {
    this.sends += 1;
    this.onEvent = options.onEvent;
    for (const event of this.synchronousEvents) options.onEvent(event);
    return { runId: "00000000-0000-4000-8000-000000000021" };
  }
}

class Events implements L03EventPublisher {
  calls: Array<{ name: string; companyId: string; payload: unknown }> = [];
  fail = false;
  async emit(name: string, companyId: string, payload: unknown) {
    this.calls.push({ name, companyId, payload });
    if (this.fail) throw new Error("event bus unavailable");
  }
}

class Profiles implements PackagedProfileResolver {
  fail = false;
  async resolve(expected: ReservedConsultationSlot["profile"]): Promise<PackagedProfileSnapshot> {
    if (this.fail) throw new Error("profile missing");
    return { ...expected, instructionsSource: `profiles/${expected.id}/AGENTS.md`, catalogVersion: "1.0.0", loadedProfileProof: "not_observed" };
  }
}

function setup(clock = { value: now }, onWait?: () => void | Promise<void>) {
  const repository = new MemoryRepository();
  const sessions = new Sessions();
  const events = new Events();
  const profiles = new Profiles();
  const agent = {
    id: slot.reservedExecutiveAgentId,
    companyId: slot.companyId,
    name: "Product Advisor",
    role: "pm",
    title: "Product Advisor",
    status: "idle",
    adapterType: "codex_local",
    adapterConfig: { timeoutSec: 300 },
    runtimeConfig: { heartbeat: { wakeOnDemand: true, maxConcurrentRuns: 1, maxDailyRuns: 2, maxDailyCostCents: 100 } },
  };
  const service = new L03ContributionService(
    repository, sessions, { get: async () => agent }, events, profiles, () => clock.value,
    async () => { await onWait?.(); },
  );
  return { repository, sessions, events, profiles, agent, service, clock };
}

async function reserveAndGrant(current: ReturnType<typeof setup>, grantOverrides: Record<string, unknown> = {}) {
  const waiting = await current.service.handleReserved(councilEvent(COUNCIL_RESERVATION_EVENT, slot));
  const grant = {
    schemaVersion: "council-opinion-admission-grant.v1",
    requestId: waiting.requestId,
    grantId: "00000000-0000-4000-8000-000000000030",
    grantedAt: "2026-09-30T11:59:59.000Z",
    expiresAt: "2026-09-30T12:00:30.000Z",
    slot,
    slotHash: sha256Canonical(slot),
    ...grantOverrides,
  };
  return current.service.handleAdmissionGrant(councilEvent(COUNCIL_ADMISSION_GRANT_EVENT, grant));
}

describe("Executive L03 Council-reserved contribution", () => {
  it("rejects unauthenticated plugin actors and company mismatches before persistence or dispatch", async () => {
    for (const event of [
      councilEvent(COUNCIL_RESERVATION_EVENT, slot, { actorType: "user", actorId: "owner" }),
      councilEvent(COUNCIL_RESERVATION_EVENT, slot, { actorId: "another.plugin" }),
      councilEvent(COUNCIL_RESERVATION_EVENT, slot, { companyId: "00000000-0000-4000-8000-000000000099" }),
    ]) {
      const current = setup();
      await expect(current.service.handleReserved(event)).rejects.toThrow();
      expect(current.repository.records.size).toBe(0);
      expect(current.sessions.sends).toBe(0);
    }
  });

  it("requires a fresh bounded grant and atomically sends concurrent duplicates once", async () => {
    const current = setup();
    const waiting = await current.service.handleReserved(councilEvent(COUNCIL_RESERVATION_EVENT, slot));
    const grant = {
      schemaVersion: "council-opinion-admission-grant.v1",
      requestId: waiting.requestId,
      grantId: "00000000-0000-4000-8000-000000000030",
      grantedAt: "2026-09-30T11:59:59.000Z",
      expiresAt: "2026-09-30T12:00:30.000Z",
      slot,
      slotHash: sha256Canonical(slot),
    };
    const event = councilEvent(COUNCIL_ADMISSION_GRANT_EVENT, grant);
    const [first, duplicate] = await Promise.all([
      current.service.handleAdmissionGrant(event),
      current.service.handleAdmissionGrant(event),
    ]);
    expect(first.contributionId).toBe(duplicate.contributionId);
    expect(current.sessions.creates).toBe(1);
    expect(current.sessions.sends).toBe(1);

    const expired = setup();
    const pending = await expired.service.handleReserved(councilEvent(COUNCIL_RESERVATION_EVENT, slot));
    await expect(expired.service.handleAdmissionGrant(councilEvent(COUNCIL_ADMISSION_GRANT_EVENT, {
      ...grant,
      requestId: pending.requestId,
      expiresAt: "2026-09-30T12:00:00.000Z",
    }))).rejects.toThrow("expired");
    expect(expired.sessions.sends).toBe(0);
  });

  it("rechecks persisted grant expiry immediately before native send", async () => {
    const clock = { value: now };
    const current = setup(clock);
    current.sessions.afterCreate = () => { clock.value = new Date("2026-09-30T12:00:31.000Z"); };

    const result = await reserveAndGrant(current);

    expect(current.sessions.creates).toBe(1);
    expect(current.sessions.sends).toBe(0);
    expect(result.status).toBe("failed");
    expect(result.error).toContain("expired before native send");
  });

  it("rejects a missing packaged profile and a source hash mismatch before claim or native session", async () => {
    const missing = setup();
    missing.profiles.fail = true;
    await expect(reserveAndGrant(missing)).rejects.toThrow("profile missing");
    expect(missing.sessions.creates).toBe(0);

    const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
    const resolver = new FilePackagedProfileResolver(packageRoot);
    await expect(resolver.resolve(slot.profile)).resolves.toMatchObject({ id: "product", version: "1.0.0", sourceHash: profileHash });
    await expect(resolver.resolve({ ...slot.profile, sourceHash: "0".repeat(64) })).rejects.toThrow("source hash");
  });

  it("rejects unknown criterion and evidence references in terminal output", () => {
    expect(() => parseL03OpinionResult(JSON.stringify({
      ...opinion,
      findings: [{ ...opinion.findings[0], criterionRef: "UNKNOWN" }],
    }), slot)).toThrow("criterionRef is not reserved");
    expect(() => parseL03OpinionResult(JSON.stringify({
      ...opinion,
      findings: [{ ...opinion.findings[0], evidenceRefs: ["UNKNOWN"] }],
    }), slot)).toThrow("unreserved reference");
  });

  it("marks an interrupted admitted record unknown and never resends it under a replayed grant", async () => {
    const current = setup();
    const first = await reserveAndGrant(current);
    expect(first.status).toBe("running");
    await current.repository.markInterruptedUnknown(slot.companyId);
    const interrupted = await current.repository.get(slot.companyId, first.contributionId);
    expect(interrupted?.status).toBe("outcome_unknown");

    const request = await current.repository.getByReservation(slot.companyId, slot.reservationId);
    await current.service.handleAdmissionGrant(councilEvent(COUNCIL_ADMISSION_GRANT_EVENT, {
      schemaVersion: "council-opinion-admission-grant.v1",
      requestId: request!.requestId,
      grantId: request!.grantId,
      grantedAt: "2026-09-30T11:59:59.000Z",
      expiresAt: "2026-09-30T12:00:30.000Z",
      slot,
      slotHash: sha256Canonical(slot),
    }));
    expect(current.sessions.creates).toBe(1);
    expect(current.sessions.sends).toBe(1);
    expect(current.events.calls.at(-1)?.name).toBe("opinion-observed.v1");
  });

  it("accepts only the returned session/run terminal correlation and emits an attributed observation", async () => {
    const current = setup();
    current.sessions.synchronousEvents = [
      {
        sessionId: "00000000-0000-4000-8000-000000000020",
        runId: "wrong-run",
        seq: 1,
        eventType: "done",
        stream: "stdout",
        message: JSON.stringify(opinion),
        payload: null,
      },
      {
        sessionId: "00000000-0000-4000-8000-000000000020",
        runId: "00000000-0000-4000-8000-000000000021",
        seq: 2,
        eventType: "done",
        stream: "stdout",
        message: JSON.stringify(opinion),
        payload: null,
      },
    ];
    const completed = await reserveAndGrant(current);
    expect(completed).toMatchObject({ status: "completed", opinion, runId: "00000000-0000-4000-8000-000000000021" });
    expect(current.events.calls.some((call) => call.name === "opinion-observed.v1")).toBe(false);
    await current.service.handleNativeRunTerminal(nativeTerminalEvent());
    const observed = current.events.calls.find((call) => call.name === "opinion-observed.v1");
    expect(observed?.payload).toMatchObject({
      requestId: completed.requestId,
      grantId: completed.grantId,
      reservationId: slot.reservationId,
      executiveAgentId: slot.reservedExecutiveAgentId,
      status: "completed",
      opinion,
    });

    const grantReplay = councilEvent(COUNCIL_ADMISSION_GRANT_EVENT, {
      schemaVersion: "council-opinion-admission-grant.v1",
      requestId: completed.requestId,
      grantId: completed.grantId,
      grantedAt: completed.grantGrantedAt,
      expiresAt: completed.grantExpiresAt,
      slot,
      slotHash: sha256Canonical(slot),
    });
    await current.service.handleAdmissionGrant(grantReplay);
    const observedPayloads = current.events.calls.filter((call) => call.name === "opinion-observed.v1").map((call) => call.payload);
    expect(observedPayloads).toHaveLength(2);
    expect(observedPayloads[1]).toEqual(observedPayloads[0]);
    expect(observedPayloads[0]).toMatchObject({ observedAt: completed.updatedAt });
  });

  it("persists admission routing errors instead of treating emit completion as peer acknowledgement", async () => {
    const current = setup();
    current.events.fail = true;
    await expect(current.service.handleReserved(councilEvent(COUNCIL_RESERVATION_EVENT, slot))).rejects.toThrow("without a delivery receipt");
    const persisted = await current.repository.getByReservation(slot.companyId, slot.reservationId);
    expect(persisted).toMatchObject({ status: "awaiting_grant" });
    expect(persisted?.admissionError).toContain("event bus unavailable");
    expect(current.sessions.sends).toBe(0);
  });

  it("publishes a callback-persisted result only from the later native terminal event", async () => {
    const current = setup();
    const running = await reserveAndGrant(current);
    expect(running.status).toBe("running");

    current.sessions.onEvent?.({
      sessionId: running.sessionId!, runId: running.runId!, seq: 1, eventType: "done", stream: "stdout",
      message: JSON.stringify(opinion), payload: null,
    });
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(await current.repository.get(slot.companyId, running.contributionId)).toMatchObject({ status: "completed", opinion });
    expect(current.events.calls.some((call) => call.name === "opinion-observed.v1")).toBe(false);

    await current.service.handleNativeRunTerminal(nativeTerminalEvent());
    expect(current.events.calls.filter((call) => call.name === "opinion-observed.v1")).toHaveLength(1);
    expect(current.sessions.sends).toBe(1);
  });

  it("waits boundedly for a racing callback and duplicate terminal notifications never resend", async () => {
    let current!: ReturnType<typeof setup>;
    let callbackDelivered = false;
    current = setup({ value: now }, async () => {
      if (!callbackDelivered) {
        callbackDelivered = true;
        const record = (await current.repository.list(slot.companyId))[0]!;
        current.sessions.onEvent?.({
          sessionId: record.sessionId!, runId: record.runId!, seq: 1, eventType: "done", stream: "stdout",
          message: JSON.stringify(opinion), payload: null,
        });
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    });
    const running = await reserveAndGrant(current);
    expect(running.status).toBe("running");

    await current.service.handleNativeRunTerminal(nativeTerminalEvent());
    await current.service.handleNativeRunTerminal(nativeTerminalEvent({ eventId: "00000000-0000-4000-8000-000000000041" }));
    expect(await current.repository.get(slot.companyId, running.contributionId)).toMatchObject({ status: "completed", opinion });
    expect(current.sessions.creates).toBe(1);
    expect(current.sessions.sends).toBe(1);
  });

  it("fails closed after the bounded terminal persistence wait", async () => {
    let waits = 0;
    const current = setup({ value: now }, () => { waits += 1; });
    await reserveAndGrant(current);

    await expect(current.service.handleNativeRunTerminal(nativeTerminalEvent())).rejects.toThrow(/bounded native-event wait/);
    expect(waits).toBe(80);
    expect(current.events.calls.some((call) => call.name === "opinion-observed.v1")).toBe(false);
    expect(current.sessions.creates).toBe(1);
    expect(current.sessions.sends).toBe(1);
  });

  it("rejects a spoofed correlated actor and silently ignores unrelated company and run terminals", async () => {
    const current = setup();
    const running = await reserveAndGrant(current);
    current.sessions.onEvent?.({
      sessionId: running.sessionId!, runId: running.runId!, seq: 1, eventType: "done", stream: "stdout",
      message: JSON.stringify(opinion), payload: null,
    });
    await new Promise((resolve) => setTimeout(resolve, 0));

    await expect(current.service.handleNativeRunTerminal(nativeTerminalEvent({ actorId: "spoofed-agent" }))).rejects.toThrow("inconsistent");
    await expect(current.service.handleNativeRunTerminal(nativeTerminalEvent({
      actorId: "spoofed-agent",
      payload: { runId: running.runId!, agentId: "spoofed-agent", status: "succeeded" },
    }))).rejects.toThrow("does not match");
    await expect(current.service.handleNativeRunTerminal(nativeTerminalEvent({
      companyId: "00000000-0000-4000-8000-000000000099",
    }))).resolves.toBeNull();
    await expect(current.service.handleNativeRunTerminal(nativeTerminalEvent({
      entityId: "wrong-run",
      payload: { runId: "wrong-run", agentId: slot.reservedExecutiveAgentId, status: "succeeded" },
    }))).resolves.toBeNull();
    expect(current.events.calls.some((call) => call.name === "opinion-observed.v1")).toBe(false);
    expect(current.sessions.sends).toBe(1);
  });
});

it("blocks missing native limits before grant acceptance and rechecks changes before physical send", async () => {
  const h = setup();
  h.agent.adapterConfig.timeoutSec = 0;
  await expect(reserveAndGrant(h)).rejects.toThrow(/positive timeout/);
  expect(h.sessions.creates).toBe(0); expect(h.sessions.sends).toBe(0);
  expect((await h.repository.list(slot.companyId))[0]?.grantId).toBeNull();
  const drift = setup();
  drift.sessions.afterCreate = () => { drift.agent.runtimeConfig.heartbeat.maxDailyRuns = 0; };
  const held = await reserveAndGrant(drift);
  expect(held.status).toBe("failed"); expect(drift.sessions.creates).toBe(1); expect(drift.sessions.sends).toBe(0);
});

it("does not consume an admission or call sessions when native on-demand wake is disabled", async () => {
  const h = setup(); h.agent.runtimeConfig.heartbeat.wakeOnDemand = false;
  await expect(reserveAndGrant(h)).rejects.toThrow(/on-demand wake/);
  expect(h.sessions.creates).toBe(0); expect(h.sessions.sends).toBe(0);
});
