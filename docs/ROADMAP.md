# Paperclip Executive — Roadmap

Version: 0.1 — September 30, 2026.

Status: proposed prioritization, with no dates or delivery commitments.

The [PRD](PRD.md) defines the two core use cases, B01 and B02. This roadmap preserves
all scenarios from the initial brief and the extensions identified during
familiarization with OpenExecutive. It is neither a technical backlog nor
authorization to implement, install, or activate anything.

Horizons express an order of exploration. They are not indivisible work packages:
a verified user need can raise a scenario's priority without committing the entire
horizon. The PRD's authority boundaries and cross-cutting requirements still apply.

## 1. Coverage of the eleven initial scenarios

| Original scenario | Proposed priority | Destination and boundary |
| --- | --- | --- |
| S01 — Executive advice on demand | H1 | B01: options, facts, uncertainties, and a recommendation. |
| S02 — Goal to initiative | H1 | B02: scoping and delegation decision. |
| S03 — Prioritizing multiple projects | H2 | R01: cross-project trade-offs; B01 can compare options without managing a portfolio. |
| S04 — Delivery coordination | Bounded H1, H2 extension | B02: one authorized initiative; R02 extends coordination to more functions and dependencies. |
| S05 — Launch preparation | H2 | R03: a coordinated proposal across product, marketing, sales, and operations. |
| S06 — Economic analysis | H2 | R04: a structured financial journey using identified data. |
| S07 — Organization and capacity | H2 | R05: responsibilities, work allocation, and proposed profiles. |
| S08 — Risk review | H2 | R06: a structured domain review; ordinary risks still need consideration in B02. |
| S09 — Periodic portfolio review | H3 | R07: explicitly configured recurrence; manual review of one initiative is available from H1. |
| S10 — Continuity and decision tracking | Minimum in H1, H3 extension | B02 retains its decisions; R08 expands retrieval and cross-initiative tracking over time. |
| S11 — Optional Council supervision | H3 | R09: candidate contract, integration, and decision effects to qualify. |

## 2. H1 — Advice and a tracked initiative

**Intended value:** the owner can move from a question or incomplete objective
to an actionable decision, then track a bounded initiative in Paperclip.

The proposal follows B01/B02: an Executive point of contact, selective consultation,
scoping, explicit delegation, authorized work, manual review, and minimum continuity.
Executive, CSO, CPO, and COO are candidates to confirm against the first real use case.

**Exit criterion:** the journey meets the PRD's requirements and qualification
scenarios with evidence of actual execution; the owner can find who recommended,
decided, executed, and observed what. A limited conclusion or understandable blocker
is preferable to invented success.

H1 requires neither every executive profile, a standing meeting of specialists,
Council, an external connector, nor periodic operation.

## 3. H2 — Domain journeys and broader coordination

The following scenarios have lower priority than H1 and can be selected separately.
An initial manual analysis can establish their usefulness before deeper integration.

| ID | Scenario and value | Inputs or dependencies | Evidence expected before adoption | Authority boundary |
| --- | --- | --- | --- | --- |
| R01 | Prioritize several projects: compare a feature, debt, commercial activity, or another investment. | Shared objectives, capacity, constraints, and comparable information; H1 continuity. | A reasoned proposal, explicit exclusions, and sensitivity to assumptions; a traceable owner decision. | Does not change commitments, budgets, or effective priorities outside delegation. |
| R02 | Coordinate delivery across functions: connect several domains, deliverables, and dependencies. | Qualified B02; available accountable actors and identified intermediate results. | A cross-functional blocker is detected, assigned, and resolved or escalated; results stay linked to the objective. | Assignments and scope changes depend on the mandate and permissions. |
| R03 | Prepare a launch: align product, positioning, sales, and operations. | Target audience, offer, capacity, intended date, and readiness criteria; CPO/CMO/Sales/COO profiles as needed. | A coherent plan with documented dependencies and readiness criteria; unknowns preventing launch are visible. | Preparation does not authorize publication, prospect outreach, or expenditure. |
| R04 | Analyze an initiative's economics: compare costs, benefits, and scenarios. | Supplied data, provenance, period, and assumptions; candidate CFO profile. | Explainable calculations, comparable scenarios, and uncertainties that could reverse the recommendation. | No implicit financial access, purchase, or commitment; no professional certification. |
| R05 | Review organization and capacity: identify missing responsibilities and propose work allocation. | Inventory of humans/agents, workload, and known constraints; candidate People profile. | A proportionate proposal covering coordination costs and alternatives to creating another agent. | No automatic hiring, creation, deletion, or permission changes. |
| R06 | Conduct a risk review: bring together relevant legal, operational, and domain perspectives. | Identified initiative and evidence; specified legal or domain context; GC/COO and other profiles as needed. | Risks linked to consequences, proposed mitigations, and required decisions; explicit professional limitations. | No agent opinion presented as certification or independent acceptance of its own contribution. |

