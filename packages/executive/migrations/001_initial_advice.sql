CREATE TABLE plugin_executive_6aeed6300d.company_settings (
  company_id uuid PRIMARY KEY,
  owner_user_id text NOT NULL,
  executive_agent_id uuid NOT NULL,
  revision integer NOT NULL DEFAULT 1 CHECK (revision > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE plugin_executive_6aeed6300d.advice_contexts (
  company_id uuid NOT NULL,
  context_id uuid NOT NULL,
  request_key text NOT NULL,
  author_user_id text NOT NULL,
  question text NOT NULL,
  context_text text NOT NULL DEFAULT '',
  input_hash text NOT NULL,
  revision integer NOT NULL DEFAULT 1 CHECK (revision > 0),
  session_id uuid,
  run_id uuid,
  status text NOT NULL CHECK (status IN ('pending', 'dispatching', 'running', 'completed', 'failed', 'outcome_unknown')),
  result jsonb,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (company_id, context_id),
  UNIQUE (company_id, request_key)
);

CREATE INDEX advice_contexts_company_created_idx
  ON plugin_executive_6aeed6300d.advice_contexts (company_id, created_at DESC);
