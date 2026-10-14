import type { Metadata } from "next";
import RetirementAgeCalc from "@/components/RetirementAgeCalc";
import Faq from "@/components/Faq";
import FaqJsonLd from "@/components/FaqJsonLd";
import Link from "next/link";
import { calcRetirementDate, type JobCategory } from "@/lib/retirementAgeCalc";
import { calcSeverance } from "@/lib/severance";

export const metadata: Metadata = {
  title: "교사·공무원 정년퇴직일 계산기 (교사 62세·공무원 60세)",
  description:
    "교사 정년은 만 62세(대학교원 65세), 일반직 공무원은 만 60세입니다. 생년월일을 입력하면 교육공무원법·국가공무원법 기준 정년퇴직일과 퇴직수당·연금 예상액까지 계산합니다.",
  openGraph: {
    title: "교사·공무원 정년퇴직일 계산기 (교사 62세·공무원 60세)",
    description:
      "교사 정년 만 62세, 공무원 만 60세. 생년월일로 정년퇴직일과 퇴직수당·연금 예상액을 계산합니다.",
  },
};

// ── 예시 표: 계산 로직(lib)으로 생성해서 계산기와 항상 같은 값이 나오도록 함 ──
const fmt = (d: Date) => `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
type Example = { label: string; category: JobCategory; y: number; m: number; d: number };
const EXAMPLES: Example[] = [
  { label: "초·중·고 교원", category: "teacher-school", y: 1965, m: 1, d: 20 },
  { label: "초·중·고 교원", category: "teacher-school", y: 1965, m: 5, d: 10 },
  { label: "초·중·고 교원", category: "teacher-school", y: 1965, m: 10, d: 15 },
  { label: "일반직 공무원", category: "general-civil", y: 1967, m: 3, d: 10 },
  { label: "일반직 공무원", category: "general-civil", y: 1967, m: 8, d: 5 },
];
const exampleRows = EXAMPLES.map((e) => {
  const r = calcRetirementDate(e.y, e.m, e.d, e.category);
  return {
    label: e.label,
    birth: `${e.y}년 ${e.m}월 ${e.d}일`,
    age: r.retirementAge,
    reach: fmt(r.reachDate),
    retire: fmt(r.retirementDate),
  };
});
const t1965 = [1, 5, 10].map((m) => fmt(calcRetirementDate(1965, m, 15, "teacher-school").retirementDate));
const sevExample = calcSeverance(4_500_000, 30);

const FAQ = [
  {
    q: "교사 정년은 몇 세인가요?",
    a: "초·중·고등학교 교원은 교육공무원법 제47조에 따라 만 62세이며, 대학교원(고등교육법 제14조)은 만 65세입니다. 일반직 공무원(만 60세)보다 깁니다.",
  },
  {
    q: "정년퇴직일이 생일이 아닌 이유는 무엇인가요?",
    a: "학기 중간에 교사가 바뀌면 수업 운영에 지장이 생기기 때문에, 교육공무원법은 학기 단위로 퇴직일을 맞춥니다. 정년(62세 또는 65세)에 이른 날이 3~8월(1학기)이면 8월 31일에, 9월~다음 해 2월(2학기)이면 다음 해 2월 말일에 퇴직합니다.",
  },
  {
    q: "일반직 공무원도 같은 방식인가요?",
    a: "아닙니다. 일반직 공무원은 국가공무원법 제74조에 따라 정년(만 60세)에 이른 날이 1~6월이면 그해 6월 30일에, 7~12월이면 그해 12월 31일에 퇴직합니다. 학기 개념이 없어 상하반기 기준입니다.",
  },
  {
    q: "사립학교 교원도 정년이 같나요?",
    a: "네. 사립학교법이 국공립 교육공무원의 정년 규정을 준용하므로, 사립학교 교원도 초·중·고는 62세, 대학은 65세로 동일하게 적용됩니다.",
  },
  {
    q: "1965년생 교사의 정년퇴직일은 언제인가요?",
    a: `만 62세가 되는 해는 2027년이고, 생일에 따라 퇴직일이 갈립니다. 1~2월생은 2027년 2월 28일, 3~8월생은 2027년 8월 31일, 9~12월생은 2028년 2월 29일(윤년)에 정년퇴직합니다. 예를 들어 1965년 1월 15일생은 ${t1965[0]}, 5월 15일생은 ${t1965[1]}, 10월 15일생은 ${t1965[2]}입니다.`,
  },
  {
    q: "교사 퇴직 나이는 몇 살인가요? 62세 생일에 바로 퇴직하나요?",
    a: "법정 정년은 만 62세지만 퇴직일은 생일이 아니라 학기 말입니다. 만 62세가 되는 날이 3~8월이면 그해 8월 31일, 9월~다음 해 2월이면 다음 해 2월 말일에 퇴직합니다. 그래서 같은 해에 태어나도 생일에 따라 최대 6개월 가까이 퇴직 시점이 달라집니다.",
  },
  {
    q: "정년퇴직하면 퇴직수당은 얼마나 받나요?",
    a: `퇴직수당은 기준소득월액 × 재직연수(최대 33년) × 재직기간별 지급율(20년 이상 39%)로 계산합니다. 예를 들어 기준소득월액 450만 원, 재직 30년이면 450만 원 × 30년 × 39% = ${Math.round(sevExample.total).toLocaleString("ko-KR")}원입니다. 이 페이지 계산기에서 임용일과 호봉을 넣으면 정년퇴직일 기준으로 자동 계산합니다.`,
  },
  {
    q: "정년퇴직하면 연금은 언제부터 받나요?",
    a: "재직 10년 이상이면 퇴직연금을 받고, 시작 시점은 임용 시기와 퇴직연도에 따라 다릅니다. 1996~2009년에 임용된 공무원은 2024~2026년 퇴직 시 62세, 2027~2029년 63세, 2030~2032년 64세, 2033년 이후 65세부터 받습니다(공무원연금공단 안내). 개시연령보다 일찍 받으려면 조기퇴직연금을 신청할 수 있고, 1년당 5%씩 최대 25%까지 감액됩니다. 정년이 62세인 교사는 2033년 이후 퇴직하면 연금 개시까지 3년을 기다려야 하므로 소득 공백을 미리 계획해야 합니다.",
  },
  {
    q: "경찰·소방·군인의 정년은 왜 이 계산기에 없나요?",
    a: "경찰공무원과 소방공무원은 계급별로 57~60세까지 정년이 다르고(경찰공무원법·소방공무원법), 군인은 계급정년(같은 계급으로 일정 기간 이상 근무하면 그 계급의 정년 연령이 되기 전이라도 전역하는 제도)까지 겹쳐 있어 나이만으로 계산하기 어렵습니다. 이 계산기는 나이 기준이 명확한 교원·일반직 공무원만 다룹니다.",
  },
];

export default function Page() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-[#1B2A4A] sm:text-3xl">
          교사·공무원 정년퇴직일 계산기
        </h1>
        <p className="text-sm text-[#5B6478]">
          생년월일과 직군을 입력하면 교육공무원법·국가공무원법 기준 정년퇴직일을 계산하고, 임용일과 호봉을
          넣으면 퇴직수당·연금 예상액까지 보여줍니다.
        </p>
        <div className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-4 text-sm leading-relaxed text-[#1B2A4A]">
          <p className="font-semibold">한눈에 보는 정년</p>
          <p className="mt-1 text-[#5B6478]">
            초·중·고 교사 <b className="text-[#1B2A4A]">만 62세</b> · 대학교원 <b className="text-[#1B2A4A]">만 65세</b> ·
            일반직 공무원 <b className="text-[#1B2A4A]">만 60세</b>. 다만 퇴직일은 생일이 아니라 교원은 8월 31일·2월 말일,
            일반직은 6월 30일·12월 31일입니다.
          </p>
        </div>
      </header>

      <div className="mx-[calc(50%-50vw)] w-screen">
        <RetirementAgeCalc />
      </div>

      <section className="space-y-3 text-sm leading-relaxed text-[#5B6478]">
        <h2 className="text-xl font-bold text-[#1B2A4A]">직군별 정년과 퇴직일 규칙</h2>
        <div className="overflow-x-auto rounded-xl border border-[rgba(46,68,148,0.14)]">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-[#F5F6FA] text-xs text-[#7A8296]">
              <tr>
                <th className="px-4 py-2 text-left font-medium">직군</th>
                <th className="px-4 py-2 text-left font-medium">정년</th>
                <th className="px-4 py-2 text-left font-medium">퇴직일 규칙</th>
                <th className="px-4 py-2 text-left font-medium">근거</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(46,68,148,0.08)] bg-white text-[#1B2A4A]">
              <tr>
                <td className="px-4 py-2">초·중·고 교원</td>
                <td className="px-4 py-2">만 62세</td>
                <td className="px-4 py-2">3~8월 도달 → 8/31, 9월~익년 2월 도달 → 익년 2월 말일</td>
                <td className="px-4 py-2">교육공무원법 제47조</td>
              </tr>
              <tr>
                <td className="px-4 py-2">대학교원</td>
                <td className="px-4 py-2">만 65세</td>
                <td className="px-4 py-2">교원과 동일(학기 단위)</td>
                <td className="px-4 py-2">교육공무원법·고등교육법</td>
              </tr>
              <tr>
                <td className="px-4 py-2">일반직 공무원</td>
                <td className="px-4 py-2">만 60세</td>
                <td className="px-4 py-2">1~6월 도달 → 6/30, 7~12월 도달 → 12/31</td>
                <td className="px-4 py-2">국가공무원법 제74조</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3 text-sm leading-relaxed text-[#5B6478]">
        <h2 className="text-xl font-bold text-[#1B2A4A]">생일별 정년퇴직일 예시</h2>
        <p>
          같은 해에 태어나도 생일이 어느 시기냐에 따라 퇴직일이 달라집니다. 아래 값은 위 계산기와 같은
          로직으로 계산한 결과입니다.
        </p>
        <div className="overflow-x-auto rounded-xl border border-[rgba(46,68,148,0.14)]">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-[#F5F6FA] text-xs text-[#7A8296]">
              <tr>
                <th className="px-4 py-2 text-left font-medium">직군</th>
                <th className="px-4 py-2 text-left font-medium">생년월일</th>
                <th className="px-4 py-2 text-left font-medium">정년 도달일</th>
                <th className="px-4 py-2 text-left font-medium">정년퇴직일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(46,68,148,0.08)] bg-white text-[#1B2A4A]">
              {exampleRows.map((r) => (
                <tr key={r.label + r.birth}>
                  <td className="px-4 py-2">{r.label}</td>
                  <td className="px-4 py-2">{r.birth}</td>
                  <td className="px-4 py-2">
                    {r.reach} (만 {r.age}세)
                  </td>
                  <td className="px-4 py-2 font-semibold">{r.retire}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3 text-sm leading-relaxed text-[#5B6478]">
        <h2 className="text-xl font-bold text-[#1B2A4A]">정년퇴직 후 받는 돈</h2>
        <p>
          정년퇴직하면 퇴직수당을 한 번에 받고, 재직 10년 이상이면 퇴직연금을 매달 받습니다. 연금은
          퇴직연도별 개시연령(1996~2009년 임용자 기준 2024~2026년 62세 → 2033년 이후 65세)부터 시작하고, 그보다
          일찍 받으면 1년당 5%씩 감액됩니다. 위 계산기에 임용일과 현재 호봉을 넣으면 정년퇴직일 기준으로 두
          금액을 함께 보여줍니다. 연금을 3단계 구간별로 자세히 보려면{" "}
          <Link href="/calc/pension-net?occ=teacher" className="text-[#2E4494] underline">
            공무원연금 예상수령액 계산기
          </Link>
          , 퇴직수당만 직접 넣어 계산하려면{" "}
          <Link href="/calc/severance-pay" className="text-[#2E4494] underline">
            재직기간·퇴직수당 계산기
          </Link>
          를 이용하세요. 평소 실수령액은{" "}
          <Link href="/calc/teacher-net" className="text-[#2E4494] underline">
            교원 실수령액 계산기
          </Link>
          에서 확인할 수 있습니다.
        </p>
      </section>

      <Faq items={FAQ} />
      <FaqJsonLd items={FAQ} />

      <div className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-4 text-sm">
        <Link href="/guide/retirement-age-guide" className="font-medium text-[#2E4494] underline">
          학기제 퇴직일 규칙과 연금 개시연령 자세히 보기 →
        </Link>
      </div>
    </div>
  );
}
