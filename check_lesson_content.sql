-- Kiểm tra content của bài học
SELECT 
  cl.title,
  cl.lesson_type,
  cl.content
FROM course_lessons cl
JOIN course_sections cs ON cl.section_id = cs.id
JOIN courses c ON cs.course_id = c.id
WHERE c.title = 'Modern C++ Programming'
ORDER BY cs.order_index, cl.order_index
LIMIT 5;
