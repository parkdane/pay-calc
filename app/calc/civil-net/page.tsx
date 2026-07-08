import type { Metadata } from "next";
import CivilNetCalc from "@/components/CivilNetCalc";
import AdSlot from "@/components/AdSlot";
import Faq from "@/components/Faq";
import Link from "next/link";

export const metadata: Metadata = {
  title: "공무원 실수령액 계산기 (2026년 기준)",
  description:
    "직급과 호봉을 선택하면 4대보험·소득세를 공제한 2026년 공무원 세후 월급을 바로 계산합니다.",
};

const FAQ = [
  {
    q: "봉급표 금액과 실수령액이 왜 다른가요?",
    a: "봉급표는 기본급만 표시합니다. 실제로는 수당이 더해진 뒤 연금 기여금, 건강보험, 소득세 등이 공제되어 통장에 입금됩니다.",
  },
  {
    q: "이 계산 결과는 정확한가요?",
    a: "공표된 봉급표와 요율을 기준으로 한 추정치입니다. 초과근무수당, 가족수당 등 개인별 수당에 따라 실제 금액과 차이가 있을 수 있습니다.",
  },
  {
    q: "공무원도 국민연금에 가입하나요?",
    a: "아닙니다. 공무원은 국민연금 대신 공무원연금에 가입하며, 기여율이 국민연금보다 높은 대신 수령액 구조가 다릅니다.",
  },
];

export default function Page() {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          공무원 실수령액 계산기
        </h1>
        <p className="text-sm text-slate-600">
          직급과 호봉을 선택하면 2026년 기준 세후 월급을 계산합니다.
        </p>
      </header>

      <CivilNetCalc />

      {/* 계산 결과 바로 아래 = 클릭률 최고 광고 자리 */}
      <AdSlot id="calc-civil-net-result" />

      <section className="space-y-3 text-sm leading-relaxed text-slate-700">
        <h2 className="text-xl font-bold text-slate-900">계산 방식</h2>
        <p>
          기본급(봉급표)에 공통 수당을 더한 세전 금액에서 공무원연금 기여금,
          건강보험료, 장기요양보험료, 근로소득 간이세액표 기준 소득세와
          지방소득세를 공제하여 산출합니다.
        </p>
        <p>
          기본급은{" "}
          <Link href="/salary/civil" className="text-blue-700 underline">
            2026년 일반직 공무원 봉급표
          </Link>
          를 기준으로 합니다.
          {/* TODO: 계산 방식 상세 설명 500자 이상 추가 */}
        </p>
      </section>

      <Faq items={FAQ} />

      <AdSlot id="calc-civil-net-bottom" />
    </article>
  );
}
