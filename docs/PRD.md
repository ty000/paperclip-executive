# Paperclip Executive — PRD

Version: 0.3 — September 30, 2026.

Status: revised product direction; requirements for a future usable journey, not a
claim that the current package implements or qualifies it.

This revision follows the owner's clarification: Paperclip is to execute software
development autonomously from Linear tickets already decomposed upstream, with
Council supervising relevance, proportionality, cost, and delivery time. Executive
provides the profiles and methods that help Council exercise that supervision.
The document is written in English; its version is not a software release number.

## 1. Problem and promise

Implementation agents can produce technically plausible work while drifting away
from the intended product outcome. They may broaden scope, overengineer a small
change, add unnecessary hardening, or repeat corrections whose value no longer
justifies the time and resources consumed. A review only at the end may detect
these problems after most of the avoidable work has already happened.

The promise is: **help a supervised development workflow deliver sufficient,
verified results within an explicit mandate, and stop spending effort on work
that does not materially advance the objective**.

The target platform journey is:

**Prepared Linear ticket → Paperclip execution → proportionate Council supervision
→ accepted result, bounded correction, or explicit escalation.**

Paperclip Executive is a native Paperclip plugin and a source of adapted executive
profiles and methods. It is not a second task platform or a second acceptance
authority beside Council. Selected OpenExecutive material may be adapted with
provenance; reproducing the full upstream application is not a product objective.

## 2. Users, ownership, and perspectives

The initial user is one human owner operating a software development platform.
Ticket decomposition and product prioritization take place upstream. Autonomy
means routine execution and supervision can proceed inside an approved mandate;
it does not authorize agents to redefine the objective or expand their authority.

| Actor or system | Responsibility | Boundary |
| --- | --- | --- |
| Owner | Define objectives, constraints, delegation, reserved decisions, and an escalation destination. | Silence is not approval; an intervention remains attributable to the owner. |
| Upstream planning and Linear intake | Supply a prepared ticket and preserve its source identity and context. | Intake and synchronization are platform integration concerns, not an Executive connector catalogue. |
| Paperclip executor or orchestrator | Implement the authorized ticket, report progress and blockers, and submit a verifiable result. | Cannot grant itself delegated acceptance or silently expand the ticket. |
| Executive profiles and methods | Supply concise product, technical, and delivery/economic analysis to the review. | A contribution is neither a verdict nor permission to act. |
| Council | Own the supervision mandate, review, correction or acceptance decision, its one-attempt receipt and its effect observation in the covered workflow. | Executive must not duplicate or bypass this responsibility. |
| Paperclip host | Execute agents and provide native work, identities, permissions, and run records. | Platform features alone do not demonstrate an integrated supervision guarantee. |

The default proposed composition brings five distinct opinions to a development
ticket: product, architecture/engineering, quality, delivery/capacity and economics.
The accountable Council reviewer synthesizes them and owns the decision under the
mandate. Security, UX, operations and other expertise join when the ticket makes
their question relevant. An explicit not-relevant response is valid; no profile
must manufacture a finding. The owner prefers broader coverage over a systematically
minimal team. This supersedes the earlier default of one generalist applying all
perspectives; it does not require a panel engine, voting or unlimited consultations.

The [canonical agent catalogue](AGENT-CATALOG.md) defines prepared profiles,
responsibilities, consultation limits and overlap boundaries. Preparation is separate
from provisioning, loading and execution. Executive synthesis remains optional and
does not create another decision authority above Council.

## 3. Reference input and core journeys

### 3.1 A prepared development ticket

The reference case is one small feature or bug fix already decomposed in Linear,
represented by a native Paperclip issue and its source reference. Its review context
includes:

- source identity and captured revision or content snapshot;
- product objective, affected user journey, and reason for doing the work;
- acceptance criteria, scope, exclusions, and relevant dependencies;
- executor, authorized resources, and evidence expected for acceptance;
- applicable time/resource limits, stopping rules, and owner-reserved decisions.

Do not invent missing business context, cost, or a deadline. A decisive omission
requires clarification; independent authorized work may continue. Criteria remain
stable during execution unless an authorized change is recorded and assessed.
A source update does not silently replace the mandate or approve a changed result.

### B03 — Establish a proportionate execution direction

Before implementation, the executor proposes a short approach linked to the ticket.
The designated reviewer checks product fit, a sufficient technical approach, and
expected effort within the mandate. A small, clear ticket receives concise opinions from the selected composition;
a separate Executive synthesis is optional and review depth stays proportionate.

