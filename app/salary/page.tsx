import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "봉급표 전체 보기",
  description:
    "2026년 일반직 공무원·군인·경찰·소방 봉급표를 직급·호봉별로 확인하세요.",
};

const ITEMS = [
  {
    href: "/salary/civil",
    title: "일반직 공무원 봉급표",
    desc: "9급~3급, 호봉별 기본급",
  },
  {
    href: "/salary/military",
    title: "군인 봉급표",
    desc: "병사 계급별 월급 + 부사관·장교 호봉표",
  },
  {
    href: "/salary/police",
    title: "경찰 봉급표",
    desc: "순경~경감, 31호봉까지",
  },
  {
    href: "/salary/fire",
    title: "소방 봉급표",
    desc: "소방사~소방경, 31호봉까지",
  },
];

export default function Page() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          2026년 봉급표
        </h1>
        <p className="text-sm text-slate-600">
          직종을 선택하면 직급·호봉별 봉급표를 확인할 수 있습니다.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {ITEMS.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="rounded-xl border border-slate-200 bg-white p-5 transition hover:shadow-md"
          >
            <h2 className="font-semibold text-slate-900">{c.title}</h2>
            <p className="mt-1 text-sm text-slate-500">{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
