# L03 implementation and qualification

Status: **partial; fail-terminal; both PRs remain draft and not merge-ready**. The final installed-host packet confirms V1 changes_requested but observes no subsequent correction executor run. V2, its fresh review, final acceptance and real-profile qualification remain unqualified. All six authorized correction batches are consumed.

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
| L03-A1 | Native owner/company/mission/role checks, exact criteria and context, expiry | Domain/store/runtime tests and authenticated native negative checks; installed migrations pass |
| L03-A2 | A1/A2, distinct explicit direction, durable wake reservation | Native A1 revise with zero release; A2 fresh opinion and proceed release exactly one executor run |
| L03-A3 | Immutable result/author/candidate, actual bundle bytes and ancestry | Exact native V1 verified; V2 and non-transfer of approval remain automated-only, integrated obligation blocked |
| L03-A4 | Mandatory gaps only, V2 new candidate/result/review and preserved criteria | Automated transition tests pass; native correction continuation blocked by L03-HOST-003 |
| L03-A5 | Retained receipt identity, unknown hold, observational reconciliation | Attempt5 retains an indeterminate HTTP403 receipt; attempt6 observes usable HTTP200 changes_requested without inferring next execution |
| L03-A6 | Atomic shared allowance and counters; persistent unknown exposures | PostgreSQL concurrency/server restart pass; native exhausted admission counters read back; counters do not mean completed work |
| L03-A7 | Pinned selected profiles, attributed opinions and dissent, independent reviewer | Native synthetic bridge verified twice; five real specialist methods, effective loading and useful output remain unqualified |
| L03-A8 | Canonical operator views, receipts, counters and next action | Both rendered views and reload pass for the actual blocked state; V2/accepted-state integration remains blocked |

No mandatory criterion is dropped because its required proof is pending. The original/integrated plan and coverage contracts in `docs/contracts` preserve the entire L03 lot. Final readiness must use the final evidence coverage, not a test-only success claim.

## Current local checks

- Council: typecheck, build, 128 default tests, separate PostgreSQL concurrency/restart test, and Fallow 3.23.0 diff gate pass.
- Executive: typecheck, build, 54 tests, catalogue validation (18 profiles / 8 skills), and Fallow 3.23.0 root diff gate pass. The exact package CI audit exits 0 with WARN: zero introduced complexity and four advisory duplication groups; inherited findings remain explicit.
- Impeccable: unavailable; controlled skip in `docs/evidence/l03-design.json`, not a pass. Browser qualification of the observed blocked state passes separately.
- Council PR #16 push and PR CI pass on `b021847`; the earlier push-only complexity failure on `ec9a17c` is retained in `docs/evidence/l03-ci.json`. GitHub Codex review is unavailable because the account review quota is exhausted; the refusal is linked in `docs/contracts/l03-review-budget.json`. Executive CI also passes on source-identical head `993365e`; independent source review passes but does not substitute for the unavailable current-head remote review.

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
| Q1 nominal | Domain, store, content and dispatch suites | Partial: reaches V1 review; no final acceptance |
| Q2 V1/V2 | Distinct identities, mandatory-only revision, pre-effect allowance | **Blocked:** no native correction executor run, V2 or fresh final review |
| Q3 authority | Wrong actor/company, current roster/mandate/expiry | Authenticated native negative checks retained in numbered packets |
| Q4 subject | Bundle bytes, evidence hash and ancestry | Exact V1 native attachment/document readback passes; V2 absent |
| Q5 concurrency/replay | Isolated PostgreSQL admission race; dispatch claims and receipts | Exactly one executor direction release; no claim of completed V2 replay |
| Q6 ambiguity | Receipt fault/concurrency/restart tests; unknown hold | Attempt5 indeterminate receipt retained; never converted to success or retried with a new identity |
| Q7 exhaustion/restart | PostgreSQL server restart preserves exhausted envelope | Final native admitted/reserved counters match; not completed-work counts |
| Q8 differing/missing advice | Dissent and required-perspective gate tests | Two synthetic architecture opinions on different approaches; five useful real perspectives remain unproven |
| Q9 profile/owner drift | Profile hash and owner/role tests | Provisioning readback passes; effective real profile/skill loading remains unproven |
| Q10 UI | Browser assertions against native state | PASS_BLOCKED_STATE_RENDERED on both views with stable reload and zero page errors |
| Q11 A1/A2 | New approach/direction, shared allowance, zero premature release | Native A1 revise → A2 fresh opinion → proceed observed |

## Final native result and required gap

[l03-host-attempt6.json](evidence/l03-host-attempt6.json) is **FAIL**, not a successful end-to-end packet. It binds company `14d5f600-335b-4715-8a06-367ee1b48454`, mission `940f3566-fe66-4037-82c0-37498b301669`, and issue `3f7a8d35-9260-4685-8c02-73f5d478704f` to the exact installed worker hashes in [l03-final-source.json](evidence/l03-final-source.json).

