import type { PluginDatabaseClient } from "@paperclipai/plugin-sdk";
import type { AdviceRecord, AdviceRepository, AdviceResult, AdviceStatus, ExecutiveSettings } from "./advice.js";

type SettingsRow = { company_id: string; owner_user_id: string; executive_agent_id: string; revision: number };
type AdviceRow = {
  company_id: string; context_id: string; request_key: string; author_user_id: string;
  question: string; context_text: string; input_hash: string; revision: number;
  session_id: string | null; run_id: string | null; status: AdviceStatus;
  result: AdviceResult | null; error: string | null; created_at: string | Date; updated_at: string | Date;
};

const timestamp = (value: string | Date) => value instanceof Date ? value.toISOString() : String(value);
const mapSettings = (row: SettingsRow): ExecutiveSettings => ({
  companyId: row.company_id, ownerUserId: row.owner_user_id,
  executiveAgentId: row.executive_agent_id, revision: Number(row.revision),
});
const mapAdvice = (row: AdviceRow): AdviceRecord => ({
  companyId: row.company_id, contextId: row.context_id, requestKey: row.request_key,
  authorUserId: row.author_user_id, question: row.question, context: row.context_text,
  inputHash: row.input_hash, revision: Number(row.revision), sessionId: row.session_id,
  runId: row.run_id, status: row.status, result: row.result, error: row.error,
  createdAt: timestamp(row.created_at), updatedAt: timestamp(row.updated_at),
});

export class SqlAdviceRepository implements AdviceRepository {
  constructor(private readonly db: PluginDatabaseClient) {}
  private table(name: "company_settings" | "advice_contexts"): string { return `${this.db.namespace}.${name}`; }

  async getSettings(companyId: string): Promise<ExecutiveSettings | null> {
    const rows = await this.db.query<SettingsRow>(
      `SELECT company_id, owner_user_id, executive_agent_id, revision FROM ${this.table("company_settings")} WHERE company_id = $1`,
      [companyId],
    );
    return rows[0] ? mapSettings(rows[0]) : null;
  }

  async saveSettings(input: { companyId: string; ownerUserId: string; executiveAgentId: string; expectedRevision: number }): Promise<ExecutiveSettings> {
    const result = input.expectedRevision === 0
      ? await this.db.execute(
          `INSERT INTO ${this.table("company_settings")} (company_id, owner_user_id, executive_agent_id, revision)
           VALUES ($1, $2, $3, 1) ON CONFLICT (company_id) DO NOTHING`,
          [input.companyId, input.ownerUserId, input.executiveAgentId],
        )
      : await this.db.execute(
          `UPDATE ${this.table("company_settings")}
           SET owner_user_id = $1, executive_agent_id = $2, revision = revision + 1, updated_at = now()
           WHERE company_id = $3 AND revision = $4`,
          [input.ownerUserId, input.executiveAgentId, input.companyId, input.expectedRevision],
        );
    if (result.rowCount !== 1) throw new Error("Stale settings revision; refresh and review");
    const saved = await this.getSettings(input.companyId);
    if (!saved) throw new Error("Executive settings were not persisted");
    return saved;
  }

  async findByRequestKey(companyId: string, requestKey: string): Promise<AdviceRecord | null> {
    const rows = await this.db.query<AdviceRow>(
      `SELECT * FROM ${this.table("advice_contexts")} WHERE company_id = $1 AND request_key = $2`, [companyId, requestKey],
    );
    return rows[0] ? mapAdvice(rows[0]) : null;
  }
  async get(companyId: string, contextId: string): Promise<AdviceRecord | null> {
    const rows = await this.db.query<AdviceRow>(
      `SELECT * FROM ${this.table("advice_contexts")} WHERE company_id = $1 AND context_id = $2`, [companyId, contextId],
    );
    return rows[0] ? mapAdvice(rows[0]) : null;
  }
  async list(companyId: string): Promise<AdviceRecord[]> {
    const rows = await this.db.query<AdviceRow>(
      `SELECT * FROM ${this.table("advice_contexts")} WHERE company_id = $1 ORDER BY created_at DESC LIMIT 50`, [companyId],
    );
    return rows.map(mapAdvice);
  }

  async markInterruptedUnknown(companyId: string): Promise<void> {
    await this.db.execute(
      `UPDATE ${this.table("advice_contexts")}
       SET status = 'outcome_unknown',
           error = 'Worker restarted before a terminal result was durably observed; reconcile the recorded run before any new dispatch.',
           updated_at = now()
       WHERE company_id = $1 AND status IN ('pending', 'dispatching', 'running')`,
      [companyId],
    );
  }

  async create(input: Omit<AdviceRecord, "createdAt" | "updatedAt">): Promise<AdviceRecord> {
    const result = await this.db.execute(
      `INSERT INTO ${this.table("advice_contexts")}
       (company_id, context_id, request_key, author_user_id, question, context_text, input_hash, revision, session_id, run_id, status, result, error)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb, $13)`,
      [input.companyId, input.contextId, input.requestKey, input.authorUserId, input.question, input.context,
        input.inputHash, input.revision, input.sessionId, input.runId, input.status,
        input.result ? JSON.stringify(input.result) : null, input.error],
    );
    if (result.rowCount !== 1) throw new Error("Advice request was not persisted");
    const saved = await this.get(input.companyId, input.contextId);
    if (!saved) throw new Error("Advice request could not be read back");
    return saved;
  }

  async markDispatching(companyId: string, contextId: string, sessionId: string): Promise<void> {
    await this.transition(
      `UPDATE ${this.table("advice_contexts")} SET session_id = $1, status = 'dispatching', updated_at = now()
       WHERE company_id = $2 AND context_id = $3 AND status = 'pending'`, [sessionId, companyId, contextId],
    );
  }
  async markRunning(companyId: string, contextId: string, runId: string): Promise<void> {
    const result = await this.db.execute(
      `UPDATE ${this.table("advice_contexts")} SET run_id = $1, status = 'running', updated_at = now()
       WHERE company_id = $2 AND context_id = $3 AND status IN ('dispatching', 'running')`, [runId, companyId, contextId],
    );
    if (result.rowCount > 1) throw new Error("Unexpected advice transition cardinality");
  }
  async complete(companyId: string, contextId: string, runId: string, result: AdviceResult): Promise<void> {
    await this.transition(
      `UPDATE ${this.table("advice_contexts")}
       SET run_id = $1, status = 'completed', result = $2::jsonb, error = NULL, updated_at = now()
       WHERE company_id = $3 AND context_id = $4 AND status IN ('dispatching', 'running', 'outcome_unknown')`,
      [runId, JSON.stringify(result), companyId, contextId],
    );
  }
  async fail(
    companyId: string,
    contextId: string,
    status: "failed" | "outcome_unknown",
    error: string,
    runId: string | null = null,
  ): Promise<void> {
    const result = await this.db.execute(
      `UPDATE ${this.table("advice_contexts")}
       SET status = $1, error = $2, run_id = COALESCE($3, run_id), updated_at = now()
       WHERE company_id = $4 AND context_id = $5 AND status NOT IN ('completed', 'failed')`,
      [status, error.slice(0, 4000), runId, companyId, contextId],
    );
    if (result.rowCount > 1) throw new Error("Unexpected advice transition cardinality");
  }
  private async transition(sql: string, params: unknown[]): Promise<void> {
    const result = await this.db.execute(sql, params);
    if (result.rowCount !== 1) throw new Error("Advice state changed concurrently; refresh before continuing");
  }
}
