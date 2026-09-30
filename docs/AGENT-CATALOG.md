# Canonical prepared agent catalogue

Catalogue: `executive-agent-catalog.v1`; skills/new profiles: `1.0.0`; existing `executive` profile: `1.1.0`.
Status: prepared source assets, inactive by default. No runtime provisioning,
activation, agent run, L03 implementation or V1 qualification is claimed.
This is the canonical catalogue for Executive contributions to development Council;
Council consumers should reference this version rather than copy it.

## Sources and interpretation

| Source inspected | Revision | Meaning |
| --- | --- | --- |
| Executive origin/main | `ccd02e1f594b5fe6083d4c2f1c1ad7533bc7f54e` | L01/L02 package, contracts, profile and reports; starting baseline. |
| Council origin/main | `bc6d71fa6ede8f239c7990af1885dc07cccc7c18` | Catalogue proposal plus roster/mission and decision source, not deployed-state evidence. |
| Paperclip host local source | `61b3fd57a695614dc4a37e2303f426a34a9795cf` | Agent, adapter, bundle, skills and managed-resource contracts. Existing dirty checkout was read only; this revision does not identify a deployed instance. |
| OpenExecutive local source | `13da433bc6f3ae97e78bb8c90f06bb5e49953447` | Candidate personas/methods, Apache-2.0 with NOTICE; no provider defaults imported. |

Executive PRD/TAD 0.3 supply product/architecture authority. L02's plan/report remain
historical evidence for its single-contributor contract. The owner now prefers
broader distinct opinions over a systematically minimal reviewer configuration.
Council's inspected `docs/AGENT-CATALOG.md` describes proposed roles. Its newer
`src/rosters.ts` supports revisioned team/council members, final reviewer, integration
lead and required perspectives; this is not a multi-opinion engine or installed team.

## Prepared profiles and responsibility matrix

All rows below are distinct prepared agent profiles. Paths are relative to
`packages/executive/profiles/`, each ending in `/AGENTS.md`. Their operational
settings and source skill assignments live in the [configuration assets](../packages/executive/config/).
A stable profile identifier is never a native runtime agent ID.

| ID / profile path | Mission and distinctive question | Participation / overlap boundary |
| --- | --- | --- |
| `software-executor` | Implement the prepared ticket and supply exact candidate/evidence. What is the smallest sufficient implementation? | Execution, not a review seat; cannot accept its own result. Also carries Integration Lead when assigned. |
| `council-reviewer` | Synthesize attributed opinions and decide under the authenticated mandate. Which demonstrated gaps actually prevent acceptance? | Accountable reviewer, distinct from executor; sole proposed decision owner, never a second implementer of its reviewed result. |
| `executive` | Advise the owner and synthesize trade-offs. What recommendation best fits the supplied objective? | Existing stable managed identity remains paused; optional advisory synthesis, no verdict or recursive consultation. |
| `product` | Check user need, criteria and scope. Does this solve the stated problem without adding a different one? | Default; unlike sales, owns product-fit analysis rather than commitments. |
| `architecture` | Examine contracts, coupling and technical sufficiency. Is a simpler design sufficient for the actual change? | Default; separate from threat analysis and test-quality judgment. |
| `quality` | Assess acceptance evidence and regressions. What remains unproved on this exact candidate? | Default; software QA, not upstream response-quality judging. |
| `ux-accessibility` | Check task completion, states, comprehension and accessibility. Can affected users complete the journey? | Conditional on user-facing changes, interaction or accessibility criteria. |
| `security-privacy` | Review trust boundaries, abuse and data handling. What concrete threat or privacy obligation is exposed? | Conditional on auth, secrets, sensitive data, external inputs or new trust boundaries. |
| `operations` | Assess reliability, deployment prerequisites, recovery and operability. Can the changed service be operated and recovered? | Conditional runtime/SRE angle; does not own delivery scheduling. |
| `delivery` | Assess dependencies, capacity, coordination and time. Can the next bounded increment finish within the mandate? | Default; COO delivery angle distinct from SRE operations. |
| `economics` | Assess usage, resources and marginal value. Is another correction worth its known cost, and what is unknown? | Default; CFO angle, no spending authority, no invented monetary estimates. |
| `strategy` | Check priority and strategic fit. Does the work support the chosen objective and explicit non-goals? | Conditional priority conflict; cannot reprioritize an authorized ticket. |
| `data-experimentation` | Check instrumentation, measurement and inference. What observation would distinguish success from noise? | Conditional metrics/experiments/data changes; outcome unknown stays unknown. |
| `marketing` | Assess positioning, launch and market claims. Is the proposed claim supported and understandable to its audience? | Conditional go-to-market; no publishing or campaigns. |
| `sales-customer` | Assess customer evidence, commitments and adoption. Does the change meet a documented customer constraint? | Conditional customer-facing commitment; cannot promise features or dates. |
| `organization-talent` | Assess ownership, skills, workload and organizational change. Who can sustainably own the result? | Conditional human/organizational impact; no hiring or personnel decisions. |
| `legal-compliance` | Identify applicable supplied obligations and unresolved legal questions. What needs qualified human review? | Conditional contracts, licenses, regulated claims or compliance; no legal sign-off. |
| `board-communications` | Prepare attributable governance communication. What must the board know about evidence, dissent and uncertainty? | Conditional governance reporting; no board authority or sending messages. |

