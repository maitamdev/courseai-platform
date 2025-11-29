import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, Bot, User, Sparkles, Zap, BookOpen, Code2, Lightbulb, Trash2, ChevronDown } from 'lucide-react';
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
  'biến': '📦 **Biến (Variable)** là nơi lưu trữ dữ liệu trong bộ nhớ.\n\n```javascript\n// Khai báo biến\nlet tuoi = 18;        // Có thể thay đổi\nconst ten = "An";     // Không thể thay đổi\nvar x = 10;           // Cách cũ (tránh dùng)\n```\n\n💡 **Tip:** Luôn dùng `const` trước, chỉ dùng `let` khi cần thay đổi giá trị!',
  'variable': '📦 **Biến (Variable)** là nơi lưu trữ dữ liệu trong bộ nhớ.\n\n```javascript\nlet tuoi = 18;        // Có thể thay đổi\nconst ten = "An";     // Không thể thay đổi\n```\n\n💡 **Tip:** Luôn dùng `const` trước, chỉ dùng `let` khi cần thay đổi!',
  
  'hàm': '⚡ **Hàm (Function)** là khối code có thể tái sử dụng.\n\n```javascript\n// Cách 1: Function declaration\nfunction chao(ten) {\n  return "Xin chào " + ten;\n}\n\n// Cách 2: Arrow function (ES6)\nconst cong = (a, b) => a + b;\n\n// Gọi hàm\nchao("An");  // "Xin chào An"\ncong(2, 3);  // 5\n```',
  'function': '⚡ **Hàm (Function)** là khối code có thể tái sử dụng.\n\n```javascript\nfunction chao(ten) {\n  return "Xin chào " + ten;\n}\n\nconst cong = (a, b) => a + b;\n```',
  
  'vòng lặp': '🔄 **Vòng lặp (Loop)** giúp lặp lại code nhiều lần.\n\n```javascript\n// For loop\nfor (let i = 0; i < 5; i++) {\n  console.log(i);  // 0, 1, 2, 3, 4\n}\n\n// While loop\nlet j = 0;\nwhile (j < 3) {\n  console.log(j++);\n}\n\n// For...of (duyệt mảng)\nconst arr = ["a", "b", "c"];\nfor (const item of arr) {\n  console.log(item);\n}\n```',
  'loop': '🔄 **Vòng lặp** giúp lặp lại code nhiều lần.\n\n```javascript\nfor (let i = 0; i < 5; i++) {\n  console.log(i);\n}\n```',
  'for': '🔄 **For Loop**\n\n```javascript\nfor (let i = 0; i < 5; i++) {\n  console.log(i);  // 0, 1, 2, 3, 4\n}\n```',
  'while': '🔄 **While Loop**\n\n```javascript\nlet i = 0;\nwhile (i < 5) {\n  console.log(i++);\n}\n```',

  'if': '🔀 **Câu lệnh điều kiện (If/Else)**\n\n```javascript\nconst diem = 85;\n\nif (diem >= 90) {\n  console.log("Xuất sắc!");\n} else if (diem >= 70) {\n  console.log("Khá!");\n} else {\n  console.log("Cần cố gắng!");\n}\n\n// Ternary operator (rút gọn)\nconst ketQua = diem >= 50 ? "Đậu" : "Rớt";\n```',
  'điều kiện': '🔀 **Câu lệnh điều kiện**\n\n```javascript\nif (diem >= 50) {\n  console.log("Đậu");\n} else {\n  console.log("Rớt");\n}\n```',
  
  'mảng': '📚 **Mảng (Array)** lưu nhiều giá trị trong một biến.\n\n```javascript\nconst fruits = ["🍎", "🍌", "🍊"];\n\n// Truy cập\nfruits[0];        // "🍎"\nfruits.length;    // 3\n\n// Thêm/Xóa\nfruits.push("🍇");     // Thêm cuối\nfruits.pop();          // Xóa cuối\nfruits.unshift("🍓");  // Thêm đầu\n\n// Duyệt mảng\nfruits.map(f => f + "!");\nfruits.filter(f => f !== "🍌");\nfruits.find(f => f === "🍎");\n```',
  'array': '📚 **Mảng (Array)**\n\n```javascript\nconst arr = [1, 2, 3];\narr.push(4);      // Thêm\narr.map(x => x*2); // [2,4,6]\n```',
  
  'object': '🎯 **Object** lưu dữ liệu dạng key-value.\n\n```javascript\nconst user = {\n  name: "An",\n  age: 18,\n  skills: ["JS", "React"],\n  greet() {\n    return `Hi, I am ${this.name}`;\n  }\n};\n\n// Truy cập\nuser.name;        // "An"\nuser["age"];      // 18\nuser.greet();     // "Hi, I am An"\n\n// Destructuring\nconst { name, age } = user;\n```',
  'đối tượng': '🎯 **Object** lưu dữ liệu dạng key-value.\n\n```javascript\nconst user = { name: "An", age: 18 };\nuser.name;  // "An"\n```',
  
  'promise': '⏳ **Promise** xử lý tác vụ bất đồng bộ.\n\n```javascript\nconst fetchData = new Promise((resolve, reject) => {\n  setTimeout(() => {\n    resolve("Dữ liệu!");\n  }, 1000);\n});\n\nfetchData\n  .then(data => console.log(data))\n  .catch(err => console.error(err));\n```',
  
  'async': '⚡ **Async/Await** - cách viết Promise dễ đọc hơn.\n\n```javascript\nasync function getData() {\n  try {\n    const response = await fetch(url);\n    const data = await response.json();\n    return data;\n  } catch (error) {\n    console.error(error);\n  }\n}\n```',
  
  // React
  'react': '⚛️ **React** là thư viện xây dựng UI.\n\n```jsx\n// Component cơ bản\nfunction Hello({ name }) {\n  const [count, setCount] = useState(0);\n  \n  return (\n    <div>\n      <h1>Hello {name}!</h1>\n      <button onClick={() => setCount(c => c+1)}>\n        Clicked {count} times\n      </button>\n    </div>\n  );\n}\n```',
  'usestate': '🪝 **useState** - Hook quản lý state.\n\n```jsx\nconst [count, setCount] = useState(0);\nconst [user, setUser] = useState({ name: "" });\n\n// Cập nhật\nsetCount(count + 1);\nsetCount(prev => prev + 1);  // Tốt hơn\nsetUser({ ...user, name: "An" });\n```',
  'useeffect': '🪝 **useEffect** - Hook xử lý side effects.\n\n```jsx\nuseEffect(() => {\n  // Chạy sau mỗi render\n  console.log("Rendered!");\n  \n  return () => {\n    // Cleanup\n  };\n}, [dependency]);  // Chỉ chạy khi dependency thay đổi\n```',

  // Python
  'python': '🐍 **Python** - Ngôn ngữ dễ học, mạnh mẽ.\n\n```python\n# Biến\nname = "An"\nage = 18\n\n# Hàm\ndef greet(name):\n    return f"Hello {name}!"\n\n# List\nnums = [1, 2, 3]\nnums.append(4)\n\n# Dictionary\nuser = {"name": "An", "age": 18}\n```',
  'list python': '📚 **List trong Python**\n\n```python\nfruits = ["apple", "banana"]\nfruits.append("orange")  # Thêm\nfruits[0]                 # "apple"\nlen(fruits)               # 3\n\n# List comprehension\nsquares = [x**2 for x in range(5)]\n```',
  
  // CSS
  'css': '🎨 **CSS** - Tạo style cho web.\n\n```css\n/* Selector cơ bản */\n.button {\n  background: linear-gradient(to right, #10b981, #22c55e);\n  padding: 12px 24px;\n  border-radius: 12px;\n  color: white;\n  transition: all 0.3s;\n}\n\n.button:hover {\n  transform: scale(1.05);\n  box-shadow: 0 10px 20px rgba(0,0,0,0.2);\n}\n```',
  'flexbox': '📦 **Flexbox** - Layout 1 chiều.\n\n```css\n.container {\n  display: flex;\n  justify-content: center;  /* Ngang */\n  align-items: center;      /* Dọc */\n  gap: 16px;\n  flex-wrap: wrap;\n}\n\n.item {\n  flex: 1;  /* Chia đều */\n}\n```',
  'grid': '📐 **CSS Grid** - Layout 2 chiều.\n\n```css\n.grid {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 20px;\n}\n\n.item {\n  grid-column: span 2;  /* Chiếm 2 cột */\n}\n```',
  
  // HTML
  'html': '📄 **HTML** - Cấu trúc trang web.\n\n```html\n<!DOCTYPE html>\n<html lang="vi">\n<head>\n  <title>Trang web</title>\n</head>\n<body>\n  <header>Header</header>\n  <main>\n    <h1>Tiêu đề</h1>\n    <p>Nội dung</p>\n  </main>\n  <footer>Footer</footer>\n</body>\n</html>\n```',
  
  // Git
  'git': '🔀 **Git** - Quản lý phiên bản code.\n\n```bash\n# Cơ bản\ngit init                  # Khởi tạo\ngit add .                 # Stage tất cả\ngit commit -m "message"   # Commit\ngit push origin main      # Push lên remote\n\n# Branch\ngit branch feature        # Tạo branch\ngit checkout feature      # Chuyển branch\ngit merge feature         # Merge\n```',
  
  // Algorithms
  'thuật toán': '🧮 **Thuật toán cơ bản**\n\n```javascript\n// Sắp xếp nổi bọt\nfunction bubbleSort(arr) {\n  for (let i = 0; i < arr.length; i++) {\n    for (let j = 0; j < arr.length - i - 1; j++) {\n      if (arr[j] > arr[j+1]) {\n        [arr[j], arr[j+1]] = [arr[j+1], arr[j]];\n      }\n    }\n  }\n  return arr;\n}\n```',
  'algorithm': '🧮 **Thuật toán** - Các bước giải quyết vấn đề.\n\nCác thuật toán phổ biến:\n• Sắp xếp: Bubble, Quick, Merge Sort\n• Tìm kiếm: Linear, Binary Search\n• Đệ quy: Fibonacci, Factorial',
  'big o': '📊 **Big O Notation** - Độ phức tạp thuật toán.\n\n• O(1) - Hằng số (tốt nhất)\n• O(log n) - Logarit\n• O(n) - Tuyến tính\n• O(n log n) - Linearithmic\n• O(n²) - Bình phương\n• O(2ⁿ) - Mũ (tệ nhất)',
  
  // Database
  'sql': '🗄️ **SQL** - Ngôn ngữ truy vấn database.\n\n```sql\n-- Truy vấn\nSELECT * FROM users WHERE age > 18;\n\n-- Thêm\nINSERT INTO users (name, age) VALUES ("An", 20);\n\n-- Cập nhật\nUPDATE users SET age = 21 WHERE name = "An";\n\n-- Xóa\nDELETE FROM users WHERE id = 1;\n```',
  
  'api': '🌐 **API** - Giao tiếp giữa các ứng dụng.\n\n```javascript\n// Fetch API\nconst response = await fetch("https://api.example.com/users");\nconst data = await response.json();\n\n// POST request\nawait fetch(url, {\n  method: "POST",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify({ name: "An" })\n});\n```',
  
  'default': '👋 Xin chào! Tôi là **AI Trợ Lý CodeMind**!\n\nTôi có thể giúp bạn với:\n• 📦 JavaScript: biến, hàm, mảng, object, promise\n• ⚛️ React: useState, useEffect, components\n• 🐍 Python: cú pháp, list, dictionary\n• 🎨 CSS: flexbox, grid, animations\n• 🔀 Git: commands, branching\n• 🧮 Thuật toán: sorting, searching, Big O\n• 🗄️ Database: SQL cơ bản\n\nHãy hỏi tôi bất cứ điều gì! 🚀',
};


