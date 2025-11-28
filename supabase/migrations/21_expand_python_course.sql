-- =============================================
-- MỞ RỘNG KHÓA HỌC PYTHON - THÊM KIẾN THỨC NÂNG CAO
-- Thêm 7 Sections mới | 28 Bài học mới
-- Tổng: 15 Sections | 55 Bài học
-- =============================================

-- Cập nhật thông tin khóa học
UPDATE courses SET 
  description = 'Khóa học Python toàn diện từ cơ bản đến nâng cao. Bao gồm OOP, xử lý lỗi, modules, và nhiều project thực tế.',
  duration_hours = 40
WHERE id = 'python-basics';

-- =============================================
-- SECTION 9: Tuple và Set
-- =============================================
INSERT INTO course_sections (id, course_id, title, description, order_index) VALUES
('a9999999-9999-9999-9999-999999999999', 'python-basics', 'Tuple và Set', 'Cấu trúc dữ liệu bất biến và tập hợp', 9);

INSERT INTO course_lessons (section_id, title, description, lesson_type, video_duration, order_index, is_free, content) VALUES
('a9999999-9999-9999-9999-999999999999', 'Tuple - Danh sách bất biến',
 'Tìm hiểu tuple và sự khác biệt với list.',
 'video', 1200, 1, false,
 '{"video_url": "https://www.youtube.com/embed/NI26dqhs2Rk", "theory": ["tuple = (1, 2, 3)", "Không thể thay đổi sau khi tạo", "Truy cập như list: tuple[0]", "Unpacking: a, b, c = tuple", "Dùng khi dữ liệu không đổi"]}'),
('a9999999-9999-9999-9999-999999999999', 'Set - Tập hợp không trùng lặp',
 'Làm việc với set và các phép toán tập hợp.',
 'video', 1320, 2, false,
 '{"video_url": "https://www.youtube.com/embed/sBvaPopWOmQ", "theory": ["set = {1, 2, 3}", "Tự động loại bỏ trùng lặp", "add(), remove(), discard()", "union(), intersection(), difference()", "Kiểm tra phần tử: in"]}'),
('a9999999-9999-9999-9999-999999999999', 'Bài tập: Loại bỏ trùng lặp',
 'Dùng set để loại bỏ phần tử trùng.',
 'exercise', 900, 3, false,
 '{"starter_code": "# Loại bỏ số trùng lặp\nnumbers = [1, 2, 2, 3, 3, 3, 4, 5, 5]\n# Chuyển thành list không trùng\n", "solution": "numbers = [1, 2, 2, 3, 3, 3, 4, 5, 5]\nunique = list(set(numbers))\nprint(unique)", "hints": ["Chuyển list sang set", "Chuyển set về list"]}'),
('a9999999-9999-9999-9999-999999999999', 'Bài tập: Tìm phần tử chung',
 'Tìm phần tử chung của hai danh sách.',
 'exercise', 900, 4, false,
 '{"starter_code": "# Tìm phần tử chung\nlist1 = [1, 2, 3, 4, 5]\nlist2 = [4, 5, 6, 7, 8]\n# Tìm các số có trong cả hai\n", "solution": "list1 = [1, 2, 3, 4, 5]\nlist2 = [4, 5, 6, 7, 8]\ncommon = set(list1) & set(list2)\nprint(list(common))", "hints": ["Dùng intersection() hoặc &", "Chuyển list sang set trước"]}');

-- =============================================
-- SECTION 10: Xử lý lỗi (Exception Handling)
-- =============================================
INSERT INTO course_sections (id, course_id, title, description, order_index) VALUES
('b1111111-1111-1111-1111-111111111111', 'python-basics', 'Xử lý lỗi (Exceptions)', 'Try-except và xử lý ngoại lệ', 10);

INSERT INTO course_lessons (section_id, title, description, lesson_type, video_duration, order_index, is_free, content) VALUES
('b1111111-1111-1111-1111-111111111111', 'Try-Except cơ bản',
 'Bắt và xử lý lỗi trong Python.',
 'video', 1500, 1, false,
 '{"video_url": "https://www.youtube.com/embed/NIWwJbo-9_8", "theory": ["try: code có thể lỗi", "except: xử lý khi lỗi", "Các loại Exception phổ biến", "ValueError, TypeError, ZeroDivisionError", "Chương trình không bị crash"]}'),
