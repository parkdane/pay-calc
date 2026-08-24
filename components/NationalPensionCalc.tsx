"use client";

import { useMemo, useState } from "react";
import MoneyInput from "@/components/MoneyInput";
import AdSlot from "@/components/AdSlot";
import { calcNationalPension, getEligibleAge } from "@/lib/nationalPensionCalc";

const won = (n: number) => Math.round(n).toLocaleString("ko-KR") + "원";

export default function NationalPensionCalc() {
  const [birthYear, setBirthYear] = useState(1990);
  const [startYear, setStartYear] = useState(2015);
  const [startMonth, setStartMonth] = useState(3);
  const [avgIncomeManwon, setAvgIncomeManwon] = useState(300);

  const eligibleAge = getEligibleAge(birthYear);
  const endYear = birthYear + eligibleAge;

  const [claimType, setClaimType] = useState<"early" | "normal" | "deferred">("normal");
  const [claimShift, setClaimShift] = useState(3);

  const [hasSpouse, setHasSpouse] = useState(false);
  const [childrenOrParents, setChildrenOrParents] = useState(0);

  const result = useMemo(() => {
    if (endYear <= startYear) return null;
    try {
      return calcNationalPension({
        startYear,
        startMonth,
        endYear,
        endMonth: startMonth === 1 ? 12 : startMonth - 1,
        avgMonthlyIncome: avgIncomeManwon * 10000,
        claimType,
        claimYearsShift: claimShift,
        dependents: { spouse: hasSpouse, childrenOrParents, disabledChildren: 0 },
      });
    } catch {
      return null;
    }
  }, [startYear, startMonth, endYear, avgIncomeManwon, claimType, claimShift, hasSpouse, childrenOrParents]);

  return (
    <div className="mx-auto max-w-[1280px] px-4">
      <div className="grid gap-6 lg:grid-cols-[380px_1fr] lg:items-start">
        {/* 왼쪽: 입력 */}
        <div className="space-y-4">
          <div className="space-y-4 rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#2E4494]">기본 입력</p>
              <p className="mt-0.5 text-base font-bold text-[#1B2A4A]">출생연도·가입기간·평균소득</p>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-[#5B6478]">출생연도</span>
              <input
                type="number"
                min={1950}
                max={2010}
                value={birthYear}
                onChange={(e) => setBirthYear(Number(e.target.value) || 1990)}
                className="mt-1.5 w-full min-h-[44px] rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-3 py-2.5"
              />
              <span className="mt-1 block text-xs font-normal text-[#8B93A6]">
                노령연금 지급개시연령은 {eligibleAge}세입니다.
              </span>
            </label>

            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <span className="text-sm font-medium text-[#5B6478]">가입 시작년도</span>
                <input
                  type="number"
                  min={1988}
                  max={2026}
                  value={startYear}
                  onChange={(e) => setStartYear(Number(e.target.value) || 2015)}
                  className="mt-1.5 w-full min-h-[44px] rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-3 py-2.5"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-[#5B6478]">시작 월</span>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={startMonth}
                  onChange={(e) => setStartMonth(Number(e.target.value) || 1)}
                  className="mt-1.5 w-full min-h-[44px] rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-3 py-2.5"
                />
              </label>
            </div>
            <p className="text-xs text-[#8B93A6]">
              {eligibleAge}세가 되는 {endYear}년까지 계속 가입한다고 가정합니다 (총{" "}
              {Math.max(0, endYear - startYear)}년).
            </p>

            <label className="block">
              <span className="text-sm font-medium text-[#5B6478]">가입기간 평균 월소득 (만 원)</span>
              <MoneyInput value={avgIncomeManwon} onChange={setAvgIncomeManwon} placeholder="예: 300" />
              <span className="mt-1 block text-xs font-normal text-[#8B93A6]">
                국민연금 보험료를 낸 기준소득월액의 평균입니다. 과거 소득은 현재가치로 재평가되므로
                지금 월급과 비슷한 수준으로 넣으면 무난한 근사치가 됩니다.
              </span>
            </label>
          </div>

          <div className="space-y-4 rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-5">
            <p className="text-base font-bold text-[#1B2A4A]">수급 시기</p>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: "early", label: "조기" },
                  { id: "normal", label: "정상" },
                  { id: "deferred", label: "연기" },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setClaimType(t.id)}
                  className={`min-h-[44px] rounded-lg border text-sm font-medium transition ${
                    claimType === t.id
                      ? "border-[#2E4494] bg-[#2E4494] text-white"
                      : "border-[rgba(46,68,148,0.22)] bg-white text-[#5B6478]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            {claimType !== "normal" && (
              <label className="block">
                <span className="text-sm font-medium text-[#5B6478]">
                  {claimType === "early" ? "조기" : "연기"} 연수 (최대 5년)
                </span>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={claimShift}
                  onChange={(e) => setClaimShift(Number(e.target.value) || 1)}
                  className="mt-1.5 w-full min-h-[44px] rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-3 py-2.5"
                />
              </label>
            )}
          </div>

          <details className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-4">
            <summary className="cursor-pointer text-sm font-semibold text-[#1B2A4A]">
              부양가족 반영 — 더 정확하게 ▾
            </summary>
            <div className="mt-4 space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={hasSpouse}
                  onChange={(e) => setHasSpouse(e.target.checked)}
                  className="h-5 w-5"
                />
                <span className="text-sm text-[#5B6478]">배우자 있음</span>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-[#5B6478]">부양 자녀·부모 수</span>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={childrenOrParents}
                  onChange={(e) => setChildrenOrParents(Number(e.target.value) || 0)}
                  className="mt-1.5 w-full min-h-[44px] rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-3 py-2.5"
                />
              </label>
            </div>
          </details>
        </div>

        {/* 오른쪽: 결과 */}
        <div className="space-y-5 lg:sticky lg:top-20">
          {result ? (
            <>
              <div className="overflow-hidden rounded-xl border border-[rgba(46,68,148,0.14)]">
                <div className="bg-[#2E4494] px-5 py-4 text-white">
                  <p className="text-sm opacity-80">예상 월 연금액</p>
                  <p className="text-3xl font-bold tabular-nums">{won(result.finalPension)}</p>
                </div>
                {!result.eligible && (
                  <div className="border-t border-[rgba(46,68,148,0.10)] bg-[#FDF3F2] px-5 py-3 text-xs leading-relaxed text-[#B3372C]">
                    최소가입기간(10년)을 채우지 못했습니다. 이 경우 매월 연금이 아니라 반환일시금
                    형태로 받게 됩니다.
                  </div>
                )}
                <dl className="divide-y divide-[rgba(46,68,148,0.10)] bg-white text-sm">
                  <Row label="총 가입기간" value={`${result.totalYears.toFixed(1)}년`} />
                  <Row label="기본연금액" value={won(result.basePension)} muted />
                  {claimType !== "normal" && (
                    <Row
                      label={claimType === "early" ? "조기수급 감액" : "연기수급 가산"}
                      value={`${claimType === "early" ? "-" : "+"}${Math.abs((1 - result.claimFactor) * 100).toFixed(1)}%`}
                      muted
                    />
                  )}
                  {result.dependentMonthly > 0 && (
                    <Row label="부양가족연금액" value={won(result.dependentMonthly)} muted />
                  )}
                </dl>
              </div>

              <div className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-5 text-xs leading-relaxed text-[#7A8296]">
                <p className="font-semibold text-[#5B6478] mb-2">이 계산의 근사치</p>
                <ul className="space-y-1">
                  <li>
                    · 가입기간 평균소득(B값)을 사용자가 직접 입력한 단일 값으로 근사했습니다. 실제로는
                    매년 실제 소득을 현재가치로 재평가한 뒤 평균 내는 방식이라, 소득이 시기별로 크게
                    달랐다면 오차가 커질 수 있습니다.
                  </li>
                  <li>
                    · 전체가입자 평균소득(A값)은 2026년 적용값(3,193,511원)을 고정 사용했습니다. 실제
                    수급 시점의 A값은 매년 갱신됩니다.
                  </li>
                  <li>
                    · 2026년 이후 적용되는 소득대체 승수는 2025년 연금개혁(43% 목표) 반영치로
                    근사했습니다. 확정된 연도별 세부 조정안은 반영하지 못했습니다.
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-6 text-center text-sm text-[#8B93A6]">
              출생연도와 가입 시작년도를 확인해주세요.
            </div>
          )}
        </div>
      </div>

      <p className="mt-6 text-xs leading-relaxed text-[#8B93A6]">
        ※ 참고용 추정치입니다. 국민연금법 제51조 기본연금액 산식을 기준으로 계산하며, 실제 수령액은
        국민연금공단의 정확한 소득 이력·재평가율을 반영해야 확정됩니다. 정확한 금액은 국민연금공단
        &quot;내 연금 알아보기&quot; 서비스를 이용하시기 바랍니다.
      </p>
      <AdSlot id="calc-national-pension-bottom" />
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
