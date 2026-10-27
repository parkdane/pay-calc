import type { Metadata } from "next";
import YouthSavingsCalc from "@/components/YouthSavingsCalc";
import AdSlot from "@/components/AdSlot";
import Faq from "@/components/Faq";
import FaqJsonLd from "@/components/FaqJsonLd";
import SourceNote from "@/components/SourceNote";
import SimpleTable from "@/components/SimpleTable";
import { calcYouthFuture, YOUTH } from "@/lib/policySavings";
import { INTEREST_TAX_RATE } from "@/lib/depositCalc";

export const metadata: Metadata = {
  title: "청년미래적금 계산기 (2026년 기준)",
  description:
    "월 납입액과 가입 유형을 선택하면 정부기여금(6%/12%)과 비과세 이자를 포함한 청년미래적금 3년 만기 수령액을 계산합니다.",
  openGraph: {
    title: "청년미래적금 계산기 (2026년 기준)",
    description: "월 납입액과 가입 유형을 선택하면 정부기여금(6%/12%)과 비과세 이자를 포함한 청년미래적금 3년 만기 수령액을 계산합니다.",
  },
};

const won = (n: number) => Math.round(n).toLocaleString("ko-KR") + "원";
const man = (n: number) => (n / 10000).toLocaleString("ko-KR") + "만 원";
const MAXM = YOUTH.maxMonthly;
const N = YOUTH.months;
const B = YOUTH.baseRate;
const X = YOUTH.maxRate;
const typeLabel = (id: string) => YOUTH.types.find((t) => t.id === id)!.label;

// 같은 만기 수령액을 일반 과세 적금(이자소득세 15.4%)으로 받으려면 필요한 연 금리
const equivRate = (monthly: number, total: number) => {
  const extra = total - monthly * N;
  return (extra / (1 - INTEREST_TAX_RATE) / (monthly / 12) / ((N * (N + 1)) / 2)) * 100;
};

const TYPE_ROWS = YOUTH.types.map((ty) => {
  const lo = calcYouthFuture(MAXM, ty.id, B);
  const hi = calcYouthFuture(MAXM, ty.id, X);
  return [ty.label, won(lo.matching), won(lo.total), won(hi.total), `연 ${equivRate(MAXM, hi.total).toFixed(1)}%`];
});
const MONTHLY_ROWS = [100000, 200000, 300000, MAXM].map((m) => {
  const r = calcYouthFuture(m, "general", B);
  return [`월 ${man(m)}`, won(r.principal), won(r.matching), won(r.interest), won(r.total)];
});

const G8 = calcYouthFuture(MAXM, "general", X);
const P8 = calcYouthFuture(MAXM, "premium", X);
const G5 = calcYouthFuture(MAXM, "general", B);

const FAQ = [
  {
    q: "월 50만 원 넣으면 3년 뒤 얼마 받나요?",
    a: `우대금리 포함 연 ${X}% 기준으로 일반형은 ${won(G8.total)}(원금 ${won(G8.principal)} + 기여금 ${won(G8.matching)} + 이자 ${won(G8.interest)}), 우대형은 ${won(P8.total)}을 받습니다. 우대금리 없이 기본금리 연 ${B}%만 받으면 일반형 ${won(G5.total)}입니다.`,
  },
  {
    q: "일반형과 우대형의 차이는 뭔가요?",
    a: "정부기여금 비율이 다릅니다. 일반형은 납입액의 6%(월 최대 3만 원), 우대형은 12%(월 최대 6만 원)입니다. 우대형은 총급여 3,600만 원 이하 중소기업 재직자, 중소기업 신규 취업자, 연매출 1억 원 이하 소상공인 등이 대상이며 가구 중위소득 150% 이하여야 합니다.",
  },
  {
    q: "가입 조건은 어떻게 되나요?",
    a: "만 19~34세(병역 최대 6년 차감) 청년으로, 총급여 7,500만 원(종합소득 6,300만 원) 이하 또는 연매출 3억 원 이하 소상공인이면서 가구 중위소득 200% 이하여야 합니다. 정부기여금은 총급여 6,000만 원 이하일 때 받고, 6,000만 원 초과~7,500만 원 이하는 비과세 혜택만 받습니다. 최근 3년 중 금융소득종합과세 대상이었던 적이 있으면 가입할 수 없습니다.",
  },
  {
    q: "우대형은 중간에 이직해도 유지되나요?",
    a: "중소기업 재직으로 우대형을 받은 경우 만기 한 달 전까지 중소기업 재직 기간이 총 29개월 이상이어야 전체 기간에 대해 우대형 기여금이 인정되고, 이직은 가입 기간 중 2회까지 허용됩니다.",
  },
  {
    q: "중도 해지하면 어떻게 되나요?",
    a: "일반 중도해지 시 정부기여금이 지급되지 않고 이자에 과세됩니다. 다만 사망·해외이주·퇴직·폐업 등 특별한 사유는 특별중도해지로 만기와 동일한 혜택을 받습니다.",
  },
];

