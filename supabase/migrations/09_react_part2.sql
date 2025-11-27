-- =============================================
-- REACT.JS - PHẦN 2: TIẾP TỤC HOOKS
-- Chạy sau file 08_add_10_new_courses.sql
-- =============================================

DO $$
DECLARE
  v_course_id uuid;
  v_section_id uuid;
BEGIN
  -- Lấy course ID
  SELECT id INTO v_course_id FROM courses WHERE title = 'React.js Từ Cơ Bản Đến Nâng Cao';
  
  -- Lấy section Hooks
  SELECT id INTO v_section_id FROM course_sections 
  WHERE course_id = v_course_id AND title = '02. React Hooks';

  -- Thêm các bài học Hooks còn lại
  INSERT INTO course_lessons (section_id, title, description, lesson_type, video_url, video_duration, is_free, order_index, content) VALUES
  
  (v_section_id, 'useContext Hook', 'Chia sẻ data giữa components không cần props drilling', 'video', 'https://www.youtube.com/watch?v=5LrDIWkK_Bc', 1800, false, 4,
    '{"theory": ["Context API để share data", "Tránh props drilling", "createContext và Provider", "useContext để consume"], "examples": ["const ThemeContext = createContext();", "<ThemeContext.Provider value={theme}>", "const theme = useContext(ThemeContext);"], "keyPoints": ["Dùng cho global state", "Provider wrap components", "useContext để access", "Re-render khi context thay đổi"]}'::jsonb),

  (v_section_id, 'Bài tập: Theme Switcher', 'Tạo theme switcher với Context', 'exercise', null, null, false, 5,
    '{"description": "Implement dark/light theme với Context API", "requirements": ["ThemeContext với dark/light", "ThemeProvider component", "Toggle button", "Apply theme cho toàn app"], "starterCode": "const ThemeContext = createContext();\\n\\nfunction ThemeProvider({ children }) {\\n  // TODO\\n}\\n\\nfunction App() {\\n  return (\\n    <ThemeProvider>\\n      {/* TODO */}\\n    </ThemeProvider>\\n  );\\n}", "solution": "const ThemeContext = createContext();\\n\\nfunction ThemeProvider({ children }) {\\n  const [theme, setTheme] = useState(\"light\");\\n  \\n  const toggleTheme = () => {\\n    setTheme(prev => prev === \"light\" ? \"dark\" : \"light\");\\n  };\\n  \\n  return (\\n    <ThemeContext.Provider value={{ theme, toggleTheme }}>\\n      {children}\\n    </ThemeContext.Provider>\\n  );\\n}\\n\\nfunction ThemedButton() {\\n  const { theme, toggleTheme } = useContext(ThemeContext);\\n  \\n  return (\\n    <button \\n      onClick={toggleTheme}\\n      style={{\\n        background: theme === \"light\" ? \"#fff\" : \"#333\",\\n        color: theme === \"light\" ? \"#000\" : \"#fff\"\\n      }}\\n    >\\n      Toggle Theme\\n    </button>\\n  );\\n}", "rubric": [{"criteria": "Context setup", "points": 25}, {"criteria": "Provider đúng", "points": 25}, {"criteria": "useContext", "points": 25}, {"criteria": "Toggle theme", "points": 25}]}'::jsonb),

  (v_section_id, 'useReducer Hook', 'Quản lý complex state với reducer pattern', 'video', 'https://www.youtube.com/watch?v=kK_Wqx3RnHk', 2000, false, 6,
    '{"theory": ["useReducer cho complex state", "Reducer function (state, action) => newState", "Dispatch actions", "Giống Redux pattern"], "examples": ["const [state, dispatch] = useReducer(reducer, initialState);", "function reducer(state, action) {\\n  switch(action.type) {\\n    case \"increment\": return {count: state.count + 1};\\n    default: return state;\\n  }\\n}", "dispatch({ type: \"increment\" });"], "keyPoints": ["Dùng cho complex state logic", "Centralized state updates", "Easier to test", "Combine với Context"]}'::jsonb),

  (v_section_id, 'Bài tập: Shopping Cart', 'Xây dựng shopping cart với useReducer', 'exercise', null, null, false, 7,
    '{"description": "Tạo shopping cart với add, remove, update quantity", "requirements": ["useReducer cho cart state", "Actions: ADD, REMOVE, UPDATE_QTY", "Hiển thị items và total", "Clear cart button"], "starterCode": "const initialState = { items: [], total: 0 };\\n\\nfunction cartReducer(state, action) {\\n  // TODO\\n}\\n\\nfunction Cart() {\\n  const [state, dispatch] = useReducer(cartReducer, initialState);\\n  // TODO\\n}", "solution": "function cartReducer(state, action) {\\n  switch(action.type) {\\n    case \"ADD\":\\n      const exists = state.items.find(i => i.id === action.item.id);\\n      if(exists) {\\n        return {\\n          ...state,\\n          items: state.items.map(i => \\n            i.id === action.item.id ? {...i, qty: i.qty + 1} : i\\n          )\\n        };\\n      }\\n      return {\\n        ...state,\\n        items: [...state.items, {...action.item, qty: 1}]\\n      };\\n    case \"REMOVE\":\\n      return {\\n        ...state,\\n        items: state.items.filter(i => i.id !== action.id)\\n      };\\n    case \"CLEAR\":\\n      return initialState;\\n    default:\\n      return state;\\n  }\\n}", "rubric": [{"criteria": "Reducer đúng", "points": 30}, {"criteria": "ADD action", "points": 25}, {"criteria": "REMOVE action", "points": 20}, {"criteria": "Calculate total", "points": 25}]}'::jsonb),

  (v_section_id, 'useMemo Hook', 'Optimize performance với memoization', 'video', 'https://www.youtube.com/watch?v=THL1OPn72vo', 1500, false, 8,
    '{"theory": ["useMemo để cache expensive calculations", "Chỉ re-compute khi deps thay đổi", "Tránh unnecessary re-renders", "Performance optimization"], "examples": ["const expensiveValue = useMemo(() => {\\n  return computeExpensive(a, b);\\n}, [a, b]);", "const sortedList = useMemo(() => {\\n  return items.sort((a,b) => a - b);\\n}, [items]);"], "keyPoints": ["Dùng cho expensive operations", "Dependency array quan trọng", "Đừng overuse", "Profile trước khi optimize"]}'::jsonb),

  (v_section_id, 'useCallback Hook', 'Memoize functions để tránh re-creation', 'video', 'https://www.youtube.com/watch?v=_AyFP5s69N4', 1400, false, 9,
    '{"theory": ["useCallback memoize functions", "Tránh re-create function mỗi render", "Useful khi pass function to child", "Combine với React.memo"], "examples": ["const handleClick = useCallback(() => {\\n  doSomething(a, b);\\n}, [a, b]);", "<Child onClick={handleClick} />"], "keyPoints": ["Dùng khi pass to memoized child", "Dependency array", "Combine với React.memo", "Không cần cho mọi function"]}'::jsonb),

  (v_section_id, 'Bài tập: Optimized List', 'Optimize list rendering với memo và hooks', 'exercise', null, null, false, 10,
    '{"description": "Tạo list với search, sort và optimize performance", "requirements": ["List 1000 items", "Search filter", "Sort button", "useMemo cho filtered/sorted list", "React.memo cho ListItem"], "starterCode": "const ListItem = ({ item }) => {\\n  return <div>{item.name}</div>;\\n};\\n\\nfunction List() {\\n  const [items] = useState(generateItems(1000));\\n  const [search, setSearch] = useState(\"\");\\n  // TODO\\n}", "solution": "const ListItem = React.memo(({ item }) => {\\n  return <div>{item.name}</div>;\\n});\\n\\nfunction List() {\\n  const [items] = useState(generateItems(1000));\\n  const [search, setSearch] = useState(\"\");\\n  const [sortAsc, setSortAsc] = useState(true);\\n  \\n  const filteredItems = useMemo(() => {\\n    return items.filter(i => \\n      i.name.toLowerCase().includes(search.toLowerCase())\\n    );\\n  }, [items, search]);\\n  \\n  const sortedItems = useMemo(() => {\\n    return [...filteredItems].sort((a,b) => \\n      sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)\\n    );\\n  }, [filteredItems, sortAsc]);\\n  \\n  return (\\n    <div>\\n      <input value={search} onChange={e => setSearch(e.target.value)} />\\n      <button onClick={() => setSortAsc(!sortAsc)}>Sort</button>\\n      {sortedItems.map(item => <ListItem key={item.id} item={item} />)}\\n    </div>\\n  );\\n}", "rubric": [{"criteria": "useMemo cho filter", "points": 25}, {"criteria": "useMemo cho sort", "points": 25}, {"criteria": "React.memo", "points": 25}, {"criteria": "Performance tốt", "points": 25}]}'::jsonb);

  RAISE NOTICE 'Đã thêm phần Hooks!';
END $$;
