CREATE TABLE plugin_executive_6aeed6300d.prepared_ticket_contributions (
  company_id uuid NOT NULL,
  contribution_id uuid NOT NULL,
  request_key text NOT NULL,
  author_user_id text NOT NULL,
  input_hash text NOT NULL,
  input_version integer NOT NULL DEFAULT 1 CHECK (input_version > 0),
  issue_snapshot jsonb NOT NULL,
  source_snapshot jsonb NOT NULL,
  approach_snapshot jsonb NOT NULL,
  contributor_snapshot jsonb NOT NULL,
  method_snapshot jsonb NOT NULL,
  session_id uuid,
  run_id uuid,
  status text NOT NULL CHECK (status IN ('prepared', 'dispatching', 'running', 'completed', 'failed', 'outcome_unknown')),
  result jsonb,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (company_id, contribution_id),
  UNIQUE (company_id, request_key)
);

CREATE INDEX prepared_ticket_contributions_company_created_idx
  ON plugin_executive_6aeed6300d.prepared_ticket_contributions (company_id, created_at DESC);
