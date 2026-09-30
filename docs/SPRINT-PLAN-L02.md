# L02 — Prepared-Ticket Approach Contribution

Version: 0.1 — September 30, 2026.

Status: implemented; bounded local runtime qualification recorded in [L02 report](IMPLEMENTATION-L02.md). No calendar sprint or duration is
committed. Product parent: [BK-01 and the contribution portion of BK-04](BACKLOG.md).
Architecture authority: [TAD 0.2](TAD.md); product authority: [PRD 0.2](PRD.md).
Baseline: `c0839fe18a8673893cc6f87cafb5d765c556d638` (PR #3 merged).

## 1. Result and boundary

From the Executive page, an authenticated company owner selects an existing native
issue, supplies the prepared Linear context and a proposed approach, then requests
one structured contribution from an existing eligible agent distinct from the
issue's executor. The persisted response assesses product fit, sufficient technical
scope, and the value of further effort. The owner can inspect its source snapshot,
attribution, classified findings, failures and unknowns.

This is the first contribution toward B03, not the complete governed B03 journey.
The output is an advisory contribution, never an `approved`/`accepted` Council
verdict or permission to start work. It is useful for inspecting and reducing an
overlarge plan; L03 connects it to an authoritative Council decision and effect.

Default topology: one owner request, one configured contributor, one native session
run. Reuse the configured Executive agent when eligible; it may be the designated
Council reviewer, but that identity does not turn this output into a Council decision.
Do not create another permanent coordinator or make calls to the Council decision
endpoint. Preserve L01 direct advice as a separate journey.

## 2. Input and output contract

| Input | Rule |
| --- | --- |
| Native issue | Resolve the issue through a company-scoped host read. Capture issue/project identity, current executor agent and the relevant issue snapshot. Require an assigned executor for this reference case. |
| Prepared source | Supplied Linear identifier/URL and a content snapshot with objective, acceptance criteria, exclusions and relevant dependencies. No network fetch or Linear credentials. Label it supplied context, not synchronized Linear data. |
| Proposed approach | A concise owner/executor-supplied plan with its evidence references, decisive unknowns and applicable time/resource constraints. Capture missing values explicitly; do not invent a deadline or price. |
| Contributor | Existing configured company agent, eligible for native dispatch and distinct from the captured executor. Freeze its identity with the request; later settings changes cannot rewrite attribution. |
| Request identity | Stable idempotency key and hash over all review-affecting input, including issue/source/approach snapshots and contributor identity. Changed input under the same key is a conflict. |

The result contract is versioned and contains a recommendation, attributable
perspective notes, findings, assumptions and limitations. The three perspectives
are product, technical, and delivery/economics; a single agent may cover them.
Do not require a finding from every perspective or fabricate a defect to fill a form.

Each finding has a stable local identifier, class (`must_fix`, `useful_now`, `defer`),
a criterion or material-risk reference, evidence/rationale, and the smallest useful
action. Optional improvements cannot be rendered as prerequisites for acceptance.
An evidence reference does not prove the referenced material was independently
verified; the result must state that limitation where applicable.

Retain request/input version, issue/source identity, contributor/profile or method
version, session/run IDs, timestamps and observed terminal state with the output.
Plan contribution outcomes must not reuse native Council verdict labels. Treat
model text and supplied ticket content as data, not authority or executable commands.

## 3. Implementation tasks and PR packaging

Use one cohesive L02 implementation PR unless a real dependency requires a split.
The following are dependent tasks within that PR, not four mandatory micro-PRs.
Do not publish an unused schema or method-only library as a completed vertical slice.

| Task | Backlog parent | Component and outcome | TAD decisions | Dependency | Validation and PR unit |
| --- | --- | --- | --- | --- | --- |
| L02-T1 | BK-01 | Define the prepared-ticket and contribution contract plus a bounded review method. Reuse selected attributed material; label new guidance accurately. | AD-03, AD-07, AD-08, AD-11 | PRD/TAD and existing provenance. | Validate valid/invalid output and proportional finding examples; same L02 PR. |
| L02-T2 | BK-01, BK-04 portion | Connect owner-authorized issue lookup, immutable input/contributor capture, native dispatch and persisted contribution state. | AD-01, AD-02, AD-04, AD-05, AD-07, AD-12 | T1 and inspected SDK issue-read/session contracts. | Auth/company separation, executor distinction, duplicate/conflict, callback correlation, failure/restart checks; same PR. |
| L02-T3 | BK-01 | Add the minimal approach-contribution form and result display to the existing Executive page. | AD-09, AD-11 | T2 data/action contracts. | Input/errors, keyboard labels, empty/pending/failed/unknown/completed states and explicit advisory wording; same PR. |
| L02-T4 | BK-01, BK-04 portion | Document the delivered scope and run proportionate package checks plus the authorized reference journey when its target is available. | AD-02, AD-05, AD-08, AD-09 | T1–T3 and runtime prerequisites below. | Acceptance table below, exact candidate/host identification and honest evidence tier; same PR. |

Expected source perimeter: `packages/executive/src/`, focused tests, an additive
migration if needed, selected profile/method/provenance files, package README, and
an L02 implementation report. Add only the issue-read capability and other narrowly
justified capabilities required by the inspected host contract. Keep dependencies
and the vendored SDK snapshot unchanged unless a demonstrated compatibility blocker
requires an explicit revised plan.

Reuse the existing session, owner verification and persistence mechanisms where
they fit. Keep advice and contribution contracts distinct without creating a generic
workflow engine. Do not edit an applied migration. Touch L01 behavior only for a
shared defect that prevents this lot, with a focused regression check.

## 4. Bounded operation and recovery

Persist before dispatch. The same request must not create two runs, including
concurrent submissions. After a dispatched result becomes uncertain, expose that
uncertainty rather than creating another run. Correlate terminal callbacks to the
persisted operation/session/run; stale or unrelated output cannot complete it.

There is no automatic specialist fan-out, correction attempt, output repair or
retry loop in L02. At most one contribution run is dispatched for a captured request.
Reject changed input under its idempotency key; a deliberately new request is a new
advisory operation, not evidence of a governed correction counter. Do not claim a
shared ticket budget or stop policy has been enforced in this slice.

Use the selected native adapter's qualified run controls for the reference runtime
call. Required limits must be configured before that call; unknown cost stays
unknown. Preserve L01's explicit `outcome_unknown` behavior for missed terminal
output unless narrow reconciliation is necessary and can be qualified without a
general recovery framework. No Council mandate/counter or acceptance store is added.

If issue context or executor assignment changes during a review, retain the original
snapshot and identify it as the subject of the contribution. Before using the output
for any future governed decision, L03 must revalidate the current subject/mandate;
L02's cached contribution cannot authorize it. The UI must make this snapshot-bound
and advisory nature clear even when live freshness is unavailable.

## 5. Acceptance and evidence

| ID | Acceptance check | Minimum evidence |
| --- | --- | --- |
| L02-A1 | A real company-scoped issue and supplied source/approach are captured before dispatch; missing decisive fields, wrong company or invalid executor/contributor are refused without a model call. | Focused action/service tests; issue-read and identity readback on the selected runtime for qualification. |
| L02-A2 | One captured request yields at most one attributed native run; changed payload under the key is rejected. | Concurrent/duplicate/conflict tests and persisted IDs; one bounded real dispatch for qualification. |
| L02-A3 | A sufficient plan can receive no must-fix finding; an overlarge plan can receive an evidence-based smaller recommendation; optional polish remains optional. | Contract/fixture checks for structure and rendering; real-agent output inspection is required to assess judgment quality. |
| L02-A4 | Valid terminal output is persisted and attributable; invalid output, wrong/stale correlation, dispatch failure and missed callback remain explicit without automatic retry. | Focused lifecycle tests and persisted runtime readback for the cases actually exercised. Tests alone do not prove restart recovery. |
| L02-A5 | The operator can inspect input snapshot, contribution, finding classes, attribution and current operation state with accessible controls. | Component tests and a bounded rendered-page interaction on the selected test host. A server-rendered test alone is not browser QA. |
| L02-A6 | L01 still works; the new journey does not mutate issues, emit Council verdicts, hire agents, start executor work or contact Linear/OpenExecutive. | Relevant regression tests, capability/code review and observed call boundaries. No claim of a security sandbox from these checks. |

Local package commands from `packages/executive` remain `pnpm typecheck`, `pnpm test`
and `pnpm build`, with the pinned frozen lockfile if installation is required.
Run applicable repository/skill checks for the actual source diff; avoid unrelated
whole-platform audits or installing tooling merely to expand the gate list.

Report two distinct milestones:

- **L02 implemented and locally validated:** the complete code/UI slice exists,
  targeted checks pass, and the report names runtime evidence still outstanding.
- **L02 runtime-qualified for advisory use:** the selected host, identities, method,
  real run, persistence and rendered interaction have been observed within the
  agreed limits. This is still not complete B03 or G01–G04 qualification.

For the real-agent check, use one small prepared development ticket with explicit
criteria and a deliberately inspectable approach. One bounded call is enough to
start assessing usefulness; it does not prove general review quality or savings.
Do not manufacture extra paid runs to make every test fixture a live demonstration.

## 6. Prerequisites, stop conditions, and handoff

Implementation can start from the pinned repository with fixtures and local package
checks. Runtime qualification additionally needs an explicitly selected disposable
or otherwise authorized Paperclip host, existing executor/contributor identities,
adapter/model access, run limits, and an owner-approved reference ticket. These are
unresolved runtime inputs, not reasons to invent an instance or reuse the earlier
OpenExecutive experiment's credentials/configuration.

Stop and return a concrete dependency if the selected SDK cannot provide scoped
issue context or attributable bounded dispatch. Do not replace the missing host
contract with direct core-table writes or broaden into a Council implementation.
For failed or uncertain runtime effects, inspect the recorded operation before any
retry; repeated attempts without new evidence are not progress.

L02 is done at the explicitly reported milestone when L02-A1–A6 have the evidence
appropriate to that milestone and remaining runtime checks are named. Never label
local completion as an autonomous supervised release. Update the L02 report with
actual touched files, checks, limitations and the contribution contract that L03
can consume; no new multi-phase handoff framework is needed.

Before L03, select Council's actual integration target and resolve plan-direction
versus result-verdict semantics. The inspected prototype's `approved` verdict moves
an issue toward `done`; it cannot simply mean "the implementation plan may proceed."
That is a real dependency, not an invitation to copy Council's writer into Executive.
