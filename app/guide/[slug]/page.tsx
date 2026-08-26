import type { Metadata } from "next";
import { GUIDES } from "@/data/guides";
import AdSlot from "@/components/AdSlot";
import CalcCta from "@/components/CalcCta";
import Link from "next/link";

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
  return { title: g.title, description: g.desc,
  openGraph: {
    title: g.title,
    description: g.desc,
  },
};
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

      {g.relatedHref && (
        <Link
          href={g.relatedHref}
          className="block rounded-xl border border-[rgba(46,68,148,0.22)] bg-white px-6 py-3 text-center text-sm font-medium text-[#2E4494] transition hover:bg-[rgba(46,68,148,0.06)]"
        >
          {g.relatedLabel ?? "관련 계산기 보기"} →
        </Link>
      )}

      <AdSlot id={`guide-${g.slug}-bottom`} />
    </article>
  );
}
