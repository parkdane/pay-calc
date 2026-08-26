// 육아휴직급여 계산 로직
// 근거: 고용보험법 시행령 제95조(육아휴직 급여), 제95조의3(출생 후 18개월 이내 자녀에 대한 특례, "6+6 부모육아휴직제")
// 2024.12.24 개정, 2025.1.1 시행 기준 (사후지급금 제도 폐지, 상한액 인상 반영)

export const LOWER_LIMIT = 700_000; // 하한액 70만원 (일반·특례 공통)

// 일반 육아휴직급여 (제95조) — 부모 중 1인만 사용하거나 특례 요건 미해당 시
// 1~3개월: 상한 250만원 / 4~6개월: 상한 200만원 / 7개월~: 통상임금의 80%, 상한 160만원
function generalMonthlyAmount(ordinaryWage: number, monthIndex: number): number {
  // monthIndex: 1부터 시작 (1개월째, 2개월째, ...)
  if (monthIndex <= 3) {
    return clamp(ordinaryWage, LOWER_LIMIT, 2_500_000);
  }
  if (monthIndex <= 6) {
    return clamp(ordinaryWage, LOWER_LIMIT, 2_000_000);
  }
  return clamp(ordinaryWage * 0.8, LOWER_LIMIT, 1_600_000);
}

// 6+6 부모육아휴직 특례 (제95조의3) — 같은 자녀에 대해 부모 모두 육아휴직 사용 시 첫 6개월
// 통상임금 100%, 월별 상한액은 사용 개월차에 따라 계단식으로 증가. 7개월째부터는 일반 규정으로 복귀.
const SPECIAL_CAPS = [2_500_000, 2_500_000, 3_000_000, 3_500_000, 4_000_000, 4_500_000]; // 1~6개월차

function specialMonthlyAmount(ordinaryWage: number, monthIndex: number): number {
  if (monthIndex <= 6) {
    const cap = SPECIAL_CAPS[monthIndex - 1];
    return clamp(ordinaryWage, LOWER_LIMIT, cap);
  }
  return generalMonthlyAmount(ordinaryWage, monthIndex);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export type MonthlyBreakdown = {
  month: number;
  amount: number;
  capApplied: boolean; // 상한액에 걸려서 통상임금보다 적게 받는지
  floorApplied: boolean; // 하한액 적용됐는지
};

export function calcParentalLeave(
  ordinaryWage: number,
  months: number,
  isSpecialCase: boolean, // 6+6 특례 대상 여부 (부모 모두 육아휴직, 자녀 생후 18개월 이내)
): { breakdown: MonthlyBreakdown[]; total: number } {
  const breakdown: MonthlyBreakdown[] = [];
  for (let m = 1; m <= months; m++) {
    // 지급률(100% vs 80%)은 일반·특례 공통으로 "1~6개월째=100%, 7개월째~=80%" — 특례가 다른 건 상한액뿐
    const rawFullAmount = m <= 6 ? ordinaryWage : ordinaryWage * 0.8;
    const amount = isSpecialCase ? specialMonthlyAmount(ordinaryWage, m) : generalMonthlyAmount(ordinaryWage, m);
    breakdown.push({
      month: m,
      amount,
      capApplied: amount < rawFullAmount,
      floorApplied: amount === LOWER_LIMIT && rawFullAmount < LOWER_LIMIT,
    });
  }
  const total = breakdown.reduce((sum, b) => sum + b.amount, 0);
  return { breakdown, total };
}
