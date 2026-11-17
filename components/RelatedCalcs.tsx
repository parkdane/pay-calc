import Link from "next/link";
import { CALC_BY_HREF } from "@/data/calcList";

// 페이지 하단 "함께 많이 쓰는 계산기" 링크 묶음. 제목·설명은 계산기 목록(data/calcList.ts)에서 가져옴
export default function RelatedCalcs({ title, hrefs }: { title: string; hrefs: string[] }) {
  const items = hrefs.map((h) => CALC_BY_HREF[h]).filter(Boolean);
  if (!items.length) return null;
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-bold text-[#1B2A4A]">{title}</h2>
      <ul className="grid gap-2 sm:grid-cols-2">
        {items.map((c) => (
          <li key={c.href}>
            <Link
              href={c.href}
              className="block rounded-xl border border-[rgba(46,68,148,0.14)] bg-white p-4 hover:border-[#2E4494]"
            >
              <span className="font-semibold text-[#1B2A4A]">{c.title}</span>
              <span className="mt-1 block text-xs text-[#7A8296]">{c.desc}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
