"use client";

import { useEffect, useMemo, useState } from "react";
import ratesData from "@/data/rates.json";
import AdSlot from "@/components/AdSlot";
import MoneyInput from "@/components/MoneyInput";
import Link from "next/link";

const won = (n: number) => Math.round(n).toLocaleString("ko-KR") + "원";
const TAX_RATE = 0.154; // 이자소득세 15.4% (소득세 14% + 지방세 1.4%)

export default function DepositCalc() {
  const [mode, setMode] = useState<"savings" | "deposit">("savings");
  const [monthly, setMonthly] = useState(300000);
  const [lump, setLump] = useState(10000000);
  const [months, setMonths] = useState(12);
  const [rate, setRate] = useState(3.5);
  const [taxFree, setTaxFree] = useState(false);

  // 금리 페이지에서 "이 금리로 계산" 클릭 시 URL 파라미터로 초기값 세팅
  const [fromRates, setFromRates] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const r = parseFloat(params.get("rate") || "");
    if (!isNaN(r) && r > 0 && r <= 10) {
      setRate(r);
      setFromRates(true);
    }
    const m = params.get("mode");
    if (m === "deposit" || m === "savings") setMode(m);
  }, []);

  const result = useMemo(() => {
    const r = rate / 100;
    let principal: number;
    let interest: number;

    if (mode === "savings") {
      principal = monthly * months;
      interest = monthly * (r / 12) * ((months * (months + 1)) / 2);
    } else {
      principal = lump;
      interest = lump * r * (months / 12);
    }

    const tax = taxFree ? 0 : interest * TAX_RATE;
    const netInterest = interest - tax;
    const total = principal + netInterest;

    return { principal, interest, tax, netInterest, total };
  }, [mode, monthly, lump, months, rate, taxFree]);

  // 지금 최고금리 TOP3 (이미 있는 금감원 금리 데이터 재사용)
  const top3Rates = useMemo(() => {
    const list = mode === "savings" ? ratesData.savings : ratesData.deposits;
    return list.slice().sort((a, b) => b.maxRate - a.maxRate).slice(0, 3);
  }, [mode]);

  return (
    <div className="mx-auto max-w-[1280px] px-4">
      <AdSlot id="calc-deposit-mid" />

      <div className="grid gap-6 lg:grid-cols-[380px_1fr] lg:items-start">
        {/* ═══ 왼쪽: 입력 ═══ */}
        <div className="space-y-4">
          {fromRates && (
            <div className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.06)] px-4 py-3 text-sm text-[#1E3068]">
              금리 비교에서 선택한 <strong>{rate.toFixed(2)}%</strong>가 적용됐습니다. 납입액·기간을 넣어
              실수령액을 확인하세요.
            </div>
          )}

          {/* 모드 전환 */}
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
            {(
              [
                { id: "savings", label: "적금 (매월 납입)" },
                { id: "deposit", label: "예금 (목돈 예치)" },
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`rounded-lg py-2.5 text-sm font-semibold transition ${
                  mode === m.id ? "bg-white text-[#2E4494] shadow-sm" : "text-[#7A8296]"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="space-y-5 rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#2E4494]">기본 입력</p>
              <p className="mt-0.5 text-base font-bold text-[#1B2A4A]">
                {mode === "savings" ? "월 납입액과 조건" : "예치 금액과 조건"}
              </p>
            </div>

            {mode === "savings" ? (
              <label className="block text-sm font-medium text-[#5B6478]">
                월 납입액
                <MoneyInput value={monthly} onChange={setMonthly} placeholder="예: 300,000" />
              </label>
            ) : (
              <label className="block text-sm font-medium text-[#5B6478]">
                예치 금액
                <MoneyInput value={lump} onChange={setLump} placeholder="예: 10,000,000" />
              </label>
            )}

            <label className="block">
              <span className="text-sm font-medium text-[#5B6478]">기간 (개월)</span>
              <select
                value={months}
                onChange={(e) => setMonths(Number(e.target.value))}
                className="mt-1.5 w-full rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-3 py-3"
              >
                {[6, 12, 18, 24, 36, 48, 60].map((m) => (
                  <option key={m} value={m}>
                    {m}개월
                  </option>
                ))}
              </select>
            </label>

            <div className="text-sm font-medium text-[#5B6478]">
              <div className="flex items-center justify-between">
                <span>연 금리</span>
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
                min={0.5}
                max={10}
                step={0.01}
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="mt-3 w-full accent-[#2E4494]"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-[#5B6478]">
              <input
                type="checkbox"
                checked={taxFree}
                onChange={(e) => setTaxFree(e.target.checked)}
                className="h-4 w-4"
              />
              비과세 (일반 과세 시 이자의 15.4% 공제)
            </label>
          </div>
        </div>

        {/* ═══ 오른쪽: 결과 (sticky) ═══ */}
        <div className="space-y-5 lg:sticky lg:top-20">
          <div className="overflow-hidden rounded-xl border border-[rgba(46,68,148,0.14)]">
            <div className="bg-[#2E4494] px-5 py-4 text-white">
              <p className="text-sm opacity-80">만기 수령액 (세후)</p>
              <p className="text-3xl font-bold tabular-nums">{won(result.total)}</p>
            </div>
            <dl className="divide-y divide-[rgba(46,68,148,0.10)] bg-white text-sm">
              <Row label="원금" value={won(result.principal)} />
              <Row label="세전 이자" value={"+ " + won(result.interest)} muted />
              {result.tax > 0 && <Row label="이자소득세 (15.4%)" value={"- " + won(result.tax)} muted />}
              <Row label="세후 이자" value={"+ " + won(result.netInterest)} bold />
            </dl>
          </div>

          {/* 지금 최고금리 TOP3 */}
          <div className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-white p-5 text-sm">
            <p className="font-semibold text-[#1B2A4A]">
              지금 {mode === "savings" ? "적금" : "예금"} 최고금리 TOP3
            </p>
            <div className="mt-3 space-y-2">
              {top3Rates.map((r, i) => (
                <div key={`${r.bank}-${r.product}`} className="flex items-center justify-between">
                  <span className="text-[#5B6478]">
                    {i + 1}. {r.bank} <span className="text-xs text-[#8B93A6]">{r.product}</span>
                  </span>
                  <span className="tabular-nums font-bold text-[#2E4494]">{r.maxRate.toFixed(2)}%</span>
                </div>
              ))}
            </div>
            <Link
              href="/rates"
              className="mt-2 inline-block text-xs font-medium text-[#2E4494] underline underline-offset-2"
            >
              전체 금리 비교 보기 →
            </Link>
            <p className="mt-2 text-xs text-[#8B93A6]">
              {ratesData.source}. 업데이트: {new Date(ratesData.updatedAt).toLocaleDateString("ko-KR")}
            </p>
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
          {DEPOSIT_DECISION_CARDS.map((card) => (
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
        ※ 단리 기준 계산입니다. 적금은 매월 납입 시점부터 만기까지의 기간에 비례해 이자가 붙습니다. 실제 상품의
        복리 여부·우대금리에 따라 금액이 달라질 수 있습니다.
      </p>
    </div>
  );
}

const DEPOSIT_DECISION_CARDS = [
  {
    tag: "목돈이 있다",
    title: "한 번에 넣을 목돈이 이미 있다",
    bullets: [
      "예금(목돈 예치) 모드로 바꿔서 계산해보세요",
      "적금보다 예금이 원금 전체에 이자가 붙어 같은 금리라면 총 이자가 더 큽니다",
      "단, 목돈을 나눠 여러 상품에 예치하면 예금자보호 한도(5천만 원) 분산에도 유리합니다",
    ],
  },
  {
    tag: "매달 여윳돈",
    title: "매달 일정 금액을 모으고 싶다",
    bullets: [
      "적금(매월 납입) 모드가 강제 저축 효과가 있어 목돈 만들기에 유리합니다",
      "정책 적금(청년미래적금·청년도약계좌 등) 대상이라면 일반 적금보다 정부기여금만큼 더 유리합니다",
      "청년 정책 적금 비교 계산기에서 대상 여부를 먼저 확인해보세요",
    ],
  },
  {
    tag: "금리 비교",
    title: "어느 은행이 금리가 높은지 모르겠다",
    bullets: [
      "이 계산기 결과는 금리를 알고 있을 때의 만기액 계산용입니다",
      "실제 최고금리는 매일 갱신되는 금리 비교 페이지에서 먼저 확인하세요",
      "확인한 금리를 그대로 가져와 이 계산기에 적용할 수 있습니다",
    ],
  },
];

function Row({
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
