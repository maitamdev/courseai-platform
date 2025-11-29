-- =============================================
-- PYTHON QUESTIONS TABLE
-- =============================================

-- 1. Python Questions table
CREATE TABLE IF NOT EXISTS python_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  hint TEXT,
  difficulty INTEGER DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 4),
  category VARCHAR(50) DEFAULT 'General',
  is_active BOOLEAN DEFAULT true,
  times_asked INTEGER DEFAULT 0,
  times_correct INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE python_questions ENABLE ROW LEVEL SECURITY;

-- Policy
DROP POLICY IF EXISTS "Anyone can view questions" ON python_questions;
CREATE POLICY "Anyone can view questions" ON python_questions FOR SELECT USING (true);

-- Insert 50 Python questions
INSERT INTO python_questions (question, answer, hint, difficulty, category) VALUES
-- Basic (Level 1)
('print(2 ** 3) = ?', '8', '** là phép lũy thừa', 1, 'Math'),
('type(''hello'') = ?', 'str', 'String trong Python', 1, 'Types'),
('len([1, 2, 3]) = ?', '3', 'len() đếm số phần tử', 1, 'List'),
('10 // 3 = ?', '3', '// là chia lấy phần nguyên', 1, 'Math'),
('10 % 3 = ?', '1', '% là chia lấy dư', 1, 'Math'),
('bool(0) = ?', 'false', '0 là falsy value', 1, 'Types'),
('bool(''hi'') = ?', 'true', 'String không rỗng là truthy', 1, 'Types'),
('[1,2,3][0] = ?', '1', 'Index bắt đầu từ 0', 1, 'List'),
('''hello''[1] = ?', 'e', 'String cũng có index', 1, 'String'),
('''ab'' * 3 = ?', 'ababab', 'Nhân string lặp lại', 1, 'String'),
('type(123) = ?', 'int', 'Số nguyên', 1, 'Types'),
('type(3.14) = ?', 'float', 'Số thực', 1, 'Types'),
-- Medium (Level 2)
('max([5,2,8,1]) = ?', '8', 'Giá trị lớn nhất', 2, 'List'),
('min([5,2,8,1]) = ?', '1', 'Giá trị nhỏ nhất', 2, 'List'),
('sum([1,2,3,4]) = ?', '10', 'Tổng các phần tử', 2, 'List'),
('abs(-5) = ?', '5', 'Giá trị tuyệt đối', 2, 'Math'),
('round(3.7) = ?', '4', 'Làm tròn', 2, 'Math'),
('''hello''.upper() = ?', 'HELLO', 'Chữ hoa', 2, 'String'),
('''HELLO''.lower() = ?', 'hello', 'Chữ thường', 2, 'String'),
('len(''python'') = ?', '6', 'Độ dài string', 2, 'String'),
('[1,2] + [3,4] = ?', '[1, 2, 3, 4]', 'Nối list', 2, 'List'),
('sorted([3,1,2]) = ?', '[1, 2, 3]', 'Sắp xếp tăng dần', 2, 'List'),
('''hello''.replace(''l'',''x'') = ?', 'hexxo', 'Thay thế ký tự', 2, 'String'),
('list(range(5)) = ?', '[0, 1, 2, 3, 4]', 'range(5) tạo 0-4', 2, 'List'),
('''a,b,c''.split('','') = ?', '[''a'', ''b'', ''c'']', 'Tách string', 2, 'String'),
('''-''.join([''a'',''b'']) = ?', 'a-b', 'Nối với dấu', 2, 'String'),
('pow(2, 3) = ?', '8', '2 mũ 3', 2, 'Math'),
('''hello''.startswith(''he'') = ?', 'true', 'Kiểm tra đầu string', 2, 'String'),
('''hello''.endswith(''lo'') = ?', 'true', 'Kiểm tra cuối string', 2, 'String'),
-- Hard (Level 3)
('int(''42'') = ?', '42', 'String to int', 3, 'Types'),
('str(123) = ?', '123', 'Int to string', 3, 'Types'),
('float(''3.14'') = ?', '3.14', 'String to float', 3, 'Types'),
('list(''abc'') = ?', '[''a'', ''b'', ''c'']', 'String to list', 3, 'Types'),
('tuple([1,2,3]) = ?', '(1, 2, 3)', 'List to tuple', 3, 'Types'),
('set([1,1,2,2,3]) = ?', '{1, 2, 3}', 'Loại bỏ trùng lặp', 3, 'Types'),
('''hello''[::-1] = ?', 'olleh', 'Đảo ngược string', 3, 'String'),
('[1,2,3][-1] = ?', '3', 'Index âm lấy từ cuối', 3, 'List'),
('[1,2,3,4,5][1:4] = ?', '[2, 3, 4]', 'Slicing list', 3, 'List'),
('divmod(10, 3) = ?', '(3, 1)', 'Thương và dư', 3, 'Math'),
('bin(10) = ?', '0b1010', 'Chuyển sang nhị phân', 3, 'Math'),
('hex(255) = ?', '0xff', 'Chuyển sang hex', 3, 'Math'),
('chr(65) = ?', 'A', 'ASCII code to char', 3, 'String'),
('ord(''A'') = ?', '65', 'Char to ASCII code', 3, 'String'),
-- Expert (Level 4)
('all([True, True, False]) = ?', 'false', 'Tất cả phải True', 4, 'Logic'),
('any([False, False, True]) = ?', 'true', 'Có ít nhất 1 True', 4, 'Logic'),
('[x**2 for x in range(4)] = ?', '[0, 1, 4, 9]', 'List comprehension', 4, 'List'),
('isinstance([], list) = ?', 'true', 'Kiểm tra kiểu dữ liệu', 4, 'Types'),
('''hello''.count(''l'') = ?', '2', 'Đếm ký tự', 4, 'String'),
('list(reversed([1,2,3])) = ?', '[3, 2, 1]', 'Đảo ngược list', 4, 'List'),
('{1,2} | {2,3} = ?', '{1, 2, 3}', 'Union của set', 4, 'Types')
ON CONFLICT DO NOTHING;
