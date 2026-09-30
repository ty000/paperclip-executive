# Paperclip Executive — PRD

Version: 0.1 — September 30, 2026.

Status: initial product proposal, to be reviewed before use as an implementation reference.

This document defines the first useful scope of Paperclip Executive. The
[roadmap](ROADMAP.md) preserves the other scenarios and proposes their order of
exploration. It does not turn those scenarios into delivery commitments.
The document version does not identify an available software release.

## 1. Problem and promise

A human owner running several projects with agents still has to translate goals
into actionable requests, select the expertise to consult, reconcile analyses,
allocate work, and recover the reasons behind decisions. Completed tasks alone
do not establish that the original objective has been achieved.

Paperclip Executive must provide an executive point of contact that can clarify
a request, involve useful specialists, prepare a decision, and coordinate
authorized work through an explicit review of outcomes.

The promise is: **better-informed decisions and better-scoped, better-tracked
initiatives under explicit human delegation**.

The product is an independent Paperclip plugin. It must port and adapt selected
agent definitions, prompts, and methods from OpenExecutive while preserving their
provenance. Roles with matching names alone do not constitute a port.

## 2. User and responsibilities

The initial user is a human owner managing projects with agents in Paperclip.
Software development is one possible use case, not a permanent product restriction.
Managing multiple human owners and their competing decisions is not required
for the initial scope.

| Actor | Responsibility | Boundary |
| --- | --- | --- |
| Owner | Define objectives, constraints, and delegation; decide exceptions; stop work. | A request for advice does not automatically delegate execution. |
| Executive | Clarify, consult, synthesize, propose, and coordinate within the mandate. | Does not create new permissions or turn its recommendation into a human decision. |
| Specialist | Provide an attributable domain contribution with sources, assumptions, and limitations. | A title does not confer assignment, spending, or acceptance authority. |
| Executor | Perform assigned work and produce a verifiable result. | Does not independently accept its own contribution. |
| Council, optional | Examine a submission under a supervision mandate. | Not a dependency of the initial scope; integration must be qualified separately. |

For the first journey, Executive, CSO, CPO, and COO are **candidate profiles**:
general coordination, strategy, product, and operations. This composition requires
neither simultaneous creation nor systematic consultation of all four. The final
selection must follow the reference use case; an initiative outside product work
may need other expertise. An existing agent qualifies as a ported profile only
after its instructions, methods, and responsibilities have been verified.

## 3. Two core use cases

### B01 — Get executive advice on demand

Example: compare two product directions or two ways to organize a service.
The owner provides the question and available information.

Executive:

1. distinguishes a simple question from a trade-off that requires analysis;
2. requests information that materially affects the answer or states its assumptions;
3. consults only specialists whose contribution could change the answer;
4. presents relevant options, facts, uncertainties, disagreements, and a recommendation.

The result is an actionable answer linked to the contributions it used. A direct
answer without consultation is appropriate when consultation would add no value.
No initiative, task, expenditure, or external communication follows implicitly
from a request for advice. The owner may then ask to continue through B02.

### B02 — Scope and track an authorized initiative

Example: improve user activation, reduce request processing time, or prepare
an improvement to a service.

The expected journey is:

1. **Clarify the objective.** Identify the problem, beneficiary, and missing data.
   A vague objective leads to scoping, not a delivery promise.
2. **Propose the initiative.** Present the expected outcome, indicators, scope,
   exclusions, dependencies, risks, responsibilities, and required decisions.
3. **Establish delegation.** Make authorized actions, limits, and reserved decisions
   explicit. The owner may approve, amend, or reject the proposal.
4. **Coordinate authorized work.** Prepare or create linked work and assign it only
   when both the mandate and effective permissions allow it. Otherwise, provide
   the proposal and make the blocker visible.
5. **Review progress on request.** Compare available results with the objective,
   explain gaps, and propose next steps. Follow-up is manual within this scope.
6. **Conclude or resume.** Distinguish completed work, observed outcomes, and remaining
   decisions. The owner may accept, request a correction, suspend, or abandon
   the initiative without losing its history.

Each initiative retains at least: objective and problem; sources; expected outcome;
indicator with baseline and target when known; scope and exclusions; accountable
owner; work and dependencies; mandate; decisions; evidence and limitations.
Unknown data remains unknown, with its effect on the decision stated. No target
or deadline is invented to complete a record.

## 4. Initial scope and exclusions

The proposed initial scope includes B01 and B02, attributable consultations,
traceable decisions, and manual resumption of an initiative after interruption.
It must work without Council or a mandatory external connector, using supplied
information and authorized Paperclip resources.