const QUICK_QUESTIONS: QuickQuestion[] = [
  { icon: <Code2 className="w-4 h-4" />, text: "JavaScript cơ bản", query: "biến trong javascript" },
  { icon: <Zap className="w-4 h-4" />, text: "React Hooks", query: "usestate react" },
  { icon: <BookOpen className="w-4 h-4" />, text: "Python", query: "python cơ bản" },
  { icon: <Lightbulb className="w-4 h-4" />, text: "Thuật toán", query: "thuật toán cơ bản" },
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
      .limit(10);

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
    
    for (const [keyword, response] of Object.entries(AI_RESPONSES)) {
      if (keyword !== 'default' && lowerQuestion.includes(keyword)) {
        return response;
      }
    }

    if (lowerQuestion.includes('giúp') || lowerQuestion.includes('help')) {
      return AI_RESPONSES.default;
    }

    if (lowerQuestion.includes('học') || lowerQuestion.includes('bắt đầu') || lowerQuestion.includes('start')) {
      return '🎯 **Bắt đầu học lập trình:**\n\n1. **HTML/CSS** - Nền tảng web\n2. **JavaScript** - Ngôn ngữ lập trình web\n3. **React** - Framework phổ biến\n4. **Backend** - Node.js hoặc Python\n\n💡 Vào tab "Khóa học" để bắt đầu học ngay!';
    }

    if (lowerQuestion.includes('kho báu') || lowerQuestion.includes('treasure')) {
      return '🗺️ **Kho Báu CodeMind**\n\nHoàn thành bài học để mở khóa kho báu!\n\n• 🎯 Giải câu đố để nhận xu\n• 🏆 Thu thập thành tựu\n• 🎁 Đổi xu lấy khóa học premium';
    }

    if (lowerQuestion.includes('xu') || lowerQuestion.includes('coin')) {
      return '🪙 **Hệ thống Xu**\n\n• Hoàn thành bài học: +50-200 xu\n• Giải kho báu: +100-500 xu\n• Điểm danh hàng ngày: +50 xu\n• Mời bạn bè: +200 xu\n\n💰 Dùng xu để mua khóa học premium!';
    }

    return '🤔 Câu hỏi hay đấy! Tôi có thể giúp bạn với:\n\n• **JavaScript**: biến, hàm, mảng, object\n• **React**: hooks, components\n• **Python**: cú pháp cơ bản\n• **CSS**: flexbox, grid\n• **Git**: version control\n\nHãy hỏi cụ thể hơn nhé! 🚀';
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
    }, 800);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
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
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-emerald-400">$1</strong>')
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-gray-900 rounded-lg p-3 my-2 overflow-x-auto text-xs"><code>$2</code></pre>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-700 px-1.5 py-0.5 rounded text-emerald-300 text-xs">$1</code>')
      .replace(/\n/g, '<br/>');
  };


  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 group transition-all duration-300 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity animate-pulse"></div>
          
          {/* Button */}
          <div className="relative w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform">
            <MessageCircle className="w-7 h-7 text-white" />
            
            {/* Notification dot */}
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white animate-bounce">
              AI
            </span>
          </div>
        </div>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed z-50 transition-all duration-300 ${
          isMinimized 
            ? 'bottom-6 right-6 w-80' 
            : 'bottom-6 right-6 w-[420px] h-[600px] max-h-[80vh]'
        }`}>
          {/* Glow background */}
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
                <button
                  onClick={clearHistory}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title="Xóa lịch sử"
                >
                  <Trash2 className="w-5 h-5 text-white/80" />
                </button>
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <ChevronDown className={`w-5 h-5 text-white transition-transform ${isMinimized ? 'rotate-180' : ''}`} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
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
                    <p className="text-xs text-gray-500 mb-2">💡 Câu hỏi gợi ý:</p>
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
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Hỏi về lập trình..."
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all text-sm"
                      />
                    </div>
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
