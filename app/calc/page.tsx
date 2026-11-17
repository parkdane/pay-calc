import type { Metadata } from "next";
import CalcListClient from "@/components/CalcListClient";
import { CALC_GROUPS as GROUPS } from "@/data/calcList";

export const metadata: Metadata = {
  title: "계산기 전체 보기",
  description:
    "실수령액 계산기, 정책 적금 계산기, 재테크 도구를 한눈에 보고 이용하세요.",
  openGraph: {
    title: "계산기 전체 보기",
    description: "실수령액 계산기, 정책 적금 계산기, 재테크 도구를 한눈에 보고 이용하세요.",
  },
};


export default function Page() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-[#1B2A4A] sm:text-3xl">
          계산기
        </h1>
        <p className="text-sm text-[#5B6478]">
          실수령액, 정책 적금, 재테크 도구를 한 곳에서 이용할 수 있습니다.
        </p>
      </header>

      <CalcListClient groups={GROUPS} />
    </div>
  );
}
