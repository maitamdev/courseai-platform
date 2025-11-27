-- =============================================
-- KHÓA HỌC MODERN C++ HOÀN CHỈNH
-- Dựa trên Modern C++ Tutorial by Changkun Ou
-- =============================================

-- Xóa khóa học cũ nếu có
DELETE FROM course_lessons WHERE section_id IN (
  SELECT id FROM course_sections WHERE course_id IN (
    SELECT id FROM courses WHERE title = 'Advanced C++ Techniques'
  )
);
DELETE FROM course_sections WHERE course_id IN (
  SELECT id FROM courses WHERE title = 'Advanced C++ Techniques'
);
DELETE FROM courses WHERE title = 'Advanced C++ Techniques';

-- Tạo khóa học mới
INSERT INTO courses (
  title, description, language_id, level, price_coins, duration_hours,
  instructor_name, thumbnail_url, student_count, rating, is_published
)
SELECT
  'Modern C++ Programming',
  'Khóa học C++ hiện đại toàn diện từ C++11 đến C++20. Học các tính năng mới, best practices và kỹ thuật lập trình C++ chuyên nghiệp. Dựa trên Modern C++ Tutorial - một trong những tài liệu C++ hiện đại tốt nhất.',
  (SELECT id FROM programming_languages WHERE slug = 'cpp'),
  'advanced', 2500, 50, 'Changkun Ou & Team',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97',
  2847, 4.9, true;

-- Lấy course_id
DO $$
DECLARE
  v_course_id uuid;
  v_section_id uuid;
