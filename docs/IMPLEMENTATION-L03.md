# L03 implementation and qualification

Status: paired candidates implemented; independent review and installed-host qualification in progress. Real-profile qualification remains open. This is not a production activation or merge declaration.

## Integrated contract

Council 0.5.0 extends its existing pinned missions with owner-admitted, expiring governance; exact executor approaches; selected, distinct specialist opinions; explicit Council direction; one bounded native wake; immutable Git-bundle results; and mandatory-only corrections with new identities and decisions. Executive 0.3.0 implements the authenticated reserved-opinion consumer and reads Council's canonical operator observations.

The retained dependencies are merged and ancestors of the candidates:

- Council #14, `9ae33f13968be4d8d5d20dc511deb2215c552ab0`: durable native decision receipts and uncertainty holds. Council #13 responsibility documentation is preserved.
- Executive #8, `9797a1208b47edfae2eb1f97bbac9a70adafdb81`: corresponding contract alignment.
- Unchanged Paperclip `61b3fd57a695614dc4a37e2303f426a34a9795cf` supplies native issues, sessions, events, plugin storage and actor authentication. Its pre-existing dirty state is not an L03 host change.

Council owns authority, reservations, decisions and private migration 005. Executive owns one physical consultation dispatch and private migrations 003/004; 004 widens opaque slot identities while preserving applied 003. Receipt migration 004 is retained unchanged. L01/L02 rows remain compatible. The public contract is documented in Council `docs/L03-GOVERNANCE.md`; the authenticated reserved-slot wire types are in Council `src/l03-types.ts` and Executive `packages/executive/src/l03-contribution.ts`.

The event handshake is asynchronous and is not a durable transport acknowledgement. Each slot, grant and observation has a durable identity. No new key, run, session or restart replenishes the mission allowance. Unknown outcomes remain visible and block dependent progress. Costs are never inferred as zero; configured native billing thresholds are admission controls, not a guaranteed future-spend ceiling.

## Acceptance evidence register

| Criterion | Implemented surface | Evidence and remaining obligation |
| --- | --- | --- |
| L03-A1 | Native owner/company/mission/role checks, exact criteria and context, expiry | Council domain/store/runtime tests; installed-host path under qualification |
| L03-A2 | Approach A1/A2, distinct explicit direction, durable wake reservation | Council transition and runtime tests; native wake qualification pending |
| L03-A3 | Immutable result/author/candidate, actual bundle bytes and ancestry | Council content tests create and verify a real Git bundle; native attachment/readback qualification pending |
| L03-A4 | Mandatory gaps only, V2 new candidate/result/review and preserved criteria | Council transition tests; integrated correction qualification pending |
| L03-A5 | Retained receipt operation identity, uncertain hold, observational reconciliation and owner dispositions | Retained receipt plus L03 boundary tests; actual-host receipt linkage qualification pending |
| L03-A6 | Atomic shared allowance and distinct counters; persistent unknown exposures | Explicit PostgreSQL concurrency and server-restart test passes; Executive durable dispatch/restart tests pass |
| L03-A7 | Pinned selected profile/method, required perspective gate, attributed opinions, dissent and bounded references | Executive fake-session tests and catalogue validation pass; seven real profiles provisioned, actual loading/usefulness unverified |
| L03-A8 | Council missions and Executive canonical observations, unknowns, limits and next action | UI implementation; rendered/reloaded browser evidence pending |

No mandatory criterion is dropped because its required proof is pending. The original/integrated plan and coverage contracts in `docs/contracts` preserve the entire L03 lot. Final readiness must use the final evidence coverage, not this interim table.

## Current local checks

- Council: typecheck, build, 128 default tests, separate PostgreSQL concurrency/restart test, and Fallow 3.23.0 diff gate pass.
- Executive: typecheck, build, 54 tests, catalogue validation (18 profiles / 8 skills), and Fallow 3.23.0 root diff gate pass. The exact package CI audit exits 0 with WARN: zero introduced complexity and four advisory duplication groups; inherited findings remain explicit.
- Impeccable: unavailable; controlled skip in `docs/evidence/l03-design.json`, not a pass. Browser qualification remains required separately.
- Council PR #16 push and PR CI pass on `b021847`; the earlier push-only complexity failure on `ec9a17c` is retained in `docs/evidence/l03-ci.json`. GitHub Codex review is unavailable because the account review quota is exhausted; the refusal is linked in `docs/contracts/l03-review-budget.json`. Independent review remains separate.

All six authorized correction batches shared by both repositories are consumed. No later correction or new remote review request is authorized by this run. The durable budget register records each intent, debit and validation; it is not reset after a rebase, restart or second PR.

