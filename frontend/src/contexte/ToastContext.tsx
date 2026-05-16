import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

type TypeToast = "succes" | "erreur" | "info";

interface Toast {
  id: number;
  message: string;
  type: TypeToast;
}

interface ToastContexte {
  afficherToast: (message: string, type?: TypeToast) => void;
}

const Contexte = createContext<ToastContexte | null>(null);

export function FournisseurToast({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const afficherToast = useCallback((message: string, type: TypeToast = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const valeur = useMemo(() => ({ afficherToast }), [afficherToast]);

  return (
    <Contexte.Provider value={valeur}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 rounded-xl border px-4 py-3 shadow-2xl backdrop-blur-md animate-fade-in ${
              t.type === "succes"
                ? "border-emerald-500/30 bg-emerald-950/80 text-emerald-100"
                : t.type === "erreur"
                  ? "border-red-500/30 bg-red-950/80 text-red-100"
                  : "border-cyan-500/30 bg-slate-900/90 text-slate-100"
            }`}
          >
            {t.type === "succes" ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
            )}
            <span className="text-sm font-medium">{t.message}</span>
            <button
              type="button"
              onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
              className="ml-2 opacity-60 hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </Contexte.Provider>
  );
}

export function useToast() {
  const ctx = useContext(Contexte);
  if (!ctx) throw new Error("useToast hors FournisseurToast");
  return ctx;
}
