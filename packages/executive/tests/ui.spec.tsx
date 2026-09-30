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
    };
    const output = renderText();
    expect(output).toContain("Ready for local dispatch");
    expect(output).toContain("Choose B.");
    expect(output).toContain("B is reversible.");
    expect(output).toContain("Cost is unknown.");
    expect(output).toContain("session-1");
    expect(output).toContain("run-1");
  });
});
