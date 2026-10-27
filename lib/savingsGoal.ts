// 목표 금액까지 걸리는 기간 (매월 말 적립, 월복리)
// n = log(goal × r / save + 1) / log(1 + r),  r = 연이율 / 12
// afterTax: 이자에 이자소득세 15.4%가 붙는다고 보고 r × (1 − 0.154)로 근사
import { INTEREST_TAX_RATE } from "@/lib/depositCalc";

export function monthsToGoal(save: number, goal: number, ratePercent: number, afterTax = false): number | null {
  if (save <= 0) return null;
  const r = (ratePercent / 100 / 12) * (afterTax ? 1 - INTEREST_TAX_RATE : 1);
  if (r === 0) return Math.ceil(goal / save);
  return Math.ceil(Math.log((goal * r) / save + 1) / Math.log(1 + r));
}

export function formatMonths(m: number): string {
  const y = Math.floor(m / 12);
  const mo = m % 12;
  if (y === 0) return `${mo}개월`;
  return mo === 0 ? `${y}년` : `${y}년 ${mo}개월`;
}
