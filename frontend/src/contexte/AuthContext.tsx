import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { appelApi, definirJeton, supprimerJeton, Utilisateur } from "../services/api";

interface AuthContexte {
  utilisateur: Utilisateur | null;
  chargement: boolean;
  connexion: (email: string, motDePasse: string) => Promise<void>;
  deconnexion: () => void;
}

const Contexte = createContext<AuthContexte | null>(null);

export function FournisseurAuth({ children }: { children: ReactNode }) {
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null);
  const [chargement, setChargement] = useState(true);

  const chargerProfil = useCallback(async () => {
    const jeton = sessionStorage.getItem("jeton_acces");
    if (!jeton) {
      setUtilisateur(null);
      setChargement(false);
      return;
    }
    try {
      const profil = await appelApi<Utilisateur>("/api/v1/auth/moi");
      setUtilisateur(profil);
    } catch {
      supprimerJeton();
      setUtilisateur(null);
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    chargerProfil();
  }, [chargerProfil]);

  const connexion = useCallback(async (email: string, motDePasse: string) => {
    const reponse = await appelApi<{ jeton_acces: string }>("/api/v1/auth/connexion", {
      method: "POST",
      body: JSON.stringify({ email, mot_de_passe: motDePasse }),
    });
    definirJeton(reponse.jeton_acces);
    const profil = await appelApi<Utilisateur>("/api/v1/auth/moi");
    setUtilisateur(profil);
  }, []);

  const deconnexion = useCallback(() => {
    supprimerJeton();
    setUtilisateur(null);
  }, []);

  const valeur = useMemo(
    () => ({ utilisateur, chargement, connexion, deconnexion }),
    [utilisateur, chargement, connexion, deconnexion]
  );

  return <Contexte.Provider value={valeur}>{children}</Contexte.Provider>;
}

export function useAuth() {
  const ctx = useContext(Contexte);
  if (!ctx) throw new Error("useAuth hors FournisseurAuth");
  return ctx;
}
