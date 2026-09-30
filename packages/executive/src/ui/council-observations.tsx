import { useEffect, useState } from "react";

type Observation = {
  governance: {
    missionId: string; version: number; phase: string; activeApproachId: string | null;
    results: Array<{ resultId: string; candidateCommit: string; authorAgentId: string }>;
    approachDirections: Array<{ decisionId: string; verdict: string }>;
    resultDecisions: Array<{ decisionId: string; verdict: string }>;
    consultationSlots: Array<{ slot: { slotId: string; profile: { id: string; version: string }; reservedExecutiveAgentId: string }; required: boolean; observations: Array<{ status: string; error: string | null }>; contribution: null | { opinion: { summary: string; recommendation: string; dissent: string[]; limitations: string[] } } }>;
    counters: Record<"envelope" | "approach" | "result" | "consultation" | "correction", { admitted: number; limit: number }> & { unknownCostExposureRefs: string[] };
  };
  receipts?: Array<{ operationId: string; state: string; blockReason: string | null; nativeObservation: null | { status: number; usable: boolean }; humanDecisions: unknown[] }>;
  nextAction: string;
  application: { status: string; observationRef: string | null; note: string };
};

type ConsultationSlot = Observation["governance"]["consultationSlots"][number];
type Receipt = NonNullable<Observation["receipts"]>[number];
const counterKeys = ["envelope", "approach", "result", "consultation", "correction"] as const;

function shown(value: string | null | undefined, fallback: string): string {
  return value ?? fallback;
}

function joined(values: string[]): string {
  return values.length === 0 ? "None reported" : values.join("; ");
}

function OpinionDetails({ slot }: { slot: ConsultationSlot }) {
  if (!slot.contribution) return null;
  return <><p>{slot.contribution.opinion.summary}</p><p>Dissent: {joined(slot.contribution.opinion.dissent)}</p><p>Limitations: {joined(slot.contribution.opinion.limitations)}</p></>;
}

function ConsultationObservation({ slot }: { slot: ConsultationSlot }) {
  const observation = slot.observations.at(-1);
  return <li><strong>{slot.slot.profile.id} {slot.slot.profile.version}</strong> · {slot.required ? "required" : "optional"} · {shown(slot.contribution?.opinion.recommendation, "opinion missing")}
    <p>Observation: {shown(observation?.status, "missing")}{observation?.error ? ` — ${observation.error}` : ""}</p>
    <OpinionDetails slot={slot} />
  </li>;
}

function nativeReceiptText(receipt: Receipt): string {
  if (!receipt.nativeObservation) return "Native response missing";
  return `HTTP ${receipt.nativeObservation.status}; usable: ${receipt.nativeObservation.usable}`;
}

function ReceiptObservation({ receipt }: { receipt: Receipt }) {
  const block = receipt.blockReason ? ` — ${receipt.blockReason}` : "";
  return <p>Receipt {receipt.operationId}: <strong>{receipt.state}</strong> · {nativeReceiptText(receipt)}{block}. Human dispositions: {receipt.humanDecisions.length}; these do not confirm native success.</p>;
}

function MissionCounters({ governance }: { governance: Observation["governance"] }) {
  return <><ul>{counterKeys.map((key) => <li key={key}>{key}: {governance.counters[key].admitted}/{governance.counters[key].limit}</li>)}</ul>
    <p>Unmeasured cost exposures: {governance.counters.unknownCostExposureRefs.length}.</p></>;
}

function CouncilMission({ observation }: { observation: Observation }) {
  const { governance, nextAction, application, receipts } = observation;
  return <article style={{ border: "1px solid var(--border, #9ca3af)", borderRadius: 8, padding: 16 }}>
    <h3>Mission {governance.missionId}</h3><p>{governance.phase.replaceAll("_", " ")} · revision {governance.version}</p>
    <p>Approach: {shown(governance.activeApproachId, "not submitted")}</p>
    <p>Result: {shown(governance.results.at(-1)?.candidateCommit, "not submitted")}</p>
    <p>Direction: {shown(governance.approachDirections.at(-1)?.verdict, "not recorded")}; result decision: {shown(governance.resultDecisions.at(-1)?.verdict, "not recorded")}</p>
    <ul>{governance.consultationSlots.map((slot) => <ConsultationObservation key={slot.slot.slotId} slot={slot} />)}</ul>
    <p>Application: {application.status} — {application.note}</p><p>Native observation: {shown(application.observationRef, "missing")}</p>
    {receipts?.map((receipt) => <ReceiptObservation key={receipt.operationId} receipt={receipt} />)}
    <MissionCounters governance={governance} />
    <p><strong>Next action:</strong> {nextAction}</p>
  </article>;
}

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
    {data?.map((observation) => <CouncilMission key={observation.governance.missionId} observation={observation} />)}
  </section>;
}
