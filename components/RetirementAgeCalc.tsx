"use client";

import { useMemo, useState } from "react";
import AdSlot from "@/components/AdSlot";
import { calcRetirementDate, formatYearsMonthsDays, type JobCategory } from "@/lib/retirementAgeCalc";

function formatDate(d: Date): string {
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export default function RetirementAgeCalc() {
  const [birthDate, setBirthDate] = useState("1975-05-10");
  const [category, setCategory] = useState<JobCategory>("teacher-school");

  const result = useMemo(() => {
    const d = new Date(birthDate);
    if (isNaN(d.getTime())) return null;
    return calcRetirementDate(d.getFullYear(), d.getMonth() + 1, d.getDate(), category);
  }, [birthDate, category]);

  const remaining = useMemo(() => {
    if (!result) return null;
    const today = new Date();
    return formatYearsMonthsDays(today, result.retirementDate);
  }, [result]);

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
        반영하지 않습니다.
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