('b1111111-1111-1111-1111-111111111111', 'Multiple Exceptions',
 'Xử lý nhiều loại lỗi khác nhau.',
 'video', 1200, 2, false,
 '{"video_url": "https://www.youtube.com/embed/NIWwJbo-9_8", "theory": ["except ValueError:", "except TypeError:", "except Exception as e:", "Bắt nhiều exception cùng lúc", "Thứ tự except quan trọng"]}'),
('b1111111-1111-1111-1111-111111111111', 'Finally và Raise',
 'Khối finally và tự raise exception.',
 'video', 1080, 3, false,
 '{"video_url": "https://www.youtube.com/embed/NIWwJbo-9_8", "theory": ["finally: luôn chạy", "Dùng để cleanup resources", "raise ValueError(msg)", "Tự tạo exception khi cần", "Custom Exception class"]}'),
('b1111111-1111-1111-1111-111111111111', 'Bài tập: Nhập số an toàn',
 'Viết hàm nhập số với xử lý lỗi.',
 'exercise', 1200, 4, false,
 '{"starter_code": "# Hàm nhập số an toàn\ndef safe_input(prompt):\n    # Yêu cầu nhập cho đến khi đúng số\n    pass\n\n# Test\nnum = safe_input(\"Nhập số: \")", "solution": "def safe_input(prompt):\n    while True:\n        try:\n            return int(input(prompt))\n        except ValueError:\n            print(\"Vui lòng nhập số!\")\n\nnum = safe_input(\"Nhập số: \")", "hints": ["Dùng while True", "try-except ValueError", "return khi thành công"]}');

-- =============================================
-- SECTION 11: Lập trình hướng đối tượng (OOP) - Phần 1
-- =============================================
INSERT INTO course_sections (id, course_id, title, description, order_index) VALUES
('b2222222-2222-2222-2222-222222222222', 'python-basics', 'OOP Cơ bản - Class và Object', 'Lập trình hướng đối tượng phần 1', 11);

INSERT INTO course_lessons (section_id, title, description, lesson_type, video_duration, order_index, is_free, content) VALUES
('b2222222-2222-2222-2222-222222222222', 'Class và Object là gì?',
 'Khái niệm cơ bản về OOP.',
 'video', 1500, 1, false,
 '{"video_url": "https://www.youtube.com/embed/JeznW_7DlB0", "theory": ["Class: bản thiết kế", "Object: thực thể từ class", "Attributes: thuộc tính", "Methods: hành vi", "Ví dụ: Class Dog -> object my_dog"]}'),
('b2222222-2222-2222-2222-222222222222', 'Tạo Class đầu tiên',
 'Cú pháp định nghĩa class trong Python.',
 'video', 1320, 2, false,
 '{"video_url": "https://www.youtube.com/embed/JeznW_7DlB0", "theory": ["class ClassName:", "__init__(self) constructor", "self đại diện object", "Định nghĩa attributes", "Tạo object: obj = ClassName()"]}'),
('b2222222-2222-2222-2222-222222222222', 'Methods - Phương thức',
 'Định nghĩa và gọi methods.',
 'video', 1200, 3, false,
 '{"video_url": "https://www.youtube.com/embed/JeznW_7DlB0", "theory": ["def method(self):", "Gọi: object.method()", "self.attribute truy cập thuộc tính", "Có thể có tham số khác", "Return giá trị như hàm"]}'),
('b2222222-2222-2222-2222-222222222222', 'Bài tập: Class Student',
 'Tạo class quản lý sinh viên.',
 'exercise', 1500, 4, false,
 '{"starter_code": "# Tạo class Student\nclass Student:\n    def __init__(self, name, age):\n        pass\n    \n    def introduce(self):\n        pass\n\n# Test\nsv = Student(\"An\", 20)\nsv.introduce()", "solution": "class Student:\n    def __init__(self, name, age):\n        self.name = name\n        self.age = age\n    \n    def introduce(self):\n        print(f\"Tôi là {self.name}, {self.age} tuổi\")\n\nsv = Student(\"An\", 20)\nsv.introduce()", "hints": ["Lưu name, age vào self", "Dùng f-string trong introduce"]}');

-- =============================================
-- SECTION 12: OOP Nâng cao - Kế thừa
-- =============================================
INSERT INTO course_sections (id, course_id, title, description, order_index) VALUES
('b3333333-3333-3333-3333-333333333333', 'python-basics', 'OOP Nâng cao - Kế thừa', 'Inheritance và Polymorphism', 12);

