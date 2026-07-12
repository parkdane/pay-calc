"use client";

import { useMemo, useState } from "react";
import futureCfg from "@/data/youth-savings-2026.json";
import soldierCfg from "@/data/soldier-savings-2026.json";
import AdSlot from "@/components/AdSlot";

const won = (n: number) => Math.round(n).toLocaleString("ko-KR") + "원";
const manwon = (n: number) => Math.round(n / 10000).toLocaleString("ko-KR") + "만원";

const NAEIL_TIERS = [
  { id: "low", label: "기준중위소득 50% 이하 (차상위 이하)", match: 300000 },
  { id: "mid", label: "기준중위소득 50% 초과 ~ 100% 이하", match: 100000 },
] as const;
const NAEIL_MONTHS = 36;

const LEAP_TIERS = [
  { id: "t2400", label: "총급여 2,400만 원 이하", base: 400000, rate: 0.06 },
  { id: "t3600", label: "2,400만 초과 ~ 3,600만 이하", base: 500000, rate: 0.046 },
  { id: "t4800", label: "3,600만 초과 ~ 4,800만 이하", base: 600000, rate: 0.037 },
  { id: "t6000", label: "4,800만 초과 ~ 6,000만 이하", base: 700000, rate: 0.03 },
  { id: "t7500", label: "6,000만 초과 ~ 7,500만 이하 (비과세만)", base: 0, rate: 0 },
] as const;
const LEAP_MONTHS = 60;
const LEAP_CAP = 700000;
const LEAP_EXPAND_RATE = 0.03;
const leapMatchRound = (n: number) => Math.floor(n / 100) * 100;

const TAX_RATE = 0.154;

// 월 납입액 + 만기 수령액을 알 때, "사실상 연 몇 %짜리 저축인가"를 이분탐색으로 역산
// (정부기여금·비과세 효과까지 전부 포함한 실효 수익률 — 기간이 다른 상품끼리도 공정하게 비교 가능)
function solveEffectiveAnnualRate(monthly: number, months: number, total: number): number {
  if (monthly <= 0 || months <= 0) return 0;
  const fv = (r: number) => {
    if (Math.abs(r) < 1e-9) return monthly * months;
    return monthly * ((Math.pow(1 + r, months) - 1) / r);
  };
  let lo = -0.1,
    hi = 1;
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    if (fv(mid) < total) lo = mid;
    else hi = mid;
  }
  const monthlyRate = (lo + hi) / 2;
  return (Math.pow(1 + monthlyRate, 12) - 1) * 100;
}

type Row = {
  key: string;
  name: string;
  months: number;
  monthlyUsed: number;
  capped: boolean;
  principal: number;
  interest: number;
  matching: number;
  tax: number;
  total: number;
  effectiveAnnualRate: number;
};

// 진짜 선택 갈등이 있는 상황별로만 묶는다 (기간·자격이 다른 상품을 억지로 섞지 않음)
const GROUPS = [
  { id: "general", label: "일반 청년 (소득 무관)", hint: "청년미래적금 vs 청년도약계좌" },
  { id: "low", label: "저소득 청년", hint: "청년내일저축계좌 vs 청년미래적금" },
  { id: "soldier", label: "현역 장병", hint: "장병내일준비적금" },
] as const;
type GroupId = (typeof GROUPS)[number]["id"];

function calcFuture(monthly: number, futureType: string, futureRate: number): Omit<Row, "effectiveAnnualRate"> {
  const type = futureCfg.types.find((t) => t.id === futureType)!;
  const months = futureCfg.months;
  const m = Math.min(monthly, futureCfg.maxMonthly);
  const principal = m * months;
  const monthlyMatch = Math.min(m * type.matchRate, type.monthlyCap);
  const matching = monthlyMatch * months;
  const mr = futureRate / 100 / 12;
  const sumFactor = (months * (months + 1)) / 2;
  const interest = m * mr * sumFactor + monthlyMatch * mr * sumFactor;
  return {
    key: "future",
    name: "청년미래적금",
    months,
    monthlyUsed: m,
    capped: monthly > futureCfg.maxMonthly,
    principal,
    interest,
    matching,
    tax: 0,
    total: principal + matching + interest,
  };
}

