"use client";

import { useMemo, useState } from "react";
import { monthlyIncomeTax } from "@/lib/incomeTax";
import AdSlot from "@/components/AdSlot";

const won = (n: number) => Math.round(n).toLocaleString("ko-KR") + "원";
const manwon = (n: number) => Math.round(n / 10000).toLocaleString("ko-KR") + "만원";

// 2026 근로자 본인부담 요율 (실수령액 계산기와 동일 로직 재사용)
const PENSION_RATE = 0.045;
const PENSION_BASE_MAX = 6590000;
const HEALTH_RATE = 0.03595;
const LTC_RATE_OF_HEALTH = 0.1314;
const EMPLOYMENT_RATE = 0.009;

function estimateMonthlyNet(annualGross: number, dependents: number): number {
  if (annualGross <= 0) return 0;
  const monthlyGross = annualGross / 12;
  const pension = Math.min(monthlyGross, PENSION_BASE_MAX) * PENSION_RATE;
  const health = monthlyGross * HEALTH_RATE;
  const ltc = health * LTC_RATE_OF_HEALTH;
  const employment = monthlyGross * EMPLOYMENT_RATE;
  const incomeTax = monthlyIncomeTax(monthlyGross, pension, dependents);
  const localTax = Math.floor(incomeTax * 0.1);
  const totalDeduction = pension + health + ltc + employment + incomeTax + localTax;
  return monthlyGross - totalDeduction;
}

// 2026년도 기준 중위소득 (월, 원) - 보건복지부 고시
const MEDIAN_INCOME_2026: Record<number, number> = {
  1: 2564238,
  2: 4199292,
  3: 5359036,
  4: 6494738,
  5: 7556719,
  6: 8555952,
};

// 2024년 가구 평균소득/처분가능소득 (연, 원) - 통계청·한국은행·금융감독원 「가계금융복지조사」(2025.12 발표)
const AVG_HOUSEHOLD_INCOME = 74270000;
const AVG_DISPOSABLE_INCOME = 60320000;
const AVG_INCOME_METRO = 81180000;
const AVG_INCOME_NONMETRO = 67520000;

