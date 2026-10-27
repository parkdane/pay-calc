// 가이드 본문 예시표·수치 (모두 계산 함수와 데이터 파일에서 생성: 데이터가 바뀌면 가이드도 같이 바뀜)
import { monthsToGoal, formatMonths } from "@/lib/savingsGoal";
import { topPercentOf, incomePercentileMeta } from "@/lib/incomePercentile";
import { calcWorkerNet } from "@/lib/workerNet";
import { calcDeposit, calcSavings, savingsEffectiveRate, INTEREST_TAX_RATE } from "@/lib/depositCalc";
import { MEDIAN_INCOME_2026, AVG_HOUSEHOLD_INCOME } from "@/lib/medianIncome";
import { calcLeap, calcYouthFuture, SOLDIER, LEAP_MONTHS, YOUTH } from "@/lib/policySavings";
import pctData from "@/data/income-percentile-2024.json";
import salaryCompare from "@/data/salary-compare.json";
import militaryPay from "@/data/salary-military-2026.json";

export const won = (n: number) => Math.round(n).toLocaleString("ko-KR") + "원";
export const man = (n: number) => {
  const m = Math.round(n / 10000);
  const eok = Math.floor(m / 10000);
  const rest = m % 10000;
  if (eok === 0) return `${m.toLocaleString("ko-KR")}만 원`;
  return rest === 0 ? `${eok}억 원` : `${eok}억 ${rest.toLocaleString("ko-KR")}만 원`;
};
const pct = (n: number, d = 1) => `${n.toFixed(d)}%`;
const EOK = 100000000;

// ── 1억 모으기 ─────────────────────────────────────
const m3 = (s: number) => monthsToGoal(s, EOK, 3)!;
const SAVE_STEPS = [500000, 1000000, 1500000, 2000000, 2500000, 3000000]; // 50만 원씩 같은 간격
export const savingsSteps = {
  rows: SAVE_STEPS.map((s, i) => [
    `월 ${man(s)}`,
    formatMonths(m3(s)),
    i === 0 ? "-" : `${m3(SAVE_STEPS[i - 1]) - m3(s)}개월 단축`,
  ]),
  plus10: { from: m3(1000000), to: m3(1100000) },
};
export const savingsInterest = [0, 3, 5].map((r) => {
  const n = monthsToGoal(1000000, EOK, r)!;
  const paid = 1000000 * n;
  return { r, n, paid, interest: Math.max(0, EOK - paid) };
});
export const savingsInterestRows = savingsInterest.map((x) => [
  x.r === 0 ? "이자 없음" : `연 ${x.r}%`,
  formatMonths(x.n),
  won(x.paid),
  x.interest > 0 ? `약 ${man(x.interest)}` : "-",
]);

// ── 연봉 순위 ──────────────────────────────────────
export const rankMeta = incomePercentileMeta;
export const rankAnchorRows = pctData.anchors
  .filter((a) => a.topPercent < 100)
  .map((a) => [`상위 ${a.topPercent}%`, man(a.income), won(calcWorkerNet(a.income, 1).net)]);
const RAISES: [number, number][] = [
  [40000000, 50000000],
  [50000000, 60000000],
  [80000000, 90000000],
  [100000000, 110000000],
];
export const rankRaiseRows = RAISES.map(([a, b]) => [
  `${man(a)} → ${man(b)}`,
  `상위 ${pct(topPercentOf(a))} → ${pct(topPercentOf(b))}`,
  `${(topPercentOf(a) - topPercentOf(b)).toFixed(1)}%p`,
  `+${won(calcWorkerNet(b, 1).net - calcWorkerNet(a, 1).net)}`,
]);

// ── 예금·적금 세금 ─────────────────────────────────
export const effective12 = { r4: savingsEffectiveRate(12, 4), share: (12 + 1) / (2 * 12) };
export const taxRows = [3, 4, 5].map((r) => {
  const d = calcDeposit(10000000, 12, r);
  return [`연 ${r}%`, won(d.interest), won(d.tax), won(d.netInterest), pct(r * (1 - INTEREST_TAX_RATE), 2)];
});
export const taxFreeGap = (() => {
  const a = calcSavings(500000, 36, 5);
  const b = calcSavings(500000, 36, 5, true);
  return { taxed: a.netInterest, free: b.netInterest, gap: b.netInterest - a.netInterest };
})();

