"use client";
// 계산기 페이지 공통 경로 데이터: 레이아웃에서 현재 계산기 폴더명을 읽어 제목을 찾음
import { useSelectedLayoutSegment } from "next/navigation";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { CALC_BY_HREF } from "@/data/calcList";

export default function CalcBreadcrumb() {
  const seg = useSelectedLayoutSegment();
  const items = [{ name: "계산기", path: "/calc" }];
  const calc = seg ? CALC_BY_HREF[`/calc/${seg}`] : undefined;
  if (calc) items.push({ name: calc.title, path: calc.href });
  return <BreadcrumbJsonLd items={items} />;
}