Selection among R01–R06 will depend on actual demand and the cost of obtaining
reliable data. The existence of an upstream specialist alone does not establish priority.

## 4. H3 — Recurrence, broader continuity, and supervision

| ID | Scenario and value | Dependencies to qualify | Expected evidence | Authority boundary |
| --- | --- | --- | --- | --- |
| R07 | Periodic portfolio review: progress, outcomes, blockers, and decisions to revisit. | R01, current data, explicit cadence, recipient, and notification policy. | A useful review linked to evidence without unnecessary repetition; stopping or changing the cadence takes effect. | Merely mentioning a regular review does not activate a scheduler or recurring messages. |
| R08 | Longitudinal decision tracking: recover the reasons for a choice and assess its effects across initiatives. | H1 continuity, read permissions, provenance, corrections, and retention rules. | An old decision is retrieved with its context; its observed effect is distinguished from the expected effect and conflicting recollections. | No general learning inferred from a local correction; no implicit cross-company reuse. |
| R09 | Optional Council supervision: submit, correct, and have a result reviewed again. | Executive/Council contract, distinct identities where needed, mandate, and covered acceptance paths. | Version 1 → correction → version 2 → verdict with confirmed application, preserving the link to the initiative. | Executive does not accept its own contribution; a favorable verdict, recorded decision, and confirmed effect remain distinct. |

For R09, the proposed exchange includes initiative, result version, mandate,
criteria, evidence, known limitations, correction or verdict, possible human
arbitration, and confirmed application state. **This is not an existing API.**
Executive must remain useful without this integration. OpenExecutive's critique
committee is not a proven substitute for Paperclip Council.

## 5. Additional explorations, not committed

These possibilities come from the upstream catalogue and dependencies. They do not
automatically become PRD requirements.

| Exploration | Potential value | Condition before selection |
| --- | --- | --- |
| Governance communications | Briefing notes, decision packages, and board preparation; candidate Board Communications profile. | A real need, recipients, confidentiality, and verified data; preparation separated from sending. |
| Onboarding and intake | Reduce the cost of gathering context about the owner and initiatives. | Establish whether a method within Executive is sufficient or justify an auxiliary agent; no automatic company or team creation. |
| Triage and alert review | Surface events that change a decision or block an objective. | Authorized sources, relevance criteria, control of noise and actions; no blind copying of upstream auxiliaries. |
| Broader domain knowledge | Enrich analysis with selected methods, failure cases, and knowledge collections. | Provenance, licenses, currency, access, and measured usefulness; having a collection does not prove decision quality. |
| Connectors and monitoring | Reduce repeated data entry and keep useful information current. | An identified need, authenticated target, least privilege, and separation of reads and writes; no connector required for H1. |
| Custom methods and workflows | Reuse a journey that has demonstrated value. | Distinguish reusable procedure, initiative context, and authorized actions; prefer Paperclip mechanisms that actually fit. |
| Profile evaluation and improvement | Compare versions and retain useful adaptations. | Comparable measures, attribution of effects, review, and rollback; no presumed multiagent superiority or automatic improvement. |
| Delegated external communications or actions | Extend an already qualified journey to a useful action. | Specific authorization, exact destination, and evidence of effect; outside the initial scope. |

The `fixture_generator`, `utility_fast`, and `research` auxiliaries are not
executive positions to provision by default. A simulation tool or model setting
must remain distinct from a domain responsibility.

## 6. Rule for moving into committed scope

Before promoting a scenario, make explicit:

1. the user problem and a representative real use case;
2. the expected outcome and observable evidence;
3. the necessary data, profiles, and capabilities, with their known limitations;
4. the mandate, reserved decisions, and any external effects;
5. the expected benefit compared with a simpler solution and the coordination cost;
6. the stopping, evaluation, and resumption criteria.

The selected scenario must then be incorporated into a new PRD version before
technical decomposition. A priority decision is not evidence of feasibility,
an installation, or authorization to activate.

The next decision concerns the H1 reference use case and its delegation envelope.
Models, reasoning efforts, adapters, budgets, and timelines remain to be assessed;
no upstream choice is silently carried forward.

Shared sources and evidence limitations are recorded in
[PRD section 9](PRD.md#9-sources-provenance-and-evidence-status).
