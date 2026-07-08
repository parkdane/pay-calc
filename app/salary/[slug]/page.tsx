import type { Metadata } from "next";
import SalaryTable from "@/components/SalaryTable";
import AdSlot from "@/components/AdSlot";
import Faq from "@/components/Faq";
import CalcCta from "@/components/CalcCta";

import civil from "@/data/salary-civil-2026.json";
import military from "@/data/salary-military-2026.json";
import police from "@/data/salary-police-2026.json";
import fire from "@/data/salary-fire-2026.json";

const DATA = { civil, military, police, fire } as const;
type Slug = keyof typeof DATA;

// output: "export" 필수 — 빌드 시 4개 페이지를 정적 HTML로 생성
export function generateStaticParams() {
  return (Object.keys(DATA) as Slug[]).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const d = DATA[slug as Slug];
  return {
    title: `${d.year}년 ${d.title} 봉급표 (호봉별)`,
    description: `${d.year}년 ${d.title} 봉급표를 직급·호봉별로 정리했습니다. 실수령액 계산기로 세후 월급까지 확인하세요.`,
  };
}

export default async function SalaryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const d = DATA[slug as Slug];

  return (
    <article className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {d.year}년 {d.title} 봉급표
        </h1>
        <ul className="space-y-1 text-sm text-slate-600">
          {d.summary.map((s) => (
            <li key={s}>· {s}</li>
          ))}
        </ul>
        <p className="text-xs text-slate-400">
          출처: {d.source} · 최종 갱신 {d.updatedAt}
        </p>
      </header>

      <SalaryTable columns={d.columns} rows={d.rows} />

      <AdSlot id={`salary-${slug}-mid`} />

      <CalcCta />

      {/* SEO용 해설 — 각 봉급표별로 500자 이상 실제 내용으로 채울 것 */}
      <section className="prose-sm space-y-3 text-slate-700">
        <h2 className="text-xl font-bold text-slate-900">봉급표 보는 법</h2>
        <p>
          위 표의 금액은 기본급(봉급)이며, 실제 월급에는 정액급식비·직급보조비
          등 수당이 더해지고 연금 기여금·건강보험·소득세가 공제됩니다. 따라서
          통장에 들어오는 금액은 표의 금액과 다릅니다. 정확한 세후 금액은
          실수령액 계산기에서 확인할 수 있습니다.
        </p>
        <p>{/* TODO: 봉급표별 해설 500자 이상 추가 — 애드센스 승인의 핵심 */}</p>
      </section>

      <Faq items={d.faq} />

      <AdSlot id={`salary-${slug}-bottom`} />
    </article>
  );
}
