-- =============================================
-- CẬP NHẬT NỘI DUNG BÀI HỌC - THÊM KIẾN THỨC CHI TIẾT
-- =============================================

-- Bài 1: Python là gì?
UPDATE course_lessons SET content = '{
  "video_url": "https://www.youtube.com/embed/Y8Tko2YC5hA",
  "overview": "Python được sáng tạo bởi Guido van Rossum vào những năm cuối thập niên 80, đầu thập niên 90 tại Viện nghiên cứu Quốc gia về Toán học và Khoa học máy tính ở Hà Lan. Python là một ngôn ngữ bậc cao, thông dịch, ngôn ngữ kịch bản tương tác và hướng đối tượng. Python được thiết kế để lập trình viên có thể đọc hiểu dễ dàng nhất.",
  "theory": [
    "� Pythoán được sáng tạo bởi Guido van Rossum vào cuối thập niên 80, đầu thập niên 90",
    "📖 Python là ngôn ngữ bậc cao, thông dịch, kịch bản tương tác và hướng đối tượng",
    "✨ Python thường sử dụng các từ khóa tiếng Anh, cú pháp dễ đọc hơn các ngôn ngữ khác",
    "�  Python rất dễ học vì tài liệu có thể tìm thấy ở bất cứ đâu",
    "�  Scripting Language: Viết chương trình tự động hóa công việc trên máy tính",
    "🌐 Web Apps: Dropbox, Netflix, Spotify, Instagram, 21% Facebook, Youtube đều dùng Python",
    "📊 Data Science: NumPy (toán học), SciPy (tin học kỹ thuật), Pandas (phân tích), Matplotlib (visualization)",
    "🤖 Machine Learning & AI: TensorFlow, Theano, PyTorch cho Deep Learning",
    "📡 IoT: Raspberry Pi cho các dự án DIY Internet Vạn Vật",
    "🎮 Game Development: Xây dựng game đơn giản với Python"
  ],
  "applications": [
    "📝 Scripting: Viết script tự động hóa, chuyển ngữ video, xử lý file hàng loạt",
    "🌐 Web Development: Django, Flask framework - xây dựng ứng dụng web mạnh mẽ",
    "📊 Data Science: Phân tích dữ liệu lớn với NumPy, Pandas, SciPy, Matplotlib",
    "🤖 AI/ML: Machine Learning, Deep Learning với TensorFlow, PyTorch, Theano",
    "📡 IoT: Lập trình Raspberry Pi, các thiết bị thông minh",
    "🎮 Game: Phát triển game đơn giản, prototype nhanh"
  ],
  "companies": [
    "Dropbox - Lưu trữ đám mây",
    "Netflix - Streaming video",
    "Spotify - Streaming nhạc",
    "Instagram - Mạng xã hội ảnh",
    "Facebook - 21% cơ sở hạ tầng dữ liệu",
    "Youtube - Nền tảng video lớn nhất"
  ],
  "learning_goals": [
    "✅ Xác định cấu trúc và các thành phần của chương trình Python",
    "✅ Hiểu tại sao Python là ngôn ngữ hữu ích cho lập trình viên",
    "✅ Hiểu cách thiết kế và lập trình các ứng dụng Python",
    "✅ Hiểu cách sử dụng list trong các chương trình Python",
    "✅ Hiểu cách sử dụng indexing và slicing để truy cập dữ liệu",
    "✅ Hiểu cách viết các vòng lặp và câu lệnh điều kiện",
    "✅ Hiểu cách viết hàm và truyền đối số trong Python",
    "✅ Hiểu cách xây dựng và đóng gói các module Python để tái sử dụng"
  ],
  "key_points": [
    "Python là ngôn ngữ phổ biến nhất cho người mới học lập trình",
    "Cú pháp đơn giản, dễ đọc như tiếng Anh tự nhiên",
    "Ứng dụng đa dạng: Web, Data Science, AI, IoT, Game",
    "Cộng đồng lớn, thư viện phong phú, tài liệu dễ tìm"
  ],
  "examples": [
    "# Hello World đơn giản\nprint(\"Hello, World!\")\n\n# Biến và kiểu dữ liệu\nname = \"Python\"\nversion = 3.12\nprint(f\"{name} version {version}\")"
  ]
}'::jsonb
WHERE title = 'Python là gì?';

