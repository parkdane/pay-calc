import type { Metadata } from "next";
import MaternityLeaveCalc from "@/components/MaternityLeaveCalc";
import Faq from "@/components/Faq";
import FaqJsonLd from "@/components/FaqJsonLd";
import Link from "next/link";

export const metadata: Metadata = {
  title: "출산전후휴가급여 계산기 (2026년 기준)",
  description:
    "월 통상임금과 회사 규모를 입력하면 2026년 기준 출산전후휴가급여를 계산합니다. 우선지원대상기업·대규모기업, 다태아 여부를 반영합니다.",
  openGraph: {
    title: "출산전후휴가급여 계산기 (2026년 기준)",
    description:
      "월 통상임금과 회사 규모를 입력하면 2026년 기준 출산전후휴가급여를 계산합니다.",
  },
};

const FAQ = [
  {
    q: "출산전후휴가급여는 어떻게 계산되나요?",
    a: "출산전후휴가 기간(90일, 다태아 120일) 동안 통상임금에 상당하는 금액을 지급하되, 2026년 기준 월 220만원 상한액(90일 총액 660만원)이 적용됩니다. 시간급 통상임금이 시간급 최저임금(10,320원)보다 낮으면 최저임금 기준으로 계산합니다.",
  },
  {
    q: "회사가 주는 건가요, 정부가 주는 건가요?",
    a: "회사 규모에 따라 다릅니다. 우선지원대상기업(중소기업 등)은 휴가기간 전체를 고용보험(고용센터)이 지급합니다. 대규모기업(대기업)은 최초 60일(다태아 75일)은 회사가 통상임금 100%를 상한 없이 직접 지급하고, 나머지 30일(다태아 45일)만 고용보험이 상한액 이내로 지급합니다.",
  },
  {
    q: "우선지원대상기업인지 어떻게 알 수 있나요?",
    a: "업종별 상시근로자 수 기준으로 정해집니다. 제조업은 500명 이하, 광업·건설업·운수업·전문과학기술서비스업·보건복지서비스업 등은 300명 이하, 도소매업·숙박음식점업·금융보험업 등은 200명 이하인 경우 우선지원대상기업에 해당합니다. 정확한 판정은 고용24(work24.go.kr)에서 사업장 조회로 확인할 수 있습니다.",
  },
  {
    q: "다태아면 얼마나 더 받나요?",
    a: "휴가기간 자체가 90일에서 120일로 늘어나고, 대규모기업의 회사 직접 지급 구간도 60일에서 75일로 늘어납니다. 월 상한액(220만원)은 동일하지만 지급 일수가 늘어나는 만큼 총액도 커집니다(총 상한액 기준 660만원→880만원).",
  },
  {
    q: "출산 전에도 쓸 수 있나요?",
    a: "네. 출산전후휴가는 출산 전과 후를 통해 90일(다태아 120일)이며, 반드시 출산 후에 45일(다태아 60일) 이상이 확보되도록 나눠 써야 합니다. 즉 출산 전에 45일을 넘겨 사용하면 출산 후 45일을 채우지 못할 수 있으니 배치에 주의해야 합니다.",
  },
];

export default function Page() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-[#1B2A4A] sm:text-3xl">
          출산전후휴가급여 계산기
        </h1>
        <p className="text-sm text-[#5B6478]">
          월 통상임금과 회사 규모를 입력하면 2026년 기준 출산전후휴가급여를 계산합니다.
        </p>
      </header>

      <div className="mx-[calc(50%-50vw)] w-screen">
        <MaternityLeaveCalc />
      </div>

      <section className="space-y-3 text-sm leading-relaxed text-[#5B6478]">
        <h2 className="text-xl font-bold text-[#1B2A4A]">출산 후 육아휴직도 계획 중이라면</h2>
        <p>
          출산전후휴가가 끝난 뒤 이어서 육아휴직을 쓰는 경우가 많습니다. 육아휴직급여가
          궁금하다면{" "}
          <Link href="/calc/parental-leave" className="text-[#2E4494] underline">
            육아휴직급여 계산기
          </Link>
          에서 확인하세요.
        </p>
      </section>

      <Faq items={FAQ} />
      <FaqJsonLd items={FAQ} />

      <div className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-4 text-sm">
        <Link href="/guide/maternity-leave-guide" className="font-medium text-[#2E4494] underline">
          기업규모별 지급구조·다태아 특례까지 자세히 보기 →
        </Link>
      </div>
    </div>
  );
}
