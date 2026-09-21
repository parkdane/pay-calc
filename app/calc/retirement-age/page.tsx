import type { Metadata } from "next";
import RetirementAgeCalc from "@/components/RetirementAgeCalc";
import Faq from "@/components/Faq";
import FaqJsonLd from "@/components/FaqJsonLd";
import Link from "next/link";

export const metadata: Metadata = {
  title: "정년퇴직일 계산기 (교사·공무원, 2026년 기준)",
  description:
    "생년월일과 직군을 입력하면 교육공무원법·국가공무원법 기준 정년퇴직일을 계산합니다. 초·중·고 교원(62세), 대학교원(65세), 일반직 공무원(60세)을 반영합니다.",
  openGraph: {
    title: "정년퇴직일 계산기 (교사·공무원, 2026년 기준)",
    description:
      "생년월일과 직군을 입력하면 교육공무원법·국가공무원법 기준 정년퇴직일을 계산합니다.",
  },
};

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
    q: "경찰·소방·군인의 정년은 왜 이 계산기에 없나요?",
    a: "경찰공무원과 소방공무원은 계급별로 57~60세까지 정년이 다르고(경찰공무원법·소방공무원법), 군인은 계급정년(같은 계급으로 일정 기간 이상 근무하면 그 계급의 정년 연령이 되기 전이라도 전역하는 제도)까지 겹쳐 있어 나이만으로 계산하기 어렵습니다. 이 계산기는 나이 기준이 명확한 교원·일반직 공무원만 다룹니다.",
  },
];

export default function Page() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-[#1B2A4A] sm:text-3xl">
          정년퇴직일 계산기
        </h1>
        <p className="text-sm text-[#5B6478]">
          생년월일과 직군을 입력하면 교육공무원법·국가공무원법 기준 정년퇴직일을 계산합니다.
        </p>
      </header>

      <div className="mx-[calc(50%-50vw)] w-screen">
        <RetirementAgeCalc />
      </div>

      <section className="space-y-3 text-sm leading-relaxed text-[#5B6478]">
        <h2 className="text-xl font-bold text-[#1B2A4A]">퇴직 후 연금·수당도 함께 확인하세요</h2>
        <p>
          정년퇴직 후 예상연금이 궁금하다면{" "}
          <Link href="/calc/pension-net" className="text-[#2E4494] underline">
            공무원연금 예상수령액 계산기
          </Link>
          에서, 퇴직수당은{" "}
          <Link href="/calc/severance-pay" className="text-[#2E4494] underline">
            퇴직수당 계산기
          </Link>
          에서 확인하세요. 평소 실수령액은{" "}
          <Link href="/calc/teacher-net" className="text-[#2E4494] underline">
            교원 실수령액 계산기
          </Link>
          에서 확인 가능합니다.
        </p>
      </section>

      <Faq items={FAQ} />
      <FaqJsonLd items={FAQ} />

      <div className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-4 text-sm">
        <Link href="/guide/retirement-age-guide" className="font-medium text-[#2E4494] underline">
          학기제 퇴직일 규칙을 자세히 보기 →
        </Link>
      </div>
    </div>
  );
}
