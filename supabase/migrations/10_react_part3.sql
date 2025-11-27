-- =============================================
-- REACT.JS - PHẦN 3: REACT ROUTER & FORMS
-- =============================================

DO $$
DECLARE
  v_course_id uuid;
  v_section_id uuid;
BEGIN
  SELECT id INTO v_course_id FROM courses WHERE title = 'React.js Từ Cơ Bản Đến Nâng Cao';

  -- ============================================
  -- PHẦN 3: REACT ROUTER (8 bài)
  -- ============================================
  INSERT INTO course_sections (course_id, title, description, order_index)
  VALUES (v_course_id, '03. React Router', 'Navigation và routing trong React apps', 3)
  RETURNING id INTO v_section_id;

  INSERT INTO course_lessons (section_id, title, description, lesson_type, video_url, video_duration, is_free, order_index, content) VALUES
  
  (v_section_id, 'Setup React Router', 'Cài đặt và cấu hình React Router', 'video', 'https://www.youtube.com/watch?v=Law7wfdg_ls', 1500, false, 1,
    '{"theory": ["React Router cho SPA navigation", "BrowserRouter vs HashRouter", "Routes và Route components", "Client-side routing"], "examples": ["npm install react-router-dom", "import { BrowserRouter, Routes, Route } from \"react-router-dom\";", "<BrowserRouter>\\n  <Routes>\\n    <Route path=\"/\" element={<Home />} />\\n    <Route path=\"/about\" element={<About />} />\\n  </Routes>\\n</BrowserRouter>"], "keyPoints": ["Wrap app với BrowserRouter", "Routes chứa Route", "path và element props", "Exact matching mặc định"]}'::jsonb),

  (v_section_id, 'Link và Navigation', 'Navigate giữa các pages', 'video', 'https://www.youtube.com/watch?v=Law7wfdg_ls', 1400, false, 2,
    '{"theory": ["Link component thay <a>", "NavLink với active state", "useNavigate hook", "Programmatic navigation"], "examples": ["<Link to=\"/about\">About</Link>", "<NavLink to=\"/\" className={({isActive}) => isActive ? \"active\" : \"\"}>Home</NavLink>", "const navigate = useNavigate();\\nnavigate(\"/profile\");"], "keyPoints": ["Dùng Link, không dùng <a>", "NavLink cho active styling", "useNavigate cho programmatic", "Không reload page"]}'::jsonb),

  (v_section_id, 'URL Parameters', 'Dynamic routes với params', 'video', 'https://www.youtube.com/watch?v=Law7wfdg_ls', 1600, false, 3,
    '{"theory": ["Dynamic segments với :", "useParams hook", "Optional parameters", "Multiple parameters"], "examples": ["<Route path=\"/user/:id\" element={<User />} />", "function User() {\\n  const { id } = useParams();\\n  return <div>User {id}</div>;\\n}", "<Route path=\"/post/:postId/comment/:commentId\" />"], "keyPoints": ["Dùng : cho dynamic", "useParams để access", "Params là strings", "Validate params"]}'::jsonb),

  (v_section_id, 'Bài tập: Blog với Router', 'Xây dựng blog app với routing', 'exercise', null, null, false, 4,
    '{"description": "Tạo blog với Home, Post List, Post Detail pages", "requirements": ["Route / cho Home", "Route /posts cho list", "Route /posts/:id cho detail", "Navigation menu", "useParams trong detail"], "starterCode": "function App() {\\n  return (\\n    <BrowserRouter>\\n      <nav>{/* TODO: Links */}</nav>\\n      <Routes>\\n        {/* TODO: Routes */}\\n      </Routes>\\n    </BrowserRouter>\\n  );\\n}", "solution": "function App() {\\n  return (\\n    <BrowserRouter>\\n      <nav>\\n        <Link to=\"/\">Home</Link>\\n        <Link to=\"/posts\">Posts</Link>\\n      </nav>\\n      <Routes>\\n        <Route path=\"/\" element={<Home />} />\\n        <Route path=\"/posts\" element={<PostList />} />\\n        <Route path=\"/posts/:id\" element={<PostDetail />} />\\n      </Routes>\\n    </BrowserRouter>\\n  );\\n}\\n\\nfunction PostDetail() {\\n  const { id } = useParams();\\n  const [post, setPost] = useState(null);\\n  \\n  useEffect(() => {\\n    fetch(`https://jsonplaceholder.typicode.com/posts/${id}`)\\n      .then(res => res.json())\\n      .then(data => setPost(data));\\n  }, [id]);\\n  \\n  if(!post) return <div>Loading...</div>;\\n  return <div><h1>{post.title}</h1><p>{post.body}</p></div>;\\n}", "rubric": [{"criteria": "Routes setup", "points": 25}, {"criteria": "Navigation", "points": 20}, {"criteria": "useParams", "points": 30}, {"criteria": "Fetch post detail", "points": 25}]}'::jsonb),

  (v_section_id, 'Nested Routes', 'Routes lồng nhau', 'video', 'https://www.youtube.com/watch?v=Law7wfdg_ls', 1500, false, 5,
    '{"theory": ["Nested routes cho layouts", "Outlet component", "Relative paths", "Index routes"], "examples": ["<Route path=\"/dashboard\" element={<Dashboard />}>\\n  <Route index element={<Overview />} />\\n  <Route path=\"stats\" element={<Stats />} />\\n</Route>", "function Dashboard() {\\n  return <div><Outlet /></div>;\\n}"], "keyPoints": ["Outlet render child routes", "index cho default route", "Relative paths", "Shared layouts"]}'::jsonb),

  (v_section_id, 'Protected Routes', 'Authentication và route guards', 'video', 'https://www.youtube.com/watch?v=2k8NleFjG7I', 1800, false, 6,
    '{"theory": ["Private routes cần auth", "Redirect nếu chưa login", "Route guards", "useLocation để redirect back"], "examples": ["function PrivateRoute({ children }) {\\n  const isAuth = useAuth();\\n  return isAuth ? children : <Navigate to=\"/login\" />;\\n}", "<Route path=\"/profile\" element={<PrivateRoute><Profile /></PrivateRoute>} />"], "keyPoints": ["Check auth trước render", "Navigate component", "Save location để redirect back", "Loading state"]}'::jsonb),

  (v_section_id, 'Query Parameters', 'Search params và filters', 'video', 'https://www.youtube.com/watch?v=2k8NleFjG7I', 1400, false, 7,
    '{"theory": ["useSearchParams hook", "Get và set query params", "Sync với URL", "Shareable URLs"], "examples": ["const [searchParams, setSearchParams] = useSearchParams();", "const query = searchParams.get(\"q\");", "setSearchParams({ q: \"react\", page: 2 });"], "keyPoints": ["useSearchParams hook", "get() để read", "setSearchParams() để update", "Preserve other params"]}'::jsonb),

  (v_section_id, 'Bài tập: Product Filter', 'Filter products với query params', 'exercise', null, null, false, 8,
    '{"description": "Tạo product list với search và category filter", "requirements": ["Search input sync với ?q=", "Category filter sync với ?category=", "Filter products based on params", "URL shareable"], "starterCode": "function Products() {\\n  const [searchParams, setSearchParams] = useSearchParams();\\n  const [products] = useState(mockProducts);\\n  \\n  // TODO\\n}", "solution": "function Products() {\\n  const [searchParams, setSearchParams] = useSearchParams();\\n  const [products] = useState(mockProducts);\\n  \\n  const query = searchParams.get(\"q\") || \"\";\\n  const category = searchParams.get(\"category\") || \"all\";\\n  \\n  const filtered = products.filter(p => {\\n    const matchQuery = p.name.toLowerCase().includes(query.toLowerCase());\\n    const matchCategory = category === \"all\" || p.category === category;\\n    return matchQuery && matchCategory;\\n  });\\n  \\n  return (\\n    <div>\\n      <input \\n        value={query}\\n        onChange={e => setSearchParams({ q: e.target.value, category })}\\n      />\\n      <select \\n        value={category}\\n        onChange={e => setSearchParams({ q: query, category: e.target.value })}\\n      >\\n        <option value=\"all\">All</option>\\n        <option value=\"electronics\">Electronics</option>\\n        <option value=\"clothing\">Clothing</option>\\n      </select>\\n      {filtered.map(p => <div key={p.id}>{p.name}</div>)}\\n    </div>\\n  );\\n}", "rubric": [{"criteria": "useSearchParams", "points": 25}, {"criteria": "Search filter", "points": 25}, {"criteria": "Category filter", "points": 25}, {"criteria": "URL sync", "points": 25}]}'::jsonb);

  -- ============================================
  -- PHẦN 4: FORMS & VALIDATION (7 bài)
  -- ============================================
  INSERT INTO course_sections (course_id, title, description, order_index)
  VALUES (v_course_id, '04. Forms & Validation', 'Xử lý forms và validation trong React', 4)
  RETURNING id INTO v_section_id;

  INSERT INTO course_lessons (section_id, title, description, lesson_type, video_url, video_duration, is_free, order_index, content) VALUES
  
  (v_section_id, 'Controlled Components', 'Form inputs với React state', 'video', 'https://www.youtube.com/watch?v=IkMND33x0qQ', 1600, false, 1,
    '{"theory": ["Controlled vs Uncontrolled", "value và onChange", "Single source of truth", "React controls input"], "examples": ["const [name, setName] = useState(\"\");", "<input value={name} onChange={e => setName(e.target.value)} />", "// Checkbox\\n<input type=\"checkbox\" checked={agreed} onChange={e => setAgreed(e.target.checked)} />"], "keyPoints": ["value prop cho control", "onChange để update state", "State là source of truth", "Dễ validate"]}'::jsonb),

  (v_section_id, 'Form Submission', 'Handle form submit', 'video', 'https://www.youtube.com/watch?v=IkMND33x0qQ', 1400, false, 2,
    '{"theory": ["onSubmit handler", "preventDefault", "Collect form data", "Reset form"], "examples": ["<form onSubmit={handleSubmit}>", "function handleSubmit(e) {\\n  e.preventDefault();\\n  const data = { name, email };\\n  // Submit data\\n}"], "keyPoints": ["e.preventDefault()", "Collect all fields", "Validate before submit", "Reset sau submit"]}'::jsonb),

  (v_section_id, 'Form Validation', 'Client-side validation', 'video', 'https://www.youtube.com/watch?v=tIdNeoHniEY', 1800, false, 3,
    '{"theory": ["Validate on change/blur/submit", "Error messages", "Disable submit nếu invalid", "Built-in HTML5 validation"], "examples": ["const [errors, setErrors] = useState({});", "if(!email.includes(\"@\")) {\\n  setErrors({...errors, email: \"Invalid email\"});\\n}", "<input required minLength={3} />"], "keyPoints": ["Validate early", "Clear error messages", "Multiple validation rules", "UX friendly"]}'::jsonb),

  (v_section_id, 'Bài tập: Registration Form', 'Form đăng ký với validation', 'exercise', null, null, false, 4,
    '{"description": "Tạo form đăng ký với validation đầy đủ", "requirements": ["Fields: username, email, password, confirm password", "Validation: required, email format, password match", "Show errors", "Disable submit nếu invalid"], "starterCode": "function RegistrationForm() {\\n  const [formData, setFormData] = useState({\\n    username: \"\",\\n    email: \"\",\\n    password: \"\",\\n    confirmPassword: \"\"\\n  });\\n  const [errors, setErrors] = useState({});\\n  \\n  // TODO\\n}", "solution": "function RegistrationForm() {\\n  const [formData, setFormData] = useState({\\n    username: \"\", email: \"\", password: \"\", confirmPassword: \"\"\\n  });\\n  const [errors, setErrors] = useState({});\\n  \\n  const validate = () => {\\n    const newErrors = {};\\n    if(!formData.username) newErrors.username = \"Required\";\\n    if(!formData.email.includes(\"@\")) newErrors.email = \"Invalid email\";\\n    if(formData.password.length < 6) newErrors.password = \"Min 6 chars\";\\n    if(formData.password !== formData.confirmPassword) {\\n      newErrors.confirmPassword = \"Passwords do not match\";\\n    }\\n    setErrors(newErrors);\\n    return Object.keys(newErrors).length === 0;\\n  };\\n  \\n  const handleSubmit = (e) => {\\n    e.preventDefault();\\n    if(validate()) {\\n      console.log(\"Submit:\", formData);\\n    }\\n  };\\n  \\n  return (\\n    <form onSubmit={handleSubmit}>\\n      <input \\n        value={formData.username}\\n        onChange={e => setFormData({...formData, username: e.target.value})}\\n      />\\n      {errors.username && <span>{errors.username}</span>}\\n      <button type=\"submit\">Register</button>\\n    </form>\\n  );\\n}", "rubric": [{"criteria": "All fields controlled", "points": 20}, {"criteria": "Validation logic", "points": 30}, {"criteria": "Error display", "points": 25}, {"criteria": "Submit handling", "points": 25}]}'::jsonb);

  RAISE NOTICE 'Đã thêm React Router và Forms!';
END $$;
