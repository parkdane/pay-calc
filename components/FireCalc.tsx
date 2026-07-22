"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import AdSlot from "@/components/AdSlot";

const won = (n: number) => Math.round(n).toLocaleString("ko-KR") + "원";
const eokFull = (n: number) => {
  const eok = Math.floor(n / 100000000);
  const man = Math.round((n % 100000000) / 10000);
  if (eok >= 1) return `${eok}억 ${man.toLocaleString("ko-KR")}만원`;
  return man.toLocaleString("ko-KR") + "만원";
};

const EXPENSE_PRESETS = [
  { id: "lean", label: "Lean FIRE", value: 180 },
  { id: "single", label: "1인 기본", value: 250 },
  { id: "couple", label: "2인 기본", value: 320 },
  { id: "family", label: "3~4인", value: 450 },
  { id: "rich", label: "여유형", value: 600 },
];

const RETURN_PRESETS = [
  { label: "채권 수준", value: 4 },
  { label: "S&P500", value: 10 },
  { label: "나스닥", value: 12 },
];

// CAGR 참고 (과거 장기 연평균, 참고용)
const CAGR_TABLE = [
  { name: "코스닥", cagr: -1, note: "1996년 1000→2026년 851, 30년째 마이너스" },
  { name: "예금·채권", cagr: 4, note: "안전자산" },
  { name: "서울 아파트", cagr: 8, note: "2002~2021년 매매가 상승률 환산(부동산R114)" },
  { name: "코스피", cagr: 10, note: "1980년 이후 장기평균 · 최근 10년은 2%대(코리아 디스카운트)" },
  { name: "S&P500", cagr: 10, note: "미국 대형주 지수" },
  { name: "나스닥100", cagr: 13, note: "기술주 중심" },
  { name: "워런 버핏", cagr: 20, note: "재현 매우 어려움" },
].sort((a, b) => a.cagr - b.cagr);

const FIRE_DECISION_CARDS = [
  {
    tag: "부족 금액 있음",
    title: "부족 금액이 크게 나온다",
    bullets: [
      "월 투자금을 늘리거나 목표 지출(생활비)을 줄이면 부족분이 줄어듭니다",
      "목표 은퇴 나이를 몇 년 늦추는 것만으로도 필요 저축액이 크게 줄 수 있습니다",
      "\"추가 필요 월 투자금\" 카드에 나온 금액만큼만 더 저축해도 목표 나이를 맞출 수 있습니다",
    ],
  },
  {
    tag: "성공확률 낮음",
    title: "몬테카를로 성공 확률이 60% 미만이다",
    bullets: [
      "안전인출률을 4%에서 3.5%·3%로 낮추면 목표 자산이 커지는 대신 실패 확률이 줄어듭니다",
      "기대수익률을 지나치게 낙관적으로 잡지 않았는지 CAGR 참고표와 비교해보세요",
      "은퇴 나이를 1~2년만 늦춰도 성공 확률이 눈에 띄게 올라가는 경우가 많습니다",
    ],
  },
  {
    tag: "이미 달성",
    title: "이미 목표를 달성했거나 임박했다",
    bullets: [
      "인출을 시작하기 전에 안전인출률(4%)이 지금 상황에도 적절한지 다시 점검하세요",
      "건강보험료·세금은 이 계산기에 포함되지 않아 실제 순인출액은 이보다 적을 수 있습니다",
      "재정 수명 차트에서 자산이 언제 소진되는지 먼저 확인한 뒤 인출 계획을 세우세요",
    ],
  },
];

