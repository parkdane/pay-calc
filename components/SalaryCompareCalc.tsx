"use client";

import { useEffect, useMemo, useState } from "react";
import data from "@/data/salary-compare.json";
import AdSlot from "@/components/AdSlot";
import Link from "next/link";

const won = (n: number) => Math.round(n).toLocaleString("ko-KR") + "원";
const manwon = (n: number) => Math.round(n / 10000).toLocaleString("ko-KR") + "만원";

type Company = {
  name: string;
  corpCode: string;
  avgSalary: number;
  employeeCount: number;
  avgTenure: number | null;
  year: number;
};

// 업종 분류 (금감원 데이터엔 업종 필드가 없어 직접 매핑)
const INDUSTRY: Record<string, string> = {
  삼성전자: "반도체",
  SK하이닉스: "반도체",
  현대자동차: "완성차·조선·방산",
  기아: "완성차·조선·방산",
  현대모비스: "완성차·조선·방산",
  현대글로비스: "완성차·조선·방산",
  현대건설: "완성차·조선·방산",
  HD현대중공업: "완성차·조선·방산",
  NAVER: "IT·플랫폼",
  카카오: "IT·플랫폼",
  엔씨소프트: "IT·플랫폼",
  KT: "IT·플랫폼",
  삼성에스디에스: "IT·플랫폼",
  SK텔레콤: "IT·플랫폼",
  LG화학: "화학·에너지",
  "S-Oil": "화학·에너지",
  GS: "화학·에너지",
  POSCO홀딩스: "화학·에너지",
  KB금융: "금융",
  신한지주: "금융",
};
const INDUSTRY_OF = (name: string) => INDUSTRY[name] ?? "기타";
const INDUSTRIES = ["전체", "반도체", "완성차·조선·방산", "IT·플랫폼", "화학·에너지", "금융", "기타"];

const allCompanies = (data.companies as Company[]).slice().sort((a, b) => b.avgSalary - a.avgSalary);

// 사분위 기준 티어 (커뮤니티 임의 기준이 아니라 실제 데이터 분포로 계산)
function tierOf(rank: number, total: number): "S" | "A" | "B" | "C" {
  const pct = rank / total;
  if (pct <= 0.25) return "S";
  if (pct <= 0.5) return "A";
  if (pct <= 0.75) return "B";
  return "C";
}
const TIER_COLOR: Record<string, string> = {
  S: "bg-amber-100 text-amber-700 border-amber-300",
  A: "bg-[rgba(46,68,148,0.10)] text-[#2E4494] border-[rgba(46,68,148,0.22)]",
  B: "bg-slate-100 text-[#5B6478] border-[rgba(46,68,148,0.22)]",
  C: "bg-white text-[#7A8296] border-[rgba(46,68,148,0.14)]",
};

type SortKey = "high" | "low" | "name";

