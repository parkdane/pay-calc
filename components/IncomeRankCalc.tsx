"use client";

import { useMemo, useState } from "react";
import data from "@/data/income-percentile-2024.json";

const won = (n: number) => Math.round(n).toLocaleString("ko-KR") + "원";

// 연봉 → 상위 % (앵커 사이 선형 보간)
function topPercentOf(income: number): number {
  const a = data.anchors; // topPercent 내림차순 아님 - income 오름차순 정렬돼 있음
  if (income <= 0) return 100;
  const top = a[a.length - 1];
  if (income >= top.income) return top.topPercent; // 상위 1% 이내
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

export default function IncomeRankCalc() {
  const [manwon, setManwon] = useState(4000); // 만원 단위 입력
  const [submitted, setSubmitted] = useState(false);

  const result = useMemo(() => {
    const income = manwon * 10000;
    const top = topPercentOf(income);
    const isTop1 = top <= 1;
    const vsMedian = income / data.median;
    // 100명 중 등수
    const rankOf100 = Math.max(1, Math.round(top));
    return { income, top, isTop1, vsMedian, rankOf100 };
  }, [manwon]);

  return (
    <div className="space-y-6">
      {/* 입력 */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
        <label className="block text-sm font-medium text-slate-700">
          내 연봉 (세전 총급여, 만원)
          <div className="mt-1 flex gap-2">
            <input
              type="number"
              min={0}
              step={100}
              value={manwon === 0 ? "" : manwon}
              onChange={(e) => {
                setManwon(Number(e.target.value) || 0);
                setSubmitted(false);
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 tabular-nums"
              placeholder="예: 4000 (4천만 원)"
            />
            <button
              onClick={() => setSubmitted(true)}
              className="shrink-0 rounded-lg bg-blue-700 px-5 font-semibold text-white transition hover:bg-blue-800"
            >
              확인
            </button>
          </div>
          <span className="mt-1 block text-xs font-normal text-slate-400">
            연봉 4,000만 원이면 4000 입력. 세전 기준(비과세 제외)
          </span>
        </label>
      </div>

      {/* 결과 */}
      {submitted && manwon > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <div className="bg-blue-700 px-5 py-6 text-center text-white">
            <p className="text-sm opacity-80">연봉 {won(result.income)}은</p>
            <p className="mt-1 text-4xl font-bold tabular-nums">
              {result.isTop1 ? "상위 1% 이내" : `상위 ${result.top.toFixed(1)}%`}
            </p>
            <p className="mt-2 text-sm opacity-90">
              근로소득자 100명 중 약 {result.rankOf100}등
            </p>
          </div>
          <div className="space-y-2 bg-white p-5 text-sm text-slate-700">
            <p>
              · 대한민국 근로소득자 중위 연봉은{" "}
              <strong className="tabular-nums">{won(data.median)}</strong>
              입니다. 내 연봉은 중위의{" "}
              <strong className="tabular-nums">
                {result.vsMedian.toFixed(1)}배
              </strong>
              입니다.
            </p>
            <p className="text-xs text-slate-400">
              국세청 {data.year}년 귀속 근로소득 백분위(천분위) 자료 기준.
              근로소득자만 포함되며 사업·기타소득은 제외됩니다.
            </p>
          </div>
        </div>
      )}

      {/* 참고 구간표 */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm">
        <p className="mb-3 font-semibold text-slate-800">주요 구간 커트라인</p>
        <dl className="space-y-2 text-slate-600">
          {[...data.anchors]
            .filter((a) => a.topPercent < 100)
            .reverse()
            .map((a) => (
              <div key={a.topPercent} className="flex justify-between">
                <dt>상위 {a.topPercent}%</dt>
                <dd className="tabular-nums font-medium text-slate-900">
                  {won(a.income)}
                </dd>
              </div>
            ))}
        </dl>
      </div>
    </div>
  );
}
