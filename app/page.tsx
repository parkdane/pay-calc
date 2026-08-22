import Link from "next/link";
import AdSlot from "@/components/AdSlot";
import { GUIDES } from "@/data/guides";

const SALARY = [
  { href: "/salary/civil", title: "일반직 공무원 봉급표", desc: "9급~1급 호봉별 2026년 봉급표" },
  { href: "/salary/military", title: "군인 봉급표", desc: "병사 월급 · 부사관·장교 호봉표" },
  { href: "/salary/police", title: "경찰 봉급표", desc: "순경부터 경감까지" },
  { href: "/salary/fire", title: "소방 봉급표", desc: "소방사부터 소방경까지" },
  { href: "/salary/teacher", title: "교사 봉급표", desc: "유·초·중·고 교원 호봉표" },
] as const;

// 홈에는 자주 찾는 계산기만 촘촘하게 보여주고, 나머지는 /calc(검색 가능)에서 찾도록 유도
const POPULAR_CALCS = [
  { href: "/calc/civil-net", title: "공무원·경찰·소방 실수령액", desc: "직급·호봉 + 가족·근속·시간외 반영" },
  { href: "/calc/military-net", title: "군인 간부 실수령액", desc: "부사관·장교 계급·호봉 + 수당 선택" },
  { href: "/calc/teacher-net", title: "교사 실수령액", desc: "교원 호봉 + 교직수당·담임수당 반영" },
  { href: "/calc/pension-net", title: "공무원연금 예상수령액 계산기", desc: "실제 봉급표(1997~2026) 기반, 직군별 산식 반영" },
  { href: "/calc/fire", title: "파이어족 계산기", desc: "조기 은퇴 가능 나이, 몬테카를로 성공확률" },
  { href: "/calc/youth-compare", title: "청년 정책 적금 비교", desc: "4개 상품 + 일반적금 한눈에 비교" },
  { href: "/calc/overtime-pay", title: "시간외수당 계산기", desc: "직급·계급별 초과근무 시간당 단가" },
  { href: "/calc/severance-pay", title: "퇴직수당 계산기", desc: "재직기간별 지급율(6.5~39%) 반영" },
] as const;

// 최신순으로 정렬해 상위 8개만 홈에 노출 (data/guides.ts에서 자동으로 가져옴 -> 새 가이드 추가해도 홈은 자동 반영됨)
const RECENT_GUIDES = [...GUIDES]
  .sort((a, b) => (a.date > b.date ? -1 : 1))
  .slice(0, 8);

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

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#1B2A4A]">많이 찾는 계산기</h2>
          <Link href="/calc" className="text-sm font-medium text-[#2E4494] hover:underline">
            전체 계산기 보기 →
          </Link>
        </div>
        <div className="overflow-hidden rounded-xl border border-[rgba(46,68,148,0.14)] bg-white">
          {POPULAR_CALCS.map((c, i) => (
            <Link
              key={c.href}
              href={c.href}
              className={`flex items-center justify-between gap-4 px-4 py-3.5 transition hover:bg-[rgba(46,68,148,0.04)] ${
                i !== 0 ? "border-t border-[rgba(46,68,148,0.10)]" : ""
              }`}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#1B2A4A]">{c.title}</p>
                <p className="truncate text-xs text-[#8B93A6]">{c.desc}</p>
              </div>
              <span className="shrink-0 text-[#8B93A6]">→</span>
            </Link>
          ))}
        </div>
        <AdSlot id="home-mid" />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-[#1B2A4A]">봉급표</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {SALARY.map((c) => (
            <Card key={c.href} {...c} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#1B2A4A]">가이드</h2>
          <Link href="/guide" className="text-sm font-medium text-[#2E4494] hover:underline">
            전체 보기 →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {RECENT_GUIDES.map((g) => (
            <Card key={g.slug} href={`/guide/${g.slug}`} title={g.title} desc={g.desc} />
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
