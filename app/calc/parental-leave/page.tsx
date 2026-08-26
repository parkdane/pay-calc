import type { Metadata } from "next";
import ParentalLeaveCalc from "@/components/ParentalLeaveCalc";
import Faq from "@/components/Faq";
import FaqJsonLd from "@/components/FaqJsonLd";
import Link from "next/link";

export const metadata: Metadata = {
  title: "육아휴직급여 계산기 (2026년, 6+6 부모육아휴직제 반영)",
  description:
    "통상임금과 육아휴직 기간을 입력하면 2026년 기준 육아휴직급여를 월별로 계산합니다. 부모가 함께 육아휴직을 쓰는 6+6 부모육아휴직제 특례도 반영합니다.",
  openGraph: {
    title: "육아휴직급여 계산기 (2026년, 6+6 부모육아휴직제 반영)",
    description:
      "통상임금과 육아휴직 기간을 입력하면 2026년 기준 육아휴직급여를 월별로 계산합니다. 부모가 함께 육아휴직을 쓰는 6+6 부모육아휴직제 특례도 반영합니다.",
  },
};

const FAQ = [
  {
    q: "육아휴직급여는 어떻게 계산되나요?",
    a: "육아휴직 1~6개월째까지는 월 통상임금 전액(상한액 이내), 7개월째부터는 통상임금의 80%(상한 160만원)를 지급합니다. 상한액은 1~3개월 250만원, 4~6개월 200만원으로 구간마다 다르고, 아무리 통상임금이 낮아도 월 70만원(하한액)은 보장됩니다.",
  },
  {
    q: "상한액이 왜 구간마다 다른가요?",
    a: "고용보험법 시행령 제95조가 육아휴직 시작 후 1~3개월, 4~6개월, 7개월 이후를 다른 상한액으로 구분해서 규정하고 있기 때문입니다. 초반 몇 개월의 소득 공백을 더 두텁게 보전해주려는 취지입니다.",
  },
  {
    q: "부모가 같이 육아휴직을 쓰면 얼마나 더 받나요?",
    a: "자녀가 생후 18개월 이내이고 부모 모두 육아휴직을 사용하면 '6+6 부모육아휴직제' 특례가 적용됩니다. 첫 6개월 동안 상한액이 1~2개월 250만원, 3개월 300만원, 4개월 350만원, 5개월 400만원, 6개월 450만원으로 매달 올라갑니다. 7개월째부터는 일반 규정(80%, 상한 160만원)으로 돌아갑니다. 실제로는 부모 각각의 휴직 기간이 겹치는 개월수만큼만 이 특례가 적용되므로, 한쪽만 먼저 시작해 겹치지 않는 기간이 있다면 그 기간은 일반 기준으로 계산됩니다.",
  },
  {
    q: "한부모는 어떻게 다르게 계산되나요?",
    a: "한부모가족지원법상 모 또는 부에 해당하면 1~3개월 상한액이 일반(250만원)보다 높은 300만원으로 적용됩니다. 4개월째부터는 일반 기준과 동일합니다.",
  },
  {
    q: "누구나 받을 수 있나요?",
    a: "육아휴직을 시작하기 전까지 고용보험 피보험단위기간이 합산 180일 이상이어야 지급 대상이 됩니다. 이 기간에는 이전 직장에서의 가입기간도 합산되지만, 과거 실업급여 수급으로 이미 소진된 기간은 제외됩니다.",
  },
  {
    q: "사후지급금 제도가 없어졌다는 게 무슨 말인가요?",
    a: "2024년까지는 육아휴직급여의 25%를 복직 후 6개월 이상 근무를 확인한 뒤 나중에 한꺼번에 지급했습니다. 2025년 1월 1일부터 이 제도가 폐지되어, 이제는 매달 전액이 그대로 지급됩니다.",
  },
  {
    q: "공무원도 이 계산기로 계산하면 되나요?",
    a: "공무원의 육아휴직수당은 국가공무원 복무·징계 관련 예규 등 별도 규정을 따르며, 산정 방식이 이 계산기가 다루는 고용보험법 시행령 기준(민간 근로자 대상)과 다를 수 있습니다. 참고용으로만 활용하고, 정확한 금액은 소속 기관 인사부서에 확인하시기 바랍니다.",
  },
];

export default function Page() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-[#1B2A4A] sm:text-3xl">
          육아휴직급여 계산기
        </h1>
        <p className="text-sm text-[#5B6478]">
          통상임금과 육아휴직 기간을 입력하면 2026년 기준 육아휴직급여를 월별로 계산합니다.
          부모가 함께 육아휴직을 쓰는 6+6 부모육아휴직제 특례도 반영합니다.
        </p>
      </header>

      <div className="mx-[calc(50%-50vw)] w-screen">
        <ParentalLeaveCalc />
      </div>

      <section className="space-y-3 text-sm leading-relaxed text-[#5B6478]">
        <h2 className="text-xl font-bold text-[#1B2A4A]">복직 후 실수령액이 궁금하다면</h2>
        <p>
          육아휴직급여는 육아휴직 기간 중에만 지급되는 별도 급여입니다. 복직 후 평소 급여에서
          공제되는 금액까지 포함한 실수령액이 궁금하다면{" "}
          <Link href="/calc/worker-net" className="text-[#2E4494] underline">
            직장인 연봉 실수령액 계산기
          </Link>
          에서 확인하세요.
        </p>
      </section>

      <Faq items={FAQ} />
      <FaqJsonLd items={FAQ} />

      <div className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-4 text-sm">
        <Link href="/guide/parental-leave-guide" className="font-medium text-[#2E4494] underline">
          한부모·6+6 특례까지 구간별 산식 자세히 보기 →
        </Link>
      </div>
    </div>
  );
}
