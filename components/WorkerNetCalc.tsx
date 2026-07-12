"use client";

import { useMemo, useState } from "react";
import { monthlyIncomeTax } from "@/lib/incomeTax";
import { topPercentOf, incomePercentileMeta } from "@/lib/incomePercentile";
import AdSlot from "@/components/AdSlot";
import Link from "next/link";

const won = (n: number) => Math.round(n).toLocaleString("ko-KR") + "원";
const manwon = (n: number) => Math.round(n / 10000).toLocaleString("ko-KR") + "만";

// 2026 근로자 본인부담 요율
const PENSION_RATE = 0.045;
const PENSION_BASE_MAX = 6590000; // 국민연금 기준소득월액 상한
const HEALTH_RATE = 0.03595;
const LTC_RATE_OF_HEALTH = 0.1314;
const EMPLOYMENT_RATE = 0.009;

// 종합소득세 과세표준 구간 (참고 표시용)
const TAX_BRACKETS = [
  { upTo: "1,400만", rate: "6%" },
  { upTo: "5,000만", rate: "15%" },
  { upTo: "8,800만", rate: "24%" },
  { upTo: "1억 5천만", rate: "35%" },
  { upTo: "3억", rate: "38%" },
  { upTo: "3억 초과", rate: "40%~45%" },
];

function calcNet(annualGross: number, dependents: number) {
  const monthlyGross = annualGross / 12;
  const pension = Math.min(monthlyGross, PENSION_BASE_MAX) * PENSION_RATE;
  const health = monthlyGross * HEALTH_RATE;
  const ltc = health * LTC_RATE_OF_HEALTH;
  const employment = monthlyGross * EMPLOYMENT_RATE;
  const incomeTax = monthlyIncomeTax(monthlyGross, pension, dependents);
  const localTax = Math.floor(incomeTax * 0.1);
  const totalDeduction = pension + health + ltc + employment + incomeTax + localTax;
  const net = monthlyGross - totalDeduction;
  return {
    monthlyGross,
    deductions: [
      { label: "국민연금 (4.5%)", value: pension },
      { label: "건강보험 (3.595%)", value: health },
      { label: "장기요양보험", value: ltc },
      { label: "고용보험 (0.9%)", value: employment },
      { label: "소득세", value: incomeTax },
      { label: "지방소득세", value: localTax },
    ],
    totalDeduction,
    net,
    annualNet: net * 12,
    netRate: net / monthlyGross,
  };
}

// 비교 막대그래프용 기준 연봉들 (만원)
const COMPARE = [3000, 5000, 7000, 9000, 10000, 12000, 15000];

