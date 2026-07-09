'use client';

import { useEffect, useRef } from 'react';

interface AdSlotProps {
  id: string;
  width?: string;
  height?: string;
}

export default function AdSlot({ id, width = '728', height = '90' }: AdSlotProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 기존 광고 주입 초기화 (중복 방지)
    containerRef.current.innerHTML = '';

    // 1. 카카오 애드핏 <ins> 태그 생성
    const ins = document.createElement('ins');
    ins.className = 'kakao_ad_area';
    ins.style.display = 'none';
    ins.setAttribute('data-ad-unit', id);
    ins.setAttribute('data-ad-width', width);
    ins.setAttribute('data-ad-height', height);

    // 2. 카카오 애드핏 <script> 태그 생성
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = '//t1.daumcdn.net/kas/static/ba.min.js';
    script.async = true;

    // 3. 컨테이너에 주입
    containerRef.current.appendChild(ins);
    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [id, width, height]);

  return (
    <div 
      ref={containerRef} 
      className="my-6 flex justify-center items-center w-full" 
      style={{ minHeight: `${height}px` }} 
    />
  );
}