-- Bài 2: Cài đặt Python và VS Code
UPDATE course_lessons SET content = '{
  "video_url": "https://www.youtube.com/embed/YYXdXT2l-Gg",
  "theory": [
    "📥 Bước 1: Tải Python từ python.org/downloads - chọn phiên bản mới nhất",
    "✅ Bước 2: Khi cài đặt, QUAN TRỌNG: tick vào \"Add Python to PATH\"",
    "💻 Bước 3: Tải VS Code từ code.visualstudio.com - IDE miễn phí của Microsoft",
    "🔌 Bước 4: Cài extension Python trong VS Code (tìm \"Python\" by Microsoft)",
    "🧪 Bước 5: Kiểm tra cài đặt: mở Terminal, gõ \"python --version\"",
    "📁 Bước 6: Tạo file .py đầu tiên và chạy thử",
    "⚙️ VS Code có tính năng IntelliSense - gợi ý code thông minh",
    "🐛 Debugger tích hợp giúp tìm lỗi dễ dàng"
  ],
  "key_points": [
    "Luôn dùng Python 3.x, không dùng Python 2 (đã ngừng hỗ trợ)",
    "PATH giúp chạy Python từ bất kỳ thư mục nào",
    "VS Code là IDE phổ biến nhất cho Python"
  ],
  "tips": [
    "Cài thêm extension Pylint để kiểm tra lỗi code",
    "Dùng phím tắt Ctrl+` để mở Terminal trong VS Code",
    "F5 để chạy và debug chương trình"
  ]
}'::jsonb
WHERE title = 'Cài đặt Python và VS Code';

-- Bài 3: Hello World
UPDATE course_lessons SET content = '{
  "video_url": "https://www.youtube.com/embed/kqtD5dpn9C8",
  "theory": [
    "🖨️ print() là hàm xuất dữ liệu ra màn hình console",
    "📝 Chuỗi (string) được đặt trong dấu ngoặc kép \"\" hoặc nháy đơn ''''",
    "🔢 Có thể in số, biến, kết quả phép tính: print(5 + 3)",
    "➕ Nối chuỗi với dấu +: print(\"Hello \" + \"World\")",
    "📋 In nhiều giá trị: print(\"Tuổi:\", 25, \"Tên:\", \"An\")",
    "↩️ Ký tự đặc biệt: \\n (xuống dòng), \\t (tab)",
    "🎨 f-string format: print(f\"Tên: {name}, Tuổi: {age}\")",
    "⚡ end parameter: print(\"Hello\", end=\" \") - không xuống dòng"
  ],
  "starter_code": "# Bài tập: In ra Hello World và tên của bạn\n# Gợi ý: Dùng hàm print()\n\n# Code của bạn ở đây:\n",
  "solution": "# In Hello World\nprint(\"Hello World\")\n\n# In tên của bạn\nprint(\"Tên tôi là: Python Learner\")\n\n# Bonus: Dùng f-string\nname = \"An\"\nprint(f\"Xin chào, tôi là {name}!\")",
  "hints": [
    "Dùng hàm print() với chuỗi trong ngoặc kép",
    "Có thể dùng nháy đơn hoặc nháy kép",
    "Thử in tên của bạn ở dòng thứ 2"
  ]
}'::jsonb
WHERE title = 'Chương trình Hello World';

-- Bài: Biến trong Python
UPDATE course_lessons SET content = '{
  "video_url": "https://www.youtube.com/embed/cQT33yu9pY8",
  "theory": [
    "📦 Biến là nơi lưu trữ dữ liệu trong bộ nhớ máy tính",
    "✏️ Khai báo biến: ten_bien = gia_tri (không cần từ khóa var/let)",
    "🔄 Python tự động xác định kiểu dữ liệu (Dynamic Typing)",
    "📏 Quy tắc đặt tên: bắt đầu bằng chữ hoặc _, không có khoảng trắng",
    "🐍 Convention: dùng snake_case (vd: so_luong, ten_nguoi_dung)",
    "🔒 Tên biến phân biệt HOA/thường: Name ≠ name ≠ NAME",
    "⚠️ Không dùng từ khóa Python làm tên biến: if, for, while, class...",
    "🔍 Kiểm tra kiểu: type(bien) trả về kiểu dữ liệu",
    "🗑️ Xóa biến: del ten_bien"
  ],
  "key_points": [
    "Biến có thể thay đổi giá trị bất cứ lúc nào",
    "Một biến có thể chứa nhiều kiểu dữ liệu khác nhau",
    "Nên đặt tên biến có ý nghĩa, dễ hiểu"
  ],
  "examples": [
    "tuoi = 25  # Số nguyên",
    "ten = \"An\"  # Chuỗi",
    "diem = 8.5  # Số thực",
    "da_ket_hon = False  # Boolean"
  ]
}'::jsonb
WHERE title = 'Biến trong Python';

