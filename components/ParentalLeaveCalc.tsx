"use client";

import { useMemo, useState } from "react";
import MoneyInput from "@/components/MoneyInput";
import AdSlot from "@/components/AdSlot";
import { calcParentalLeave } from "@/lib/parentalLeaveCalc";

const won = (n: number) => Math.round(n).toLocaleString("ko-KR") + "원";

export default function ParentalLeaveCalc() {
  const [wageManwon, setWageManwon] = useState(300);
  const [months, setMonths] = useState(6);
  const [isSpecialCase, setIsSpecialCase] = useState(false);

  const result = useMemo(() => {
    const wage = wageManwon * 10000;
    return calcParentalLeave(wage, months, isSpecialCase);
  }, [wageManwon, months, isSpecialCase]);

  return (
    <div className="mx-auto max-w-[1280px] px-4">
      <div className="grid gap-6 lg:grid-cols-[380px_1fr] lg:items-start">
        {/* 왼쪽: 입력 */}
        <div className="space-y-4">
          <div className="space-y-4 rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#2E4494]">기본 입력</p>
              <p className="mt-0.5 text-base font-bold text-[#1B2A4A]">통상임금·육아휴직 기간</p>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-[#5B6478]">월 통상임금 (만 원)</span>
              <MoneyInput value={wageManwon} onChange={setWageManwon} placeholder="예: 300" />
              <span className="mt-1 block text-xs font-normal text-[#8B93A6]">
                기본급 + 고정적으로 받는 수당(정근수당 등 변동분 제외). 급여명세서 기준입니다.
              </span>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-[#5B6478]">육아휴직 기간 (개월)</span>
              <input
                type="number"
                min={1}
                max={18}
                value={months}
                onChange={(e) => setMonths(Math.min(18, Math.max(1, Number(e.target.value) || 1)))}
                className="mt-1.5 w-full min-h-[44px] rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-3 py-2.5"
              />
            </label>

            <label className="flex items-start gap-2.5 rounded-lg border border-[rgba(46,68,148,0.14)] bg-white p-3">
              <input
                type="checkbox"
                checked={isSpecialCase}
                onChange={(e) => setIsSpecialCase(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0"
              />
              <span className="text-sm text-[#5B6478]">
                <span className="font-medium text-[#1B2A4A]">부모가 함께 육아휴직 사용</span>
                <br />
                자녀가 생후 18개월 이내이고 부모 모두 육아휴직을 사용하는 경우(&apos;6+6 부모육아휴직제&apos;),
                첫 6개월은 상한액이 더 높게 적용됩니다.
              </span>
            </label>
          </div>
        </div>

        {/* 오른쪽: 결과 */}
        <div className="space-y-5 lg:sticky lg:top-20">
          <div className="overflow-hidden rounded-xl border border-[rgba(46,68,148,0.14)]">
            <div className="bg-[#2E4494] px-5 py-4 text-white">
              <p className="text-sm opacity-80">
                {months}개월 합산 예상 수령액{isSpecialCase ? " (부모 함께 사용 특례 적용)" : ""}
              </p>
              <p className="text-3xl font-bold tabular-nums">{won(result.total)}</p>
            </div>

            <div className="max-h-[420px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-[#F5F6FA] text-xs text-[#7A8296]">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">개월차</th>
                    <th className="px-4 py-2 text-left font-medium">지급률</th>
                    <th className="px-4 py-2 text-right font-medium">지급액</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(46,68,148,0.08)]">
                  {result.breakdown.map((b) => (
                    <tr key={b.month}>
                      <td className="px-4 py-2 text-[#1B2A4A]">{b.month}개월째</td>
                      <td className="px-4 py-2 text-[#7A8296]">{b.month <= 6 ? "100%" : "80%"}</td>
                      <td className="px-4 py-2 text-right font-medium tabular-nums text-[#1B2A4A]">
                        {won(b.amount)}
                        {b.capApplied && (
                          <span className="ml-1 text-xs font-normal text-[#B3372C]">상한</span>
                        )}
                        {b.floorApplied && (
                          <span className="ml-1 text-xs font-normal text-[#B3372C]">하한</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-5 text-xs leading-relaxed text-[#7A8296]">
            <p className="font-semibold text-[#5B6478] mb-2">월별 상한액 (2026년 기준)</p>
            <ul className="space-y-1">
              <li>· 일반: 1~3개월 250만원 / 4~6개월 200만원 / 7개월~ 160만원(통상임금 80%)</li>
              <li>· 부모 함께 사용 특례(6+6): 1~2개월 250만원 / 3개월 300만원 / 4개월 350만원 / 5개월 400만원 / 6개월 450만원, 7개월째부터는 일반 기준으로 복귀</li>
              <li>· 하한액은 공통으로 월 70만원입니다.</li>
            </ul>
            <p className="mt-3">
              고용보험법 시행령 제95조·제95조의3 기준입니다. 2025년 개정으로 사후지급금(복직 후 6개월
              근무 확인 후 지급하던 25%) 제도는 폐지되어, 매달 전액이 지급됩니다.
            </p>
          </div>
        </div>
      </div>

      <p className="mt-6 text-xs leading-relaxed text-[#8B93A6]">
        ※ 참고용 추정치입니다. 공무원은 국가공무원 복무규정·수당 규정에 따라 세부 조건이 다를 수
        있고, 자영업 소득 등이 발생하면 해당 기간 지급이 제한됩니다. 정확한 금액과 대상 여부는
        고용24(work24.go.kr) 또는 고용노동부 상담센터(1350)에서 확인하시기 바랍니다.
      </p>
      <AdSlot id="calc-parental-leave-bottom" />
    </div>
  );
}
