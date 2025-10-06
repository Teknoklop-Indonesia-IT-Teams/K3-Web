import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Upload, Pen, Trash2 } from 'lucide-react';

interface SignatureCaptureProps {
  onSignatureChange: (signature: string) => void;
  label?: string;
  clearTrigger?: number; // 🔥 trigger dari parent untuk auto-clear
}

export const SignatureCapture: React.FC<SignatureCaptureProps> = ({
  onSignatureChange,
  label = 'Tanda Tangan',
  clearTrigger = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [preview, setPreview] = useState<string>('');

  // Setup canvas scale untuk presisi
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const ratio = window.devicePixelRatio || 1;
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;

    canvas.width = width * ratio;
    canvas.height = height * ratio;
    ctx.scale(ratio, ratio);

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1f2937';

    // 🔥 clear setiap resize supaya gambar lama nggak nyangkut
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    let x = 0;
    let y = 0;

    if ('touches' in e && e.touches.length > 0) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else if ('clientX' in e) {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    return { x, y };
  };

  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const { x, y } = getPos(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  }, []);

  const draw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing) return;
      e.preventDefault();
      const { x, y } = getPos(e);
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;

      ctx.lineTo(x, y);
      ctx.stroke();
    },
    [isDrawing]
  );

  const stopDrawing = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataURL = canvas.toDataURL();
    setPreview(dataURL);
    onSignatureChange(dataURL);
  }, [isDrawing, onSignatureChange]);

  const clearSignature = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setPreview('');
    onSignatureChange('');
  }, [onSignatureChange]);

  // 🔥 auto clear jika parent trigger berubah
  useEffect(() => {
    if (clearTrigger > 0) {
      clearSignature();
    }
  }, [clearTrigger, clearSignature]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const dataURL = canvas.toDataURL();
        setPreview(dataURL);
        onSignatureChange(dataURL);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
        <canvas
          ref={canvasRef}
          className="w-full h-48 bg-white border border-gray-200 rounded-lg cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        <p className="text-sm text-gray-500 text-center mt-2">
          Tanda tangan di area di atas atau upload gambar
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Upload className="h-4 w-4" />
          <span>Upload</span>
        </button>

        <button
          type="button"
          onClick={clearSignature}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
        >
          <Trash2 className="h-4 w-4" />
          <span>Hapus</span>
        </button>

        {preview && (
          <span className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg">
            <Pen className="h-4 w-4" />
            <span>Tanda tangan tersimpan</span>
          </span>
        )}
      </div>

      {preview && (
        <div className="mt-2">
          <p className="text-xs text-gray-500 mb-1">Preview:</p>
          <img src={preview} alt="Signature Preview" className="border rounded-lg max-h-24" />
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.heic"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
};
