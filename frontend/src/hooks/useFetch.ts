import { useCallback, useEffect, useState } from "react";
import { appelApi } from "../services/api";

interface EtatFetch<T> {
  donnees: T | null;
  chargement: boolean;
  erreur: string | null;
  recharger: () => Promise<void>;
}

export function useFetch<T>(chemin: string, deps: unknown[] = []): EtatFetch<T> {
  const [donnees, setDonnees] = useState<T | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  const recharger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      const resultat = await appelApi<T>(chemin);
      setDonnees(resultat);
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "erreur");
    } finally {
      setChargement(false);
    }
  }, [chemin]);

  useEffect(() => {
    recharger();
  }, [recharger, ...deps]);

  return { donnees, chargement, erreur, recharger };
}