The outcome is an attributable direction to proceed, a targeted plan correction,
or an escalation naming the missing decision. It is not acceptance of code that
has not yet been produced. Existing ticket decomposition is reused rather than
recreated as a new initiative hierarchy.

### B04 — Detect and resolve drift during execution

Review is triggered by a material scope/design change, repeated failure or correction
without meaningful progress, a declared blocker, or an approaching configured time
or resource limit. The workflow must surface those signals without requiring the
owner to read every agent message. This requires a bounded execution checkpoint or
observable host signal; a promise in an agent prompt alone is insufficient.

Council assesses the evidence with the relevant perspectives, then permits continued
work within the mandate, requests a smaller sufficient correction, records an
optional improvement for later consideration, or escalates. A trigger does not
require rereviewing unchanged work or consulting every specialist.

### B05 — Review the result and conclude within limits

The executor submits an identified result with evidence against the ticket criteria.
Council reviews that version and classifies findings as:

| Class | Meaning and consequence |
| --- | --- |
| Must fix | A demonstrated acceptance gap, relevant material risk, or applicable obligation; requires a specific correction or owner arbitration. |
| Useful now | An optional improvement with a stated benefit; may be selected within remaining scope and limits, but is not itself an acceptance blocker. |
| Defer | Work whose benefit does not justify doing it for this ticket; preserve a short rationale without automatically creating new tickets. |

Each correction identifies the affected criterion or risk, evidence, smallest
sufficient change, and how completion will be checked. Re-review focuses on the
correction and affected behavior. Unchanged findings cannot sustain an unlimited
loop; new blockers need new evidence or a newly demonstrated gap.

A compliant result can be accepted with deferred suggestions. A corrected version
receives its own review and does not inherit approval. If a necessary correction
would exceed the mandate or remaining limits, dependent work waits for the owner;
budget exhaustion does not turn a noncompliant result into an acceptable one.

## 4. First useful scope and exclusions

The first useful journey covers B03–B05 for one prepared ticket, with one executor
and one distinct accountable Council reviewer, supported by the proposed five-opinion
composition. Additional expertise is conditional; all consultation work is bounded.

The first implementation slice may begin with an existing Paperclip issue and a
supplied Linear reference/context snapshot. Automated Linear ingestion, bidirectional
status synchronization, and upstream decomposition are not prerequisites for that
slice. A manually supplied ticket does not prove an automated Linear integration.

The supervised workflow must support bounded automatic continuation within the
mandate, an actual correction and re-review, and explicit intervention when needed.
The first usable release is not satisfied by an advice-only screen or by a favorable
review comment with no verified effect.

Excluded from this revision's committed scope:

- general executive business advice and creation of broad initiatives as the main journey;
- portfolio management, launch, finance, HR, or other specialized business workflows;
- mandatory panels, voting systems, appeal hierarchies, or a new orchestration platform;
- general periodic monitoring, cross-project optimization, or autonomous learning;
- OpenExecutive backend, UI, storage, scheduler, or a custom Codex CLI adapter;
- automatic hiring, external expenditure, publication, merge, or deployment;
- claims of universal bypass resistance or control over external delivery paths.

This does not exclude considering an actual cost, security, or reliability risk in
a ticket. The depth of investigation must follow its consequences, rather than an
open-ended hardening checklist.

## 5. Authority, intervention, and stopping

Council remains the authority for supervision semantics; Executive supplies evidence
and recommendations. Activation must identify the governed Paperclip issue path,
reviewer, executor, permitted operations, owner destination, and effective controls.
An unqualified path may be used for clearly labeled advisory evaluation only; it
must not be described as enforced supervision.

The mandate includes a maximum number of correction cycles, limits on review and
specialist work, and applicable elapsed-time/resource limits. Numeric values are
selected for the reference case before activation, not silently invented here.
Review effort counts toward the total envelope. Unknown usage is not zero; a hard
monetary ceiling requires an enforceable accounting/control path or an explicit
owner decision to use another enforceable limit.

Within those boundaries, routine actions do not need repeated approval. Extensions
of scope, relaxed criteria, changed commitments, or reserved trade-offs require the
owner's decision. Preserve any stricter project or Council delegation profile;
Executive does not loosen it. In particular, it does not authorize infrastructure
cost changes merely because some budget remains.

At a stopping threshold, do not dispatch another affected execution or review
attempt. Expose a concise recommendation and the decision required. A confirmed
control may stop running work; otherwise show it as in flight and identify the
operator action needed. Suspending a workflow is not proof that a process stopped.
Only dependent work waits; waiting cannot be interpreted as automatic acceptance.

