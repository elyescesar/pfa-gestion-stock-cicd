import { FormEvent, useMemo, useState } from "react";
import { Plus, Trash2, Package } from "lucide-react";
import { appelApi, Categorie, Produit } from "../services/api";
import { useFetch } from "../hooks/useFetch";
import { useToast } from "../contexte/ToastContext";
import EntetePage from "../composants/ui/EntetePage";
import Bouton from "../composants/ui/Bouton";
import Modal from "../composants/ui/Modal";
import BarreRecherche from "../composants/ui/BarreRecherche";
import Badge from "../composants/ui/Badge";
import Chargeur from "../composants/ui/Chargeur";
import EtatVide from "../composants/ui/EtatVide";
import { Champ, Input, Select } from "../composants/ui/Champ";

export default function PageProduits() {
  const { afficherToast } = useToast();
  const { donnees: produits, chargement, recharger } = useFetch<Produit[]>("/api/v1/produits");
  const { donnees: categories } = useFetch<Categorie[]>("/api/v1/categories");
  const [modalOuvert, setModalOuvert] = useState(false);
  const [recherche, setRecherche] = useState("");
  const [nom, setNom] = useState("");
  const [referenceSku, setReferenceSku] = useState("");
  const [quantite, setQuantite] = useState(0);
  const [seuilAlerte, setSeuilAlerte] = useState(5);
  const [idCategorie, setIdCategorie] = useState(0);
  const [soumission, setSoumission] = useState(false);

  const mapCategories = useMemo(
    () => Object.fromEntries((categories || []).map((c) => [c.id, c.nom])),
    [categories]
  );

  const produitsFiltres = useMemo(() => {
    if (!produits) return [];
    const q = recherche.toLowerCase().trim();
    if (!q) return produits;
    return produits.filter(
      (p) =>
        p.nom.toLowerCase().includes(q) ||
        p.reference_sku.toLowerCase().includes(q) ||
        (mapCategories[p.id_categorie] || "").toLowerCase().includes(q)
    );
  }, [produits, recherche, mapCategories]);

  function ouvrirModal() {
    setNom("");
    setReferenceSku("");
    setQuantite(0);
    setSeuilAlerte(5);
    if (categories?.length) setIdCategorie(categories[0].id);
    setModalOuvert(true);
  }

  async function soumettre(e: FormEvent) {
    e.preventDefault();
    setSoumission(true);
    try {
      await appelApi("/api/v1/produits", {
        method: "POST",
        body: JSON.stringify({
          nom,
          reference_sku: referenceSku,
          quantite,
          seuil_alerte: seuilAlerte,
          id_categorie: idCategorie,
        }),
      });
      afficherToast("Produit créé", "succes");
      setModalOuvert(false);
      recharger();
    } catch (err) {
      afficherToast(err instanceof Error ? err.message : "Erreur", "erreur");
    } finally {
      setSoumission(false);
    }
  }

  async function supprimer(id: number, nomProduit: string) {
    if (!confirm(`Supprimer « ${nomProduit} » ?`)) return;
    try {
      await appelApi(`/api/v1/produits/${id}`, { method: "DELETE" });
      afficherToast("Produit supprimé", "succes");
      recharger();
    } catch {
      afficherToast("Suppression impossible", "erreur");
    }
  }

  if (chargement) return <Chargeur />;

  return (
    <div className="space-y-6">
      <EntetePage
        titre="Produits"
        description={`${produits?.length ?? 0} références en catalogue`}
        actions={
          <Bouton onClick={ouvrirModal}>
            <Plus className="h-4 w-4" />
            Nouveau produit
          </Bouton>
        }
      />

      <BarreRecherche valeur={recherche} onChange={setRecherche} placeholder="Nom, SKU ou catégorie..." />

      {produitsFiltres.length === 0 ? (
        <EtatVide
          icone={Package}
          titre="Aucun produit"
          description={recherche ? "Aucun résultat pour cette recherche." : "Ajoutez votre premier produit."}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-800/50 bg-slate-900/30">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-900/50 text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-3 font-medium">Produit</th>
                  <th className="px-6 py-3 font-medium">SKU</th>
                  <th className="px-6 py-3 font-medium">Stock</th>
                  <th className="px-6 py-3 font-medium">Seuil</th>
                  <th className="px-6 py-3 font-medium">Catégorie</th>
                  <th className="px-6 py-3 font-medium w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {produitsFiltres.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4 font-medium text-white">{p.nom}</td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">{p.reference_sku}</td>
                    <td className="px-6 py-4">
                      {p.quantite <= p.seuil_alerte ? (
                        <Badge variante="alerte">{p.quantite}</Badge>
                      ) : (
                        <span className="tabular-nums text-slate-300">{p.quantite}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-400 tabular-nums">{p.seuil_alerte}</td>
                    <td className="px-6 py-4 text-slate-400">{mapCategories[p.id_categorie] || "—"}</td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => supprimer(p.id, p.nom)}
                        className="rounded-lg p-2 text-slate-500 opacity-0 group-hover:opacity-100 hover:bg-red-500/15 hover:text-red-400 transition-all"
                        aria-label="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal ouvert={modalOuvert} titre="Nouveau produit" onFermer={() => setModalOuvert(false)} taille="lg">
        <form onSubmit={soumettre} className="grid gap-4 sm:grid-cols-2">
          <Champ label="Nom">
            <Input value={nom} onChange={(e) => setNom(e.target.value)} required />
          </Champ>
          <Champ label="Référence SKU">
            <Input value={referenceSku} onChange={(e) => setReferenceSku(e.target.value)} required />
          </Champ>
          <Champ label="Quantité">
            <Input
              type="number"
              min={0}
              value={quantite}
              onChange={(e) => setQuantite(Number(e.target.value))}
              required
            />
          </Champ>
          <Champ label="Seuil alerte">
            <Input
              type="number"
              min={0}
              value={seuilAlerte}
              onChange={(e) => setSeuilAlerte(Number(e.target.value))}
              required
            />
          </Champ>
          <div className="sm:col-span-2">
            <Champ label="Catégorie">
              <Select
                value={idCategorie}
                onChange={(e) => setIdCategorie(Number(e.target.value))}
              >
                {(categories || []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nom}
                  </option>
                ))}
              </Select>
            </Champ>
          </div>
          <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
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
