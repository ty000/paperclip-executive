# L03 real campaign proposal

Status: prepared and dormant; on hold for the unresolved native correction-continuation finding L03-HOST-003 and explicit operator authorization. The proposed initial campaign has ten native agent runs/sends, with no retry. A native run can contain multiple provider turns or requests. This document does not authorize a provider call.

## Prepared target

- Instance: `executive-dev` at `http://127.0.0.1:3220`, authenticated/private, Paperclip `61b3fd57a695614dc4a37e2303f426a34a9795cf`.
- Company: `ba82ae5f-292f-4c13-a02a-70ddef6cb22b` (`Executive L03 Qualification 2026-09-30`).
- Executive plugin: `2f5ead19-69e1-4065-9fe4-93bd7699e510`, version `0.3.0`, native registry `ready`, worker health read back.
- Council plugin: `cb1d37ab-e723-4d63-bed1-3e87442afc51`, version `0.5.0`, native registry `ready`, worker health read back.
- Project: `fdd1f84b-cf18-4d8e-8015-2c517f6de76e` (`L03 Campaign Budget Fixture`).
- Workspace: `d571118e-f2ab-49a7-a0a0-1de84c61d8ec`, isolated local repository `/home/davy-lp/workspace/paperclip-executive/.paperclip-dev/l03-real`, primary/manual, baseline commit recorded by [l03-safety.json](evidence/l03-safety.json).
- Root issue: `a378ad22-d01b-43f7-99d8-785076310607` (`EXEA-1`), assigned to the Software Executor and held in `backlog` with no automatic trigger.
- Draft executor team: `a95139d3-b826-4ddb-83b6-38663491048d`; one integration lead with bare catalogue responsibility `software-executor`.
- Draft Council: `8bc68301-2979-4383-919d-dc733d155267`; the final reviewer plus five specialists with exact bare catalogue responsibilities and required perspectives (`council-reviewer`, `product`, `architecture`, `quality`, `delivery`, `economics`). Exact current revisions are recorded in [l03-mandate.json](evidence/l03-mandate.json); superseded drafts remain in native history.
- Prepared mission/governance identity: mission `4b91a4b3-ecf6-41ef-9de9-d2057dddc54a`, command `4057ebbb-6720-4045-a557-06a8d5fe0fb8`, expiry `2026-10-07T20:00:00.000Z`.
- Council decision credential: dedicated standard reviewer key stored immediately as native local-encrypted company secret `5643ccfe-ba74-4038-b587-3c2dc8ece46b`; plugin configuration readback contains only its `secret_ref` and the reviewer ID.
- Catalogue: `packages/executive/config/agent-catalog.json`, version `1.0.0`; profile instructions and four required company skills match their source SHA-256 values.

All seven agents are paused. Heartbeat and on-demand wake are disabled. The five specialists and executor have `maxDailyRuns: 2` and `timeoutSec: 300`; the Council Reviewer has `maxDailyRuns: 3` and `timeoutSec: 600`. Every agent has concurrency `1`, `maxDailyCostCents: 100`, and monthly budget `100`; the company monthly budget is 700 cents. These are admission thresholds, not guarantees that native billed cost cannot overshoot after a run starts. The dangerous Codex bypass flag reads back `false`. ACP network access was submitted as `false`; the native configuration API confirms a plain binding exists but redacts its value. No L03 run exists.

Evidence:

- [l03-installed.json](evidence/l03-installed.json): installed package identities, versions, hashes, registry state, and zero provider calls.
- [l03-preparation.json](evidence/l03-preparation.json): company, agent, instruction, skill, model inventory, and L02 preservation evidence.
- [l03-safety.json](evidence/l03-safety.json): final safe adapter configuration, plugin health, fixture/project/workspace identity, dormant readback, and zero L03 runs.
- [l03-mandate.json](evidence/l03-mandate.json): exact draft roster revisions, failed eligibility while agents are paused, redacted credential/config metadata, and unsubmitted activation, mission, and governance request bodies.

## Campaign objective

