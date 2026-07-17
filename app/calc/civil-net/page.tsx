import type { Metadata } from "next";
import CivilNetCalc from "@/components/CivilNetCalc";
import AdSlot from "@/components/AdSlot";
import Faq from "@/components/Faq";
import FaqJsonLd from "@/components/FaqJsonLd";
import Link from "next/link";

export const metadata: Metadata = {
  title: "공무원·경찰·소방 실수령액 계산기 (2026년 기준)",
  description:
    "직종·직급·호봉과 가족·근속연수·시간외근무를 입력하면 간이세액표 방식으로 2026년 세후 월급과 연간 수령액을 계산합니다.",
};

const FAQ = [
  {
    q: "봉급표 금액과 실수령액이 왜 다른가요?",
    a: "봉급표는 기본급만 표시합니다. 실제로는 정액급식비·직급보조비·가족수당 등이 더해진 뒤 공무원연금 기여금, 건강보험, 소득세 등이 공제되어 통장에 입금됩니다.",
  },
  {
    q: "소득세는 어떻게 계산하나요?",
    a: "국세청 근로소득 간이세액표가 만들어지는 연환산 산출 방식을 그대로 적용합니다. 부양가족 수를 입력하면 인적공제가 반영되어 실제 원천징수액에 근접합니다.",
  },
  {
    q: "경찰·소방도 계산할 수 있나요?",
    a: "네. 직종에서 경찰 또는 소방을 선택하면 해당 봉급표와 위험근무수당(2026년 월 8만 원)이 자동 반영됩니다.",
  },
  {
    q: "공무원도 국민연금에 가입하나요?",
    a: "아닙니다. 공무원은 국민연금 대신 공무원연금에 가입하며, 기여율이 9%로 국민연금 본인부담(4.5%)보다 높은 대신 수령 구조가 다릅니다.",
  },
];

export default function Page() {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-[#1B2A4A] sm:text-3xl">
          공무원·경찰·소방 실수령액 계산기
        </h1>
        <p className="text-sm text-[#5B6478]">
          직종·직급·호봉을 선택하면 2026년 기준 세후 월급을 계산합니다. 상세
          옵션에서 가족·근속연수·시간외근무까지 반영할 수 있습니다.
        </p>
      </header>

      <div className="mx-[calc(50%-50vw)] w-screen">
        <CivilNetCalc />
      </div>

      <section className="space-y-3 text-sm leading-relaxed text-[#5B6478]">
        <h2 className="text-xl font-bold text-[#1B2A4A]">계산 방식</h2>
        <p>
          기본급(봉급표)에 정액급식비, 직급별 직급보조비, 가족수당(배우자
          4만·첫째 5만·둘째 8만·셋째부터 각 12만), 근속연수에 따른
          정근수당·가산금, 시간외근무수당(기준호봉 봉급 × 조정률 × 150% ÷
          209)을 더한 세전 금액에서 공무원연금 기여금(9%), 건강보험료,
          장기요양보험료, 소득세·지방소득세를 공제하여 산출합니다.
        </p>
        <p>
          소득세는 국세청 근로소득 간이세액표의 연환산 산출 방식을 적용해
          부양가족 수에 따른 인적공제까지 반영합니다. 기본급은{" "}
          <Link href="/salary/civil" className="text-[#2E4494] underline">
            일반직
          </Link>
          ·
          <Link href="/salary/police" className="text-[#2E4494] underline">
            경찰
          </Link>
          ·
          <Link href="/salary/fire" className="text-[#2E4494] underline">
            소방
          </Link>{" "}
          봉급표를 기준으로 합니다.
        </p>
      </section>

      <Faq items={FAQ} />
      <FaqJsonLd items={FAQ} />

      <AdSlot id="calc-civil-net-bottom" />
    </article>
  );
}
