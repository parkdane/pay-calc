"use client";

import { useMemo, useState } from "react";
import rates from "@/data/tax-rates-2026.json";
import civil from "@/data/salary-civil-2026.json";
import police from "@/data/salary-police-2026.json";
import fire from "@/data/salary-fire-2026.json";
import teacher from "@/data/salary-teacher-2026.json";
import { monthlyIncomeTax } from "@/lib/incomeTax";
import AdSlot from "@/components/AdSlot";

const won = (n: number) => Math.round(n).toLocaleString("ko-KR") + "원";

const OCCUPATIONS = [
  { id: "civil", label: "일반직 공무원", data: civil, danger: 0, teacher: false },
  { id: "police", label: "경찰", data: police, danger: rates.dangerAllowance.police, teacher: false },
  { id: "fire", label: "소방", data: fire, danger: rates.dangerAllowance.fire, teacher: false },
  { id: "teacher", label: "교사 (유·초·중·고)", data: teacher, danger: 0, teacher: true },
] as const;

const TEACHER_ALLOWANCE = 250000; // 교직수당 (전 교원 공통)
const HOMEROOM_ALLOWANCE = 200000; // 담임수당

function pickBracket<T extends { underYears: number }>(brackets: T[], years: number): T {
  return brackets.find((b) => years < b.underYears) ?? brackets[brackets.length - 1];
}

// 자녀 수 → 가족수당 (첫째 5만, 둘째 8만, 셋째 이상 각 12만)
function childAllowance(n: number): number {
  const fa = rates.familyAllowance;
  if (n <= 0) return 0;
  if (n === 1) return fa.child1;
  if (n === 2) return fa.child1 + fa.child2;
  return fa.child1 + fa.child2 + (n - 2) * fa.child3plus;
}

