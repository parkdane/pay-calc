import type { Metadata } from "next";
import RetirementAgeCalc from "@/components/RetirementAgeCalc";
import Faq from "@/components/Faq";
import FaqJsonLd from "@/components/FaqJsonLd";
import SourceNote from "@/components/SourceNote";
import Link from "next/link";
import SimpleTable from "@/components/SimpleTable";
import { calcRetirementDate, type JobCategory } from "@/lib/retirementAgeCalc";
import { calcSeverance } from "@/lib/severance";
import { estimateEligibleAge } from "@/lib/pensionCalc";

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

// ── 표: 계산 로직(lib)으로 생성해서 계산기와 항상 같은 값이 나오도록 함 ──
const fmt = (d: Date) => `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
const short = (d: Date) => `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
const retire = (y: number, m: number, c: JobCategory) => calcRetirementDate(y, m, 15, c).retirementDate;
// 앞으로 정년이 돌아오는 연도 위주(올해 정년 도달자부터 10년치)
const THIS_YEAR = new Date().getFullYear();
const TEACHER_YEARS = Array.from({ length: 10 }, (_, i) => THIS_YEAR - 62 + i);
const CIVIL_YEARS = Array.from({ length: 10 }, (_, i) => THIS_YEAR - 60 + i);
const teacherRows = TEACHER_YEARS.map((y) => [
  String(y),
  short(retire(y, 1, "teacher-school")),
  short(retire(y, 3, "teacher-school")),
  short(retire(y, 9, "teacher-school")),
]);
const civilRows = CIVIL_YEARS.map((y) => [
  String(y),
  short(retire(y, 1, "general-civil")),
  short(retire(y, 7, "general-civil")),
]);
// 연금 개시연령(1996~2009년 임용자): 퇴직연도별. 교사(정년 62세) 기준 대기 기간
const GAP_BANDS: [string, number][] = [
  ["2024~2026년", 2025],
  ["2027~2029년", 2028],
  ["2030~2032년", 2031],
  ["2033년 이후", 2034],
];
const gapRows = GAP_BANDS.map(([label, y]) => {
  const age = estimateEligibleAge("2000-03-01", `${y}-08-31`);
  return [label, `만 ${age}세`, age <= 62 ? "없음" : `약 ${age - 62}년`];
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
    a: "법으로 정해진 것은 국공립 교원(교육공무원)의 정년입니다. 사립학교 교원의 정년은 학교법인 정관(사인이 운영하는 유치원은 유치원 규칙)으로 정하며, 교육공무원법 제47조가 그대로 준용되지는 않습니다(법제처 법령해석 10-0372). 국공립과 같은 기준을 두는 학교가 많지만 학교마다 다를 수 있으니 소속 학교의 정관을 확인해야 합니다. 이 계산기는 국공립 기준으로 계산합니다.",
  },
  {
    q: "3월 1일생 교사는 2월 말에 퇴직하나요, 8월 31일에 퇴직하나요?",
    a: "8월 31일입니다. 정년은 법정 나이에 도달하는 생일 당일에 이르므로, 3월 1일생의 정년에 이른 날은 3월 1일이고 3~8월 사이에 해당해 그해 8월 31일에 퇴직합니다. 3월 1일이 공휴일이거나 새 학기가 3월 2일에 시작한다는 사정으로 달라지지 않는다는 것이 법제처 해석입니다(법령해석 12-0189). 같은 원리로 9월 1일생은 다음 해 2월 말일에 퇴직합니다.",
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
    a: `퇴직수당은 기준소득월액 × 재직연수(최대 33년) × 재직기간별 지급률(20년 이상 39%)로 계산합니다. 예를 들어 기준소득월액 450만 원, 재직 30년이면 450만 원 × 30년 × 39% = ${Math.round(sevExample.total).toLocaleString("ko-KR")}원입니다. 이 페이지 계산기에서 임용일과 호봉을 넣으면 정년퇴직일 기준으로 자동 계산합니다.`,
  },
  {
    q: "정년퇴직하면 연금은 언제부터 받나요?",
    a: "재직 10년 이상이면 퇴직연금을 받고, 시작 시점은 임용 시기와 퇴직연도에 따라 다릅니다. 1996~2009년에 임용된 공무원은 2024~2026년 퇴직 시 62세, 2027~2029년 63세, 2030~2032년 64세, 2033년 이후 65세부터 받습니다(공무원연금공단 안내). 2010년 이후 임용자는 퇴직연도와 관계없이 65세, 1995년 이전 임용자는 60세입니다. 개시연령보다 일찍 받으려면 조기퇴직연금을 신청할 수 있고, 1년당 5%씩 최대 25%까지 감액됩니다. 정년이 62세인 교사는 2033년 이후 퇴직하면 연금 개시까지 3년을 기다려야 하므로 소득 공백을 미리 계획해야 합니다.",
  },
  {
    q: "경찰·소방·군인의 정년은 왜 이 계산기에 없나요?",
    a: "경찰공무원과 소방공무원은 계급별로 57~60세까지 정년이 다르고(경찰공무원법·소방공무원법), 군인은 계급정년(같은 계급으로 일정 기간 이상 근무하면 그 계급의 정년 연령이 되기 전이라도 전역하는 제도)까지 겹쳐 있어 나이만으로 계산하기 어렵습니다. 이 계산기는 나이 기준이 명확한 교원·일반직 공무원만 다룹니다.",
  },
];

