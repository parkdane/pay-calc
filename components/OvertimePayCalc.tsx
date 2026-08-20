"use client";

import { useMemo, useState } from "react";
import civil from "@/data/salary-civil-2026.json";
import police from "@/data/salary-police-2026.json";
import fire from "@/data/salary-fire-2026.json";
import teacher from "@/data/salary-teacher-2026.json";
import rates from "@/data/tax-rates-2026.json";
import AdSlot from "@/components/AdSlot";

const won = (n: number) => Math.round(n).toLocaleString("ko-KR") + "원";

const OCCUPATIONS = [
  { id: "civil", label: "일반직 공무원", data: civil, columns: civil.columns, singleColumn: false },
  { id: "police", label: "경찰", data: police, columns: police.columns, singleColumn: false },
  { id: "fire", label: "소방", data: fire, columns: fire.columns, singleColumn: false },
  { id: "teacher", label: "교사 (유·초·중·고)", data: teacher, columns: teacher.columns, singleColumn: true },
] as const;

const BASE_HOBONG = rates.overtime.baseHobong;
const REDUCTION_60_GRADES: readonly string[] = rates.overtime.reduction60Grades;
const REDUCTION_DEFAULT = rates.overtime.reductionDefault;
const REDUCTION_60 = rates.overtime.reduction60;
const MAX_HOURS = rates.overtime.maxHours;

export default function OvertimePayCalc() {
  const [occIdx, setOccIdx] = useState(0);
  const occ = OCCUPATIONS[occIdx];
  const [gradeIdx, setGradeIdx] = useState(occ.columns.length - 1);
  const [hours, setHours] = useState(20);

  const gradeLabel = occ.columns[gradeIdx];

  const result = useMemo(() => {
    const row = occ.data.rows.find((r) => r.hobong === BASE_HOBONG);
    if (!row) return null;
    const basePay = row.pay[gradeIdx];
    if (basePay === undefined || basePay === null) return null;

    const reduction = REDUCTION_60_GRADES.includes(gradeLabel) ? REDUCTION_60 : REDUCTION_DEFAULT;
    const hourlyRate = ((basePay * reduction) / 209) * 1.5;
    const cappedHours = Math.min(hours, MAX_HOURS);
    const total = hourlyRate * cappedHours;

    return { basePay, reduction, hourlyRate, cappedHours, total };
  }, [occ, gradeIdx, gradeLabel, hours]);

  return (
    <div className="mx-auto max-w-[1280px] px-4">
      <div className="grid gap-6 lg:grid-cols-[380px_1fr] lg:items-start">
        {/* 왼쪽: 입력 */}
        <div className="space-y-4">
          <div className="space-y-4 rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#2E4494]">기본 입력</p>
              <p className="mt-0.5 text-base font-bold text-[#1B2A4A]">직군·직급·초과근무시간</p>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-[#5B6478]">직군</span>
              <select
                value={occIdx}
                onChange={(e) => {
                  const idx = Number(e.target.value);
                  setOccIdx(idx);
                  setGradeIdx(OCCUPATIONS[idx].columns.length - 1);
                }}
                className="mt-1.5 w-full min-h-[44px] rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-3 py-3"
              >
                {OCCUPATIONS.map((o, i) => (
                  <option key={o.id} value={i}>{o.label}</option>
                ))}
              </select>
            </label>

            {!occ.singleColumn && (
              <label className="block">
                <span className="text-sm font-medium text-[#5B6478]">직급·계급</span>
                <select
                  value={gradeIdx}
                  onChange={(e) => setGradeIdx(Number(e.target.value))}
                  className="mt-1.5 w-full min-h-[44px] rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-3 py-3"
                >
                  {occ.columns.map((c, i) => (
                    <option key={c} value={i}>{c}</option>
                  ))}
                </select>
              </label>
            )}

            <label className="block">
              <span className="text-sm font-medium text-[#5B6478]">이번 달 초과근무 시간</span>
              <input
                type="number"
                min={0}
                max={57}
                value={hours}
                onChange={(e) => setHours(Number(e.target.value) || 0)}
                className="mt-1.5 w-full min-h-[44px] rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-3 py-2.5"
              />
              <span className="mt-1 block text-xs font-normal text-[#8B93A6]">
                월 최대 인정 시간은 57시간입니다.
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
                  <p className="text-sm opacity-80">이번 달 시간외근무수당</p>
                  <p className="text-3xl font-bold tabular-nums">{won(result.total)}</p>
                </div>
                <dl className="divide-y divide-[rgba(46,68,148,0.10)] bg-white text-sm">
                  <Row label={`기준호봉(${BASE_HOBONG}호봉) 봉급액`} value={won(result.basePay)} muted />
                  <Row label="감액조정률" value={`${(result.reduction * 100).toFixed(0)}%`} muted />
                  <Row label="시간당 단가" value={won(result.hourlyRate)} bold />
                  <Row label="인정 시간" value={`${result.cappedHours}시간`} muted />
                </dl>
              </div>

              <div className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-5 text-xs leading-relaxed text-[#7A8296]">
                <p className="font-semibold text-[#5B6478] mb-2">계산 방식</p>
                <p>
                  시간당 단가 = 기준호봉({BASE_HOBONG}호봉) 봉급액 × 감액조정률 ÷ 209 × 150%. 2026년부터
                  9급·8급(상당)은 감액조정률 60%, 그 외는 55%가 적용됩니다. 일반 사무직은 별도 명령
                  없이도 월 10시간의 정액분이 지급되는 경우가 많으니, 소속 기관의 실제 지급 기준을
                  함께 확인하세요.
                </p>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-6 text-center text-sm text-[#8B93A6]">
              입력값을 확인해주세요.
            </div>
          )}
        </div>
      </div>

      <p className="mt-6 text-xs leading-relaxed text-[#8B93A6]">
        ※ 참고용 추정치입니다. 위험근무수당 등 직종별 추가 수당은 반영하지 않았습니다. 정확한 금액은
        소속 기관 급여명세서로 확인하시기 바랍니다.
      </p>
      <AdSlot id="calc-overtime-pay-bottom" />
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
