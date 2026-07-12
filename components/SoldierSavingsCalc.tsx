"use client";

import { useMemo, useState } from "react";
import cfg from "@/data/soldier-savings-2026.json";
import AdSlot from "@/components/AdSlot";

const won = (n: number) => Math.round(n).toLocaleString("ko-KR") + "원";

export default function SoldierSavingsCalc() {
  const [monthly, setMonthly] = useState(550000);
  const [months, setMonths] = useState(18);
  const [rate, setRate] = useState(cfg.defaultRate);

  const result = useMemo(() => {
    // 원금
    const principal = monthly * months;

    // 정부 매칭지원금 (원금의 100%)
    const matching = principal * cfg.matchRate;

    // 적금 이자 (단리, 매월 적립식)
    // 이자 = 월납입액 × 월이율 × (n(n+1)/2), 월이율 = 연이율/12
    const monthlyRate = rate / 100 / 12;
    const interest = monthly * monthlyRate * ((months * (months + 1)) / 2);

    // 비과세: 이자 그대로
    const total = principal + matching + interest;

    return { principal, matching, interest, total };
  }, [monthly, months, rate]);

  return (
    <div className="space-y-6">
      {/* 입력 */}
      <div className="space-y-5 rounded-xl border border-[rgba(46,68,148,0.14)] bg-white p-5">
        {/* 월 납입액 */}
        <div>
          <div className="flex items-center justify-between text-sm font-medium text-[#5B6478]">
            <span>월 납입액</span>
            <span className="tabular-nums text-[#2E4494]">{won(monthly)}</span>
          </div>
          <input
            type="range"
            min={cfg.monthlyStep}
            max={cfg.maxMonthly}
            step={cfg.monthlyStep}
            value={monthly}
            onChange={(e) => setMonthly(Number(e.target.value))}
            className="mt-2 w-full accent-[#2E4494]"
          />
          <p className="mt-1 text-xs text-[#8B93A6]">
            개인 최대 월 55만 원 (은행당 30만 원, 5만 원 단위)
          </p>
        </div>

        {/* 복무기간 */}
        <label className="block text-sm font-medium text-[#5B6478]">
          복무기간
          <select
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-3 py-2.5"
          >
            {cfg.serviceMonths.map((s) => (
              <option key={s.months} value={s.months}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        {/* 금리 */}
        <div>
          <div className="flex items-center justify-between text-sm font-medium text-[#5B6478]">
            <span>적용 금리 (연)</span>
            <span className="tabular-nums text-[#2E4494]">{rate.toFixed(1)}%</span>
          </div>
          <input
            type="range"
            min={3}
            max={7}
            step={0.1}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="mt-2 w-full accent-[#2E4494]"
          />
          <p className="mt-1 text-xs text-[#8B93A6]">
            기본 5.0% (계약 15개월 이상). 은행 우대금리로 달라질 수 있음
          </p>
        </div>
      </div>

      {/* 광고 (입력 아래, 결과 위) */}
      <AdSlot id="calc-soldier-save-mid" />

      {/* 결과 */}
      <div className="overflow-hidden rounded-xl border border-[rgba(46,68,148,0.14)]">
        <div className="bg-[#2E4494] px-5 py-4 text-white">
          <p className="text-sm opacity-80">전역 시 예상 수령액</p>
          <p className="text-3xl font-bold tabular-nums">{won(result.total)}</p>
        </div>
        <dl className="divide-y divide-[rgba(46,68,148,0.10)] bg-white text-sm">
          <Row label="내 납입 원금" value={won(result.principal)} />
          <Row label="정부 매칭지원금 (100%)" value={"+ " + won(result.matching)} accent />
          <Row label="비과세 이자" value={"+ " + won(result.interest)} muted />
          <Row label="총 수령액" value={won(result.total)} bold />
        </dl>
      </div>

      <p className="text-xs leading-relaxed text-[#8B93A6]">
        ※ 참고용 추정치입니다. 매칭지원금은 2024년 이후 납입원금 100% 기준이며,
        중도해지 시 매칭지원금·비과세 혜택을 받을 수 없습니다. 실제 금리·수령액은
        은행과 나라사랑포털 계산기에서 확인하세요.
      </p>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
  muted,
  accent,
}: {
  label: string;
  value: string;
  bold?: boolean;
  muted?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-2.5">
      <dt className={muted ? "text-[#7A8296]" : "font-medium text-[#1B2A4A]"}>
        {label}
      </dt>
      <dd
        className={`tabular-nums ${
          bold
            ? "font-bold text-[#1B2A4A]"
            : accent
              ? "font-semibold text-[#2E4494]"
              : muted
                ? "text-[#7A8296]"
                : "text-[#1B2A4A]"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
