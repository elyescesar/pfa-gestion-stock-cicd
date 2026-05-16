import { ReactNode } from "react";

type Variante = "defaut" | "succes" | "alerte" | "danger" | "info";

const styles: Record<Variante, string> = {
  defaut: "bg-slate-700/50 text-slate-300",
  succes: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  alerte: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  danger: "bg-red-500/15 text-red-300 border-red-500/30",
  info: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
};

export default function Badge({
  variante = "defaut",
  children,
}: {
  variante?: Variante;
  children?: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-medium ${styles[variante]}`}
    >
      {children}
    </span>
  );
}
