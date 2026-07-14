"use client";

import { useMemo, useRef, useState } from "react";
import data from "@/data/income-percentile-2024.json";
import AdSlot from "@/components/AdSlot";

const won = (n: number) => Math.round(n).toLocaleString("ko-KR") + "원";

// 연봉 → 상위 % (앵커 사이 선형 보간)
function topPercentOf(income: number): number {
  const a = data.anchors;
  if (income <= 0) return 100;
  const top = a[a.length - 1];
  if (income >= top.income) return top.topPercent;
  for (let i = 0; i < a.length - 1; i++) {
    const lo = a[i];
    const hi = a[i + 1];
    if (income >= lo.income && income < hi.income) {
      const t = (income - lo.income) / (hi.income - lo.income);
      return lo.topPercent + (hi.topPercent - lo.topPercent) * t;
    }
  }
  return 100;
}

const INCOME_RANK_DECISION_CARDS = [
  {
    tag: "이직 협상용",
    title: "이직·연봉 협상 자료로 쓰고 싶다",
    bullets: [
      "이 데이터는 전체 근로소득자 대비 순위로, 협상 근거로는 참고용입니다",
      "특정 기업과 비교하고 싶다면 대기업 평균연봉 비교 계산기가 더 정확합니다",
      "협상에는 시장 데이터보다 본인의 성과·기여도를 함께 제시하는 것이 효과적입니다",
    ],
  },
  {
    tag: "상위권인데 체감 안 됨",
    title: "상위권으로 나오는데 체감이 안 된다",
    bullets: [
      "연봉이 높을수록 세금·건강보험료 부담도 커져 실수령액 증가폭은 작아집니다",
      "실수령액 계산기에서 세후 금액을 확인하면 체감과의 차이를 알 수 있습니다",
      "고연봉 구간은 표준편차가 커서 같은 상위 %라도 실제 격차가 클 수 있습니다",
    ],
  },
  {
    tag: "중위보다 낮음",
    title: "중위 연봉보다 낮게 나온다",
    bullets: [
      "연차·경력이 짧다면 자연스러운 결과일 수 있습니다",
      "이 통계는 근로소득만 포함해 사업소득·자산소득은 반영되지 않습니다",
      "한 시점의 순위보다 몇 년 뒤 연봉 상승 추이를 함께 보는 것이 더 의미 있습니다",
    ],
  },
];

