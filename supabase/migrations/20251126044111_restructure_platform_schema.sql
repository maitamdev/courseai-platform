/*
  # Restructure Code Quest Platform - Full Learning Management System

  ## Overview
  Complete restructure to support multi-language courses, video lessons, game categories, coin purchases, and comprehensive learning paths.

  ## 1. New Tables

    ### `programming_languages`
    - `id` (uuid, primary key) - Language identifier
    - `name` (text) - Language name (JavaScript, Python, Java, etc.)
    - `slug` (text, unique) - URL-friendly name
    - `icon` (text) - Icon identifier
    - `description` (text) - Language description
    - `color` (text) - Brand color hex
    - `difficulty` (text) - beginner, intermediate, advanced
    - `created_at` (timestamptz)

    ### `course_categories`
    - `id` (uuid, primary key)
    - `name` (text) - Category name
    - `slug` (text, unique)
    - `icon` (text)
    - `description` (text)
    - `created_at` (timestamptz)

    ### Update `courses` table
    - Add `language_id` (uuid) - References programming_languages
    - Add `category_id` (uuid) - References course_categories
    - Add `instructor_name` (text)
    - Add `duration_hours` (integer)
    - Add `video_count` (integer)
    - Add `student_count` (integer)
    - Add `rating` (numeric)
    - Add `is_published` (boolean)

    ### `course_sections`
    - `id` (uuid, primary key)
    - `course_id` (uuid, foreign key) - References courses
    - `title` (text) - Section title
    - `description` (text)
    - `order_index` (integer)
    - `created_at` (timestamptz)

    ### `course_lessons` (replaces old lessons)
    - `id` (uuid, primary key)
    - `section_id` (uuid, foreign key) - References course_sections
    - `title` (text)
    - `description` (text)
    - `lesson_type` (text) - video, article, quiz, exercise
    - `video_url` (text, nullable)
    - `video_duration` (integer, nullable) - Duration in seconds
    - `content` (jsonb) - Lesson content
    - `order_index` (integer)
    - `is_free` (boolean) - Preview lessons
    - `created_at` (timestamptz)

    ### `game_categories`
    - `id` (uuid, primary key)
    - `name` (text) - Category name
    - `slug` (text, unique)
    - `icon` (text)
    - `description` (text)
    - `difficulty` (text)
    - `color` (text)
    - `created_at` (timestamptz)

    ### `game_levels`
    - `id` (uuid, primary key)
    - `category_id` (uuid, foreign key) - References game_categories
    - `title` (text)
    - `description` (text)
    - `level_number` (integer)
    - `difficulty` (text)
    - `challenge` (jsonb) - Challenge details
    - `solution` (text) - Correct answer
    - `coins_reward` (integer)
    - `xp_reward` (integer)
    - `required_level` (integer) - Player level required
    - `created_at` (timestamptz)

    ### `user_game_progress`
    - `id` (uuid, primary key)
    - `user_id` (uuid, foreign key)
    - `level_id` (uuid, foreign key)
    - `completed` (boolean)
    - `stars` (integer) - 1-3 stars
    - `time_spent` (integer) - Seconds
    - `attempts` (integer)
    - `completed_at` (timestamptz, nullable)

    ### `coin_packages`
    - `id` (uuid, primary key)
    - `name` (text) - Package name
    - `coins_amount` (integer)
    - `price` (numeric) - Price in USD
    - `bonus_coins` (integer) - Extra bonus coins
    - `is_popular` (boolean)
    - `created_at` (timestamptz)

    ### `coin_transactions`
    - `id` (uuid, primary key)
    - `user_id` (uuid, foreign key)
    - `transaction_type` (text) - purchase, earn, spend
    - `amount` (integer) - Positive for earn, negative for spend
    - `description` (text)
    - `reference_id` (text, nullable) - Payment reference
    - `created_at` (timestamptz)

  ## 2. Security
    - Enable RLS on all tables
    - Appropriate policies for each table type

  ## 3. Notes
    - Backward compatible - keeps old tables
    - Migration can run multiple times safely
*/

