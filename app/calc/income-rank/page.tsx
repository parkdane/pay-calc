import type { Metadata } from "next";
import IncomeRankCalc from "@/components/IncomeRankCalc";
import AdSlot from "@/components/AdSlot";
import Faq from "@/components/Faq";
import FaqJsonLd from "@/components/FaqJsonLd";
import SourceNote from "@/components/SourceNote";
import Link from "next/link";
import SimpleTable from "@/components/SimpleTable";
import { topPercentOf, incomePercentileMeta } from "@/lib/incomePercentile";
import { calcWorkerNet } from "@/lib/workerNet";
import pctData from "@/data/income-percentile-2024.json";

export const metadata: Metadata = {
  title: "내 연봉 상위 몇 %? 연봉 순위 계산기",
  description:
    "연봉을 입력하면 국세청 근로소득 백분위 자료 기준으로 대한민국에서 상위 몇 %인지 바로 확인합니다.",
  openGraph: {
    title: "내 연봉 상위 몇 %? 연봉 순위 계산기",
    description: "연봉을 입력하면 국세청 근로소득 백분위 자료 기준으로 대한민국에서 상위 몇 %인지 바로 확인합니다.",
  },
};

const won = (n: number) => Math.round(n).toLocaleString("ko-KR") + "원";
const manwon = (n: number) => {
  const m = Math.round(n / 10000);
  const eok = Math.floor(m / 10000);
  const rest = m % 10000;
  if (eok === 0) return `${m.toLocaleString("ko-KR")}만 원`;
  return rest === 0 ? `${eok}억 원` : `${eok}억 ${rest.toLocaleString("ko-KR")}만 원`;
};
const top = (income: number) => topPercentOf(income).toFixed(1) + "%";
const { median, year } = incomePercentileMeta;

// 연봉별 상위 %·월 실수령액(부양가족 본인 1명) 예시표
const SALARIES = [median, 40000000, 50000000, 60000000, 70000000, 80000000, 100000000, 150000000];
const RANK_ROWS = SALARIES.map((s) => [
  s === median ? `${manwon(s)} (중위)` : manwon(s),
  `상위 ${top(s)}`,
  `${(s / median).toFixed(2)}배`,
  won(calcWorkerNet(s, 1).net),
]);

// 국세청 자료의 실제 기준점(보간 없이 원자료)
const ANCHOR_ROWS = pctData.anchors
  .filter((a) => a.topPercent < 100)
  .map((a) => [`상위 ${a.topPercent}%`, manwon(a.income), won(calcWorkerNet(a.income, 1).net)]);

const a30 = pctData.anchors.find((a) => a.topPercent === 30)!;
const a10 = pctData.anchors.find((a) => a.topPercent === 10)!;
const a1 = pctData.anchors.find((a) => a.topPercent === 1)!;

const FAQ = [
  {
    q: "연봉 5,000만 원이면 상위 몇 %인가요?",
    a: `국세청 ${year}년 귀속 자료 기준 상위 약 ${top(50000000)}입니다. 근로소득자 중위 연봉이 ${manwon(median)}이므로 5,000만 원은 중위의 ${(50000000 / median).toFixed(1)}배입니다. 상위 30% 기준점이 ${manwon(a30.income)}이라 5,000만 원은 그보다 조금 아래에 있습니다.`,
  },
  {
    q: "연봉 1억이면 상위 몇 %인가요?",
    a: `상위 약 ${top(100000000)}입니다. 국세청 자료에서 상위 10% 기준점이 ${manwon(a10.income)}, 상위 1% 기준점이 ${manwon(a1.income)}이므로 연봉 1억 원은 상위 10% 안쪽입니다. 다만 10%와 1% 사이는 기준점 간격이 넓어 직선으로 보간한 추정치입니다.`,
  },
  {
    q: "어떤 데이터를 기준으로 하나요?",
    a: "국세청이 공공데이터포털에 공개하는 근로소득 백분위(천분위) 자료를 사용합니다. 연말정산을 신고한 전체 근로소득자를 소득순으로 나열한 통계로, 사업소득·기타소득·자산은 포함되지 않습니다.",
  },
  {
    q: "세전인가요 세후인가요?",
    a: "세전 총급여(비과세 제외) 기준입니다. 통상 말하는 '연봉'과 같은 개념이며, 실수령액이 아닙니다. 위 표의 월 실수령액은 4대보험과 소득세를 뺀 금액을 따로 계산해 붙인 것입니다.",
  },
  {
    q: "체감보다 순위가 높게 나오는데 왜 그런가요?",
    a: "이 통계에는 아르바이트·단기근로·연중 입사자처럼 1년 치 급여를 다 받지 않은 근로자까지 전부 포함되기 때문입니다. 또래·같은 업계와 비교하는 체감 순위와는 다를 수 있습니다.",
  },
  {
    q: "평균 연봉과 중위 연봉 중 어느 걸 봐야 하나요?",
    a: `내 위치를 보려면 중위 연봉(${manwon(median)})이 더 적합합니다. 평균은 소수의 고소득자가 끌어올려 실제 한가운데보다 높게 나옵니다. 중위 연봉은 전체 근로소득자를 한 줄로 세웠을 때 정확히 가운데 있는 사람의 연봉입니다.`,
  },
];