Implement `allocateCampaignBudget(input)` in the isolated fixture. It must return a deterministic plan or typed refusal and enforce:

1. the seven declared roles only;
2. at most two calls per specialist/executor, three for the Council Reviewer, and fourteen overall;
3. at most 700 cents overall;
4. an authenticated executor approach before Council reservation;
5. Council reservation before five specialist contributions;
6. favorable direction before implementation and result review after implementation;
7. independent result review: the executor cannot accept its own result;
8. fail-closed handling of invalid roles, duplicates, invalid numbers, stale inputs, invalid ordering, or excess cost without a partial plan.

The fixture intentionally contains an unimplemented function and executable acceptance tests. It has no deploy, publication, external API, customer data, credential, or network requirement.

## Exact initial campaign: ten native agent runs/sends

| Seq. | Profile | Agent ID | Model / effort | Purpose | Admission allocation |
| ---: | --- | --- | --- | --- | ---: |
| 1 | Software Executor | `9acab613-9c24-45df-8f26-e600fc61d615` | `gpt-6-sol` / `high` | Create and submit the authenticated active approach | 40 cents |
| 2 | Council Reviewer | `e39b0edd-435e-4aa7-bdd5-9d29753680ff` | `gpt-6-astra` / `high` | Reserve five attributable contribution slots against that approach | 10 cents |
| 3 | Product | `481caab0-d0b3-442b-a5f4-5fe1d6563edb` | `gpt-5.6-sol` / `medium` | Contract meaning and acceptance criteria | 100 cents |
| 4 | Architecture | `63e53a4a-1c89-4490-9739-05699be031fa` | `gpt-6-sol` / `high` | Interfaces, ordering invariants, fail-closed design | 100 cents |
| 5 | Quality | `cc0fe155-dfeb-4157-9827-4abe01c98daf` | `gpt-5.6-sol` / `medium` | Test adequacy and residual evidence gaps | 100 cents |
| 6 | Delivery | `ff2d8928-78f9-4f7f-9c81-af6bded5bd1e` | `gpt-5.6-sol` / `medium` | Smallest viable implementation sequence | 100 cents |
| 7 | Economics | `80d1e926-718d-4e7a-8311-c31e09e410fd` | `gpt-5.6-sol` / `medium` | Proportional cost and budget boundaries | 100 cents |
| 8 | Council Reviewer | `e39b0edd-435e-4aa7-bdd5-9d29753680ff` | `gpt-6-astra` / `high` | Direction decision over five contributions and executor approach | 40 cents |
| 9 | Software Executor | `9acab613-9c24-45df-8f26-e600fc61d615` | `gpt-6-sol` / `high` | Implement the accepted direction and return candidate evidence | 60 cents |
| 10 | Council Reviewer | `e39b0edd-435e-4aa7-bdd5-9d29753680ff` | `gpt-6-astra` / `high` | Result decision over the exact candidate | 50 cents |

Nominal campaign: exactly ten native runs/sends with a 700-cent admission allocation. This is not a hard bound of ten provider model requests: the inspected `codex_local` contract exposes the configured wall-clock timeout but no max-turn or provider-request limit, and one run may contain multiple provider turns or requests. Actual native billing is authoritative and may exceed an admission threshold after a run begins; stop and report any overrun rather than describing the allocation as an enforceable spend ceiling. Runs 3–7 may execute in any order after reservation, but all five must be terminal and attributable before run 8. Runs 1, 2, 8, 9, and 10 are ordering barriers. Council uses its configured three-run allowance; the executor uses two; every specialist uses one.

There is no automatic retry. A timeout, disconnected response, uncertain persisted effect, model/auth failure, missing skill mount, stale mandate/candidate, or failed safety readback stops the initial campaign. Reconcile native state before proposing another action.

The configured fourteen-run guard remains a future correction envelope. Correction behavior is tested synthetically in this initial campaign and is not permission to spend another specialist/executor call. A real correction campaign requires a new concrete proposal and authorization after the ten-run evidence is reviewed.

The mission schema requires a positive `correctionLimit`, so the prepared request stores `1`. The mission task policy and operator boundary still forbid a live correction in this initial campaign; that stored capacity is not authorization to use it.

