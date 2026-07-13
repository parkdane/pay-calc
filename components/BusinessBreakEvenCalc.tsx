"use client";

import { useMemo, useState } from "react";
import AdSlot from "@/components/AdSlot";

const won = (n: number) => Math.round(n).toLocaleString("ko-KR") + "원";
const manwon = (n: number) => Math.round(n / 10000).toLocaleString("ko-KR") + "만원";

// 업종별 원가율·인건비·임대료 비중 참고치
// 국세청·DART처럼 단일 공식 통계가 아니라, 여러 요식업/창업 컨설팅 자료를 교차 검증해 정리한 "업계 통상 범위"입니다.
const INDUSTRY_PRESETS = [
  {
    id: "cafe",
    label: "카페·커피전문점",
    costRate: 32,
    laborRatio: 0.22,
    rentRatio: 0.12,
    note: "원가율 30~35%, 인건비 20~25%, 임대료 10~15%. 디저트 비중이 높을수록 원가율이 낮아지는 경향",
  },
  {
    id: "delivery",
    label: "배달전문 음식점",
    costRate: 48,
    laborRatio: 0.17,
    rentRatio: 0.09,
    note: "식재료 원가(30%)에 배달앱 수수료·포장비(15~20%)까지 합쳐 원가율로 반영. 인건비·임대료는 소형매장이라 상대적으로 낮은 편",
  },
  {
    id: "meat",
    label: "고깃집·한식",
    costRate: 38,
    laborRatio: 0.27,
    rentRatio: 0.13,
    note: "육류 원가율 35~40%, 홀 서빙 인력이 많이 필요해 인건비 25~30%, 넓은 평수라 임대료 부담도 큰 편",
  },
  {
    id: "sushi",
    label: "스시·일식",
    costRate: 40,
    laborRatio: 0.24,
    rentRatio: 0.12,
    note: "신선 수산물 원가율 38~42%로 높은 편, 숙련 조리 인력이 필요해 인건비도 상대적으로 높음",
  },
] as const;

// 사업자 유형별 부가세 실효 부담률 (매출이 부가세 포함가라는 전제, 매입세액공제는 반영하지 않은 보수적 추정)
const VAT_TYPES = [
  { id: "general", label: "일반과세자", rate: 10 / 110 },
  { id: "simplified", label: "간이과세자", rate: 0.015 },
  { id: "exempt", label: "면세사업자", rate: 0 },
] as const;

// 종합소득세 2026년 귀속 누진세율표 (지방소득세 10% 별도)
const INCOME_TAX_BRACKETS = [
  { upTo: 14000000, rate: 0.06, deduction: 0 },
  { upTo: 50000000, rate: 0.15, deduction: 1260000 },
  { upTo: 88000000, rate: 0.24, deduction: 5760000 },
  { upTo: 150000000, rate: 0.35, deduction: 15440000 },
  { upTo: 300000000, rate: 0.38, deduction: 19940000 },
  { upTo: 500000000, rate: 0.4, deduction: 25940000 },
  { upTo: 1000000000, rate: 0.42, deduction: 35940000 },
  { upTo: Infinity, rate: 0.45, deduction: 65940000 },
];

// 인적공제·경비 추가공제 등 전혀 반영하지 않은 보수적(최악 시나리오) 추정
function estimateAnnualIncomeTax(annualIncome: number): number {
  if (annualIncome <= 0) return 0;
  const b = INCOME_TAX_BRACKETS.find((b) => annualIncome <= b.upTo)!;
  const tax = Math.max(0, annualIncome * b.rate - b.deduction);
  return tax * 1.1; // 지방소득세 10% 포함
}

const DEFAULTS = {
  revMode: "daily" as const,
  dailyRevenue: 1000000,
  monthlyRevenueInput: 30000000,
  costRate: 35,
  vatType: "general" as const,
  cardFeeRate: 1.5,
  rent: 2000000,
  labor: 3000000,
  otherFixed: 500000,
  includeSeverance: true,
  includeTax: true,
  deposit: 30000000,
  startupCost: 50000000,
  livingCost: 2500000,
  loanPayment: 500000,
};

