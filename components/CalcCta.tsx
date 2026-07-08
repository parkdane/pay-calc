import Link from "next/link";

export default function CalcCta({
  href = "/calc/civil-net",
  label = "내 실수령액 계산하기",
}: {
  href?: string;
  label?: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-xl bg-blue-700 px-6 py-4 text-center font-semibold text-white shadow-sm transition hover:bg-blue-800"
    >
      {label} →
    </Link>
  );
}