INSERT INTO course_lessons (section_id, title, description, lesson_type, video_duration, order_index, is_free, content) VALUES
('b3333333-3333-3333-3333-333333333333', 'Kế thừa (Inheritance)',
 'Class con kế thừa từ class cha.',
 'video', 1500, 1, false,
 '{"video_url": "https://www.youtube.com/embed/Cn7AkDb4pIU", "theory": ["class Child(Parent):", "Kế thừa attributes và methods", "super().__init__()", "Mở rộng class có sẵn", "Tái sử dụng code"]}'),
('b3333333-3333-3333-3333-333333333333', 'Override Methods',
 'Ghi đè phương thức của class cha.',
 'video', 1200, 2, false,
 '{"video_url": "https://www.youtube.com/embed/Cn7AkDb4pIU", "theory": ["Định nghĩa lại method cùng tên", "Thay đổi hành vi", "super().method() gọi method cha", "Polymorphism: đa hình", "Cùng method, khác hành vi"]}'),
('b3333333-3333-3333-3333-333333333333', 'Encapsulation - Đóng gói',
 'Private và protected attributes.',
 'video', 1080, 3, false,
 '{"video_url": "https://www.youtube.com/embed/Cn7AkDb4pIU", "theory": ["_protected: quy ước", "__private: name mangling", "Getter và Setter", "@property decorator", "Bảo vệ dữ liệu"]}'),
('b3333333-3333-3333-3333-333333333333', 'Bài tập: Hệ thống nhân viên',
 'Xây dựng class Employee với kế thừa.',
 'exercise', 1800, 4, false,
 '{"starter_code": "class Employee:\n    def __init__(self, name, salary):\n        pass\n    def get_info(self):\n        pass\n\nclass Manager(Employee):\n    def __init__(self, name, salary, department):\n        pass\n    def get_info(self):\n        pass", "solution": "class Employee:\n    def __init__(self, name, salary):\n        self.name = name\n        self.salary = salary\n    def get_info(self):\n        return f\"{self.name}: {self.salary}đ\"\n\nclass Manager(Employee):\n    def __init__(self, name, salary, department):\n        super().__init__(name, salary)\n        self.department = department\n    def get_info(self):\n        return f\"{self.name} - Quản lý {self.department}: {self.salary}đ\"", "hints": ["Dùng super().__init__()", "Override get_info()", "Thêm department cho Manager"]}');


-- =============================================
-- SECTION 13: Modules và Packages
-- =============================================
INSERT INTO course_sections (id, course_id, title, description, order_index) VALUES
('b4444444-4444-4444-4444-444444444444', 'python-basics', 'Modules và Packages', 'Import và tổ chức code', 13);

INSERT INTO course_lessons (section_id, title, description, lesson_type, video_duration, order_index, is_free, content) VALUES
('b4444444-4444-4444-4444-444444444444', 'Import Modules',
 'Cách import và sử dụng modules.',
 'video', 1320, 1, false,
 '{"video_url": "https://www.youtube.com/embed/CqvZ3vGoGs0", "theory": ["import module_name", "from module import func", "import module as alias", "Modules built-in: math, random, datetime", "dir(module) xem nội dung"]}'),
('b4444444-4444-4444-4444-444444444444', 'Tạo Module riêng',
 'Tạo và sử dụng module của bạn.',
 'video', 1200, 2, false,
 '{"video_url": "https://www.youtube.com/embed/CqvZ3vGoGs0", "theory": ["Mỗi file .py là một module", "Import từ file khác", "__name__ == \"__main__\"", "Tổ chức code theo chức năng", "Tái sử dụng code"]}'),
('b4444444-4444-4444-4444-444444444444', 'Packages và __init__.py',
 'Tổ chức modules thành packages.',
 'video', 1080, 3, false,
 '{"video_url": "https://www.youtube.com/embed/CqvZ3vGoGs0", "theory": ["Package = folder chứa modules", "__init__.py đánh dấu package", "from package import module", "Cấu trúc project chuẩn", "pip install packages"]}'),
