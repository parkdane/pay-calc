import type { Metadata } from "next";
import DepositCalc from "@/components/DepositCalc";
import AdSlot from "@/components/AdSlot";
import Faq from "@/components/Faq";
import Link from "next/link";

export const metadata: Metadata = {
  title: "적금 계산기 · 예금 이자 계산기",
  description:
    "월 납입액·기간·금리를 입력하면 이자소득세 15.4%를 반영한 적금·예금 만기 수령액을 바로 계산합니다.",
};

const FAQ = [
  {
    q: "적금 이자는 왜 생각보다 적나요?",
    a: "적금은 매월 넣은 돈이 만기까지 남은 기간만큼만 이자를 받기 때문입니다. 첫 달 납입분은 12개월치 이자를 받지만 마지막 달 납입분은 1개월치만 받습니다. 그래서 연 4% 적금의 실제 체감 수익률은 원금 대비 약 2%대가 됩니다.",
  },
  {
    q: "이자에서 세금을 떼나요?",
    a: "네. 일반 과세 상품은 이자소득세 14%와 지방소득세 1.4%를 합쳐 이자의 15.4%가 원천징수됩니다. 청년미래적금·장병내일준비적금 같은 비과세 상품은 이 세금이 없습니다.",
  },
  {
    q: "적금과 예금 중 뭐가 유리한가요?",
    a: "목돈이 이미 있다면 예금이 유리합니다. 같은 금리라면 전체 금액이 전체 기간 동안 이자를 받는 예금의 이자가 더 많습니다. 목돈이 없다면 적금으로 모으는 것이 시작입니다.",
  },
];

export default function Page() {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          적금·예금 이자 계산기
        </h1>
        <p className="text-sm text-slate-600">
          월 납입액(또는 예치금)과 기간, 금리를 넣으면 세후 만기 수령액을
          계산합니다.
        </p>
      </header>

      <DepositCalc />

      <AdSlot id="calc-deposit-result" />

      <section className="space-y-3 text-sm leading-relaxed text-slate-700">
        <h2 className="text-xl font-bold text-slate-900">계산 방식</h2>
        <p>
          적금은 매월 납입 시점부터 만기까지의 기간에 비례해 이자가 붙는 단리
          방식으로 계산합니다. 예금은 예치 원금 전체에 기간만큼 이자가
          붙습니다. 일반 과세 시 이자의 15.4%(소득세 14% + 지방소득세 1.4%)가
          공제됩니다.
        </p>
        <p>
          정부 지원이 붙는 정책 적금은 일반 적금보다 훨씬 유리합니다.{" "}
          <Link href="/calc/youth-save" className="text-blue-700 underline">
            청년미래적금
          </Link>
          은 정부기여금과 비과세,{" "}
          <Link href="/calc/soldier-save" className="text-blue-700 underline">
            장병내일준비적금
          </Link>
          은 납입원금 100% 매칭을 받을 수 있으니 가입 대상이라면 먼저
          확인하세요.
        </p>
      </section>

      <Faq items={FAQ} />

      <AdSlot id="calc-deposit-bottom" />
    </article>
  );
}
