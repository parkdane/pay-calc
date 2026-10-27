import type { MetadataRoute } from "next";
import fs from "fs";
import path from "path";
import { GUIDES } from "@/data/guides";
import { CALC_META } from "@/data/calcMeta";
import { PAGE_UPDATED } from "@/data/pageUpdated";
import rates from "@/data/rates.json";
import salaryCompare from "@/data/salary-compare.json";

const BASE = "https://moneywatch.kr";

export const dynamic = "force-static";

// lastmod는 실제 수정일만 쓴다. 빌드 시각(now)을 쓰면 매일 자동 커밋으로 전 페이지가 매일 "변경"되어
// 구글이 lastmod 자체를 신뢰하지 않게 된다.
const AUTO_DATA: Record<string, string> = {
  rates: rates.updatedAt.slice(0, 10),
  "salary-compare": salaryCompare.updatedAt.slice(0, 10),
};

const maxDate = (dates: string[]) => dates.reduce((a, b) => (a > b ? a : b));

export default function sitemap(): MetadataRoute.Sitemap {
  // 계산기 (app/calc 폴더 구조에서 자동으로 읽어옴 -> 새 계산기 추가 시 누락 방지)
  const calcDir = path.join(process.cwd(), "app", "calc");
  const calcSlugs = fs
    .readdirSync(calcDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  const calcEntries = calcSlugs.map((s) => {
    const meta = CALC_META[s];
    if (!meta) throw new Error(`calcMeta.ts에 ${s} 항목이 없음 (sitemap lastmod 산출 불가)`);
    const dates = [meta.updated];
    if (meta.autoData) dates.push(AUTO_DATA[meta.autoData]);
    return { path: `/calc/${s}`, date: maxDate(dates), contentDate: meta.updated };
  });

  const guideEntries = GUIDES.map((g) => {
    const date = g.updated && g.updated > g.date ? g.updated : g.date;
    return { path: `/guide/${g.slug}`, date, contentDate: date };
  });

  const fixed = (p: string) => {
    const d = PAGE_UPDATED[p];
    if (!d) throw new Error(`pageUpdated.ts에 ${p} 항목이 없음`);
    return d;
  };
  const salaryPaths = ["civil", "military", "police", "fire", "teacher"].map((s) => `/salary/${s}`);

  // 허브 페이지는 하위 페이지의 실제 수정일 중 최신값 (매일 바뀌는 자동 데이터는 제외)
  const calcHub = maxDate(calcEntries.map((e) => e.contentDate));
  const guideHub = maxDate(guideEntries.map((e) => e.contentDate));
  const salaryHub = maxDate(["/salary", ...salaryPaths].map(fixed));
  const home = maxDate([calcHub, guideHub, salaryHub]);

  const entries: { path: string; date: string }[] = [
    { path: "", date: home },
    { path: "/salary", date: salaryHub },
    { path: "/calc", date: calcHub },
    { path: "/guide", date: guideHub },
    { path: "/rates", date: AUTO_DATA.rates },
    ...["/about", "/terms", "/privacy", "/contact"].map((p) => ({ path: p, date: fixed(p) })),
    ...salaryPaths.map((p) => ({ path: p, date: fixed(p) })),
    ...calcEntries,
    ...guideEntries,
  ];

  return entries.map(({ path, date }) => ({
    url: `${BASE}${path}`,
    lastModified: date,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : path.startsWith("/calc") || path.startsWith("/salary") ? 0.8 : 0.6,
  }));
}
