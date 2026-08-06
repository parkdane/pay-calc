import type { Metadata } from "next";
import CivilNetCalc from "@/components/CivilNetCalc";
import AdSlot from "@/components/AdSlot";
import Faq from "@/components/Faq";
import FaqJsonLd from "@/components/FaqJsonLd";
import Link from "next/link";

export const metadata: Metadata = {
  title: "교사 실수령액 계산기 (2026년 호봉표 기준)",
  description:
    "유·초·중·고 교사의 호봉과 담임·보직 여부를 입력하면 교직수당·담임수당을 반영한 2026년 세후 월급을 계산합니다.",
};

const FAQ = [
  {
    q: "초등교사와 고등학교 교사의 월급이 다른가요?",
    a: "기본급(봉급표)은 동일합니다. 유치원·초·중·고 교원은 모두 같은 봉급표(별표11)를 적용받으며, 차이는 임용 시 시작 호봉과 수당 구조에서 발생합니다.",
  },
  {
    q: "신규 교사는 몇 호봉부터 시작하나요?",
    a: "사범대·교대 졸업자는 보통 9호봉, 비사범계열 출신은 8호봉부터 시작하는 경우가 많습니다. 군 경력 등이 있으면 호봉에 산입됩니다.",
  },
  {
    q: "교사가 받는 수당은 어떤 게 있나요?",
    a: "전 교원 공통 교직수당 월 25만 원, 담임 교사는 담임수당 월 20만 원, 보직 교사는 보직교사수당 월 15만 원이 추가됩니다. 정액급식비 16만 원, 정근수당, 명절휴가비, 성과상여금(정교사는 26호봉 기준 산정)도 지급됩니다.",
  },
  {
    q: "40호봉이 끝인가요?",
    a: "아닙니다. 40호봉 이후에는 근속가봉이 적용되어 1년마다 81,000원씩 최대 10호봉(근가10, 월 7,016,100원)까지 오릅니다.",
  },
];

export default function Page() {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-[#1B2A4A] sm:text-3xl">
          교사 실수령액 계산기
        </h1>
        <p className="text-sm text-[#5B6478]">
          유·초·중·고 교사의 호봉과 담임·보직 여부를 입력하면 2026년 기준 세후 월급을
          계산합니다.
        </p>
      </header>

      <div className="mx-[calc(50%-50vw)] w-screen">
        <CivilNetCalc defaultOccId="teacher" />
      </div>

      <section className="space-y-3 text-sm leading-relaxed text-[#5B6478]">
        <h2 className="text-xl font-bold text-[#1B2A4A]">계산 방식</h2>
        <p>
          교원 봉급표 기본급에 교직수당(월 25만 원), 담임을 맡으면 담임수당(월 20만
          원)을 더한 세전 금액에서 공무원연금 기여금, 건강보험료, 장기요양보험료,
          소득세·지방소득세를 공제하여 산출합니다.
        </p>
        <p>
          기본급은{" "}
          <Link href="/salary/teacher" className="text-[#2E4494] underline">
            2026년 교원 봉급표
          </Link>
          를 기준으로 합니다.
        </p>
      </section>

      <Faq items={FAQ} />
      <FaqJsonLd items={FAQ} />
      <AdSlot id="calc-teacher-net-bottom" />
    </article>
  );
}
