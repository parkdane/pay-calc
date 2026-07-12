import type { Metadata } from "next";
import SoldierSavingsCalc from "@/components/SoldierSavingsCalc";
import AdSlot from "@/components/AdSlot";
import Faq from "@/components/Faq";
import Link from "next/link";

export const metadata: Metadata = {
  title: "장병내일준비적금 계산기 (2026년 기준)",
  description:
    "월 납입액과 복무기간을 입력하면 정부 매칭지원금(100%)과 비과세 이자를 포함한 전역 시 예상 수령액을 계산합니다.",
};

const FAQ = [
  {
    q: "월 55만 원 넣으면 전역 때 얼마 받나요?",
    a: "육군 18개월 기준 월 55만 원을 납입하면 원금 990만 원 + 정부 매칭 990만 원 + 비과세 이자 약 39만 원으로 총 2,000만 원 내외를 받습니다. 위 계산기에서 본인 조건으로 확인하세요.",
  },
  {
    q: "정부 매칭지원금은 얼마인가요?",
    a: "2024년 이후 납입한 원금의 100%입니다. 내가 넣은 원금만큼 정부가 똑같이 더해줍니다. 단 만기 해지해야 받을 수 있습니다.",
  },
  {
    q: "중도 해지하면 어떻게 되나요?",
    a: "만기일(전역예정일) 전에 해지하면 정부 매칭지원금과 이자 비과세 혜택을 모두 받을 수 없습니다. 반드시 만기까지 유지해야 합니다.",
  },
  {
    q: "월 최대 얼마까지 납입할 수 있나요?",
    a: "개인별 월 최대 55만 원입니다. 한 은행당 월 30만 원 한도라, 55만 원을 채우려면 2개 은행에 나눠 가입해야 합니다(예: 30만 + 25만).",
  },
];

export default function Page() {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-[#1B2A4A] sm:text-3xl">
          장병내일준비적금 계산기
        </h1>
        <p className="text-sm text-[#5B6478]">
          월 납입액과 복무기간을 넣으면 정부 매칭지원금과 비과세 이자를 포함한
          전역 시 수령액을 계산합니다.
        </p>
      </header>

      <SoldierSavingsCalc />

      <AdSlot id="calc-soldier-save-result" />

      <section className="space-y-3 text-sm leading-relaxed text-[#5B6478]">
        <h2 className="text-xl font-bold text-[#1B2A4A]">계산 방식</h2>
        <p>
          전역 시 수령액은 내 납입 원금 + 정부 매칭지원금(원금의 100%) + 비과세
          이자로 구성됩니다. 이자는 매월 적립식 단리로 계산하며, 먼저 넣은 돈일수록
          예치 기간이 길어 이자가 더 붙습니다.
        </p>
        <p>
          병사 봉급은{" "}
          <Link href="/salary/military" className="text-[#2E4494] underline">
            2026년 군인 봉급표
          </Link>
          에서 확인할 수 있습니다.
        </p>
      </section>

      <Faq items={FAQ} />

      <AdSlot id="calc-soldier-save-bottom" />
    </article>
  );
}
