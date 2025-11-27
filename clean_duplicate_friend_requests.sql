-- Clean Duplicate Friend Requests
-- Xóa các friend requests trùng lặp hoặc cũ

-- 1. Xem tất cả friend requests hiện tại
SELECT 
  fr.id,
  sender.username as from_user,
  au_sender.email as from_email,
  receiver.username as to_user,
  au_receiver.email as to_email,
  fr.status,
  fr.created_at
FROM friend_requests fr
JOIN profiles sender ON fr.sender_id = sender.id
LEFT JOIN auth.users au_sender ON sender.id = au_sender.id
JOIN profiles receiver ON fr.receiver_id = receiver.id
LEFT JOIN auth.users au_receiver ON receiver.id = au_receiver.id
ORDER BY fr.created_at DESC;

-- 2. Xóa tất cả friend requests cũ (CẢNH BÁO: Sẽ xóa hết!)
-- Uncomment dòng dưới nếu muốn xóa tất cả
-- DELETE FROM friend_requests;

-- 3. Xóa friend requests đã rejected hoặc cũ hơn 30 ngày
-- DELETE FROM friend_requests 
-- WHERE status = 'rejected' 
--    OR (status = 'pending' AND created_at < NOW() - INTERVAL '30 days');

-- 4. Xóa friend requests giữa 2 users cụ thể
-- Thay 'user1@example.com' và 'user2@example.com' bằng email thực tế
-- DELETE FROM friend_requests
-- WHERE (
--   sender_id = (SELECT id FROM profiles WHERE id IN (SELECT id FROM auth.users WHERE email = 'user1@example.com'))
--   AND receiver_id = (SELECT id FROM profiles WHERE id IN (SELECT id FROM auth.users WHERE email = 'user2@example.com'))
-- ) OR (
--   sender_id = (SELECT id FROM profiles WHERE id IN (SELECT id FROM auth.users WHERE email = 'user2@example.com'))
--   AND receiver_id = (SELECT id FROM profiles WHERE id IN (SELECT id FROM auth.users WHERE email = 'user1@example.com'))
-- );

-- 5. Xem các friendships hiện tại
SELECT 
  u.username as user,
  au_u.email as user_email,
  f.username as friend,
  au_f.email as friend_email,
  fs.status,
  fs.created_at
FROM friendships fs
JOIN profiles u ON fs.user_id = u.id
LEFT JOIN auth.users au_u ON u.id = au_u.id
JOIN profiles f ON fs.friend_id = f.id
LEFT JOIN auth.users au_f ON f.id = au_f.id
WHERE fs.status = 'accepted'
ORDER BY fs.created_at DESC;

-- 6. Xóa tất cả friendships (nếu cần reset hoàn toàn)
-- Uncomment dòng dưới nếu muốn xóa tất cả friendships
-- DELETE FROM friendships;

-- 7. Fix: Cho phép gửi lại friend request nếu đã bị rejected
-- Xóa các requests đã rejected để có thể gửi lại
DELETE FROM friend_requests WHERE status = 'rejected';

-- 8. Xóa các pending requests cũ hơn 7 ngày (optional)
-- DELETE FROM friend_requests 
-- WHERE status = 'pending' 
--   AND created_at < NOW() - INTERVAL '7 days';
