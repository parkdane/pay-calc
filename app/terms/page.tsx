import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "이용약관",
  description: "봉급계산소 서비스 이용조건, 계산 결과의 법적 효력, 면책조항에 대한 안내입니다.",
  openGraph: {
    title: "이용약관",
    description: "봉급계산소 서비스 이용조건, 계산 결과의 법적 효력, 면책조항에 대한 안내입니다.",
  },
};

const EFFECTIVE_DATE = "2026-08-20";

export default function TermsPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-[#1B2A4A] sm:text-3xl">이용약관</h1>
        <p className="text-sm text-[#5B6478]">시행일자: {EFFECTIVE_DATE}</p>
      </header>

      <section className="space-y-3 text-sm leading-relaxed text-[#5B6478]">
        <h2 className="text-lg font-bold text-[#1B2A4A]">1. 목적</h2>
        <p>
          이 약관은 봉급계산소(moneywatch.kr, 이하 &quot;사이트&quot;)가 제공하는 봉급표 조회, 실수령액·연금·저축
          계산기 등 모든 서비스(이하 &quot;서비스&quot;)의 이용조건과 절차, 이용자와 사이트 운영자의 권리·의무
          및 책임사항을 정하는 것을 목적으로 합니다.
        </p>
      </section>

      <section className="space-y-3 text-sm leading-relaxed text-[#5B6478]">
        <h2 className="text-lg font-bold text-[#1B2A4A]">2. 서비스의 내용</h2>
        <p>
          사이트는 공무원·군인·경찰·소방·교사 봉급표, 4대보험·소득세를 반영한 실수령액 계산기, 공무원연금
          예상수령액 계산기, 청년 정책 적금 계산기 등을 무료로 제공합니다. 별도의 회원가입이나 로그인 없이
          누구나 이용할 수 있습니다.
        </p>
      </section>

      <section className="space-y-3 text-sm leading-relaxed text-[#5B6478]">
        <h2 className="text-lg font-bold text-[#1B2A4A]">3. 계산 결과의 성격과 법적 효력</h2>
        <p>
          사이트가 제공하는 모든 계산 결과(봉급표, 실수령액, 연금 예상수령액, 적금 만기액 등)는{" "}
          <strong className="text-[#1B2A4A]">참고용 추정치</strong>이며, 법적 효력이나 확정적 구속력을 갖지
          않습니다. 계산 로직은 인사혁신처, 국세청, 국민연금공단, 금융감독원 등 공개된 자료를 기준으로
          작성했으나, 개인별 실제 상황(경력 인정, 감면·공제 항목, 최신 법령 개정 등)에 따라 실제 금액과 차이가
          발생할 수 있습니다.
        </p>
        <p>
          공무원연금 예상수령액 계산기와 같이 다년간의 추정을 포함하는 계산기는 특히 근사치 비중이 커서,
          실제 수령액과 상당한 차이가 있을 수 있습니다. 각 계산기 하단에는 해당 계산기에서 사용한 근사·가정
          사항을 별도로 안내하고 있으니 반드시 함께 확인하시기 바랍니다.
        </p>
        <p>
          정확한 금액이 필요한 의사결정(이직, 퇴직, 대출, 세금 신고 등)에는 반드시 소속 기관의 인사·급여
          부서, 국민연금공단·공무원연금공단, 세무사·회계사 등 공식 기관 또는 전문가의 안내를 따라야 합니다.
        </p>
      </section>

      <section className="space-y-3 text-sm leading-relaxed text-[#5B6478]">
        <h2 className="text-lg font-bold text-[#1B2A4A]">4. 면책조항</h2>
        <p>
          사이트 운영자는 계산 결과의 오류, 데이터 갱신 지연, 서비스 일시 중단 등으로 인해 이용자에게 발생한
          손해에 대해 고의 또는 중과실이 없는 한 책임을 지지 않습니다. 사이트는 데이터 정확성을 위해 노력하고
          있으나, 모든 정보의 완전성·최신성을 보장하지는 않습니다.
        </p>
        <p>
          사이트는 천재지변, 시스템 장애, 호스팅사(Cloudflare) 또는 외부 데이터 제공처(공공데이터포털, 국가법령
          정보 공동활용 API 등)의 사정으로 인한 서비스 중단에 대해 책임을 지지 않습니다.
        </p>
      </section>

      <section className="space-y-3 text-sm leading-relaxed text-[#5B6478]">
        <h2 className="text-lg font-bold text-[#1B2A4A]">5. 저작권</h2>
        <p>
          사이트에 게재된 가이드 아티클, 계산기 UI, 디자인 등 콘텐츠의 저작권은 사이트 운영자에게 있습니다.
          사전 동의 없이 콘텐츠를 복제·배포·상업적으로 이용하는 것을 금지합니다. 다만 계산기 결과를 캡처하거나
          공유 기능을 통해 개인적으로 공유하는 것은 허용됩니다.
        </p>
        <p>
          봉급표·소득세율 등 계산의 기초가 되는 공공 데이터 자체의 저작권은 각 공공기관(인사혁신처, 국세청 등)에
          있으며, 공공데이터 개방 정책에 따라 활용하고 있습니다.
        </p>
      </section>

      <section className="space-y-3 text-sm leading-relaxed text-[#5B6478]">
        <h2 className="text-lg font-bold text-[#1B2A4A]">6. 광고 게재</h2>
        <p>
          사이트는 카카오 애드핏, 구글 애드센스 등 광고 서비스를 통해 운영 비용을 충당합니다. 광고 게재와 쿠키
          이용에 관한 자세한 내용은{" "}
          <Link href="/privacy" className="text-[#2E4494] underline underline-offset-2">
            개인정보처리방침
          </Link>
          을 참고하시기 바랍니다.
        </p>
      </section>

      <section className="space-y-3 text-sm leading-relaxed text-[#5B6478]">
        <h2 className="text-lg font-bold text-[#1B2A4A]">7. 금지행위</h2>
        <p>이용자는 다음 행위를 해서는 안 됩니다.</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>사이트의 정상적인 운영을 방해하는 자동화된 대량 요청(크롤링, 스크래핑 등)</li>
          <li>사이트 콘텐츠를 무단으로 복제하여 상업적으로 재배포하는 행위</li>
          <li>사이트의 취약점을 이용하거나 시스템에 부당하게 접근하려는 행위</li>
        </ul>
      </section>

      <section className="space-y-3 text-sm leading-relaxed text-[#5B6478]">
        <h2 className="text-lg font-bold text-[#1B2A4A]">8. 약관의 변경</h2>
        <p>
          이 약관은 관련 법령 또는 서비스 내용 변경에 따라 개정될 수 있으며, 개정 시 이 페이지를 통해
          공지합니다. 개정된 약관은 공지 시점부터 효력이 발생합니다.
        </p>
      </section>

      <section className="space-y-3 text-sm leading-relaxed text-[#5B6478]">
        <h2 className="text-lg font-bold text-[#1B2A4A]">9. 문의처</h2>
        <p>
          이용약관 관련 문의는{" "}
          <Link href="/contact" className="text-[#2E4494] underline underline-offset-2">
            문의하기
          </Link>{" "}
          페이지를 이용해주세요.
        </p>
      </section>
    </div>
  );
}
