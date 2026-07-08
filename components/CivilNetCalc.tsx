"use client";

import { useMemo, useState } from "react";
import rates from "@/data/tax-rates-2026.json";
import civil from "@/data/salary-civil-2026.json";

const won = (n: number) => Math.round(n).toLocaleString("ko-KR") + "원";

function pickBracket<T extends { underYears: number }>(brackets: T[], years: number): T {
  return brackets.find((b) => years < b.underYears) ?? brackets[brackets.length - 1];
}

export default function CivilNetCalc() {
  const [gradeIdx, setGradeIdx] = useState(0);
  const [hobong, setHobong] = useState(1);
  // 상세 옵션
  const [dependents, setDependents] = useState(0); // 부양가족 수(본인 제외)
  const [years, setYears] = useState(0); // 근속연수
  const [useDetail, setUseDetail] = useState(false);

  const gradeLabel = civil.columns[gradeIdx];

  const result = useMemo(() => {
    const row = civil.rows.find((r) => r.hobong === hobong);
    if (!row) return null;
    const base = row.pay[gradeIdx];
    if (base === undefined || base === null) return null;

    // 기본 수당
    const meal = rates.meal;
    const positionBonus =
      (rates.positionBonusByGrade as Record<string, number>)[gradeLabel] ?? 175000;

    // 상세 수당 (정근수당 가산금 + 정근수당 월환산)
    let regularAddon = 0;
    let regularBonusMonthly = 0;
    if (useDetail) {
      regularAddon = pickBracket(rates.regularBonusAddon.brackets, years).amount;
      const bonusRate = pickBracket(rates.regularBonus.brackets, years).rate;
      // 정근수당은 연 2회(1·7월). 월 실수령 체감을 위해 ÷6로 분산 근사
      regularBonusMonthly = (base * bonusRate) / 6;
    }

    const allowanceTotal = meal + positionBonus + regularAddon + regularBonusMonthly;
    const gross = base + allowanceTotal;

    // 공제
    const pension = base * rates.civilPensionRate;
    const health = gross * rates.healthRate;
    const longTermCare = health * rates.longTermCareRateOfHealth;

    const bracket =
      rates.incomeTaxSimplified.find((b) => gross <= b.upTo) ??
      rates.incomeTaxSimplified[rates.incomeTaxSimplified.length - 1];
    let incomeTax = gross * bracket.rate;
    // 부양가족 세액 감면 (근사)
    if (useDetail && dependents > 0) {
      incomeTax = Math.max(0, incomeTax - dependents * rates.dependentTaxRelief);
    }
    const localTax = incomeTax * rates.localTaxRateOfIncomeTax;

    const allowanceItems = [
      { label: "정액급식비", value: meal },
      { label: "직급보조비", value: positionBonus },
    ];
    if (useDetail) {
      if (regularAddon > 0)
        allowanceItems.push({ label: "정근수당 가산금", value: regularAddon });
      if (regularBonusMonthly > 0)
        allowanceItems.push({ label: "정근수당(월환산)", value: regularBonusMonthly });
    }

    const deductions = [
      { label: "공무원연금 기여금", value: pension },
      { label: "건강보험", value: health },
      { label: "장기요양보험", value: longTermCare },
      { label: "소득세", value: incomeTax },
      { label: "지방소득세", value: localTax },
    ];
    const totalDeduction = deductions.reduce((s, d) => s + d.value, 0);
    const net = gross - totalDeduction;

    return { base, allowanceItems, gross, deductions, totalDeduction, net };
  }, [gradeIdx, hobong, dependents, years, useDetail, gradeLabel]);

  return (
    <div className="space-y-6">
      {/* 기본 입력 */}
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

      {/* 상세 옵션 (접이식) */}
      <details
        className="rounded-xl border border-slate-200 p-4"
        onToggle={(e) => setUseDetail((e.target as HTMLDetailsElement).open)}
      >
        <summary className="cursor-pointer text-sm font-semibold text-slate-800">
          상세 옵션 (부양가족·근속연수) — 더 정확하게 ▾
        </summary>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <label className="space-y-1.5 text-sm font-medium text-slate-700">
            부양가족 수
            <input
              type="number"
              min={0}
              max={10}
              value={dependents}
              onChange={(e) => setDependents(Number(e.target.value) || 0)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5"
            />
            <span className="text-xs font-normal text-slate-400">
              본인 제외, 소득세 감면 반영
            </span>
          </label>
          <label className="space-y-1.5 text-sm font-medium text-slate-700">
            근속연수
            <input
              type="number"
              min={0}
              max={40}
              value={years}
              onChange={(e) => setYears(Number(e.target.value) || 0)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5"
            />
            <span className="text-xs font-normal text-slate-400">
              실제 근무 햇수(호봉과 다를 수 있음). 군·민간 경력으로 호봉이 높아도
              실제 근무 기간만 입력
            </span>
          </label>
        </div>
      </details>

      {/* 결과 */}
      {result && (
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <div className="bg-blue-700 px-5 py-4 text-white">
            <p className="text-sm opacity-80">예상 월 실수령액</p>
            <p className="text-3xl font-bold tabular-nums">{won(result.net)}</p>
          </div>
          <dl className="divide-y divide-slate-100 bg-white text-sm">
            <Row label="기본급" value={won(result.base)} />
            {result.allowanceItems.map((it) => (
              <Row key={it.label} label={it.label} value={"+ " + won(it.value)} muted />
            ))}
            <Row label="세전 합계" value={won(result.gross)} bold />
            {result.deductions.map((d) => (
              <Row key={d.label} label={d.label} value={"- " + won(d.value)} muted />
            ))}
            <Row label="공제 합계" value={"- " + won(result.totalDeduction)} bold />
          </dl>
        </div>
      )}

      <p className="text-xs leading-relaxed text-slate-400">
        ※ 참고용 추정치입니다. 정근수당은 연 2회(1·7월) 지급분을 월 단위로
        분산 환산했으며, 소득세는 간이세액표 근사값입니다. 초과근무수당 등
        개인별 변동 항목은 포함되지 않아 실제 급여명세서와 차이가 있습니다.
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