export default function IncomeRankCalc() {
  const [manwon, setManwon] = useState(4000);
  const [submitted, setSubmitted] = useState(false);
  const [exporting, setExporting] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);

  const result = useMemo(() => {
    const income = manwon * 10000;
    const top = topPercentOf(income);
    const isTop1 = top <= 1;
    const vsMedian = income / data.median;
    const rankOf100 = Math.max(1, Math.round(top));
    return { income, top, isTop1, vsMedian, rankOf100 };
  }, [manwon]);

  const shareImage = async () => {
    if (!shareCardRef.current) return;
    setExporting(true);
    try {
      const { default: html2canvas } = await import("html2canvas-pro");
      if (document.fonts?.ready) await document.fonts.ready;
      const canvas = await html2canvas(shareCardRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
      });
      const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("이미지 생성 실패");
      const file = new File([blob], "연봉순위.png", { type: "image/png" });

      // 모바일에서 공유 시트 지원하면 바로 공유, 아니면 다운로드
      const downloadFile = () => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "연봉순위.png";
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      };

      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

      if (isMobile && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: "내 연봉 순위",
            text: "봉급계산소에서 내 연봉 상위 몇 %인지 확인해보세요",
          });
        } catch (shareErr) {
          // 사용자가 공유창을 취소한 경우는 정상 동작이라 무시, 그 외 실패만 다운로드로 대체
          if ((shareErr as Error)?.name !== "AbortError") downloadFile();
        }
      } else {
        downloadFile();
      }
    } catch (err) {
      console.error("이미지 공유 실패:", err);
      window.alert("이미지 생성에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4">
      <AdSlot id="calc-income-rank-mid" />

      <div className="grid gap-6 lg:grid-cols-[380px_1fr] lg:items-start">
        {/* ═══ 왼쪽: 입력 ═══ */}
        <div className="space-y-4">
          <div className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-5">
            <label className="block text-sm font-medium text-[#5B6478]">
              내 연봉 (세전 총급여, 만원)
              <div className="mt-1.5 flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  value={manwon === 0 ? "" : manwon.toLocaleString("ko-KR")}
                  onChange={(e) => {
                    setManwon(Number(e.target.value.replace(/[^0-9]/g, "")) || 0);
                    setSubmitted(false);
                  }}
                  className="w-full rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-3 py-3 tabular-nums"
                  placeholder="예: 4000 (4천만 원)"
                />
                <button
                  onClick={() => setSubmitted(true)}
                  className="shrink-0 rounded-lg bg-[#2E4494] px-5 font-semibold text-white transition hover:bg-[#1E3068]"
                >
                  확인
                </button>
              </div>
              <span className="mt-1 block text-xs font-normal text-[#8B93A6]">
                연봉 4,000만 원이면 4000 입력. 세전 기준(비과세 제외)
              </span>
            </label>
          </div>
        </div>

        {/* ═══ 오른쪽: 결과 (sticky) ═══ */}
        <div className="space-y-5 lg:sticky lg:top-20">
          {submitted && manwon > 0 && (
            <div className="overflow-hidden rounded-xl border border-[rgba(46,68,148,0.14)]">
              <div className="bg-[#2E4494] px-5 py-6 text-center text-white">
                <p className="text-sm opacity-80">연봉 {won(result.income)}은</p>
                <p className="mt-1 text-4xl font-bold tabular-nums">
                  {result.isTop1 ? "상위 1% 이내" : `상위 ${result.top.toFixed(1)}%`}
                </p>
                <p className="mt-2 text-sm opacity-90">근로소득자 100명 중 약 {result.rankOf100}등</p>
              </div>
              <div className="space-y-2 bg-white p-5 text-sm text-[#5B6478]">
                <p>
                  · 대한민국 근로소득자 중위 연봉은{" "}
                  <strong className="tabular-nums">{won(data.median)}</strong>
                  입니다. 내 연봉은 중위의{" "}
                  <strong className="tabular-nums">{result.vsMedian.toFixed(1)}배</strong>
                  입니다.
                </p>
                <p className="text-xs text-[#8B93A6]">
                  국세청 {data.year}년 귀속 근로소득 백분위(천분위) 자료 기준. 근로소득자만 포함되며
                  사업·기타소득은 제외됩니다.
                </p>
                <button
                  onClick={shareImage}
                  disabled={exporting}
                  className="mt-2 w-full rounded-lg border border-[rgba(46,68,148,0.22)] bg-white py-2.5 text-sm font-semibold text-[#2E4494] transition hover:border-[#2E4494] disabled:opacity-50"
                >
                  {exporting ? "이미지 생성 중..." : "📤 결과 이미지로 공유하기"}
                </button>
              </div>
            </div>
          )}

          {/* 참고 구간표 */}
          <div className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-white p-5 text-sm">
            <p className="mb-3 font-semibold text-[#1B2A4A]">주요 구간 커트라인</p>
            <dl className="space-y-2 text-[#5B6478]">
              {[...data.anchors]
                .filter((a) => a.topPercent < 100)
                .reverse()
                .map((a) => (
                  <div key={a.topPercent} className="flex justify-between">
                    <dt>상위 {a.topPercent}%</dt>
                    <dd className="tabular-nums font-medium text-[#1B2A4A]">{won(a.income)}</dd>
                  </div>
                ))}
            </dl>
          </div>
        </div>
      </div>

      {/* 판단 보조 */}
      <div className="mt-6 space-y-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#2E4494]">판단 보조</p>
          <p className="mt-0.5 text-base font-bold text-[#1B2A4A]">이런 상황이면 이렇게 보세요</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {INCOME_RANK_DECISION_CARDS.map((card) => (
            <div key={card.tag} className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-white p-4">
              <span className="inline-block rounded-full bg-[rgba(46,68,148,0.08)] px-2 py-0.5 text-[10px] font-semibold text-[#2E4494]">
                {card.tag}
              </span>
              <p className="mt-2 text-sm font-bold text-[#1B2A4A]">{card.title}</p>
              <ul className="mt-2 space-y-1 text-xs leading-relaxed text-[#5B6478]">
                {card.bullets.map((b) => (
                  <li key={b}>· {b}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* 공유용 카드 (화면에는 안 보이고 캡처용으로만 존재) */}
      <div style={{ position: "fixed", top: 0, left: 0, zIndex: -1, pointerEvents: "none" }}>
        <div
          ref={shareCardRef}
          style={{
            width: 1080,
            height: 1080,
            background: "linear-gradient(160deg, #2E4494 0%, #1E3068 100%)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: 80,
            fontFamily: "Pretendard, sans-serif",
            color: "#ffffff",
          }}
        >
          <div style={{ fontSize: 36, fontWeight: 700, opacity: 0.85 }}>봉급계산소</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ fontSize: 32, opacity: 0.8 }}>
              연봉 {manwon.toLocaleString("ko-KR")}만 원은
            </div>
            <div style={{ fontSize: 96, fontWeight: 800, lineHeight: 1.15 }}>
              {result.isTop1 ? "상위 1%" : `상위 ${result.top.toFixed(1)}%`}
            </div>
            <div style={{ fontSize: 34, opacity: 0.9 }}>
              근로소득자 100명 중 약 {result.rankOf100}등
            </div>
            <div style={{ fontSize: 26, opacity: 0.7, marginTop: 8 }}>
              중위 연봉({won(data.median)}) 대비 {result.vsMedian.toFixed(1)}배
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div style={{ fontSize: 24, opacity: 0.65 }}>
              국세청 {data.year}년 귀속 근로소득 백분위 기준
            </div>
            <div style={{ fontSize: 30, fontWeight: 700, opacity: 0.9 }}>moneywatch.kr</div>
          </div>
        </div>
      </div>
    </div>
  );
}
