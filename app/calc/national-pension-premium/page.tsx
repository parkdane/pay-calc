import type { Metadata } from "next";
import NationalPensionPremiumCalc from "@/components/NationalPensionPremiumCalc";
import Faq from "@/components/Faq";
import FaqJsonLd from "@/components/FaqJsonLd";
import Link from "next/link";

export const metadata: Metadata = {
  title: "국민연금 지역가입자 보험료 계산기 (2026년 기준)",
  description:
    "월 신고소득을 입력하면 2026년 기준(보험료율 9.5%, 상한 659만원·하한 41만원) 국민연금 지역가입자 보험료를 계산합니다. 자영업자·프리랜서 대상입니다.",
  openGraph: {
    title: "국민연금 지역가입자 보험료 계산기 (2026년 기준)",
    description:
      "월 신고소득을 입력하면 2026년 기준 국민연금 지역가입자 보험료를 계산합니다. 자영업자·프리랜서 대상입니다.",
  },
};

const FAQ = [
  {
    q: "직장 다니는 사람도 이 계산기를 쓰나요?",
    a: "아닙니다. 회사에 고용된 사람은 '사업장가입자'로 분류되어 국민연금이 급여에서 자동으로 원천공제되고, 회사가 절반을 대신 내줍니다. 이 계산기는 사업장가입자가 아닌 사람, 즉 자영업자·프리랜서·무직자 등 '지역가입자'를 위한 계산기입니다. 직장인의 실수령액이 궁금하다면 직장인 연봉 실수령액 계산기를 이용하세요.",
  },
  {
    q: "지역가입자 보험료는 어떻게 계산되나요?",
    a: "월 신고소득을 기준소득월액(하한 41만원~상한 659만원)으로 환산한 뒤 9.5%를 곱합니다. 직장가입자는 회사와 절반씩 나눠 내지만, 지역가입자는 이 금액 전액을 본인이 부담합니다.",
  },
  {
    q: "소득을 어떻게 신고하나요?",
    a: "자영업자는 종합소득세 신고소득을 기준으로 국민연금공단이 기준소득월액을 결정합니다. 신규 가입이나 소득 변동 시에는 본인이 직접 소득을 신고해야 하며, 신고한 달의 다음 달부터 적용됩니다.",
  },
  {
    q: "저소득이면 지원받을 수 있나요?",
    a: "기준소득월액이 80만원 미만인 저소득 지역가입자는 보험료의 50%(월 최대 46,350원)를 국가가 지원하는 제도가 있습니다. 생애 최대 12개월까지 지원되며, 다른 지원제도(실업크레딧, 농어업인 지원 등)와 중복 적용은 제한될 수 있습니다.",
  },
  {
    q: "상한액·하한액은 왜 매년 바뀌나요?",
    a: "기준소득월액 상하한액은 국민연금 전체 가입자의 최근 3년간 평균소득 변동률을 반영해 보건복지부 장관이 매년 3월 말까지 고시하고, 그해 7월부터 1년간 적용합니다. 2026년 7월부터는 하한 41만원, 상한 659만원입니다.",
  },
];

export default function Page() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-[#1B2A4A] sm:text-3xl">
          국민연금 지역가입자 보험료 계산기
        </h1>
        <p className="text-sm text-[#5B6478]">
          월 신고소득을 입력하면 2026년 기준 국민연금 지역가입자 보험료를 계산합니다.
          자영업자·프리랜서·무직자 등 &apos;지역가입자&apos; 대상입니다.
        </p>
      </header>

      <div className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-[#F0F5FF] p-4 text-sm leading-relaxed text-[#2E4494]">
        회사에 다니는 직장인이라면 &apos;사업장가입자&apos;라서 국민연금이 이미 급여에서 자동
        공제되고 있습니다. 이 계산기는 사업장가입자가 아닌 사람(자영업자·프리랜서·무직자)이
        직접 내야 하는 지역가입자 보험료를 계산합니다. 직장인 실수령액이 궁금하다면{" "}
        <Link href="/calc/worker-net" className="underline">
          직장인 연봉 실수령액 계산기
        </Link>
        를 이용하세요.
      </div>

      <div className="mx-[calc(50%-50vw)] w-screen">
        <NationalPensionPremiumCalc />
      </div>

      <section className="space-y-3 text-sm leading-relaxed text-[#5B6478]">
        <h2 className="text-xl font-bold text-[#1B2A4A]">나중에 얼마나 받는지도 궁금하다면</h2>
        <p>
          이 계산기는 지금 &quot;내는 돈&quot;만 다룹니다. 은퇴 후 &quot;받는 돈&quot;이 궁금하다면{" "}
          <Link href="/calc/national-pension" className="text-[#2E4494] underline">
            국민연금 예상수령액 계산기
          </Link>
          에서 확인하세요.
        </p>
      </section>

      <Faq items={FAQ} />
      <FaqJsonLd items={FAQ} />

      <div className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-4 text-sm">
        <Link href="/guide/national-pension-premium-guide" className="font-medium text-[#2E4494] underline">
          상하한액·저소득 지원제도까지 자세히 보기 →
        </Link>
      </div>
    </div>
  );
}
