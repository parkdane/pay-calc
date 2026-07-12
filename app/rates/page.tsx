import type { Metadata } from "next";
import RateTable from "@/components/RateTable";
import AdSlot from "@/components/AdSlot";
import Faq from "@/components/Faq";
import Link from "next/link";

export const metadata: Metadata = {
  title: "예금·적금 금리 비교 (매일 갱신)",
  description:
    "시중은행·저축은행·인터넷은행의 정기예금과 적금 최고금리를 금융감독원 공시 기준으로 매일 비교합니다.",
};

const FAQ = [
  {
    q: "금리는 얼마나 자주 갱신되나요?",
    a: "금융감독원 금융상품통합비교공시 데이터를 기준으로 매일 자동 갱신됩니다. 표 상단의 최종 갱신일에서 기준 날짜를 확인할 수 있습니다.",
  },
  {
    q: "기본금리와 최고금리는 뭐가 다른가요?",
    a: "기본금리는 조건 없이 받는 금리이고, 최고금리는 급여이체·카드실적·앱 가입 등 우대조건을 모두 충족했을 때 받는 금리입니다. 본인이 실제로 채울 수 있는 조건인지 확인해야 합니다.",
  },
  {
    q: "저축은행도 안전한가요?",
    a: "예금자보호법에 따라 금융회사별 1인당 원리금 1억 원까지 보호됩니다. 저축은행도 시중은행과 동일하게 보호되므로, 한 곳에 1억 원 이내로 예치하면 안전합니다.",
  },
  {
    q: "표시된 금리로 얼마를 받나요?",
    a: "세전 금리 기준이며, 이자에는 15.4%의 이자소득세가 부과됩니다. 실제 세후 수령액은 적금·예금 이자 계산기에서 확인할 수 있습니다.",
  },
];

export default function Page() {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          예금·적금 금리 비교
        </h1>
        <p className="text-sm text-slate-600">
          시중·저축·인터넷은행의 정기예금과 적금 최고금리를 매일 갱신해
          비교합니다.
        </p>
      </header>

      <AdSlot id="rates-top" />

      <RateTable />

      <section className="space-y-3 text-sm leading-relaxed text-slate-700">
        <h2 className="text-xl font-bold text-slate-900">금리 비교 시 확인할 점</h2>
        <p>
          최고금리는 우대조건을 모두 충족해야 적용됩니다. 급여이체, 카드
          사용실적, 첫 거래 여부 등 조건을 본인이 채울 수 있는지 먼저
          확인하세요. 조건을 못 채우면 기본금리만 적용됩니다.
        </p>
        <p>
          같은 금리라도 세금 조건에 따라 실수령이 달라집니다. 일반 과세는
          이자의 15.4%가 공제되며, 새마을금고·신협의 세금우대(3,000만 원 한도)나
          비과세 상품을 활용하면 세후 수령이 늘어납니다. 마음에 드는 상품을
          찾았다면{" "}
          <Link href="/calc/deposit" className="text-[#5B67A2] underline">
            적금·예금 이자 계산기
          </Link>
          에서 세후 수령액을 계산해보세요.
        </p>
      </section>

      <Faq items={FAQ} />

      <AdSlot id="rates-bottom" />
    </article>
  );
}