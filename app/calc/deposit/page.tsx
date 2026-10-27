import type { Metadata } from "next";
import DepositCalc from "@/components/DepositCalc";
import AdSlot from "@/components/AdSlot";
import Faq from "@/components/Faq";
import FaqJsonLd from "@/components/FaqJsonLd";
import SourceNote from "@/components/SourceNote";
import Link from "next/link";
import SimpleTable from "@/components/SimpleTable";
import ratesData from "@/data/rates.json";
import { calcSavings, calcDeposit, savingsEffectiveRate, INTEREST_TAX_RATE } from "@/lib/depositCalc";

export const metadata: Metadata = {
  title: "적금 계산기 · 예금 이자 계산기",
  description:
    "월 납입액·기간·금리를 입력하면 이자소득세 15.4%를 반영한 적금·예금 만기 수령액을 바로 계산합니다.",
  openGraph: {
    title: "적금 계산기 · 예금 이자 계산기",
    description: "월 납입액·기간·금리를 입력하면 이자소득세 15.4%를 반영한 적금·예금 만기 수령액을 바로 계산합니다.",
  },
};

const won = (n: number) => Math.round(n).toLocaleString("ko-KR") + "원";
const pct = (n: number, d = 2) => n.toFixed(d).replace(/\.?0+$/, "") + "%";
const TAX = pct(INTEREST_TAX_RATE * 100, 1);

// 예시표 (모두 12개월, 일반 과세 기준)
const RATES = [3, 4, 5];
const SAVINGS_ROWS = [300000, 500000, 1000000].map((m) => [
  `월 ${(m / 10000).toLocaleString("ko-KR")}만 원`,
  ...RATES.map((r) => won(calcSavings(m, 12, r).netInterest)),
]);
const DEPOSIT_ROWS = [10000000, 30000000, 50000000].map((l) => [
  `${(l / 10000).toLocaleString("ko-KR")}만 원`,
  ...RATES.map((r) => won(calcDeposit(l, 12, r).netInterest)),
]);
const EFFECTIVE_ROWS = [12, 24, 36].map((m) => [
  `${m}개월`,
  ...RATES.map((r) => pct(savingsEffectiveRate(m, r))),
]);

// 같은 1,200만 원: 월 100만 원 적금 vs 1,200만 원 예금 (연 4%, 12개월)
const CMP_S = calcSavings(1000000, 12, 4);
const CMP_D = calcDeposit(12000000, 12, 4);

// 금감원 금리 데이터(매일 자동 갱신) 기반 예시
const RATES_DATE = ratesData.updatedAt.slice(0, 10);
const dep12 = ratesData.deposits.filter((x) => x.term === 12);
const topDep = dep12.reduce((a, b) => (b.maxRate > a.maxRate ? b : a), dep12[0]);
const sav12 = ratesData.savings.filter((x) => x.term === 12);
const topSav = sav12.reduce((a, b) => (b.maxRate > a.maxRate ? b : a), sav12[0]);
const savBase = calcSavings(300000, 12, topSav.baseRate);
const savMax = calcSavings(300000, 12, topSav.maxRate);
const depTop = calcDeposit(10000000, 12, topDep.maxRate);

const FAQ = [
  {
    q: "적금 이자는 왜 생각보다 적나요?",
    a: `적금은 매월 넣은 돈이 만기까지 남은 기간만큼만 이자를 받기 때문입니다. 첫 달 납입분은 12개월치 이자를 받지만 마지막 달 납입분은 1개월치만 받습니다. 그래서 12개월 연 4% 적금의 이자는 납입원금 전체 기준으로 보면 세전 약 ${pct(savingsEffectiveRate(12, 4))}에 해당합니다.`,
  },
  {
    q: "이자에서 세금을 떼나요?",
    a: `네. 일반 과세 상품은 이자소득세 14%와 지방소득세 1.4%를 합쳐 이자의 ${TAX}가 원천징수됩니다. 청년미래적금·장병내일준비적금 같은 비과세 상품은 이 세금이 없습니다.`,
  },
  {
    q: "적금과 예금 중 뭐가 유리한가요?",
    a: `목돈이 이미 있다면 예금이 유리합니다. 같은 1,200만 원·연 4%·12개월이라도 매월 100만 원씩 넣는 적금의 세후 이자는 ${won(CMP_S.netInterest)}, 처음에 1,200만 원을 넣는 예금은 ${won(CMP_D.netInterest)}입니다. 목돈이 없다면 적금으로 모으는 것이 시작입니다.`,
  },
  {
    q: "최고금리가 높은 적금은 정말 그 금리를 받나요?",
    a: "공시되는 최고금리는 급여이체·카드 실적·자동이체·첫 거래 등 우대조건을 모두 채웠을 때의 금리입니다. 조건을 못 채우면 기본금리만 적용되고, 일부 상품은 납입 한도가 월 수십만 원으로 작거나 가입 기간이 짧습니다. 가입 전에 기본금리와 우대조건을 따로 확인하고, 이 계산기에는 확실히 받을 수 있는 금리를 넣는 것이 정확합니다.",
  },
  {
    q: "만기 전에 해지하면 어떻게 되나요?",
    a: "약정 금리가 아니라 은행이 정한 중도해지이율이 적용되어 이자가 크게 줄어듭니다. 중도해지이율은 상품마다 다르며 보통 가입 기간이 짧을수록 낮습니다. 해지 가능성이 있다면 기간을 짧게 나눠 가입하는 것도 방법입니다.",
  },
  {
    q: "예금자보호는 얼마까지 되나요?",
    a: "2025년 9월 1일부터 예금자 1인당 금융회사별로 원금과 이자를 합쳐 1억 원까지 보호됩니다(기존 5,000만 원). 은행과 저축은행 모두 같은 한도이며, 같은 금융회사의 여러 계좌는 합산됩니다. 이 날짜 이전에 가입한 예·적금에도 자동으로 적용됩니다.",
  },
];

