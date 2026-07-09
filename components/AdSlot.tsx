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

    // 💡 두 개의 ID가 모두 완벽하게 입력되었습니다.
    const PC_ID = 'DAN-KWXtT6PXMVtf1ygq'; // 728x90 PC ID
    const MOBILE_ID = 'DAN-yzPJgMAQOUioIWCh'; // 320x50 모바일 ID

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

  return (
    <div 
      ref={containerRef} 
      className="my-6 flex justify-center items-center w-full bg-white" 
      style={{ minHeight: isMobile ? '50px' : '90px' }} 
    />
  );
}