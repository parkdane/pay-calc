import type { Metadata } from "next";
import FireCalc from "@/components/FireCalc";
import Faq from "@/components/Faq";
import FaqJsonLd from "@/components/FaqJsonLd";
import Link from "next/link";

export const metadata: Metadata = {
  title: "파이어족 계산기 (조기 은퇴 시뮬레이터)",
  description:
    "현재 자산과 월 투자금, 생활비, 기대수익률을 넣으면 FIRE 목표 자산, 달성 나이, 부족 금액, 추가 필요 투자금과 시나리오를 바로 계산합니다.",
};

const FAQ = [
  {
    q: "파이어(FIRE)가 뭔가요?",
    a: "Financial Independence, Retire Early의 약자로, 경제적 자유를 이뤄 조기 은퇴하는 것을 뜻합니다. 자산에서 나오는 수익만으로 생활비를 충당할 수 있으면 파이어를 달성한 것입니다.",
  },
  {
    q: "4% 룰이 뭔가요?",
    a: "은퇴 자산의 4%를 매년 인출해도 원금이 크게 줄지 않는다는 경험칙입니다. 반대로 연 지출의 25배(100÷4)를 모으면 은퇴가 가능하다는 의미입니다. 예를 들어 연 3,600만 원을 쓴다면 9억 원이 목표가 됩니다.",
  },
  {
    q: "기대수익률은 몇 %가 현실적인가요?",
    a: "장기 복리 계산에서 과도한 수익률은 결과를 크게 왜곡합니다. 보수적 5%, 기본 7%, 공격적 9% 정도로 범위를 함께 비교하는 방식이 안전합니다. 이 계산기는 입력한 수익률을 그대로 적용하고, 목표 자산은 물가상승률만큼 매년 증가시켜 계산합니다.",
  },
  {
    q: "국민연금이나 배당소득도 포함하나요?",
    a: "네. 은퇴 후 반복적으로 들어오는 현금흐름은 월 부수입·월 연금 항목에 넣으면 필요한 순 생활비가 줄어 FIRE 목표 자산도 낮아집니다.",
  },
];

export default function Page() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-[#1B2A4A] sm:text-3xl">
          파이어족 계산기
        </h1>
        <p className="text-sm text-[#5B6478]">
          현재 자산과 투자금으로 언제 경제적 자유를 달성해 조기 은퇴할 수
          있는지, 부족 금액과 시나리오까지 계산합니다.
        </p>
      </header>

      {/* 넓은 폭으로 확장 (2단 레이아웃) */}
      {/* 전역 max-w-4xl(896px) 제한을 벗어나 전체 폭 확보. 실제 표시 폭은 FireCalc.tsx의 max-w-[1440px]가 결정 */}
      <div className="mx-[calc(50%-50vw)] w-screen">
        <FireCalc />
      </div>

      <section className="space-y-3 text-sm leading-relaxed text-[#5B6478]">
        <h2 className="text-xl font-bold text-[#1B2A4A]">계산 방식</h2>
        <p>
          은퇴 후 연 지출을 안전인출률로 나눠 목표 자산(파이어 넘버)을 구하고,
          현재 자산에 매달 투자금을 더하며 입력한 수익률 그대로 복리 성장시킵니다.
          목표 자산은 물가상승률만큼 매년 증가시켜, 실제 미래 시점의 원화 금액
          기준으로 목표 도달 시점을 계산합니다. 목표 은퇴 나이에 맞추려면 얼마를
          더 저축해야 하는지는 이분 탐색으로 역산합니다.
        </p>
        <p>
          은퇴 전 저축 계획은{" "}
          <Link href="/calc/savings-goal" className="text-[#2E4494] underline">
            저축 목표 시뮬레이터
          </Link>
          에서, 목돈 운용은{" "}
          <Link href="/calc/deposit" className="text-[#2E4494] underline">
            예금 계산기
          </Link>
          에서 이어서 확인하세요.
        </p>
      </section>

      <Faq items={FAQ} />
      <FaqJsonLd items={FAQ} />
    </div>
  );
}
