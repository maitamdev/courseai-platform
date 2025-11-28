-- =============================================
-- EVENTS & COMPETITION SYSTEM
-- =============================================

-- 1. Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  event_type VARCHAR(50) NOT NULL DEFAULT 'quiz', -- quiz, coding, mixed
  status VARCHAR(20) DEFAULT 'upcoming', -- upcoming, active, ended
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  max_participants INTEGER,
  rewards JSONB DEFAULT '{"1": 500, "2": 300, "3": 100}', -- top 3 rewards in coins
  banner_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Event questions
CREATE TABLE IF NOT EXISTS event_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  question_type VARCHAR(20) DEFAULT 'multiple_choice', -- multiple_choice, coding, true_false
  question TEXT NOT NULL,
  options JSONB, -- for multiple choice: ["A", "B", "C", "D"]
  correct_answer TEXT NOT NULL,
  code_template TEXT, -- for coding questions
  test_cases JSONB, -- for coding: [{"input": "...", "expected": "..."}]
  points INTEGER DEFAULT 10,
  time_limit_seconds INTEGER DEFAULT 60,
  order_index INTEGER DEFAULT 0
);

-- 3. Event participants
CREATE TABLE IF NOT EXISTS event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  total_answers INTEGER DEFAULT 0,
  time_taken_seconds INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  rank INTEGER,
  reward_claimed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- 4. Event answers (track each answer)
CREATE TABLE IF NOT EXISTS event_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES event_questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  answer TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  points_earned INTEGER DEFAULT 0,
  time_taken_seconds INTEGER DEFAULT 0,
  answered_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, question_id, user_id)
);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_answers ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view events" ON events FOR SELECT USING (true);
CREATE POLICY "Anyone can insert events" ON events FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Creator can update events" ON events FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Creator can delete events" ON events FOR DELETE USING (auth.uid() = created_by);

CREATE POLICY "View questions of active/ended events" ON event_questions FOR SELECT 
  USING (event_id IN (SELECT id FROM events WHERE status IN ('active', 'ended')));

CREATE POLICY "Anyone can view participants" ON event_participants FOR SELECT USING (true);
CREATE POLICY "Users can join events" ON event_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own participation" ON event_participants FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own answers" ON event_answers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can submit answers" ON event_answers FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Functions
CREATE OR REPLACE FUNCTION join_event(p_event_id UUID)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO event_participants (event_id, user_id, started_at)
  VALUES (p_event_id, auth.uid(), now())
  ON CONFLICT (event_id, user_id) DO UPDATE SET started_at = COALESCE(event_participants.started_at, now())
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION submit_event_answer(
  p_event_id UUID,
  p_question_id UUID,
  p_answer TEXT,
  p_time_taken INTEGER
)
RETURNS JSONB AS $$
DECLARE
  v_correct_answer TEXT;
  v_points INTEGER;
  v_is_correct BOOLEAN;
  v_points_earned INTEGER := 0;
BEGIN
  -- Get correct answer and points
  SELECT correct_answer, points INTO v_correct_answer, v_points
  FROM event_questions WHERE id = p_question_id;
  
  -- Check if correct
  v_is_correct := (LOWER(TRIM(p_answer)) = LOWER(TRIM(v_correct_answer)));
  IF v_is_correct THEN
    v_points_earned := v_points;
  END IF;
  
  -- Insert answer
  INSERT INTO event_answers (event_id, question_id, user_id, answer, is_correct, points_earned, time_taken_seconds)
  VALUES (p_event_id, p_question_id, auth.uid(), p_answer, v_is_correct, v_points_earned, p_time_taken)
  ON CONFLICT (event_id, question_id, user_id) DO NOTHING;
  
  -- Update participant score
  UPDATE event_participants
  SET score = score + v_points_earned,
      correct_answers = correct_answers + (CASE WHEN v_is_correct THEN 1 ELSE 0 END),
      total_answers = total_answers + 1,
      time_taken_seconds = time_taken_seconds + p_time_taken
  WHERE event_id = p_event_id AND user_id = auth.uid();
  
  RETURN jsonb_build_object('is_correct', v_is_correct, 'points_earned', v_points_earned, 'correct_answer', v_correct_answer);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION finish_event(p_event_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE event_participants
  SET finished_at = now()
  WHERE event_id = p_event_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_event_leaderboard(p_event_id UUID)
RETURNS TABLE (
  rank BIGINT,
  user_id UUID,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  score INTEGER,
  correct_answers INTEGER,
  time_taken_seconds INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ROW_NUMBER() OVER (ORDER BY ep.score DESC, ep.time_taken_seconds ASC) as rank,
    ep.user_id,
    p.username,
    p.full_name,
    p.avatar_url,
    ep.score,
    ep.correct_answers,
    ep.time_taken_seconds
  FROM event_participants ep
  JOIN profiles p ON p.id = ep.user_id
  WHERE ep.event_id = p_event_id AND ep.score > 0
  ORDER BY ep.score DESC, ep.time_taken_seconds ASC
  LIMIT 100;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto update event status
CREATE OR REPLACE FUNCTION update_event_status()
RETURNS void AS $$
BEGIN
  UPDATE events SET status = 'active' WHERE status = 'upcoming' AND start_time <= now() AND end_time > now();
  UPDATE events SET status = 'ended' WHERE status = 'active' AND end_time <= now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sample event for testing
INSERT INTO events (title, description, event_type, status, start_time, end_time, duration_minutes, rewards)
VALUES (
  'Cuộc thi JavaScript Cơ bản',
  'Kiểm tra kiến thức JavaScript của bạn! Top 3 sẽ nhận được phần thưởng hấp dẫn.',
  'quiz',
  'upcoming',
  now() + interval '1 minute',
  now() + interval '1 hour',
  30,
  '{"1": 500, "2": 300, "3": 100}'
);

-- Sample questions
INSERT INTO event_questions (event_id, question, options, correct_answer, points, order_index)
SELECT 
  id,
  'Kết quả của typeof null trong JavaScript là gì?',
  '["undefined", "null", "object", "number"]',
  'object',
  10,
  1
FROM events WHERE title = 'Cuộc thi JavaScript Cơ bản';

INSERT INTO event_questions (event_id, question, options, correct_answer, points, order_index)
SELECT 
  id,
  'Phương thức nào dùng để thêm phần tử vào cuối mảng?',
  '["push()", "pop()", "shift()", "unshift()"]',
  'push()',
  10,
  2
FROM events WHERE title = 'Cuộc thi JavaScript Cơ bản';

INSERT INTO event_questions (event_id, question, options, correct_answer, points, order_index)
SELECT 
  id,
  'let và const khác var ở điểm nào?',
  '["Block scope", "Function scope", "Global scope", "Không khác"]',
  'Block scope',
  10,
  3
FROM events WHERE title = 'Cuộc thi JavaScript Cơ bản';

INSERT INTO event_questions (event_id, question, options, correct_answer, points, order_index)
SELECT 
  id,
  '[] == [] trả về giá trị gì?',
  '["true", "false", "undefined", "error"]',
  'false',
  10,
  4
FROM events WHERE title = 'Cuộc thi JavaScript Cơ bản';

INSERT INTO event_questions (event_id, question, options, correct_answer, points, order_index)
SELECT 
  id,
  'Promise.all() sẽ reject khi nào?',
  '["Khi tất cả promises reject", "Khi có 1 promise reject", "Không bao giờ reject", "Khi timeout"]',
  'Khi có 1 promise reject',
  10,
  5
FROM events WHERE title = 'Cuộc thi JavaScript Cơ bản';
