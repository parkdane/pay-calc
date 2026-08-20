import type { Metadata } from "next";
import PensionNetCalc from "@/components/PensionNetCalc";
import AdSlot from "@/components/AdSlot";
import Faq from "@/components/Faq";
import FaqJsonLd from "@/components/FaqJsonLd";
import Link from "next/link";

export const metadata: Metadata = {
  title: "공무원연금 은퇴 후 예상수령액 계산기 (교사·경찰·소방·군인 포함)",
  description:
    "임용일·직급·호봉을 입력하면 은퇴 후 받을 공무원연금 예상 월수령액을 계산합니다. 일반직·교사·경찰·소방·군인 전부 지원하며, 1997~2026년 실제 봉급표와 3단계 산식(구법·과도기·소득재분배)을 반영합니다.",
  openGraph: {
    title: "공무원연금 은퇴 후 예상수령액 계산기 (교사·경찰·소방·군인 포함)",
    description: "임용일·직급·호봉을 입력하면 은퇴 후 받을 공무원연금 예상 월수령액을 계산합니다. 일반직·교사·경찰·소방·군인 전부 지원하며, 1997~2026년 실제 봉급표와 3단계 산식(구법·과도기·소득재분배)을 반영합니다.",
  },
};

const FAQ = [
  {
    q: "이 계산기는 어떤 자료를 기반으로 하나요?",
    a: "국가법령정보 공동활용 API를 통해 1997년부터 2026년까지 실제 시행된 공무원보수규정 개정이력(202건)을 전부 수집해, 재직기간 동안의 실제 소득 흐름을 재구성했습니다. 연금 산식은 2009년까지의 구법, 2010~2015년 과도기, 2016년 이후 소득재분배가 적용되는 신법 3단계를 각각 반영합니다.",
  },
  {
    q: "실제 수령액과 얼마나 차이가 날 수 있나요?",
    a: "기준소득월액을 봉급표 값으로 근사했기 때문에(실제로는 각종 수당 포함), 계산값이 실제보다 낮게 나올 가능성이 있습니다. 또한 소득재분배 계산에 쓰이는 전체 공무원 평균소득은 2026년 고정값을 사용했습니다. 정확한 금액은 공무원연금공단 공식 모의계산을 기준으로 확인하시기 바랍니다.",
  },
  {
    q: "승진 이력을 꼭 입력해야 하나요?",
    a: "아닙니다. 입력하지 않으면 현재 직급을 임용일부터 계속 유지했다고 가정한 근사치로 계산됩니다. 실제로 승진을 거친 경우, 상세 옵션에서 발령일별 직급·호봉을 입력하면 과거 소득이 더 정확하게 반영됩니다.",
  },
  {
    q: "조기퇴직하면 연금이 얼마나 줄어드나요?",
    a: "연금개시가능연령(이 계산기에서는 65세로 근사)보다 일찍 수급을 시작하면 1년당 5%씩, 최대 5년(25%)까지 감액됩니다. 2010년 이전 임용자는 실제 개시가능연령이 60~64세로 더 빠를 수 있어, 이 계산기의 감액률이 실제보다 크게 나올 수 있습니다.",
  },
];

export default function Page() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-[#1B2A4A] sm:text-3xl">
          공무원연금 은퇴 후 예상수령액 계산기
        </h1>
        <p className="text-sm text-[#5B6478]">
          임용일·직급·호봉을 입력하면 실제 봉급표 이력과 공무원연금법 3단계 산식을 반영한
          예상 월 연금액을 계산합니다. 일반직·경찰·소방·교사·군인 간부 대상입니다.
        </p>
      </header>

      <div className="mx-[calc(50%-50vw)] w-screen">
        <PensionNetCalc />
      </div>

      <Link
        href="/calc/severance-pay"
        className="block rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-4 transition hover:shadow-md"
      >
        <p className="text-xs font-semibold text-[#2E4494]">연금 말고 목돈도 있습니다</p>
        <p className="mt-0.5 font-bold text-[#1B2A4A]">퇴직 시 별도로 받는 퇴직수당 계산해보기 →</p>
      </Link>

      <Faq items={FAQ} />
      <FaqJsonLd items={FAQ} />

      <div className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-4 text-sm">
        <Link href="/guide/pension-net-guide" className="font-medium text-[#2E4494] underline">
          구법·과도기·소득재분배 3단계 산식 자세히 보기 →
        </Link>
      </div>
      <AdSlot id="calc-pension-net-bottom" />
    </div>
  );
}