export default function BusinessBreakEvenCalc() {
  // 매출
  const [revMode, setRevMode] = useState<"daily" | "monthly">(DEFAULTS.revMode);
  const [dailyRevenue, setDailyRevenue] = useState(DEFAULTS.dailyRevenue);
  const [monthlyRevenueInput, setMonthlyRevenueInput] = useState(DEFAULTS.monthlyRevenueInput);
  const [costRate, setCostRate] = useState(DEFAULTS.costRate); // 원가율(%)
  const [industryId, setIndustryId] = useState<string | null>(null);
  const [vatType, setVatType] = useState<string>(DEFAULTS.vatType);
  const [cardFeeRate, setCardFeeRate] = useState(DEFAULTS.cardFeeRate);

  // 월 고정비
  const [rent, setRent] = useState(DEFAULTS.rent);
  const [labor, setLabor] = useState(DEFAULTS.labor);
  const [otherFixed, setOtherFixed] = useState(DEFAULTS.otherFixed);
  const [includeSeverance, setIncludeSeverance] = useState(DEFAULTS.includeSeverance);
  const [includeTax, setIncludeTax] = useState(DEFAULTS.includeTax);

  // 초기 투자금 (창업 비용)
  const [deposit, setDeposit] = useState(DEFAULTS.deposit);
  const [startupCost, setStartupCost] = useState(DEFAULTS.startupCost);

  // 개인 비용
  const [livingCost, setLivingCost] = useState(DEFAULTS.livingCost);
  const [loanPayment, setLoanPayment] = useState(DEFAULTS.loanPayment);

  const resetAll = () => {
    setRevMode(DEFAULTS.revMode);
    setDailyRevenue(DEFAULTS.dailyRevenue);
    setMonthlyRevenueInput(DEFAULTS.monthlyRevenueInput);
    setCostRate(DEFAULTS.costRate);
    setIndustryId(null);
    setVatType(DEFAULTS.vatType);
    setCardFeeRate(DEFAULTS.cardFeeRate);
    setRent(DEFAULTS.rent);
    setLabor(DEFAULTS.labor);
    setOtherFixed(DEFAULTS.otherFixed);
    setIncludeSeverance(DEFAULTS.includeSeverance);
    setIncludeTax(DEFAULTS.includeTax);
    setDeposit(DEFAULTS.deposit);
    setStartupCost(DEFAULTS.startupCost);
    setLivingCost(DEFAULTS.livingCost);
    setLoanPayment(DEFAULTS.loanPayment);
  };

  const result = useMemo(() => {
    const monthlyRevenue = revMode === "daily" ? dailyRevenue * 30 : monthlyRevenueInput;

    // 1. 부가세 (매출은 부가세 포함가로 간주, 매입세액공제 미반영 — 보수적 추정)
    const vatRate = VAT_TYPES.find((v) => v.id === vatType)?.rate ?? 0;
    const vat = monthlyRevenue * vatRate;

    // 2. 카드수수료 (매출 전체에 실효 수수료율 적용)
    const cardFee = monthlyRevenue * (cardFeeRate / 100);

    const netRevenue = monthlyRevenue - vat - cardFee;

    // 3. 원가 (부가세·카드수수료를 뺀 순매출 기준)
    const monthlyCost = netRevenue * (costRate / 100);
    const grossProfit = netRevenue - monthlyCost;
    const marginRate = monthlyRevenue > 0 ? grossProfit / monthlyRevenue : 0;

    // 4. 고정비 (퇴직금 충당금 = 인건비의 1/12)
    const severance = includeSeverance ? labor / 12 : 0;
    const fixedCosts = rent + labor + otherFixed + severance;
    const operatingProfit = grossProfit - fixedCosts;

    const breakEvenRevenue = marginRate > 0 ? fixedCosts / marginRate : null;

    const initialInvestment = deposit + startupCost;

    // 5. 종합소득세 (연환산 누진세율, 인적공제·경비 추가공제 미반영 — 보수적 추정)
    const annualOperatingProfit = Math.max(0, operatingProfit) * 12;
    const estimatedAnnualTax = includeTax ? estimateAnnualIncomeTax(annualOperatingProfit) : 0;
    const monthlyTax = estimatedAnnualTax / 12;
    const afterTaxProfit = operatingProfit - monthlyTax;

    // 회수기간: 세금 반영 체크박스와 그대로 연동 (반영 켜짐=세후, 꺼짐=세전)
    const paybackProfit = includeTax ? afterTaxProfit : operatingProfit;
    const paybackMonths = paybackProfit > 0 ? initialInvestment / paybackProfit : null;

    const personalCosts = livingCost + loanPayment;
    const disposableIncome = afterTaxProfit - personalCosts;

    return {
      monthlyRevenue,
      vat,
      cardFee,
      netRevenue,
      monthlyCost,
      grossProfit,
      marginRate,
      severance,
      fixedCosts,
      operatingProfit,
      breakEvenRevenue,
      initialInvestment,
      paybackMonths,
      monthlyTax,
      afterTaxProfit,
      personalCosts,
      disposableIncome,
    };
  }, [
    revMode, dailyRevenue, monthlyRevenueInput, costRate, vatType, cardFeeRate,
    rent, labor, otherFixed, includeSeverance,
    deposit, startupCost,
    livingCost, loanPayment, includeTax,
  ]);

  const fmtMonths = (m: number) => {
    const y = Math.floor(m / 12);
    const mo = Math.round(m % 12);
    if (y === 0) return `${mo}개월`;
    return mo === 0 ? `${y}년` : `${y}년 ${mo}개월`;
  };

  const applyIndustry = (preset: (typeof INDUSTRY_PRESETS)[number]) => {
    setIndustryId(preset.id);
    setCostRate(preset.costRate);
    const monthlyRevenue = revMode === "daily" ? dailyRevenue * 30 : monthlyRevenueInput;
    setRent(Math.round((monthlyRevenue * preset.rentRatio) / 10000) * 10000);
    setLabor(Math.round((monthlyRevenue * preset.laborRatio) / 10000) * 10000);
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4">
      <AdSlot id="calc-business-breakeven-mid" />

      <div className="grid gap-6 lg:grid-cols-[380px_1fr] lg:items-start">
        {/* ═══ 왼쪽: 입력 ═══ */}
        <div className="space-y-4">
          <button
            onClick={resetAll}
            className="w-full rounded-lg border border-[rgba(46,68,148,0.22)] bg-white py-2 text-xs font-semibold text-[#5B6478] hover:border-[#2E4494] hover:text-[#2E4494]"
          >
            ↺ 입력값 전체 초기화
          </button>

          {/* 매출·원가 */}
          <div className="space-y-4 rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#2E4494]">매출·원가</p>
            </div>

            {/* 업종 프리셋 */}
            <div>
              <p className="text-xs font-medium text-[#5B6478]">업종 선택 (원가율·월세·인건비 자동 입력)</p>
              <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                {INDUSTRY_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => applyIndustry(p)}
                    className={`rounded-lg border px-2 py-2 text-xs font-medium transition ${
                      industryId === p.id
                        ? "border-[#2E4494] bg-[rgba(46,68,148,0.06)] text-[#2E4494]"
                        : "border-[rgba(46,68,148,0.22)] bg-white text-[#5B6478] hover:border-[#2E4494]"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              {industryId && (
                <p className="mt-1.5 text-xs leading-relaxed text-[#8B93A6]">
                  {INDUSTRY_PRESETS.find((p) => p.id === industryId)?.note}
                </p>
              )}
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

            <label className="block">
              <span className="text-sm font-medium text-[#5B6478]">사업자 유형 (부가세)</span>
              <select
                value={vatType}
                onChange={(e) => setVatType(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-3 py-3"
              >
                {VAT_TYPES.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label}
                  </option>
                ))}
              </select>
              <span className="mt-1 block text-xs font-normal text-[#8B93A6]">
                매출은 부가세 포함 금액으로 가정. 매입세액공제는 반영하지 않은 보수적 추정
              </span>
            </label>

            <div className="text-sm font-medium text-[#5B6478]">
              <div className="flex items-center justify-between">
                <span>카드수수료</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    max={5}
                    step={0.1}
                    value={cardFeeRate}
                    onChange={(e) => setCardFeeRate(Number(e.target.value) || 0)}
                    className="w-14 rounded-lg border border-[rgba(46,68,148,0.22)] px-2 py-1 text-right tabular-nums text-[#2E4494]"
                  />
                  <span className="text-[#2E4494]">%</span>
                </div>
              </div>
              <p className="mt-1 text-xs text-[#8B93A6]">매출 대비 실효 카드수수료율. 영세가맹점 기준 통상 1~2%대</p>
            </div>

            <label className="flex items-center gap-2 text-sm text-[#5B6478]">
              <input
                type="checkbox"
                checked={includeTax}
                onChange={(e) => setIncludeTax(e.target.checked)}
                className="h-4 w-4"
              />
              종합소득세 추정치 반영 (연환산 누진세율, 공제 미반영 보수적 추정)
            </label>
            <p className="pl-6 text-xs text-[#8B93A6]">
              켜면 결과표와 투자금 회수기간 모두 세금 낸 후 기준으로, 끄면 모두 세금 반영 전 기준으로
              계산됩니다.
            </p>
          </div>

          {/* 월 고정비 */}
          <div className="space-y-4 rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#2E4494]">월 고정비</p>
            <MoneyField label="월세" value={rent} onChange={setRent} />
            <MoneyField label="인건비 (본인 제외 직원)" value={labor} onChange={setLabor} />
            <MoneyField label="기타 고정비" value={otherFixed} onChange={setOtherFixed} hint="관리비·공과금·보험료 등" />
            <label className="flex items-center gap-2 text-sm text-[#5B6478]">
              <input
                type="checkbox"
                checked={includeSeverance}
                onChange={(e) => setIncludeSeverance(e.target.checked)}
                className="h-4 w-4"
              />
              직원 퇴직금 충당 (인건비의 1/12씩 매달 적립)
            </label>
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
              <p className="text-sm opacity-80">월 영업이익 (세전)</p>
              <p className="text-3xl font-bold tabular-nums">{won(result.operatingProfit)}</p>
            </div>
            <div className="border-b border-[rgba(46,68,148,0.10)] bg-[rgba(46,68,148,0.04)] px-5 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#2E4494]">
                투자금 회수기간 (
                {includeTax ? "세금 낸 후 기준" : "세금 빼고 기준"})
              </p>
              <p className="mt-0.5 text-xl font-bold tabular-nums text-[#1B2A4A]">
                {result.paybackMonths !== null ? fmtMonths(result.paybackMonths) : "회수 불가 (적자)"}
              </p>
            </div>
            <dl className="divide-y divide-[rgba(46,68,148,0.10)] bg-white text-sm">
              <Row label="월매출 (부가세 포함)" value={won(result.monthlyRevenue)} />
              <Row label="부가세" value={"- " + won(result.vat)} muted />
              <Row label="카드수수료" value={"- " + won(result.cardFee)} muted />
              <Row label="순매출" value={won(result.netRevenue)} />
              <Row label="원가" value={"- " + won(result.monthlyCost)} muted />
              <Row label="매출총이익 (마진)" value={won(result.grossProfit)} />
              <Row label="마진율 (매출 대비)" value={`${(result.marginRate * 100).toFixed(1)}%`} muted />
              <Row
                label="월 고정비 (월세+인건비+기타+퇴직충당)"
                value={"- " + won(result.fixedCosts)}
                muted
              />
              <Row label="월 영업이익 (세전)" value={won(result.operatingProfit)} bold={!includeTax} />
              {includeTax && (
                <>
                  <Row label="종합소득세 추정 (연환산, 월할)" value={"- " + won(Math.max(0, result.monthlyTax))} muted />
                  <Row label="세후 영업이익" value={won(result.afterTaxProfit)} bold />
                </>
              )}
            </dl>
            {includeTax && (
              <p className="border-t border-[rgba(46,68,148,0.10)] bg-[rgba(46,68,148,0.03)] px-5 py-3 text-xs leading-relaxed text-[#7A8296]">
                이 종합소득세는 기본공제·노란우산공제 등을 전혀 반영하지 않은 최악 시나리오입니다. 실제로
                기본공제(150만 원)+노란우산공제(최대 500만 원)만 적용해도, 연 소득이 낮을수록 세금이 더 많이
                줄어듭니다 — 연 3천만 원대는 약 30%, 8천만 원대는 약 12%, 1억 4천만 원대는 약 7%, 2억 원대는
                약 4% 정도 낮아지는 경향입니다. 즉 사업 규모가 작을수록 이 추정치와 실제 세금의 차이가 큽니다.
              </p>
            )}
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
              {includeTax ? "세금·생활비·대출금까지 낸 뒤" : "생활비·대출금까지 낸 뒤"} 실제로 남는 돈
            </p>
            <p
              className={`mt-1 text-2xl font-bold tabular-nums ${
                result.disposableIncome >= 0 ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              {won(result.disposableIncome)}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-[#5B6478]">
              {includeTax ? "세후 영업이익" : "영업이익"} {won(result.afterTaxProfit)}에서 생활비·대출금 합계{" "}
              {won(result.personalCosts)}를 뺀 금액입니다.{" "}
              {includeTax &&
                "종합소득세는 인적공제 등을 반영하지 않은 보수적 추정이라 실제로는 이보다 세금이 적고 남는 돈이 많을 가능성이 큽니다."}{" "}
              {result.disposableIncome < 0 &&
                "그럼에도 마이너스라면, 사업 자체는 흑자여도 생활은 적자라는 뜻입니다 — 저축은커녕 계속 돈이 새는 구조입니다."}
            </p>
          </div>

          {/* 판단 보조 */}
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#2E4494]">판단 보조</p>
              <p className="mt-0.5 text-base font-bold text-[#1B2A4A]">이런 상황이면 이렇게 보세요</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
        ※ 참고용 추정치입니다. 부가세·카드수수료·퇴직금충당·종합소득세를 반영했지만, 계절 매출 변동, 초기
        매출 부진 기간(오픈 효과 소멸 후), 매입세액공제, 인적공제·경비 추가공제 등은 반영하지 않았습니다.
        특히 종합소득세는 공제를 전혀 적용하지 않은 보수적(최악 시나리오) 추정이라 실제 세금은 이보다 적을
        가능성이 큽니다. 업종 선택 시 채워지는 원가율·월세·인건비 비중은 국세청·DART 데이터처럼 단일 공식
        통계가 아니라, 여러 요식업·창업 컨설팅 자료를 교차 검증해 정리한 업계 통상 범위입니다. 실제 상권·매장
        규모에 따라 크게 달라질 수 있으니 참고용으로만 활용하고, 실제 자금 계획은 세무사·창업 컨설턴트와 함께
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
  {
    tag: "창업 전이라면",
    title: "소상공인 3년 생존율은 계속 낮아지고 있다",
    bullets: [
      "창업 3년 생존율이 2020년 50.2%에서 2024년 33.6%까지 떨어졌습니다 (중기부·국세청 통계)",
      "폐업 사유 1위는 매출부진(70.9%)이며, 정상매출 대비 40% 이상 줄었을 때 폐업을 결심하는 경우가 가장 많습니다",
      "이 계산기의 손익분기 매출보다 40% 낮은 매출에서도 버틸 수 있는지 미리 점검해보세요",
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
