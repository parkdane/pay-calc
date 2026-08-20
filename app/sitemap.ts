import type { MetadataRoute } from "next";
import fs from "fs";
import path from "path";
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
    "/about",
    "/terms",
    "/privacy",
    "/contact",
  ];

  // 봉급표
  const salaryPaths = ["civil", "military", "police", "fire", "teacher"].map(
    (s) => `/salary/${s}`
  );

  // 계산기 (하드코딩 대신 app/calc 폴더 구조에서 자동으로 읽어옴 -> 새 계산기 추가 시 누락 방지)
  const calcDir = path.join(process.cwd(), "app", "calc");
  const calcSlugs = fs
    .readdirSync(calcDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
  const calcPaths = calcSlugs.map((s) => `/calc/${s}`);

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

