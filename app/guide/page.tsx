import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "가이드",
  description:
    "봉급표 보는 법, 공무원 수당, 정책 적금 가입 조건 등 급여·자산 형성 가이드를 제공합니다.",
};

const PLANNED = [
  {
    title: "2026년 공무원 봉급표 변경점 총정리",
    desc: "인상률, 저연차 추가 인상, 수당 변화까지",
  },
  {
    title: "청년미래적금 가입조건 완벽 정리",
    desc: "일반형 vs 우대형, 소득 요건, 갈아타기",
  },
  {
    title: "공무원 수당 종류 한눈에 보기",
    desc: "정근수당, 직급보조비, 가족수당, 시간외수당",
  },
  {
    title: "군 복무 중 돈 모으기 전략",
    desc: "장병내일준비적금 100% 활용법",
  },
  {
    title: "첫 월급, 세금은 왜 떼일까",
    desc: "4대보험·소득세 공제 구조 이해하기",
  },
];

export default function Page() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          가이드
        </h1>
        <p className="text-sm text-slate-600">
          봉급·수당·정책 적금을 이해하는 데 도움이 되는 글을 준비하고 있습니다.
        </p>
      </header>

      <div className="space-y-3">
        {PLANNED.map((g) => (
          <div
            key={g.title}
            className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5"
          >
            <div>
              <h2 className="font-semibold text-slate-900">{g.title}</h2>
              <p className="mt-1 text-sm text-slate-500">{g.desc}</p>
            </div>
            <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
              준비 중
            </span>
          </div>
        ))}
      </div>

      <p className="text-sm text-slate-500">
        가이드가 준비되는 대로 순차적으로 공개됩니다. 그동안 봉급표와
        계산기를 이용해 주세요.
      </p>
    </div>
  );
}
