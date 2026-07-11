"use client";

import { useMemo, useState } from "react";
import AdSlot from "@/components/AdSlot";

const won = (n: number) => Math.round(n).toLocaleString("ko-KR") + "원";
const eok = (n: number) => {
  const e = n / 100000000;
  return e >= 1 ? `${e.toFixed(1)}억원` : Math.round(n / 10000).toLocaleString("ko-KR") + "만원";
};

export default function FireCalc() {
  const [age, setAge] = useState(35); // 현재 나이
  const [monthlyExpense, setMonthlyExpense] = useState(300); // 은퇴 후 월 지출(만원)
  const [asset, setAsset] = useState(10000); // 현재 순자산(만원)
  const [monthlySave, setMonthlySave] = useState(200); // 월 저축액(만원)
  const [returnRate, setReturnRate] = useState(7); // 연 기대수익률(%)
  const [inflation, setInflation] = useState(2.5); // 물가상승률(%)
  const [withdrawRate, setWithdrawRate] = useState(4); // 인출률(%)

  const result = useMemo(() => {
    const annualExpense = monthlyExpense * 10000 * 12;
    // 파이어 목표 자산 = 연 지출 / 인출률 (4% 룰: 25배)
    const fireNumber = annualExpense / (withdrawRate / 100);

    // 실질 수익률 (물가 반영)
    const realReturn = (1 + returnRate / 100) / (1 + inflation / 100) - 1;
    const monthlyReturn = realReturn / 12;

    let cur = asset * 10000;
    const save = monthlySave * 10000;
    let months = 0;
    const maxMonths = 12 * 70; // 70년 상한

    if (cur >= fireNumber) {
      return { fireNumber, months: 0, reachAge: age, annualExpense, realReturn, already: true };
    }

    while (cur < fireNumber && months < maxMonths) {
      cur = cur * (1 + monthlyReturn) + save;
      months++;
    }

    const reached = months < maxMonths;
    return {
      fireNumber,
      months: reached ? months : null,
      reachAge: reached ? age + Math.floor(months / 12) : null,
      annualExpense,
      realReturn,
      already: false,
    };
  }, [age, monthlyExpense, asset, monthlySave, returnRate, inflation, withdrawRate]);

  const fmt = (m: number) => {
    const y = Math.floor(m / 12);
    const mo = m % 12;
    return y > 0 ? `${y}년 ${mo}개월` : `${mo}개월`;
  };

  return (
    <div className="space-y-6">
      {/* 입력 */}
      <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-5">
        <div className="grid grid-cols-2 gap-4">
          <Field label="현재 나이" value={age} onChange={setAge} suffix="세" />
          <Field
            label="은퇴 후 월 지출"
            value={monthlyExpense}
            onChange={setMonthlyExpense}
            suffix="만원"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="현재 순자산" value={asset} onChange={setAsset} suffix="만원" />
          <Field
            label="월 저축액"
            value={monthlySave}
            onChange={setMonthlySave}
            suffix="만원"
          />
        </div>

        <div className="space-y-3 border-t border-slate-200 pt-4">
          <Slider
            label="연 기대수익률"
            value={returnRate}
            onChange={setReturnRate}
            min={1}
            max={12}
            step={0.5}
          />
          <Slider
            label="물가상승률"
            value={inflation}
            onChange={setInflation}
            min={0}
            max={6}
            step={0.1}
          />
          <Slider
            label="인출률 (4% 룰)"
            value={withdrawRate}
            onChange={setWithdrawRate}
            min={2.5}
            max={6}
            step={0.1}
          />
        </div>
      </div>

      <AdSlot id="calc-fire-mid" />

      {/* 결과 */}
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <div className="bg-blue-700 px-5 py-5 text-center text-white">
          {result.already ? (
            <>
              <p className="text-sm opacity-80">축하합니다</p>
              <p className="mt-1 text-3xl font-bold">이미 파이어 달성</p>
              <p className="mt-2 text-sm opacity-90">
                현재 자산이 목표 {eok(result.fireNumber)}를 넘었습니다
              </p>
            </>
          ) : result.months !== null ? (
            <>
              <p className="text-sm opacity-80">파이어 달성까지</p>
              <p className="mt-1 text-4xl font-bold">{fmt(result.months)}</p>
              <p className="mt-2 text-sm opacity-90">
                {result.reachAge}세에 조기 은퇴 가능
              </p>
            </>
          ) : (
            <>
              <p className="text-sm opacity-80">현재 조건으로는</p>
              <p className="mt-1 text-2xl font-bold">70년 내 달성 어려움</p>
              <p className="mt-2 text-sm opacity-90">
                저축액을 늘리거나 목표 지출을 줄여보세요
              </p>
            </>
          )}
        </div>
        <dl className="divide-y divide-slate-100 bg-white text-sm">
          <Row label="목표 자산 (파이어 넘버)" value={won(result.fireNumber)} bold />
          <Row
            label="은퇴 후 연 지출"
            value={won(result.annualExpense)}
            muted
          />
          <Row
            label="실질 수익률 (물가 반영)"
            value={(result.realReturn * 100).toFixed(2) + "%"}
            muted
          />
        </dl>
      </div>

      <section className="space-y-1.5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
        <p className="font-semibold text-slate-800">파이어 넘버란?</p>
        <p>
          은퇴 후 연 지출의 25배(4% 룰 기준)를 모으면, 자산을 원금 손실 없이
          매년 4%씩 인출하며 살 수 있다는 개념입니다. 인출률을 낮추면 더
          안전하지만 목표 금액이 커집니다.
        </p>
      </section>

      <p className="text-xs leading-relaxed text-slate-400">
        ※ 물가를 반영한 실질 수익률로 계산한 추정치입니다. 실제 수익률은 매년
        변동하며, 세금·건강보험료 등은 반영하지 않았습니다. 투자 결정의 참고
        자료로만 활용하세요.
      </p>

      <AdSlot id="calc-fire-bottom" />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  suffix?: string;
}) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <div className="mt-1 flex items-center gap-1">
        <input
          type="text"
          inputMode="numeric"
          value={value === 0 ? "" : value.toLocaleString("ko-KR")}
          onChange={(e) =>
            onChange(Number(e.target.value.replace(/[^0-9]/g, "")) || 0)
          }
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-right tabular-nums"
        />
        {suffix && <span className="text-sm text-slate-400">{suffix}</span>}
      </div>
    </label>
  );
}

function Slider({
  label,
  value,
  onChange,
  min,
  max,
  step,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  step: number;
}) {
  return (
    <div className="text-sm font-medium text-slate-700">
      <div className="flex items-center justify-between">
        <span>{label}</span>
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value) || 0)}
            className="w-16 rounded-lg border border-slate-300 px-2 py-1 text-right tabular-nums text-blue-700"
          />
          <span className="text-blue-700">%</span>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-blue-700"
      />
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
      <dt className={muted ? "text-slate-500" : "font-medium text-slate-800"}>
        {label}
      </dt>
      <dd
        className={`tabular-nums ${bold ? "font-bold text-slate-900" : muted ? "text-slate-500" : "text-slate-800"}`}
      >
        {value}
      </dd>
    </div>
  );
}
