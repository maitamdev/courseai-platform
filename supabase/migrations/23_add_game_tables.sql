-- Add missing game tables

-- Game Categories table
CREATE TABLE IF NOT EXISTS game_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Game Progress table
CREATE TABLE IF NOT EXISTS user_game_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  game_id VARCHAR(100) NOT NULL,
  level INTEGER DEFAULT 1,
  score INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  stars INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, game_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_game_progress_user ON user_game_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_game_progress_game ON user_game_progress(game_id);

-- RLS
ALTER TABLE game_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_game_progress ENABLE ROW LEVEL SECURITY;

-- Policies for game_categories (public read)
CREATE POLICY "Anyone can view game categories"
  ON game_categories FOR SELECT
  USING (true);

-- Policies for user_game_progress
CREATE POLICY "Users can view own progress"
  ON user_game_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_game_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_game_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT ON game_categories TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE ON user_game_progress TO authenticated;

-- Insert default game categories
INSERT INTO game_categories (name, description, icon, color) VALUES
  ('Logic', 'Các trò chơi rèn luyện tư duy logic', 'Brain', 'blue'),
  ('Coding', 'Học lập trình qua trò chơi', 'Code', 'green'),
  ('Math', 'Toán học vui nhộn', 'Calculator', 'purple'),
  ('Puzzle', 'Giải đố thử thách', 'Puzzle', 'orange'),
  ('Memory', 'Rèn luyện trí nhớ', 'Lightbulb', 'yellow'),
  ('Speed', 'Thử thách tốc độ', 'Zap', 'red')
ON CONFLICT DO NOTHING;
