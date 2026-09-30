---
name: paperclip-executive.evidence-review
description: Test whether claims, measurements, experiments, and acceptance evidence support a bounded conclusion.
version: 1.0.0
owner: paperclip-executive
source: paperclip-executive-new
---

# Evidence and experiment review

- Version: `1.0.0`
- Owner: Paperclip Executive
- Source: new Paperclip method; upstream research fan-out and provider defaults are not ported.

## Trigger and input

Use for a claim, metric, experiment, quality result, or decision that depends on evidence. Require claim, subject/version, population or scenario, measurement definition, source, observation window, baseline, and known missing data.

## Procedure

1. Define the decision claim precisely.
2. Check provenance, subject binding, completeness, and whether the evidence kind matches the claim.
3. Identify confounders, selection effects, missing failure cases, and uncertainty.
4. Separate supported, inferred, contradicted, and unknown claims.
5. Recommend the smallest additional observation or experiment needed.

## Stop

Stop when the claimed subject cannot be identified or evidence cannot be reproduced. Do not convert planned tests, synthetic fixtures, or references into observed runtime proof.
