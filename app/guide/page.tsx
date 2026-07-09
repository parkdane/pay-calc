import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES } from "@/data/guides";

export const metadata: Metadata = {
  title: "가이드",
  description:
    "봉급표 보는 법, 공무원 수당, 정책 적금 가입 조건 등 급여·자산 형성 가이드를 제공합니다.",
};

export default function Page() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          가이드
        </h1>
        <p className="text-sm text-slate-600">
          봉급·수당·정책 적금을 이해하는 데 도움이 되는 글입니다.
        </p>
      </header>

      <div className="space-y-3">
        {GUIDES.map((g) => (
          <Link
            key={g.slug}
            href={`/guide/${g.slug}`}
            className="block rounded-xl border border-slate-200 bg-white p-5 transition hover:shadow-md"
          >
            <h2 className="font-semibold text-slate-900">{g.title}</h2>
            <p className="mt-1 text-sm text-slate-500">{g.desc}</p>
            <p className="mt-2 text-xs text-slate-400">{g.date}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
