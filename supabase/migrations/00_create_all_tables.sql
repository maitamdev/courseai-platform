-- =============================================
-- TẠO TẤT CẢ TABLES TỪ ĐẦU
-- =============================================

-- 1. Tạo table profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  full_name text,
  avatar_url text,
  total_coins integer DEFAULT 100,
  total_xp integer DEFAULT 0,
  level integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- 2. Tạo table programming_languages
CREATE TABLE IF NOT EXISTS programming_languages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  icon text NOT NULL,
  description text NOT NULL,
  color text DEFAULT '#3b82f6',
  difficulty text DEFAULT 'beginner',
  created_at timestamptz DEFAULT now()
);

-- 3. Tạo table courses
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  language_id uuid REFERENCES programming_languages(id),
  level text DEFAULT 'beginner',
  price_coins integer DEFAULT 0,
  duration_hours integer DEFAULT 10,
  instructor_name text DEFAULT 'Code Quest Team',
  thumbnail_url text,
  student_count integer DEFAULT 0,
  rating numeric(3,2) DEFAULT 4.5,
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 4. Tạo table course_sections
CREATE TABLE IF NOT EXISTS course_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 5. Tạo table course_lessons
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
  created_at timestamptz DEFAULT now()
);

-- 6. Tạo table purchased_courses
CREATE TABLE IF NOT EXISTS purchased_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  purchased_at timestamptz DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- 7. Tạo table coin_transactions
CREATE TABLE IF NOT EXISTS coin_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  transaction_type text NOT NULL,
  amount integer NOT NULL,
  description text NOT NULL,
  reference_id text,
  created_at timestamptz DEFAULT now()
);

-- 8. Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE programming_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchased_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;

-- 9. Tạo policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Anyone can view languages" ON programming_languages;
CREATE POLICY "Anyone can view languages" ON programming_languages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view courses" ON courses;
CREATE POLICY "Anyone can view courses" ON courses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view sections" ON course_sections;
CREATE POLICY "Anyone can view sections" ON course_sections FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view lessons" ON course_lessons;
CREATE POLICY "Anyone can view lessons" ON course_lessons FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can view own purchases" ON purchased_courses;
CREATE POLICY "Users can view own purchases" ON purchased_courses FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create purchases" ON purchased_courses;
CREATE POLICY "Users can create purchases" ON purchased_courses FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own transactions" ON coin_transactions;
CREATE POLICY "Users can view own transactions" ON coin_transactions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create transactions" ON coin_transactions;
CREATE POLICY "Users can create transactions" ON coin_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 10. Thêm dữ liệu mẫu
INSERT INTO programming_languages (name, slug, icon, description, color, difficulty) VALUES
('JavaScript', 'javascript', 'code', 'Ngôn ngữ lập trình web phổ biến', '#f7df1e', 'beginner'),
('Python', 'python', 'terminal', 'Ngôn ngữ dễ học cho AI và Data Science', '#3776ab', 'beginner'),
('Java', 'java', 'coffee', 'Ngôn ngữ OOP cho Android và Enterprise', '#007396', 'intermediate'),
('C++', 'cpp', 'cpu', 'Ngôn ngữ hiệu suất cao cho game và hệ thống', '#00599c', 'advanced')
ON CONFLICT (slug) DO NOTHING;

SELECT 'Hoàn thành! Database đã sẵn sàng.' AS message;
