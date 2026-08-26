// 실업급여(구직급여) 계산 로직
// 근거: 고용보험법 제46조(구직급여일액), 제48조·제50조(수급기간·소정급여일수, 별표1), 제49조(대기기간)
// 2026년 기준: 1일 상한액 68,100원 / 하한액 66,048원(2026년 최저임금 10,320원×80%×8시간)
// 소정급여일수는 2019.10.1 이후 이직자 기준(고용보험법 별표1, 2019.8.27 개정)

export const DAILY_UPPER_LIMIT = 68_100;
export const DAILY_LOWER_LIMIT = 66_048;
export const BENEFIT_RATE = 0.6;
export const WAITING_DAYS = 7; // 대기기간(고용보험법 제49조)
export const MIN_INSURED_DAYS = 180; // 최소 피보험단위기간(고용보험법 제40조)

export type AgeGroup = "under50" | "over50OrDisabled";

// 고용보험법 별표1 — [연령그룹][가입기간구간] = 소정급여일수
const SCHEDULE: Record<AgeGroup, number[]> = {
  // 가입기간: 1년미만 / 1~3년 / 3~5년 / 5~10년 / 10년이상
  under50: [120, 150, 180, 210, 240],
  over50OrDisabled: [120, 180, 210, 240, 270],
};

function insuredMonthsToBracket(months: number): number {
  if (months < 12) return 0;
  if (months < 36) return 1;
  if (months < 60) return 2;
  if (months < 120) return 3;
  return 4;
}

export type UnemploymentBenefitInput = {
  monthlyWageManwon: number; // 이직 전 평균 월급여
  ageGroup: AgeGroup;
  insuredMonths: number; // 고용보험 가입기간(피보험기간, 개월)
};

export type UnemploymentBenefitResult = {
  dailyWage: number; // 근사 1일 평균임금
  dailyBenefit: number; // 구직급여일액(상하한 적용)
  capApplied: boolean;
  floorApplied: boolean;
  prescribedDays: number; // 소정급여일수
  totalBenefit: number;
  insuredEligible: boolean; // 가입기간 180일(약 6개월) 이상인지
};

export function calcUnemploymentBenefit(input: UnemploymentBenefitInput): UnemploymentBenefitResult {
  const { monthlyWageManwon, ageGroup, insuredMonths } = input;
  const monthlyWage = monthlyWageManwon * 10000;

  // 이직 전 3개월 임금총액을 91일(3개월 근사 일수)로 나눈 값 — 실제 산정기간은 89~92일로 사람마다 다름
  const dailyWage = (monthlyWage * 3) / 91;
  const rawBenefit = dailyWage * BENEFIT_RATE;
  const dailyBenefit = Math.min(Math.max(rawBenefit, DAILY_LOWER_LIMIT), DAILY_UPPER_LIMIT);

  const bracket = insuredMonthsToBracket(insuredMonths);
  const prescribedDays = SCHEDULE[ageGroup][bracket];

  const totalBenefit = dailyBenefit * prescribedDays;
  const insuredEligible = insuredMonths * 30 >= MIN_INSURED_DAYS; // 개월수를 일수로 근사 환산

  return {
    dailyWage,
    dailyBenefit,
    capApplied: rawBenefit > DAILY_UPPER_LIMIT,
    floorApplied: rawBenefit < DAILY_LOWER_LIMIT,
    prescribedDays,
    totalBenefit,
    insuredEligible,
  };
}
