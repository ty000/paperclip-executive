import { randomUUID } from "node:crypto";
import type { AgentSessionEvent } from "@paperclipai/plugin-sdk";

export type AdviceStatus = "pending" | "dispatching" | "running" | "completed" | "failed" | "outcome_unknown";

export type AdviceResult = {
  recommendation: string;
  assumptions: string[];
  limitations: string[];
};

export type ExecutiveSettings = {
  companyId: string;
  ownerUserId: string;
  executiveAgentId: string;
  revision: number;
};

export type AdviceRecord = {
  companyId: string;
  contextId: string;
  requestKey: string;
  authorUserId: string;
  question: string;
  context: string;
  inputHash: string;
  revision: number;
  sessionId: string | null;
  runId: string | null;
  status: AdviceStatus;
  result: AdviceResult | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
};

export type VerifiedActor = {
  type: "user" | "agent" | "system";
  userId: string | null;
  companyId: string | null;
  verifiedCompanyOwner?: boolean;
};

export type OwnerMembership = {
  companyId: string;
  principalType: string;
  principalId: string;
  status: string;
  membershipRole: string | null;
};

export interface AdviceRepository {
  getSettings(companyId: string): Promise<ExecutiveSettings | null>;
  saveSettings(input: {
    companyId: string;
    ownerUserId: string;
    executiveAgentId: string;
    expectedRevision: number;
  }): Promise<ExecutiveSettings>;
  findByRequestKey(companyId: string, requestKey: string): Promise<AdviceRecord | null>;
  get(companyId: string, contextId: string): Promise<AdviceRecord | null>;
  list(companyId: string): Promise<AdviceRecord[]>;
  markInterruptedUnknown(companyId: string): Promise<void>;
  create(input: Omit<AdviceRecord, "createdAt" | "updatedAt">): Promise<AdviceRecord>;
  markDispatching(companyId: string, contextId: string, sessionId: string): Promise<void>;
  markRunning(companyId: string, contextId: string, runId: string): Promise<void>;
  complete(companyId: string, contextId: string, runId: string, result: AdviceResult): Promise<void>;
  fail(
    companyId: string,
    contextId: string,
    status: "failed" | "outcome_unknown",
    error: string,
    runId?: string | null,
  ): Promise<void>;
}

export interface SessionClient {
  create(agentId: string, companyId: string, options: { taskKey: string; reason: string }): Promise<{ sessionId: string }>;
  sendMessage(
    sessionId: string,
    companyId: string,
    options: { prompt: string; reason: string; onEvent: (event: AgentSessionEvent) => void },
  ): Promise<{ runId: string }>;
}

function requiredText(value: unknown, label: string, maxLength: number): string {
  if (typeof value !== "string" || value.trim().length === 0) throw new Error(`${label} is required`);
  const text = value.trim();
  if (text.length > maxLength) throw new Error(`${label} exceeds ${maxLength} characters`);
  return text;
}

function verifiedOwner(actor: VerifiedActor): { companyId: string; userId: string } {
  if (actor.type !== "user" || !actor.userId || !actor.companyId || actor.verifiedCompanyOwner !== true) {
    throw new Error("An authenticated and verified company owner is required");
  }
  return { companyId: actor.companyId, userId: actor.userId };
}

export function assertUnambiguousCompanyOwner(
  actor: VerifiedActor,
  memberships: OwnerMembership[],
): { companyId: string; userId: string } {
  if (actor.type !== "user" || !actor.userId || !actor.companyId) {
    throw new Error("An authenticated board user and company are required");
  }
  const identity = { companyId: actor.companyId, userId: actor.userId };
  const matches = memberships.filter((membership) =>
    membership.companyId === identity.companyId &&
    membership.principalType === "user" &&
    membership.principalId === identity.userId &&
    membership.status === "active" &&
    membership.membershipRole === "owner"
  );
  if (matches.length !== 1) {
    throw new Error("The authenticated user's company-owner identity is missing or ambiguous");
  }
  return identity;
}

export function parseAdviceResult(message: string | null): AdviceResult {
  if (!message) throw new Error("The Executive run completed without a response");
  const candidate = message.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1] ?? message;
  let parsed: unknown;
  try {
    parsed = JSON.parse(candidate.trim());
  } catch {
    throw new Error("The Executive response did not match the required JSON contract");
  }
  const value = parsed as Record<string, unknown>;
  const recommendation = requiredText(value.recommendation, "recommendation", 20_000);
  const stringList = (field: "assumptions" | "limitations") => {
    if (!Array.isArray(value[field]) || value[field].some((item) => typeof item !== "string")) {
      throw new Error(`${field} must be an array of strings`);
    }
    return (value[field] as string[]).map((item) => item.trim()).filter(Boolean).slice(0, 20);
  };
  return { recommendation, assumptions: stringList("assumptions"), limitations: stringList("limitations") };
}

