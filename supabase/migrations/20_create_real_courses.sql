-- =============================================
-- TẠO KHÓA HỌC THẬT VỚI DATABASE
-- =============================================

-- Xóa dữ liệu cũ nếu có
DELETE FROM course_lessons;
DELETE FROM course_sections;
DELETE FROM courses;

-- 1. TẠO KHÓA HỌC PYTHON CƠ BẢN
INSERT INTO courses (id, title, description, language, level, price_coins, duration_hours, instructor_name, student_count, rating, is_published, is_featured) VALUES
('python-basics', 'Python Cơ Bản', 'Học Python từ đầu với các bài học thực hành. Phù hợp cho người mới bắt đầu lập trình.', 'Python', 'beginner', 0, 10, 'CodeMind AI', 1250, 4.8, true, true);

-- Sections cho Python
INSERT INTO course_sections (id, course_id, title, description, order_index) VALUES
('py-s1', 'python-basics', 'Giới thiệu Python', 'Làm quen với Python và môi trường lập trình', 1),
('py-s2', 'python-basics', 'Biến và Kiểu dữ liệu', 'Học về biến, số, chuỗi trong Python', 2),
('py-s3', 'python-basics', 'Cấu trúc điều khiển', 'If-else, vòng lặp for, while', 3),
('py-s4', 'python-basics', 'Hàm và Module', 'Tạo hàm, import module, package', 4);

-- Lessons cho Python
INSERT INTO course_lessons (section_id, title, description, lesson_type, video_duration, order_index, is_free) VALUES
-- Section 1: Giới thiệu
('py-s1', 'Python là gì?', 'Tìm hiểu về Python và ứng dụng của nó', 'video', 600, 1, true),
('py-s1', 'Cài đặt Python', 'Hướng dẫn cài đặt Python và IDE', 'video', 900, 2, true),
('py-s1', 'Chương trình đầu tiên', 'Viết chương trình Hello World đầu tiên', 'exercise', 720, 3, true),

-- Section 2: Biến và Kiểu dữ liệu
('py-s2', 'Biến trong Python', 'Cách khai báo và sử dụng biến', 'video', 1080, 1, false),
('py-s2', 'Kiểu số và chuỗi', 'Làm việc với số và chuỗi', 'video', 1200, 2, false),
('py-s2', 'Bài tập biến', 'Thực hành với biến và kiểu dữ liệu', 'exercise', 900, 3, false),

-- Section 3: Cấu trúc điều khiển
('py-s3', 'Câu lệnh If-Else', 'Điều kiện và rẽ nhánh trong Python', 'video', 1320, 1, false),
('py-s3', 'Vòng lặp For', 'Lặp với for và range', 'video', 1500, 2, false),
('py-s3', 'Vòng lặp While', 'Vòng lặp điều kiện', 'video', 1080, 3, false),

-- Section 4: Hàm và Module
('py-s4', 'Định nghĩa hàm', 'Tạo và sử dụng hàm', 'video', 1440, 1, false),
('py-s4', 'Tham số và return', 'Truyền tham số và trả về giá trị', 'video', 1200, 2, false),
('py-s4', 'Import module', 'Sử dụng thư viện có sẵn', 'video', 900, 3, false);

-- 2. TẠO KHÓA HỌC JAVASCRIPT CƠ BẢN
INSERT INTO courses (id, title, description, language, level, price_coins, duration_hours, instructor_name, student_count, rating, is_published, is_featured) VALUES
('javascript-basics', 'JavaScript Cơ Bản', 'Nền tảng JavaScript cho web development. Học cách tạo trang web tương tác.', 'JavaScript', 'beginner', 0, 12, 'CodeMind AI', 2100, 4.9, true, true);

-- Sections cho JavaScript
INSERT INTO course_sections (id, course_id, title, description, order_index) VALUES
('js-s1', 'javascript-basics', 'Bắt đầu với JavaScript', 'Giới thiệu JavaScript và cú pháp cơ bản', 1),
('js-s2', 'javascript-basics', 'Kiểu dữ liệu', 'String, Number, Array, Object', 2),
('js-s3', 'javascript-basics', 'DOM Manipulation', 'Thao tác với HTML bằng JavaScript', 3);

