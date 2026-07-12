type Row = { hobong: number; pay: (number | null)[] };

export default function SalaryTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: Row[];
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[rgba(46,68,148,0.14)]">
      <table className="w-full text-xs sm:text-sm">
        <thead>
          <tr className="bg-white text-[#5B6478]">
            <th className="sticky left-0 whitespace-nowrap bg-white px-2 py-2.5 text-left font-semibold sm:px-3">
              호봉
            </th>
            {columns.map((c) => (
              <th
                key={c}
                className="whitespace-nowrap px-2 py-2.5 text-right font-semibold sm:px-3"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.hobong} className="border-t border-[rgba(46,68,148,0.10)] hover:bg-[rgba(46,68,148,0.06)]">
              <td className="sticky left-0 whitespace-nowrap bg-white px-2 py-2 font-medium text-[#1B2A4A] sm:px-3">
                {r.hobong}
              </td>
              {r.pay.map((p, i) => (
                <td
                  key={i}
                  className="whitespace-nowrap px-2 py-2 text-right tabular-nums sm:px-3"
                >
                  {p === null ? (
                    <span className="text-slate-300">–</span>
                  ) : (
                    p.toLocaleString("ko-KR")
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="border-t border-[rgba(46,68,148,0.10)] px-3 py-2 text-right text-xs text-[#8B93A6]">
        단위: 원 · 좌우로 스크롤
      </p>
    </div>
  );
}
