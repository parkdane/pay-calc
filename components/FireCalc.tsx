"use client";

import { useMemo, useState } from "react";
import AdSlot from "@/components/AdSlot";

const won = (n: number) => Math.round(n).toLocaleString("ko-KR") + "원";
const eok = (n: number) => {
  const e = n / 100000000;
  if (e >= 1) return `${e.toFixed(1)}억원`;
  return Math.round(n / 10000).toLocaleString("ko-KR") + "만원";
};

// 생활비 프리셋 (만원)
const EXPENSE_PRESETS = [
  { id: "lean", label: "Lean FIRE", value: 180, desc: "절제형" },
  { id: "single", label: "1인 기본", value: 250, desc: "1인 가구" },
  { id: "couple", label: "2인 기본", value: 320, desc: "부부" },
  { id: "family", label: "3~4인", value: 450, desc: "자녀 있음" },
  { id: "rich", label: "여유형", value: 600, desc: "여행·취미" },
];

// 수익률 참고 (연 %)
const RETURN_PRESETS = [
  { label: "채권 수준", value: 4 },
  { label: "S&P500", value: 10 },
  { label: "나스닥", value: 12 },
];

export default function FireCalc() {
  const [age, setAge] = useState(35);
  const [retireAge, setRetireAge] = useState(50);
  const [asset, setAsset] = useState(18000); // 만원
  const [monthlySave, setMonthlySave] = useState(150); // 만원
  const [monthlyExpense, setMonthlyExpense] = useState(300); // 만원
  const [returnRate, setReturnRate] = useState(7);
  const [inflation, setInflation] = useState(2.5);
  const [withdrawRate, setWithdrawRate] = useState(4);
  const [sideIncome, setSideIncome] = useState(0); // 월 부수입 만원
  const [pension, setPension] = useState(0); // 월 연금 만원

  const r = useMemo(() => {
    // 순 필요 생활비 = 생활비 - 부수입 - 연금 (연 단위)
    const netMonthly = Math.max(0, monthlyExpense - sideIncome - pension);
    const annualExpense = netMonthly * 10000 * 12;
    const fireNumber = annualExpense / (withdrawRate / 100);

    // 실질 수익률
    const realReturn = (1 + returnRate / 100) / (1 + inflation / 100) - 1;
    const mRet = realReturn / 12;
    const save = monthlySave * 10000;

    // 자산 성장 시뮬 (월 단위), 차트용 연도별 포인트도 수집
    let cur = asset * 10000;
    let months = 0;
    const maxMonths = 12 * 70;
    const growthPath: { age: number; asset: number; target: number }[] = [];
    let target = fireNumber;
    const targetMonthlyGrowth = Math.pow(1 + inflation / 100, 1 / 12);

    const already = cur >= fireNumber;
    while (cur < target && months < maxMonths) {
      cur = cur * (1 + mRet) + save;
      target = target * targetMonthlyGrowth;
      months++;
      if (months % 12 === 0) {
        growthPath.push({ age: age + months / 12, asset: cur, target });
      }
    }
    if (growthPath.length === 0) {
      growthPath.push({ age, asset: asset * 10000, target: fireNumber });
    }

    const reached = cur >= target && months < maxMonths;
    const reachAge = reached ? age + months / 12 : null;

    // 추가 필요 월 투자금: 목표 은퇴나이까지 목표 달성하려면? (이분탐색)
    let extraSave: number | null = null;
    if (retireAge > age) {
      const targetMonths = (retireAge - age) * 12;
      let lo = 0,
        hi = 50000000; // 월 최대 5천만
      for (let iter = 0; iter < 40; iter++) {
        const mid = (lo + hi) / 2;
        let c = asset * 10000;
        let t = fireNumber;
        for (let m = 0; m < targetMonths; m++) {
          c = c * (1 + mRet) + mid;
          t = t * targetMonthlyGrowth;
        }
        if (c >= t) hi = mid;
        else lo = mid;
      }
      extraSave = hi;
    }

    // 은퇴 후 월 인출 가능액 = 목표자산 × 인출률 / 12
    const monthlyWithdraw = (fireNumber * (withdrawRate / 100)) / 12;

    // FIRE 유형 판정
    let fireType = "일반 FIRE";
    if (monthlyExpense <= 200) fireType = "Lean FIRE (절제형)";
    else if (monthlyExpense >= 500) fireType = "Fat FIRE (여유형)";

    // 자산 소진 나이: 은퇴 후 인출하면서 자산이 0 되는 시점
    let depletionAge: number | null = null;
    if (reached || retireAge > age) {
      const startAge = reachAge ?? retireAge;
      let c = fireNumber;
      const monthlyExp = netMonthly * 10000;
      let m = 0;
      const cap = 12 * 60;
      while (c > 0 && m < cap) {
        c = c * (1 + mRet) - monthlyExp;
        m++;
      }
      depletionAge = m >= cap ? null : startAge + m / 12; // null = 소진 안 됨(영구 유지)
    }

    return {
      fireNumber,
      months: already ? 0 : reached ? months : null,
      reachAge: already ? age : reachAge,
      already,
      realReturn,
      extraSave,
      monthlyWithdraw,
      fireType,
      depletionAge,
      annualExpense,
      growthPath,
    };
  }, [
    age, retireAge, asset, monthlySave, monthlyExpense,
    returnRate, inflation, withdrawRate, sideIncome, pension,
  ]);

  const fmtDuration = (m: number) => {
    const y = Math.floor(m / 12);
    const mo = m % 12;
    return y > 0 ? `${y}년 ${mo}개월` : `${mo}개월`;
  };

  // 시나리오 비교 (보수 5% / 기본 7% / 공격 9%)
  const scenarios = useMemo(() => {
    return [5, 7, 9].map((rate) => {
      const netMonthly = Math.max(0, monthlyExpense - sideIncome - pension);
      const fireNum = (netMonthly * 10000 * 12) / (withdrawRate / 100);
      const realR = (1 + rate / 100) / (1 + inflation / 100) - 1;
      const mRet = realR / 12;
      const targetGrowth = Math.pow(1 + inflation / 100, 1 / 12);
      let cur = asset * 10000;
      let target = fireNum;
      let months = 0;
      const max = 12 * 70;
      while (cur < target && months < max) {
        cur = cur * (1 + mRet) + monthlySave * 10000;
        target = target * targetGrowth;
        months++;
      }
      return {
        rate,
        label: rate === 5 ? "보수적" : rate === 7 ? "기본" : "공격적",
        reachAge: months < max ? age + Math.floor(months / 12) : null,
        fireNum,
      };
    });
  }, [age, asset, monthlySave, monthlyExpense, inflation, withdrawRate, sideIncome, pension]);

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
      {/* ═══ 왼쪽: 입력 ═══ */}
      <div className="space-y-4">
      {/* ── 기본 입력 ── */}
      <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-5">
        <p className="text-sm font-semibold text-slate-800">은퇴 목표와 자산</p>
        <div className="grid grid-cols-2 gap-4">
          <Field label="현재 나이" value={age} onChange={setAge} suffix="세" />
          <Field label="목표 은퇴 나이" value={retireAge} onChange={setRetireAge} suffix="세" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="현재 순자산" value={asset} onChange={setAsset} suffix="만원" />
          <Field label="월 투자 가능액" value={monthlySave} onChange={setMonthlySave} suffix="만원" />
        </div>
      </div>

      {/* ── 생활비 + 프리셋 ── */}
      <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-5">
        <p className="text-sm font-semibold text-slate-800">은퇴 후 월 생활비</p>
        <Field label="" value={monthlyExpense} onChange={setMonthlyExpense} suffix="만원" />
        <div className="flex flex-wrap gap-2">
          {EXPENSE_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => setMonthlyExpense(p.value)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                monthlyExpense === p.value
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-slate-300 bg-white text-slate-600 hover:border-blue-300"
              }`}
            >
              {p.label} <span className="text-slate-400">{p.value}만</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── 가정 옵션 ── */}
      <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-5">
        <p className="text-sm font-semibold text-slate-800">수익률·인출률 조정</p>
        <div>
          <Slider label="기대 연수익률" value={returnRate} onChange={setReturnRate} min={1} max={15} step={0.5} />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {RETURN_PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => setReturnRate(p.value)}
                className="rounded-md bg-white border border-slate-200 px-2 py-1 text-xs text-slate-500 hover:border-blue-300"
              >
                {p.label} {p.value}%
              </button>
            ))}
          </div>
          {returnRate > 15 && (
            <p className="mt-2 text-xs text-amber-600">
              ⚠ 15% 초과는 투자의 대가도 달성하기 어려운 수준입니다. 참고용으로만.
            </p>
          )}
        </div>
        <Slider label="물가상승률" value={inflation} onChange={setInflation} min={0} max={6} step={0.1} />
        <Slider label="안전인출률" value={withdrawRate} onChange={setWithdrawRate} min={2.5} max={5} step={0.5} />
        <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-4">
          <Field label="월 부수입" value={sideIncome} onChange={setSideIncome} suffix="만원" />
          <Field label="월 연금 예상액" value={pension} onChange={setPension} suffix="만원" />
        </div>
      </div>

      </div>
      {/* ═══ 왼쪽 입력 끝 ═══ */}

      {/* ═══ 오른쪽: 결과 (데스크톱에서 스크롤 따라옴) ═══ */}
      <div className="space-y-6 lg:sticky lg:top-20">
      {/* ── 결과 카드 ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <ResultCard
          highlight
          label="FIRE 목표 자산"
          value={eok(r.fireNumber)}
        />
        <ResultCard
          highlight
          label="예상 달성 시점"
          value={
            r.already ? "달성 완료" : r.months !== null ? `${Math.round(r.reachAge!)}세` : "70년+"
          }
          sub={r.months ? fmtDuration(r.months) + " 후" : undefined}
        />
        <ResultCard
          label="은퇴 후 월 인출액"
          value={won(r.monthlyWithdraw)}
        />
        <ResultCard
          label="추가 필요 월 투자금"
          value={r.extraSave !== null ? won(r.extraSave) : "-"}
          sub={r.extraSave !== null ? `${retireAge}세 은퇴 목표 시` : undefined}
        />
        <ResultCard
          label="자산 소진 나이"
          value={r.depletionAge === null ? "영구 유지" : `${Math.round(r.depletionAge)}세`}
        />
        <ResultCard label="FIRE 유형" value={r.fireType} />
      </div>

      {/* ── 자산 성장 차트 (SVG) ── */}
      <GrowthChart path={r.growthPath} currentAge={age} />

      {/* ── 시나리오 비교표 ── */}
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <div className="border-b border-slate-100 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-800">
          시나리오 비교 (수익률별 달성 나이)
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-500">
              <th className="px-4 py-2 text-left font-medium">시나리오</th>
              <th className="px-4 py-2 text-right font-medium">수익률</th>
              <th className="px-4 py-2 text-right font-medium">달성 나이</th>
            </tr>
          </thead>
          <tbody>
            {scenarios.map((s) => (
              <tr key={s.rate} className="border-t border-slate-100">
                <td className="px-4 py-2 font-medium text-slate-800">{s.label}</td>
                <td className="px-4 py-2 text-right tabular-nums text-slate-600">연 {s.rate}%</td>
                <td className="px-4 py-2 text-right tabular-nums font-semibold text-blue-700">
                  {s.reachAge ? `${s.reachAge}세` : "70년+"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
      {/* ═══ 오른쪽 결과 끝 ═══ */}

      {/* ── 하단 전체 폭: 설명·면책·광고 ── */}
      <div className="space-y-6 lg:col-span-2">
      <section className="space-y-1.5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
        <p className="font-semibold text-slate-800">파이어 넘버란?</p>
        <p>
          은퇴 후 연 지출의 25배(4% 룰 기준)를 모으면, 자산을 원금 손실 없이
          매년 인출하며 살 수 있다는 개념입니다. 인출률을 낮출수록 안전하지만
          목표 금액이 커집니다. 국민연금·배당 등 반복 수입은 월 부수입·연금에
          넣으면 목표 자산이 줄어듭니다.
        </p>
      </section>

      <p className="text-xs leading-relaxed text-slate-400">
        ※ 물가를 반영한 실질 수익률 기준 추정치입니다. 실제 수익률은 매년
        변동하며 세금·건강보험료는 반영하지 않았습니다. 보수적 수익률(5~7%)로
        함께 비교하는 것이 안전합니다.
      </p>

      <AdSlot id="calc-fire-bottom" />
      </div>
    </div>
  );
}

// ── SVG 자산 성장 차트 ──
function GrowthChart({
  path,
  currentAge,
}: {
  path: { age: number; asset: number; target: number }[];
  currentAge: number;
}) {
  if (path.length < 2) return null;
  const W = 600, H = 220, pad = 40;
  const maxVal = Math.max(...path.map((p) => Math.max(p.asset, p.target)));
  const minAge = currentAge;
  const maxAge = path[path.length - 1].age;
  const x = (a: number) => pad + ((a - minAge) / (maxAge - minAge)) * (W - pad * 2);
  const y = (v: number) => H - pad - (v / maxVal) * (H - pad * 2);

  const line = (key: "asset" | "target") =>
    path.map((p, i) => `${i === 0 ? "M" : "L"} ${x(p.age).toFixed(1)} ${y(p[key]).toFixed(1)}`).join(" ");

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="mb-2 text-sm font-semibold text-slate-800">자산 성장 시뮬레이션</p>
      <p className="mb-3 text-xs text-slate-400">
        <span className="text-blue-600">■</span> 내 예상 자산 &nbsp;
        <span className="text-amber-500">■</span> 필요 목표 자산(물가 반영)
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#e2e8f0" />
        <line x1={pad} y1={pad} x2={pad} y2={H - pad} stroke="#e2e8f0" />
        <path d={line("target")} fill="none" stroke="#f59e0b" strokeWidth="2" />
        <path d={line("asset")} fill="none" stroke="#2563eb" strokeWidth="2.5" />
        <text x={pad} y={H - pad + 16} fontSize="10" fill="#94a3b8">{Math.round(minAge)}세</text>
        <text x={W - pad} y={H - pad + 16} fontSize="10" fill="#94a3b8" textAnchor="end">{Math.round(maxAge)}세</text>
      </svg>
    </div>
  );
}

function ResultCard({
  label, value, sub, highlight,
}: {
  label: string; value: string; sub?: string; highlight?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-4 ${highlight ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-white"}`}>
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`mt-1 font-bold tabular-nums ${highlight ? "text-lg text-blue-700" : "text-base text-slate-900"}`}>
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

