import type { Metadata } from "next";
import SoldierSavingsCalc from "@/components/SoldierSavingsCalc";
import AdSlot from "@/components/AdSlot";
import Faq from "@/components/Faq";
import FaqJsonLd from "@/components/FaqJsonLd";
import SourceNote from "@/components/SourceNote";
import Link from "next/link";
import SimpleTable from "@/components/SimpleTable";
import { calcSoldierSavings, SOLDIER } from "@/lib/policySavings";

export const metadata: Metadata = {
  title: "장병내일준비적금 계산기 (2026년 기준)",
  description:
    "월 납입액과 복무기간을 입력하면 정부 매칭지원금(100%)과 비과세 이자를 포함한 전역 시 예상 수령액을 계산합니다.",
  openGraph: {
    title: "장병내일준비적금 계산기 (2026년 기준)",
    description: "월 납입액과 복무기간을 입력하면 정부 매칭지원금(100%)과 비과세 이자를 포함한 전역 시 예상 수령액을 계산합니다.",
  },
};

const won = (n: number) => Math.round(n).toLocaleString("ko-KR") + "원";
const man = (n: number) => (n / 10000).toLocaleString("ko-KR") + "만 원";
const RATE = SOLDIER.defaultRate;
const MAX = SOLDIER.maxMonthly;

// 복무 형태별 (월 최대 납입)
const SERVICE_ROWS = SOLDIER.serviceMonths.map((s) => {
  const r = calcSoldierSavings(MAX, s.months, RATE);
  return [s.label, won(r.principal), won(r.matching), won(r.interest), won(r.total)];
});
// 월 납입액별 (육군 18개월)
const MONTHLY_ROWS = [200000, 300000, 400000, MAX].map((m) => {
  const r = calcSoldierSavings(m, 18, RATE);
  return [`월 ${man(m)}`, won(r.principal), won(r.matching), won(r.total)];
});
// 가입이 늦어질 때 (육군 18개월 복무, 월 최대 납입)
const FULL = calcSoldierSavings(MAX, 18, RATE);
const DELAY_ROWS = [0, 1, 2, 3].map((d) => {
  const r = calcSoldierSavings(MAX, 18 - d, RATE);
  return [d === 0 ? "입대 직후 가입(18개월)" : `${d}개월 늦게 가입(${18 - d}개월)`, won(r.total), d === 0 ? "-" : `−${won(FULL.total - r.total)}`];
});
const E = FULL;

const FAQ = [
  {
    q: "월 55만 원 넣으면 전역 때 얼마 받나요?",
    a: `육군 18개월, 연 ${RATE}% 기준으로 원금 ${won(E.principal)} + 정부 매칭 ${won(E.matching)} + 비과세 이자 ${won(E.interest)}을 합쳐 ${won(E.total)}을 받습니다. 해군(20개월)·공군(21개월)은 납입 기간이 길어 더 많이 받습니다.`,
  },
  {
    q: "정부 매칭지원금은 얼마인가요?",
    a: "2024년 이후 납입한 원금의 100%입니다. 내가 넣은 원금만큼 정부가 똑같이 더해줍니다. 은행을 두 곳으로 나눠도 매칭은 두 계좌 원금 합계 기준이며, 만기 해지해야 받을 수 있습니다.",
  },
  {
    q: "중도 해지하면 어떻게 되나요?",
    a: "만기일(전역예정일) 전에 해지하면 정부 매칭지원금과 이자 비과세 혜택을 모두 받을 수 없습니다. 반드시 만기까지 유지해야 합니다.",
  },
  {
    q: "월 최대 얼마까지 납입할 수 있나요?",
    a: `개인별 월 최대 ${man(MAX)}입니다. 한 은행당 월 30만 원 한도라, ${man(MAX)}을 채우려면 2개 은행에 나눠 가입해야 합니다(예: 30만 + 25만). 같은 은행에 두 계좌를 만들 수는 없습니다.`,
  },
  {
    q: "가입이 늦으면 얼마나 손해인가요?",
    a: `월 ${man(MAX)} 기준으로 한 달 늦을 때마다 원금 ${man(MAX)}과 같은 금액의 매칭지원금, 그 이자를 함께 놓칩니다. 육군 18개월 복무에서 3개월 늦게 가입하면 전역 시 수령액이 ${won(FULL.total - calcSoldierSavings(MAX, 15, RATE).total)} 줄어듭니다. 훈련소에서 가입 자격 확인서를 받는 대로 바로 가입하는 것이 유리합니다.`,
  },
  {
    q: "간부(장교·부사관)도 가입할 수 있나요?",
    a: "장병내일준비적금은 현역병·상근예비역·사회복무요원 등 의무복무자를 위한 상품입니다. 장기복무에 선발된 간부는 별도 제도인 장기간부 도약적금(3년간 월 최대 30만 원, 본인 납입액 100% 매칭)을 확인하세요.",
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

      <div className="mx-[calc(50%-50vw)] w-screen">
        <SoldierSavingsCalc />
      </div>

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

      <section className="space-y-3 text-sm leading-relaxed text-[#5B6478]">
        <h2 className="text-xl font-bold text-[#1B2A4A]">계산 예시: 육군 18개월, 월 {man(MAX)}</h2>
        <p>
          18개월 동안 매월 {man(MAX)}을 넣으면 원금은 {won(E.principal)}입니다. 만기 해지 시 정부가 원금의 100%인{" "}
          {won(E.matching)}을 매칭지원금으로 더해줍니다. 은행 이자는 연 {RATE}% 적립식 단리로 {won(E.interest)}이며 세금이
          없습니다. 합계 <strong className="text-[#1B2A4A]">{won(E.total)}</strong>으로, 내가 넣은 돈의{" "}
          {(E.total / E.principal).toFixed(2)}배를 받습니다.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-[#1B2A4A]">복무 형태별 전역 시 수령액 (월 {man(MAX)}, 연 {RATE}%)</h2>
        <SimpleTable head={["복무 형태", "원금", "매칭지원금", "이자", "합계"]} rows={SERVICE_ROWS} minWidth={620} />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-[#1B2A4A]">월 납입액별 수령액 (육군 18개월)</h2>
        <SimpleTable head={["월 납입액", "원금", "매칭지원금", "합계"]} rows={MONTHLY_ROWS} />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-[#1B2A4A]">가입이 늦어지면 줄어드는 금액 (육군 18개월, 월 {man(MAX)})</h2>
        <SimpleTable head={["가입 시점", "전역 시 수령액", "차이"]} rows={DELAY_ROWS} minWidth={420} />
        <p className="text-xs leading-relaxed text-[#8B93A6]">
          가입 기간이 15개월 이상이면 기본금리 연 {RATE}%가 적용되는 것으로 계산했습니다. 은행별 우대금리는 반영하지 않았습니다.
        </p>
      </section>

      <SourceNote slug="soldier-save" />

      <Faq items={FAQ} />
      <FaqJsonLd items={FAQ} />

      <AdSlot id="calc-soldier-save-bottom" />
    </article>
  );
}
