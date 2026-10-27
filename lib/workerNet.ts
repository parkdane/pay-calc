// 직장인 연봉 → 월 실수령액 (2026년 근로자 본인부담 기준)
// WorkerNetCalc(직장인 실수령액 계산기)와 다른 페이지의 예시표가 같은 계산을 쓰도록 분리
import { monthlyIncomeTax } from "@/lib/incomeTax";

// 2026 근로자 본인부담 요율
// 국민연금 보험료율 9.5%(2025년까지 9%→2026년부터 매년 0.5%p씩 인상, 2033년 13%), 본인부담은 절반인 4.75%
export const PENSION_RATE = 0.0475;
export const PENSION_BASE_MAX = 6590000; // 국민연금 기준소득월액 상한(2026.7~2027.6)
export const HEALTH_RATE = 0.03595;
export const LTC_RATE_OF_HEALTH = 0.1314;
export const EMPLOYMENT_RATE = 0.009;


export function calcWorkerNet(annualGross: number, dependents: number) {
  const monthlyGross = annualGross / 12;
  const pension = Math.min(monthlyGross, PENSION_BASE_MAX) * PENSION_RATE;
  const health = monthlyGross * HEALTH_RATE;
  const ltc = health * LTC_RATE_OF_HEALTH;
  const employment = monthlyGross * EMPLOYMENT_RATE;
  const incomeTax = monthlyIncomeTax(monthlyGross, pension, dependents);
  const localTax = Math.floor(incomeTax * 0.1);
  const totalDeduction = pension + health + ltc + employment + incomeTax + localTax;
  const net = monthlyGross - totalDeduction;
  return {
    monthlyGross,
    deductions: [
      { label: "국민연금 (4.75%)", value: pension },
      { label: "건강보험 (3.595%)", value: health },
      { label: "장기요양보험", value: ltc },
      { label: "고용보험 (0.9%)", value: employment },
      { label: "소득세", value: incomeTax },
      { label: "지방소득세", value: localTax },
    ],
    totalDeduction,
    net,
    annualNet: net * 12,
    netRate: net / monthlyGross,
  };
}
