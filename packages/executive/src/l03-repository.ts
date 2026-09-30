import type { PluginDatabaseClient } from "@paperclipai/plugin-sdk";
import type {
  L03ContributionRecord,
  L03ContributionRepository,
  L03ContributionStatus,
  L03ContributorSnapshot,
  L03Opinion,
  PackagedProfileSnapshot,
  ReservedConsultationSlot,
} from "./l03-contribution.js";

type Row = {
  company_id: string;
  contribution_id: string;
  reservation_id: string;
  mission_id: string;
  slot_id: string;
  reservation_version: number;
  trigger_event_id: string;
  trigger_hash: string;
  request_id: string;
  grant_id: string | null;
  grant_granted_at: string | Date | null;
  grant_expires_at: string | Date | null;
  slot_hash: string;
  slot_snapshot: ReservedConsultationSlot;
  input_hash: string | null;
  profile_snapshot: PackagedProfileSnapshot | null;
  contributor_snapshot: L03ContributorSnapshot | null;
  session_id: string | null;
  run_id: string | null;
  status: L03ContributionStatus;
  opinion: L03Opinion | null;
  error: string | null;
  admission_requested_at: string | Date | null;
  admission_error: string | null;
  observed_event_ref: string;
  observation_emitted_at: string | Date | null;
  observation_error: string | null;
  created_at: string | Date;
  updated_at: string | Date;
};

const timestamp = (value: string | Date): string => value instanceof Date ? value.toISOString() : String(value);
const optionalTimestamp = (value: string | Date | null): string | null => value === null ? null : timestamp(value);

function map(row: Row): L03ContributionRecord {
  return {
    companyId: row.company_id,
    contributionId: row.contribution_id,
    reservationId: row.reservation_id,
    missionId: row.mission_id,
    slotId: row.slot_id,
    reservationVersion: Number(row.reservation_version),
    triggerEventId: row.trigger_event_id,
    triggerHash: row.trigger_hash,
    requestId: row.request_id,
    grantId: row.grant_id,
    grantGrantedAt: optionalTimestamp(row.grant_granted_at),
    grantExpiresAt: optionalTimestamp(row.grant_expires_at),
    slotHash: row.slot_hash,
    slot: row.slot_snapshot,
    inputHash: row.input_hash,
    profile: row.profile_snapshot,
    contributor: row.contributor_snapshot,
    sessionId: row.session_id,
    runId: row.run_id,
    status: row.status,
    opinion: row.opinion,
    error: row.error,
    admissionRequestedAt: optionalTimestamp(row.admission_requested_at),
    admissionError: row.admission_error,
    observedEventRef: row.observed_event_ref,
    observationEmittedAt: optionalTimestamp(row.observation_emitted_at),
    observationError: row.observation_error,
    createdAt: timestamp(row.created_at),
    updatedAt: timestamp(row.updated_at),
  };
}

export class SqlL03ContributionRepository implements L03ContributionRepository {
  constructor(private readonly db: PluginDatabaseClient) {}

  private table(): string { return `${this.db.namespace}.council_contributions`; }

