import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, Bot, User, Sparkles, Code2, Trash2, ChevronDown, Database, Cloud, Brain, Palette, Terminal, Cpu, Layers } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

type QuickQuestion = {
  icon: React.ReactNode;
  text: string;
  query: string;
};

const AI_RESPONSES: Record<string, string> = {
  // JavaScript Basics
  'biến': '**Biến (Variable)** là nơi lưu trữ dữ liệu trong bộ nhớ.\n\n```javascript\n// Khai báo biến\nlet tuoi = 18;        // Có thể thay đổi\nconst ten = "An";     // Không thể thay đổi\nvar x = 10;           // Cách cũ (tránh dùng)\n```\n\n**Tip:** Luôn dùng `const` trước, chỉ dùng `let` khi cần thay đổi giá trị!',
  'variable': '**Biến (Variable)** là nơi lưu trữ dữ liệu trong bộ nhớ.\n\n```javascript\nlet tuoi = 18;        // Có thể thay đổi\nconst ten = "An";     // Không thể thay đổi\n```',
  
  'hàm': '**Hàm (Function)** là khối code có thể tái sử dụng.\n\n```javascript\n// Function declaration\nfunction chao(ten) {\n  return "Xin chào " + ten;\n}\n\n// Arrow function (ES6)\nconst cong = (a, b) => a + b;\n\n// Gọi hàm\nchao("An");  // "Xin chào An"\ncong(2, 3);  // 5\n```',
  'function': '**Hàm (Function)** là khối code có thể tái sử dụng.\n\n```javascript\nfunction chao(ten) {\n  return "Xin chào " + ten;\n}\n\nconst cong = (a, b) => a + b;\n```',
  
  'vòng lặp': '**Vòng lặp (Loop)** giúp lặp lại code nhiều lần.\n\n```javascript\n// For loop\nfor (let i = 0; i < 5; i++) {\n  console.log(i);  // 0, 1, 2, 3, 4\n}\n\n// While loop\nlet j = 0;\nwhile (j < 3) {\n  console.log(j++);\n}\n\n// For...of (duyệt mảng)\nconst arr = ["a", "b", "c"];\nfor (const item of arr) {\n  console.log(item);\n}\n```',
  'loop': '**Vòng lặp** giúp lặp lại code nhiều lần.\n\n```javascript\nfor (let i = 0; i < 5; i++) {\n  console.log(i);\n}\n```',
  'for': '**For Loop**\n\n```javascript\nfor (let i = 0; i < 5; i++) {\n  console.log(i);  // 0, 1, 2, 3, 4\n}\n```',
  'while': '**While Loop**\n\n```javascript\nlet i = 0;\nwhile (i < 5) {\n  console.log(i++);\n}\n```',

  'if': '**Câu lệnh điều kiện (If/Else)**\n\n```javascript\nconst diem = 85;\n\nif (diem >= 90) {\n  console.log("Xuất sắc!");\n} else if (diem >= 70) {\n  console.log("Khá!");\n} else {\n  console.log("Cần cố gắng!");\n}\n\n// Ternary operator\nconst ketQua = diem >= 50 ? "Đậu" : "Rớt";\n```',
  'điều kiện': '**Câu lệnh điều kiện**\n\n```javascript\nif (diem >= 50) {\n  console.log("Đậu");\n} else {\n  console.log("Rớt");\n}\n```',
  
  'mảng': '**Mảng (Array)** lưu nhiều giá trị trong một biến.\n\n```javascript\nconst fruits = ["apple", "banana", "orange"];\n\n// Truy cập\nfruits[0];        // "apple"\nfruits.length;    // 3\n\n// Thêm/Xóa\nfruits.push("grape");     // Thêm cuối\nfruits.pop();             // Xóa cuối\n\n// Duyệt mảng\nfruits.map(f => f.toUpperCase());\nfruits.filter(f => f !== "banana");\n```',
  'array': '**Mảng (Array)**\n\n```javascript\nconst arr = [1, 2, 3];\narr.push(4);       // Thêm\narr.map(x => x*2); // [2,4,6]\n```',
  
  'object': '**Object** lưu dữ liệu dạng key-value.\n\n```javascript\nconst user = {\n  name: "An",\n  age: 18,\n  skills: ["JS", "React"],\n  greet() {\n    return `Hi, I am ${this.name}`;\n  }\n};\n\n// Truy cập\nuser.name;        // "An"\nuser["age"];      // 18\n\n// Destructuring\nconst { name, age } = user;\n```',
  
  'promise': '**Promise** xử lý tác vụ bất đồng bộ.\n\n```javascript\nconst fetchData = new Promise((resolve, reject) => {\n  setTimeout(() => {\n    resolve("Dữ liệu!");\n  }, 1000);\n});\n\nfetchData\n  .then(data => console.log(data))\n  .catch(err => console.error(err));\n```',
  
  'async': '**Async/Await** - cách viết Promise dễ đọc hơn.\n\n```javascript\nasync function getData() {\n  try {\n    const response = await fetch(url);\n    const data = await response.json();\n    return data;\n  } catch (error) {\n    console.error(error);\n  }\n}\n```',
  
  // TypeScript
  'typescript': '**TypeScript** - JavaScript với type safety.\n\n```typescript\n// Basic types\nlet name: string = "An";\nlet age: number = 18;\nlet isActive: boolean = true;\n\n// Interface\ninterface User {\n  id: number;\n  name: string;\n  email?: string; // optional\n}\n\n// Function với types\nfunction greet(user: User): string {\n  return `Hello ${user.name}`;\n}\n```',
  'type': '**TypeScript Types**\n\n```typescript\ntype Status = "pending" | "active" | "done";\n\ninterface User {\n  id: number;\n  name: string;\n}\n\nconst user: User = { id: 1, name: "An" };\n```',
  
  // React
  'react': '**React** là thư viện xây dựng UI.\n\n```jsx\n// Component cơ bản\nfunction Hello({ name }) {\n  const [count, setCount] = useState(0);\n  \n  return (\n    <div>\n      <h1>Hello {name}!</h1>\n      <button onClick={() => setCount(c => c+1)}>\n        Clicked {count} times\n      </button>\n    </div>\n  );\n}\n```',
  'usestate': '**useState** - Hook quản lý state.\n\n```jsx\nconst [count, setCount] = useState(0);\nconst [user, setUser] = useState({ name: "" });\n\n// Cập nhật\nsetCount(count + 1);\nsetCount(prev => prev + 1);  // Tốt hơn\nsetUser({ ...user, name: "An" });\n```',
  'useeffect': '**useEffect** - Hook xử lý side effects.\n\n```jsx\nuseEffect(() => {\n  // Chạy sau mỗi render\n  console.log("Rendered!");\n  \n  return () => {\n    // Cleanup\n  };\n}, [dependency]);\n```',
  'nextjs': '**Next.js** - React framework cho production.\n\n```jsx\n// app/page.tsx (App Router)\nexport default async function Home() {\n  const data = await fetch(url);\n  return <main>{data}</main>;\n}\n\n// Server Actions\n"use server";\nexport async function createUser(formData) {\n  await db.user.create(...);\n}\n```',
  'component': '**React Component**\n\n```jsx\n// Function Component\nfunction Button({ label, onClick }) {\n  return (\n    <button \n      onClick={onClick}\n      className="px-4 py-2 bg-blue-500 rounded"\n    >\n      {label}\n    </button>\n  );\n}\n\n// Usage\n<Button label="Click me" onClick={() => alert("Hi")} />\n```',

  // Python
  'python': '**Python** - Ngôn ngữ dễ học, mạnh mẽ.\n\n```python\n# Biến\nname = "An"\nage = 18\n\n# Hàm\ndef greet(name):\n    return f"Hello {name}!"\n\n# List\nnums = [1, 2, 3]\nnums.append(4)\n\n# Dictionary\nuser = {"name": "An", "age": 18}\n```',
  'list python': '**List trong Python**\n\n```python\nfruits = ["apple", "banana"]\nfruits.append("orange")  # Thêm\nfruits[0]                 # "apple"\n\n# List comprehension\nsquares = [x**2 for x in range(5)]\n```',
  'dictionary': '**Dictionary trong Python**\n\n```python\nuser = {\n    "name": "An",\n    "age": 18,\n    "skills": ["Python", "ML"]\n}\n\nuser["name"]      # "An"\nuser.get("email", "N/A")  # Default value\nuser.keys()       # dict_keys\nuser.values()     # dict_values\n```',
  
  // Machine Learning
  'machine learning': '**Machine Learning** - Máy học từ dữ liệu.\n\n```python\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.linear_model import LogisticRegression\n\n# Split data\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)\n\n# Train model\nmodel = LogisticRegression()\nmodel.fit(X_train, y_train)\n\n# Predict\npredictions = model.predict(X_test)\n```',
  'ml': '**Machine Learning Workflow**\n\n1. **Data Collection** - Thu thập dữ liệu\n2. **Data Preprocessing** - Làm sạch, chuẩn hóa\n3. **Feature Engineering** - Tạo features\n4. **Model Training** - Train model\n5. **Evaluation** - Đánh giá accuracy, F1...\n6. **Deployment** - Deploy lên production',
  'deep learning': '**Deep Learning** - Neural Networks nhiều layers.\n\n```python\nimport tensorflow as tf\n\nmodel = tf.keras.Sequential([\n    tf.keras.layers.Dense(128, activation="relu"),\n    tf.keras.layers.Dropout(0.2),\n    tf.keras.layers.Dense(10, activation="softmax")\n])\n\nmodel.compile(optimizer="adam", loss="sparse_categorical_crossentropy")\nmodel.fit(X_train, y_train, epochs=10)\n```',
  'neural network': '**Neural Network** - Mô phỏng não người.\n\n• **Input Layer**: Nhận dữ liệu đầu vào\n• **Hidden Layers**: Xử lý và học patterns\n• **Output Layer**: Đưa ra predictions\n• **Activation**: ReLU, Sigmoid, Softmax\n• **Backpropagation**: Cập nhật weights',
  
  // LLM & AI
  'llm': '**Large Language Models (LLMs)**\n\n```python\nfrom openai import OpenAI\n\nclient = OpenAI()\nresponse = client.chat.completions.create(\n    model="gpt-4",\n    messages=[\n        {"role": "system", "content": "You are helpful."},\n        {"role": "user", "content": "Hello!"}\n    ]\n)\nprint(response.choices[0].message.content)\n```',
  'prompt': '**Prompt Engineering**\n\n• **Be Specific**: Rõ ràng, cụ thể\n• **Provide Context**: Cung cấp background\n• **Use Examples**: Few-shot learning\n• **Chain-of-Thought**: "Let\'s think step by step"\n• **Output Format**: Định dạng JSON, markdown...',
  'rag': '**RAG - Retrieval Augmented Generation**\n\n1. **Embed Documents**: Chuyển text thành vectors\n2. **Store in Vector DB**: Pinecone, Chroma...\n3. **Query**: Tìm documents liên quan\n4. **Augment Prompt**: Thêm context vào prompt\n5. **Generate**: LLM trả lời với context',
  'chatgpt': '**Sử dụng ChatGPT API**\n\n```javascript\nconst response = await fetch("https://api.openai.com/v1/chat/completions", {\n  method: "POST",\n  headers: {\n    "Authorization": `Bearer ${API_KEY}`,\n    "Content-Type": "application/json"\n  },\n  body: JSON.stringify({\n    model: "gpt-4",\n    messages: [{ role: "user", content: "Hello" }]\n  })\n});\n```',
  
  // CSS
  'css': '**CSS** - Tạo style cho web.\n\n```css\n.button {\n  background: linear-gradient(to right, #10b981, #22c55e);\n  padding: 12px 24px;\n  border-radius: 12px;\n  color: white;\n  transition: all 0.3s;\n}\n\n.button:hover {\n  transform: scale(1.05);\n  box-shadow: 0 10px 20px rgba(0,0,0,0.2);\n}\n```',
  'flexbox': '**Flexbox** - Layout 1 chiều.\n\n```css\n.container {\n  display: flex;\n  justify-content: center;  /* Ngang */\n  align-items: center;      /* Dọc */\n  gap: 16px;\n  flex-wrap: wrap;\n}\n```',
  'grid': '**CSS Grid** - Layout 2 chiều.\n\n```css\n.grid {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 20px;\n}\n```',
  'tailwind': '**Tailwind CSS** - Utility-first CSS.\n\n```jsx\n<button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-lg transition-all">\n  Click me\n</button>\n\n// Responsive\n<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">\n```',
  
  // Database
  'sql': '**SQL** - Ngôn ngữ truy vấn database.\n\n```sql\n-- Truy vấn\nSELECT * FROM users WHERE age > 18;\n\n-- JOIN\nSELECT u.name, o.total\nFROM users u\nJOIN orders o ON u.id = o.user_id;\n\n-- Aggregate\nSELECT status, COUNT(*) FROM orders GROUP BY status;\n```',
  'database': '**Database Types**\n\n• **SQL**: PostgreSQL, MySQL, SQLite\n• **NoSQL**: MongoDB, Redis, Firebase\n• **Vector DB**: Pinecone, Chroma, Weaviate\n• **Cloud**: Supabase, PlanetScale, Neon',
  'postgresql': '**PostgreSQL** - Powerful open-source database.\n\n```sql\n-- Create table\nCREATE TABLE users (\n  id SERIAL PRIMARY KEY,\n  name VARCHAR(100) NOT NULL,\n  email VARCHAR(255) UNIQUE,\n  created_at TIMESTAMP DEFAULT NOW()\n);\n\n-- Index\nCREATE INDEX idx_users_email ON users(email);\n```',
  'mongodb': '**MongoDB** - NoSQL document database.\n\n```javascript\n// Insert\nawait db.users.insertOne({ name: "An", age: 18 });\n\n// Find\nconst users = await db.users.find({ age: { $gt: 18 } });\n\n// Update\nawait db.users.updateOne({ name: "An" }, { $set: { age: 19 } });\n```',
  
  // Git
  'git': '**Git** - Quản lý phiên bản code.\n\n```bash\n# Cơ bản\ngit init                  # Khởi tạo\ngit add .                 # Stage tất cả\ngit commit -m "message"   # Commit\ngit push origin main      # Push\n\n# Branch\ngit checkout -b feature   # Tạo & chuyển branch\ngit merge feature         # Merge\n```',
  'github': '**GitHub Workflow**\n\n1. **Fork** repo\n2. **Clone** về máy\n3. **Create branch** cho feature\n4. **Commit** changes\n5. **Push** lên fork\n6. **Create PR** (Pull Request)\n7. **Code Review** & Merge',
  
  // Cloud
  'aws': '**AWS** - Amazon Web Services.\n\n• **EC2**: Virtual servers\n• **S3**: Object storage\n• **RDS**: Managed databases\n• **Lambda**: Serverless functions\n• **SageMaker**: ML platform\n• **Bedrock**: Foundation models',
  'docker': '**Docker** - Containerization.\n\n```dockerfile\nFROM node:18-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nEXPOSE 3000\nCMD ["npm", "start"]\n```\n\n```bash\ndocker build -t myapp .\ndocker run -p 3000:3000 myapp\n```',
  'kubernetes': '**Kubernetes** - Container orchestration.\n\n```yaml\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: myapp\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: myapp\n  template:\n    spec:\n      containers:\n      - name: myapp\n        image: myapp:1.0\n```',
  'vercel': '**Vercel** - Deploy Next.js apps.\n\n```bash\n# Install CLI\nnpm i -g vercel\n\n# Deploy\nvercel\n\n# Production\nvercel --prod\n```\n\nFeatures: Edge Functions, Analytics, Preview Deployments',
  
  // API
  'api': '**API** - Giao tiếp giữa các ứng dụng.\n\n```javascript\n// GET request\nconst response = await fetch("/api/users");\nconst data = await response.json();\n\n// POST request\nawait fetch("/api/users", {\n  method: "POST",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify({ name: "An" })\n});\n```',
  'rest': '**REST API** - Representational State Transfer.\n\n• **GET** /users - Lấy danh sách\n• **GET** /users/:id - Lấy 1 user\n• **POST** /users - Tạo mới\n• **PUT** /users/:id - Cập nhật\n• **DELETE** /users/:id - Xóa',
  'graphql': '**GraphQL** - Query language cho API.\n\n```graphql\nquery {\n  user(id: "1") {\n    name\n    email\n    posts {\n      title\n    }\n  }\n}\n\nmutation {\n  createUser(name: "An", email: "an@email.com") {\n    id\n  }\n}\n```',
  
  // Algorithms
  'thuật toán': '**Thuật toán cơ bản**\n\n```javascript\n// Binary Search - O(log n)\nfunction binarySearch(arr, target) {\n  let left = 0, right = arr.length - 1;\n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}\n```',
  'algorithm': '**Thuật toán phổ biến**\n\n• **Sorting**: Quick Sort, Merge Sort\n• **Searching**: Binary Search, BFS, DFS\n• **Dynamic Programming**: Fibonacci, Knapsack\n• **Graph**: Dijkstra, A*',
  'big o': '**Big O Notation** - Độ phức tạp.\n\n• O(1) - Constant (tốt nhất)\n• O(log n) - Logarithmic\n• O(n) - Linear\n• O(n log n) - Linearithmic\n• O(n²) - Quadratic\n• O(2ⁿ) - Exponential (tệ nhất)',
  
  // Security
  'jwt': '**JWT** - JSON Web Token.\n\n```javascript\nimport jwt from "jsonwebtoken";\n\n// Create token\nconst token = jwt.sign(\n  { userId: user.id },\n  process.env.JWT_SECRET,\n  { expiresIn: "1h" }\n);\n\n// Verify token\nconst decoded = jwt.verify(token, process.env.JWT_SECRET);\n```',
  'authentication': '**Authentication Methods**\n\n• **JWT**: Stateless tokens\n• **Session**: Server-side storage\n• **OAuth**: Google, GitHub login\n• **Passkeys**: Passwordless\n• **2FA**: Two-factor authentication',
  
  // Project specific
  'khóa học': '**Khóa học trên CodeMind**\n\nChúng tôi có 15+ khóa học:\n\n• **Nền tảng**: SQL, Python, JavaScript\n• **AI/ML**: Machine Learning, Deep Learning, LLMs\n• **Web**: React, Next.js, Backend APIs\n• **DevOps**: Docker, Kubernetes, Cloud\n• **Bonus**: Product Management, UI/UX\n\nVào tab "Khóa học" để bắt đầu!',
  'xu': '**Hệ thống Xu CodeMind**\n\n• Hoàn thành bài học: +50-200 xu\n• Giải kho báu: +100-500 xu\n• Điểm danh hàng ngày: +10-100 xu\n• Quay vòng quay: +5-200 xu\n• Hoàn thành nhiệm vụ: +50-100 xu\n\nDùng xu để mua khóa học premium!',
  'kho báu': '**Kho Báu CodeMind**\n\nHoàn thành bài học để mở khóa kho báu!\n\n• Giải câu đố để nhận xu\n• Thu thập thành tựu\n• Khám phá bản đồ kho báu',
  'xp': '**Hệ thống XP & Level**\n\n• Mỗi 100 XP = 1 Level\n• Hoàn thành bài học: +20-150 XP\n• Điểm danh: +20-150 XP\n• Quay vòng quay: +10-200 XP\n\nLevel cao hơn = Mở khóa nhiều tính năng hơn!',
  
  'default': 'Xin chào! Tôi là **AI Trợ Lý CodeMind**!\n\nTôi có thể giúp bạn với:\n\n• **JavaScript/TypeScript**: biến, hàm, async/await\n• **React/Next.js**: hooks, components, SSR\n• **Python**: cú pháp, ML, Deep Learning\n• **AI/LLMs**: Prompt Engineering, RAG, ChatGPT\n• **Database**: SQL, MongoDB, PostgreSQL\n• **DevOps**: Docker, Kubernetes, AWS\n• **Git/GitHub**: version control, workflow\n\nHãy hỏi tôi bất cứ điều gì!',
};


