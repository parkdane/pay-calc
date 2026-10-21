// 직군별 "월급 구성" 설명 섹션 (서버 컴포넌트)
// 모든 금액·요율은 계산기와 같은 데이터 파일에서 읽어서, 본문과 계산기 값이 항상 일치하도록 한다.
import rates from "@/data/tax-rates-2026.json";
import mil from "@/data/military-allowances-2026.json";
import civil from "@/data/salary-civil-2026.json";
import police from "@/data/salary-police-2026.json";
import teacher from "@/data/salary-teacher-2026.json";
import military from "@/data/salary-military-2026.json";

const won = (n: number) => Math.round(n).toLocaleString("ko-KR") + "원";
const pct = (r: number) => `${+(r * 100).toFixed(3)}%`;

const TEACHER_ALLOWANCE = 250000; // 교직수당 (CivilNetCalc와 동일)
const HOMEROOM_ALLOWANCE = 200000; // 담임수당 (CivilNetCalc와 동일)
const DEPT_HEAD_ALLOWANCE = 150000; // 보직교사수당 (CivilNetCalc와 동일)

type Row = [string, string, string?];

function payOf(rows: { hobong: number; pay: (number | null)[] }[], hobong: number, col: number) {
  return rows.find((r) => r.hobong === hobong)?.pay[col] ?? 0;
}

const pb = rates.positionBonusByGrade as unknown as Record<string, number>;
const fam = rates.familyAllowance;
const regular = rates.regularBonus.brackets;
const addon = rates.regularBonusAddon.brackets;

const regularText = `근무연수에 따라 월봉급액의 ${regular
  .filter((b) => b.rate > 0)
  .map((b) => pct(b.rate))
  .filter((v, i, a) => a.indexOf(v) === i)
  .join("·")} (1년 미만 0%)`;
const addonText = `근무연수에 따라 월 ${won(addon[0].amount)}~${won(addon[addon.length - 1].amount)}`;