-- Bài: Kiểu số int và float
UPDATE course_lessons SET content = '{
  "video_url": "https://www.youtube.com/embed/khKv-8q7YmY",
  "theory": [
    "🔢 int (integer): Số nguyên, không có phần thập phân. VD: 1, -5, 1000",
    "📊 float: Số thực, có phần thập phân. VD: 3.14, -2.5, 0.0",
    "➕ Phép cộng: 5 + 3 = 8",
    "➖ Phép trừ: 10 - 4 = 6",
    "✖️ Phép nhân: 6 * 7 = 42",
    "➗ Phép chia: 15 / 4 = 3.75 (luôn trả về float)",
    "📐 Chia lấy phần nguyên: 15 // 4 = 3",
    "🔄 Chia lấy dư (modulo): 15 % 4 = 3",
    "⚡ Lũy thừa: 2 ** 10 = 1024",
    "🔀 Chuyển đổi: int(3.7) = 3, float(5) = 5.0"
  ],
  "key_points": [
    "Python 3 tự động xử lý số lớn (không giới hạn)",
    "Phép chia / luôn trả về float, dùng // để lấy int",
    "round(3.14159, 2) = 3.14 - làm tròn số"
  ],
  "examples": [
    "a = 10\nb = 3\nprint(a + b)  # 13\nprint(a / b)  # 3.333...\nprint(a // b) # 3\nprint(a % b)  # 1\nprint(a ** b) # 1000"
  ]
}'::jsonb
WHERE title = 'Kiểu số int và float';

-- Bài: Kiểu chuỗi string
UPDATE course_lessons SET content = '{
  "video_url": "https://www.youtube.com/embed/k9TUPpGqYTo",
  "theory": [
    "📝 String là chuỗi ký tự, đặt trong \"\" hoặc ''''",
    "📏 Chuỗi nhiều dòng: dùng \"\"\"...\"\"\" hoặc ''''''...''''''",
    "➕ Nối chuỗi: \"Hello\" + \" \" + \"World\" = \"Hello World\"",
    "✖️ Nhân chuỗi: \"Ha\" * 3 = \"HaHaHa\"",
    "📍 Truy cập ký tự: s[0] = ký tự đầu, s[-1] = ký tự cuối",
    "✂️ Cắt chuỗi (slicing): s[1:4] lấy từ index 1 đến 3",
    "📐 Độ dài chuỗi: len(\"Hello\") = 5",
    "🔠 upper(), lower(): chuyển HOA/thường",
    "🔍 find(), index(): tìm vị trí chuỗi con",
    "🔄 replace(): thay thế chuỗi",
    "✂️ split(): tách chuỗi thành list",
    "🎨 f-string: f\"Tên: {name}, Tuổi: {age}\" - format hiện đại nhất"
  ],
  "key_points": [
    "String trong Python là immutable (không thể thay đổi trực tiếp)",
    "Index bắt đầu từ 0, index âm đếm từ cuối",
    "f-string là cách format được khuyên dùng trong Python 3.6+"
  ],
  "examples": [
    "s = \"Python\"\nprint(s[0])     # P\nprint(s[-1])    # n\nprint(s[0:3])   # Pyt\nprint(s.upper()) # PYTHON\nprint(len(s))   # 6"
  ]
}'::jsonb
WHERE title = 'Kiểu chuỗi string';

