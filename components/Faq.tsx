type Item = { q: string; a: string };

export default function Faq({ items }: { items: Item[] }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-bold text-[#1B2A4A]">자주 묻는 질문</h2>
      {items.map((item) => (
        <details
          key={item.q}
          className="group rounded-lg border border-[rgba(46,68,148,0.14)] bg-white p-4"
        >
          <summary className="cursor-pointer list-none font-medium text-[#1B2A4A]">
            Q. {item.q}
          </summary>
          <p className="mt-2 text-sm leading-relaxed text-[#5B6478]">{item.a}</p>
        </details>
      ))}
    </section>
  );
}
