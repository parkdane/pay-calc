/**
 * 광고 슬롯.
 * - 지금: 자리만 잡아두는 placeholder (레이아웃 흔들림 방지용 고정 높이)
 * - 애드핏/애드센스 승인 후: 이 컴포넌트 안에 발급받은 광고 스크립트를 넣으면
 *   사이트 전체에 일괄 적용된다.
 */
export default function AdSlot({ id }: { id: string }) {
  const enabled = false; // 광고 승인 후 true로 변경

  if (!enabled) {
    // 개발 중에는 자리만 확인. 배포 시 아무것도 렌더링하지 않으려면 return null.
    return (
      <div
        data-ad-slot={id}
        className="my-6 flex h-24 items-center justify-center rounded-lg border border-dashed border-slate-200 text-xs text-slate-300"
      >
        AD ({id})
      </div>
    );
  }

  return <div data-ad-slot={id} className="my-6" />;
}
