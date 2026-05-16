import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";

interface Props {
  ouvert: boolean;
  titre: string;
  onFermer: () => void;
  children?: ReactNode;
  taille?: "md" | "lg";
}

export default function Modal({ ouvert, titre, onFermer, children, taille = "md" }: Props) {
  useEffect(() => {
    if (!ouvert) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onFermer();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [ouvert, onFermer]);

  if (!ouvert) return null;

  const largeur = taille === "lg" ? "max-w-2xl" : "max-w-md";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onFermer}
        aria-hidden
      />
      <div
        className={`relative w-full ${largeur} rounded-2xl border border-slate-700/50 bg-slate-900/95 shadow-2xl animate-fade-in`}
        role="dialog"
      >
        <div className="flex items-center justify-between border-b border-slate-700/50 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">{titre}</h2>
          <button
            type="button"
            onClick={onFermer}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
