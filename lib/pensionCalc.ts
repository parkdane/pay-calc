// 공무원연금 예상수령액 계산 라이브러리
// 검증 완료: pensionCalc.js(35/35), careerSimulator.js(22/22) 로직을 TS로 포팅

export type HistoryRow =
  | { hobong: number; values: (number | null)[] } // multi_column
  | { hobong: number; value: number | null }; // single_column

export type HistorySnapshot = {
  efYd: string; // YYYYMMDD
  format: "multi_column" | "single_column";
  rows: HistoryRow[];
};

export type CareerSegment = {
  startDate: string; // YYYY-MM-DD
  grade: string | null; // "9급" 등, single_column 직군은 null
  startHobong: number;
};

// ── 1. 연도별 연금지급률 (2016년 1.878% -> 2035년 1.7%, 검증됨: 2026=1.736%) ──
export function getPayoutRate(year: number): number | null {
  if (year < 2016) return null;
  if (year >= 2035) return 1.7;
  if (year <= 2020) return 1.878 - 0.022 * (year - 2016);
  if (year <= 2025) return 1.79 - 0.01 * (year - 2020);
  return 1.736 - 0.004 * (year - 2026);
}

export const NATIONAL_AVG_INCOME_2026 = 5_710_000;

// ── 2. 재직기간 3구간 분할 ──
export function splitServicePeriods(hireDate: string, retireDate: string) {
  const hire = new Date(hireDate);
  const retire = new Date(retireDate);
  const tier1End = new Date("2010-01-01");
  const tier2End = new Date("2016-01-01");

  function overlapYears(periodStart: Date, periodEnd: Date) {
    const start = hire > periodStart ? hire : periodStart;
    const end = retire < periodEnd ? retire : periodEnd;
    if (end <= start) return 0;
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  }

  return {
    tier1Years: overlapYears(new Date("1900-01-01"), tier1End),
    tier2Years: overlapYears(tier1End, tier2End),
    tier3Years: overlapYears(tier2End, new Date("2100-01-01")),
  };
}

// ── 3. 구간별 연금액 계산 ──
export function calcTier1(avgMonthlyPay: number, tier1Years: number, totalYears: number) {
  if (tier1Years <= 0 || totalYears <= 0) return 0;
  const rate = totalYears >= 20 ? 0.5 + (totalYears - 20) * 0.02 : totalYears * 0.025;
  const tier1Share = tier1Years / totalYears;
  return avgMonthlyPay * rate * tier1Share;
}

export function calcTier2(avgMonthlyIncomeTier2: number, tier2Years: number) {
  if (tier2Years <= 0) return 0;
  return avgMonthlyIncomeTier2 * tier2Years * 0.019;
}

export function calcTier3(
  avgMonthlyIncomeTier3: number,
  tier3Years: number,
  avgPayoutRatePercent: number
) {
  if (tier3Years <= 0) return 0;
  const rate = avgPayoutRatePercent / 100;
  const redistributionYears = Math.min(tier3Years, 30);
  const nonRedistributionYears = Math.max(tier3Years - 30, 0);

  const equalPart = (1 / 1.7) * rate * NATIONAL_AVG_INCOME_2026 * redistributionYears;
  const proportionalPart =
    (0.7 / 1.7) * rate * avgMonthlyIncomeTier3 * redistributionYears +
    rate * avgMonthlyIncomeTier3 * nonRedistributionYears;

  return equalPart + proportionalPart;
}

export function applyEarlyRetirementReduction(pension: number, yearsBeforeEligibleAge: number) {
  const cappedYears = Math.min(Math.max(yearsBeforeEligibleAge, 0), 5);
  return pension * (1 - cappedYears * 0.05);
}

export function applyCap(pension: number, avgPayLast5Years: number) {
  const cap = avgPayLast5Years * 0.76;
  return Math.min(pension, cap);
}

// ── 4. 재직기간 실소득 시뮬레이터 ──
function findSnapshotForDate(historicalData: HistorySnapshot[], dateStr: string) {
  const target = dateStr.replace(/-/g, "");
  let result = historicalData[0];
  for (const snap of historicalData) {
    if (snap.efYd <= target) result = snap;
    else break;
  }
  return result;
}

function lookupPay(snapshot: HistorySnapshot, gradeColumnIndex: number | null, hobong: number) {
  if (!snapshot || !snapshot.rows || snapshot.rows.length === 0) return null;

  if (snapshot.format === "single_column") {
    const rows = snapshot.rows as { hobong: number; value: number | null }[];
    const exact = rows.find((r) => r.hobong === hobong);
    if (exact && exact.value != null) return exact.value;
    // 최대 정의 호봉을 넘으면 그 이하 중 값이 있는 가장 높은 호봉으로 고정(호봉상한 동결)
    const candidates = rows.filter((r) => r.hobong <= hobong && r.value != null);
    if (candidates.length === 0) return null;
    candidates.sort((a, b) => b.hobong - a.hobong);
    return candidates[0].value;
  }

  if (gradeColumnIndex === null) return null;
  const rows = snapshot.rows as { hobong: number; values: (number | null)[] }[];
  const exact = rows.find((r) => r.hobong === hobong);
  if (exact && exact.values[gradeColumnIndex] != null) return exact.values[gradeColumnIndex];
  // 이 급수 컬럼에서 값이 있는 것 중, 요청 호봉 이하로 가장 가까운 호봉의 값으로 고정
  const candidates = rows.filter((r) => r.hobong <= hobong && r.values[gradeColumnIndex] != null);
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => b.hobong - a.hobong);
  return candidates[0].values[gradeColumnIndex];
}

