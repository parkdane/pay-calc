"use client";

import { useMemo, useState } from "react";
import MoneyInput from "@/components/MoneyInput";
import AdSlot from "@/components/AdSlot";
import { calcRetirementPay } from "@/lib/retirementPayCalc";

const won = (n: number) => Math.round(n).toLocaleString("ko-KR") + "원";

function todayMinusYears(years: number): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  return d.toISOString().slice(0, 10);
}

export default function RetirementPayCalc() {
  const [hireDate, setHireDate] = useState(todayMinusYears(3));
  const [retireDate, setRetireDate] = useState(new Date().toISOString().slice(0, 10));
  const [monthlyWage, setMonthlyWage] = useState(300);
  const [annualBonus, setAnnualBonus] = useState(0);
  const [unusedLeavePay, setUnusedLeavePay] = useState(0);

  const result = useMemo(() => {
    const hire = new Date(hireDate);
    const retire = new Date(retireDate);
    if (isNaN(hire.getTime()) || isNaN(retire.getTime()) || retire <= hire) return null;
    return calcRetirementPay({
      hireDate: hire,
      retireDate: retire,
      monthlyWageManwon: monthlyWage,
      annualBonusManwon: annualBonus,
      unusedLeavePayManwon: unusedLeavePay,
    });
  }, [hireDate, retireDate, monthlyWage, annualBonus, unusedLeavePay]);

  return (
    <div className="mx-auto max-w-[1280px] px-4">
      <div className="grid gap-6 lg:grid-cols-[380px_1fr] lg:items-start">
        {/* 왼쪽: 입력 */}
        <div className="space-y-4">
          <div className="space-y-4 rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#2E4494]">기본 입력</p>
              <p className="mt-0.5 text-base font-bold text-[#1B2A4A]">입사일·퇴사일·급여</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm font-medium text-[#5B6478]">입사일</span>
                <input
                  type="date"
                  value={hireDate}
                  onChange={(e) => setHireDate(e.target.value)}
                  className="mt-1.5 w-full min-h-[44px] rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-3 py-2.5"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-[#5B6478]">퇴사일</span>
                <input
                  type="date"
                  value={retireDate}
                  onChange={(e) => setRetireDate(e.target.value)}
                  className="mt-1.5 w-full min-h-[44px] rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-3 py-2.5"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-[#5B6478]">최근 3개월 평균 월급여 (만 원)</span>
              <MoneyInput value={monthlyWage} onChange={setMonthlyWage} placeholder="예: 300" />
              <span className="mt-1 block text-xs font-normal text-[#8B93A6]">
                기본급 + 매달 고정적으로 받는 수당. 세전 금액입니다.
              </span>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-[#5B6478]">연간 상여금 총액 (만 원, 선택)</span>
              <MoneyInput value={annualBonus} onChange={setAnnualBonus} placeholder="없으면 0" />
              <span className="mt-1 block text-xs font-normal text-[#8B93A6]">
                1년치 상여금 합계 중 3개월분(1/4)만 평균임금에 반영됩니다.
              </span>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-[#5B6478]">미사용 연차수당 (만 원, 선택)</span>
              <MoneyInput value={unusedLeavePay} onChange={setUnusedLeavePay} placeholder="없으면 0" />
              <span className="mt-1 block text-xs font-normal text-[#8B93A6]">
                퇴직 전전연도에 발생해 이미 지급된 연차수당이 있다면 입력하세요. 3개월분(1/4)만 반영됩니다.
              </span>
            </label>
          </div>
        </div>

        {/* 오른쪽: 결과 */}
        <div className="space-y-5 lg:sticky lg:top-20">
          {result ? (
            <>
              <div className="overflow-hidden rounded-xl border border-[rgba(46,68,148,0.14)]">
                <div className="bg-[#2E4494] px-5 py-4 text-white">
                  <p className="text-sm opacity-80">예상 퇴직금 (세전)</p>
                  <p className="text-3xl font-bold tabular-nums">{won(result.retirementPay)}</p>
                </div>
                {!result.eligible && (
                  <div className="border-t border-[rgba(46,68,148,0.10)] bg-[#FDF3F2] px-5 py-3 text-xs leading-relaxed text-[#B3372C]">
                    계속근로기간이 1년 미만이면 퇴직금 지급 대상이 아닙니다.
                  </div>
                )}
                <dl className="divide-y divide-[rgba(46,68,148,0.10)] bg-white text-sm">
                  <Row label="계속근로기간" value={`${result.serviceYearsDisplay} (${result.serviceDays}일)`} muted />
                  <Row label="평균임금 산정기간" value={`${result.threeMonthWindowDays}일`} muted />
                  <Row label="3개월 임금총액" value={won(result.threeMonthWageTotal)} muted />
                  <Row label="1일 평균임금" value={won(result.averageDailyWage)} bold />
                </dl>
              </div>

              <div className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-5 text-xs leading-relaxed text-[#7A8296]">
                <p className="font-semibold text-[#5B6478] mb-2">계산 방식</p>
                <p>퇴직금 = 1일 평균임금 × 30일 × (계속근로기간 ÷ 365)</p>
                <p className="mt-2">
                  1일 평균임금은 퇴직일 이전 3개월간 받은 임금총액을 그 기간의 실제 일수로 나눈
                  금액입니다(근로기준법 제2조제1항제6호). 계속근로기간 1년에 대해 30일분 이상의
                  평균임금을 지급하도록 근로자퇴직급여보장법 제8조가 정하고 있습니다.
                </p>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-white p-5 text-sm text-[#7A8296]">
              퇴사일은 입사일보다 뒤여야 합니다.
            </div>
          )}
        </div>
      </div>

      <p className="mt-6 text-xs leading-relaxed text-[#8B93A6]">
        ※ 참고용 추정치이며 세전 금액입니다. 실제 지급액은 퇴직소득세를 원천징수한 뒤 지급됩니다.
        평균임금이 통상임금보다 낮게 계산되는 경우 통상임금을 기준으로 하며(근로기준법 제2조제2항),
        이 계산기는 이를 자동으로 비교하지 않습니다. 4주 평균 1주 소정근로시간이 15시간 미만이면
        퇴직금 적용 대상이 아닙니다. 정확한 금액은 고용노동부 퇴직금 계산기(moel.go.kr) 또는
        사업장 인사·노무 담당자에게 확인하시기 바랍니다.
      </p>
      <AdSlot id="calc-retirement-pay-bottom" />
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
