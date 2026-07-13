import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: "봉급계산소의 개인정보 수집·이용, 쿠키, 광고 서비스에 대한 안내입니다.",
};

const EFFECTIVE_DATE = "2026-07-20";

export default function PrivacyPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-[#1B2A4A] sm:text-3xl">개인정보처리방침</h1>
        <p className="text-sm text-[#5B6478]">시행일자: {EFFECTIVE_DATE}</p>
      </header>

      <section className="space-y-3 text-sm leading-relaxed text-[#5B6478]">
        <h2 className="text-lg font-bold text-[#1B2A4A]">1. 계산기 입력값 처리</h2>
        <p>
          이 사이트의 모든 계산기(실수령액·적금·연봉비교 등)는 사용자가 입력한 연봉, 호봉, 저축액 등의 값을{" "}
          <strong className="text-[#1B2A4A]">사용자의 브라우저 안에서만 계산</strong>합니다. 입력값은 서버로
          전송되거나 저장되지 않으며, 페이지를 벗어나거나 새로고침하면 사라집니다. 일부 계산기의 "링크 복사"
          기능은 입력값을 URL 주소 안에 담아 공유할 수 있게 해주는 기능으로, 이 역시 서버에 저장되지 않고
          URL 자체에만 포함됩니다.
        </p>
      </section>

      <section className="space-y-3 text-sm leading-relaxed text-[#5B6478]">
        <h2 className="text-lg font-bold text-[#1B2A4A]">2. 자동 수집되는 정보</h2>
        <p>
          사이트 운영(Cloudflare)과 광고 서비스 이용 과정에서 아래 정보가 자동으로 수집될 수 있습니다.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>접속 IP, 접속 기기·브라우저 정보, 방문 일시, 방문 페이지 (호스팅사 표준 로그)</li>
          <li>광고 게재 및 맞춤 광고를 위한 쿠키·광고 식별자 (아래 4번 항목 참고)</li>
        </ul>
      </section>

      <section className="space-y-3 text-sm leading-relaxed text-[#5B6478]">
        <h2 className="text-lg font-bold text-[#1B2A4A]">3. 문의하기를 통해 수집하는 정보</h2>
        <p>
          문의하기 페이지를 통해 이메일로 연락하시는 경우, 보내주신 이메일 주소와 문의 내용만 문의 응대
          목적으로 수집·이용하며, 답변 완료 후 별도 요청이 없는 한 합리적인 기간 내 파기합니다.
        </p>
      </section>

      <section className="space-y-3 text-sm leading-relaxed text-[#5B6478]">
        <h2 className="text-lg font-bold text-[#1B2A4A]">4. 광고 서비스와 쿠키</h2>
        <p>
          이 사이트는 카카오 애드핏(Kakao AdFit) 및 구글 애드센스(Google AdSense) 광고를 게재하며, 두 서비스
          모두 이용자의 관심사에 맞는 광고를 보여주기 위해 쿠키를 사용할 수 있습니다. 구글은 제3자 공급업체로서
          쿠키를 사용해 이 사이트 및 다른 사이트 방문 이력을 기반으로 광고를 게재합니다.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            구글 맞춤 광고 설정 확인·해제:{" "}
            <a
              href="https://adssettings.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#2E4494] underline underline-offset-2"
            >
              Google 광고 설정
            </a>
          </li>
          <li>
            브라우저에서 쿠키 차단·삭제 방법은 각 브라우저(Chrome, Safari, Edge 등)의 설정 메뉴에서 확인할 수
            있습니다.
          </li>
        </ul>
      </section>

      <section className="space-y-3 text-sm leading-relaxed text-[#5B6478]">
        <h2 className="text-lg font-bold text-[#1B2A4A]">5. 제3자 제공 및 위탁</h2>
        <p>
          이 사이트는 수집한 정보를 광고 서비스 제공(카카오 애드핏, 구글 애드센스) 및 호스팅(Cloudflare) 목적
          외에는 제3자에게 제공하지 않습니다. 별도의 회원가입·로그인 기능이 없어 이름, 전화번호, 주민등록번호
          등의 민감한 개인정보는 수집하지 않습니다.
        </p>
      </section>

      <section className="space-y-3 text-sm leading-relaxed text-[#5B6478]">
        <h2 className="text-lg font-bold text-[#1B2A4A]">6. 이용자의 권리</h2>
        <p>
          이용자는 언제든지 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으며, 문의하기를 통해 수집된
          개인정보(이메일 문의 내용)의 열람·삭제를 요청할 수 있습니다.
        </p>
      </section>

      <section className="space-y-3 text-sm leading-relaxed text-[#5B6478]">
        <h2 className="text-lg font-bold text-[#1B2A4A]">7. 문의처</h2>
        <p>
          개인정보 관련 문의는{" "}
          <a href="/contact" className="text-[#2E4494] underline underline-offset-2">
            문의하기
          </a>{" "}
          페이지를 이용해주세요.
        </p>
      </section>

      <p className="text-xs text-[#8B93A6]">
        본 방침은 관련 법령 또는 서비스 변경에 따라 개정될 수 있으며, 개정 시 이 페이지를 통해 공지합니다.
      </p>
    </div>
  );
}
