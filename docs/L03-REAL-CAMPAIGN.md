# L03 real campaign proposal

Status: prepared for operator review; no model or provider call is authorized by this document.

## Prepared target

- Instance: `executive-dev` at `http://127.0.0.1:3220`, authenticated/private, Paperclip `61b3fd57a695614dc4a37e2303f426a34a9795cf`.
- Company: `ba82ae5f-292f-4c13-a02a-70ddef6cb22b` (`Executive L03 Qualification 2026-09-30`).
- Catalogue: `packages/executive/config/agent-catalog.json`, version `1.0.0`, with the original profile instruction files and skill sources read byte-for-byte.
- Existing Executive plugin: `2f5ead19-69e1-4065-9fe4-93bd7699e510`, version `0.2.0`, ready. No candidate installation or upgrade was attempted during preparation.
- All seven agents are paused. Timer heartbeat and on-demand wake are disabled. Each agent has `maxConcurrentRuns: 1`, `maxDailyRuns: 2`, `maxDailyCostCents: 100`, `budgetMonthlyCents: 100`, and `timeoutSec: 300`. The company monthly budget is 700 cents.
- L03 run count at preparation readback: zero. The preserved L02 company and its completed run `2285549d-f090-4f92-ad46-64c2bce1d3cd` were unchanged.

The replayable preparation ledger is [l03-preparation.json](evidence/l03-preparation.json). It records IDs, source hashes, model inventory, exact instruction readback, library skill versions, desired skill snapshots, dormant state, and the L02 preservation comparison.

## Bounded scenario

Create a new local toy repository and Paperclip project owned only by the L03 company. The fixture contains a small TypeScript function `allocateCampaignBudget(input)` plus tests. It must produce a deterministic execution plan or a typed refusal while enforcing these rules:

1. seven known roles only;
2. no role receives more than two calls;
3. the total plan never exceeds fourteen calls or 700 cents;
4. specialist evidence precedes implementation and Council decision;
5. the executor cannot accept its own result;
6. invalid, duplicate, stale, or over-budget input fails closed without partial output.

The campaign gives every role the same pinned issue, acceptance criteria, exclusions, fixture commit, mandate revision, and evidence set. Product reviews contract meaning; Architecture reviews interfaces and failure modes; Quality defines and checks acceptance evidence; Delivery reviews sequencing; Economics checks cost proportionality; Software Executor implements the bounded candidate; Council Reviewer alone returns the final accept, changes-requested, or reject decision under the supplied mandate. The result is useful only if the native issue, candidate commit, attributable opinions, Council decision, and final repository state all read back consistently.

## Agents, models, and call ceilings

| Profile | Agent ID | Catalogue model / effort | Required company skill | Campaign calls |
| --- | --- | --- | --- | ---: |
| Product | `481caab0-d0b3-442b-a5f4-5fe1d6563edb` | `gpt-5.6-sol` / `medium` | `specialist-advisory` | max 2 |
| Architecture | `63e53a4a-1c89-4490-9739-05699be031fa` | `gpt-6-sol` / `high` | `specialist-advisory` | max 2 |
| Quality | `cc0fe155-dfeb-4157-9827-4abe01c98daf` | `gpt-5.6-sol` / `medium` | `specialist-advisory`, `evidence-review` | max 2 |
| Delivery | `ff2d8928-78f9-4f7f-9c81-af6bded5bd1e` | `gpt-5.6-sol` / `medium` | `specialist-advisory` | max 2 |
| Economics | `80d1e926-718d-4e7a-8311-c31e09e410fd` | `gpt-5.6-sol` / `medium` | `specialist-advisory` | max 2 |
| Software Executor | `9acab613-9c24-45df-8f26-e600fc61d615` | `gpt-6-sol` / `high` | `implementation-execution` | max 2 |
| Council Reviewer | `e39b0edd-435e-4aa7-bdd5-9d29753680ff` | `gpt-6-astra` / `high` | `council-decision-review` | max 2 |

The advertised model inventory contains all three requested models. Inventory is configuration evidence only; authentication and successful provider execution remain unknown. The campaign ceiling is fourteen provider calls total and two per agent. A normal first pass uses seven calls. A second call for a role is allowed only for one bounded correction or decision reread with new evidence. No third call, blind retry, recursive delegation, schedule, or background wake is permitted.

