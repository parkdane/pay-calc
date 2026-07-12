import type { Metadata } from "next";
import { GUIDES } from "@/data/guides";
import AdSlot from "@/components/AdSlot";
import CalcCta from "@/components/CalcCta";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const g = GUIDES.find((x) => x.slug === slug)!;
  return { title: g.title, description: g.desc };
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const g = GUIDES.find((x) => x.slug === slug)!;

  return (
    <article className="mx-auto max-w-2xl space-y-8">
      <header className="space-y-3">
        <h1 className="text-2xl font-bold leading-snug tracking-tight text-[#1B2A4A] sm:text-3xl">
          {g.title}
        </h1>
        <p className="text-sm text-[#5B6478]">{g.desc}</p>
        <p className="text-xs text-[#8B93A6]">최종 갱신 {g.date}</p>
      </header>

      {g.sections.map((s, i) => (
        <section key={s.h2} className="space-y-3">
          <h2 className="text-xl font-bold text-[#1B2A4A]">{s.h2}</h2>
          {s.paragraphs.map((p) => (
            <p key={p.slice(0, 20)} className="leading-relaxed text-[#5B6478]">
              {p}
            </p>
          ))}
          {/* 중간 광고: 첫 섹션 뒤 */}
          {i === 0 && <AdSlot id={`guide-${g.slug}-mid`} />}
        </section>
      ))}

      {g.calcHref && (
        <CalcCta href={g.calcHref} label={g.calcLabel ?? "계산기 사용하기"} />
      )}

      <AdSlot id={`guide-${g.slug}-bottom`} />
    </article>
  );
}
