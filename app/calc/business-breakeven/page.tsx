import type { Metadata } from "next";
import BusinessBreakEvenCalc from "@/components/BusinessBreakEvenCalc";
import Faq from "@/components/Faq";

export const metadata: Metadata = {
  title: "자영업 손익분기·투자금 회수 계산기",
  description:
    "일매출·월매출, 원가율, 월세·인건비 등 고정비, 창업 초기 투자금을 입력하면 손익분기 매출과 투자금 회수 기간을 계산합니다.",
};

const FAQ = [
  {
    q: "보증금은 왜 고정비가 아니라 초기 투자금인가요?",
    a: "월세·인건비는 매달 반복해서 나가는 비용이지만, 보증금은 폐업하거나 이전할 때 돌려받는 돈입니다. 성격이 달라 매달 나가는 고정비와 섞으면 손익분기 계산이 부정확해집니다.",
  },
  {
    q: "투자금 회수 기간은 어떻게 계산하나요?",
    a: "초기 투자금(보증금+창업비용)을 월 영업이익으로 나눠서 계산합니다. 생활비·대출금은 사업 자체의 수익성과는 별개의 개인 재정 문제라 회수 기간 계산에는 포함하지 않고, 별도 카드로 보여드립니다.",
  },
  {
    q: "손익분기 매출은 무엇을 의미하나요?",
    a: "고정비를 마진율로 나눈 값으로, 이 매출을 넘으면 흑자, 밑돌면 적자가 되는 경계선입니다. 매출이 이 선에 가깝다면 작은 매출 변동에도 적자로 전환될 수 있어 주의가 필요합니다.",
  },
];

export default function Page() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-[#1B2A4A] sm:text-3xl">
          자영업 손익분기·투자금 회수 계산기
        </h1>
        <p className="text-sm text-[#5B6478]">
          매출·원가·고정비·초기 투자금을 입력하면 손익분기 매출과 투자금 회수 기간, 생활비까지 낸 뒤 실제로
          남는 돈을 계산합니다.
        </p>
      </header>

      <div className="mx-[calc(50%-50vw)] w-screen">
        <BusinessBreakEvenCalc />
      </div>

      <Faq items={FAQ} />
    </div>
  );
}
