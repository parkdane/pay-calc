import data from "@/data/income-percentile-2024.json";

// 연봉(세전, 원) → 상위 % (앵커 사이 선형 보간)
// data.anchors는 income 오름차순 정렬돼 있음 (국세청 근로소득 백분위 자료 기준)
export function topPercentOf(income: number): number {
  const a = data.anchors;
  if (income <= 0) return 100;
  const top = a[a.length - 1];
  if (income >= top.income) return top.topPercent; // 상위 1% 이내
  for (let i = 0; i < a.length - 1; i++) {
    const lo = a[i];
    const hi = a[i + 1];
    if (income >= lo.income && income < hi.income) {
      const t = (income - lo.income) / (hi.income - lo.income);
      return lo.topPercent + (hi.topPercent - lo.topPercent) * t;
    }
  }
  return 100;
}

export const incomePercentileMeta = {
  median: data.median,
  year: data.year,
  source: data.source,
};