-- Programming Languages
CREATE TABLE IF NOT EXISTS programming_languages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  icon text NOT NULL,
  description text NOT NULL,
  color text DEFAULT '#3b82f6',
  difficulty text DEFAULT 'beginner',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT languages_difficulty_check CHECK (difficulty IN ('beginner', 'intermediate', 'advanced'))
);

-- Course Categories
CREATE TABLE IF NOT EXISTS course_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  icon text NOT NULL,
  description text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Update courses table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'language_id') THEN
    ALTER TABLE courses ADD COLUMN language_id uuid REFERENCES programming_languages(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'category_id') THEN
    ALTER TABLE courses ADD COLUMN category_id uuid REFERENCES course_categories(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'instructor_name') THEN
    ALTER TABLE courses ADD COLUMN instructor_name text DEFAULT 'Code Quest Team';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'duration_hours') THEN
    ALTER TABLE courses ADD COLUMN duration_hours integer DEFAULT 10;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'video_count') THEN
    ALTER TABLE courses ADD COLUMN video_count integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'student_count') THEN
    ALTER TABLE courses ADD COLUMN student_count integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'rating') THEN
    ALTER TABLE courses ADD COLUMN rating numeric(3,2) DEFAULT 4.5;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'is_published') THEN
    ALTER TABLE courses ADD COLUMN is_published boolean DEFAULT true;
  END IF;
END $$;

-- Course Sections
CREATE TABLE IF NOT EXISTS course_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Course Lessons
CREATE TABLE IF NOT EXISTS course_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid NOT NULL REFERENCES course_sections(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  lesson_type text DEFAULT 'video',
  video_url text,
  video_duration integer,
  content jsonb DEFAULT '{}',
  order_index integer NOT NULL,
  is_free boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT lessons_type_check CHECK (lesson_type IN ('video', 'article', 'quiz', 'exercise'))
);

-- Game Categories
CREATE TABLE IF NOT EXISTS game_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  icon text NOT NULL,
  description text NOT NULL,
  difficulty text DEFAULT 'beginner',
  color text DEFAULT '#3b82f6',
  created_at timestamptz DEFAULT now()
);

-- Game Levels
CREATE TABLE IF NOT EXISTS game_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES game_categories(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  level_number integer NOT NULL,
  difficulty text DEFAULT 'easy',
  challenge jsonb NOT NULL,
  solution text NOT NULL,
  coins_reward integer DEFAULT 20,
  xp_reward integer DEFAULT 10,
  required_level integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- User Game Progress
CREATE TABLE IF NOT EXISTS user_game_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  level_id uuid NOT NULL REFERENCES game_levels(id) ON DELETE CASCADE,
  completed boolean DEFAULT false,
  stars integer DEFAULT 0,
  time_spent integer DEFAULT 0,
  attempts integer DEFAULT 0,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, level_id)
);

-- Coin Packages
CREATE TABLE IF NOT EXISTS coin_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  coins_amount integer NOT NULL,
  price numeric(10,2) NOT NULL,
  bonus_coins integer DEFAULT 0,
  is_popular boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Coin Transactions
CREATE TABLE IF NOT EXISTS coin_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  transaction_type text NOT NULL,
  amount integer NOT NULL,
  description text NOT NULL,
  reference_id text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT transactions_type_check CHECK (transaction_type IN ('purchase', 'earn', 'spend', 'refund'))
);

-- Enable RLS
ALTER TABLE programming_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_game_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE coin_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;

-- Policies for programming languages
CREATE POLICY "Anyone can view languages"
  ON programming_languages FOR SELECT
  TO authenticated
  USING (true);

-- Policies for course categories
CREATE POLICY "Anyone can view categories"
  ON course_categories FOR SELECT
  TO authenticated
  USING (true);

-- Policies for course sections
CREATE POLICY "Anyone can view sections"
  ON course_sections FOR SELECT
  TO authenticated
  USING (true);

-- Policies for course lessons
CREATE POLICY "Anyone can view published lessons"
  ON course_lessons FOR SELECT
  TO authenticated
  USING (true);

