"use client";

import { useMemo, useState } from "react";
import cfg from "@/data/soldier-savings-2026.json";
import AdSlot from "@/components/AdSlot";

const won = (n: number) => Math.round(n).toLocaleString("ko-KR") + "원";

export default function SoldierSavingsCalc() {
  const [monthly, setMonthly] = useState(550000);
  const [months, setMonths] = useState(18);
  const [rate, setRate] = useState(cfg.defaultRate);

  const result = useMemo(() => {
    const principal = monthly * months;
    const matching = principal * cfg.matchRate;
    const monthlyRate = rate / 100 / 12;
    const interest = monthly * monthlyRate * ((months * (months + 1)) / 2);
    const total = principal + matching + interest;
    return { principal, matching, interest, total };
  }, [monthly, months, rate]);

  return (
    <div className="mx-auto max-w-[1280px] px-4">
      <AdSlot id="calc-soldier-save-mid" />

      <div className="grid gap-6 lg:grid-cols-[380px_1fr] lg:items-start">
        {/* ═══ 왼쪽: 입력 ═══ */}
        <div className="space-y-4">
          <div className="space-y-5 rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-5">
            <div>
              <div className="flex items-center justify-between text-sm font-medium text-[#5B6478]">
                <span>월 납입액</span>
                <span className="tabular-nums text-[#2E4494]">{won(monthly)}</span>
              </div>
              <input
                type="range"
                min={cfg.monthlyStep}
                max={cfg.maxMonthly}
                step={cfg.monthlyStep}
                value={monthly}
                onChange={(e) => setMonthly(Number(e.target.value))}
                className="mt-2 w-full accent-[#2E4494]"
              />
              <p className="mt-1 text-xs text-[#8B93A6]">개인 최대 월 55만 원 (은행당 30만 원, 5만 원 단위)</p>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-[#5B6478]">복무기간</span>
              <select
                value={months}
                onChange={(e) => setMonths(Number(e.target.value))}
                className="mt-1.5 w-full rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-3 py-3"
              >
                {cfg.serviceMonths.map((s) => (
                  <option key={s.months} value={s.months}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>

            <div>
              <div className="flex items-center justify-between text-sm font-medium text-[#5B6478]">
                <span>적용 금리 (연)</span>
                <span className="tabular-nums text-[#2E4494]">{rate.toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min={3}
                max={7}
                step={0.1}
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="mt-2 w-full accent-[#2E4494]"
              />
              <p className="mt-1 text-xs text-[#8B93A6]">기본 5.0% (계약 15개월 이상). 은행 우대금리로 달라질 수 있음</p>
            </div>
          </div>
        </div>

        {/* ═══ 오른쪽: 결과 (sticky) ═══ */}
        <div className="space-y-5 lg:sticky lg:top-20">
          <div className="overflow-hidden rounded-xl border border-[rgba(46,68,148,0.14)]">
            <div className="bg-[#2E4494] px-5 py-4 text-white">
              <p className="text-sm opacity-80">전역 시 예상 수령액</p>
              <p className="text-3xl font-bold tabular-nums">{won(result.total)}</p>
            </div>
            <dl className="divide-y divide-[rgba(46,68,148,0.10)] bg-white text-sm">
              <Row label="내 납입 원금" value={won(result.principal)} />
              <Row label="정부 매칭지원금 (100%)" value={"+ " + won(result.matching)} accent />
              <Row label="비과세 이자" value={"+ " + won(result.interest)} muted />
              <Row label="총 수령액" value={won(result.total)} bold />
            </dl>
          </div>
        </div>
      </div>

      {/* 판단 보조 */}
      <div className="mt-6 space-y-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#2E4494]">판단 보조</p>
          <p className="mt-0.5 text-base font-bold text-[#1B2A4A]">이런 상황이면 이렇게 보세요</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {SOLDIER_DECISION_CARDS.map((card) => (
            <div key={card.tag} className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-white p-4">
              <span className="inline-block rounded-full bg-[rgba(46,68,148,0.08)] px-2 py-0.5 text-[10px] font-semibold text-[#2E4494]">
                {card.tag}
              </span>
              <p className="mt-2 text-sm font-bold text-[#1B2A4A]">{card.title}</p>
              <ul className="mt-2 space-y-1 text-xs leading-relaxed text-[#5B6478]">
                {card.bullets.map((b) => (
                  <li key={b}>· {b}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-6 text-xs leading-relaxed text-[#8B93A6]">
        ※ 참고용 추정치입니다. 매칭지원금은 2024년 이후 납입원금 100% 기준이며, 중도해지 시 매칭지원금·비과세
        혜택을 받을 수 없습니다. 실제 금리·수령액은 은행과 나라사랑포털 계산기에서 확인하세요.
      </p>
    </div>
  );
}

const SOLDIER_DECISION_CARDS = [
  {
    tag: "월 55만 원 채우기",
    title: "월 최대한도(55만 원)를 다 채우고 싶다",
    bullets: [
      "은행 1곳당 납입 한도가 30만 원이라 여러 은행에 나눠 가입해야 합니다",
      "예: 2개 은행에 각 27.5만 원씩, 또는 30만+25만 원 조합도 가능합니다",
      "은행별로 우대금리 조건이 달라 조합에 따라 총수령액이 달라질 수 있습니다",
    ],
  },
  {
    tag: "전역 후 계획",
    title: "전역 후 목돈 사용처를 정해두지 않았다",
    bullets: [
      "전역 직후 생활비·취업 준비 비용으로 우선 남겨두는 것을 권장합니다",
      "남는 목돈은 예금·적금으로 이어가면 계속 이자를 받을 수 있습니다",
      "큰 지출(차량 구매 등) 전에 전체 재무 계획을 먼저 세워보세요",
    ],
  },
  {
    tag: "조기 전역 가능성",
    title: "예정보다 일찍 전역할 가능성이 있다",
    bullets: [
      "복무기간이 줄면 원금·매칭지원금·이자가 모두 함께 줄어듭니다",
      "복무기간 선택란을 실제 예상 전역일에 맞춰 다시 계산해보세요",
      "만기 전 중도해지 시 매칭지원금·비과세 혜택이 사라질 수 있습니다",
    ],
  },
];

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
