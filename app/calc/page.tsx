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
