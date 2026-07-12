"use client";

import { useEffect, useMemo, useState } from "react";
import AdSlot from "@/components/AdSlot";
import MoneyInput from "@/components/MoneyInput";

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
  // 예: /calc/deposit?rate=4.51&mode=deposit
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
      // 적금: 매월 적립, 단리. 이자 = 월납입 × 월이율 × n(n+1)/2
      principal = monthly * months;
      interest = monthly * (r / 12) * ((months * (months + 1)) / 2);
    } else {
      // 예금: 목돈 예치, 단리. 이자 = 원금 × 연이율 × (개월/12)
      principal = lump;
      interest = lump * r * (months / 12);
    }

    const tax = taxFree ? 0 : interest * TAX_RATE;
    const netInterest = interest - tax;
    const total = principal + netInterest;

    return { principal, interest, tax, netInterest, total };
  }, [mode, monthly, lump, months, rate, taxFree]);

  return (
    <div className="space-y-6">
      {fromRates && (
        <div className="rounded-xl border border-[#BFC8EA] bg-[#EEF0FA] px-4 py-3 text-sm text-[#464F82]">
          금리 비교에서 선택한 <strong>{rate.toFixed(2)}%</strong>가 적용됐습니다.
          납입액·기간을 넣어 실수령액을 확인하세요.
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
              mode === m.id
                ? "bg-white text-[#5B67A2] shadow-sm"
                : "text-slate-500"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* 입력 */}
      <div className="space-y-5 rounded-xl border border-slate-200 bg-slate-50 p-5">
        {mode === "savings" ? (
          <label className="block text-sm font-medium text-slate-700">
            월 납입액
            <MoneyInput value={monthly} onChange={setMonthly} placeholder="예: 300,000" />
          </label>
        ) : (
          <label className="block text-sm font-medium text-slate-700">
            예치 금액
            <MoneyInput value={lump} onChange={setLump} placeholder="예: 10,000,000" />
          </label>
        )}

        <div className="grid grid-cols-2 gap-4">
          <label className="block text-sm font-medium text-slate-700">
            기간 (개월)
            <select
              value={months}
              onChange={(e) => setMonths(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5"
            >
              {[6, 12, 18, 24, 36, 48, 60].map((m) => (
                <option key={m} value={m}>
                  {m}개월
                </option>
              ))}
            </select>
          </label>
          <div className="text-sm font-medium text-slate-700">
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
                  className="w-16 rounded-lg border border-slate-300 px-2 py-1 text-right tabular-nums text-[#5B67A2]"
                />
                <span className="text-[#5B67A2]">%</span>
              </div>
            </div>
            <input
              type="range"
              min={0.5}
              max={10}
              step={0.01}
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="mt-3 w-full accent-[#5B67A2]"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={taxFree}
            onChange={(e) => setTaxFree(e.target.checked)}
            className="h-4 w-4"
          />
          비과세 (일반 과세 시 이자의 15.4% 공제)
        </label>
      </div>

      {/* 광고 (입력 아래, 결과 위) */}
      <AdSlot id="calc-deposit-mid" />

      {/* 결과 */}
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <div className="bg-[#5B67A2] px-5 py-4 text-white">
          <p className="text-sm opacity-80">만기 수령액 (세후)</p>
          <p className="text-3xl font-bold tabular-nums">{won(result.total)}</p>
        </div>
        <dl className="divide-y divide-slate-100 bg-white text-sm">
          <Row label="원금" value={won(result.principal)} />
          <Row label="세전 이자" value={"+ " + won(result.interest)} muted />
          {result.tax > 0 && (
            <Row label="이자소득세 (15.4%)" value={"- " + won(result.tax)} muted />
          )}
          <Row label="세후 이자" value={"+ " + won(result.netInterest)} bold />
        </dl>
      </div>

      <p className="text-xs leading-relaxed text-slate-400">
        ※ 단리 기준 계산입니다. 적금은 매월 납입 시점부터 만기까지의 기간에
        비례해 이자가 붙습니다. 실제 상품의 복리 여부·우대금리에 따라 금액이
        달라질 수 있습니다.
      </p>
    </div>
  );
}

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
      <dt className={muted ? "text-slate-500" : "font-medium text-slate-800"}>
        {label}
      </dt>
      <dd
        className={`tabular-nums ${bold ? "font-bold text-slate-900" : muted ? "text-slate-500" : "text-slate-800"}`}
      >
        {value}
      </dd>
    </div>
  );
}
