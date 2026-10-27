import type { Metadata } from "next";
import MaternityLeaveCalc from "@/components/MaternityLeaveCalc";
import Faq from "@/components/Faq";
import FaqJsonLd from "@/components/FaqJsonLd";
import SourceNote from "@/components/SourceNote";
import SimpleTable from "@/components/SimpleTable";
import Link from "next/link";
import {
  calcMaternityLeavePay,
  MONTHLY_CAP,
  MIN_HOURLY_WAGE,
  STANDARD_MONTHLY_HOURS,
} from "@/lib/maternityLeaveCalc";

export const metadata: Metadata = {
  title: "출산전후휴가급여 계산기 (2026년 기준)",
  description:
    "월 통상임금과 회사 규모를 입력하면 2026년 기준 출산전후휴가급여를 계산합니다. 우선지원대상기업·대규모기업, 다태아 여부를 반영합니다.",
  openGraph: {
    title: "출산전후휴가급여 계산기 (2026년 기준)",
    description:
      "월 통상임금과 회사 규모를 입력하면 2026년 기준 출산전후휴가급여를 계산합니다.",
  },
};

const won = (n: number) => Math.round(n).toLocaleString("ko-KR") + "원";
const man = (n: number) => (n / 10000).toLocaleString("ko-KR") + "만 원";

// 예시표: 월 통상임금(만 원)별, 단태아 기준
const WAGES = [200, 250, 300, 400, 500];
const ex = (w: number, size: "priority" | "large", multi = false) => calcMaternityLeavePay(w, size, multi);
const floorMonthly = MIN_HOURLY_WAGE * STANDARD_MONTHLY_HOURS;

const PRIORITY_ROWS = WAGES.map((w) => {
  const r = ex(w, "priority");
  return [`월 ${w}만 원`, won(r.govPaidAmount), r.companyPaidAmount > 0 ? won(r.companyPaidAmount) : "없음", won(r.totalAmount)];
});
const LARGE_ROWS = WAGES.map((w) => {
  const r = ex(w, "large");
  return [`월 ${w}만 원`, won(r.companyPaidAmount), won(r.govPaidAmount), won(r.totalAmount)];
});
const MULTI_ROWS = [250, 300, 400].map((w) => {
  const p = ex(w, "priority", true);
  const l = ex(w, "large", true);
  return [`월 ${w}만 원`, won(p.totalAmount), won(l.totalAmount)];
});

// 본문 계산 예시: 우선지원대상기업, 월 300만 원
const E = ex(300, "priority");
const E_LARGE = ex(300, "large");

const FAQ = [
  {
    q: "출산전후휴가급여는 어떻게 계산되나요?",
    a: `출산전후휴가 90일(다태아 120일) 동안 고용보험이 통상임금에 상당하는 금액을 지급하되, 2026년 기준 월 ${man(MONTHLY_CAP)} 상한액(90일 총액 ${man(MONTHLY_CAP * 3)})이 적용됩니다. 시간급 통상임금이 시간급 최저임금(${MIN_HOURLY_WAGE.toLocaleString("ko-KR")}원)보다 낮으면 최저임금 기준으로 계산합니다. 최초 60일(다태아 75일)은 근로기준법상 유급휴가라 상한을 넘는 부분은 회사가 지급합니다.`,
  },
  {
    q: "회사가 주는 건가요, 정부가 주는 건가요?",
    a: "회사 규모에 따라 다릅니다. 우선지원대상기업(중소기업 등)은 휴가기간 전체를 고용보험(고용센터)이 지급하고, 최초 60일(다태아 75일)은 통상임금이 고용보험 지급액보다 많으면 그 차액을 회사가 지급합니다. 대규모기업(대기업)은 최초 60일(다태아 75일)은 회사가 통상임금 100%를 상한 없이 직접 지급하고, 나머지 30일(다태아 45일)만 고용보험이 상한액 이내로 지급합니다.",
  },
  {
    q: "월급이 상한액보다 많으면 초과분은 못 받나요?",
    a: `최초 60일(다태아 75일)은 받습니다. 이 기간은 근로기준법 제74조에 따른 유급휴가라 회사 규모와 관계없이 통상임금 100%가 보장되고, 고용보험이 지급한 금액은 그 한도에서 회사가 지급한 것으로 봅니다. 상한(월 ${man(MONTHLY_CAP)})을 넘는 부분을 못 받는 것은 마지막 30일(다태아 45일)뿐입니다. 예를 들어 월 통상임금 300만 원이면 우선지원대상기업 기준 회사 차액이 ${won(E.companyPaidAmount)}입니다.`,
  },
  {
    q: "누가 받을 수 있나요? 신청 기한은요?",
    a: "휴가가 끝난 날 이전에 고용보험 피보험 단위기간(보수 지급의 기초가 된 날)이 합산 180일 이상이어야 합니다(고용보험법 제75조). 신청은 휴가 시작 후 1개월부터 휴가가 끝난 날 이후 12개월 이내에 해야 하며, 대규모기업은 휴가 시작 후 60일(다태아 75일)이 지난 날을 기준으로 1개월 뒤부터 신청할 수 있습니다. 기한을 넘기면 원칙적으로 받을 수 없습니다.",
  },
  {
    q: "우선지원대상기업인지 어떻게 알 수 있나요?",
    a: "업종별 상시근로자 수 기준으로 정해집니다. 제조업은 500명 이하, 광업·건설업·운수업·전문과학기술서비스업·보건복지서비스업 등은 300명 이하, 도소매업·숙박음식점업·금융보험업 등은 200명 이하인 경우 우선지원대상기업에 해당합니다. 정확한 판정은 고용24(work24.go.kr)에서 사업장 조회로 확인할 수 있습니다.",
  },
  {
    q: "다태아면 얼마나 더 받나요?",
    a: `휴가기간 자체가 90일에서 120일로 늘어나고, 유급 구간(회사 지급 또는 차액 보전)도 60일에서 75일로 늘어납니다. 월 상한액(${man(MONTHLY_CAP)})은 같지만 지급 일수가 늘어나는 만큼 고용보험 총 상한액도 ${man(MONTHLY_CAP * 3)}에서 ${man(MONTHLY_CAP * 4)}으로 커집니다.`,
  },
  {
    q: "출산 전에도 쓸 수 있나요?",
    a: "네. 출산전후휴가는 출산 전과 후를 통해 90일(다태아 120일)이며, 반드시 출산 후에 45일(다태아 60일) 이상이 확보되도록 나눠 써야 합니다. 즉 출산 전에 45일을 넘겨 사용하면 출산 후 45일을 채우지 못할 수 있으니 배치에 주의해야 합니다.",
  },
];

