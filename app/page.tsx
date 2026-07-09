import Link from "next/link";
import AdSlot from "@/components/AdSlot";

const SALARY = [
  { href: "/salary/civil", title: "일반직 공무원 봉급표", desc: "9급~3급 호봉별 2026년 봉급표" },
  { href: "/salary/military", title: "군인 봉급표", desc: "병사 월급 · 부사관·장교 호봉표" },
  { href: "/salary/police", title: "경찰 봉급표", desc: "순경부터 경감까지" },
  { href: "/salary/fire", title: "소방 봉급표", desc: "소방사부터 소방경까지" },
  { href: "/salary/teacher", title: "교사 봉급표", desc: "유·초·중·고 교원 호봉표" },
] as const;

const CALC = [
  { href: "/calc/civil-net", title: "공무원 실수령액 계산기", desc: "직급·호봉으로 세후 월급 계산" },
  { href: "/calc/military-net", title: "군인 간부 실수령액 계산기", desc: "수당 포함 부사관·장교 실수령액" },
  { href: "/calc/soldier-save", title: "장병내일준비적금 계산기", desc: "정부 매칭 포함 전역 수령액" },
  { href: "/calc/youth-save", title: "청년미래적금 계산기", desc: "정부기여금 포함 3년 만기액" },
  { href: "/calc/naeil-save", title: "청년내일저축계좌 계산기", desc: "정부지원 월 30만 포함 만기액" },
  { href: "/calc/deposit", title: "적금·예금 이자 계산기", desc: "세후 만기 수령액 계산" },
  { href: "/calc/leap-save", title: "청년도약계좌 만기 계산기", desc: "기여금 확대 기준 만기액" },
  { href: "/calc/income-rank", title: "내 연봉 상위 몇 %?", desc: "국세청 통계 기준 연봉 순위" },
  { href: "/calc/worker-net", title: "연봉 실수령액 계산기", desc: "직장인 4대보험·소득세 공제" },
  { href: "/calc/savings-goal", title: "저축 목표 시뮬레이터", desc: "1억 모으기까지 걸리는 기간" },
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
          공무원·군인·경찰·소방 봉급표와 4대보험·세금을 반영한 실수령액
          계산기, 정책 적금 계산기를 무료로 제공합니다.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">봉급표</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {SALARY.map((c) => (
            <Card key={c.href} {...c} />
          ))}
        </div>
      </section>

      <AdSlot id="home-mid" />

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">계산기</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {CALC.map((c) => (
            <Card key={c.href} {...c} accent />
          ))}
        </div>
      </section>
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
