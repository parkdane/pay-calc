// 정년퇴직 시점 기준 퇴직수당·연금 예상 계산
// 기존 연금 엔진(lib/pensionCalc.ts)과 퇴직수당 산식(lib/severance.ts)을 그대로 재사용한다.
// - 봉급은 2026년 봉급표 값으로 고정(향후 인상 미반영), 수당 미포함 → 실제 기준소득월액보다 낮은 보수적 근사
// - 연금은 개시연령(퇴직연도별)에 받는 경우와, 정년퇴직 직후 조기퇴직연금으로 받는 경우를 함께 계산
import civilHistory from "@/data/pension-civil-history.json";
import teacherHistory from "@/data/pension-teacher-history.json";
import { calcPension, estimateEligibleAge, type CareerSegment, type HistorySnapshot } from "@/lib/pensionCalc";
import { calcSeverance } from "@/lib/severance";

export type MoneyCategory = "teacher" | "civil";

export const CIVIL_GRADES = ["1급", "2급", "3급", "4급", "5급", "6급", "7급", "8급", "9급"] as const;

function yearsBetween(from: string, to: string): number {
  return (new Date(to).getTime() - new Date(from).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
}

export type RetirementMoneyInput = {
  category: MoneyCategory;
  hireDate: string; // YYYY-MM-DD
  retireDate: string; // 정년퇴직일 YYYY-MM-DD
  retireAge: number; // 정년 나이
  currentHobong: number;
  currentGrade?: string; // 일반직만 사용(예: "7급")
  today: string; // YYYY-MM-DD
  baseIncomeOverrideWon?: number; // 퇴직수당 기준소득월액 직접 입력(선택)
};

export type RetirementMoneyResult = {
  eligible: boolean; // 재직 10년 이상(연금 수급 요건)
  totalYears: number;
  severanceYears: number; // 월 단위 이하 절사한 재직연수
  hobongAtRetire: number;
  baseIncome: number;
  severance: number;
  severanceRate: number;
  eligibleAge: number; // 연금 개시연령
  yearsEarly: number; // 정년퇴직 나이가 개시연령보다 이른 햇수
  pensionAtEligibleAge: number; // 개시연령 이후 수령(감액 없음)
  pensionEarly: number; // 정년퇴직 직후 조기수령(감액 적용)
};

export function calcRetirementMoney(input: RetirementMoneyInput): RetirementMoneyResult | null {
  const { category, hireDate, retireDate, retireAge, currentHobong, currentGrade, today, baseIncomeOverrideWon } = input;
  if (new Date(retireDate) <= new Date(hireDate)) return null;

  const isTeacher = category === "teacher";
  const history = (isTeacher ? teacherHistory : civilHistory) as HistorySnapshot[];
  const gradeColumns: readonly string[] = isTeacher ? [] : CIVIL_GRADES;

  const yearsSinceHire = Math.max(yearsBetween(hireDate, today), 0);
  const startHobong = Math.max(currentHobong - Math.floor(yearsSinceHire), 1);
  const segments: CareerSegment[] = [
    { startDate: hireDate, grade: isTeacher ? null : (currentGrade ?? "7급"), startHobong },
  ];

  const eligibleAge = estimateEligibleAge(hireDate, retireDate);

  const early = calcPension({ historicalData: history, segments, hireDate, retireDate, retireAge, gradeColumns });
  const full = calcPension({
    historicalData: history,
    segments,
    hireDate,
    retireDate,
    retireAge: Math.max(retireAge, eligibleAge),
    gradeColumns,
  });

  const last = [...early.careerResults].reverse().find((r) => r.pay != null);
  const lastPay = last?.pay ?? 0;
  const baseIncome = baseIncomeOverrideWon && baseIncomeOverrideWon > 0 ? baseIncomeOverrideWon : lastPay;

  const severanceYears = Math.floor(early.totalYears);
  const sev = calcSeverance(baseIncome, severanceYears);

  return {
    eligible: early.eligible,
    totalYears: early.totalYears,
    severanceYears,
    hobongAtRetire: last?.hobong ?? currentHobong,
    baseIncome,
    severance: sev.total,
    severanceRate: sev.rate,
    eligibleAge,
    yearsEarly: early.yearsEarly,
    pensionAtEligibleAge: full.finalPension,
    pensionEarly: early.finalPension,
  };
}
