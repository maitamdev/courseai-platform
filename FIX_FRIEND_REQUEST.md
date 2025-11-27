# 🔧 Hướng Dẫn Fix Lỗi "Không Chấp Nhận Được Lời Mời Kết Bạn"

## Vấn Đề
Account A gửi lời mời kết bạn cho Account B, nhưng Account B không bấm được nút "Chấp nhận".

## Nguyên Nhân
1. RLS policies chưa cho phép receiver update friend_requests
2. Trigger không có quyền tạo friendships
3. Function thiếu SECURITY DEFINER

## Giải Pháp

### Bước 1: Chạy Migration Fix
Vào Supabase Dashboard → SQL Editor và chạy file `16_fix_friend_request_accept.sql`:

```sql
-- Copy toàn bộ nội dung file 16_fix_friend_request_accept.sql và chạy
```

### Bước 2: Kiểm Tra Policies
Chạy query này để xem policies hiện tại:

```sql
-- Check friend_requests policies
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'friend_requests';

-- Check friendships policies
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'friendships';
```

Kết quả mong đợi:
- `friend_requests` có policy "Users can update received requests" với cmd = 'UPDATE'
- `friendships` có policy "Users can create friendships" với cmd = 'INSERT'

### Bước 3: Test Lại

#### Test 1: Gửi lời mời
1. Đăng nhập Account A
2. Vào tab "Bạn Bè" → "Tìm Bạn"
3. Tìm Account B
4. Click "Kết Bạn"
5. Thông báo "Đã gửi lời mời kết bạn!"

#### Test 2: Chấp nhận lời mời
1. Đăng xuất Account A
2. Đăng nhập Account B
3. Vào tab "Bạn Bè" → "Lời Mời"
4. Thấy lời mời từ Account A
5. Click nút "✓" (Chấp nhận)
6. Thông báo "Đã chấp nhận lời mời!"
7. Kiểm tra tab "Bạn Bè" → Thấy Account A trong danh sách

#### Test 3: Verify trong Database
```sql
-- Kiểm tra friend_requests
SELECT 
  fr.id,
  sender.username as sender,
  receiver.username as receiver,
  fr.status,
  fr.created_at
FROM friend_requests fr
JOIN profiles sender ON fr.sender_id = sender.id
JOIN profiles receiver ON fr.receiver_id = receiver.id
ORDER BY fr.created_at DESC
LIMIT 10;

-- Kiểm tra friendships (phải có 2 dòng: A->B và B->A)
SELECT 
  u.username as user,
  f.username as friend,
  fs.status,
  fs.created_at
FROM friendships fs
JOIN profiles u ON fs.user_id = u.id
JOIN profiles f ON fs.friend_id = f.id
WHERE fs.status = 'accepted'
ORDER BY fs.created_at DESC
LIMIT 10;
```

### Bước 4: Kiểm Tra Console (Nếu Vẫn Lỗi)
1. Mở Console trong browser (F12)
2. Vào tab "Console"
3. Click nút "Chấp nhận"
4. Xem có lỗi gì không

Các lỗi thường gặp:
- `permission denied for table friend_requests` → Chưa chạy migration
- `permission denied for table friendships` → Chưa grant permissions
- `new row violates row-level security policy` → RLS policies chưa đúng

## Debug Queries

### Xem tất cả friend requests của một user
```sql
-- Thay 'username_here' bằng username thực tế
SELECT 
  fr.id,
  sender.username as from_user,
  receiver.username as to_user,
  fr.status,
  fr.created_at
FROM friend_requests fr
JOIN profiles sender ON fr.sender_id = sender.id
JOIN profiles receiver ON fr.receiver_id = receiver.id
WHERE receiver.username = 'username_here'
ORDER BY fr.created_at DESC;
```

### Xem tất cả friendships
```sql
SELECT 
  u.username as user,
  f.username as friend,
  fs.status
FROM friendships fs
JOIN profiles u ON fs.user_id = u.id
JOIN profiles f ON fs.friend_id = f.id
ORDER BY fs.created_at DESC;
```

### Test trigger manually
```sql
-- Tạo test friend request
INSERT INTO friend_requests (sender_id, receiver_id, status)
SELECT 
  (SELECT id FROM profiles WHERE username = 'user1'),
  (SELECT id FROM profiles WHERE username = 'user2'),
  'pending';

-- Update để trigger chạy
UPDATE friend_requests
SET status = 'accepted'
WHERE sender_id = (SELECT id FROM profiles WHERE username = 'user1')
  AND receiver_id = (SELECT id FROM profiles WHERE username = 'user2');

-- Kiểm tra friendships đã được tạo chưa
SELECT * FROM friendships
WHERE user_id IN (
  SELECT id FROM profiles WHERE username IN ('user1', 'user2')
);
```

## Lưu Ý
- Trigger `accept_friend_request` tự động tạo 2 friendships (bidirectional)
- Function có `SECURITY DEFINER` để có full permissions
- RLS policies cho phép trigger hoạt động mà không bị chặn
- Nếu vẫn lỗi, kiểm tra logs trong Supabase Dashboard → Logs
