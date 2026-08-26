"use client";

import { useMemo, useState } from "react";
import MoneyInput from "@/components/MoneyInput";
import AdSlot from "@/components/AdSlot";
import { calcUnemploymentBenefit, type AgeGroup } from "@/lib/unemploymentBenefitCalc";

const won = (n: number) => Math.round(n).toLocaleString("ko-KR") + "원";

export default function UnemploymentBenefitCalc() {
  const [monthlyWage, setMonthlyWage] = useState(300);
  const [ageGroup, setAgeGroup] = useState<AgeGroup>("under50");
  const [insuredYears, setInsuredYears] = useState(3);
  const [voluntary, setVoluntary] = useState(false);

  const result = useMemo(
    () => calcUnemploymentBenefit({ monthlyWageManwon: monthlyWage, ageGroup, insuredMonths: insuredYears * 12 }),
    [monthlyWage, ageGroup, insuredYears],
  );

  return (
    <div className="mx-auto max-w-[1280px] px-4">
      <div className="grid gap-6 lg:grid-cols-[380px_1fr] lg:items-start">
        {/* 왼쪽: 입력 */}
        <div className="space-y-4">
          <div className="space-y-4 rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#2E4494]">기본 입력</p>
              <p className="mt-0.5 text-base font-bold text-[#1B2A4A]">이직 전 급여·연령·가입기간</p>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-[#5B6478]">이직 전 3개월 평균 월급여 (만 원)</span>
              <MoneyInput value={monthlyWage} onChange={setMonthlyWage} placeholder="예: 300" />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-[#5B6478]">이직 당시 연령</span>
              <select
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value as AgeGroup)}
                className="mt-1.5 w-full min-h-[44px] rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-3 py-2.5"
              >
                <option value="under50">50세 미만</option>
                <option value="over50OrDisabled">50세 이상 또는 장애인</option>
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-[#5B6478]">고용보험 가입기간 (년)</span>
              <input
                type="number"
                min={0}
                max={40}
                step={0.5}
                value={insuredYears}
                onChange={(e) => setInsuredYears(Math.max(0, Number(e.target.value) || 0))}
                className="mt-1.5 w-full min-h-[44px] rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-3 py-2.5"
              />
              <span className="mt-1 block text-xs font-normal text-[#8B93A6]">
                이전 직장 가입기간도 3년 이내 공백이면 합산됩니다(단, 과거 실업급여로 이미 받은
                기간은 제외).
              </span>
            </label>

            <label className="flex items-start gap-2.5 rounded-lg border border-[rgba(46,68,148,0.14)] bg-white p-3">
              <input
                type="checkbox"
                checked={voluntary}
                onChange={(e) => setVoluntary(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0"
              />
              <span className="text-sm text-[#5B6478]">
                <span className="font-medium text-[#1B2A4A]">자발적으로 퇴사했다</span>
                <br />
                단순 개인 사정으로 스스로 그만둔 경우 원칙적으로 수급 대상이 아닙니다.
              </span>
            </label>
          </div>
        </div>

        {/* 오른쪽: 결과 */}
        <div className="space-y-5 lg:sticky lg:top-20">
          <div className="overflow-hidden rounded-xl border border-[rgba(46,68,148,0.14)]">
            <div className="bg-[#2E4494] px-5 py-4 text-white">
              <p className="text-sm opacity-80">예상 총 수급액 ({result.prescribedDays}일분)</p>
              <p className="text-3xl font-bold tabular-nums">{won(result.totalBenefit)}</p>
            </div>

            {(voluntary || !result.insuredEligible) && (
              <div className="border-t border-[rgba(46,68,148,0.10)] bg-[#FDF3F2] px-5 py-3 text-xs leading-relaxed text-[#B3372C]">
                {voluntary &&
                  "자발적 퇴사는 원칙적으로 수급 대상이 아닙니다. 다만 질병·육아·통근곤란 등 정당한 사유가 인정되면 예외적으로 받을 수 있습니다. "}
                {!result.insuredEligible &&
                  "가입기간이 180일(약 6개월) 미만이면 수급 대상이 아닙니다."}
              </div>
            )}
            {result.capApplied && (
              <div className="border-t border-[rgba(46,68,148,0.10)] bg-[#F0F5FF] px-5 py-3 text-xs leading-relaxed text-[#2E4494]">
                산정된 금액이 상한액을 넘어 1일 상한액(68,100원) 기준으로 계산했습니다.
              </div>
            )}
            {result.floorApplied && (
              <div className="border-t border-[rgba(46,68,148,0.10)] bg-[#F0F5FF] px-5 py-3 text-xs leading-relaxed text-[#2E4494]">
                산정된 금액이 하한액보다 낮아 1일 하한액(66,048원) 기준으로 계산했습니다.
              </div>
            )}

            <dl className="divide-y divide-[rgba(46,68,148,0.10)] bg-white text-sm">
              <Row label="1일 구직급여일액" value={won(result.dailyBenefit)} bold />
              <Row label="소정급여일수" value={`${result.prescribedDays}일`} muted />
              <Row label="지급률" value="평균임금의 60%" muted />
            </dl>
          </div>

          <div className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-5 text-xs leading-relaxed text-[#7A8296]">
            <p className="font-semibold text-[#5B6478] mb-2">소정급여일수 (2026년 기준, 고용보험법 별표1)</p>
            <ul className="space-y-1">
              <li>· 50세 미만: 가입 1년미만 120일 / 1~3년 150일 / 3~5년 180일 / 5~10년 210일 / 10년이상 240일</li>
              <li>· 50세 이상·장애인: 120일 / 180일 / 210일 / 240일 / 270일</li>
            </ul>
            <p className="mt-3">
              1일 상한액 68,100원, 하한액 66,048원(2026년 최저임금 기준)입니다. 실업 신고 후
              7일간은 대기기간이라 지급되지 않습니다.
            </p>
          </div>
        </div>
      </div>

      <p className="mt-6 text-xs leading-relaxed text-[#8B93A6]">
        ※ 참고용 추정치입니다. 1일 평균임금은 월급여를 3개월(91일) 기준으로 근사한 값이며, 실제
        평균임금은 퇴직 전 3개월간 받은 임금총액을 그 기간의 실제 일수로 나눠 산정합니다.
        수급자격 인정 여부(이직 사유, 근로 의사·능력 등)는 관할 고용센터가 최종 판단합니다.
        정확한 금액과 신청 절차는 고용24(work24.go.kr) 또는 고용노동부 상담센터(1350)에서
        확인하시기 바랍니다.
      </p>
      <AdSlot id="calc-unemployment-benefit-bottom" />
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