// 모바일(약 360px)에서도 가로 스크롤 없이 한 화면에 들어가도록 여백을 줄인 날짜 표
function DateTable({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[rgba(46,68,148,0.14)]">
      <table className="w-full text-sm tabular-nums">
        <thead className="bg-[#F5F6FA] text-xs text-[#7A8296]">
          <tr>
            {head.map((h) => (
              <th key={h} className="px-2 py-2 text-center font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[rgba(46,68,148,0.08)] bg-white text-[#1B2A4A]">
          {rows.map((r) => (
            <tr key={r[0]}>
              {r.map((c, i) => (
                <td key={i} className={`whitespace-nowrap px-2 py-2 text-center ${i === 0 ? "font-semibold" : ""}`}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

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
        <h2 className="text-xl font-bold text-[#1B2A4A]">출생연도별 교사 정년퇴직일</h2>
        <p>초·중·고 교원(만 62세) 기준입니다. 생일이 속한 구간의 날짜가 퇴직일입니다.</p>
        <DateTable head={["출생연도", "1~2월생", "3~8월생", "9~12월생"]} rows={teacherRows} />
        <details className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-white p-4">
          <summary className="cursor-pointer font-medium text-[#1B2A4A]">일반직 공무원(만 60세) 퇴직일 보기</summary>
          <div className="mt-3">
            <DateTable head={["출생연도", "1~6월생", "7~12월생"]} rows={civilRows} />
          </div>
        </details>
        <p className="rounded-xl bg-[rgba(46,68,148,0.04)] p-3 text-xs leading-relaxed">
          <b className="text-[#1B2A4A]">정년 65세 연장은?</b> 정부·국회가 법정 정년 연장을 논의 중이지만 2026년 11월
          중순 기준 국회를 통과한 법은 없고, 공무원·교원 적용 여부도 정해지지 않았습니다. 이 표와 계산기는 현행
          교육공무원법·국가공무원법 기준이며, 법이 바뀌면 바로 반영합니다.
        </p>
      </section>

      <section className="space-y-3 text-sm leading-relaxed text-[#5B6478]">
        <h2 className="text-xl font-bold text-[#1B2A4A]">정년퇴직 후 연금은 언제부터?</h2>
        <p>
          1996~2009년 임용자는 퇴직연도에 따라 연금 개시연령이 다르고, 정년이 62세인 교사는 그 사이에 소득이 없는
          기간이 생길 수 있습니다.
        </p>
        <SimpleTable head={["퇴직연도", "연금 개시", "교사 대기 기간"]} rows={gapRows} minWidth={300} />
        <p className="text-xs leading-relaxed text-[#8B93A6]">
          2010년 이후 임용자는 65세, 1995년 이전 임용자는 60세부터입니다. 일찍 받으면 1년당 5%씩(최대 25%)
          감액됩니다. 금액은{" "}
          <Link href="/calc/pension-net?occ=teacher" className="text-[#2E4494] underline">
            공무원연금 계산기
          </Link>
          , 퇴직수당은{" "}
          <Link href="/calc/severance-pay" className="text-[#2E4494] underline">
            퇴직수당 계산기
          </Link>
          에서 확인할 수 있습니다.
        </p>
      </section>

      <details className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-white p-4 text-sm leading-relaxed text-[#5B6478]">
        <summary className="cursor-pointer font-medium text-[#1B2A4A]">직군별 정년 규칙과 법령 근거</summary>
        <ul className="mt-3 space-y-2">
          <li>
            <b className="text-[#1B2A4A]">초·중·고 교원 만 62세</b>: 3~8월 도달 → 8월 31일, 9월~다음 해 2월 도달 → 다음 해
            2월 말일(교육공무원법 제47조)
          </li>
          <li>
            <b className="text-[#1B2A4A]">대학교원 만 65세</b>: 교원과 같은 학기 단위(교육공무원법·고등교육법)
          </li>
          <li>
            <b className="text-[#1B2A4A]">일반직 공무원 만 60세</b>: 1~6월 도달 → 6월 30일, 7~12월 도달 → 12월
            31일(국가공무원법 제74조)
          </li>
        </ul>
      </details>

      <SourceNote slug="retirement-age" />

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
