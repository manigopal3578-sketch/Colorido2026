'use client';

import React, { useEffect, useRef } from 'react';

interface ElectricBorderProps {
  children: React.ReactNode;
  color?: string;
  intensity?: 'subtle' | 'vibrant';
  className?: string;
}

export const ElectricBorder: React.FC<ElectricBorderProps> = ({
  children,
  color = '#5227FF',
  intensity = 'subtle',
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let offset = 0;

    const resize = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      }
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;
      const radius = 16;

      ctx.beginPath();
      ctx.roundRect(1, 1, w - 2, h - 2, radius);
      ctx.strokeStyle = color;
      ctx.lineWidth = intensity === 'vibrant' ? 2 : 1.5;
      ctx.setLineDash([12, 18]);
      ctx.lineDashOffset = -offset;
      ctx.shadowColor = color;
      ctx.shadowBlur = intensity === 'vibrant' ? 12 : 6;
      ctx.stroke();

      offset += 0.4;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [color, intensity]);

  return (
    <div className={`relative group ${className}`}>
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-10 w-full h-full rounded-2xl"
      />
      <div className="relative z-0 h-full">{children}</div>
    </div>
  );
};
