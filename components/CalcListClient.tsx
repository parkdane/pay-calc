"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type CalcItem = { href: string; title: string; desc: string };
type CalcGroup = { title: string; desc: string; items: CalcItem[] };

export default function CalcListClient({ groups }: { groups: CalcGroup[] }) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const normalizedQuery = query.trim().toLowerCase();
  const isSearching = normalizedQuery.length > 0;

  // 검색어가 있으면 카테고리 무시하고 전체에서 검색, 없으면 카테고리 필터만 적용
  const visibleGroups = useMemo(() => {
    if (isSearching) {
      const matched = groups
        .map((g) => ({
          ...g,
          items: g.items.filter(
            (c) =>
              c.title.toLowerCase().includes(normalizedQuery) ||
              c.desc.toLowerCase().includes(normalizedQuery)
          ),
        }))
        .filter((g) => g.items.length > 0);
      return matched;
    }
    if (activeCategory) {
      return groups.filter((g) => g.title === activeCategory);
    }
    return groups;
  }, [groups, isSearching, normalizedQuery, activeCategory]);

  const totalVisible = visibleGroups.reduce((sum, g) => sum + g.items.length, 0);

  return (
    <div className="space-y-6">
      {/* 검색창 */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="계산기 이름으로 검색 (예: 연금, 청년, 실수령액)"
          className="w-full min-h-[48px] rounded-xl border border-[rgba(46,68,148,0.22)] bg-white pl-11 pr-4 py-3 text-sm placeholder:text-[#8B93A6] focus:outline-none focus:ring-2 focus:ring-[rgba(46,68,148,0.25)]"
        />
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8B93A6]">
          🔍
        </span>
      </div>

      {/* 카테고리 필터 칩 (검색 중엔 숨김) */}
      {!isSearching && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
              activeCategory === null
                ? "bg-[#2E4494] text-white"
                : "bg-[rgba(46,68,148,0.06)] text-[#5B6478] hover:bg-[rgba(46,68,148,0.10)]"
            }`}
          >
            전체
          </button>
          {groups.map((g) => (
            <button
              key={g.title}
              onClick={() => setActiveCategory(g.title)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                activeCategory === g.title
                  ? "bg-[#2E4494] text-white"
                  : "bg-[rgba(46,68,148,0.06)] text-[#5B6478] hover:bg-[rgba(46,68,148,0.10)]"
              }`}
            >
              {g.title}
            </button>
          ))}
        </div>
      )}

      {/* 검색 결과 개수 */}
      {isSearching && (
        <p className="text-sm text-[#7A8296]">
          {totalVisible > 0 ? `${totalVisible}개 계산기 찾음` : "검색 결과가 없습니다"}
        </p>
      )}

      {/* 목록 (작은 카드 3열) */}
      {visibleGroups.length === 0 ? (
        <div className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-8 text-center">
          <p className="text-sm text-[#7A8296]">
            &quot;{query}&quot;에 해당하는 계산기를 찾지 못했습니다. 다른 검색어로 시도해보세요.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {visibleGroups.map((g) => (
            <section key={g.title} className="space-y-3">
              {!isSearching && (
                <div>
                  <h2 className="text-base font-bold text-[#1B2A4A]">{g.title}</h2>
                  <p className="text-xs text-[#8B93A6]">{g.desc}</p>
                </div>
              )}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {g.items.map((c) => (
                  <Link
                    key={c.href}
                    href={c.href}
                    className="rounded-lg border border-[rgba(46,68,148,0.14)] bg-white p-3.5 transition hover:border-[rgba(46,68,148,0.35)] hover:shadow-sm"
                  >
                    <p className="text-sm font-semibold leading-snug text-[#1B2A4A]">{c.title}</p>
                    <p className="mt-1 text-xs leading-snug text-[#8B93A6]">{c.desc}</p>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
