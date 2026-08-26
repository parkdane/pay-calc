// 일반 근로자 퇴직금 계산 로직
// 근거: 근로자퇴직급여보장법 제8조(퇴직금제도의 설정 등), 근로기준법 제2조제1항제6호·제2항(평균임금)
// 퇴직금 = 1일 평균임금 × 30일 × (계속근로기간(일) ÷ 365)
// 평균임금 = 산정사유 발생일(퇴직일) 이전 3개월간 지급된 임금총액 ÷ 그 기간의 총일수
// 평균임금이 통상임금보다 적으면 통상임금을 평균임금으로 함(근로기준법 제2조제2항) — 이 계산기는 미반영, FAQ로 안내

export function daysBetween(start: Date, end: Date): number {
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  return Math.round((end.getTime() - start.getTime()) / MS_PER_DAY);
}

function threeMonthsBefore(date: Date): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() - 3);
  return d;
}

export type RetirementPayInput = {
  hireDate: Date;
  retireDate: Date;
  monthlyWageManwon: number; // 최근 3개월 평균 월급여
  annualBonusManwon: number; // 연간 상여금 총액(선택, 0이면 미반영)
  unusedLeavePayManwon: number; // 전년도 미사용 연차수당(선택, 0이면 미반영)
};

export type RetirementPayResult = {
  serviceDays: number;
  serviceYearsDisplay: string; // "2년 3개월" 형태
  eligible: boolean; // 계속근로기간 1년 이상인지
  threeMonthWindowDays: number;
  threeMonthWageTotal: number;
  averageDailyWage: number;
  retirementPay: number;
};

export function calcRetirementPay(input: RetirementPayInput): RetirementPayResult {
  const { hireDate, retireDate, monthlyWageManwon, annualBonusManwon, unusedLeavePayManwon } = input;

  const serviceDays = Math.max(0, daysBetween(hireDate, retireDate));
  const eligible = serviceDays >= 365;

  const windowStart = threeMonthsBefore(retireDate);
  const threeMonthWindowDays = Math.max(1, daysBetween(windowStart, retireDate));

  const monthlyWage = monthlyWageManwon * 10000;
  const annualBonus = annualBonusManwon * 10000;
  const unusedLeavePay = unusedLeavePayManwon * 10000;

  // 상여금·연차수당은 연간 지급액 중 "퇴직 전 3개월에 해당하는 부분(3/12)"만 평균임금 산정에 포함
  const threeMonthWageTotal = monthlyWage * 3 + (annualBonus * 3) / 12 + (unusedLeavePay * 3) / 12;
  const averageDailyWage = threeMonthWageTotal / threeMonthWindowDays;

  const retirementPay = eligible ? averageDailyWage * 30 * (serviceDays / 365) : 0;

  const years = Math.floor(serviceDays / 365);
  const remainingDays = serviceDays - years * 365;
  const months = Math.floor(remainingDays / 30);
  const serviceYearsDisplay = years > 0 ? `${years}년 ${months}개월` : `${months}개월`;

  return {
    serviceDays,
    serviceYearsDisplay,
    eligible,
    threeMonthWindowDays,
    threeMonthWageTotal,
    averageDailyWage,
    retirementPay,
  };
}
