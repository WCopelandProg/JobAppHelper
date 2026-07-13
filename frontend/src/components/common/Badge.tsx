import clsx from "clsx";
import { ReactNode } from "react";

const VARIANTS = {
  neutral: "bg-slate-100 text-slate-700",
  brand: "bg-brand-100 text-brand-700",
  green: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700",
  red: "bg-red-100 text-red-700",
  blue: "bg-sky-100 text-sky-700",
  purple: "bg-purple-100 text-purple-700",
};

export function Badge({ children, variant = "neutral" }: { children: ReactNode; variant?: keyof typeof VARIANTS }) {
  return <span className={clsx("badge", VARIANTS[variant])}>{children}</span>;
}
