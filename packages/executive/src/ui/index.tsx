import { usePluginAction, usePluginData, type PluginPageProps } from "@paperclipai/plugin-sdk/ui";
import { useEffect, useState, type CSSProperties, type FormEvent } from "react";
import type { AdviceRecord } from "../advice.js";

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
};

const stack: CSSProperties = { display: "grid", gap: 16 };
const card: CSSProperties = { border: "1px solid #d1d5db", borderRadius: 10, padding: 16, display: "grid", gap: 12 };
const field: CSSProperties = { width: "100%", border: "1px solid #9ca3af", borderRadius: 6, padding: "8px 10px", font: "inherit" };
const button: CSSProperties = { border: 0, borderRadius: 6, padding: "9px 14px", background: "#111827", color: "white", font: "inherit", cursor: "pointer" };
const mutedButton: CSSProperties = { ...button, background: "#4b5563" };

function newRequestKey(): string {
  return `advice-${globalThis.crypto?.randomUUID?.() ?? Date.now().toString(36)}`;
}

function statusLabel(status: AdviceRecord["status"]): string {
  return status === "outcome_unknown" ? "Outcome unknown" : status.replaceAll("_", " ");
}

export function ExecutivePage({ context }: PluginPageProps) {
  const companyId = context.companyId;
  const { data, loading, error, refresh } = usePluginData<AdviceState>("advice-state", { companyId });
  const configure = usePluginAction("configure-executive");
  const submit = usePluginAction("submit-advice");
  const [agentId, setAgentId] = useState("");
  const [requestKey, setRequestKey] = useState(newRequestKey);
  const [question, setQuestion] = useState("");
  const [requestContext, setRequestContext] = useState("");
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!agentId && data?.configuration.executiveAgentId) setAgentId(data.configuration.executiveAgentId);
  }, [agentId, data?.configuration.executiveAgentId]);

  useEffect(() => {
    if (!data?.requests.some((item) => ["pending", "dispatching", "running"].includes(item.status))) return;
    const timer = globalThis.setInterval(refresh, 2500);
    return () => globalThis.clearInterval(timer);
  }, [data?.requests, refresh]);

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
    </main>
  );
}