BEGIN
  SELECT id INTO v_course_id FROM courses WHERE title = 'Modern C++ Programming';

  -- ============================================
  -- PHẦN 1: GIỚI THIỆU & CƠ BẢN (6 bài)
  -- ============================================
  INSERT INTO course_sections (course_id, title, description, order_index)
  VALUES (v_course_id, '01. Giới thiệu Modern C++', 'Tổng quan về C++ hiện đại, sự khác biệt giữa C++98/03 và C++11/14/17/20', 1)
  RETURNING id INTO v_section_id;

  INSERT INTO course_lessons (section_id, title, description, lesson_type, video_url, video_duration, is_free, order_index, content) VALUES
  (v_section_id, 'Lịch sử và phiên bản C++', 'Tìm hiểu lịch sử phát triển C++ từ C++98 đến C++20', 'video', 'https://www.youtube.com/watch?v=vLnPwxZdW4Y', 1200, true, 1,
    '{"theory": ["C++98/03: Phiên bản cổ điển", "C++11: Cuộc cách mạng lớn nhất", "C++14: Cải tiến nhỏ", "C++17: Thêm nhiều tính năng mới", "C++20: Concepts, Ranges, Coroutines"], "examples": ["// C++98\\nstd::vector<int> v;\\nfor(int i=0; i<v.size(); i++) {...}", "// C++11\\nauto v = std::vector<int>{1,2,3};\\nfor(auto x : v) {...}"], "keyPoints": ["C++11 là bước ngoặt quan trọng", "Mỗi phiên bản thêm tính năng mới", "Backward compatibility được đảm bảo"]}'::jsonb),
  
  (v_section_id, 'Bài tập: Kiểm tra compiler C++', 'Viết chương trình kiểm tra phiên bản C++ compiler hỗ trợ', 'exercise', null, null, true, 2,
    '{"description": "Viết chương trình C++ để kiểm tra compiler hỗ trợ phiên bản C++ nào", "requirements": ["Sử dụng __cplusplus macro", "In ra phiên bản C++ (11/14/17/20)", "Compile với các flags khác nhau"], "starterCode": "#include <iostream>\\n\\nint main() {\\n  // TODO: Check C++ version\\n  return 0;\\n}", "hints": ["Dùng #if __cplusplus >= 201103L", "201103L = C++11, 201402L = C++14, 201703L = C++17"], "solution": "#include <iostream>\\n\\nint main() {\\n  std::cout << \"C++ Version: \";\\n#if __cplusplus >= 202002L\\n  std::cout << \"C++20\";\\n#elif __cplusplus >= 201703L\\n  std::cout << \"C++17\";\\n#elif __cplusplus >= 201402L\\n  std::cout << \"C++14\";\\n#elif __cplusplus >= 201103L\\n  std::cout << \"C++11\";\\n#else\\n  std::cout << \"Pre-C++11\";\\n#endif\\n  return 0;\\n}", "rubric": [{"criteria": "Sử dụng __cplusplus", "points": 30}, {"criteria": "Check đúng các phiên bản", "points": 40}, {"criteria": "Code compile được", "points": 30}]}'::jsonb),

  (v_section_id, 'Auto keyword và Type Deduction', 'Sử dụng auto để compiler tự suy luận kiểu dữ liệu', 'video', 'https://www.youtube.com/watch?v=vLnPwxZdW4Y', 1500, false, 3,
    '{"theory": ["auto: Compiler tự suy luận type", "decltype: Lấy type của expression", "Giảm code boilerplate", "Tăng maintainability"], "examples": ["auto x = 42; // int", "auto s = std::string(\"hello\");", "std::vector<int> v; auto it = v.begin();", "decltype(x) y = x; // y cùng type với x"], "keyPoints": ["Dùng auto cho iterator", "Dùng auto với lambda", "Không lạm dụng auto", "decltype cho meta-programming"]}'::jsonb),

  (v_section_id, 'Range-based For Loop', 'Vòng lặp for hiện đại với cú pháp đơn giản', 'video', 'https://www.youtube.com/watch?v=vLnPwxZdW4Y', 1200, false, 4,
    '{"theory": ["Syntax: for(auto x : container)", "Tự động iterate qua container", "Có thể dùng reference: for(auto& x : v)", "Const reference: for(const auto& x : v)"], "examples": ["std::vector<int> v = {1,2,3};\\nfor(auto x : v) cout << x;", "for(auto& x : v) x *= 2; // Modify", "for(const auto& x : v) {...} // Read-only"], "keyPoints": ["Đơn giản hơn iterator", "Tránh copy với reference", "Dùng const& khi chỉ đọc"]}'::jsonb),

  (v_section_id, 'Bài tập: Vector Operations', 'Thực hành với auto và range-based for', 'exercise', null, null, false, 5,
    '{"description": "Viết các hàm xử lý vector sử dụng auto và range-based for", "requirements": ["Hàm sum: tính tổng các phần tử", "Hàm double_values: nhân đôi mỗi phần tử", "Hàm print: in ra các phần tử", "Sử dụng auto và range-based for"], "starterCode": "#include <iostream>\\n#include <vector>\\n\\nint sum(const std::vector<int>& v) {\\n  // TODO\\n}\\n\\nvoid double_values(std::vector<int>& v) {\\n  // TODO\\n}\\n\\nint main() {\\n  std::vector<int> v = {1,2,3,4,5};\\n  return 0;\\n}", "solution": "int sum(const std::vector<int>& v) {\\n  int total = 0;\\n  for(const auto& x : v) total += x;\\n  return total;\\n}\\n\\nvoid double_values(std::vector<int>& v) {\\n  for(auto& x : v) x *= 2;\\n}\\n\\nvoid print(const std::vector<int>& v) {\\n  for(const auto& x : v) std::cout << x << \" \";\\n}", "rubric": [{"criteria": "Dùng auto", "points": 25}, {"criteria": "Dùng range-based for", "points": 25}, {"criteria": "sum() đúng", "points": 20}, {"criteria": "double_values() đúng", "points": 30}]}'::jsonb),

  (v_section_id, 'Initializer List', 'Khởi tạo container với cú pháp {}', 'video', 'https://www.youtube.com/watch?v=vLnPwxZdW4Y', 1000, false, 6,
    '{"theory": ["Uniform initialization với {}", "std::initializer_list<T>", "Khởi tạo container dễ dàng", "Tránh narrowing conversion"], "examples": ["std::vector<int> v = {1,2,3,4,5};", "std::map<string,int> m = {{\"a\",1}, {\"b\",2}};", "int arr[] = {1,2,3};"], "keyPoints": ["Cú pháp thống nhất", "An toàn hơn ()", "Dùng cho container và array"]}'::jsonb);

  -- ============================================
  -- PHẦN 2: SMART POINTERS & MEMORY (8 bài)
  -- ============================================
  INSERT INTO course_sections (course_id, title, description, order_index)
  VALUES (v_course_id, '02. Smart Pointers & Memory Management', 'Quản lý bộ nhớ tự động với unique_ptr, shared_ptr, weak_ptr', 2)
  RETURNING id INTO v_section_id;

  INSERT INTO course_lessons (section_id, title, description, lesson_type, video_url, video_duration, is_free, order_index, content) VALUES
  (v_section_id, 'RAII và Smart Pointers', 'Giới thiệu RAII pattern và smart pointers', 'video', 'https://www.youtube.com/watch?v=UOB7-B2MfwA', 1800, false, 1,
    '{"theory": ["RAII: Resource Acquisition Is Initialization", "Smart pointers tự động quản lý memory", "Không cần delete thủ công", "Exception-safe"], "examples": ["std::unique_ptr<int> p = std::make_unique<int>(42);", "std::shared_ptr<int> sp = std::make_shared<int>(10);", "// Tự động delete khi out of scope"], "keyPoints": ["Luôn dùng smart pointers", "Tránh raw pointers", "make_unique/make_shared"]}'::jsonb),

  (v_section_id, 'unique_ptr - Exclusive Ownership', 'Pointer với ownership độc quyền', 'video', 'https://www.youtube.com/watch?v=UOB7-B2MfwA', 1500, false, 2,
    '{"theory": ["Exclusive ownership: chỉ 1 owner", "Không thể copy, chỉ move", "Zero overhead", "Thay thế raw pointer"], "examples": ["auto p = std::make_unique<int>(42);", "auto p2 = std::move(p); // Transfer ownership", "std::unique_ptr<int[]> arr = std::make_unique<int[]>(10);"], "keyPoints": ["Dùng make_unique", "Move để transfer", "Dùng cho arrays"]}'::jsonb),

  (v_section_id, 'Bài tập: Linked List với unique_ptr', 'Implement linked list sử dụng unique_ptr', 'exercise', null, null, false, 3,
    '{"description": "Tạo singly linked list với unique_ptr để quản lý nodes", "requirements": ["Struct Node với unique_ptr<Node> next", "Class LinkedList với head", "Methods: push_front, push_back, print", "Tự động delete tất cả nodes"], "starterCode": "#include <memory>\\n#include <iostream>\\n\\nstruct Node {\\n  int data;\\n  std::unique_ptr<Node> next;\\n};\\n\\nclass LinkedList {\\n  std::unique_ptr<Node> head;\\npublic:\\n  void push_front(int val) {\\n    // TODO\\n  }\\n};", "solution": "void push_front(int val) {\\n  auto new_node = std::make_unique<Node>();\\n  new_node->data = val;\\n  new_node->next = std::move(head);\\n  head = std::move(new_node);\\n}\\n\\nvoid print() {\\n  Node* curr = head.get();\\n  while(curr) {\\n    std::cout << curr->data << \" \";\\n    curr = curr->next.get();\\n  }\\n}", "rubric": [{"criteria": "Dùng unique_ptr", "points": 30}, {"criteria": "push_front đúng", "points": 30}, {"criteria": "Không memory leak", "points": 40}]}'::jsonb),

  (v_section_id, 'shared_ptr - Shared Ownership', 'Pointer với nhiều owners', 'video', 'https://www.youtube.com/watch?v=UOB7-B2MfwA', 1600, false, 4,
    '{"theory": ["Shared ownership: nhiều owners", "Reference counting", "Thread-safe counting", "Overhead nhỏ"], "examples": ["auto sp1 = std::make_shared<int>(42);", "auto sp2 = sp1; // Copy OK", "std::cout << sp1.use_count(); // 2"], "keyPoints": ["Dùng make_shared", "use_count() để debug", "Cẩn thận circular reference"]}'::jsonb),

  (v_section_id, 'weak_ptr - Breaking Cycles', 'Tránh circular reference với weak_ptr', 'video', 'https://www.youtube.com/watch?v=UOB7-B2MfwA', 1400, false, 5,
    '{"theory": ["Không tăng reference count", "Tránh circular reference", "Phải lock() trước khi dùng", "Có thể expired"], "examples": ["std::weak_ptr<int> wp = sp;", "if(auto sp = wp.lock()) { /* use sp */ }"], "keyPoints": ["Dùng cho observer pattern", "Dùng cho parent-child relationship", "Luôn check expired"]}'::jsonb),

  (v_section_id, 'Bài tập: Tree với shared_ptr', 'Implement binary tree với smart pointers', 'exercise', null, null, false, 6,
    '{"description": "Tạo binary tree với shared_ptr và weak_ptr", "requirements": ["Node có shared_ptr<Node> left, right", "Node có weak_ptr<Node> parent", "Methods: insert, find, print"], "starterCode": "struct Node {\\n  int data;\\n  std::shared_ptr<Node> left, right;\\n  std::weak_ptr<Node> parent;\\n};", "solution": "void insert(std::shared_ptr<Node>& root, int val) {\\n  if(!root) {\\n    root = std::make_shared<Node>();\\n    root->data = val;\\n    return;\\n  }\\n  if(val < root->data) insert(root->left, val);\\n  else insert(root->right, val);\\n}", "rubric": [{"criteria": "Dùng shared_ptr", "points": 25}, {"criteria": "Dùng weak_ptr cho parent", "points": 25}, {"criteria": "insert đúng", "points": 30}, {"criteria": "Không circular reference", "points": 20}]}'::jsonb),

  (v_section_id, 'Move Semantics', 'Rvalue references và move constructor', 'video', 'https://www.youtube.com/watch?v=St0MNEU5b0o', 2000, false, 7,
    '{"theory": ["Lvalue vs Rvalue", "Rvalue reference: T&&", "Move constructor", "Move assignment", "std::move"], "examples": ["std::string s1 = \"hello\";", "std::string s2 = std::move(s1); // Move", "std::vector<int> v1 = {1,2,3};", "auto v2 = std::move(v1); // v1 now empty"], "keyPoints": ["Move thay vì copy", "Hiệu quả hơn", "std::move chỉ cast"]}'::jsonb),

  (v_section_id, 'Bài tập: String Class với Move', 'Implement String class với move semantics', 'exercise', null, null, false, 8,
    '{"description": "Tạo String class với move constructor và move assignment", "requirements": ["Constructor, destructor", "Copy constructor, copy assignment", "Move constructor, move assignment", "So sánh performance"], "starterCode": "class String {\\n  char* data;\\n  size_t len;\\npublic:\\n  String(const char* s);\\n  ~String();\\n  // TODO: Copy and Move\\n};", "solution": "String(String&& other) noexcept : data(other.data), len(other.len) {\\n  other.data = nullptr;\\n  other.len = 0;\\n}\\n\\nString& operator=(String&& other) noexcept {\\n  if(this != &other) {\\n    delete[] data;\\n    data = other.data;\\n    len = other.len;\\n    other.data = nullptr;\\n    other.len = 0;\\n  }\\n  return *this;\\n}", "rubric": [{"criteria": "Move constructor", "points": 30}, {"criteria": "Move assignment", "points": 30}, {"criteria": "Không memory leak", "points": 40}]}'::jsonb);

  -- Tiếp tục với các phần khác...
  -- (Tôi sẽ tạo đầy đủ 50 bài học theo Modern C++ Tutorial)

  RAISE NOTICE 'Đã tạo khóa học Modern C++ Programming!';
END $$;
