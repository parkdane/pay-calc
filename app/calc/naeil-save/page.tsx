import type { Metadata } from "next";
import NaeilSavingsCalc from "@/components/NaeilSavingsCalc";
import AdSlot from "@/components/AdSlot";
import Faq from "@/components/Faq";
import FaqJsonLd from "@/components/FaqJsonLd";
import SourceNote from "@/components/SourceNote";
import Link from "next/link";
import SimpleTable from "@/components/SimpleTable";
import { NAEIL_MONTHS, NAEIL_TIERS, NAEIL_MIN, NAEIL_MAX } from "@/lib/policySavings";

export const metadata: Metadata = {
  title: "청년내일저축계좌 계산기 (만기 수령액)",
  description:
    "월 10만 원 저축에 정부가 최대 30만 원을 매칭하는 청년내일저축계좌의 3년 만기 수령액을 계산합니다.",
  openGraph: {
    title: "청년내일저축계좌 계산기 (만기 수령액)",
    description: "월 10만 원 저축에 정부가 최대 30만 원을 매칭하는 청년내일저축계좌의 3년 만기 수령액을 계산합니다.",
  },
};

const won = (n: number) => Math.round(n).toLocaleString("ko-KR") + "원";
const man = (n: number) => (n / 10000).toLocaleString("ko-KR") + "만 원";
const GOV = NAEIL_TIERS[0].match; // 2026년 신규(중위소득 50% 이하)
const GOV_OLD = NAEIL_TIERS[1].match; // 2025년까지 가입한 50~100% 구간
const N = NAEIL_MONTHS;

// 본인 저축액별 3년 적립액 (이자 제외: 이자는 취급은행 금리에 따라 달라짐)
const SAVE_ROWS = [NAEIL_MIN, 200000, 300000, NAEIL_MAX].map((m) => [
  `월 ${man(m)}`,
  won(m * N),
  won(GOV * N),
  won((m + GOV) * N),
  `${((GOV * N) / (m * N)).toFixed(1)}배`,
]);
const TIER_ROWS = NAEIL_TIERS.map((tier) => [
  tier.id === "low" ? "중위소득 50% 이하 (2026년 신규)" : "중위소득 50~100% (2025년까지 가입자)",
  `월 ${man(tier.match)}`,
  won(NAEIL_MIN * N),
  won(tier.match * N),
  won((NAEIL_MIN + tier.match) * N),
]);

const FAQ = [
  {
    q: "월 10만 원 넣으면 3년 뒤 얼마 받나요?",
    a: `2026년 신규 가입 대상(기준 중위소득 50% 이하)은 본인 저축 ${won(NAEIL_MIN * N)} + 정부지원 ${won(GOV * N)} = ${won((NAEIL_MIN + GOV) * N)}에 이자가 더해집니다. 2025년까지 중위소득 50~100% 구간으로 가입한 경우 정부지원이 월 ${man(GOV_OLD)}이라 ${won((NAEIL_MIN + GOV_OLD) * N)}에 이자가 더해집니다.`,
  },
  {
    q: "가입 조건은 어떻게 되나요?",
    a: "2026년 신규 모집 기준으로 만 15~39세, 가구 소득인정액이 기준 중위소득 50% 이하, 본인 근로·사업소득이 월 10만 원 이상이어야 합니다. 모집 기간에 복지로 또는 주소지 행정복지센터에서 신청하며, 2026년 모집은 5월에 진행됐습니다.",
  },
  {
    q: "중위소득 50~100% 구간인데 신청할 수 있나요?",
    a: "2026년부터는 이 구간의 신규 모집이 없습니다. 이 구간에 해당하는 청년은 가구 중위소득 200% 이하 등 요건을 갖추면 청년미래적금을 검토할 수 있습니다. 2025년까지 이미 가입한 사람은 기존 조건(정부지원 월 10만 원)대로 유지됩니다.",
  },
  {
    q: "정부지원금을 받는 조건이 있나요?",
    a: "네. 3년간 통장 유지와 본인 저축, 근로활동 지속, 자립역량 교육 10시간 이수, 자금사용계획서 제출이 필요합니다. 조건을 채우지 못하면 정부지원금 없이 본인 저축액과 이자만 받습니다.",
  },
  {
    q: "저축액을 늘리면 정부지원금도 늘어나나요?",
    a: `아닙니다. 본인이 월 ${man(NAEIL_MIN)}을 넣든 ${man(NAEIL_MAX)}을 넣든 정부지원금은 월 ${man(GOV)}으로 같습니다. 저축액을 늘리면 본인 원금과 이자만 늘어나므로, 지원 효과만 보면 월 ${man(NAEIL_MIN)}이 가장 효율적입니다.`,
  },
  {
    q: "청년미래적금과 중복 가입할 수 있나요?",
    a: "청년내일저축계좌는 보건복지부의 저소득 청년 대상 복지 사업, 청년미래적금은 금융위원회의 정책 금융 상품으로 성격이 다릅니다. 중복 가입 가능 여부는 각 모집 공고의 세부 요건을 확인해야 합니다.",
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

      <div className="mx-[calc(50%-50vw)] w-screen">
        <NaeilSavingsCalc />
      </div>

      <AdSlot id="calc-naeil-save-result" />

      <section className="space-y-3 text-sm leading-relaxed text-[#5B6478]">
        <h2 className="text-xl font-bold text-[#1B2A4A]">계산 방식</h2>
        <p>
          만기 수령액은 본인 저축 원금(월 {man(NAEIL_MIN)}~{man(NAEIL_MAX)} × {N}개월) + 정부지원금 + 이자로
          구성됩니다. 정부지원금은 본인 저축액과 무관한 정액으로, 2026년 신규 가입 대상인 기준 중위소득 50% 이하는 월{" "}
          {man(GOV)}입니다. 중위소득 50~100% 구간(월 {man(GOV_OLD)})은 2026년부터 신규 모집이 없어 2025년까지 가입한
          경우에만 해당합니다.
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

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-[#1B2A4A]">본인 저축액별 3년 적립액 (2026년 신규, 정부지원 월 {man(GOV)})</h2>
        <SimpleTable head={["본인 저축", "본인 원금", "정부지원금", "합계(이자 제외)", "지원/원금"]} rows={SAVE_ROWS} minWidth={620} />
        <p className="text-xs leading-relaxed text-[#8B93A6]">
          이자는 취급은행 금리에 따라 달라져 표에서 뺐습니다. 위 계산기에서 금리를 넣어 확인할 수 있습니다.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-[#1B2A4A]">소득 구간별 비교 (본인 월 {man(NAEIL_MIN)})</h2>
        <SimpleTable head={["구간", "정부지원", "본인 원금", "정부지원금", "합계(이자 제외)"]} rows={TIER_ROWS} minWidth={620} />
      </section>

      <SourceNote slug="naeil-save" />

      <Faq items={FAQ} />
      <FaqJsonLd items={FAQ} />

      <div className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-4 text-sm">
        <Link href="/guide/naeil-save-guide" className="font-medium text-[#2E4494] underline">
          정부지원 30만 원 받는 조건 자세히 보기 →
        </Link>
      </div>

      <AdSlot id="calc-naeil-save-bottom" />
    </article>
  );
}