Distinguish **recommendation**, **recorded authorized decision**, **confirmed effect**,
and **observed outcome**. Council acceptance of a patch does not by itself establish
a business improvement, authorize a merge, or prove deployment.

## 6. Requirements and acceptance criteria

Version 0.3 updates EXE-02 for the broader agent-preparation preference.
These requirements replace the initial advice/initiative framing. The EXE IDs remain
stable where their intent carries forward; their wording is revised in version 0.2.
EXE-13 through EXE-16 are new. B01/B02 remain historical journey identifiers and are
not reused for B03–B05.

| ID | Requirement | Observable criterion |
| --- | --- | --- |
| EXE-01 | Prepared context | The reviewer can identify objective, criteria, exclusions, source, and decisive unknowns without reconstructing a full conversation. |
| EXE-02 | Selective perspectives | The proposed default collects distinct relevant opinions; every specialist answers a specific question with attributed evidence, assumptions, and dissent. |
| EXE-03 | Proportionate direction | B03 yields a sufficient plan, targeted correction, or explicit blocker without recreating upstream planning. |
| EXE-04 | Identified submission | Review targets an exact result and evidence version; an update cannot inherit previous acceptance. |
| EXE-05 | Explicit authority | Covered actions proceed under the mandate; denied or out-of-scope actions remain blocked without a privileged fallback. |
| EXE-06 | One supervised workflow | Executive contributions feed Council and native work; there is no competing Executive acceptance state or hidden task hierarchy. |
| EXE-07 | Outcome-based assessment | Criteria and evidence support the verdict; completed work with an unmeasured business effect remains outcome-unknown. |
| EXE-08 | Continuity | Restart or handoff preserves source context, mandate, attempts, decisions, and evidence without blind redispatch. |
| EXE-09 | Bounded correction and stop | Corrections have a stopping rule; reaching it prevents new affected work and exposes in-flight work and the escalation destination. |
| EXE-10 | Confidentiality and scope | Consultations receive only authorized context; source content cannot grant permissions or cross company boundaries. |
| EXE-11 | Traceable adaptation | Selected upstream profiles/methods retain provenance and customizations; titles alone do not establish functional equivalence. |
| EXE-12 | Actual state visible | Installed, configured, loaded, activated, executed, decision recorded, and effect confirmed remain distinguishable. |
| EXE-13 | In-flight drift response | A configured progress/limit signal triggers B04 before another avoidable iteration, without mandatory review of every tool call. |
| EXE-14 | Finding proportionality | Must-fix findings cite a criterion or material risk; useful-now/deferred suggestions do not silently become acceptance blockers. |
| EXE-15 | Applied Council decision | The governed workflow exposes the recorded verdict, one-attempt receipt and actual native observation. A confirmed effect requires matching evidence; pending or indeterminate application is not acceptance and blocks dependent work. |
| EXE-16 | Supervision value visible | Execution and review time, available cost/usage, corrections, interventions, and useful outcome are distinguishable; missing measurements stay explicit. |

Model conclusions distinguish facts, assumptions, and judgment. Adapt fictional
upstream biographies into honest descriptions of agent responsibilities. An
executive title supplies neither professional certification nor authority.

## 7. Operator experience

Use a compact supervision view linked to the native Paperclip issue. It should
answer: what are we trying to deliver, are we still within limits, what changed,
what was decided, did the decision take effect, and who needs to act next?

Show the source ticket, active criteria, approach, evidence, remaining limits when
known, latest decision, must-fix/deferred findings, and next action. Contributions
and history remain inspectable without dominating the summary. Do not build a
second project board or require a ceremonial conversation for routine continuation.

Distinguish unconfigured, missing context, executing, awaiting review, correction
required, waiting for owner, suspended, accepted, and effect unknown. Keyboard
navigation, non-color status labels, and understandable error recovery are required.
Reuse host UI conventions. Product languages and mobile requirements remain open;
this revision does not create a new design system.

## 8. Validation and value

