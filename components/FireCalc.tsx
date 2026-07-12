"use client";

import { useMemo, useState } from "react";
import AdSlot from "@/components/AdSlot";

const won = (n: number) => Math.round(n).toLocaleString("ko-KR") + "원";
const eokFull = (n: number) => {
  const eok = Math.floor(n / 100000000);
  const man = Math.round((n % 100000000) / 10000);
  if (eok >= 1) return `${eok}억 ${man.toLocaleString("ko-KR")}만원`;
  return man.toLocaleString("ko-KR") + "만원";
};

const EXPENSE_PRESETS = [
  { id: "lean", label: "Lean FIRE", value: 180 },
  { id: "single", label: "1인 기본", value: 250 },
  { id: "couple", label: "2인 기본", value: 320 },
  { id: "family", label: "3~4인", value: 450 },
  { id: "rich", label: "여유형", value: 600 },
];

const RETURN_PRESETS = [
  { label: "채권 수준", value: 4 },
  { label: "S&P500", value: 10 },
  { label: "나스닥", value: 12 },
];

// CAGR 참고 (과거 장기 연평균, 참고용)
const CAGR_TABLE = [
  { name: "예금·채권", cagr: 4, note: "안전자산" },
  { name: "S&P500", cagr: 10, note: "미국 대형주 지수" },
  { name: "나스닥100", cagr: 13, note: "기술주 중심" },
  { name: "워런 버핏", cagr: 20, note: "재현 매우 어려움" },
  { name: "피터 린치", cagr: 29, note: "역대 최고 수준" },
];

