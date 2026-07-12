import type { Metadata } from "next";
import IncomeRankCalc from "@/components/IncomeRankCalc";
import AdSlot from "@/components/AdSlot";
import Faq from "@/components/Faq";
import Link from "next/link";

export const metadata: Metadata = {
  title: "내 연봉 상위 몇 %? 연봉 순위 계산기",
  description:
    "연봉을 입력하면 국세청 근로소득 백분위 자료 기준으로 대한민국에서 상위 몇 %인지 바로 확인합니다.",
};

const FAQ = [
  {
    q: "연봉 5,000만 원이면 상위 몇 %인가요?",
    a: "국세청 2024년 귀속 자료 기준 상위 약 30% 부근입니다. 근로소득자 중위 연봉이 3,416만 원이므로 5,000만 원은 중위보다 1.5배가량 높은 소득입니다.",
  },
  {
    q: "어떤 데이터를 기준으로 하나요?",
    a: "국세청이 공공데이터포털에 공개하는 근로소득 백분위(천분위) 자료를 사용합니다. 연말정산을 신고한 전체 근로소득자를 소득순으로 나열한 통계로, 사업소득·기타소득·자산은 포함되지 않습니다.",
  },
  {
    q: "세전인가요 세후인가요?",
    a: "세전 총급여(비과세 제외) 기준입니다. 통상 말하는 '연봉'과 같은 개념이며, 실수령액이 아닙니다.",
  },
  {
    q: "체감보다 순위가 높게 나오는데 왜 그런가요?",
    a: "이 통계에는 아르바이트·단기근로 등 저소득 근로자까지 전부 포함되기 때문입니다. 또래·같은 업계와 비교하는 체감 순위와는 다를 수 있습니다.",
  },
];

export default function Page() {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          내 연봉, 상위 몇 %일까?
        </h1>
        <p className="text-sm text-slate-600">
          연봉을 입력하면 국세청 근로소득 통계 기준으로 대한민국 근로소득자 중
          내 위치를 알려드립니다.
        </p>
      </header>

      <IncomeRankCalc />

      <AdSlot id="calc-income-rank-result" />

      <section className="space-y-3 text-sm leading-relaxed text-slate-700">
        <h2 className="text-xl font-bold text-slate-900">계산 방식</h2>
        <p>
          국세청이 공개하는 근로소득 백분위(천분위) 자료의 구간별 평균
          총급여를 앵커로 삼고, 구간 사이는 보간하여 상위 %를 추정합니다.
          연말정산 신고 근로자 전체가 모수이며, 개인별 정확한 순위 확정이
          아닌 참고용 추정입니다.
        </p>
        <p>
          내 연봉의 세후 실수령액이 궁금하다면{" "}
          <Link href="/calc/worker-net" className="text-[#5B67A2] underline">
            연봉 실수령액 계산기
          </Link>
          에서 확인하고, 연봉별 실수령 비율 그래프도 함께 볼 수 있습니다.
        </p>
      </section>

      <Faq items={FAQ} />

      <AdSlot id="calc-income-rank-bottom" />
    </article>
  );
}
