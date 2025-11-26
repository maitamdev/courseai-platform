# CourseAI - Nền tảng học lập trình trực tuyến

Nền tảng học lập trình hiện đại với gamification, hệ thống xu và khóa học đa ngôn ngữ.

## Tính năng

- 🎓 Khóa học đa ngôn ngữ lập trình (JavaScript, Python, Java, C++...)
- 🎮 Gamification với hệ thống xu, level, XP
- 📚 Cấu trúc khóa học rõ ràng: Sections → Lessons (Video, Bài tập, Quiz)
- 💰 Hệ thống mua khóa học bằng xu
- 👤 Quản lý profile và tiến độ học tập
- 🎯 Game thử thách lập trình

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Icons**: Lucide React

## Cài đặt

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

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Chạy migrations

Trong Supabase SQL Editor, chạy các file migration theo thứ tự:

1. `supabase/migrations/00_create_all_tables.sql` - Tạo database schema
2. `supabase/migrations/add_advanced_cpp_course.sql` - Thêm khóa học mẫu

### 5. Chạy development server

```bash
npm run dev
```

Mở http://localhost:5173

## Scripts

- `npm run dev` - Chạy development server
- `npm run build` - Build production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code

## Database Schema

### Tables chính:

- `profiles` - Thông tin user
- `programming_languages` - Ngôn ngữ lập trình
- `courses` - Khóa học
- `course_sections` - Phần của khóa học
- `course_lessons` - Bài học (video, bài tập, quiz)
- `purchased_courses` - Khóa học đã mua
- `coin_transactions` - Lịch sử giao dịch xu

## Đóng góp

Pull requests are welcome! Đối với thay đổi lớn, vui lòng mở issue trước.

## License

MIT
