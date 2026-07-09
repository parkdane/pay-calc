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

  // 광고 컨테이너. id는 노출 위치 구분용으로 받되 애드핏 단위는 PC/모바일로 자동 전환된다.
  void id;
  return (
    <div className="my-8 flex w-full flex-col items-center justify-center clear-both">
      <div
        ref={containerRef}
        className="flex w-full items-center justify-center bg-white"
        style={{ minHeight: isMobile ? '50px' : '90px' }}
      />
    </div>
  );
}
