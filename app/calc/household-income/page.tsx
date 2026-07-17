import type { Metadata } from "next";
import HouseholdIncomeCalc from "@/components/HouseholdIncomeCalc";
import Faq from "@/components/Faq";
import FaqJsonLd from "@/components/FaqJsonLd";

export const metadata: Metadata = {
  title: "가구소득 계산기 (맞벌이 합산·평균·중위소득 비교)",
  description:
    "본인·배우자 연봉과 성과급, 기타 보상을 합쳐 가구 연 총소득과 월 실수령을 계산하고, 평균 가구소득·기준 중위소득 대비 위치를 확인합니다.",
};

const FAQ = [
  {
    q: "가구 평균소득과 기준 중위소득은 왜 다른가요?",
    a: "평균은 전체 가구 소득을 단순 평균한 값이라 소수의 고소득 가구에 영향을 크게 받습니다. 기준 중위소득은 가구를 소득 순으로 줄 세웠을 때 정확히 가운데에 있는 값으로, 복지·정책 지원 대상을 정하는 기준으로 쓰입니다.",
  },
  {
    q: "실수령 추정은 어떻게 계산하나요?",
    a: "본인과 배우자를 각각 개별 근로소득자로 보고, 실수령액 계산기와 동일한 4대보험·소득세 로직을 각자 적용한 뒤 합산합니다. 기타 보상(임대·프리랜서 소득 등)은 세금 종류가 다양해 비과세로 단순화했습니다.",
  },
  {
    q: "기준 중위소득 대비 비율은 왜 중요한가요?",
    a: "청년 주택, 신혼부부 임대, 각종 바우처 등 정책 지원 대부분이 '기준 중위소득의 몇 % 이하'를 자격 기준으로 삼습니다. 내 가구가 몇 %에 해당하는지 알아두면 지원 대상 여부를 가늠하는 데 참고할 수 있습니다.",
  },
  {
    q: "평균보다 높은데 여유가 없게 느껴지는 이유는 뭔가요?",
    a: "평균 가구소득은 고소득 가구의 영향으로 실제 체감보다 높게 형성되는 경향이 있습니다. 비소비지출(세금·이자 등)을 뺀 처분가능소득이나 기준 중위소득과 비교하는 것이 체감에 더 가깝습니다.",
  },
];

export default function Page() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-[#1B2A4A] sm:text-3xl">
          가구소득 계산기
        </h1>
        <p className="text-sm text-[#5B6478]">
          본인·배우자 연봉과 성과급, 기타 보상을 합쳐 가구 연 총소득과 월 실수령을 계산하고, 평균 가구소득·
          기준 중위소득 대비 우리 집 위치를 확인합니다.
        </p>
      </header>

      <div className="mx-[calc(50%-50vw)] w-screen">
        <HouseholdIncomeCalc />
      </div>

      <Faq items={FAQ} />
      <FaqJsonLd items={FAQ} />
    </div>
  );
}
