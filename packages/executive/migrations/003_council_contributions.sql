CREATE TABLE plugin_executive_6aeed6300d.council_contributions (
  company_id uuid NOT NULL,
  contribution_id uuid NOT NULL,
  reservation_id uuid NOT NULL,
  mission_id uuid NOT NULL,
  slot_id uuid NOT NULL,
  reservation_version integer NOT NULL CHECK (reservation_version > 0),
  trigger_event_id uuid NOT NULL,
  trigger_hash text NOT NULL CHECK (trigger_hash ~ '^[a-f0-9]{64}$'),
  request_id uuid NOT NULL,
  grant_id uuid,
  slot_hash text NOT NULL CHECK (slot_hash ~ '^[a-f0-9]{64}$'),
  slot_snapshot jsonb NOT NULL,
  input_hash text CHECK (input_hash IS NULL OR input_hash ~ '^[a-f0-9]{64}$'),
  profile_snapshot jsonb,
  contributor_snapshot jsonb,
  session_id uuid,
  run_id uuid,
  status text NOT NULL CHECK (status IN (
    'awaiting_grant', 'prepared', 'dispatching', 'running', 'completed', 'failed', 'outcome_unknown'
  )),
  opinion jsonb,
  error text,
  admission_requested_at timestamptz,
  admission_error text,
  observed_event_ref uuid NOT NULL,
  observation_emitted_at timestamptz,
  observation_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (company_id, contribution_id),
  UNIQUE (company_id, reservation_id),
  UNIQUE (company_id, mission_id, slot_id, reservation_version),
  UNIQUE (company_id, request_id),
  UNIQUE (company_id, grant_id),
  UNIQUE (company_id, observed_event_ref),
  CHECK (
    (status = 'awaiting_grant' AND grant_id IS NULL AND input_hash IS NULL AND profile_snapshot IS NULL AND contributor_snapshot IS NULL)
    OR
    (status <> 'awaiting_grant' AND grant_id IS NOT NULL AND input_hash IS NOT NULL AND profile_snapshot IS NOT NULL AND contributor_snapshot IS NOT NULL)
  ),
  CHECK (status <> 'completed' OR (opinion IS NOT NULL AND session_id IS NOT NULL AND run_id IS NOT NULL))
);

CREATE INDEX council_contributions_company_created_idx
  ON plugin_executive_6aeed6300d.council_contributions (company_id, created_at DESC);
