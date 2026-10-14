"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import AdSlot from "@/components/AdSlot";
import MoneyInput from "@/components/MoneyInput";
import { calcRetirementDate, formatYearsMonthsDays, type JobCategory } from "@/lib/retirementAgeCalc";
import { calcRetirementMoney, CIVIL_GRADES } from "@/lib/retirementMoneyCalc";

const won = (n: number) => Math.round(n).toLocaleString("ko-KR") + "원";

function formatDate(d: Date): string {
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function RetirementAgeCalc() {
  const [birthDate, setBirthDate] = useState("1975-05-10");
  const [category, setCategory] = useState<JobCategory>("teacher-school");
  const [today] = useState(() => new Date());

  // 퇴직 후 받을 돈(선택 입력)
  const [hireDate, setHireDate] = useState("2000-03-01");
  const [hobong, setHobong] = useState(35);
  const [grade, setGrade] = useState<string>("7급");
  const [baseIncomeManwon, setBaseIncomeManwon] = useState(0);

  const result = useMemo(() => {
    const d = new Date(birthDate);
    if (isNaN(d.getTime())) return null;
    return calcRetirementDate(d.getFullYear(), d.getMonth() + 1, d.getDate(), category);
  }, [birthDate, category]);

  const remaining = useMemo(() => {
    if (!result) return null;
    return formatYearsMonthsDays(today, result.retirementDate);
  }, [result, today]);

  const moneySupported = category !== "teacher-university";
  const moneyCategory = category === "general-civil" ? "civil" : "teacher";
  const maxHobong = moneyCategory === "civil" ? 32 : 40;
  const safeHobong = Math.min(Math.max(hobong, 1), maxHobong);

  const money = useMemo(() => {
    if (!result || !moneySupported || !hireDate) return null;
    return calcRetirementMoney({
      category: moneyCategory,
      hireDate,
      retireDate: toISO(result.retirementDate),
      retireAge: result.retirementAge,
      currentHobong: safeHobong,
      currentGrade: grade,
      today: toISO(today),
      baseIncomeOverrideWon: baseIncomeManwon > 0 ? baseIncomeManwon * 10000 : undefined,
    });
  }, [result, moneySupported, moneyCategory, hireDate, safeHobong, grade, today, baseIncomeManwon]);

  const pensionLink = result
    ? `/calc/pension-net?occ=${moneyCategory}&hire=${hireDate}&retire=${toISO(result.retirementDate)}&age=${result.retirementAge}&hobong=${safeHobong}${
        moneyCategory === "civil" ? `&grade=${encodeURIComponent(grade)}` : ""
      }`
    : "/calc/pension-net";

  return (
    <div className="mx-auto max-w-[1280px] px-4">
      <div className="grid gap-6 lg:grid-cols-[380px_1fr] lg:items-start">
        {/* 왼쪽: 입력 */}
        <div className="space-y-4">
          <div className="space-y-4 rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#2E4494]">기본 입력</p>
              <p className="mt-0.5 text-base font-bold text-[#1B2A4A]">생년월일·직군</p>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-[#5B6478]">생년월일</span>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="mt-1.5 w-full min-h-[44px] rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-3 py-2.5"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-[#5B6478]">직군</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as JobCategory)}
                className="mt-1.5 w-full min-h-[44px] rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-3 py-2.5"
              >
                <option value="teacher-school">초·중·고 교원 (정년 62세)</option>
                <option value="teacher-university">대학교원 (정년 65세)</option>
                <option value="general-civil">일반직 공무원 (정년 60세)</option>
              </select>
              <span className="mt-1 block text-xs font-normal text-[#8B93A6]">
                사립학교 교원도 사립학교법에 따라 동일한 정년이 적용됩니다.
              </span>
            </label>
          </div>

          {moneySupported ? (
            <div className="space-y-4 rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#2E4494]">선택 입력</p>
                <p className="mt-0.5 text-base font-bold text-[#1B2A4A]">퇴직 후 받을 돈까지 계산</p>
              </div>

              <label className="block">
                <span className="text-sm font-medium text-[#5B6478]">임용일</span>
                <input
                  type="date"
                  value={hireDate}
                  onChange={(e) => setHireDate(e.target.value)}
                  className="mt-1.5 w-full min-h-[44px] rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-3 py-2.5"
                />
              </label>

              {moneyCategory === "civil" && (
                <label className="block">
                  <span className="text-sm font-medium text-[#5B6478]">현재 급수</span>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="mt-1.5 w-full min-h-[44px] rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-3 py-2.5"
                  >
                    {CIVIL_GRADES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <label className="block">
                <span className="text-sm font-medium text-[#5B6478]">현재 호봉</span>
                <input
                  type="number"
                  min={1}
                  max={maxHobong}
                  value={hobong}
                  onChange={(e) => setHobong(Number(e.target.value) || 1)}
                  className="mt-1.5 w-full min-h-[44px] rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-3 py-2.5"
                />
                <span className="mt-1 block text-xs font-normal text-[#8B93A6]">
                  1~{maxHobong}호봉. 정년까지 매년 1호봉씩 오르는 것으로 계산합니다.
                </span>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-[#5B6478]">
                  퇴직수당 기준소득월액 (만 원, 선택)
                </span>
                <MoneyInput value={baseIncomeManwon} onChange={setBaseIncomeManwon} placeholder="비우면 봉급표 값으로 근사" />
                <span className="mt-1 block text-xs font-normal text-[#8B93A6]">
                  급여명세서의 기준소득월액을 알면 입력하세요. 수당이 포함된 값이라 더 정확합니다.
                </span>
              </label>
            </div>
          ) : (
            <div className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-white p-4 text-xs leading-relaxed text-[#7A8296]">
              대학교원은 봉급 체계가 달라 퇴직수당·연금 예상 계산을 지원하지 않습니다. 정년퇴직일만 계산합니다.
            </div>
          )}
        </div>

        {/* 오른쪽: 결과 */}
        <div className="space-y-5 lg:sticky lg:top-20">
          {result && (
            <div className="overflow-hidden rounded-xl border border-[rgba(46,68,148,0.14)]">
              <div className="bg-[#2E4494] px-5 py-4 text-white">
                <p className="text-sm opacity-80">정년퇴직일</p>
                <p className="text-3xl font-bold tabular-nums">{formatDate(result.retirementDate)}</p>
              </div>
              <dl className="divide-y divide-[rgba(46,68,148,0.10)] bg-white text-sm">
                <Row label="정년연령" value={`만 ${result.retirementAge}세`} muted />
                <Row label={`만 ${result.retirementAge}세 도달일`} value={formatDate(result.reachDate)} muted />
                <Row label="오늘부터 남은 기간" value={remaining ?? "-"} bold />
              </dl>
            </div>
          )}

          {moneySupported && result && (
            <div className="overflow-hidden rounded-xl border border-[rgba(46,68,148,0.14)]">
              <div className="bg-[#1B2A4A] px-5 py-3 text-white">
                <p className="text-sm font-semibold">정년퇴직 후 받을 돈 (예상)</p>
              </div>
              {money ? (
                <>
                  <dl className="divide-y divide-[rgba(46,68,148,0.10)] bg-white text-sm">
                    <Row label="재직기간" value={`${money.totalYears.toFixed(1)}년`} muted />
                    <Row label="정년퇴직 시 호봉(추정)" value={`${money.hobongAtRetire}호봉`} muted />
                    <Row label="기준소득월액(추정)" value={won(money.baseIncome)} muted />
                    <Row
                      label={`퇴직수당 (재직 ${money.severanceYears}년, 지급율 ${(money.severanceRate * 100).toFixed(2).replace(/\.?0+$/, "")}%)`}
                      value={won(money.severance)}
                      bold
                    />
                    {money.eligible ? (
                      <>
                        <Row
                          label={`월 연금 (개시연령 ${money.eligibleAge}세 이후 수령)`}
                          value={won(money.pensionAtEligibleAge)}
                          bold
                        />
                        {money.yearsEarly > 0 && (
                          <Row
                            label={`정년퇴직 직후 조기수령 시 (−${money.yearsEarly * 5}%)`}
                            value={won(money.pensionEarly)}
                            muted
                          />
                        )}
                      </>
                    ) : (
                      <Row label="연금" value="재직 10년 미만 — 퇴직일시금 대상" muted />
                    )}
                  </dl>
                  <div className="space-y-1.5 border-t border-[rgba(46,68,148,0.10)] bg-[rgba(46,68,148,0.03)] px-5 py-3 text-xs leading-relaxed text-[#7A8296]">
                    {money.eligible && money.yearsEarly > 0 && (
                      <p>
                        퇴직연도 기준 연금 개시연령은 {money.eligibleAge}세로, 정년퇴직 나이({result.retirementAge}세)보다{" "}
                        {money.yearsEarly}년 늦습니다. 개시연령까지 기다리면 감액이 없고, 정년퇴직 직후 받으면
                        조기퇴직연금으로 1년당 5% 감액됩니다.
                      </p>
                    )}
                    <p>
                      봉급표 값 기준 근사입니다. 실제 기준소득월액은 수당이 포함되어 더 높고, 향후 봉급 인상은
                      반영하지 않았고, 표의 최고 호봉을 넘는 구간은 최고 호봉 봉급으로 고정해 계산합니다. 33년을 넘는
                      재직기간은 퇴직수당 계산에서 33년까지만 인정됩니다.
                    </p>
                  </div>
                </>
              ) : (
                <div className="bg-white px-5 py-4 text-sm text-[#7A8296]">임용일이 정년퇴직일보다 앞서야 합니다.</div>
              )}
              <div className="grid gap-2 border-t border-[rgba(46,68,148,0.10)] bg-white p-4 sm:grid-cols-2">
                <Link
                  href={pensionLink}
                  className="rounded-lg border border-[rgba(46,68,148,0.22)] px-3 py-2.5 text-center text-sm font-medium text-[#2E4494] transition hover:bg-[rgba(46,68,148,0.06)]"
                >
                  연금 구간별로 자세히 →
                </Link>
                <Link
                  href="/calc/severance-pay"
                  className="rounded-lg border border-[rgba(46,68,148,0.22)] px-3 py-2.5 text-center text-sm font-medium text-[#2E4494] transition hover:bg-[rgba(46,68,148,0.06)]"
                >
                  퇴직수당 직접 계산 →
                </Link>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-5 text-xs leading-relaxed text-[#7A8296]">
            <p className="font-semibold text-[#5B6478] mb-2">왜 생일에 바로 퇴직하지 않을까요</p>
            <p>
              교원은 학기제 운영을 고려해 정년에 이른 날이 3~8월이면 8월 31일, 9월~다음 해
              2월이면 다음 해 2월 말일에 퇴직합니다(교육공무원법 제47조). 일반직 공무원은
              정년에 이른 날이 1~6월이면 6월 30일, 7~12월이면 12월 31일에 퇴직합니다(국가공무원법
              제74조).
            </p>
          </div>
        </div>
      </div>

      <p className="mt-6 text-xs leading-relaxed text-[#8B93A6]">
        ※ 참고용 계산입니다. 경찰·소방·군인 등은 계급별로 별도의 정년 규정(계급정년 포함)이
        적용되어 이 계산기의 대상이 아닙니다. 명예퇴직 등으로 정년 이전에 퇴직하는 경우는
        반영하지 않습니다. 연금 개시연령은 1996~2009년 임용자 기준(퇴직연도별 62~65세)이며,
        2010년 이후 임용자는 65세로 보수적으로 계산했습니다.
      </p>
      <AdSlot id="calc-retirement-age-bottom" />
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
