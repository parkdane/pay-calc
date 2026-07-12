import type { Metadata } from "next";
import YouthSavingsCompareCalc from "@/components/YouthSavingsCompareCalc";
import Faq from "@/components/Faq";
import Link from "next/link";

export const metadata: Metadata = {
  title: "청년 정책 적금 비교 (청년미래적금·도약계좌·내일저축계좌)",
  description:
    "청년미래적금, 청년도약계좌, 청년내일저축계좌, 장병내일준비적금, 일반 적금의 만기 수령액을 한 화면에서 비교합니다. 월 납입액만 입력하면 정부기여금까지 반영해 계산합니다.",
};

const FAQ = [
  {
    q: "이 상품들에 전부 동시에 가입할 수 있나요?",
    a: "아닙니다. 청년내일저축계좌는 저소득 청년, 장병내일준비적금은 현역 복무자만 가입할 수 있는 등 상품마다 가입 자격이 다릅니다. 이 계산기는 \"내가 조건을 충족한다면 어느 쪽이 더 유리한가\"를 비교하는 용도입니다.",
  },
  {
    q: "왜 만기 수령액 차이가 이렇게 큰가요?",
    a: "만기 기간이 다르기 때문입니다. 청년도약계좌는 5년(60개월), 청년미래적금·청년내일저축계좌는 3년(36개월)이라 같은 월 납입액이라도 총 납입 기간이 길수록 총액이 커집니다. 표의 \"만기\" 열을 함께 확인하세요.",
  },
  {
    q: "기존 계좌를 해지하고 갈아타도 되나요?",
    a: "신중해야 합니다. 정책 적금은 중도해지 시 정부기여금을 반환해야 하는 경우가 많아, 해지 손실이 새 상품의 혜택보다 클 수 있습니다. 갈아타기 전 기존 상품의 중도해지 조건을 먼저 확인하세요.",
  },
];

export default function Page() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          청년 정책 적금 비교
        </h1>
        <p className="text-sm text-slate-600">
          청년미래적금, 청년도약계좌, 청년내일저축계좌, 장병내일준비적금, 일반 적금의 만기 수령액을 한 화면에서
          비교합니다. 월 납입액만 입력하면 정부기여금·이자까지 자동으로 계산합니다.
        </p>
      </header>

      <YouthSavingsCompareCalc />

      <section className="space-y-3 text-sm leading-relaxed text-slate-700">
        <h2 className="text-xl font-bold text-slate-900">계산 방식</h2>
        <p>
          각 상품의 원금은 월 납입액 × 만기 개월수로, 이자는 단리 적립식(월 납입액 × 월이율 × n(n+1)/2)으로
          계산합니다. 청년미래적금·청년도약계좌·청년내일저축계좌·장병내일준비적금은 정부기여금(매칭)을
          별도로 더하고 비과세를 적용하며, 일반 적금은 이자소득세 15.4%를 공제합니다.
        </p>
        <p>
          각 상품을 개별로 더 자세히 계산하고 싶다면{" "}
          <Link href="/calc/youth-save" className="text-blue-700 underline">
            청년미래적금
          </Link>
          ,{" "}
          <Link href="/calc/leap-save" className="text-blue-700 underline">
            청년도약계좌
          </Link>
          ,{" "}
          <Link href="/calc/naeil-save" className="text-blue-700 underline">
            청년내일저축계좌
          </Link>
          ,{" "}
          <Link href="/calc/soldier-save" className="text-blue-700 underline">
            장병내일준비적금
          </Link>{" "}
          계산기를 각각 확인하세요.
        </p>
      </section>

      <Faq items={FAQ} />
    </div>
  );
}
