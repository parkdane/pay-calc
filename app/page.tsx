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
    title: "재테크 도구",
    items: [
      { href: "/calc/deposit", title: "적금·예금 이자 계산기", desc: "세후 만기 수령액" },
      { href: "/calc/income-rank", title: "내 연봉 상위 몇 %?", desc: "국세청 통계 기준 순위" },
      { href: "/calc/salary-compare", title: "대기업 평균연봉 비교", desc: "금감원 DART 공시 기준 실제 데이터" },
      { href: "/calc/savings-goal", title: "저축 목표 시뮬레이터", desc: "1억까지 걸리는 기간" },
      { href: "/calc/fire", title: "파이어족 계산기", desc: "조기 은퇴 가능 나이 계산" },
    ],
  },
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
      { href: "/calc/youth-compare", title: "청년 정책 적금 비교", desc: "4개 상품 + 일반적금 한눈에 비교" },
      { href: "/calc/youth-save", title: "청년미래적금", desc: "정부기여금 포함 3년 만기액" },
      { href: "/calc/naeil-save", title: "청년내일저축계좌", desc: "정부지원 월 30만 포함" },
      { href: "/calc/leap-save", title: "청년도약계좌", desc: "기존 가입자 만기 계산" },
      { href: "/calc/soldier-save", title: "장병내일준비적금", desc: "정부 매칭 포함 전역 수령액" },
    ],
  },
] as const;

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="space-y-3 pt-4">
        <h1 className="text-3xl font-bold tracking-tight text-[#1B2A4A]">
          2026년 봉급표, 표만 보지 말고
          <br />
          <span className="text-[#2E4494]">실수령액까지 계산</span>하세요
        </h1>
        <p className="text-[#5B6478]">
          공무원·군인·경찰·소방·교사 봉급표와 4대보험·세금을 반영한 실수령액
          계산기, 정책 적금 계산기를 무료로 제공합니다.
        </p>
      </section>

      <Link
        href="/rates"
        className="block rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.06)] p-5 transition hover:shadow-md"
      >
        <p className="text-sm font-semibold text-[#2E4494]">📊 매일 갱신</p>
        <p className="mt-1 font-bold text-[#1B2A4A]">
          예금·적금 금리 비교 — 오늘 최고금리 보러 가기
        </p>
        <p className="mt-1 text-sm text-[#7A8296]">
          시중·저축·인터넷은행 정기예금·적금 최고금리를 매일 자동 갱신합니다.
        </p>
      </Link>

      {CALC_GROUPS.map((g, i) => (
        <section key={g.title} className="space-y-4">
          <h2 className="text-lg font-bold text-[#1B2A4A]">{g.title}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {g.items.map((c) => (
              <Card key={c.href} {...c} accent />
            ))}
          </div>
          {i === 0 && <AdSlot id="home-mid" />}
        </section>
      ))}

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-[#1B2A4A]">봉급표</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {SALARY.map((c) => (
            <Card key={c.href} {...c} />
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
        accent ? "border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.05)]" : "border-[rgba(46,68,148,0.14)] bg-white"
      }`}
    >
      <h3 className="font-semibold text-[#1B2A4A]">{title}</h3>
      <p className="mt-1 text-sm text-[#7A8296]">{desc}</p>
    </Link>
  );
}