export default function WorkerNetCalc() {
  const [annualManwon, setAnnualManwon] = useState(5000);
  const [dependents, setDependents] = useState(0);

  const my = useMemo(() => calcNet(annualManwon * 10000, dependents), [annualManwon, dependents]);

  const topPct = useMemo(() => topPercentOf(annualManwon * 10000), [annualManwon]);
  const vsMedian = (annualManwon * 10000) / incomePercentileMeta.median;

  const bars = useMemo(() => {
    const list = COMPARE.includes(annualManwon) ? COMPARE : [...COMPARE, annualManwon].sort((a, b) => a - b);
    const max = Math.max(...list) * 10000;
    return list.map((m) => {
      const r = calcNet(m * 10000, dependents);
      return {
        annual: m,
        gross: m * 10000,
        net: r.annualNet,
        netW: (r.annualNet / max) * 100,
        taxW: ((m * 10000 - r.annualNet) / max) * 100,
        rate: r.netRate,
        mine: m === annualManwon,
      };
    });
  }, [annualManwon, dependents]);

  return (
    <div className="mx-auto max-w-[1280px] px-4">
      {/* 광고 (입력칸 위, 전체 폭) */}
      <AdSlot id="calc-worker-net-mid" />

      <div className="grid gap-6 lg:grid-cols-[380px_1fr] lg:items-start">
        {/* ═══ 왼쪽: 입력 ═══ */}
        <div className="space-y-4">
          <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">기본 입력</p>
              <p className="mt-0.5 text-base font-bold text-slate-900">연봉과 부양가족</p>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">연봉 (만원)</span>
              <div className="mt-1.5">
                <input
                  type="text"
                  inputMode="numeric"
                  value={annualManwon === 0 ? "" : annualManwon.toLocaleString("ko-KR")}
                  onChange={(e) => setAnnualManwon(Number(e.target.value.replace(/[^0-9]/g, "")) || 0)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-right text-base tabular-nums"
                />
              </div>
              <span className="mt-1 block text-xs font-normal text-slate-400">
                세전 계약 연봉. 5천만 원이면 5000
              </span>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">부양가족 수</span>
              <div className="mt-1.5">
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={dependents === 0 ? "" : dependents}
                  onChange={(e) => setDependents(Number(e.target.value) || 0)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-right text-base tabular-nums"
                />
              </div>
              <span className="mt-1 block text-xs font-normal text-slate-400">
                본인 제외. 소득세 인적공제 반영
              </span>
            </label>
          </div>
        </div>

        {/* ═══ 오른쪽: 결과 (sticky) ═══ */}
        <div className="space-y-5 lg:sticky lg:top-20">
          {/* 결과 요약 */}
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <div className="bg-blue-700 px-5 py-4 text-white">
              <p className="text-sm opacity-80">월 실수령액</p>
              <p className="text-3xl font-bold tabular-nums">{won(my.net)}</p>
              <p className="mt-1 text-sm opacity-90">
                연 실수령 {won(my.annualNet)} · 세전의 {(my.netRate * 100).toFixed(1)}%
              </p>
            </div>
            <dl className="divide-y divide-slate-100 bg-white text-sm">
              <Row label="월 세전 급여" value={won(my.monthlyGross)} />
              {my.deductions.map((d) => (
                <Row key={d.label} label={d.label} value={"- " + won(d.value)} muted />
              ))}
              <Row label="공제 합계" value={"- " + won(my.totalDeduction)} bold />
            </dl>
          </div>

          {/* 핵심 지표 */}
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">핵심 지표</p>
            <p className="mt-1 text-lg font-bold text-slate-900">
              내 연봉은 근로소득자 상위 {topPct <= 1 ? "1% 이내" : `${topPct.toFixed(1)}%`}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              {incomePercentileMeta.year}년 귀속 근로소득자 중위 연봉은{" "}
              <strong className="tabular-nums">{won(incomePercentileMeta.median)}</strong>입니다. 입력한 연봉은
              중위의 <strong className="tabular-nums">{vsMedian.toFixed(1)}배</strong>입니다.
            </p>
            <Link
              href="/calc/income-rank"
              className="mt-2 inline-block text-xs font-medium text-blue-700 underline underline-offset-2"
            >
              연봉순위 계산기에서 자세히 보기 →
            </Link>
            <p className="mt-2 text-xs text-slate-400">{incomePercentileMeta.source}</p>
          </div>

          {/* 연봉별 실수령 비교 막대그래프 */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="font-semibold text-slate-800">
              연봉별 실수령액 비교{" "}
              <span className="text-xs font-normal text-slate-400">(연간, 파란색=실수령 / 회색=세금·보험)</span>
            </p>
            <div className="mt-4 space-y-2.5">
              {bars.map((b) => (
                <div key={b.annual}>
                  <div className="mb-0.5 flex justify-between text-xs">
                    <span className={b.mine ? "font-bold text-blue-700" : "text-slate-500"}>
                      {b.annual.toLocaleString()}만 {b.mine && "← 내 연봉"}
                    </span>
                    <span className="tabular-nums text-slate-500">
                      실수령 {manwon(b.net)} ({(b.rate * 100).toFixed(0)}%)
                    </span>
                  </div>
                  <div className="flex h-4 w-full overflow-hidden rounded bg-slate-100">
                    <div className={b.mine ? "bg-blue-700" : "bg-blue-400"} style={{ width: `${b.netW}%` }} />
                    <div className="bg-slate-300" style={{ width: `${b.taxW}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-400">
              연봉이 오를수록 높은 세율 구간에 걸리는 금액이 늘어나 실수령 비율(%)이 점점 낮아집니다. 연봉 3천만
              원은 약 90%를 받지만 1억 원은 약 80% 수준만 손에 들어오는 이유입니다.
            </p>
          </div>

          {/* 과세표준 구간 */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm">
            <p className="mb-3 font-semibold text-slate-800">소득세 과세표준 구간 (누진세율)</p>
            <dl className="space-y-1.5 text-slate-600">
              {TAX_BRACKETS.map((t) => (
                <div key={t.upTo} className="flex justify-between">
                  <dt>~ {t.upTo} 원</dt>
                  <dd className="font-medium tabular-nums text-slate-900">{t.rate}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-xs leading-relaxed text-slate-400">
              누진 구조라 구간을 넘는 금액에만 높은 세율이 적용됩니다. 과세표준은 연봉에서 근로소득공제·인적공제
              등을 뺀 금액이라 연봉 자체와는 다릅니다.
            </p>
          </div>
        </div>
      </div>

      {/* ═══ 하단 전체 폭 (grid 밖으로 분리 — sticky 오른쪽 컬럼과 겹치는 문제 방지) ═══ */}
      <p className="mt-6 text-xs leading-relaxed text-slate-400">
        ※ 참고용 추정치입니다. 소득세는 간이세액표 산출 방식(연환산) 근사이며, 비과세 식대, 연말정산 공제 항목,
        회사별 공제 차이에 따라 실제 급여명세서와 다를 수 있습니다.
      </p>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
  muted,
}: {
  label: string;
  value: string;
  bold?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-2.5">
      <dt className={muted ? "text-slate-500" : "font-medium text-slate-800"}>{label}</dt>
      <dd className={`tabular-nums ${bold ? "font-bold text-slate-900" : muted ? "text-slate-500" : "text-slate-800"}`}>
        {value}
      </dd>
    </div>
  );
}
