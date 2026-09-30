import { useEffect, useState } from "react";

type Observation = {
  governance: {
    missionId: string; version: number; phase: string; activeApproachId: string | null;
    results: Array<{ resultId: string; candidateCommit: string; authorAgentId: string }>;
    approachDirections: Array<{ decisionId: string; verdict: string }>;
    resultDecisions: Array<{ decisionId: string; verdict: string }>;
    consultationSlots: Array<{ slot: { slotId: string; profile: { id: string; version: string }; reservedExecutiveAgentId: string }; required: boolean; contribution: null | { opinion: { summary: string; recommendation: string; dissent: string[]; limitations: string[] } } }>;
    counters: Record<"envelope" | "approach" | "result" | "consultation" | "correction", { admitted: number; limit: number }> & { unknownCostExposureRefs: string[] };
  };
  nextAction: string;
  application: { status: string; observationRef: string | null; note: string };
};

export function CouncilObservations({ companyId }: { companyId: string | null | undefined }) {
  const [data, setData] = useState<Observation[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const abort = new AbortController();
    setData(null); setError(null);
    if (!companyId) return () => abort.abort();
    void (async () => {
      try {
        const id = encodeURIComponent(companyId);
        const response = await fetch(`/api/plugins/private.paperclip-council/api/companies/${id}/l03?companyId=${id}`, { credentials: "same-origin", signal: abort.signal });
        if (!response.ok) throw new Error(response.status === 404 ? "Council L03 is not installed on this host." : `Council observations unavailable (${response.status}).`);
        const body = await response.json() as { missions: Observation[] };
        if (!Array.isArray(body.missions)) throw new Error("Council returned an unsupported observation contract.");
        if (!abort.signal.aborted) setData(body.missions);
      } catch (cause) { if (!abort.signal.aborted) setError(cause instanceof Error ? cause.message : "Council observations unavailable."); }
    })();
    return () => abort.abort();
  }, [companyId, revision]);
  return <section aria-labelledby="council-observations-title" style={{ display: "grid", gap: 12, overflowWrap: "anywhere" }}>
    <h2 id="council-observations-title">Council missions and next actions</h2>
    <p>Current observations read directly from Council. A direction concerns the approach; acceptance concerns one exact result.</p>
    <button onClick={() => setRevision(v => v + 1)} disabled={!companyId}>Refresh Council observations</button>
    {error && <p role="status">{error}</p>}
    {!data && !error && companyId && <p role="status">Loading Council observations…</p>}
    {data?.length === 0 && <p>No governed mission is recorded for this company.</p>}
    {data?.map(({ governance: g, nextAction, application }) => <article key={g.missionId} style={{ border: "1px solid var(--border, #9ca3af)", borderRadius: 8, padding: 16 }}>
      <h3>Mission {g.missionId}</h3><p>{g.phase.replaceAll("_", " ")} · revision {g.version}</p>
      <p>Approach: {g.activeApproachId ?? "not submitted"}</p>
      <p>Result: {g.results.at(-1)?.candidateCommit ?? "not submitted"}</p>
      <p>Direction: {g.approachDirections.at(-1)?.verdict ?? "not recorded"}; result decision: {g.resultDecisions.at(-1)?.verdict ?? "not recorded"}</p>
      <ul>{g.consultationSlots.map(s => <li key={s.slot.slotId}><strong>{s.slot.profile.id} {s.slot.profile.version}</strong> · {s.required ? "required" : "optional"} · {s.contribution?.opinion.recommendation ?? "opinion missing"}
        {s.contribution && <><p>{s.contribution.opinion.summary}</p><p>Dissent: {s.contribution.opinion.dissent.join("; ") || "None reported"}</p><p>Limitations: {s.contribution.opinion.limitations.join("; ") || "None reported"}</p></>}
      </li>)}</ul>
      <p>Application: {application.status} — {application.note}</p><p>Native observation: {application.observationRef ?? "missing"}</p>
      <ul>{(["envelope", "approach", "result", "consultation", "correction"] as const).map(k => <li key={k}>{k}: {g.counters[k].admitted}/{g.counters[k].limit}</li>)}</ul>
      <p>Unmeasured cost exposures: {g.counters.unknownCostExposureRefs.length}.</p>
      <p><strong>Next action:</strong> {nextAction}</p>
    </article>)}
  </section>;
}
