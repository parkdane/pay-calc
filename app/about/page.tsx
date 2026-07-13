import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "사이트 소개",
  description: "봉급계산소는 공무원·군인·직장인 실수령액과 청년 정책 적금을 무료로 계산해주는 사이트입니다.",
};

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
      </section>

      <section className="space-y-3 text-sm leading-relaxed text-[#5B6478]">
        <h2 className="text-lg font-bold text-[#1B2A4A]">데이터는 어디서 가져오나요?</h2>
        <p>계산에 사용하는 기준 데이터는 다음 공공기관의 공개 자료를 기준으로 합니다.</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>봉급표: 인사혁신처, 국방부 공무원보수 관련 공고</li>
          <li>소득세: 국세청 근로소득 간이세액표</li>
          <li>국민연금·건강보험 요율: 국민연금공단, 국민건강보험공단 고시</li>
          <li>예·적금 금리: 금융감독원 금융상품통합비교공시(금융상품 한눈에) 오픈API</li>
          <li>기업 평균연봉: 금융감독원 전자공시시스템(DART) 사업보고서</li>
          <li>연봉 백분위: 국세청 국세통계연보</li>
        </ul>
        <p>
          각 계산기 하단에는 참고한 데이터의 기준 연도와 출처를 함께 표기하고 있습니다. 다만 이 사이트의 모든
          계산 결과는 참고용 추정치이며 법적 효력이 없습니다. 실제 지급액·수령액은 소속 기관이나 금융회사의
          공식 안내를 따라야 합니다.
        </p>
      </section>

      <section className="space-y-3 text-sm leading-relaxed text-[#5B6478]">
        <h2 className="text-lg font-bold text-[#1B2A4A]">운영자 정보</h2>
        <p>
          봉급계산소는 개인이 운영하는 사이트입니다. 계산 오류나 데이터 업데이트가 필요한 부분을 발견하시면{" "}
          <a href="/contact" className="text-[#2E4494] underline underline-offset-2">
            문의하기
          </a>{" "}
          페이지를 통해 알려주시기 바랍니다.
        </p>
      </section>
    </div>
  );
}