('b4444444-4444-4444-4444-444444444444', 'Bài tập: Module Calculator',
 'Tạo module máy tính đơn giản.',
 'exercise', 1200, 4, false,
 '{"starter_code": "# File: calculator.py\ndef add(a, b):\n    pass\n\ndef subtract(a, b):\n    pass\n\ndef multiply(a, b):\n    pass\n\ndef divide(a, b):\n    pass\n\n# Test\nif __name__ == \"__main__\":\n    print(add(5, 3))", "solution": "def add(a, b):\n    return a + b\n\ndef subtract(a, b):\n    return a - b\n\ndef multiply(a, b):\n    return a * b\n\ndef divide(a, b):\n    if b == 0:\n        raise ValueError(\"Không chia được cho 0\")\n    return a / b\n\nif __name__ == \"__main__\":\n    print(add(5, 3))", "hints": ["Mỗi hàm return kết quả", "Kiểm tra chia cho 0", "Dùng __name__ để test"]}');

-- =============================================
-- SECTION 14: Lambda và Higher-order Functions
-- =============================================
INSERT INTO course_sections (id, course_id, title, description, order_index) VALUES
('b5555555-5555-5555-5555-555555555555', 'python-basics', 'Lambda và Functional Programming', 'Hàm ẩn danh và lập trình hàm', 14);

INSERT INTO course_lessons (section_id, title, description, lesson_type, video_duration, order_index, is_free, content) VALUES
('b5555555-5555-5555-5555-555555555555', 'Lambda Functions',
 'Hàm ẩn danh một dòng.',
 'video', 1200, 1, false,
 '{"video_url": "https://www.youtube.com/embed/25ovCm9jKfA", "theory": ["lambda args: expression", "Hàm ngắn gọn một dòng", "square = lambda x: x**2", "Dùng khi cần hàm đơn giản", "Không cần def và return"]}'),
('b5555555-5555-5555-5555-555555555555', 'Map Function',
 'Áp dụng hàm lên từng phần tử.',
 'video', 1080, 2, false,
 '{"video_url": "https://www.youtube.com/embed/hUes6y2b--0", "theory": ["map(function, iterable)", "Trả về map object", "list(map(...)) để lấy list", "Kết hợp với lambda", "Thay thế vòng lặp"]}'),
('b5555555-5555-5555-5555-555555555555', 'Filter Function',
 'Lọc phần tử theo điều kiện.',
 'video', 1080, 3, false,
 '{"video_url": "https://www.youtube.com/embed/hUes6y2b--0", "theory": ["filter(function, iterable)", "Function trả về True/False", "Giữ lại phần tử True", "Kết hợp với lambda", "Lọc dữ liệu hiệu quả"]}'),
('b5555555-5555-5555-5555-555555555555', 'Reduce và Sorted',
 'Gộp và sắp xếp dữ liệu.',
 'video', 1200, 4, false,
 '{"video_url": "https://www.youtube.com/embed/hUes6y2b--0", "theory": ["from functools import reduce", "reduce(func, iterable)", "sorted(list, key=lambda)", "Sắp xếp theo tiêu chí", "reverse=True giảm dần"]}'),
('b5555555-5555-5555-5555-555555555555', 'Bài tập: Xử lý danh sách',
 'Dùng map, filter xử lý dữ liệu.',
 'exercise', 1500, 5, false,
 '{"starter_code": "# Danh sách điểm sinh viên\nscores = [45, 78, 92, 35, 88, 67, 55, 90]\n\n# 1. Lọc điểm >= 50 (đậu)\n# 2. Chuyển điểm sang thang 10\n# 3. Sắp xếp giảm dần\n", "solution": "scores = [45, 78, 92, 35, 88, 67, 55, 90]\n\n# Lọc điểm đậu\npassed = list(filter(lambda x: x >= 50, scores))\nprint(\"Đậu:\", passed)\n\n# Chuyển thang 10\nscale_10 = list(map(lambda x: x/10, scores))\nprint(\"Thang 10:\", scale_10)\n\n# Sắp xếp giảm dần\nsorted_scores = sorted(scores, reverse=True)\nprint(\"Giảm dần:\", sorted_scores)", "hints": ["filter với lambda x: x >= 50", "map với lambda x: x/10", "sorted với reverse=True"]}');

-- =============================================
-- SECTION 15: String Methods nâng cao
-- =============================================
INSERT INTO course_sections (id, course_id, title, description, order_index) VALUES
('b6666666-6666-6666-6666-666666666666', 'python-basics', 'String Methods Nâng cao', 'Xử lý chuỗi chuyên sâu', 15);

