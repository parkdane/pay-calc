import Link from "next/link";

const CARDS = [
  {
    href: "/salary/civil",
    title: "일반직 공무원 봉급표",
    desc: "직급 × 호봉별 2026년 봉급표",
  },
  {
    href: "/salary/military",
    title: "군인 봉급표",
    desc: "병사 월급 · 간부 호봉별 봉급",
  },
  {
    href: "/salary/police",
    title: "경찰 봉급표",
    desc: "순경부터 치안총감까지",
  },
  {
    href: "/salary/fire",
    title: "소방 봉급표",
    desc: "소방사부터 소방총감까지",
  },
  {
    href: "/calc/civil-net",
    title: "공무원 실수령액 계산기",
    desc: "직급·호봉 입력하면 세후 월급 계산",
    accent: true,
  },
] as const;

export default function Home() {
  return (
    <div className="space-y-10">
      <section className="space-y-3 pt-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          2026년 봉급표, 표만 보지 말고
          <br />
          <span className="text-blue-700">실수령액까지 계산</span>하세요
        </h1>
        <p className="text-slate-600">
          공무원·군인·경찰·소방 봉급표와 4대보험·세금을 반영한 실수령액
          계산기를 무료로 제공합니다.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {CARDS.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className={`rounded-xl border p-5 transition hover:shadow-md ${
              "accent" in c && c.accent
                ? "border-blue-700 bg-blue-50"
                : "border-slate-200 bg-white"
            }`}
          >
            <h2 className="font-semibold text-slate-900">{c.title}</h2>
            <p className="mt-1 text-sm text-slate-500">{c.desc}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
