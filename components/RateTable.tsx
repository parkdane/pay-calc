"use client";

import { useState } from "react";
import Link from "next/link";
import rates from "@/data/rates.json";

type Product = {
  bank: string;
  product: string;
  baseRate: number;
  maxRate: number;
  term: string;
  joinWay?: string;
};

export default function RateTable() {
  const [tab, setTab] = useState<"deposits" | "savings">("deposits");
  const list = (rates[tab] ?? []) as Product[];

  const updated = rates.updatedAt
    ? new Date(rates.updatedAt).toLocaleDateString("ko-KR")
    : "-";

  return (
    <div className="space-y-4">
      {/* 탭 */}
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
        {(
          [
            { id: "deposits", label: "정기예금" },
            { id: "savings", label: "적금" },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-lg py-2.5 text-sm font-semibold transition ${
              tab === t.id ? "bg-white text-blue-700 shadow-sm" : "text-slate-500"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-slate-400">
        금융감독원 공시 기준 · 최종 갱신 {updated} · 12개월 최고금리(우대 포함) 순
      </p>

      {list.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
          금리 데이터를 준비 중입니다. 매일 자동 갱신됩니다.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600">
                <th className="px-2 py-2.5 text-left font-semibold sm:px-3">#</th>
                <th className="whitespace-nowrap px-2 py-2.5 text-left font-semibold sm:px-3">
                  은행
                </th>
                <th className="px-2 py-2.5 text-left font-semibold sm:px-3">상품</th>
                <th className="whitespace-nowrap px-2 py-2.5 text-right font-semibold sm:px-3">
                  기본
                </th>
                <th className="whitespace-nowrap px-2 py-2.5 text-right font-semibold sm:px-3">
                  최고
                </th>
                <th className="px-2 py-2.5 text-center font-semibold sm:px-3"></th>
              </tr>
            </thead>
            <tbody>
              {list.map((p, i) => (
                <tr
                  key={`${p.bank}-${p.product}-${i}`}
                  className="border-t border-slate-100 hover:bg-blue-50/40"
                >
                  <td className="px-2 py-2 text-slate-400 sm:px-3">{i + 1}</td>
                  <td className="whitespace-nowrap px-2 py-2 font-medium text-slate-900 sm:px-3">
                    {p.bank}
                  </td>
                  <td className="px-2 py-2 text-slate-600 sm:px-3">{p.product}</td>
                  <td className="whitespace-nowrap px-2 py-2 text-right tabular-nums text-slate-500 sm:px-3">
                    {p.baseRate.toFixed(2)}%
                  </td>
                  <td className="whitespace-nowrap px-2 py-2 text-right font-bold tabular-nums text-blue-700 sm:px-3">
                    {p.maxRate.toFixed(2)}%
                  </td>
                  <td className="whitespace-nowrap px-2 py-2 text-center sm:px-3">
                    <Link
                      href={`/calc/deposit?rate=${p.maxRate}&mode=${
                        tab === "deposits" ? "deposit" : "savings"
                      }`}
                      className="inline-block rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-100"
                    >
                      계산
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
