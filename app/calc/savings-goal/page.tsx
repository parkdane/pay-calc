import type { Metadata } from "next";
import SavingsGoalSim from "@/components/SavingsGoalSim";
import AdSlot from "@/components/AdSlot";
import Faq from "@/components/Faq";
import FaqJsonLd from "@/components/FaqJsonLd";
import SourceNote from "@/components/SourceNote";
import Link from "next/link";
import SimpleTable from "@/components/SimpleTable";
import { monthsToGoal, formatMonths } from "@/lib/savingsGoal";
import { INTEREST_TAX_RATE } from "@/lib/depositCalc";

export const metadata: Metadata = {
  title: "1억 모으기 시뮬레이터 (저축 목표 계산기)",
  description:
    "월급·고정비·생활비를 입력하면 매달 저축 가능액과 목표 금액(1억 등) 달성까지 걸리는 기간을 계산합니다.",
  openGraph: {
    title: "1억 모으기 시뮬레이터 (저축 목표 계산기)",
    description: "월급·고정비·생활비를 입력하면 매달 저축 가능액과 목표 금액(1억 등) 달성까지 걸리는 기간을 계산합니다.",
  },
};

const EOK = 100000000;
const f = (save: number, goal: number, rate: number, afterTax = false) => formatMonths(monthsToGoal(save, goal, rate, afterTax)!);
const man = (n: number) => (n / 10000).toLocaleString("ko-KR") + "만 원";
const TAX = (INTEREST_TAX_RATE * 100).toFixed(1) + "%";

// 1억 달성 기간 (월복리, 세전)
const EOK_ROWS = [500000, 1000000, 1500000, 2000000, 3000000].map((s) => [
  `월 ${man(s)}`,
  f(s, EOK, 0),
  f(s, EOK, 3),
  f(s, EOK, 5),
]);
// 목표 금액별 (연 3%, 세전)
const GOAL_ROWS = [50000000, EOK, 300000000].map((g) => [
  g >= EOK ? `${g / EOK}억 원` : man(g),
  f(500000, g, 3),
  f(1000000, g, 3),
  f(2000000, g, 3),
]);
// 월 실수령액 × 저축률 → 1억 (연 3%, 세전)
const RATE_ROWS = [2500000, 3000000, 4000000].map((inc) => [
  `월 ${man(inc)}`,
  ...[0.3, 0.5, 0.7].map((sr) => `${man(inc * sr)} → ${f(inc * sr, EOK, 3)}`),
]);

const m100_3 = monthsToGoal(1000000, EOK, 3)!;
const m100_3t = monthsToGoal(1000000, EOK, 3, true)!;

const FAQ = [
  {
    q: "월 100만 원씩 모으면 1억까지 얼마나 걸리나요?",
    a: `이자 없이 모으면 ${f(1000000, EOK, 0)}, 연 3%로 굴리면 약 ${f(1000000, EOK, 3)}, 연 5%면 약 ${f(1000000, EOK, 5)} 걸립니다(월복리·세전). 이자소득세 ${TAX}를 반영하면 연 3% 기준 약 ${f(1000000, EOK, 3, true)}입니다.`,
  },
  {
    q: "월 50만 원이면 1억 모으는 데 몇 년인가요?",
    a: `이자 없이 ${f(500000, EOK, 0)}, 연 3%로 약 ${f(500000, EOK, 3)}, 연 5%로 약 ${f(500000, EOK, 5)}입니다. 저축액이 작을수록 기간이 길어져 금리 차이의 효과도 커집니다.`,
  },
  {
    q: "저축률은 얼마가 적당한가요?",
    a: "정답은 없지만 사회초년생 재테크에서 실수령액의 50% 이상 저축이 흔히 목표로 제시됩니다. 본가 거주 여부, 월세 부담에 따라 현실적인 저축률은 크게 달라지므로 고정비를 먼저 파악하는 것이 중요합니다.",
  },
  {
    q: "세금은 반영되나요?",
    a: `시뮬레이터는 세전 금리로 계산합니다. 일반 예·적금은 이자의 ${TAX}가 원천징수되므로 실제 기간은 조금 더 깁니다. 월 100만 원·연 3%·1억 기준으로 세전 ${formatMonths(m100_3)}, 세후 약 ${formatMonths(m100_3t)}이며 차이는 ${m100_3t - m100_3}개월입니다. 비과세 상품이라면 세전 결과를 그대로 보면 됩니다.`,
  },
  {
    q: "어디에 저축하는 게 좋나요?",
    a: "만 34세 이하라면 정부기여금과 비과세가 붙는 청년미래적금 같은 정책 상품이 일반 적금보다 유리합니다. 일반 적금은 이자가 붙는 방식 때문에 공시금리보다 실제 수익이 낮으니, 목돈이 생기면 예금으로 옮기는 것도 방법입니다.",
  },
];

