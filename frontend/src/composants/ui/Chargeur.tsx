import { Loader2 } from "lucide-react";

export default function Chargeur({ texte = "Chargement..." }: { texte?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24">
      <Loader2 className="h-10 w-10 animate-spin text-cyan-400" />
      <p className="text-sm text-slate-400">{texte}</p>
    </div>
  );
}
