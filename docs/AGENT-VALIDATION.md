# Agent asset validation and review record

Scope: catalogue/profile/skill/configuration source preparation only. Runtime
installation, desired assignment, loading, activation and execution are untested.
Migration prewrite: not applicable; no DB migration or installed instruction change.

## Base and ownership

Durable checkout: `executive-agent-assets/paperclip-executive`;
branch: `codex/executive-agent-assets`; clean base `ccd02e1` = fetched origin/main.
The Git base gate passed before writes. A prior clean checkout disappeared externally
before authoring; the dedicated replacement was independently gated. No writes to
Paperclip, Council or OpenExecutive are part of this lot.

The user authorized commit, PR, review and merge. PR #6 first published provisional
contract `82e8338`; final merge must use squash as required by active `protect-main`
ruleset 24244988. No rules changed. No `.codex/project-gates.json` exists at base.
This is a directly authorized prepared-assets lot, not an implementation slice of
L02 or L03; acceptance is the six deliverables and checks in the owner mission.

## Acceptance coverage

| Requirement | Evidence surface |
| --- | --- |
| Every named role and observed helper has a disposition | AGENT-CATALOG.md; 18 AGENTS.md files; upstream inventory |
| Concrete role methods/authority and exact references | AGENTS.md files; AGENT-SKILLS.md; eight SKILL.md files |
| Declarative configuration and supported native fields | config/agent-catalog.json + schema; source contract checks; provisioning |
| Minimal packaged assets, customizations preserved | package file allowlist; unchanged runtime manifest; pack/readback checks |
| Future provisioning/qualification procedure | AGENT-PROVISIONING.md; no procedure execution here |
| L03 handoff, parallel work and merge dependency | AGENT-HANDOFF-L03.md; PRD/TAD/backlog updates |
| Six synthetic cases and limits | AGENT-SCENARIOS.md; documented expected outcomes, no model run |
| L01/L02 compatibility | Existing 37 unit/SSR tests, typecheck/build; unchanged source runtime/schema |
| Independent catalogue/PR review | Read-only reviewer plus contextualized GitHub review, results below |

## Review ledger

Global correction/reslice bound: **5** (owner supplied). Remaining: **1**.
Initial authoring is not a remediation cycle. Correction batch 1 reserves one pass
before edits for the preliminary independent documentary findings below.

| ID | Impact and relevance | Intent / smallest coherent fix | Evidence plan |
| --- | --- | --- | --- |
| DOC-01 | Introduced wrong L02 key count; actionable | Say six top-level fields and three nested perspectives; no runtime change | Compare `src/contribution.ts` and scenarios |
| DOC-02 | Pre-existing L01 baseline retained in revised current-state authorities; actionable clarification | Identify current merged L02 separately from historical L01 | Compare source tables and L02 report at `ccd02e1` |
| DOC-03 | In-progress missing final handoff skill/config IDs; required completion | Add exact source versions and references once finalized | Cross-check registry/config/profile versions |
| DOC-04 | Missing observed upstream ghostwriter helper; actionable coverage | Add explicit deferred drafting utility disposition | Upstream `delegation/ghostwriter.py` |
| DOC-05 | Optional wrapping suggestion; advisory | Wrap adjacent edited text only | Diff inspection |

All changes stay within the authorized documentary boundary. No decision authority,
wire schema, runtime configuration or deployed state is changed by these fixes.

## Assembly checks before final PR review

- Frozen dependency install used the existing lockfile and bundled native SDK; no
  dependency versions changed.
- Existing tests: 37/37 pass; TypeScript check and plugin build pass.
- Provenance: 15 entries independently checked against upstream source bytes and
  prepared destination bytes.
- JSON Schema Draft 2020-12: the first pass caught a disallowed `$schema` property
  and regex escaping drift; corrected during assembly and independently rechecked.
- Native draft checks use the bundled `createAgentHireSchema` and
  `updateAgentPermissionsSchema`; deployed-target compatibility remains unknown.
- Static audit initially exposed a validator-complexity failure in Fallow's verdict
  despite the wrapper reporting pass. Treat the CI verdict as unresolved until the
  bounded validator refactoring passes the actual gate; do not claim that wrapper
  pass alone establishes CI readiness.

Correction batch 2 reserves one pass before final alignment edits:

- CAT-01 (introduced, actionable): first three profiles declared conditional methods
  absent from their configuration registry. Add their exact conditional entries;
  keep native desiredSkills required-only. Check all 18 profile/config sets.
- CAT-02 (introduced incomplete source reference, actionable): identify exact Council
  source paths/revision and MIT license for the original Council-aligned method;
  keep this distinct from OpenExecutive-derived material.
