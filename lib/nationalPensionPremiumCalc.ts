// 국민연금 지역가입자 보험료 계산 로직
// 근거: 국민연금법 제3조·제88조, 보건복지부 고시(기준소득월액 상하한액), 국민연금공단(nps.or.kr)
// 2026.7.1~2027.6.30 기준소득월액: 하한 410,000원 / 상한 6,590,000원
// 2026년 보험료율: 9.5% (2025년까지 9% → 2026년부터 매년 0.5%p씩 인상, 2033년 13% 도달)

export const LOWER_INCOME_LIMIT = 410_000;
export const UPPER_INCOME_LIMIT = 6_590_000;
export const RATE = 0.095;

// 저소득 지역가입자 보험료 지원제도 기준(참고용 안내에만 사용, 계산에는 반영하지 않음)
export const LOW_INCOME_SUPPORT_THRESHOLD = 800_000; // 기준소득월액 80만원 미만

export function calcNationalPensionPremium(monthlyIncome: number) {
  const standardIncome = Math.min(Math.max(monthlyIncome, LOWER_INCOME_LIMIT), UPPER_INCOME_LIMIT);
  const premium = Math.round(standardIncome * RATE);
  const employeeShareIfWorkplace = Math.round(premium / 2); // 직장가입자였다면 본인부담분(회사와 절반씩)
  const capApplied = monthlyIncome > UPPER_INCOME_LIMIT;
  const floorApplied = monthlyIncome > 0 && monthlyIncome < LOWER_INCOME_LIMIT;
  const lowIncomeSupportEligible = standardIncome < LOW_INCOME_SUPPORT_THRESHOLD;

  return {
    standardIncome,
    premium,
    employeeShareIfWorkplace,
    capApplied,
    floorApplied,
    lowIncomeSupportEligible,
  };
}
