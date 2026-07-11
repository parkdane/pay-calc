import type { MetadataRoute } from "next";
import { GUIDES } from "@/data/guides";

const BASE = "https://moneywatch.kr";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // 고정 페이지
  const staticPaths = [
    "", // 홈
    "/salary",
    "/calc",
    "/guide",
    "/rates",
  ];

  // 봉급표
  const salaryPaths = ["civil", "military", "police", "fire", "teacher"].map(
    (s) => `/salary/${s}`
  );

  // 계산기
  const calcPaths = [
    "civil-net",
    "military-net",
    "soldier-save",
    "youth-save",
    "naeil-save",
    "leap-save",
    "deposit",
    "income-rank",
    "worker-net",
    "savings-goal",
  ].map((s) => `/calc/${s}`);

  // 가이드 (데이터에서 자동)
  const guidePaths = GUIDES.map((g) => `/guide/${g.slug}`);

  const all = [...staticPaths, ...salaryPaths, ...calcPaths, ...guidePaths];

  return all.map((path) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : path.startsWith("/calc") || path.startsWith("/salary") ? 0.8 : 0.6,
  }));
}
