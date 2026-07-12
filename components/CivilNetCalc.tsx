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
        (rates.positionBonusByGrade as unknown as Record<string, number>)[gradeLabel] ?? 175000;
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
      if (bonusMonthly > 0) items.push({ label: "정근수당(월환산)", value: bonusMonthly });

      // 시간외근무수당: 기준호봉 봉급 × 조정률 × 150% ÷ 209 × 시간
      if (overtimeH > 0) {
        const ot = rates.overtime;
        const baseRow = d.rows.find((r) => r.hobong === ot.baseHobong);
        const stdPay = baseRow ? (baseRow.pay[gradeIdx] ?? base) : base;
        const reduction = ot.reduction60Grades.includes(gradeLabel) ? ot.reduction60 : ot.reductionDefault;
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

    // ── 연간 환산 ──
    const holidayBonus = base * rates.holidayBonusRate * 2;
    const annualGross = gross * 12 + holidayBonus;
    const annualNetApprox = net * 12 + holidayBonus * 0.85;

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
    <div className="mx-auto max-w-[1280px] px-4">
      {/* 광고 (입력칸 위, 전체 폭) */}
      <AdSlot id="calc-civil-net-mid" />

      <div className="grid gap-6 lg:grid-cols-[380px_1fr] lg:items-start">
        {/* ═══ 왼쪽: 입력 ═══ */}
        <div className="space-y-4">
          <div className="space-y-4 rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#2E4494]">기본 입력</p>
              <p className="mt-0.5 text-base font-bold text-[#1B2A4A]">직종·직급·호봉</p>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-[#5B6478]">직종</span>
              <select
                value={occIdx}
                onChange={(e) => {
                  setOccIdx(Number(e.target.value));
                  setGradeIdx(0);
                  setHobong(1);
                }}
                className="mt-1.5 w-full rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-3 py-3"
              >
                {OCCUPATIONS.map((o, i) => (
                  <option key={o.id} value={i}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-[#5B6478]">
                {occ.teacher ? "구분" : occIdx === 0 ? "직급" : "계급"}
              </span>
              <select
                value={gradeIdx}
                onChange={(e) => setGradeIdx(Number(e.target.value))}
                className="mt-1.5 w-full rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-3 py-3"
              >
                {d.columns.map((c, i) => (
                  <option key={c} value={i}>
                    {c}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-[#5B6478]">호봉</span>
              <select
                value={hobong}
                onChange={(e) => setHobong(Number(e.target.value))}
                className="mt-1.5 w-full rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-3 py-3"
              >
                {d.rows.map((r) => (
                  <option key={r.hobong} value={r.hobong}>
                    {r.hobong}호봉
                  </option>
                ))}
              </select>
            </label>

            {(occ.danger > 0 || occ.teacher) && (
              <label className="flex items-center gap-2 text-sm text-[#5B6478]">
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

          {/* 상세 옵션 (접이식) */}
          <details
            className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-4"
            onToggle={(e) => setUseDetail((e.target as HTMLDetailsElement).open)}
          >
            <summary className="cursor-pointer text-sm font-semibold text-[#1B2A4A]">
              상세 옵션 (가족·근속·시간외) — 더 정확하게 ▾
            </summary>
            <div className="mt-4 space-y-4">
              <label className="flex items-center gap-2 text-sm font-medium text-[#5B6478]">
                <input
                  type="checkbox"
                  checked={spouse}
                  onChange={(e) => setSpouse(e.target.checked)}
                  className="h-4 w-4"
                />
                배우자 있음 (+4만)
              </label>

              <label className="block">
                <span className="text-sm font-medium text-[#5B6478]">자녀 수</span>
                <input
                  type="number"
                  min={0}
                  max={6}
                  value={children === 0 ? "" : children}
                  onChange={(e) => setChildren(Number(e.target.value) || 0)}
                  className="mt-1.5 w-full rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-3 py-2.5"
                />
                <span className="mt-1 block text-xs font-normal text-[#8B93A6]">
                  첫째 5만·둘째 8만·셋째부터 각 12만
                </span>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-[#5B6478]">근속연수</span>
                <input
                  type="number"
                  min={0}
                  max={40}
                  value={years === 0 ? "" : years}
                  onChange={(e) => setYears(Number(e.target.value) || 0)}
                  className="mt-1.5 w-full rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-3 py-2.5"
                />
                <span className="mt-1 block text-xs font-normal text-[#8B93A6]">
                  실제 근무 햇수(호봉과 다를 수 있음). 정근수당·가산금 반영
                </span>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-[#5B6478]">시간외근무 (월, 시간)</span>
                <input
                  type="number"
                  min={0}
                  max={57}
                  value={overtimeH === 0 ? "" : overtimeH}
                  onChange={(e) => setOvertimeH(Number(e.target.value) || 0)}
                  className="mt-1.5 w-full rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-3 py-2.5"
                />
                <span className="mt-1 block text-xs font-normal text-[#8B93A6]">
                  월 최대 57시간. 8급 이하는 단가 상향(60%) 적용
                </span>
              </label>
            </div>
          </details>
        </div>

        {/* ═══ 오른쪽: 결과 (sticky) ═══ */}
        <div className="space-y-5 lg:sticky lg:top-20">
          {result ? (
            <>
              <div className="overflow-hidden rounded-xl border border-[rgba(46,68,148,0.14)]">
                <div className="bg-[#2E4494] px-5 py-4 text-white">
                  <p className="text-sm opacity-80">예상 월 실수령액</p>
                  <p className="text-3xl font-bold tabular-nums">{won(result.net)}</p>
                </div>
                <dl className="divide-y divide-[rgba(46,68,148,0.10)] bg-white text-sm">
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
              <div className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-5 text-sm">
                <p className="font-semibold text-[#1B2A4A]">연간 환산</p>
                <div className="mt-2 space-y-1 text-[#5B6478]">
                  <p>
                    연 세전 총액:{" "}
                    <span className="font-semibold tabular-nums text-[#1B2A4A]">{won(result.annualGross)}</span>{" "}
                    <span className="text-xs text-[#8B93A6]">
                      (월 세전 ×12 + 명절휴가비 {won(result.holidayBonus)})
                    </span>
                  </p>
                  <p>
                    연 실수령 추정:{" "}
                    <span className="font-semibold tabular-nums text-[#2E4494]">{won(result.annualNetApprox)}</span>
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-6 text-center text-sm text-[#8B93A6]">
              입력값을 확인해주세요.
            </div>
          )}
        </div>
      </div>

      {/* 판단 보조 */}
      <div className="mt-6 space-y-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#2E4494]">판단 보조</p>
          <p className="mt-0.5 text-base font-bold text-[#1B2A4A]">이런 상황이면 이렇게 보세요</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {CIVIL_DECISION_CARDS.map((card) => (
            <div key={card.tag} className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-white p-4">
              <span className="inline-block rounded-full bg-[rgba(46,68,148,0.08)] px-2 py-0.5 text-[10px] font-semibold text-[#2E4494]">
                {card.tag}
              </span>
              <p className="mt-2 text-sm font-bold text-[#1B2A4A]">{card.title}</p>
              <ul className="mt-2 space-y-1 text-xs leading-relaxed text-[#5B6478]">
                {card.bullets.map((b) => (
                  <li key={b}>· {b}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-6 text-xs leading-relaxed text-[#8B93A6]">
        ※ 참고용 추정치입니다. 소득세는 간이세액표 산출 방식(연환산)으로 계산했으며, 정근수당(연 2회)은 월 단위
        분산 환산, 명절휴가비(봉급의 60%×연 2회)는 연간 환산에만 포함됩니다. 성과상여금 등 개인·기관별 변동
        항목은 포함되지 않습니다.
      </p>
    </div>
  );
}

const CIVIL_DECISION_CARDS = [
  {
    tag: "이직 고민",
    title: "일반 기업과 이직을 저울질 중이다",
    bullets: [
      "실수령액만 비교하면 공무원연금(9%)과 국민연금(4.5%)의 구조 차이를 놓칩니다",
      "공무원연금은 기여율이 높은 대신 노후 수령액이 더 안정적입니다",
      "정년 보장·연금까지 포함한 장기 관점으로 비교하세요",
    ],
  },
  {
    tag: "승진 대비",
    title: "곧 승진·진급을 앞두고 있다",
    bullets: [
      "호봉과 직급이 동시에 오르면 직급보조비도 함께 바뀝니다",
      "정근수당은 근속연수 구간이 바뀔 때 가산금이 늘어납니다",
      "상세 옵션에서 근속연수를 바꿔가며 인상 체감폭을 미리 확인하세요",
    ],
  },
  {
    tag: "가족 변화",
    title: "결혼·출산 등으로 가족 구성이 바뀐다",
    bullets: [
      "가족수당(배우자 4만·자녀별 5만~12만)이 매월 추가됩니다",
      "부양가족 수가 늘면 소득세 인적공제로 실수령액이 조금 더 늘어납니다",
      "상세 옵션에서 배우자·자녀 수를 넣어 바뀐 실수령액을 확인하세요",
    ],
  },
];

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
      <dt className={muted ? "text-[#7A8296]" : "font-medium text-[#1B2A4A]"}>{label}</dt>
      <dd className={`tabular-nums ${bold ? "font-bold text-[#1B2A4A]" : muted ? "text-[#7A8296]" : "text-[#1B2A4A]"}`}>
        {value}
      </dd>
    </div>
  );
}