  async claimTrigger(input: Omit<L03ContributionRecord, "createdAt" | "updatedAt">): Promise<{ record: L03ContributionRecord; inserted: boolean }> {
    const result = await this.db.execute(
      `INSERT INTO ${this.table()}
       (company_id, contribution_id, reservation_id, mission_id, slot_id, reservation_version,
        trigger_event_id, trigger_hash, request_id, grant_id, grant_granted_at, grant_expires_at,
        slot_hash, slot_snapshot, input_hash,
        profile_snapshot, contributor_snapshot, session_id, run_id, status, opinion, error,
        admission_requested_at, admission_error, observed_event_ref, observation_emitted_at, observation_error)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14::jsonb,$15,$16::jsonb,$17::jsonb,$18,$19,$20,$21::jsonb,$22,$23,$24,$25,$26,$27)
       ON CONFLICT (company_id, reservation_id) DO NOTHING`,
      [
        input.companyId, input.contributionId, input.reservationId, input.missionId, input.slotId, input.reservationVersion,
        input.triggerEventId, input.triggerHash, input.requestId, input.grantId, input.grantGrantedAt, input.grantExpiresAt,
        input.slotHash, JSON.stringify(input.slot), input.inputHash,
        input.profile ? JSON.stringify(input.profile) : null, input.contributor ? JSON.stringify(input.contributor) : null,
        input.sessionId, input.runId, input.status, input.opinion ? JSON.stringify(input.opinion) : null, input.error,
        input.admissionRequestedAt, input.admissionError, input.observedEventRef, input.observationEmittedAt, input.observationError,
      ],
    );
    const inserted = result.rowCount === 1;
    const record = await this.getByReservation(input.companyId, input.reservationId);
    if (!record) throw new Error("Council contribution trigger claim could not be read back");
    return { record, inserted };
  }

  async get(companyId: string, contributionId: string): Promise<L03ContributionRecord | null> {
    const rows = await this.db.query<Row>(
      `SELECT * FROM ${this.table()} WHERE company_id = $1 AND contribution_id = $2`,
      [companyId, contributionId],
    );
    return rows[0] ? map(rows[0]) : null;
  }

  async getByReservation(companyId: string, reservationId: string): Promise<L03ContributionRecord | null> {
    const rows = await this.db.query<Row>(
      `SELECT * FROM ${this.table()} WHERE company_id = $1 AND reservation_id = $2`,
      [companyId, reservationId],
    );
    return rows[0] ? map(rows[0]) : null;
  }

  async getByRequest(companyId: string, requestId: string): Promise<L03ContributionRecord | null> {
    const rows = await this.db.query<Row>(
      `SELECT * FROM ${this.table()} WHERE company_id = $1 AND request_id = $2`,
      [companyId, requestId],
    );
    return rows[0] ? map(rows[0]) : null;
  }

  async list(companyId: string): Promise<L03ContributionRecord[]> {
    const rows = await this.db.query<Row>(
      `SELECT * FROM ${this.table()} WHERE company_id = $1 ORDER BY created_at DESC LIMIT 100`,
      [companyId],
    );
    return rows.map(map);
  }

  async markInterruptedUnknown(companyId: string): Promise<void> {
    await this.db.execute(
      `UPDATE ${this.table()} SET status = 'outcome_unknown',
       error = 'Worker restarted after admission and before a correlated terminal opinion was durably observed; no second session or send is permitted.',
       updated_at = now()
       WHERE company_id = $1 AND status IN ('prepared','dispatching','running')`,
      [companyId],
    );
  }

  async recordAdmissionRequest(companyId: string, contributionId: string, requestedAt: string, error: string | null): Promise<void> {
    const result = await this.db.execute(
      `UPDATE ${this.table()} SET admission_requested_at = $1, admission_error = $2, updated_at = now()
       WHERE company_id = $3 AND contribution_id = $4 AND status = 'awaiting_grant'`,
      [requestedAt, error?.slice(0, 4_000) ?? null, companyId, contributionId],
    );
    if (result.rowCount > 1) throw new Error("Unexpected admission request transition cardinality");
  }