-- Lessons cho JavaScript
INSERT INTO course_lessons (section_id, title, description, lesson_type, video_duration, order_index, is_free) VALUES
-- Section 1: Bắt đầu
('js-s1', 'JavaScript là gì?', 'Tổng quan về JavaScript và vai trò trong web', 'video', 720, 1, true),
('js-s1', 'Console và Alert', 'Xuất dữ liệu và debug cơ bản', 'video', 600, 2, true),
('js-s1', 'Biến let, const, var', 'Khai báo biến trong JavaScript', 'video', 1080, 3, true),

-- Section 2: Kiểu dữ liệu
('js-s2', 'String và Number', 'Làm việc với chuỗi và số', 'video', 1200, 1, false),
('js-s2', 'Array và Object', 'Mảng và đối tượng trong JavaScript', 'video', 1500, 2, false),
('js-s2', 'Bài tập thực hành', 'Thực hành với các kiểu dữ liệu', 'exercise', 900, 3, false),

-- Section 3: DOM
('js-s3', 'Tìm hiểu DOM', 'Document Object Model là gì?', 'video', 1080, 1, false),
('js-s3', 'Thay đổi nội dung', 'innerHTML, textContent', 'video', 1200, 2, false),
('js-s3', 'Xử lý sự kiện', 'Click, submit, change events', 'video', 1440, 3, false);

-- 3. TẠO KHÓA HỌC REACT FUNDAMENTALS
INSERT INTO courses (id, title, description, language, level, price_coins, duration_hours, instructor_name, student_count, rating, is_published, is_featured) VALUES
('react-fundamentals', 'React.js Fundamentals', 'Xây dựng ứng dụng web hiện đại với React. Components, Hooks, State Management.', 'React', 'intermediate', 500, 15, 'CodeMind AI', 890, 4.7, true, true);

-- Sections cho React
INSERT INTO course_sections (id, course_id, title, description, order_index) VALUES
('react-s1', 'react-fundamentals', 'React Basics', 'Giới thiệu React và JSX', 1),
('react-s2', 'react-fundamentals', 'Components & Props', 'Tạo và sử dụng components', 2),
('react-s3', 'react-fundamentals', 'State & Hooks', 'Quản lý state với hooks', 3);

-- Lessons cho React
INSERT INTO course_lessons (section_id, title, description, lesson_type, video_duration, order_index, is_free) VALUES
-- Section 1: Basics
('react-s1', 'React là gì?', 'Giới thiệu React library', 'video', 900, 1, true),
('react-s1', 'JSX và Components', 'Cú pháp JSX và component cơ bản', 'video', 1200, 2, true),
('react-s1', 'Create React App', 'Tạo project React đầu tiên', 'video', 1080, 3, false),

-- Section 2: Components
('react-s2', 'Functional Components', 'Tạo component với function', 'video', 1320, 1, false),
('react-s2', 'Props và Children', 'Truyền dữ liệu giữa components', 'video', 1500, 2, false),
('react-s2', 'Conditional Rendering', 'Render có điều kiện', 'video', 1080, 3, false),

-- Section 3: State & Hooks
('react-s3', 'useState Hook', 'Quản lý state với useState', 'video', 1680, 1, false),
('react-s3', 'useEffect Hook', 'Side effects và lifecycle', 'video', 1800, 2, false),
('react-s3', 'Event Handling', 'Xử lý sự kiện trong React', 'video', 1200, 3, false);

-- 4. TẠO KHÓA HỌC JAVA OOP
INSERT INTO courses (id, title, description, language, level, price_coins, duration_hours, instructor_name, student_count, rating, is_published, is_featured) VALUES
('java-oop', 'Java OOP', 'Lập trình hướng đối tượng với Java. Classes, Inheritance, Polymorphism.', 'Java', 'intermediate', 300, 14, 'CodeMind AI', 650, 4.6, true, false);

-- Sections cho Java
INSERT INTO course_sections (id, course_id, title, description, order_index) VALUES
('java-s1', 'java-oop', 'OOP Cơ bản', 'Khái niệm lập trình hướng đối tượng', 1),
('java-s2', 'java-oop', 'Inheritance', 'Kế thừa trong Java', 2),
('java-s3', 'java-oop', 'Polymorphism', 'Đa hình và abstract', 3);

-- Lessons cho Java
INSERT INTO course_lessons (section_id, title, description, lesson_type, video_duration, order_index, is_free) VALUES
-- Section 1: OOP Basics
('java-s1', 'Class và Object', 'Tạo class và object đầu tiên', 'video', 1200, 1, true),
('java-s1', 'Constructor', 'Khởi tạo object với constructor', 'video', 1080, 2, true),
('java-s1', 'Encapsulation', 'Đóng gói dữ liệu với private/public', 'video', 1320, 3, false),