export default function Page() {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-[#1B2A4A] sm:text-3xl">
          저축 목표 시뮬레이터
        </h1>
        <p className="text-sm text-[#5B6478]">
          월급과 지출을 입력하면 매달 얼마를 저축할 수 있는지, 목표 금액까지
          얼마나 걸리는지 계산합니다.
        </p>
      </header>

      <div className="mx-[calc(50%-50vw)] w-screen">
        <SavingsGoalSim />
      </div>

      <AdSlot id="calc-savings-goal-result" />

      <section className="space-y-3 text-sm leading-relaxed text-[#5B6478]">
        <h2 className="text-xl font-bold text-[#1B2A4A]">사용 방법</h2>
        <p>
          월 실수령액에서 고정비(월세·통신비·보험료·구독료 등)와
          변동비(식비·교통·여가 등)를 빼면 저축 가능액이 나옵니다. 목표
          금액과 저축 금리를 넣으면 월복리 적립 기준으로 달성 기간을
          계산하며, 지출을 조정해가며 기간이 어떻게 바뀌는지 시뮬레이션할 수
          있습니다.
        </p>
        <p>
          내 월 실수령액을 모른다면{" "}
          <Link href="/calc/worker-net" className="text-[#2E4494] underline">
            연봉 실수령액 계산기
          </Link>
          에서 먼저 확인하고, 저축 상품은{" "}
          <Link href="/calc/youth-save" className="text-[#2E4494] underline">
            청년미래적금
          </Link>
          과{" "}
          <Link href="/calc/deposit" className="text-[#2E4494] underline">
            일반 적금
          </Link>
          을 비교해보세요.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-[#1B2A4A]">1억 모으는 데 걸리는 기간</h2>
        <SimpleTable head={["월 저축액", "이자 없음", "연 3%", "연 5%"]} rows={EOK_ROWS} />
        <p className="text-xs leading-relaxed text-[#8B93A6]">
          매월 말 적립, 월복리, 이자소득세 미반영(세전) 기준입니다. 세금을 반영하면 연 3%·월 100만 원 기준{" "}
          {m100_3t - m100_3}개월가량 늘어납니다.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-[#1B2A4A]">목표 금액별 기간 (연 3%)</h2>
        <SimpleTable head={["목표", "월 50만 원", "월 100만 원", "월 200만 원"]} rows={GOAL_ROWS} />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-[#1B2A4A]">월급과 저축률로 보는 1억 달성 기간 (연 3%)</h2>
        <SimpleTable head={["월 실수령액", "저축률 30%", "저축률 50%", "저축률 70%"]} rows={RATE_ROWS} minWidth={620} />
        <p className="text-xs leading-relaxed text-[#8B93A6]">
          같은 월급이라도 저축률에 따라 기간이 몇 년씩 벌어집니다. 월 100만 원·연 3% 기준으로 금리를 연 5%로 올리면{" "}
          {m100_3 - monthsToGoal(1000000, EOK, 5)!}개월, 저축액을 월 150만 원으로 늘리면{" "}
          {m100_3 - monthsToGoal(1500000, EOK, 3)!}개월 줄어듭니다.
        </p>
      </section>

      <SourceNote slug="savings-goal" />

      <Faq items={FAQ} />
      <FaqJsonLd items={FAQ} />

      <div className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-4 text-sm">
        <Link href="/guide/savings-goal-guide" className="font-medium text-[#2E4494] underline">
          1억 모으기, 현실적인 기간 계산법 알아보기 →
        </Link>
      </div>

      <AdSlot id="calc-savings-goal-bottom" />
    </article>
  );
}
