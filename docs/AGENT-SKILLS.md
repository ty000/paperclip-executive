# Prepared skills registry

Registry version: `1.0.0`. Owner/maintainer: Paperclip Executive. Every skill below
has version `1.0.0`; its source is included in the package. No row asserts company
library installation, desired assignment, adapter loading, activation or execution.
Exact derived-source paths/hashes are in
[OpenExecutive provenance](../packages/executive/provenance/openexecutive.json).
Original work is marked separately; upstream model/provider defaults are excluded.

| Stable key | Exact source | Origin and reuse disposition |
| --- | --- | --- |
| `paperclip-executive.council-decision-review` | [source](../packages/executive/skills/council-decision-review/SKILL.md) | Original Executive method aligned with Council `docs/PRD.md` and `docs/AGENT-CATALOG.md`, MIT (`LICENSE`), at `bc6d71fa6ede8f239c7990af1885dc07cccc7c18`; authority remains Council-owned. |
| `paperclip-executive.direct-advice` | [source](../packages/executive/skills/direct-advice/SKILL.md) | adapted from OpenExecutive Executive persona and routing guidance at `13da433bc6f3ae97e78bb8c90f06bb5e49953447`; see package provenance. |
| `paperclip-executive.evidence-review` | [source](../packages/executive/skills/evidence-review/SKILL.md) | new Paperclip method; upstream research fan-out and provider defaults are not ported. |
| `paperclip-executive.implementation-execution` | [source](../packages/executive/skills/implementation-execution/SKILL.md) | new Paperclip-native method aligned with Council executor separation. |
| `paperclip-executive.prepared-ticket-review` | [source](../packages/executive/skills/prepared-ticket-review/SKILL.md) | Paperclip Executive `CONTRIBUTION_METHOD` and `prepared-ticket-contribution.v1` at merge `ccd02e1f594b5fe6083d4c2f1c1ad7533bc7f54e`. |
| `paperclip-executive.risk-review` | [source](../packages/executive/skills/risk-review/SKILL.md) | new shared method; domain questions remain in each profile. |
| `paperclip-executive.specialist-advisory` | [source](../packages/executive/skills/specialist-advisory/SKILL.md) | new Paperclip adaptation informed by OpenExecutive domain-specialist separation at `13da433bc6f3ae97e78bb8c90f06bb5e49953447`. |
| `paperclip-executive.stakeholder-communication` | [source](../packages/executive/skills/stakeholder-communication/SKILL.md) | adapted from OpenExecutive board, marketing, sales, people, and legal communication guidance at `13da433bc6f3ae97e78bb8c90f06bb5e49953447`. |

## Assignment and method boundaries

The declarative [agent catalogue](../packages/executive/config/agent-catalog.json)
is authoritative for required versus conditional assignments. Each profile's
`Method` section references the same exact keys/versions. Conditional means select
only for its trigger, not install everything or allow an otherwise forbidden action.
A declared `paperclip-executive.*` key is a source identifier; provisioning must
resolve the actual imported company-library key/version before assignment.

| Method | Trigger / inputs | Procedure and output / stopping boundary |
| --- | --- | --- |
| direct-advice | Owner question and supplied context | Identify objective, decisive trade-offs and assumptions; return L01 JSON recommendation/assumptions/limitations. Stop at advice. |
| prepared-ticket-review | Full L02 snapshots and embedded schema | Assess the existing three perspectives, classify findings and return the unchanged L02 JSON. Stop on missing identity/context or requested decision effect. |
| specialist-advisory | Selected specialist question and exact subject | Declare relevance, inspect role-specific questions, preserve evidence/dissent and return attributable proposed L03 opinion. Stop after question; no recursive consultation. |
| implementation-execution | Assigned prepared ticket, write scope and limits | Implement smallest sufficient change, validate and hand exact candidate/evidence to distinct reviewer. Stop at limits or missing authority; no self-acceptance. |
| council-decision-review | Explicit mandate, distinct reviewer and candidate/contributions | Check subject freshness, consolidate real blockers and dissent, use only Council's qualified decision path and persistent receipts with observed native responses; ambiguous results retain the hold under [the V1 receipt decision](DECISION-RECEIPTS-V1.md). Stop on unsupported/stale/unknown effect. |
| risk-review | Concrete risk question, assets/actors and boundaries | Trace credible failure, evidence, impact and minimal mitigation; preserve residual risk. Stop when authority or decisive evidence is missing. |
| evidence-review | Identified claim, criteria and evidence | Separate observed/inferred/unknown, find discriminating checks and report proof gaps. No synthetic-to-runtime promotion or unapproved execution. |
| stakeholder-communication | Explicit audience, message objective and supplied evidence | Draft accurate audience-appropriate communication with uncertainty and dissent. Stop at an unsent draft; no external communication authority. |

Shared methods intentionally serve several profiles. Role-specific questions remain
in AGENTS.md; provider/engine/model, permissions and workspace needs remain in config.
The native Paperclip operational/hiring skills are operator prerequisites described
in provisioning, not bundled here under invented local keys. No Codex plugin
installation is a Paperclip skill installation.

## Trigger checks (authored synthetic cases)

| Skill | Explicit invocation | Matching implicit request | Near miss that does not authorize selection/action |
| --- | --- | --- | --- |
| direct-advice | Ask for direct-advice | Compare supplied strategic alternatives for owner | Implement the chosen alternative |
| prepared-ticket-review | Named L02 method plus snapshots | Review a complete L02 approach request | Missing snapshots or proposed new L03 schema |
| specialist-advisory | Named specialist method and role | Answer the selected product/technical question | Blanket unsolicited audit or recursive panel |
| implementation-execution | Named execution skill and assigned ticket | Implement within supplied write scope | Accept or deploy the result without authority |
| council-decision-review | Named method with current mandate | Decide current result as designated reviewer | Specialist recommendation or stale subject |
| risk-review | Named risk-review and risk question | Analyze supplied access/data/operability risk | Harmless copy change with no risk question |
| evidence-review | Named evidence-review and claim | Distinguish a tested contract from runtime proof | Run a live test or infer absent telemetry |
| stakeholder-communication | Named draft method | Prepare a supplied board/customer message | Send, publish, promise or contact recipients |

These checks verify documented contracts and selection boundaries, not model skill
selection quality. Actual skill mount/loading still needs future target-specific
qualification under separate authorization.
