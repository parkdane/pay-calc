import type { Metadata } from "next";
import NationalPensionCalc from "@/components/NationalPensionCalc";
import Faq from "@/components/Faq";
import FaqJsonLd from "@/components/FaqJsonLd";
import Link from "next/link";

export const metadata: Metadata = {
  title: "국민연금 예상수령액 계산기 (2026년 기준)",
  description:
    "출생연도·가입기간·평균소득을 입력하면 국민연금법 제51조 기본연금액 산식 기준 예상 월 연금액을 계산합니다. 조기·연기수급, 부양가족연금까지 반영합니다.",
  openGraph: {
    title: "국민연금 예상수령액 계산기 (2026년 기준)",
    description:
      "출생연도·가입기간·평균소득을 입력하면 국민연금법 제51조 기본연금액 산식 기준 예상 월 연금액을 계산합니다. 조기·연기수급, 부양가족연금까지 반영합니다.",
  },
};

const FAQ = [
  {
    q: "국민연금은 몇 년 이상 가입해야 받을 수 있나요?",
    a: "최소가입기간은 10년(120개월)입니다. 10년 미만이면 매달 받는 연금이 아니라 그동안 낸 보험료를 반환일시금 형태로 한 번에 돌려받습니다.",
  },
  {
    q: "몇 살부터 받을 수 있나요?",
    a: "출생연도에 따라 다릅니다. 1952년생 이전은 60세, 이후로 4년마다 1세씩 늦춰져서 1969년생 이후는 65세부터 받습니다. 이 계산기에 출생연도를 입력하면 자동으로 계산됩니다.",
  },
  {
    q: "조기수령·연기수령이 뭔가요?",
    a: "조기노령연금은 지급개시연령보다 최대 5년 일찍 받는 대신 1년당 6%씩(최대 30%) 감액됩니다. 연기연금은 최대 5년 늦게 받는 대신 1년당 7.2%씩(최대 36%) 가산됩니다. 5년 조기 수령하면 정상 수령액의 70%, 5년 연기하면 136%를 평생 받습니다.",
  },
  {
    q: "이 계산기는 얼마나 정확한가요?",
    a: "국민연금법 제51조의 실제 산식(연도별 소득대체 승수, 20년 초과 가산 등)을 반영했지만, 개인의 평균소득(B값)은 정확한 재평가 이력 대신 단일 입력값으로 근사했습니다. 실제 소득이 시기별로 크게 변동됐다면 오차가 커질 수 있습니다. 정확한 금액은 국민연금공단에서 확인하세요.",
  },
];

export default function Page() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-[#1B2A4A] sm:text-3xl">
          국민연금 예상수령액 계산기
        </h1>
        <p className="text-sm text-[#5B6478]">
          출생연도·가입기간·평균소득을 입력하면 국민연금법 제51조 기본연금액 산식 기준 예상 월
          연금액을 계산합니다. 조기·연기수급, 부양가족연금까지 반영합니다.
        </p>
      </header>

      <div className="mx-[calc(50%-50vw)] w-screen">
        <NationalPensionCalc />
      </div>

      <section className="space-y-3 text-sm leading-relaxed text-[#5B6478]">
        <h2 className="text-xl font-bold text-[#1B2A4A]">공무원이라면</h2>
        <p>
          공무원·군인·경찰·소방·교사는 국민연금이 아니라 별도의 공무원연금·군인연금 제도를
          적용받습니다.{" "}
          <Link href="/calc/pension-net" className="text-[#2E4494] underline">
            공무원연금 예상수령액 계산기
          </Link>
          에서 확인하세요.
        </p>
      </section>

      <Faq items={FAQ} />
      <FaqJsonLd items={FAQ} />
    </div>
  );
}
