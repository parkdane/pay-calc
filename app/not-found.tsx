import type { Metadata } from "next";
import Link from "next/link";

// 404 페이지에는 canonical을 출력하지 않는다 (noindex는 Next가 자동 추가) (layout의 canonical "./"가 /_not-found로 잡히는 것 방지)
export const metadata: Metadata = {
  title: "페이지를 찾을 수 없음",
  alternates: { canonical: null },
};

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-[#1B2A4A]">페이지를 찾을 수 없습니다</h1>
      <p className="text-[#5B6478]">주소가 바뀌었거나 삭제된 페이지입니다.</p>
      <p className="space-x-4 text-sm">
        <Link href="/" className="text-[#1B2A4A] underline">홈</Link>
        <Link href="/salary" className="text-[#1B2A4A] underline">봉급표</Link>
        <Link href="/calc" className="text-[#1B2A4A] underline">계산기</Link>
        <Link href="/guide" className="text-[#1B2A4A] underline">가이드</Link>
      </p>
    </div>
  );
}
