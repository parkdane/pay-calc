import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "계산기 전체 보기",
  description:
    "실수령액 계산기, 정책 적금 계산기, 재테크 도구를 한눈에 보고 이용하세요.",
};

const GROUPS = [
  {
    title: "실수령액 계산",
    desc: "직업·연봉별 세후 월급",
    items: [
      {
        href: "/calc/civil-net",
        title: "공무원·경찰·소방 실수령액",
        desc: "직급·호봉 + 가족·근속·시간외 반영",
      },
      {
        href: "/calc/military-net",
        title: "군인 간부 실수령액",
        desc: "부사관·장교 계급·호봉 + 수당 선택",
      },
      {
        href: "/calc/worker-net",
        title: "직장인 연봉 실수령액",
        desc: "4대보험·소득세 공제 + 연봉별 비교 그래프",
      },
    ],
  },
  {
    title: "정책 적금·지원금",
    desc: "정부가 돈을 얹어주는 상품",
    items: [
      {
        href: "/calc/youth-save",
        title: "청년미래적금",
        desc: "기여금 6~12% + 비과세, 3년 만기",
      },
      {
        href: "/calc/naeil-save",
        title: "청년내일저축계좌",
        desc: "정부지원 월 최대 30만 원, 3년",
      },
      {
        href: "/calc/leap-save",
        title: "청년도약계좌 (기존 가입자)",
        desc: "기여금 확대 기준 5년 만기액",
      },
      {
        href: "/calc/soldier-save",
        title: "장병내일준비적금",
        desc: "정부 매칭 100%, 전역 시 수령액",
      },
    ],
  },
  {
    title: "재테크 도구",
    desc: "저축·자산 계획",
    items: [
      {
        href: "/calc/deposit",
        title: "적금·예금 이자 계산기",
        desc: "세후 만기 수령액 (15.4% 반영)",
      },
      {
        href: "/calc/income-rank",
        title: "내 연봉 상위 몇 %?",
        desc: "국세청 통계 기준 연봉 순위",
      },
      {
        href: "/calc/salary-compare",
        title: "대기업 평균연봉 비교",
        desc: "금감원 DART 공시 기준 실제 데이터",
      },
      {
        href: "/calc/savings-goal",
        title: "저축 목표 시뮬레이터",
        desc: "월급·지출 입력 → 1억까지 걸리는 기간",
      },
    ],
  },
];

export default function Page() {
  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          계산기
        </h1>
        <p className="text-sm text-slate-600">
          실수령액, 정책 적금, 재테크 도구를 한 곳에서 이용할 수 있습니다.
        </p>
      </header>

      {GROUPS.map((g) => (
        <section key={g.title} className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{g.title}</h2>
            <p className="text-sm text-slate-500">{g.desc}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {g.items.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className="rounded-xl border border-[#BFC8EA] bg-[#EEF0FA]/50 p-5 transition hover:shadow-md"
              >
                <h3 className="font-semibold text-slate-900">{c.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{c.desc}</p>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
