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
import taxRates from "@/data/tax-rates-2026.json";
import civilPay from "@/data/salary-civil-2026.json";
import civilHist from "@/data/pension-civil-history.json";
import { overtimeHourlyRate, BASE_HOBONG, MAX_HOURS } from "@/lib/overtime";
import { getPayoutRate, NATIONAL_AVG_INCOME_2026 } from "@/lib/pensionCalc";
import {
  SCHEDULE as UB_SCHEDULE,
  DAILY_LOWER_LIMIT,
  DAILY_UPPER_LIMIT,
  BENEFIT_RATE,
  calcUnemploymentBenefit,
} from "@/lib/unemploymentBenefitCalc";
import { calcParentalLeave } from "@/lib/parentalLeaveCalc";
import { calcRetirementPay } from "@/lib/retirementPayCalc";
import { calcNationalPensionPremium, RATE as NP_RATE, LOWER_INCOME_LIMIT, UPPER_INCOME_LIMIT } from "@/lib/nationalPensionPremiumCalc";
import { calcMaternityLeavePay, MIN_HOURLY_WAGE, STANDARD_MONTHLY_HOURS } from "@/lib/maternityLeaveCalc";
import { leapMonthlyMatch, LEAP_TIERS } from "@/lib/policySavings";

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

// ════════ 2차 묶음: 공무원·고용보험 가이드 ════════

const civilCol = (g: string) => civilPay.columns.indexOf(g);
const civilBase = (g: string, hobong: number) =>
  civilPay.rows.find((r) => r.hobong === hobong)!.pay[civilCol(g)] as number;

// ── 정근수당 지급률·가산금 (공무원수당 등에 관한 규정 별표2, 계산기와 같은 데이터) ──
type RB = { underYears: number; rate: number };
type AB = { underYears: number; amount: number };
const RB_LIST = taxRates.regularBonus.brackets as RB[];
const AB_LIST = taxRates.regularBonusAddon.brackets as AB[];
const pickR = (y: number) => RB_LIST.find((b) => y < b.underYears)!.rate;
const pickA = (y: number) => AB_LIST.find((b) => y < b.underYears)!.amount;
const bounds = [...new Set([0, ...RB_LIST.map((b) => b.underYears), ...AB_LIST.map((b) => b.underYears)])]
  .filter((x) => x < 999)
  .sort((a, b) => a - b);
export const jeonggeunRows = bounds.map((lo, i) => {
  const hi = bounds[i + 1];
  const label = hi === undefined ? `${lo}년 이상` : lo === 0 ? `${hi}년 미만` : `${lo}~${hi}년`;
  return [label, `월봉급액의 ${Math.round(pickR(lo) * 100)}%`, won(pickA(lo))];
});
export const jeonggeunTop = { years: RB_LIST.find((b) => b.rate === 0.5)!, first: RB_LIST[0] };

// 연간 수당 예시: 7급 8호봉·근속 7년
const EX_G = "7급";
const EX_H = 8;
const EX_Y = 7;
const exBase = civilBase(EX_G, EX_H);
export const allowanceExample = {
  grade: EX_G,
  hobong: EX_H,
  years: EX_Y,
  base: exBase,
  rate: pickR(EX_Y),
  jeonggeun: exBase * pickR(EX_Y) * 2,
  addon: pickA(EX_Y) * 12,
  holiday: exBase * taxRates.holidayBonusRate * 2,
  meal: taxRates.meal * 12,
};
export const allowanceExampleRows = [
  ["정근수당(1월·7월)", `${won(exBase)} × ${Math.round(pickR(EX_Y) * 100)}% × 2회`, won(allowanceExample.jeonggeun)],
  ["정근수당 가산금", `${won(pickA(EX_Y))} × 12개월`, won(allowanceExample.addon)],
  ["명절휴가비(설·추석)", `${won(exBase)} × ${Math.round(taxRates.holidayBonusRate * 100)}% × 2회`, won(allowanceExample.holiday)],
  ["정액급식비", `${won(taxRates.meal)} × 12개월`, won(allowanceExample.meal)],
];

// 시간외근무수당: 직급별 시간당 단가와 월 10시간·최대시간 금액
export const overtimeRows = ["9급", "8급", "7급", "6급", "5급"].map((g) => {
  const h = overtimeHourlyRate(civilBase(g, BASE_HOBONG), g);
  return [g, won(h), won(h * 10), won(h * MAX_HOURS)];
});
export const overtimeMax = MAX_HOURS;

// ── 2026 봉급 인상률 (2025년 말 봉급표 대비) ──
type Snap = { efYd: string; rows: { hobong: number; values?: (number | null)[] }[] };
const prevSnap = (civilHist as Snap[])
  .filter((s) => s.efYd < "20260101")
  .reduce((a, b) => (b.efYd > a.efYd ? b : a));
