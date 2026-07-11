import type { Metadata } from "next";
import FireCalc from "@/components/FireCalc";
import Faq from "@/components/Faq";
import Link from "next/link";

export const metadata: Metadata = {
  title: "파이어족 계산기 (조기 은퇴 시뮬레이터)",
  description:
    "현재 자산과 월 저축액을 입력하면 경제적 자유(FIRE)를 달성해 조기 은퇴할 수 있는 나이와 목표 자산을 계산합니다.",
};

const FAQ = [
  {
    q: "파이어(FIRE)가 뭔가요?",
    a: "Financial Independence, Retire Early의 약자로, 경제적 자유를 이뤄 조기 은퇴하는 것을 뜻합니다. 자산에서 나오는 수익만으로 생활비를 충당할 수 있으면 파이어를 달성한 것입니다.",
  },
  {
    q: "4% 룰이 뭔가요?",
    a: "은퇴 자산의 4%를 매년 인출해도 원금이 크게 줄지 않는다는 경험칙입니다. 반대로 말하면 연 지출의 25배(100÷4)를 모으면 은퇴가 가능하다는 의미입니다. 예를 들어 연 3,600만 원을 쓴다면 9억 원이 목표가 됩니다.",
  },
  {
    q: "수익률은 얼마로 잡아야 하나요?",
    a: "주식 중심 포트폴리오는 보통 연 7% 안팎을 기대치로 씁니다. 다만 이 계산기는 물가상승률을 뺀 실질 수익률로 계산하므로, 실제 목표 도달 시점은 시장 상황에 따라 달라집니다. 보수적으로 보려면 수익률을 낮추고 인출률도 3~3.5%로 낮추세요.",
  },
  {
    q: "세금이나 건강보험료는 반영되나요?",
    a: "아니요. 이 계산기는 물가를 반영한 실질 수익률 기준의 단순 추정입니다. 은퇴 후 건강보험 지역가입자 전환, 금융소득 종합과세 등 실제 비용은 별도로 고려해야 합니다.",
  },
];

export default function Page() {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          파이어족 계산기
        </h1>
        <p className="text-sm text-slate-600">
          현재 자산과 저축액으로 언제 경제적 자유를 달성해 조기 은퇴할 수
          있는지 계산합니다.
        </p>
      </header>

      <FireCalc />

      <section className="space-y-3 text-sm leading-relaxed text-slate-700">
        <h2 className="text-xl font-bold text-slate-900">계산 방식</h2>
        <p>
          은퇴 후 연 지출을 인출률로 나눠 목표 자산(파이어 넘버)을 구하고,
          현재 자산에 매달 저축액을 더하며 물가를 반영한 실질 수익률로
          복리 성장시켜 목표에 도달하는 시점을 계산합니다. 4% 룰을 적용하면
          목표 자산은 연 지출의 25배입니다.
        </p>
        <p>
          은퇴 전 저축 계획은{" "}
          <Link href="/calc/savings-goal" className="text-blue-700 underline">
            저축 목표 시뮬레이터
          </Link>
          에서, 목돈 운용 수익은{" "}
          <Link href="/calc/deposit" className="text-blue-700 underline">
            예금 계산기
          </Link>
          에서 확인하세요.
        </p>
      </section>

      <Faq items={FAQ} />
    </article>
  );
}
