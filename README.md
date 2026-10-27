# 봉급계산소 (moneywatch.kr)

**사이트: [https://moneywatch.kr](https://moneywatch.kr)**

공무원·교사·군인·경찰·소방 봉급표와 실수령액, 연금·퇴직수당·정년, 직장인 4대보험·실업급여·육아휴직급여 계산기를 제공하는 사이트의 소스 저장소입니다.

- 봉급표와 계산 산식은 법령·고시 원문을 기준으로 작성하고, 각 계산기 하단에 근거 자료와 최종 업데이트일을 표기합니다.
- 데이터 정정·기능 변경 내역은 [업데이트 내역](https://moneywatch.kr/updates)에 공개합니다.
- 예적금 금리와 대기업 평균연봉은 공식 API에서 매일 자동 갱신합니다([금리 비교](https://moneywatch.kr/rates)).

## 봉급표 (2026년, 공무원보수규정 원문 기준)

- [일반직 공무원 봉급표](https://moneywatch.kr/salary/civil) — 9급~1급 호봉별 2026년 봉급표
- [군인 봉급표](https://moneywatch.kr/salary/military) — 병사 월급 · 부사관·장교 호봉표
- [경찰 봉급표](https://moneywatch.kr/salary/police) — 순경부터 경감까지
- [소방 봉급표](https://moneywatch.kr/salary/fire) — 소방사부터 소방경까지
- [교사 봉급표](https://moneywatch.kr/salary/teacher) — 유·초·중·고 교원 호봉표

## 공무원·교원·군인

- [공무원·경찰·소방 실수령액](https://moneywatch.kr/calc/civil-net) — 직급·호봉 + 가족·근속·시간외 반영
- [교사 실수령액](https://moneywatch.kr/calc/teacher-net) — 교원 호봉 + 교직수당·담임수당 반영
- [군인 간부 실수령액](https://moneywatch.kr/calc/military-net) — 부사관·장교 계급·호봉 + 수당 선택
- [시간외수당 계산기](https://moneywatch.kr/calc/overtime-pay) — 직급·계급별 초과근무 시간당 단가
- [퇴직수당 계산기](https://moneywatch.kr/calc/severance-pay) — 재직기간별 지급율(6.5~39%) 반영
- [공무원연금 예상수령액 계산기](https://moneywatch.kr/calc/pension-net) — 실제 봉급표(1997~2026) 기반, 직군별 산식 반영
- [정년퇴직일 계산기](https://moneywatch.kr/calc/retirement-age) — 교원(62세)·대학교원(65세)·일반직 공무원(60세) 반영

## 직장인·4대보험·고용보험

- [직장인 연봉 실수령액](https://moneywatch.kr/calc/worker-net) — 연봉별 비교 그래프 포함
- [퇴직금 계산기](https://moneywatch.kr/calc/retirement-pay) — 일반 근로자 대상, 평균임금 기준
- [실업급여 계산기](https://moneywatch.kr/calc/unemployment-benefit) — 소정급여일수·상하한액 반영
- [육아휴직급여 계산기](https://moneywatch.kr/calc/parental-leave) — 월별 상한액 + 6+6 부모육아휴직제 특례 반영
- [출산전후휴가급여 계산기](https://moneywatch.kr/calc/maternity-leave) — 기업규모별 지급구조, 다태아 특례 반영
- [국민연금 예상수령액 계산기](https://moneywatch.kr/calc/national-pension) — 직장인·자영업자 대상, 조기·연기수급 반영
- [국민연금 지역가입자 보험료 계산기](https://moneywatch.kr/calc/national-pension-premium) — 자영업자·프리랜서 대상, 2026년 요율 9.5% 반영
- [내 연봉 상위 몇 %?](https://moneywatch.kr/calc/income-rank) — 국세청 통계 기준 순위
- [대기업 평균연봉 비교](https://moneywatch.kr/calc/salary-compare) — 금감원 DART 공시 기준 실제 데이터
- [가구소득 계산기](https://moneywatch.kr/calc/household-income) — 맞벌이 합산소득, 평균·중위소득 대비 위치

## 저축·재테크

- [적금·예금 이자 계산기](https://moneywatch.kr/calc/deposit) — 세후 만기 수령액
- [저축 목표 시뮬레이터](https://moneywatch.kr/calc/savings-goal) — 1억까지 걸리는 기간
- [청년 정책 적금 비교](https://moneywatch.kr/calc/youth-compare) — 4개 상품 + 일반적금 한눈에 비교
- [청년미래적금](https://moneywatch.kr/calc/youth-save) — 정부기여금 포함 3년 만기액
- [청년내일저축계좌](https://moneywatch.kr/calc/naeil-save) — 정부지원 월 30만 포함
- [청년도약계좌](https://moneywatch.kr/calc/leap-save) — 기존 가입자 만기 계산
- [장병내일준비적금](https://moneywatch.kr/calc/soldier-save) — 정부 매칭 포함 전역 수령액
- [파이어족 계산기](https://moneywatch.kr/calc/fire) — 조기 은퇴 가능 나이, 몬테카를로 성공확률
- [손익분기·투자금 회수 계산기](https://moneywatch.kr/calc/business-breakeven) — 매출·비용으로 사업성 진단

## 가이드

계산기별 산식과 계산 예시를 설명하는 글은 [가이드 모음](https://moneywatch.kr/guide)에 있습니다.

## 주요 근거 자료

- 공무원보수규정 별표3·10·11·13 (일반직·경찰·소방·교원·군인 봉급표)
- 공무원연금법·같은 법 시행령 (연금 개시연령, 퇴직수당 지급률)
- 국민연금법 제51조·제63조·제88조
- 고용보험법 (실업급여 소정급여일수, 육아휴직·출산전후휴가급여)
- 근로기준법 (평균임금, 출산전후휴가)
- 국세청 근로소득 간이세액표
- 금융감독원 금융상품통합비교공시·전자공시(OpenDART)

계산 결과는 참고용이며, 오류 제보는 [문의 페이지](https://moneywatch.kr/contact)로 받습니다.

## 기술 구성

- Next.js (static export), TypeScript, Tailwind CSS
- Cloudflare Pages 배포, Cloudflare Workers로 금리·연봉 데이터 일일 갱신