The following are not committed within this scope:

- full project portfolio prioritization;
- specialized launch, finance, organization, or risk review journeys;
- scheduled reviews, monitoring, and proactive follow-ups;
- Council integration and independent delegated acceptance;
- automatic ingestion of email, CRM, calendars, or external knowledge bases;
- automatic agent creation, expenditure, external sending, publication, or deployment;
- reuse of OpenExecutive's backend, interface, storage, or scheduler;
- autonomous learning or a promise of demonstrated continuous improvement.

These exclusions do not prevent discussion of a risk or cost within B01/B02.
They avoid promising specialized journeys, connected data, or actions that have
not yet been qualified. The roadmap preserves these possibilities.

## 5. Delegation and understandable states

The mandate must identify its author, scope, authorized actions, affected resources,
applicable time or resource consumption limits, reserved decisions, and escalation
recipient. If a limit is necessary to act but unknown, Executive prepares the work
and requests the missing decision.

Valid delegation may cover several routine actions: authorization need not be
requested again at every step already covered. Technical permission does not
replace delegation; delegation does not bypass an API refusal. Any extension of
scope, criteria, or commitments must be decided explicitly.

The experience distinguishes the following concepts without prescribing their
technical model here:

| Concept | What it establishes |
| --- | --- |
| Recommendation | An analysis proposes a direction. |
| Authorized decision | An authorized actor has decided within an identified scope. |
| Executed action | The operation actually occurred, with an inspectable record. |
| Observed outcome | Evidence establishes the effect obtained at a given time. |
| Acceptance | The appropriate actor accepts the identified result against agreed criteria. |

Failures, missing responses, and uncertain effects remain visible. After an
interruption, the product must recover what actually happened before proposing
resumption. A corrected version remains linked to its predecessor and does not
silently inherit its acceptance. Without Council, acceptance reserved in the first
journey belongs to the owner; Executive prepares the review and may assess evidence
without taking over that decision.

## 6. Requirements and acceptance criteria

| ID | Requirement | Observable criterion |
| --- | --- | --- |
| EXE-01 | Proportionate scoping | Given an incomplete objective, Executive identifies decisive unknowns and proposes a scope; it does not declare the objective delivered. |
| EXE-02 | Selective consultation | Consulted specialists answer an explicit question; the synthesis lets the user find each author and contribution, including disagreements. |
| EXE-03 | Actionable advice | B01 provides a reasoned recommendation, relevant alternatives, and uncertainties; it creates no implicit operational commitment. |
| EXE-04 | Verifiable initiative | B02 makes the expected outcome, indicators, scope, exclusions, dependencies, and required decisions inspectable; missing values are flagged. |
| EXE-05 | Explicit authority | A covered and permitted action may proceed; an action outside the mandate or denied remains unexecuted, with a reason and a targeted request. |
| EXE-06 | Attributable coordination | Authorized work is linked to the initiative with accountable actors and blockers; a proposed assignment is distinct from a completed assignment. |
| EXE-07 | Outcome-based tracking | The review compares evidence with criteria; completed tasks with an unknown business effect do not become an achieved objective. |
| EXE-08 | Continuity | Resumption recovers the objective, mandate, decisions, work, versions, and evidence without relying solely on an agent's private memory. |
| EXE-09 | Stop and correction | Suspension, abandonment, or correction remain possible; ongoing actions and uncertain effects are exposed without a false promise of cancellation. |
| EXE-10 | Confidentiality and scope | A consultation exposes only authorized context; unauthorized cross-company reads or external disclosure are not allowed. |
| EXE-11 | Traceable, customizable port | Profiles carry upstream references; a proposed update makes changes identifiable and preserves customizations. |
| EXE-12 | Actual state visible | Declared, installed, configured, loaded, activated, and executed are distinct; an unavailable specialist is not presented as having contributed. |

A synthesis must distinguish sourced facts, assumptions, and judgment. External
data or supplied attachments cannot grant new permissions. Legal or economic
analysis must not be presented as professional certification. Fictional biographies
and degree claims in upstream personas must be adapted into honestly presented
agent profiles.

## 7. User experience

The owner must be able to submit a question, understand a recommendation, amend
an initiative's scope, identify the decision needed, track work, and interrupt
an initiative. The main synthesis stays concise; contributions, sources,
disagreements, and history remain accessible without rereading every conversation.

