import type { Metadata } from "next";
import SavingsGoalSim from "@/components/SavingsGoalSim";
import AdSlot from "@/components/AdSlot";
import Faq from "@/components/Faq";
import FaqJsonLd from "@/components/FaqJsonLd";
import Link from "next/link";

export const metadata: Metadata = {
  title: "1억 모으기 시뮬레이터 (저축 목표 계산기)",
  description:
    "월급·고정비·생활비를 입력하면 매달 저축 가능액과 목표 금액(1억 등) 달성까지 걸리는 기간을 계산합니다.",
};

const FAQ = [
  {
    q: "월 100만 원씩 모으면 1억까지 얼마나 걸리나요?",
    a: "이자 없이 모으면 8년 4개월, 연 3% 저축이면 약 7년 6개월, 연 5%면 약 7년 정도 걸립니다. 금리와 저축액에 따라 달라지니 위 시뮬레이터에서 직접 확인하세요.",
  },
  {
    q: "저축률은 얼마가 적당한가요?",
    a: "정답은 없지만 사회초년생 재테크에서 실수령액의 50% 이상 저축이 흔히 목표로 제시됩니다. 본가 거주 여부, 월세 부담에 따라 현실적인 저축률은 크게 달라지므로 고정비를 먼저 파악하는 것이 중요합니다.",
  },
  {
    q: "어디에 저축하는 게 좋나요?",
    a: "만 34세 이하라면 정부기여금과 비과세가 붙는 청년미래적금 같은 정책 상품이 일반 적금보다 유리합니다. 이 시뮬레이터의 금리를 정책 상품 금리(5~8%)로 올려보면 기간 차이를 체감할 수 있습니다.",
  },
];

export default function Page() {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-[#1B2A4A] sm:text-3xl">
          저축 목표 시뮬레이터
        </h1>
        <p className="text-sm text-[#5B6478]">
          월급과 지출을 입력하면 매달 얼마를 저축할 수 있는지, 목표 금액까지
          얼마나 걸리는지 계산합니다.
        </p>
      </header>

      <div className="mx-[calc(50%-50vw)] w-screen">
        <SavingsGoalSim />
      </div>

      <AdSlot id="calc-savings-goal-result" />

      <section className="space-y-3 text-sm leading-relaxed text-[#5B6478]">
        <h2 className="text-xl font-bold text-[#1B2A4A]">사용 방법</h2>
        <p>
          월 실수령액에서 고정비(월세·통신비·보험료·구독료 등)와
          변동비(식비·교통·여가 등)를 빼면 저축 가능액이 나옵니다. 목표
          금액과 저축 금리를 넣으면 월복리 적립 기준으로 달성 기간을
          계산하며, 지출을 조정해가며 기간이 어떻게 바뀌는지 시뮬레이션할 수
          있습니다.
        </p>
        <p>
          내 월 실수령액을 모른다면{" "}
          <Link href="/calc/worker-net" className="text-[#2E4494] underline">
            연봉 실수령액 계산기
          </Link>
          에서 먼저 확인하고, 저축 상품은{" "}
          <Link href="/calc/youth-save" className="text-[#2E4494] underline">
            청년미래적금
          </Link>
          과{" "}
          <Link href="/calc/deposit" className="text-[#2E4494] underline">
            일반 적금
          </Link>
          을 비교해보세요.
        </p>
      </section>

      <Faq items={FAQ} />
      <FaqJsonLd items={FAQ} />

      <AdSlot id="calc-savings-goal-bottom" />
    </article>
  );
}