## Installed environment and real campaign

`executive-dev` is an authenticated/private development instance on port 3220, with its scheduler disabled. Both candidate plugin paths are installed and ready; see `docs/evidence/l03-installed.json`. This does not prove model execution. L02 company, completed contribution and run identities were re-read and preserved.

The real L03 company is separate from both L02 and the synthetic host-test company. Seven catalogue agents have matching instruction hashes and configured company skills, safe adapter settings and bounded native run/time/billing controls. They remain paused; no real L03 provider call has occurred. `docs/evidence/l03-preparation.json` and `l03-safety.json` distinguish configuration from effective runtime loading.

`docs/L03-REAL-CAMPAIGN.md` specifies the fixture, roles, models, ordering and ten native-run campaign. Provider requests within an agent run and billed spend are not silently equated with those run limits. Explicit campaign authorization is required before any real agent invocation.

## Exclusions and remaining work

No host/SDK/native-table modifications, OpenExecutive changes, automatic Linear ingestion, generic scheduler, voting platform, watchdog, deployment or Git publication driven by Council. L04 monitoring and automatic recovery remain outside this lot. Human acknowledgement is not native success and cannot release an uncertainty hold.

## Native identity and run-attribution limitation

Agent identity is authenticated by Paperclip. Run attribution depends on the native credential path: a signed run JWT binds its run ID; a long-lived agent API key accepts a caller-supplied `X-Paperclip-Run-Id`. The public plugin context has no live-run lookup with which to strengthen that second path. L03 therefore requires the context's run ID but does not claim that every such ID is cryptographically bound or independently proven live. Native qualification records actual run readbacks; a standard-key header alone is not equivalent evidence. This limitation does not authorize a host patch, impersonation, or fabricated test run IDs.

## Qualification case trace

| Case | Automated evidence | Actual-host obligation |
| --- | --- | --- |
| Q1 nominal | Domain, store, content and dispatch suites | Fresh installed-candidate journey, pending after attempt3 |
| Q2 V1/V2 | Distinct identities, mandatory-only revision, pre-effect allowance | Native correction and fresh result receipt, pending |
| Q3 authority | Wrong actor/company, current roster/mandate/expiry checks | Authenticated native negative checks in host packets |
| Q4 subject | Real bundle bytes, evidence hash and ancestry verification | Native attachment and document readback in final packet |
| Q5 concurrency/replay | Real isolated PostgreSQL last-admission race; private dispatch claim and receipts | Native run cardinality and receipt replay in final packet |
| Q6 ambiguity | Retained receipt fault/concurrency/restart tests; L03 unknown hold and owner disposition | No automatic recovery claim; response loss never becomes native success |
| Q7 exhaustion/restart | PostgreSQL server restart preserves exhausted envelope; dispatch reconciliation | Exact installed-host counter readback remains separate |
| Q8 differing/missing advice | Attributed dissent preserved; required perspective gate | Five useful real opinions pending campaign approval |
| Q9 profile/owner drift | Immutable profile hash and native owner/role checks | Provisioning readback passes; effective mounts pending real campaign |
| Q10 UI | Browser script assertions against rendered mission and native state | Reload evidence on final candidate pending; failed-state attempt1 retained |
| Q11 A1/A2 | Fresh approach identity/direction, shared allowance and zero premature release | Native revision variant pending; not inferred from unit tests |

Failed host packets are retained under numbered `l03-host-attempt*.json` references. Attempt1 identified an opaque-slot storage mismatch; attempt2 identified a fixture setup ordering issue; attempt3 reached a completed native synthetic consultation but its observation emission failed because the original invocation scope had expired. Each remains failed evidence even after a later candidate corrects its cause. Synthetic agents use a provider-free CLI fixture through the unchanged native adapter; those results never establish real model judgment.

## Terminal-event delivery boundary

Executive persists terminal session output before publishing it to Council through a freshly scoped native `agent.run.finished`, `agent.run.failed`, or `agent.run.cancelled` event. The ordering wait is bounded to two seconds and cannot send or create another session. Missing delivery leaves the required opinion absent in Council and blocks direction.

The unchanged host does not emit a plugin lifecycle event for the native `interrupted` terminal status. Its session callback can therefore persist a failed Executive contribution while Council still shows a missing opinion. This is a documented stop requiring operator inspection, not an automatically recovered state. A replay of an unexpired, unchanged reservation can publish an already-persisted terminal observation under a fresh scope without another consultation; it cannot extend expiry, replace identity, or prove success. Expired reservations and worker restarts have no guaranteed automatic observation recovery. No polling watchdog or host patch is included.
