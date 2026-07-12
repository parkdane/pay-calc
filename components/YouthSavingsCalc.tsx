"use client";

import { useMemo, useState } from "react";
import cfg from "@/data/youth-savings-2026.json";
import AdSlot from "@/components/AdSlot";

const won = (n: number) => Math.round(n).toLocaleString("ko-KR") + "원";

export default function YouthSavingsCalc() {
  const [monthly, setMonthly] = useState(500000);
  const [typeId, setTypeId] = useState("general");
  const [rate, setRate] = useState(cfg.baseRate);

  const type = cfg.types.find((t) => t.id === typeId)!;
  const months = cfg.months;

  const result = useMemo(() => {
    // 원금
    const principal = monthly * months;

    // 정부기여금 (월 납입액 × 비율, 단 월 상한 적용)
    const monthlyMatch = Math.min(monthly * type.matchRate, type.monthlyCap);
    const matching = monthlyMatch * months;

    // 이자 (단리, 적립식) — 저축금액 + 정부기여금 모두 이자 발생
    const monthlyRate = rate / 100 / 12;
    const sumFactor = (months * (months + 1)) / 2;
    const interestOnSavings = monthly * monthlyRate * sumFactor;
    const interestOnMatch = monthlyMatch * monthlyRate * sumFactor;
    const interest = interestOnSavings + interestOnMatch;

    // 비과세 → 이자 그대로
    const total = principal + matching + interest;

    return { principal, matching, interest, total, monthlyMatch };
  }, [monthly, typeId, rate, type, months]);

  return (
    <div className="space-y-6">
      {/* 입력 */}
      <div className="space-y-5 rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-5">
        {/* 유형 */}
        <label className="block text-sm font-medium text-[#5B6478]">
          가입 유형
          <select
            value={typeId}
            onChange={(e) => setTypeId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-3 py-2.5"
          >
            {cfg.types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
          <span className="mt-1 block text-xs text-[#8B93A6]">{type.hint}</span>
        </label>

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
            월 최대 50만 원, 3년(36개월) 만기 자유적립식
          </p>
        </div>

        {/* 금리 */}
        <div>
          <div className="flex items-center justify-between text-sm font-medium text-[#5B6478]">
            <span>적용 금리 (연)</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={0}
                max={15}
                step={0.01}
                value={rate}
                onChange={(e) => setRate(Number(e.target.value) || 0)}
                className="w-16 rounded-lg border border-[rgba(46,68,148,0.22)] px-2 py-1 text-right tabular-nums text-[#2E4494]"
              />
              <span className="text-[#2E4494]">%</span>
            </div>
          </div>
          <input
            type="range"
            min={cfg.baseRate}
            max={cfg.maxRate}
            step={0.01}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="mt-2 w-full accent-[#2E4494]"
          />
          <p className="mt-1 text-xs text-[#8B93A6]">
            기본 5.0% (전 기관 동일). 은행 우대금리 포함 최대 8%
          </p>
        </div>
      </div>

      {/* 광고 (입력 아래, 결과 위) */}
      <AdSlot id="calc-youth-save-mid" />

      {/* 결과 */}
      <div className="overflow-hidden rounded-xl border border-[rgba(46,68,148,0.14)]">
        <div className="bg-[#2E4494] px-5 py-4 text-white">
          <p className="text-sm opacity-80">3년 만기 예상 수령액</p>
          <p className="text-3xl font-bold tabular-nums">{won(result.total)}</p>
        </div>
        <dl className="divide-y divide-[rgba(46,68,148,0.10)] bg-white text-sm">
          <Row label="내 납입 원금" value={won(result.principal)} />
          {result.matching > 0 && (
            <Row
              label={`정부기여금 (월 ${won(result.monthlyMatch)})`}
              value={"+ " + won(result.matching)}
              accent
            />
          )}
          <Row label="비과세 이자" value={"+ " + won(result.interest)} muted />
          <Row label="총 수령액" value={won(result.total)} bold />
        </dl>
      </div>

      <p className="text-xs leading-relaxed text-[#8B93A6]">
        ※ 참고용 추정치입니다. 정부기여금은 소득 유형별 심사로 결정되며,
        중도해지 시 기여금·비과세 혜택을 받을 수 없습니다. 실제 금리·수령액은
        취급 은행과 서민금융진흥원에서 확인하세요.
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
