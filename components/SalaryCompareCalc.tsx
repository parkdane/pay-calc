"use client";

import { useMemo, useState } from "react";
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

const companies = (data.companies as Company[]).slice().sort((a, b) => b.avgSalary - a.avgSalary);

export default function SalaryCompareCalc() {
  const [manwonInput, setManwonInput] = useState(6000);

  const myIncome = manwonInput * 10000;

  const stats = useMemo(() => {
    const salaries = companies.map((c) => c.avgSalary);
    const total = salaries.reduce((a, b) => a + b, 0);
    const avg = total / salaries.length;
    const max = companies[0];
    const higherCount = companies.filter((c) => c.avgSalary > myIncome).length;
    const rank = higherCount + 1;
    const topPercent = (higherCount / companies.length) * 100;
    return { avg, max, rank, topPercent, count: companies.length };
  }, [myIncome]);

  const chartMax = Math.max(stats.max.avgSalary, myIncome);

  return (
    <div className="space-y-6">
      {/* 입력 */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
        <label className="block text-sm font-medium text-slate-700">
          내 연봉 (세전, 만원)
          <div className="mt-1 flex items-center gap-1">
            <input
              type="text"
              inputMode="numeric"
              value={manwonInput === 0 ? "" : manwonInput.toLocaleString("ko-KR")}
              onChange={(e) => setManwonInput(Number(e.target.value.replace(/[^0-9]/g, "")) || 0)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-right tabular-nums"
            />
            <span className="shrink-0 text-sm text-slate-400">만원</span>
          </div>
          <span className="mt-1 block text-xs font-normal text-slate-400">
            계약연봉 기준. 6천만 원이면 6000
          </span>
        </label>
      </div>

      {/* 광고 */}
      <AdSlot id="calc-salary-compare-mid" />

      {/* 핵심 지표 */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">핵심 지표</p>
        <p className="mt-1 text-lg font-bold text-slate-900">
          비교 대상 {stats.count}개 대기업 중 상위 {stats.topPercent.toFixed(0)}% 수준
        </p>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          이 목록의 평균은 <strong className="tabular-nums">{manwon(stats.avg)}</strong>입니다. 입력한
          연봉은 평균의 <strong className="tabular-nums">{(myIncome / stats.avg).toFixed(2)}배</strong>이고,{" "}
          {stats.count}개 기업 중 <strong className="tabular-nums">{stats.rank}위</strong> 근처에 해당합니다.
        </p>
        <p className="mt-2 text-xs text-slate-400">
          여기 나온 평균연봉은 전 직원(신입~임원) 전체 평균입니다. 특정 연차·직급 기준이 아니라 회사 전체
          수준을 보는 지표로 참고하세요.
        </p>
      </div>

      {/* 막대그래프 */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <p className="font-semibold text-slate-800">
          기업별 평균연봉 비교{" "}
          <span className="text-xs font-normal text-slate-400">({companies.length}개 기업 사업보고서 기준)</span>
        </p>
        <div className="mt-4 space-y-2">
          <div>
            <div className="mb-0.5 flex justify-between text-xs">
              <span className="font-bold text-blue-700">내 연봉 ←</span>
              <span className="tabular-nums text-blue-700">{manwon(myIncome)}</span>
            </div>
            <div className="h-4 w-full overflow-hidden rounded bg-slate-100">
              <div
                className="h-full bg-blue-700"
                style={{ width: `${Math.min((myIncome / chartMax) * 100, 100)}%` }}
              />
            </div>
          </div>
          <div className="border-t border-dashed border-slate-200 pt-2" />
          {companies.map((c) => (
            <div key={c.corpCode}>
              <div className="mb-0.5 flex justify-between text-xs">
                <span className="text-slate-600">{c.name}</span>
                <span className="tabular-nums text-slate-500">{manwon(c.avgSalary)}</span>
              </div>
              <div className="h-3.5 w-full overflow-hidden rounded bg-slate-100">
                <div className="h-full bg-slate-400" style={{ width: `${(c.avgSalary / chartMax) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 표 */}
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <div className="border-b border-slate-100 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-800">
          기업별 상세 (평균연봉 높은 순)
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-500">
              <th className="px-4 py-2 text-left font-medium">기업</th>
              <th className="px-4 py-2 text-right font-medium">평균연봉</th>
              <th className="px-4 py-2 text-right font-medium">평균근속</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((c) => (
              <tr key={c.corpCode} className="border-t border-slate-100">
                <td className="px-4 py-2 font-medium text-slate-800">{c.name}</td>
                <td className="px-4 py-2 text-right tabular-nums text-blue-700">{won(c.avgSalary)}</td>
                <td className="px-4 py-2 text-right tabular-nums text-slate-500">
                  {c.avgTenure !== null ? `${c.avgTenure}년` : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 안내 */}
      <section className="space-y-1.5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
        <p className="font-semibold text-slate-800">이 데이터는 어떻게 만들어지나요?</p>
        <p>
          비교 대상 기업이 금융감독원 전자공시시스템(DART)에 제출한 사업보고서 "직원현황"의 1인평균급여액을
          그대로 가져옵니다. 커뮤니티 추정치가 아니라 기업이 법적으로 공시해야 하는 자료입니다. 사업부문·성별로
          나뉘어 보고되는 경우 인원수 기준 가중평균으로 회사 전체 평균을 계산했습니다.
        </p>
      </section>

      <p className="text-xs leading-relaxed text-slate-400">
        ※ {data.source}. 기준: {companies[0]?.year}년 사업연도. 신입 초봉이나 특정 연차 기준이 아닌 전 직원
        평균이라 실제 입사 시 받는 연봉과는 차이가 있을 수 있습니다. 최종 업데이트:{" "}
        {new Date(data.updatedAt).toLocaleDateString("ko-KR")}.
      </p>

      <p className="text-sm text-slate-600">
        전체 근로소득자 대비 내 연봉 위치가 궁금하다면{" "}
        <Link href="/calc/income-rank" className="text-blue-700 underline underline-offset-2">
          연봉순위 계산기
        </Link>
        도 함께 확인해보세요.
      </p>
    </div>
  );
}