export default function FireCalc() {
  const [age, setAge] = useState(35);
  const [retireAge, setRetireAge] = useState(50);
  const [asset, setAsset] = useState(18000);
  const [monthlySave, setMonthlySave] = useState(150);
  const [monthlyExpense, setMonthlyExpense] = useState(300);
  const [returnRate, setReturnRate] = useState(7);
  const [inflation, setInflation] = useState(2.5);
  const [withdrawRate, setWithdrawRate] = useState(4);
  const [sideIncome, setSideIncome] = useState(0);
  const [pension, setPension] = useState(0);

  const r = useMemo(() => {
    const netMonthly = Math.max(0, monthlyExpense - sideIncome - pension);
    const annualExpense = netMonthly * 10000 * 12;
    const fireNumber = annualExpense / (withdrawRate / 100);
    const realReturn = (1 + returnRate / 100) / (1 + inflation / 100) - 1;
    const mRet = realReturn / 12;
    const save = monthlySave * 10000;
    const targetGrowth = Math.pow(1 + inflation / 100, 1 / 12);

    const startAsset = asset * 10000;
    const already = startAsset >= fireNumber;
    const maxMonths = 12 * 70;

    // 1) 달성 시점 계산 (통계용)
    let cur = startAsset;
    let target = fireNumber;
    let months = 0;
    if (!already) {
      while (cur < target && months < maxMonths) {
        cur = cur * (1 + mRet) + save;
        target = target * targetGrowth;
        months++;
      }
    }
    const reached = already || (cur >= target && months < maxMonths);
    const reachAge = already ? age : reached ? age + months / 12 : null;
    const reachMonths = already ? 0 : reached ? months : null;

    // 2) 차트용 경로: 달성 시점(또는 70년 한도) 이후 10년을 더 이어서 추세를 보여줌
    const path: { age: number; asset: number; target: number }[] = [
      { age, asset: startAsset, target: fireNumber },
    ];
    {
      let c = startAsset,
        t = fireNumber,
        m = 0;
      const cap = reached ? Math.min(months + 12 * 10, maxMonths) : maxMonths;
      while (m < cap) {
        c = c * (1 + mRet) + save;
        t = t * targetGrowth;
        m++;
        if (m % 12 === 0) path.push({ age: age + m / 12, asset: c, target: t });
      }
    }

    // 목표 은퇴나이까지 필요한 월 투자금 (이분탐색)
    let extraSave: number | null = null;
    let shortfall: number | null = null;
    if (retireAge > age) {
      const tM = (retireAge - age) * 12;
      let tgt = fireNumber;
      for (let m = 0; m < tM; m++) tgt = tgt * targetGrowth;
      let projected = startAsset;
      for (let m = 0; m < tM; m++) projected = projected * (1 + mRet) + save;
      shortfall = Math.max(0, tgt - projected);

      let lo = 0,
        hi = 50000000;
      for (let it = 0; it < 40; it++) {
        const mid = (lo + hi) / 2;
        let c = startAsset,
          t = fireNumber;
        for (let m = 0; m < tM; m++) {
          c = c * (1 + mRet) + mid;
          t = t * targetGrowth;
        }
        if (c >= t) hi = mid;
        else lo = mid;
      }
      extraSave = Math.max(0, hi - save);
    }

    const monthlyWithdraw = (fireNumber * (withdrawRate / 100)) / 12;

    let fireType = "Regular FIRE";
    let fireTypeDesc = "일반적인 생활비 기준의 표준 시나리오입니다.";
    if (monthlyExpense <= 200) {
      fireType = "Lean FIRE";
      fireTypeDesc = "지출을 단단히 줄인 절제형 시나리오입니다.";
    } else if (monthlyExpense >= 500) {
      fireType = "Fat FIRE";
      fireTypeDesc = "여행·취미 여유가 있는 풍족형 시나리오입니다.";
    }

    // 자산 소진 나이
    let depletionAge: number | null = null;
    if (reachAge !== null) {
      let c = fireNumber;
      const exp = netMonthly * 10000;
      let m = 0;
      const cap = 12 * 60;
      while (c > 0 && m < cap) {
        c = c * (1 + mRet) - exp;
        m++;
      }
      depletionAge = m >= cap ? null : reachAge + m / 12;
    }

    return {
      fireNumber,
      months: reachMonths,
      reachAge,
      already,
      realReturn,
      extraSave,
      shortfall,
      monthlyWithdraw,
      fireType,
      fireTypeDesc,
      depletionAge,
      annualExpense,
      netMonthly,
      path,
    };
  }, [age, retireAge, asset, monthlySave, monthlyExpense, returnRate, inflation, withdrawRate, sideIncome, pension]);

  const scenarios = useMemo(() => {
    return [5, 7, 9].map((rate) => {
      const netMonthly = Math.max(0, monthlyExpense - sideIncome - pension);
      const fireNum = (netMonthly * 10000 * 12) / (withdrawRate / 100);
      const realR = (1 + rate / 100) / (1 + inflation / 100) - 1;
      const mRet = realR / 12;
      const tg = Math.pow(1 + inflation / 100, 1 / 12);
      let cur = asset * 10000,
        target = fireNum,
        months = 0;
      const max = 12 * 70;
      while (cur < target && months < max) {
        cur = cur * (1 + mRet) + monthlySave * 10000;
        target = target * tg;
        months++;
      }
      return {
        rate,
        label: rate === 5 ? "보수적" : rate === 7 ? "기본" : "공격적",
        reachAge: months < max ? age + Math.floor(months / 12) : null,
      };
    });
  }, [age, asset, monthlySave, monthlyExpense, inflation, withdrawRate, sideIncome, pension]);

  const fmtDur = (m: number) => {
    const y = Math.floor(m / 12),
      mo = m % 12;
    return y > 0 ? `${y}년 ${mo}개월` : `${mo}개월`;
  };

  // 한줄 요약
  const summary = r.already
    ? `현재 자산이 이미 목표 ${eokFull(r.fireNumber)}를 넘어 FIRE 달성 상태입니다.`
    : r.reachAge !== null
    ? `현재 조건이라면 약 ${r.reachAge.toFixed(1)}세 전후 FIRE 가능성이 보입니다.` +
      (r.shortfall && r.shortfall > 0
        ? ` ${retireAge}세 목표까지 약 ${eokFull(r.shortfall)} 부족하고, 이를 메우려면 월 ${Math.round(
            (r.extraSave ?? 0) / 10000
          ).toLocaleString("ko-KR")}만원 정도 추가 적립이 필요합니다.`
        : ` ${retireAge}세 목표를 현재 저축으로 달성할 수 있습니다.`)
    : `현재 조건으로는 70년 내 목표 달성이 어렵습니다. 저축을 늘리거나 목표 지출을 줄여보세요.`;

  return (
    <div className="mx-auto max-w-[1280px] px-4">
    {/* 광고 (입력칸 위, 전체 폭) */}
    <AdSlot id="calc-fire-mid" />

    <div className="grid gap-6 lg:grid-cols-[380px_1fr] lg:items-start">
      {/* ═══ 왼쪽: 입력 ═══ */}
      <div className="space-y-4">
        {/* 기본 입력 */}
        <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">기본 입력</p>
            <p className="mt-0.5 text-base font-bold text-slate-900">은퇴 목표와 자산 속도</p>
            <p className="mt-0.5 text-xs text-slate-400">
              현재 나이부터 월 투자 가능액까지, 계산의 출발점이 되는 값입니다.
            </p>
          </div>

          <Field label="현재 나이" hint="20세~70세" value={age} onChange={setAge} suffix="세" />
          <Field label="목표 은퇴 나이" hint="현재 나이보다 높게 입력" value={retireAge} onChange={setRetireAge} suffix="세" />

          <div>
            <Field
              label="현재 순자산"
              hint="예: 18000 입력 = 1억 8,000만원"
              value={asset}
              onChange={setAsset}
              suffix="만원"
              display={(n) => eokFull(n * 10000)}
            />
            <PresetRow
              current={asset}
              presets={[10000, 30000]}
              onPick={setAsset}
              format={(v) => (v >= 10000 ? `${v / 10000}억` : `${v.toLocaleString("ko-KR")}만원`)}
            />
          </div>

          <div>
            <Field
              label="월 투자 가능액"
              hint="예: 150 입력 = 150만원"
              value={monthlySave}
              onChange={setMonthlySave}
              suffix="만원"
              display={(n) => eokFull(n * 10000)}
            />
            <PresetRow
              current={monthlySave}
              presets={[100, 200]}
              onPick={setMonthlySave}
              format={(v) => `${v.toLocaleString("ko-KR")}만원`}
            />
          </div>
        </div>

        {/* 생활비 기준 */}
        <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">생활비 기준</p>
            <p className="mt-0.5 text-base font-bold text-slate-900">은퇴 후 월 생활비</p>
            <p className="mt-0.5 text-xs text-slate-400">
              평균 생활비 프리셋으로 빠르게 시작하고, 본인 소비 구조에 맞게 조정하세요.
            </p>
          </div>
          <Field
            label="월 생활비"
            hint="예: 300 입력 = 300만원"
            value={monthlyExpense}
            onChange={setMonthlyExpense}
            suffix="만원"
            display={(n) => eokFull(n * 10000)}
          />
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
          <p className="text-xs text-slate-400">
            평균값은 참고용이며 실제 계산은 본인의 은퇴 후 소비 구조에 맞게 조정하세요.
          </p>
        </div>

        {/* 가정 옵션 */}
        <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">가정 옵션</p>
            <p className="mt-0.5 text-base font-bold text-slate-900">수익률과 인출률 조정</p>
            <p className="mt-0.5 text-xs text-slate-400">
              현실적인 범위(연 5~12%)에서 보수적·공격적 시나리오를 함께 비교하세요.
            </p>
          </div>
          <div>
            <Slider label="기대 연수익률" value={returnRate} onChange={setReturnRate} min={1} max={15} step={0.5} />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {RETURN_PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => setReturnRate(p.value)}
                  className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-500 hover:border-blue-300"
                >
                  {p.label} {p.value}%
                </button>
              ))}
            </div>
            {returnRate > 15 && (
              <p className="mt-2 text-xs text-amber-600">⚠ 15% 초과는 대가들도 어려운 수준입니다. 참고용으로만.</p>
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

      {/* ═══ 오른쪽: 결과 (sticky) ═══ */}
      <div className="space-y-5 lg:sticky lg:top-20">
        {/* 한줄 요약 */}
        <div className="rounded-xl bg-blue-700 px-5 py-4 text-sm leading-relaxed text-white">{summary}</div>

        {/* 결과 카드 */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Card
            highlight
            label="FIRE 목표 자산"
            value={eokFull(r.fireNumber)}
            sub={`순 생활비 ${(r.netMonthly * 12).toLocaleString("ko-KR")}만원 / 인출률 ${withdrawRate.toFixed(1)}%`}
          />
          <Card
            label="예상 달성 시점"
            value={r.already ? "달성 완료" : r.reachAge !== null ? `${r.reachAge.toFixed(1)}세` : "70년+"}
            sub={r.months ? `${fmtDur(r.months)} 후` : "-"}
          />
          <Card
            label="부족 금액"
            value={r.shortfall && r.shortfall > 0 ? eokFull(r.shortfall) : "없음"}
            sub={`${retireAge}세 기준 부족분`}
          />
          <Card
            label="추가 필요 월 투자금"
            value={r.extraSave ? Math.round(r.extraSave / 10000).toLocaleString("ko-KR") + "만원" : "불필요"}
            sub="목표 시점에 맞추려면 추가 적립"
          />
          <Card label="은퇴 후 월 인출액" value={won(r.monthlyWithdraw)} sub="목표 자산 기준 월 인출 가능액" />
          <Card
            label="자산 소진 나이"
            value={r.depletionAge === null ? "80세+" : `${Math.round(r.depletionAge)}세`}
            sub={r.depletionAge === null ? "장기간 자산 유지" : "이 나이에 자산 소진 예상"}
          />
          <Card label="FIRE 유형" value={r.fireType} sub={r.fireTypeDesc} />
        </div>

        {/* 성장 차트 */}
        <GrowthChart path={r.path} reachAge={r.reachAge} />

        {/* 시나리오 비교 */}
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
                  <td className="px-4 py-2 text-right font-semibold tabular-nums text-blue-700">
                    {s.reachAge ? `${s.reachAge}세` : "70년+"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CAGR 참고 */}
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <div className="border-b border-slate-100 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-800">
            수익률 감 잡기 (대표 자산 장기 CAGR)
          </div>
          <table className="w-full text-sm">
            <tbody>
              {CAGR_TABLE.map((c) => (
                <tr key={c.name} className="border-t border-slate-100">
                  <td className="px-4 py-2 font-medium text-slate-800">{c.name}</td>
                  <td className="px-4 py-2 text-right font-semibold tabular-nums text-blue-700">{c.cagr}%</td>
                  <td className="px-4 py-2 text-right text-xs text-slate-400">{c.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t border-slate-100 px-4 py-2 text-xs text-slate-400">
            과거 장기 연평균 수익률 참고치입니다. 미래 수익을 보장하지 않으며 대가들의 수치는 재현 난이도가 매우 높습니다.
          </p>
        </div>
      </div>
    </div>

    {/* ═══ 하단 전체 폭 (grid 밖으로 분리 — sticky 오른쪽 컬럼과 겹치는 문제 방지) ═══ */}
    <div className="mt-6 space-y-6">
      <section className="space-y-1.5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
        <p className="font-semibold text-slate-800">파이어 넘버란?</p>
        <p>
          은퇴 후 연 지출의 25배(4% 룰 기준)를 모으면, 자산을 원금 손실 없이 매년 인출하며 살 수 있다는
          개념입니다. 인출률을 낮출수록 안전하지만 목표 금액이 커집니다. 국민연금·배당 등 반복 수입은 월
          부수입·연금에 넣으면 목표 자산이 줄어듭니다.
        </p>
      </section>
      <p className="text-xs leading-relaxed text-slate-400">
        ※ 물가를 반영한 실질 수익률 기준 추정치입니다. 실제 수익률은 매년 변동하며 세금·건강보험료는 반영하지
        않았습니다. 보수적 수익률(5~7%)로 함께 비교하는 것이 안전합니다.
      </p>
    </div>
  </div>
  );
}

// ── SVG 차트 (나이별 점 + 호버 툴팁 + X/Y축 눈금) ──
function GrowthChart({
  path,
  reachAge,
}: {
  path: { age: number; asset: number; target: number }[];
  reachAge: number | null;
}) {
  const [hover, setHover] = useState<number | null>(null);
  if (path.length < 2) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-400">
        입력값을 조정해 주세요.
      </div>
    );
  }
  const W = 560,
    H = 300,
    padL = 46,
    padR = 12,
    padT = 20,
    padB = 30;
  const maxVal = Math.max(...path.map((p) => Math.max(p.asset, p.target)));
  const minAge = path[0].age,
    maxAge = path[path.length - 1].age;
  const x = (a: number) => padL + ((a - minAge) / (maxAge - minAge || 1)) * (W - padL - padR);
  const y = (v: number) => H - padB - (v / maxVal) * (H - padT - padB);
  const line = (k: "asset" | "target") =>
    path.map((p, i) => `${i === 0 ? "M" : "L"} ${x(p.age).toFixed(1)} ${y(p[k]).toFixed(1)}`).join(" ");
  const eokShort = (n: number) =>
    n / 100000000 >= 1 ? (n / 100000000).toFixed(1) + "억" : Math.round(n / 10000).toLocaleString("ko-KR") + "만";

  // X축 눈금: 구간 길이에 따라 5 / 10 / 20세 단위
  const span = maxAge - minAge;
  const step = span <= 20 ? 5 : span <= 50 ? 10 : 20;
  const xTicks: number[] = [];
  for (let a = Math.ceil(minAge / step) * step; a <= maxAge; a += step) xTicks.push(a);
  if (xTicks.length === 0 || xTicks[0] - minAge > step * 0.4) xTicks.unshift(Math.round(minAge));
  if (maxAge - xTicks[xTicks.length - 1] > step * 0.4) xTicks.push(Math.round(maxAge));

  // Y축 눈금: 4단계
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * maxVal);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="mb-1 text-sm font-semibold text-slate-800">자산 성장 시뮬레이션</p>
      <p className="mb-3 text-xs text-slate-400">
        <span className="text-blue-600">■</span> 내 예상 자산 &nbsp;
        <span className="text-amber-500">■</span> 필요 목표 자산(물가 반영) · 점에 마우스를 올려보세요
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        {/* Y 그리드 + 라벨 */}
        {yTicks.map((v, i) => (
          <g key={`y-${i}`}>
            <line x1={padL} y1={y(v)} x2={W - padR} y2={y(v)} stroke="#f1f5f9" />
            <text x={padL - 6} y={y(v) + 3} fontSize="9" fill="#94a3b8" textAnchor="end">
              {v === 0 ? "0" : eokShort(v)}
            </text>
          </g>
        ))}
        <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke="#cbd5e1" />

        {/* FIRE 달성 시점 세로선 */}
        {reachAge !== null && reachAge >= minAge && reachAge <= maxAge && (
          <g>
            <line
              x1={x(reachAge)}
              y1={padT}
              x2={x(reachAge)}
              y2={H - padB}
              stroke="#2563eb"
              strokeDasharray="3 3"
              strokeOpacity="0.4"
            />
            <text x={x(reachAge)} y={padT - 6} fontSize="9" fill="#2563eb" textAnchor="middle">
              FIRE {Math.round(reachAge)}세
            </text>
          </g>
        )}

        <path d={line("target")} fill="none" stroke="#f59e0b" strokeWidth="2" />
        <path d={line("asset")} fill="none" stroke="#2563eb" strokeWidth="2.5" />

        {/* 목표 자산(주황) 점 */}
        {path.map((p, i) => (
          <circle
            key={`t-${i}`}
            cx={x(p.age)}
            cy={y(p.target)}
            r={hover === i ? 4 : 2.5}
            fill="#f59e0b"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            style={{ cursor: "pointer" }}
          />
        ))}

        {/* 예상 자산(파랑) 점 */}
        {path.map((p, i) => (
          <circle
            key={`a-${i}`}
            cx={x(p.age)}
            cy={y(p.asset)}
            r={hover === i ? 5 : 3}
            fill="#2563eb"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            style={{ cursor: "pointer" }}
          />
        ))}

        {/* 툴팁 — 모든 점을 다 그린 다음, 가장 마지막에 그려서 항상 맨 위에 보이도록 함 */}
        {hover !== null &&
          (() => {
            const p = path[hover];
            const topY = Math.min(y(p.asset), y(p.target));
            const boxX = Math.min(x(p.age) + 6, W - 128);
            const boxY = Math.max(topY - 58, 2);
            return (
              <g>
                <rect x={boxX} y={boxY} width="124" height="52" rx="4" fill="#1e293b" />
                <text x={boxX + 6} y={boxY + 16} fontSize="11" fill="#fff">
                  {Math.round(p.age)}세
                </text>
                <text x={boxX + 6} y={boxY + 30} fontSize="11" fill="#93c5fd">
                  자산 {eokShort(p.asset)}
                </text>
                <text x={boxX + 6} y={boxY + 44} fontSize="11" fill="#fcd34d">
                  목표 {eokShort(p.target)}
                </text>
              </g>
            );
          })()}

        {/* X축 라벨 */}
        {xTicks.map((a, i) => (
          <text key={`x-${i}`} x={x(a)} y={H - 8} fontSize="10" fill="#94a3b8" textAnchor="middle">
            {Math.round(a)}세
          </text>
        ))}
      </svg>
    </div>
  );
}

function Card({ label, value, sub, highlight }: { label: string; value: string; sub?: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${highlight ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-white"}`}>
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`mt-1 font-bold tabular-nums ${highlight ? "text-lg text-blue-700" : "text-base text-slate-900"}`}>
        {value}
      </p>
      {sub && <p className="mt-1 text-xs leading-snug text-slate-400">{sub}</p>}
    </div>
  );
}

function Field({
  label,
  hint,
  value,
  onChange,
  suffix,
  display,
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (n: number) => void;
  suffix?: string;
  display?: (n: number) => string;
}) {
  return (
    <label className="block">
      {(label || hint) && (
        <div className="flex items-baseline justify-between">
          {label && <span className="text-sm font-medium text-slate-700">{label}</span>}
          {hint && <span className="text-xs text-slate-400">{hint}</span>}
        </div>
      )}
      <div className={`flex items-center gap-1 ${label || hint ? "mt-1.5" : ""}`}>
        <input
          type="text"
          inputMode="numeric"
          value={value === 0 ? "" : value.toLocaleString("ko-KR")}
          onChange={(e) => onChange(Number(e.target.value.replace(/[^0-9]/g, "")) || 0)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-right text-base tabular-nums"
        />
        {suffix && <span className="shrink-0 text-sm text-slate-400">{suffix}</span>}
      </div>
      {display && value > 0 && <p className="mt-1 text-xs font-medium text-blue-600">약 {display(value)}</p>}
    </label>
  );
}

function PresetRow({
  current,
  presets,
  onPick,
  format,
}: {
  current: number;
  presets: number[];
  onPick: (n: number) => void;
  format: (n: number) => string;
}) {
  const items = Array.from(new Set([...presets, current])).sort((a, b) => a - b);
  return (
    <div className="mt-2 flex gap-2">
      {items.map((v) =>
        v === current ? (
          <span
            key={`cur-${v}`}
            className="flex-1 rounded-lg border border-blue-500 bg-blue-50 px-2 py-1.5 text-center text-xs font-semibold text-blue-700"
          >
            기본 {format(v)}
          </span>
        ) : (
          <button
            key={v}
            type="button"
            onClick={() => onPick(v)}
            className="flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-center text-xs text-slate-500 hover:border-blue-300"
          >
            {format(v)}
          </button>
        )
      )}
    </div>
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
