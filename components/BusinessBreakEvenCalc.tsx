"use client";

import { useMemo, useState } from "react";
import AdSlot from "@/components/AdSlot";

const won = (n: number) => Math.round(n).toLocaleString("ko-KR") + "원";
const manwon = (n: number) => Math.round(n / 10000).toLocaleString("ko-KR") + "만원";

export default function BusinessBreakEvenCalc() {
  // 매출
  const [revMode, setRevMode] = useState<"daily" | "monthly">("daily");
  const [dailyRevenue, setDailyRevenue] = useState(1000000);
  const [monthlyRevenueInput, setMonthlyRevenueInput] = useState(30000000);
  const [costRate, setCostRate] = useState(35); // 원가율(%)

  // 월 고정비
  const [rent, setRent] = useState(2000000);
  const [labor, setLabor] = useState(3000000);
  const [otherFixed, setOtherFixed] = useState(500000);

  // 초기 투자금 (창업 비용)
  const [deposit, setDeposit] = useState(30000000);
  const [startupCost, setStartupCost] = useState(50000000);

  // 개인 비용
  const [livingCost, setLivingCost] = useState(2500000);
  const [loanPayment, setLoanPayment] = useState(500000);

  const result = useMemo(() => {
    const monthlyRevenue = revMode === "daily" ? dailyRevenue * 30 : monthlyRevenueInput;
    const monthlyCost = monthlyRevenue * (costRate / 100);
    const grossProfit = monthlyRevenue - monthlyCost;
    const marginRate = monthlyRevenue > 0 ? grossProfit / monthlyRevenue : 0;

    const fixedCosts = rent + labor + otherFixed;
    const operatingProfit = grossProfit - fixedCosts;

    const breakEvenRevenue = marginRate > 0 ? fixedCosts / marginRate : null;

    const initialInvestment = deposit + startupCost;
    const paybackMonths = operatingProfit > 0 ? initialInvestment / operatingProfit : null;

    const personalCosts = livingCost + loanPayment;
    const disposableIncome = operatingProfit - personalCosts;

    return {
      monthlyRevenue,
      monthlyCost,
      grossProfit,
      marginRate,
      fixedCosts,
      operatingProfit,
      breakEvenRevenue,
      initialInvestment,
      paybackMonths,
      personalCosts,
      disposableIncome,
    };
  }, [
    revMode, dailyRevenue, monthlyRevenueInput, costRate,
    rent, labor, otherFixed,
    deposit, startupCost,
    livingCost, loanPayment,
  ]);

  const fmtMonths = (m: number) => {
    const y = Math.floor(m / 12);
    const mo = Math.round(m % 12);
    if (y === 0) return `${mo}개월`;
    return mo === 0 ? `${y}년` : `${y}년 ${mo}개월`;
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4">
      <AdSlot id="calc-business-breakeven-mid" />

      <div className="grid gap-6 lg:grid-cols-[380px_1fr] lg:items-start">
        {/* ═══ 왼쪽: 입력 ═══ */}
        <div className="space-y-4">
          {/* 매출·원가 */}
          <div className="space-y-4 rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#2E4494]">매출·원가</p>
            </div>

            <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
              {(
                [
                  { id: "daily", label: "일매출" },
                  { id: "monthly", label: "월매출" },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  onClick={() => setRevMode(m.id)}
                  className={`rounded-lg py-2 text-sm font-semibold transition ${
                    revMode === m.id ? "bg-white text-[#2E4494] shadow-sm" : "text-[#7A8296]"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {revMode === "daily" ? (
              <label className="block text-sm font-medium text-[#5B6478]">
                일매출
                <input
                  type="text"
                  inputMode="numeric"
                  value={dailyRevenue === 0 ? "" : dailyRevenue.toLocaleString("ko-KR")}
                  onChange={(e) => setDailyRevenue(Number(e.target.value.replace(/[^0-9]/g, "")) || 0)}
                  className="mt-1.5 w-full rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-3 py-3 text-right tabular-nums"
                />
                <span className="mt-1 block text-xs font-normal text-[#8B93A6]">
                  월 30일 영업 기준으로 환산 (월매출 {manwon(dailyRevenue * 30)})
                </span>
              </label>
            ) : (
              <label className="block text-sm font-medium text-[#5B6478]">
                월매출
                <input
                  type="text"
                  inputMode="numeric"
                  value={monthlyRevenueInput === 0 ? "" : monthlyRevenueInput.toLocaleString("ko-KR")}
                  onChange={(e) => setMonthlyRevenueInput(Number(e.target.value.replace(/[^0-9]/g, "")) || 0)}
                  className="mt-1.5 w-full rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-3 py-3 text-right tabular-nums"
                />
              </label>
            )}

            <div className="text-sm font-medium text-[#5B6478]">
              <div className="flex items-center justify-between">
                <span>원가율</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    max={90}
                    value={costRate}
                    onChange={(e) => setCostRate(Number(e.target.value) || 0)}
                    className="w-14 rounded-lg border border-[rgba(46,68,148,0.22)] px-2 py-1 text-right tabular-nums text-[#2E4494]"
                  />
                  <span className="text-[#2E4494]">%</span>
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={80}
                step={1}
                value={costRate}
                onChange={(e) => setCostRate(Number(e.target.value))}
                className="mt-3 w-full accent-[#2E4494]"
              />
              <p className="mt-1 text-xs text-[#8B93A6]">
                재료비·매입원가가 매출에서 차지하는 비율. 음식점은 보통 30~40%대
              </p>
            </div>
          </div>

          {/* 월 고정비 */}
          <div className="space-y-4 rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#2E4494]">월 고정비</p>
            <MoneyField label="월세" value={rent} onChange={setRent} />
            <MoneyField label="인건비 (본인 제외 직원)" value={labor} onChange={setLabor} />
            <MoneyField label="기타 고정비" value={otherFixed} onChange={setOtherFixed} hint="관리비·공과금·보험료 등" />
          </div>

          {/* 초기 투자금 */}
          <div className="space-y-4 rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#2E4494]">초기 투자금</p>
              <p className="mt-1 text-xs text-[#8B93A6]">
                고정비와 달리 매달 나가는 돈이 아니라, 처음 창업할 때 한 번 들어간 돈입니다
              </p>
            </div>
            <MoneyField label="임대차 보증금" value={deposit} onChange={setDeposit} hint="나중에 돌려받는 돈이지만 회수 전까지 묶이는 돈" />
            <MoneyField label="인테리어·설비·권리금 등" value={startupCost} onChange={setStartupCost} />
          </div>

          {/* 개인 비용 */}
          <div className="space-y-4 rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#2E4494]">개인 비용</p>
            <MoneyField label="생활비" value={livingCost} onChange={setLivingCost} />
            <MoneyField label="대출금 상환액" value={loanPayment} onChange={setLoanPayment} />
          </div>
        </div>

        {/* ═══ 오른쪽: 결과 (sticky) ═══ */}
        <div className="space-y-5 lg:sticky lg:top-20">
          {/* 핵심 요약 */}
          <div className="overflow-hidden rounded-xl border border-[rgba(46,68,148,0.14)]">
            <div className="bg-[#2E4494] px-5 py-4 text-white">
              <p className="text-sm opacity-80">월 영업이익</p>
              <p className="text-3xl font-bold tabular-nums">{won(result.operatingProfit)}</p>
              <p className="mt-1 text-sm opacity-90">
                {result.paybackMonths !== null
                  ? `초기 투자금 회수까지 약 ${fmtMonths(result.paybackMonths)}`
                  : "현재 조건으로는 투자금을 회수할 수 없습니다 (영업이익 적자)"}
              </p>
            </div>
            <dl className="divide-y divide-[rgba(46,68,148,0.10)] bg-white text-sm">
              <Row label="월매출" value={won(result.monthlyRevenue)} />
              <Row label="원가" value={"- " + won(result.monthlyCost)} muted />
              <Row label="매출총이익 (마진)" value={won(result.grossProfit)} />
              <Row label="마진율" value={`${(result.marginRate * 100).toFixed(1)}%`} muted />
              <Row label="월 고정비 (월세+인건비+기타)" value={"- " + won(result.fixedCosts)} muted />
              <Row label="월 영업이익" value={won(result.operatingProfit)} bold />
            </dl>
          </div>

          {/* 손익분기 매출 */}
          <div className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-white p-5">
            <p className="text-sm font-semibold text-[#1B2A4A]">손익분기 매출</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-[#2E4494]">
              {result.breakEvenRevenue !== null ? won(result.breakEvenRevenue) : "계산 불가"}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-[#8B93A6]">
              고정비 ÷ 마진율로 계산한, 적자를 면하는 최소 매출선입니다. 지금 입력한 월매출{" "}
              {manwon(result.monthlyRevenue)}이 이 선을 넘으면 흑자, 밑돌면 적자입니다.
            </p>
          </div>

          {/* 생활비·대출금 반영 실질 소득 */}
          <div
            className={`rounded-xl border p-5 ${
              result.disposableIncome >= 0 ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"
            }`}
          >
            <p
              className={`text-xs font-semibold uppercase tracking-wide ${
                result.disposableIncome >= 0 ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              생활비·대출금까지 낸 뒤 실제로 남는 돈
            </p>
            <p
              className={`mt-1 text-2xl font-bold tabular-nums ${
                result.disposableIncome >= 0 ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              {won(result.disposableIncome)}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-[#5B6478]">
              월 영업이익 {won(result.operatingProfit)}에서 생활비·대출금 합계{" "}
              {won(result.personalCosts)}를 뺀 금액입니다.{" "}
              {result.disposableIncome < 0 &&
                "이 값이 마이너스라면, 사업 자체는 흑자여도 생활은 적자라는 뜻입니다 — 저축은커녕 계속 돈이 새는 구조입니다."}
            </p>
          </div>

          {/* 판단 보조 */}
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#2E4494]">판단 보조</p>
              <p className="mt-0.5 text-base font-bold text-[#1B2A4A]">이런 상황이면 이렇게 보세요</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {BUSINESS_DECISION_CARDS.map((card) => (
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
        ※ 참고용 추정치입니다. 부가가치세·종합소득세, 카드수수료, 계절 매출 변동, 초기 매출 부진 기간(오픈
        효과 소멸 후) 등은 반영하지 않은 단순 모델입니다. 실제 자금 계획은 세무사·창업 컨설턴트와 함께
        검토하시길 권장합니다.
      </p>
    </div>
  );
}

const BUSINESS_DECISION_CARDS = [
  {
    tag: "회수기간 너무 김",
    title: "투자금 회수 기간이 너무 길게 나온다",
    bullets: [
      "고정비(특히 월세·인건비)를 줄일 여지가 있는지 먼저 점검하세요",
      "원가율을 1~2%p만 낮춰도 마진율 개선 효과가 생각보다 큽니다",
      "초기 투자금 중 권리금·인테리어를 낮출 수 있었는지 다음 창업에 참고하세요",
    ],
  },
  {
    tag: "손익분기 근처",
    title: "지금 매출이 손익분기 매출과 비슷하다",
    bullets: [
      "매출이 조금만 떨어져도 바로 적자로 전환되는 위험한 구간입니다",
      "고정비를 줄이거나 마진율이 높은 메뉴·상품 비중을 늘리는 것이 우선입니다",
      "비수기·성수기 매출 변동을 감안해 최소 매출 대응 계획을 세워두세요",
    ],
  },
  {
    tag: "생활비 적자",
    title: "실제로 남는 돈이 마이너스로 나온다",
    bullets: [
      "사업이 흑자라도 생활비까지 감당이 안 되면 지속 가능하지 않습니다",
      "생활비를 줄이거나, 영업이익 자체를 늘리는 방법을 함께 찾아야 합니다",
      "대출금 상환 구조(원리금균등 vs 거치식)를 재검토하는 것도 방법입니다",
    ],
  },
];

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
