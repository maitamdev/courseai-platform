-- =============================================
-- KHOÁ 1: REACT.JS TỪ CƠ BẢN ĐẾN NÂNG CAO
-- =============================================

DO $$
DECLARE
  v_course_id uuid;
  v_section_id uuid;
  js_id uuid;
BEGIN
  SELECT id INTO js_id FROM programming_languages WHERE slug = 'javascript';

  -- Tạo khóa học
  INSERT INTO courses (
    title, description, language_id, level, price_coins, duration_hours,
    instructor_name, thumbnail_url, student_count, rating, is_published
  ) VALUES (
    'React.js Từ Cơ Bản Đến Nâng Cao',
    'Khóa học React.js toàn diện từ cơ bản đến nâng cao. Học Components, Hooks, State Management, React Router, và xây dựng ứng dụng thực tế. Phù hợp cho người mới bắt đầu và muốn trở thành React Developer chuyên nghiệp.',
    js_id, 'intermediate', 150, 25, 'Nguyễn Văn Minh',
    'https://images.unsplash.com/photo-1633356122544-f134324a6cee',
    1250, 4.8, true
  ) RETURNING id INTO v_course_id;

  -- ============================================
  -- PHẦN 1: REACT CƠ BẢN (8 bài)
  -- ============================================
  INSERT INTO course_sections (course_id, title, description, order_index)
  VALUES (v_course_id, '01. React Fundamentals', 'Nền tảng React: JSX, Components, Props, State', 1)
  RETURNING id INTO v_section_id;

  INSERT INTO course_lessons (section_id, title, description, lesson_type, video_url, video_duration, is_free, order_index, content) VALUES
  (v_section_id, 'Giới thiệu React và Setup', 'Tìm hiểu React là gì, tại sao dùng React và setup môi trường', 'video', 'https://www.youtube.com/watch?v=Tn6-PIqc4UM', 1200, true, 1,
    '{"theory": ["React là thư viện UI của Facebook", "Virtual DOM và hiệu suất", "Component-based architecture", "Declarative programming"], "examples": ["npx create-react-app my-app", "npm start", "// App.js\\nfunction App() {\\n  return <h1>Hello React!</h1>;\\n}"], "keyPoints": ["React chỉ là View layer", "JSX = JavaScript + XML", "Components là building blocks", "Unidirectional data flow"]}'::jsonb),

  (v_section_id, 'JSX Syntax', 'Cú pháp JSX và cách viết HTML trong JavaScript', 'video', 'https://www.youtube.com/watch?v=Tn6-PIqc4UM', 1500, true, 2,
    '{"theory": ["JSX là syntax extension", "Compile thành React.createElement()", "Có thể embed JavaScript với {}", "className thay vì class"], "examples": ["const element = <h1>Hello</h1>;", "const name = \"John\";\\nconst greeting = <h1>Hello {name}</h1>;", "<div className=\"container\">...</div>", "const isLoggedIn = true;\\n{isLoggedIn ? <Dashboard /> : <Login />}"], "keyPoints": ["JSX không bắt buộc nhưng tiện lợi", "Dùng {} để embed JS", "CamelCase cho attributes", "Phải có 1 root element"]}'::jsonb),

  (v_section_id, 'Bài tập: First React Component', 'Tạo component React đầu tiên', 'exercise', null, null, true, 3,
    '{"description": "Tạo component Card hiển thị thông tin người dùng", "requirements": ["Component Card nhận props: name, age, email", "Hiển thị thông tin trong thẻ div", "Styling với className", "Render 3 Cards khác nhau"], "starterCode": "function Card(props) {\\n  // TODO: Return JSX\\n}\\n\\nfunction App() {\\n  return (\\n    <div>\\n      {/* TODO: Render Cards */}\\n    </div>\\n  );\\n}", "solution": "function Card({ name, age, email }) {\\n  return (\\n    <div className=\"card\">\\n      <h2>{name}</h2>\\n      <p>Age: {age}</p>\\n      <p>Email: {email}</p>\\n    </div>\\n  );\\n}\\n\\nfunction App() {\\n  return (\\n    <div>\\n      <Card name=\"John\" age={25} email=\"john@example.com\" />\\n      <Card name=\"Jane\" age={30} email=\"jane@example.com\" />\\n      <Card name=\"Bob\" age={35} email=\"bob@example.com\" />\\n    </div>\\n  );\\n}", "rubric": [{"criteria": "Component nhận props", "points": 25}, {"criteria": "Hiển thị đúng thông tin", "points": 25}, {"criteria": "Dùng destructuring", "points": 20}, {"criteria": "Render nhiều Cards", "points": 30}]}'::jsonb),

  (v_section_id, 'Props và Component Communication', 'Truyền dữ liệu giữa components với props', 'video', 'https://www.youtube.com/watch?v=Tn6-PIqc4UM', 1400, false, 4,
    '{"theory": ["Props = properties", "Read-only, không thể modify", "Truyền từ parent xuống child", "Có thể truyền bất kỳ type nào"], "examples": ["<Welcome name=\"Sara\" />", "function Welcome(props) {\\n  return <h1>Hello, {props.name}</h1>;\\n}", "// Destructuring\\nfunction Welcome({ name, age }) {...}", "// Default props\\nWelcome.defaultProps = { name: \"Guest\" };"], "keyPoints": ["Props là immutable", "Dùng destructuring", "PropTypes để validate", "Children prop đặc biệt"]}'::jsonb),

  (v_section_id, 'State và useState Hook', 'Quản lý state trong functional components', 'video', 'https://www.youtube.com/watch?v=O6P86uwfdR0', 1800, false, 5,
    '{"theory": ["State là dữ liệu thay đổi", "useState hook để tạo state", "Re-render khi state thay đổi", "State là local cho component"], "examples": ["const [count, setCount] = useState(0);", "setCount(count + 1);", "setCount(prev => prev + 1); // Functional update", "const [user, setUser] = useState({ name: \"\", age: 0 });"], "keyPoints": ["Dùng useState cho state", "Setter function để update", "Functional update an toàn hơn", "State updates are async"]}'::jsonb),

  (v_section_id, 'Bài tập: Counter App', 'Xây dựng ứng dụng đếm số', 'exercise', null, null, false, 6,
    '{"description": "Tạo Counter app với increment, decrement, reset", "requirements": ["State count bắt đầu từ 0", "Button +1, -1, Reset", "Hiển thị count hiện tại", "Không cho count < 0"], "starterCode": "import { useState } from \"react\";\\n\\nfunction Counter() {\\n  // TODO: Add state\\n  \\n  return (\\n    <div>\\n      {/* TODO: Add UI */}\\n    </div>\\n  );\\n}", "solution": "function Counter() {\\n  const [count, setCount] = useState(0);\\n  \\n  const increment = () => setCount(prev => prev + 1);\\n  const decrement = () => setCount(prev => Math.max(0, prev - 1));\\n  const reset = () => setCount(0);\\n  \\n  return (\\n    <div>\\n      <h1>Count: {count}</h1>\\n      <button onClick={increment}>+1</button>\\n      <button onClick={decrement}>-1</button>\\n      <button onClick={reset}>Reset</button>\\n    </div>\\n  );\\n}", "rubric": [{"criteria": "useState đúng", "points": 25}, {"criteria": "Increment/Decrement", "points": 30}, {"criteria": "Reset function", "points": 20}, {"criteria": "Không cho < 0", "points": 25}]}'::jsonb),

  (v_section_id, 'Event Handling', 'Xử lý sự kiện trong React', 'video', 'https://www.youtube.com/watch?v=O6P86uwfdR0', 1300, false, 7,
    '{"theory": ["onClick, onChange, onSubmit", "CamelCase naming", "Pass function reference", "Event object"], "examples": ["<button onClick={handleClick}>Click</button>", "function handleClick(e) {\\n  e.preventDefault();\\n  console.log(\"Clicked\");\\n}", "<input onChange={(e) => setValue(e.target.value)} />"], "keyPoints": ["Dùng camelCase", "Không gọi function: onClick={fn} không phải onClick={fn()}", "e.preventDefault() để chặn default", "Arrow function cho inline handlers"]}'::jsonb),

  (v_section_id, 'Bài tập: Todo List', 'Xây dựng Todo List app', 'exercise', null, null, false, 8,
    '{"description": "Tạo Todo List với add, delete, toggle complete", "requirements": ["Input để nhập todo", "Button Add", "List hiển thị todos", "Checkbox toggle complete", "Button Delete"], "starterCode": "function TodoList() {\\n  const [todos, setTodos] = useState([]);\\n  const [input, setInput] = useState(\"\");\\n  \\n  // TODO: Add functions\\n  \\n  return <div>{/* TODO */}</div>;\\n}", "solution": "function TodoList() {\\n  const [todos, setTodos] = useState([]);\\n  const [input, setInput] = useState(\"\");\\n  \\n  const addTodo = () => {\\n    if(input.trim()) {\\n      setTodos([...todos, { id: Date.now(), text: input, done: false }]);\\n      setInput(\"\");\\n    }\\n  };\\n  \\n  const toggleTodo = (id) => {\\n    setTodos(todos.map(t => t.id === id ? {...t, done: !t.done} : t));\\n  };\\n  \\n  const deleteTodo = (id) => {\\n    setTodos(todos.filter(t => t.id !== id));\\n  };\\n  \\n  return (\\n    <div>\\n      <input value={input} onChange={(e) => setInput(e.target.value)} />\\n      <button onClick={addTodo}>Add</button>\\n      <ul>\\n        {todos.map(todo => (\\n          <li key={todo.id}>\\n            <input type=\"checkbox\" checked={todo.done} onChange={() => toggleTodo(todo.id)} />\\n            <span style={{textDecoration: todo.done ? \"line-through\" : \"none\"}}>{todo.text}</span>\\n            <button onClick={() => deleteTodo(todo.id)}>Delete</button>\\n          </li>\\n        ))}\\n      </ul>\\n    </div>\\n  );\\n}", "rubric": [{"criteria": "Add todo", "points": 25}, {"criteria": "Toggle complete", "points": 25}, {"criteria": "Delete todo", "points": 25}, {"criteria": "Key prop đúng", "points": 25}]}'::jsonb);

  -- ============================================
  -- PHẦN 2: REACT HOOKS (10 bài)
  -- ============================================
  INSERT INTO course_sections (course_id, title, description, order_index)
  VALUES (v_course_id, '02. React Hooks', 'useEffect, useContext, useReducer, Custom Hooks', 2)
  RETURNING id INTO v_section_id;

  INSERT INTO course_lessons (section_id, title, description, lesson_type, video_url, video_duration, is_free, order_index, content) VALUES
  (v_section_id, 'useEffect Hook', 'Side effects và lifecycle trong functional components', 'video', 'https://www.youtube.com/watch?v=0ZJgIjIuY7U', 2000, false, 1,
    '{"theory": ["useEffect cho side effects", "Chạy sau mỗi render", "Dependency array", "Cleanup function"], "examples": ["useEffect(() => {\\n  document.title = `Count: ${count}`;\\n}, [count]);", "useEffect(() => {\\n  const timer = setInterval(() => {...}, 1000);\\n  return () => clearInterval(timer);\\n}, []);"], "keyPoints": ["[] = chỉ chạy 1 lần", "Không có deps = chạy mỗi render", "Return cleanup function", "Async trong useEffect"]}'::jsonb),

  (v_section_id, 'Fetching Data với useEffect', 'Gọi API và xử lý async data', 'video', 'https://www.youtube.com/watch?v=0ZJgIjIuY7U', 1800, false, 2,
    '{"theory": ["Fetch API trong useEffect", "Loading state", "Error handling", "Cleanup để tránh memory leak"], "examples": ["useEffect(() => {\\n  fetch(\"api/users\")\\n    .then(res => res.json())\\n    .then(data => setUsers(data));\\n}, []);", "const [loading, setLoading] = useState(true);\\nconst [error, setError] = useState(null);"], "keyPoints": ["Set loading state", "Try-catch cho errors", "AbortController để cancel", "Dependency array đúng"]}'::jsonb),

  (v_section_id, 'Bài tập: User List từ API', 'Fetch và hiển thị danh sách users', 'exercise', null, null, false, 3,
    '{"description": "Fetch users từ JSONPlaceholder API và hiển thị", "requirements": ["Fetch từ https://jsonplaceholder.typicode.com/users", "Loading state", "Error handling", "Hiển thị name, email, phone"], "starterCode": "function UserList() {\\n  const [users, setUsers] = useState([]);\\n  const [loading, setLoading] = useState(true);\\n  \\n  useEffect(() => {\\n    // TODO: Fetch users\\n  }, []);\\n  \\n  return <div>{/* TODO */}</div>;\\n}", "solution": "function UserList() {\\n  const [users, setUsers] = useState([]);\\n  const [loading, setLoading] = useState(true);\\n  const [error, setError] = useState(null);\\n  \\n  useEffect(() => {\\n    fetch(\"https://jsonplaceholder.typicode.com/users\")\\n      .then(res => res.json())\\n      .then(data => {\\n        setUsers(data);\\n        setLoading(false);\\n      })\\n      .catch(err => {\\n        setError(err.message);\\n        setLoading(false);\\n      });\\n  }, []);\\n  \\n  if(loading) return <div>Loading...</div>;\\n  if(error) return <div>Error: {error}</div>;\\n  \\n  return (\\n    <ul>\\n      {users.map(user => (\\n        <li key={user.id}>\\n          <h3>{user.name}</h3>\\n          <p>{user.email}</p>\\n          <p>{user.phone}</p>\\n        </li>\\n      ))}\\n    </ul>\\n  );\\n}", "rubric": [{"criteria": "Fetch API đúng", "points": 30}, {"criteria": "Loading state", "points": 20}, {"criteria": "Error handling", "points": 20}, {"criteria": "Render users", "points": 30}]}'::jsonb);

  -- Tiếp tục thêm các bài học khác...

  RAISE NOTICE 'Đã tạo khóa học React.js!';
END $$;

SELECT 'Khóa học React.js đã được tạo!' AS message;
