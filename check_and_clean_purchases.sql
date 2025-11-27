-- Kiểm tra tất cả purchased_courses
SELECT 
  pc.id,
  pc.user_id,
  pc.course_id,
  pc.purchased_at,
  p.username as user_name,
  au.email as user_email,
  c.title as course_title
FROM purchased_courses pc
LEFT JOIN profiles p ON pc.user_id = p.id
LEFT JOIN auth.users au ON pc.user_id = au.id
LEFT JOIN courses c ON pc.course_id = c.id
ORDER BY pc.purchased_at DESC;

-- Nếu muốn xóa TẤT CẢ dữ liệu test (CẢNH BÁO: Sẽ xóa hết purchased_courses)
-- Uncomment dòng dưới nếu chắc chắn muốn xóa
-- DELETE FROM purchased_courses;

-- Hoặc xóa purchased_courses của một user cụ thể
-- Thay 'email@example.com' bằng email của user test
-- DELETE FROM purchased_courses 
-- WHERE user_id IN (
--   SELECT id FROM profiles WHERE email = 'email@example.com'
-- );
