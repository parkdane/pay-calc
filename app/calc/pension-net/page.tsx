import type { Metadata } from "next";
import PensionNetCalc from "@/components/PensionNetCalc";
import AdSlot from "@/components/AdSlot";
import Faq from "@/components/Faq";
import FaqJsonLd from "@/components/FaqJsonLd";
import SourceNote from "@/components/SourceNote";
import Link from "next/link";

export const metadata: Metadata = {
  title: "교사·공무원 연금 수령액 계산기 (경찰·소방·군인, 개시연령 반영)",
  description:
    "임용일·직급·호봉을 입력하면 은퇴 후 받을 공무원연금 예상 월수령액을 계산합니다. 일반직·교사·경찰·소방·군인 전부 지원하며, 1997~2026년 실제 봉급표와 3단계 산식(구법·과도기·소득재분배)을 반영합니다.",
  openGraph: {
    title: "교사·공무원 연금 수령액 계산기 (경찰·소방·군인, 개시연령 반영)",
    description: "임용일·직급·호봉을 입력하면 은퇴 후 받을 공무원연금 예상 월수령액을 계산합니다. 일반직·교사·경찰·소방·군인 전부 지원하며, 1997~2026년 실제 봉급표와 3단계 산식(구법·과도기·소득재분배)을 반영합니다.",
  },
};

const START_AGE: [string, string][] = [
  ["2016~2021년", "60세"],
  ["2022~2023년", "61세"],
  ["2024~2026년", "62세"],
  ["2027~2029년", "63세"],
  ["2030~2032년", "64세"],
  ["2033년 이후", "65세"],
];

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
    a: "연금 개시연령보다 일찍 수급을 시작하면(조기퇴직연금) 1년당 5%씩, 최대 5년(25%)까지 감액됩니다. 개시연령은 임용 시기와 퇴직연도에 따라 다르며, 1996~2009년 임용자는 2024~2026년 퇴직 시 62세, 2027~2029년 63세, 2030~2032년 64세, 2033년 이후 65세입니다(공무원연금공단 안내). 이 계산기는 이 기준을 적용하고, 2010년 이후 임용자는 65세로 보수적으로 계산합니다. 개시연령 이후부터 받으면 감액이 없습니다.",
  },
  {
    q: "2026년에 퇴직하면 연금은 언제부터 받나요?",
    a: "1996~2009년에 임용된 공무원은 2024~2026년에 퇴직하면 62세부터 받습니다. 2027~2029년 퇴직은 63세, 2030~2032년 64세, 2033년 이후 65세로 늦어지고, 1995년 이전 임용자는 60세입니다(공무원연금공단 안내).",
  },
  {
    q: "재직 10년이 안 되면 연금을 못 받나요?",
    a: "10년 이상 재직하고 퇴직해야 퇴직연금을 받습니다(공무원연금법 제43조). 10년 미만이면 매달 받는 연금 대신 퇴직일시금을 받습니다.",
  },
];

export default function Page() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-[#1B2A4A] sm:text-3xl">
          교사·공무원 연금 수령액 계산기
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

      <Link
        href="/calc/retirement-age"
        className="block rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-4 transition hover:shadow-md"
      >
        <p className="text-xs font-semibold text-[#2E4494]">교원·일반직 공무원이라면</p>
        <p className="mt-0.5 font-bold text-[#1B2A4A]">내 정년퇴직일 먼저 계산해보기 →</p>
      </Link>

      <section className="space-y-4 text-sm leading-relaxed text-[#5B6478]">
        <h2 className="text-xl font-bold text-[#1B2A4A]">연금은 언제부터, 얼마나 줄어드나</h2>
        <p>
          퇴직연금은 퇴직하자마자 나오는 게 아니라 퇴직연도별 개시연령부터 지급됩니다. 아래는 1996~2009년 임용자 기준이며,
          1995년 이전 임용자는 60세, 2010년 이후 임용자는 65세입니다(이 계산기는 2010년 이후 임용자를 65세로 보수적으로 계산).
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="overflow-x-auto rounded-xl border border-[rgba(46,68,148,0.14)]">
            <table className="w-full text-sm">
              <thead className="bg-[#F5F6FA] text-xs text-[#7A8296]">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">퇴직연도</th>
                  <th className="px-4 py-2 text-right font-medium">연금 개시연령</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(46,68,148,0.08)] bg-white text-[#1B2A4A]">
                {START_AGE.map(([y, a]) => (
                  <tr key={y}>
                    <td className="px-4 py-2">{y}</td>
                    <td className="px-4 py-2 text-right">{a}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="overflow-x-auto rounded-xl border border-[rgba(46,68,148,0.14)]">
            <table className="w-full text-sm">
              <thead className="bg-[#F5F6FA] text-xs text-[#7A8296]">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">개시연령보다 일찍 받으면</th>
                  <th className="px-4 py-2 text-right font-medium">감액</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(46,68,148,0.08)] bg-white text-[#1B2A4A]">
                {[1, 2, 3, 4, 5].map((y) => (
                  <tr key={y}>
                    <td className="px-4 py-2">{y}년 일찍</td>
                    <td className="px-4 py-2 text-right">−{y * 5}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p>
          조기퇴직연금의 감액은 평생 유지되므로, 정년퇴직 후 개시연령까지 몇 년을 기다릴지와 그 사이 소득을 어떻게 메울지를
          함께 계획하는 것이 좋습니다. 퇴직 시 한 번에 받는 퇴직수당은 연금과 별개입니다.
        </p>
      </section>

      <SourceNote slug="pension-net" />

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
