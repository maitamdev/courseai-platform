import { useState } from 'react';
import { Play, CheckCircle, XCircle, Award, Clock } from 'lucide-react';

type TestCase = {
  input: string;
  expectedArea?: number;
  expectedPerimeter?: number;
  expected?: string;
};

type Rubric = {
  criteria: string;
  points: number;
};

type CodeEditorProps = {
  starterCode: string;
  testCases: TestCase[];
  rubric: Rubric[];
  solution: string;
  onSubmit: (code: string, score: number) => void;
};

export const CodeEditor = ({ starterCode, testCases: _testCases, rubric, solution, onSubmit }: CodeEditorProps) => {
  const [code, setCode] = useState(starterCode);
  const [output, setOutput] = useState('');
  const [testResults, setTestResults] = useState<any[]>([]);
  const [score, setScore] = useState(0);
  const [running, setRunning] = useState(false);

  const runCode = async () => {
    setRunning(true);
    setOutput('Đang chạy code...\n');

    try {
      // Giả lập chạy code (trong thực tế cần backend API)
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Kiểm tra code có đúng cú pháp cơ bản không
      const hasClass = code.includes('class');
      const hasVirtual = code.includes('virtual');

      const results: any[] = [];
      let totalScore = 0;

      // Chấm điểm theo rubric
      rubric.forEach(item => {
        let passed = false;
        
        if (item.criteria.includes('Abstract class')) {
          passed = hasClass && hasVirtual && code.includes('= 0');
        } else if (item.criteria.includes('Circle')) {
          passed = code.includes('Circle') && code.includes('3.14');
        } else if (item.criteria.includes('Rectangle')) {
          passed = code.includes('Rectangle');
        } else if (item.criteria.includes('Triangle')) {
          passed = code.includes('Triangle');
        } else if (item.criteria.includes('destructor')) {
          passed = code.includes('~') && hasVirtual;
        } else if (item.criteria.includes('Test cases')) {
          passed = hasClass && hasVirtual;
        }

        if (passed) {
          totalScore += item.points;
          results.push({ criteria: item.criteria, passed: true, points: item.points });
        } else {
          results.push({ criteria: item.criteria, passed: false, points: 0 });
        }
      });

      setTestResults(results);
      setScore(totalScore);
      setOutput(`✅ Code đã chạy thành công!\n\nĐiểm số: ${totalScore}/100\n\n` + 
        results.map(r => `${r.passed ? '✓' : '✗'} ${r.criteria}: ${r.points} điểm`).join('\n'));

      if (totalScore >= 80) {
        setOutput(prev => prev + '\n\n🎉 Xuất sắc! Bạn đã hoàn thành bài tập!');
      } else if (totalScore >= 60) {
        setOutput(prev => prev + '\n\n👍 Tốt! Còn một số điểm cần cải thiện.');
      } else {
        setOutput(prev => prev + '\n\n💪 Cố gắng thêm! Xem lại yêu cầu và hints.');
      }

    } catch (error) {
      setOutput(`❌ Lỗi: ${error}`);
    } finally {
      setRunning(false);
    }
  };

  const submitCode = () => {
    if (score >= 60) {
      onSubmit(code, score);
      alert(`Đã nộp bài! Điểm: ${score}/100`);
    } else {
      alert('Bạn cần đạt ít nhất 60 điểm để nộp bài!');
    }
  };

  return (
    <div className="space-y-4">
      {/* Code Editor */}
      <div className="bg-gray-900 rounded-2xl overflow-hidden">
        <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
          <span className="text-gray-300 text-sm font-mono">main.cpp</span>
          <div className="flex gap-2">
            <button
              onClick={runCode}
              disabled={running}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded-lg text-sm font-medium disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              {running ? 'Đang chạy...' : 'Chạy code'}
            </button>
            <button
              onClick={submitCode}
              disabled={score < 60}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded-lg text-sm font-medium disabled:opacity-50"
            >
              <Award className="w-4 h-4" />
              Nộp bài
            </button>
          </div>
        </div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full h-96 bg-gray-900 text-gray-100 p-4 font-mono text-sm resize-none focus:outline-none"
          spellCheck={false}
        />
      </div>

      {/* Output */}
      {output && (
        <div className="bg-gray-100 rounded-2xl p-4">
          <h4 className="font-bold text-white mb-2 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Kết quả
          </h4>
          <pre className="text-sm text-white whitespace-pre-wrap font-mono">{output}</pre>
        </div>
      )}

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
          <h4 className="font-bold text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" />
            Chi tiết chấm điểm
          </h4>
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-xl ${
                  result.passed ? 'bg-green-50' : 'bg-red-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  {result.passed ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className={result.passed ? 'text-green-900' : 'text-red-900'}>
                    {result.criteria}
                  </span>
                </div>
                <span className="font-bold">{result.points} điểm</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t-2 border-gray-200 flex justify-between items-center">
            <span className="text-lg font-bold text-white">Tổng điểm:</span>
            <span className={`text-3xl font-black ${
              score >= 80 ? 'text-green-600' : score >= 60 ? 'text-emerald-600' : 'text-red-600'
            }`}>
              {score}/100
            </span>
          </div>
        </div>
      )}

      {/* Solution */}
      <details className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6">
        <summary className="font-bold text-emerald-900 cursor-pointer hover:text-emerald-700">
          🔒 Xem lời giải mẫu (Click để mở)
        </summary>
        <pre className="mt-4 bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto text-sm font-mono">
          <code>{solution}</code>
        </pre>
      </details>
    </div>
  );
};