const prevCivil = (g: string, hobong: number) =>
  prevSnap.rows.find((r) => r.hobong === hobong)?.values?.[Number(g[0]) - 1] ?? null;
const raise = (g: string, h: number) => {
  const p = prevCivil(g, h);
  return p ? (civilBase(g, h) / p - 1) * 100 : null;
};
export const raiseRows = [1, 2, 3, 4, 5, 6, 7, 8].map((h) => [
  `${h}호봉`,
  ...["9급", "8급", "7급", "6급"].map((g) => {
    const r = raise(g, h);
    return r === null ? "-" : `${r.toFixed(1)}%`;
  }),
]);
// 기본 인상률(3.5%)로 돌아오는 첫 호봉
const firstBaseHobong = (g: string) => {
  const base = raise("5급", 10)!;
  for (let h = 1; h <= 20; h++) if (Math.abs(raise(g, h)! - base) < 0.05) return h;
  return null;
};
export const raiseSummary = {
  base: raise("5급", 10)!,
  top: raise("9급", 1)!,
  back9: firstBaseHobong("9급"),
  back8: firstBaseHobong("8급"),
  back7: firstBaseHobong("7급"),
};
export const firstPay = ["9급", "8급", "7급"].map((g) => ({ g, now: civilBase(g, 1), prev: prevCivil(g, 1)! }));

// ── 공무원연금 지급률·소득재분배 ──
export const payoutRows = [2016, 2020, 2025, 2026, 2030, 2035].map((y) => {
  const r = getPayoutRate(y)!;
  return [`${y}년${y === 2035 ? " 이후" : ""}`, `${r.toFixed(3)}%`, `${(r * 30).toFixed(1)}%`];
});
const rate2026 = getPayoutRate(2026)!;
export const redistributionRows = [0.7, 1.0, 1.5].map((k) => {
  const own = NATIONAL_AVG_INCOME_2026 * k;
  // 지급률 중 1/1.7은 전체 평균소득, 0.7/1.7은 본인 소득 기준(2016년 이후 재직분, 30년까지)
  const perYear = (rate2026 / 100) * ((1 / 1.7) * NATIONAL_AVG_INCOME_2026 + (0.7 / 1.7) * own);
  return [
    `평균의 ${Math.round(k * 100)}% (${man(own)})`,
    won(perYear),
    `${((perYear / own) * 100).toFixed(2)}%`,
    `${((perYear * 30) / own * 100).toFixed(1)}%`,
  ];
});
export const pensionAvg = NATIONAL_AVG_INCOME_2026;
export const pensionRate2026 = rate2026;

// ── 실업급여 ──
const MONTH_DAYS = 91; // 계산기와 같은 3개월 근사 일수
const lowerMonthly = (DAILY_LOWER_LIMIT / BENEFIT_RATE) * (MONTH_DAYS / 3);
const upperMonthly = (DAILY_UPPER_LIMIT / BENEFIT_RATE) * (MONTH_DAYS / 3);
export const ubThreshold = { lowerMonthly, upperMonthly, lower: DAILY_LOWER_LIMIT, upper: DAILY_UPPER_LIMIT };
const UB_LABELS = ["1년 미만", "1~3년", "3~5년", "5~10년", "10년 이상"];
export const ubScheduleRows = UB_LABELS.map((l, i) => [
  l,
  `${UB_SCHEDULE.under50[i]}일`,
  `${UB_SCHEDULE.over50OrDisabled[i]}일`,
  `${won(DAILY_LOWER_LIMIT * UB_SCHEDULE.under50[i])} ~ ${won(DAILY_UPPER_LIMIT * UB_SCHEDULE.under50[i])}`,
]);
export const ubExample = calcUnemploymentBenefit({ monthlyWageManwon: 250, ageGroup: "under50", insuredMonths: 48 });

// ── 육아휴직 ──
const PL_WAGES = [2000000, 2500000, 3000000, 4000000];
export const parentalRows = PL_WAGES.map((w) => [
  `월 ${man(w)}`,
  won(calcParentalLeave(w, 12, "general").total),
  won(calcParentalLeave(w, 12, "single-parent").total),
  won(calcParentalLeave(w, 12, "both-parents").total),
]);
const pl300 = calcParentalLeave(3000000, 12, "general");
export const parental300 = {
  total: pl300.total,
  m1: pl300.breakdown[0].amount,
  m4: pl300.breakdown[3].amount,
  m7: pl300.breakdown[6].amount,
  ratio: (pl300.total / (3000000 * 12)) * 100,
};

// ── 퇴직금: 상여금 반영 효과 ──
const rp = (bonusManwon: number, years: number) =>
  calcRetirementPay({
    hireDate: new Date(`${2026 - years}-07-01`),
    retireDate: new Date("2026-07-01"),
    monthlyWageManwon: 300,
    annualBonusManwon: bonusManwon,
    unusedLeavePayManwon: 0,
  });
