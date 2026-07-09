import type { Metadata } from "next";
import SalaryTable from "@/components/SalaryTable";
import SoldierTable from "@/components/SoldierTable";
import AdSlot from "@/components/AdSlot";
import Faq from "@/components/Faq";
import CalcCta from "@/components/CalcCta";

import civil from "@/data/salary-civil-2026.json";
import military from "@/data/salary-military-2026.json";
import police from "@/data/salary-police-2026.json";
import fire from "@/data/salary-fire-2026.json";
import teacher from "@/data/salary-teacher-2026.json";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DATA: Record<string, any> = { civil, military, police, fire, teacher };
type Slug = keyof typeof DATA;

export function generateStaticParams() {
  return Object.keys(DATA).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const d = DATA[slug as Slug];
  return {
    title: `${d.year}년 ${d.title} 봉급표`,
    description: `${d.year}년 ${d.title} 봉급표를 계급·호봉별로 정리했습니다. 실수령액 계산기로 세후 월급까지 확인하세요.`,
  };
}

export default async function SalaryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const d = DATA[slug as Slug];
  const isMilitary = d.type === "military";

  return (
    <article className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {d.year}년 {d.title} 봉급표
        </h1>
        <ul className="space-y-1 text-sm text-slate-600">
          {d.summary.map((s: string) => (
            <li key={s}>· {s}</li>
          ))}
        </ul>
        <p className="text-xs text-slate-400">
          출처: {d.source} · 최종 갱신 {d.updatedAt}
        </p>
      </header>

      {/* 계산기 CTA (표 위) */}
      {isMilitary ? (
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            병사 봉급은 비과세로 아래 표 금액이 그대로 지급됩니다. 아래
            계산기는 직업군인(부사관·장교) 실수령액용입니다.
          </div>
          <CalcCta
            href="/calc/soldier-save"
            label="장병내일준비적금 수령액 계산하기"
          />
          <CalcCta
            href="/calc/military-net"
            label="군인 간부 실수령액 계산하기"
          />
        </div>
      ) : (
        <CalcCta />
      )}

      {/* 광고 (CTA와 표 사이) */}
      <AdSlot id={`salary-${slug}-top`} />

      {/* 군인: 병사 고정급 + 간부 호봉표 / 그 외: 단일 표 */}
      {isMilitary ? (
        <div className="space-y-8">
          <SoldierTable title={d.soldier.title} rows={d.soldier.rows} />
          {d.officerTables.map(
            (t: {
              title: string;
              columns: string[];
              rows: { hobong: number; pay: (number | null)[] }[];
            }) => (
              <div key={t.title} className="space-y-2">
                <h3 className="font-semibold text-slate-900">{t.title}</h3>
                <SalaryTable columns={t.columns} rows={t.rows} />
              </div>
            )
          )}
          {d.generalNote && (
            <p className="text-sm text-slate-500">· {d.generalNote}</p>
          )}
        </div>
      ) : (
        <SalaryTable columns={d.columns} rows={d.rows} />
      )}

      <section className="space-y-3 text-slate-700">
        <h2 className="text-xl font-bold text-slate-900">봉급표 보는 법</h2>
        <p>
          위 표의 금액은 기본급(봉급)이며, 실제 월급에는 정액급식비·직급보조비
          등 수당이 더해지고 연금 기여금·건강보험·소득세가 공제됩니다. 따라서
          통장에 들어오는 금액은 표의 금액과 다릅니다. 정확한 세후 금액은
          실수령액 계산기에서 확인할 수 있습니다.
        </p>
      </section>

      <Faq items={d.faq} />

      {/* 하단 광고 */}
      <AdSlot id={`salary-${slug}-bottom`} />
    </article>
  );
}
