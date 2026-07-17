"use client";

import { useMemo, useState } from "react";
import cfg from "@/data/youth-savings-2026.json";
import AdSlot from "@/components/AdSlot";
import Link from "next/link";

const won = (n: number) => Math.round(n).toLocaleString("ko-KR") + "원";

export default function YouthSavingsCalc() {
  const [monthly, setMonthly] = useState(500000);
  const [typeId, setTypeId] = useState("general");
  const [rate, setRate] = useState(cfg.baseRate);

  const type = cfg.types.find((t) => t.id === typeId)!;
  const months = cfg.months;

  const result = useMemo(() => {
    const principal = monthly * months;

    const monthlyMatch = Math.min(monthly * type.matchRate, type.monthlyCap);
    const matching = monthlyMatch * months;

    const monthlyRate = rate / 100 / 12;
    const sumFactor = (months * (months + 1)) / 2;
    const interestOnSavings = monthly * monthlyRate * sumFactor;
    const interestOnMatch = monthlyMatch * monthlyRate * sumFactor;
    const interest = interestOnSavings + interestOnMatch;

    const total = principal + matching + interest;

    return { principal, matching, interest, total, monthlyMatch };
  }, [monthly, typeId, rate, type, months]);

  return (
    <div className="mx-auto max-w-[1280px] px-4">
      <AdSlot id="calc-youth-save-mid" />

      <div className="grid gap-6 lg:grid-cols-[380px_1fr] lg:items-start">
        {/* ═══ 왼쪽: 입력 ═══ */}
        <div className="space-y-4">
          <div className="space-y-5 rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-5">
            <label className="block">
              <span className="text-sm font-medium text-[#5B6478]">가입 유형</span>
              <select
                value={typeId}
                onChange={(e) => setTypeId(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-3 py-3"
              >
                {cfg.types.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
              <span className="mt-1 block text-xs text-[#8B93A6]">{type.hint}</span>
            </label>

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
              <p className="mt-1 text-xs text-[#8B93A6]">월 최대 50만 원, 3년(36개월) 만기 자유적립식</p>
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
                min={cfg.baseRate}
                max={cfg.maxRate}
                step={0.01}
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="mt-2 w-full accent-[#2E4494]"
              />
              <p className="mt-1 text-xs text-[#8B93A6]">기본 5.0% (전 기관 동일). 은행 우대금리 포함 최대 8%</p>
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
              <Row label="내 납입 원금" value={won(result.principal)} />
              {result.matching > 0 && (
                <Row label={`정부기여금 (월 ${won(result.monthlyMatch)})`} value={"+ " + won(result.matching)} accent />
              )}
              <Row label="비과세 이자" value={"+ " + won(result.interest)} muted />
              <Row label="총 수령액" value={won(result.total)} bold />
            </dl>
          </div>

          {/* 다른 청년정책과 비교 */}
          <div className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-white p-5 text-sm">
            <p className="font-semibold text-[#1B2A4A]">청년도약계좌와 비교하면?</p>
            <p className="mt-1 leading-relaxed text-[#5B6478]">
              5년짜리 청년도약계좌는 총액이 더 크지만, 기간이 짧은 이 상품이 연 환산 실효수익률은 더 높을 수
              있습니다.
            </p>
            <Link
              href="/calc/youth-compare"
              className="mt-2 inline-block font-medium text-[#2E4494] underline underline-offset-2"
            >
              청년 정책 적금 비교 계산기에서 직접 비교 →
            </Link>
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
          {FUTURE_DECISION_CARDS.map((card) => (
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
        ※ 참고용 추정치입니다. 정부기여금은 소득 유형별 심사로 결정되며, 중도해지 시 기여금·비과세 혜택을
        받을 수 없습니다. 실제 금리·수령액은 취급 은행과 서민금융진흥원에서 확인하세요.
      </p>
    </div>
  );
}

const FUTURE_DECISION_CARDS = [
  {
    tag: "소득 요건 확인",
    title: "우대형·일반형 중 뭐가 맞는지 헷갈린다",
    bullets: [
      "우대형은 중소기업 재직·신규취업 등 별도 요건이 있어 기여금이 2배(12%)입니다",
      "요건이 애매하면 일단 일반형(6%)으로 가입하고 추후 확인하는 방법도 있습니다",
      "정확한 대상 여부는 서민금융진흥원 홈페이지에서 확인하세요",
    ],
  },
  {
    tag: "5년 vs 3년",
    title: "청년도약계좌와 어느 쪽이 나을지 고민된다",
    bullets: [
      "이 상품은 3년 만기로, 5년짜리 도약계좌보다 짧게 목돈을 만들 수 있습니다",
      "총액은 도약계좌가 크지만, 연 환산 수익률은 이 상품이 더 높을 수 있습니다",
      "청년 정책 적금 비교 계산기에서 두 상품을 직접 비교해보세요",
    ],
  },
  {
    tag: "3년 유지 가능성",
    title: "3년을 다 채울 수 있을지 자신없다",
    bullets: [
      "중도해지 시 정부기여금과 비과세 혜택이 모두 사라집니다",
      "중도 해지 가능성이 크다면 유동성 높은 일반 적금과 병행하는 것도 방법입니다",
      "월 납입액을 무리하지 않는 선에서 정해야 끝까지 유지하기 쉽습니다",
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