The first opinion leads to A1 revise without executor release. A2 uses a new immutable approach and separate consultation run, then a favorable direction releases executor run `dc5bad8c-8365-4fed-9cae-b3532f7295dd`. V1 candidate `1f24ee9bb5bd687c302f2bc3bb524b1dfc40f1c2` has bundle SHA-256 `1ba4ae8e447e238ec2525cfc47e3f8641171d1ed3705ec333704e1357d028ed6` and native attachment `164b748b-d07d-42b5-89de-b5bf81c33a36`.

Authenticated reviewer run `f71173a8-608d-4d9e-9833-638f62fd3337` has the real source issue in `contextSnapshot.issueId`. Receipt `result-review-v1:4a47477c-fc0a-4ed0-a544-84ce6567f428` is `native_observed`, HTTP200, usable. Native readback confirms `executionState.status=changes_requested`, issue `in_progress`, and reassignment to the pinned executor. Nevertheless `executionRunId` and `checkoutRunId` remain null and no correction executor run is observed within 30 seconds. Executor eligibility, wake setting, concurrency and positive run/time/cost controls were read back before sealing. The deeper native wake cause is **unknown**. This required continuation gap is **L03-HOST-003**; no replacement wake or retry was sent.

The mission remains `result_correction_required`, revision16. Counters are envelope6/6, approach2/2, result2/2, consultation2/2 and correction2/2. They count admission/reservation before effects, including capacity reserved for the missing continuation; they do not prove V2 exists. V2 submission, new review and acceptance are absent.

[Browser evidence](evidence/l03-host-browser-attempt6.json), [Council capture](evidence/l03-browser-council-attempt6.png) and [Executive capture](evidence/l03-browser-executive-attempt6.png) show this blocked state after reload. They are not successful-journey evidence. Synthetic fixture commands run through the unchanged native adapter without a provider call. Some native runs are cancelled during issue reassignment and usage can be null; neither all-success nor measured-zero-billing is claimed.

All synthetic agents were sealed paused with wake-on-demand disabled and no queued, running or scheduled-retry runs. The original L02 run and three-agent statuses are preserved. The separate real L03 company has seven paused agents and zero runs. The [real campaign proposal](L03-REAL-CAMPAIGN.md) remains on hold for functional qualification and explicit authorization.

## Historical packets and terminal handoff

Numbered failed packets are immutable evidence of their own candidates and conditions:

- Attempt1: opaque-slot persistence mismatch.
- Attempt2: fixture setup/mission ordering failure.
- Attempt3: completed synthetic consultation could not emit after its original invocation scope expired; corrected terminal-event bridge is observed in attempt6.
- Attempt4: qualification attempted native issue mutation after the released run had ended.
- Attempt5: reviewer native run lacked source issue context. The adapter did send `X-Paperclip-Run-Id`; native HTTP403 `cross_issue_influence_run_context_required` is not evidence of a missing header. Its indeterminate receipt remains retained.
- Attempt6: exact final installed candidates reach V1 changes_requested but no correction execution follows within the observation window.

The [terminal record](evidence/l03-terminal.json) and [global budget](contracts/l03-review-budget.json) record six completed correction batches, zero remaining, one remote review request and no thread resolutions. GitHub Codex refused the Council request because of quota exhaustion. No new remote review or source correction follows exhaustion. Independent final source review found no new P1/P2; that finding cannot establish runtime completion. The acceptance gate is intentionally blocked while all original criteria remain present. Impeccable is unavailable, an explicit skip.

Both [Council #16](https://github.com/ty000/paperclip-council/pull/16) and [Executive #9](https://github.com/ty000/paperclip-executive/pull/9) remain draft. Neither is merge-ready. Council must precede Executive only after the outstanding gates are satisfied. No automatic merge or production activation occurred. Final documentation/evidence publication changes neither installed package source tree nor bundle hash.

## Terminal-event delivery boundary

Executive persists terminal session output before publishing it to Council through a freshly scoped native `agent.run.finished`, `agent.run.failed`, or `agent.run.cancelled` event. The ordering wait is bounded to two seconds and cannot send or create another session. Missing delivery leaves the required opinion absent in Council and blocks direction.

The unchanged host does not emit a plugin lifecycle event for the native `interrupted` terminal status. Its session callback can therefore persist a failed Executive contribution while Council still shows a missing opinion. This is a documented stop requiring operator inspection, not an automatically recovered state. A replay of an unexpired, unchanged reservation can publish an already-persisted terminal observation under a fresh scope without another consultation; it cannot extend expiry, replace identity, or prove success. Expired reservations and worker restarts have no guaranteed automatic observation recovery. No polling watchdog or host patch is included.
