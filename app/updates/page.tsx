import type { Metadata } from "next";
import Link from "next/link";
import { UPDATES } from "@/data/updates";

const DESC =
  "봉급계산소의 계산기·봉급표 데이터 정정과 기능 변경 내역입니다. 실제 배포된 변경만 날짜순으로 기록합니다.";

export const metadata: Metadata = {
  title: "업데이트 내역",
  description: DESC,
  openGraph: { title: "업데이트 내역", description: DESC },
};

export default function UpdatesPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-[#1B2A4A] sm:text-3xl">업데이트 내역</h1>
        <p className="text-sm text-[#5B6478]">{DESC}</p>
        <p className="text-xs text-[#8B93A6]">
          매일 자동으로 갱신되는 예적금 금리·대기업 평균연봉 데이터는 기록하지 않습니다. 오류를 발견하시면{" "}
          <Link href="/contact" className="underline hover:text-[#2E4494]">
            문의하기
          </Link>
          로 알려주세요.
        </p>
      </header>

      {UPDATES.map((u) => (
        <section key={u.date} className="space-y-2">
          <h2 className="text-lg font-bold text-[#1B2A4A]">{u.date}</h2>
          <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-[#5B6478]">
            {u.items.map((it) => (
              <li key={it.text}>
                {it.href ? (
                  <Link href={it.href} className="hover:text-[#2E4494] hover:underline">
                    {it.text}
                  </Link>
                ) : (
                  it.text
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
