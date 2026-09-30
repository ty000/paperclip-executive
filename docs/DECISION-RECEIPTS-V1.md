# Executive alignment — V1 decision receipts

Date: 2026-09-30. Status: **accepted product rescope; implementation and qualification remain open**.

This record aligns Executive's active prescriptions with the accepted Council V1
decision-receipt contract. For V1, mandatory Paperclip host API changes and automatic
recovery of ambiguous native effects are replaced by a Council-owned persistent
receipt around the existing public issue PATCH. This decision supersedes those active
prescriptions; it does not rewrite the dated findings in
[L03-CONTRACT-AUDIT.md](L03-CONTRACT-AUDIT.md) or claim that Council runtime is tested,
installed, published, deployed or active.

Before a possible send, Council must persist the operation identity, exact target and
content, and server-derived actor/run, then atomically claim one attempt. An identical
operation/content replay returns the stored observation; conflicting content is
rejected. A lost, malformed or ambiguous response, interruption, or HTTP error that
does not prove absence of effect leaves a durable indeterminate observation. Restart,
a new operation key, or altered content cannot authorize another send for the same
company/issue while uncertainty remains.

Council preserves every native status, response and reference actually observed and
keeps local intent, possible send, usable native response and downstream execution
distinct. A native issue status, comment, summary or persisted decision alone does not
prove the intended effect or a subsequent run. The contract makes no exactly-once
claim.

Only an authenticated owner may record acknowledgement or abandonment. That audited
human disposition is separate from the native observation: it is not native success
and does not clear the uncertainty barrier or unlock dependent work. The operator view
must retain issue, operation, verdict, observation, blocking reason, disposition and
next owner action across restart.

The rescope changes L03-A5, Q6 and dependency D-H for V1. It preserves L03-A1
authority/binding, A2 distinct approach direction and revision semantics, A3 exact
subject/evidence, A4 bounded correction, A6 shared persistent limits, A7 distinct
attributed opinions and A8 operator visibility. D-LIMIT, D-C and overall L03 remain
open. Later host readback may improve evidence, but is not a V1 dependency and cannot
retroactively convert an indeterminate receipt into proven native success without
matching evidence.
