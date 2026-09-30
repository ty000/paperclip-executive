# Paperclip Executive — Compact Product Backlog

Version: 0.2 — September 30, 2026.

Status: proposed delivery sequence derived from [PRD 0.3](PRD.md) and
[TAD 0.3](TAD.md); their prior 0.2 baseline was merged in `c0839fe18a8673893cc6f87cafb5d765c556d638`.
This is planning, not implementation, activation, or a commitment to delivery dates.

## 1. Delivery target and current starting point

Deliver sufficient software from prepared Linear tickets through native Paperclip
execution and proportionate Council supervision. Preserve a single Council authority
for mandates, verdicts and their effects; Executive supplies methods and contributions.

[L01](IMPLEMENTATION-L01.md) provides direct advice, native agent sessions and
persisted results. It does not implement B03–B05. The locally inspected Council
prototype exposes an agent-authenticated result decision (`changes_requested` or
`approved`); it does not establish a plan-release contract, shared operating limits,
or in-flight drift supervision. Its existence is not proof of integration.

The first step therefore produces a useful, identified approach contribution that
Council can later consume. It does not pretend a favorable recommendation releases
execution. The PRD's first usable supervised release still requires B03–B05 and the
applicable runtime qualification; L02 alone cannot satisfy that release.

## 2. Prioritized product items

The acceptance IDs below remain stable when implementation tasks are refined.
Items are ordered by dependency, not by speculative estimates.

| Item | Product outcome | Acceptance criterion | PRD trace | Dependency |
| --- | --- | --- | --- | --- |
| BK-01 — Understand and challenge an approach | The owner/reviewer can assess a prepared ticket's proposed approach against product value, technical sufficiency and delivery cost. | BK-01-A: one existing Paperclip issue and supplied Linear context produce one versioned, attributable contribution with a recommendation, evidence/limitations and classified findings; optional polish is distinguishable from must-fix work. No decision effect is implied. | B03 preparation; EXE-01, EXE-02, EXE-03, EXE-10, EXE-11, EXE-12, EXE-14 | Existing L01 foundation and an eligible executor/advisor on the selected host. |
| BK-02 — Govern continuation and result acceptance | The executor receives an authorized next action, and a result can undergo a bounded correction and re-review. | BK-02-A: Council records and applies a direction under an identified mandate; V1 → correction → V2 produces a decision on the exact subject with a persistent one-attempt receipt and actual native observation. Missing, stale, denied or indeterminate decisions do not release covered work. | B03 completion, B05; EXE-04, EXE-05, EXE-06, EXE-07, EXE-15 | BK-01; merged prepared-agent assets and qualified Council contracts for plan direction, result identity, decision application, receipts and uncertainty holds, using existing public host APIs. |
| BK-03 — Catch drift before more effort is spent | Scope expansion, stalled progress and approaching limits influence the next execution segment. | BK-03-A: a material checkpoint or independently enforced timeout triggers a proportionate review before another affected segment; unchanged minor findings do not trigger repeated reviews. | B04; EXE-03, EXE-13, EXE-14 | BK-02; concrete host/orchestrator checkpoint and timeout mechanisms. |
| BK-04 — Stop and resume without losing control | Owner and agents can understand limits, interruptions, escalation and the cost of supervision. | BK-04-A: correction/consultation limits survive restart; exhausted limits block new affected work, expose in-flight effects and reach the owner; resumption reconciles rather than blindly retries. Execution/review effort and unknown costs remain visible. | Cross-cutting; EXE-08, EXE-09, EXE-12, EXE-16 | A minimal form is required in every lot; complete enforcement depends on BK-02/BK-03. |

BK-04 is not a postponed generic hardening project. L02 must preserve contribution
identity, bounded dispatch and uncertain outcomes. L03 needs correction/decision
continuity. L04 completes progress and stopping controls for the supervised journey.

## 3. Small delivery lots

