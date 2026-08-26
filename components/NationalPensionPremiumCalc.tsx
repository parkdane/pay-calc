"use client";

import { useMemo, useState } from "react";
import MoneyInput from "@/components/MoneyInput";
import AdSlot from "@/components/AdSlot";
import { calcNationalPensionPremium } from "@/lib/nationalPensionPremiumCalc";

const won = (n: number) => Math.round(n).toLocaleString("ko-KR") + "원";

export default function NationalPensionPremiumCalc() {
  const [incomeManwon, setIncomeManwon] = useState(300);

  const result = useMemo(() => calcNationalPensionPremium(incomeManwon * 10000), [incomeManwon]);

  return (
    <div className="mx-auto max-w-[1280px] px-4">
      <div className="grid gap-6 lg:grid-cols-[380px_1fr] lg:items-start">
        {/* 왼쪽: 입력 */}
        <div className="space-y-4">
          <div className="space-y-4 rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#2E4494]">기본 입력</p>
              <p className="mt-0.5 text-base font-bold text-[#1B2A4A]">월 신고소득(사업소득 등)</p>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-[#5B6478]">월 소득 (만 원)</span>
              <MoneyInput value={incomeManwon} onChange={setIncomeManwon} placeholder="예: 300" />
              <span className="mt-1 block text-xs font-normal text-[#8B93A6]">
                자영업자는 종합소득세 신고소득을 12로 나눈 금액이 기준입니다. 프리랜서·무직 등 소득이
                없으면 국민연금공단에 신고한 금액이 기준이 됩니다.
              </span>
            </label>
          </div>
        </div>

        {/* 오른쪽: 결과 */}
        <div className="space-y-5 lg:sticky lg:top-20">
          <div className="overflow-hidden rounded-xl border border-[rgba(46,68,148,0.14)]">
            <div className="bg-[#2E4494] px-5 py-4 text-white">
              <p className="text-sm opacity-80">월 예상 연금보험료 (지역가입자, 전액 본인부담)</p>
              <p className="text-3xl font-bold tabular-nums">{won(result.premium)}</p>
            </div>
            {(result.capApplied || result.floorApplied) && (
              <div className="border-t border-[rgba(46,68,148,0.10)] bg-[#FDF3F2] px-5 py-3 text-xs leading-relaxed text-[#B3372C]">
                {result.capApplied &&
                  "입력한 소득이 상한액(659만원)을 넘어 상한 기준으로 계산했습니다."}
                {result.floorApplied &&
                  "입력한 소득이 하한액(41만원)보다 낮아 하한 기준으로 계산했습니다."}
              </div>
            )}
            <dl className="divide-y divide-[rgba(46,68,148,0.10)] bg-white text-sm">
              <Row label="기준소득월액" value={won(result.standardIncome)} muted />
              <Row label="보험료율" value="9.5%" muted />
              <Row label="직장가입자였다면 본인부담분" value={won(result.employeeShareIfWorkplace)} bold />
            </dl>
          </div>

          {result.lowIncomeSupportEligible && (
            <div className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-[#F0F5FF] p-4 text-xs leading-relaxed text-[#2E4494]">
              기준소득월액이 80만원 미만이면 저소득 지역가입자 보험료 지원제도 대상일 수 있습니다.
              보험료의 50%(월 최대 46,350원)를 국가가 지원하며, 생애 최대 12개월까지 받을 수
              있습니다. 국민연금공단(1355)에서 자격을 확인해보세요.
            </div>
          )}

          <div className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-5 text-xs leading-relaxed text-[#7A8296]">
            <p className="font-semibold text-[#5B6478] mb-2">지역가입자는 왜 더 부담스러울까요</p>
            <p>
              직장가입자(사업장가입자)는 보험료를 회사와 절반씩(각 4.75%) 나눠 내지만, 지역가입자는
              9.5% 전액을 본인이 부담합니다. 같은 기준소득월액이라도 지역가입자의 실제 부담은
              직장가입자의 2배입니다.
            </p>
            <p className="mt-3">
              기준소득월액 상하한액은 2026년 7월부터 2027년 6월까지 하한 41만원, 상한 659만원이
              적용됩니다(2025년 7월~2026년 6월은 하한 40만원, 상한 637만원이었습니다). 매년 7월에
              보건복지부 고시로 갱신됩니다.
            </p>
          </div>
        </div>
      </div>

      <p className="mt-6 text-xs leading-relaxed text-[#8B93A6]">
        ※ 참고용 추정치입니다. 실제 기준소득월액은 국민연금공단이 신고소득을 바탕으로 결정하며,
        재산·사업 형태에 따라 세부 절차가 다를 수 있습니다. 정확한 금액은 국민연금공단(1355) 또는
        관할 지사에서 확인하시기 바랍니다.
      </p>
      <AdSlot id="calc-national-pension-premium-bottom" />
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
