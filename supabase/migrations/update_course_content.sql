-- Cập nhật nội dung chi tiết cho khóa học Advanced C++

-- Cập nhật content cho các bài học video (kiến thức lý thuyết)
UPDATE course_lessons SET content = jsonb_build_object(
  'theory', jsonb_build_array(
    'Inheritance (Kế thừa) cho phép class con kế thừa thuộc tính và phương thức từ class cha',
    'Polymorphism (Đa hình) cho phép sử dụng một interface chung cho nhiều kiểu dữ liệu khác nhau',
    'Virtual functions cho phép override methods trong derived classes',
    'Syntax: class Derived : public Base { ... }'
  ),
  'examples', jsonb_build_array(
    'class Animal { public: virtual void speak() { cout << ''Animal sound''; } };',
    'class Dog : public Animal { public: void speak() override { cout << ''Woof!''; } };',
    'Animal* ptr = new Dog(); ptr->speak(); // Output: Woof!'
  ),
  'keyPoints', jsonb_build_array(
    'Sử dụng virtual keyword để enable polymorphism',
    'Override keyword để rõ ràng hơn',
    'Base class pointer có thể trỏ đến derived class object'
  )
) WHERE title LIKE '%Inheritance%Polymorphism%';

UPDATE course_lessons SET content = jsonb_build_object(
  'theory', jsonb_build_array(
    'Virtual destructor đảm bảo destructor của derived class được gọi khi delete qua base pointer',
    'Late binding (dynamic binding) quyết định function nào được gọi tại runtime',
    'Early binding (static binding) quyết định tại compile time'
  ),
  'examples', jsonb_build_array(
    'class Base { public: virtual ~Base() { cout << ''Base destroyed''; } };',
    'class Derived : public Base { public: ~Derived() { cout << ''Derived destroyed''; } };',
    'Base* ptr = new Derived(); delete ptr; // Cả 2 destructors đều được gọi'
  )
) WHERE title LIKE '%Virtual Destructor%';

UPDATE course_lessons SET content = jsonb_build_object(
  'theory', jsonb_build_array(
    'Abstract class chứa ít nhất 1 pure virtual function',
    'Không thể tạo instance của abstract class',
    'Interface là abstract class chỉ chứa pure virtual functions',
    'Syntax: virtual void method() = 0; // pure virtual'
  ),
  'examples', jsonb_build_array(
    'class Shape { public: virtual double area() = 0; virtual double perimeter() = 0; };',
    'class Circle : public Shape { double r; public: double area() { return 3.14*r*r; } };'
  )
) WHERE title LIKE '%Abstract Class%';

-- Cập nhật content cho bài tập
UPDATE course_lessons SET content = jsonb_build_object(
  'description', 'Tạo hệ thống Shape với inheritance và polymorphism',
  'requirements', jsonb_build_array(
    'Tạo abstract class Shape với pure virtual functions: area(), perimeter()',
    'Implement 3 derived classes: Circle, Rectangle, Triangle',
    'Mỗi class phải override cả 2 methods',
    'Tạo array of Shape pointers và test polymorphism'
  ),
  'hints', jsonb_build_array(
    'Circle cần radius, Rectangle cần width/height, Triangle cần 3 sides',
    'Sử dụng virtual destructor trong Shape',
    'Test bằng cách tạo Shape* shapes[] = {new Circle(), new Rectangle()...}'
  ),
  'solution', 'class Shape { public: virtual ~Shape() {} virtual double area() = 0; virtual double perimeter() = 0; }; class Circle : public Shape { double r; public: Circle(double radius) : r(radius) {} double area() { return 3.14159*r*r; } double perimeter() { return 2*3.14159*r; } };',
  'testCases', jsonb_build_array(
    'Circle(5) -> area = 78.54, perimeter = 31.42',
    'Rectangle(4,6) -> area = 24, perimeter = 20',
    'Triangle(3,4,5) -> area = 6, perimeter = 12'
  )
) WHERE title LIKE '%Shape%' AND lesson_type = 'exercise';

UPDATE course_lessons SET content = jsonb_build_object(
  'description', 'Sửa memory leak trong code sử dụng polymorphism',
  'requirements', jsonb_build_array(
    'Tìm và sửa memory leak trong code cho sẵn',
    'Thêm virtual destructor vào đúng chỗ',
    'Verify bằng valgrind hoặc memory profiler'
  ),
  'buggyCode', 'class Base { public: ~Base() { cout << ''Base''; } }; class Derived : public Base { int* data; public: Derived() { data = new int[100]; } ~Derived() { delete[] data; } }; int main() { Base* ptr = new Derived(); delete ptr; }',
  'hints', jsonb_build_array(
    'Destructor của Derived không được gọi',
    'Thêm virtual keyword vào Base destructor',
    'Memory leak xảy ra vì data không được free'
  ),
  'solution', 'class Base { public: virtual ~Base() { cout << ''Base''; } }; // Thêm virtual'
) WHERE title LIKE '%Memory Management%Polymorphism%' AND lesson_type = 'exercise';

-- Templates & STL
UPDATE course_lessons SET content = jsonb_build_object(
  'theory', jsonb_build_array(
    'Function templates cho phép viết generic functions',
    'Compiler tự động deduce type từ arguments',
    'Template specialization cho specific types',
    'Syntax: template<typename T> T max(T a, T b) { return a > b ? a : b; }'
  ),
  'examples', jsonb_build_array(
    'template<typename T> void swap(T& a, T& b) { T temp = a; a = b; b = temp; }',
    'int x=5, y=10; swap(x, y); // T = int',
    'string s1="hi", s2="bye"; swap(s1, s2); // T = string'
  )
) WHERE title LIKE '%Function Templates%';

