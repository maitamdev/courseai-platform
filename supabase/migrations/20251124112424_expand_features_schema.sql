/*
  # Expand Code Quest Platform Features

  ## Overview
  Adds shop system, roadmap tracking, achievements/badges, daily quests, AI chat history, and map-based treasure locations.

  ## 1. New Tables
    
    ### `courses`
    - `id` (uuid, primary key) - Course identifier
    - `title` (text) - Course title
    - `description` (text) - Course description
    - `level` (text) - beginner, intermediate, advanced
    - `price` (integer) - Cost in coins
    - `thumbnail_url` (text, nullable) - Course image
    - `lessons_count` (integer) - Number of lessons
    - `created_at` (timestamptz) - Creation time
    
    ### `purchased_courses`
    - `id` (uuid, primary key)
    - `user_id` (uuid, foreign key) - References profiles
    - `course_id` (uuid, foreign key) - References courses
    - `purchased_at` (timestamptz) - Purchase time
    - Unique constraint on user_id + course_id
    
    ### `badges`
    - `id` (uuid, primary key)
    - `name` (text) - Badge name
    - `description` (text) - How to earn it
    - `icon` (text) - Icon identifier
    - `requirement_type` (text) - lessons_completed, treasures_found, xp_reached
    - `requirement_value` (integer) - Threshold to earn
    - `created_at` (timestamptz)
    
    ### `user_badges`
    - `id` (uuid, primary key)
    - `user_id` (uuid, foreign key) - References profiles
    - `badge_id` (uuid, foreign key) - References badges
    - `earned_at` (timestamptz) - When earned
    - Unique constraint on user_id + badge_id
    
    ### `daily_quests`
    - `id` (uuid, primary key)
    - `title` (text) - Quest title
    - `description` (text) - What to do
    - `quest_type` (text) - complete_lessons, find_treasures, earn_xp
    - `target_value` (integer) - Goal amount
    - `xp_reward` (integer) - XP reward
    - `coins_reward` (integer) - Coins reward
    - `is_active` (boolean) - Currently available
    - `created_at` (timestamptz)
    
    ### `user_daily_progress`
    - `id` (uuid, primary key)
    - `user_id` (uuid, foreign key) - References profiles
    - `quest_id` (uuid, foreign key) - References daily_quests
    - `current_value` (integer) - Current progress
    - `completed` (boolean) - Quest completed today
    - `date` (date) - Which day
    - Unique constraint on user_id + quest_id + date
    
    ### `ai_conversations`
    - `id` (uuid, primary key)
    - `user_id` (uuid, foreign key) - References profiles
    - `message` (text) - User question
    - `response` (text) - AI response
    - `context` (text, nullable) - Related lesson/treasure ID
    - `created_at` (timestamptz)
    
    ### `roadmap_steps`
    - `id` (uuid, primary key)
    - `title` (text) - Step title
    - `description` (text) - Step description
    - `order_index` (integer) - Display order
    - `lesson_ids` (jsonb) - Array of lesson IDs for this step
    - `required_previous` (uuid, nullable) - Must complete this step first
    - `created_at` (timestamptz)
    
    ### `user_roadmap_progress`
    - `id` (uuid, primary key)
    - `user_id` (uuid, foreign key) - References profiles
    - `step_id` (uuid, foreign key) - References roadmap_steps
    - `completed` (boolean) - Step completed
    - `completed_at` (timestamptz, nullable)
    - Unique constraint on user_id + step_id

  ## 2. Table Updates
    
    ### Update `profiles` table
    - Add `xp` (integer) - Experience points
    - Add `avatar_icon` (text) - Icon identifier for avatar
    
    ### Update `treasures` table
    - Add `map_x` (integer) - X position on map
    - `map_y` (integer) - Y position on map
    - `location_name` (text) - Area name
    - `unlocked_by_lesson` (uuid, nullable) - Lesson that unlocks it

  ## 3. Security
    - Enable RLS on all new tables
    - Users can only access their own data
    - All users can read courses, badges, quests, roadmap
    - Only authenticated users can make purchases and progress
*/

-- Add XP and avatar to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'xp'
  ) THEN
    ALTER TABLE profiles ADD COLUMN xp integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'avatar_icon'
  ) THEN
    ALTER TABLE profiles ADD COLUMN avatar_icon text DEFAULT 'user';
  END IF;
END $$;

-- Add map location to treasures
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'treasures' AND column_name = 'map_x'
  ) THEN
    ALTER TABLE treasures ADD COLUMN map_x integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'treasures' AND column_name = 'map_y'
  ) THEN
    ALTER TABLE treasures ADD COLUMN map_y integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'treasures' AND column_name = 'location_name'
  ) THEN
    ALTER TABLE treasures ADD COLUMN location_name text DEFAULT 'Đảo Bí Ẩn';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'treasures' AND column_name = 'unlocked_by_lesson'
  ) THEN
    ALTER TABLE treasures ADD COLUMN unlocked_by_lesson uuid REFERENCES lessons(id);
  END IF;
