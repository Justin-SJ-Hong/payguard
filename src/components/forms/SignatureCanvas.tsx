import React, { useRef, useEffect, useState } from 'react';
import { Box, Button, Paper } from '@mui/material';

interface SignatureCanvasProps {
  onSave: (signatureDataUrl: string) => void;
  placeholder?: string;
}

export default function SignatureCanvas({ onSave, placeholder }: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas 설정
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSignature) return;

    const signatureDataUrl = canvas.toDataURL('image/png');
    onSave(signatureDataUrl);
  };

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <canvas
          ref={canvasRef}
          width={400}
          height={200}
          style={{
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'crosshair',
            backgroundColor: '#fff'
          }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </Box>

      {placeholder && (
        <Box sx={{ textAlign: 'center', mb: 2, color: '#666' }}>
          {placeholder}
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
        <Button
          variant="outlined"
          onClick={clearCanvas}
          disabled={!hasSignature}
        >
          🗑️ 지우기
        </Button>
        <Button
          variant="contained"
          onClick={saveSignature}
          disabled={!hasSignature}
        >
          💾 서명 저장
        </Button>
      </Box>
    </Paper>
  );
}