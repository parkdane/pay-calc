import type { Metadata } from "next";
import LeapAccountCalc from "@/components/LeapAccountCalc";
import AdSlot from "@/components/AdSlot";
import Faq from "@/components/Faq";
import FaqJsonLd from "@/components/FaqJsonLd";
import SourceNote from "@/components/SourceNote";
import Link from "next/link";
import SimpleTable from "@/components/SimpleTable";
import { calcLeap, leapMonthlyMatch, LEAP_TIERS, LEAP_CAP, LEAP_MONTHS, LEAP_BASE_RATE } from "@/lib/policySavings";

export const metadata: Metadata = {
  title: "청년도약계좌 만기 수령액 계산기",
  description:
    "소득구간과 월 납입액을 넣으면 2025년 확대된 정부기여금(월 최대 3.3만 원)과 비과세 이자를 포함한 5년 만기 수령액을 계산합니다.",
  openGraph: {
    title: "청년도약계좌 만기 수령액 계산기",
    description: "소득구간과 월 납입액을 넣으면 2025년 확대된 정부기여금(월 최대 3.3만 원)과 비과세 이자를 포함한 5년 만기 수령액을 계산합니다.",
  },
};

const won = (n: number) => Math.round(n).toLocaleString("ko-KR") + "원";
const man = (n: number) => (n / 10000).toLocaleString("ko-KR") + "만 원";
const R = LEAP_BASE_RATE;
const PAID = LEAP_TIERS.filter((t) => t.base > 0);

// 2024년까지(매칭한도까지만) vs 2025년 1월 납입분부터(70만 원까지 확대)
const oldMatch = (m: number, base: number, rate: number) => Math.floor((Math.min(m, base) * rate) / 100) * 100;
const TIER_ROWS = PAID.map((t) => {
  const r = calcLeap(LEAP_CAP, t.id, R);
  return [
    t.label,
    won(oldMatch(LEAP_CAP, t.base, t.rate)),
    won(r.monthlyMatch),
    won(r.matching),
    won(r.total),
  ];
});
const MONTHLY_ROWS = [300000, 400000, 500000, LEAP_CAP].map((m) => {
  const r = calcLeap(m, "t3600", R);
  return [`월 ${man(m)}`, won(leapMonthlyMatch(m, "t3600")), won(r.matching), won(r.total)];
});

const E = calcLeap(LEAP_CAP, "t2400", R);
const FSC = calcLeap(LEAP_CAP, "t2400", 6);