Executive and Council synthesis overlap in format, not authority. Product, customer
and data opinions concern different evidence. Architecture, QA and security may cite
the same defect but Council consolidates it into one finding with multiple sources;
three opinions do not mean three mandatory corrections. No executive title grants
acceptance, deployment, expenditure, access or agent-creation rights.

## Upstream and Council auxiliary dispositions

OpenExecutive's `orchestrator/router.py` exposes `cso`, `cfo`, `chro`, `gc`, `coo`,
`cmo`, `cpo`, `sales`, `board_comms`, `triage`. The first nine map respectively to
strategy, economics, organization-talent, legal-compliance, operations/delivery,
marketing, product, sales-customer and board-communications above. There is no
upstream dedicated CTO, software QA, security, UX or data agent to claim as a port.

| Source role or utility | Disposition | Owner / rationale |
| --- | --- | --- |
| Council Integration Lead | Responsibility on `software-executor` | Integrates contributor evidence/candidate when assigned; no separate duplicate execution mandate. |
| Council Knowledge Steward | Responsibility on `executive` for advisory sources, `council-reviewer` for decision references | Record provenance in the authorized handoff; no hidden memory or separate storage agent. Separate staffing deferred until demonstrated workload. |
| Council Appeal Council / appeal mechanism | Deferred bounded procedure using existing profiles | Owner receives a specific contested criterion/new evidence; preserves original decision and limits. No automatic retrial, vote or appeal engine. |
| `consult_specialist` | Upstream tool mechanism, not an agent | L03 must select one qualified dispatch owner; not implemented by these assets. |
| `agents/base.py`, `agents/overrides.py` | Shared runtime/configuration helpers, not ported | Native Paperclip adapter, profiles and reviewed configuration replace upstream execution and prompt/model overrides; no upstream provider defaults. |
| `ExecutiveProxy` / `executive_proxy.py` | Upstream implementation detail / alternate configuration surface | Existing `executive` is canonical; no second executive identity. |
| `quality_judge` | Method responsibility: evidence/response review | Upstream critiques executive answer quality; does not replace software `quality` or confer Council authority. |
| `utility_fast` | Upstream model-control utility, deferred | Parsing/routing/title helper; no Paperclip agent or imported model default. |
| `research` / `research_council.py` | Bounded evidence-review method; research fan-out deferred | Selected specialist may request/review authorized sources; no recursive research council. |
| `triage` | Intake/priority assessment responsibility on Council reviewer | Route the stated question and relevance; do not invent incidents, work or priority changes. |
| `alert_review` | Conditional operations/evidence-review responsibility | Judge a supplied alert; scheduler and continuous monitoring deferred. |
| `engagement_intake` | Intake responsibility on software executor, product consulted | Check supplied ticket identity, objective and missing inputs; no CRM ingestion. |
| `onboarding_interviewer` | Operator provisioning checklist, not an autonomous agent | Resolve missing instance/configuration inputs before activation; no model interview runtime supplied. |
| `workflow_designer` | Deferred configuration/design method | General workflow authoring is outside prepared-ticket supervision; L03 owns its bounded design. |
| `workflow_actor` | Alternative executor concept, not another prepared agent | Authorized software action belongs to `software-executor`; upstream generic workflow engine is not ported. |
| `delegation/ghostwriter.py` | Deferred drafting utility/method, not an agent | Upstream explicitly separates it from Council; future draft reuse cannot send messages or duplicate board authority. |
| `fixture_generator` | Deferred test-data utility | Fictitious company generation does not satisfy native runtime qualification. |
| Department head persona / committee | Alternative organizational context, deferred | `departments/head_persona.py` and `orchestrator/committee.py` do not justify extra permanent roles or a panel engine. |

