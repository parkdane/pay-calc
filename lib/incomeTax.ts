/**
 * 근로소득 간이세액표 산출 방식(연환산)으로 월 원천징수 소득세를 근사 계산.
 * 국세청 간이세액표가 만들어지는 공식 그대로를 따르므로
 * 단순 구간 세율보다 실제 명세서에 훨씬 근접한다.
 *
 * @param monthlyGross  월 세전 급여(과세 대상)
 * @param monthlyPension 월 연금 기여금(공무원연금/군인연금/국민연금 본인부담)
 * @param dependents    부양가족 수(본인 제외)
 * @returns 월 소득세 (지방소득세 별도)
 */
export function monthlyIncomeTax(
  monthlyGross: number,
  monthlyPension: number,
  dependents: number
): number {
  const g = monthlyGross * 12; // 연 급여 환산
  const pension = monthlyPension * 12;
  const family = 1 + Math.max(0, dependents); // 본인 포함 공제 인원

  // 1) 근로소득공제
  let earned: number;
  if (g <= 5_000_000) earned = g * 0.7;
  else if (g <= 15_000_000) earned = 3_500_000 + (g - 5_000_000) * 0.4;
  else if (g <= 45_000_000) earned = 7_500_000 + (g - 15_000_000) * 0.15;
  else if (g <= 100_000_000) earned = 12_000_000 + (g - 45_000_000) * 0.05;
  else earned = 14_750_000 + (g - 100_000_000) * 0.02;

  // 2) 인적공제 (1인당 150만)
  const personal = family * 1_500_000;

  // 3) 연금보험료 공제 (전액)
  // 4) 특별소득공제 등 근사 (간이세액표 산식)
  let special: number;
  if (g <= 30_000_000) special = 3_100_000 + g * 0.04;
  else if (g <= 45_000_000)
    special = 3_100_000 + g * 0.04 - (g - 30_000_000) * 0.05;
  else if (g <= 70_000_000) special = 3_100_000 + g * 0.015;
  else if (g <= 120_000_000) special = 3_100_000 + g * 0.005;
  else special = 3_100_000;

  const taxBase = Math.max(0, g - earned - personal - pension - special);

  // 5) 기본세율 (누진)
  let tax: number;
  if (taxBase <= 14_000_000) tax = taxBase * 0.06;
  else if (taxBase <= 50_000_000) tax = 840_000 + (taxBase - 14_000_000) * 0.15;
  else if (taxBase <= 88_000_000) tax = 6_240_000 + (taxBase - 50_000_000) * 0.24;
  else if (taxBase <= 150_000_000)
    tax = 15_360_000 + (taxBase - 88_000_000) * 0.35;
  else if (taxBase <= 300_000_000)
    tax = 37_060_000 + (taxBase - 150_000_000) * 0.38;
  else tax = 94_060_000 + (taxBase - 300_000_000) * 0.4;

  // 6) 근로소득세액공제
  let credit = tax <= 1_300_000 ? tax * 0.55 : 715_000 + (tax - 1_300_000) * 0.3;
  let creditCap: number;
  if (g <= 33_000_000) creditCap = 740_000;
  else if (g <= 70_000_000)
    creditCap = Math.max(660_000, 740_000 - (g - 33_000_000) * 0.008);
  else creditCap = Math.max(500_000, 660_000 - (g - 70_000_000) * 0.5);
  credit = Math.min(credit, creditCap);

  const annualTax = Math.max(0, tax - credit);
  return Math.floor(annualTax / 12);
}
