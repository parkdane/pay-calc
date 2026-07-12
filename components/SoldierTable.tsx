type SoldierRow = { rank: string; pay: number };

export default function SoldierTable({
  title,
  rows,
}: {
  title: string;
  rows: SoldierRow[];
}) {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-[#1B2A4A]">{title}</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {rows.map((r) => (
          <div
            key={r.rank}
            className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-white p-4 text-center"
          >
            <p className="text-sm text-[#7A8296]">{r.rank}</p>
            <p className="mt-1 text-lg font-bold tabular-nums text-[#1B2A4A]">
              {r.pay.toLocaleString("ko-KR")}
              <span className="text-sm font-normal text-[#8B93A6]">원</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
