# 🤖 CodeMind AI - Nền tảng học lập trình với AI

Nền tảng học lập trình hiện đại với AI trợ giảng, hệ thống gamification và khóa học đa ngôn ngữ.

## ✨ Tính năng nổi bật

- 🎓 **Khóa học đa dạng**: JavaScript, Python, Java, C++
- 🤖 **AI Assistant**: Trợ lý AI hỗ trợ học tập 24/7
- 🎮 **Gamification**: XP, Levels, Coins, Badges, Leaderboard
- 💰 **Hệ thống thanh toán**: Nạp xu qua QR Code
- 🗺️ **Treasure Hunt**: Tìm kho báu và nhận thưởng

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **Icons**: Lucide React

## 🚀 Cài đặt

### 1. Clone repository

```bash
git clone <your-repo-url>
cd project
npm install
```

### 2. Cấu hình Environment

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Cập nhật thông tin Supabase của bạn:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Setup Supabase

1. Tạo project mới tại [supabase.com](https://supabase.com)
2. Chạy các file migration trong thư mục `supabase/migrations/` theo thứ tự
3. Cấu hình Authentication theo nhu cầu

### 4. Chạy development server

```bash
npm run dev
```

## 📜 Scripts

```bash
npm run dev      # Development server
npm run build    # Build production
npm run preview  # Preview build
npm run lint     # Lint code
```

## 📄 License

Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## 👨‍💻 Author

MAI TRAN THIEN TAM

---

⚠️ **Lưu ý**: Đây là phần mềm có bản quyền. Vui lòng đọc LICENSE trước khi sử dụng.
