"use client";

import { useMemo, useState } from "react";

const won = (n: number) => Math.round(n).toLocaleString("ko-KR") + "원";
const MONTHS = 60;
const CAP = 700000;

// 2025.1 확대 기준: 소득구간별 [기준한도, 기본 매칭비율], 확대구간(기준한도~70만)은 3.0%
const TIERS = [
  { id: "t2400", label: "총급여 2,400만 원 이하", base: 400000, rate: 0.06 },
  { id: "t3600", label: "2,400만 초과 ~ 3,600만 이하", base: 500000, rate: 0.046 },
  { id: "t4800", label: "3,600만 초과 ~ 4,800만 이하", base: 600000, rate: 0.037 },
  { id: "t6000", label: "4,800만 초과 ~ 6,000만 이하", base: 700000, rate: 0.03 },
  { id: "t7500", label: "6,000만 초과 ~ 7,500만 이하 (비과세만)", base: 0, rate: 0 },
] as const;

const EXPAND_RATE = 0.03;

export default function LeapAccountCalc() {
  const [tierId, setTierId] = useState<string>("t3600");
  const [monthly, setMonthly] = useState(700000);
  const [rate, setRate] = useState(4.5);

  const tier = TIERS.find((t) => t.id === tierId)!;

  const result = useMemo(() => {
    const m = Math.min(monthly, CAP);
    const principal = m * MONTHS;

    // 월 기여금 = 기준한도까지 × 기본비율 + 초과분(70만까지) × 3.0%
    const basePart = Math.min(m, tier.base) * tier.rate;
    const expandPart = tier.base > 0 ? Math.max(0, m - tier.base) * EXPAND_RATE : 0;
    const monthlyMatch = basePartRound(basePart + expandPart);
    const matching = monthlyMatch * MONTHS;

    // 이자 (단리 적립식, 비과세) — 본인 납입분 기준
    const monthlyRate = rate / 100 / 12;
    const interest = m * monthlyRate * ((MONTHS * (MONTHS + 1)) / 2);

    const total = principal + matching + interest;
    return { principal, monthlyMatch, matching, interest, total };
  }, [tierId, monthly, rate, tier.base, tier.rate]);

  return (
    <div className="space-y-6">
      <div className="space-y-5 rounded-xl border border-slate-200 bg-slate-50 p-5">
        <label className="block text-sm font-medium text-slate-700">
          개인소득 구간 (가입 시 심사 기준)
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
        </label>

        <div>
          <div className="flex items-center justify-between text-sm font-medium text-slate-700">
            <span>월 납입액</span>
            <span className="tabular-nums text-blue-700">{won(monthly)}</span>
          </div>
          <input
            type="range"
            min={100000}
            max={700000}
            step={50000}
            value={monthly}
            onChange={(e) => setMonthly(Number(e.target.value))}
            className="mt-2 w-full accent-blue-700"
          />
          <p className="mt-1 text-xs text-slate-400">
            월 최대 70만 원 · 5년(60개월) 만기 자유적립식
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between text-sm font-medium text-slate-700">
            <span>적용 금리 (연)</span>
            <span className="tabular-nums text-blue-700">{rate.toFixed(1)}%</span>
          </div>
          <input
            type="range"
            min={3}
            max={6.5}
            step={0.1}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="mt-2 w-full accent-blue-700"
          />
          <p className="mt-1 text-xs text-slate-400">
            기본금리 4.5% (3년 고정 + 2년 변동), 은행 우대금리 별도
          </p>
        </div>
      </div>

      {/* 결과 */}
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <div className="bg-blue-700 px-5 py-4 text-white">
          <p className="text-sm opacity-80">5년 만기 예상 수령액</p>
          <p className="text-3xl font-bold tabular-nums">{won(result.total)}</p>
        </div>
        <dl className="divide-y divide-slate-100 bg-white text-sm">
          <Row label="내 납입 원금 (60개월)" value={won(result.principal)} />
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
        ※ 참고용 추정치입니다. 신규 가입은 2025년 12월 종료되어 기존 가입자의
        만기 예상 확인용입니다. 기여금은 2025년 1월 확대 기준(모든 구간
        매칭한도 70만 원, 확대구간 3.0%)이며, 3년 이상 유지 후 중도해지 시
        기여금의 60%와 비과세가 적용됩니다. 정부기여금 이자는 계산에서
        제외했습니다.
      </p>
    </div>
  );
}

// 기여금은 원 단위 절사 근사
function basePartRound(n: number) {
  return Math.floor(n / 100) * 100;
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
