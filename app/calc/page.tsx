import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "계산기 전체 보기",
  description:
    "공무원·군인 실수령액 계산기와 장병내일준비적금·청년미래적금 계산기를 무료로 이용하세요.",
};

const ITEMS = [
  {
    href: "/calc/civil-net",
    title: "공무원 실수령액 계산기",
    desc: "직급·호봉·부양가족·근속연수로 세후 월급 계산",
  },
  {
    href: "/calc/military-net",
    title: "군인 간부 실수령액 계산기",
    desc: "부사관·장교 계급·호봉 + 수당 선택 입력",
  },
  {
    href: "/calc/soldier-save",
    title: "장병내일준비적금 계산기",
    desc: "정부 매칭 100% 포함 전역 시 수령액",
  },
  {
    href: "/calc/youth-save",
    title: "청년미래적금 계산기",
    desc: "정부기여금 6~12% 포함 3년 만기 수령액",
  },
  {
    href: "/calc/naeil-save",
    title: "청년내일저축계좌 계산기",
    desc: "정부지원 월 최대 30만 원 포함 만기액",
  },
  {
    href: "/calc/deposit",
    title: "적금·예금 이자 계산기",
    desc: "세후 만기 수령액, 적금·예금 모두 지원",
  },
  {
    href: "/calc/leap-save",
    title: "청년도약계좌 만기 계산기",
    desc: "기존 가입자용, 기여금 확대 기준 반영",
  },
  {
    href: "/calc/income-rank",
    title: "내 연봉 상위 몇 %?",
    desc: "국세청 통계 기준 연봉 순위 확인",
  },
  {
    href: "/calc/worker-net",
    title: "연봉 실수령액 계산기 (직장인)",
    desc: "4대보험·소득세 공제 + 연봉별 비교 그래프",
  },
  {
    href: "/calc/savings-goal",
    title: "저축 목표 시뮬레이터",
    desc: "월급·지출 입력 → 1억 모으기까지 걸리는 기간",
  },
];

export default function Page() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          계산기
        </h1>
        <p className="text-sm text-slate-600">
          실수령액과 정책 적금 수령액을 계산할 수 있습니다.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {ITEMS.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="rounded-xl border border-blue-200 bg-blue-50/50 p-5 transition hover:shadow-md"
          >
            <h2 className="font-semibold text-slate-900">{c.title}</h2>
            <p className="mt-1 text-sm text-slate-500">{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
