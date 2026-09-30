---
name: paperclip-executive.implementation-execution
description: Execute a bounded prepared software ticket and hand off an identified candidate for independent review.
version: 1.0.0
owner: paperclip-executive
source: paperclip-council-executor-boundary
---

# Bounded implementation execution

- Version: `1.0.0`
- Owner: Paperclip Executive
- Source: new Paperclip-native method aligned with Council executor separation.

## Trigger and input

Use only for an assigned prepared ticket with objective, criteria, exclusions, dependencies, writable scope, validation commands, and escalation route.

## Procedure

1. Verify repository identity, candidate base, allowed files, and existing changes.
2. Implement the smallest coherent change satisfying the criteria.
3. Run proportionate checks and preserve exact failures and skipped checks.
4. Produce an identified candidate with diff summary, evidence, assumptions, and unresolved risks.
5. Hand off to a distinct reviewer; after correction, report the new candidate identity and affected evidence.

## Stop

Stop on ambiguous write scope, missing dependency, destructive action, unavailable required evidence, or requested acceptance. Never self-accept, emit a Council verdict, broaden product scope, deploy, spend, or create agents.