UPDATE course_lessons SET content = jsonb_build_object(
  'description', 'Viết generic swap, max, min functions',
  'requirements', jsonb_build_array(
    'Implement template<typename T> void swap(T& a, T& b)',
    'Implement template<typename T> T max(T a, T b)',
    'Implement template<typename T> T min(T a, T b)',
    'Test với int, double, string'
  ),
  'hints', jsonb_build_array(
    'Swap cần reference parameters (&)',
    'Max/min cần comparison operator (<, >)',
    'Có thể dùng std::move cho efficiency'
  ),
  'testCases', jsonb_build_array(
    'swap(5, 10) -> a=10, b=5',
    'max(3.14, 2.71) -> 3.14',
    'min("apple", "banana") -> "apple"'
  )
) WHERE title LIKE '%Generic Swap%' AND lesson_type = 'exercise';

-- Memory Management
UPDATE course_lessons SET content = jsonb_build_object(
  'theory', jsonb_build_array(
    'RAII: Resource Acquisition Is Initialization',
    'Constructor acquires resource, destructor releases it',
    'Tự động quản lý resource lifecycle',
    'Tránh memory leaks và resource leaks'
  ),
  'examples', jsonb_build_array(
    'class FileHandler { FILE* file; public: FileHandler(const char* name) { file = fopen(name, ''r''); } ~FileHandler() { if(file) fclose(file); } };',
    'void readFile() { FileHandler fh("data.txt"); // File tự động đóng khi ra khỏi scope }'
  )
) WHERE title LIKE '%RAII%';

UPDATE course_lessons SET content = jsonb_build_object(
  'theory', jsonb_build_array(
    'unique_ptr: exclusive ownership, không thể copy',
    'Tự động delete khi out of scope',
    'Move semantics để transfer ownership',
    'Syntax: std::unique_ptr<T> ptr = std::make_unique<T>(args);'
  ),
  'examples', jsonb_build_array(
    'std::unique_ptr<int> ptr = std::make_unique<int>(42);',
    'std::unique_ptr<int[]> arr = std::make_unique<int[]>(100);',
    'auto ptr2 = std::move(ptr); // Transfer ownership'
  )
) WHERE title LIKE '%unique_ptr%';

-- Data Structures
UPDATE course_lessons SET content = jsonb_build_object(
  'theory', jsonb_build_array(
    'Linked list: dynamic data structure với nodes',
    'Singly linked list: mỗi node trỏ đến next',
    'Doubly linked list: mỗi node trỏ đến next và prev',
    'Operations: insert, delete, search - O(n)'
  ),
  'examples', jsonb_build_array(
    'struct Node { int data; Node* next; };',
    'void insertFront(Node*& head, int val) { Node* newNode = new Node{val, head}; head = newNode; }'
  )
) WHERE title LIKE '%Linked List%';

UPDATE course_lessons SET content = jsonb_build_object(
  'description', 'Implement generic LinkedList<T>',
  'requirements', jsonb_build_array(
    'Template class LinkedList<T>',
    'Methods: pushFront, pushBack, remove, find, reverse',
    'Support iteration',
    'Proper memory management'
  ),
  'hints', jsonb_build_array(
    'Sử dụng struct Node<T> { T data; Node* next; }',
    'Reverse: dùng 3 pointers (prev, curr, next)',
    'Destructor phải delete tất cả nodes'
  ),
  'testCases', jsonb_build_array(
    'LinkedList<int> list; list.pushBack(1); list.pushBack(2);',
    'list.find(2) -> true',
    'list.reverse(); // 2 -> 1'
  )
) WHERE title LIKE '%Generic Linked List%' AND lesson_type = 'exercise';

-- Advanced Techniques
UPDATE course_lessons SET content = jsonb_build_object(
  'theory', jsonb_build_array(
    'Exception handling: try-catch-throw mechanism',
    'Exception hierarchy: std::exception base class',
    'Custom exceptions: inherit từ std::exception',
    'RAII ensures exception safety'
  ),
  'examples', jsonb_build_array(
    'try { throw std::runtime_error("Error!"); } catch(const std::exception& e) { cout << e.what(); }',
    'class MyException : public std::exception { const char* what() const noexcept { return "My error"; } };'
  )
) WHERE title LIKE '%Exception Handling%';

UPDATE course_lessons SET content = jsonb_build_object(
  'theory', jsonb_build_array(
    'Lambda: anonymous function objects',
    'Syntax: [capture](params) -> return_type { body }',
    'Capture modes: [=] by value, [&] by reference, [x, &y] mixed',
    'Sử dụng với STL algorithms'
  ),
  'examples', jsonb_build_array(
    'auto add = [](int a, int b) { return a + b; }; cout << add(3, 4);',
    'vector<int> v = {1,2,3,4,5}; auto it = find_if(v.begin(), v.end(), [](int x) { return x > 3; });',
    'int factor = 10; transform(v.begin(), v.end(), v.begin(), [factor](int x) { return x * factor; });'
  )
) WHERE title LIKE '%Lambda%';

UPDATE course_lessons SET content = jsonb_build_object(
  'theory', jsonb_build_array(
    'std::thread: tạo và quản lý threads',
    'join(): đợi thread kết thúc',
    'detach(): thread chạy độc lập',
    'Thread safety: cẩn thận với shared data'
  ),
  'examples', jsonb_build_array(
    'void task() { cout << "Thread running"; } int main() { std::thread t(task); t.join(); }',
    'std::thread t([](int n) { for(int i=0; i<n; i++) cout << i; }, 10); t.join();'
  )
) WHERE title LIKE '%Multithreading%';

SELECT 'Đã cập nhật nội dung chi tiết cho tất cả bài học!' AS message;