- CAT-03 (introduced inventory omission, small coverage fix): explicitly classify
  upstream BaseAgent/override plumbing as unported runtime helpers, not agents.
- CAT-04 (pre-existing divergent Council source retained in revised authorities):
  update PRD/TAD current source tables to Council origin/main `bc6d71f`, PRD 0.3;
  preserve proposal/runtime distinctions and avoid claiming installed capability.
- VAL-01 (introduced, actionable): static audit still flags validator branches.
  Replace repeated field comparisons with small data-driven validations; keep
  native schema checks and negative fixtures. No suppression or unrelated cleanup.

Evidence: rerun catalogue/negative checks, profile-to-config comparison, JSON Schema,
existing tests and Fallow at the repository root and the CI package command.

Final assembly results: catalogue/native-schema validation and six negative cases
pass; independent JSON Schema Draft 2020-12 validation passes; all 18 profile/config
reference sets agree; 15 upstream source/destination provenance mappings agree.
The exact package dry-run contains 2 configuration files, 18 AGENTS.md profiles,
8 SKILL.md methods and 2 validation scripts (entry point and schema helper). Existing tests pass 37/37, typecheck/build pass,
and both repository-root static audit and package Fallow verdict pass after the
validator correction (zero complexity findings). The package audit retains only
the pre-existing non-error `tslib` observation. No UI changed.

Independent catalogue review found no further issues outside CAT-01..04, now
addressed. Independent configuration review is recorded below. This report is a
source-checkpoint record; exact-head GitHub review, CI and final merge evidence
are maintained on [PR #6](https://github.com/ty000/paperclip-executive/pull/6),
so pending review at a historical checkpoint must not be read as current PR state.

Correction batch 3 reserves one pass before final validator/formatting edits:

- CFG-VAL-001 / GitHub thread `PRRT_kwDOU0PAhM6nrpF1` (introduced, P2, actionable): the package validator read only schema
  identity while full JSON Schema was checked independently. Add an executable
  dependency-free validator for the shipped schema vocabulary, rejecting unsupported
  constraints; add a discriminating schema-only negative case. Do not add runtime
  code, dependencies or weaken the native checks. Re-run schema and Fallow gates.
- FMT-01 (introduced, advisory): remove surplus EOF blank lines in new assets so
  the base-to-head diff check is clean; refresh affected provenance hashes.

Prior independent reviews confirmed all CAT-01..04 fixes at `4824832`. GitHub
Tests/Fallow CI passed on that head; the initial contextualized review request
was posted at 2026-09-30T19:34:06Z. A revised candidate requires fresh head-bound
review evidence; the prior request cannot stand in for it.

GitHub review `5371094243` on `4824832` independently raised the same missing
schema evaluation (thread `PRRT_kwDOU0PAhM6nrpF1`, comment `4148579993`), already
covered by CFG-VAL-001 in correction batch 3. It is one causal fix, not an extra
correction cycle. The schema helper evaluates only the shipped vocabulary and
rejects unsupported keywords; it is not advertised as a general JSON Schema
implementation. Final review results and thread resolution are recorded on PR #6.

Correction batch 4 reserves one pass for CFG-VAL-002 (introduced, P2): the bounded
schema evaluator rejected unknown keyword names but not unsupported keyword value
forms. A boolean property schema or schema-valued additionalProperties could be
ignored. Add fail-closed schema-shape preflight and discriminating negative cases.

Repeated-category sweep: cover every supported schema keyword and value shape,
local reference rules and reference siblings, scalar equality/array uniqueness
limits, invalid schema nodes and malformed patterns. Reject unsupported forms
rather than silently generalizing the helper. Preserve native Zod checks and
actual catalogue validation. No dependency or runtime expansion. Review ROI: one
shared-schema correctness issue remains; finish this bounded sweep before another
GitHub review request. The previous head is not merge-ready.

Final bounded-schema sweep: the independent reviewer closed CFG-VAL-002 with
no remaining P0/P1/P2 on configuration/schema correctness. A positive schema
exercises the supported vocabulary; 34 negative schema-shape cases plus the
actual catalogue's schema-only drift case pass alongside the six native/catalogue
negative cases. `pnpm test` (37 existing tests plus actual catalogue/schema checks),
independent Draft 2020-12 validation, base-to-candidate diff check and Fallow pass.
The new helper and entry point are both packaged. Catalogue/profile review fixes
remain intact; formatting changes are semantic no-ops with refreshed hashes.
No further local correction is required at this checkpoint.