function Table({ head, rows }: { head: [string, string, string?]; rows: Row[] }) {
  const hasNote = head[2] !== undefined;
  return (
    <div className="overflow-x-auto rounded-xl border border-[rgba(46,68,148,0.14)]">
      <table className="w-full min-w-[520px] text-sm">
        <thead className="bg-[#F5F6FA] text-xs text-[#7A8296]">
          <tr>
            <th className="px-4 py-2 text-left font-medium">{head[0]}</th>
            <th className="px-4 py-2 text-left font-medium">{head[1]}</th>
            {hasNote && <th className="px-4 py-2 text-left font-medium">{head[2]}</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-[rgba(46,68,148,0.08)] bg-white text-[#1B2A4A]">
          {rows.map((r) => (
            <tr key={r[0]}>
              <td className="px-4 py-2 font-medium">{r[0]}</td>
              <td className="px-4 py-2 tabular-nums">{r[1]}</td>
              {hasNote && <td className="px-4 py-2 text-[#7A8296]">{r[2] ?? ""}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── 직군별 예시값 (계산기 데이터에서 직접 계산) ──
export const EXAMPLES = {
  civil9_1: payOf(civil.rows, 1, 0) + rates.meal + pb["9급"],
  civil7_10: payOf(civil.rows, 10, 2) + rates.meal + pb["7급"],
  civil9_10: payOf(civil.rows, 10, 0),
  police1_10: payOf(police.rows, 10, 0),
  police1_1: payOf(police.rows, 1, 0),
  teacher9: payOf(teacher.rows, 9, 0),
  teacher9Total: payOf(teacher.rows, 9, 0) + TEACHER_ALLOWANCE + HOMEROOM_ALLOWANCE + rates.meal,
  hasa1: military.officerTables[0].rows[0].pay[0] as number,
  sowi1: military.officerTables[1].rows[0].pay[0] as number,
};

export default function PayStructure({ variant }: { variant: "civil" | "teacher" | "military" }) {
  const deductions: Row[] =
    variant === "military"
      ? [
          ["군인연금 기여금", pct(mil.pension.rate), "공무원연금(9%)보다 낮음"],
          ["건강보험", pct(mil.health.rate), "본인 부담분"],
          ["장기요양보험", `건강보험료의 ${pct(mil.longTermCare.rateOfHealth)}`],
          ["소득세", "근로소득 간이세액표", "부양가족 수에 따라 달라짐"],
          ["지방소득세", `소득세의 ${pct(mil.localTaxRateOfIncomeTax)}`],
        ]
      : [
          ["공무원연금 기여금", pct(rates.civilPensionRate), "국민연금 대신 가입"],
          ["건강보험", pct(rates.healthRate), "본인 부담분"],
          ["장기요양보험", `건강보험료의 ${pct(rates.longTermCareRateOfHealth)}`],
          ["고용보험", "해당 없음", "공무원은 고용보험 미가입"],
          ["소득세", "근로소득 간이세액표", "부양가족 수에 따라 달라짐"],
          ["지방소득세", `소득세의 ${pct(rates.localTaxRateOfIncomeTax)}`],
        ];

  const monthly: Row[] =
    variant === "civil"
      ? [
          ["정액급식비", won(rates.meal), "전 직급 공통"],
          ["직급보조비", `9·8급 ${won(pb["9급"])} / 7급 ${won(pb["7급"])} / 6급 ${won(pb["6급"])} / 3~5급 ${won(pb["5급"])}`, "경찰·소방도 대응 계급별 동일"],
          ["가족수당", `배우자 ${won(fam.spouse)} / 첫째 ${won(fam.child1)} / 둘째 ${won(fam.child2)} / 셋째 이상 ${won(fam.child3plus)}`, "해당자만"],
          ["정근수당 가산금", addonText, "5년 이상 근무 시 단계적 증가"],
          ["위험근무수당", won(rates.dangerAllowance.police), "경찰·소방만 (2026년 7만→8만 원)"],
        ]
      : variant === "teacher"
        ? [
            ["교직수당", won(TEACHER_ALLOWANCE), "전 교원 공통 (직급보조비 대신)"],
            ["담임수당", won(HOMEROOM_ALLOWANCE), "담임을 맡은 경우"],
            ["보직교사수당", won(DEPT_HEAD_ALLOWANCE), "부장교사 등 보직을 맡은 경우"],
            ["정액급식비", won(rates.meal), "전 교원 공통"],
            ["가족수당", `배우자 ${won(fam.spouse)} / 첫째 ${won(fam.child1)} / 둘째 ${won(fam.child2)} / 셋째 이상 ${won(fam.child3plus)}`, "해당자만"],
            ["정근수당 가산금", addonText, "5년 이상 근무 시 단계적 증가"],
          ]
        : mil.allowances
            .filter((a) => a.id !== "overtimeHours")
            .map((a): Row => [a.label.replace(" 수", "").replace("자녀", "자녀 가족수당"), "amount" in a && a.amount ? won(a.amount) : `1인당 평균 약 ${won((a as { perUnit: number }).perUnit)}`, a.hint]);

  const yearly: Row[] = [
    ["정근수당", regularText, "연 2회 지급"],
    ["명절휴가비", `월봉급액의 ${pct(rates.holidayBonusRate)}`, "설·추석 연 2회"],
  ];

  const title =
    variant === "civil" ? "공무원·경찰·소방 월급은 이렇게 구성됩니다" : variant === "teacher" ? "교사 월급은 이렇게 구성됩니다" : "군인 간부 월급은 이렇게 구성됩니다";

  return (
    <section className="space-y-4 text-sm leading-relaxed text-[#5B6478]">
      <h2 className="text-xl font-bold text-[#1B2A4A]">{title}</h2>
      <p>
        세전 월급은 봉급표의 기본급(봉급)에 매달 고정으로 붙는 수당을 더한 금액이고, 여기서 연금 기여금·건강보험·세금을
        빼면 실수령액이 됩니다. 아래 금액은 이 페이지 계산기에 쓰이는 2026년 기준값입니다.
      </p>

      <h3 className="text-base font-bold text-[#1B2A4A]">매달 붙는 수당</h3>
      <Table head={["항목", "금액(월)", "비고"]} rows={monthly} />

      {variant !== "military" && (
        <>
          <h3 className="text-base font-bold text-[#1B2A4A]">연 2회 나오는 수당</h3>
          <Table head={["항목", "금액", "비고"]} rows={yearly} />
        </>
      )}

      <h3 className="text-base font-bold text-[#1B2A4A]">빠지는 항목(공제)</h3>
      <Table head={["항목", "요율", "비고"]} rows={deductions} />

      <h3 className="text-base font-bold text-[#1B2A4A]">계산 예시</h3>
      {variant === "civil" && (
        <p>
          9급 1호봉은 봉급 {won(payOf(civil.rows, 1, 0))} + 정액급식비 {won(rates.meal)} + 직급보조비 {won(pb["9급"])} ={" "}
          <b className="text-[#1B2A4A]">{won(EXAMPLES.civil9_1)}</b>이 매달 고정 세전 금액입니다. 7급 10호봉은 봉급{" "}
          {won(payOf(civil.rows, 10, 2))} + {won(rates.meal)} + {won(pb["7급"])} = <b className="text-[#1B2A4A]">{won(EXAMPLES.civil7_10)}</b>
          입니다. 가족수당·시간외수당·정근수당은 개인별로 더해집니다.
        </p>
      )}
      {variant === "teacher" && (
        <p>
          사범대 졸업 초임(9호봉) 담임교사는 봉급 {won(EXAMPLES.teacher9)} + 교직수당 {won(TEACHER_ALLOWANCE)} + 담임수당{" "}
          {won(HOMEROOM_ALLOWANCE)} + 정액급식비 {won(rates.meal)} = <b className="text-[#1B2A4A]">{won(EXAMPLES.teacher9Total)}</b>이
          매달 고정 세전 금액입니다. 담임을 맡지 않으면 담임수당 {won(HOMEROOM_ALLOWANCE)}이 빠집니다.
        </p>
      )}
      {variant === "military" && (
        <p>
          하사 1호봉 기본급은 {won(EXAMPLES.hasa1)}, 소위 1호봉은 {won(EXAMPLES.sowi1)}입니다(공무원보수규정 별표13). 여기에
          배우자·자녀가 있으면 가족수당, 하사~중령은 주택수당이 더해지고, 군인연금 기여금 {pct(mil.pension.rate)}와 건강보험·세금이
          빠집니다.
        </p>
      )}
    </section>
  );
}