States that must be understandable include: missing information, proposal awaiting
a decision, authorized work, in progress, blocked, suspended, awaiting review, and
outcome still unknown. The user must know who needs to act and on what. The product
does not hide a failed consultation behind an apparently unanimous synthesis.

The choice between native Paperclip surfaces and a dedicated interface remains
open. Any selected surface must support keyboard use, present states without
relying on color alone, and display errors with an understandable next step.
English is the language of this document; product languages, mobile scope, and any
additional design system remain to be decided. This document defines no frontend.

## 8. Evaluating the first useful release

Future qualification must cover at least:

| Scenario | Expected result |
| --- | --- |
| Simple advice | A sufficient answer without unnecessary coordination. |
| Trade-off with disagreement | Attributable contributions, visible disagreement, and a reasoned recommendation. |
| Vague objective | Missing information and a proposed initiative, without a false commitment. |
| Authorized initiative | Work actually created or assigned within the mandate, with its effective state read back. |
| Action outside the mandate or denied | No bypass; the blocker and required decision are visible. |
| Unavailable specialist | Explicit failure and a proportionate next step: retry, limited answer, or escalation. |
| Interruption and correction | Resumption from actual state, preservation of versions and decisions, no blind repetition of an action. |
| Work complete, effect unmeasured | Delivery distinguished from a business outcome that remains unknown. |
| Withdrawal of delegation | New affected actions stop, and the state of actions already underway is visible. |
| Update to a customized profile | Identifiable changes and preserved custom content. |

To declare the journey usable, later qualification must use real, authorized
identities, persistence, and the Paperclip runtime. Reviewed prompts, simulated
tests, or a successful installation are insufficient.

Evaluation will compare the journey with simpler management on comparable requests:
quality of decisions and scoping, observed outcomes, total time, known resource
consumption, human interventions, and coordination overhead. Unknown costs remain
unknown. Thresholds and the reference use case must be set before qualification;
this PRD version promises no quantified gain.

## 9. Sources, provenance, and evidence status

| Source | Reference | Scope |
| --- | --- | --- |
| Mission and familiarization on September 30, 2026 | Owner's brief, followed by the request for this PRD and roadmap | Product direction; no authorization to install or activate. |
| Paperclip Executive | [README](../README.md), [current license](../LICENSE), commit `a8deee6a5a9fe10b71d80e74a96adcc07c40a47b` | Starting point: README and MIT license, no port or implementation. |
| OpenExecutive | [Revision `13da433`](https://github.com/SenteLabsAI/OpenExecutive/tree/13da433bc6f3ae97e78bb8c90f06bb5e49953447) | Profiles, prompts, orchestrator, methods, and knowledge examined in the preceding mission. |
| Paperclip | [Revision `61b3fd5`](https://github.com/paperclipai/paperclip/tree/61b3fd57a695614dc4a37e2303f426a34a9795cf) | Guides, SDK contracts, and code examined; no deployed instance is proven. |
| Paperclip Council | [PRD at commit `365809e`](https://github.com/ty000/paperclip-council/blob/365809efdf190010f818a25b938bad59ebd4f33c/docs/PRD.md) | Product proposal and reported historical observations; Executive integration is unproven. |

The nine domain specialists and Executive do not represent all upstream code:
the consultation registry also includes triage; other auxiliaries and configuration
entries exist. Their titles guarantee neither functional equivalence nor relevance
to the initial scope. The knowledge, tools, and continuity mechanisms on which
profiles depend must be explicitly selected or replaced.

For each ported element, retain the upstream file, revision, destination, and
modifications. Provide visible attribution in the README, a copy of Apache-2.0,
relevant upstream NOTICE entries, and a statement of modifications in derived
files. Separately verify selected third-party materials, especially external
knowledge. Before incorporation, attribution remains prospective. This document
does not change the project's overall license or incorporate upstream prompts.

Evidence status: documentary familiarization completed; PRD and roadmap drafted;
port, build, installation, configuration, loading, activation, and business
execution unproven. No historical Council result is evidence for Executive.

## 10. Open decisions before implementation

1. Select a reference initiative and its observable criteria.
2. Define the initial delegation envelope: advice, preparation, or work creation/assignment.
3. Confirm the required profiles and the methods/knowledge actually to be ported.
4. Choose interaction surfaces and the durable representation of initiatives and decisions.
5. Choose adapters, providers, models, reasoning efforts, and budgets after verification on the target.
6. Set usefulness thresholds and the qualification protocol.

These decisions do not require a complete OpenExecutive port. They must enable
selection of a first testable version of B01/B02, followed by architecture derived
from that need, without activating roadmap scenarios by default.
