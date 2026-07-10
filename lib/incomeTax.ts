/**
 * 근로소득 간이세액표 기반 월 원천징수 소득세 계산.
 * 국세청 2024 간이세액표 실측값을 (월급여 × 공제대상가족수) 2차원 앵커로 넣고
 * 양방향 선형 보간한다. 근사 공식보다 실제 명세서에 정확히 근접한다.
 * (지방소득세 10% 별도, 100% 징수 기준)
 */

const GROSS_ROWS = [
  2000000, 2500000, 3000000, 3500000, 4000000, 4500000, 5000000, 6000000,
  7000000, 8000000, 10000000,
];

// [본인1명, 2명, 3명, 4명, 5명] — 국세청 2024 간이세액표(100%)
const TAX_TABLE: Record<number, number[]> = {
  2000000: [19520, 6600, 0, 0, 0],
  2500000: [41630, 21150, 8700, 1440, 0],
  3000000: [84850, 56600, 20960, 7540, 2340],
  3500000: [127220, 92460, 47160, 20870, 9950],
  4000000: [178650, 148340, 88280, 55090, 34320],
  4500000: [244890, 199170, 128000, 82700, 55650],
  5000000: [314890, 273380, 185320, 126930, 89530],
  6000000: [494340, 449600, 341480, 256790, 200550],
  7000000: [720030, 662280, 522300, 411290, 331290],
  8000000: [981600, 913960, 745580, 615600, 505440],
  10000000: [1637600, 1556280, 1355880, 1195440, 1055270],
};

function extrapolate(gross: number, colIdx: number): number {
  const top = TAX_TABLE[10000000][colIdx];
  const over = gross - 10000000;
  return top + over * 0.35;
}

export function monthlyIncomeTax(
  monthlyGross: number,
  _monthlyPension: number,
  dependents: number
): number {
  void _monthlyPension;
  const col = Math.min(Math.max(0, dependents), 4);

  if (monthlyGross <= 0) return 0;
  if (monthlyGross <= GROSS_ROWS[0]) {
    const r = TAX_TABLE[GROSS_ROWS[0]][col] / GROSS_ROWS[0];
    return Math.floor(monthlyGross * r);
  }
  if (monthlyGross >= 10000000) {
    return Math.floor(extrapolate(monthlyGross, col));
  }

  for (let i = 0; i < GROSS_ROWS.length - 1; i++) {
    const g1 = GROSS_ROWS[i];
    const g2 = GROSS_ROWS[i + 1];
    if (monthlyGross >= g1 && monthlyGross < g2) {
      const t1 = TAX_TABLE[g1][col];
      const t2 = TAX_TABLE[g2][col];
      const t = (monthlyGross - g1) / (g2 - g1);
      return Math.floor(t1 + (t2 - t1) * t);
    }
  }
  return 0;
}
