import Link from "next/link";
import AdSlot from "@/components/AdSlot";

const SALARY = [
  { href: "/salary/civil", title: "일반직 공무원 봉급표", desc: "9급~1급 호봉별 2026년 봉급표" },
  { href: "/salary/military", title: "군인 봉급표", desc: "병사 월급 · 부사관·장교 호봉표" },
  { href: "/salary/police", title: "경찰 봉급표", desc: "순경부터 경감까지" },
  { href: "/salary/fire", title: "소방 봉급표", desc: "소방사부터 소방경까지" },
  { href: "/salary/teacher", title: "교사 봉급표", desc: "유·초·중·고 교원 호봉표" },
] as const;

const CALC_GROUPS = [
  {
    title: "실수령액 계산",
    items: [
      { href: "/calc/civil-net", title: "공무원·경찰·소방 실수령액", desc: "직급·호봉으로 세후 월급" },
      { href: "/calc/military-net", title: "군인 간부 실수령액", desc: "수당 포함 부사관·장교" },
      { href: "/calc/worker-net", title: "직장인 연봉 실수령액", desc: "연봉별 비교 그래프 포함" },
    ],
  },
  {
    title: "정책 적금·지원금",
    items: [
      { href: "/calc/youth-save", title: "청년미래적금", desc: "정부기여금 포함 3년 만기액" },
      { href: "/calc/naeil-save", title: "청년내일저축계좌", desc: "정부지원 월 30만 포함" },
      { href: "/calc/leap-save", title: "청년도약계좌", desc: "기존 가입자 만기 계산" },
      { href: "/calc/soldier-save", title: "장병내일준비적금", desc: "정부 매칭 포함 전역 수령액" },
    ],
  },
  {
    title: "재테크 도구",
    items: [
      { href: "/calc/deposit", title: "적금·예금 이자 계산기", desc: "세후 만기 수령액" },
      { href: "/calc/income-rank", title: "내 연봉 상위 몇 %?", desc: "국세청 통계 기준 순위" },
      { href: "/calc/savings-goal", title: "저축 목표 시뮬레이터", desc: "1억까지 걸리는 기간" },
      { href: "/calc/fire", title: "파이어족 계산기", desc: "조기 은퇴 가능 나이 계산" },
    ],
  },
] as const;

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="space-y-3 pt-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          2026년 봉급표, 표만 보지 말고
          <br />
          <span className="text-blue-700">실수령액까지 계산</span>하세요
        </h1>
        <p className="text-slate-600">
          공무원·군인·경찰·소방·교사 봉급표와 4대보험·세금을 반영한 실수령액
          계산기, 정책 적금 계산기를 무료로 제공합니다.
        </p>
      </section>

      <Link
        href="/rates"
        className="block rounded-xl border border-blue-200 bg-blue-50 p-5 transition hover:shadow-md"
      >
        <p className="text-sm font-semibold text-blue-700">📊 매일 갱신</p>
        <p className="mt-1 font-bold text-slate-900">
          예금·적금 금리 비교 — 오늘 최고금리 보러 가기
        </p>
        <p className="mt-1 text-sm text-slate-500">
          시중·저축·인터넷은행 정기예금·적금 최고금리를 매일 자동 갱신합니다.
        </p>
      </Link>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">봉급표</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {SALARY.map((c) => (
            <Card key={c.href} {...c} />
          ))}
        </div>
      </section>

      <AdSlot id="home-mid" />

      {CALC_GROUPS.map((g) => (
        <section key={g.title} className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">{g.title}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {g.items.map((c) => (
              <Card key={c.href} {...c} accent />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function Card({
  href,
  title,
  desc,
  accent,
}: {
  href: string;
  title: string;
  desc: string;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-xl border p-5 transition hover:shadow-md ${
        accent ? "border-blue-200 bg-blue-50/50" : "border-slate-200 bg-white"
      }`}
    >
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{desc}</p>
    </Link>
  );
}
