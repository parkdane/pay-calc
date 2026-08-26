import type { Metadata } from "next";
import SalaryTable from "@/components/SalaryTable";
import SoldierTable from "@/components/SoldierTable";
import AdSlot from "@/components/AdSlot";
import Faq from "@/components/Faq";
import FaqJsonLd from "@/components/FaqJsonLd";
import CalcCta from "@/components/CalcCta";
import Link from "next/link";

import civil from "@/data/salary-civil-2026.json";
import military from "@/data/salary-military-2026.json";
import police from "@/data/salary-police-2026.json";
import fire from "@/data/salary-fire-2026.json";
import teacher from "@/data/salary-teacher-2026.json";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DATA: Record<string, any> = { civil, military, police, fire, teacher };
type Slug = keyof typeof DATA;

// 각 slug를 연금 계산기의 직군 옵션과 매핑 (경찰·소방은 계산기에서 하나로 통합되어 있음)
const PENSION_OCC: Record<string, string> = {
  civil: "civil",
  military: "military",
  police: "police_fire",
  fire: "police_fire",
  teacher: "teacher",
};

// 배너 문구는 실제 검색어(경찰연금, 소방공무원연금, 교사 은퇴 등)에 맞춰 자연스럽게 표현
const PENSION_LABEL: Record<string, string> = {
  civil: "공무원연금",
  military: "군인연금",
  police: "경찰연금",
  fire: "소방공무원연금",
  teacher: "교사 은퇴 후 연금",
};

export function generateStaticParams() {
  return Object.keys(DATA).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const d = DATA[slug as Slug];
  return {
    title: `${d.year}년 ${d.title} 봉급표·호봉표`,
    description: `${d.year}년 ${d.title} 봉급표(호봉표)를 계급·호봉별로 정리했습니다. 실수령액 계산기로 세후 월급까지 확인하세요.`,
  openGraph: {
    title: `${d.year}년 ${d.title} 봉급표·호봉표`,
    description: `${d.year}년 ${d.title} 봉급표(호봉표)를 계급·호봉별로 정리했습니다. 실수령액 계산기로 세후 월급까지 확인하세요.`,
  },
};
}

export default async function SalaryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const d = DATA[slug as Slug];
  const isMilitary = d.type === "military";
  const pensionOcc = PENSION_OCC[slug] ?? "civil";
  const pensionLabel = PENSION_LABEL[slug] ?? "공무원연금";

  return (
    <article className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-2xl font-bold tracking-tight text-[#1B2A4A] sm:text-3xl">
          {d.year}년 {d.title} 봉급표
        </h1>
        <ul className="space-y-1 text-sm text-[#5B6478]">
          {d.summary.map((s: string) => (
            <li key={s}>· {s}</li>
          ))}
        </ul>
        <p className="text-xs text-[#8B93A6]">
          출처: {d.source} · 최종 갱신 {d.updatedAt}
        </p>
      </header>

      {/* 계산기 CTA (표 위) */}
      {isMilitary ? (
        <div className="space-y-3">
          <div className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-white p-4 text-sm text-[#5B6478]">
            병사 봉급은 비과세로 아래 표 금액이 그대로 지급됩니다. 아래
            계산기는 직업군인(부사관·장교) 실수령액용입니다.
          </div>
          <CalcCta
            href="/calc/soldier-save"
            label="장병내일준비적금 수령액 계산하기"
          />
          <CalcCta
            href="/calc/military-net"
            label="군인 간부 실수령액 계산하기"
          />
        </div>
      ) : (
        <CalcCta />
      )}

      {/* 예상연금 계산기 배너 (직군별 딥링크, 소방은 경찰과 계산기가 통합되어 있어 branch로 계급명 표시만 분리) */}
      <Link
        href={`/calc/pension-net?occ=${pensionOcc}${slug === "fire" ? "&branch=fire" : ""}`}
        className="block rounded-xl border-2 border-[#2E4494] bg-[rgba(46,68,148,0.06)] p-5 text-center transition hover:bg-[rgba(46,68,148,0.10)] hover:shadow-md"
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-[#2E4494]">퇴직 후가 궁금하다면</p>
        <p className="mt-1 text-lg font-bold text-[#1B2A4A]">
          내 {pensionLabel} 예상수령액 계산해보기 →
        </p>
        <p className="mt-1 text-xs text-[#7A8296]">
          1997~2026년 실제 봉급표 기반, 임용일·호봉만 입력하면 바로 확인
        </p>
      </Link>

      {/* 광고 (CTA와 표 사이) */}
      <AdSlot id={`salary-${slug}-top`} />

      {/* 군인: 병사 고정급 + 간부 호봉표 / 그 외: 단일 표 */}
      {isMilitary ? (
        <div className="space-y-8">
          <SoldierTable title={d.soldier.title} rows={d.soldier.rows} />
          {d.officerTables.map(
            (t: {
              title: string;
              columns: string[];
              rows: { hobong: number; pay: (number | null)[] }[];
            }) => (
              <div key={t.title} className="space-y-2">
                <h3 className="font-semibold text-[#1B2A4A]">{t.title}</h3>
                <SalaryTable columns={t.columns} rows={t.rows} />
              </div>
            )
          )}
          {d.generalNote && (
            <p className="text-sm text-[#7A8296]">· {d.generalNote}</p>
          )}
        </div>
      ) : (
        <SalaryTable columns={d.columns} rows={d.rows} />
      )}

      <section className="space-y-3 text-[#5B6478]">
        <h2 className="text-xl font-bold text-[#1B2A4A]">봉급표 보는 법</h2>
        <p>
          위 표의 금액은 기본급(봉급)이며, 실제 월급에는 정액급식비·직급보조비
          등 수당이 더해지고 연금 기여금·건강보험·소득세가 공제됩니다. 따라서
          통장에 들어오는 금액은 표의 금액과 다릅니다. 정확한 세후 금액은
          실수령액 계산기에서 확인할 수 있습니다.
        </p>
      </section>

      <section className="space-y-3 text-[#5B6478]">
        <h2 className="text-xl font-bold text-[#1B2A4A]">호봉은 어떻게 오르나요</h2>
        <p>
          정기승급은 매년 1회, 근무 1년마다 1호봉씩 오르는 것이 원칙입니다.
          휴직·직위해제·정직 등 승급 제한 사유가 있으면 그 기간만큼 승급이
          늦어질 수 있습니다. 임용 전 경력(군 복무, 관련 자격증 소지 경력,
          유사 직무의 민간 경력 등)이 인정되면 초임 호봉이 1호봉보다 높게
          책정되는 경우가 많습니다.
          {isMilitary &&
            " 다만 병사는 호봉이 아니라 계급(이병·일병·상병·병장)에 따라 봉급이 고정되며, 호봉 승급 개념은 부사관·장교 등 간부에게만 적용됩니다."}{" "}
          정확한 초임 호봉과 경력 환산율은 소속 기관 인사부서에서 최종
          확정합니다.
        </p>
        <p>
          <Link
            href="/guide/2026-pay-changes"
            className="text-[#2E4494] underline"
          >
            2026년 보수 변경사항 총정리
          </Link>
          에서 인상률과 수당 변경 내용을 자세히 확인할 수 있습니다.
        </p>
      </section>

      <Faq items={d.faq} />
      <FaqJsonLd items={d.faq} />

      {/* 하단 광고 */}
      <AdSlot id={`salary-${slug}-bottom`} />
    </article>
  );
}