-- Bài: If-Elif-Else
UPDATE course_lessons SET content = '{
  "video_url": "https://www.youtube.com/embed/DZwmZ8Usvnk",
  "theory": [
    "🔀 if dùng để rẽ nhánh chương trình theo điều kiện",
    "📝 Cú pháp: if điều_kiện: (nhớ dấu hai chấm)",
    "📏 Code trong if phải thụt lề 4 spaces hoặc 1 tab",
    "🔄 elif (else if): kiểm tra điều kiện khác nếu if sai",
    "⬇️ else: chạy khi tất cả điều kiện trên đều sai",
    "⚖️ Toán tử so sánh: == (bằng), != (khác), < > <= >=",
    "🔗 Toán tử logic: and (và), or (hoặc), not (phủ định)",
    "📦 Kiểm tra trong list: if x in [1,2,3]:",
    "❓ Ternary: ket_qua = \"Đậu\" if diem >= 5 else \"Rớt\"",
    "🔢 Truthy/Falsy: 0, \"\", [], None là False; còn lại là True"
  ],
  "key_points": [
    "Indentation (thụt lề) rất quan trọng trong Python",
    "Có thể lồng nhiều if-else vào nhau",
    "Dùng elif thay vì nhiều if riêng lẻ để tối ưu"
  ],
  "examples": [
    "diem = 75\n\nif diem >= 90:\n    print(\"Xuất sắc\")\nelif diem >= 70:\n    print(\"Khá\")\nelif diem >= 50:\n    print(\"Trung bình\")\nelse:\n    print(\"Yếu\")"
  ]
}'::jsonb
WHERE title = 'Câu lệnh If-Elif-Else';

-- Bài: Vòng lặp For
UPDATE course_lessons SET content = '{
  "video_url": "https://www.youtube.com/embed/OnDr4J2UJ8w",
  "theory": [
    "🔄 for dùng để lặp qua các phần tử trong một iterable",
    "📝 Cú pháp: for item in iterable:",
    "📋 Lặp qua list: for x in [1, 2, 3]:",
    "🔢 range(n): tạo dãy số từ 0 đến n-1",
    "📊 range(start, stop): từ start đến stop-1",
    "⏭️ range(start, stop, step): với bước nhảy step",
    "🔍 enumerate(): lấy cả index và value",
    "⏹️ break: thoát khỏi vòng lặp ngay lập tức",
    "⏭️ continue: bỏ qua lần lặp hiện tại, sang lần tiếp",
    "✅ else trong for: chạy khi vòng lặp kết thúc bình thường (không break)"
  ],
  "key_points": [
    "for trong Python khác với for trong C/Java",
    "range() không tạo list thật, tiết kiệm bộ nhớ",
    "Có thể lặp qua string, list, tuple, dict, set"
  ],
  "examples": [
    "# Lặp qua list\nfruits = [\"táo\", \"cam\", \"chuối\"]\nfor fruit in fruits:\n    print(fruit)\n\n# Lặp với range\nfor i in range(5):\n    print(i)  # 0, 1, 2, 3, 4\n\n# Lặp với enumerate\nfor i, fruit in enumerate(fruits):\n    print(f\"{i}: {fruit}\")"
  ]
}'::jsonb
WHERE title = 'Vòng lặp For';

-- Bài: Vòng lặp While
UPDATE course_lessons SET content = '{
  "video_url": "https://www.youtube.com/embed/6iF8Xb7Z3wQ",
  "theory": [
    "🔄 while lặp khi điều kiện còn đúng (True)",
    "📝 Cú pháp: while điều_kiện:",
    "⚠️ QUAN TRỌNG: phải cập nhật biến điều kiện để tránh infinite loop",
    "🔢 Thường dùng khi không biết trước số lần lặp",
    "⏹️ break: thoát vòng lặp ngay lập tức",
    "⏭️ continue: bỏ qua phần còn lại, quay lại kiểm tra điều kiện",
    "✅ else: chạy khi điều kiện False (không break)",
    "♾️ while True: vòng lặp vô hạn, cần break để thoát",
    "🎮 Thường dùng cho menu, game loop, đọc input"
  ],
  "key_points": [
    "while phù hợp khi điều kiện dừng phức tạp",
    "Luôn đảm bảo có cách thoát khỏi vòng lặp",
    "Ctrl+C để dừng chương trình bị infinite loop"
  ],
  "examples": [
    "# Đếm từ 1 đến 5\ncount = 1\nwhile count <= 5:\n    print(count)\n    count += 1\n\n# Menu đơn giản\nwhile True:\n    choice = input(\"Nhập lựa chọn (q để thoát): \")\n    if choice == \"q\":\n        break\n    print(f\"Bạn chọn: {choice}\")"
  ]
}'::jsonb
WHERE title = 'Vòng lặp While';