export const retireBonusRows = [0, 400, 600].map((b) => [
  b === 0 ? "상여금 없음" : `연 상여금 ${b}만 원`,
  won(rp(b, 3).averageDailyWage),
  won(rp(b, 3).retirementPay),
  won(rp(b, 10).retirementPay),
]);
export const retireWindowDays = rp(0, 3).threeMonthWindowDays;

// ════════ 3차 묶음 ════════

// ── 손익분기 ──
export const breakevenRows = [3000000, 5000000, 8000000].map((fixed) => [
  `월 ${man(fixed)}`,
  ...[0.3, 0.5, 0.7].map((m) => man(fixed / m)),
]);
const BE = { fixed: 5000000, margin: 0.6, sales: 12000000 };
const profitAt = (sales: number) => sales * BE.margin - BE.fixed;
export const breakevenShock = {
  ...BE,
  be: BE.fixed / BE.margin,
  profit: profitAt(BE.sales),
  rows: [0, 0.2, 0.4].map((drop) => {
    const s = BE.sales * (1 - drop);
    const p = profitAt(s);
    return [drop === 0 ? "정상 매출" : `${drop * 100}% 감소`, man(s), `${p < 0 ? "−" : ""}${man(Math.abs(p))}`];
  }),
};

// ── FIRE ──
export const fireNumberRows = [2000000, 3000000, 4000000].map((m) => [
  `월 ${man(m)}`,
  ...[0.03, 0.035, 0.04].map((wr) => man((m * 12) / wr)),
]);
export const fireTimeRows = [1000000, 2000000, 3000000].map((save) => [
  `월 ${man(save)}`,
  ...[2, 4, 6].map((r) => formatMonths(monthsToGoal(save, (3000000 * 12) / 0.04, r)!)),
]);
export const fireTarget = (3000000 * 12) / 0.04;

// ── 4대보험 항목별 ──
export const insuranceRows = [2500000, 4000000, 7000000, 10000000].map((m) => {
  const r = calcWorkerNet(m * 12, 1);
  const d = r.deductions;
  const ins = d.slice(0, 4).reduce((a, x) => a + x.value, 0);
  return [`월 ${man(m)}`, won(d[0].value), won(d[1].value), won(d[2].value), won(d[3].value), `${((ins / m) * 100).toFixed(2)}%`];
});

// ── 지역가입자 ──
export const npPremiumRows = [LOWER_INCOME_LIMIT, 1000000, 2000000, 3000000, 5000000, UPPER_INCOME_LIMIT].map((inc) => {
  const r = calcNationalPensionPremium(inc);
  return [man(inc), won(r.premium), won(r.employeeShareIfWorkplace), won(r.premium * 12)];
});
const NP_SCHEDULE = [2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033].map((y, i) => ({ y, rate: NP_RATE + 0.005 * i }));
export const npScheduleRows = NP_SCHEDULE.map(({ y, rate }) => [
  `${y}년`,
  `${(rate * 100).toFixed(1)}%`,
  won(3000000 * rate),
  won(3000000 * rate * 12),
]);
export const npLimits = { lower: LOWER_INCOME_LIMIT, upper: UPPER_INCOME_LIMIT };

// ── 출산휴가 최저임금 하한 ──
export const maternityFloor = MIN_HOURLY_WAGE * STANDARD_MONTHLY_HOURS;
export const maternityFloorRows = [180, 200, 215, 250].map((w) => {
  const r = calcMaternityLeavePay(w, "priority", false);
  return [`월 ${w}만 원`, won(w * 10000 * 3), won(r.totalAmount), r.floorApplied ? "최저임금 기준" : "통상임금 기준"];
});

// ── 도약계좌: 납입액 × 소득구간 월 기여금 ──
const LEAP_PAID = LEAP_TIERS.filter((x) => x.base > 0);
export const leapMatrixHead = ["월 납입액", "총급여 2,400만 원 이하", "2,400만~3,600만 원", "3,600만~4,800만 원", "4,800만~6,000만 원"];
export const leapMatrixRows = [300000, 400000, 500000, 600000, 700000].map((m) => [
  `월 ${man(m)}`,
  ...LEAP_PAID.map((x) => won(leapMonthlyMatch(m, x.id))),
]);
const lm = leapMonthlyMatch(700000, "t2400");
export const leapEarly = { monthly: lm, full: lm * 60, at36: lm * 36 * 0.6 };

// ── 미래적금 금리별 ──
export const youthRateRows = [5, 6, 7, 8].map((r) => [
  `연 ${r}%`,
  won(calcYouthFuture(500000, "general", r).total),
  won(calcYouthFuture(500000, "premium", r).total),
]);

// ── 1억 모으기 중간 목표 ──
export const milestoneRows = [30000000, 50000000, 70000000, EOK].map((g) => {
  const n = monthsToGoal(1000000, g, 3)!;
  return [man(g), formatMonths(n), `${n}개월`];
});
