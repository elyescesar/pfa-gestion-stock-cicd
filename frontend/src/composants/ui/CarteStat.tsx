import { LucideIcon } from "lucide-react";

interface Props {
  titre: string;
  valeur: string | number;
  icone: LucideIcon;
  tendance?: string;
  variante?: "cyan" | "violet" | "emerald" | "amber";
}

const couleurs = {
  cyan: "from-cyan-500/20 to-cyan-600/5 border-cyan-500/20 text-cyan-400",
  violet: "from-violet-500/20 to-violet-600/5 border-violet-500/20 text-violet-400",
  emerald: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/20 text-emerald-400",
  amber: "from-amber-500/20 to-amber-600/5 border-amber-500/20 text-amber-400",
};

export default function CarteStat({ titre, valeur, icone: Icone, tendance, variante = "cyan" }: Props) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${couleurs[variante]}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{titre}</p>
          <p className="mt-2 text-3xl font-bold text-white tabular-nums">{valeur}</p>
          {tendance && <p className="mt-1 text-xs text-slate-500">{tendance}</p>}
        </div>
        <div className="rounded-xl bg-slate-900/40 p-3">
          <Icone className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
