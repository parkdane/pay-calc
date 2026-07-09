import type { Metadata } from "next";
import WorkerNetCalc from "@/components/WorkerNetCalc";
import AdSlot from "@/components/AdSlot";
import Faq from "@/components/Faq";
import Link from "next/link";

export const metadata: Metadata = {
  title: "연봉 실수령액 계산기 (직장인, 2026년 기준)",
  description:
    "연봉을 입력하면 4대보험과 소득세를 공제한 월 실수령액을 계산하고, 연봉별 실수령 비율을 그래프로 비교합니다.",
};

const FAQ = [
  {
    q: "연봉 5,000만 원 실수령액은 얼마인가요?",
    a: "부양가족이 없는 경우 월 실수령액은 약 350만 원대입니다. 국민연금 4.5%, 건강보험 3.595%, 장기요양·고용보험과 소득세를 공제한 금액이며, 부양가족이 있으면 소득세가 줄어 조금 더 받습니다.",
  },
  {
    q: "연봉 9천만 원과 1억 원은 실수령 차이가 왜 얼마 안 나나요?",
    a: "소득세가 누진 구조이기 때문입니다. 연봉이 오를수록 추가되는 금액이 높은 세율 구간(24~35%)에 걸려서, 세전 1,000만 원 인상이 실수령으로는 600~700만 원대 인상에 그칩니다.",
  },
  {
    q: "왜 실제 급여명세서와 금액이 다른가요?",
    a: "회사마다 비과세 식대(월 20만 원 한도), 상여금 지급 방식, 연장수당 등이 달라 공제 기준 금액이 다르기 때문입니다. 이 계산기는 연봉 전액을 과세 대상으로 보는 보수적 추정입니다.",
  },
];

export default function Page() {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          연봉 실수령액 계산기
        </h1>
        <p className="text-sm text-slate-600">
          연봉을 입력하면 4대보험·소득세를 뺀 월 실수령액과, 연봉 구간별
          실수령 비율 비교 그래프를 보여드립니다.
        </p>
      </header>

      <WorkerNetCalc />

      <AdSlot id="calc-worker-net-result" />

      <section className="space-y-3 text-sm leading-relaxed text-slate-700">
        <h2 className="text-xl font-bold text-slate-900">계산 방식</h2>
        <p>
          월 세전 급여(연봉÷12)에서 국민연금(4.5%, 기준소득월액 상한 적용),
          건강보험(3.595%), 장기요양보험(건강보험료의 13.14%),
          고용보험(0.9%)을 공제하고, 소득세는 국세청 근로소득 간이세액표의
          연환산 산출 방식으로 부양가족 인적공제까지 반영해 계산합니다.
        </p>
        <p>
          내 연봉이 전국에서 어느 위치인지 궁금하다면{" "}
          <Link href="/calc/income-rank" className="text-blue-700 underline">
            연봉 순위 계산기
          </Link>
          에서, 실수령액으로 목돈을 모으는 계획은{" "}
          <Link href="/calc/savings-goal" className="text-blue-700 underline">
            저축 목표 시뮬레이터
          </Link>
          에서 확인하세요.
        </p>
      </section>

      <Faq items={FAQ} />

      <AdSlot id="calc-worker-net-bottom" />
    </article>
  );
}
