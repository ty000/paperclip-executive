import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const bridge = vi.hoisted(() => ({
  data: null as unknown,
  refresh: vi.fn(),
  action: vi.fn(async () => ({})),
}));

vi.mock("@paperclipai/plugin-sdk/ui", () => ({
  usePluginData: () => ({ data: bridge.data, loading: false, error: null, refresh: bridge.refresh }),
  usePluginAction: () => bridge.action,
}));

import { ExecutivePage } from "../src/ui/index.js";

const context = {
  companyId: "company-1",
  companyPrefix: "acme",
  projectId: null,
  entityId: null,
  entityType: null,
  userId: "user-1",
  renderEnvironment: null,
};

function renderText(): string {
  return renderToStaticMarkup(<ExecutivePage context={context as never} />);
}

describe("Executive page", () => {
  it("renders unavailable configuration and keeps advice submission disabled", () => {
    bridge.data = {
      configuration: {
        configured: false, revision: 0, executiveAgentId: null, agentStatus: null,
        available: false, reason: "Configure an existing Executive agent before requesting advice.",
      },
      requests: [],
      contributions: [],
    };
    const output = renderText();
    expect(output).toContain("Save binding");
    expect(output).toContain("Unavailable");
    expect(output).toContain("Request advice");
    expect(output).toContain("disabled=\"\"");
    expect(output).toContain("No advice request has been persisted");
  });

  it("renders an attributed completed result with assumptions and limitations", () => {
    bridge.data = {
      configuration: {
        configured: true, revision: 1, executiveAgentId: "agent-1", agentStatus: "idle",
        available: true, reason: null,
      },
      requests: [{
        companyId: "company-1", contextId: "context-1", requestKey: "request-1", authorUserId: "user-1",
        question: "Choose A or B?", context: "", inputHash: "hash", revision: 1,
        sessionId: "session-1", runId: "run-1", status: "completed",
        result: { recommendation: "Choose B.", assumptions: ["B is reversible."], limitations: ["Cost is unknown."] },
        error: null, createdAt: "2026-09-30T00:00:00.000Z", updatedAt: "2026-09-30T00:00:01.000Z",
      }],
      contributions: [],
    };
    const output = renderText();
    expect(output).toContain("Ready for local dispatch");
    expect(output).toContain("Choose B.");
    expect(output).toContain("B is reversible.");
    expect(output).toContain("Cost is unknown.");
    expect(output).toContain("session-1");
    expect(output).toContain("run-1");
  });

  it("renders L02 controls, advisory wording, snapshots, attribution, categories, and explicit states", () => {
    const base = {
      companyId: "company-1", requestKey: "contribution-1", authorUserId: "user-1", inputHash: "hash", inputVersion: 1,
      issue: { id: "issue-1", identifier: "EXE-42", projectId: "project-distinctive", title: "Prepared ticket", description: "Distinctive issue description", status: "in_progress", executorAgentId: "executor-1", updatedAt: "2026-09-30T12:34:56.000Z" },
      source: { reference: "LIN-42", objective: "Deliver value", acceptanceCriteria: ["Distinctive criterion"], exclusions: ["Distinctive exclusion"], dependencies: ["Distinctive dependency"] },
      approach: { summary: "Build the slice", evidenceReferences: ["Distinctive evidence ref"], decisiveUnknowns: ["Distinctive unknown"], constraints: ["Distinctive constraint"] },
      contributor: { agentId: "contributor-1", name: "Reviewer", role: "engineer", title: "Reviewer", status: "idle", adapterType: "codex_local" },
      method: { id: "paperclip-executive.prepared-ticket-review", version: "1.0.0", profileRevision: "paperclip-executive-l02" },
      sessionId: "session-2", runId: "run-2", createdAt: "2026-09-30T00:00:00.000Z", updatedAt: "2026-09-30T00:00:01.000Z",
    };
    bridge.data = {
      configuration: { configured: true, revision: 1, executiveAgentId: "agent-1", agentStatus: "idle", available: true, reason: null },
      requests: [],
      contributions: [
        { ...base, contributionId: "completed", status: "completed", error: null, result: {
          schemaVersion: "prepared-ticket-contribution.v1", recommendation: "Proceed with the bounded slice.",
          perspectiveNotes: { product: "Product fit is clear.", technical: "Technical scope is sufficient.", delivery_cost: "Cost is unknown." },
          findings: [
            { id: "F-1", class: "must_fix", perspective: "technical", criterionRef: "A1", evidence: ["fixture"], reasons: ["Material risk"], smallestUsefulAction: "Add the missing check." },
            { id: "F-2", class: "useful_now", perspective: "product", criterionRef: "A3", evidence: [], reasons: ["Improves clarity"], smallestUsefulAction: "Clarify one criterion." },
            { id: "F-3", class: "defer", perspective: "delivery_cost", criterionRef: "Optional polish", evidence: [], reasons: ["Not required"], smallestUsefulAction: "Measure after use." },
          ], assumptions: ["Ticket is current."], limitations: ["Evidence was not independently verified."],
        } },
        { ...base, contributionId: "prepared", status: "prepared", sessionId: null, runId: null, result: null, error: null },
        { ...base, contributionId: "dispatching", status: "dispatching", runId: null, result: null, error: null },
        { ...base, contributionId: "running", status: "running", result: null, error: null },
        { ...base, contributionId: "failed", status: "failed", result: null, error: "Invalid output" },
        { ...base, contributionId: "unknown", status: "outcome_unknown", result: null, error: "Terminal outcome was not observed" },
      ],
    };
    const output = renderText();
    expect(output).toContain("Prepared-ticket approach contribution");
    expect(output).toContain("Advisory only."); expect(output).toContain("not a Council verdict");
    expect(output).toContain("Paperclip issue ID"); expect(output).toContain("Contributor agent ID");
    expect(output).toContain("New contribution key");
    expect(output).toContain("LIN-42"); expect(output).toContain("Reviewer"); expect(output).toContain("executor-1");
    expect(output).toContain("project-distinctive"); expect(output).toContain("Distinctive issue description");
    expect(output).toContain("Distinctive criterion"); expect(output).toContain("Distinctive exclusion"); expect(output).toContain("Distinctive dependency");
    expect(output).toContain("Distinctive evidence ref"); expect(output).toContain("Distinctive unknown"); expect(output).toContain("Distinctive constraint");
    expect(output).toContain("2026-09-30T12:34:56.000Z");
    expect(output).toContain("Must fix"); expect(output).toContain("Useful now"); expect(output).toContain("Defer");
    expect(output).toContain("Status: prepared"); expect(output).toContain("Status: dispatching"); expect(output).toContain("Status: running");
    expect(output).toContain("Status: failed"); expect(output).toContain("Status: Outcome unknown");
    expect(output).toContain("Visible failure or uncertainty"); expect(output).toContain("Snapshot warning");
  });
});