-- Section 2: Inheritance
('java-s2', 'Extends keyword', 'Kế thừa với extends', 'video', 1440, 1, false),
('java-s2', 'Super keyword', 'Gọi constructor và method của parent', 'video', 1200, 2, false),
('java-s2', 'Method Overriding', 'Ghi đè method trong subclass', 'video', 1080, 3, false),

-- Section 3: Polymorphism
('java-s3', 'Interface', 'Định nghĩa và implement interface', 'video', 1500, 1, false),
('java-s3', 'Abstract Class', 'Class trừu tượng và abstract method', 'video', 1320, 2, false),
('java-s3', 'Polymorphism thực tế', 'Ứng dụng đa hình trong project', 'video', 1680, 3, false);

-- 5. TẠO KHÓA HỌC C++ CƠ BẢN
INSERT INTO courses (id, title, description, language, level, price_coins, duration_hours, instructor_name, student_count, rating, is_published, is_featured) VALUES
('cpp-basics', 'C++ Cơ Bản', 'Học C++ từ cơ bản. Pointers, Memory Management, và các khái niệm quan trọng.', 'C++', 'beginner', 0, 16, 'CodeMind AI', 780, 4.5, true, false);

-- Sections cho C++
INSERT INTO course_sections (id, course_id, title, description, order_index) VALUES
('cpp-s1', 'cpp-basics', 'C++ Basics', 'Cú pháp cơ bản của C++', 1),
('cpp-s2', 'cpp-basics', 'Pointers & References', 'Con trỏ và tham chiếu', 2),
('cpp-s3', 'cpp-basics', 'OOP trong C++', 'Lập trình hướng đối tượng', 3);

-- Lessons cho C++
INSERT INTO course_lessons (section_id, title, description, lesson_type, video_duration, order_index, is_free) VALUES
-- Section 1: Basics
('cpp-s1', 'Giới thiệu C++', 'Lịch sử và đặc điểm của C++', 'video', 900, 1, true),
('cpp-s1', 'Input/Output', 'cin, cout và iostream', 'video', 1080, 2, true),
('cpp-s1', 'Biến và Kiểu dữ liệu', 'int, float, char, string', 'video', 1200, 3, false),

-- Section 2: Pointers
('cpp-s2', 'Con trỏ cơ bản', 'Khai báo và sử dụng pointer', 'video', 1440, 1, false),
('cpp-s2', 'Pointer và Array', 'Mối quan hệ giữa pointer và mảng', 'video', 1320, 2, false),
('cpp-s2', 'Dynamic Memory', 'new, delete và memory management', 'video', 1500, 3, false),

-- Section 3: OOP
('cpp-s3', 'Class trong C++', 'Định nghĩa class và member functions', 'video', 1200, 1, false),
('cpp-s3', 'Constructor & Destructor', 'Khởi tạo và hủy object', 'video', 1080, 2, false),
('cpp-s3', 'Inheritance trong C++', 'Kế thừa và virtual functions', 'video', 1680, 3, false);

-- Cập nhật số lượng bài học cho mỗi khóa học
UPDATE courses SET 
  student_count = CASE 
    WHEN id = 'python-basics' THEN 1250
    WHEN id = 'javascript-basics' THEN 2100
    WHEN id = 'react-fundamentals' THEN 890
    WHEN id = 'java-oop' THEN 650
    WHEN id = 'cpp-basics' THEN 780
  END;

SELECT 'Đã tạo thành công 5 khóa học với tổng cộng ' || COUNT(*) || ' bài học!' AS message
FROM course_lessons;
-- 
Tạo bảng user_progress nếu chưa có
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL,
  completed boolean DEFAULT false,
  code_solution text,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Enable RLS cho user_progress
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Policies cho user_progress
DROP POLICY IF EXISTS "Users can view own progress" ON user_progress;
CREATE POLICY "Users can view own progress" ON user_progress FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create progress" ON user_progress;
CREATE POLICY "Users can create progress" ON user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update progress" ON user_progress;
CREATE POLICY "Users can update progress" ON user_progress FOR UPDATE USING (auth.uid() = user_id);

SELECT 'Đã tạo bảng user_progress và policies!' AS message;