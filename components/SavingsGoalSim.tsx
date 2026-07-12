"use client";

import { useMemo, useState } from "react";
import AdSlot from "@/components/AdSlot";

const won = (n: number) => Math.round(n).toLocaleString("ko-KR") + "원";

export default function SavingsGoalSim() {
  const [income, setIncome] = useState(280); // 만원
  const [fixedCost, setFixedCost] = useState(100);
  const [variableCost, setVariableCost] = useState(80);
  const [goalManwon, setGoalManwon] = useState(10000); // 1억
  const [rate, setRate] = useState(3.0);

  const result = useMemo(() => {
    const inc = income * 10000;
    const fix = fixedCost * 10000;
    const varc = variableCost * 10000;
    const goal = goalManwon * 10000;
    const save = inc - fix - varc;

    if (save <= 0) return { save, months: null, goal, inc, fix, varc };

    // 무이자 기간
    const plainMonths = Math.ceil(goal / save);

    // 월복리 적립 시 기간: save × ((1+r)^n - 1)/r ≥ goal
    const r = rate / 100 / 12;
    let months: number;
    if (r === 0) {
      months = plainMonths;
    } else {
      months = Math.ceil(Math.log((goal * r) / save + 1) / Math.log(1 + r));
    }

    // 이자로 번 돈
    const interestEarned = goal - save * months < 0 ? save * months - goal : 0;
    const totalSaved = save * months;
    const interest = Math.max(0, goal - totalSaved) > 0 ? 0 : totalSaved - goal;

    return {
      save,
      months,
      plainMonths,
      goal,
      inc,
      fix,
      varc,
      saveRate: save / inc,
      interestSaved: plainMonths - months,
      interest,
    };
  }, [income, fixedCost, variableCost, goalManwon, rate]);

  const fmt = (m: number) => {
    const y = Math.floor(m / 12);
    const mo = m % 12;
    return y > 0 ? `${y}년 ${mo}개월` : `${mo}개월`;
  };

  // 월급 구성 비율 바
  const pctFix = result.inc > 0 ? (result.fix / result.inc) * 100 : 0;
  const pctVar = result.inc > 0 ? (result.varc / result.inc) * 100 : 0;
  const pctSave = Math.max(0, 100 - pctFix - pctVar);

  return (
    <div className="space-y-6">
      {/* 입력 */}
      <div className="space-y-4 rounded-xl border border-[rgba(46,68,148,0.14)] bg-white p-5">
        <div className="grid grid-cols-3 gap-3">
          <NumInput label="월 실수령" value={income} onChange={setIncome} hint="만원" />
          <NumInput label="고정비" value={fixedCost} onChange={setFixedCost} hint="월세·통신 등" />
          <NumInput label="변동비" value={variableCost} onChange={setVariableCost} hint="식비·여가 등" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <NumInput
            label="목표 금액"
            value={goalManwon}
            onChange={setGoalManwon}
            hint="1억 = 10000"
            step={500}
          />
          <div className="text-sm font-medium text-[#5B6478]">
            <div className="flex items-center justify-between">
              <span>저축 금리 (연)</span>
              <div className="flex items-center gap-1">
              <input
                type="number"
                min={0}
                max={15}
                step={0.01}
                value={rate}
                onChange={(e) => setRate(Number(e.target.value) || 0)}
                className="w-16 rounded-lg border border-[rgba(46,68,148,0.22)] px-2 py-1 text-right tabular-nums text-[#2E4494]"
              />
              <span className="text-[#2E4494]">%</span>
            </div>
            </div>
            <input
              type="range"
              min={0}
              max={7}
              step={0.01}
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="mt-3 w-full accent-[#2E4494]"
            />
          </div>
        </div>
      </div>

      {/* 월급 구성 시각화 */}
      <div className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-white p-5">
        <p className="mb-3 text-sm font-semibold text-[#1B2A4A]">내 월급 구성</p>
        <div className="flex h-6 w-full overflow-hidden rounded-lg">
          <div className="bg-slate-400" style={{ width: `${pctFix}%` }} />
          <div className="bg-slate-300" style={{ width: `${pctVar}%` }} />
          <div className="bg-[#2E4494]" style={{ width: `${pctSave}%` }} />
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#7A8296]">
          <span>■ 고정비 {won(result.fix)}</span>
          <span className="text-[#8B93A6]">■ 변동비 {won(result.varc)}</span>
          <span className="font-semibold text-[#2E4494]">
            ■ 저축 가능 {won(Math.max(0, result.save))}
          </span>
        </div>
      </div>

      {/* 광고 (입력 아래, 결과 위) */}
      <AdSlot id="calc-savings-goal-mid" />

      {/* 결과 */}
      {result.save <= 0 ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          지출이 수입보다 {won(-result.save)} 많습니다. 고정비나 변동비를
          줄여야 저축이 가능합니다.
        </div>
      ) : (
        result.months !== null && (
          <div className="overflow-hidden rounded-xl border border-[rgba(46,68,148,0.14)]">
            <div className="bg-[#2E4494] px-5 py-5 text-center text-white">
              <p className="text-sm opacity-80">
                목표 {won(result.goal)} 달성까지
              </p>
              <p className="mt-1 text-4xl font-bold">{fmt(result.months!)}</p>
              <p className="mt-2 text-sm opacity-90">
                매월 {won(result.save)} 저축 (저축률{" "}
                {((result.saveRate ?? 0) * 100).toFixed(0)}%)
              </p>
            </div>
            <div className="space-y-1.5 bg-white p-5 text-sm text-[#5B6478]">
              <p>
                · 이자 없이 모으면{" "}
                <strong>{fmt(result.plainMonths!)}</strong> 걸립니다. 연{" "}
                {rate.toFixed(2)}% 저축으로{" "}
                <strong className="text-[#2E4494]">
                  {result.interestSaved}개월 단축
                </strong>
                됩니다.
              </p>
              <p>
                · 변동비를 월 10만 원 줄이면 저축액이{" "}
                {won(result.save + 100000)}이 되어 기간이 더 짧아집니다. 위
                입력값을 바꿔가며 시뮬레이션해 보세요.
              </p>
            </div>
          </div>
        )
      )}

      <p className="text-xs leading-relaxed text-[#8B93A6]">
        ※ 월복리 적립 기준 추정치이며 세금(이자소득세 15.4%)은 반영하지
        않았습니다. 목표 기간은 저축액이 일정하다는 가정이므로 연봉 인상이나
        지출 변화에 따라 달라집니다.
      </p>
    </div>
  );
}

function NumInput({
  label,
  value,
  onChange,
  hint,
  step = 10,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  hint?: string;
  step?: number;
}) {
  return (
    <label className="space-y-1 text-sm font-medium text-[#5B6478]">
      {label}
      <input
        type="text"
        inputMode="numeric"
        value={value === 0 ? "" : value.toLocaleString("ko-KR")}
        onChange={(e) => {
          const n = Number(e.target.value.replace(/[^0-9]/g, "")) || 0;
          onChange(n);
        }}
        className="mt-1 w-full rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-3 py-2.5 tabular-nums"
      />
      {hint && (
        <span className="text-xs font-normal text-[#8B93A6]">{hint}</span>
      )}
    </label>
  );
}
