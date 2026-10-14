import type { Metadata } from "next";
import OvertimePayCalc from "@/components/OvertimePayCalc";
import Faq from "@/components/Faq";
import FaqJsonLd from "@/components/FaqJsonLd";
import SourceNote from "@/components/SourceNote";
import Link from "next/link";
import police from "@/data/salary-police-2026.json";
import fire from "@/data/salary-fire-2026.json";
import civil from "@/data/salary-civil-2026.json";
import teacher from "@/data/salary-teacher-2026.json";
import { BASE_HOBONG, MAX_HOURS, overtimeReduction, overtimeHourlyRate } from "@/lib/overtime";

export const metadata: Metadata = {
  title: "경찰·공무원 시간외수당 계산기·단가표 (2026년 기준)",
  description:
    "직급·계급과 이번 달 초과근무 시간을 입력하면 2026년 기준 시간외근무수당을 계산합니다. 경찰·소방 계급별, 일반직 급수별 시간당 단가표도 함께 제공합니다.",
  openGraph: {
    title: "경찰·공무원 시간외수당 계산기·단가표 (2026년 기준)",
    description:
      "직급·계급과 이번 달 초과근무 시간을 입력하면 2026년 기준 시간외근무수당을 계산합니다. 경찰·소방 계급별, 일반직 급수별 시간당 단가표 포함.",
  },
};

// ── 시간당 단가표: 계산기와 같은 함수(lib/overtime)로 생성 ──
const won = (n: number) => Math.round(n).toLocaleString("ko-KR") + "원";
type RateRow = { label: string; basePay: number; reduction: number; hourly: number };

function buildRows(columns: readonly string[], basePays: readonly number[], labels?: readonly string[]): RateRow[] {
  return columns.map((c, i) => {
    const hourly = overtimeHourlyRate(basePays[i], c);
    return { label: labels ? labels[i] : c, basePay: basePays[i], reduction: overtimeReduction(c), hourly };
  });
}
const baseRow = (rows: readonly { hobong: number; pay: readonly (number | null)[] }[]) =>
  rows.find((r) => r.hobong === BASE_HOBONG)!.pay as number[];

const policeRows = buildRows(
  police.columns,
  baseRow(police.rows),
  police.columns.map((c, i) => `${c} / ${fire.columns[i]}`),
).reverse();
const civilRows = buildRows(civil.columns, baseRow(civil.rows)).reverse();
const teacherHourly = overtimeHourlyRate(baseRow(teacher.rows)[0], "교원 봉급");

const rowOf = (rows: RateRow[], key: string) => rows.find((r) => r.label.startsWith(key))!;
const sunkyung = rowOf(policeRows, "순경");
const gyeongwi = rowOf(policeRows, "경위");
const grade9 = rowOf(civilRows, "9급");
const grade8 = rowOf(civilRows, "8급");
const grade7 = rowOf(civilRows, "7급");

const RATE_FAQ = [
  {
    q: "경찰 시간외수당 시간당 단가는 얼마인가요?",
    a: `2026년 기준 시간당 단가는 순경 ${won(sunkyung.hourly)}(감액조정률 60%), 경위 ${won(gyeongwi.hourly)}(55%)입니다. 기준호봉(${BASE_HOBONG}호봉) 봉급액 × 감액조정률 × 150% ÷ 209로 계산하며, 아래 단가표에서 계급별 금액을 한눈에 볼 수 있습니다.`,
  },
  {
    q: "경찰과 소방의 시간외수당 단가는 같은가요?",
    a: "같습니다. 경찰공무원과 소방공무원은 같은 공안직 봉급표를 쓰고 계급만 이름이 다릅니다(순경=소방사, 경장=소방교, 경사=소방장, 경위=소방위, 경감=소방경). 기준호봉 봉급액과 감액조정률이 같아서 대응하는 계급끼리 시간당 단가가 같습니다.",
  },
  {
    q: "9급·8급은 감액조정률이 높아져서 7급과 격차가 얼마나 줄었나요?",
    a: `2026년부터 8급(상당) 이하는 감액조정률이 60%로 적용됩니다. 그 결과 시간당 단가는 9급 ${won(grade9.hourly)}, 8급 ${won(grade8.hourly)}, 7급 ${won(grade7.hourly)}으로 8급과 7급의 차이가 ${won(grade7.hourly - grade8.hourly)}에 그칩니다. 봉급액은 7급이 8급보다 약 32만 원 많지만 감액조정률이 달라 단가 차이는 작아집니다.`,
  },
  {
    q: "월 20시간 초과근무하면 얼마를 받나요?",
    a: `시간당 단가에 시간을 곱하면 됩니다. 순경은 ${won(sunkyung.hourly)} × 20시간 = ${won(sunkyung.hourly * 20)}, 경위는 ${won(gyeongwi.hourly)} × 20시간 = ${won(gyeongwi.hourly * 20)}입니다. 월 최대 인정 시간인 ${MAX_HOURS}시간을 채우면 순경 ${won(sunkyung.hourly * MAX_HOURS)}, 경위 ${won(gyeongwi.hourly * MAX_HOURS)}입니다.`,
  },
];

