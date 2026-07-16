import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "문의하기",
  description: "봉급계산소 계산 오류 제보, 데이터 업데이트 요청, 광고·제휴 문의는 이메일로 받습니다.",
};

// TODO: 실제 사용하는 이메일 주소로 교체하세요
const CONTACT_EMAIL = "parkdaneeee@gmail.com";

export default function ContactPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-[#1B2A4A] sm:text-3xl">문의하기</h1>
        <p className="text-sm text-[#5B6478]">
          계산 오류 제보, 데이터 업데이트 요청, 광고·제휴 문의 모두 이메일로 받고 있습니다.
        </p>
      </header>

      <section className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-white p-6 text-sm text-[#5B6478]">
        <p className="font-semibold text-[#1B2A4A]">이메일로 문의하기</p>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="mt-2 inline-block text-lg font-bold text-[#2E4494] underline underline-offset-2"
        >
          {CONTACT_EMAIL}
        </a>
        <p className="mt-3 leading-relaxed">
          문의 주실 때 아래 내용을 함께 적어주시면 더 빠르게 확인할 수 있습니다.
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>어떤 계산기에서 발생한 문제인지 (예: 공무원 실수령액 계산기)</li>
          <li>입력한 값과 예상했던 결과, 실제로 나온 결과</li>
          <li>참고할 만한 공식 자료나 출처가 있다면 링크</li>
        </ul>
      </section>

      <section className="space-y-2 text-sm leading-relaxed text-[#5B6478]">
        <h2 className="text-lg font-bold text-[#1B2A4A]">답변은 언제쯤 받을 수 있나요?</h2>
        <p>
          개인이 운영하는 사이트라 영업일 기준 며칠 정도 소요될 수 있습니다. 계산 오류처럼 다른 이용자에게도
          영향을 주는 문제는 우선적으로 확인 후 반영합니다.
        </p>
      </section>
    </div>
  );
}
