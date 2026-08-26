// 육아휴직급여 계산 로직
// 근거: 고용보험법 시행령 제95조(육아휴직 급여), 제95조의3(출생 후 18개월 이내 자녀에 대한 특례)
//   - 제95조의3①: "6+6 부모육아휴직제" — 부모 모두 육아휴직 사용 시 첫 6개월 상한액 상향
//   - 제95조의3③: 한부모가족지원법상 한부모 특례 — 1~3개월 상한액만 300만원으로 상향(그 외 구간은 일반과 동일)
// 2024.12.24 개정, 2025.1.1 시행 기준 (사후지급금 제도 폐지, 상한액 인상 반영)

export type LeaveMode = "general" | "single-parent" | "both-parents";

export const LOWER_LIMIT = 700_000; // 하한액 70만원 (전 유형 공통)

// 일반 (제95조): 1~3개월 상한 250만원 / 4~6개월 상한 200만원 / 7개월~ 통상임금 80%, 상한 160만원
function generalMonthlyAmount(ordinaryWage: number, monthIndex: number): number {
  if (monthIndex <= 3) return clamp(ordinaryWage, LOWER_LIMIT, 2_500_000);
  if (monthIndex <= 6) return clamp(ordinaryWage, LOWER_LIMIT, 2_000_000);
  return clamp(ordinaryWage * 0.8, LOWER_LIMIT, 1_600_000);
}

// 한부모가족 특례 (제95조의3③): 1~3개월만 상한 300만원으로 상향, 4개월째부터는 일반과 동일
function singleParentMonthlyAmount(ordinaryWage: number, monthIndex: number): number {
  if (monthIndex <= 3) return clamp(ordinaryWage, LOWER_LIMIT, 3_000_000);
  return generalMonthlyAmount(ordinaryWage, monthIndex);
}

// 6+6 부모육아휴직 특례 (제95조의3①): 부모 모두 사용 시 첫 6개월 상한액이 계단식으로 상승, 7개월째부터 일반 규정 복귀
const BOTH_PARENTS_CAPS = [2_500_000, 2_500_000, 3_000_000, 3_500_000, 4_000_000, 4_500_000]; // 1~6개월차

function bothParentsMonthlyAmount(ordinaryWage: number, monthIndex: number): number {
  if (monthIndex <= 6) return clamp(ordinaryWage, LOWER_LIMIT, BOTH_PARENTS_CAPS[monthIndex - 1]);
  return generalMonthlyAmount(ordinaryWage, monthIndex);
}

function monthlyAmount(ordinaryWage: number, monthIndex: number, mode: LeaveMode): number {
  if (mode === "single-parent") return singleParentMonthlyAmount(ordinaryWage, monthIndex);
  if (mode === "both-parents") return bothParentsMonthlyAmount(ordinaryWage, monthIndex);
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
  mode: LeaveMode,
): { breakdown: MonthlyBreakdown[]; total: number } {
  const breakdown: MonthlyBreakdown[] = [];
  for (let m = 1; m <= months; m++) {
    // 지급률(100% vs 80%)은 유형 공통으로 "1~6개월째=100%, 7개월째~=80%" — 유형별로 다른 건 상한액뿐
    const rawFullAmount = m <= 6 ? ordinaryWage : ordinaryWage * 0.8;
    const amount = monthlyAmount(ordinaryWage, m, mode);
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
