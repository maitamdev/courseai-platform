-- Cập nhật NỘI DUNG ĐẦY ĐỦ cho tất cả 45 bài học

-- ============================================
-- PHẦN 1: OOP NÂNG CAO
-- ============================================

-- Bài 1: Inheritance và Polymorphism
UPDATE course_lessons SET content = jsonb_build_object(
  'theory', jsonb_build_array(
    'Inheritance (Kế thừa): Cho phép class con kế thừa thuộc tính và phương thức từ class cha',
    'Polymorphism (Đa hình): Một interface có thể có nhiều implementations khác nhau',
    'Virtual functions: Cho phép override methods trong derived classes',
    'Late binding: Quyết định function nào được gọi tại runtime, không phải compile time',
    'Syntax: class Derived : public Base { ... }',
    'Access specifiers: public (kế thừa public), protected (kế thừa protected), private (kế thừa private)'
  ),
  'examples', jsonb_build_array(
    'class Animal { public: virtual void speak() { cout << ''Animal sound''; } };',
    'class Dog : public Animal { public: void speak() override { cout << ''Woof!''; } };',
    'class Cat : public Animal { public: void speak() override { cout << ''Meow!''; } };',
    'Animal* animals[] = {new Dog(), new Cat()}; for(auto a : animals) a->speak();'
  ),
  'keyPoints', jsonb_build_array(
    'Sử dụng virtual keyword để enable polymorphism',
    'Override keyword để rõ ràng hơn (C++11)',
    'Base class pointer có thể trỏ đến derived class object',
    'Virtual function table (vtable) được sử dụng để implement polymorphism',
    'Có overhead nhỏ về memory và performance khi dùng virtual functions'
  ),
  'videoTimestamps', jsonb_build_array(
    '00:00 - Giới thiệu Inheritance',
    '05:30 - Polymorphism là gì',
    '12:00 - Virtual functions',
    '18:45 - Ví dụ thực tế',
    '25:00 - Best practices'
  )
) WHERE title LIKE '%Inheritance%Polymorphism%' AND lesson_type = 'video';

-- Bài 2: Bài tập Shape System
UPDATE course_lessons SET content = jsonb_build_object(
  'description', 'Tạo hệ thống Shape hierarchy với inheritance và polymorphism để quản lý các hình học',
  'difficulty', 'Medium',
  'estimatedTime', '45 phút',
  'requirements', jsonb_build_array(
    'Tạo abstract class Shape với pure virtual functions: area() và perimeter()',
    'Implement 3 derived classes: Circle (hình tròn), Rectangle (hình chữ nhật), Triangle (tam giác)',
    'Mỗi class phải override cả 2 methods area() và perimeter()',
    'Tạo array of Shape pointers và test polymorphism',
    'Implement virtual destructor trong Shape class',
    'Thêm method display() để in thông tin hình'
  ),
  'starterCode', 'class Shape {\npublic:\n  // TODO: Thêm pure virtual functions\n};\n\nclass Circle : public Shape {\n  // TODO: Implement\n};\n\nint main() {\n  // TODO: Test code\n  return 0;\n}',
  'hints', jsonb_build_array(
    'Circle cần radius, công thức: area = π*r², perimeter = 2*π*r',
    'Rectangle cần width và height, công thức: area = w*h, perimeter = 2*(w+h)',
    'Triangle cần 3 sides (a,b,c), dùng Heron formula cho area',
    'Sử dụng virtual destructor: virtual ~Shape() {}',
    'Test bằng: Shape* shapes[] = {new Circle(5), new Rectangle(4,6)...}',
    'Nhớ delete các pointers sau khi dùng'
  ),
  'testCases', jsonb_build_array(
    jsonb_build_object('input', 'Circle(5)', 'expectedArea', 78.54, 'expectedPerimeter', 31.42),
    jsonb_build_object('input', 'Rectangle(4,6)', 'expectedArea', 24, 'expectedPerimeter', 20),
    jsonb_build_object('input', 'Triangle(3,4,5)', 'expectedArea', 6, 'expectedPerimeter', 12)
  ),
  'solution', 'class Shape {\npublic:\n  virtual ~Shape() {}\n  virtual double area() = 0;\n  virtual double perimeter() = 0;\n  virtual void display() = 0;\n};\n\nclass Circle : public Shape {\n  double r;\npublic:\n  Circle(double radius) : r(radius) {}\n  double area() override { return 3.14159 * r * r; }\n  double perimeter() override { return 2 * 3.14159 * r; }\n  void display() override { cout << "Circle(r=" << r << ")"; }\n};\n\nclass Rectangle : public Shape {\n  double w, h;\npublic:\n  Rectangle(double width, double height) : w(width), h(height) {}\n  double area() override { return w * h; }\n  double perimeter() override { return 2 * (w + h); }\n  void display() override { cout << "Rectangle(" << w << "x" << h << ")"; }\n};\n\nclass Triangle : public Shape {\n  double a, b, c;\npublic:\n  Triangle(double side1, double side2, double side3) : a(side1), b(side2), c(side3) {}\n  double area() override {\n    double s = (a + b + c) / 2;\n    return sqrt(s * (s-a) * (s-b) * (s-c));\n  }\n  double perimeter() override { return a + b + c; }\n  void display() override { cout << "Triangle(" << a << "," << b << "," << c << ")"; }\n};',
  'rubric', jsonb_build_array(
    jsonb_build_object('criteria', 'Abstract class Shape đúng', 'points', 20),
    jsonb_build_object('criteria', 'Circle implementation', 'points', 20),
    jsonb_build_object('criteria', 'Rectangle implementation', 'points', 20),
    jsonb_build_object('criteria', 'Triangle implementation', 'points', 20),
    jsonb_build_object('criteria', 'Virtual destructor', 'points', 10),
    jsonb_build_object('criteria', 'Test cases pass', 'points', 10)
  )
) WHERE title LIKE '%Shape%' AND lesson_type = 'exercise';

-- Tiếp tục với các bài khác...
-- (Do giới hạn độ dài, tôi sẽ tạo script riêng cho từng phần)

SELECT 'Đã cập nhật nội dung chi tiết!' AS message;