INSERT INTO course_lessons (section_id, title, description, lesson_type, video_duration, order_index, is_free, content) VALUES
('b6666666-6666-6666-6666-666666666666', 'Các phương thức String',
 'Methods xử lý chuỗi phổ biến.',
 'video', 1320, 1, false,
 '{"video_url": "https://www.youtube.com/embed/k9TUPpGqYTo", "theory": ["upper(), lower(), title()", "strip(), lstrip(), rstrip()", "replace(old, new)", "split(separator)", "join(list)"]}'),
('b6666666-6666-6666-6666-666666666666', 'Tìm kiếm trong String',
 'Tìm và kiểm tra chuỗi.',
 'video', 1080, 2, false,
 '{"video_url": "https://www.youtube.com/embed/k9TUPpGqYTo", "theory": ["find() trả về vị trí", "index() raise error nếu không có", "count() đếm số lần", "startswith(), endswith()", "in kiểm tra tồn tại"]}'),
('b6666666-6666-6666-6666-666666666666', 'Format String nâng cao',
 'Các cách format chuỗi.',
 'video', 1200, 3, false,
 '{"video_url": "https://www.youtube.com/embed/k9TUPpGqYTo", "theory": ["f-string: f\"{var}\"", "format(): \"{}\".format(var)", "% formatting: \"%s\" % var", "Format số: f\"{num:.2f}\"", "Căn lề: f\"{s:>10}\""]}'),
('b6666666-6666-6666-6666-666666666666', 'Bài tập: Xử lý văn bản',
 'Làm sạch và format văn bản.',
 'exercise', 1200, 4, false,
 '{"starter_code": "# Làm sạch và format văn bản\ntext = \"   hello WORLD python   \"\n\n# 1. Xóa khoảng trắng thừa\n# 2. Chuyển thành Title Case\n# 3. Thay \"python\" thành \"Python 3\"\n", "solution": "text = \"   hello WORLD python   \"\n\n# Xóa khoảng trắng\nclean = text.strip()\nprint(\"Clean:\", clean)\n\n# Title Case\ntitle = clean.title()\nprint(\"Title:\", title)\n\n# Thay thế\nresult = title.replace(\"Python\", \"Python 3\")\nprint(\"Result:\", result)", "hints": ["strip() xóa khoảng trắng", "title() viết hoa chữ đầu", "replace() thay thế chuỗi"]}');

-- =============================================
-- SECTION 16: Regular Expressions (Regex)
-- =============================================
INSERT INTO course_sections (id, course_id, title, description, order_index) VALUES
('b7777777-7777-7777-7777-777777777777', 'python-basics', 'Regular Expressions', 'Biểu thức chính quy', 16);

INSERT INTO course_lessons (section_id, title, description, lesson_type, video_duration, order_index, is_free, content) VALUES
('b7777777-7777-7777-7777-777777777777', 'Giới thiệu Regex',
 'Regex là gì và tại sao cần học.',
 'video', 1500, 1, false,
 '{"video_url": "https://www.youtube.com/embed/K8L6KVGG-7o", "theory": ["import re", "Pattern matching", "Tìm kiếm phức tạp", "Validate dữ liệu", "Extract thông tin"]}'),
('b7777777-7777-7777-7777-777777777777', 'Các ký tự đặc biệt',
 'Metacharacters trong regex.',
 'video', 1320, 2, false,
 '{"video_url": "https://www.youtube.com/embed/K8L6KVGG-7o", "theory": ["\\d: số, \\w: chữ/số", "\\s: khoảng trắng", ".: bất kỳ ký tự", "*: 0 hoặc nhiều", "+: 1 hoặc nhiều", "?: 0 hoặc 1"]}'),
('b7777777-7777-7777-7777-777777777777', 'Các hàm re phổ biến',
 'search, match, findall, sub.',
 'video', 1200, 3, false,
 '{"video_url": "https://www.youtube.com/embed/K8L6KVGG-7o", "theory": ["re.search() tìm đầu tiên", "re.match() tìm từ đầu", "re.findall() tìm tất cả", "re.sub() thay thế", "Groups: (pattern)"]}'),
('b7777777-7777-7777-7777-777777777777', 'Bài tập: Validate Email',
 'Kiểm tra định dạng email.',
 'exercise', 1500, 4, false,
 '{"starter_code": "import re\n\ndef validate_email(email):\n    # Pattern cho email hợp lệ\n    pattern = r\"\"\n    # Kiểm tra và return True/False\n    pass\n\n# Test\nprint(validate_email(\"test@gmail.com\"))\nprint(validate_email(\"invalid-email\"))", "solution": "import re\n\ndef validate_email(email):\n    pattern = r\"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$\"\n    return bool(re.match(pattern, email))\n\nprint(validate_email(\"test@gmail.com\"))  # True\nprint(validate_email(\"invalid-email\"))   # False", "hints": ["Pattern: username@domain.ext", "Dùng re.match()", "bool() chuyển kết quả"]}');

