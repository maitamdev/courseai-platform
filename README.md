# 🤖 COURSE AI - Nền tảng học lập trình với AI

Nền tảng học lập trình hiện đại với AI trợ giảng, hệ thống nạp xu tự động qua QR Code và khóa học đa ngôn ngữ.

## ✨ Tính năng nổi bật

### 🎓 Học tập
- **Khóa học đa dạng**: JavaScript, Python, Java, C++, và nhiều hơn nữa
- **Video bài giảng**: Học qua video chất lượng cao
- **Bài tập thực hành**: Code trực tiếp trên trình duyệt
- **AI Assistant**: Trợ lý AI hỗ trợ học tập 24/7
- **Cấu trúc rõ ràng**: Sections → Lessons (Video, Exercise, Quiz)

### 💰 Hệ thống thanh toán tự động
- **🎯 Nạp xu qua QR Code**: Quét mã QR và nhận xu tự động trong 5-30 giây
- **💳 Tích hợp MBBank**: Thanh toán qua tài khoản MBBank
- **🎁 Xu thưởng**: Nhận thêm xu khi nạp gói lớn
- **📊 Lịch sử giao dịch**: Theo dõi chi tiết các lần nạp xu
- **⚡ Tự động 100%**: Không cần nhập thông tin thủ công

### 🎮 Gamification
- **XP & Levels**: Tích lũy kinh nghiệm và lên cấp
- **Coins System**: Kiếm xu khi hoàn thành bài học
- **Treasure Hunt**: Tìm kho báu và nhận thưởng
- **Badges**: Thu thập huy hiệu thành tích
- **Leaderboard**: Bảng xếp hạng người học

### 🎨 Giao diện
- **Modern UI**: Thiết kế hiện đại, đẹp mắt
- **Responsive**: Hoạt động mượt trên mọi thiết bị
- **Smooth Animations**: Hiệu ứng chuyển động mượt mà
- **Dark Mode Ready**: Sẵn sàng cho chế độ tối

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **Payment**: VietQR API + Casso.vn
- **Icons**: Lucide React

## 🚀 Cài đặt

### 1. Clone repository

```bash
git clone <your-repo-url>
cd project
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình Supabase

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Cập nhật thông tin Supabase trong `.env`:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Chạy migrations

Trong Supabase SQL Editor, chạy các file migration theo thứ tự:

```bash
1. supabase/migrations/00_create_all_tables.sql
2. supabase/migrations/01_add_missing_tables.sql
3. supabase/migrations/02_mbbank_payment.sql
4. supabase/migrations/03_payment_sessions.sql
5. supabase/migrations/modern_cpp_course.sql (optional)
```

### 5. Setup Payment System (Tùy chọn)

Xem hướng dẫn chi tiết trong `QR_PAYMENT_SETUP.md`

**Tóm tắt:**
1. Đăng ký tài khoản Casso.vn
2. Kết nối tài khoản MBBank
3. Setup webhook
4. Deploy Edge Function

### 6. Chạy development server

```bash
npm run dev
```

Mở http://localhost:5173

## 📜 Scripts

```bash
npm run dev      # Chạy development server
npm run build    # Build production
npm run preview  # Preview production build
npm run lint     # Lint code
```

## 🗄 Database Schema

### Tables chính:

#### User & Profile
- `profiles` - Thông tin user, xu, XP, level

#### Courses
- `programming_languages` - Ngôn ngữ lập trình
- `courses` - Khóa học
- `course_sections` - Phần của khóa học
- `course_lessons` - Bài học (video, exercise, quiz)
- `purchased_courses` - Khóa học đã mua

#### Payment
- `coin_packages` - Các gói xu
- `payment_sessions` - Phiên thanh toán QR
- `coin_transactions` - Lịch sử giao dịch xu
- `mbbank_transactions` - Giao dịch MBBank

#### Gamification
- `lessons` - Bài học legacy
- `user_progress` - Tiến độ học tập
- `treasures` - Kho báu
- `found_treasures` - Kho báu đã tìm thấy

## 💳 Payment Flow

```
User chọn gói xu
    ↓
Tạo payment session + QR Code
    ↓
User quét QR và thanh toán
    ↓
MBBank nhận tiền
    ↓
Casso.vn webhook → Supabase Edge Function
    ↓
Tự động cộng xu vào tài khoản
    ↓
Frontend auto refresh
```

## 📱 QR Code Payment

### Thông tin tài khoản:
- **Ngân hàng**: MBBank (Quân Đội)
- **Số TK**: 0877724374
- **Chủ TK**: MAI TRAN THIEN TAM

### Cách hoạt động:
1. User chọn gói xu
2. Hệ thống tạo mã QR với VietQR API
3. User quét QR bằng app ngân hàng
4. Thông tin chuyển khoản tự động điền
5. User xác nhận thanh toán
6. Casso.vn nhận webhook từ MBBank
7. Edge Function xử lý và cộng xu
8. User nhận xu trong 5-30 giây

## 🔧 Configuration

### Environment Variables

```env
# Supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx

# Supabase Edge Functions (Server-side)
CASSO_API_KEY=AK_CS.xxx
CASSO_SECURE_TOKEN=xxx (optional)
```

## 📚 Documentation

- `QR_PAYMENT_SETUP.md` - Hướng dẫn setup payment system
- `MBBANK_AUTO_PAYMENT_SETUP.md` - Hướng dẫn setup MBBank auto payment
- `PAYMENT_SETUP.md` - Thông tin payment cũ

## 🧪 Testing

### Test Payment Flow

1. Vào tab "Nạp Xu"
2. Chọn gói "Cơ Bản" (100,000đ)
3. Quét mã QR
4. Chuyển khoản test với số tiền nhỏ
5. Kiểm tra xu có được cộng tự động

### Test Webhook

```bash
curl -X POST https://xxx.supabase.co/functions/v1/check-payment-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "tid": "TEST123",
      "description": "NAPXU12345678 a1b2c3d4",
      "amount": 100000
    }
  }'
```

## 🐛 Troubleshooting

### Xu không được cộng tự động

1. Check Casso webhook logs
2. Check Supabase Edge Function logs
3. Check payment_sessions table
4. Xem `QR_PAYMENT_SETUP.md` phần Troubleshooting

### QR Code không hiển thị

1. Check VietQR API
2. Check network connection
3. Try refresh page

## 🤝 Đóng góp

Pull requests are welcome! Đối với thay đổi lớn, vui lòng mở issue trước.

## 📄 License

MIT

## 👨‍💻 Author

MAI TRAN THIEN TAM

## 🙏 Credits

- VietQR API - QR Code generation
- Casso.vn - Bank transaction webhook
- Supabase - Backend infrastructure
- Modern C++ Tutorial by Changkun Ou

---

Made with ❤️ for Vietnamese developers