const FAQ = [
  {
    q: "월 70만 원 넣으면 만기에 얼마 받나요?",
    a: `총급여 2,400만 원 이하 구간, 기본금리 연 ${R}% 기준으로 원금 ${won(E.principal)} + 정부기여금 ${won(E.matching)} + 비과세 이자 ${won(E.interest)}을 합쳐 ${won(E.total)}입니다. 우대금리를 더해 연 6%를 받으면 ${won(FSC.total)}입니다. 2025년 1월 이후 납입분부터 확대된 기여금을 5년 내내 받는다고 가정한 값입니다.`,
  },
  {
    q: "지금도 새로 가입할 수 있나요?",
    a: "아닙니다. 청년도약계좌 신규 가입은 2025년 12월 31일로 종료됐습니다. 이 계산기는 기존 가입자의 만기 수령액 확인용이며, 기존 가입자는 만기까지 정부기여금과 비과세 혜택이 유지됩니다. 새로 시작한다면 후속 상품인 청년미래적금을 확인하세요.",
  },
  {
    q: "정부기여금은 어떻게 계산되나요?",
    a: `소득구간별 기준한도까지는 구간별 매칭비율(3.0~6.0%)이, 기준한도를 넘어 ${man(LEAP_CAP)}까지의 납입분에는 3.0%가 적용됩니다. 2025년 1월 확대로 모든 구간이 납입한 만큼 기여금을 받게 됐고, 총급여 2,400만 원 이하 구간은 월 최대 ${won(leapMonthlyMatch(LEAP_CAP, "t2400"))}입니다.`,
  },
  {
    q: "정부기여금에도 이자가 붙나요?",
    a: `네. 취급은행 약관상 정부기여금에는 기본금리로 계산한 이자가 더해집니다. 이 계산기는 기여금 이자를 연 ${R}%(입력 금리가 더 낮으면 그 금리)로 계산합니다. 2,400만 원 이하 구간·월 ${man(LEAP_CAP)} 기준 기여금 이자는 ${won(E.interestOnMatch)}입니다.`,
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
        <h1 className="text-2xl font-bold tracking-tight text-[#1B2A4A] sm:text-3xl">
          청년도약계좌 만기 계산기
        </h1>
        <p className="text-sm text-[#5B6478]">
          소득구간과 월 납입액을 선택하면 정부기여금과 비과세 이자를 포함한
          5년 만기 수령액을 계산합니다.
        </p>
      </header>

      <div className="mx-[calc(50%-50vw)] w-screen">
        <LeapAccountCalc />
      </div>

      <AdSlot id="calc-leap-save-result" />

      <section className="space-y-3 text-sm leading-relaxed text-[#5B6478]">
        <h2 className="text-xl font-bold text-[#1B2A4A]">계산 방식</h2>
        <p>
          만기 수령액은 본인 납입 원금(월 최대 70만 원 × 60개월) + 정부기여금
          + 비과세 이자로 구성됩니다. 기여금은 소득구간별 기준한도까지
          기본 매칭비율을, 초과분(70만 원까지)에는 3.0%를 적용하는 2025년 1월
          확대 기준을 반영했습니다.
        </p>
        <p>
          신규 가입이 종료된 상품이므로, 새로 시작한다면 후속 상품인{" "}
          <Link href="/calc/youth-save" className="text-[#2E4494] underline">
            청년미래적금
          </Link>
          을, 저소득 청년이라면{" "}
          <Link href="/calc/naeil-save" className="text-[#2E4494] underline">
            청년내일저축계좌
          </Link>
          를 확인하세요.
        </p>
      </section>

      <section className="space-y-3 text-sm leading-relaxed text-[#5B6478]">
        <h2 className="text-xl font-bold text-[#1B2A4A]">계산이 맞는지 확인: 금융위원회 예시와 비교</h2>
        <p>
          금융위원회는 2025년 기여금 확대를 발표하면서 총급여 2,400만 원 이하 청년이 월 {man(LEAP_CAP)}씩 5년 납입하면 만기에 약
          5,061만 원을 받는다는 예시를 냈습니다. 이 계산기로 같은 조건(납입금 연 6%, 기여금 이자는 기본금리 연 {R}%)을 넣으면{" "}
          <strong className="text-[#1B2A4A]">{won(FSC.total)}</strong>으로 일치합니다. 원금 {won(FSC.principal)}, 기여금{" "}
          {won(FSC.matching)}, 이자 {won(FSC.interest)}입니다.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-[#1B2A4A]">소득구간별 기여금과 만기 수령액 (월 {man(LEAP_CAP)}, 연 {R}%)</h2>
        <SimpleTable head={["개인소득(총급여)", "2024년까지 월 기여금", "2025년부터 월 기여금", "5년 기여금", "만기 수령액"]} rows={TIER_ROWS} minWidth={680} />
        <p className="text-xs leading-relaxed text-[#8B93A6]">
          총급여 6,000만 원 초과~7,500만 원 이하는 기여금 없이 비과세만 적용됩니다. 소득구간은 가입 후 매년 다시 확인되어 바뀔 수 있습니다.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-[#1B2A4A]">월 납입액별 (총급여 2,400만~3,600만 원 구간, 연 {R}%)</h2>
        <SimpleTable head={["월 납입액", "월 기여금", `${LEAP_MONTHS}개월 기여금`, "만기 수령액"]} rows={MONTHLY_ROWS} />
      </section>

      <SourceNote slug="leap-save" />

      <Faq items={FAQ} />
      <FaqJsonLd items={FAQ} />

      <div className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-4 text-sm">
        <Link href="/guide/leap-save-guide" className="font-medium text-[#2E4494] underline">
          2025년 기여금 확대, 뭐가 달라졌는지 보기 →
        </Link>
      </div>

      <AdSlot id="calc-leap-save-bottom" />
    </article>
  );
}
