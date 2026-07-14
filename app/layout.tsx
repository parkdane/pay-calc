import type { Metadata } from "next";
import { Noto_Serif_KR } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const notoSerifKR = Noto_Serif_KR({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-noto-serif-kr",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://moneywatch.kr"),
  title: {
    default: "2026 봉급표 · 실수령액 계산기",
    template: "%s | 봉급계산소",
  },
  description:
    "2026년 공무원·군인·경찰·소방 봉급표와 실수령액 계산기, 청년 정책 적금 계산기를 제공합니다.",
  verification: {
    other: {
      "naver-site-verification": "53b5ffabd7662133f9b4ab1ab89732ef406dba9b",
    },
  },
  openGraph: {
    type: "website",
    siteName: "봉급계산소",
    title: "2026 봉급표 · 실수령액 계산기",
    description:
      "공무원·군인·경찰·소방·교사 봉급표와 실수령액 계산기, 청년 정책 적금 계산기를 무료로 제공합니다.",
    url: "https://moneywatch.kr",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary",
    title: "2026 봉급표 · 실수령액 계산기",
    description:
      "봉급표 조회부터 세후 실수령액, 정책 적금 계산까지 한 곳에서.",
  },
};

const NAV = [
  { href: "/salary", label: "봉급표" },
  { href: "/calc", label: "계산기" },
  { href: "/guide", label: "가이드" },
];

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={notoSerifKR.variable}>
      <head>
        {/* Google AdSense 사이트 소유권 확인 */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2066115165475669"
          crossOrigin="anonymous"
        ></script>

        {/* Pretendard 본문 폰트 (CDN) */}
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css"
        />
      </head>
      <body className="min-h-screen bg-white text-[#1B2A4A] antialiased">
        {/* 헤더 */}
        <header className="sticky top-0 z-50 border-b border-[rgba(46,68,148,0.14)] bg-white/90 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
            <Link href="/" className="text-lg font-bold tracking-tight text-[#1B2A4A]">
              봉급<span className="text-[#2E4494]">계산소</span>
            </Link>
            <nav className="flex gap-5 text-sm font-medium text-[#5B6478]">
              {NAV.map((item) => (
                <Link key={item.href} href={item.href} className="hover:text-[#2E4494]">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>

        {/* 푸터 + 면책 */}
        <footer className="mt-16 border-t border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)]">
          <div className="mx-auto max-w-4xl space-y-4 px-4 py-8 text-xs leading-relaxed text-[#7A8296]">
            <div className="flex flex-wrap gap-x-4 gap-y-1 font-medium text-[#5B6478]">
              <Link href="/about" className="hover:text-[#2E4494]">
                사이트 소개
              </Link>
              <Link href="/privacy" className="hover:text-[#2E4494]">
                개인정보처리방침
              </Link>
              <Link href="/contact" className="hover:text-[#2E4494]">
                문의하기
              </Link>
            </div>
            <p>
              본 사이트의 봉급표·계산 결과는 인사혁신처, 국세청, 금융위원회 등 공개
              자료를 바탕으로 한 <strong className="text-[#5B6478]">참고용 추정치</strong>이며 법적 효력이
              없습니다. 실제 지급액은 소속 기관·개인 상황에 따라 달라질 수 있으므로
              반드시 공식 기관의 안내를 확인하시기 바랍니다.
            </p>
            <p>© {new Date().getFullYear()} 봉급계산소. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}