"use client";

import { useMemo, useState } from "react";
import rates from "@/data/tax-rates-2026.json";
import civil from "@/data/salary-civil-2026.json";

const won = (n: number) => Math.round(n).toLocaleString("ko-KR") + "원";

export default function CivilNetCalc() {
  const [gradeIdx, setGradeIdx] = useState(0); // columns 인덱스
  const [hobong, setHobong] = useState(1);

  const result = useMemo(() => {
    const row = civil.rows.find((r) => r.hobong === hobong);
    if (!row) return null;

    const base = row.pay[gradeIdx];
    const allowance = rates.allowances.meal + rates.allowances.positionBonus9;
    const gross = base + allowance;

    // 공제 — 예시 로직. 실데이터 적용 시 검증 필요
    const pension = base * rates.pensionRate;
    const health = gross * rates.healthRate;
    const longTermCare = health * rates.longTermCareRateOfHealth;

    const taxBracket = rates.incomeTaxSimplified.find((b) => gross <= b.upTo)!;
    const incomeTax = gross * taxBracket.rate;
    const localTax = incomeTax * rates.localTaxRateOfIncomeTax;

    const totalDeduction = pension + health + longTermCare + incomeTax + localTax;
    const net = gross - totalDeduction;

    return {
      base,
      allowance,
      gross,
      items: [
        { label: "연금 기여금", value: pension },
        { label: "건강보험", value: health },
        { label: "장기요양보험", value: longTermCare },
        { label: "소득세", value: incomeTax },
        { label: "지방소득세", value: localTax },
      ],
      totalDeduction,
      net,
    };
  }, [gradeIdx, hobong]);

  return (
    <div className="space-y-6">
      {/* 입력 */}
      <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5">
        <label className="space-y-1.5 text-sm font-medium text-slate-700">
          직급
          <select
            value={gradeIdx}
            onChange={(e) => setGradeIdx(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5"
          >
            {civil.columns.map((c, i) => (
              <option key={c} value={i}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1.5 text-sm font-medium text-slate-700">
          호봉
          <select
            value={hobong}
            onChange={(e) => setHobong(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5"
          >
            {civil.rows.map((r) => (
              <option key={r.hobong} value={r.hobong}>
                {r.hobong}호봉
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* 결과 — 공제 내역을 항목별로 보여주는 게 신뢰도 핵심 */}
      {result && (
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <div className="bg-blue-700 px-5 py-4 text-white">
            <p className="text-sm opacity-80">예상 월 실수령액</p>
            <p className="text-3xl font-bold tabular-nums">{won(result.net)}</p>
          </div>
          <dl className="divide-y divide-slate-100 bg-white text-sm">
            <Row label="기본급" value={won(result.base)} />
            <Row label="수당 (급식비 등)" value={"+ " + won(result.allowance)} />
            <Row label="세전 합계" value={won(result.gross)} bold />
            {result.items.map((it) => (
              <Row key={it.label} label={it.label} value={"- " + won(it.value)} muted />
            ))}
            <Row label="공제 합계" value={"- " + won(result.totalDeduction)} bold />
          </dl>
        </div>
      )}
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
