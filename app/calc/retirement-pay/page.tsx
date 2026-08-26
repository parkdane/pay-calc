import type { Metadata } from "next";
import RetirementPayCalc from "@/components/RetirementPayCalc";
import Faq from "@/components/Faq";
import FaqJsonLd from "@/components/FaqJsonLd";
import Link from "next/link";

export const metadata: Metadata = {
  title: "퇴직금 계산기 (근로자, 2026년 기준)",
  description:
    "입사일·퇴사일과 최근 3개월 급여를 입력하면 근로기준법·근로자퇴직급여보장법 기준 퇴직금을 계산합니다. 일반 사기업 근로자 대상입니다.",
  openGraph: {
    title: "퇴직금 계산기 (근로자, 2026년 기준)",
    description:
      "입사일·퇴사일과 최근 3개월 급여를 입력하면 근로기준법·근로자퇴직급여보장법 기준 퇴직금을 계산합니다. 일반 사기업 근로자 대상입니다.",
  },
};

const FAQ = [
  {
    q: "퇴직금은 어떻게 계산되나요?",
    a: "1일 평균임금 × 30일 × (계속근로기간 ÷ 365)로 계산합니다. 1일 평균임금은 퇴직일 이전 3개월간 받은 임금총액을 그 기간의 실제 일수(89~92일 정도)로 나눈 금액입니다. 근속 1년마다 30일분의 평균임금이 쌓이는 구조라, 3년을 일했다면 대략 석 달치 평균임금을 받게 됩니다.",
  },
  {
    q: "왜 하필 3개월 급여를 기준으로 하나요?",
    a: "근로기준법이 '평균임금'을 산정사유 발생일(퇴직일) 이전 3개월간 지급된 임금의 총액을 그 기간의 총일수로 나눈 금액으로 정의하기 때문입니다. 최근 3개월 급여가 줄었다면(무급휴가, 병가 등) 평균임금도 함께 낮아지고, 결과적으로 퇴직금도 줄어듭니다.",
  },
  {
    q: "상여금이나 연차수당도 포함되나요?",
    a: "정기적·일률적으로 지급되는 상여금과 전전연도에 발생해 이미 지급된 연차수당은 평균임금 산정에 포함됩니다. 다만 1년치 전액이 아니라 퇴직 전 3개월에 해당하는 부분(연간 금액의 1/4)만 반영됩니다.",
  },
  {
    q: "1년 미만 근무해도 받을 수 있나요?",
    a: "아닙니다. 계속근로기간이 1년 미만이면 퇴직금 지급 대상이 아닙니다. 또한 4주를 평균하여 1주간 소정근로시간이 15시간 미만인 초단시간 근로자도 대상에서 제외됩니다. 아르바이트라도 1년 이상 근무하고 주 15시간 이상 일했다면 정규직과 동일한 방식으로 퇴직금이 발생합니다.",
  },
  {
    q: "해고나 권고사직으로 그만둬도 받나요?",
    a: "받습니다. 퇴직금은 퇴사 사유(자발적 퇴사, 권고사직, 해고 등)와 무관하게 계속근로기간 1년 이상, 주 15시간 이상 요건만 충족하면 발생합니다.",
  },
  {
    q: "언제까지 지급받아야 하나요?",
    a: "근로자퇴직급여보장법 제9조에 따라 퇴직일로부터 14일 이내에 지급해야 합니다. 당사자 간 합의로 기한을 연장할 수 있지만, 합의 없이 기한을 넘기면 초과 일수에 대해 연 20% 이내의 지연이자가 발생합니다.",
  },
];

export default function Page() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-[#1B2A4A] sm:text-3xl">
          퇴직금 계산기
        </h1>
        <p className="text-sm text-[#5B6478]">
          입사일·퇴사일과 최근 3개월 급여를 입력하면 근로기준법 기준 퇴직금을 계산합니다.
          일반 사기업 근로자 대상입니다.
        </p>
      </header>

      <Link
        href="/calc/severance-pay"
        className="block rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-4 transition hover:shadow-md"
      >
        <p className="text-xs font-semibold text-[#2E4494]">공무원·군인이라면</p>
        <p className="mt-0.5 font-bold text-[#1B2A4A]">
          퇴직금이 아니라 별도 제도인 퇴직수당 계산기로 이동 →
        </p>
      </Link>

      <div className="mx-[calc(50%-50vw)] w-screen">
        <RetirementPayCalc />
      </div>

      <section className="space-y-3 text-sm leading-relaxed text-[#5B6478]">
        <h2 className="text-xl font-bold text-[#1B2A4A]">평소 실수령액도 궁금하다면</h2>
        <p>
          퇴직금은 재직 중 급여와는 별도로 지급되는 목돈입니다. 평소 매달 받는 실수령액이
          궁금하다면{" "}
          <Link href="/calc/worker-net" className="text-[#2E4494] underline">
            직장인 연봉 실수령액 계산기
          </Link>
          에서 확인하세요. 비자발적으로 퇴사했다면{" "}
          <Link href="/calc/unemployment-benefit" className="text-[#2E4494] underline">
            실업급여 계산기
          </Link>
          도 함께 확인해보세요.
        </p>
      </section>

      <Faq items={FAQ} />
      <FaqJsonLd items={FAQ} />

      <div className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-4 text-sm">
        <Link href="/guide/retirement-pay-guide" className="font-medium text-[#2E4494] underline">
          평균임금·통상임금 하한규칙까지 자세히 보기 →
        </Link>
      </div>
    </div>
  );
}
