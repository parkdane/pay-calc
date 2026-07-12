import type { Metadata } from "next";
import NaeilSavingsCalc from "@/components/NaeilSavingsCalc";
import AdSlot from "@/components/AdSlot";
import Faq from "@/components/Faq";
import Link from "next/link";

export const metadata: Metadata = {
  title: "청년내일저축계좌 계산기 (만기 수령액)",
  description:
    "월 10만 원 저축에 정부가 최대 30만 원을 매칭하는 청년내일저축계좌의 3년 만기 수령액을 계산합니다.",
};

const FAQ = [
  {
    q: "월 10만 원 넣으면 3년 뒤 얼마 받나요?",
    a: "기준중위소득 50% 이하 구간이면 본인 저축 360만 원 + 정부지원 1,080만 원 + 이자를 합쳐 약 1,450만 원 이상을 받습니다. 50~100% 구간은 정부지원이 월 10만 원이라 약 730만 원 수준입니다.",
  },
  {
    q: "가입 조건은 어떻게 되나요?",
    a: "근로·사업소득이 있는 만 19~34세 청년이 대상이며, 수급자·차상위 계층은 만 15~39세까지 가능합니다. 가구 소득이 기준중위소득 100% 이하여야 하고, 모집 기간에 복지로 또는 주민센터에서 신청합니다.",
  },
  {
    q: "정부지원금을 받는 조건이 있나요?",
    a: "네. 3년간 통장 유지, 근로활동 지속, 교육 이수(10시간), 자금사용계획서 제출이 필요합니다. 조건을 채우지 못하면 정부지원금 없이 본인 저축액과 이자만 받습니다.",
  },
  {
    q: "청년미래적금과 중복 가입할 수 있나요?",
    a: "청년내일저축계좌는 저소득 청년 대상 복지 상품, 청년미래적금은 일반 청년 대상 금융 상품으로 성격이 다릅니다. 중복 가입 가능 여부는 모집 공고의 세부 요건을 확인해야 합니다.",
  },
];

export default function Page() {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-[#1B2A4A] sm:text-3xl">
          청년내일저축계좌 계산기
        </h1>
        <p className="text-sm text-[#5B6478]">
          소득 구간과 월 저축액을 선택하면 정부지원금을 포함한 3년 만기
          수령액을 계산합니다.
        </p>
      </header>

      <NaeilSavingsCalc />

      <AdSlot id="calc-naeil-save-result" />

      <section className="space-y-3 text-sm leading-relaxed text-[#5B6478]">
        <h2 className="text-xl font-bold text-[#1B2A4A]">계산 방식</h2>
        <p>
          만기 수령액은 본인 저축 원금(월 10만~50만 원 × 36개월) + 정부지원금
          + 이자로 구성됩니다. 정부지원금은 본인 저축액과 무관하게 소득
          구간별 정액으로, 기준중위소득 50% 이하는 월 30만 원, 50~100%는 월
          10만 원이 적립됩니다.
        </p>
        <p>
          소득 요건에 해당하지 않는 청년이라면{" "}
          <Link href="/calc/youth-save" className="text-[#2E4494] underline">
            청년미래적금
          </Link>
          이 대안입니다. 일반 적금과의 수익 차이는{" "}
          <Link href="/calc/deposit" className="text-[#2E4494] underline">
            적금 이자 계산기
          </Link>
          에서 비교해볼 수 있습니다.
        </p>
      </section>

      <Faq items={FAQ} />

      <AdSlot id="calc-naeil-save-bottom" />
    </article>
  );
}
