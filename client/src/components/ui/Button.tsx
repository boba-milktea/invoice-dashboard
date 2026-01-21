import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "ghost";
};

export function Button({
  variant = "default",
  className = "",
  ...props
}: Props) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const styles =
    variant === "ghost"
      ? "bg-transparent hover:bg-slate-100 text-slate-700"
      : "bg-slate-900 text-white hover:bg-slate-700";
  return <button className={`${base} ${styles} ${className}`} {...props} />;
}