-- =============================================
-- SECTION 17: Decorators
-- =============================================
INSERT INTO course_sections (id, course_id, title, description, order_index) VALUES
('b8888888-8888-8888-8888-888888888888', 'python-basics', 'Decorators', 'Trang trí và mở rộng hàm', 17);

INSERT INTO course_lessons (section_id, title, description, lesson_type, video_duration, order_index, is_free, content) VALUES
('b8888888-8888-8888-8888-888888888888', 'Decorator là gì?',
 'Khái niệm và cách hoạt động.',
 'video', 1500, 1, false,
 '{"video_url": "https://www.youtube.com/embed/FsAPt_9Bf3U", "theory": ["Hàm nhận hàm làm tham số", "Trả về hàm mới", "@decorator syntax", "Mở rộng chức năng", "Không sửa code gốc"]}'),
('b8888888-8888-8888-8888-888888888888', 'Tạo Decorator đơn giản',
 'Viết decorator đầu tiên.',
 'video', 1320, 2, false,
 '{"video_url": "https://www.youtube.com/embed/FsAPt_9Bf3U", "theory": ["def decorator(func):", "def wrapper(*args):", "func(*args) gọi hàm gốc", "return wrapper", "@decorator trước hàm"]}'),
('b8888888-8888-8888-8888-888888888888', 'Decorator thực tế',
 'Các use cases phổ biến.',
 'video', 1200, 3, false,
 '{"video_url": "https://www.youtube.com/embed/FsAPt_9Bf3U", "theory": ["Logging decorator", "Timing decorator", "Authentication check", "@functools.wraps", "Decorator với tham số"]}'),
('b8888888-8888-8888-8888-888888888888', 'Bài tập: Timer Decorator',
 'Tạo decorator đo thời gian chạy.',
 'exercise', 1500, 4, false,
 '{"starter_code": "import time\n\ndef timer(func):\n    # Tạo wrapper đo thời gian\n    pass\n\n@timer\ndef slow_function():\n    time.sleep(1)\n    print(\"Done!\")\n\nslow_function()", "solution": "import time\n\ndef timer(func):\n    def wrapper(*args, **kwargs):\n        start = time.time()\n        result = func(*args, **kwargs)\n        end = time.time()\n        print(f\"{func.__name__} chạy trong {end-start:.2f}s\")\n        return result\n    return wrapper\n\n@timer\ndef slow_function():\n    time.sleep(1)\n    print(\"Done!\")\n\nslow_function()", "hints": ["Lưu time.time() trước và sau", "Gọi func(*args, **kwargs)", "In thời gian chênh lệch"]}');


-- =============================================
-- SECTION 18: Generators và Iterators
-- =============================================
INSERT INTO course_sections (id, course_id, title, description, order_index) VALUES
('b9999999-9999-9999-9999-999999999999', 'python-basics', 'Generators và Iterators', 'Xử lý dữ liệu hiệu quả', 18);

INSERT INTO course_lessons (section_id, title, description, lesson_type, video_duration, order_index, is_free, content) VALUES
('b9999999-9999-9999-9999-999999999999', 'Iterator Protocol',
 'Cách Python duyệt qua collections.',
 'video', 1200, 1, false,
 '{"video_url": "https://www.youtube.com/embed/jTYiNjvnHZY", "theory": ["__iter__() và __next__()", "iter(object) tạo iterator", "next(iterator) lấy phần tử", "StopIteration khi hết", "for loop dùng iterator"]}'),
('b9999999-9999-9999-9999-999999999999', 'Generator Functions',
 'Tạo iterator với yield.',
 'video', 1320, 2, false,
 '{"video_url": "https://www.youtube.com/embed/jTYiNjvnHZY", "theory": ["yield thay vì return", "Lazy evaluation", "Tiết kiệm memory", "Xử lý data lớn", "Generator expression"]}'),