The workflow inventory comprises **25** source methods, not agent identities:
`annual_plan`, `board_prep`, `churn_deep_dive`, `comp_refresh`,
`competitive_teardown`, `crisis_comms`, `department_check_in`, `end_of_day_digest`,
`engagement_value_report`, `exec_search_brief`, `executive_reflection`,
`executive_research`, `fundraising_prep`, `gtm_launch`, `investor_update`,
`ma_evaluation`, `mbr`, `morning_brief`, `org_design`, `performance_review`,
`pricing_review`, `product_strategy`, `quarterly_plan`, `risk_register`, `weekly_review`.
All full upstream workflows are deferred: business planning, scheduling, external
actions and broad initiatives are outside this lot. Selected concepts may inform
the explicitly attributed skills; none of these workflow names claims an installed
or usable skill. The [skill registry](AGENT-SKILLS.md) is the availability authority.

## Proposed Council composition and consultation limits

For an initial development-ticket review, select product, architecture, quality,
delivery and economics as five separate opinion slots, with one distinct Council
reviewer responsible for synthesis/decision. This supplies user-value, technical,
proof, schedule and cost angles without conflating them. The executor supplies the
candidate and answers factual questions but has no acceptance vote. Executive may
synthesize supplied opinions on request; omit that extra call when Council can do it.

Add UX/accessibility for changed user journeys, security/privacy for trust/data
changes, operations for service/recovery changes, data for measurement, and any other
profile only for an explicit question that could change the decision. Each slot
can respond not relevant with a reason and zero findings. Missing expertise or
failed consultation is visible; a required missing review causes escalation, not
invented agreement. Selection is not automatic dispatch in this lot.

Proposed default envelope for operator adoption: at most one initial opinion per
selected slot; at most two additional specialist slots without an explicit mandate
extension; at most two correction cycles; at most one targeted re-review per affected
slot per corrected candidate, within those two cycles. An optional Executive
synthesis consumes one of the two additional slots. No recursive consultations,
voting or automatic retries. A malformed-output repair consumes a slot attempt;
an uncertain dispatch must be reconciled before any retry. Count every model call,
including failed/repair/synthesis calls, against the mandate's aggregate allowance.
Elapsed-time and resource ceilings must be filled and enforced on the chosen target
before activation; these defaults are proposals, never an installed budget control.
Stricter Council mandates prevail. Exhaustion stops new affected work and escalates.

Every disagreement retains author, subject/version, evidence and consequence.
Council records whether each material objection was retained, resolved, rejected
with evidence, or escalated. It does not average opinions or hide minority concerns.
`must_fix` requires an acceptance gap, material demonstrated risk or applicable
obligation; `useful_now` is optional within existing limits; `defer` records a
lower-value improvement without automatic ticket creation. Each finding carries
criterion/risk, evidence, consequence and smallest sufficient correction.

After correction review only changed behavior, affected evidence and prior blockers.
Unchanged accepted observations are reused with their original version references;
a new candidate never inherits the prior verdict. Fresh blockers require new evidence
or a newly demonstrated gap. Council's native contract, not a skill, enforces the
mandate and records the decision/effect. See the [L03 handoff](AGENT-HANDOFF-L03.md).

## Assets and qualification boundary

Use [skills](AGENT-SKILLS.md), [provisioning](AGENT-PROVISIONING.md),
[synthetic scenarios](AGENT-SCENARIOS.md) and [validation report](AGENT-VALIDATION.md).
Only versioned source preparation and package compatibility are checked here.
Installation, desired assignment, actual loading, activation and execution each
need their own future readback/evidence. A configuration file proves none of them.
