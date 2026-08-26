import type { Metadata } from "next";
import UnemploymentBenefitCalc from "@/components/UnemploymentBenefitCalc";
import Faq from "@/components/Faq";
import FaqJsonLd from "@/components/FaqJsonLd";
import Link from "next/link";

export const metadata: Metadata = {
  title: "실업급여(구직급여) 계산기 (2026년 기준)",
  description:
    "이직 전 급여, 연령, 고용보험 가입기간을 입력하면 2026년 기준 실업급여(구직급여) 예상 수급액을 계산합니다. 소정급여일수(120~270일)와 상하한액을 반영합니다.",
  openGraph: {
    title: "실업급여(구직급여) 계산기 (2026년 기준)",
    description:
      "이직 전 급여, 연령, 고용보험 가입기간을 입력하면 2026년 기준 실업급여(구직급여) 예상 수급액을 계산합니다.",
  },
};

const FAQ = [
  {
    q: "실업급여는 어떻게 계산되나요?",
    a: "1일 구직급여일액(이직 전 평균임금의 60%, 2026년 기준 상한 68,100원·하한 66,048원)에 소정급여일수를 곱해서 계산합니다. 소정급여일수는 이직 당시 연령과 고용보험 가입기간에 따라 120일에서 270일까지 정해집니다.",
  },
  {
    q: "소정급여일수는 어떻게 정해지나요?",
    a: "50세 미만은 가입기간 1년 미만 120일, 1~3년 150일, 3~5년 180일, 5~10년 210일, 10년 이상 240일입니다. 50세 이상이거나 장애인이면 각각 120일, 180일, 210일, 240일, 270일로 더 깁니다.",
  },
  {
    q: "누구나 받을 수 있나요?",
    a: "이직일 이전 18개월 동안 고용보험 피보험단위기간이 통산 180일 이상이어야 하고, 비자발적으로 이직해야 하며, 근로 의사와 능력이 있는데도 취업하지 못한 상태여야 합니다. 단순 개인 사정으로 자발적으로 퇴사한 경우는 원칙적으로 대상이 아니지만, 질병·육아·통근곤란 등 정당한 사유가 인정되면 예외적으로 받을 수 있습니다.",
  },
  {
    q: "퇴사하자마자 바로 받을 수 있나요?",
    a: "아닙니다. 실업 신고일부터 7일간은 대기기간이라 구직급여가 지급되지 않습니다(건설일용근로자는 예외). 이후 1~4주마다 고용센터에 출석해 실업인정을 받아야 구직급여를 받을 수 있습니다.",
  },
  {
    q: "언제까지 받을 수 있나요?",
    a: "이직일 다음 날부터 12개월(수급기간) 안에서 소정급여일수만큼만 받을 수 있습니다. 소정급여일수가 남아 있어도 수급기간 12개월이 지나면 더 이상 받을 수 없으므로, 퇴사 후 최대한 빨리 신청하는 것이 유리합니다.",
  },
];

export default function Page() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-[#1B2A4A] sm:text-3xl">
          실업급여(구직급여) 계산기
        </h1>
        <p className="text-sm text-[#5B6478]">
          이직 전 급여, 연령, 고용보험 가입기간을 입력하면 2026년 기준 실업급여 예상 수급액을
          계산합니다.
        </p>
      </header>

      <div className="mx-[calc(50%-50vw)] w-screen">
        <UnemploymentBenefitCalc />
      </div>

      <section className="space-y-3 text-sm leading-relaxed text-[#5B6478]">
        <h2 className="text-xl font-bold text-[#1B2A4A]">퇴사하면서 함께 확인하면 좋은 것들</h2>
        <p>
          퇴사할 때는 실업급여 말고도{" "}
          <Link href="/calc/retirement-pay" className="text-[#2E4494] underline">
            퇴직금
          </Link>
          도 별도로 받을 수 있습니다. 재직 중 실수령액이 궁금하다면{" "}
          <Link href="/calc/worker-net" className="text-[#2E4494] underline">
            직장인 연봉 실수령액 계산기
          </Link>
          에서 확인하세요.
        </p>
      </section>

      <Faq items={FAQ} />
      <FaqJsonLd items={FAQ} />

      <div className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-4 text-sm">
        <Link href="/guide/unemployment-benefit-guide" className="font-medium text-[#2E4494] underline">
          소정급여일수 표·수급자격까지 자세히 보기 →
        </Link>
      </div>
    </div>
  );
}
