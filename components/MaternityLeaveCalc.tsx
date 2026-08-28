"use client";

import { useMemo, useState } from "react";
import MoneyInput from "@/components/MoneyInput";
import AdSlot from "@/components/AdSlot";
import { calcMaternityLeavePay, type CompanySize } from "@/lib/maternityLeaveCalc";

const won = (n: number) => Math.round(n).toLocaleString("ko-KR") + "원";

export default function MaternityLeaveCalc() {
  const [monthlyWage, setMonthlyWage] = useState(300);
  const [companySize, setCompanySize] = useState<CompanySize>("priority");
  const [isMultiple, setIsMultiple] = useState(false);

  const result = useMemo(
    () => calcMaternityLeavePay(monthlyWage, companySize, isMultiple),
    [monthlyWage, companySize, isMultiple],
  );

  return (
    <div className="mx-auto max-w-[1280px] px-4">
      <div className="grid gap-6 lg:grid-cols-[380px_1fr] lg:items-start">
        {/* 왼쪽: 입력 */}
        <div className="space-y-4">
          <div className="space-y-4 rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#2E4494]">기본 입력</p>
              <p className="mt-0.5 text-base font-bold text-[#1B2A4A]">통상임금·기업규모</p>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-[#5B6478]">월 통상임금 (만 원)</span>
              <MoneyInput value={monthlyWage} onChange={setMonthlyWage} placeholder="예: 300" />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-[#5B6478]">회사 규모</span>
              <select
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value as CompanySize)}
                className="mt-1.5 w-full min-h-[44px] rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-3 py-2.5"
              >
                <option value="priority">우선지원대상기업(중소기업 등)</option>
                <option value="large">대규모기업(대기업)</option>
              </select>
              <span className="mt-1 block text-xs font-normal text-[#8B93A6]">
                {companySize === "priority"
                  ? "휴가기간 전체를 고용보험이 지급합니다."
                  : "최초 60일(다태아 75일)은 회사가 통상임금 100%를 직접 지급하고, 나머지만 고용보험이 지급합니다."}
              </span>
            </label>

            <label className="flex items-center gap-2.5 rounded-lg border border-[rgba(46,68,148,0.14)] bg-white p-3">
              <input
                type="checkbox"
                checked={isMultiple}
                onChange={(e) => setIsMultiple(e.target.checked)}
                className="h-4 w-4 shrink-0"
              />
              <span className="text-sm font-medium text-[#1B2A4A]">다태아 임신(쌍둥이 이상)</span>
            </label>
          </div>
        </div>

        {/* 오른쪽: 결과 */}
        <div className="space-y-5 lg:sticky lg:top-20">
          <div className="overflow-hidden rounded-xl border border-[rgba(46,68,148,0.14)]">
            <div className="bg-[#2E4494] px-5 py-4 text-white">
              <p className="text-sm opacity-80">{result.totalLeaveDays}일 휴가기간 합산 예상 총액</p>
              <p className="text-3xl font-bold tabular-nums">{won(result.totalAmount)}</p>
            </div>

            {result.floorApplied && (
              <div className="border-t border-[rgba(46,68,148,0.10)] bg-[#F0F5FF] px-5 py-3 text-xs leading-relaxed text-[#2E4494]">
                시간급 통상임금이 최저임금보다 낮아 최저임금 기준으로 계산했습니다.
              </div>
            )}
            {result.capApplied && (
              <div className="border-t border-[rgba(46,68,148,0.10)] bg-[#F0F5FF] px-5 py-3 text-xs leading-relaxed text-[#2E4494]">
                고용보험 지급분은 월 상한액(220만원)을 넘어 상한 기준으로 계산했습니다.
              </div>
            )}

            <dl className="divide-y divide-[rgba(46,68,148,0.10)] bg-white text-sm">
              {result.companyPaidDays > 0 && (
                <Row label={`회사 직접 지급 (${result.companyPaidDays}일, 통상임금 100%)`} value={won(result.companyPaidAmount)} muted />
              )}
              <Row label={`고용보험 지급 (${result.govPaidDays}일, 상한 적용)`} value={won(result.govPaidAmount)} bold />
            </dl>
          </div>

          <div className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-5 text-xs leading-relaxed text-[#7A8296]">
            <p className="font-semibold text-[#5B6478] mb-2">2026년 기준 상하한액</p>
            <ul className="space-y-1">
              <li>· 상한: 월 220만원 (90일 총액 660만원, 다태아 120일 총액 880만원)</li>
              <li>· 하한: 시간급 통상임금이 시간급 최저임금(10,320원)보다 낮으면 최저임금 기준 적용</li>
            </ul>
          </div>
        </div>
      </div>

      <p className="mt-6 text-xs leading-relaxed text-[#8B93A6]">
        ※ 참고용 추정치입니다. 월 통상시간은 주 40시간제 기준 209시간으로 근사했습니다. 우선지원대상기업
        여부는 업종별 상시근로자 수 기준(제조업 500인, 대부분 업종 300인 또는 200인 이하 등)으로
        정해지며, 이 계산기는 자동으로 판별하지 않습니다. 정확한 금액과 대상 여부는
        고용24(work24.go.kr) 또는 고용노동부 상담센터(1350)에서 확인하시기 바랍니다.
      </p>
      <AdSlot id="calc-maternity-leave-bottom" />
    </div>
  );
}

function Row({ label, value, bold, muted }: { label: string; value: string; bold?: boolean; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 px-5 py-2.5">
      <dt className={muted ? "text-[#7A8296]" : "font-medium text-[#1B2A4A]"}>{label}</dt>
      <dd className={`shrink-0 tabular-nums text-right ${bold ? "font-bold text-[#1B2A4A]" : muted ? "text-[#7A8296]" : "text-[#1B2A4A]"}`}>
        {value}
      </dd>
    </div>
  );
}
