// 서버 렌더링용 단순 표. 첫 열은 왼쪽, 나머지 열은 오른쪽 정렬(숫자).
export default function SimpleTable({ head, rows, minWidth = 480 }: { head: string[]; rows: string[][]; minWidth?: number }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[rgba(46,68,148,0.14)]">
      <table className="w-full text-sm" style={{ minWidth }}>
        <thead className="bg-[#F5F6FA] text-xs text-[#7A8296]">
          <tr>
            {head.map((h, i) => (
              <th key={h} className={`px-4 py-2 font-medium ${i === 0 ? "text-left" : "text-right"}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[rgba(46,68,148,0.08)] bg-white tabular-nums text-[#1B2A4A]">
          {rows.map((r) => (
            <tr key={r[0]}>
              {r.map((c, i) => (
                <td key={i} className={`px-4 py-2 ${i === 0 ? "font-medium" : "text-right"}`}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