export default function CivilNetCalc() {
  const [occIdx, setOccIdx] = useState(0);
  const [gradeIdx, setGradeIdx] = useState(0);
  const [hobong, setHobong] = useState(1);
  // 상세 옵션
  const [useDetail, setUseDetail] = useState(false);
  const [spouse, setSpouse] = useState(false);
  const [children, setChildren] = useState(0);
  const [years, setYears] = useState(0);
  const [overtimeH, setOvertimeH] = useState(0);
  const [includeDanger, setIncludeDanger] = useState(true);

  const occ = OCCUPATIONS[occIdx];
  const d = occ.data;
  const gradeLabel = d.columns[gradeIdx];

  const result = useMemo(() => {
    const row = d.rows.find((r) => r.hobong === hobong);
    if (!row) return null;
    const base = row.pay[gradeIdx];
    if (base === undefined || base === null) return null;

    // ── 수당 ──
    const items: { label: string; value: number }[] = [];
    const meal = rates.meal;
    items.push({ label: "정액급식비", value: meal });

    if (occ.teacher) {
      // 교사: 직급보조비 대신 교직수당
      items.push({ label: "교직수당", value: TEACHER_ALLOWANCE });
      if (includeDanger) {
        // 교사 직종에서 이 체크박스는 담임수당으로 사용
        items.push({ label: "담임수당", value: HOMEROOM_ALLOWANCE });
      }
    } else {
      const positionBonus =
        (rates.positionBonusByGrade as unknown as Record<string, number>)[gradeLabel] ??
        175000;
      items.push({ label: "직급보조비", value: positionBonus });

      // 위험근무수당 (경찰·소방)
      if (occ.danger > 0 && includeDanger) {
        items.push({ label: "위험근무수당", value: occ.danger });
      }
    }

    if (useDetail) {
      // 가족수당 (세분화)
      const fam = (spouse ? rates.familyAllowance.spouse : 0) + childAllowance(children);
      if (fam > 0) items.push({ label: "가족수당", value: fam });

      // 정근수당 가산금 + 정근수당(월환산)
      const addon = pickBracket(rates.regularBonusAddon.brackets, years).amount;
      if (addon > 0) items.push({ label: "정근수당 가산금", value: addon });
      const bonusRate = pickBracket(rates.regularBonus.brackets, years).rate;
      const bonusMonthly = (base * bonusRate) / 6;
      if (bonusMonthly > 0)
        items.push({ label: "정근수당(월환산)", value: bonusMonthly });

      // 시간외근무수당: 기준호봉 봉급 × 조정률 × 150% ÷ 209 × 시간
      if (overtimeH > 0) {
        const ot = rates.overtime;
        const baseRow = d.rows.find((r) => r.hobong === ot.baseHobong);
        const stdPay = baseRow ? (baseRow.pay[gradeIdx] ?? base) : base;
        const reduction = ot.reduction60Grades.includes(gradeLabel)
          ? ot.reduction60
          : ot.reductionDefault;
        const hourly = ((stdPay * reduction) / 209) * 1.5;
        items.push({
          label: `시간외수당 (${overtimeH}시간)`,
          value: hourly * Math.min(overtimeH, ot.maxHours),
        });
      }
    }

    const allowanceTotal = items.reduce((s, i) => s + i.value, 0);
    const gross = base + allowanceTotal;

    // ── 공제 ──
    const pension = base * rates.civilPensionRate;
    const health = gross * rates.healthRate;
    const longTermCare = health * rates.longTermCareRateOfHealth;
    const deps = useDetail ? (spouse ? 1 : 0) + children : 0;
    const incomeTax = monthlyIncomeTax(gross, pension, deps);
    const localTax = Math.floor(incomeTax * rates.localTaxRateOfIncomeTax);

    const deductions = [
      { label: "공무원연금 기여금", value: pension },
      { label: "건강보험", value: health },
      { label: "장기요양보험", value: longTermCare },
      { label: "소득세", value: incomeTax },
      { label: "지방소득세", value: localTax },
    ];
    const totalDeduction = deductions.reduce((s, x) => s + x.value, 0);
    const net = gross - totalDeduction;

    // ── 연간 환산 (E) ──
    // 명절휴가비(봉급×60%×연2회)는 월 계산 미포함 항목이라 연간에서 더한다
    const holidayBonus = base * rates.holidayBonusRate * 2;
    const annualGross = gross * 12 + holidayBonus;
    const annualNetApprox = net * 12 + holidayBonus * 0.85; // 명절휴가비 공제 근사 15%

    return {
      base,
      items,
      gross,
      deductions,
      totalDeduction,
      net,
      holidayBonus,
      annualGross,
      annualNetApprox,
    };
  }, [occIdx, gradeIdx, hobong, useDetail, spouse, children, years, overtimeH, includeDanger, d, gradeLabel, occ.danger]);

  return (
    <div className="space-y-6">
      {/* 기본 입력 */}
      <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-5">
        <label className="block text-sm font-medium text-slate-700">
          직종
          <select
            value={occIdx}
            onChange={(e) => {
              setOccIdx(Number(e.target.value));
              setGradeIdx(0);
              setHobong(1);
            }}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5"
          >
            {OCCUPATIONS.map((o, i) => (
              <option key={o.id} value={i}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="space-y-1.5 text-sm font-medium text-slate-700">
            {occ.teacher ? "구분" : occIdx === 0 ? "직급" : "계급"}
            <select
              value={gradeIdx}
              onChange={(e) => setGradeIdx(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5"
            >
              {d.columns.map((c, i) => (
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
              {d.rows.map((r) => (
                <option key={r.hobong} value={r.hobong}>
                  {r.hobong}호봉
                </option>
              ))}
            </select>
          </label>
        </div>
        {(occ.danger > 0 || occ.teacher) && (
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={includeDanger}
              onChange={(e) => setIncludeDanger(e.target.checked)}
              className="h-4 w-4"
            />
            {occ.teacher
              ? `담임수당 포함 (월 ${won(HOMEROOM_ALLOWANCE)})`
              : `위험근무수당 포함 (월 ${won(occ.danger)})`}
          </label>
        )}
      </div>

      {/* 광고 (입력 아래, 결과 위) */}
      <AdSlot id="calc-civil-net-mid" />

      {/* 상세 옵션 (접이식) */}
      <details
        className="rounded-xl border border-slate-200 p-4"
        onToggle={(e) => setUseDetail((e.target as HTMLDetailsElement).open)}
      >
        <summary className="cursor-pointer text-sm font-semibold text-slate-800">
          상세 옵션 (가족·근속·시간외) — 더 정확하게 ▾
        </summary>
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={spouse}
                onChange={(e) => setSpouse(e.target.checked)}
                className="h-4 w-4"
              />
              배우자 있음 (+4만)
            </label>
            <label className="space-y-1.5 text-sm font-medium text-slate-700">
              자녀 수
              <input
                type="number"
                min={0}
                max={6}
                value={children === 0 ? "" : children}
                onChange={(e) => setChildren(Number(e.target.value) || 0)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5"
              />
              <span className="text-xs font-normal text-slate-400">
                첫째 5만·둘째 8만·셋째부터 각 12만
              </span>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label className="space-y-1.5 text-sm font-medium text-slate-700">
              근속연수
              <input
                type="number"
                min={0}
                max={40}
                value={years === 0 ? "" : years}
                onChange={(e) => setYears(Number(e.target.value) || 0)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5"
              />
              <span className="text-xs font-normal text-slate-400">
                실제 근무 햇수(호봉과 다를 수 있음). 정근수당·가산금 반영
              </span>
            </label>
            <label className="space-y-1.5 text-sm font-medium text-slate-700">
              시간외근무 (월, 시간)
              <input
                type="number"
                min={0}
                max={57}
                value={overtimeH === 0 ? "" : overtimeH}
                onChange={(e) => setOvertimeH(Number(e.target.value) || 0)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5"
              />
              <span className="text-xs font-normal text-slate-400">
                월 최대 57시간. 8급 이하는 단가 상향(60%) 적용
              </span>
            </label>
          </div>
        </div>
      </details>

      {/* 결과 */}
      {result && (
        <>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <div className="bg-blue-700 px-5 py-4 text-white">
              <p className="text-sm opacity-80">예상 월 실수령액</p>
              <p className="text-3xl font-bold tabular-nums">{won(result.net)}</p>
            </div>
            <dl className="divide-y divide-slate-100 bg-white text-sm">
              <Row label="기본급" value={won(result.base)} />
              {result.items.map((it) => (
                <Row key={it.label} label={it.label} value={"+ " + won(it.value)} muted />
              ))}
              <Row label="세전 합계" value={won(result.gross)} bold />
              {result.deductions.map((x) => (
                <Row key={x.label} label={x.label} value={"- " + won(x.value)} muted />
              ))}
              <Row label="공제 합계" value={"- " + won(result.totalDeduction)} bold />
            </dl>
          </div>

          {/* 연간 환산 */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm">
            <p className="font-semibold text-slate-800">연간 환산</p>
            <div className="mt-2 space-y-1 text-slate-600">
              <p>
                연 세전 총액:{" "}
                <span className="font-semibold tabular-nums text-slate-900">
                  {won(result.annualGross)}
                </span>{" "}
                <span className="text-xs text-slate-400">
                  (월 세전 ×12 + 명절휴가비 {won(result.holidayBonus)})
                </span>
              </p>
              <p>
                연 실수령 추정:{" "}
                <span className="font-semibold tabular-nums text-blue-700">
                  {won(result.annualNetApprox)}
                </span>
              </p>
            </div>
          </div>
        </>
      )}

      <p className="text-xs leading-relaxed text-slate-400">
        ※ 참고용 추정치입니다. 소득세는 간이세액표 산출 방식(연환산)으로
        계산했으며, 정근수당(연 2회)은 월 단위 분산 환산, 명절휴가비(봉급의
        60%×연 2회)는 연간 환산에만 포함됩니다. 성과상여금 등 개인·기관별
        변동 항목은 포함되지 않습니다.
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