function Field({
  label, value, onChange, suffix,
}: {
  label: string; value: number; onChange: (n: number) => void; suffix?: string;
}) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <div className={`flex items-center gap-1 ${label ? "mt-1" : ""}`}>
        <input
          type="text"
          inputMode="numeric"
          value={value === 0 ? "" : value.toLocaleString("ko-KR")}
          onChange={(e) => onChange(Number(e.target.value.replace(/[^0-9]/g, "")) || 0)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-right tabular-nums"
        />
        {suffix && <span className="shrink-0 text-sm text-slate-400">{suffix}</span>}
      </div>
    </label>
  );
}

function Slider({
  label, value, onChange, min, max, step,
}: {
  label: string; value: number; onChange: (n: number) => void; min: number; max: number; step: number;
}) {
  return (
    <div className="text-sm font-medium text-slate-700">
      <div className="flex items-center justify-between">
        <span>{label}</span>
        <div className="flex items-center gap-1">
          <input
            type="number" min={min} max={max} step={step} value={value}
            onChange={(e) => onChange(Number(e.target.value) || 0)}
            className="w-16 rounded-lg border border-slate-300 px-2 py-1 text-right tabular-nums text-blue-700"
          />
          <span className="text-blue-700">%</span>
        </div>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-blue-700"
      />
    </div>
  );
}
