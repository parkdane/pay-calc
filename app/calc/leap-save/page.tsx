import type { Metadata } from "next";
import LeapAccountCalc from "@/components/LeapAccountCalc";
import AdSlot from "@/components/AdSlot";
import Faq from "@/components/Faq";
import Link from "next/link";

export const metadata: Metadata = {
  title: "청년도약계좌 만기 수령액 계산기",
  description:
    "소득구간과 월 납입액을 넣으면 2025년 확대된 정부기여금(월 최대 3.3만 원)과 비과세 이자를 포함한 5년 만기 수령액을 계산합니다.",
};

const FAQ = [
  {
    q: "월 70만 원 넣으면 만기에 얼마 받나요?",
    a: "총급여 2,400만 원 이하 구간 기준 원금 4,200만 원 + 정부기여금 198만 원 + 비과세 이자를 합쳐 약 5,000만 원 수준입니다. 소득구간과 금리에 따라 달라지니 위 계산기에서 확인하세요.",
  },
  {
    q: "지금도 새로 가입할 수 있나요?",
    a: "아닙니다. 청년도약계좌 신규 가입은 2025년 12월로 종료됐습니다. 이 계산기는 기존 가입자의 만기 수령액 확인용이며, 신규 가입을 원한다면 후속 상품인 청년미래적금을 확인하세요.",
  },
  {
    q: "정부기여금은 어떻게 계산되나요?",
    a: "소득구간별 기준한도까지는 구간별 매칭비율(3.0~6.0%)이, 기준한도를 넘어 70만 원까지의 납입분에는 3.0%가 적용됩니다. 2025년 1월 확대로 모든 구간이 납입한 만큼 기여금을 받게 됐고, 최저 소득구간은 월 최대 3만 3천 원입니다.",
  },
  {
    q: "중간에 해지하면 어떻게 되나요?",
    a: "3년 이상 유지했다면 중도해지해도 정부기여금의 60%와 비과세 혜택을 받습니다. 혼인·출산·생애최초 주택구입 등 특별사유 해지는 혜택이 전액 유지되며, 3년 미만 일반해지는 기여금과 비과세가 모두 소멸합니다.",
  },
];

export default function Page() {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          청년도약계좌 만기 계산기
        </h1>
        <p className="text-sm text-slate-600">
          소득구간과 월 납입액을 선택하면 정부기여금과 비과세 이자를 포함한
          5년 만기 수령액을 계산합니다.
        </p>
      </header>

      <LeapAccountCalc />

      <AdSlot id="calc-leap-save-result" />

      <section className="space-y-3 text-sm leading-relaxed text-slate-700">
        <h2 className="text-xl font-bold text-slate-900">계산 방식</h2>
        <p>
          만기 수령액은 본인 납입 원금(월 최대 70만 원 × 60개월) + 정부기여금
          + 비과세 이자로 구성됩니다. 기여금은 소득구간별 기준한도까지
          기본 매칭비율을, 초과분(70만 원까지)에는 3.0%를 적용하는 2025년 1월
          확대 기준을 반영했습니다.
        </p>
        <p>
          신규 가입이 종료된 상품이므로, 새로 시작한다면 후속 상품인{" "}
          <Link href="/calc/youth-save" className="text-[#5B67A2] underline">
            청년미래적금
          </Link>
          을, 저소득 청년이라면{" "}
          <Link href="/calc/naeil-save" className="text-[#5B67A2] underline">
            청년내일저축계좌
          </Link>
          를 확인하세요.
        </p>
      </section>

      <Faq items={FAQ} />

      <AdSlot id="calc-leap-save-bottom" />
    </article>
  );
}
