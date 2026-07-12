"use client";

import { useMemo, useState } from "react";
import military from "@/data/salary-military-2026.json";
import cfg from "@/data/military-allowances-2026.json";
import { monthlyIncomeTax } from "@/lib/incomeTax";
import AdSlot from "@/components/AdSlot";

const won = (n: number) => Math.round(n).toLocaleString("ko-KR") + "원";

// 모든 간부 호봉표를 하나의 계급 목록으로 펼침
type RankOption = {
  key: string;
  label: string;
  tableIdx: number;
  colIdx: number;
};

const RANKS: RankOption[] = military.officerTables.flatMap((t, tableIdx) =>
  t.columns.map((label, colIdx) => ({
    key: `${tableIdx}-${colIdx}`,
    label,
    tableIdx,
    colIdx,
  }))
);

export default function MilitaryNetCalc() {
  const [rankKey, setRankKey] = useState(RANKS[0].key);
  const [hobong, setHobong] = useState(1);
  // 수당 입력값 (id -> boolean | number)
  const [inputs, setInputs] = useState<Record<string, boolean | number>>({});
  // 상세 옵션
  const [years, setYears] = useState(0);
  const [useDetail, setUseDetail] = useState(false);

  const rank = RANKS.find((r) => r.key === rankKey)!;
  const table = military.officerTables[rank.tableIdx];

  // 선택한 계급에서 값이 있는 호봉만 추림
  const availableHobongs = table.rows
    .filter((row) => row.pay[rank.colIdx] !== null)
    .map((row) => row.hobong);

  const result = useMemo(() => {
    const row = table.rows.find((r) => r.hobong === hobong);
    const base = row ? row.pay[rank.colIdx] : null;
    if (base === null || base === undefined) return null;

    // 수당 계산
    let allowanceTotal = 0;
    const allowanceItems: { label: string; value: number }[] = [];

    for (const a of cfg.allowances) {
      const v = inputs[a.id];
      let amt = 0;

      if (a.type === "checkbox" && v === true && a.amount) {
        amt = a.amount;
      } else if (a.type === "number" && typeof v === "number" && v > 0) {
        if (a.formula === "overtime") {
          amt = (base / 209) * 1.5 * v;
        } else if (a.perUnit) {
          amt = a.perUnit * v;
        }
      }

      if (amt > 0) {
        allowanceTotal += amt;
        allowanceItems.push({ label: a.label, value: amt });
      }
    }

    const gross = base + allowanceTotal;
    void gross;

    if (useDetail) {
      const addon =
        cfg.regularBonusAddon.brackets.find((b) => years < b.underYears)?.amount ??
        cfg.regularBonusAddon.brackets[cfg.regularBonusAddon.brackets.length - 1].amount;
      const bonusRate =
        cfg.regularBonus.brackets.find((b) => years < b.underYears)?.rate ??
        cfg.regularBonus.brackets[cfg.regularBonus.brackets.length - 1].rate;
      const bonusMonthly = (base * bonusRate) / 6;
      if (addon > 0) {
        allowanceTotal += addon;
        allowanceItems.push({ label: "정근수당 가산금", value: addon });
      }
      if (bonusMonthly > 0) {
        allowanceTotal += bonusMonthly;
        allowanceItems.push({ label: "정근수당(월환산)", value: bonusMonthly });
      }
    }

    const grossFinal = base + allowanceTotal;

    const pension = base * cfg.pension.rate;
    const health = grossFinal * cfg.health.rate;
    const longTermCare = health * cfg.longTermCare.rateOfHealth;
    const spouseDep = inputs["spouse"] === true ? 1 : 0;
    const childrenDep = typeof inputs["children"] === "number" ? (inputs["children"] as number) : 0;
    const deps = useDetail ? spouseDep + childrenDep : 0;
    const incomeTax = monthlyIncomeTax(grossFinal, pension, deps);
    const localTax = Math.floor(incomeTax * cfg.localTaxRateOfIncomeTax);

    const deductions = [
      { label: cfg.pension.label, value: pension },
      { label: cfg.health.label, value: health },
      { label: cfg.longTermCare.label, value: longTermCare },
      { label: "소득세", value: incomeTax },
      { label: "지방소득세", value: localTax },
    ];
    const totalDeduction = deductions.reduce((s, d) => s + d.value, 0);
    const net = grossFinal - totalDeduction;

    return {
      base,
      allowanceItems,
      allowanceTotal,
      gross: grossFinal,
      deductions,
      totalDeduction,
      net,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rankKey, hobong, inputs, years, useDetail]);

  return (
    <div className="mx-auto max-w-[1280px] px-4">
      {/* 광고 (입력칸 위, 전체 폭) */}
      <AdSlot id="calc-military-net-mid" />

      <div className="grid gap-6 lg:grid-cols-[380px_1fr] lg:items-start">
        {/* ═══ 왼쪽: 입력 ═══ */}
        <div className="space-y-4">
          <div className="space-y-4 rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#2E4494]">기본 입력</p>
              <p className="mt-0.5 text-base font-bold text-[#1B2A4A]">계급·호봉</p>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-[#5B6478]">계급</span>
              <select
                value={rankKey}
                onChange={(e) => {
                  setRankKey(e.target.value);
                  setHobong(1);
                }}
                className="mt-1.5 w-full rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-3 py-3"
              >
                {RANKS.map((r) => (
                  <option key={r.key} value={r.key}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-[#5B6478]">호봉</span>
              <select
                value={hobong}
                onChange={(e) => setHobong(Number(e.target.value))}
                className="mt-1.5 w-full rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-3 py-3"
              >
                {availableHobongs.map((h) => (
                  <option key={h} value={h}>
                    {h}호봉
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* 수당 옵션 */}
          <div className="space-y-3 rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#2E4494]">수당 입력</p>
            <p className="text-sm text-[#5B6478]">해당하는 항목만 체크·입력하세요</p>
            <div className="space-y-3 pt-1">
              {cfg.allowances.map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-3">
                  <div className="text-sm">
                    <span className="text-[#1B2A4A]">{a.label}</span>
                    <p className="text-xs text-[#8B93A6]">{a.hint}</p>
                  </div>
                  {a.type === "checkbox" ? (
                    <input
                      type="checkbox"
                      checked={inputs[a.id] === true}
                      onChange={(e) => setInputs((p) => ({ ...p, [a.id]: e.target.checked }))}
                      className="h-5 w-5 shrink-0"
                    />
                  ) : (
                    <input
                      type="number"
                      min={0}
                      max={a.max ?? 99}
                      value={(inputs[a.id] as number) || ""}
                      placeholder="0"
                      onChange={(e) => setInputs((p) => ({ ...p, [a.id]: Number(e.target.value) || 0 }))}
                      className="w-20 shrink-0 rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-2 py-1.5 text-right"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 상세 옵션 (접이식) */}
          <details
            className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-4"
            onToggle={(e) => setUseDetail((e.target as HTMLDetailsElement).open)}
          >
            <summary className="cursor-pointer text-sm font-semibold text-[#1B2A4A]">
              상세 옵션 (근속연수) — 정근수당 반영 ▾
            </summary>
            <div className="mt-4">
              <label className="block">
                <span className="text-sm font-medium text-[#5B6478]">근속연수</span>
                <input
                  type="number"
                  min={0}
                  max={40}
                  value={years === 0 ? "" : years}
                  onChange={(e) => setYears(Number(e.target.value) || 0)}
                  className="mt-1.5 w-full rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-3 py-2.5"
                />
                <span className="mt-1 block text-xs font-normal text-[#8B93A6]">
                  실제 근무 햇수(호봉과 다를 수 있음). 정근수당·가산금과 부양가족 소득세 감면이 반영됩니다
                </span>
              </label>
            </div>
          </details>
        </div>

        {/* ═══ 오른쪽: 결과 (sticky) ═══ */}
        <div className="space-y-5 lg:sticky lg:top-20">
          {result ? (
            <div className="overflow-hidden rounded-xl border border-[rgba(46,68,148,0.14)]">
              <div className="bg-[#2E4494] px-5 py-4 text-white">
                <p className="text-sm opacity-80">예상 월 실수령액</p>
                <p className="text-3xl font-bold tabular-nums">{won(result.net)}</p>
              </div>
              <dl className="divide-y divide-[rgba(46,68,148,0.10)] bg-white text-sm">
                <RowItem label="기본급" value={won(result.base)} />
                {result.allowanceItems.map((it) => (
                  <RowItem key={it.label} label={it.label} value={"+ " + won(it.value)} muted />
                ))}
                <RowItem label="세전 합계" value={won(result.gross)} bold />
                {result.deductions.map((d) => (
                  <RowItem key={d.label} label={d.label} value={"- " + won(d.value)} muted />
                ))}
                <RowItem label="공제 합계" value={"- " + won(result.totalDeduction)} bold />
              </dl>
            </div>
          ) : (
            <div className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-6 text-center text-sm text-[#7A8296]">
              선택한 계급에 해당 호봉이 없습니다. 다른 호봉을 선택하세요.
            </div>
          )}
        </div>
      </div>

      <p className="mt-6 text-xs leading-relaxed text-[#8B93A6]">
        ※ 위험근무수당(병과별), 특수지 근무수당 등은 개인·부대별 편차가 커 아직 포함되지 않았습니다. 실제
        급여명세서와 차이가 있으며 참고용 추정치입니다.
      </p>
    </div>
  );
}

function RowItem({
  label,
  value,
  bold,
  muted,
}: {
  label: string;
  value: string;
  bold?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-2.5">
      <dt className={muted ? "text-[#7A8296]" : "font-medium text-[#1B2A4A]"}>{label}</dt>
      <dd className={`tabular-nums ${bold ? "font-bold text-[#1B2A4A]" : muted ? "text-[#7A8296]" : "text-[#1B2A4A]"}`}>
        {value}
      </dd>
    </div>
  );
}
