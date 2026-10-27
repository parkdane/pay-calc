// 출산전후휴가급여 계산 로직
// 근거: 근로기준법 제74조(출산전후휴가, 제4항 최초 60일 유급), 고용보험법 제75조·제76조,
//       고용보험법 시행령 제101조(상하한액), 남녀고용평등법 제18조 제2항(지급된 급여는 그 한도에서 사업주가 지급한 것으로 봄)
// - 출산전후휴가: 90일(다태아 120일), 최초 60일(다태아 75일)은 유급 → 이 기간은 회사 규모와 관계없이 통상임금 100%를 받음
// - 우선지원대상기업: 전체 기간(90일/120일)을 고용보험이 상한액 이내로 지급.
//   최초 60일/75일은 통상임금이 고용보험 지급액보다 많으면 그 차액을 회사가 지급
// - 대규모기업(대기업): 최초 60일/75일은 회사가 통상임금 100% 직접 지급(고용보험 지원 없음),
//   이후 30일/45일만 고용보험이 지급
// - 상한액: 2026년 월 220만원(90일 총액 660만원, 다태아 120일 총액 880만원)
// - 하한액: 시간급 통상임금이 시간급 최저임금(2026년 10,320원)보다 낮으면 최저임금 기준으로 계산
// - 월 환산시간 209시간(주 40시간제 기준, 주휴시간 포함) 사용, 일액은 월액 ÷ 30

export const MONTHLY_CAP = 2_200_000;
export const MIN_HOURLY_WAGE = 10_320;
export const STANDARD_MONTHLY_HOURS = 209;
export const LEAVE_DAYS = { single: 90, multiple: 120 } as const;
export const PAID_DAYS = { single: 60, multiple: 75 } as const; // 최초 유급 기간

export type CompanySize = "priority" | "large"; // 우선지원대상기업 / 대규모기업(대기업)

export function calcMaternityLeavePay(
  monthlyOrdinaryWageManwon: number,
  companySize: CompanySize,
  isMultiple: boolean, // 다태아 여부
) {
  const monthlyWage = monthlyOrdinaryWageManwon * 10000;
  const hourlyOrdinary = monthlyWage / STANDARD_MONTHLY_HOURS;
  const floorApplied = hourlyOrdinary < MIN_HOURLY_WAGE;
  const effectiveHourly = Math.max(hourlyOrdinary, MIN_HOURLY_WAGE);
  const effectiveMonthly = effectiveHourly * STANDARD_MONTHLY_HOURS;

  const capApplied = effectiveMonthly > MONTHLY_CAP;
  const cappedMonthly = Math.min(effectiveMonthly, MONTHLY_CAP);
  const dailyGovAmount = cappedMonthly / 30;
  const dailyOrdinary = monthlyWage / 30;

  const key = isMultiple ? "multiple" : "single";
  const totalLeaveDays = LEAVE_DAYS[key];
  const paidDays = PAID_DAYS[key];
  const restDays = totalLeaveDays - paidDays;

  let govPaidDays: number;
  let companyPaidDays: number; // 대기업: 회사가 전액 지급하는 일수 / 우선지원: 차액을 지급하는 일수
  let companyPaidAmount: number;
  if (companySize === "large") {
    companyPaidDays = paidDays;
    companyPaidAmount = dailyOrdinary * paidDays;
    govPaidDays = restDays;
  } else {
    govPaidDays = totalLeaveDays;
    const topUpDaily = Math.max(0, dailyOrdinary - dailyGovAmount);
    companyPaidDays = topUpDaily > 0 ? paidDays : 0;
    companyPaidAmount = topUpDaily * paidDays;
  }
  const govPaidAmount = dailyGovAmount * govPaidDays;
  const totalAmount = companyPaidAmount + govPaidAmount;

  return {
    totalLeaveDays,
    paidDays,
    restDays,
    companyPaidDays,
    govPaidDays,
    companyPaidAmount,
    govPaidAmount,
    totalAmount,
    dailyGovAmount,
    dailyOrdinary,
    capApplied,
    floorApplied,
    isTopUp: companySize === "priority" && companyPaidAmount > 0,
  };
}
