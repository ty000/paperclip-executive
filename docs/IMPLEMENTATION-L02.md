# L02 implementation — Prepared-Ticket Approach Contribution

Version: 0.1 — September 30, 2026.

Status: implemented and locally validated, with one real advisory contribution and bounded runtime qualification. This is not complete B03 or production qualification.

## Delivered slice

The existing Executive page now exposes a separate prepared-ticket contribution journey while
preserving L01 direct advice. A host-authenticated company owner supplies a stable request key,
selects a native issue and an existing contributor, and captures the prepared source and proposed
approach. The worker reads the issue and contributor with company-scoped SDK calls, requires an
assigned executor, and requires a dispatchable contributor distinct from that executor.

The request freezes these snapshots before dispatch:

- issue identity, project, title, description, status, executor, and observed update time;
- supplied Linear identifier/URL, objective, acceptance criteria, exclusions, and dependencies;
- proposed approach, evidence references, decisive unknowns, and stated constraints;
- contributor identity, role/title, status, adapter type, and review-method version.

The SQL claim uses `INSERT ... ON CONFLICT DO NOTHING` followed by request-key readback. Identical
duplicates return the persisted operation; changed captured input under the same key conflicts.
Only the winning insert creates one native agent session and sends one prompt. There is no fan-out,
retry, output repair, issue wakeup, executor dispatch, or automatic activation.

States are `prepared`, `dispatching`, `running`, `completed`, `failed`, and `outcome_unknown`.
Terminal callbacks are correlated to the captured contribution, session, and run; unrelated or
stale output cannot complete it. Terminal events received before `sendMessage` resolves are held
until the returned run ID is durably recorded, then accepted only on an exact run match. A worker
restart marks nonterminal records uncertain. Uncertain
operations remain visible and are never redispatched by a duplicate submission.

## Versioned output contract

`prepared-ticket-contribution.v1` contains:

- a recommendation;
- product, technical, and delivery/cost perspective notes;
- zero or more findings with stable local ID, `must_fix` / `useful_now` / `defer` class,
  perspective, criterion or material-risk reference, evidence, reasons, and smallest useful action;
- assumptions and limitations.

Zero `must_fix` findings is valid. Optional polish belongs in `defer`. Supplied evidence references
are not represented as independently verified evidence. The UI labels the result snapshot-bound and
advisory: it is not a Council verdict, approval, issue mutation, or permission to start work.
Before persistence, the parser bounds the complete response, finding count, field lengths, item
counts, and cumulative evidence/reason/assumption/limitation text. Oversized output fails explicitly.

## Acceptance evidence

| ID | Local evidence | Result |
| --- | --- | --- |
| L02-A1 | Service tests cover required source/approach fields, company isolation, executor assignment, contributor distinction and dispatchability; all refuse before session creation. | Pass locally |
| L02-A2 | Concurrent duplicate, changed-input conflict, single session/send, and SQL atomic-claim/readback tests. | Pass locally |
| L02-A3 | Parser fixtures accept zero findings, classify optional polish as `defer`, and represent an evidence-based scope reduction for an overlarge approach; UI renders all classes. Judgment quality remains runtime evidence. | Pass locally; real overlarge-plan advice inspected, with a criterion-reference limitation below |
| L02-A4 | Correlated terminal, synchronous pre-return terminal/wrong-run, invalid and oversized output, run-ID persistence failure, dispatch uncertainty, restart marking, pre-send persistence failure, and duplicate-after-unknown tests; no retry. | Pass locally; completed-result restart/readback passed; interrupted runs remain synthetic coverage |
| L02-A5 | React server-rendered component coverage includes labeled inputs, the full captured issue/source/approach snapshot, attribution, states, error/uncertainty, findings and advisory wording. | Pass at component and real-browser tiers for captured snapshot/result, attribution and reload |
| L02-A6 | Existing L01 suite remains green. Manifest adds only `issues.read`; code review shows no issue mutation, Council, recruitment, executor, Linear, or OpenExecutive call. | Pass locally |

Local commands executed from `packages/executive`:

```text
pnpm typecheck
pnpm test
pnpm build
```

The final command results belong in the implementation handoff; this document does not turn a local
command into runtime proof.

## Bounded runtime qualification — 2026-09-30

The authenticated `executive-dev` instance uses Paperclip
`61b3fd57a695614dc4a37e2303f426a34a9795cf`. The owner submitted EXE-2 with a paused
executor and a distinct `codex_local` contributor. One native run succeeded in
approximately 18 seconds and persisted a completed contribution. Its recommendation
was `revise`: remove unnecessary backend/history work and specify copy-failure feedback.

