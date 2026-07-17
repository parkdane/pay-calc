import type { Metadata } from "next";
import SalaryCompareCalc from "@/components/SalaryCompareCalc";
import Faq from "@/components/Faq";
import FaqJsonLd from "@/components/FaqJsonLd";

export const metadata: Metadata = {
  title: "대기업 평균연봉 비교 (금감원 공시 기준)",
  description:
    "삼성전자·SK하이닉스·현대차 등 국내 대기업의 1인평균급여액을 금융감독원 전자공시(DART) 사업보고서 기준으로 비교합니다. 내 연봉을 입력하면 상위 몇 %인지 바로 확인할 수 있습니다.",
};

const FAQ = [
  {
    q: "이 데이터는 어디서 가져오나요?",
    a: "각 기업이 금융감독원 전자공시시스템(DART)에 제출한 사업보고서의 \"직원현황\" 항목에 있는 1인평균급여액입니다. 상장사는 법적으로 공시해야 하는 자료라 커뮤니티 추정치보다 신뢰도가 높습니다.",
  },
  {
    q: "1인평균급여액이 정확히 뭔가요?",
    a: "해당 회사 전체 임직원(신입사원부터 임원 직전까지)의 연간 급여 총액을 인원수로 나눈 값입니다. 신입 초봉이나 특정 연차 기준이 아니라 회사 전체 평균이라, 실제 입사 시 받는 연봉과는 차이가 있을 수 있습니다.",
  },
  {
    q: "매번 최신 데이터인가요?",
    a: "매주 자동으로 다시 수집합니다. 다만 기업의 사업보고서 자체는 1년에 한 번(보통 3월 말까지) 갱신되기 때문에, 실제 연봉 데이터는 새 사업보고서가 나올 때만 바뀝니다.",
  },
  {
    q: "성과급도 포함된 금액인가요?",
    a: "네. 급여 총액 기준이라 상여금·성과급 등 현금성 보수가 포함됩니다. 다만 스톡옵션이나 RSU 같은 비현금성 보상은 포함되지 않을 수 있습니다.",
  },
];

export default function Page() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-[#1B2A4A] sm:text-3xl">
          대기업 평균연봉 비교
        </h1>
        <p className="text-sm text-[#5B6478]">
          국내 대기업의 1인평균급여액을 금융감독원 전자공시(DART) 사업보고서 기준으로 비교합니다. 내 연봉을
          입력하면 비교 대상 기업들 중 어느 위치인지 바로 확인할 수 있습니다.
        </p>
      </header>

      <div className="mx-[calc(50%-50vw)] w-screen">
        <SalaryCompareCalc />
      </div>

      <section className="space-y-3 text-sm leading-relaxed text-[#5B6478]">
        <h2 className="text-xl font-bold text-[#1B2A4A]">계산 방식</h2>
        <p>
          각 기업의 사업보고서 "직원현황"에 보고된 1인평균급여액을 그대로 사용합니다. 사업부문·성별로 나뉘어
          보고되는 경우(예: DX/DS 사업부문) 인원수를 가중치로 삼아 회사 전체 평균을 계산합니다. 입력한 연봉을
          이 목록의 기업들과 비교해 상위 몇 % 위치인지, 평균 대비 몇 배인지 계산합니다.
        </p>
      </section>

      <Faq items={FAQ} />
      <FaqJsonLd items={FAQ} />
    </div>
  );
}