('b9999999-9999-9999-9999-999999999999', 'Generator Expressions',
 'Cú pháp ngắn gọn cho generator.',
 'video', 1080, 3, false,
 '{"video_url": "https://www.youtube.com/embed/jTYiNjvnHZY", "theory": ["(x for x in range(10))", "Giống list comprehension", "Dùng () thay []", "Không tạo list trong memory", "Dùng một lần"]}'),
('b9999999-9999-9999-9999-999999999999', 'Bài tập: Fibonacci Generator',
 'Tạo generator sinh số Fibonacci.',
 'exercise', 1500, 4, false,
 '{"starter_code": "def fibonacci(n):\n    # Generator sinh n số Fibonacci đầu tiên\n    # 0, 1, 1, 2, 3, 5, 8, 13...\n    pass\n\n# Test: in 10 số Fibonacci đầu tiên\nfor num in fibonacci(10):\n    print(num)", "solution": "def fibonacci(n):\n    a, b = 0, 1\n    count = 0\n    while count < n:\n        yield a\n        a, b = b, a + b\n        count += 1\n\nfor num in fibonacci(10):\n    print(num)", "hints": ["Dùng yield thay return", "a, b = b, a + b", "Đếm số lần yield"]}');

-- =============================================
-- SECTION 19: Context Managers
-- =============================================
INSERT INTO course_sections (id, course_id, title, description, order_index) VALUES
('c1111111-1111-1111-1111-111111111111', 'python-basics', 'Context Managers', 'Quản lý resources với with', 19);

INSERT INTO course_lessons (section_id, title, description, lesson_type, video_duration, order_index, is_free, content) VALUES
('c1111111-1111-1111-1111-111111111111', 'With Statement',
 'Cách dùng with để quản lý resources.',
 'video', 1200, 1, false,
 '{"video_url": "https://www.youtube.com/embed/iba-I4CrmyA", "theory": ["with open() as f:", "Tự động đóng file", "Cleanup khi có lỗi", "__enter__ và __exit__", "Không cần finally"]}'),
('c1111111-1111-1111-1111-111111111111', 'Tạo Context Manager',
 'Viết context manager riêng.',
 'video', 1320, 2, false,
 '{"video_url": "https://www.youtube.com/embed/iba-I4CrmyA", "theory": ["Class với __enter__, __exit__", "@contextmanager decorator", "yield trong context manager", "Xử lý exception", "Multiple context managers"]}'),
('c1111111-1111-1111-1111-111111111111', 'Bài tập: Timer Context',
 'Tạo context manager đo thời gian.',
 'exercise', 1200, 3, false,
 '{"starter_code": "import time\nfrom contextlib import contextmanager\n\n@contextmanager\ndef timer(name):\n    # Đo thời gian thực thi code block\n    pass\n\n# Test\nwith timer(\"Test\"):\n    time.sleep(1)", "solution": "import time\nfrom contextlib import contextmanager\n\n@contextmanager\ndef timer(name):\n    start = time.time()\n    yield\n    end = time.time()\n    print(f\"{name}: {end-start:.2f}s\")\n\nwith timer(\"Test\"):\n    time.sleep(1)", "hints": ["Lưu start time trước yield", "yield để chạy code block", "Tính thời gian sau yield"]}');

-- =============================================
-- SECTION 20: Project Nâng cao - Quản lý Contacts
-- =============================================
INSERT INTO course_sections (id, course_id, title, description, order_index) VALUES
('c2222222-2222-2222-2222-222222222222', 'python-basics', 'Project: Contact Manager', 'Ứng dụng quản lý danh bạ', 20);

INSERT INTO course_lessons (section_id, title, description, lesson_type, video_duration, order_index, is_free, content) VALUES
('c2222222-2222-2222-2222-222222222222', 'Thiết kế Contact Manager',
 'Phân tích và thiết kế ứng dụng.',
 'video', 1500, 1, false,
 '{"video_url": "https://www.youtube.com/embed/8ext9G7xspg", "theory": ["Class Contact: name, phone, email", "Class ContactManager: CRUD", "Lưu trữ với JSON file", "Menu tương tác", "Tìm kiếm contacts"]}'),
('c2222222-2222-2222-2222-222222222222', 'Xây dựng Class Contact',
 'Tạo class đại diện contact.',
 'video', 1320, 2, false,
 '{"video_url": "https://www.youtube.com/embed/8ext9G7xspg", "theory": ["Attributes: name, phone, email", "Method to_dict()", "Method from_dict()", "__str__ hiển thị đẹp", "Validate dữ liệu"]}'),
