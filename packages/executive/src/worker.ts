import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { definePlugin, runWorker } from "@paperclipai/plugin-sdk";
import { AdviceService, assertUnambiguousCompanyOwner, type VerifiedActor } from "./advice.js";
import { SqlAdviceRepository } from "./repository.js";
import { ContributionService } from "./contribution.js";
import { SqlContributionRepository } from "./contribution-repository.js";
import {
  COUNCIL_ADMISSION_GRANT_EVENT,
  COUNCIL_RESERVATION_EVENT,
  FilePackagedProfileResolver,
  L03ContributionService,
} from "./l03-contribution.js";
import { SqlL03ContributionRepository } from "./l03-repository.js";

function stringField(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

const plugin = definePlugin({
  async setup(ctx) {
    const repository = new SqlAdviceRepository(ctx.db);
    const service = new AdviceService(repository, ctx.agents.sessions, (input) => createHash("sha256").update(input).digest("hex"));
    const contributionRepository = new SqlContributionRepository(ctx.db);
    const contributionService = new ContributionService(
      contributionRepository, ctx.agents.sessions, ctx.issues, ctx.agents,
      (input) => createHash("sha256").update(input).digest("hex"),
    );
    const l03Repository = new SqlL03ContributionRepository(ctx.db);
    const l03Service = new L03ContributionService(
      l03Repository,
      ctx.agents.sessions,
      ctx.agents,
      ctx.events,
      new FilePackagedProfileResolver(fileURLToPath(new URL("..", import.meta.url))),
    );
    const companyReconciliations = new Map<string, Promise<void>>();
    const reconcileCompanyStart = async (companyId: string) => {
      let reconciliation = companyReconciliations.get(companyId);
      if (!reconciliation) {
        reconciliation = Promise.all([
          repository.markInterruptedUnknown(companyId),
          contributionRepository.markInterruptedUnknown(companyId),
          l03Repository.markInterruptedUnknown(companyId),
        ]).then(() => undefined);
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
        contributions: await contributionRepository.list(companyId),
        councilContributions: await l03Repository.list(companyId),
      };
    });

    ctx.events.on(COUNCIL_RESERVATION_EVENT, async (event) => {
      try {
        await reconcileCompanyStart(event.companyId);
        await l03Service.handleReserved(event);
      } catch (error) {
        ctx.logger.error("Council reservation event was rejected", {
          eventId: event.eventId,
          companyId: event.companyId,
          error: error instanceof Error ? error.message : "Unknown error",
        });
        throw error;
      }
    });

    ctx.events.on(COUNCIL_ADMISSION_GRANT_EVENT, async (event) => {
      try {
        await reconcileCompanyStart(event.companyId);
        await l03Service.handleAdmissionGrant(event);
      } catch (error) {
        ctx.logger.error("Council admission grant was rejected", {
          eventId: event.eventId,
          companyId: event.companyId,
          error: error instanceof Error ? error.message : "Unknown error",
        });
        throw error;
      }
    });

    ctx.actions.register("submit-contribution", async (params, context) => {
      const companyId = context.companyId;
      if (!companyId) throw new Error("A host-authorized company is required");
      await reconcileCompanyStart(companyId);
      const owner = assertUnambiguousCompanyOwner(
        context.actor as VerifiedActor,
        await ctx.access.members.list({ companyId }),
      );
      return contributionService.submit(
        { ...context.actor, ...owner, verifiedCompanyOwner: true } as VerifiedActor,
        params as Parameters<ContributionService["submit"]>[1],
      );
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
      details: {
        journeys: ["L01 direct advice", "L02 prepared-ticket contribution", "L03 Council-reserved opinion"],
        automaticProvisioning: false,
      },
    };
  },
});

export default plugin;
runWorker(plugin, import.meta.url);
