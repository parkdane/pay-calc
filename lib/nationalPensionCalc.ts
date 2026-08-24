// 국민연금 예상수령액 계산 엔진
// 근거: 국민연금법 제51조·부칙 20조, 국민연금공단 공식 산식
//
// 기본연금액 = [2.4(A+0.75B)×P1/P + 1.8(A+B)×P2/P + (2008~2025년, 연도별 1.5→1.245로 선형감소)×(A+B)×Pn/P
//              + 1.29(A+B)×P21/P(2026년 이후)] × (1+0.05×n/12)
//
// A = 2026년 적용 A값(전체가입자 3년평균소득월액) 3,193,511원
// B = 개인 가입기간 평균소득월액(재평가 후) - 사용자가 직접 입력(공식 계산기들의 표준 방식)
// n = 20년(240개월) 초과 가입월수

export const A_VALUE_2026 = 3193511;

// 20년 초과 시 연 5% 가산에 쓰이는 기준월수
const BONUS_THRESHOLD_MONTHS = 240;

// 출생연도별 노령연금 지급개시연령 (국민연금법 부칙, 1953년생부터 4년마다 1세씩 상향)
export function getEligibleAge(birthYear: number): number {
  if (birthYear <= 1952) return 60;
  if (birthYear <= 1956) return 61;
  if (birthYear <= 1960) return 62;
  if (birthYear <= 1964) return 63;
  if (birthYear <= 1968) return 64;
  return 65;
}

// 연도별 소득대체 승수 (2008~2025년은 매년 0.015씩 선형 감소, 2026년 이후는 2025년 연금개혁으로
// 43% 목표(승수 1.29)로 재조정 -> 2026년 이후 승수는 1.29로 고정 근사. 실제로는 2027년 이후
// 추가 조정 여지가 있으나 확정된 자료를 확보하지 못해 근사 처리함)
function multiplierForYear(year: number): number {
  if (year <= 1998) return 2.4; // B는 0.75배만 반영(별도 처리)
  if (year <= 2007) return 1.8;
  if (year <= 2025) return 1.5 - 0.015 * (year - 2008);
  return 1.29; // 2026년 이후 근사(2025년 연금개혁 반영, 43% 목표)
}

export type MonthlyContribution = { year: number; months: number };

// 가입기간(년월)을 연도별 개월수로 분해
export function splitByYear(startYear: number, startMonth: number, endYear: number, endMonth: number): MonthlyContribution[] {
  const result: MonthlyContribution[] = [];
  let y = startYear;
  let m = startMonth;
  while (y < endYear || (y === endYear && m <= endMonth)) {
    const existing = result.find((r) => r.year === y);
    if (existing) existing.months += 1;
    else result.push({ year: y, months: 1 });
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  return result;
}

export function calcNationalPension(params: {
  startYear: number;
  startMonth: number;
  endYear: number;
  endMonth: number;
  avgMonthlyIncome: number; // B값 (사용자 입력, 만원 아님 원 단위)
  claimType: "early" | "normal" | "deferred";
  claimYearsShift: number; // 조기/연기 연수 (0~5)
  dependents: { spouse: boolean; childrenOrParents: number; disabledChildren: number };
}) {
  const { startYear, startMonth, endYear, endMonth, avgMonthlyIncome, claimType, claimYearsShift, dependents } = params;

  const monthly = splitByYear(startYear, startMonth, endYear, endMonth);
  const totalMonths = monthly.reduce((s, m) => s + m.months, 0);
  const totalYears = totalMonths / 12;

  const eligible = totalMonths >= 120; // 최소가입기간 10년(120개월)

  const A = A_VALUE_2026;
  const B = avgMonthlyIncome;

  let weightedSum = 0;
  for (const { year, months } of monthly) {
    const mult = multiplierForYear(year);
    const base = year <= 1998 ? A + 0.75 * B : A + B;
    weightedSum += mult * base * (months / totalMonths || 0);
  }

  const bonusMonths = Math.max(0, totalMonths - BONUS_THRESHOLD_MONTHS);
  const bonusFactor = 1 + (0.05 * bonusMonths) / 12;

  // 공식 산식의 "기본연금액"은 연액 기준으로 산출되므로 12로 나눠 월액으로 환산
  const basePension = (weightedSum * bonusFactor) / 12;

  // 조기/연기 감액·가산 (연 6% 감액, 연 7.2% 가산, 최대 5년)
  const shift = Math.min(Math.max(claimYearsShift, 0), 5);
  let claimFactor = 1;
  if (claimType === "early") claimFactor = 1 - 0.06 * shift;
  if (claimType === "deferred") claimFactor = 1 + 0.072 * shift;

  const adjustedPension = basePension * claimFactor;

  // 부양가족연금액 (2026년 기준, 연 단위 금액을 12로 나눠 월 환산)
  const SPOUSE_ANNUAL = 260720;
  const CHILD_PARENT_ANNUAL = 173770;
  const DISABLED_CHILD_ANNUAL = 204360;
  const dependentAnnual =
    (dependents.spouse ? SPOUSE_ANNUAL : 0) +
    dependents.childrenOrParents * CHILD_PARENT_ANNUAL +
    dependents.disabledChildren * DISABLED_CHILD_ANNUAL;
  const dependentMonthly = dependentAnnual / 12;

  const finalPension = eligible ? adjustedPension + dependentMonthly : 0;

  return {
    eligible,
    totalYears,
    totalMonths,
    basePension,
    claimFactor,
    adjustedPension,
    dependentMonthly,
    finalPension,
  };
}