function calcLeap(monthly: number, leapTier: string, leapRate: number): Omit<Row, "effectiveAnnualRate"> {
  const tier = LEAP_TIERS.find((t) => t.id === leapTier)!;
  const m = Math.min(monthly, LEAP_CAP);
  const principal = m * LEAP_MONTHS;
  const basePart = Math.min(m, tier.base) * tier.rate;
  const expandPart = tier.base > 0 ? Math.max(0, m - tier.base) * LEAP_EXPAND_RATE : 0;
  const monthlyMatch = leapMatchRound(basePart + expandPart);
  const matching = monthlyMatch * LEAP_MONTHS;
  const mr = leapRate / 100 / 12;
  const interest = m * mr * ((LEAP_MONTHS * (LEAP_MONTHS + 1)) / 2);
  return {
    key: "leap",
    name: "청년도약계좌",
    months: LEAP_MONTHS,
    monthlyUsed: m,
    capped: monthly > LEAP_CAP,
    principal,
    interest,
    matching,
    tax: 0,
    total: principal + matching + interest,
  };
}

function calcNaeil(monthly: number, naeilTier: string, naeilRate: number): Omit<Row, "effectiveAnnualRate"> {
  const tier = NAEIL_TIERS.find((t) => t.id === naeilTier)!;
  const principal = monthly * NAEIL_MONTHS;
  const matching = tier.match * NAEIL_MONTHS;
  const mr = naeilRate / 100 / 12;
  const interest = monthly * mr * ((NAEIL_MONTHS * (NAEIL_MONTHS + 1)) / 2);
  return {
    key: "naeil",
    name: "청년내일저축계좌",
    months: NAEIL_MONTHS,
    monthlyUsed: monthly,
    capped: false,
    principal,
    interest,
    matching,
    tax: 0,
    total: principal + matching + interest,
  };
}

function calcSoldier(monthly: number, soldierMonths: number, soldierRate: number): Omit<Row, "effectiveAnnualRate"> {
  const m = Math.min(monthly, soldierCfg.maxMonthly);
  const principal = m * soldierMonths;
  const matching = principal * soldierCfg.matchRate;
  const mr = soldierRate / 100 / 12;
  const interest = m * mr * ((soldierMonths * (soldierMonths + 1)) / 2);
  return {
    key: "soldier",
    name: "장병내일준비적금",
    months: soldierMonths,
    monthlyUsed: m,
    capped: monthly > soldierCfg.maxMonthly,
    principal,
    interest,
    matching,
    tax: 0,
    total: principal + matching + interest,
  };
}

function calcDeposit(monthly: number, depositMonths: number, depositRate: number): Omit<Row, "effectiveAnnualRate"> {
  const principal = monthly * depositMonths;
  const mr = depositRate / 100 / 12;
  const grossInterest = monthly * mr * ((depositMonths * (depositMonths + 1)) / 2);
  const tax = grossInterest * TAX_RATE;
  return {
    key: "deposit",
    name: "일반 적금 (비교 기준)",
    months: depositMonths,
    monthlyUsed: monthly,
    capped: false,
    principal,
    interest: grossInterest - tax,
    matching: 0,
    tax,
    total: principal + (grossInterest - tax),
  };
}