export default function SalaryCompareCalc() {
  const [manwonInput, setManwonInput] = useState(6000);
  const [industry, setIndustry] = useState("전체");
  const [sort, setSort] = useState<SortKey>("high");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const s = p.get("salary");
    if (s && !Number.isNaN(Number(s))) setManwonInput(Number(s));
  }, []);

  const myIncome = manwonInput * 10000;

  const withTier = useMemo(
    () => allCompanies.map((c, i) => ({ ...c, industry: INDUSTRY_OF(c.name), tier: tierOf(i + 1, allCompanies.length) })),
    []
  );

  const stats = useMemo(() => {
    const salaries = allCompanies.map((c) => c.avgSalary);
    const avg = salaries.reduce((a, b) => a + b, 0) / salaries.length;
    const higherCount = allCompanies.filter((c) => c.avgSalary > myIncome).length;
    const rank = higherCount + 1;
    const topPercent = (higherCount / allCompanies.length) * 100;
    const myTier = tierOf(rank, allCompanies.length);
    return { avg, rank, topPercent, myTier, count: allCompanies.length, top: withTier[0] };
  }, [myIncome, withTier]);

  // 비슷한 연봉대 기업 (내 연봉과 가장 가까운 5개)
  const similar = useMemo(() => {
    return withTier
      .slice()
      .sort((a, b) => Math.abs(a.avgSalary - myIncome) - Math.abs(b.avgSalary - myIncome))
      .slice(0, 5)
      .sort((a, b) => b.avgSalary - a.avgSalary);
  }, [myIncome, withTier]);

  const filtered = useMemo(() => {
    let list = withTier.filter((c) => industry === "전체" || c.industry === industry);
    if (sort === "high") list = list.slice().sort((a, b) => b.avgSalary - a.avgSalary);
    else if (sort === "low") list = list.slice().sort((a, b) => a.avgSalary - b.avgSalary);
    else list = list.slice().sort((a, b) => a.name.localeCompare(b.name, "ko"));
    return list;
  }, [industry, sort, withTier]);

  const chartMax = Math.max(stats.top.avgSalary, myIncome);

  const copyLink = async () => {
    const url = `${window.location.origin}${window.location.pathname}?salary=${manwonInput}`;
    window.history.replaceState(null, "", url);
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("아래 링크를 복사하세요", url);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4">
      <AdSlot id="calc-salary-compare-mid" />

      <div className="grid gap-6 lg:grid-cols-[380px_1fr] lg:items-start">
        {/* ═══ 왼쪽: 입력 ═══ */}
        <div className="space-y-4">
          <div className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-5">
            <label className="block text-sm font-medium text-[#5B6478]">
              내 연봉 (세전, 만원)
              <div className="mt-1.5 flex items-center gap-1">
                <input
                  type="text"
                  inputMode="numeric"
                  value={manwonInput === 0 ? "" : manwonInput.toLocaleString("ko-KR")}
                  onChange={(e) => setManwonInput(Number(e.target.value.replace(/[^0-9]/g, "")) || 0)}
                  className="w-full rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-3 py-3 text-right text-base tabular-nums"
                />
                <span className="shrink-0 text-sm text-[#8B93A6]">만원</span>
              </div>
              <span className="mt-1 block text-xs font-normal text-[#8B93A6]">계약연봉 기준. 6천만 원이면 6000</span>
            </label>
            <button
              type="button"
              onClick={copyLink}
              className="mt-3 rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-3 py-1.5 text-xs font-medium text-[#5B6478] hover:border-[#2E4494]"
            >
              {copied ? "링크 복사됨" : "링크 복사"}
            </button>
          </div>

          {/* 업종 필터 + 정렬 */}
          <div className="space-y-3 rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#2E4494]">보기 설정</p>
            <div className="flex flex-wrap gap-1.5">
              {INDUSTRIES.map((ind) => (
                <button
                  key={ind}
                  onClick={() => setIndustry(ind)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                    industry === ind
                      ? "border-[#2E4494] bg-[rgba(46,68,148,0.06)] text-[#2E4494]"
                      : "border-[rgba(46,68,148,0.22)] bg-white text-[#5B6478] hover:border-[#2E4494]"
                  }`}
                >
                  {ind}
                </button>
              ))}
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="w-full rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-2 py-2 text-xs text-[#5B6478]"
            >
              <option value="high">연봉 높은순</option>
              <option value="low">연봉 낮은순</option>
              <option value="name">가나다순</option>
            </select>
          </div>
        </div>

        {/* ═══ 오른쪽: 결과 (sticky) ═══ */}
        <div className="space-y-5 lg:sticky lg:top-20">
          {/* 핵심 지표 */}
          <div className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.06)] p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#2E4494]">핵심 지표</p>
            <div className="mt-1 flex items-center gap-2">
              <p className="text-lg font-bold text-[#1B2A4A]">
                상위 {stats.topPercent.toFixed(0)}% · {stats.count}개 중 {stats.rank}위 근처
              </p>
              <span className={`rounded-md border px-2 py-0.5 text-xs font-bold ${TIER_COLOR[stats.myTier]}`}>
                {stats.myTier}티어
              </span>
            </div>
            <p className="mt-1 text-sm leading-relaxed text-[#5B6478]">
              비교 목록 평균은 <strong className="tabular-nums">{manwon(stats.avg)}</strong>이고, 최고는{" "}
              <strong>{stats.top.name}</strong>(<span className="tabular-nums">{manwon(stats.top.avgSalary)}</span>)
              입니다. 입력한 연봉은 평균의 <strong className="tabular-nums">{(myIncome / stats.avg).toFixed(2)}배</strong>
              입니다.
            </p>
            <p className="mt-2 text-xs text-[#8B93A6]">
              티어는 우리가 수집한 {stats.count}개 기업의 실제 연봉 분포를 4등분(사분위)한 기준입니다 — 임의로
              정한 등급이 아니라 데이터가 갱신될 때마다 자동으로 다시 계산됩니다.
            </p>
          </div>

          {/* 비슷한 연봉대 기업 */}
          <div className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-white p-4">
            <p className="text-sm font-semibold text-[#1B2A4A]">내 연봉과 비슷한 기업</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {similar.map((c) => (
                <span
                  key={c.corpCode}
                  className="rounded-lg border border-[rgba(46,68,148,0.14)] bg-white px-2.5 py-1 text-xs text-[#5B6478]"
                >
                  {c.name} <span className="text-[#8B93A6]">{manwon(c.avgSalary)}</span>
                </span>
              ))}
            </div>
          </div>

          {/* 막대그래프 */}
          <div className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-white p-5">
            <p className="font-semibold text-[#1B2A4A]">
              기업별 평균연봉{" "}
              <span className="text-xs font-normal text-[#8B93A6]">({filtered.length}개 표시 중)</span>
            </p>
            <div className="mt-4 space-y-2">
              <div>
                <div className="mb-0.5 flex justify-between text-xs">
                  <span className="font-bold text-[#2E4494]">내 연봉 ←</span>
                  <span className="tabular-nums text-[#2E4494]">{manwon(myIncome)}</span>
                </div>
                <div className="h-4 w-full overflow-hidden rounded bg-slate-100">
                  <div
                    className="h-full bg-[#2E4494]"
                    style={{ width: `${Math.min((myIncome / chartMax) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div className="border-t border-dashed border-[rgba(46,68,148,0.14)] pt-2" />
              {filtered.map((c) => (
                <div key={c.corpCode}>
                  <div className="mb-0.5 flex justify-between text-xs">
                    <span className="text-[#5B6478]">
                      {c.name}{" "}
                      <span className={`ml-1 rounded px-1 text-[10px] ${TIER_COLOR[c.tier]}`}>{c.tier}</span>
                    </span>
                    <span className="tabular-nums text-[#7A8296]">{manwon(c.avgSalary)}</span>
                  </div>
                  <div className="h-3.5 w-full overflow-hidden rounded bg-slate-100">
                    <div className="h-full bg-slate-400" style={{ width: `${(c.avgSalary / chartMax) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 표 */}
          <div className="overflow-hidden rounded-xl border border-[rgba(46,68,148,0.14)]">
            <div className="border-b border-[rgba(46,68,148,0.10)] bg-[rgba(46,68,148,0.03)] px-4 py-2.5 text-sm font-semibold text-[#1B2A4A]">
              기업별 상세
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[#7A8296]">
                    <th className="px-4 py-2 text-left font-medium">기업</th>
                    <th className="px-4 py-2 text-left font-medium">업종</th>
                    <th className="px-4 py-2 text-center font-medium">티어</th>
                    <th className="px-4 py-2 text-right font-medium">평균연봉</th>
                    <th className="px-4 py-2 text-right font-medium">평균근속</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.corpCode} className="border-t border-[rgba(46,68,148,0.10)]">
                      <td className="px-4 py-2 font-medium text-[#1B2A4A]">{c.name}</td>
                      <td className="px-4 py-2 text-[#7A8296]">{c.industry}</td>
                      <td className="px-4 py-2 text-center">
                        <span className={`rounded px-1.5 py-0.5 text-xs font-bold ${TIER_COLOR[c.tier]}`}>
                          {c.tier}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right tabular-nums text-[#2E4494]">{won(c.avgSalary)}</td>
                      <td className="px-4 py-2 text-right tabular-nums text-[#7A8296]">
                        {c.avgTenure !== null ? `${c.avgTenure}년` : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* 안내 (grid 밖, 전체 폭) */}
      <div className="mt-6 space-y-4">
        <section className="space-y-1.5 rounded-xl bg-[rgba(46,68,148,0.03)] p-4 text-sm text-[#5B6478]">
          <p className="font-semibold text-[#1B2A4A]">이 데이터는 어떻게 만들어지나요?</p>
          <p>
            비교 대상 기업이 금융감독원 전자공시시스템(DART)에 제출한 사업보고서 "직원현황"의 1인평균급여액을
            그대로 가져옵니다. 커뮤니티 추정치가 아니라 기업이 법적으로 공시해야 하는 자료입니다. 사업부문·성별로
            나뉘어 보고되는 경우 인원수 기준 가중평균으로 회사 전체 평균을 계산했습니다. 신입 초봉처럼 회사가
            공시 의무를 지지 않는 항목은 공식 데이터로 확인할 수 없어 이 계산기에는 포함하지 않았습니다.
          </p>
        </section>

        <p className="text-xs leading-relaxed text-[#8B93A6]">
          ※ {data.source}. 기준: {allCompanies[0]?.year}년 사업연도. 전 직원(신입~임원) 평균이라 특정 연차·직급
          기준과는 차이가 있을 수 있습니다. 최종 업데이트: {new Date(data.updatedAt).toLocaleDateString("ko-KR")}.
        </p>

        <p className="text-sm text-[#5B6478]">
          전체 근로소득자 대비 내 연봉 위치가 궁금하다면{" "}
          <Link href="/calc/income-rank" className="text-[#2E4494] underline underline-offset-2">
            연봉순위 계산기
          </Link>
          도 함께 확인해보세요.
        </p>
      </div>
    </div>
  );
}