END $$;

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  level text NOT NULL DEFAULT 'beginner',
  price integer DEFAULT 100,
  thumbnail_url text,
  lessons_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT courses_level_check CHECK (level IN ('beginner', 'intermediate', 'advanced'))
);

-- Create purchased courses table
CREATE TABLE IF NOT EXISTS purchased_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  purchased_at timestamptz DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Create badges table
CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  requirement_type text NOT NULL,
  requirement_value integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT badges_requirement_check CHECK (requirement_type IN ('lessons_completed', 'treasures_found', 'xp_reached', 'courses_purchased'))
);

-- Create user badges table
CREATE TABLE IF NOT EXISTS user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id uuid NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Create daily quests table
CREATE TABLE IF NOT EXISTS daily_quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  quest_type text NOT NULL,
  target_value integer NOT NULL,
  xp_reward integer DEFAULT 50,
  coins_reward integer DEFAULT 25,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT quests_type_check CHECK (quest_type IN ('complete_lessons', 'find_treasures', 'earn_xp', 'purchase_course'))
);

-- Create user daily progress table
CREATE TABLE IF NOT EXISTS user_daily_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quest_id uuid NOT NULL REFERENCES daily_quests(id) ON DELETE CASCADE,
  current_value integer DEFAULT 0,
  completed boolean DEFAULT false,
  date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, quest_id, date)
);

-- Create AI conversations table
CREATE TABLE IF NOT EXISTS ai_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message text NOT NULL,
  response text NOT NULL,
  context text,
  created_at timestamptz DEFAULT now()
);

-- Create roadmap steps table
CREATE TABLE IF NOT EXISTS roadmap_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  order_index integer NOT NULL,
  lesson_ids jsonb DEFAULT '[]',
  required_previous uuid REFERENCES roadmap_steps(id),
  created_at timestamptz DEFAULT now()
);

-- Create user roadmap progress table
CREATE TABLE IF NOT EXISTS user_roadmap_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  step_id uuid NOT NULL REFERENCES roadmap_steps(id) ON DELETE CASCADE,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  UNIQUE(user_id, step_id)
);

-- Enable RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchased_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_daily_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roadmap_progress ENABLE ROW LEVEL SECURITY;

-- Courses policies
CREATE POLICY "Anyone can view courses"
  ON courses FOR SELECT
  TO authenticated
  USING (true);

-- Purchased courses policies
CREATE POLICY "Users can view own purchases"
  ON purchased_courses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can purchase courses"
  ON purchased_courses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Badges policies
CREATE POLICY "Anyone can view badges"
  ON badges FOR SELECT
  TO authenticated
  USING (true);

-- User badges policies
CREATE POLICY "Users can view own badges"
  ON user_badges FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can earn badges"
  ON user_badges FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Daily quests policies
CREATE POLICY "Anyone can view active quests"
  ON daily_quests FOR SELECT
  TO authenticated
  USING (is_active = true);

-- User daily progress policies
CREATE POLICY "Users can view own progress"
  ON user_daily_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_daily_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can modify own progress"
  ON user_daily_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- AI conversations policies
CREATE POLICY "Users can view own conversations"
  ON ai_conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create conversations"
  ON ai_conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Roadmap policies
CREATE POLICY "Anyone can view roadmap"
  ON roadmap_steps FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view own roadmap progress"
  ON user_roadmap_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own roadmap progress"
  ON user_roadmap_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can modify roadmap progress"
  ON user_roadmap_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Insert sample courses
INSERT INTO courses (title, description, level, price, lessons_count) VALUES
('JavaScript Fundamentals Pro', 'Khóa học chuyên sâu về JavaScript từ cơ bản đến nâng cao với 20+ bài học thực hành', 'beginner', 150, 20),
('Web Development Bootcamp', 'Xây dựng website hoàn chỉnh với HTML, CSS, JavaScript và React', 'intermediate', 300, 35),
('Data Structures & Algorithms', 'Học cấu trúc dữ liệu và thuật toán để ace coding interviews', 'advanced', 500, 40),
('Python cho Người Mới', 'Bắt đầu lập trình với Python - ngôn ngữ thân thiện nhất', 'beginner', 120, 18),
('React Masterclass', 'Trở thành chuyên gia React với hooks, context, và best practices', 'intermediate', 400, 30),
('Full-Stack Developer Path', 'Lộ trình đầy đủ từ frontend đến backend, database và deploy', 'advanced', 800, 60);

