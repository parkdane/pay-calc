'use client';

import { useEffect, useRef, useState } from 'react';

export default function AdSlot({ id }: { id?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';

    const PC_ID = 'DAN-KWXtT6PXMVtf1ygq'; 
    const MOBILE_ID = 'DAN-yzPJgMAQOUioIWCh'; 

    const adId = isMobile ? MOBILE_ID : PC_ID; 
    const width = isMobile ? '320' : '728';
    const height = isMobile ? '50' : '90';

    const ins = document.createElement('ins');
    ins.className = 'kakao_ad_area';
    ins.style.display = 'none';
    ins.setAttribute('data-ad-unit', adId);
    ins.setAttribute('data-ad-width', width);
    ins.setAttribute('data-ad-height', height);

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = '//t1.daumcdn.net/kas/static/ba.min.js';
    script.async = true;

    containerRef.current.appendChild(ins);
    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, [isMobile]);

  // 💡 주문하신대로 상세페이지 안에서 표와 계산기 사이에 자연스럽게 들어가도록 정돈하는 스타일입니다.
  return (
    <div className="w-full flex flex-col items-center justify-center my-8 clear-both">
      <div 
        ref={containerRef} 
        className="flex justify-center items-center w-full bg-white" 
        style={{ minHeight: isMobile ? '50px' : '90px' }} 
      />
    </div>
  );
}