('c2222222-2222-2222-2222-222222222222', 'Class ContactManager',
 'Quản lý danh sách contacts.',
 'video', 1500, 3, false,
 '{"video_url": "https://www.youtube.com/embed/8ext9G7xspg", "theory": ["add_contact()", "remove_contact()", "search_contact()", "save_to_file()", "load_from_file()"]}'),
('c2222222-2222-2222-2222-222222222222', 'Bài tập cuối khóa: Hoàn thiện App',
 'Hoàn thiện Contact Manager.',
 'exercise', 3600, 4, false,
 '{"starter_code": "import json\n\nclass Contact:\n    def __init__(self, name, phone, email):\n        pass\n    \n    def to_dict(self):\n        pass\n\nclass ContactManager:\n    def __init__(self):\n        self.contacts = []\n    \n    def add(self, contact):\n        pass\n    \n    def search(self, name):\n        pass\n    \n    def save(self, filename):\n        pass\n    \n    def load(self, filename):\n        pass", "solution": "import json\n\nclass Contact:\n    def __init__(self, name, phone, email):\n        self.name = name\n        self.phone = phone\n        self.email = email\n    \n    def to_dict(self):\n        return {\"name\": self.name, \"phone\": self.phone, \"email\": self.email}\n    \n    def __str__(self):\n        return f\"{self.name} | {self.phone} | {self.email}\"\n\nclass ContactManager:\n    def __init__(self):\n        self.contacts = []\n    \n    def add(self, contact):\n        self.contacts.append(contact)\n    \n    def search(self, name):\n        return [c for c in self.contacts if name.lower() in c.name.lower()]\n    \n    def save(self, filename):\n        with open(filename, \"w\") as f:\n            json.dump([c.to_dict() for c in self.contacts], f)\n    \n    def load(self, filename):\n        with open(filename, \"r\") as f:\n            data = json.load(f)\n            self.contacts = [Contact(**d) for d in data]", "hints": ["to_dict() trả về dictionary", "search dùng list comprehension", "json.dump() và json.load()"]}');

-- =============================================
-- SECTION 21: Bonus - Tips và Best Practices
-- =============================================
INSERT INTO course_sections (id, course_id, title, description, order_index) VALUES
('c3333333-3333-3333-3333-333333333333', 'python-basics', 'Bonus: Tips & Best Practices', 'Mẹo và thực hành tốt', 21);

INSERT INTO course_lessons (section_id, title, description, lesson_type, video_duration, order_index, is_free, content) VALUES
('c3333333-3333-3333-3333-333333333333', 'PEP 8 - Style Guide',
 'Quy tắc viết code Python chuẩn.',
 'video', 1200, 1, false,
 '{"video_url": "https://www.youtube.com/embed/hgI0p1zf31k", "theory": ["Indentation: 4 spaces", "Line length: 79 chars", "Naming conventions", "Import order", "Comments và docstrings"]}'),
('c3333333-3333-3333-3333-333333333333', 'Virtual Environments',
 'Quản lý dependencies với venv.',
 'video', 1080, 2, false,
 '{"video_url": "https://www.youtube.com/embed/APOPm01BVrk", "theory": ["python -m venv env", "Activate environment", "pip install packages", "requirements.txt", "Tách biệt projects"]}'),
('c3333333-3333-3333-3333-333333333333', 'Debugging Tips',
 'Kỹ thuật debug hiệu quả.',
 'video', 1320, 3, false,
 '{"video_url": "https://www.youtube.com/embed/5AYIe-3cD-s", "theory": ["print() debugging", "pdb debugger", "VS Code debugger", "Breakpoints", "Watch variables"]}'),
('c3333333-3333-3333-3333-333333333333', 'Tổng kết khóa học',
 'Ôn tập và hướng đi tiếp theo.',
 'video', 1500, 4, false,
 '{"video_url": "https://www.youtube.com/embed/rfscVS0vtbw", "theory": ["Ôn tập kiến thức", "Các framework: Django, Flask", "Data Science: Pandas, NumPy", "Machine Learning", "Tiếp tục học và thực hành"]}');

-- Cập nhật tổng số bài học
SELECT 'Đã mở rộng khóa học Python!' AS message;
SELECT 'Tổng: 21 Sections | 55+ Bài học' AS total;
SELECT 'Kiến thức mới: Tuple/Set, OOP, Exceptions, Modules, Lambda, Regex, Decorators, Generators, Context Managers' AS new_topics;