export default function YouthSavingsCompareCalc() {
  const [group, setGroup] = useState<GroupId>("general");
  const [monthly, setMonthly] = useState(500000);

  const [futureType, setFutureType] = useState("general");
  const [futureRate, setFutureRate] = useState(futureCfg.baseRate);

  const [leapTier, setLeapTier] = useState("t3600");
  const [leapRate, setLeapRate] = useState(4.5);

  const [naeilTier, setNaeilTier] = useState("mid");
  const [naeilRate, setNaeilRate] = useState(3.0);

  const [soldierMonths, setSoldierMonths] = useState(18);
  const [soldierRate, setSoldierRate] = useState(soldierCfg.defaultRate);

  const [depositRate, setDepositRate] = useState(3.5);
  const [includeDeposit, setIncludeDeposit] = useState(true);

  const rows = useMemo(() => {
    const raw: Omit<Row, "effectiveAnnualRate">[] = [];

    if (group === "general") {
      raw.push(calcFuture(monthly, futureType, futureRate));
      raw.push(calcLeap(monthly, leapTier, leapRate));
      if (includeDeposit) raw.push(calcDeposit(monthly, futureCfg.months, depositRate)); // 3년 기준 비교
    } else if (group === "low") {
      raw.push(calcNaeil(monthly, naeilTier, naeilRate));
      raw.push(calcFuture(monthly, futureType, futureRate));
      if (includeDeposit) raw.push(calcDeposit(monthly, NAEIL_MONTHS, depositRate));
    } else if (group === "soldier") {
      raw.push(calcSoldier(monthly, soldierMonths, soldierRate));
      if (includeDeposit) raw.push(calcDeposit(monthly, soldierMonths, depositRate));
    }

    const list: Row[] = raw.map((r) => ({
      ...r,
      effectiveAnnualRate: solveEffectiveAnnualRate(r.monthlyUsed, r.months, r.total),
    }));

    return list.sort((a, b) => b.total - a.total);
  }, [
    group,
    monthly,
    futureType, futureRate,
    leapTier, leapRate,
    naeilTier, naeilRate,
    soldierMonths, soldierRate,
    depositRate, includeDeposit,
  ]);

  const best = rows[0];
  const bestByRate = rows.length > 0 ? rows.slice().sort((a, b) => b.effectiveAnnualRate - a.effectiveAnnualRate)[0] : null;
  const depositRow = rows.find((r) => r.key === "deposit");
  const totalMatching = rows.reduce((s, r) => s + r.matching, 0);
  const chartMax = rows.length > 0 ? Math.max(...rows.map((r) => r.total)) : 1;
  const sameDuration = rows.every((r) => r.months === rows[0].months);

  return (
    <div className="mx-auto max-w-[1280px] px-4">
      {/* 광고 (전체 폭) */}
      <AdSlot id="calc-youth-compare-mid" />

      <div className="grid gap-6 lg:grid-cols-[380px_1fr] lg:items-start">
        {/* ═══ 왼쪽: 입력 ═══ */}
        <div className="space-y-4">
          {/* 상황 선택 */}
          <div className="flex flex-wrap gap-1.5">
            {GROUPS.map((g) => (
              <button
                key={g.id}
                onClick={() => setGroup(g.id)}
                className={`rounded-lg border px-3 py-2 text-left text-xs font-medium transition ${
                  group === g.id
                    ? "border-[#2E4494] bg-[rgba(46,68,148,0.06)] text-[#2E4494]"
                    : "border-[rgba(46,68,148,0.22)] bg-white text-[#5B6478] hover:border-[#2E4494]"
                }`}
              >
                <span className="block font-semibold">{g.label}</span>
                <span className="block text-[10px] font-normal text-[#8B93A6]">{g.hint}</span>
              </button>
            ))}
          </div>

          {/* 월 납입액 */}
          <div className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-5">
            <label className="block text-sm font-medium text-[#5B6478]">
              월 납입액
          <div className="mt-1.5">
            <input
              type="text"
              inputMode="numeric"
              value={monthly === 0 ? "" : monthly.toLocaleString("ko-KR")}
              onChange={(e) => setMonthly(Number(e.target.value.replace(/[^0-9]/g, "")) || 0)}
              className="w-full rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-3 py-3 text-right text-base tabular-nums"
            />
          </div>
          <span className="mt-1 block text-xs font-normal text-[#8B93A6]">
            50만 원이면 500000. 상품별 한도를 넘으면 자동으로 한도까지만 적용됩니다.
          </span>
        </label>

        {/* 상황별 세부 옵션 */}
        <div className="mt-4 space-y-3 border-t border-[rgba(46,68,148,0.10)] pt-4">
          {group === "general" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-xs text-[#5B6478]">
                  청년미래적금 유형
                  <select
                    value={futureType}
                    onChange={(e) => setFutureType(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-2 py-1.5 text-sm"
                  >
                    {futureCfg.types.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-xs text-[#5B6478]">
                  미래적금 은행 금리(%)
                  <input
                    type="number"
                    step={0.1}
                    value={futureRate}
                    onChange={(e) => setFutureRate(Number(e.target.value) || 0)}
                    className="mt-1 w-full rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-2 py-1.5"
                  />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-xs text-[#5B6478]">
                  청년도약계좌 소득구간
                  <select
                    value={leapTier}
                    onChange={(e) => setLeapTier(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-2 py-1.5 text-sm"
                  >
                    {LEAP_TIERS.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-xs text-[#5B6478]">
                  도약계좌 은행 금리(%)
                  <input
                    type="number"
                    step={0.1}
                    value={leapRate}
                    onChange={(e) => setLeapRate(Number(e.target.value) || 0)}
                    className="mt-1 w-full rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-2 py-1.5"
                  />
                </label>
              </div>
            </>
          )}

          {group === "low" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-xs text-[#5B6478]">
                  내일저축계좌 소득구간
                  <select
                    value={naeilTier}
                    onChange={(e) => setNaeilTier(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-2 py-1.5 text-sm"
                  >
                    {NAEIL_TIERS.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-xs text-[#5B6478]">
                  내일저축 은행 금리(%)
                  <input
                    type="number"
                    step={0.1}
                    value={naeilRate}
                    onChange={(e) => setNaeilRate(Number(e.target.value) || 0)}
                    className="mt-1 w-full rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-2 py-1.5"
                  />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-xs text-[#5B6478]">
                  청년미래적금 유형
                  <select
                    value={futureType}
                    onChange={(e) => setFutureType(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-2 py-1.5 text-sm"
                  >
                    {futureCfg.types.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-xs text-[#5B6478]">
                  미래적금 은행 금리(%)
                  <input
                    type="number"
                    step={0.1}
                    value={futureRate}
                    onChange={(e) => setFutureRate(Number(e.target.value) || 0)}
                    className="mt-1 w-full rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-2 py-1.5"
                  />
                </label>
              </div>
            </>
          )}

          {group === "soldier" && (
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-xs text-[#5B6478]">
                복무기간
                <select
                  value={soldierMonths}
                  onChange={(e) => setSoldierMonths(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-2 py-1.5 text-sm"
                >
                  {soldierCfg.serviceMonths.map((s) => (
                    <option key={s.months} value={s.months}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs text-[#5B6478]">
                은행 금리(%)
                <input
                  type="number"
                  step={0.1}
                  value={soldierRate}
                  onChange={(e) => setSoldierRate(Number(e.target.value) || 0)}
                  className="mt-1 w-full rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-2 py-1.5"
                />
              </label>
            </div>
          )}

          <label className="flex items-center gap-2 text-xs text-[#5B6478]">
            <input
              type="checkbox"
              checked={includeDeposit}
              onChange={(e) => setIncludeDeposit(e.target.checked)}
              className="h-4 w-4"
            />
            일반 적금과도 비교 (금리 {depositRate}%
            <input
              type="number"
              step={0.1}
              value={depositRate}
              onChange={(e) => setDepositRate(Number(e.target.value) || 0)}
              className="mx-1 w-14 rounded border border-[rgba(46,68,148,0.22)] bg-white px-1 py-0.5 text-right"
            />
            %, 같은 만기 기준)
          </label>
        </div>
      </div>
        </div>

        {/* ═══ 오른쪽: 결과 (sticky) ═══ */}
        <div className="space-y-5 lg:sticky lg:top-20">

      {/* 핵심 지표 */}
      {rows.length > 0 && (
        <div className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.06)] p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#2E4494]">핵심 지표</p>
          <p className="mt-1 text-lg font-bold text-[#1B2A4A]">
            총액 기준 1위: {best.name} — 만기 수령액 {won(best.total)}
          </p>
          {depositRow && best.key !== "deposit" && (
            <p className="mt-1 text-sm leading-relaxed text-[#5B6478]">
              같은 조건의 일반 적금보다 <strong className="tabular-nums">{won(best.total - depositRow.total)}</strong>{" "}
              더 받습니다. 정부기여금 합계는 <strong className="tabular-nums">{won(totalMatching)}</strong>입니다.
            </p>
          )}

          {bestByRate && bestByRate.key !== best.key && (
            <div className="mt-3 rounded-lg border border-[#2E4494]/30 bg-white p-3">
              <p className="text-sm font-semibold text-[#2E4494]">
                근데 "연간 효율"로 보면 얘기가 다릅니다
              </p>
              <p className="mt-1 text-sm leading-relaxed text-[#5B6478]">
                {best.name}은 만기 기간이 {best.months}개월로 길어서 총액이 커 보이지만, 정부기여금·이자를 전부
                반영해 연 이자율로 환산하면 실제로는 연{" "}
                <strong className="tabular-nums">{best.effectiveAnnualRate.toFixed(2)}%</strong>짜리 저축입니다.
                반면 {bestByRate.name}({bestByRate.months}개월)은 연{" "}
                <strong className="tabular-nums">{bestByRate.effectiveAnnualRate.toFixed(2)}%</strong>로, 같은
                기간 동안 돈이 불어나는 속도 자체는 이쪽이 더 빠릅니다. 만기까지 오래 묶어둘 수 있으면{" "}
                {best.name}, 짧은 기간에 최대한 효율을 뽑고 싶으면 {bestByRate.name}이 유리합니다.
              </p>
            </div>
          )}

          {!sameDuration && (
            <p className="mt-2 text-xs text-[#8B93A6]">
              비교 대상 만기 기간이 서로 다릅니다(아래 표 "만기"·"연환산 수익률" 열 확인). 기간이 긴 상품은
              총액이 자연히 커지니 단순 액수보다 연환산 수익률로 효율을 비교하세요.
            </p>
          )}
        </div>
      )}

      {/* 막대그래프 */}
      {rows.length > 0 && (
        <div className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-white p-5">
          <p className="font-semibold text-[#1B2A4A]">만기 수령액 비교</p>
          <div className="mt-4 space-y-2.5">
            {rows.map((r) => (
              <div key={r.key}>
                <div className="mb-0.5 flex justify-between text-xs">
                  <span className={r.key === best.key ? "font-bold text-[#2E4494]" : "text-[#5B6478]"}>
                    {r.name} <span className="text-[#8B93A6]">({r.months}개월)</span>
                  </span>
                  <span className="tabular-nums text-[#5B6478]">{manwon(r.total)}</span>
                </div>
                <div className="h-4 w-full overflow-hidden rounded bg-slate-100">
                  <div
                    className={r.key === best.key ? "h-full bg-[#2E4494]" : "h-full bg-[#2E4494]/50"}
                    style={{ width: `${(r.total / chartMax) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 상세 표 */}
      {rows.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-[rgba(46,68,148,0.14)]">
          <div className="border-b border-[rgba(46,68,148,0.10)] bg-[rgba(46,68,148,0.03)] px-4 py-2.5 text-sm font-semibold text-[#1B2A4A]">
            상품별 상세 비교
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[#7A8296]">
                  <th className="px-4 py-2 text-left font-medium">상품</th>
                  <th className="px-4 py-2 text-right font-medium">만기</th>
                  <th className="px-4 py-2 text-right font-medium">월 납입액</th>
                  <th className="px-4 py-2 text-right font-medium">원금</th>
                  <th className="px-4 py-2 text-right font-medium">이자</th>
                  <th className="px-4 py-2 text-right font-medium">정부기여금</th>
                  <th className="px-4 py-2 text-right font-medium">만기 수령액</th>
                  <th className="px-4 py-2 text-right font-medium">연환산 수익률</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.key}
                    className={`border-t border-[rgba(46,68,148,0.10)] ${r.key === best.key ? "bg-[rgba(46,68,148,0.04)]" : ""}`}
                  >
                    <td className="px-4 py-2 font-medium text-[#1B2A4A]">
                      {r.name}
                      {r.key === best.key && (
                        <span className="ml-1.5 rounded bg-[#2E4494] px-1.5 py-0.5 text-[10px] font-bold text-white">
                          총액 1위
                        </span>
                      )}
                      {bestByRate && r.key === bestByRate.key && bestByRate.key !== best.key && (
                        <span className="ml-1.5 rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                          연환산 1위
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums text-[#5B6478]">{r.months}개월</td>
                    <td className="px-4 py-2 text-right tabular-nums text-[#5B6478]">
                      {won(r.monthlyUsed)}
                      {r.capped && <span className="ml-1 text-[10px] text-[#8B93A6]">(한도적용)</span>}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums text-[#5B6478]">{won(r.principal)}</td>
                    <td className="px-4 py-2 text-right tabular-nums text-[#5B6478]">{won(r.interest)}</td>
                    <td className="px-4 py-2 text-right tabular-nums text-[#5B6478]">
                      {r.matching > 0 ? won(r.matching) : "-"}
                    </td>
                    <td className="px-4 py-2 text-right font-semibold tabular-nums text-[#2E4494]">{won(r.total)}</td>
                    <td className="px-4 py-2 text-right tabular-nums text-[#5B6478]">
                      {r.effectiveAnnualRate.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
        </div>
      </div>

      {/* 안내 (grid 밖, 전체 폭) */}
      <div className="mt-6 space-y-6">
        <section className="space-y-1.5 rounded-xl bg-[rgba(46,68,148,0.03)] p-4 text-sm text-[#5B6478]">
          <p className="font-semibold text-[#1B2A4A]">비교 전에 꼭 확인하세요</p>
          <p>
            같은 상황(소득 구간, 복무 여부)에서 실제로 고민할 만한 상품끼리만 묶었습니다. 그래도 세부 가입 자격은
            매년 바뀔 수 있으니 신청 전 공식 공고를 다시 확인하세요. 이미 다른 계좌에 가입돼 있다면 중도해지 시
            정부기여금을 반환해야 할 수 있으니, 갈아타기 전에 기존 상품의 중도해지 조건부터 확인하세요.
          </p>
        </section>

        <p className="text-xs leading-relaxed text-[#8B93A6]">
          ※ 참고용 추정치입니다. 정부기여금·금리·비과세 적용 여부는 신청 시점의 공식 공고와 은행 상품설명서가
          우선합니다.
        </p>
      </div>
    </div>
  );
}
