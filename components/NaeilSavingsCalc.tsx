"use client";

import { useMemo, useState } from "react";
import AdSlot from "@/components/AdSlot";

const won = (n: number) => Math.round(n).toLocaleString("ko-KR") + "원";
const MONTHS = 36;

const TIERS = [
  { id: "low", label: "기준중위소득 50% 이하 (차상위 이하)", match: 300000, hint: "정부지원금 월 30만 원" },
  { id: "mid", label: "기준중위소득 50% 초과 ~ 100% 이하", match: 100000, hint: "정부지원금 월 10만 원" },
] as const;

export default function NaeilSavingsCalc() {
  const [tierId, setTierId] = useState<string>("mid");
  const [monthly, setMonthly] = useState(100000);
  const [rate, setRate] = useState(3.0);

  const tier = TIERS.find((t) => t.id === tierId)!;

  const result = useMemo(() => {
    const principal = monthly * MONTHS;
    const matching = tier.match * MONTHS;
    const monthlyRate = rate / 100 / 12;
    const interest = monthly * monthlyRate * ((MONTHS * (MONTHS + 1)) / 2);
    const total = principal + matching + interest;
    return { principal, matching, interest, total };
  }, [tierId, monthly, rate, tier.match]);

  return (
    <div className="mx-auto max-w-[1280px] px-4">
      <AdSlot id="calc-naeil-save-mid" />

      <div className="grid gap-6 lg:grid-cols-[380px_1fr] lg:items-start">
        {/* ═══ 왼쪽: 입력 ═══ */}
        <div className="space-y-4">
          <div className="space-y-5 rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-5">
            <label className="block">
              <span className="text-sm font-medium text-[#5B6478]">소득 구간</span>
              <select
                value={tierId}
                onChange={(e) => setTierId(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-3 py-3"
              >
                {TIERS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
              <span className="mt-1 block text-xs font-normal text-[#8B93A6]">
                {tier.hint} · 본인 월 10만 원 이상 저축 유지 조건
              </span>
            </label>

            <div>
              <div className="flex items-center justify-between text-sm font-medium text-[#5B6478]">
                <span>본인 월 저축액</span>
                <span className="tabular-nums text-[#2E4494]">{won(monthly)}</span>
              </div>
              <input
                type="range"
                min={100000}
                max={500000}
                step={10000}
                value={monthly}
                onChange={(e) => setMonthly(Number(e.target.value))}
                className="mt-2 w-full accent-[#2E4494]"
              />
              <p className="mt-1 text-xs text-[#8B93A6]">월 10만~50만 원. 정부지원금은 저축액과 무관하게 구간별 정액</p>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm font-medium text-[#5B6478]">
                <span>적용 금리 (연)</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    max={15}
                    step={0.01}
                    value={rate}
                    onChange={(e) => setRate(Number(e.target.value) || 0)}
                    className="w-16 rounded-lg border border-[rgba(46,68,148,0.22)] px-2 py-1 text-right tabular-nums text-[#2E4494]"
                  />
                  <span className="text-[#2E4494]">%</span>
                </div>
              </div>
              <input
                type="range"
                min={1}
                max={6}
                step={0.01}
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="mt-2 w-full accent-[#2E4494]"
              />
            </div>
          </div>
        </div>

        {/* ═══ 오른쪽: 결과 (sticky) ═══ */}
        <div className="space-y-5 lg:sticky lg:top-20">
          <div className="overflow-hidden rounded-xl border border-[rgba(46,68,148,0.14)]">
            <div className="bg-[#2E4494] px-5 py-4 text-white">
              <p className="text-sm opacity-80">3년 만기 예상 수령액</p>
              <p className="text-3xl font-bold tabular-nums">{won(result.total)}</p>
            </div>
            <dl className="divide-y divide-[rgba(46,68,148,0.10)] bg-white text-sm">
              <Row label={`내 저축 원금 (${MONTHS}개월)`} value={won(result.principal)} />
              <Row label={`정부지원금 (월 ${won(tier.match)})`} value={"+ " + won(result.matching)} accent />
              <Row label="이자" value={"+ " + won(result.interest)} muted />
              <Row label="총 수령액" value={won(result.total)} bold />
            </dl>
          </div>
        </div>
      </div>

      <p className="mt-6 text-xs leading-relaxed text-[#8B93A6]">
        ※ 참고용 추정치입니다. 정부지원금 수령에는 3년 통장 유지, 근로활동 지속, 교육 이수, 자금사용계획서
        제출 등의 조건이 있습니다. 모집 시기와 세부 요건은 복지로·자산형성포털에서 확인하세요.
      </p>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
  muted,
  accent,
}: {
  label: string;
  value: string;
  bold?: boolean;
  muted?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-2.5">
      <dt className={muted ? "text-[#7A8296]" : "font-medium text-[#1B2A4A]"}>{label}</dt>
      <dd
        className={`tabular-nums ${
          bold
            ? "font-bold text-[#1B2A4A]"
            : accent
              ? "font-semibold text-[#2E4494]"
              : muted
                ? "text-[#7A8296]"
                : "text-[#1B2A4A]"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