const QUICK_QUESTIONS: QuickQuestion[] = [
  { icon: <Code2 className="w-4 h-4" />, text: "JavaScript", query: "javascript cơ bản" },
  { icon: <Layers className="w-4 h-4" />, text: "React Hooks", query: "usestate react" },
  { icon: <Brain className="w-4 h-4" />, text: "Machine Learning", query: "machine learning" },
  { icon: <Cpu className="w-4 h-4" />, text: "LLMs & AI", query: "llm" },
  { icon: <Database className="w-4 h-4" />, text: "SQL Database", query: "sql" },
  { icon: <Cloud className="w-4 h-4" />, text: "Docker", query: "docker" },
  { icon: <Terminal className="w-4 h-4" />, text: "Git Commands", query: "git" },
  { icon: <Palette className="w-4 h-4" />, text: "Tailwind CSS", query: "tailwind" },
];

export const AIAssistant = () => {
  const { user, profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: AI_RESPONSES.default,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showQuickQuestions, setShowQuickQuestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && user) {
      loadHistory();
    }
  }, [isOpen, user]);

  const loadHistory = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(20);

    if (data && data.length > 0) {
      const history: Message[] = [];
      data.forEach((conv) => {
        history.push({ role: 'user', content: conv.message, timestamp: new Date(conv.created_at) });
        history.push({ role: 'assistant', content: conv.response, timestamp: new Date(conv.created_at) });
      });
      setMessages(history);
      setShowQuickQuestions(false);
    }
  };

  const getAIResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase();
    
    // Check for exact or partial matches
    for (const [keyword, response] of Object.entries(AI_RESPONSES)) {
      if (keyword !== 'default' && lowerQuestion.includes(keyword)) {
        return response;
      }
    }

    // Help responses
    if (lowerQuestion.includes('giúp') || lowerQuestion.includes('help')) {
      return AI_RESPONSES.default;
    }

    // Learning path
    if (lowerQuestion.includes('học') || lowerQuestion.includes('bắt đầu') || lowerQuestion.includes('roadmap')) {
      return '**Lộ trình học lập trình 2025:**\n\n1. **Nền tảng**: HTML, CSS, JavaScript\n2. **Frontend**: React, Next.js, TypeScript\n3. **Backend**: Node.js hoặc Python\n4. **Database**: SQL, PostgreSQL\n5. **AI/ML**: Machine Learning, LLMs\n6. **DevOps**: Docker, Cloud\n\nVào tab "Khóa học" để bắt đầu!';
    }

    // Fallback
    return 'Câu hỏi hay! Tôi có thể giúp bạn với:\n\n• **JavaScript/TypeScript**: biến, hàm, async\n• **React/Next.js**: hooks, components\n• **Python/ML**: cú pháp, machine learning\n• **AI/LLMs**: prompt engineering, RAG\n• **Database**: SQL, MongoDB\n• **DevOps**: Docker, Kubernetes\n\nHãy hỏi cụ thể hơn nhé!';
  };

  const handleSend = async (customInput?: string) => {
    const messageToSend = customInput || input;
    if (!messageToSend.trim() || !user) return;

    const userMessage: Message = { role: 'user', content: messageToSend, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setShowQuickQuestions(false);

    setTimeout(async () => {
      const response = getAIResponse(messageToSend);
      const assistantMessage: Message = { role: 'assistant', content: response, timestamp: new Date() };
      setMessages((prev) => [...prev, assistantMessage]);
      setLoading(false);

      await supabase.from('ai_conversations').insert({
        user_id: user.id,
        message: messageToSend,
        response: response,
      });
    }, 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearHistory = async () => {
    if (!user) return;
    await supabase.from('ai_conversations').delete().eq('user_id', user.id);
    setMessages([{ role: 'assistant', content: AI_RESPONSES.default, timestamp: new Date() }]);
    setShowQuickQuestions(true);
  };

  const formatMessage = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-emerald-400">$1</strong>')
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-gray-900 rounded-lg p-3 my-2 overflow-x-auto text-xs"><code>$2</code></pre>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-700 px-1.5 py-0.5 rounded text-emerald-300 text-xs">$1</code>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <>
      {/* Floating Button - Positioned above mobile navbar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-24 sm:bottom-20 lg:bottom-6 right-4 lg:right-6 z-40 group transition-all duration-300 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity animate-pulse"></div>
          <div className="relative w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform">
            <MessageCircle className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white animate-bounce">
              AI
            </span>
          </div>
        </div>
      </button>

      {/* Chat Window - Responsive positioning */}
      {isOpen && (
        <div className={`fixed z-50 transition-all duration-300 ${
          isMinimized 
            ? 'bottom-24 sm:bottom-20 lg:bottom-6 right-4 lg:right-6 w-72 sm:w-80' 
            : 'bottom-24 sm:bottom-20 lg:bottom-6 right-2 sm:right-4 lg:right-6 left-2 sm:left-auto w-auto sm:w-[380px] lg:w-[420px] h-[60vh] sm:h-[600px] max-h-[75vh]'
        }`}>
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-3xl blur-xl"></div>
          
          <div className={`relative bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-emerald-500/30 flex flex-col overflow-hidden ${
            isMinimized ? '' : 'h-full'
          }`}>
            
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-green-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                    <Bot className="w-7 h-7 text-white" />
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-emerald-600"></span>
                </div>
                <div>
                  <h3 className="font-bold text-white flex items-center gap-2">
                    AI Trợ Lý
                    <Sparkles className="w-4 h-4 text-emerald-200 animate-pulse" />
                  </h3>
                  <p className="text-xs text-emerald-100">Online • Sẵn sàng hỗ trợ</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button onClick={clearHistory} className="p-2 hover:bg-white/20 rounded-lg transition-colors" title="Xóa lịch sử">
                  <Trash2 className="w-5 h-5 text-white/80" />
                </button>
                <button onClick={() => setIsMinimized(!isMinimized)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                  <ChevronDown className={`w-5 h-5 text-white transition-transform ${isMinimized ? 'rotate-180' : ''}`} />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                    >
                      {message.role === 'assistant' && (
                        <div className="flex-shrink-0 w-9 h-9 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                      )}

                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-lg ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white'
                            : 'bg-gray-800 text-gray-100 border border-gray-700'
                        }`}
                      >
                        <div 
                          className="text-sm leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                        />
                      </div>

                      {message.role === 'user' && (
                        <div className="flex-shrink-0 w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                          {(profile as any)?.avatar_url ? (
                            <img src={(profile as any).avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-white" />
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  {loading && (
                    <div className="flex gap-3 justify-start animate-fadeIn">
                      <div className="flex-shrink-0 w-9 h-9 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div className="bg-gray-800 rounded-2xl px-4 py-3 border border-gray-700">
                        <div className="flex gap-1.5">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Questions */}
                {showQuickQuestions && messages.length <= 1 && (
                  <div className="px-4 pb-2">
                    <p className="text-xs text-gray-500 mb-2">Câu hỏi gợi ý:</p>
                    <div className="flex flex-wrap gap-2">
                      {QUICK_QUESTIONS.map((q, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(q.query)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-emerald-500/20 border border-gray-700 hover:border-emerald-500/50 rounded-full text-xs text-gray-300 hover:text-emerald-400 transition-all"
                        >
                          {q.icon}
                          {q.text}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input */}
                <div className="p-4 border-t border-gray-800 bg-gray-900/50">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Hỏi về lập trình, AI, database..."
                      className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all text-sm"
                    />
                    <button
                      onClick={() => handleSend()}
                      disabled={!input.trim() || loading}
                      className="px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl hover:from-emerald-600 hover:to-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-emerald-500/25"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-600 mt-2 text-center">
                    Powered by CodeMind AI • Nhấn Enter để gửi
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
