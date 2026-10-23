CREATE TABLE work_entries (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  work_date DATE NOT NULL,
  start_time TEXT,
  end_time TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'Development',
  status TEXT NOT NULL DEFAULT 'In Progress',
  priority TEXT NOT NULL DEFAULT 'Medium',
  description TEXT NOT NULL DEFAULT '',
  project_name TEXT NOT NULL DEFAULT '',
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  technologies_used TEXT NOT NULL DEFAULT '',
  challenges_faced TEXT NOT NULL DEFAULT '',
  solution_outcome TEXT NOT NULL DEFAULT '',
  additional_notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_work_entries_user_date ON work_entries(user_id, work_date DESC, created_at DESC);
CREATE TABLE user_profiles (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL DEFAULT '',
  role_label TEXT NOT NULL DEFAULT 'Personal workspace',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);