import { FormEvent, useState } from "react";
import { FolderOpen, Plus, Trash2 } from "lucide-react";
import { appelApi, Categorie } from "../services/api";
import { useFetch } from "../hooks/useFetch";
import { useToast } from "../contexte/ToastContext";
import EntetePage from "../composants/ui/EntetePage";
import Bouton from "../composants/ui/Bouton";
import Modal from "../composants/ui/Modal";
import Chargeur from "../composants/ui/Chargeur";
import EtatVide from "../composants/ui/EtatVide";
import { Champ, Input, Textarea } from "../composants/ui/Champ";

export default function PageCategories() {
  const { afficherToast } = useToast();
  const { donnees: categories, chargement, recharger } = useFetch<Categorie[]>("/api/v1/categories");
  const [modalOuvert, setModalOuvert] = useState(false);
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [soumission, setSoumission] = useState(false);

  async function soumettre(e: FormEvent) {
    e.preventDefault();
    setSoumission(true);
    try {
      await appelApi("/api/v1/categories", {
        method: "POST",
        body: JSON.stringify({ nom, description: description || null }),
      });
      afficherToast("Catégorie créée", "succes");
      setModalOuvert(false);
      setNom("");
      setDescription("");
      recharger();
    } catch (err) {
      afficherToast(err instanceof Error ? err.message : "Erreur", "erreur");
    } finally {
      setSoumission(false);
    }
  }

  async function supprimer(id: number, nomCat: string) {
    if (!confirm(`Supprimer la catégorie « ${nomCat} » ?`)) return;
    try {
      await appelApi(`/api/v1/categories/${id}`, { method: "DELETE" });
      afficherToast("Catégorie supprimée", "succes");
      recharger();
    } catch {
      afficherToast("Suppression impossible", "erreur");
    }
  }

  if (chargement) return <Chargeur />;

  return (
    <div className="space-y-6">
      <EntetePage
        titre="Catégories"
        description="Organisez vos produits par familles"
        actions={
          <Bouton onClick={() => setModalOuvert(true)}>
            <Plus className="h-4 w-4" />
            Nouvelle catégorie
          </Bouton>
        }
      />

      {!categories?.length ? (
        <EtatVide icone={FolderOpen} titre="Aucune catégorie" description="Créez une catégorie pour classer vos produits." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c, i) => (
            <article
              key={c.id}
              className="group relative rounded-2xl border border-slate-800/50 bg-slate-900/40 p-5 transition-all hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/5 animate-fade-in"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-400">
                <FolderOpen className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-white">{c.nom}</h3>
              <p className="mt-2 text-sm text-slate-500 line-clamp-2 min-h-[2.5rem]">
                {c.description || "Sans description"}
              </p>
              <button
                type="button"
                onClick={() => supprimer(c.id, c.nom)}
                className="absolute top-4 right-4 rounded-lg p-2 text-slate-600 opacity-0 group-hover:opacity-100 hover:bg-red-500/15 hover:text-red-400 transition-all"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </article>
          ))}
        </div>
      )}

      <Modal ouvert={modalOuvert} titre="Nouvelle catégorie" onFermer={() => setModalOuvert(false)}>
        <form onSubmit={soumettre} className="space-y-4">
          <Champ label="Nom">
            <Input value={nom} onChange={(e) => setNom(e.target.value)} required />
          </Champ>
          <Champ label="Description">
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </Champ>
          <div className="flex justify-end gap-2 pt-2">
            <Bouton variante="secondaire" type="button" onClick={() => setModalOuvert(false)}>
              Annuler
            </Bouton>
            <Bouton type="submit" chargement={soumission}>
              Enregistrer
            </Bouton>
          </div>
        </form>
      </Modal>
    </div>
  );
}
