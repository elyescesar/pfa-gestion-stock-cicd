import { LucideIcon } from "lucide-react";

export default function EtatVide({
  icone: Icone,
  titre,
  description,
}: {
  icone: LucideIcon;
  titre: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700/50 bg-slate-900/30 py-16 px-8 text-center">
      <div className="mb-4 rounded-2xl bg-slate-800/50 p-4">
        <Icone className="h-10 w-10 text-slate-500" />
      </div>
      <h3 className="text-lg font-medium text-slate-300">{titre}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-slate-500">{description}</p>}
    </div>
  );
}
