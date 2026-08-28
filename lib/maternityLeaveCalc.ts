// 출산전후휴가급여 계산 로직
// 근거: 근로기준법 제74조(출산전후휴가), 고용보험법 제75조·제76조, 고용보험법 시행령 제101조(상하한액)
// - 출산전후휴가: 90일(다태아 120일), 최초 60일(다태아 75일)은 유급
// - 우선지원대상기업: 전체 기간(90일/120일)을 고용보험이 지급
// - 대규모기업(대기업): 최초 60일/75일은 회사가 통상임금 100% 직접 지급(고용보험 지원 없음),
//   이후 30일/45일만 고용보험이 지급
// - 상한액: 2026년 월 220만원(90일 총액 660만원, 다태아 120일 총액 880만원)
// - 하한액: 시간급 통상임금이 시간급 최저임금(2026년 10,320원)보다 낮으면 최저임금 기준으로 계산
// - 월 환산시간 209시간(주 40시간제 기준, 주휴시간 포함) 사용

export const MONTHLY_CAP = 2_200_000;
export const MIN_HOURLY_WAGE = 10_320;
export const STANDARD_MONTHLY_HOURS = 209;

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

  const totalLeaveDays = isMultiple ? 120 : 90;
  const companyPaidDays = companySize === "large" ? (isMultiple ? 75 : 60) : 0;
  const govPaidDays = totalLeaveDays - companyPaidDays;

  // 회사부담분(대기업 최초 60/75일)은 상한 없이 통상임금 100% 그대로
  const dailyOrdinary = monthlyWage / 30;
  const companyPaidAmount = dailyOrdinary * companyPaidDays;
  const govPaidAmount = dailyGovAmount * govPaidDays;

  const totalAmount = companyPaidAmount + govPaidAmount;

  return {
    totalLeaveDays,
    companyPaidDays,
    govPaidDays,
    companyPaidAmount,
    govPaidAmount,
    totalAmount,
    dailyGovAmount,
    capApplied,
    floorApplied,
  };
}
