// 적금·예금 이자 계산 (단리, 만기일시지급 기준)
// - 적금: 매월 같은 금액을 납입하고, 각 회차 납입금은 만기까지 남은 개월 수만큼 이자가 붙음
//   이자 = 월 납입액 × (연이율 / 12) × n(n+1)/2
// - 예금: 원금 × 연이율 × (개월 수 / 12)
// - 일반 과세: 이자소득세 14% + 지방소득세 1.4% = 15.4% 원천징수

export const INTEREST_TAX_RATE = 0.154;

export type InterestResult = { principal: number; interest: number; tax: number; netInterest: number; total: number };

function finish(principal: number, interest: number, taxFree: boolean): InterestResult {
  const tax = taxFree ? 0 : interest * INTEREST_TAX_RATE;
  const netInterest = interest - tax;
  return { principal, interest, tax, netInterest, total: principal + netInterest };
}

export function calcSavings(monthly: number, months: number, ratePercent: number, taxFree = false): InterestResult {
  const r = ratePercent / 100;
  const interest = monthly * (r / 12) * ((months * (months + 1)) / 2);
  return finish(monthly * months, interest, taxFree);
}

export function calcDeposit(lump: number, months: number, ratePercent: number, taxFree = false): InterestResult {
  const r = ratePercent / 100;
  return finish(lump, lump * r * (months / 12), taxFree);
}

// 적금 금리를 원금 전체 기준 실질 이율로 환산 (세전, 예: 12개월 연 4% → 약 2.17%)
export function savingsEffectiveRate(months: number, ratePercent: number): number {
  return (ratePercent * (months + 1)) / (2 * months);
}
