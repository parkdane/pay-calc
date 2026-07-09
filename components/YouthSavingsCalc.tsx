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
      <div className="space-y-5 rounded-xl border border-slate-200 bg-slate-50 p-5">
        {/* 유형 */}
        <label className="block text-sm font-medium text-slate-700">
          가입 유형
          <select
            value={typeId}
            onChange={(e) => setTypeId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5"
          >
            {cfg.types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
          <span className="mt-1 block text-xs text-slate-400">{type.hint}</span>
        </label>

        {/* 월 납입액 */}
        <div>
          <div className="flex items-center justify-between text-sm font-medium text-slate-700">
            <span>월 납입액</span>
            <span className="tabular-nums text-blue-700">{won(monthly)}</span>
          </div>
          <input
            type="range"
            min={cfg.monthlyStep}
            max={cfg.maxMonthly}
            step={cfg.monthlyStep}
            value={monthly}
            onChange={(e) => setMonthly(Number(e.target.value))}
            className="mt-2 w-full accent-blue-700"
          />
          <p className="mt-1 text-xs text-slate-400">
            월 최대 50만 원, 3년(36개월) 만기 자유적립식
          </p>
        </div>

        {/* 금리 */}
        <div>
          <div className="flex items-center justify-between text-sm font-medium text-slate-700">
            <span>적용 금리 (연)</span>
            <span className="tabular-nums text-blue-700">{rate.toFixed(1)}%</span>
          </div>
          <input
            type="range"
            min={cfg.baseRate}
            max={cfg.maxRate}
            step={0.1}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="mt-2 w-full accent-blue-700"
          />
          <p className="mt-1 text-xs text-slate-400">
            기본 5.0% (전 기관 동일). 은행 우대금리 포함 최대 8%
          </p>
        </div>
      </div>

      {/* 광고 (입력 아래, 결과 위) */}
      <AdSlot id="calc-youth-save-mid" />

      {/* 결과 */}
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <div className="bg-blue-700 px-5 py-4 text-white">
          <p className="text-sm opacity-80">3년 만기 예상 수령액</p>
          <p className="text-3xl font-bold tabular-nums">{won(result.total)}</p>
        </div>
        <dl className="divide-y divide-slate-100 bg-white text-sm">
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

      <p className="text-xs leading-relaxed text-slate-400">
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
      <dt className={muted ? "text-slate-500" : "font-medium text-slate-800"}>
        {label}
      </dt>
      <dd
        className={`tabular-nums ${
          bold
            ? "font-bold text-slate-900"
            : accent
              ? "font-semibold text-blue-700"
              : muted
                ? "text-slate-500"
                : "text-slate-800"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
