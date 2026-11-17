import CalcBreadcrumb from "@/components/CalcBreadcrumb";

export default function CalcLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CalcBreadcrumb />
      {children}
    </>
  );
}