SELECT 'Đã cập nhật nội dung chi tiết cho các bài học!' AS message;


-- Bài: Định nghĩa hàm với def
UPDATE course_lessons SET content = '{
  "video_url": "https://www.youtube.com/embed/9Os0o3wzS_I",
  "theory": [
    "🔧 Hàm (function) là khối code có thể tái sử dụng",
    "📝 Cú pháp: def ten_ham(tham_so):",
    "📞 Gọi hàm: ten_ham(gia_tri)",
    "📖 Docstring: mô tả hàm bằng \"\"\"...\"\"\" ngay sau def",
    "🎯 Hàm giúp code gọn gàng, dễ bảo trì",
    "🔄 DRY principle: Don''t Repeat Yourself",
    "📦 Hàm có thể không có tham số: def say_hello():",
    "🔢 Hàm có thể có nhiều tham số: def add(a, b, c):",
    "⚡ Hàm có thể gọi hàm khác (nested calls)",
    "🏠 Biến trong hàm là local, không ảnh hưởng bên ngoài"
  ],
  "key_points": [
    "Tên hàm nên là động từ mô tả hành động",
    "Mỗi hàm nên làm một việc duy nhất",
    "Docstring giúp người khác hiểu hàm của bạn"
  ],
  "examples": [
    "def greet(name):\n    \"\"\"Chào một người\"\"\"\n    print(f\"Xin chào, {name}!\")\n\ngreet(\"An\")  # Xin chào, An!\ngreet(\"Bình\")  # Xin chào, Bình!"
  ]
}'::jsonb
WHERE title = 'Định nghĩa hàm với def';

-- Bài: Tham số và Arguments
UPDATE course_lessons SET content = '{
  "video_url": "https://www.youtube.com/embed/9Os0o3wzS_I",
  "theory": [
    "📥 Parameter: biến trong định nghĩa hàm",
    "📤 Argument: giá trị truyền vào khi gọi hàm",
    "📍 Positional arguments: truyền theo thứ tự vị trí",
    "🏷️ Keyword arguments: truyền theo tên: func(name=\"An\")",
    "📦 Default values: def func(x=10): - giá trị mặc định",
    "✨ *args: nhận nhiều positional arguments thành tuple",
    "📚 **kwargs: nhận nhiều keyword arguments thành dict",
    "⚠️ Thứ tự: positional → *args → keyword → **kwargs",
    "🔒 Keyword-only: def func(*, name): - bắt buộc dùng keyword"
  ],
  "key_points": [
    "Default values phải đặt sau non-default",
    "*args và **kwargs rất hữu ích cho hàm linh hoạt",
    "Nên dùng keyword arguments cho code rõ ràng hơn"
  ],
  "examples": [
    "def introduce(name, age=18, city=\"HN\"):\n    print(f\"{name}, {age} tuổi, ở {city}\")\n\nintroduce(\"An\")  # An, 18 tuổi, ở HN\nintroduce(\"Bình\", 25)  # Bình, 25 tuổi, ở HN\nintroduce(\"Chi\", city=\"SG\")  # Chi, 18 tuổi, ở SG"
  ]
}'::jsonb
WHERE title = 'Tham số và Arguments';

-- Bài: Return - Trả về giá trị
UPDATE course_lessons SET content = '{
  "video_url": "https://www.youtube.com/embed/9Os0o3wzS_I",
  "theory": [
    "↩️ return trả về giá trị từ hàm cho nơi gọi",
    "🛑 return kết thúc hàm ngay lập tức",
    "📦 Có thể return bất kỳ kiểu dữ liệu nào",
    "🔢 Return nhiều giá trị: return a, b, c (trả về tuple)",
    "❌ Không có return → hàm trả về None",
    "✅ return sớm: dùng để thoát hàm khi đủ điều kiện",
    "🎯 Hàm có return gọi là function, không có gọi là procedure",
    "💡 Có thể gán kết quả return vào biến"
  ],
  "key_points": [
    "Luôn return giá trị có ý nghĩa",
    "Tránh return None khi không cần thiết",
    "Multiple return values rất tiện trong Python"
  ],
  "examples": [
    "def calculate(a, b):\n    tong = a + b\n    hieu = a - b\n    tich = a * b\n    return tong, hieu, tich\n\ns, h, t = calculate(10, 3)\nprint(f\"Tổng: {s}, Hiệu: {h}, Tích: {t}\")\n# Tổng: 13, Hiệu: 7, Tích: 30"
  ]
}'::jsonb
WHERE title = 'Return - Trả về giá trị';

