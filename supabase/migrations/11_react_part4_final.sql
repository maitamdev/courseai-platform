-- =============================================
-- REACT.JS - PHẦN 4: ADVANCED & PROJECT
-- =============================================

DO $$
DECLARE
  v_course_id uuid;
  v_section_id uuid;
BEGIN
  SELECT id INTO v_course_id FROM courses WHERE title = 'React.js Từ Cơ Bản Đến Nâng Cao';

  -- ============================================
  -- PHẦN 5: ADVANCED PATTERNS (6 bài)
  -- ============================================
  INSERT INTO course_sections (course_id, title, description, order_index)
  VALUES (v_course_id, '05. Advanced Patterns', 'HOC, Render Props, Compound Components', 5)
  RETURNING id INTO v_section_id;

  INSERT INTO course_lessons (section_id, title, description, lesson_type, video_url, video_duration, is_free, order_index, content) VALUES
  
  (v_section_id, 'Custom Hooks', 'Tạo reusable hooks', 'video', 'https://www.youtube.com/watch?v=6ThXsUwLWvc', 1800, false, 1,
    '{"theory": ["Extract logic thành custom hooks", "Naming: use + Name", "Reusable across components", "Compose hooks"], "examples": ["function useFetch(url) {\\n  const [data, setData] = useState(null);\\n  const [loading, setLoading] = useState(true);\\n  \\n  useEffect(() => {\\n    fetch(url).then(r => r.json()).then(setData);\\n  }, [url]);\\n  \\n  return { data, loading };\\n}", "const { data, loading } = useFetch(\"/api/users\");"], "keyPoints": ["Prefix với use", "Return values/functions", "Reusable logic", "Follow hooks rules"]}'::jsonb),

  (v_section_id, 'Bài tập: useLocalStorage Hook', 'Custom hook cho localStorage', 'exercise', null, null, false, 2,
    '{"description": "Tạo useLocalStorage hook sync state với localStorage", "requirements": ["Hook nhận key và initialValue", "Return [value, setValue]", "Auto save to localStorage", "Load từ localStorage on mount"], "starterCode": "function useLocalStorage(key, initialValue) {\\n  // TODO\\n}", "solution": "function useLocalStorage(key, initialValue) {\\n  const [value, setValue] = useState(() => {\\n    const saved = localStorage.getItem(key);\\n    return saved ? JSON.parse(saved) : initialValue;\\n  });\\n  \\n  useEffect(() => {\\n    localStorage.setItem(key, JSON.stringify(value));\\n  }, [key, value]);\\n  \\n  return [value, setValue];\\n}\\n\\n// Usage\\nfunction App() {\\n  const [name, setName] = useLocalStorage(\"name\", \"\");\\n  return <input value={name} onChange={e => setName(e.target.value)} />;\\n}", "rubric": [{"criteria": "Load from localStorage", "points": 30}, {"criteria": "Save to localStorage", "points": 30}, {"criteria": "useState integration", "points": 20}, {"criteria": "JSON parse/stringify", "points": 20}]}'::jsonb),

  (v_section_id, 'Error Boundaries', 'Xử lý errors trong React', 'video', 'https://www.youtube.com/watch?v=DNYXgtZBRPE', 1500, false, 3,
    '{"theory": ["Error Boundaries catch errors", "componentDidCatch lifecycle", "Fallback UI", "Chỉ class components"], "examples": ["class ErrorBoundary extends React.Component {\\n  state = { hasError: false };\\n  \\n  static getDerivedStateFromError(error) {\\n    return { hasError: true };\\n  }\\n  \\n  render() {\\n    if(this.state.hasError) return <h1>Error!</h1>;\\n    return this.props.children;\\n  }\\n}"], "keyPoints": ["Wrap components", "Fallback UI", "Log errors", "Production ready"]}'::jsonb),

  (v_section_id, 'Code Splitting & Lazy Loading', 'Optimize bundle size', 'video', 'https://www.youtube.com/watch?v=JU6sl_yyZqs', 1600, false, 4,
    '{"theory": ["React.lazy cho dynamic import", "Suspense cho loading state", "Route-based splitting", "Component-based splitting"], "examples": ["const About = React.lazy(() => import(\"./About\"));", "<Suspense fallback={<Loading />}>\\n  <About />\\n</Suspense>"], "keyPoints": ["Lazy load routes", "Suspense fallback", "Smaller initial bundle", "Faster load time"]}'::jsonb),

  (v_section_id, 'React.memo và Optimization', 'Prevent unnecessary re-renders', 'video', 'https://www.youtube.com/watch?v=uojLJFt9SzY', 1700, false, 5,
    '{"theory": ["React.memo HOC", "Shallow comparison", "Custom comparison", "When to use"], "examples": ["const MemoComponent = React.memo(Component);", "const MemoComponent = React.memo(Component, (prevProps, nextProps) => {\\n  return prevProps.id === nextProps.id;\\n});"], "keyPoints": ["Wrap với React.memo", "Props comparison", "Combine với useCallback", "Profile first"]}'::jsonb),

  (v_section_id, 'Bài tập: Performance Dashboard', 'Optimize complex dashboard', 'exercise', null, null, false, 6,
    '{"description": "Optimize dashboard với nhiều components", "requirements": ["Dashboard với 10+ widgets", "React.memo cho widgets", "useMemo cho calculations", "Lazy load heavy components"], "starterCode": "function Dashboard() {\\n  const [data, setData] = useState(heavyData);\\n  // TODO: Optimize\\n}", "solution": "const Widget = React.memo(({ data }) => {\\n  return <div>{data.value}</div>;\\n});\\n\\nconst HeavyChart = React.lazy(() => import(\"./HeavyChart\"));\\n\\nfunction Dashboard() {\\n  const [data, setData] = useState(heavyData);\\n  \\n  const summary = useMemo(() => {\\n    return data.reduce((acc, item) => acc + item.value, 0);\\n  }, [data]);\\n  \\n  return (\\n    <div>\\n      <h1>Total: {summary}</h1>\\n      {data.map(item => <Widget key={item.id} data={item} />)}\\n      <Suspense fallback={<div>Loading chart...</div>}>\\n        <HeavyChart data={data} />\\n      </Suspense>\\n    </div>\\n  );\\n}", "rubric": [{"criteria": "React.memo", "points": 25}, {"criteria": "useMemo", "points": 25}, {"criteria": "Lazy loading", "points": 25}, {"criteria": "Performance improvement", "points": 25}]}'::jsonb);

  -- ============================================
  -- PHẦN 6: FINAL PROJECT (5 bài)
  -- ============================================
  INSERT INTO course_sections (course_id, title, description, order_index)
  VALUES (v_course_id, '06. Final Project', 'Xây dựng ứng dụng E-commerce hoàn chỉnh', 6)
  RETURNING id INTO v_section_id;

  INSERT INTO course_lessons (section_id, title, description, lesson_type, video_url, video_duration, is_free, order_index, content) VALUES
  
  (v_section_id, 'Project Setup & Architecture', 'Thiết kế kiến trúc ứng dụng', 'video', 'https://www.youtube.com/watch?v=lATafp15HWA', 2000, false, 1,
    '{"theory": ["Folder structure", "Component hierarchy", "State management strategy", "Routing structure"], "examples": ["src/\\n  components/\\n  pages/\\n  hooks/\\n  context/\\n  utils/\\n  api/"], "keyPoints": ["Clear folder structure", "Separation of concerns", "Reusable components", "Scalable architecture"]}'::jsonb),

  (v_section_id, 'Product Listing & Filtering', 'Hiển thị và filter products', 'video', 'https://www.youtube.com/watch?v=lATafp15HWA', 2500, false, 2,
    '{"theory": ["Fetch products từ API", "Grid layout", "Search và filters", "Pagination"], "examples": ["const { data: products } = useFetch(\"/api/products\");", "const filtered = products.filter(p => p.category === selected);"], "keyPoints": ["API integration", "Filter logic", "Responsive grid", "Loading states"]}'::jsonb),

  (v_section_id, 'Shopping Cart Implementation', 'Xây dựng shopping cart', 'video', 'https://www.youtube.com/watch?v=lATafp15HWA', 2200, false, 3,
    '{"theory": ["Cart context", "Add/remove items", "Update quantity", "Calculate total"], "examples": ["const CartContext = createContext();", "function addToCart(product) {...}", "const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);"], "keyPoints": ["Context for cart state", "CRUD operations", "Persist to localStorage", "Real-time updates"]}'::jsonb),

  (v_section_id, 'Checkout Flow', 'Quy trình thanh toán', 'video', 'https://www.youtube.com/watch?v=lATafp15HWA', 2400, false, 4,
    '{"theory": ["Multi-step form", "Form validation", "Order summary", "Payment integration"], "examples": ["const [step, setStep] = useState(1);", "// Step 1: Shipping\\n// Step 2: Payment\\n// Step 3: Confirmation"], "keyPoints": ["Step-by-step flow", "Validation each step", "Review before submit", "Success confirmation"]}'::jsonb),

  (v_section_id, 'Bài tập: Complete E-commerce', 'Hoàn thiện toàn bộ project', 'exercise', null, null, false, 5,
    '{"description": "Hoàn thiện ứng dụng E-commerce với tất cả features", "requirements": ["Product listing với search/filter", "Product detail page", "Shopping cart", "Checkout flow", "Order history", "Responsive design", "Error handling", "Loading states"], "starterCode": "// Project structure đã setup\\n// TODO: Implement all features", "solution": "// Full implementation với:\\n// - Context API cho cart và auth\\n// - React Router cho navigation\\n// - Custom hooks cho API calls\\n// - Form validation\\n// - Error boundaries\\n// - Code splitting\\n// - Responsive design\\n// - LocalStorage persistence", "rubric": [{"criteria": "All features working", "points": 40}, {"criteria": "Code quality", "points": 20}, {"criteria": "UI/UX", "points": 20}, {"criteria": "Performance", "points": 20}]}'::jsonb);

  RAISE NOTICE 'Hoàn thành khóa học React.js!';
END $$;

SELECT 'Khóa học React.js hoàn chỉnh với 6 sections, 36 bài học!' AS message;
