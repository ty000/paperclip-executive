import { CouncilObservations } from "./council-observations.js";
import { usePluginAction, usePluginData, type PluginPageProps } from "@paperclipai/plugin-sdk/ui";
import { useEffect, useState, type CSSProperties, type FormEvent } from "react";
import type { AdviceRecord } from "../advice.js";
import type { ContributionRecord, FindingClass } from "../contribution.js";

type AdviceState = {
  configuration: {
    configured: boolean;
    revision: number;
    executiveAgentId: string | null;
    agentStatus: string | null;
    available: boolean;
    reason: string | null;
  };
  requests: AdviceRecord[];
  contributions: ContributionRecord[];
};

const stack: CSSProperties = { display: "grid", gap: 16 };
const card: CSSProperties = { border: "1px solid #d1d5db", borderRadius: 10, padding: 16, display: "grid", gap: 12 };
const field: CSSProperties = { width: "100%", border: "1px solid #9ca3af", borderRadius: 6, padding: "8px 10px", font: "inherit" };
const button: CSSProperties = { border: 0, borderRadius: 6, padding: "9px 14px", background: "#111827", color: "white", font: "inherit", cursor: "pointer" };
const mutedButton: CSSProperties = { ...button, background: "#4b5563" };
export const CONTRIBUTION_UNKNOWN_POLL_WINDOW_MS = 2 * 60 * 1000;

export function contributionUnknownPollDeadline(
  item: Pick<ContributionRecord, "status" | "sessionId" | "runId" | "updatedAt">,
): number | null {
  if (item.status !== "outcome_unknown" || !item.sessionId || !item.runId) return null;
  const updatedAt = Date.parse(item.updatedAt);
  return Number.isFinite(updatedAt) ? updatedAt + CONTRIBUTION_UNKNOWN_POLL_WINDOW_MS : null;
}

function newRequestKey(): string {
  return `advice-${globalThis.crypto?.randomUUID?.() ?? Date.now().toString(36)}`;
}

function statusLabel(status: AdviceRecord["status"] | ContributionRecord["status"]): string {
  return status === "outcome_unknown" ? "Outcome unknown" : status.replaceAll("_", " ");
}

const findingLabels: Record<FindingClass, string> = {
  must_fix: "Must fix", useful_now: "Useful now", defer: "Defer",
};