-- Bài: Tạo và truy cập List
UPDATE course_lessons SET content = '{
  "video_url": "https://www.youtube.com/embed/W8KRzm-HUcc",
  "theory": [
    "📋 List là cấu trúc dữ liệu lưu nhiều phần tử có thứ tự",
    "📝 Tạo list: my_list = [1, 2, 3] hoặc list()",
    "🔢 List có thể chứa nhiều kiểu dữ liệu khác nhau",
    "📍 Truy cập: list[0] = phần tử đầu, list[-1] = cuối",
    "✂️ Slicing: list[1:4] lấy từ index 1 đến 3",
    "📏 Độ dài: len(my_list)",
    "🔍 Kiểm tra: if x in my_list:",
    "🔄 List là mutable - có thể thay đổi sau khi tạo",
    "📦 List lồng nhau: matrix = [[1,2], [3,4]]",
    "🔢 Truy cập list lồng: matrix[0][1] = 2"
  ],
  "key_points": [
    "Index bắt đầu từ 0",
    "Slicing: [start:stop:step]",
    "List là kiểu dữ liệu phổ biến nhất trong Python"
  ],
  "examples": [
    "fruits = [\"táo\", \"cam\", \"chuối\", \"xoài\"]\n\nprint(fruits[0])    # táo\nprint(fruits[-1])   # xoài\nprint(fruits[1:3])  # [''cam'', ''chuối'']\nprint(len(fruits))  # 4\nprint(\"cam\" in fruits)  # True"
  ]
}'::jsonb
WHERE title = 'Tạo và truy cập List';

-- Bài: Thêm xóa phần tử
UPDATE course_lessons SET content = '{
  "video_url": "https://www.youtube.com/embed/W8KRzm-HUcc",
  "theory": [
    "➕ append(x): thêm x vào cuối list",
    "📍 insert(i, x): chèn x vào vị trí i",
    "🔗 extend(list2): nối list2 vào cuối",
    "➖ remove(x): xóa phần tử x đầu tiên tìm thấy",
    "📍 pop(i): xóa và trả về phần tử tại index i",
    "📍 pop(): xóa và trả về phần tử cuối",
    "🗑️ del list[i]: xóa phần tử tại index i",
    "🧹 clear(): xóa tất cả phần tử",
    "🔢 index(x): tìm vị trí của x",
    "📊 count(x): đếm số lần xuất hiện của x",
    "🔀 sort(): sắp xếp list (thay đổi list gốc)",
    "🔄 reverse(): đảo ngược list"
  ],
  "key_points": [
    "append() và extend() khác nhau: append thêm 1 phần tử, extend nối list",
    "pop() trả về giá trị, remove() không trả về",
    "sort() thay đổi list gốc, sorted() tạo list mới"
  ],
  "examples": [
    "nums = [3, 1, 4, 1, 5]\n\nnums.append(9)      # [3, 1, 4, 1, 5, 9]\nnums.insert(0, 0)   # [0, 3, 1, 4, 1, 5, 9]\nnums.remove(1)      # [0, 3, 4, 1, 5, 9]\nlast = nums.pop()   # last = 9, nums = [0, 3, 4, 1, 5]\nnums.sort()         # [0, 1, 3, 4, 5]"
  ]
}'::jsonb
WHERE title = 'Thêm xóa phần tử';