const FAQ = [
  {
    q: "시간외수당은 어떻게 계산되나요?",
    a: "기준호봉(10호봉) 봉급액에 감액조정률을 곱하고 209로 나눈 뒤 150%를 가산해 시간당 단가를 구하고, 여기에 초과근무 시간을 곱합니다. 2026년부터 9급·8급(상당)은 감액조정률이 60%로 상향됐고, 그 외 직급은 55%입니다.",
  },
  {
    q: "왜 내 실제 호봉이 아니라 10호봉 기준으로 계산하나요?",
    a: "시간외수당 단가는 개인의 실제 호봉이 아니라 별도로 정한 기준호봉(10호봉)의 봉급액을 기준으로 계산합니다. 실제 호봉과 관계없이 같은 직급이면 시간당 단가가 동일합니다.",
  },
  {
    q: "월 최대 몇 시간까지 인정되나요?",
    a: "월 최대 57시간까지 인정됩니다. 이를 초과하는 시간은 수당 계산에 반영되지 않습니다. 일반 사무직은 별도 초과근무 명령 없이도 월 10시간의 정액분이 지급되는 경우가 많으니, 소속 기관의 실제 운영 기준을 확인하는 것이 정확합니다.",
  },
  {
    q: "경찰·소방의 위험근무수당도 포함되나요?",
    a: "아닙니다. 이 계산기는 시간외근무수당만 계산합니다. 경찰·소방의 위험근무수당이나 그 밖의 직종별 수당은 별도로 지급되며, 이 계산에는 포함하지 않았습니다.",
  },
];

const ALL_FAQ = [...FAQ, ...RATE_FAQ];

export default function Page() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-[#1B2A4A] sm:text-3xl">
          시간외수당 계산기
        </h1>
        <p className="text-sm text-[#5B6478]">
          직급·계급과 이번 달 초과근무 시간을 입력하면 2026년 기준 시간외근무수당을 계산합니다.
          일반직·경찰·소방·교사 대상입니다.
        </p>
      </header>

      <div className="mx-[calc(50%-50vw)] w-screen">
        <OvertimePayCalc />
      </div>

      <section className="space-y-4 text-sm leading-relaxed text-[#5B6478]">
        <h2 className="text-xl font-bold text-[#1B2A4A]">2026년 시간외수당 시간당 단가표</h2>
        <p>
          시간당 단가는 실제 호봉이 아니라 기준호봉({BASE_HOBONG}호봉) 봉급액으로 정해지므로 같은 계급이면 모두 같습니다.
          월 인정 시간은 최대 {MAX_HOURS}시간입니다.
        </p>

        <h3 className="text-base font-bold text-[#1B2A4A]">경찰·소방 계급별</h3>
        <RateTable rows={policeRows} />

        <h3 className="text-base font-bold text-[#1B2A4A]">일반직 공무원 급수별</h3>
        <RateTable rows={civilRows} />

        <p className="text-xs text-[#8B93A6]">
          교사는 기준호봉 봉급액 {won(baseRow(teacher.rows)[0])}에 감액조정률 55%를 적용해 시간당 {won(teacherHourly)}입니다.
          위험근무수당 등 직종별 추가 수당은 포함하지 않았습니다.
        </p>
      </section>

      <section className="space-y-3 text-sm leading-relaxed text-[#5B6478]">
        <h2 className="text-xl font-bold text-[#1B2A4A]">실수령액까지 함께 확인하려면</h2>
        <p>
          시간외수당은 전체 급여의 일부입니다. 기본급·각종 수당에서 연금 기여금·건강보험·소득세까지
          공제한 전체 실수령액이 궁금하다면{" "}
          <Link href="/calc/civil-net" className="text-[#2E4494] underline">
            공무원·경찰·소방 실수령액 계산기
          </Link>
          에서 확인하세요.
        </p>
      </section>

      <SourceNote slug="overtime-pay" />

      <Faq items={ALL_FAQ} />
      <FaqJsonLd items={ALL_FAQ} />
    </div>
  );
}

function RateTable({ rows }: { rows: RateRow[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[rgba(46,68,148,0.14)]">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="bg-[#F5F6FA] text-xs text-[#7A8296]">
          <tr>
            <th className="px-4 py-2 text-left font-medium">계급·급수</th>
            <th className="px-4 py-2 text-right font-medium">기준호봉 봉급</th>
            <th className="px-4 py-2 text-right font-medium">감액조정률</th>
            <th className="px-4 py-2 text-right font-medium">시간당 단가</th>
            <th className="px-4 py-2 text-right font-medium">월 10시간</th>
            <th className="px-4 py-2 text-right font-medium">월 20시간</th>
            <th className="px-4 py-2 text-right font-medium">월 {MAX_HOURS}시간</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[rgba(46,68,148,0.08)] bg-white tabular-nums text-[#1B2A4A]">
          {rows.map((r) => (
            <tr key={r.label}>
              <td className="px-4 py-2 font-medium">{r.label}</td>
              <td className="px-4 py-2 text-right">{won(r.basePay)}</td>
              <td className="px-4 py-2 text-right">{Math.round(r.reduction * 100)}%</td>
              <td className="px-4 py-2 text-right font-semibold">{won(r.hourly)}</td>
              <td className="px-4 py-2 text-right">{won(r.hourly * 10)}</td>
              <td className="px-4 py-2 text-right">{won(r.hourly * 20)}</td>
              <td className="px-4 py-2 text-right">{won(r.hourly * MAX_HOURS)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
