type Row = { hobong: number; pay: number[] };

export default function SalaryTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: Row[];
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full min-w-[520px] text-sm">
        <thead>
          <tr className="bg-slate-50 text-slate-600">
            <th className="sticky left-0 bg-slate-50 px-3 py-2.5 text-left font-semibold">
              호봉
            </th>
            {columns.map((c) => (
              <th key={c} className="px-3 py-2.5 text-right font-semibold">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.hobong} className="border-t border-slate-100 hover:bg-blue-50/40">
              <td className="sticky left-0 bg-white px-3 py-2 font-medium text-slate-900">
                {r.hobong}호봉
              </td>
              {r.pay.map((p, i) => (
                <td key={i} className="px-3 py-2 text-right tabular-nums">
                  {p.toLocaleString("ko-KR")}원
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
