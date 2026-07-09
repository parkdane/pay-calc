"use client";

import { useMemo, useState } from "react";

const won = (n: number) => Math.round(n).toLocaleString("ko-KR") + "원";
const MONTHS = 36;

const TIERS = [
  {
    id: "low",
    label: "기준중위소득 50% 이하 (차상위 이하)",
    match: 300000,
    hint: "정부지원금 월 30만 원",
  },
  {
    id: "mid",
    label: "기준중위소득 50% 초과 ~ 100% 이하",
    match: 100000,
    hint: "정부지원금 월 10만 원",
  },
] as const;

export default function NaeilSavingsCalc() {
  const [tierId, setTierId] = useState<string>("mid");
  const [monthly, setMonthly] = useState(100000);
  const [rate, setRate] = useState(3.0);

  const tier = TIERS.find((t) => t.id === tierId)!;

  const result = useMemo(() => {
    const principal = monthly * MONTHS;
    const matching = tier.match * MONTHS;
    // 본인 저축 이자 (단리 적립식)
    const monthlyRate = rate / 100 / 12;
    const interest = monthly * monthlyRate * ((MONTHS * (MONTHS + 1)) / 2);
    const total = principal + matching + interest;
    return { principal, matching, interest, total };
  }, [tierId, monthly, rate, tier.match]);

  return (
    <div className="space-y-6">
      <div className="space-y-5 rounded-xl border border-slate-200 bg-slate-50 p-5">
        <label className="block text-sm font-medium text-slate-700">
          소득 구간
          <select
            value={tierId}
            onChange={(e) => setTierId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5"
          >
            {TIERS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
          <span className="mt-1 block text-xs font-normal text-slate-400">
            {tier.hint} · 본인 월 10만 원 이상 저축 유지 조건
          </span>
        </label>

        <div>
          <div className="flex items-center justify-between text-sm font-medium text-slate-700">
            <span>본인 월 저축액</span>
            <span className="tabular-nums text-blue-700">{won(monthly)}</span>
          </div>
          <input
            type="range"
            min={100000}
            max={500000}
            step={10000}
            value={monthly}
            onChange={(e) => setMonthly(Number(e.target.value))}
            className="mt-2 w-full accent-blue-700"
          />
          <p className="mt-1 text-xs text-slate-400">
            월 10만~50만 원. 정부지원금은 저축액과 무관하게 구간별 정액
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between text-sm font-medium text-slate-700">
            <span>적용 금리 (연)</span>
            <span className="tabular-nums text-blue-700">{rate.toFixed(1)}%</span>
          </div>
          <input
            type="range"
            min={1}
            max={6}
            step={0.1}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="mt-2 w-full accent-blue-700"
          />
        </div>
      </div>

      {/* 결과 */}
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <div className="bg-blue-700 px-5 py-4 text-white">
          <p className="text-sm opacity-80">3년 만기 예상 수령액</p>
          <p className="text-3xl font-bold tabular-nums">{won(result.total)}</p>
        </div>
        <dl className="divide-y divide-slate-100 bg-white text-sm">
          <Row label={`내 저축 원금 (${MONTHS}개월)`} value={won(result.principal)} />
          <Row
            label={`정부지원금 (월 ${won(tier.match)})`}
            value={"+ " + won(result.matching)}
            accent
          />
          <Row label="이자" value={"+ " + won(result.interest)} muted />
          <Row label="총 수령액" value={won(result.total)} bold />
        </dl>
      </div>

      <p className="text-xs leading-relaxed text-slate-400">
        ※ 참고용 추정치입니다. 정부지원금 수령에는 3년 통장 유지, 근로활동
        지속, 교육 이수, 자금사용계획서 제출 등의 조건이 있습니다. 모집 시기와
        세부 요건은 복지로·자산형성포털에서 확인하세요.
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
