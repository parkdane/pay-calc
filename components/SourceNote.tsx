import Link from "next/link";
import { CALC_META } from "@/data/calcMeta";
import rates from "@/data/rates.json";
import salaryCompare from "@/data/salary-compare.json";

const AUTO_DATES: Record<string, string> = {
  rates: (rates as { updatedAt: string }).updatedAt.slice(0, 10),
  "salary-compare": (salaryCompare as { updatedAt: string }).updatedAt.slice(0, 10),
};

// 계산기 하단 공통 표기: 근거 자료 · 최종 업데이트일 · 오류 제보 경로
export default function SourceNote({ slug }: { slug: string }) {
  const meta = CALC_META[slug];
  if (!meta) return null;
  return (
    <aside className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-white p-4 text-xs leading-relaxed text-[#7A8296]">
      <p className="font-semibold text-[#5B6478]">근거 자료</p>
      <ul className="mt-1 list-disc space-y-0.5 pl-4">
        {meta.sources.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
      <p className="mt-2">
        최종 업데이트 {meta.updated}
        {meta.autoData && ` · 데이터 자동 갱신 ${AUTO_DATES[meta.autoData]}`}
        {" · "}수치가 공식 자료와 다르면{" "}
        <Link href="/contact" className="text-[#2E4494] underline">
          알려주세요
        </Link>
        . 확인 후 반영합니다.
      </p>
    </aside>
  );
}
