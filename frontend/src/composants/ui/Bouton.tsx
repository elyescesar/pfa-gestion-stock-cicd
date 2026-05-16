import { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

type Variante = "primaire" | "secondaire" | "danger" | "fantome";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  chargement?: boolean;
  children?: ReactNode;
}

const styles: Record<Variante, string> = {
  primaire:
    "bg-gradient-to-r from-cyan-500 to-cyan-600 text-slate-950 shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-cyan-500",
  secondaire:
    "bg-slate-800/80 text-slate-200 border border-slate-600/50 hover:bg-slate-700/80 hover:border-slate-500",
  danger:
    "bg-red-500/15 text-red-300 border border-red-500/30 hover:bg-red-500/25",
  fantome: "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50",
};

export default function Bouton({
  variante = "primaire",
  chargement,
  children,
  className = "",
  disabled,
  ...props
}: Props) {
  return (
    <button
      type="button"
      disabled={disabled || chargement}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${styles[variante]} ${className}`}
      {...props}
    >
      {chargement && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