## Prepared issue, rosters, and requests

Root issue `EXEA-1` exists, is assigned to the Software Executor, and remains in `backlog`. The exact activation, mission, and governance request JSON is retained in `l03-mandate.json`. The mission request pins the project, root issue, both roster revisions, objective, nine acceptance criteria, exclusions, one-day elapsed policy, ten-send/no-retry policy, and admission semantics. The governance request pins the executor/reviewer identities, issue context hash, mission/mandate revisions, expiry, and envelope/category limits.

Both rosters deliberately remain `draft`. Native validation returns `agent_ineligible` for every paused member, so activation was not attempted. After campaign approval, the remaining local sequence is concrete:

1. Re-read the same host, company, agent safety state, issue, project, roster versions, plugin config secret reference, and zero-run state.
2. Resume the seven agents without waking them, then submit the prepared `activate-pair` request with both expected head versions.
3. Submit the prepared mission request and read back version `1` with the exact pinned revisions.
4. Submit the prepared governance request and read back its context hash, limits, authority, and `awaiting_approach` phase.
5. Keep `EXEA-1` in `backlog` until all three readbacks match; only then release the first approved native send.

Preparation keeps `wakeOnDemand:false`. The inspected native `sessions.sendMessage` and plugin `ctx.issues.requestWakeup` paths skip non-timer wakes while that flag is false. For each approved send, patch the sending role to `wakeOnDemand:true` while keeping `heartbeat.enabled:false`, read back both values and an empty queued-wake state, and send once. Before reviewer reservation, pre-arm and read back the five selected specialists because Executive dispatches their granted slots automatically. For a decision that creates a downstream executor wake, pre-arm and read back that executor immediately before the reviewer applies the decision. Keep it armed only through the native handoff and its authorized execution; restore each actor to `wakeOnDemand:false` and `paused` immediately after its terminal outcome or any stop condition. A failed preflight must reject dispatch before a send rather than creating an uncertain dead wake.

The runtime requests bind:

- project ID, workspace ID, baseline fixture commit, and allowed write path;
- objective and the nine exact prepared criterion texts;
- exclusions: no L02 resource, deploy, publication, external system, credentials, customer data, recursive delegation, schedule, or background wake;
- mandate ID/revision and exact direction/result decision authority;
- exact profile IDs, versions, instruction hashes, company skill keys/version IDs, models, efforts, and ten-run sequence;
- exactly ten initial native agent runs/sends, counting any unexpected native run, no retry or hidden replacement, 700-cent admission allocation, native billed-cost reconciliation, and configured per-agent/company admission guards; provider request count is not hard bounded by this runtime;
- stop destination for unknown outcomes and the operator who may authorize a later correction campaign.

## Run protocol

