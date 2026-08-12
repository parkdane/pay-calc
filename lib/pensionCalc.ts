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
    const row = snapshot.rows.find((r) => r.hobong === hobong) as
      | { hobong: number; value: number | null }
      | undefined;
    return row ? row.value : null;
  }
  const row = snapshot.rows.find((r) => r.hobong === hobong) as
    | { hobong: number; values: (number | null)[] }
    | undefined;
  if (!row || gradeColumnIndex === null) return null;
  const v = row.values[gradeColumnIndex];
  return v === undefined ? null : v;
}

export function gradeToColumnIndex(gradeLabel: string): number | null {
  const m = gradeLabel.match(/(\d+)급/);
  if (!m) return null;
  return parseInt(m[1], 10) - 1;
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
  retireDate: string
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
    const gradeColumnIndex = seg.grade ? gradeToColumnIndex(seg.grade) : null;
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

// ── 6. 전체 파이프라인 ──
export function calcPension(params: {
  historicalData: HistorySnapshot[];
  segments: CareerSegment[];
  hireDate: string;
  retireDate: string;
  retireAge: number;
}) {
  const { historicalData, segments, hireDate, retireDate, retireAge } = params;

  const careerResults = simulateCareer(historicalData, segments, hireDate, retireDate);
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

  return {
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
