import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { SqlL03ContributionRepository } from "../src/l03-repository.js";

describe("Executive L03 SQL persistence", () => {
  it("accepts exactly one fresh grant with a status and identity CAS", async () => {
    for (const rowCount of [0, 1, 2]) {
      const calls: Array<{ sql: string; params?: unknown[] }> = [];
      const repository = new SqlL03ContributionRepository({
        namespace: "plugin_executive_test",
        execute: async (sql, params) => { calls.push({ sql, params }); return { rowCount }; },
        query: async <T>() => [] as T[],
      });
      const operation = repository.acceptGrant({
        companyId: "00000000-0000-4000-8000-000000000001",
        contributionId: "00000000-0000-4000-8000-000000000002",
        requestId: "00000000-0000-4000-8000-000000000003",
        grantId: "00000000-0000-4000-8000-000000000004",
        grantGrantedAt: "2026-09-30T11:59:59.000Z",
        grantExpiresAt: "2026-09-30T12:00:30.000Z",
        slotHash: "a".repeat(64),
        inputHash: "b".repeat(64),
        profile: { id: "product", version: "1.0.0", sourceHash: "c".repeat(64), instructionsSource: "profiles/product/AGENTS.md", catalogVersion: "1.0.0", loadedProfileProof: "not_observed" },
        contributor: { agentId: "agent", name: "Product", role: "pm", title: null, status: "idle", adapterType: "codex_local" },
      });
      if (rowCount === 2) await expect(operation).rejects.toThrow("cardinality");
      else await expect(operation).resolves.toBe(rowCount === 1);
      expect(calls[0]?.sql).toContain("status = 'awaiting_grant' AND grant_id IS NULL");
      expect(calls[0]?.sql).toContain("request_id = $9 AND slot_hash = $10");
      expect(calls[0]?.sql).toContain("grant_granted_at = $2, grant_expires_at = $3");
    }
  });

  it("moves admitted in-flight states to durable uncertainty without touching a pending handshake", async () => {
    const calls: string[] = [];
    const repository = new SqlL03ContributionRepository({
      namespace: "plugin_executive_test",
      execute: async (sql) => { calls.push(sql); return { rowCount: 3 }; },
      query: async <T>() => [] as T[],
    });
    await repository.markInterruptedUnknown("00000000-0000-4000-8000-000000000001");
    expect(calls[0]).toContain("status IN ('prepared','dispatching','running')");
    expect(calls[0]).not.toContain("awaiting_grant'");
    expect(calls[0]).toContain("no second session or send is permitted");
  });

  it("defines additive reservation, slot-version, grant, and observation uniqueness", async () => {
    const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
    const migration = await readFile(path.join(packageRoot, "migrations/003_council_contributions.sql"), "utf8");
    expect(migration).toContain("CREATE TABLE plugin_executive_6aeed6300d.council_contributions");
    expect(migration).toContain("UNIQUE (company_id, reservation_id)");
    expect(migration).toContain("UNIQUE (company_id, mission_id, slot_id, reservation_version)");
    expect(migration).toContain("UNIQUE (company_id, grant_id)");
    expect(migration).toContain("UNIQUE (company_id, observed_event_ref)");
    expect(migration).toContain("grant_expires_at > grant_granted_at");
  });
});
