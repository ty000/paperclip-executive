# L03 implementation plan

Authority: user mission dated 2026-09-30. English artifacts, French operator exchanges.

Implement prepared ticket → approach → attributed Executive opinions → Council direction → bounded native execution → immutable result → review → bounded correction → fresh review.

## Ownership and sequence

- Council integrated base 9ae33f13968be4d8d5d20dc511deb2215c552ab0: mission authority, pinned context and mandate, atomic admission, distinct counters sharing one envelope, approach/result versions and decisions. New l03 modules and private additive migration; existing draft missions remain compatible.
- Executive integrated base 9797a1208b47edfae2eb1f97bbac9a70adafdb81: authenticated reserved-slot consumer, selected profile/method attribution, reference validation and canonical observation UI. Preserve L01/L02 owner actions.
- Paperclip 61b3fd57a695614dc4a37e2303f426a34a9795cf: read-only host contract reference. No host/schema/SDK changes.
- Council #14 and Executive #8 are merged and are ancestors of the L03 branches. Consume decision-receipts.ts with stable operationId and native_observed/indeterminate observations. Preserve Council #13 responsibilities documentation without broadening L03. No competing receipt journal.
- Integrator wires actual APIs, content verification and UI, runs isolated persistence and host tests, obtains independent review and publishes draft PRs. No automatic merge.

## Priority revision of historical framing

L03-A5 / Q6 now require durable uncertain state, dependent-action blocking and traced human acknowledgement/abandonment after response loss. Human acknowledgement is not native confirmation; no second mutation or replacement key. D-H automatic native recovery is no longer a prerequisite. The earlier contract audit/framing remains historical evidence; this user-authorized revision governs implementation and must be reconciled with the parallel documentation dependency.

## Acceptance and evidence

- L03-A1: bind ticket, supplied Linear snapshot, criteria, exclusions, composition and versioned mandate. Revalidate actor/company/expiry on admission/application. Q1/Q3/Q4/Q9.
- L03-A2: explicit proceed/revise/refuse/escalate; A1→A2 keeps criteria and budget, blocks release until fresh direction. Q1/Q3/Q5/Q6/Q11.
- L03-A3: exact immutable result revision, author, artifacts, evidence and verified bytes; approval never transfers. Q1/Q2/Q4.
- L03-A4: V1→targeted must-fix correction→V2→fresh review; optional suggestions do not force cycles. Q2/Q7/Q8.
- L03-A5: consume retained Council receipts, distinguish decision/attempt/native observation/later execution; persistent unknown blocks without resending. Q5/Q6 revised above.
- L03-A6: atomic durable approach/result/consultation counters and shared mission envelope; concurrency/restart/unknown exposure, costs remain unknown when unmeasured. Q5/Q7/Q9/Q11.
- L03-A7: distinct selected advisors, required slots, preserved dissent and reference validation; one final reviewer distinct from executor. Q8/Q9.
- L03-A8: rendered/reloaded operator views show subjects, opinions, decisions, application, counters, unknowns and next action. Q1/Q6/Q7/Q10.

Q1 nominal; Q2 result correction; Q3 authority; Q4 subject/reference drift; Q5 interrupted application; Q6 ambiguous response; Q7 exhausted limits/restart; Q8 dissent/missing advice; Q9 admission concurrency and real profile identity; Q10 browser reload; Q11 approach correction. Actual-host plugin paths require isolated host evidence, not doubles alone. Real advisor usefulness/loading remains separate and requires authorized instance, actors, models and limits. No implicit paid calls or existing instance mutations.

## Write allowlist and exclusions

Only isolated Executive/Council worktrees: plugin source, private additive migrations, tests, package/build metadata needed for integration, docs/contracts and bounded evidence. No parallel worktree edits, host modifications, OpenExecutive changes, L04, automatic Linear ingestion, catalogue rewrite, generic scheduler/accounting, Git/deploy driven by verdict or live activation.

## Prewrite and closure

Run canonical migration gate on docs/contracts/l03-migration-prewrite.json in each repository before persistence implementation. Council migration filename is 005_l03_governance.sql, reserving 004 for parallel receipts; reconcile against merged dependency before final qualification. Executive 003 is additive; gated additive 004 widens opaque slot identifiers to text without modifying the already-applied 003. Plan/coverage/envelopes precede writable delegation. Retain all mandatory criteria when proof is blocked; completion, integration, real qualification and deployment remain separate. PRs cannot be ready while retained dependencies remain unmerged/unintegrated.

Final implementation, evidence boundaries and Q1–Q11 trace are maintained in [IMPLEMENTATION-L03.md](IMPLEMENTATION-L03.md). The integrated prompt coverage remains historical; final readiness uses `docs/contracts/acceptance-coverage.final.v1.json`.