export function gradeToColumnIndex(gradeLabel: string, gradeList: readonly string[]): number | null {
  const idx = gradeList.indexOf(gradeLabel);
  return idx === -1 ? null : idx;
}

export type CareerYear = {
  date: string;
  year: number;
  grade: string | null;
  hobong: number;
  pay: number | null;
};

export function simulateCareer(
  historicalData: HistorySnapshot[],
  segments: CareerSegment[],
  hireDate: string,
  retireDate: string,
  gradeList: readonly string[] = []
): CareerYear[] {
  const sorted = [...segments].sort((a, b) => (a.startDate > b.startDate ? 1 : -1));
  const results: CareerYear[] = [];

  const hire = new Date(hireDate);
  const retire = new Date(retireDate);
  const cursor = new Date(hire);

  while (cursor < retire) {
    const dateStr = cursor.toISOString().slice(0, 10);

    let seg = sorted[0];
    for (const s of sorted) {
      if (new Date(s.startDate) <= cursor) seg = s;
      else break;
    }

    const yearsSinceSegStart =
      (cursor.getTime() - new Date(seg.startDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    const hobong = seg.startHobong + Math.floor(yearsSinceSegStart);

    const snapshot = findSnapshotForDate(historicalData, dateStr);
    const gradeColumnIndex = seg.grade ? gradeToColumnIndex(seg.grade, gradeList) : null;
    const pay = lookupPay(snapshot, gradeColumnIndex, hobong);

    results.push({ date: dateStr, year: cursor.getFullYear(), grade: seg.grade, hobong, pay });

    cursor.setFullYear(cursor.getFullYear() + 1);
  }

  return results;
}

export function aggregateByTier(careerResults: CareerYear[]) {
  const buckets: { tier1: number[]; tier2: number[]; tier3: number[] } = {
    tier1: [],
    tier2: [],
    tier3: [],
  };
  for (const r of careerResults) {
    if (r.pay == null) continue;
    if (r.year < 2010) buckets.tier1.push(r.pay);
    else if (r.year < 2016) buckets.tier2.push(r.pay);
    else buckets.tier3.push(r.pay);
  }
  const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
  return {
    avgTier1: avg(buckets.tier1),
    avgTier2: avg(buckets.tier2),
    avgTier3: avg(buckets.tier3),
    countTier1: buckets.tier1.length,
    countTier2: buckets.tier2.length,
    countTier3: buckets.tier3.length,
  };
}

export function avgLastNYears(careerResults: CareerYear[], n = 5) {
  const valid = careerResults.filter((r) => r.pay != null) as (CareerYear & { pay: number })[];
  const lastN = valid.slice(-n);
  if (lastN.length === 0) return 0;
  return lastN.reduce((s, r) => s + r.pay, 0) / lastN.length;
}

// ── 5. 연금개시가능연령 (근사치: 2010년 이후 임용자는 65세 고정.
//      1996~2009년 임용자는 60~64세로 더 빠를 수 있으나 정확한 단계적 기준을
//      확보하지 못해 65세로 보수적 근사 처리. 실제로는 더 일찍 받을 수 있음) ──
export function estimateEligibleAge(hireDate: string): number {
  return 65;
}

// ── 6-M. 군인연금 전용 산식 (공무원연금과 구조 자체가 다름) ──
// 확인된 사실:
//  - 2단계 구조 (2013.7.1 시행일 기준, 공무원연금의 2010/2016과 무관한 별도 기준)
//  - 소득재분배(균등+비례) 없음 -> 신법기간은 단순 1.9%/년 정률
//  - 상한 62.7% (공무원연금 76%와 다름)
//  - 최소 20년(19년6개월 이상은 20년으로 인정) 미만 복무는 월연금이 아니라 일시금 대상
//  - 수급개시 연령 제한 없음 (전역 즉시 수급, 조기퇴직 감액 로직 적용 안 함)
//  - "이행률"(신법기간에 곱하는 전환계수) 정확한 스케줄 미확보 -> 100%로 근사
const MILITARY_REFORM_DATE = "2013-07-01";
const MILITARY_TRANSITION_RATE_APPROX = 1.0; // 근사치, 실제 스케줄 미확인

export function splitMilitaryPeriods(hireDate: string, retireDate: string) {
  const hire = new Date(hireDate);
  const retire = new Date(retireDate);
  const cutoff = new Date(MILITARY_REFORM_DATE);

  function overlapYears(periodStart: Date, periodEnd: Date) {
    const start = hire > periodStart ? hire : periodStart;
    const end = retire < periodEnd ? retire : periodEnd;
    if (end <= start) return 0;
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  }

  return {
    legacyYears: overlapYears(new Date("1900-01-01"), cutoff),
    newYears: overlapYears(cutoff, new Date("2100-01-01")),
  };
}

export function calcMilitaryLegacyPart(
  avgIncomeLegacy: number,
  legacyYears: number,
  totalYears: number
) {
  if (legacyYears <= 0 || totalYears <= 0) return 0;
  const rate = 0.5 + Math.max(totalYears - 20, 0) * 0.02;
  return avgIncomeLegacy * rate * (legacyYears / totalYears);
}

export function calcMilitaryNewPart(
  avgIncomeNew: number,
  newYears: number,
  transitionRate: number = MILITARY_TRANSITION_RATE_APPROX
) {
  if (newYears <= 0) return 0;
  return avgIncomeNew * newYears * 0.019 * transitionRate;
}

export function applyMilitaryCap(pension: number, avgIncome: number) {
  const cap = avgIncome * 0.627;
  return Math.min(pension, cap);
}

export function calcMilitaryPension(params: {
  historicalData: HistorySnapshot[];
  segments: CareerSegment[];
  hireDate: string;
  retireDate: string;
  gradeColumns: readonly string[];
}) {
  const { historicalData, segments, hireDate, retireDate, gradeColumns } = params;

  const careerResults = simulateCareer(historicalData, segments, hireDate, retireDate, gradeColumns);
  const periods = splitMilitaryPeriods(hireDate, retireDate);
  const totalYears = periods.legacyYears + periods.newYears;

  const eligible = totalYears >= 19.5;

  const legacyIncomes = careerResults
    .filter((r) => r.year < 2013 || (r.year === 2013 && new Date(r.date) < new Date(MILITARY_REFORM_DATE)))
    .map((r) => r.pay)
    .filter((p): p is number => p != null);
  const newIncomes = careerResults
    .filter((r) => r.year > 2013 || (r.year === 2013 && new Date(r.date) >= new Date(MILITARY_REFORM_DATE)))
    .map((r) => r.pay)
    .filter((p): p is number => p != null);

  const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
  const avgIncomeLegacy = avg(legacyIncomes);
  const avgIncomeNew = avg(newIncomes);

  const legacyPart = calcMilitaryLegacyPart(avgIncomeLegacy, periods.legacyYears, totalYears);
  const newPart = calcMilitaryNewPart(avgIncomeNew, periods.newYears);
  const beforeCap = legacyPart + newPart;

  // 상한 기준 소득: 전체 재직기간 평균 (신법기간 평균을 대표값으로 근사 사용, 신법기간 없으면 구법 평균 사용)
  const capBaseIncome = avgIncomeNew > 0 ? avgIncomeNew : avgIncomeLegacy;
  const finalPension = applyMilitaryCap(beforeCap, capBaseIncome);

  return {
    eligible,
    totalYears,
    periods,
    avgIncomeLegacy,
    avgIncomeNew,
    legacyPart,
    newPart,
    beforeCap,
    finalPension: eligible ? finalPension : 0,
    wasCapApplied: eligible && finalPension < beforeCap,
    careerResults,
  };
}

// ── 6. 전체 파이프라인 ──
export function calcPension(params: {
  historicalData: HistorySnapshot[];
  segments: CareerSegment[];
  hireDate: string;
  retireDate: string;
  retireAge: number;
  gradeColumns: readonly string[];
}) {
  const { historicalData, segments, hireDate, retireDate, retireAge, gradeColumns } = params;

  const careerResults = simulateCareer(historicalData, segments, hireDate, retireDate, gradeColumns);
  const periods = splitServicePeriods(hireDate, retireDate);
  const totalYears = periods.tier1Years + periods.tier2Years + periods.tier3Years;
  const agg = aggregateByTier(careerResults);

  const retireYear = new Date(retireDate).getFullYear();
  const payoutRate = getPayoutRate(retireYear) ?? 1.7;

  const t1 = calcTier1(agg.avgTier1, periods.tier1Years, totalYears);
  const t2 = calcTier2(agg.avgTier2, periods.tier2Years);
  const t3 = calcTier3(agg.avgTier3, periods.tier3Years, payoutRate);

  let pension = t1 + t2 + t3;

  const eligibleAge = estimateEligibleAge(hireDate);
  const yearsEarly = Math.max(eligibleAge - retireAge, 0);
  pension = applyEarlyRetirementReduction(pension, yearsEarly);

  const last5avg = avgLastNYears(careerResults, 5);
  const cappedPension = applyCap(pension, last5avg);
  const eligible = totalYears >= 10; // 최소재직요건 10년 (2016년 개혁 이후 기준, 확인됨)

  return {
    eligible,
    totalYears,
    periods,
    tierIncomes: agg,
    tierPensions: { t1, t2, t3 },
    payoutRate,
    beforeCap: pension,
    finalPension: cappedPension,
    wasCapApplied: cappedPension < pension,
    yearsEarly,
    eligibleAge,
    careerResults,
  };
}
