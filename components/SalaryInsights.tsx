// 봉급표 상세 페이지용 분석 섹션 (서버 컴포넌트)
// - 2026년 값: 페이지 표와 같은 salary-*-2026.json
// - 2025년 값: 국가법령정보센터 공무원보수규정 개정 이력(pension-*-history.json)의 2025년 스냅샷
// 숫자는 모두 데이터에서 계산하며, 문장도 계산 결과에 따라 만들어진다.
import Link from "next/link";
import SimpleTable from "@/components/SimpleTable";
import civil from "@/data/salary-civil-2026.json";
import police from "@/data/salary-police-2026.json";
import fire from "@/data/salary-fire-2026.json";
import teacher from "@/data/salary-teacher-2026.json";
import military from "@/data/salary-military-2026.json";
import civilHist from "@/data/pension-civil-history.json";
import pfHist from "@/data/pension-police_fire-history.json";
import teacherHist from "@/data/pension-teacher-history.json";
import milHist from "@/data/pension-military-history.json";

type HistRow = { hobong: number; values?: (number | null)[]; value?: number | null };
type Snap = { efYd: string; rows: HistRow[] };
type SalaryRows = { hobong: number; pay: (number | null)[] }[];
type Series = { label: string; now: Map<number, number>; prev: Map<number, number> };

const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;
const pct = (r: number) => `${(r * 100).toFixed(1)}%`;
// 받침 유무에 따라 이/가 선택 (마지막 한글 글자 기준)
const iga = (word: string) => {
  const ch = [...word].reverse().find((c) => c >= "가" && c <= "힣");
  return ch && (ch.charCodeAt(0) - 0xac00) % 28 !== 0 ? "이" : "가";
};

function prevSnapshot(hist: unknown): Snap {
  const snaps = (hist as Snap[]).filter((s) => s.efYd < "20260101");
  return snaps.reduce((a, b) => (b.efYd > a.efYd ? b : a));
}

function mapFrom(rows: SalaryRows, col: number): Map<number, number> {
  const m = new Map<number, number>();
  for (const r of rows) {
    const v = r.pay[col];
    if (typeof v === "number") m.set(r.hobong, v);
  }
  return m;
}

function prevMap(snap: Snap, idx: number | "single"): Map<number, number> {
  const m = new Map<number, number>();
  for (const r of snap.rows) {
    const v = idx === "single" ? r.value : r.values?.[idx];
    if (typeof v === "number") m.set(r.hobong, v);
  }
  return m;
}

const MIL_ORDER = ["소장", "준장", "대령", "중령", "소령", "대위", "중위", "소위", "준위", "원사", "상사", "중사", "하사"];

export function seriesFor(slug: string): Series[] {
  if (slug === "civil") {
    const snap = prevSnapshot(civilHist);
    return civil.columns.map((c, i) => ({ label: c, now: mapFrom(civil.rows as SalaryRows, i), prev: prevMap(snap, Number(c[0]) - 1) }));
  }
  if (slug === "police" || slug === "fire") {
    const d = slug === "police" ? police : fire;
    const snap = prevSnapshot(pfHist);
    return d.columns.map((c, i) => ({ label: c, now: mapFrom(d.rows as SalaryRows, i), prev: prevMap(snap, 9 - i) }));
  }
  if (slug === "teacher") {
    return [{ label: "교원", now: mapFrom(teacher.rows as SalaryRows, 0), prev: prevMap(prevSnapshot(teacherHist), "single") }];
  }
  const snap = prevSnapshot(milHist);
  return military.officerTables.flatMap((t) =>
    t.columns.map((c, i) => ({ label: c, now: mapFrom(t.rows as SalaryRows, i), prev: prevMap(snap, MIL_ORDER.indexOf(c)) })),
  );
}

function change(s: Series, h: number): { diff: number; rate: number } | null {
  const a = s.prev.get(h);
  const b = s.now.get(h);
  if (a == null || b == null) return null;
  return { diff: b - a, rate: (b - a) / a };
}

const maxHobong = (s: Series) => Math.max(...s.now.keys());

function avgStep(s: Series, from: number, to: number): number | null {
  const a = s.now.get(from);
  const b = s.now.get(to);
  if (a == null || b == null || to <= from) return null;
  return (b - a) / (to - from);
}

