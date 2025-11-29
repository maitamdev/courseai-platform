import { useRef, useState, useEffect } from 'react';
import { X, Download, Share2, Award, CheckCircle } from 'lucide-react';

type CertificateProps = {
  studentName: string;
  courseName: string;
  completionDate: string;
  instructorName: string;
  courseId: string;
  onClose: () => void;
};

export const Certificate = ({
  studentName,
  courseName,
  completionDate,
  instructorName,
  courseId,
  onClose,
}: CertificateProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Draw preview on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1200;
    canvas.height = 850;
    drawCertificate(ctx, canvas.width, canvas.height);
  }, [studentName, courseName, completionDate, instructorName]);

  const generateCertificateId = () => {
    const hash = courseId.slice(0, 8).toUpperCase();
    const date = new Date().getTime().toString(36).toUpperCase();
    return `CM-${hash}-${date}`;
  };

  const drawCertificate = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(0.5, '#1e293b');
    gradient.addColorStop(1, '#0f172a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Decorative border
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 8;
    ctx.strokeRect(30, 30, width - 60, height - 60);

    // Inner border
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 2;
    ctx.strokeRect(45, 45, width - 90, height - 90);

    // Corner decorations
    const cornerSize = 60;
    ctx.fillStyle = '#10b981';
    
    // Top-left corner
    ctx.beginPath();
    ctx.moveTo(30, 30);
    ctx.lineTo(30 + cornerSize, 30);
    ctx.lineTo(30, 30 + cornerSize);
    ctx.closePath();
    ctx.fill();

    // Top-right corner
    ctx.beginPath();
    ctx.moveTo(width - 30, 30);
    ctx.lineTo(width - 30 - cornerSize, 30);
    ctx.lineTo(width - 30, 30 + cornerSize);
    ctx.closePath();
    ctx.fill();

    // Bottom-left corner
    ctx.beginPath();
    ctx.moveTo(30, height - 30);
    ctx.lineTo(30 + cornerSize, height - 30);
    ctx.lineTo(30, height - 30 - cornerSize);
    ctx.closePath();
    ctx.fill();

    // Bottom-right corner
    ctx.beginPath();
    ctx.moveTo(width - 30, height - 30);
    ctx.lineTo(width - 30 - cornerSize, height - 30);
    ctx.lineTo(width - 30, height - 30 - cornerSize);
    ctx.closePath();
    ctx.fill();

    // Logo area - Circle with gradient
    const logoX = width / 2;
    const logoY = 120;
    const logoRadius = 50;
    
    const logoGradient = ctx.createRadialGradient(logoX, logoY, 0, logoX, logoY, logoRadius);
    logoGradient.addColorStop(0, '#10b981');
    logoGradient.addColorStop(1, '#059669');
    
    ctx.beginPath();
    ctx.arc(logoX, logoY, logoRadius, 0, Math.PI * 2);
    ctx.fillStyle = logoGradient;
    ctx.fill();

    // Logo text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('CM', logoX, logoY + 8);

    // "Certificate of Completion" text
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('CHỨNG NHẬN HOÀN THÀNH', width / 2, 200);

    // Decorative line
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 150, 220);
    ctx.lineTo(width / 2 + 150, 220);
    ctx.stroke();

    // "This is to certify that"
    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px Arial';
    ctx.fillText('Chứng nhận rằng', width / 2, 260);

    // Student name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 42px Georgia';
    ctx.fillText(studentName, width / 2, 320);

    // Underline for name
    const nameWidth = ctx.measureText(studentName).width;
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2 - nameWidth / 2 - 20, 335);
    ctx.lineTo(width / 2 + nameWidth / 2 + 20, 335);
    ctx.stroke();

    // "has successfully completed"
    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px Arial';
    ctx.fillText('đã hoàn thành xuất sắc khóa học', width / 2, 380);

    // Course name
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 32px Arial';
    
    // Word wrap for long course names
    const maxWidth = width - 200;
    const words = courseName.split(' ');
    let line = '';
    let y = 430;
    
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && i > 0) {
        ctx.fillText(line.trim(), width / 2, y);
        line = words[i] + ' ';
        y += 40;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), width / 2, y);

    // "on the CodeMind AI platform"
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px Arial';
    ctx.fillText('trên nền tảng CodeMind AI', width / 2, y + 50);

    // Date and Instructor section
    const bottomY = height - 150;

    // Date
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(completionDate, 120, bottomY);
    
    ctx.fillStyle = '#64748b';
    ctx.font = '12px Arial';
    ctx.fillText('Ngày hoàn thành', 120, bottomY + 20);

    // Signature line
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(100, bottomY - 10);
    ctx.lineTo(280, bottomY - 10);
    ctx.stroke();

    // Instructor
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(instructorName, width - 120, bottomY);
    
    ctx.fillStyle = '#64748b';
    ctx.font = '12px Arial';
    ctx.fillText('Giảng viên', width - 120, bottomY + 20);

    // Signature line for instructor
    ctx.beginPath();
    ctx.moveTo(width - 280, bottomY - 10);
    ctx.lineTo(width - 100, bottomY - 10);
    ctx.stroke();

    // Certificate ID
    ctx.fillStyle = '#475569';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`Certificate ID: ${generateCertificateId()}`, width / 2, height - 50);

    // CodeMind AI branding
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('CodeMind AI', width / 2, height - 70);

    // Decorative stars/sparkles
    ctx.fillStyle = '#fbbf24';
    const starPositions = [
      { x: 80, y: 100 },
      { x: width - 80, y: 100 },
      { x: 80, y: height - 100 },
      { x: width - 80, y: height - 100 },
    ];
    
    starPositions.forEach(pos => {
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('★', pos.x, pos.y);
    });
  };

  const handleDownload = async () => {
    setIsGenerating(true);
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size (A4 landscape ratio)
    canvas.width = 1200;
    canvas.height = 850;

    // Draw certificate
    drawCertificate(ctx, canvas.width, canvas.height);

    // Convert to image and download
    const link = document.createElement('a');
    link.download = `Certificate_${courseName.replace(/\s+/g, '_')}_${studentName.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();

    setIsGenerating(false);
  };

  const handleShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1200;
    canvas.height = 850;
    drawCertificate(ctx, canvas.width, canvas.height);

    try {
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png');
      });

      if (navigator.share) {
        await navigator.share({
          title: `Chứng chỉ hoàn thành ${courseName}`,
          text: `${studentName} đã hoàn thành khóa học ${courseName} trên CodeMind AI!`,
          files: [new File([blob], 'certificate.png', { type: 'image/png' })],
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        alert('Đã copy chứng chỉ vào clipboard!');
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gray-900 rounded-3xl max-w-4xl w-full border border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-green-600 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Award className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Chứng Chỉ Hoàn Thành</h2>
              <p className="text-emerald-100 text-sm">Chúc mừng bạn đã hoàn thành khóa học!</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Certificate Preview */}
        <div className="p-6">
          <div className="bg-gray-800 rounded-2xl p-4 mb-6">
            <canvas
              ref={canvasRef}
              className="w-full rounded-xl"
              style={{ aspectRatio: '1200/850' }}
            />
          </div>

          {/* Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-emerald-400 mb-2">
                <CheckCircle className="w-5 h-5" />
                <span className="font-bold">Thông tin</span>
              </div>
              <p className="text-white font-medium">{studentName}</p>
              <p className="text-gray-400 text-sm">{courseName}</p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-emerald-400 mb-2">
                <Award className="w-5 h-5" />
                <span className="font-bold">Ngày hoàn thành</span>
              </div>
              <p className="text-white font-medium">{completionDate}</p>
              <p className="text-gray-400 text-sm">Giảng viên: {instructorName}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-xl font-bold transition-all disabled:opacity-50"
            >
              <Download className="w-5 h-5" />
              {isGenerating ? 'Đang tạo...' : 'Tải Chứng Chỉ'}
            </button>
            <button
              onClick={handleShare}
              className="px-6 py-4 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold transition-all flex items-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              Chia sẻ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
