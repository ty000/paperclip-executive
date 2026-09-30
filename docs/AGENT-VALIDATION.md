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

Global correction/reslice bound: **5** (owner supplied). Remaining: **3**.
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
8 SKILL.md methods and 1 validator. Existing tests pass 37/37, typecheck/build pass,
and both repository-root static audit and package Fallow verdict pass after the
validator correction (zero complexity findings). The package audit retains only
the pre-existing non-error `tslib` observation. No UI changed.

Independent catalogue review found no further issues outside CAT-01..04, now
addressed. Final configuration review and exact-head GitHub review are pending.
