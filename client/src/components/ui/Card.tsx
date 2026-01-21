import type { ReactNode } from "react";

type Props = { children: ReactNode; className?: string };

export function Card({ children, className = "" }: Props) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white shadow-md ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }: Props) {
  return (
    <div className={`border-b border-slate-100 px-5 py-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = "" }: Props) {
  return <div className={`px-5 py-4 ${className}`}>{children}</div>;
}
