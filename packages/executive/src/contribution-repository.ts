import type { PluginDatabaseClient } from "@paperclipai/plugin-sdk";
import type { ContributionRecord, ContributionRepository, ContributionResult, ContributionStatus } from "./contribution.js";

type Row = {
  company_id: string; contribution_id: string; request_key: string; author_user_id: string; input_hash: string; input_version: number;
  issue_snapshot: ContributionRecord["issue"]; source_snapshot: ContributionRecord["source"];
  approach_snapshot: ContributionRecord["approach"]; contributor_snapshot: ContributionRecord["contributor"];
  method_snapshot: ContributionRecord["method"]; session_id: string | null; run_id: string | null; status: ContributionStatus;
  result: ContributionResult | null; error: string | null; created_at: string | Date; updated_at: string | Date;
};
const timestamp = (value: string | Date) => value instanceof Date ? value.toISOString() : String(value);
const map = (row: Row): ContributionRecord => ({
  companyId: row.company_id, contributionId: row.contribution_id, requestKey: row.request_key, authorUserId: row.author_user_id,
  inputHash: row.input_hash, inputVersion: Number(row.input_version), issue: row.issue_snapshot, source: row.source_snapshot,
  approach: row.approach_snapshot, contributor: row.contributor_snapshot, method: row.method_snapshot,
  sessionId: row.session_id, runId: row.run_id, status: row.status, result: row.result, error: row.error,
  createdAt: timestamp(row.created_at), updatedAt: timestamp(row.updated_at),
});

export class SqlContributionRepository implements ContributionRepository {
  constructor(private readonly db: PluginDatabaseClient) {}
  private table(): string { return `${this.db.namespace}.prepared_ticket_contributions`; }

  async claim(input: Omit<ContributionRecord, "createdAt" | "updatedAt">): Promise<{ record: ContributionRecord; inserted: boolean }> {
    const result = await this.db.execute(
      `INSERT INTO ${this.table()}
       (company_id, contribution_id, request_key, author_user_id, input_hash, input_version,
        issue_snapshot, source_snapshot, approach_snapshot, contributor_snapshot, method_snapshot,
        session_id, run_id, status, result, error)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, $9::jsonb, $10::jsonb, $11::jsonb, $12, $13, $14, $15::jsonb, $16)
       ON CONFLICT (company_id, request_key) DO NOTHING`,
      [input.companyId, input.contributionId, input.requestKey, input.authorUserId, input.inputHash, input.inputVersion,
        JSON.stringify(input.issue), JSON.stringify(input.source), JSON.stringify(input.approach), JSON.stringify(input.contributor),
        JSON.stringify(input.method), input.sessionId, input.runId, input.status, input.result ? JSON.stringify(input.result) : null, input.error],
    );
    const rows = await this.db.query<Row>(
      `SELECT * FROM ${this.table()} WHERE company_id = $1 AND request_key = $2`, [input.companyId, input.requestKey],
    );
    if (!rows[0]) throw new Error("Contribution claim could not be read back");
    return { record: map(rows[0]), inserted: result.rowCount === 1 };
  }
  async get(companyId: string, contributionId: string): Promise<ContributionRecord | null> {
    const rows = await this.db.query<Row>(`SELECT * FROM ${this.table()} WHERE company_id = $1 AND contribution_id = $2`, [companyId, contributionId]);
    return rows[0] ? map(rows[0]) : null;
  }
  async getByRequestKey(companyId: string, requestKey: string): Promise<ContributionRecord | null> {
    const rows = await this.db.query<Row>(`SELECT * FROM ${this.table()} WHERE company_id = $1 AND request_key = $2`, [companyId, requestKey]);
    return rows[0] ? map(rows[0]) : null;
  }
  async list(companyId: string): Promise<ContributionRecord[]> {
    const rows = await this.db.query<Row>(`SELECT * FROM ${this.table()} WHERE company_id = $1 ORDER BY created_at DESC LIMIT 50`, [companyId]);
    return rows.map(map);
  }
  async markInterruptedUnknown(companyId: string): Promise<void> {
    await this.db.execute(
      `UPDATE ${this.table()} SET status = 'outcome_unknown',
       error = 'Worker restarted before a correlated terminal contribution was durably observed; inspect the recorded session/run before any new request.',
       updated_at = now() WHERE company_id = $1 AND status IN ('prepared', 'dispatching', 'running')`, [companyId],
    );
  }
  async markDispatching(companyId: string, contributionId: string, sessionId: string): Promise<void> {
    await this.transition(
      `UPDATE ${this.table()} SET session_id = $1, status = 'dispatching', updated_at = now()
       WHERE company_id = $2 AND contribution_id = $3 AND status = 'prepared'`, [sessionId, companyId, contributionId],
    );
  }
  async markRunning(companyId: string, contributionId: string, sessionId: string, runId: string): Promise<void> {
    const result = await this.db.execute(
      `UPDATE ${this.table()} SET run_id = $1, status = 'running', updated_at = now()
       WHERE company_id = $2 AND contribution_id = $3 AND session_id = $4 AND status IN ('dispatching', 'running')
         AND (run_id IS NULL OR run_id = $1)`, [runId, companyId, contributionId, sessionId],
    );
    if (result.rowCount > 1) throw new Error("Unexpected contribution transition cardinality");
  }
  async complete(companyId: string, contributionId: string, sessionId: string, runId: string, resultValue: ContributionResult): Promise<boolean> {
    const result = await this.db.execute(
      `UPDATE ${this.table()} SET run_id = $1, status = 'completed', result = $2::jsonb, error = NULL, updated_at = now()
       WHERE company_id = $3 AND contribution_id = $4 AND session_id = $5
         AND status IN ('dispatching', 'running', 'outcome_unknown') AND (run_id IS NULL OR run_id = $1)`,
      [runId, JSON.stringify(resultValue), companyId, contributionId, sessionId],
    );
    if (result.rowCount > 1) throw new Error("Unexpected contribution transition cardinality");
    return result.rowCount === 1;
  }
  async fail(companyId: string, contributionId: string, status: "failed" | "outcome_unknown", error: string, runId: string | null = null, sessionId: string | null = null): Promise<void> {
    const result = await this.db.execute(
      `UPDATE ${this.table()} SET status = $1, error = $2, run_id = COALESCE($3, run_id), session_id = COALESCE($4, session_id), updated_at = now()
       WHERE company_id = $5 AND contribution_id = $6 AND status NOT IN ('completed', 'failed')
         AND ($4::uuid IS NULL OR session_id IS NULL OR session_id = $4)
         AND ($3::uuid IS NULL OR run_id IS NULL OR run_id = $3)`,
      [status, error.slice(0, 4000), runId, sessionId, companyId, contributionId],
    );
    if (result.rowCount > 1) throw new Error("Unexpected contribution transition cardinality");
  }
  private async transition(sql: string, params: unknown[]): Promise<void> {
    const result = await this.db.execute(sql, params);
    if (result.rowCount !== 1) throw new Error("Contribution state changed concurrently; refresh before continuing");
  }
}