export function ExecutivePage({ context }: PluginPageProps) {
  const companyId = context.companyId;
  const { data, loading, error, refresh } = usePluginData<AdviceState>("advice-state", { companyId });
  const configure = usePluginAction("configure-executive");
  const submit = usePluginAction("submit-advice");
  const submitContribution = usePluginAction("submit-contribution");
  const [agentId, setAgentId] = useState("");
  const [requestKey, setRequestKey] = useState(newRequestKey);
  const [question, setQuestion] = useState("");
  const [requestContext, setRequestContext] = useState("");
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [contributionKey, setContributionKey] = useState(() => `contribution-${globalThis.crypto?.randomUUID?.() ?? Date.now().toString(36)}`);
  const [issueId, setIssueId] = useState("");
  const [contributorAgentId, setContributorAgentId] = useState("");
  const [sourceReference, setSourceReference] = useState("");
  const [objective, setObjective] = useState("");
  const [acceptanceCriteria, setAcceptanceCriteria] = useState("");
  const [exclusions, setExclusions] = useState("");
  const [dependencies, setDependencies] = useState("");
  const [approach, setApproach] = useState("");
  const [evidenceReferences, setEvidenceReferences] = useState("");
  const [decisiveUnknowns, setDecisiveUnknowns] = useState("");
  const [constraints, setConstraints] = useState("");

  useEffect(() => {
    if (!agentId && data?.configuration.executiveAgentId) setAgentId(data.configuration.executiveAgentId);
  }, [agentId, data?.configuration.executiveAgentId]);

  useEffect(() => {
    const now = Date.now();
    const hasActiveWork = Boolean(
      data?.requests.some((item) => ["pending", "dispatching", "running"].includes(item.status)) ||
      data?.contributions.some((item) => ["prepared", "dispatching", "running"].includes(item.status)),
    );
    const unknownDeadlines = (data?.contributions ?? [])
      .map(contributionUnknownPollDeadline)
      .filter((deadline): deadline is number => deadline !== null && deadline > now);
    if (!hasActiveWork && unknownDeadlines.length === 0) return;
    const timer = globalThis.setInterval(refresh, 2500);
    const stopTimer = !hasActiveWork
      ? globalThis.setTimeout(() => globalThis.clearInterval(timer), Math.max(...unknownDeadlines) - now)
      : null;
    return () => {
      globalThis.clearInterval(timer);
      if (stopTimer !== null) globalThis.clearTimeout(stopTimer);
    };
  }, [data?.requests, data?.contributions, refresh]);

  async function saveConfiguration(event: FormEvent) {
    event.preventDefault();
    if (!data) return;
    setBusy(true);
    setActionError(null);
    try {
      await configure({ executiveAgentId: agentId, expectedRevision: data.configuration.revision });
      refresh();
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : "Configuration failed");
    } finally {
      setBusy(false);
    }
  }

  async function requestAdvice(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setActionError(null);
    try {
      await submit({ requestKey, question, context: requestContext });
      refresh();
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : "Advice request failed");
    } finally {
      setBusy(false);
    }
  }

  async function requestContribution(event: FormEvent) {
    event.preventDefault(); setBusy(true); setActionError(null);
    try {
      await submitContribution({ requestKey: contributionKey, issueId, contributorAgentId, sourceReference, objective,
        acceptanceCriteria, exclusions, dependencies, approach, evidenceReferences, decisiveUnknowns, constraints });
    } catch (caught) { setActionError(caught instanceof Error ? caught.message : "Contribution request failed"); }
    finally { refresh(); setBusy(false); }
  }

  if (!companyId) return <div style={card}>Select a company to use Paperclip Executive.</div>;
  if (loading) return <div style={card}>Loading Executive advice...</div>;
  if (error) return <div role="alert" style={card}>Executive could not load: {error.message}</div>;
  if (!data) return null;

  return (
    <main style={{ ...stack, maxWidth: 920, margin: "0 auto", padding: 24 }}>
      <header>
        <h1 style={{ marginBottom: 6 }}>Paperclip Executive</h1>
        <p style={{ margin: 0 }}>Direct, attributable advice. This page never creates or assigns native work.</p>
      </header>

      {actionError ? <div role="alert" style={{ ...card, borderColor: "#b91c1c" }}>{actionError}</div> : null}

      <section style={card} aria-labelledby="configuration-title">
        <h2 id="configuration-title" style={{ margin: 0 }}>Configuration</h2>
        <p style={{ margin: 0 }}>Bind an existing Paperclip agent. Saving does not recruit, reconcile, resume, or activate it.</p>
        <form onSubmit={saveConfiguration} style={stack}>
          <label>
            Executive agent ID
            <input style={field} value={agentId} onChange={(event) => setAgentId(event.target.value)} required />
          </label>
          <div><button style={button} disabled={busy}>{data.configuration.configured ? "Update binding" : "Save binding"}</button></div>
        </form>
        <div>
          Status: <strong>{data.configuration.available ? "Ready for local dispatch" : "Unavailable"}</strong>
          {data.configuration.agentStatus ? ` (agent ${data.configuration.agentStatus})` : ""}
        </div>
        {data.configuration.reason ? <div role="status">{data.configuration.reason}</div> : null}
      </section>

      <section style={card} aria-labelledby="request-title">
        <h2 id="request-title" style={{ margin: 0 }}>Request direct advice</h2>
        <form onSubmit={requestAdvice} style={stack}>
          <label>
            Question
            <textarea style={{ ...field, minHeight: 90 }} value={question} onChange={(event) => setQuestion(event.target.value)} required />
          </label>
          <label>
            Context (optional)
            <textarea style={{ ...field, minHeight: 110 }} value={requestContext} onChange={(event) => setRequestContext(event.target.value)} />
          </label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button style={button} disabled={busy || !data.configuration.available}>Request advice</button>
            <button
              type="button"
              style={mutedButton}
              onClick={() => { setRequestKey(newRequestKey()); setQuestion(""); setRequestContext(""); setActionError(null); }}
            >
              New request
            </button>
          </div>
          <small>Correlation key: <code>{requestKey}</code>. Repeating this exact request does not redispatch it.</small>
        </form>
      </section>

      <section style={stack} aria-labelledby="history-title">
        <h2 id="history-title" style={{ margin: 0 }}>Advice history</h2>
        {data.requests.length === 0 ? <div style={card}>No advice request has been persisted for this company.</div> : null}
        {data.requests.map((request) => (
          <article key={request.contextId} style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <strong>{request.question}</strong>
              <span>Status: {statusLabel(request.status)}</span>
            </div>
            <div><small>Revision {request.revision} · request <code>{request.requestKey}</code></small></div>
            <div><small>Session <code>{request.sessionId ?? "not recorded"}</code> · run <code>{request.runId ?? "not recorded"}</code></small></div>
            {request.result ? (
              <div style={stack}>
                <div><strong>Recommendation</strong><p>{request.result.recommendation}</p></div>
                <div><strong>Assumptions</strong><ul>{request.result.assumptions.map((item) => <li key={item}>{item}</li>)}</ul></div>
                <div><strong>Limitations</strong><ul>{request.result.limitations.map((item) => <li key={item}>{item}</li>)}</ul></div>
              </div>
            ) : null}
            {request.error ? <div role="alert"><strong>Visible failure or uncertainty:</strong> {request.error}</div> : null}
          </article>
        ))}
      </section>

      <section style={card} aria-labelledby="contribution-title">
        <h2 id="contribution-title" style={{ margin: 0 }}>Prepared-ticket approach contribution</h2>
        <p style={{ margin: 0 }}><strong>Advisory only.</strong> This snapshot-bound contribution is not a Council verdict, approval, or permission to start work.</p>
        <form onSubmit={requestContribution} style={stack}>
          <label>Paperclip issue ID<input style={field} value={issueId} onChange={(e) => setIssueId(e.target.value)} required /></label>
          <label>Contributor agent ID<input style={field} value={contributorAgentId} onChange={(e) => setContributorAgentId(e.target.value)} required /></label>
          <label>Supplied Linear identifier or URL<input style={field} value={sourceReference} onChange={(e) => setSourceReference(e.target.value)} required /></label>
          <label>Objective<textarea style={field} value={objective} onChange={(e) => setObjective(e.target.value)} required /></label>
          <label>Acceptance criteria (one per line)<textarea style={field} value={acceptanceCriteria} onChange={(e) => setAcceptanceCriteria(e.target.value)} required /></label>
          <label>Exclusions (one per line)<textarea style={field} value={exclusions} onChange={(e) => setExclusions(e.target.value)} required /></label>
          <label>Relevant dependencies (one per line)<textarea style={field} value={dependencies} onChange={(e) => setDependencies(e.target.value)} /></label>
          <label>Proposed approach<textarea style={{ ...field, minHeight: 100 }} value={approach} onChange={(e) => setApproach(e.target.value)} required /></label>
          <label>Evidence references (one per line)<textarea style={field} value={evidenceReferences} onChange={(e) => setEvidenceReferences(e.target.value)} /></label>
          <label>Decisive unknowns (use “None identified” when explicit)<textarea style={field} value={decisiveUnknowns} onChange={(e) => setDecisiveUnknowns(e.target.value)} required /></label>
          <label>Time/resource constraints (use “None supplied” when explicit)<textarea style={field} value={constraints} onChange={(e) => setConstraints(e.target.value)} required /></label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button style={button} disabled={busy}>Request one contribution</button>
            <button type="button" style={mutedButton} onClick={() => {
              setContributionKey(`contribution-${globalThis.crypto?.randomUUID?.() ?? Date.now().toString(36)}`); setActionError(null);
            }}>New contribution key</button>
          </div>
          <small>Correlation key: <code>{contributionKey}</code>. Identical repeats do not redispatch; changed captured input conflicts.</small>
        </form>
      </section>

      <section style={stack} aria-labelledby="contribution-history-title">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <h2 id="contribution-history-title" style={{ margin: 0 }}>Contribution history</h2>
          <button type="button" style={mutedButton} onClick={refresh}>Refresh history</button>
        </div>
        {data.contributions.length === 0 ? <div style={card}>No prepared-ticket contribution has been persisted for this company.</div> : null}
        {data.contributions.map((item) => (
          <article key={item.contributionId} style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <strong>{item.issue.identifier ?? item.issue.id}: {item.issue.title}</strong><span>Status: {statusLabel(item.status)}</span>
            </div>
            <div><small>Input v{item.inputVersion} · method {item.method.id}@{item.method.version} · request <code>{item.requestKey}</code></small></div>
            <div><small>Contributor {item.contributor.name} (<code>{item.contributor.agentId}</code>) · executor <code>{item.issue.executorAgentId}</code></small></div>
            <div><small>Session <code>{item.sessionId ?? "not recorded"}</code> · run <code>{item.runId ?? "not recorded"}</code></small></div>
            <details><summary>Captured input snapshot</summary>
              <p><strong>Issue status/project:</strong> {item.issue.status} / {item.issue.projectId ?? "no project"}</p>
              <p><strong>Issue description:</strong> {item.issue.description ?? "No description captured."}</p>
              <p><strong>Issue observed update:</strong> {item.issue.updatedAt}</p>
              <p><strong>Supplied source:</strong> {item.source.reference}</p><p><strong>Objective:</strong> {item.source.objective}</p>
              <div><strong>Acceptance criteria</strong><ul>{item.source.acceptanceCriteria.map((value) => <li key={value}>{value}</li>)}</ul></div>
              <div><strong>Exclusions</strong><ul>{item.source.exclusions.map((value) => <li key={value}>{value}</li>)}</ul></div>
              <div><strong>Dependencies</strong>{item.source.dependencies.length ? <ul>{item.source.dependencies.map((value) => <li key={value}>{value}</li>)}</ul> : <p>None supplied.</p>}</div>
              <p><strong>Approach:</strong> {item.approach.summary}</p>
              <div><strong>Evidence references</strong>{item.approach.evidenceReferences.length ? <ul>{item.approach.evidenceReferences.map((value) => <li key={value}>{value}</li>)}</ul> : <p>None supplied.</p>}</div>
              <div><strong>Decisive unknowns</strong><ul>{item.approach.decisiveUnknowns.map((value) => <li key={value}>{value}</li>)}</ul></div>
              <div><strong>Time/resource constraints</strong><ul>{item.approach.constraints.map((value) => <li key={value}>{value}</li>)}</ul></div>
              <p><strong>Snapshot warning:</strong> issue and source may have changed since {item.issue.updatedAt}; this record remains advisory.</p>
            </details>
            {item.result ? <div style={stack}>
              <div><strong>Recommendation</strong><p>{item.result.recommendation}</p></div>
              <div><strong>Product perspective</strong><p>{item.result.perspectiveNotes.product}</p></div>
              <div><strong>Technical perspective</strong><p>{item.result.perspectiveNotes.technical}</p></div>
              <div><strong>Delivery/cost perspective</strong><p>{item.result.perspectiveNotes.delivery_cost}</p></div>
              <div><strong>Findings</strong>{item.result.findings.length === 0 ? <p>No findings were returned; zero must-fix findings is valid.</p> : <ul>{item.result.findings.map((finding) => <li key={finding.id}>
                <strong>{findingLabels[finding.class]} · {finding.id}</strong>: {finding.smallestUsefulAction}<br />
                <small>{finding.perspective} · criterion/risk: {finding.criterionRef} · evidence: {finding.evidence.join("; ") || "none supplied"} · reasons: {finding.reasons.join("; ") || "none supplied"}</small>
              </li>)}</ul>}</div>
              <div><strong>Assumptions</strong><ul>{item.result.assumptions.map((value) => <li key={value}>{value}</li>)}</ul></div>
              <div><strong>Limitations</strong><ul>{item.result.limitations.map((value) => <li key={value}>{value}</li>)}</ul></div>
            </div> : null}
            {item.error ? <div role="alert"><strong>Visible failure or uncertainty:</strong> {item.error}</div> : null}
          </article>
        ))}
      </section>
      <CouncilObservations companyId={companyId} />
    </main>
  );
}