export default function HouseholdIncomeCalc() {
  const [mySalary, setMySalary] = useState(52000000);
  const [myBonus, setMyBonus] = useState(6000000);
  const [spouseSalary, setSpouseSalary] = useState(28000000);
  const [spouseBonus, setSpouseBonus] = useState(2000000);
  const [otherIncome, setOtherIncome] = useState(3000000);
  const [householdSize, setHouseholdSize] = useState(3);
  const [dependents, setDependents] = useState(0);

  const result = useMemo(() => {
    const myAnnual = mySalary + myBonus;
    const spouseAnnual = spouseSalary + spouseBonus;
    const annualTotal = myAnnual + spouseAnnual + otherIncome;

    const monthlyTotal = annualTotal / 12;

    // 실수령 추정: 본인·배우자 각각 개별 근로소득자로 계산 후 합산 (기타소득은 비과세로 단순화)
    const myNet = estimateMonthlyNet(myAnnual, dependents);
    const spouseNet = spouseAnnual > 0 ? estimateMonthlyNet(spouseAnnual, 0) : 0;
    const monthlyNetEstimate = myNet + spouseNet + otherIncome / 12;
    const annualNetEstimate = monthlyNetEstimate * 12;

    const vsAvgIncome = annualTotal / AVG_HOUSEHOLD_INCOME;
    const medianIncome = MEDIAN_INCOME_2026[Math.min(householdSize, 6)];
    const vsMedian = monthlyTotal / medianIncome;

    return {
      myAnnual,
      spouseAnnual,
      annualTotal,
      monthlyTotal,
      monthlyNetEstimate,
      annualNetEstimate,
      vsAvgIncome,
      medianIncome,
      vsMedian,
    };
  }, [mySalary, myBonus, spouseSalary, spouseBonus, otherIncome, householdSize, dependents]);

  return (
    <div className="mx-auto max-w-[1280px] px-4">
      <AdSlot id="calc-household-income-mid" />

      <div className="grid gap-6 lg:grid-cols-[380px_1fr] lg:items-start">
        {/* ═══ 왼쪽: 입력 ═══ */}
        <div className="space-y-4">
          <div className="space-y-4 rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#2E4494]">본인 소득</p>
              <p className="mt-1 text-xs text-[#8B93A6]">세전 기준으로 입력합니다</p>
            </div>
            <MoneyField label="본인 연봉(세전)" value={mySalary} onChange={setMySalary} />
            <MoneyField label="본인 성과급(세전)" value={myBonus} onChange={setMyBonus} />
          </div>

          <div className="space-y-4 rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#2E4494]">배우자 소득</p>
              <p className="mt-1 text-xs text-[#8B93A6]">외벌이라면 0으로 두세요</p>
            </div>
            <MoneyField label="배우자 연봉(세전)" value={spouseSalary} onChange={setSpouseSalary} />
            <MoneyField label="배우자 성과급(세전)" value={spouseBonus} onChange={setSpouseBonus} />
          </div>

          <div className="space-y-4 rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#2E4494]">공통 입력</p>
            <MoneyField
              label="기타 연 보상"
              value={otherIncome}
              onChange={setOtherIncome}
              hint="프리랜서 수입, 임대수입, 기타 보너스 등"
            />
            <label className="block">
              <span className="text-sm font-medium text-[#5B6478]">가구원 수</span>
              <select
                value={householdSize}
                onChange={(e) => setHouseholdSize(Number(e.target.value))}
                className="mt-1.5 w-full rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-3 py-3"
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n}인{n === 6 ? " 이상" : ""}
                  </option>
                ))}
              </select>
              <span className="mt-1 block text-xs font-normal text-[#8B93A6]">
                기준 중위소득 비교선을 정하는 데 사용됩니다
              </span>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[#5B6478]">부양가족 수 (본인 기준)</span>
              <input
                type="number"
                min={0}
                max={10}
                value={dependents === 0 ? "" : dependents}
                onChange={(e) => setDependents(Number(e.target.value) || 0)}
                className="mt-1.5 w-full rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-3 py-3"
              />
              <span className="mt-1 block text-xs font-normal text-[#8B93A6]">
                실수령 추정 시 소득세 인적공제에 반영 (본인 명의로 가정)
              </span>
            </label>
          </div>
        </div>

        {/* ═══ 오른쪽: 결과 (sticky) ═══ */}
        <div className="space-y-5 lg:sticky lg:top-20">
          {/* 핵심 카드 */}
          <div className="overflow-hidden rounded-xl border border-[rgba(46,68,148,0.14)]">
            <div className="bg-[#2E4494] px-5 py-4 text-white">
              <p className="text-sm opacity-80">가구 연 총소득 (세전)</p>
              <p className="text-3xl font-bold tabular-nums">{won(result.annualTotal)}</p>
              <p className="mt-1 text-sm opacity-90">월 체감 {won(result.monthlyTotal)}</p>
            </div>
            <dl className="divide-y divide-[rgba(46,68,148,0.10)] bg-white text-sm">
              <Row label="본인 소득 합계" value={won(result.myAnnual)} />
              {result.spouseAnnual > 0 && <Row label="배우자 소득 합계" value={won(result.spouseAnnual)} />}
              {otherIncome > 0 && <Row label="기타 보상" value={won(otherIncome)} muted />}
              <Row label="가구 연 총소득" value={won(result.annualTotal)} bold />
              <Row label="가구 월 실수령 추정" value={won(result.monthlyNetEstimate)} accent />
              <Row label="가구 연 실수령 추정" value={won(result.annualNetEstimate)} muted />
            </dl>
          </div>

          {/* 평균·중위 대비 위치 */}
          <div className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.06)] p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#2E4494]">소득 위치</p>
            <p className="mt-1 text-lg font-bold text-[#1B2A4A]">
              평균 가구소득 대비 {(result.vsAvgIncome * 100).toFixed(0)}%
            </p>
            <p className="mt-1 text-sm leading-relaxed text-[#5B6478]">
              2024년 전국 가구 평균소득은 <strong className="tabular-nums">{manwon(AVG_HOUSEHOLD_INCOME)}</strong>
              입니다. 입력한 가구소득은 이 평균의{" "}
              <strong className="tabular-nums">{result.vsAvgIncome.toFixed(2)}배</strong>입니다.
            </p>
            <p className="mt-1 text-sm leading-relaxed text-[#5B6478]">
              {householdSize}인 가구 기준 중위소득(월 {manwon(result.medianIncome)})과 비교하면{" "}
              <strong className="tabular-nums">{(result.vsMedian * 100).toFixed(0)}%</strong> 수준입니다.
            </p>
            <p className="mt-2 text-xs text-[#8B93A6]">
              통계청·한국은행·금융감독원 「2025년 가계금융복지조사」(2024년 소득 기준), 보건복지부 2026년도
              기준 중위소득 고시
            </p>
          </div>

          {/* 소득 구성 (도넛차트) */}
          <div className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-white p-5">
            <p className="mb-4 font-semibold text-[#1B2A4A]">가구 소득 구성</p>
            <IncomeDonut
              segments={[
                { label: "본인 소득", value: result.myAnnual, color: "#2E4494" },
                { label: "배우자 소득", value: result.spouseAnnual, color: "#738BE7" },
                { label: "기타 보상", value: otherIncome, color: "#BFC8EA" },
              ]}
            />
          </div>

          {/* 월 소득 위치 비교 (차트) */}
          <div className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-white p-5">
            <p className="font-semibold text-[#1B2A4A]">월 소득 위치 비교</p>
            <PositionBarChart
              bars={[
                { label: "우리 가구", value: result.monthlyTotal, highlight: true },
                { label: `${householdSize}인 중위소득`, value: result.medianIncome },
                { label: "평균 가구소득", value: AVG_HOUSEHOLD_INCOME / 12 },
              ]}
            />
          </div>

          {/* 비교 기준 데이터 */}
          <div className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-white p-5 text-sm">
            <p className="mb-3 font-semibold text-[#1B2A4A]">비교 기준 데이터</p>
            <dl className="space-y-2 text-[#5B6478]">
              <div className="flex justify-between">
                <dt>2024 평균 가구소득</dt>
                <dd className="tabular-nums font-medium text-[#1B2A4A]">{manwon(AVG_HOUSEHOLD_INCOME)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>2024 평균 처분가능소득</dt>
                <dd className="tabular-nums font-medium text-[#1B2A4A]">{manwon(AVG_DISPOSABLE_INCOME)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>수도권 평균소득</dt>
                <dd className="tabular-nums font-medium text-[#1B2A4A]">{manwon(AVG_INCOME_METRO)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>비수도권 평균소득</dt>
                <dd className="tabular-nums font-medium text-[#1B2A4A]">{manwon(AVG_INCOME_NONMETRO)}</dd>
              </div>
              <div className="mt-1 border-t border-[rgba(46,68,148,0.10)] pt-2" />
              {Object.entries(MEDIAN_INCOME_2026).map(([n, v]) => (
                <div key={n} className="flex justify-between">
                  <dt>{n}인 기준 중위소득(월)</dt>
                  <dd className="tabular-nums font-medium text-[#1B2A4A]">{manwon(v)}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* 판단 보조 */}
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#2E4494]">판단 보조</p>
              <p className="mt-0.5 text-base font-bold text-[#1B2A4A]">이런 상황이면 이렇게 보세요</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {HOUSEHOLD_DECISION_CARDS.map((card) => (
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
        </div>
      </div>

      <p className="mt-6 text-xs leading-relaxed text-[#8B93A6]">
        ※ 참고용 추정치입니다. 실수령 추정은 본인·배우자를 각각 개별 근로소득자로 가정해 4대보험·소득세를
        계산한 뒤 합산한 것으로, 기타 보상(임대·프리랜서 소득 등)은 비과세로 단순화했습니다. 실제 세금은
        소득 종류·회사별 공제 항목·연말정산 결과에 따라 달라질 수 있습니다.
      </p>
    </div>
  );
}

const HOUSEHOLD_DECISION_CARDS = [
  {
    tag: "정책 지원 확인",
    title: "청년 주택·신혼부부 임대 등을 신청하려 한다",
    bullets: [
      "대부분의 정책 지원은 기준 중위소득의 몇 % 이하인지로 자격을 판단합니다",
      "위 '기준 중위소득 대비' 수치가 120%, 150% 등 정책 기준선에 가까운지 확인하세요",
      "가구원 수를 실제 주민등록 기준과 동일하게 넣어야 정확합니다",
    ],
  },
  {
    tag: "외벌이 vs 맞벌이",
    title: "맞벌이 전환을 고민 중이다",
    bullets: [
      "배우자 소득을 0으로 두고 먼저 계산한 뒤, 예상 소득을 넣어 차이를 비교해보세요",
      "맞벌이는 가구 소득세 부담이 늘 수 있지만, 가구 총소득 자체는 커집니다",
      "보육비·돌봄 비용 등 맞벌이로 인한 추가 지출도 함께 고려하세요",
    ],
  },
  {
    tag: "평균보다 높은데 체감 안 됨",
    title: "평균보다 높게 나오는데 여유가 없다",
    bullets: [
      "평균은 고소득 가구의 영향을 크게 받아 체감보다 높게 형성되는 경향이 있습니다",
      "처분가능소득(비소비지출 제외)이나 기준 중위소득과 비교하는 것이 더 현실적입니다",
      "실수령 추정치와 실제 지출을 비교해 저축 여력을 다시 점검해보세요",
    ],
  },
];

// 소득 구성 도넛차트
function IncomeDonut({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const visible = segments.filter((s) => s.value > 0);
  const R = 70;
  const CX = 100;
  const CY = 100;
  const STROKE = 32;
  const circumference = 2 * Math.PI * R;

  let offset = 0;
  const arcs = visible.map((s) => {
    const frac = total > 0 ? s.value / total : 0;
    const dash = frac * circumference;
    const arc = { ...s, dash, offset };
    offset += dash;
    return arc;
  });

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
      <svg viewBox="0 0 200 200" className="h-40 w-40 shrink-0">
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#EEF0F4" strokeWidth={STROKE} />
        {arcs.map((a) => (
          <circle
            key={a.label}
            cx={CX}
            cy={CY}
            r={R}
            fill="none"
            stroke={a.color}
            strokeWidth={STROKE}
            strokeDasharray={`${a.dash} ${circumference - a.dash}`}
            strokeDashoffset={-a.offset}
            transform={`rotate(-90 ${CX} ${CY})`}
            strokeLinecap={arcs.length === 1 ? "butt" : "butt"}
          />
        ))}
        <text x={CX} y={CY - 6} textAnchor="middle" fontSize="12" fill="#8B93A6">
          합계
        </text>
        <text x={CX} y={CY + 16} textAnchor="middle" fontSize="16" fontWeight="700" fill="#1B2A4A">
          {manwon(total)}
        </text>
      </svg>
      <div className="w-full space-y-2 text-sm">
        {visible.map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: s.color }} />
            <span className="text-[#5B6478]">{s.label}</span>
            <span className="ml-auto shrink-0 tabular-nums font-medium text-[#1B2A4A]">
              {total > 0 ? ((s.value / total) * 100).toFixed(0) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 월 소득 위치 비교 막대그래프
function PositionBarChart({ bars }: { bars: { label: string; value: number; highlight?: boolean }[] }) {
  const W = 400;
  const H = 220;
  const padTop = 34;
  const padBottom = 34;
  const padSide = 16;
  const max = Math.max(...bars.map((b) => b.value)) * 1.15;
  const gap = 20;
  const barWidth = (W - padSide * 2 - gap * (bars.length - 1)) / bars.length;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 w-full">
      <line
        x1={padSide}
        y1={H - padBottom}
        x2={W - padSide}
        y2={H - padBottom}
        stroke="rgba(46,68,148,0.16)"
      />
      {bars.map((b, i) => {
        const barH = ((H - padTop - padBottom) * b.value) / max;
        const x = padSide + i * (barWidth + gap);
        const y = H - padBottom - barH;
        const color = b.highlight ? "#2E4494" : "#BFC8EA";
        return (
          <g key={b.label}>
            <rect x={x} y={y} width={barWidth} height={Math.max(barH, 1)} rx={6} fill={color} />
            <text
              x={x + barWidth / 2}
              y={y - 10}
              textAnchor="middle"
              fontSize="12"
              fontWeight="700"
              fill={b.highlight ? "#2E4494" : "#5B6478"}
            >
              {manwon(b.value)}
            </text>
            <text x={x + barWidth / 2} y={H - padBottom + 18} textAnchor="middle" fontSize="11" fill="#7A8296">
              {b.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function MoneyField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  hint?: string;
}) {
  return (
    <label className="block text-sm font-medium text-[#5B6478]">
      {label}
      <input
        type="text"
        inputMode="numeric"
        value={value === 0 ? "" : value.toLocaleString("ko-KR")}
        onChange={(e) => onChange(Number(e.target.value.replace(/[^0-9]/g, "")) || 0)}
        className="mt-1.5 w-full rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-3 py-3 text-right tabular-nums"
      />
      {hint && <span className="mt-1 block text-xs font-normal text-[#8B93A6]">{hint}</span>}
    </label>
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
      <dt className={muted ? "text-[#7A8296]" : "font-medium text-[#1B2A4A]"}>{label}</dt>
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