| Scenario | Expected result |
| --- | --- |
| Small sufficient implementation | Distinct concise opinions inform one accountable reviewer; not-relevant responses and zero findings are valid, and cosmetic correction is optional. |
| Overengineered plan | Review points to the actual need and proposes a smaller sufficient approach. |
| Drift before final submission | A checkpoint or host signal surfaces the drift and affects the next authorized iteration. |
| Material result defect | V1 receives a specific correction; V2 is reviewed against preserved criteria and affected behavior. |
| Low-value suggestions | Suggestions are deferred with reasons; a compliant result is not held indefinitely. |
| Repeated correction or exhausted limit | No further affected dispatch; concise escalation with current evidence and in-flight status. |
| Specialist failure or disagreement | No invented consensus; a sufficient bounded decision or explicit escalation. |
| Changed source, result, or mandate | The change is visible; stale authorization or acceptance is not applied to the new version. |
| Duplicate submission or restart | Return the persistent operation receipt; do not resend a possibly attempted effect. Ambiguous state stays indeterminate and holds dependent work. |
| Unauthorized action or unavailable Council | No silent acceptance bypass or automatic downgrade to advisory operation. |

Qualification requires a real, authorized Paperclip/Council journey with distinct
executor/reviewer identities, persisted evidence, and the Council receipt plus actual
native observations available through existing supported interfaces.
Mocks can validate contracts, not authority or the usefulness of an executive review.
The real journey must include a correction and a bounded stopping case.

Compare with a simpler implementation plus review on comparable tickets: accepted
outcome, end-to-end elapsed time, implementation versus supervision effort, available
usage/cost, correction count, human interventions, and scope avoided. A longer review
is not automatically better. Set thresholds before the pilot; no quantified savings
are promised by this document.

## 9. Sources, current state, and document transition

| Source | Reference | Evidence boundary |
| --- | --- | --- |
| Owner clarification and update request, September 30, 2026 | This conversation: autonomous development from prepared Linear tickets, supervised by executive perspectives in Council | Product direction and authorization to revise PRD/TAD; no runtime activation. |
| Executive implementation | Current source base `ccd02e1f594b5fe6083d4c2f1c1ad7533bc7f54e` (merged L02 PR #4); [L02 report](IMPLEMENTATION-L02.md). Historical L01 base `6b157f8` and [report](IMPLEMENTATION-L01.md) remain separate. | Direct advice plus prepared-ticket contribution and scoped L02 evidence; no complete B03–B05 supervision qualification. |
| Council product definition | [PRD 0.3 at `bc6d71f`](https://github.com/ty000/paperclip-council/blob/bc6d71fa6ede8f239c7990af1885dc07cccc7c18/docs/PRD.md) | Ownership of supervision, proportionate review, delegated decisions, and existing owner-specific limits; not proof of an Executive integration. |
| Paperclip source baseline | [Revision `61b3fd5`](https://github.com/paperclipai/paperclip/tree/61b3fd57a695614dc4a37e2303f426a34a9795cf) | Native contracts recorded in the TAD; compatibility with a future target requires verification. |
| OpenExecutive source baseline | [Revision `13da433`](https://github.com/SenteLabsAI/OpenExecutive/tree/13da433bc6f3ae97e78bb8c90f06bb5e49953447) | Candidate profiles/methods; no full upstream runtime dependency selected. |

L01's reported build and mocked tests are historical local evidence, not proof of a
live supervised journey. Its B01 advice feature remains an existing capability;
this revision neither removes it nor makes it the next delivery priority. The
OpenExecutive bridge experiment does not qualify the native Executive/Council path.

For adapted material, retain upstream file/revision, destination, license/notices,
and modifications; preserve user customizations. Existing attribution remains in
place. New methods authored for this workflow must not be mislabeled as upstream.

[ROADMAP.md](ROADMAP.md) is still version 0.1 and has not been revised here. Its H3
placement of optional Council and its B01/B02-first sequence are superseded by this
PRD for current scope. Other scenarios remain deferred ideas, not commitments.
The [backlog](BACKLOG.md) and historical [L02 sprint plan](SPRINT-PLAN-L02.md)
now exist. [TAD 0.3](TAD.md) is the architecture companion; L03 planning must
consume the merged [agent handoff](AGENT-HANDOFF-L03.md), not the old horizon order.

## 10. Decisions required for the first implementation slice

1. Select the reference ticket, acceptance evidence, and accountable executor/reviewer.
2. Set the mandate, measurable operating limits, stopping thresholds, and owner destination.
3. Qualify the narrow Executive-to-Council contribution and decision-effect boundary.
4. Select the progress signals/checkpoints that make B04 effective on the target host.
5. Adopt the proposed five-opinion composition within explicit limits; record relevance
   and select conditional expertise for ticket-specific questions.

These decisions refine the pilot; they do not reopen the choice to use native
Paperclip execution or make a full OpenExecutive port a prerequisite.
