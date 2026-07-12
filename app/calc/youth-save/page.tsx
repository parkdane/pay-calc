import type { Metadata } from "next";
import YouthSavingsCalc from "@/components/YouthSavingsCalc";
import AdSlot from "@/components/AdSlot";
import Faq from "@/components/Faq";

export const metadata: Metadata = {
  title: "청년미래적금 계산기 (2026년 기준)",
  description:
    "월 납입액과 가입 유형을 선택하면 정부기여금(6%/12%)과 비과세 이자를 포함한 청년미래적금 3년 만기 수령액을 계산합니다.",
};

const FAQ = [
  {
    q: "월 50만 원 넣으면 3년 뒤 얼마 받나요?",
    a: "우대금리 포함 8% 기준으로 일반형은 약 2,138만 원(원금 1,800만 + 기여금 108만 + 이자 230만), 우대형은 약 2,255만 원을 받습니다. 위 계산기에서 본인 조건으로 확인하세요.",
  },
  {
    q: "일반형과 우대형의 차이는 뭔가요?",
    a: "정부기여금 비율이 다릅니다. 일반형은 납입액의 6%(월 최대 3만 원), 우대형은 12%(월 최대 6만 원)입니다. 중소기업 재직·신규취업자 등이 우대형 대상입니다.",
  },
  {
    q: "가입 조건은 어떻게 되나요?",
    a: "만 19~34세(병역 최대 6년 차감) 청년으로, 직전연도 총급여 7,500만 원 이하 또는 종합소득 6,300만 원 이하여야 합니다. 청년도약계좌·청년희망적금 보유자는 중복 가입이 제한됩니다.",
  },
  {
    q: "중도 해지하면 어떻게 되나요?",
    a: "일반 중도해지 시 정부기여금이 지급되지 않고 이자에 과세됩니다. 다만 사망·해외이주·퇴직·폐업 등 특별한 사유는 특별중도해지로 만기와 동일한 혜택을 받습니다.",
  },
];

export default function Page() {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-[#1B2A4A] sm:text-3xl">
          청년미래적금 계산기
        </h1>
        <p className="text-sm text-[#5B6478]">
          가입 유형과 월 납입액을 넣으면 정부기여금과 비과세 이자를 포함한 3년
          만기 수령액을 계산합니다.
        </p>
      </header>

      <div className="mx-[calc(50%-50vw)] w-screen">
        <YouthSavingsCalc />
      </div>

      <AdSlot id="calc-youth-save-result" />

      <section className="space-y-3 text-sm leading-relaxed text-[#5B6478]">
        <h2 className="text-xl font-bold text-[#1B2A4A]">계산 방식</h2>
        <p>
          만기 수령액은 내 납입 원금 + 정부기여금(월 납입액의 6% 또는 12%, 월
          상한 적용) + 비과세 이자로 구성됩니다. 이자는 저축금액과 정부기여금
          모두에 붙으며, 매월 적립식 단리로 계산합니다.
        </p>
        <p>
          2026년 6월 출시된 정책 금융 상품으로, 청년도약계좌의 후속 상품입니다.
          기본금리는 전 취급기관 동일하게 연 5%이며, 은행별 우대금리로 최대 8%까지
          받을 수 있습니다.
        </p>
      </section>

      <Faq items={FAQ} />

      <AdSlot id="calc-youth-save-bottom" />
    </article>
  );
}
