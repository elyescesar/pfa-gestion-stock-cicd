const URL_API = import.meta.env.VITE_API_URL || "http://localhost:8000";

function obtenirJeton(): string | null {
  return sessionStorage.getItem("jeton_acces");
}

export function definirJeton(jeton: string): void {
  sessionStorage.setItem("jeton_acces", jeton);
}

export function supprimerJeton(): void {
  sessionStorage.removeItem("jeton_acces");
}

export async function appelApi<T>(
  chemin: string,
  options: RequestInit = {}
): Promise<T> {
  const entetes: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  const jeton = obtenirJeton();
  if (jeton) {
    (entetes as Record<string, string>)["Authorization"] = `Bearer ${jeton}`;
  }
  const reponse = await fetch(`${URL_API}${chemin}`, { ...options, headers: entetes });
  if (reponse.status === 401 && !window.location.pathname.startsWith("/connexion")) {
    supprimerJeton();
    window.location.href = "/connexion";
    throw new Error("non_autorise");
  }
  if (!reponse.ok) {
    const erreur = await reponse.json().catch(() => ({ detail: "erreur" }));
    throw new Error(erreur.detail || "erreur_api");
  }
  if (reponse.status === 204) {
    return undefined as T;
  }
  return reponse.json();
}

export interface Utilisateur {
  id: number;
  email: string;
  role: string;
}

export interface Categorie {
  id: number;
  nom: string;
  description: string | null;
}

export interface Produit {
  id: number;
  nom: string;
  reference_sku: string;
  quantite: number;
  seuil_alerte: number;
  id_categorie: number;
}

export interface Mouvement {
  id: number;
  type_mouvement: string;
  quantite: number;
  motif: string | null;
  date_mouvement: string;
  id_produit: number;
  id_utilisateur: number;
}

export interface TableauDeBord {
  nombre_produits: number;
  nombre_categories: number;
  nombre_mouvements: number;
  produits_alerte: Produit[];
}
