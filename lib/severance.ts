// 퇴직수당 지급율 — 공무원연금법 시행령 제58조 / 군인연금법 시행령(동일 비율)
// 퇴직수당 = 기준소득월액 × min(재직연수, 33) × 재직기간별 지급율
export const SEVERANCE_BRACKETS = [
  { minYears: 20, rate: 0.39 },
  { minYears: 15, rate: 0.325 },
  { minYears: 10, rate: 0.2925 },
  { minYears: 5, rate: 0.2275 },
  { minYears: 1, rate: 0.065 },
] as const;

export const SEVERANCE_MAX_YEARS = 33;

export function getSeveranceRate(years: number): number {
  for (const b of SEVERANCE_BRACKETS) {
    if (years >= b.minYears) return b.rate;
  }
  return 0;
}

export function calcSeverance(baseIncome: number, years: number) {
  const cappedYears = Math.min(years, SEVERANCE_MAX_YEARS);
  const rate = getSeveranceRate(years);
  return { cappedYears, rate, total: baseIncome * cappedYears * rate, eligible: years >= 1 };
}
