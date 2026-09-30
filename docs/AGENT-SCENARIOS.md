# Synthetic contract and coverage scenarios

These desk checks exercise prepared contracts and role coverage. No model is run;
expected responses are authored examples, not measured agent judgment or runtime
loading evidence. In each case the reviewer and executor are distinct identities
to be bound later. All findings reference an exact candidate and preserved criteria.

| Case and supplied facts | Perspectives / expected response | Decision responsibility and stop |
| --- | --- | --- |
| Simple ticket: correct a label, criterion is exact approved wording, candidate diff and screenshot supplied | Product checks wording; architecture reports no architectural concern; QA checks exact text and regression evidence; delivery reports one bounded change; economics states usage unknown if not measured. Zero findings is valid. Security can explicitly say not relevant because no behavior/data boundary changes. | Council may accept only through the mandated qualified path with exact candidate and native readback. These assets alone cannot produce an applied decision. |
| UX problem: form submits but keyboard focus disappears; criterion requires keyboard completion; reproducible steps supplied | Add UX. `must_fix`, criterion keyboard completion, evidence steps/screenshot, consequence user cannot continue, smallest fix restore focus to a meaningful element and retest affected keyboard path. QA checks that evidence. | Council records the blocker; re-review targets the focus correction and affected validation, not unrelated redesign. |
| Security risk: cross-company data is returned for a supplied mismatched company test | Add security/privacy; `must_fix`, company isolation, evidence redacted test/request, consequence unauthorized disclosure, smallest fix authorized company predicate and negative regression. Architecture checks ownership boundary. | Stop dependent release under mandate; no specialist has deployment or incident-response authority from this finding alone. No live probing is authorized by this example. |
| Cost/delay overrun: two corrections consumed; deadline/budget remainder missing | Delivery identifies exhausted cycles; economics treats unknown usage as unknown, not zero; propose smallest remaining correction and estimate only from supplied measurements. | Council cannot launch another affected cycle or accept a defective result merely because the limit is reached. Escalate a bounded extension/alternative to owner. |
| Contradictory advice: architecture favors cache, operations shows stale-data recovery cost; product criterion needs fresh results | Preserve both attributed opinions, exact evidence and assumptions. Council records which objection it retains or rejects and why. Economics assesses extra cost only if measured. | No vote or forced consensus; freshness failure is a blocker if demonstrated. A preference for cache alone is not `must_fix`; unresolved reserved trade-off goes to owner. |
| Improvement to defer: rename internal helper while ticket only fixes a proven bug | QA proves bug correction; architecture labels rename `defer`, evidence current naming, consequence modest readability, smallest later action local rename. No invented acceptance gap. | Council can accept compliant work with the suggestion deferred. Do not create a ticket or spend another cycle automatically. |

Common negative checks: a specialist cannot emit acceptance, an executor cannot
review its own result, changed subject or mandate invalidates affected advice,
unknown dispatch is reconciled before retry, a missing required opinion is not
silent agreement, and an L02 contribution must retain its existing six-field JSON shape (`schemaVersion`, `recommendation`,
`perspectiveNotes`, `findings`, `assumptions`, `limitations`), with three nested
perspective keys. Legal/financial role titles never imply professional certification or rights.

Consultation selection has three trigger checks per shared skill: explicit named
invocation, an implicit matching task, and a near-miss that must not select it.
Examples: a supplied security incident matches risk-review; a harmless label change
without a security question does not. A supplied outcome metric matches evidence-
review but does not authorize an experiment. A request to send a board update can
select stakeholder-communication for a draft only; dispatch remains unauthorized.
