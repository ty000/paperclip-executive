import { createHash } from "node:crypto";
import { definePlugin, runWorker } from "@paperclipai/plugin-sdk";
import { AdviceService, assertUnambiguousCompanyOwner, type VerifiedActor } from "./advice.js";
import { SqlAdviceRepository } from "./repository.js";

function stringField(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

const plugin = definePlugin({
  async setup(ctx) {
    const repository = new SqlAdviceRepository(ctx.db);
    const service = new AdviceService(repository, ctx.agents.sessions, (input) => createHash("sha256").update(input).digest("hex"));
    const companyReconciliations = new Map<string, Promise<void>>();
    const reconcileCompanyStart = async (companyId: string) => {
      let reconciliation = companyReconciliations.get(companyId);
      if (!reconciliation) {
        reconciliation = repository.markInterruptedUnknown(companyId);
        companyReconciliations.set(companyId, reconciliation);
        void reconciliation.catch(() => {
          if (companyReconciliations.get(companyId) === reconciliation) companyReconciliations.delete(companyId);
        });
      }
      await reconciliation;
    };

    ctx.data.register("advice-state", async (params) => {
      const companyId = stringField(params.companyId);
      if (!companyId) throw new Error("A host-authorized company is required");
      await reconcileCompanyStart(companyId);
      const settings = await repository.getSettings(companyId);
      const agent = settings ? await ctx.agents.get(settings.executiveAgentId, companyId) : null;
      const available = Boolean(agent && (agent.status === "idle" || agent.status === "running"));
      return {
        configuration: {
          configured: Boolean(settings), revision: settings?.revision ?? 0,
          executiveAgentId: settings?.executiveAgentId ?? null, agentStatus: agent?.status ?? null, available,
          reason: !settings
            ? "Configure an existing Executive agent before requesting advice."
            : !agent
              ? "The configured agent is not available in this company."
              : !available
                ? `The configured agent is ${agent.status}; activate it explicitly in Paperclip before use.`
                : null,
        },
        requests: await repository.list(companyId),
      };
    });

    ctx.actions.register("configure-executive", async (params, context) => {
      const companyId = context.companyId;
      const agentId = stringField(params.executiveAgentId);
      if (!companyId || !agentId) throw new Error("Company and Executive agent are required");
      await reconcileCompanyStart(companyId);
      const owner = assertUnambiguousCompanyOwner(
        context.actor as VerifiedActor,
        await ctx.access.members.list({ companyId }),
      );
      const agent = await ctx.agents.get(agentId, companyId);
      if (!agent) throw new Error("The selected Executive agent does not belong to this company");
      return service.configure({ ...context.actor, ...owner, verifiedCompanyOwner: true } as VerifiedActor, {
        executiveAgentId: agentId, expectedRevision: params.expectedRevision,
      });
    });

    ctx.actions.register("submit-advice", async (params, context) => {
      const companyId = context.companyId;
      if (!companyId) throw new Error("A host-authorized company is required");
      await reconcileCompanyStart(companyId);
      const owner = assertUnambiguousCompanyOwner(
        context.actor as VerifiedActor,
        await ctx.access.members.list({ companyId }),
      );
      const settings = await repository.getSettings(companyId);
      if (!settings) throw new Error("Executive is not configured for this company");
      const agent = await ctx.agents.get(settings.executiveAgentId, companyId);
      if (!agent || (agent.status !== "idle" && agent.status !== "running")) {
        throw new Error("The configured Executive agent is unavailable; no request was dispatched");
      }
      return service.submit({ ...context.actor, ...owner, verifiedCompanyOwner: true } as VerifiedActor, {
        requestKey: params.requestKey, question: params.question, context: params.context,
      });
    });

    ctx.logger.info("Paperclip Executive worker ready", { databaseNamespace: ctx.db.namespace });
  },
  async onHealth() {
    return {
      status: "ok", message: "Paperclip Executive worker is ready for explicit company configuration",
      details: { journey: "L01 direct advice", automaticProvisioning: false },
    };
  },
});

export default plugin;
runWorker(plugin, import.meta.url);
