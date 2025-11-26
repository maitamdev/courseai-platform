import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, Bot, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, AIConversation } from '../lib/supabase';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

const AI_RESPONSES: Record<string, string> = {
  'biến': 'Biến là nơi lưu trữ dữ liệu. Trong JavaScript, dùng let để khai báo biến có thể thay đổi, const cho biến không đổi. Ví dụ: let age = 15; const name = "An";',
  'variable': 'Biến là nơi lưu trữ dữ liệu. Trong JavaScript, dùng let để khai báo biến có thể thay đổi, const cho biến không đổi. Ví dụ: let age = 15; const name = "An";',
  'hàm': 'Hàm là khối code có thể tái sử dụng. Cú pháp: function tenHam(thamSo) { return ketQua; }. Ví dụ: function cong(a, b) { return a + b; }',
  'function': 'Hàm là khối code có thể tái sử dụng. Cú pháp: function tenHam(thamSo) { return ketQua; }. Ví dụ: function cong(a, b) { return a + b; }',
  'vòng lặp': 'Vòng lặp giúp lặp lại code nhiều lần. for (let i = 0; i < 5; i++) { console.log(i); } sẽ in số từ 0 đến 4.',
  'loop': 'Vòng lặp giúp lặp lại code nhiều lần. for (let i = 0; i < 5; i++) { console.log(i); } sẽ in số từ 0 đến 4.',
  'if': 'Câu lệnh if kiểm tra điều kiện. if (dieu_kien) { // code chạy nếu đúng } else { // code chạy nếu sai }',
  'mảng': 'Mảng lưu nhiều giá trị: let arr = [1, 2, 3]; Truy cập: arr[0] = 1. Thêm: arr.push(4). Duyệt: arr.map(), arr.filter().',
  'array': 'Mảng lưu nhiều giá trị: let arr = [1, 2, 3]; Truy cập: arr[0] = 1. Thêm: arr.push(4). Duyệt: arr.map(), arr.filter().',
  'object': 'Object lưu dữ liệu dạng key-value: let user = { name: "An", age: 16 }; Truy cập: user.name hoặc user["name"].',
  'đối tượng': 'Object lưu dữ liệu dạng key-value: let user = { name: "An", age: 16 }; Truy cập: user.name hoặc user["name"].',
  'promise': 'Promise xử lý async: new Promise((resolve, reject) => { ... }). Dùng .then() hoặc async/await để xử lý kết quả.',
  'async': 'async/await làm code bất đồng bộ dễ đọc: async function getData() { const data = await fetch(url); return data; }',
  'default': 'Tôi là AI trợ lý Code Quest! Tôi có thể giúp bạn với: biến, hàm, vòng lặp, if/else, mảng, object, promise, async/await. Hãy hỏi tôi bất cứ điều gì về lập trình!',
};

export const AIAssistant = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Xin chào! Tôi là trợ lý AI của Code Quest. Bạn cần giúp gì về lập trình?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
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
        history.push({
          role: 'user',
          content: conv.message,
          timestamp: new Date(conv.created_at),
        });
        history.push({
          role: 'assistant',
          content: conv.response,
          timestamp: new Date(conv.created_at),
        });
      });
      setMessages([...history]);
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

    if (lowerQuestion.includes('học') || lowerQuestion.includes('bắt đầu')) {
      return 'Hãy bắt đầu với tab "Bài học" để học từng bước một! Hoàn thành bài học để mở khóa kho báu và kiếm xu nhé!';
    }

    if (lowerQuestion.includes('kho báu') || lowerQuestion.includes('treasure')) {
      return 'Kho báu được mở khóa khi bạn hoàn thành bài học. Vào tab "Kho báu" để xem bản đồ và giải câu đố nhận thưởng!';
    }

    return 'Câu hỏi hay đấy! Tôi có thể giúp bạn với các khái niệm lập trình cơ bản như: biến, hàm, vòng lặp, if/else, mảng, object. Bạn muốn tìm hiểu về chủ đề nào?';
  };

  const handleSend = async () => {
    if (!input.trim() || !user) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    setTimeout(async () => {
      const response = getAIResponse(input);
      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setLoading(false);

      await supabase.from('ai_conversations').insert({
        user_id: user.id,
        message: input,
        response: response,
      });
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-40"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col z-40 border-2 border-gray-200">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-2xl flex items-center gap-3">
            <Bot className="w-6 h-6" />
            <div>
              <h3 className="font-bold">AI Trợ Lý</h3>
              <p className="text-xs opacity-90">Hỏi đáp về lập trình</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}

                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>

                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-gray-100 rounded-2xl px-4 py-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Hỏi về lập trình..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