export default function Page() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-[#1B2A4A] sm:text-3xl">
          출산전후휴가급여 계산기
        </h1>
        <p className="text-sm text-[#5B6478]">
          월 통상임금과 회사 규모를 입력하면 2026년 기준 출산전후휴가급여를 계산합니다.
        </p>
      </header>

      <div className="mx-[calc(50%-50vw)] w-screen">
        <MaternityLeaveCalc />
      </div>

      <section className="space-y-3 text-sm leading-relaxed text-[#5B6478]">
        <h2 className="text-xl font-bold text-[#1B2A4A]">계산 예시: 월 통상임금 300만 원, 우선지원대상기업</h2>
        <p>
          고용보험 지급액은 월 상한 {man(MONTHLY_CAP)}이 적용되어 하루 {won(E.dailyGovAmount)}입니다. 90일 전체를
          고용보험이 지급하므로 고용보험 지급 총액은 {won(E.govPaidAmount)}입니다.
        </p>
        <p>
          최초 60일은 유급휴가라 통상임금 하루 {won(E.dailyOrdinary)}이 보장됩니다. 고용보험 일액과의 차이
          {" "}{won(E.dailyOrdinary - E.dailyGovAmount)} × 60일 = {won(E.companyPaidAmount)}을 회사가 지급합니다. 합계는{" "}
          <strong className="text-[#1B2A4A]">{won(E.totalAmount)}</strong>입니다.
        </p>
        <p>
          같은 월급이라도 대규모기업이면 최초 60일 {won(E_LARGE.companyPaidAmount)}을 회사가 전액 지급하고 마지막 30일{" "}
          {won(E_LARGE.govPaidAmount)}만 고용보험이 지급해 합계 {won(E_LARGE.totalAmount)}입니다. 받는 총액은 같고,
          누가 얼마를 내는지만 달라집니다.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-[#1B2A4A]">월 통상임금별 수령액 (우선지원대상기업, 단태아 90일)</h2>
        <SimpleTable head={["월 통상임금", "고용보험(90일)", "회사 차액(60일)", "합계"]} rows={PRIORITY_ROWS} />
        <p className="text-xs leading-relaxed text-[#8B93A6]">
          월 통상임금이 {man(MONTHLY_CAP)} 이하면 고용보험이 전부 지급하고 회사 차액은 없습니다. 월{" "}
          {won(floorMonthly)}(시급 {MIN_HOURLY_WAGE.toLocaleString("ko-KR")}원 × {STANDARD_MONTHLY_HOURS}시간)보다 낮으면
          최저임금 기준으로 계산되어 실제 월급보다 많이 나올 수 있습니다.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-[#1B2A4A]">월 통상임금별 수령액 (대규모기업, 단태아 90일)</h2>
        <SimpleTable head={["월 통상임금", "회사(최초 60일)", "고용보험(30일)", "합계"]} rows={LARGE_ROWS} />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-[#1B2A4A]">다태아(120일) 수령액</h2>
        <SimpleTable head={["월 통상임금", "우선지원대상기업", "대규모기업"]} rows={MULTI_ROWS} minWidth={420} />
        <p className="text-xs leading-relaxed text-[#8B93A6]">
          다태아는 유급 구간이 75일, 고용보험만 지급하는 구간이 45일입니다.
        </p>
      </section>

      <section className="space-y-3 text-sm leading-relaxed text-[#5B6478]">
        <h2 className="text-xl font-bold text-[#1B2A4A]">출산 후 육아휴직도 계획 중이라면</h2>
        <p>
          출산전후휴가가 끝난 뒤 이어서 육아휴직을 쓰는 경우가 많습니다. 육아휴직급여가
          궁금하다면{" "}
          <Link href="/calc/parental-leave" className="text-[#2E4494] underline">
            육아휴직급여 계산기
          </Link>
          에서 확인하세요.
        </p>
      </section>

      <SourceNote slug="maternity-leave" />

      <Faq items={FAQ} />
      <FaqJsonLd items={FAQ} />

      <div className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-4 text-sm">
        <Link href="/guide/maternity-leave-guide" className="font-medium text-[#2E4494] underline">
          기업규모별 지급구조·다태아 특례까지 자세히 보기 →
        </Link>
      </div>
    </div>
  );
}
