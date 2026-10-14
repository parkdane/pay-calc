import rates from "@/data/tax-rates-2026.json";

// 시간당 단가 = 기준호봉 봉급 × 감액조정률 × 150% ÷ 209
export const BASE_HOBONG = rates.overtime.baseHobong;
export const MAX_HOURS = rates.overtime.maxHours;

const REDUCTION_60_GRADES: readonly string[] = rates.overtime.reduction60Grades;

export function overtimeReduction(gradeLabel: string): number {
  return REDUCTION_60_GRADES.includes(gradeLabel) ? rates.overtime.reduction60 : rates.overtime.reductionDefault;
}

export function overtimeHourlyRate(basePay: number, gradeLabel: string): number {
  return ((basePay * overtimeReduction(gradeLabel)) / 209) * 1.5;
}
