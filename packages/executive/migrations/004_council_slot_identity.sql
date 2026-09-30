-- Council slot identities are bounded strings, not native UUID entity IDs.
-- Widening preserves every existing UUID value and the unique admission keys.
ALTER TABLE plugin_executive_6aeed6300d.council_contributions
  ALTER COLUMN slot_id TYPE text USING slot_id::text;
