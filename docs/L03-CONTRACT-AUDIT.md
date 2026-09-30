# L03 contract audit — Executive, Council and Paperclip

Date: 2026-09-30. Status: **audit completed; L03 ready under dependencies**.
This is a source and documentary audit, not an implementation or a fresh runtime
qualification. The companion [L03 framing](L03-FRAMING.md) assigns the missing
contracts, integration sequence and acceptance evidence.

## 1. Material findings

| ID | Finding at the inspected revisions | Consequence / owner |
| --- | --- | --- |
| F1 | Executive L02 produces an attributed, snapshot-bound advisory contribution. Council's existing `approved` path applies a result-review transition; it is not a plan-direction API. | Council must implement distinct continuation semantics before covered executor work is released. Executive must never translate a favorable recommendation into `approved`. |
| F2 | Council 0.3.0 persists pinned rosters and draft missions. Its mission aggregate has `phase: draft`, `control.status: inactive`, `execution: blocked`, and empty effect intents. | Mission storage is reusable; executable mandates, decisions, corrections, dispatch admission and reconciliation remain Council work. This is more than a small Executive adapter. |
| F3 | The native host persists review decisions, but the supported issue projection does not supply the complete canonical decision record needed to reconcile an uncertain Council PATCH. | A bounded host readback dependency remains open at H. Reuse any sufficient supported read discovered on a later revision; otherwise expose the minimal authorized projection. Do not substitute direct core-table reads. |
| F4 | Normal approval checks a delivery manifest, exact requested commit and attachment metadata. Bundle-byte verification exists in the foundation probe but is not wired into the approval handler. Candidate work-product checking is conditional on a projection that the pinned SDK issue read does not provide. | Council must bind a stored submission and verified bytes to the decision, then revalidate the current subject before application. A manifest alone does not close exact-result acceptance. |
| F5 | Draft mandate limits are declarations. Canonical correction/consultation accounting and atomic shared admission reservations are not implemented by that storage. | Council owns durable counters/reservations and reconciliation; host/native controls must qualify the selected operating limits. Unknown spend/exposure cannot authorize another call. |
| F6 | L02 parses finding structure, not the truth of criterion/evidence references. Its historical real output included references outside the supplied arrays. | The decision consumer must resolve references against the frozen criteria/evidence and reject unsupported acceptance claims. Do not rewrite historical advice or treat parser success as validated evidence. |
| F7 | Catalogue, package, installed distribution, loaded instructions and live identities are separate dependencies. There is no selected authorized runtime target for this audit. | Use provisional role references; final integration and qualification must pin the merged agents lot and independently verify runtime availability. |

These findings block dependent L03 capabilities, not completion of this audit.
No claim of V1 completion, collective judgment quality, universal bypass resistance,
or end-to-end monetary ceiling follows from the documents.

## 2. Retained versions and ownership

All source references below resolve at these immutable revisions. Working-tree
state was inspected before writing; other checkouts were not changed. Remote PR
metadata was read with `gh`; Council main was checked with `git ls-remote` without
fetching or changing that repository.

