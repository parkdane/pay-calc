"use client";

import { useMemo, useState } from "react";
import civilHistory from "@/data/pension-civil-history.json";
import policeFireHistory from "@/data/pension-police_fire-history.json";
import teacherHistory from "@/data/pension-teacher-history.json";
import militaryHistory from "@/data/pension-military-history.json";
import {
  calcPension,
  type HistorySnapshot,
  type CareerSegment,
} from "@/lib/pensionCalc";

const won = (n: number) => Math.round(n).toLocaleString("ko-KR") + "원";

const OCCUPATIONS = [
  { id: "civil", label: "일반직 공무원", history: civilHistory as HistorySnapshot[], grades: ["1급","2급","3급","4급","5급","6급","7급","8급","9급"], singleColumn: false },
  { id: "police_fire", label: "경찰·소방", history: policeFireHistory as HistorySnapshot[], grades: ["치안정감","치안감","경무관","총경","경정","경감","경위","경사","경장","순경"], singleColumn: false },
  { id: "teacher", label: "교사 (유·초·중·고)", history: teacherHistory as HistorySnapshot[], grades: [], singleColumn: true },
  { id: "military", label: "군인 간부", history: militaryHistory as HistorySnapshot[], grades: ["소장","준장","대령","중령","소령","대위","중위","소위","준위","원사","상사","중사","하사"], singleColumn: false },
] as const;

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function yearsBetween(a: string, b: string) {
  return (new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
}

type PromotionRow = { id: string; startDate: string; grade: string; hobong: number };

export default function PensionNetCalc() {
  const [occIdx, setOccIdx] = useState(0);
  const occ = OCCUPATIONS[occIdx];

  const [hireDate, setHireDate] = useState("2015-03-01");
  const [retireDate, setRetireDate] = useState("2050-03-01");
  const [retireAge, setRetireAge] = useState(60);

  const [currentGrade, setCurrentGrade] = useState<string>(occ.grades[occ.grades.length - 1] || "");
  const [currentHobong, setCurrentHobong] = useState(10);

  const [useDetail, setUseDetail] = useState(false);
  const [promotions, setPromotions] = useState<PromotionRow[]>([]);

  const segments: CareerSegment[] = useMemo(() => {
    if (!useDetail || promotions.length === 0) {
      // 기본 모드: 현재 직급을 임용일부터 유지했다고 가정, 오늘 기준 호봉에서 역산
      const yearsSinceHire = Math.max(yearsBetween(hireDate, todayStr()), 0);
      const startHobong = Math.max(currentHobong - Math.floor(yearsSinceHire), 1);
      return [
        {
          startDate: hireDate,
          grade: occ.singleColumn ? null : currentGrade,
          startHobong,
        },
      ];
    }
    // 상세 모드: 승진 이력 그대로 세그먼트로 사용
    return promotions
      .slice()
      .sort((a, b) => (a.startDate > b.startDate ? 1 : -1))
      .map((p) => ({
        startDate: p.startDate,
        grade: occ.singleColumn ? null : p.grade,
        startHobong: p.hobong,
      }));
  }, [useDetail, promotions, hireDate, currentGrade, currentHobong, occ.singleColumn]);

  const result = useMemo(() => {
    if (!hireDate || !retireDate || new Date(retireDate) <= new Date(hireDate)) return null;
    if (useDetail && promotions.length === 0) return null;
    try {
      return calcPension({
        historicalData: occ.history,
        segments,
        hireDate,
        retireDate,
        retireAge,
      });
    } catch {
      return null;
    }
  }, [occ.history, segments, hireDate, retireDate, retireAge, useDetail, promotions.length]);

  function addPromotion() {
    setPromotions((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).slice(2),
        startDate: prev.length === 0 ? hireDate : todayStr(),
        grade: occ.grades[occ.grades.length - 1] || "",
        hobong: 1,
      },
    ]);
  }

  return (
    <div className="mx-auto max-w-[1280px] px-4">
      <div className="grid gap-6 lg:grid-cols-[380px_1fr] lg:items-start">
        {/* ═══ 왼쪽: 입력 ═══ */}
        <div className="space-y-4">
          <div className="space-y-4 rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#2E4494]">기본 입력</p>
              <p className="mt-0.5 text-base font-bold text-[#1B2A4A]">직군·재직기간</p>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-[#5B6478]">직군</span>
              <select
                value={occIdx}
                onChange={(e) => {
                  const idx = Number(e.target.value);
                  setOccIdx(idx);
                  setCurrentGrade(OCCUPATIONS[idx].grades[OCCUPATIONS[idx].grades.length - 1] || "");
                  setPromotions([]);
                }}
                className="mt-1.5 w-full rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-3 py-3"
              >
                {OCCUPATIONS.map((o, i) => (
                  <option key={o.id} value={i}>{o.label}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-[#5B6478]">임용일</span>
              <input
                type="date"
                value={hireDate}
                onChange={(e) => setHireDate(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-3 py-2.5"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-[#5B6478]">예상 퇴직(연금개시)일</span>
              <input
                type="date"
                value={retireDate}
                onChange={(e) => setRetireDate(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-3 py-2.5"
              />
              <span className="mt-1 block text-xs font-normal text-[#8B93A6]">
                연금을 실제로 받기 시작하는 날짜 기준입니다. 조기수급 시 감액에 반영됩니다.
              </span>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-[#5B6478]">퇴직(수급개시) 시 나이</span>
              <input
                type="number"
                min={40}
                max={75}
                value={retireAge}
                onChange={(e) => setRetireAge(Number(e.target.value) || 60)}
                className="mt-1.5 w-full rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-3 py-2.5"
              />
            </label>

            {!occ.singleColumn && (
              <label className="block">
                <span className="text-sm font-medium text-[#5B6478]">현재 직급</span>
                <select
                  value={currentGrade}
                  onChange={(e) => setCurrentGrade(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-3 py-3"
                >
                  {occ.grades.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </label>
            )}

            <label className="block">
              <span className="text-sm font-medium text-[#5B6478]">오늘 기준 호봉</span>
              <input
                type="number"
                min={1}
                max={45}
                value={currentHobong}
                onChange={(e) => setCurrentHobong(Number(e.target.value) || 1)}
                className="mt-1.5 w-full rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-3 py-2.5"
              />
            </label>
          </div>

          {/* 상세 옵션: 승진 이력 */}
          <details
            className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-4"
            onToggle={(e) => setUseDetail((e.target as HTMLDetailsElement).open)}
          >
            <summary className="cursor-pointer text-sm font-semibold text-[#1B2A4A]">
              승진 이력 반영 — 더 정확하게 ▾
            </summary>
            <div className="mt-4 space-y-3">
              <p className="text-xs text-[#8B93A6]">
                기본값은 &quot;현재 직급을 임용일부터 계속 유지했다&quot;고 가정한 근사치입니다.
                실제 승진 이력(발령일·직급·그 시점 호봉)을 입력하면 과거 소득을 더 정확히 반영합니다.
              </p>
              {promotions.map((p, i) => (
                <div key={p.id} className="grid grid-cols-[1fr_1fr_70px_28px] gap-2 items-end">
                  <label className="block">
                    <span className="text-xs text-[#5B6478]">발령일</span>
                    <input
                      type="date"
                      value={p.startDate}
                      onChange={(e) => {
                        const v = e.target.value;
                        setPromotions((prev) => prev.map((x, idx) => (idx === i ? { ...x, startDate: v } : x)));
                      }}
                      className="mt-1 w-full rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-2 py-2 text-sm"
                    />
                  </label>
                  {!occ.singleColumn && (
                    <label className="block">
                      <span className="text-xs text-[#5B6478]">직급</span>
                      <select
                        value={p.grade}
                        onChange={(e) => {
                          const v = e.target.value;
                          setPromotions((prev) => prev.map((x, idx) => (idx === i ? { ...x, grade: v } : x)));
                        }}
                        className="mt-1 w-full rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-2 py-2 text-sm"
                      >
                        {occ.grades.map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </label>
                  )}
                  <label className="block">
                    <span className="text-xs text-[#5B6478]">호봉</span>
                    <input
                      type="number"
                      min={1}
                      value={p.hobong}
                      onChange={(e) => {
                        const v = Number(e.target.value) || 1;
                        setPromotions((prev) => prev.map((x, idx) => (idx === i ? { ...x, hobong: v } : x)));
                      }}
                      className="mt-1 w-full rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-2 py-2 text-sm"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setPromotions((prev) => prev.filter((_, idx) => idx !== i))}
                    className="mb-0.5 h-9 rounded-lg border border-[rgba(46,68,148,0.22)] text-xs text-[#7A8296] hover:bg-white"
                  >
                    삭제
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addPromotion}
                className="w-full rounded-lg border border-dashed border-[rgba(46,68,148,0.3)] py-2 text-sm font-medium text-[#2E4494] hover:bg-white"
              >
                + 발령 구간 추가 (첫 구간은 임용 당시 직급·호봉)
              </button>
              {useDetail && promotions.length === 0 && (
                <p className="text-xs text-[#C0392B]">
                  최소 1개 이상 구간을 추가해야 상세 모드가 적용됩니다. 비어있으면 기본 모드로 계산됩니다.
                </p>
              )}
            </div>
          </details>
        </div>

        {/* ═══ 오른쪽: 결과 ═══ */}
        <div className="space-y-5 lg:sticky lg:top-20">
          {result ? (
            <>
              <div className="overflow-hidden rounded-xl border border-[rgba(46,68,148,0.14)]">
                <div className="bg-[#2E4494] px-5 py-4 text-white">
                  <p className="text-sm opacity-80">예상 월 연금액</p>
                  <p className="text-3xl font-bold tabular-nums">{won(result.finalPension)}</p>
                  {result.wasCapApplied && (
                    <p className="mt-1 text-xs opacity-80">※ 76% 상한이 적용된 금액입니다</p>
                  )}
                </div>
                <dl className="divide-y divide-[rgba(46,68,148,0.10)] bg-white text-sm">
                  <Row label="총 재직연수" value={`${result.totalYears.toFixed(1)}년`} />
                  <Row label="1구간(~2009, 구법)" value={`${result.periods.tier1Years.toFixed(1)}년 · ${won(result.tierPensions.t1)}`} muted />
                  <Row label="2구간(2010~2015, 과도기)" value={`${result.periods.tier2Years.toFixed(1)}년 · ${won(result.tierPensions.t2)}`} muted />
                  <Row label="3구간(2016~, 신법)" value={`${result.periods.tier3Years.toFixed(1)}년 · ${won(result.tierPensions.t3)}`} muted />
                  <Row label="상한 적용 전 합계" value={won(result.beforeCap)} bold />
                  {result.yearsEarly > 0 && (
                    <Row label="조기수급 감액" value={`-${(result.yearsEarly * 5)}% (${result.yearsEarly}년 조기)`} muted />
                  )}
                </dl>
              </div>

              <div className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-5 text-xs leading-relaxed text-[#7A8296]">
                <p className="font-semibold text-[#5B6478] mb-2">이 계산의 근사치 3가지</p>
                <ul className="space-y-1">
                  <li>· 기준소득월액을 봉급표 값으로 근사했습니다. 실제 기준소득월액은 각종 수당이 포함되어 이보다 높을 수 있습니다.</li>
                  <li>· 소득재분배 계산에 쓰이는 &quot;전체 공무원 평균 기준소득월액&quot;은 2026년 값(571만원)을 고정 사용했습니다.</li>
                  <li>· 연금개시가능연령은 65세로 근사했습니다. 2010년 이전 임용자는 실제로 이보다 빠를 수 있습니다(60~64세).</li>
                </ul>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-6 text-center text-sm text-[#8B93A6]">
              {useDetail && promotions.length === 0
                ? "승진 이력을 1개 이상 추가하거나 상세 모드를 꺼주세요."
                : "임용일과 퇴직일을 확인해주세요."}
            </div>
          )}
        </div>
      </div>

      <p className="mt-6 text-xs leading-relaxed text-[#8B93A6]">
        ※ 참고용 추정치입니다. 실제 수령액은 공무원연금공단의 공식 계산 결과를 기준으로 삼으시기 바랍니다.
        이 계산기는 1997~2026년 실제 봉급표(국가법령정보 공동활용 API)를 기반으로 재직기간 평균소득을 추정하고,
        공무원연금법상 3단계 산식(구법·과도기·신법 소득재분배)을 반영합니다.
      </p>
    </div>
  );
}

function Row({ label, value, bold, muted }: { label: string; value: string; bold?: boolean; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between px-5 py-2.5">
      <dt className={muted ? "text-[#7A8296]" : "font-medium text-[#1B2A4A]"}>{label}</dt>
      <dd className={`tabular-nums text-right ${bold ? "font-bold text-[#1B2A4A]" : muted ? "text-[#7A8296]" : "text-[#1B2A4A]"}`}>
        {value}
      </dd>
    </div>
  );
}
