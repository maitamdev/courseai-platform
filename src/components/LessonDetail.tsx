import { X, Play, CheckCircle, BookOpen, Code } from 'lucide-react';
import { CodeEditor } from './CodeEditor';

type LessonContent = {
  theory?: string[];
  examples?: string[];
  keyPoints?: string[];
  description?: string;
  requirements?: string[];
  hints?: string[];
  solution?: string;
  testCases?: any[];
  buggyCode?: string;
  starterCode?: string;
  rubric?: Array<{ criteria: string; points: number }>;
};

type Lesson = {
  id: string;
  title: string;
  description: string;
  lesson_type: string;
  video_url: string | null;
  content: LessonContent;
};

type LessonDetailProps = {
  lesson: Lesson;
  onClose: () => void;
};

export const LessonDetail = ({ lesson, onClose }: LessonDetailProps) => {
  const isVideo = lesson.lesson_type === 'video';
  const isExercise = lesson.lesson_type === 'exercise';

  // Parse content từ database
  let content: LessonContent = {};
  
  console.log('Raw lesson data:', lesson);
  console.log('Raw content:', lesson.content);
  console.log('Content type:', typeof lesson.content);
  
  try {
    // Nếu content là string JSON, parse nó
    if (typeof lesson.content === 'string') {
      console.log('Parsing string content...');
      content = JSON.parse(lesson.content);
    } else if (lesson.content && typeof lesson.content === 'object') {
      console.log('Using object content directly...');
      content = lesson.content;
    }
  } catch (e) {
    console.error('Error parsing content:', e);
    content = {};
  }
  
  console.log('Parsed content:', content);

  // Mock data nếu content trống
  if (isExercise && !content.starterCode) {
    content.starterCode = '// Viết code của bạn ở đây\n\nint main() {\n  // TODO: Implement\n  return 0;\n}';
    content.requirements = content.requirements || ['Hoàn thành bài tập theo mô tả'];
    content.hints = content.hints || ['Đọc kỹ yêu cầu', 'Test code trước khi nộp'];
    content.testCases = content.testCases || [];
    content.rubric = content.rubric || [
      { criteria: 'Code chạy được', points: 50 },
      { criteria: 'Đúng yêu cầu', points: 50 }
    ];
    content.solution = content.solution || '// Solution sẽ được cập nhật sau';
  }

  console.log('Lesson content:', content); // Debug

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            {isVideo && <Play className="w-6 h-6 text-blue-600" />}
            {isExercise && <Code className="w-6 h-6 text-green-600" />}
            <h2 className="text-2xl font-bold text-white">{lesson.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8">
          {/* Video Lesson */}
          {isVideo && (
            <>
              {lesson.video_url && (
                <div className="mb-8 rounded-2xl overflow-hidden">
                  <iframe
                    width="100%"
                    height="480"
                    src={lesson.video_url.replace('watch?v=', 'embed/')}
                    title={lesson.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full"
                  ></iframe>
                </div>
              )}

              {/* Theory */}
              {lesson.content?.theory && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    Kiến thức lý thuyết
                  </h3>
                  <div className="bg-blue-50 rounded-2xl p-6 space-y-3">
                    {lesson.content.theory.map((item, index) => (
                      <div key={index} className="flex gap-3">
                        <span className="text-blue-600 font-bold">{index + 1}.</span>
                        <p className="text-white">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Examples */}
              {lesson.content?.examples && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Code className="w-5 h-5 text-green-600" />
                    Ví dụ code
                  </h3>
                  <div className="space-y-3">
                    {lesson.content.examples.map((example, index) => (
                      <pre key={index} className="bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto">
                        <code>{example}</code>
                      </pre>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Points */}
              {lesson.content?.keyPoints && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Điểm quan trọng
                  </h3>
                  <div className="bg-green-50 rounded-2xl p-6 space-y-2">
                    {lesson.content.keyPoints.map((point, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <p className="text-white">{point}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Exercise Lesson */}
          {isExercise && (
            <>
              {/* Description */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-4">Mô tả bài tập</h3>
                <p className="text-gray-300 bg-gray-50 p-6 rounded-2xl">
                  {lesson.content?.description || lesson.description || 'Hoàn thành bài tập theo yêu cầu'}
                </p>
              </div>

              {/* Requirements */}
              {content.requirements && content.requirements.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-white mb-4">Yêu cầu</h3>
                  <div className="bg-blue-50 rounded-2xl p-6 space-y-2">
                    {content.requirements.map((req: string, index: number) => (
                      <div key={index} className="flex gap-3">
                        <span className="text-blue-600 font-bold">{index + 1}.</span>
                        <p className="text-white">{req}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Buggy Code (if exists) */}
              {lesson.content?.buggyCode && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-white mb-4 text-red-600">Code có lỗi</h3>
                  <pre className="bg-red-50 border-2 border-red-200 text-white p-4 rounded-xl overflow-x-auto">
                    <code>{lesson.content.buggyCode}</code>
                  </pre>
                </div>
              )}

              {/* Hints */}
              {lesson.content?.hints && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-white mb-4">Gợi ý</h3>
                  <div className="bg-yellow-50 rounded-2xl p-6 space-y-2">
                    {lesson.content.hints.map((hint, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="text-yellow-600">💡</span>
                        <p className="text-white">{hint}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Test Cases */}
              {lesson.content?.testCases && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-white mb-4">Test Cases</h3>
                  <div className="space-y-2">
                    {lesson.content.testCases.map((testCase, index) => (
                      <pre key={index} className="bg-gray-100 p-4 rounded-xl">
                        <code>{testCase}</code>
                      </pre>
                    ))}
                  </div>
                </div>
              )}

              {/* Code Editor */}
              {content.starterCode && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-white mb-4">💻 Code Editor</h3>
                  <CodeEditor
                    starterCode={content.starterCode}
                    testCases={content.testCases || []}
                    rubric={content.rubric || []}
                    solution={content.solution || ''}
                    onSubmit={(code, score) => {
                      console.log('Submitted:', { code, score });
                      alert(`Đã nộp bài! Điểm: ${score}/100`);
                    }}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