| Ref | Path / branch / exact SHA | Owner, version and status |
| --- | --- | --- |
| E | `/home/davy-lp/.codex/worktrees/l03-contract-audit/paperclip-executive`, `codex/l03-contract-audit`, base `ccd02e1f594b5fe6083d4c2f1c1ad7533bc7f54e` | Executive contribution/contracts/UI. Canonical merged L02, [PR #4](https://github.com/ty000/paperclip-executive/pull/4), package `@paperclip-executive/executive` 0.1.0, manifest 0.2.0; PRD/TAD 0.2, Backlog/L02 plan/report 0.1. Package version alone does not identify L02. New documentary commits are descendants of this base. |
| E-old | `/home/davy-lp/workspace/paperclip-executive`, `codex/l02-plan`, `404d62d0c374b73ce21072e0cf71469b9be506ec` | Clean but older planning checkout; not the implementation baseline. Other historical worktrees: `executive-h1` at `6b157f8b57967cf7695a155df7fab72e03028e3c`, `l02-review` at `9b1554d6aa0d8b242885c862a2d550538b9a09f7`, `ci-tests-fallow` at `ed5b23f84f05c1343169ceab3ec0cb736499d613`; none reused or modified. |
| C | `/home/davy-lp/.codex/worktrees/council-agent-profiles/paperclip-council`, `codex/council-agent-profiles`, `bc6d71fa6ede8f239c7990af1885dc07cccc7c18` = remote `origin/main` at initial inspection | Council mandate, composition, result decision and application owner. Retained executable baseline (unchanged in final C-policy main), standalone package 0.3.0, SDK/shared 2026.916.1; [PR #8](https://github.com/ty000/paperclip-council/pull/8) merged. Untracked `agents/`, `provisioning/`, `skills/` belong to concurrent work and are not accepted source evidence. Inspect committed objects. |
| C-old | `/home/davy-lp/workspace/paperclip-council`, `codex/product-prd-roadmap`, `365809efdf190010f818a25b938bad59ebd4f33c` | Historical documentary checkout, untracked `docs/reviews/` preserved. Local `main` is older still (`307101af5f3f28e57db52d6ec4a8725e1a7b9544`). Neither is selected as current implementation. |
| C-policy / final main | Remote `ty000/paperclip-council`, `main`, `ee262eed809c5d7c96eef0e7ee330e0e56a65104`; local source inspected in `council-v1-docs` on `codex/council-g3-g4-decisions` at `64aa5b2095650f010545ac5dca81a61abe2939b9`, then `19cd67b752b4b40ab6000eb157cc301f2f64d47f` | [PR #10](https://github.com/ty000/paperclip-council/pull/10) merged during this audit. Remote comparison C → final main contains only eight documentation files; executable C source is unchanged. Merged DEC-G3-01 / DEC-G4-01 policy record read back through GitHub. Implementation/qualification remain open. No fetch or write to Council checkout. |
| C-qa | `/home/davy-lp/.codex/worktrees/council-l2/paperclip-council`, `codex/council-qualification-ci`, `08ced49a4a1264c53d4a0c69a0b4a59379aa91d9` | [PR #9](https://github.com/ty000/paperclip-council/pull/9), open at inspection. Test/qualification infrastructure, pinned-host recipe and process cleanup; does not implement G3/G4 or mission execution. Candidate harness only until integrated and requalified. |
| H | `/home/davy-lp/workspace/paperclip`, `codex/council-feasibility`, `61b3fd57a695614dc4a37e2303f426a34a9795cf` | Paperclip native auth, issue policy, decisions, sessions, artifacts and instructions. Selected source baseline because E's historical L02 proof and C's qualification recipe pin it. Modified `pnpm-lock.yaml`, untracked prototype and review reports preserved. It is not asserted to be latest upstream or the currently running distribution. |
| P | H's untracked `packages/plugins/paperclip-council`, no independent commit; host container SHA is H | Embedded prototype 0.1.0, workspace SDK. Historical comparison only; its bytes are not authenticated by H's commit. Do not install it as the standalone C package or merge evidence across them. |
| Installed | No authorized target/access supplied for this run | Installed Council/Executive distributions, hashes, active company, credentials, loaded profiles and current runtime health: **unknown**. No runtime read or activation performed. |

Council worktree enumeration also found the older extraction, manifest-gate, L0,
S1 and V1-design branches. Their functionality was reconciled against C rather than
chosen by directory name. Relevant merged lineage: manifest gate PR #3 at
`9d7d0e0efd21d8385f10fea018e3e4c0697eaf30`, rosters PR #6 at
`bfa921000c0743aff17d2c1e48eff6bb9ca365cf`, CI PR #7 at
`2cc12cdad643afb78dd9b7cbcd384f2501c8595f`, then missions PR #8 at C.

An Executive `agent-catalog` worktree was initially observed at E, with no tracked
diff; it disappeared from `git worktree list` during the audit. No inference about
completion or merge is made from that lifecycle change. A later metadata check found [Executive agents PR #6](https://github.com/ty000/paperclip-executive/pull/6),
draft at `82e8338bccf6ca05880941d287946238c33484e6`, branch
`codex/executive-agent-assets`. Its sole published file at that snapshot is
[AGENT-HANDOFF-L03.md](https://github.com/ty000/paperclip-executive/blob/82e8338bccf6ca05880941d287946238c33484e6/docs/AGENT-HANDOFF-L03.md):
provisional `executive-agent-catalog.v1`, asset version 1.0.0, 18 intended distinct
profiles and an explicit richer-opinion/L02 compatibility boundary. The handoff was
read; unpublished profile assets and runtime loading were not inferred. The dependency
still needs the final merged commit and validated assets, not a worktree name.

## 3. Contract and evidence matrix

**Available** means source-supported for the stated narrow behavior. **Partial**
means reusable pieces exist but do not satisfy L03 end to end. **Absent** means the
required behavior was not found on the inspected production path. **Unknown** means
insufficient authorized evidence. None of these labels silently asserts fresh runtime
qualification. Test references are inspected coverage, not tests executed by this audit.

| ID / contract | Producer → consumer; owner | Actual surface, actors, inputs / outputs / refusal | Persistence, transitions and readback | State, evidence and minimum L03 closure |
| --- | --- | --- | --- | --- |
| A1 Ticket/context | Supplied Linear context + host issue → Executive → Council; host owns issue, Executive owns captured contribution input | E `submit-contribution` / `ContributionService.submit`; owner-authorized request, host-scoped issue and contributor reads. Issue must have executor; contributor must differ. Source carries supplied Linear ID/URL, objective, criteria, exclusions, dependencies; approach includes evidence, unknowns and constraints. Missing/invalid input or wrong scope is refused before dispatch. No Linear fetch. | E stores issue/project/executor/update-time, source, approach and contributor snapshots plus input hash, session/run IDs. Submit re-reads issue/contributor before hash comparison; changed issue/context causes a same-key conflict, while contributor eligibility status is excluded from the hash. Returning or displaying an existing contribution is not current decision authorization. | **Available** advisory capture, **partial** governed context. E1/E2 tests cover validation and correlation. Council must bind immutable context/criteria and revalidate current issue, assignment and mandate before direction/application; changes invalidate dependent reviews. |
| A2 Composition/mandate | Owner + agents lot → Council mission → execution/review participants; Council owns authority | C roster list/create/detail/commands and mission list/create/detail/commands in manifest. Board owner authority derives from company `defaultResponsibleUserId`. Missions select team/council revisions, lead/final reviewer, required perspectives, objective, criteria, commitments and declared task/period/correction/elapsed limits. Wrong actor/scope, invalid composition or stale revision is refused. | Immutable roster revisions; one mission per company/root issue; insert conditionally locks eligible roster heads; command receipts and version CAS. Only draft/inactive missions and draft mandate updates exist. Readiness explicitly blocks execution. | **Available** pinned draft storage, **absent** executable mandate. C1/C2 and mission/roster tests; historical installed-host proof is confined to draft persistence. Extend Council aggregate with active authority, revision/revocation checks and action limits. Bind multiple distinct opinions without creating multiple final authorities. |
| A3 Approach direction | Executive advice + executor approach → Council → native executor; Council owns decision | E recommendation is advisory. C `/issues/:issueId/decision` only accepts `changes_requested` or `approved`, with justification/result reference and `approvedCommit` for approval. Handler requires configured Council agent/run, company-matching `in_review` issue assigned to that agent. Approval maps to native result completion, not permission to begin. | No stored executable approach decision or release receipt exists in C's mission aggregate. Host result-review transitions do not supply this semantic contract. | **Absent** governed plan direction. C3/H1. Add separately typed approach direction and bounded next-action intent under current mandate, with confirmed native dispatch/readback. Never overload result `approved`; no invented existing endpoint is proposed here. |
| A4 Exact review subject | Executor/integration lead → Council; Council owns submission, host owns artifact/document storage | C `verifyApprovalCandidate` reads `delivery-manifest`: repository, branch, base/approved commit, bundle attachment/hash, workspace, assignee. Request commit must match; attachment must belong to same issue/company and hash metadata. Missing manifest yields 409, malformed/mismatched candidate 422. Current work-product matching is conditional. `changes_requested` has only a free-text result reference. | Native issue documents are mutable/revisioned; C currently lacks immutable submission/evidence/mandate bindings for either verdict. Foundation `verifyCandidateAttachment` verifies bounded bytes/Git bundle separately from approval. | **Partial** exact-result guard. C3/C4 tests + foundation tests; not a production byte-verification guarantee. Store immutable candidate/evidence tuple, author/reviewer and mandate revision; wire byte verification into application and reject changed subject. Mutable branch alone never identifies acceptance. |
| A5 Decision/effect | Council final reviewer → public native issue mutation → Council/Executive observation; host owns native decision | C POST plugin decision → `emitCouncilDecision` → authenticated public `PATCH /api/issues/:issueId`, agent secret reference and current run. Host applies execution policy and records native review evidence. Response status/body is forwarded; refusal is not success. A favorable comment is not a decision. | H atomically updates the issue and inserts `issue_execution_decisions` for execution-stage decisions; issue `executionState.lastDecisionId` and outcome can be read back. C returns the immediate response without a durable mission decision/application intent or complete canonical uncertainty readback. That native transaction does not include Council plugin state or external effect delivery. | **Partial** immediate result effect, **absent** qualified decision/effect reconciliation. C3/H1/H2. Add Council intent/receipt and minimal supported host decision readback with actor/run/body/stage/round/outcome/effect correlation. Confirm effect only from matched native evidence. |
| A6 Correction/re-review | Council → executor → new submission → Council; Council owns loop | H native `changes_requested` can return work to implementation; review policy has `maxReviewRounds` and persisted `changesRequestedCount`; human decisions reset that consecutive-stage count. These are not the complete Council correction/consultation envelope. New result cannot inherit a prior approval. | C declares `correctionLimit` but has no executable correction transition/counter/history. Native round accounting does not cover all review, specialist and failed/uncertain attempts. | **Partial** native transition, **absent** governed loop. C2/H1. Persist semantic correction count, preserved criteria and targeted findings; claim allowance before dispatch; require V2's own decision/effect. Distinguish correction from transport retry and qualify `maxReviewRounds` translation. |
| A7 Idempotence/concurrency | Authenticated requester/effect owner → Executive/Council/host | E company/request-key atomic insert + input hash: identical replay, changed payload conflict, only insert winner dispatches. C mission create receipts and mandate CAS arbitrate local commands. Neither is a native issue-PATCH idempotency contract. | E affected-row checks and readback preserve returned run ID on uncertainty; C aggregate version/receipt in single SQL updates. No plugin-to-host transaction, global lock or distributed exactly-once guarantee. | **Available** local claims, **partial** cross-system effect. E2/C2 tests. L03 adds Council command/intent identity and revision claims before any call; stable reservation shared by retries. Duplicate/concurrent tests must assert model/native mutation count, not only response equality. |
| A8 Interruption/unknown | Host callbacks/readback → persisted operation reconciliation; each owner reconciles its own effects | E states: `prepared`, `dispatching`, `running`, `completed`, `failed`, `outcome_unknown`; terminal output must match contribution/session/run. Startup marks in-flight records unknown; no redispatch on replay. H session events are live; no durable output replay guarantee established. Session close is not cancellation. | E late correlated callbacks may recover a durably identified unknown record; completed-result restart is historically proved. C has no production pending-decision reconciler. Lost response after native success remains distinguishable from failure. | **Partial** contributions, **absent** complete decision recovery; deployed state **unknown**. E2/E3/H2/H3. Reconcile exact native evidence, retain uncertainty and reservations when missing/ambiguous; absence alone must not release a second PATCH or model call. |
| A9 Multiple profile consultation | Owner selects available composition; Council selects needed opinion slots → Executive contribution producer → Council synthesis/final reviewer | E currently executes one owner-requested contribution per operation, not fan-out. C can pin multiple roster members and responsibilities but does not execute/collect a review graph. Profile/method version and agent/run attribution must not be collapsed into a single generic opinion. | No persisted multi-opinion completion criterion/dispatch owner contract exists yet. Several stored contributions do not establish a completed Council review. | **Partial** data foundations, **absent** orchestration. E1/C1/C2. Proposed boundary: Council owns slot selection/admission/completion; Executive alone sends each reserved contribution; Council dispatches executor/final-reviewer work. Do not also send the same contribution through Council. Serial distinct opinions are compatible with a broad catalogue; no voting/fan-out engine required. |
| A10 Permissions/alternate paths | Authenticated host actor → scoped plugin routes → native policy; host and Council own enforcement | E requires authenticated board owner and rejects contradictory caller company/actor context. C decision requires configured agent/run; mission owner and company checks are independent. H public HTTP policy and privileged SDK `issues.update` are different paths. Agent titles, prompts and manifest capabilities are not a universal sandbox. | Revocation must block new governed claims, not erase pending effects. Existing in-flight writes require reconciliation. Owner and native administrative paths remain separately attributable. | **Partial** enforcement for covered paths, **unknown** current runtime identity/configuration. E1/C2/C3/H1/H3/H4. Test wrong company/actor, expired or mismatched run, revoked/stale mandate and alternate executor route on selected host. No privileged fallback after refusal; no claim to control every board/external delivery path. |

## 4. Existing surface details and gaps

### 4.1 Executive evidence boundary

E exposes UI data/actions, not a Council decision route. Contribution storage has a
company/request-key uniqueness constraint and a content hash. It preserves model
attribution and uncertain outcomes but has no mission authority, shared correction
counter or acceptance store. A new request key denotes a new advisory operation;
it does not reset or establish a governed Council allowance.

The L02 report and `docs/evidence/l02-runtime.json` record one bounded advisory run,
duplicate/conflict checks, completed-result restart and rendered-page checks on H.
These are historical artifacts inspected here, not new observations. Adverse
in-flight failures remain predominantly synthetic. Source hashes for the original
run and later corrections differ in that report; do not claim every final code path
was exercised by the same real run.

### 4.2 Council and native decisions

Actual C routes are declared under `/api/plugins/:pluginId/api`:

- GET/POST `/companies/:companyId/rosters`, GET roster detail and POST roster commands.
- GET/POST `/companies/:companyId/missions`, GET mission detail and POST mission commands.
- POST `/issues/:issueId/decision` and the separate foundation-probe route.

The richer `/issues/:issueId/council/...` route family in Council TAD is a proposal,
not a set of implemented endpoints. Actual mission commands cover create and draft
mandate update; do not infer enable, review, submit, resume or reconcile from that
TAD table. Read routes do not grant mutation authority. `handleMissionApi` returns 201 for
newly applied creation, otherwise 200 with `outcome`, mission and inspection;
inspection exposes `recorded: true`, `compositionsPinned: true`, `executable: false`,
prerequisites and next action. Domain refusals carry `error`, `code`, `details`
(400 invalid command/input shape, 403 owner refusal, 404 missing object,
409 identity/revision conflict, 422 invalid domain selection as applicable).
Executive's UI action instead returns a contribution record or throws a service
error; do not invent HTTP status codes for that action bridge.

The legacy decision action consumes verdict, justification, result reference and,
for approval, an exact lowercase 40-character `approvedCommit`. It does not consume
a persisted Council decision ID, expected mission version, frozen contribution set
or mandate revision. Its configured single agent/secret mapping must be reconciled
with the pinned final reviewer when governed missions become executable. L03 must
prevent that legacy route from bypassing stored decisions on governed issues while
preserving explicitly ungoverned legacy behavior.

The public host result policy supplies a useful native correction/completion effect.
For execution-stage decisions, H generates a decision UUID, stores it in
`executionState.lastDecisionId`, and commits the issue update and
`issue_execution_decisions` row in one database transaction
(`server/src/routes/issues.ts:13233`, `:13740`; decision schema lines 7–26).
This is an actual native atomicity guarantee, not a plugin/host transaction.
The supported issue read exposes the last decision ID/outcome and consecutive
`changesRequestedCount`, but not the complete stored actor/run/body decision.

H also has a **separate public human Decisions API**: agent+run creation via
`POST /api/companies/:companyId/decisions`, board decision via
`POST /api/decisions/:id/decide`, and board/origin-agent outcome via
`GET /api/decisions/:id` (`server/src/routes/decisions.ts:138-180`). It supports
idempotent creation, signed target snapshots and persisted per-effect execution
(`server/src/services/decisions.ts`). This is available source behavior that may
serve owner-reserved direction/escalation after mandate/subject binding. The decide
route requires a board user: it does **not** supply routine delegated Council-agent
plan authorization. Requiring a fresh owner decision for every segment would change
the intended autonomy. Its IDs/records must not be confused with execution-stage
`issue_execution_decisions`, and it does not close G3 for the existing Council PATCH.
No matching plugin SDK facade or Council mission integration is present.

A third internal ledger, `status_decisions` / `status_decision_effects`, has
transactional native-runtime status/effect handling in
`server/src/services/native-runtime/status-decision-committer.ts`. This is a different
native-run path, not a supported Council decision-readback contract. Reuse only after
proving the chosen operation actually maps to it; do not conflate these three APIs.

A `done` issue or `workflow` projection alone cannot establish which Council intent,
subject, actor/run and decision caused it. Native decision rows existing internally
does not mean the plugin can read them through a supported API.

### 4.3 G3 and G4 rechecked

At C/H, production decision readback and task/period reservation/exposure enforcement
remain missing for this integration. Host budget service already aggregates observed
`costEvents` for company/agent/project billed-cent policies and checks hard-stop
thresholds in `getInvocationBlock` (`server/src/services/budgets.ts:48-75`,
`:143-166`, `:730-863`; `server/src/routes/costs.ts:288-304`). It has real observed-spend
controls; the missing guarantee is joint pre-launch task/period reservation and
retention of in-flight/unknown exposure. Checking incurred spend then launching does
not atomically prevent concurrent over-admission. This conclusion rests on current inspected
routes, schema and worker code, not only on old L0 reports.

[C-policy's decision record](https://github.com/ty000/paperclip-council/blob/ee262eed809c5d7c96eef0e7ee330e0e56a65104/docs/G3-G4-DECISIONS.md)
records owner acceptance of minimal supported native readback (DEC-G3-01) and prudent
admission control (DEC-G4-01). The latter allows residual overrun from already
committed work; it still requires atomic task/period reservations, operational limits,
late-usage settlement and blocking when available allowance or exposure is unknown.
It is not permission to invent zero costs or launch beyond the allowance.

The policy PR merged during this audit at `ee262eed809c5d7c96eef0e7ee330e0e56a65104`.
Use that merged policy with the unchanged executable C baseline; do not reopen the
same product decision or mistake documentary alignment for technical qualification. Numeric values, measurement sources and qualification
are still unresolved. The reviewed follow-up at `19cd67b` explicitly separates
G3 readback, G4 admission/operational limits and L03 owner continuation (`DEP-OWNER`);
closing G3/G4 alone would not qualify the full L03 journey. C-qa prepares isolated-host tooling; it supplies no new native
decision API, budget service or execution permission.

## 5. Contradictions and dependency disposition

| Discrepancy | Disposition and responsible owner |
| --- | --- |
| Executive historical backlog describes only the embedded prototype; Council main now includes standalone roster/mission storage. | This audit pins C. Executive documentation owner should refresh parent-source references in a later authorized change, coordinated with the agents lot; no parent document is edited here. |
| Existing Executive documents defer extra agents or describe a one-reviewer starting slice; current owner request wants a broad catalogue and several distinct opinions. | Current request governs this framing. Agents lot owns catalogue/profile revisions; Council owns versioned composition and one final authority. Do not freeze L03 to one generalist or copy a competing profile list. |
| Council TAD's proposed API and aggregate exceed implemented draft-only missions. | Source code/manifest are implementation truth. Mark executable workflow absent; assign changes explicitly to Council. |
| Initial main budget wording differed from C-policy; PR #10 merged during audit. | Documentary policy alignment is now merged at `ee262eed`; source behavior remains unchanged. Qualify the accepted admission policy before activation; no runtime guarantee follows from the merge. |
| Council foundation byte verification can look like a production approval guarantee. | Keep probe evidence separate; wire and qualify it in the real decision path before closing F4. |
| E package 0.1.0 and manifest 0.2.0 disagree. | Executive owner should align release identity before final L03 integration; until then pin commit and artifact hashes, never a bare version. |
| SDK dependency versions differ: E vendors SDK 1.0.0/shared 0.3.1 tarballs; C pins 2026.916.1 packages; both reference H historically. | Validate the actual required bridge types and runtime behavior on the selected final combination. Matching host SHA or similar methods do not prove package parity. Upgrade only for a demonstrated dependency. |

## 6. Replayable source index and audit validation

Paths in this index are relative to E, C or H as defined above; function names are
stable lookup anchors. To replay without touching concurrent work, use
`git -C <repository> show <SHA>:<path>` and search for the named symbol. GitHub links
pin the same source object; historical test reports do not replace source inspection.

| Ref | Canonical files / anchors | Available proof tier |
| --- | --- | --- |
| E1 | [E contribution.ts](https://github.com/ty000/paperclip-executive/blob/ccd02e1f594b5fe6083d4c2f1c1ad7533bc7f54e/packages/executive/src/contribution.ts), `ContributionService.submit`, `parseContributionResult`, input/output parsing; `src/worker.ts`, `src/manifest.ts` | Source; tests in `packages/executive/tests/contribution.spec.ts`, `plugin.spec.ts`, `ui.spec.tsx` inspected. |
| E2 | [E contribution-repository.ts](https://github.com/ty000/paperclip-executive/blob/ccd02e1f594b5fe6083d4c2f1c1ad7533bc7f54e/packages/executive/src/contribution-repository.ts); `migrations/002_prepared_ticket_contributions.sql` | SQL claim/affected-row/readback and recovery tests; no rerun here. |
| E3 | [L02 implementation](IMPLEMENTATION-L02.md), [runtime evidence](evidence/l02-runtime.json), [L02 plan](SPRINT-PLAN-L02.md) | Historical bounded real advisory and synthetic tests; scope/limitations retained. |
| C1 | [C rosters.ts](https://github.com/ty000/paperclip-council/blob/bc6d71fa6ede8f239c7990af1885dc07cccc7c18/src/rosters.ts), `validateRosterPair`; `src/manifest.ts` | Source plus `tests/rosters.spec.ts` and historical S1 report. |
| C2 | [C missions.ts](https://github.com/ty000/paperclip-council/blob/bc6d71fa6ede8f239c7990af1885dc07cccc7c18/src/missions.ts), `MissionAggregate`, `handleMissionApi`; `migrations/003_missions.sql` | Source plus `tests/missions.spec.ts`; `docs/reviews/l2/REPORT.md` ties 31 installed-host synthetic checks to candidate `cdd989f0072676777840ab9fc701a9b84ca90dca`, not fresh activation at C. |
| C3 | [C worker.ts](https://github.com/ty000/paperclip-council/blob/bc6d71fa6ede8f239c7990af1885dc07cccc7c18/src/worker.ts), `handleDecision`; `src/contracts.ts`, `src/decision-adapter.ts`, `emitCouncilDecision` | Source plus `tests/decision-adapter.spec.ts`, `tests/approval-preflight.spec.ts`. |
| C4 | [C delivery-manifest.ts](https://github.com/ty000/paperclip-council/blob/bc6d71fa6ede8f239c7990af1885dc07cccc7c18/src/delivery-manifest.ts), `verifyApprovalCandidate`; `src/foundation-probe.ts`, `verifyCandidateAttachment` | Metadata preflight and separate byte-check source/tests; foundation runtime evidence is historical and bounded. |
| H1 | [H issue routes](https://github.com/paperclipai/paperclip/blob/61b3fd57a695614dc4a37e2303f426a34a9795cf/server/src/routes/issues.ts); `server/src/services/issue-execution-policy.ts`; `packages/shared/src/validators/issue.ts` | Source plus `server/src/__tests__/issue-execution-policy.test.ts`; no native scenario executed here. |
| H2 | [H native decision schema](https://github.com/paperclipai/paperclip/blob/61b3fd57a695614dc4a37e2303f426a34a9795cf/packages/db/src/schema/issue_execution_decisions.ts); `server/src/services/issues.ts`; `packages/shared/src/types/issue.ts` | Native issue/decision transaction at `server/src/routes/issues.ts:13740`, `executionState.lastDecisionId` at `packages/shared/src/types/issue.ts:709`; full uncertainty readback not established. |
| H3 | [H plugin host services](https://github.com/paperclipai/paperclip/blob/61b3fd57a695614dc4a37e2303f426a34a9795cf/server/src/services/plugin-host-services.ts); `server/src/routes/plugins.ts`; `packages/plugins/sdk/src/types.ts`; `server/src/services/plugin-database.ts` | Scoped actor/issue/session/SQL bridge source; no cross-service transaction or session-close cancellation proof. |
| H5 | [H human Decisions routes](https://github.com/paperclipai/paperclip/blob/61b3fd57a695614dc4a37e2303f426a34a9795cf/server/src/routes/decisions.ts), `server/src/services/decisions.ts`, `packages/shared/src/types/decision.ts`; `server/src/services/budgets.ts`, `getInvocationBlock` | Source only: board decision/per-effect tracking and observed-spend controls exist, distinct from Council delegated direction/readback/reservations. |
| H4 | [H managed agents](https://github.com/paperclipai/paperclip/blob/61b3fd57a695614dc4a37e2303f426a34a9795cf/server/src/services/plugin-managed-agents.ts), `reconcile` / `reset`; SDK `PluginSkillsClient`; native agent permission/instruction services | Source only. Reconcile preserves existing customization; catalog declaration is not loaded-instruction proof. |

Validation for this audit is documentary: exact Git identities and remote PR state,
source-to-claim review, coverage of all ten audit axes, link/path checks and
`git diff --check`. No package test, installation, runtime mutation, secret lookup,
provider/model call through Paperclip or scenario execution was performed. Existing
CI may run on the authorized documentary PR; its results do not qualify L03 runtime.
Independent final review and resulting corrections are recorded in the companion
framing's validation section.