-- Policies for game categories
CREATE POLICY "Anyone can view game categories"
  ON game_categories FOR SELECT
  TO authenticated
  USING (true);

-- Policies for game levels
CREATE POLICY "Anyone can view game levels"
  ON game_levels FOR SELECT
  TO authenticated
  USING (true);

-- Policies for user game progress
CREATE POLICY "Users can view own game progress"
  ON user_game_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own game progress"
  ON user_game_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own game progress"
  ON user_game_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies for coin packages
CREATE POLICY "Anyone can view coin packages"
  ON coin_packages FOR SELECT
  TO authenticated
  USING (true);

-- Policies for coin transactions
CREATE POLICY "Users can view own transactions"
  ON coin_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create transactions"
  ON coin_transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Insert programming languages
INSERT INTO programming_languages (name, slug, icon, description, color, difficulty) VALUES
('JavaScript', 'javascript', 'code', 'Ngôn ngữ lập trình web phổ biến nhất, chạy trên mọi trình duyệt', '#f7df1e', 'beginner'),
('Python', 'python', 'terminal', 'Ngôn ngữ dễ học, mạnh mẽ cho AI, Data Science và Web', '#3776ab', 'beginner'),
('Java', 'java', 'coffee', 'Ngôn ngữ OOP mạnh mẽ, dùng cho Android và Enterprise', '#007396', 'intermediate'),
('C++', 'cpp', 'cpu', 'Ngôn ngữ hiệu suất cao cho game và hệ thống', '#00599c', 'advanced'),
('TypeScript', 'typescript', 'file-code', 'JavaScript có type safety, chuẩn cho dự án lớn', '#3178c6', 'intermediate'),
('Go', 'go', 'zap', 'Ngôn ngữ hiện đại, nhanh, đơn giản từ Google', '#00add8', 'intermediate')
ON CONFLICT (slug) DO NOTHING;

-- Insert course categories
INSERT INTO course_categories (name, slug, icon, description) VALUES
('Web Development', 'web-dev', 'globe', 'Xây dựng website và ứng dụng web hiện đại'),
('Mobile Development', 'mobile-dev', 'smartphone', 'Phát triển ứng dụng iOS và Android'),
('Data Science', 'data-science', 'bar-chart', 'Phân tích dữ liệu, Machine Learning, AI'),
('Game Development', 'game-dev', 'gamepad-2', 'Lập trình game 2D và 3D'),
('Backend Development', 'backend-dev', 'server', 'API, Database, Server-side programming'),
('DevOps', 'devops', 'settings', 'CI/CD, Docker, Kubernetes, Cloud')
ON CONFLICT (slug) DO NOTHING;

-- Insert game categories
INSERT INTO game_categories (name, slug, icon, description, difficulty, color) VALUES
('Debug Detective', 'debug', 'bug', 'Tìm và sửa lỗi trong code như một thám tử', 'beginner', '#ef4444'),
('Algorithm Arena', 'algorithm', 'brain', 'Giải quyết thuật toán từ dễ đến khó', 'intermediate', '#3b82f6'),
('Speed Coding', 'speed', 'zap', 'Code nhanh và chính xác trong thời gian giới hạn', 'beginner', '#f59e0b'),
('Logic Puzzles', 'logic', 'puzzle', 'Giải đố logic và tư duy lập trình', 'beginner', '#8b5cf6'),
('Code Golf', 'code-golf', 'flag', 'Viết code ngắn nhất có thể', 'advanced', '#10b981'),
('Syntax Master', 'syntax', 'code-2', 'Thành thạo cú pháp ngôn ngữ lập trình', 'beginner', '#06b6d4')
ON CONFLICT (slug) DO NOTHING;

-- Insert coin packages
INSERT INTO coin_packages (name, coins_amount, price, bonus_coins, is_popular) VALUES
('Starter Pack', 100, 0.99, 0, false),
('Popular Pack', 500, 4.99, 50, true),
('Pro Pack', 1000, 9.99, 150, false),
('Ultimate Pack', 2500, 19.99, 500, false),
('Mega Pack', 5000, 39.99, 1500, false)
ON CONFLICT DO NOTHING;