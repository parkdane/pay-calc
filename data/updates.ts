// 사용자에게 보여주는 업데이트 내역. 실제 배포(커밋) 이력에 있는 변경만 기록한다.
// 매일 자동 갱신되는 예적금 금리·대기업 연봉 데이터는 기록하지 않는다.
export type UpdateItem = { text: string; href?: string };
export type UpdateEntry = { date: string; items: UpdateItem[] };

export const UPDATES: UpdateEntry[] = [
  {
    date: "2026-10-21",
    items: [
      { text: "봉급표 5개 페이지에 2025년 대비 호봉별 인상액·인상률표와 호봉 1개당 평균 승급액표 추가", href: "/salary/military" },
      { text: "봉급표 모음에 같은 호봉 기준 직군별(일반직·경찰·소방·군인·교원) 기본급 비교표 추가", href: "/salary" },
      { text: "가이드 18개 제목을 핵심 수치 중심으로 정비, 교원·군인·국민연금 가이드에 계산 예시 섹션 추가", href: "/guide" },
    ],
  },
  {
    date: "2026-10-16",
    items: [
      { text: "국민연금 예상수령액 계산기에 가입 10~20년 미만 지급률(기본연금액의 50%+1년마다 5%, 국민연금법 제63조) 반영. 기존에는 20년 기준으로 계산되어 10~19년 가입 시 연금이 높게 표시됨", href: "/calc/national-pension" },
      { text: "국민연금 예상수령액 계산기에 가입기간·평균소득별 예시표와 조기·연기수령 비교표 추가", href: "/calc/national-pension" },
      { text: "실업급여 계산기에 월급별 1일 구직급여액·총수급액 예시표 추가(상·하한액 적용 구간 설명)", href: "/calc/unemployment-benefit" },
      { text: "퇴직금 계산기에 월급·근속연수별 퇴직금 예시표 추가", href: "/calc/retirement-pay" },
      { text: "업데이트 내역 페이지 신설", href: "/updates" },
    ],
  },
  {
    date: "2026-10-15",
    items: [
      { text: "봉급표 5개 페이지 검색 설명에 직군별 실제 봉급액 표기", href: "/salary" },
      { text: "지역가입자 국민연금 보험료 계산기 명칭 정비(자영업자·프리랜서 대상 명시)", href: "/calc/national-pension-premium" },
    ],
  },
  {
    date: "2026-10-14",
    items: [
      { text: "경찰·소방 봉급표 2~31호봉 금액을 공무원보수규정 별표10 원문 값으로 정정(기존 추정치 교체)", href: "/salary/police" },
      { text: "공무원연금 개시연령을 임용 시기·퇴직연도 기준으로 적용(기존 65세 일괄 계산 개선)", href: "/calc/pension-net" },
      { text: "정년퇴직일 계산기에 퇴직수당·월 연금 예상 기능 추가", href: "/calc/retirement-age" },
      { text: "시간외수당 계산기에 경찰·소방 계급별, 일반직 급수별 시간당 단가표 추가", href: "/calc/overtime-pay" },
      { text: "공무원·교원·군인 실수령액 계산기에 수당·공제 구성표와 계산 예시 추가", href: "/calc/civil-net" },
      { text: "퇴직수당 계산기에 지급률 구간표·예시표, 공무원연금 계산기에 개시연령·조기수령 감액표 추가", href: "/calc/severance-pay" },
      { text: "모든 계산기에 근거 자료와 최종 업데이트일 표기" },
    ],
  },
  { date: "2026-10-13", items: [{ text: "교원 봉급표 1~40호봉 전체 반영(일부 호봉 선택 불가 문제 수정)", href: "/salary/teacher" }] },
  { date: "2026-09-21", items: [{ text: "교사·공무원 정년퇴직일 계산기 추가", href: "/calc/retirement-age" }] },
  { date: "2026-08-28", items: [{ text: "출산전후휴가급여 계산기 추가", href: "/calc/maternity-leave" }] },
  {
    date: "2026-08-26",
    items: [
      { text: "실업급여(구직급여) 계산기 추가", href: "/calc/unemployment-benefit" },
      { text: "일반 근로자 퇴직금 계산기 추가", href: "/calc/retirement-pay" },
      { text: "국민연금 지역가입자 보험료 계산기 추가", href: "/calc/national-pension-premium" },
      { text: "육아휴직급여 계산기 추가(6+6 부모육아휴직제·한부모 특례 반영)", href: "/calc/parental-leave" },
      { text: "국민연금 본인부담 요율을 2026년 기준 4.75%로 정정", href: "/calc/worker-net" },
    ],
  },
  { date: "2026-08-24", items: [{ text: "국민연금 예상수령액 계산기 추가", href: "/calc/national-pension" }] },
  {
    date: "2026-08-20",
    items: [
      { text: "시간외수당·퇴직수당 계산기 추가", href: "/calc/overtime-pay" },
      { text: "가이드 19개 내용 보강" , href: "/guide" },
    ],
  },
  { date: "2026-08-18", items: [{ text: "가이드 9개 추가", href: "/guide" }] },
  { date: "2026-08-13", items: [{ text: "군인연금 산식을 공무원연금과 분리하고 계산 오류 수정", href: "/calc/pension-net" }] },
  { date: "2026-08-12", items: [{ text: "공무원연금 예상수령액 계산기 추가(1997~2026 봉급표 기반)", href: "/calc/pension-net" }] },
  { date: "2026-08-06", items: [{ text: "교사 실수령액 계산기 추가", href: "/calc/teacher-net" }] },
];
