-- ============================================
-- Migration: Viewer Suggestions System
-- ============================================

CREATE TABLE IF NOT EXISTS suggestions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  line_id       BIGINT NOT NULL REFERENCES lines(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  suggested_content TEXT NOT NULL,
  original_content  TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by   UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  review_note   TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  reviewed_at   TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_suggestions_line_id ON suggestions (line_id);
CREATE INDEX IF NOT EXISTS idx_suggestions_status ON suggestions (status);
CREATE INDEX IF NOT EXISTS idx_suggestions_user_id ON suggestions (user_id);

-- RLS
ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;

-- Users can read their own suggestions
CREATE POLICY "Users can read own suggestions"
  ON suggestions FOR SELECT
  USING (auth.uid() = user_id);

-- Moderators/admins/superadmins can read suggestions for review
CREATE POLICY "Reviewers can read all suggestions"
  ON suggestions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('superadmin', 'admin', 'moderator')
    )
  );

-- Logged-in users can insert (their own)
CREATE POLICY "Logged-in users can suggest"
  ON suggestions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only admins/moderators can update (for review)
CREATE POLICY "Reviewers can update suggestions"
  ON suggestions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('superadmin', 'admin', 'moderator')
    )
  );
