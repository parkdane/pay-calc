// 정년퇴직일 계산 로직
// 근거: 국가공무원법 제74조(일반직 공무원 정년 60세, 1~6월 도달 시 6/30, 7~12월 도달 시 12/31)
//       교육공무원법 제47조(교원 정년 - 초중고 62세, 대학 65세, 3~8월 도달 시 8/31, 9월~익년2월 도달 시 익년 2월 말일)
// "정년에 이른 날"은 만 나이로 정년연령에 도달하는 생일 당일을 말함(대법원 1973.6.12. 선고 71다2669 판결)

export type JobCategory = "teacher-school" | "teacher-university" | "general-civil";

const RETIREMENT_AGE: Record<JobCategory, number> = {
  "teacher-school": 62, // 초·중·고 교원
  "teacher-university": 65, // 대학교원(고등교육법 제14조)
  "general-civil": 60, // 일반직 공무원
};

function lastDayOfMonth(year: number, month: number): number {
  // month: 1-indexed. new Date(year, month, 0)의 month는 "다음 달 0일" = 해당 달 말일
  return new Date(year, month, 0).getDate();
}

export function calcRetirementDate(
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  category: JobCategory,
): { retirementAge: number; reachDate: Date; retirementDate: Date } {
  const retirementAge = RETIREMENT_AGE[category];
  const reachYear = birthYear + retirementAge;
  const reachDate = new Date(reachYear, birthMonth - 1, birthDay);

  let retirementDate: Date;

  if (category === "general-civil") {
    // 1~6월 도달 → 그 해 6/30, 7~12월 도달 → 그 해 12/31
    retirementDate =
      birthMonth <= 6 ? new Date(reachYear, 5, 30) : new Date(reachYear, 11, 31);
  } else {
    // 교원: 3~8월 도달 → 그 해 8/31, 9~12월 도달 → 다음 해 2월 말일, 1~2월 도달 → 그 해 2월 말일
    if (birthMonth >= 3 && birthMonth <= 8) {
      retirementDate = new Date(reachYear, 7, 31);
    } else if (birthMonth >= 9) {
      const y = reachYear + 1;
      retirementDate = new Date(y, 1, lastDayOfMonth(y, 2));
    } else {
      retirementDate = new Date(reachYear, 1, lastDayOfMonth(reachYear, 2));
    }
  }

  return { retirementAge, reachDate, retirementDate };
}

export function formatYearsMonthsDays(from: Date, to: Date): string {
  if (to <= from) return "0일";
  let years = to.getFullYear() - from.getFullYear();
  let months = to.getMonth() - from.getMonth();
  let days = to.getDate() - from.getDate();
  if (days < 0) {
    months -= 1;
    const prevMonthLastDay = new Date(to.getFullYear(), to.getMonth(), 0).getDate();
    days += prevMonthLastDay;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  const parts: string[] = [];
  if (years > 0) parts.push(`${years}년`);
  if (months > 0) parts.push(`${months}개월`);
  if (years === 0) parts.push(`${days}일`);
  return parts.join(" ") || "0일";
}