1. Re-read host/company/plugin/project/workspace identities, fixture commit, seven paused configurations, budgets, zero active L03 runs, and unchanged L02 IDs. A mismatch stops before a model call.
2. Resume without waking, activate the exact prepared roster pair, submit the exact mission/governance requests, and read back their revisions, context hash, ten-send policy, and no-retry policy. Keep `EXEA-1` in backlog until this passes; do not attach an automatic trigger.
3. For the next authorized send only, confirm no queued/running wake, resume that role, patch and read back `wakeOnDemand:true` with `heartbeat.enabled:false`, send once, and capture the run ID immediately. Wait for terminal state, read its native work product/effect, then restore `wakeOnDemand:false` and pause the role. The only overlaps are the reviewer with the five pre-armed specialists during slot admission, and the reviewer with its explicitly authorized downstream executor during direction handoff. Outside that handoff, restore each role before proceeding. Any unexpected native run consumes one of the ten slots and stops the campaign; do not add a replacement send.
4. Run 1 creates and submits the authenticated active executor approach without changing the fixture. Before run 2, resume and pre-arm all five specialists; read back their timeout, daily limits, concurrency one, wakeOnDemand enabled, heartbeat disabled and empty queues. Run 2 reserves exactly five profile-bound contribution IDs against that approach. Executive then automatically sends the five granted consultations: these are runs 3–7, with no additional manual specialist sends. Capture every native run ID and restore each specialist after its terminal outcome. A failed control, admission or event path stops this campaign without replacement sends or hidden event re-emission. Runs 3–7 fill those exact IDs with attributable opinions containing profile/version, subject/mandate revision, evidence, unknowns, assumptions, limitations, dissent, and classified findings.
5. Run 8 occurs only when the approach and five contributions are exact. Immediately before starting the reviewer, resume and pre-arm the downstream executor with `wakeOnDemand:true`, heartbeat disabled, positive timeout and daily bounds, concurrency one, and no queued/running work; read back these controls and the pinned issue assignee. Then start the reviewer once to record the direction. The native proceed path persists the decision before checking the downstream controls: a failed downstream preflight can leave `awaiting_direction_effect`, which must stop this campaign without replay or replacement. Favorable direction is not result acceptance.
6. The native direction wake creates run 9; capture its observed run ID and do not manually send another executor message. Run 9 implements only the accepted approach. Require exact candidate commit, bounded diff, test output, clean handoff status, and work-product evidence. The executor cannot record acceptance.
7. Restore the executor after run 9. Start result reviewer run 10 with native `POST /api/agents/:id/wakeup` and `payload: { issueId: "a378ad22-d01b-43f7-99d8-785076310607" }`; read back that exact `contextSnapshot.issueId` before its verdict. A manual run without source issue context is insufficient even when its actor and run ID are valid: the native issue API refuses its mutation. Bind the verdict header to that observed run. Run 10 reviews the exact candidate and prior evidence. Read back the authenticated Council result decision and native issue effect. This initial campaign permits acceptance, refusal or escalation, but no revise operation that could wake a correction. Any later authorized correction campaign must pre-arm and read back the executor before its reviewer applies a revise decision and count that automatic wake in its own finite run allowance.
8. Pause every agent; verify zero queued/running work; reconcile run IDs, costs, issue revision/status, reservations, contributions, decisions, fixture commit/diff, test evidence, and L02 preservation. Report declared, installed, desired, loaded, activated, executed, and observed result separately.

## Remaining preconditions for operator approval

- The operator must approve exactly the ten native runs/sends above, with any unexpected native run counted inside that ten, no retry or hidden replacement, the 700-cent admission allocation, native billed-cost reconciliation, the absence of a hard provider-request count, and existing runtime guards.
- Draft roster revisions and exact activation/mission/governance payloads are prepared and read back. Activation, mission creation, and governance admission remain intentionally unsubmitted because native roster eligibility requires operational agents; after approval they are the only local configuration steps before release from backlog.
- Company skill content and desired assignments are verified. Effective `CODEX_HOME/skills` mounts remain unverified until each exact authorized run. A missing required mount stops that role.
- Model inventory advertises all requested models. Provider authentication and effective model execution remain unverified. A failed first call consumes that sequence slot and stops the campaign.
- ACP network denial is stored as a redacted native plain binding. Immediately before run 1, read back binding presence and the false bypass flag; actual environment behavior can only be confirmed from the authorized runtime profile/log without exposing secrets.

## Plugins/skills to use

Use `paperclip-lifecycle` first for identity, configuration, dormant-state checks, and installed/desired/loaded/activated/executed separation. Use the installed Executive L03 contract for reservation, attributable contributions, authenticated executor approach, and direction/result separation. Use the installed Council contract for authenticated decisions and native effects. `frontendBrowserQa` is not required because this fixture has no browser surface.

## Model and effort recommendation

Use the catalogue models and efforts in the ten-run table without substitution. The preparation worker recommendation remains `gpt-5.6-sol` at `medium`, from `/home/davy-lp/.codex/shared/model-selection/model-effort-mapping.md` dated 2026-09-05. Re-evaluate only after the initial campaign stops and evidence shows a model is unavailable or incompatible; propose an alternative for a new authorization instead of changing the active campaign silently. Effective provider settings remain unverified until their authorized run records them.
