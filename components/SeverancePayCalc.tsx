"use client";

import { useMemo, useState } from "react";
import MoneyInput from "@/components/MoneyInput";
import AdSlot from "@/components/AdSlot";

const won = (n: number) => Math.round(n).toLocaleString("ko-KR") + "원";

// 공무원연금법 시행령 제58조 / 군인연금법 시행령(동일 비율) 기준 재직기간별 지급율
const BRACKETS = [
  { minYears: 20, rate: 0.39 },
  { minYears: 15, rate: 0.325 },
  { minYears: 10, rate: 0.2925 },
  { minYears: 5, rate: 0.2275 },
  { minYears: 1, rate: 0.065 },
];

function getRate(years: number) {
  for (const b of BRACKETS) {
    if (years >= b.minYears) return b.rate;
  }
  return 0;
}

export default function SeverancePayCalc() {
  const [baseIncomeManwon, setBaseIncomeManwon] = useState(400);
  const [years, setYears] = useState(20);

  const result = useMemo(() => {
    const baseIncome = baseIncomeManwon * 10000;
    const cappedYears = Math.min(years, 33);
    const rate = getRate(years);
    const total = baseIncome * cappedYears * rate;
    return { baseIncome, cappedYears, rate, total, eligible: years >= 1 };
  }, [baseIncomeManwon, years]);

  return (
    <div className="mx-auto max-w-[1280px] px-4">
      <div className="grid gap-6 lg:grid-cols-[380px_1fr] lg:items-start">
        {/* 왼쪽: 입력 */}
        <div className="space-y-4">
          <div className="space-y-4 rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#2E4494]">기본 입력</p>
              <p className="mt-0.5 text-base font-bold text-[#1B2A4A]">기준소득월액·재직연수</p>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-[#5B6478]">기준소득월액 (만 원)</span>
              <MoneyInput value={baseIncomeManwon} onChange={setBaseIncomeManwon} placeholder="예: 400" />
              <span className="mt-1 block text-xs font-normal text-[#8B93A6]">
                봉급뿐 아니라 각종 수당이 포함된 금액입니다. 급여명세서나 연말정산 자료에서 확인할
                수 있습니다.
              </span>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-[#5B6478]">재직(복무)연수</span>
              <input
                type="number"
                min={0}
                max={45}
                value={years}
                onChange={(e) => setYears(Number(e.target.value) || 0)}
                className="mt-1.5 w-full min-h-[44px] rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-3 py-2.5"
              />
              <span className="mt-1 block text-xs font-normal text-[#8B93A6]">
                33년을 초과하는 재직기간은 계산에 반영되지 않습니다.
              </span>
            </label>
          </div>
        </div>

        {/* 오른쪽: 결과 */}
        <div className="space-y-5 lg:sticky lg:top-20">
          <div className="overflow-hidden rounded-xl border border-[rgba(46,68,148,0.14)]">
            <div className="bg-[#2E4494] px-5 py-4 text-white">
              <p className="text-sm opacity-80">예상 퇴직수당</p>
              <p className="text-3xl font-bold tabular-nums">{won(result.total)}</p>
            </div>
            {!result.eligible && (
              <div className="border-t border-[rgba(46,68,148,0.10)] bg-[#FDF3F2] px-5 py-3 text-xs leading-relaxed text-[#B3372C]">
                재직기간이 1년 미만이면 퇴직수당 지급 대상이 아닙니다.
              </div>
            )}
            <dl className="divide-y divide-[rgba(46,68,148,0.10)] bg-white text-sm">
              <Row label="기준소득월액" value={won(result.baseIncome)} muted />
              <Row label="계산 반영 재직연수" value={`${result.cappedYears}년`} muted />
              <Row label="지급율" value={`${(result.rate * 100).toFixed(2)}%`} bold />
            </dl>
          </div>

          <div className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-5 text-xs leading-relaxed text-[#7A8296]">
            <p className="font-semibold text-[#5B6478] mb-2">재직기간별 지급율</p>
            <ul className="space-y-1">
              <li>· 1년 이상 5년 미만: 6.5%</li>
              <li>· 5년 이상 10년 미만: 22.75%</li>
              <li>· 10년 이상 15년 미만: 29.25%</li>
              <li>· 15년 이상 20년 미만: 32.5%</li>
              <li>· 20년 이상: 39%</li>
            </ul>
            <p className="mt-3">
              공무원연금법 시행령 제58조, 군인연금법 시행령 기준(동일 비율표)입니다. 재직수당와
              별도로 지급되는 퇴직급여(연금 또는 일시금)는 이 계산에 포함되지 않습니다.
            </p>
          </div>
        </div>
      </div>

      <p className="mt-6 text-xs leading-relaxed text-[#8B93A6]">
        ※ 참고용 추정치입니다. 휴직·직위해제·정직·강등 기간이 있으면 재직연수 산정에서 일부 감축될
        수 있습니다. 정확한 금액은 공무원연금공단·국군재정관리단에 문의하시기 바랍니다.
      </p>
      <AdSlot id="calc-severance-pay-bottom" />
    </div>
  );
}

function Row({ label, value, bold, muted }: { label: string; value: string; bold?: boolean; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 px-5 py-2.5">
      <dt className={muted ? "text-[#7A8296]" : "font-medium text-[#1B2A4A]"}>{label}</dt>
      <dd className={`shrink-0 tabular-nums text-right ${bold ? "font-bold text-[#1B2A4A]" : muted ? "text-[#7A8296]" : "text-[#1B2A4A]"}`}>
        {value}
      </dd>
    </div>
  );
}
