import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "계산기 전체 보기",
  description:
    "실수령액 계산기, 정책 적금 계산기, 재테크 도구를 한눈에 보고 이용하세요.",
};

const GROUPS = [
  {
    title: "자영업자 도구",
    desc: "매출·비용으로 사업성 진단",
    items: [
      {
        href: "/calc/business-breakeven",
        title: "손익분기·투자금 회수 계산기",
        desc: "매출·원가·고정비 → 손익분기점, 투자금 회수 기간",
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
      {
        href: "/calc/fire",
        title: "파이어족 계산기",
        desc: "조기 은퇴 가능 나이, 몬테카를로 성공확률",
      },
    ],
  },
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
        href: "/calc/youth-compare",
        title: "청년 정책 적금 비교",
        desc: "4개 상품 + 일반적금 한눈에 비교",
      },
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
];

export default function Page() {
  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-[#1B2A4A] sm:text-3xl">
          계산기
        </h1>
        <p className="text-sm text-[#5B6478]">
          실수령액, 정책 적금, 재테크 도구를 한 곳에서 이용할 수 있습니다.
        </p>
      </header>

      {GROUPS.map((g) => (
        <section key={g.title} className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-[#1B2A4A]">{g.title}</h2>
            <p className="text-sm text-[#7A8296]">{g.desc}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {g.items.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.05)] p-5 transition hover:shadow-md"
              >
                <h3 className="font-semibold text-[#1B2A4A]">{c.title}</h3>
                <p className="mt-1 text-sm text-[#7A8296]">{c.desc}</p>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
