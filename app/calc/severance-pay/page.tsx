import type { Metadata } from "next";
import SeverancePayCalc from "@/components/SeverancePayCalc";
import Faq from "@/components/Faq";
import FaqJsonLd from "@/components/FaqJsonLd";
import Link from "next/link";

export const metadata: Metadata = {
  title: "재직기간·퇴직수당 계산기 (공무원·군인, 지급율 6.5~39%)",
  description:
    "재직연수와 기준소득월액을 입력하면 공무원연금법·군인연금법 시행령 기준 재직기간별 퇴직수당을 계산합니다. 지급율(6.5~39%)을 반영합니다.",
  openGraph: {
    title: "재직기간·퇴직수당 계산기 (공무원·군인, 지급율 6.5~39%)",
    description:
      "재직연수와 기준소득월액을 입력하면 공무원연금법·군인연금법 시행령 기준 재직기간별 퇴직수당을 계산합니다. 지급율(6.5~39%)을 반영합니다.",
  },
};

const FAQ = [
  {
    q: "퇴직수당은 퇴직연금과 다른 건가요?",
    a: "네, 완전히 별도입니다. 퇴직연금(또는 퇴직일시금)은 매달 또는 한 번에 받는 노후 소득이고, 퇴직수당은 재직기간에 따라 퇴직 시 한 번 지급되는 별도의 수당입니다. 둘 다 받을 수 있습니다.",
  },
  {
    q: "군인도 같은 방식으로 계산되나요?",
    a: "네. 공무원은 공무원연금법 시행령 제58조, 군인은 군인연금법 시행령에 근거 조문은 다르지만 재직기간별 지급율(6.5~39%)은 동일합니다.",
  },
  {
    q: "재직연수는 실제 근무한 기간 그대로인가요?",
    a: "휴직·직위해제·정직·강등으로 직무에 종사하지 못한 기간이 있으면 그 기간의 2분의 1이 재직연수에서 빠질 수 있습니다. 이 계산기는 이런 감축 사유를 반영하지 않은 단순 재직연수 기준이므로, 해당 사유가 있다면 실제 금액은 이보다 적을 수 있습니다.",
  },
  {
    q: "33년을 넘게 재직하면 그만큼 더 받나요?",
    a: "아닙니다. 퇴직수당 계산에 반영되는 재직기간은 최대 33년까지입니다. 33년을 초과해 근무해도 34년째부터는 퇴직수당 계산에 추가로 반영되지 않습니다.",
  },
];

export default function Page() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-[#1B2A4A] sm:text-3xl">
          재직기간·퇴직수당 계산기
        </h1>
        <p className="text-sm text-[#5B6478]">
          재직연수와 기준소득월액을 입력하면 공무원연금법·군인연금법 시행령 기준 재직기간별
          퇴직수당을 계산합니다. 지급율(6.5~39%)을 반영합니다.
        </p>
      </header>

      <Link
        href="/calc/retirement-pay"
        className="block rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-4 transition hover:shadow-md"
      >
        <p className="text-xs font-semibold text-[#2E4494]">일반 사기업 근로자라면</p>
        <p className="mt-0.5 font-bold text-[#1B2A4A]">이 페이지가 아니라 퇴직금 계산기로 이동 →</p>
      </Link>

      <div className="mx-[calc(50%-50vw)] w-screen">
        <SeverancePayCalc />
      </div>

      <section className="space-y-3 text-sm leading-relaxed text-[#5B6478]">
        <h2 className="text-xl font-bold text-[#1B2A4A]">은퇴 후 연금도 함께 확인하세요</h2>
        <p>
          퇴직수당은 목돈으로 한 번 지급되는 반면, 매달 받는 연금은 별도로 계산해야 합니다.{" "}
          <Link href="/calc/pension-net" className="text-[#2E4494] underline">
            공무원연금 예상수령액 계산기
          </Link>
          에서 은퇴 후 예상 월 연금액을 함께 확인해보세요.
        </p>
      </section>

      <Faq items={FAQ} />
      <FaqJsonLd items={FAQ} />
    </div>
  );
}
