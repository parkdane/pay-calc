import type { Metadata } from "next";
import MilitaryNetCalc from "@/components/MilitaryNetCalc";
import AdSlot from "@/components/AdSlot";
import Faq from "@/components/Faq";
import FaqJsonLd from "@/components/FaqJsonLd";
import SourceNote from "@/components/SourceNote";
import PayStructure, { EXAMPLES } from "@/components/PayStructure";
import Link from "next/link";

export const metadata: Metadata = {
  title: "군인 월급 실수령액 계산기 (2026 봉급표 기준 세후 계산)",
  description:
    "2026년 군인 봉급표 기준 계급·호봉과 수당을 입력하면 군인연금·건강보험·소득세를 공제한 부사관·장교 세후 월급을 계산합니다.",
  openGraph: {
    title: "군인 월급 실수령액 계산기 (2026 봉급표 기준 세후 계산)",
    description: "2026년 군인 봉급표 기준 계급·호봉과 수당을 입력하면 군인연금·건강보험·소득세를 공제한 부사관·장교 세후 월급을 계산합니다.",
  },
};
const wonFmt = (n: number) => Math.round(n).toLocaleString("ko-KR") + "원";

const FAQ = [
  {
    q: "병사 실수령액도 계산되나요?",
    a: "이 계산기는 직업군인(부사관·장교) 대상입니다. 병사 봉급은 비과세로 봉급표 금액이 그대로 지급되므로 별도 계산이 필요 없습니다.",
  },
  {
    q: "왜 실제 급여명세서와 차이가 나나요?",
    a: "위험근무수당(병과별), 특수지 근무수당 등 개인·부대별 편차가 큰 항목은 포함하지 않았기 때문입니다. 정근수당과 가산금은 상세 옵션에서 근속연수를 입력하면 반영됩니다. 기본급과 주요 수당 기준의 추정치로 참고하세요.",
  },
  {
    q: "군인연금 기여율은 몇 %인가요?",
    a: "군인연금 기여율은 기준소득월액의 7%로, 공무원연금(9%)과 다릅니다. 이 계산기는 기본급을 기준으로 근사 계산합니다.",
  },
  {
    q: "하사 1호봉 기본급은 9급 공무원과 같나요?",
    a: `2026년 하사 1호봉 기본급은 ${wonFmt(EXAMPLES.hasa1)}으로 일반직 9급·순경 1호봉(${wonFmt(EXAMPLES.police1_1)})과 같습니다. 다만 군인은 공무원보수규정 별표13을 따로 쓰기 때문에 이후 호봉 상승폭과 수당 구성은 다릅니다.`,
  },
  {
    q: "군인연금 기여금은 얼마나 빠지나요?",
    a: "기준소득월액의 7%로, 공무원연금 기여율(9%)보다 2%p 낮습니다. 이 계산기는 기본급을 기준으로 근사 계산하므로 수당이 많은 경우 실제 기여금은 조금 더 클 수 있습니다.",
  },
];
export default function Page() {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-[#1B2A4A] sm:text-3xl">
          군인 간부 실수령액 계산기
        </h1>
        <p className="text-sm text-[#5B6478]">
          부사관·장교의 계급·호봉과 수당을 입력하면 2026년 기준 세후 월급을
          계산합니다.
        </p>
      </header>
      <div className="mx-[calc(50%-50vw)] w-screen">
        <MilitaryNetCalc />
      </div>
      <Link
        href="/calc/severance-pay"
        className="block rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-4 transition hover:shadow-md"
      >
        <p className="text-xs font-semibold text-[#2E4494]">전역을 앞두고 있다면</p>
        <p className="mt-0.5 font-bold text-[#1B2A4A]">퇴직수당 계산해보기 →</p>
      </Link>
      <section className="space-y-3 text-sm leading-relaxed text-[#5B6478]">
        <h2 className="text-xl font-bold text-[#1B2A4A]">계산 방식</h2>
        <p>
          기본급(군인 봉급표)에 배우자·자녀 가족수당, 주택수당, 시간외근무수당을
          더한 세전 금액에서 군인연금 기여금(7%), 건강보험료, 장기요양보험료,
          소득세·지방소득세를 공제하여 산출합니다. 시간외근무수당은 기본급 ×
          (1/209) × 1.5 × 시간으로 계산합니다.
        </p>
        <p>
          기본급은{" "}
          <Link href="/salary/military" className="text-[#2E4494] underline">
            2026년 군인 봉급표
          </Link>
          를 기준으로 합니다.
        </p>
      </section>
      <PayStructure variant="military" />

      <SourceNote slug="military-net" />

      <Faq items={FAQ} />
      <FaqJsonLd items={FAQ} />
      <AdSlot id="calc-military-net-bottom" />
    </article>
  );
}