  async acceptGrant(input: {
    companyId: string;
    contributionId: string;
    requestId: string;
    grantId: string;
    grantGrantedAt: string;
    grantExpiresAt: string;
    slotHash: string;
    inputHash: string;
    profile: PackagedProfileSnapshot;
    contributor: L03ContributorSnapshot;
  }): Promise<boolean> {
    const result = await this.db.execute(
      `UPDATE ${this.table()} SET grant_id = $1, grant_granted_at = $2, grant_expires_at = $3,
       input_hash = $4, profile_snapshot = $5::jsonb, contributor_snapshot = $6::jsonb,
       status = 'prepared', error = NULL, updated_at = now()
       WHERE company_id = $7 AND contribution_id = $8 AND request_id = $9 AND slot_hash = $10
         AND status = 'awaiting_grant' AND grant_id IS NULL`,
      [input.grantId, input.grantGrantedAt, input.grantExpiresAt, input.inputHash,
        JSON.stringify(input.profile), JSON.stringify(input.contributor),
        input.companyId, input.contributionId, input.requestId, input.slotHash],
    );
    if (result.rowCount > 1) throw new Error("Unexpected Council grant transition cardinality");
    return result.rowCount === 1;
  }

  async markDispatching(companyId: string, contributionId: string, sessionId: string): Promise<void> {
    await this.transition(
      `UPDATE ${this.table()} SET session_id = $1, status = 'dispatching', updated_at = now()
       WHERE company_id = $2 AND contribution_id = $3 AND status = 'prepared' AND grant_id IS NOT NULL`,
      [sessionId, companyId, contributionId],
    );
  }

  async markRunning(companyId: string, contributionId: string, sessionId: string, runId: string): Promise<void> {
    await this.transition(
      `UPDATE ${this.table()} SET run_id = $1, status = 'running', updated_at = now()
       WHERE company_id = $2 AND contribution_id = $3 AND session_id = $4
         AND status IN ('dispatching','running') AND (run_id IS NULL OR run_id = $1)`,
      [runId, companyId, contributionId, sessionId],
    );
  }

  async complete(companyId: string, contributionId: string, sessionId: string, runId: string, opinion: L03Opinion): Promise<boolean> {
    const result = await this.db.execute(
      `UPDATE ${this.table()} SET run_id = $1, status = 'completed', opinion = $2::jsonb, error = NULL, updated_at = now()
       WHERE company_id = $3 AND contribution_id = $4 AND session_id = $5
         AND status IN ('dispatching','running','outcome_unknown') AND (run_id IS NULL OR run_id = $1)`,
      [runId, JSON.stringify(opinion), companyId, contributionId, sessionId],
    );
    if (result.rowCount > 1) throw new Error("Unexpected Council contribution completion cardinality");
    return result.rowCount === 1;
  }

  async fail(
    companyId: string,
    contributionId: string,
    status: "failed" | "outcome_unknown",
    error: string,
    runId: string | null = null,
    sessionId: string | null = null,
  ): Promise<void> {
    const result = await this.db.execute(
      `UPDATE ${this.table()} SET status = $1, error = $2, run_id = COALESCE($3, run_id),
       session_id = COALESCE($4, session_id), updated_at = now()
       WHERE company_id = $5 AND contribution_id = $6 AND status NOT IN ('completed','failed')
         AND ($4::uuid IS NULL OR session_id IS NULL OR session_id = $4)
         AND ($3::uuid IS NULL OR run_id IS NULL OR run_id = $3)`,
      [status, error.slice(0, 4_000), runId, sessionId, companyId, contributionId],
    );
    if (result.rowCount > 1) throw new Error("Unexpected Council contribution failure cardinality");
  }

  async recordObservation(companyId: string, contributionId: string, emittedAt: string, error: string | null): Promise<void> {
    const result = await this.db.execute(
      `UPDATE ${this.table()} SET observation_emitted_at = $1, observation_error = $2, updated_at = now()
       WHERE company_id = $3 AND contribution_id = $4 AND status IN ('completed','failed','outcome_unknown')`,
      [emittedAt, error?.slice(0, 4_000) ?? null, companyId, contributionId],
    );
    if (result.rowCount > 1) throw new Error("Unexpected observation transition cardinality");
  }

  private async transition(sql: string, params: unknown[]): Promise<void> {
    const result = await this.db.execute(sql, params);
    if (result.rowCount !== 1) throw new Error("Council contribution state changed concurrently; no second dispatch was attempted");
  }
}