| Lot | Observable increment | Backlog coverage | Explicit limit |
| --- | --- | --- | --- |
| L02 — Prepared-ticket approach contribution | An owner requests and inspects one structured contribution on an existing issue's proposed approach, with source snapshot, run attribution and finding classes. | BK-01; contribution-level portion of BK-04. Detailed in [L02 plan](SPRINT-PLAN-L02.md). | Advisory output; no Council decision, work release, issue mutation, autonomous loop or complete B03 claim. |
| Agents — Prepared broad catalogue | Versioned concrete profiles, methods, inactive templates and provisioning/qualification procedure. | EXE-02/11/12; enables BK-02. | No installation, runtime qualification, L03 implementation or V1 completion. |
| L03 — Council decision and correction path | On the same bounded case, a contribution feeds Council; continuation and exact-result correction/re-review have persistent one-attempt receipts, actual native observations and uncertainty holds under the mandate. | BK-02; decision/correction portion of BK-04. | Council receipt, limit and workflow dependencies must be resolved in their owning component using existing public host APIs. No imitation acceptance engine in Executive. |
| L04 — In-flight supervision and first-release qualification | One complete B03–B05 journey detects drift or a limit before final submission, stops/escalates when required, and resumes from actual state. | BK-03 and remaining BK-04; integrated BK-01/BK-02. | Serial reference workflow; no generic scheduler, portfolio optimizer or mandatory panel. |

L03/L04 are coarse slices, not implementation-ready sprint plans. Before starting
L03, select the actual Council distribution/revision and qualify its contracts. If
Council work is needed, identify its repository and exact change as a dependency;
a plan here does not authorize edits in another project. Split a lot only for a
concrete dependency or an independently useful outcome, not to produce many tiny PRs.

A locally validated package and a qualified real-agent journey are different
milestones. Each lot reports which was reached; integration and release claims
require the evidence specified in the PRD/TAD, not merely green unit tests.

## 4. Deferred scenarios

Keep these outside the initial sequence unless the reference journey demonstrates
an immediate need:

- Automated Linear intake, bidirectional synchronization and upstream decomposition.
- Parallel consultation engines, voting and automated appeals. Specialist profile preparation is now in scope in the agents lot; runtime hiring and activation remain separate.
- Portfolio priorities, broad business initiatives, finance/HR/launch workflows.
- General monitoring, organizational learning, vector memory and automatic hiring.
- Merge/deployment automation, external delivery control, OpenExecutive backend reuse,
  and a custom Codex CLI adapter.

[Roadmap 0.1](ROADMAP.md) remains a catalogue of earlier ideas. This backlog follows
PRD 0.3 for the current sequence; the old placement of Council in H3 does not apply.

## 5. Scope and evidence for this planning revision

Historical planning sources: PRD/TAD 0.2, L01 report and current Executive package; read-only inspection
of the local `paperclip/packages/plugins/paperclip-council/src/{contracts,worker,decision-adapter}.ts`
prototype and its README. That prototype is not a pinned standalone dependency or
a deployed-host audit. Other Council branches/distributions may differ and must be
selected explicitly before integration.

No source implementation, runtime configuration, Linear issue creation or model
execution is part of this planning revision. L02 is now merged (PR #4, `ccd02e1`) with its bounded evidence in
[IMPLEMENTATION-L02.md](IMPLEMENTATION-L02.md). L03/L04 retain their real
dependencies rather than invented APIs or dates. This 0.2 backlog revision adds
prepared agents from the owner request and canonical catalogue; it does not repeat
L02 runtime qualification or implement L03.

## 6. Agents prerequisite and parallel L03 preparation

The owner prefers multiple distinct opinions to a systematically minimal team.
The [catalogue](AGENT-CATALOG.md) is canonical for all prepared roles; Council
should link it rather than maintain a copied second catalogue. The proposed default
is product, architecture, quality, delivery and economics, synthesized by the
Council reviewer. Other expertise is conditional, with explicit non-relevance and
no artificial findings.

Merge the agents lot before L03. L03 can inspect host/Council contracts, separate
plan-direction from result decisions, and design independent correction/receipt
tests concurrently. Before L03 merge, integrate current origin/main, pin the merged
asset versions and qualify the integrated path against them. The agents merge
does not prove that any profile is installed, loaded, active or executed.