export default function SalaryInsights({ slug }: { slug: string }) {
  const series = seriesFor(slug);
  const isTeacher = slug === "teacher";

  // 전체 셀의 인상률 범위와 저·고호봉 평균 비교 → 문장 생성
  const all = series.flatMap((s) => [...s.now.keys()].map((h) => change(s, h)).filter((x): x is { diff: number; rate: number } => x != null));
  const rates = all.map((x) => x.rate);
  const minR = Math.min(...rates);
  const maxR = Math.max(...rates);
  const avgAt = (h: number) => {
    const v = series.map((s) => change(s, h)?.rate).filter((x): x is number => x != null);
    return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
  };
  const low = avgAt(1);
  const high = avgAt(20);
  const trend =
    low != null && high != null
      ? low > high + 0.001
        ? `1호봉 평균 인상률은 ${pct(low)}, 20호봉은 ${pct(high)}로 낮은 호봉일수록 더 많이 올랐습니다.`
        : `1호봉 평균 인상률은 ${pct(low)}, 20호봉은 ${pct(high)}입니다.`
      : "";

  const raiseHead = isTeacher ? ["호봉", "2025년", "2026년", "인상액", "인상률"] : ["계급·직급", "1호봉", "10호봉", "20호봉"];
  const raiseRows: string[][] = isTeacher
    ? [1, 9, 14, 20, 30, 40].map((h) => {
        const s = series[0];
        const c = change(s, h);
        return [`${h}호봉`, won(s.prev.get(h) ?? 0), won(s.now.get(h) ?? 0), c ? `+${won(c.diff)}` : "-", c ? `+${pct(c.rate)}` : "-"];
      })
    : series.map((s) => [
        s.label,
        ...[1, 10, 20].map((h) => {
          const c = change(s, h);
          return c ? `+${won(c.diff)} (+${pct(c.rate)})` : "-";
        }),
      ]);

  const stepHead = isTeacher ? ["구간", "호봉 1개당 평균 승급액"] : ["계급·직급", "1→10호봉", "10→20호봉", "20호봉→최고"];
  const stepRows: string[][] = isTeacher
    ? [
        [1, 9],
        [9, 20],
        [20, 30],
        [30, 40],
      ].map(([a, b]) => [`${a}→${b}호봉`, won(avgStep(series[0], a, b) ?? 0)])
    : series.map((s) => {
        const mx = maxHobong(s);
        const cell = (a: number, b: number) => {
          const v = avgStep(s, a, b);
          return v == null ? "-" : won(v);
        };
        return [`${s.label} (최고 ${mx}호봉)`, cell(1, Math.min(10, mx)), mx > 10 ? cell(10, Math.min(20, mx)) : "-", mx > 20 ? cell(20, mx) : "-"];
      });

  return (
    <>
      <section className="space-y-3 text-[#5B6478]">
        <h2 className="text-xl font-bold text-[#1B2A4A]">2025년보다 얼마나 올랐나</h2>
        <p className="text-sm leading-relaxed">
          2025년 봉급표와 같은 호봉끼리 비교하면 {pct(minR)}~{pct(maxR)} 올랐습니다. {trend}
        </p>
        <SimpleTable head={raiseHead} rows={raiseRows} minWidth={isTeacher ? 420 : 560} />
        <p className="text-xs text-[#8B93A6]">
          2025년 값은 국가법령정보센터의 공무원보수규정 개정 이력(2025년 시행분) 기준입니다. 수당은 포함하지 않았습니다.
        </p>
      </section>

      <section className="space-y-3 text-[#5B6478]">
        <h2 className="text-xl font-bold text-[#1B2A4A]">호봉 1개 오를 때 평균 얼마 오르나</h2>
        <p className="text-sm leading-relaxed">
          매년 정기승급으로 1호봉씩 오를 때 기본급이 평균 얼마씩 늘어나는지 구간별로 나눈 값입니다. 같은 계급이라도 구간에
          따라 승급액이 달라서, 몇 년 뒤 월급을 가늠할 때 참고할 수 있습니다.
        </p>
        <SimpleTable head={stepHead} rows={stepRows} minWidth={isTeacher ? 360 : 560} />
        <p className="text-sm leading-relaxed">
          다른 직군과 같은 호봉 금액을 나란히 보려면{" "}
          <Link href="/salary" className="text-[#2E4494] underline">
            봉급표 모음의 직군별 비교표
          </Link>
          를 참고하세요.
        </p>
      </section>
    </>
  );
}

// ── 봉급표 모음(허브) 페이지용: 같은 호봉, 직군별 비교 ──
const COMPARE_COLS: { label: string; series: () => Map<number, number> }[] = [
  { label: "일반직 9급", series: () => mapFrom(civil.rows as SalaryRows, 0) },
  { label: "일반직 7급", series: () => mapFrom(civil.rows as SalaryRows, 2) },
  { label: "순경·소방사", series: () => mapFrom(police.rows as SalaryRows, 0) },
  { label: "경위·소방위", series: () => mapFrom(police.rows as SalaryRows, 3) },
  { label: "하사", series: () => mapFrom(military.officerTables[0].rows as SalaryRows, 0) },
  { label: "소위", series: () => mapFrom(military.officerTables[1].rows as SalaryRows, 0) },
  { label: "교원", series: () => mapFrom(teacher.rows as SalaryRows, 0) },
];

export function CrossCompare() {
  const cols = COMPARE_COLS.map((c) => ({ label: c.label, m: c.series() }));
  const rows = [1, 10, 20].map((h) => [`${h}호봉`, ...cols.map((c) => (c.m.has(h) ? won(c.m.get(h)!) : "-"))]);
  const at10 = cols.filter((c) => c.m.has(10)).map((c) => ({ label: c.label, v: c.m.get(10)! }));
  const top = at10.reduce((a, b) => (b.v > a.v ? b : a));
  const bottom = at10.reduce((a, b) => (b.v < a.v ? b : a));
  const sowiMax = Math.max(...cols.find((c) => c.label === "소위")!.m.keys());
  return (
    <section className="space-y-3 text-[#5B6478]">
      <h2 className="text-xl font-bold text-[#1B2A4A]">같은 호봉, 직군별 기본급 비교 (2026년)</h2>
      <p className="text-sm leading-relaxed">
        1호봉은 일반직 9급·순경·하사가 같지만, 호봉이 쌓일수록 봉급표마다 오르는 폭이 달라 차이가 벌어집니다. 10호봉 기준으로는{" "}
        {top.label}({won(top.v)}){iga(top.label)} 가장 높고 {bottom.label}({won(bottom.v)}){iga(bottom.label)} 가장 낮아 {won(top.v - bottom.v)} 차이가 납니다.
      </p>
      <SimpleTable head={["호봉", ...cols.map((c) => c.label)]} rows={rows} minWidth={760} />
      <p className="text-xs text-[#8B93A6]">
        기본급(봉급)만 비교한 값입니다. 교원은 보통 9호봉(사범계열)에서 시작하고, 소위는 봉급표상 {sowiMax}호봉까지 있습니다. 실제 월급은
        직군별 수당 구성이 달라 실수령액 계산기로 확인하세요.
      </p>
    </section>
  );
}