export default function Page() {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-[#1B2A4A] sm:text-3xl">
          청년미래적금 계산기
        </h1>
        <p className="text-sm text-[#5B6478]">
          가입 유형과 월 납입액을 넣으면 정부기여금과 비과세 이자를 포함한 3년
          만기 수령액을 계산합니다.
        </p>
      </header>

      <div className="mx-[calc(50%-50vw)] w-screen">
        <YouthSavingsCalc />
      </div>

      <AdSlot id="calc-youth-save-result" />

      <section className="space-y-3 text-sm leading-relaxed text-[#5B6478]">
        <h2 className="text-xl font-bold text-[#1B2A4A]">계산 방식</h2>
        <p>
          만기 수령액은 내 납입 원금 + 정부기여금(월 납입액의 6% 또는 12%, 월 상한 적용) + 비과세 이자로
          구성됩니다. 이자는 저축금액과 정부기여금 모두에 붙으며 매월 적립식 단리로 계산합니다. 저축금액에는 입력한
          금리를, 정부기여금에는 기본금리(연 {B}%)를 적용했습니다. 이 방식으로 계산하면 금융위원회가 제시한 예시(월{" "}
          {man(MAXM)}·연 {X}% 기준 일반형 약 2,138만 원, 우대형 약 2,255만 원)와 같은 결과가 나옵니다.
        </p>
        <p>
          2026년 6월 출시된 정책 금융 상품으로, 청년도약계좌의 후속 상품입니다.
          기본금리는 전 취급기관 동일하게 연 5%이며, 은행별 우대금리로 최대 8%까지
          받을 수 있습니다.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-[#1B2A4A]">유형별 만기 수령액 (월 {man(MAXM)}, 3년)</h2>
        <SimpleTable
          head={["유형", "정부기여금", `연 ${B}% 수령액`, `연 ${X}% 수령액`, "일반 적금 환산"]}
          rows={TYPE_ROWS}
          minWidth={640}
        />
        <p className="text-xs leading-relaxed text-[#8B93A6]">
          일반 적금 환산은 연 {X}% 수령액과 같은 금액을 이자소득세 {(INTEREST_TAX_RATE * 100).toFixed(1)}%가 붙는 일반
          적금(3년, 매월 {man(MAXM)})으로 받으려면 필요한 연 금리입니다.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-[#1B2A4A]">월 납입액별 수령액 ({typeLabel("general")}, 기본금리 연 {B}%)</h2>
        <SimpleTable head={["월 납입액", "원금", "정부기여금", "이자", "합계"]} rows={MONTHLY_ROWS} minWidth={560} />
        <p className="text-xs leading-relaxed text-[#8B93A6]">
          기여금은 납입액에 비례하므로 적게 넣어도 비율(6%)은 같습니다.
        </p>
      </section>

      <SourceNote slug="youth-save" />

      <Faq items={FAQ} />
      <FaqJsonLd items={FAQ} />

      <AdSlot id="calc-youth-save-bottom" />
    </article>
  );
}