// ── 대기업 평균연봉 ────────────────────────────────
const companies = [...salaryCompare.companies].sort((a, b) => b.avgSalary - a.avgSalary);
export const companyDate = salaryCompare.updatedAt.slice(0, 10);
export const companyCount = companies.length;
export const companyTopRows = companies.slice(0, 5).map((c) => [
  c.name,
  man(c.avgSalary),
  c.employeeCount ? `${c.employeeCount.toLocaleString("ko-KR")}명` : "-",
  c.avgTenure ? `${c.avgTenure}년` : "-",
]);
const smallest = companies.reduce((a, b) => (b.employeeCount < a.employeeCount ? b : a), companies[0]);
export const companySmallest = { name: smallest.name, count: smallest.employeeCount, avg: smallest.avgSalary };
const medianCo = companies[Math.floor(companies.length / 2)];
export const companyMedian = { name: medianCo.name, avg: medianCo.avgSalary, net: calcWorkerNet(medianCo.avgSalary, 1).net };

// ── 가구소득 ───────────────────────────────────────
export const medianRows = [1, 2, 3, 4].map((n) => {
  const m = MEDIAN_INCOME_2026[n];
  return [`${n}인 가구`, won(m * 0.5), won(m), won(m * 1.5), won(m * 2)];
});
export const householdExample = (() => {
  const total = 52000000 + 28000000;
  const monthly = total / 12;
  const ratio = (monthly / MEDIAN_INCOME_2026[3]) * 100;
  const band =
    ratio <= 50
      ? "50% 이하 기준에도 듭니다"
      : ratio <= 150
        ? "150% 이하 기준과 200% 이하 기준에 모두 듭니다"
        : ratio <= 200
          ? "150% 이하 기준은 넘지만 200% 이하 기준에는 듭니다"
          : "200% 이하 기준도 넘습니다";
  return { total, monthly, ratio, band, avg: AVG_HOUSEHOLD_INCOME };
})();

// ── 병사 봉급과 적금 ───────────────────────────────
export const soldierRows = militaryPay.soldier.rows.map((r) => [
  r.rank,
  won(r.pay),
  won(r.pay - SOLDIER.maxMonthly),
  pct((SOLDIER.maxMonthly / r.pay) * 100, 0),
]);

// ── 도약계좌 vs 미래적금 ───────────────────────────
// 같은 만기 수령액을 일반 과세 적금(같은 기간·같은 월 납입)으로 받으려면 필요한 연 금리
const equivRate = (monthly: number, months: number, total: number) =>
  ((total - monthly * months) / (1 - INTEREST_TAX_RATE) / (monthly / 12) / ((months * (months + 1)) / 2)) * 100;
const LEAP = calcLeap(500000, "t3600", 4.5);
const YG = calcYouthFuture(500000, "general", YOUTH.baseRate);
const YP = calcYouthFuture(500000, "premium", YOUTH.baseRate);
export const compareRows = [
  ["청년도약계좌(총급여 2,400만~3,600만 원, 연 4.5%)", `${LEAP_MONTHS}개월`, won(LEAP.principal), won(LEAP.total), pct(equivRate(500000, LEAP_MONTHS, LEAP.total))],
  [`청년미래적금 일반형(연 ${YOUTH.baseRate}%)`, `${YOUTH.months}개월`, won(YG.principal), won(YG.total), pct(equivRate(500000, YOUTH.months, YG.total))],
  [`청년미래적금 우대형(연 ${YOUTH.baseRate}%)`, `${YOUTH.months}개월`, won(YP.principal), won(YP.total), pct(equivRate(500000, YOUTH.months, YP.total))],
];

// ── 첫 월급 세금 ───────────────────────────────────
export const netRows = [24000000, 30000000, 40000000, 50000000, 70000000, 100000000].map((s) => {
  const r = calcWorkerNet(s, 1);
  const ins = r.deductions.slice(0, 4).reduce((a, d) => a + d.value, 0);
  const tax = r.deductions.slice(4).reduce((a, d) => a + d.value, 0);
  return [man(s), won(r.monthlyGross), won(ins), won(tax), won(r.net), pct(r.netRate * 100)];
});
const rates = [24000000, 30000000, 40000000, 50000000].map((s) => calcWorkerNet(s, 1).netRate * 100);
export const netRateRange = { lo: Math.min(...rates), hi: Math.max(...rates), eok: calcWorkerNet(100000000, 1).netRate * 100 };
