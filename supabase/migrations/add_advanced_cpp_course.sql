-- Thêm khóa học Advanced C++ Techniques
-- Chạy file này SAU KHI đã chạy file 20251126044111_restructure_platform_schema.sql

-- 1. Thêm ngôn ngữ C++
INSERT INTO programming_languages (name, slug, icon, description, color, difficulty) 
VALUES ('C++', 'cpp', 'cpu', 'Ngôn ngữ hiệu suất cao cho game và hệ thống', '#00599c', 'advanced')
ON CONFLICT (slug) DO NOTHING;

-- 2. Thêm khóa học
INSERT INTO courses (
  title, description, language_id, level, price_coins, duration_hours,
  instructor_name, thumbnail_url, student_count, rating, is_published
)
SELECT
  'Advanced C++ Techniques',
  'Khóa học C++ hiện đại (C++11-20) với kỹ thuật tối ưu hiệu năng, STL nâng cao, templates, smart pointers, đa luồng và cấu trúc dữ liệu nâng cao.',
  (SELECT id FROM programming_languages WHERE slug = 'cpp'),
  'advanced', 2500, 45, 'Dr. Nguyễn Văn Minh',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97',
  1247, 4.8, true
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE title = 'Advanced C++ Techniques');

-- 3. Thêm sections và lessons
DO $$
DECLARE v_course_id uuid; v_section_id uuid;
BEGIN
  SELECT id INTO v_course_id FROM courses WHERE title = 'Advanced C++ Techniques' LIMIT 1;
  IF v_course_id IS NULL THEN RAISE EXCEPTION 'Không tìm thấy khóa học'; END IF;
  DELETE FROM course_sections WHERE course_id = v_course_id;

  -- Phần 1: OOP (8 bài)
  INSERT INTO course_sections (course_id, title, description, order_index)
  VALUES (v_course_id, 'Phần 1: OOP Nâng cao', 'Kế thừa, đa hình, virtual functions', 1)
  RETURNING id INTO v_section_id;
  INSERT INTO course_lessons (section_id, title, description, lesson_type, video_url, video_duration, is_free, order_index) VALUES
  (v_section_id, 'Inheritance và Polymorphism', 'Kế thừa và đa hình trong C++', 'video', 'https://youtube.com/watch?v=ex1', 1800, true, 1),
  (v_section_id, 'Bài tập: Shape System', 'Thiết kế hệ thống Shape', 'exercise', null, null, true, 2),
  (v_section_id, 'Virtual Destructor', 'Virtual destructor và late binding', 'video', 'https://youtube.com/watch?v=ex2', 1500, false, 3),
  (v_section_id, 'Bài tập: Memory Management', 'Sửa memory leak', 'exercise', null, null, false, 4),
  (v_section_id, 'Abstract Class', 'Abstract class và interface', 'video', 'https://youtube.com/watch?v=ex3', 1650, false, 5),
  (v_section_id, 'Bài tập: Employee System', 'Hệ thống quản lý nhân viên', 'exercise', null, null, false, 6),
  (v_section_id, 'Multiple Inheritance', 'Đa kế thừa và diamond problem', 'video', 'https://youtube.com/watch?v=ex4', 1400, false, 7),
  (v_section_id, 'Project: Game Characters', 'Hệ thống nhân vật game', 'exercise', null, null, false, 8);

  -- Phần 2: Templates & STL (10 bài)
  INSERT INTO course_sections (course_id, title, description, order_index)
  VALUES (v_course_id, 'Phần 2: Templates & STL', 'Templates, containers, algorithms', 2)
  RETURNING id INTO v_section_id;
  INSERT INTO course_lessons (section_id, title, description, lesson_type, video_url, video_duration, is_free, order_index) VALUES
  (v_section_id, 'Function Templates', 'Tạo function templates', 'video', 'https://youtube.com/watch?v=ex5', 1600, false, 1),
  (v_section_id, 'Bài tập: Generic Functions', 'Swap, max, min templates', 'exercise', null, null, false, 2),
  (v_section_id, 'Class Templates', 'Class templates và specialization', 'video', 'https://youtube.com/watch?v=ex6', 2100, false, 3),
  (v_section_id, 'Bài tập: Array Class', 'Generic Array<T>', 'exercise', null, null, false, 4),
  (v_section_id, 'STL Containers 1', 'vector, list, deque', 'video', 'https://youtube.com/watch?v=ex7', 1800, false, 5),
  (v_section_id, 'STL Containers 2', 'map, set, unordered_map', 'video', 'https://youtube.com/watch?v=ex8', 1900, false, 6),
  (v_section_id, 'Bài tập: Word Counter', 'Đếm tần suất từ', 'exercise', null, null, false, 7),
  (v_section_id, 'Iterators & Algorithms', 'STL algorithms', 'video', 'https://youtube.com/watch?v=ex9', 2200, false, 8),
  (v_section_id, 'Bài tập: Data Processing', 'Xử lý dữ liệu với STL', 'exercise', null, null, false, 9),
  (v_section_id, 'Project: Dictionary', 'Ứng dụng từ điển', 'exercise', null, null, false, 10);

  -- Phần 3: Memory (8 bài)
  INSERT INTO course_sections (course_id, title, description, order_index)
  VALUES (v_course_id, 'Phần 3: Memory Management', 'Smart pointers, RAII, move semantics', 3)
  RETURNING id INTO v_section_id;
  INSERT INTO course_lessons (section_id, title, description, lesson_type, video_url, video_duration, is_free, order_index) VALUES
  (v_section_id, 'RAII Pattern', 'Resource management', 'video', 'https://youtube.com/watch?v=ex10', 1500, false, 1),
  (v_section_id, 'unique_ptr', 'Smart pointer unique_ptr', 'video', 'https://youtube.com/watch?v=ex11', 1700, false, 2),
  (v_section_id, 'Bài tập: Refactor', 'Chuyển sang unique_ptr', 'exercise', null, null, false, 3),
  (v_section_id, 'shared_ptr & weak_ptr', 'Shared ownership', 'video', 'https://youtube.com/watch?v=ex12', 1900, false, 4),
  (v_section_id, 'Move Semantics', 'Rvalue references', 'video', 'https://youtube.com/watch?v=ex13', 2100, false, 5),
  (v_section_id, 'Bài tập: Move', 'Implement move semantics', 'exercise', null, null, false, 6),
  (v_section_id, 'Rule of Five', 'Copy/move constructors', 'video', 'https://youtube.com/watch?v=ex14', 1600, false, 7),
  (v_section_id, 'Project: Resource Manager', 'Quản lý tài nguyên', 'exercise', null, null, false, 8);

  -- Phần 4: Data Structures (9 bài)
  INSERT INTO course_sections (course_id, title, description, order_index)
  VALUES (v_course_id, 'Phần 4: Data Structures', 'Linked list, stack, queue, tree', 4)
  RETURNING id INTO v_section_id;
  INSERT INTO course_lessons (section_id, title, description, lesson_type, video_url, video_duration, is_free, order_index) VALUES
  (v_section_id, 'Linked List', 'Singly và doubly list', 'video', 'https://youtube.com/watch?v=ex15', 2000, false, 1),
  (v_section_id, 'Bài tập: LinkedList<T>', 'Generic linked list', 'exercise', null, null, false, 2),
  (v_section_id, 'Stack & Queue', 'Cài đặt stack/queue', 'video', 'https://youtube.com/watch?v=ex16', 1800, false, 3),
  (v_section_id, 'Bài tập: Calculator', 'Expression evaluator', 'exercise', null, null, false, 4),
  (v_section_id, 'Binary Search Tree', 'Cài đặt BST', 'video', 'https://youtube.com/watch?v=ex17', 2200, false, 5),
  (v_section_id, 'Bài tập: BST', 'BST operations', 'exercise', null, null, false, 6),
  (v_section_id, 'Priority Queue', 'Heap implementation', 'video', 'https://youtube.com/watch?v=ex18', 1900, false, 7),
  (v_section_id, 'Bài tập: Scheduler', 'Task scheduler', 'exercise', null, null, false, 8),
  (v_section_id, 'Project: Container Library', 'Custom STL library', 'exercise', null, null, false, 9);

  -- Phần 5: Advanced (10 bài)
  INSERT INTO course_sections (course_id, title, description, order_index)
  VALUES (v_course_id, 'Phần 5: Advanced Techniques', 'Exception, I/O, Threading, Patterns', 5)
  RETURNING id INTO v_section_id;
  INSERT INTO course_lessons (section_id, title, description, lesson_type, video_url, video_duration, is_free, order_index) VALUES
  (v_section_id, 'Exception Handling', 'Try-catch-throw', 'video', 'https://youtube.com/watch?v=ex19', 1700, false, 1),
  (v_section_id, 'Bài tập: Exceptions', 'Custom exception classes', 'exercise', null, null, false, 2),
  (v_section_id, 'File I/O', 'Streams và file handling', 'video', 'https://youtube.com/watch?v=ex20', 1600, false, 3),
  (v_section_id, 'Lambda Expressions', 'Functional programming', 'video', 'https://youtube.com/watch?v=ex21', 1800, false, 4),
  (v_section_id, 'Bài tập: Lambda', 'Data processing', 'exercise', null, null, false, 5),
  (v_section_id, 'Multithreading', 'std::thread basics', 'video', 'https://youtube.com/watch?v=ex22', 2000, false, 6),
  (v_section_id, 'Synchronization', 'mutex, lock_guard', 'video', 'https://youtube.com/watch?v=ex23', 2100, false, 7),
  (v_section_id, 'Bài tập: Thread-safe Queue', 'Concurrent programming', 'exercise', null, null, false, 8),
  (v_section_id, 'Design Patterns', 'Common patterns', 'video', 'https://youtube.com/watch?v=ex24', 2200, false, 9),
  (v_section_id, 'Final Project: Web Server', 'Multi-threaded server', 'exercise', null, null, false, 10);

  RAISE NOTICE 'Hoàn thành! Đã thêm 5 phần với 45 bài học.';
END $$;
