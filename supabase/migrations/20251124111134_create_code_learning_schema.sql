/*
  # Code Learning & Treasure Hunt Platform Schema

  ## Overview
  A platform combining interactive coding lessons with a treasure hunt game to make learning programming fun and engaging.

  ## 1. New Tables
    
    ### `profiles`
    - `id` (uuid, primary key) - User ID from auth.users
    - `username` (text, unique) - Display name
    - `avatar_url` (text, nullable) - Profile picture
    - `total_coins` (integer) - Virtual currency earned
    - `level` (integer) - User level based on progress
    - `created_at` (timestamptz) - Account creation time
    - `updated_at` (timestamptz) - Last update time
    
    ### `lessons`
    - `id` (uuid, primary key) - Lesson identifier
    - `title` (text) - Lesson title
    - `description` (text) - What the lesson teaches
    - `difficulty` (text) - beginner, intermediate, advanced
    - `content` (jsonb) - Lesson content with code examples
    - `order_index` (integer) - Display order
    - `coins_reward` (integer) - Coins earned on completion
    - `created_at` (timestamptz) - Creation time
    
    ### `user_progress`
    - `id` (uuid, primary key)
    - `user_id` (uuid, foreign key) - References profiles
    - `lesson_id` (uuid, foreign key) - References lessons
    - `completed` (boolean) - Completion status
    - `code_solution` (text, nullable) - User's code solution
    - `completed_at` (timestamptz, nullable) - Completion time
    - `created_at` (timestamptz) - First attempt time
    
    ### `treasures`
    - `id` (uuid, primary key)
    - `title` (text) - Treasure name
    - `description` (text) - Treasure description
    - `riddle` (text) - Clue to find the treasure
    - `answer` (text) - Correct answer (case-insensitive)
    - `coins_reward` (integer) - Coins for finding it
    - `difficulty` (text) - easy, medium, hard
    - `icon` (text) - Icon identifier
    - `created_at` (timestamptz)
    
    ### `found_treasures`
    - `id` (uuid, primary key)
    - `user_id` (uuid, foreign key) - References profiles
    - `treasure_id` (uuid, foreign key) - References treasures
    - `found_at` (timestamptz) - When found
    
  ## 2. Security
    - Enable RLS on all tables
    - Users can read their own profile and update their own data
    - All users can read lessons and treasures
    - Users can only manage their own progress and found treasures
    - Only authenticated users can participate
    
  ## 3. Important Notes
    - Uses JSONB for flexible lesson content structure
    - Coins system for gamification
    - Unique constraints prevent duplicate progress/treasure finds
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  avatar_url text,
  total_coins integer DEFAULT 0,
  level integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  difficulty text NOT NULL DEFAULT 'beginner',
  content jsonb NOT NULL DEFAULT '{}',
  order_index integer NOT NULL,
  coins_reward integer DEFAULT 10,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT difficulty_check CHECK (difficulty IN ('beginner', 'intermediate', 'advanced'))
);

-- Create user progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed boolean DEFAULT false,
  code_solution text,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Create treasures table
CREATE TABLE IF NOT EXISTS treasures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  riddle text NOT NULL,
  answer text NOT NULL,
  coins_reward integer DEFAULT 50,
  difficulty text NOT NULL DEFAULT 'easy',
  icon text NOT NULL DEFAULT 'gem',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT treasure_difficulty_check CHECK (difficulty IN ('easy', 'medium', 'hard'))
);

-- Create found treasures table
CREATE TABLE IF NOT EXISTS found_treasures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  treasure_id uuid NOT NULL REFERENCES treasures(id) ON DELETE CASCADE,
  found_at timestamptz DEFAULT now(),
  UNIQUE(user_id, treasure_id)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE treasures ENABLE ROW LEVEL SECURITY;
ALTER TABLE found_treasures ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Lessons policies
CREATE POLICY "Anyone can view lessons"
  ON lessons FOR SELECT
  TO authenticated
  USING (true);

-- User progress policies
CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Treasures policies
CREATE POLICY "Anyone can view treasures"
  ON treasures FOR SELECT
  TO authenticated
  USING (true);

-- Found treasures policies
CREATE POLICY "Users can view own found treasures"
  ON found_treasures FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own found treasures"
  ON found_treasures FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Insert sample lessons
INSERT INTO lessons (title, description, difficulty, content, order_index, coins_reward) VALUES
(
  'Biến và Kiểu Dữ Liệu',
  'Học cách khai báo biến và hiểu các kiểu dữ liệu cơ bản trong JavaScript',
  'beginner',
  '{"theory": "Biến là nơi lưu trữ dữ liệu. Trong JavaScript, dùng let, const để khai báo.", "example": "let name = ''Bình'';\nconst age = 15;", "challenge": "Tạo biến tên là ''score'' với giá trị 100"}'::jsonb,
  1,
  10
),
(
  'Hàm (Functions)',
  'Học cách tạo và sử dụng hàm để tái sử dụng code',
  'beginner',
  '{"theory": "Hàm giúp nhóm code lại để dùng nhiều lần.", "example": "function sayHello(name) {\n  return ''Xin chào '' + name;\n}", "challenge": "Tạo hàm add(a, b) trả về tổng a + b"}'::jsonb,
  2,
  15
),
(
  'Vòng Lặp (Loops)',
  'Học cách lặp lại code với for và while',
  'beginner',
  '{"theory": "Vòng lặp giúp thực hiện code nhiều lần.", "example": "for (let i = 0; i < 5; i++) {\n  console.log(i);\n}", "challenge": "Viết vòng lặp in số từ 1 đến 10"}'::jsonb,
  3,
  20
),
(
  'Mảng (Arrays)',
  'Học cách làm việc với danh sách dữ liệu',
  'intermediate',
  '{"theory": "Mảng lưu nhiều giá trị trong một biến.", "example": "let fruits = [''táo'', ''chuối'', ''cam''];\nfruits[0]; // táo", "challenge": "Tạo mảng 5 số và tính tổng"}'::jsonb,
  4,
  25
),
(
  'Đối Tượng (Objects)',
  'Học cách tổ chức dữ liệu với object',
  'intermediate',
  '{"theory": "Object lưu dữ liệu dạng key-value.", "example": "let user = {\n  name: ''An'',\n  age: 16\n};", "challenge": "Tạo object mô tả một cuốn sách"}'::jsonb,
  5,
  30
);

-- Insert sample treasures
INSERT INTO treasures (title, description, riddle, answer, coins_reward, difficulty, icon) VALUES
(
  'Kho Báu JavaScript',
  'Kho báu ẩn chứa kiến thức về JavaScript',
  'Tôi là từ khóa để khai báo biến không thể thay đổi. Tôi là gì?',
  'const',
  50,
  'easy',
  'gem'
),
(
  'Viên Kim Cương Code',
  'Viên kim cương quý giá dành cho lập trình viên thông minh',
  'Tôi có 3 chữ cái, giúp bạn lặp lại code. Tôi bắt đầu bằng chữ F. Tôi là gì?',
  'for',
  75,
  'easy',
  'diamond'
),
(
  'Rương Vàng Function',
  'Rương vàng chứa bí mật của hàm',
  'Để trả về giá trị từ hàm, từ khóa nào được dùng?',
  'return',
  100,
  'medium',
  'trophy'
),
(
  'Bảo Vật Array',
  'Bảo vật giúp bạn làm chủ mảng',
  'Phương thức nào thêm phần tử vào cuối mảng? (3 chữ cái)',
  'push',
  125,
  'medium',
  'crown'
),
(
  'Kho Báu Tối Thượng',
  'Kho báu cuối cùng dành cho bậc thầy code',
  'Từ khóa nào dùng để tạo class trong JavaScript?',
  'class',
  200,
  'hard',
  'sparkles'
);