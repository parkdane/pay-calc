import type { Metadata } from "next";
import OvertimePayCalc from "@/components/OvertimePayCalc";
import Faq from "@/components/Faq";
import FaqJsonLd from "@/components/FaqJsonLd";
import Link from "next/link";

export const metadata: Metadata = {
  title: "경찰·공무원 시간외수당 계산기 (2026년 기준)",
  description:
    "직급·계급과 이번 달 초과근무 시간을 입력하면 2026년 기준 시간외근무수당을 계산합니다. 일반직·경찰·소방·교사 대상입니다.",
  openGraph: {
    title: "경찰·공무원 시간외수당 계산기 (2026년 기준)",
    description:
      "직급·계급과 이번 달 초과근무 시간을 입력하면 2026년 기준 시간외근무수당을 계산합니다. 일반직·경찰·소방·교사 대상입니다.",
  },
};

const FAQ = [
  {
    q: "시간외수당은 어떻게 계산되나요?",
    a: "기준호봉(10호봉) 봉급액에 감액조정률을 곱하고 209로 나눈 뒤 150%를 가산해 시간당 단가를 구하고, 여기에 초과근무 시간을 곱합니다. 2026년부터 9급·8급(상당)은 감액조정률이 60%로 상향됐고, 그 외 직급은 55%입니다.",
  },
  {
    q: "왜 내 실제 호봉이 아니라 10호봉 기준으로 계산하나요?",
    a: "시간외수당 단가는 개인의 실제 호봉이 아니라 별도로 정한 기준호봉(10호봉)의 봉급액을 기준으로 계산합니다. 실제 호봉과 관계없이 같은 직급이면 시간당 단가가 동일합니다.",
  },
  {
    q: "월 최대 몇 시간까지 인정되나요?",
    a: "월 최대 57시간까지 인정됩니다. 이를 초과하는 시간은 수당 계산에 반영되지 않습니다. 일반 사무직은 별도 초과근무 명령 없이도 월 10시간의 정액분이 지급되는 경우가 많으니, 소속 기관의 실제 운영 기준을 확인하는 것이 정확합니다.",
  },
  {
    q: "경찰·소방의 위험근무수당도 포함되나요?",
    a: "아닙니다. 이 계산기는 시간외근무수당만 계산합니다. 경찰·소방의 위험근무수당이나 그 밖의 직종별 수당은 별도로 지급되며, 이 계산에는 포함하지 않았습니다.",
  },
];

export default function Page() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-[#1B2A4A] sm:text-3xl">
          시간외수당 계산기
        </h1>
        <p className="text-sm text-[#5B6478]">
          직급·계급과 이번 달 초과근무 시간을 입력하면 2026년 기준 시간외근무수당을 계산합니다.
          일반직·경찰·소방·교사 대상입니다.
        </p>
      </header>

      <div className="mx-[calc(50%-50vw)] w-screen">
        <OvertimePayCalc />
      </div>

      <section className="space-y-3 text-sm leading-relaxed text-[#5B6478]">
        <h2 className="text-xl font-bold text-[#1B2A4A]">실수령액까지 함께 확인하려면</h2>
        <p>
          시간외수당은 전체 급여의 일부입니다. 기본급·각종 수당에서 연금 기여금·건강보험·소득세까지
          공제한 전체 실수령액이 궁금하다면{" "}
          <Link href="/calc/civil-net" className="text-[#2E4494] underline">
            공무원·경찰·소방 실수령액 계산기
          </Link>
          에서 확인하세요.
        </p>
      </section>

      <Faq items={FAQ} />
      <FaqJsonLd items={FAQ} />
    </div>
  );
}
