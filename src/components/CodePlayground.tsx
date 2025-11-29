import { useState } from 'react';
import { Play, Copy, RotateCcw, Download, Check, Code2, Terminal } from 'lucide-react';

type Language = 'python' | 'javascript' | 'html';

const TEMPLATES: Record<Language, string> = {
  python: `# Python Code Playground
# Viết code Python của bạn ở đây

def hello(name):
    return f"Xin chào, {name}!"

# Test
print(hello("CodeMind"))

# Vòng lặp
for i in range(5):
    print(f"Số: {i}")
`,
  javascript: `// JavaScript Code Playground
// Viết code JavaScript của bạn ở đây

function hello(name) {
    return \`Xin chào, \${name}!\`;
}

// Test
console.log(hello("CodeMind"));

// Array methods
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log("Doubled:", doubled);
`,
  html: `<!-- HTML Code Playground -->
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial; padding: 20px; background: #1a1a2e; color: white; }
        .card { background: #16213e; padding: 20px; border-radius: 10px; }
        button { background: #e94560; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
    </style>
</head>
<body>
    <div class="card">
        <h1>🚀 CodeMind AI</h1>
        <p>Học lập trình thật vui!</p>
        <button onclick="alert('Hello!')">Click me</button>
    </div>
</body>
</html>
`,
};

export const CodePlayground = () => {
  const [language, setLanguage] = useState<Language>('python');
  const [code, setCode] = useState(TEMPLATES.python);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  const runCode = async () => {
    setIsRunning(true);
    setOutput('');

    try {
      if (language === 'javascript') {
        // Run JavaScript safely using Function constructor
        const logs: string[] = [];
        const customConsole = {
          log: (...args: any[]) => logs.push(args.map(a => 
            typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)
          ).join(' ')),
          error: (...args: any[]) => logs.push('❌ ' + args.join(' ')),
          warn: (...args: any[]) => logs.push('⚠️ ' + args.join(' ')),
        };
        
        try {
          const wrappedCode = `
            const console = arguments[0];
            ${code}
          `;
          const fn = new Function(wrappedCode);
          fn(customConsole);
          setOutput(logs.join('\n') || '✅ Code chạy thành công! (không có output)');
        } catch (e: any) {
          setOutput(`❌ Lỗi: ${e.message}`);
        }
      } else if (language === 'python') {
        // Run Python using Pyodide (loaded from CDN)
        setOutput('⏳ Đang tải Python runtime...');
        
        try {
          // @ts-ignore
          if (!window.pyodide) {
            // @ts-ignore
            window.pyodide = await loadPyodide({
              indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/'
            });
          }
          
          // @ts-ignore
          const pyodide = window.pyodide;
          
          // Capture stdout
          pyodide.runPython(`
            import sys
            from io import StringIO
            sys.stdout = StringIO()
          `);
          
          // Run user code
          pyodide.runPython(code);
          
          // Get output
          const stdout = pyodide.runPython('sys.stdout.getvalue()');
          setOutput(stdout || '✅ Code chạy thành công! (không có output)');
        } catch (e: any) {
          setOutput(`❌ Lỗi Python: ${e.message}`);
        }
      } else if (language === 'html') {
        // Preview HTML
        setOutput('HTML_PREVIEW');
      }
    } catch (e: any) {
      setOutput(`❌ Lỗi: ${e.message}`);
    }

    setIsRunning(false);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetCode = () => {
    setCode(TEMPLATES[language]);
    setOutput('');
  };

  const downloadCode = () => {
    const ext = language === 'python' ? 'py' : language === 'javascript' ? 'js' : 'html';
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${ext}`;
    a.click();
  };

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    setCode(TEMPLATES[lang]);
    setOutput('');
  };

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border-b border-gray-700 bg-gray-800/50 gap-3 sm:gap-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <Code2 className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
          <h3 className="font-bold text-white text-sm sm:text-base">Code Playground</h3>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          {(['python', 'javascript', 'html'] as Language[]).map(lang => (
            <button
              key={lang}
              onClick={() => changeLanguage(lang)}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                language === lang
                  ? 'bg-cyan-500 text-white'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 lg:divide-x divide-gray-700">
        {/* Editor */}
        <div className="relative border-b lg:border-b-0 border-gray-700">
          <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-gray-800/30 border-b border-gray-700">
            <span className="text-xs sm:text-sm text-gray-400">Editor</span>
            <div className="flex items-center gap-1 sm:gap-2">
              <button onClick={copyCode} className="p-1 sm:p-1.5 hover:bg-gray-700 rounded" title="Copy">
                {copied ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400" /> : <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />}
              </button>
              <button onClick={resetCode} className="p-1 sm:p-1.5 hover:bg-gray-700 rounded" title="Reset">
                <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
              </button>
              <button onClick={downloadCode} className="p-1 sm:p-1.5 hover:bg-gray-700 rounded" title="Download">
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
              </button>
            </div>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-48 sm:h-64 lg:h-80 p-3 sm:p-4 bg-gray-900 text-green-400 font-mono text-xs sm:text-sm resize-none focus:outline-none"
            spellCheck={false}
          />
        </div>

        {/* Output */}
        <div>
          <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-gray-800/30 border-b border-gray-700">
            <span className="text-xs sm:text-sm text-gray-400 flex items-center gap-1 sm:gap-2">
              <Terminal className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Output
            </span>
            <button
              onClick={runCode}
              disabled={isRunning}
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs sm:text-sm font-bold rounded-lg transition-colors disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {isRunning ? 'Đang chạy...' : 'Chạy'}
            </button>
          </div>
          <div className="h-48 sm:h-64 lg:h-80 p-3 sm:p-4 bg-gray-950 overflow-auto">
            {output === 'HTML_PREVIEW' ? (
              <iframe
                srcDoc={code}
                className="w-full h-full bg-white rounded"
                sandbox="allow-scripts"
              />
            ) : output ? (
              <pre className="text-gray-300 font-mono text-xs sm:text-sm whitespace-pre-wrap">{output}</pre>
            ) : (
              <p className="text-gray-500 text-xs sm:text-sm">Nhấn "Chạy" để xem kết quả...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