-- Bài: List Comprehension
UPDATE course_lessons SET content = '{
  "video_url": "https://www.youtube.com/embed/3dt4OGnU5sM",
  "theory": [
    "⚡ List comprehension: cách tạo list ngắn gọn, Pythonic",
    "📝 Cú pháp: [expression for item in iterable]",
    "🔍 Với điều kiện: [x for x in list if condition]",
    "🔄 Với if-else: [x if cond else y for x in list]",
    "📦 Nested: [[j for j in range(3)] for i in range(3)]",
    "⚡ Nhanh hơn vòng for thông thường",
    "📖 Code ngắn gọn, dễ đọc hơn",
    "🎯 Thay thế map() và filter() trong nhiều trường hợp"
  ],
  "key_points": [
    "Không nên dùng cho logic phức tạp",
    "Có thể dùng nhiều for lồng nhau",
    "Dict và Set comprehension cũng tương tự"
  ],
  "examples": [
    "# Bình phương các số từ 1-10\nsquares = [x**2 for x in range(1, 11)]\n# [1, 4, 9, 16, 25, 36, 49, 64, 81, 100]\n\n# Lọc số chẵn\nevens = [x for x in range(20) if x % 2 == 0]\n# [0, 2, 4, 6, 8, 10, 12, 14, 16, 18]\n\n# Chuyển chữ hoa\nnames = [\"an\", \"bình\", \"chi\"]\nupper_names = [n.upper() for n in names]\n# [''AN'', ''BÌNH'', ''CHI'']"
  ]
}'::jsonb
WHERE title = 'List Comprehension';

-- Bài: Tạo và sử dụng Dictionary
UPDATE course_lessons SET content = '{
  "video_url": "https://www.youtube.com/embed/daefaLgNkw0",
  "theory": [
    "📚 Dictionary lưu dữ liệu theo cặp key-value",
    "📝 Tạo dict: my_dict = {\"key\": \"value\"} hoặc dict()",
    "🔑 Key phải là immutable (string, number, tuple)",
    "📦 Value có thể là bất kỳ kiểu dữ liệu nào",
    "📍 Truy cập: dict[\"key\"] hoặc dict.get(\"key\")",
    "⚠️ dict[\"key\"] raise KeyError nếu key không tồn tại",
    "✅ dict.get(\"key\", default) trả về default nếu không có",
    "➕ Thêm/sửa: dict[\"new_key\"] = value",
    "➖ Xóa: del dict[\"key\"] hoặc dict.pop(\"key\")",
    "🔍 Kiểm tra key: if \"key\" in dict:"
  ],
  "key_points": [
    "Dict trong Python 3.7+ giữ thứ tự chèn",
    "Dùng get() để tránh KeyError",
    "Dict rất nhanh cho việc tìm kiếm theo key"
  ],
  "examples": [
    "student = {\n    \"name\": \"An\",\n    \"age\": 20,\n    \"scores\": [8, 9, 7]\n}\n\nprint(student[\"name\"])  # An\nprint(student.get(\"email\", \"N/A\"))  # N/A\n\nstudent[\"email\"] = \"an@email.com\"  # Thêm mới\nstudent[\"age\"] = 21  # Cập nhật"
  ]
}'::jsonb
WHERE title = 'Tạo và sử dụng Dictionary';

-- Bài: Duyệt Dictionary
UPDATE course_lessons SET content = '{
  "video_url": "https://www.youtube.com/embed/daefaLgNkw0",
  "theory": [
    "🔑 keys(): trả về tất cả keys",
    "📦 values(): trả về tất cả values",
    "🔗 items(): trả về các cặp (key, value)",
    "🔄 for key in dict: lặp qua keys",
    "🔄 for key, value in dict.items(): lặp qua cả hai",
    "📏 len(dict): số lượng cặp key-value",
    "🧹 clear(): xóa tất cả",
    "📋 copy(): tạo bản sao shallow",
    "🔀 update(dict2): merge dict2 vào dict",
    "📦 setdefault(key, default): lấy hoặc set giá trị"
  ],
  "key_points": [
    "items() là cách phổ biến nhất để duyệt dict",
    "keys(), values(), items() trả về view objects",
    "Không nên thay đổi dict khi đang duyệt"
  ],
  "examples": [
    "scores = {\"An\": 85, \"Bình\": 92, \"Chi\": 78}\n\n# Duyệt keys\nfor name in scores:\n    print(name)\n\n# Duyệt values\nfor score in scores.values():\n    print(score)\n\n# Duyệt cả hai\nfor name, score in scores.items():\n    print(f\"{name}: {score} điểm\")"
  ]
}'::jsonb
WHERE title = 'Duyệt Dictionary';

SELECT 'Đã cập nhật thêm nội dung chi tiết!' AS message;