## Required run sequence

1. Pin the candidate plugin/package build and install it into this L03 company through the supported plugin lifecycle. Read back package version, registry state, worker health, company config, and any L03 resource bindings. Do not reset existing managed resources.
2. Create the isolated toy repository, a company-scoped Paperclip project/workspace, and one native issue with exact objective, criteria, exclusions, mandate ID/revision, candidate base commit, and allowed write path. It must not share the L02 project or data.
3. Resolve the execution-safety and authentication preconditions below. Capture the exact seven configurations again. Keep every agent paused until its explicit call.
4. Explicitly authorize and invoke the five specialist calls. Capture each run ID, terminal state, logs, attributable opinion, source version, and native issue effect. A timeout or lost response has unknown outcome; reconcile the actual run before any further action.
5. If the prepared direction remains viable, explicitly authorize one executor call. Capture its run ID, candidate commit, diff, tests, work product, and finalization readback.
6. Explicitly authorize one Council Reviewer call against that exact candidate and the five attributable opinions. Read back the authenticated decision and its native issue effect.
7. If and only if Council requests one bounded correction, authorize at most one second executor call and one second Council call. A specialist may use its second call only when Council identifies a decisive missing opinion. Stop when any role reaches two calls, the company reaches fourteen calls, a daily/monthly cost cap blocks, the mandate/candidate becomes stale, or an outcome stays uncertain.
8. Pause all agents again, verify zero queued/running work, and reconcile the issue, decision, candidate commit, costs, and run set. Report source/build, installed, desired, loaded, activated, executed, and business-result evidence separately.

## Blocking preconditions before the first model call

- The parent must install the exact compatible candidate and prove its health and L03 company configuration. This preparation intentionally left plugin `0.2.0` unchanged.
- The parent must create and bind the isolated toy repository/project/workspace, native issue, mandate ID/revision, and exact candidate base commit.
- The operator must give one concrete authorization covering the proposed models, at most fourteen provider calls, 700-cent company monthly ceiling, and the stated correction policy. Current authorization covers local preparation only.
- Codex provider authentication must be verified for the isolated agent profiles without using a speculative test call. If it cannot be verified without execution, the first separately authorized call is the bounded probe and counts against that role's two-call ceiling.
- Skill library content and desired assignment are verified. Actual linking into each effective `CODEX_HOME/skills` is unverified until the exact run profile is observed. The first run must capture its mount evidence; a missing mount stops that role.
- The host added `dangerouslyBypassApprovalsAndSandbox: true` to every `codex_local` configuration even though the catalogue preserves `nonInteractivePermissions: deny`. Before any execution, the parent must either set/read back a reviewed safe value or provide owning-host evidence that ACP ignores this CLI-only flag for the exact engine. There is no silent acceptance of this mismatch.
- ACP enables workspace network access by default. The toy campaign needs no non-provider network access. The parent must apply and read back a supported denial such as `PAPERCLIP_CODEX_ACP_NETWORK_ACCESS=false`, while preserving required provider transport, or document an equivalent execution-target restriction.
- Node/ACP prerequisites, model/effort support, effective timeout, isolated workspace selection, and absence of queued/running L03 work must pass immediately before the first call. No engine or model substitution is allowed.

## Plugins/skills to use

Use `paperclip-lifecycle` first for exact instance/company identity, candidate installation, agent configuration readback, and installed/desired/loaded/activated/executed separation. Use the owning Executive and Council runtime contracts next for L03 action and decision semantics. Use `frontendBrowserQa` only if the accepted campaign includes a browser-visible surface; this toy function does not require it.

## Model and effort recommendation

Target runtime roles use the catalogue selections in the table above. The preparation worker recommendation was `gpt-5.6-sol` at `medium`, from `/home/davy-lp/.codex/shared/model-selection/model-effort-mapping.md` dated 2026-09-05. The runtime role models are separately declared by the Executive catalogue and were advertised by this instance on 2026-09-30. Re-evaluate after two failures with no new evidence, or when the target no longer advertises a model, but stop and propose the alternative rather than substituting silently. Effective provider settings remain unverified until an authorized run records them.