-- Insert badges
INSERT INTO badges (name, description, icon, requirement_type, requirement_value) VALUES
('Người Mới Bắt Đầu', 'Hoàn thành bài học đầu tiên', 'star', 'lessons_completed', 1),
('Học Sinh Chăm Chỉ', 'Hoàn thành 5 bài học', 'book', 'lessons_completed', 5),
('Bậc Thầy Code', 'Hoàn thành tất cả bài học cơ bản', 'graduation-cap', 'lessons_completed', 10),
('Thợ Săn Kho Báu', 'Tìm thấy kho báu đầu tiên', 'map', 'treasures_found', 1),
('Vua Kho Báu', 'Tìm thấy tất cả kho báu', 'crown', 'treasures_found', 5),
('Chiến Binh 100 XP', 'Đạt 100 điểm kinh nghiệm', 'zap', 'xp_reached', 100),
('Huyền Thoại 500 XP', 'Đạt 500 điểm kinh nghiệm', 'trophy', 'xp_reached', 500),
('Người Ủng Hộ', 'Mua khóa học đầu tiên', 'shopping-bag', 'courses_purchased', 1);

-- Insert daily quests
INSERT INTO daily_quests (title, description, quest_type, target_value, xp_reward, coins_reward, is_active) VALUES
('Học Tập Hàng Ngày', 'Hoàn thành 2 bài học hôm nay', 'complete_lessons', 2, 50, 30, true),
('Thám Hiểm Kho Báu', 'Tìm 1 kho báu hôm nay', 'find_treasures', 1, 75, 50, true),
('Tích Lũy Kinh Nghiệm', 'Kiếm được 100 XP hôm nay', 'earn_xp', 100, 30, 20, true);

-- Insert more lessons
INSERT INTO lessons (title, description, difficulty, content, order_index, coins_reward) VALUES
(
  'Array Methods',
  'Học các phương thức quan trọng của mảng: map, filter, reduce',
  'intermediate',
  '{"theory": "Array methods giúp xử lý dữ liệu mảng hiệu quả.", "example": "const numbers = [1,2,3,4,5];\nconst doubled = numbers.map(n => n * 2);\n// [2,4,6,8,10]", "challenge": "Dùng filter để lọc số chẵn từ mảng [1,2,3,4,5,6]"}'::jsonb,
  6,
  35
),
(
  'Promises & Async',
  'Học lập trình bất đồng bộ với Promise và async/await',
  'advanced',
  '{"theory": "Promise xử lý tác vụ bất đồng bộ như gọi API.", "example": "async function getData() {\n  const data = await fetch(url);\n  return data.json();\n}", "challenge": "Tạo Promise trả về ''success'' sau 1 giây"}'::jsonb,
  7,
  40
),
(
  'DOM Manipulation',
  'Thao tác với HTML DOM bằng JavaScript',
  'intermediate',
  '{"theory": "DOM là cây cấu trúc HTML, JS có thể thay đổi nó.", "example": "document.getElementById(''myDiv'').textContent = ''Hello'';", "challenge": "Viết code thay đổi màu nền của body"}'::jsonb,
  8,
  30
);

-- Insert roadmap steps
INSERT INTO roadmap_steps (title, description, order_index, lesson_ids) VALUES
('Khởi Động', 'Bắt đầu hành trình lập trình với những kiến thức nền tảng', 1, '[]'),
('Nền Tảng Cơ Bản', 'Học về biến, kiểu dữ liệu và toán tử', 2, '[]'),
('Luồng Điều Khiển', 'Thành thạo câu lệnh điều kiện và vòng lặp', 3, '[]'),
('Hàm & Tư Duy', 'Viết hàm và tổ chức code hiệu quả', 4, '[]'),
('Cấu Trúc Dữ Liệu', 'Làm việc với mảng và object', 5, '[]'),
('Lập Trình Nâng Cao', 'Promise, async/await và DOM manipulation', 6, '[]');

-- Update treasure locations for map
UPDATE treasures SET 
  map_x = 150, 
  map_y = 200,
  location_name = 'Đảo Khởi Đầu'
WHERE title = 'Kho Báu JavaScript';

UPDATE treasures SET 
  map_x = 300,
  map_y = 250,
  location_name = 'Rừng Vòng Lặp'
WHERE title = 'Viên Kim Cương Code';

UPDATE treasures SET 
  map_x = 450,
  map_y = 180,
  location_name = 'Hang Hàm Số'
WHERE title = 'Rương Vàng Function';

UPDATE treasures SET 
  map_x = 550,
  map_y = 300,
  location_name = 'Đảo Mảng'
WHERE title = 'Bảo Vật Array';

UPDATE treasures SET 
  map_x = 700,
  map_y = 150,
  location_name = 'Đỉnh Cao Thủ'
WHERE title = 'Kho Báu Tối Thượng';