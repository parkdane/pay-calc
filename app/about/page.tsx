import type { Metadata } from "next";
import Link from "next/link";
import { CALC_GROUPS } from "@/data/calcList";
import { GUIDES } from "@/data/guides";
import { UPDATES } from "@/data/updates";

export const metadata: Metadata = {
  title: "사이트 소개",
  description: "봉급계산소는 공무원·군인·직장인 실수령액과 청년 정책 적금을 무료로 계산해주는 사이트입니다.",
  openGraph: {
    title: "사이트 소개",
    description: "봉급계산소는 공무원·군인·직장인 실수령액과 청년 정책 적금을 무료로 계산해주는 사이트입니다.",
  },
};

const CALC_COUNT = CALC_GROUPS.reduce((n, g) => n + g.items.length, 0);
const LAST_UPDATE = UPDATES.reduce((a, u) => (u.date > a ? u.date : a), UPDATES[0].date);
const linkCls = "text-[#2E4494] underline underline-offset-2";

export default function AboutPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-[#1B2A4A] sm:text-3xl">사이트 소개</h1>
        <p className="text-sm text-[#5B6478]">봉급계산소(moneywatch.kr)가 어떤 사이트인지 소개합니다.</p>
      </header>

      <section className="space-y-3 text-sm leading-relaxed text-[#5B6478]">
        <h2 className="text-lg font-bold text-[#1B2A4A]">무엇을 하는 사이트인가요?</h2>
        <p>
          봉급계산소는 공무원·군인·직장인의 세후 실수령액과 청년 정책 적금(청년미래적금, 청년도약계좌,
          청년내일저축계좌, 장병내일준비적금)의 만기 수령액을 계산해주는 무료 계산기 모음입니다. 매년 바뀌는
          봉급표·세율·정책금리를 직접 찾아보는 번거로움을 줄이고, 숫자만 입력하면 바로 결과를 확인할 수 있도록
          만들었습니다.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <Link href="/salary" className={linkCls}>
              봉급표
            </Link>{" "}
            5종: 일반직·경찰·소방·교원·군인, 호봉별 금액과 전년 대비 인상률
          </li>
          <li>
            <Link href="/calc" className={linkCls}>
              계산기
            </Link>{" "}
            {CALC_COUNT}개: 실수령액, 공무원연금·국민연금, 정년·퇴직수당, 실업급여·육아휴직, 정책 적금 등
          </li>
          <li>
            <Link href="/guide" className={linkCls}>
              가이드
            </Link>{" "}
            {GUIDES.length}편: 계산 방식과 제도 설명, 숫자로 보는 계산 예시
          </li>
        </ul>
      </section>

      <section className="space-y-3 text-sm leading-relaxed text-[#5B6478]">
        <h2 className="text-lg font-bold text-[#1B2A4A]">데이터는 어디서 가져오나요?</h2>
        <p>계산에 사용하는 기준 데이터는 다음 법령과 공공기관의 공개 자료를 기준으로 합니다.</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>봉급표: 공무원보수규정 별표(국가법령정보센터 개정 이력), 인사혁신처·국방부 공고</li>
          <li>수당: 공무원수당 등에 관한 규정</li>
          <li>공무원연금·퇴직수당: 공무원연금법·군인연금법과 각 시행령</li>
          <li>소득세: 국세청 근로소득 간이세액표</li>
          <li>국민연금·건강보험 요율: 국민연금법, 국민연금공단·국민건강보험공단 고시</li>
          <li>실업급여·육아휴직·출산휴가: 고용보험법, 근로기준법</li>
          <li>예·적금 금리: 금융감독원 금융상품통합비교공시 오픈API(매일 갱신)</li>
          <li>기업 평균연봉: 금융감독원 전자공시시스템(DART) 사업보고서(매일 갱신)</li>
          <li>연봉 백분위: 국세청 근로소득 백분위 자료(공공데이터포털)</li>
        </ul>
        <p>
          각 계산기 하단에는 참고한 데이터의 기준 연도와 출처, 최종 업데이트일을 함께 표기하고 있습니다. 다만 이
          사이트의 모든 계산 결과는 참고용 추정치이며 법적 효력이 없습니다. 실제 지급액·수령액은 소속 기관이나
          금융회사의 공식 안내를 따라야 합니다.
        </p>
      </section>

      <section className="space-y-3 text-sm leading-relaxed text-[#5B6478]">
        <h2 className="text-lg font-bold text-[#1B2A4A]">정확성을 위해 하는 일</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            봉급·요율·지급률은 법령과 고시 원문을 기준으로 입력하고, 가능하면 두 곳 이상의 출처로 교차 확인합니다.
          </li>
          <li>
            정부가 공개한 계산 예시가 있으면 계산기로 같은 조건을 넣어 결과가 일치하는지 확인합니다(예: 청년도약계좌
            금융위원회 예시).
          </li>
          <li>
            가이드와 계산기 본문의 숫자는 직접 적어 넣지 않고 계산 함수와 데이터에서 생성해, 기준값이 바뀌면 함께
            바뀌도록 만들었습니다.
          </li>
          <li>
            확인하지 못한 내용은 쓰지 않고, 근사나 가정이 들어간 부분은 각 계산기에 따로 표시합니다.
          </li>
          <li>
            오류를 발견해 고친 내용은 숨기지 않고{" "}
            <Link href="/updates" className={linkCls}>
              업데이트 내역
            </Link>
            에 날짜와 함께 공개합니다(최근 갱신 {LAST_UPDATE}).
          </li>
        </ul>
      </section>

      <section className="space-y-3 text-sm leading-relaxed text-[#5B6478]">
        <h2 className="text-lg font-bold text-[#1B2A4A]">운영자 정보</h2>
        <p>
          봉급계산소는 개인이 운영하는 사이트입니다. 계산 오류나 데이터 업데이트가 필요한 부분을 발견하시면{" "}
          <Link href="/contact" className={linkCls}>
            문의하기
          </Link>{" "}
          페이지를 통해 알려주시기 바랍니다.
        </p>
      </section>
    </div>
  );
}
