-- =============================================
-- THÊM CÁC BẢNG CÒN THIẾU
-- =============================================

-- 1. Bảng lessons (legacy - cho Dashboard cũ)
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  lesson_type text DEFAULT 'video',
  video_url text,
  duration integer,
  coins_reward integer DEFAULT 10,
  xp_reward integer DEFAULT 50,
  order_index integer NOT NULL,
  is_locked boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 2. Bảng user_progress
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed boolean DEFAULT false,
  score integer DEFAULT 0,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- 3. Bảng treasures
CREATE TABLE IF NOT EXISTS treasures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  coins_reward integer DEFAULT 100,
  xp_reward integer DEFAULT 200,
  map_x integer NOT NULL,
  map_y integer NOT NULL,
  icon text DEFAULT '💎',
  created_at timestamptz DEFAULT now()
);

-- 4. Bảng found_treasures
CREATE TABLE IF NOT EXISTS found_treasures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  treasure_id uuid NOT NULL REFERENCES treasures(id) ON DELETE CASCADE,
  found_at timestamptz DEFAULT now(),
  UNIQUE(user_id, treasure_id)
);

-- 5. Enable RLS
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE treasures ENABLE ROW LEVEL SECURITY;
ALTER TABLE found_treasures ENABLE ROW LEVEL SECURITY;

-- 6. Tạo policies
DROP POLICY IF EXISTS "Anyone can view lessons" ON lessons;
CREATE POLICY "Anyone can view lessons" ON lessons FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can view own progress" ON user_progress;
CREATE POLICY "Users can view own progress" ON user_progress FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create progress" ON user_progress;
CREATE POLICY "Users can create progress" ON user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own progress" ON user_progress;
CREATE POLICY "Users can update own progress" ON user_progress FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view treasures" ON treasures;
CREATE POLICY "Anyone can view treasures" ON treasures FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can view own found treasures" ON found_treasures;
CREATE POLICY "Users can view own found treasures" ON found_treasures FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create found treasures" ON found_treasures;
CREATE POLICY "Users can create found treasures" ON found_treasures FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 7. Thêm dữ liệu mẫu cho lessons
INSERT INTO lessons (title, description, lesson_type, video_url, duration, coins_reward, xp_reward, order_index, is_locked) VALUES
('Giới thiệu về lập trình', 'Bài học đầu tiên về lập trình cơ bản', 'video', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 600, 10, 50, 1, false),
('Biến và kiểu dữ liệu', 'Học về biến và các kiểu dữ liệu cơ bản', 'video', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 900, 15, 75, 2, false),
('Vòng lặp và điều kiện', 'Cấu trúc điều khiển trong lập trình', 'video', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 1200, 20, 100, 3, false),
('Hàm và tham số', 'Tạo và sử dụng hàm', 'exercise', null, 1800, 25, 125, 4, true),
('Mảng và danh sách', 'Làm việc với cấu trúc dữ liệu', 'video', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 1500, 30, 150, 5, true)
ON CONFLICT DO NOTHING;

-- 8. Thêm dữ liệu mẫu cho treasures
INSERT INTO treasures (title, description, coins_reward, xp_reward, map_x, map_y, icon) VALUES
('Kho báu JavaScript', 'Phát hiện bí mật của JavaScript', 100, 200, 20, 30, '💎'),
('Kho báu Python', 'Khám phá sức mạnh Python', 150, 250, 50, 40, '🏆'),
('Kho báu Java', 'Tìm thấy kho báu Java', 200, 300, 70, 60, '👑'),
('Kho báu C++', 'Chinh phục C++ master', 250, 350, 90, 80, '⭐')
ON CONFLICT DO NOTHING;

SELECT 'Đã thêm các bảng còn thiếu!' AS message;