export default function Page() {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-[#1B2A4A] sm:text-3xl">
          내 연봉, 상위 몇 %일까?
        </h1>
        <p className="text-sm text-[#5B6478]">
          연봉을 입력하면 국세청 근로소득 통계 기준으로 대한민국 근로소득자 중
          내 위치를 알려드립니다.
        </p>
      </header>

      <div className="mx-[calc(50%-50vw)] w-screen">
        <IncomeRankCalc />
      </div>

      <AdSlot id="calc-income-rank-result" />

      <section className="space-y-3 text-sm leading-relaxed text-[#5B6478]">
        <h2 className="text-xl font-bold text-[#1B2A4A]">계산 방식</h2>
        <p>
          국세청이 공개하는 근로소득 백분위(천분위) 자료의 구간별 평균
          총급여를 앵커로 삼고, 구간 사이는 보간하여 상위 %를 추정합니다.
          연말정산 신고 근로자 전체가 모수이며, 개인별 정확한 순위 확정이
          아닌 참고용 추정입니다.
        </p>
        <p>
          내 연봉의 세후 실수령액이 궁금하다면{" "}
          <Link href="/calc/worker-net" className="text-[#2E4494] underline">
            연봉 실수령액 계산기
          </Link>
          에서 확인하고, 연봉별 실수령 비율 그래프도 함께 볼 수 있습니다.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-[#1B2A4A]">연봉별 상위 %와 월 실수령액</h2>
        <SimpleTable head={["연봉(세전)", "상위", "중위 대비", "월 실수령액"]} rows={RANK_ROWS} minWidth={520} />
        <p className="text-xs leading-relaxed text-[#8B93A6]">
          상위 %는 국세청 {year}년 귀속 근로소득 백분위 자료의 기준점 사이를 직선으로 보간한 추정치입니다. 중위 연봉 아래 구간은
          자료 기준점이 없어 보간 오차가 커서 표에서 뺐습니다. 월
          실수령액은 2026년 4대보험 요율과 근로소득 간이세액표, 부양가족 본인 1명 기준으로{" "}
          <Link href="/calc/worker-net" className="underline">
            직장인 실수령액 계산기
          </Link>
          와 같은 방식으로 계산했습니다.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-[#1B2A4A]">국세청 자료의 기준점 (원자료)</h2>
        <SimpleTable head={["구간", "연봉(세전)", "월 실수령액"]} rows={ANCHOR_ROWS} minWidth={420} />
        <p className="text-xs leading-relaxed text-[#8B93A6]">
          {incomePercentileMeta.source}. 각 값은 해당 지점 천분위 구간의 1인당 평균 총급여이며, 상위 50%는 중위 연봉입니다. 계산기는 이 기준점 사이를 보간하므로 기준점에서
          멀수록, 특히 상위 10%~1% 사이는 오차가 커질 수 있습니다.
        </p>
      </section>

      <section className="space-y-3 text-sm leading-relaxed text-[#5B6478]">
        <h2 className="text-xl font-bold text-[#1B2A4A]">숫자로 보는 연봉 분포</h2>
        <p>
          중위 연봉 {manwon(median)}에서 상위 30% 기준점 {manwon(a30.income)}까지는{" "}
          {manwon(a30.income - median)} 차이지만, 상위 10% 기준점 {manwon(a10.income)}까지는 다시{" "}
          {manwon(a10.income - a30.income)}, 상위 1% 기준점 {manwon(a1.income)}까지는{" "}
          {manwon(a1.income - a10.income)}이 벌어집니다. 위로 갈수록 같은 순위 차이를 만드는 데 필요한 연봉 차이가 빠르게
          커지는 구조입니다.
        </p>
        <p>
          세후로 보면 차이는 줄어듭니다. 중위 연봉의 월 실수령액은 {won(calcWorkerNet(median, 1).net)}, 상위 10% 기준점은{" "}
          {won(calcWorkerNet(a10.income, 1).net)}으로 세전 연봉은 {(a10.income / median).toFixed(1)}배지만 월 실수령액은{" "}
          {(calcWorkerNet(a10.income, 1).net / calcWorkerNet(median, 1).net).toFixed(1)}배입니다. 소득세 누진세율 때문입니다.
        </p>
      </section>

      <SourceNote slug="income-rank" />

      <Faq items={FAQ} />
      <FaqJsonLd items={FAQ} />

      <div className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-4 text-sm">
        <Link href="/guide/income-rank-guide" className="font-medium text-[#2E4494] underline">
          평균 연봉과 중위 연봉이 다른 이유 알아보기 →
        </Link>
      </div>

      <AdSlot id="calc-income-rank-bottom" />
    </article>
  );
}
