"use client";

/**
 * 콤마 자동 포맷 숫자 입력.
 * - 표시: 1,000,000 처럼 세 자리 콤마
 * - 값: 순수 숫자(number)로 부모에 전달
 * - 모바일: 숫자 키패드(inputMode="numeric")
 */
export default function MoneyInput({
  value,
  onChange,
  placeholder,
  className = "",
  max,
}: {
  value: number;
  onChange: (n: number) => void;
  placeholder?: string;
  className?: string;
  max?: number;
}) {
  const display = value === 0 ? "" : value.toLocaleString("ko-KR");

  const handleChange = (raw: string) => {
    const digits = raw.replace(/[^0-9]/g, "");
    let n = digits === "" ? 0 : Number(digits);
    if (max !== undefined && n > max) n = max;
    onChange(n);
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      value={display}
      placeholder={placeholder}
      onChange={(e) => handleChange(e.target.value)}
      className={
        className ||
        "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 tabular-nums"
      }
    />
  );
}