export default function FireCalc() {
  const [age, setAge] = useState(35);
  const [retireAge, setRetireAge] = useState(50);
  const [asset, setAsset] = useState(18000);
  const [monthlySave, setMonthlySave] = useState(150);
  const [monthlyExpense, setMonthlyExpense] = useState(300);
  const [returnRate, setReturnRate] = useState(7);
  const [inflation, setInflation] = useState(2.5);
  const [withdrawRate, setWithdrawRate] = useState(4);
  const [sideIncome, setSideIncome] = useState(0);
  const [pension, setPension] = useState(0);
  const [growSavings, setGrowSavings] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const [lifeExpectancy, setLifeExpectancy] = useState(100);

  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);

  // URL에 담긴 값이 있으면 복원 (링크 공유·북마크용)
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const num = (key: string, setter: (n: number) => void) => {
      const v = p.get(key);
      if (v !== null && !Number.isNaN(Number(v))) setter(Number(v));
    };
    num("age", setAge);
    num("retireAge", setRetireAge);
    num("asset", setAsset);
    num("monthlySave", setMonthlySave);
    num("monthlyExpense", setMonthlyExpense);
    num("returnRate", setReturnRate);
    num("inflation", setInflation);
    num("withdrawRate", setWithdrawRate);
    num("sideIncome", setSideIncome);
    num("pension", setPension);
    num("lifeExpectancy", setLifeExpectancy);
    const g = p.get("growSavings");
    if (g !== null) setGrowSavings(g === "1");
    const adv = p.get("advanced");
    if (adv !== null) setAdvanced(adv === "1");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buildShareUrl = () => {
    const p = new URLSearchParams({
      age: String(age),
      retireAge: String(retireAge),
      asset: String(asset),
      monthlySave: String(monthlySave),
      monthlyExpense: String(monthlyExpense),
      returnRate: String(returnRate),
      inflation: String(inflation),
      withdrawRate: String(withdrawRate),
      sideIncome: String(sideIncome),
      pension: String(pension),
      lifeExpectancy: String(lifeExpectancy),
      growSavings: growSavings ? "1" : "0",
      advanced: advanced ? "1" : "0",
    });
    return `${window.location.origin}${window.location.pathname}?${p.toString()}`;
  };

  const copyShareLink = async () => {
    const url = buildShareUrl();
    window.history.replaceState(null, "", url);
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("아래 링크를 복사하세요", url);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const downloadPdf = async () => {
    if (!captureRef.current) return;
    setExporting(true);
    try {
      const [{ default: html2canvas }, { default: JsPDF }] = await Promise.all([
        import("html2canvas-pro"),
        import("jspdf"),
      ]);
      const el = captureRef.current;
      const canvas = await html2canvas(el, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        foreignObjectRendering: true,
        windowWidth: el.scrollWidth,
        width: el.scrollWidth,
      });
      const imgData = canvas.toDataURL("image/png");
      // 캡처된 화면 비율 그대로 mm로 환산해 페이지 크기를 잡는다 (scale:2 보정, 96dpi 기준)
      const pxToMm = (px: number) => (px / 2) * (25.4 / 96);
      const imgWidthMm = pxToMm(canvas.width);
      const imgHeightMm = pxToMm(canvas.height);
      const pdf = new JsPDF({
        orientation: imgWidthMm >= imgHeightMm ? "l" : "p",
        unit: "mm",
        format: [imgWidthMm, imgHeightMm],
      });
      pdf.addImage(imgData, "PNG", 0, 0, imgWidthMm, imgHeightMm);
      pdf.save(`파이어계산기_${Math.round(age)}세_결과.pdf`);
    } catch (err) {
      console.error("PDF 저장 실패:", err);
      window.alert("PDF 저장에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setExporting(false);
    }
  };

  const r = useMemo(() => {
    const netMonthly = Math.max(0, monthlyExpense - sideIncome - pension);
    const annualExpense = netMonthly * 10000 * 12;
    // 흔히 말하는 "4% 룰" 기준 목표 자산 (참고 표시용 — 30년 은퇴를 전제로 한 근사값)
    const ruleOfThumbNumber = annualExpense / (withdrawRate / 100);

    // ── 실질(오늘 화폐가치) 기준 시뮬레이션 ──
    // 명목수익률에서 물가상승률을 제거한 "실질수익률"로 자산을 굴린다.
    // 이러면 목표 자산도, 월 인출액도 물가에 따라 부풀릴 필요 없이 오늘 금액 그대로 쓸 수 있어
    // 화면에 나오는 모든 금액의 기준 시점이 "오늘"로 통일된다.
    const realAnnualReturn = (1 + returnRate / 100) / (1 + inflation / 100) - 1;
    const mRet = Math.pow(1 + realAnnualReturn, 1 / 12) - 1;
    const save = monthlySave * 10000;
    // 월 투자금을 물가에 연동하면, 실질 기준에서는 저축액이 그대로 유지되는 것과 같다.
    // 연동하지 않으면 실질 가치가 매년 물가만큼 깎이므로 그 감소를 반영한다.
    const saveDecay = growSavings ? 1 : Math.pow(1 / (1 + inflation / 100), 1 / 12);

    const startAsset = asset * 10000;
    // 설정한 기대수명까지만 시뮬레이션
    const maxMonths = Math.max(0, Math.round((lifeExpectancy - age) * 12));

    // 특정 나이에 은퇴해서 기대수명까지 버티는 데 실제로 필요한 자산을 역산한다.
    // (인출률 기반 fireNumber는 30년 은퇴를 전제로 한 근사값이라, 조기 은퇴 시 과소평가된다)
    const requiredAssetFor = (retireAtAge: number): number => {
      const monthsToCover = Math.max(0, Math.round((lifeExpectancy - retireAtAge) * 12));
      if (monthsToCover === 0 || netMonthly <= 0) return 0;
      const exp = netMonthly * 10000;
      let lo = 0,
        hi = exp * monthsToCover * 2 + 1;
      for (let it = 0; it < 60; it++) {
        const mid = (lo + hi) / 2;
        let c = mid;
        let ok = true;
        for (let m = 0; m < monthsToCover; m++) {
          c = c * (1 + mRet) - exp;
          if (c < 0) {
            ok = false;
            break;
          }
        }
        if (ok) hi = mid;
        else lo = mid;
      }
      return hi;
    };

    // 1) 달성 시점 계산 — 매달 "그 나이에 은퇴할 경우 필요한 자산"과 현재 자산을 비교한다.
    //    늦게 은퇴할수록 써야 할 기간이 짧아 필요 자산이 줄어들기 때문에,
    //    고정된 목표(4% 룰 근사값)를 쓰면 실제보다 은퇴 시점을 늦게 잡게 된다.
    const already = startAsset >= requiredAssetFor(age);
    let cur = startAsset;
    let curSave = save;
    let months = 0;
    if (!already) {
      while (months < maxMonths) {
        cur = cur * (1 + mRet) + curSave;
        curSave = curSave * saveDecay;
        months++;
        if (cur >= requiredAssetFor(age + months / 12)) break;
      }
    }
    const reached = already || (months < maxMonths && cur >= requiredAssetFor(age + months / 12));
    const reachAge = already ? age : reached ? age + months / 12 : null;
    const reachMonths = already ? 0 : reached ? months : null;
    // 달성 시점의 실제 자산 (목표를 살짝 초과 달성하므로 목표치와 다를 수 있다)
    const assetAtRetire = already ? startAsset : cur;
    // 화면에 표시할 목표 자산 = 실제 은퇴 시점 기준 필요 자산
    const fireNumber = reachAge !== null ? requiredAssetFor(reachAge) : requiredAssetFor(retireAge > age ? retireAge : age);

    // 2) 차트용 경로: 달성 시점 이후 10년을 더 이어서 추세를 보여줌
    //    실질 기준이므로 목표선(target)은 수평으로 고정된다
    //    달성 전에는 저축을 넣고, 달성(은퇴) 이후에는 저축이 멈추고 생활비를 인출한다
    const withdrawPerMonth = Math.max(0, monthlyExpense - sideIncome - pension) * 10000;
    const path: { age: number; asset: number; target: number }[] = [
      { age, asset: startAsset, target: fireNumber },
    ];
    {
      let c = startAsset,
        cs = save,
        m = 0;
      // 달성 후 최소 30년(또는 기대수명)까지는 그려서 은퇴 후 자산 추이를 충분히 보여준다
      const cap = reached ? Math.min(months + 12 * 30, maxMonths) : maxMonths;
      while (m < cap) {
        const retiredNow = reached && m >= months;
        if (retiredNow) {
          // 은퇴 후: 저축 중단, 생활비 인출
          c = c * (1 + mRet) - withdrawPerMonth;
          if (c < 0) c = 0;
        } else {
          // 은퇴 전: 계속 저축
          c = c * (1 + mRet) + cs;
          cs = cs * saveDecay;
        }
        m++;
        if (m % 12 === 0) path.push({ age: age + m / 12, asset: c, target: fireNumber });
      }
    }

    // 목표 은퇴나이까지 필요한 월 투자금 (이분탐색)
    // 목표 자산은 인출률 근사(fireNumber)가 아니라, 그 나이에 은퇴해서 기대수명까지
    // 실제로 버틸 수 있는 금액을 역산해서 쓴다
    let extraSave: number | null = null;
    let shortfall: number | null = null;
    let requiredAtRetireAge: number | null = null;
    if (retireAge > age) {
      const tM = (retireAge - age) * 12;
      requiredAtRetireAge = requiredAssetFor(retireAge);
      let projected = startAsset;
      let projSave = save;
      for (let m = 0; m < tM; m++) {
        projected = projected * (1 + mRet) + projSave;
        projSave = projSave * saveDecay;
      }
      shortfall = Math.max(0, requiredAtRetireAge - projected);

      let lo = 0,
        hi = 50000000;
      for (let it = 0; it < 40; it++) {
        const mid = (lo + hi) / 2;
        let c = startAsset;
        let s = mid;
        for (let m = 0; m < tM; m++) {
          c = c * (1 + mRet) + s;
          s = s * saveDecay;
        }
        if (c >= requiredAtRetireAge) hi = mid;
        else lo = mid;
      }
      extraSave = Math.max(0, hi - save);
    }

    // 은퇴 후 월 인출액 = 실제로 필요한 생활비 (오늘 가치 기준)
    // 파이어넘버 × 인출률 ÷ 12 와 수학적으로 동일하지만, 생활비를 직접 쓰는 쪽이
    // "내가 입력한 값"과 화면 표시가 어긋나지 않아 명확하다
    const monthlyWithdraw = netMonthly * 10000;

    let fireType = "Regular FIRE";
    let fireTypeDesc = "일반적인 생활비 기준의 표준 시나리오입니다.";
    if (monthlyExpense <= 200) {
      fireType = "Lean FIRE";
      fireTypeDesc = "지출을 단단히 줄인 절제형 시나리오입니다.";
    } else if (monthlyExpense >= 500) {
      fireType = "Fat FIRE";
      fireTypeDesc = "여행·취미 여유가 있는 풍족형 시나리오입니다.";
    }

    // 자산 소진 나이 + 연도별 경로 (재정 수명 차트용)
    // 실질 기준이므로 인출액은 오늘 금액 그대로 유지하고, 자산은 실질수익률로 굴린다
    let depletionAge: number | null = null;
    const depletionPath: { age: number; asset: number }[] = [];
    // 인출할 금액이 없으면(부수입·연금만으로 생활비가 충당되면) 자산은 줄어들지 않는다
    if (reachAge !== null && monthlyWithdraw > 0) {
      // 시작 자산은 파이어넘버가 아니라 "실제 달성 시점 자산"이어야 위 성장 차트와 이어진다
      let c = assetAtRetire;
      const exp = monthlyWithdraw;
      let m = 0;
      // 설정한 기대수명까지만 시뮬레이션
      const cap = Math.max(0, Math.round((lifeExpectancy - reachAge) * 12));
      depletionPath.push({ age: reachAge, asset: Math.max(c, 0) });
      while (c > 0 && m < cap) {
        c = c * (1 + mRet) - exp;
        m++;
        if (m % 12 === 0) depletionPath.push({ age: reachAge + m / 12, asset: Math.max(c, 0) });
      }
      depletionAge = m >= cap ? null : reachAge + m / 12;
      if (depletionAge !== null && depletionPath[depletionPath.length - 1].asset > 0) {
        depletionPath.push({ age: depletionAge, asset: 0 });
      }
    }

    // ── 은퇴 기간 대비 인출률 적정성 진단 ──
    // 4% 룰은 "30년 은퇴"를 전제로 만들어진 규칙이라, 조기 은퇴로 버텨야 할 기간이 길어지면
    // 같은 4%라도 자산이 먼저 바닥날 수 있다. 기대수명까지 버티는 데 필요한 인출률을 역산한다.
    let safeWithdrawRate: number | null = null;
    let retirementYears: number | null = null;
    if (reachAge !== null && assetAtRetire > 0) {
      retirementYears = Math.max(0, lifeExpectancy - reachAge);
      const totalMonths = Math.round(retirementYears * 12);
      if (totalMonths > 0) {
        // 자산이 정확히 기대수명 시점에 0이 되는 월 인출액을 이분탐색으로 찾는다
        let lo = 0,
          hi = assetAtRetire;
        for (let it = 0; it < 60; it++) {
          const mid = (lo + hi) / 2;
          let c = assetAtRetire;
          let survived = true;
          for (let m = 0; m < totalMonths; m++) {
            c = c * (1 + mRet) - mid;
            if (c < 0) {
              survived = false;
              break;
            }
          }
          if (survived) lo = mid;
          else hi = mid;
        }
        // 월 인출액 → 연 인출률(달성 시점 자산 대비)
        safeWithdrawRate = ((lo * 12) / assetAtRetire) * 100;
      }
    }

    return {
      fireNumber,
      months: reachMonths,
      reachAge,
      already,
      extraSave,
      shortfall,
      monthlyWithdraw,
      fireType,
      fireTypeDesc,
      depletionAge,
      depletionPath,
      annualExpense,
      netMonthly,
      path,
      realAnnualReturn,
      mRet,
      assetAtRetire,
      safeWithdrawRate,
      retirementYears,
      requiredAtRetireAge,
      ruleOfThumbNumber,
    };
  }, [age, retireAge, asset, monthlySave, monthlyExpense, returnRate, inflation, withdrawRate, sideIncome, pension, growSavings, lifeExpectancy]);

  // 몬테카를로 시뮬레이션: 매달 수익률을 고정값이 아니라 변동성 있는 랜덤값으로 뽑아
  // 은퇴 후 30년 동안 자산이 몇 %의 확률로 안 바닥나는지 계산한다
  // (본 계산과 동일하게 실질 기준 — 평균 수익률은 실질수익률을 쓴다)
  const monteCarlo = useMemo(() => {
    if (r.reachAge === null) return null;
    const TRIALS = 500;
    const HORIZON_YEARS = Math.max(1, Math.round(r.retirementYears ?? 30));
    const ANNUAL_VOL = 0.15; // 주식 비중 높은 포트폴리오 기준 연 변동성 가정(단순화)
    const monthlyMean = r.mRet;
    const monthlySd = ANNUAL_VOL / Math.sqrt(12);
    const months = HORIZON_YEARS * 12;
    const startCapital = r.assetAtRetire;
    const monthlyWithdraw = r.monthlyWithdraw;

    const randNormal = () => {
      let u = 0,
        v = 0;
      while (u === 0) u = Math.random();
      while (v === 0) v = Math.random();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    };

    let successCount = 0;
    const finalBalances: number[] = [];
    for (let t = 0; t < TRIALS; t++) {
      let c = startCapital;
      let survived = true;
      for (let m = 0; m < months; m++) {
        const ret = monthlyMean + randNormal() * monthlySd;
        c = c * (1 + ret) - monthlyWithdraw;
        if (c <= 0) {
          survived = false;
          c = 0;
          break;
        }
      }
      if (survived) successCount++;
      finalBalances.push(c);
    }
    finalBalances.sort((a, b) => a - b);
    const median = finalBalances[Math.floor(TRIALS / 2)];

    return {
      trials: TRIALS,
      successRate: (successCount / TRIALS) * 100,
      horizonYears: HORIZON_YEARS,
      medianFinalBalance: median,
      vol: ANNUAL_VOL,
      realReturn: r.realAnnualReturn * 100,
    };
  }, [r.reachAge, r.assetAtRetire, r.monthlyWithdraw, r.mRet, r.realAnnualReturn]);

  const scenarios = useMemo(() => {
    return [5, 7, 9].map((rate) => {
      const netMonthly = Math.max(0, monthlyExpense - sideIncome - pension);
      const fireNum = (netMonthly * 10000 * 12) / (withdrawRate / 100);
      // 본 계산과 동일한 실질 기준
      const realAnnual = (1 + rate / 100) / (1 + inflation / 100) - 1;
      const mRet = Math.pow(1 + realAnnual, 1 / 12) - 1;
      const saveDecay = growSavings ? 1 : Math.pow(1 / (1 + inflation / 100), 1 / 12);
      const startAsset = asset * 10000;
      const max = Math.max(0, Math.round((lifeExpectancy - age) * 12));
      // 이미 달성한 경우 (본 계산의 already와 동일 처리)
      if (startAsset >= fireNum) {
        return {
          rate,
          label: rate === 5 ? "보수적" : rate === 7 ? "기본" : "공격적",
          reachAge: age,
        };
      }
      let cur = startAsset,
        curSave = monthlySave * 10000,
        months = 0;
      while (cur < fireNum && months < max) {
        cur = cur * (1 + mRet) + curSave;
        curSave = curSave * saveDecay;
        months++;
      }
      return {
        rate,
        label: rate === 5 ? "보수적" : rate === 7 ? "기본" : "공격적",
        reachAge: cur >= fireNum && months < max ? age + Math.floor(months / 12) : null,
      };
    });
  }, [age, asset, monthlySave, monthlyExpense, inflation, withdrawRate, sideIncome, pension, growSavings, lifeExpectancy]);

  const fmtDur = (m: number) => {
    const y = Math.floor(m / 12),
      mo = m % 12;
    return y > 0 ? `${y}년 ${mo}개월` : `${mo}개월`;
  };

  // 한줄 요약
  const summary = r.already
    ? `현재 자산이 이미 목표 ${eokFull(r.fireNumber)}를 넘어 FIRE 달성 상태입니다.`
    : r.reachAge !== null
    ? `현재 조건이라면 약 ${r.reachAge.toFixed(1)}세 전후 FIRE 가능성이 보입니다.` +
      (r.shortfall && r.shortfall > 0
        ? ` ${retireAge}세 목표까지 약 ${eokFull(r.shortfall)} 부족하고, 이를 메우려면 월 ${Math.round(
            (r.extraSave ?? 0) / 10000
          ).toLocaleString("ko-KR")}만원 정도 추가 적립이 필요합니다.`
        : ` ${retireAge}세 목표를 현재 저축으로 달성할 수 있습니다.`)
    : `현재 조건으로는 ${lifeExpectancy}세까지 목표 달성이 어렵습니다. 저축을 늘리거나 목표 지출을 줄여보세요.`;

  return (
    <div className="mx-auto max-w-[1280px] px-4">
    {/* 광고 (입력칸 위, 전체 폭) */}
    <AdSlot id="calc-fire-mid" />

    <div className="grid gap-6 lg:grid-cols-[380px_1fr] lg:items-start" ref={captureRef}>
      {/* ═══ 왼쪽: 입력 ═══ */}
      <div className="space-y-4">
        {/* 기본 입력 */}
        <div className="space-y-4 rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#2E4494]">기본 입력</p>
            <p className="mt-0.5 text-base font-bold text-[#1B2A4A]">은퇴 목표와 자산 속도</p>
            <p className="mt-0.5 text-xs text-[#8B93A6]">
              현재 나이부터 월 투자 가능액까지, 계산의 출발점이 되는 값입니다.
            </p>
          </div>

          <Field label="현재 나이" hint="20세~100세" value={age} onChange={setAge} suffix="세" max={100} />
          <Field label="목표 은퇴 나이" hint="현재 나이보다 높게, 최대 100세" value={retireAge} onChange={setRetireAge} suffix="세" max={100} />

          <div>
            <Field
              label="자금 사용 계획 나이"
              hint="이 나이까지 자산이 버티도록 계산합니다"
              value={lifeExpectancy}
              onChange={setLifeExpectancy}
              suffix="세"
              max={110}
            />
            {lifeExpectancy <= age && (
              <p className="mt-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                자금 사용 계획 나이가 현재 나이보다 낮거나 같습니다. 은퇴 후 쓸 기간이 없어 목표 자산이 0으로
                계산됩니다. 현재 나이보다 높게 설정해주세요.
              </p>
            )}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[85, 90, 95, 100].map((v) => (
                <button
                  key={v}
                  onClick={() => setLifeExpectancy(v)}
                  className={`rounded-md border px-2 py-1 text-xs transition ${
                    lifeExpectancy === v
                      ? "border-[#2E4494] bg-[rgba(46,68,148,0.06)] font-medium text-[#2E4494]"
                      : "border-[rgba(46,68,148,0.14)] bg-white text-[#7A8296] hover:border-[#2E4494]"
                  }`}
                >
                  {v}세
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-[#8B93A6]">
              2024년 한국인 기대수명은 남성 약 80.6세, 여성 약 86.4세입니다. 다만 은퇴 자금은 평균보다 오래
              사는 경우를 대비해 여유 있게 잡는 것이 안전해서, 기본값은 100세로 설정했습니다.
            </p>
          </div>

          <div>
            <Field
              label="현재 순자산"
              hint="예: 18000 입력 = 1억 8,000만원"
              value={asset}
              onChange={setAsset}
              suffix="만원"
              display={(n) => eokFull(n * 10000)}
            />
            <PresetRow
              current={asset}
              presets={[10000, 30000]}
              onPick={setAsset}
              format={(v) => (v >= 10000 ? `${v / 10000}억` : `${v.toLocaleString("ko-KR")}만원`)}
            />
          </div>

          <div>
            <Field
              label="월 투자 가능액"
              hint="예: 150 입력 = 150만원"
              value={monthlySave}
              onChange={setMonthlySave}
              suffix="만원"
              display={(n) => eokFull(n * 10000)}
            />
            <PresetRow
              current={monthlySave}
              presets={[100, 200]}
              onPick={setMonthlySave}
              format={(v) => `${v.toLocaleString("ko-KR")}만원`}
            />
          </div>
        </div>

        {/* 생활비 기준 */}
        <div className="space-y-3 rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#2E4494]">생활비 기준</p>
            <p className="mt-0.5 text-base font-bold text-[#1B2A4A]">은퇴 후 월 생활비</p>
            <p className="mt-0.5 text-xs text-[#8B93A6]">
              평균 생활비 프리셋으로 빠르게 시작하고, 본인 소비 구조에 맞게 조정하세요.
            </p>
          </div>
          <Field
            label="월 생활비"
            hint="예: 300 입력 = 300만원"
            value={monthlyExpense}
            onChange={setMonthlyExpense}
            suffix="만원"
            display={(n) => eokFull(n * 10000)}
          />
          <div className="flex flex-wrap gap-2">
            {EXPENSE_PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => setMonthlyExpense(p.value)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                  monthlyExpense === p.value
                    ? "border-[#2E4494] bg-[rgba(46,68,148,0.06)] text-[#2E4494]"
                    : "border-[rgba(46,68,148,0.22)] bg-white text-[#5B6478] hover:border-[#2E4494]"
                }`}
              >
                {p.label} <span className="text-[#8B93A6]">{p.value}만</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-[#8B93A6]">
            평균값은 참고용이며 실제 계산은 본인의 은퇴 후 소비 구조에 맞게 조정하세요.
          </p>
        </div>

        {/* 가정 옵션 */}
        <div className="space-y-4 rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#2E4494]">가정 옵션</p>
            <p className="mt-0.5 text-base font-bold text-[#1B2A4A]">수익률과 인출률 조정</p>
            <p className="mt-0.5 text-xs text-[#8B93A6]">
              기본형은 가장 널리 쓰이는 표준값(물가 2.5%, 인출률 4%)을 그대로 사용합니다.
            </p>
          </div>

          {/* 모드 전환 */}
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
            {(
              [
                { id: false, label: "기본형" },
                { id: true, label: "상세 설정" },
              ] as const
            ).map((m) => (
              <button
                key={String(m.id)}
                onClick={() => setAdvanced(m.id)}
                className={`rounded-lg py-2 text-sm font-semibold transition ${
                  advanced === m.id ? "bg-white text-[#2E4494] shadow-sm" : "text-[#7A8296]"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div>
            <Slider label="기대 연수익률" value={returnRate} onChange={setReturnRate} min={1} max={15} step={0.5} />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {RETURN_PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => setReturnRate(p.value)}
                  className="rounded-md border border-[rgba(46,68,148,0.14)] bg-white px-2 py-1 text-xs text-[#7A8296] hover:border-[#2E4494]"
                >
                  {p.label} {p.value}%
                </button>
              ))}
            </div>
            {returnRate > 15 && (
              <p className="mt-2 text-xs text-amber-600">⚠ 15% 초과는 대가들도 어려운 수준입니다. 참고용으로만.</p>
            )}
          </div>

          {advanced ? (
            <>
              <Slider label="물가상승률" value={inflation} onChange={setInflation} min={0} max={6} step={0.1} />
              <label className="flex items-start gap-2 text-sm text-[#5B6478]">
                <input
                  type="checkbox"
                  checked={growSavings}
                  onChange={(e) => setGrowSavings(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-[rgba(46,68,148,0.22)]"
                />
                <span>
                  월 투자금도 물가상승률만큼 매년 인상
                  <span className="block text-xs font-normal text-[#8B93A6]">
                    승진·연봉 인상으로 저축 여력이 같이 늘어난다고 가정 (기본: 지금 금액 그대로 유지)
                  </span>
                </span>
              </label>
              <Slider label="안전인출률 (참고용)" value={withdrawRate} onChange={setWithdrawRate} min={2.5} max={5} step={0.5} />
              <p className="text-xs leading-relaxed text-[#8B93A6]">
                이 계산기의 목표 자산은 인출률이 아니라 "자금 사용 계획 나이까지 실제로 버티는 금액"을 직접
                역산해 정합니다. 여기서 정한 인출률은 결과 화면에서 흔히 쓰는 4% 룰과 비교해보는 참고값으로만
                쓰입니다.
              </p>
              <div className="grid grid-cols-2 gap-4 border-t border-[rgba(46,68,148,0.14)] pt-4">
                <Field label="월 부수입" value={sideIncome} onChange={setSideIncome} suffix="만원" />
                <Field label="월 연금 예상액" value={pension} onChange={setPension} suffix="만원" />
              </div>
            </>
          ) : (
            <div className="rounded-lg border border-[rgba(46,68,148,0.14)] bg-white p-3 text-xs leading-relaxed text-[#7A8296]">
              <p className="font-semibold text-[#5B6478]">기본형에서 적용 중인 값</p>
              <div className="mt-1.5 space-y-1">
                <p>· 물가상승률 {inflation}% (한국은행 목표치 수준)</p>
                <p>· 안전인출률 {withdrawRate}% (가장 널리 쓰이는 표준)</p>
                <p>· 월 부수입·연금 미반영</p>
              </div>
              <p className="mt-2">
                실질수익률 <strong className="text-[#5B6478]">연 {(r.realAnnualReturn * 100).toFixed(1)}%</strong>로
                계산됩니다. 이 값들을 직접 바꾸려면 "상세 설정"을 선택하세요.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ═══ 오른쪽: 결과 (sticky) ═══ */}
      <div className="space-y-5 lg:sticky lg:top-20">
        {/* 링크 복사 · PDF 저장 */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={copyShareLink}
            className="flex-1 rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-3 py-2 text-xs font-medium text-[#5B6478] hover:border-[#2E4494]"
          >
            {copied ? "링크 복사됨" : "링크 복사 (값 공유·저장)"}
          </button>
          <button
            type="button"
            onClick={downloadPdf}
            disabled={exporting}
            className="flex-1 rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-3 py-2 text-xs font-medium text-[#5B6478] hover:border-[#2E4494] disabled:opacity-50"
          >
            {exporting ? "PDF 생성 중..." : "PDF로 저장"}
          </button>
        </div>

        {/* 한줄 요약 */}
        <div className="rounded-xl bg-[#2E4494] px-5 py-4 text-sm leading-relaxed text-white">{summary}</div>

        {/* 순 생활비 0 경고 */}
        {r.netMonthly === 0 && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
            <p className="font-semibold">확인이 필요합니다</p>
            <p className="mt-1">
              은퇴 후 필요한 순 생활비가 0원으로 계산됐습니다
              {sideIncome + pension > 0
                ? " (부수입·연금이 월 생활비 이상으로 입력됨)"
                : " (월 생활비가 0으로 입력됨)"}
              . 이 경우 필요한 목표 자산도 0원이 되어 무조건 "달성 완료"로 표시됩니다. 실제 은퇴 후 지출을
              다시 확인해 입력해주세요.
            </p>
          </div>
        )}

        {/* 결과 카드 */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Card
            highlight
            label="FIRE 목표 자산"
            value={eokFull(r.fireNumber)}
            sub={
              r.reachAge !== null
                ? `${Math.round(r.reachAge)}세 은퇴 → ${lifeExpectancy}세까지 ${Math.round(
                    lifeExpectancy - r.reachAge
                  )}년 사용 기준`
                : `순 생활비 월 ${r.netMonthly.toLocaleString("ko-KR")}만원 기준`
            }
          />
          <Card
            label="예상 달성 시점"
            value={r.already ? "달성 완료" : r.reachAge !== null ? `${r.reachAge.toFixed(1)}세` : `${lifeExpectancy}세+`}
            sub={r.months ? `${fmtDur(r.months)} 후` : "-"}
          />
          <Card
            label="부족 금액"
            value={
              retireAge <= age
                ? "계산 불가"
                : r.shortfall && r.shortfall > 0
                  ? eokFull(r.shortfall)
                  : "없음"
            }
            sub={retireAge <= age ? "목표 은퇴나이가 현재 나이 이하" : `${retireAge}세 기준 부족분`}
          />
          <Card
            label="추가 필요 월 투자금"
            value={
              retireAge <= age
                ? "계산 불가"
                : r.extraSave
                  ? Math.round(r.extraSave / 10000).toLocaleString("ko-KR") + "만원"
                  : "불필요"
            }
            sub={retireAge <= age ? "목표 은퇴나이를 현재보다 뒤로 설정하세요" : "목표 시점에 맞추려면 추가 적립"}
          />
          <Card label="은퇴 후 월 인출액" value={won(r.monthlyWithdraw)} sub="입력한 순 생활비 (오늘 가치 기준)" />
          <Card
            label="자산 소진 나이"
            value={r.depletionAge === null ? `${lifeExpectancy}세+` : `${Math.round(r.depletionAge)}세`}
            sub={r.depletionAge === null ? "장기간 자산 유지" : "이 나이에 자산 소진 예상"}
          />
          <Card label="FIRE 유형" value={r.fireType} sub={r.fireTypeDesc} />
        </div>

        {/* 성장 차트 */}
        <GrowthChart path={r.path} reachAge={r.reachAge} />

        {/* 재정 수명 차트 */}
        <DepletionChart path={r.depletionPath} depletionAge={r.depletionAge} lifeExpectancy={lifeExpectancy} />

        {/* 4% 룰 대비 안내 */}
        {r.reachAge !== null && r.retirementYears !== null && (
          <div className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.06)] p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#2E4494]">목표 자산 계산 방식</p>
            <p className="mt-1 text-lg font-bold text-[#1B2A4A]">
              {Math.round(r.retirementYears)}년 사용 기준으로 {eokFull(r.fireNumber)}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-[#5B6478]">
              흔히 쓰는 <strong>4% 룰</strong>(자산의 4%씩 인출)로 계산하면{" "}
              <strong className="tabular-nums">{eokFull(r.ruleOfThumbNumber)}</strong>가 나옵니다. 하지만 4% 룰은
              은퇴 기간을 <strong>30년</strong>으로 가정해 만든 규칙이라, {Math.round(r.reachAge)}세에 은퇴해
              {lifeExpectancy}세까지 <strong>{Math.round(r.retirementYears)}년</strong>을 써야 하는 지금 상황과는
              전제가 다릅니다.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[#5B6478]">
              그래서 이 계산기는 4% 룰을 그대로 쓰지 않고,{" "}
              <strong>실제 사용 기간 동안 자산이 정확히 버티는 금액</strong>을 직접 역산합니다.
              {r.fireNumber > r.ruleOfThumbNumber
                ? " 사용 기간이 30년보다 길어 4% 룰보다 더 많은 자산이 필요합니다."
                : r.fireNumber < r.ruleOfThumbNumber
                  ? " 사용 기간이 30년보다 짧아 4% 룰보다 적은 자산으로도 충분합니다."
                  : ""}
            </p>
            {r.safeWithdrawRate !== null && (
              <p className="mt-2 text-xs text-[#8B93A6]">
                이 목표 자산은 연 {r.safeWithdrawRate.toFixed(1)}% 인출에 해당합니다.
              </p>
            )}
          </div>
        )}

        {/* 몬테카를로 시뮬레이션 */}
        {monteCarlo ? (
          (() => {
            const status = monteCarlo.successRate >= 85 ? "good" : monteCarlo.successRate >= 60 ? "warn" : "bad";
            const COLOR = {
              good: { box: "border-emerald-200 bg-emerald-50", text: "text-emerald-700" },
              warn: { box: "border-amber-200 bg-amber-50", text: "text-amber-700" },
              bad: { box: "border-rose-200 bg-rose-50", text: "text-rose-700" },
            }[status];
            const successCount = Math.round((monteCarlo.trials * monteCarlo.successRate) / 100);
            return (
              <div className={`rounded-xl border p-5 ${COLOR.box}`}>
                <p className={`text-xs font-semibold uppercase tracking-wide ${COLOR.text}`}>몬테카를로 시뮬레이션</p>
                <p className={`mt-1 text-2xl font-bold ${COLOR.text}`}>성공 확률 {monteCarlo.successRate.toFixed(0)}%</p>
                <p className="mt-1 text-sm leading-relaxed text-[#5B6478]">
                  은퇴 후 {monteCarlo.horizonYears}년 동안 매년 실질수익률이 평균{" "}
                  {monteCarlo.realReturn.toFixed(1)}%를 중심으로 표준편차{" "}
                  {(monteCarlo.vol * 100).toFixed(0)}%p만큼 무작위로 변동한다고 가정하고 {monteCarlo.trials}번
                  반복 시뮬레이션했습니다. {monteCarlo.trials}번 중 <strong>{successCount}번</strong>은{" "}
                  {monteCarlo.horizonYears}년 내내 자산이 유지됐습니다.
                </p>
                <p className="mt-2 text-xs text-[#8B93A6]">
                  고정 수익률 가정과 달리, 실제 시장처럼 오르내리는 해가 섞여 있어도 계획이 버틸 수 있는지를
                  확률로 보여줍니다. 연 변동성 15%는 주식 비중이 높은 포트폴리오를 가정한 단순화입니다. 85%
                  이상이면 안전, 60~85%면 주의, 60% 미만이면 계획을 다시 볼 필요가 있습니다.
                </p>
              </div>
            );
          })()
        ) : (
          <div className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-5 text-center text-sm text-[#8B93A6]">
            FIRE 달성 시점이 계산되지 않아({lifeExpectancy}세 내 목표 미달성) 몬테카를로 시뮬레이션을 실행할 수 없습니다.
          </div>
        )}

        {/* 계산 방식 설명 */}
        <div className="space-y-1.5 rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-4 text-xs leading-relaxed text-[#7A8296]">
          <p className="font-semibold text-[#5B6478]">이 차트는 이렇게 계산됩니다</p>
          <p>
            화면의 모든 금액은 <strong className="text-[#5B6478]">오늘 화폐가치 기준</strong>입니다. 물가상승은
            수익률에서 차감하는 방식(실질수익률 = 기대수익률 {returnRate}% − 물가 {inflation}% ≈{" "}
            <strong className="text-[#5B6478]">연 {(r.realAnnualReturn * 100).toFixed(1)}%</strong>)으로
            반영했습니다. 그래서 목표 자산(주황 선)은 수평으로 고정되고, 은퇴 후 인출액도 지금 입력한 생활비
            그대로 유지됩니다 — 30년 뒤의 부풀려진 금액이 아니라 지금 감각으로 바로 이해할 수 있는 숫자입니다.
          </p>
          <p>
            월 투자금은 기본적으로 매년 물가만큼 실질 가치가 줄어든다고 봅니다(같은 50만 원이라도 시간이
            지날수록 구매력이 떨어지므로). "월 투자금도 물가상승률만큼 매년 인상" 옵션을 켜면 승진·연봉
            인상으로 저축액을 매년 물가만큼 올린다고 가정해, 실질 저축액이 그대로 유지됩니다 — 같은 조건이라도
            이 옵션 하나로 달성 시점이 꽤 앞당겨집니다.
          </p>
        </div>

        {/* 판단 보조 */}
        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#2E4494]">판단 보조</p>
            <p className="mt-0.5 text-base font-bold text-[#1B2A4A]">결과별로 다음에 뭘 봐야 하나</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {FIRE_DECISION_CARDS.map((card) => (
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

        {/* 시나리오 비교 */}
        <div className="overflow-hidden rounded-xl border border-[rgba(46,68,148,0.14)]">
          <div className="border-b border-[rgba(46,68,148,0.10)] bg-[rgba(46,68,148,0.03)] px-4 py-2.5 text-sm font-semibold text-[#1B2A4A]">
            시나리오 비교 (수익률별 달성 나이)
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[#7A8296]">
                <th className="px-4 py-2 text-left font-medium">시나리오</th>
                <th className="px-4 py-2 text-right font-medium">수익률</th>
                <th className="px-4 py-2 text-right font-medium">달성 나이</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((s) => (
                <tr key={s.rate} className="border-t border-[rgba(46,68,148,0.10)]">
                  <td className="px-4 py-2 font-medium text-[#1B2A4A]">{s.label}</td>
                  <td className="px-4 py-2 text-right tabular-nums text-[#5B6478]">연 {s.rate}%</td>
                  <td className="px-4 py-2 text-right font-semibold tabular-nums text-[#2E4494]">
                    {s.reachAge ? `${s.reachAge}세` : `${lifeExpectancy}세+`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CAGR 참고 */}
        <div className="overflow-hidden rounded-xl border border-[rgba(46,68,148,0.14)]">
          <div className="border-b border-[rgba(46,68,148,0.10)] bg-[rgba(46,68,148,0.03)] px-4 py-2.5 text-sm font-semibold text-[#1B2A4A]">
            수익률 감 잡기 (대표 자산 장기 CAGR)
          </div>
          <table className="w-full text-sm">
            <tbody>
              {CAGR_TABLE.map((c) => (
                <tr key={c.name} className="border-t border-[rgba(46,68,148,0.10)]">
                  <td className="px-4 py-2 font-medium text-[#1B2A4A]">{c.name}</td>
                  <td className="px-4 py-2 text-right font-semibold tabular-nums text-[#2E4494]">{c.cagr}%</td>
                  <td className="px-4 py-2 text-right text-xs text-[#8B93A6]">{c.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t border-[rgba(46,68,148,0.10)] px-4 py-2 text-xs text-[#8B93A6]">
            과거 장기 연평균 수익률 참고치입니다. 미래 수익을 보장하지 않으며 대가들의 수치는 재현 난이도가 매우 높습니다.
          </p>
        </div>
      </div>
    </div>

    {/* ═══ 하단 전체 폭 (grid 밖으로 분리 — sticky 오른쪽 컬럼과 겹치는 문제 방지) ═══ */}
    <div className="mt-6 space-y-6">
      <section className="space-y-1.5 rounded-xl bg-[rgba(46,68,148,0.03)] p-4 text-sm text-[#5B6478]">
        <p className="font-semibold text-[#1B2A4A]">파이어 넘버란?</p>
        <p>
          은퇴 후 연 지출의 25배(4% 룰 기준)를 모으면, 자산을 원금 손실 없이 매년 인출하며 살 수 있다는
          개념입니다. 인출률을 낮출수록 안전하지만 목표 금액이 커집니다. 국민연금·배당 등 반복 수입은 월
          부수입·연금에 넣으면 목표 자산이 줄어듭니다.
        </p>
      </section>
      <p className="text-xs leading-relaxed text-[#8B93A6]">
        ※ 물가상승을 수익률에서 차감한 실질 기준(오늘 화폐가치) 추정치입니다. 실제 수익률은 매년 변동하며
        세금·건강보험료는 반영하지 않았습니다. 보수적 수익률(5~7%)로 함께 비교하는 것이 안전합니다.
      </p>
    </div>
  </div>
  );
}

// ── SVG 차트 (나이별 점 + 호버 툴팁 + X/Y축 눈금) ──
function GrowthChart({
  path,
  reachAge,
}: {
  path: { age: number; asset: number; target: number }[];
  reachAge: number | null;
}) {
  const [hover, setHover] = useState<number | null>(null);
  if (path.length < 2) {
    return (
      <div className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-white p-6 text-center text-sm text-[#8B93A6]">
        입력값을 조정해 주세요.
      </div>
    );
  }
  const W = 560,
    H = 300,
    padL = 46,
    padR = 12,
    padT = 20,
    padB = 30;
  const maxVal = Math.max(...path.map((p) => Math.max(p.asset, p.target)));
  const minAge = path[0].age,
    maxAge = path[path.length - 1].age;
  const x = (a: number) => padL + ((a - minAge) / (maxAge - minAge || 1)) * (W - padL - padR);
  const y = (v: number) => H - padB - (v / maxVal) * (H - padT - padB);
  const line = (k: "asset" | "target") =>
    path.map((p, i) => `${i === 0 ? "M" : "L"} ${x(p.age).toFixed(1)} ${y(p[k]).toFixed(1)}`).join(" ");
  const eokShort = (n: number) =>
    n / 100000000 >= 1 ? (n / 100000000).toFixed(1) + "억" : Math.round(n / 10000).toLocaleString("ko-KR") + "만";

  // X축 눈금: 구간 길이에 따라 5 / 10 / 20세 단위
  const span = maxAge - minAge;
  const step = span <= 20 ? 5 : span <= 50 ? 10 : 20;
  const xTicks: number[] = [];
  for (let a = Math.ceil(minAge / step) * step; a <= maxAge; a += step) xTicks.push(a);
  if (xTicks.length === 0 || xTicks[0] - minAge > step * 0.4) xTicks.unshift(Math.round(minAge));
  if (maxAge - xTicks[xTicks.length - 1] > step * 0.4) xTicks.push(Math.round(maxAge));

  // Y축 눈금: 4단계
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * maxVal);

  return (
    <div className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-white p-4">
      <p className="mb-1 text-sm font-semibold text-[#1B2A4A]">자산 성장 시뮬레이션</p>
      <p className="mb-3 text-xs text-[#8B93A6]">
        <span className="text-[#2E4494]">■</span> 내 예상 자산 &nbsp;
        <span className="text-amber-500">■</span> 필요 목표 자산 · 모두 오늘 화폐가치 기준 · FIRE 달성 이후는
        저축이 멈추고 생활비를 인출하는 구간입니다
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        {/* Y 그리드 + 라벨 */}
        {yTicks.map((v, i) => (
          <g key={`y-${i}`}>
            <line x1={padL} y1={y(v)} x2={W - padR} y2={y(v)} stroke="#f1f5f9" />
            <text x={padL - 6} y={y(v) + 3} fontSize="9" fill="#94a3b8" textAnchor="end">
              {v === 0 ? "0" : eokShort(v)}
            </text>
          </g>
        ))}
        <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke="#cbd5e1" />

        {/* FIRE 달성 시점 세로선 */}
        {reachAge !== null && reachAge >= minAge && reachAge <= maxAge && (
          <g>
            <line
              x1={x(reachAge)}
              y1={padT}
              x2={x(reachAge)}
              y2={H - padB}
              stroke="#2563eb"
              strokeDasharray="3 3"
              strokeOpacity="0.4"
            />
            <text x={x(reachAge)} y={padT - 6} fontSize="9" fill="#2563eb" textAnchor="middle">
              FIRE {Math.round(reachAge)}세
            </text>
          </g>
        )}

        <path d={line("target")} fill="none" stroke="#f59e0b" strokeWidth="2" />
        <path d={line("asset")} fill="none" stroke="#2563eb" strokeWidth="2.5" />

        {/* 목표 자산(주황) 점 */}
        {path.map((p, i) => (
          <circle
            key={`t-${i}`}
            cx={x(p.age)}
            cy={y(p.target)}
            r={hover === i ? 4 : 2.5}
            fill="#f59e0b"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            style={{ cursor: "pointer" }}
          />
        ))}

        {/* 예상 자산(파랑) 점 */}
        {path.map((p, i) => (
          <circle
            key={`a-${i}`}
            cx={x(p.age)}
            cy={y(p.asset)}
            r={hover === i ? 5 : 3}
            fill="#2563eb"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            style={{ cursor: "pointer" }}
          />
        ))}

        {/* 툴팁 — 모든 점을 다 그린 다음, 가장 마지막에 그려서 항상 맨 위에 보이도록 함 */}
        {hover !== null &&
          (() => {
            const p = path[hover];
            const topY = Math.min(y(p.asset), y(p.target));
            const boxX = Math.min(x(p.age) + 6, W - 128);
            const boxY = Math.max(topY - 58, 2);
            return (
              <g>
                <rect x={boxX} y={boxY} width="124" height="52" rx="4" fill="#1e293b" />
                <text x={boxX + 6} y={boxY + 16} fontSize="11" fill="#fff">
                  {Math.round(p.age)}세
                </text>
                <text x={boxX + 6} y={boxY + 30} fontSize="11" fill="#93c5fd">
                  자산 {eokShort(p.asset)}
                </text>
                <text x={boxX + 6} y={boxY + 44} fontSize="11" fill="#fcd34d">
                  목표 {eokShort(p.target)}
                </text>
              </g>
            );
          })()}

        {/* X축 라벨 */}
        {xTicks.map((a, i) => (
          <text key={`x-${i}`} x={x(a)} y={H - 8} fontSize="10" fill="#94a3b8" textAnchor="middle">
            {Math.round(a)}세
          </text>
        ))}
      </svg>
    </div>
  );
}

// ── 재정 수명 차트: 은퇴(FIRE 달성) 후 자산이 얼마나 버티는지 ──
function DepletionChart({
  path,
  depletionAge,
  lifeExpectancy,
}: {
  path: { age: number; asset: number }[];
  depletionAge: number | null;
  lifeExpectancy: number;
}) {
  const [hover, setHover] = useState<number | null>(null);
  if (path.length < 2) {
    return (
      <div className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-white p-6 text-center text-sm text-[#8B93A6]">
        현재 조건으로는 {lifeExpectancy}세까지 FIRE 목표 자산에 도달하지 못해 은퇴 후 자산 소진 시뮬레이션을 계산할 수 없습니다.
        저축을 늘리거나 목표 지출을 줄이면 여기에 표시됩니다.
      </div>
    );
  }
  const W = 560,
    H = 260,
    padL = 46,
    padR = 12,
    padT = 20,
    padB = 30;
  const maxVal = Math.max(...path.map((p) => p.asset));
  const minAge = path[0].age,
    maxAge = path[path.length - 1].age;
  const x = (a: number) => padL + ((a - minAge) / (maxAge - minAge || 1)) * (W - padL - padR);
  const y = (v: number) => H - padB - (v / (maxVal || 1)) * (H - padT - padB);
  const line = path.map((p, i) => `${i === 0 ? "M" : "L"} ${x(p.age).toFixed(1)} ${y(p.asset).toFixed(1)}`).join(" ");
  const eokShort = (n: number) =>
    n / 100000000 >= 1 ? (n / 100000000).toFixed(1) + "억" : Math.round(n / 10000).toLocaleString("ko-KR") + "만";

  const span = maxAge - minAge;
  const step = span <= 20 ? 5 : span <= 50 ? 10 : 20;
  const xTicks: number[] = [];
  for (let a = Math.ceil(minAge / step) * step; a <= maxAge; a += step) xTicks.push(a);
  if (xTicks.length === 0 || xTicks[0] - minAge > step * 0.4) xTicks.unshift(Math.round(minAge));
  if (maxAge - xTicks[xTicks.length - 1] > step * 0.4) xTicks.push(Math.round(maxAge));

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * maxVal);

  return (
    <div className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-white p-4">
      <p className="mb-1 text-sm font-semibold text-[#1B2A4A]">재정 수명 차트</p>
      <p className="mb-3 text-xs text-[#8B93A6]">
        <span className="text-rose-500">■</span> 은퇴 후 자산 잔액 · FIRE 달성 시점부터 적립을 멈추고 생활비를
        인출한다고 가정합니다. 점에 마우스를 올려보세요
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        {yTicks.map((v, i) => (
          <g key={`y-${i}`}>
            <line x1={padL} y1={y(v)} x2={W - padR} y2={y(v)} stroke="#f1f5f9" />
            <text x={padL - 6} y={y(v) + 3} fontSize="9" fill="#94a3b8" textAnchor="end">
              {v === 0 ? "0" : eokShort(v)}
            </text>
          </g>
        ))}
        <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke="#cbd5e1" />

        {depletionAge !== null && depletionAge >= minAge && depletionAge <= maxAge && (
          <g>
            <line
              x1={x(depletionAge)}
              y1={padT}
              x2={x(depletionAge)}
              y2={H - padB}
              stroke="#e11d48"
              strokeDasharray="3 3"
              strokeOpacity="0.4"
            />
            <text x={x(depletionAge)} y={padT - 6} fontSize="9" fill="#e11d48" textAnchor="middle">
              소진 {Math.round(depletionAge)}세
            </text>
          </g>
        )}

        <path d={line} fill="none" stroke="#e11d48" strokeWidth="2.5" />

        {path.map((p, i) => (
          <circle
            key={i}
            cx={x(p.age)}
            cy={y(p.asset)}
            r={hover === i ? 5 : 3}
            fill="#e11d48"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            style={{ cursor: "pointer" }}
          />
        ))}

        {hover !== null &&
          (() => {
            const p = path[hover];
            const boxX = Math.min(x(p.age) + 6, W - 108);
            const boxY = Math.max(y(p.asset) - 44, 2);
            return (
              <g>
                <rect x={boxX} y={boxY} width="104" height="38" rx="4" fill="#1e293b" />
                <text x={boxX + 6} y={boxY + 16} fontSize="11" fill="#fff">
                  {Math.round(p.age)}세
                </text>
                <text x={boxX + 6} y={boxY + 30} fontSize="11" fill="#fda4af">
                  잔액 {eokShort(p.asset)}
                </text>
              </g>
            );
          })()}

        {xTicks.map((a, i) => (
          <text key={`x-${i}`} x={x(a)} y={H - 8} fontSize="10" fill="#94a3b8" textAnchor="middle">
            {Math.round(a)}세
          </text>
        ))}
      </svg>
    </div>
  );
}

function Card({ label, value, sub, highlight }: { label: string; value: string; sub?: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${highlight ? "border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.06)]" : "border-[rgba(46,68,148,0.14)] bg-white"}`}>
      <p className="text-xs text-[#7A8296]">{label}</p>
      <p className={`mt-1 font-bold tabular-nums ${highlight ? "text-lg text-[#2E4494]" : "text-base text-[#1B2A4A]"}`}>
        {value}
      </p>
      {sub && <p className="mt-1 text-xs leading-snug text-[#8B93A6]">{sub}</p>}
    </div>
  );
}

function Field({
  label,
  hint,
  value,
  onChange,
  suffix,
  display,
  max,
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (n: number) => void;
  suffix?: string;
  display?: (n: number) => string;
  max?: number;
}) {
  return (
    <label className="block">
      {(label || hint) && (
        <div className="flex items-baseline justify-between">
          {label && <span className="text-sm font-medium text-[#5B6478]">{label}</span>}
          {hint && <span className="text-xs text-[#8B93A6]">{hint}</span>}
        </div>
      )}
      <div className={`flex items-center gap-1 ${label || hint ? "mt-1.5" : ""}`}>
        <input
          type="text"
          inputMode="numeric"
          value={value === 0 ? "" : value.toLocaleString("ko-KR")}
          onChange={(e) => {
            const n = Number(e.target.value.replace(/[^0-9]/g, "")) || 0;
            onChange(max !== undefined ? Math.min(n, max) : n);
          }}
          className="w-full rounded-lg border border-[rgba(46,68,148,0.22)] bg-white px-3 py-3 text-right text-base tabular-nums"
        />
        {suffix && <span className="shrink-0 text-sm text-[#8B93A6]">{suffix}</span>}
      </div>
      {display && value > 0 && <p className="mt-1 text-xs font-medium text-[#2E4494]">약 {display(value)}</p>}
    </label>
  );
}

function PresetRow({
  current,
  presets,
  onPick,
  format,
}: {
  current: number;
  presets: number[];
  onPick: (n: number) => void;
  format: (n: number) => string;
}) {
  const items = Array.from(new Set([...presets, current])).sort((a, b) => a - b);
  return (
    <div className="mt-2 flex gap-2">
      {items.map((v) =>
        v === current ? (
          <span
            key={`cur-${v}`}
            className="flex-1 rounded-lg border border-[#2E4494] bg-[rgba(46,68,148,0.06)] px-2 py-1.5 text-center text-xs font-semibold text-[#2E4494]"
          >
            기본 {format(v)}
          </span>
        ) : (
          <button
            key={v}
            type="button"
            onClick={() => onPick(v)}
            className="flex-1 rounded-lg border border-[rgba(46,68,148,0.14)] bg-white px-2 py-1.5 text-center text-xs text-[#7A8296] hover:border-[#2E4494]"
          >
            {format(v)}
          </button>
        )
      )}
    </div>
  );
}

function Slider({
  label,
  value,
  onChange,
  min,
  max,
  step,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  step: number;
}) {
  return (
    <div className="text-sm font-medium text-[#5B6478]">
      <div className="flex items-center justify-between">
        <span>{label}</span>
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value) || 0)}
            className="w-16 rounded-lg border border-[rgba(46,68,148,0.22)] px-2 py-1 text-right tabular-nums text-[#2E4494]"
          />
          <span className="text-[#2E4494]">%</span>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-[#2E4494]"
      />
    </div>
  );
}
