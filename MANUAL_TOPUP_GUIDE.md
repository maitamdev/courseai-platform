# 📝 Hướng Dẫn Nạp Xu Thủ Công

## 🎯 Tổng Quan

Hệ thống nạp xu thủ công đơn giản:
1. **User**: Chuyển khoản → Gửi yêu cầu
2. **Admin**: Xem yêu cầu → Duyệt → Xu được cộng tự động

**Ưu điểm:**
- ✅ Không cần setup Casso
- ✅ Không cần Edge Function
- ✅ Đơn giản, dễ quản lý
- ✅ Miễn phí 100%

**Nhược điểm:**
- ⏰ Cần admin duyệt thủ công (1-24 giờ)
- 👨‍💼 Cần có người quản lý

---

## 🚀 Setup (5 phút)

### Bước 1: Chạy Migration

Vào Supabase SQL Editor và chạy:

```sql
-- Copy toàn bộ nội dung file: supabase/migrations/05_manual_topup_system.sql
```

### Bước 2: Thêm ManualTopup vào CoinPurchase

File `src/components/CoinPurchase.tsx` đã được update với:
- Tab "Nạp Thủ Công" và "Nạp Tự Động"
- Component ManualTopup đã tích hợp

### Bước 3: Thêm Admin Panel vào Dashboard

Thêm vào `src/components/Dashboard.tsx`:

```typescript
import { AdminTopupPanel } from './AdminTopupPanel';

// Trong component Dashboard, thêm tab admin:
{activeTab === 'admin' && <AdminTopupPanel />}
```

Thêm tab admin vào Sidebar:

```typescript
// Trong Sidebar.tsx
<button onClick={() => onTabChange('admin')}>
  👨‍💼 Admin
</button>
```

---

## 👤 Hướng Dẫn Cho User

### 1. Chọn Gói Xu

1. Vào tab **"Nạp Xu"**
2. Chọn tab **"Nạp Thủ Công"**
3. Chọn gói xu muốn nạp

### 2. Chuyển Khoản

**Thông tin chuyển khoản:**
- **Ngân hàng**: MBBank
- **Số TK**: 0877724374
- **Chủ TK**: MAI TRAN THIEN TAM
- **Số tiền**: Theo gói đã chọn
- **Nội dung**: NAP XU [Tên của bạn]

### 3. Gửi Yêu Cầu

1. Nhập ghi chú (tùy chọn): "Đã chuyển khoản lúc 10:30"
2. Click **"Xác Nhận Đã Chuyển Khoản"**
3. Đợi admin duyệt (1-24 giờ)

### 4. Kiểm Tra Trạng Thái

1. Click **"Xem Lịch Sử Yêu Cầu"**
2. Xem trạng thái:
   - 🟡 **Đang chờ**: Admin chưa xử lý
   - 🟢 **Đã duyệt**: Xu đã được cộng
   - 🔴 **Từ chối**: Có lý do từ admin

---

## 👨‍💼 Hướng Dẫn Cho Admin

### 1. Truy Cập Admin Panel

1. Đăng nhập với tài khoản admin
2. Vào tab **"Admin"** (hoặc URL: `/admin`)
3. Xem danh sách yêu cầu đang chờ

### 2. Kiểm Tra Yêu Cầu

Mỗi yêu cầu hiển thị:
- Email/Username của user
- Số tiền đã chuyển
- Số xu sẽ nhận
- Ghi chú từ user
- Thời gian gửi yêu cầu

### 3. Xác Minh Chuyển Khoản

1. Mở app MBBank
2. Kiểm tra lịch sử giao dịch
3. Tìm giao dịch khớp với:
   - Số tiền
   - Nội dung chuyển khoản
   - Thời gian

### 4. Duyệt Yêu Cầu

**Nếu đúng:**
1. Click **"Duyệt & Cộng Xu"**
2. Xác nhận
3. Xu sẽ được cộng tự động vào tài khoản user

**Nếu sai:**
1. Click **"Từ Chối"**
2. Nhập lý do: "Chưa nhận được tiền" hoặc "Số tiền không khớp"
3. User sẽ thấy lý do từ chối

### 5. Refresh Danh Sách

Click icon **🔄** để tải lại danh sách yêu cầu mới

---

## 🔐 Phân Quyền Admin

### Cách 1: Check Email (Đơn giản)

Trong `AdminTopupPanel.tsx`:

```typescript
const isAdmin = user?.email === 'your-email@example.com';
```

Thay `your-email@example.com` bằng email admin của bạn.

### Cách 2: Thêm Role vào Database

1. Thêm column `role` vào bảng `profiles`:

```sql
ALTER TABLE profiles ADD COLUMN role text DEFAULT 'user';
UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
```

2. Update check trong component:

```typescript
const isAdmin = profile?.role === 'admin';
```

---

## 📊 Thống Kê

### Xem Tổng Số Yêu Cầu

```sql
SELECT 
  status,
  COUNT(*) as count,
  SUM(amount_vnd) as total_vnd,
  SUM(coins_amount) as total_coins
FROM topup_requests
GROUP BY status;
```

### Xem Top Users Nạp Xu

```sql
SELECT 
  p.email,
  p.username,
  COUNT(*) as request_count,
  SUM(tr.coins_amount) as total_coins
FROM topup_requests tr
JOIN profiles p ON tr.user_id = p.id
WHERE tr.status = 'approved'
GROUP BY p.id, p.email, p.username
ORDER BY total_coins DESC
LIMIT 10;
```

---

## 🐛 Troubleshooting

### User không thấy gói xu

**Nguyên nhân**: Chưa chạy migration `02_mbbank_payment.sql`

**Giải pháp**: Chạy migration trong Supabase SQL Editor

### Admin không thấy yêu cầu

**Nguyên nhân**: 
- Chưa chạy migration `05_manual_topup_system.sql`
- Không có quyền admin

**Giải pháp**:
1. Chạy migration
2. Check email có đúng trong code không

### Xu không được cộng sau khi duyệt

**Nguyên nhân**: Function `approve_topup_request` có lỗi

**Giải pháp**: Check logs trong Supabase

### User gửi nhiều yêu cầu trùng

**Giải pháp**: Thêm rate limiting:

```sql
-- Chỉ cho phép 1 yêu cầu pending mỗi lúc
ALTER TABLE topup_requests 
ADD CONSTRAINT one_pending_per_user 
UNIQUE (user_id, status) 
WHERE status = 'pending';
```

---

## 💡 Tips

1. **Check MBBank thường xuyên** (mỗi 2-4 giờ)
2. **Duyệt nhanh** để user hài lòng
3. **Ghi chú rõ ràng** khi từ chối
4. **Backup database** trước khi duyệt hàng loạt
5. **Monitor logs** để phát hiện lỗi sớm

---

## 🎯 Kết Luận

Hệ thống nạp xu thủ công:
- ✅ Đơn giản, dễ setup (5 phút)
- ✅ Không cần dịch vụ bên thứ 3
- ✅ Miễn phí 100%
- ✅ Phù hợp cho giai đoạn đầu

Khi có nhiều user hơn, bạn có thể nâng cấp lên hệ thống tự động với Casso.vn!

---

**Chúc bạn thành công! 🎉**