[Runtime evidence](evidence/l02-runtime.json) records candidate file hashes,
contribution/session/run identity, and sanitized API/browser check results.

| Check | Observed result |
| --- | --- |
| Existing-key identical replay through native action API | Same contribution/result; one company run before and after. |
| Exact replay after contributor pause (review correction) | Existing contribution returned; changed approach still conflicted; no new run; contributor restored to idle. |
| Changed approach under the same key | Explicit captured-input conflict; no new contribution or run. |
| Completed-result persistence after host restart | Exact contribution, issue fields, executor state and run set preserved. |
| Real Chromium interaction after restart | Completed result and run attribution visible; captured snapshot expanded; reload retained result; no uncaught page errors. |
| Native issue/executor | EXE-2 remained `todo`, assigned to the same paused executor. |
| Package checks | 34 tests passed; `pnpm typecheck` and `pnpm build` passed. |

The full report is advisory. The real result included `acceptanceCriteria[2]` and
`exclusions[2]`, although the owner had supplied one combined line per array. These
are model-generated, unvalidated references, not trustworthy machine-resolved
citations. Their prose rationale remains inspectable against the captured text.
This is a known semantic-quality limitation, not a reason to rewrite the historical
result or run another model call. Criterion-reference verification is deferred
before any future decision consumer treats such references as authoritative.

## Replaying the bounded checks

With the local instance started and an existing completed contribution selected:

```sh
node scripts/qualify-l02.mjs capture <contribution-id>
node scripts/dev-paperclip.mjs stop
node scripts/dev-paperclip.mjs start
# In another terminal, after startup:
node scripts/qualify-l02.mjs verify <contribution-id>
node scripts/qualify-l02-browser.mjs <contribution-id>
```

`capture` is create-only for its baseline file and never generates a request key.
Use `replay` with the same contribution ID to repeat duplicate/conflict checks against
that preserved baseline; a paused contributor must still return its existing result.
Preserve that baseline and use `verify` for subsequent readback. The browser check
uses Playwright already installed in the host checkout; if its matching browser is
absent, set `PAPERCLIP_BROWSER_EXECUTABLE` to an existing Chromium executable.
Credentials, full local snapshots, logs and screenshots remain ignored in
`.paperclip-dev/`; no credentials are published in the evidence document.

## PR review correction

GitHub review identified that dispatch eligibility was checked before replay lookup.
An already completed or uncertain contribution could not be replayed after its
contributor was paused. The company/request-key lookup now precedes availability
validation; changed input still conflicts, and new paused-agent requests are refused
before claiming or dispatching. Atomic claim still arbitrates concurrent new requests.
Two regression tests cover these boundaries, and native replay with the contributor
paused passed without adding a run. Evidence retains the real-run source hashes
separately from the final candidate hashes; no new model run was needed for this fix.

A second review identified two persistence boundaries. If claim insertion succeeds
but its readback fails, only that confirmed winner is marked `outcome_unknown`;
a competing duplicate never updates the winner. A valid terminal result whose
completion write fails now remains `outcome_unknown`, while invalid output remains
`failed`. A later correlated terminal event can complete the uncertain record.
Fault-injection tests cover both changes. Native readback after the updated build
preserved the completed contribution and the same single run; no additional model
call or live database-failure injection was performed.

A third review found that a failed run-state write discarded queued terminal
events and prevented later callbacks from recovering the uncertain contribution.
The service now enables callback processing only after reading back the exact
durable session/run identity in `outcome_unknown`, then drains the existing queue.
Tests cover queued and later recovery, incorrect callback correlation, and missing
or mismatched durable identity. Native readback again preserved the same result
and single run. The initial review loop stopped after publishing this tested correction.
Current review and merge status are tracked in [PR #4](https://github.com/ty000/paperclip-executive/pull/4).

## Remaining boundaries

Adverse callback, invalid output and interrupted in-flight recovery cases remain
synthetic tests. Restart qualification above concerns a completed contribution.
L01 regression tests pass; no second paid direct-advice run was added. One successful
judgment does not prove general review quality or savings. Form entry still requires
technical IDs and supplied context; it does not synchronize with Linear.

The Fallow static gate was `skipped` because its pinned executable is absent;
no tooling was installed to expand qualification. Browser checks are functional,
not a comprehensive accessibility or visual-design audit.

L03 must revalidate current ticket/mandate state and resolve Council plan-direction
versus result-verdict semantics before any governed decision or effect. The shared
acceptance instance was not modified or activated with this candidate.