export function buildAdvicePrompt(record: AdviceRecord): string {
  return [
    "Provide direct executive advice for the authenticated owner request below.",
    "This is advice only. Do not create, assign, authorize, send, purchase, publish, or schedule anything.",
    "Use only the supplied context. Do not claim access to company facts that are not present.",
    "Return exactly one JSON object with this shape:",
    '{"recommendation":"...","assumptions":["..."],"limitations":["..."]}',
    "The recommendation should lead with the direction and explain the decisive trade-offs.",
    "Assumptions must include facts that could change the recommendation.",
    "Limitations must identify missing evidence, professional boundaries, or execution that remains unauthorized.",
    "",
    `Request correlation: ${record.requestKey}`,
    `Input revision: ${record.revision}`,
    `Question: ${record.question}`,
    `Context: ${record.context || "No additional context was supplied."}`,
  ].join("\n");
}

export class AdviceService {
  constructor(
    private readonly repository: AdviceRepository,
    private readonly sessions: SessionClient,
    private readonly hashInput: (text: string) => string,
  ) {}

  async configure(
    actor: VerifiedActor,
    input: { executiveAgentId: unknown; expectedRevision: unknown },
  ): Promise<ExecutiveSettings> {
    const { companyId, userId } = verifiedOwner(actor);
    const executiveAgentId = requiredText(input.executiveAgentId, "executiveAgentId", 200);
    const expectedRevision = Number(input.expectedRevision);
    if (!Number.isInteger(expectedRevision) || expectedRevision < 0) {
      throw new Error("expectedRevision must be a non-negative integer");
    }
    const current = await this.repository.getSettings(companyId);
    if (!current && expectedRevision !== 0) throw new Error("Stale settings revision; refresh and review");
    return this.repository.saveSettings({ companyId, ownerUserId: userId, executiveAgentId, expectedRevision });
  }

  async submit(
    actor: VerifiedActor,
    input: { requestKey: unknown; question: unknown; context?: unknown },
  ): Promise<AdviceRecord> {
    const { companyId, userId } = verifiedOwner(actor);
    const settings = await this.repository.getSettings(companyId);
    if (!settings) throw new Error("Executive is not configured for this company");
    if (settings.ownerUserId !== userId) throw new Error("Only the configured company owner can request advice");

    const requestKey = requiredText(input.requestKey, "requestKey", 200);
    const question = requiredText(input.question, "question", 10_000);
    const context = typeof input.context === "string" ? input.context.trim().slice(0, 30_000) : "";
    const inputHash = this.hashInput(JSON.stringify({ question, context }));
    const existing = await this.repository.findByRequestKey(companyId, requestKey);
    if (existing) {
      if (existing.inputHash !== inputHash) throw new Error("This request key is already bound to different input");
      return existing;
    }

    const created = await this.repository.create({
      companyId,
      contextId: randomUUID(),
      requestKey,
      authorUserId: userId,
      question,
      context,
      inputHash,
      revision: 1,
      sessionId: null,
      runId: null,
      status: "pending",
      result: null,
      error: null,
    });

    let sessionId: string | null = null;
    let runId: string | null = null;
    try {
      const session = await this.sessions.create(settings.executiveAgentId, companyId, {
        taskKey: `plugin:paperclip-executive.executive:session:advice:${created.contextId}:rev:${created.revision}`,
        reason: `paperclip-executive:advice:${created.contextId}`,
      });
      sessionId = session.sessionId;
      await this.repository.markDispatching(companyId, created.contextId, sessionId);
      const sent = await this.sessions.sendMessage(sessionId, companyId, {
        prompt: buildAdvicePrompt(created),
        reason: `paperclip-executive:advice:${created.contextId}`,
        onEvent: (event) => {
          if (event.eventType === "done") {
            void (async () => {
              try {
                await this.repository.complete(companyId, created.contextId, event.runId, parseAdviceResult(event.message));
              } catch (error) {
                await this.repository.fail(companyId, created.contextId, "failed", safeError(error), event.runId);
              }
            })();
          } else if (event.eventType === "error") {
            void this.repository.fail(
              companyId,
              created.contextId,
              "failed",
              event.message ?? "The Executive run failed",
              event.runId,
            );
          }
        },
      });
      runId = sent.runId;
      await this.repository.markRunning(companyId, created.contextId, runId);
    } catch (error) {
      await this.repository.fail(
        companyId,
        created.contextId,
        "outcome_unknown",
        sessionId
          ? `Dispatch may have reached Paperclip: ${safeError(error)}`
          : `Session creation outcome is unknown: ${safeError(error)}`,
        runId,
      );
    }
    return (await this.repository.get(companyId, created.contextId)) ?? created;
  }
}

export function safeError(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}
