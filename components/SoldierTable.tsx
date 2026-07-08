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
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {rows.map((r) => (
          <div
            key={r.rank}
            className="rounded-xl border border-slate-200 bg-white p-4 text-center"
          >
            <p className="text-sm text-slate-500">{r.rank}</p>
            <p className="mt-1 text-lg font-bold tabular-nums text-slate-900">
              {r.pay.toLocaleString("ko-KR")}
              <span className="text-sm font-normal text-slate-400">원</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