export default function Page() {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-[#1B2A4A] sm:text-3xl">
          적금·예금 이자 계산기
        </h1>
        <p className="text-sm text-[#5B6478]">
          월 납입액(또는 예치금)과 기간, 금리를 넣으면 세후 만기 수령액을
          계산합니다.
        </p>
      </header>

      <div className="mx-[calc(50%-50vw)] w-screen">
        <DepositCalc />
      </div>

      <AdSlot id="calc-deposit-result" />

      <section className="space-y-3 text-sm leading-relaxed text-[#5B6478]">
        <h2 className="text-xl font-bold text-[#1B2A4A]">계산 방식</h2>
        <p>
          적금은 매월 납입 시점부터 만기까지의 기간에 비례해 이자가 붙는 단리
          방식으로 계산합니다. 예금은 예치 원금 전체에 기간만큼 이자가
          붙습니다. 일반 과세 시 이자의 15.4%(소득세 14% + 지방소득세 1.4%)가
          공제됩니다.
        </p>
        <p>
          정부 지원이 붙는 정책 적금은 일반 적금보다 훨씬 유리합니다.{" "}
          <Link href="/calc/youth-save" className="text-[#2E4494] underline">
            청년미래적금
          </Link>
          은 정부기여금과 비과세,{" "}
          <Link href="/calc/soldier-save" className="text-[#2E4494] underline">
            장병내일준비적금
          </Link>
          은 납입원금 100% 매칭을 받을 수 있으니 가입 대상이라면 먼저
          확인하세요.
        </p>
      </section>

      <section className="space-y-3 text-sm leading-relaxed text-[#5B6478]">
        <h2 className="text-xl font-bold text-[#1B2A4A]">적금 vs 예금: 같은 1,200만 원이라도 이자가 다릅니다</h2>
        <p>
          연 4%, 12개월 기준으로 매월 100만 원씩 넣는 적금은 세전 이자 {won(CMP_S.interest)}, 세후{" "}
          {won(CMP_S.netInterest)}입니다. 처음부터 1,200만 원을 넣는 예금은 세전 {won(CMP_D.interest)}, 세후{" "}
          {won(CMP_D.netInterest)}으로 약 {(CMP_D.interest / CMP_S.interest).toFixed(1)}배입니다. 적금은 납입 회차마다
          이자가 붙는 기간이 짧아지기 때문입니다.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-[#1B2A4A]">적금 월 납입액별 세후 이자 (12개월)</h2>
        <SimpleTable head={["월 납입액", "연 3%", "연 4%", "연 5%"]} rows={SAVINGS_ROWS} />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-[#1B2A4A]">예금 원금별 세후 이자 (12개월)</h2>
        <SimpleTable head={["예치 원금", "연 3%", "연 4%", "연 5%"]} rows={DEPOSIT_ROWS} />
        <p className="text-xs leading-relaxed text-[#8B93A6]">
          두 표 모두 단리·만기일시지급, 이자소득세 {TAX} 공제 기준입니다.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-[#1B2A4A]">적금 금리를 원금 전체 기준으로 환산하면</h2>
        <SimpleTable head={["가입 기간", "연 3%", "연 4%", "연 5%"]} rows={EFFECTIVE_ROWS} />
        <p className="text-xs leading-relaxed text-[#8B93A6]">
          적금의 세전 이자를 납입원금 전체에 대한 연 이율로 바꾼 값입니다(공시금리 × (개월 수 + 1) ÷ (2 × 개월 수)).
          예금 금리와 비교할 때 이 숫자를 쓰면 됩니다.
        </p>
      </section>

      <section className="space-y-3 text-sm leading-relaxed text-[#5B6478]">
        <h2 className="text-xl font-bold text-[#1B2A4A]">오늘 금리로 계산하면 ({RATES_DATE} 기준)</h2>
        <p>
          금융감독원 금융상품통합비교공시에서 매일 가져오는{" "}
          <Link href="/rates" className="text-[#2E4494] underline">
            금리 비교
          </Link>{" "}
          데이터 기준으로, 12개월 정기예금 최고금리는 연 {pct(topDep.maxRate)}입니다. 1,000만 원을 넣으면 세후 이자{" "}
          {won(depTop.netInterest)}입니다.
        </p>
        <p>
          12개월 적금 중 최고금리가 가장 높은 상품은 기본금리 연 {pct(topSav.baseRate)}, 우대조건을 모두 채웠을 때 연{" "}
          {pct(topSav.maxRate)}입니다. 월 30만 원을 넣으면 세후 이자가 기본금리로는 {won(savBase.netInterest)}, 최고금리로는{" "}
          {won(savMax.netInterest)}입니다. 우대조건 충족 여부에 따라 {won(savMax.netInterest - savBase.netInterest)} 차이가
          납니다.
        </p>
      </section>

      <SourceNote slug="deposit" />

      <Faq items={FAQ} />
      <FaqJsonLd items={FAQ} />

      <div className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-4 text-sm">
        <Link href="/guide/deposit-savings-guide" className="font-medium text-[#2E4494] underline">
          이자소득세 15.4%는 왜 붙는지 알아보기 →
        </Link>
      </div>

      <AdSlot id="calc-deposit-bottom" />
    </article>
  );
}
