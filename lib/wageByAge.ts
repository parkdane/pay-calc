// 연령대별 임금근로자 월평균 소득
// 출처: 국가데이터처 「2024년 임금근로일자리 소득(보수) 결과」(2026.2.23 발표). 2024년 12월 기준 임금근로일자리
// 교차 확인: 뉴시스·경향신문·뉴데일리 보도(2026.2.23) 수치 일치. 연령대별 중위소득은 보도에 없어 싣지 않음
export const WAGE_BY_AGE = {
  year: 2024,
  source: "국가데이터처 「2024년 임금근로일자리 소득(보수) 결과」(2026년 2월 발표)",
  overallAvgMonthly: 3570000,
  overallMedianMonthly: 2880000,
  rows: [
    { range: "20대", avgMonthly: 2710000 },
    { range: "30대", avgMonthly: 3970000 },
    { range: "40대", avgMonthly: 4690000 },
    { range: "50대", avgMonthly: 4450000 },
    { range: "60대", avgMonthly: 2930000 },
    { range: "70세 이상", avgMonthly: 1650000 },
  ],
} as const;

export const annualOf = (monthly: number) => monthly * 12;
