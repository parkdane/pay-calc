// 정책 적금 4종 계산 로직 (계산기 컴포넌트와 페이지 예시표가 같은 함수를 사용)
// 이자는 모두 매월 적립식 단리: 월 납입액 × (연이율/12) × n(n+1)/2, 비과세
import soldierCfg from "@/data/soldier-savings-2026.json";
import youthCfg from "@/data/youth-savings-2026.json";

const sumFactor = (n: number) => (n * (n + 1)) / 2;
const simpleInterest = (monthly: number, ratePercent: number, months: number) =>
  monthly * (ratePercent / 100 / 12) * sumFactor(months);

// ── 장병내일준비적금 ─────────────────────────────────────────
// 근거: 국방부·취급은행 상품설명서. 개인 합산 월 55만 원(은행당 30만 원),
// 2024년 이후 납입원금의 100%를 만기 해지 시 매칭지원금으로 지급(매칭지원금에는 이자 없음)
export const SOLDIER = soldierCfg;
export function calcSoldierSavings(monthly: number, months: number, ratePercent: number) {
  const principal = monthly * months;
  const matching = principal * soldierCfg.matchRate;
  const interest = simpleInterest(monthly, ratePercent, months);
  return { principal, matching, interest, total: principal + matching + interest };
}

// ── 청년내일저축계좌 ─────────────────────────────────────────
// 근거: 보건복지부 2026년 모집 공고. 2026년 신규 모집은 기준 중위소득 50% 이하만(정부지원 월 30만 원).
// 중위소득 50~100% 구간(월 10만 원)은 2025년까지 가입한 기존 가입자만 해당
export const NAEIL_MONTHS = 36;
export const NAEIL_MIN = 100000;
export const NAEIL_MAX = 500000;
export const NAEIL_TIERS = [
  { id: "low", label: "기준중위소득 50% 이하 (2026년 신규 모집 대상)", match: 300000, hint: "정부지원금 월 30만 원" },
  {
    id: "mid",
    label: "기준중위소득 50% 초과 ~ 100% 이하 (2025년까지 가입자)",
    match: 100000,
    hint: "정부지원금 월 10만 원 · 2026년부터 이 구간은 신규 모집 없음",
  },
] as const;
export function calcNaeil(monthly: number, govMonthly: number, ratePercent: number) {
  const principal = monthly * NAEIL_MONTHS;
  const matching = govMonthly * NAEIL_MONTHS;
  const interest = simpleInterest(monthly, ratePercent, NAEIL_MONTHS);
  return { principal, matching, interest, total: principal + matching + interest };
}

// ── 청년미래적금 ─────────────────────────────────────────────
// 근거: 금융위원회 2026년 운영 방안. 3년 만기, 월 최대 50만 원, 기여금 일반형 6%·우대형 12%,
// 납입금과 기여금 모두에 이자가 붙고 이자소득 비과세. 기여금 이자는 기본금리(cfg.baseRate)로 계산
// (금융위 예시 일반형 2,138만 원·우대형 2,255만 원 = 납입금 연 8%, 기여금 기본금리 5%로 재현됨)
export const YOUTH = youthCfg;
export type YouthTypeId = (typeof youthCfg.types)[number]["id"];
export function calcYouthFuture(monthly: number, typeId: string, ratePercent: number) {
  const type = youthCfg.types.find((t) => t.id === typeId)!;
  const months = youthCfg.months;
  const principal = monthly * months;
  const monthlyMatch = Math.min(monthly * type.matchRate, type.monthlyCap);
  const matching = monthlyMatch * months;
  const interestOnSavings = simpleInterest(monthly, ratePercent, months);
  const interestOnMatch = simpleInterest(monthlyMatch, Math.min(ratePercent, youthCfg.baseRate), months);
  const interest = interestOnSavings + interestOnMatch;
  return { principal, matching, interest, interestOnMatch, total: principal + matching + interest, monthlyMatch };
}

// ── 청년도약계좌 (2025년 12월 신규 가입 종료, 기존 가입자용) ─────────
// 근거: 금융위원회 2025.1 기여금 확대, 취급은행 약관.
// 소득구간별 기준한도까지 기본 매칭비율, 기준한도~70만 원 구간은 3.0%(2025년 1월 납입분부터)
// 기여금에도 기본금리로 계산한 이자가 붙음(약관) → 기여금 이자는 기본금리(LEAP_BASE_RATE)로 계산
export const LEAP_MONTHS = 60;
export const LEAP_CAP = 700000;
export const LEAP_EXPAND_RATE = 0.03;
export const LEAP_BASE_RATE = 4.5;
export const LEAP_TIERS = [
  { id: "t2400", label: "총급여 2,400만 원 이하", base: 400000, rate: 0.06 },
  { id: "t3600", label: "2,400만 초과 ~ 3,600만 이하", base: 500000, rate: 0.046 },
  { id: "t4800", label: "3,600만 초과 ~ 4,800만 이하", base: 600000, rate: 0.037 },
  { id: "t6000", label: "4,800만 초과 ~ 6,000만 이하", base: 700000, rate: 0.03 },
  { id: "t7500", label: "6,000만 초과 ~ 7,500만 이하 (비과세만)", base: 0, rate: 0 },
] as const;
export function leapMonthlyMatch(monthly: number, tierId: string) {
  const tier = LEAP_TIERS.find((t) => t.id === tierId)!;
  const m = Math.min(monthly, LEAP_CAP);
  const basePart = Math.min(m, tier.base) * tier.rate;
  const expandPart = tier.base > 0 ? Math.max(0, m - tier.base) * LEAP_EXPAND_RATE : 0;
  return Math.floor((basePart + expandPart) / 100) * 100;
}
export function calcLeap(monthly: number, tierId: string, ratePercent: number) {
  const m = Math.min(monthly, LEAP_CAP);
  const principal = m * LEAP_MONTHS;
  const monthlyMatch = leapMonthlyMatch(m, tierId);
  const matching = monthlyMatch * LEAP_MONTHS;
  const interestOnSavings = simpleInterest(m, ratePercent, LEAP_MONTHS);
  const interestOnMatch = simpleInterest(monthlyMatch, Math.min(ratePercent, LEAP_BASE_RATE), LEAP_MONTHS);
  const interest = interestOnSavings + interestOnMatch;
  return { principal, monthlyMatch, matching, interest, interestOnMatch, total: principal + matching + interest };
}
