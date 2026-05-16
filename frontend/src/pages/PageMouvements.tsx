import { FormEvent, useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Plus, ArrowLeftRight } from "lucide-react";
import { appelApi, Mouvement, Produit } from "../services/api";
import { useFetch } from "../hooks/useFetch";
import { useToast } from "../contexte/ToastContext";
import EntetePage from "../composants/ui/EntetePage";
import Bouton from "../composants/ui/Bouton";
import Modal from "../composants/ui/Modal";
import Badge from "../composants/ui/Badge";
import Chargeur from "../composants/ui/Chargeur";
import EtatVide from "../composants/ui/EtatVide";
import { Champ, Input, Select } from "../composants/ui/Champ";

export default function PageMouvements() {
  const { afficherToast } = useToast();
  const { donnees: mouvements, chargement, recharger } = useFetch<Mouvement[]>("/api/v1/mouvements");
  const { donnees: produits } = useFetch<Produit[]>("/api/v1/produits");
  const [modalOuvert, setModalOuvert] = useState(false);
  const [typeMouvement, setTypeMouvement] = useState("entree");
  const [quantite, setQuantite] = useState(1);
  const [motif, setMotif] = useState("");
  const [idProduit, setIdProduit] = useState(0);
  const [soumission, setSoumission] = useState(false);

  const mapProduits = useMemo(
    () => Object.fromEntries((produits || []).map((p) => [p.id, p])),
    [produits]
  );

  async function soumettre(e: FormEvent) {
    e.preventDefault();
    setSoumission(true);
    try {
      await appelApi("/api/v1/mouvements", {
        method: "POST",
        body: JSON.stringify({
          type_mouvement: typeMouvement,
          quantite,
          motif: motif || null,
          id_produit: idProduit,
        }),
      });
      afficherToast("Mouvement enregistré", "succes");
      setModalOuvert(false);
      setMotif("");
      recharger();
    } catch (err) {
      afficherToast(err instanceof Error ? err.message : "Erreur", "erreur");
    } finally {
      setSoumission(false);
    }
  }

  function ouvrirModal() {
    if (produits?.length) setIdProduit(produits[0].id);
    setModalOuvert(true);
  }

  if (chargement) return <Chargeur />;

  return (
    <div className="space-y-6">
      <EntetePage
        titre="Mouvements de stock"
        description="Historique des entrées et sorties"
        actions={
          <Bouton onClick={ouvrirModal}>
            <Plus className="h-4 w-4" />
            Nouveau mouvement
          </Bouton>
        }
      />

      {!mouvements?.length ? (
        <EtatVide
          icone={ArrowLeftRight}
          titre="Aucun mouvement"
          description="Enregistrez une entrée ou une sortie de stock."
        />
      ) : (
        <div className="relative space-y-0">
          <div className="absolute left-[27px] top-4 bottom-4 w-px bg-slate-800" />
          {mouvements.map((m) => {
            const entree = m.type_mouvement === "entree";
            const produit = mapProduits[m.id_produit];
            return (
              <div
                key={m.id}
                className="relative flex gap-4 pb-6 animate-fade-in"
              >
                <div
                  className={`relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border ${
                    entree
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      : "border-red-500/30 bg-red-500/10 text-red-400"
                  }`}
                >
                  {entree ? (
                    <ArrowDownLeft className="h-6 w-6" />
                  ) : (
                    <ArrowUpRight className="h-6 w-6" />
                  )}
                </div>
                <div className="flex-1 rounded-2xl border border-slate-800/50 bg-slate-900/40 p-4 hover:border-slate-700/50 transition-colors">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-white">
                        {entree ? "Entrée" : "Sortie"} · {m.quantite} unités
                      </p>
                      <p className="text-sm text-slate-400">{produit?.nom || `Produit #${m.id_produit}`}</p>
                    </div>
                    <Badge variante={entree ? "succes" : "danger"}>
                      {entree ? "Entrée" : "Sortie"}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    {new Date(m.date_mouvement).toLocaleString("fr-FR")}
                    {m.motif ? ` · ${m.motif}` : ""}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal ouvert={modalOuvert} titre="Nouveau mouvement" onFermer={() => setModalOuvert(false)}>
        <form onSubmit={soumettre} className="space-y-4">
          <Champ label="Type">
            <Select value={typeMouvement} onChange={(e) => setTypeMouvement(e.target.value)}>
              <option value="entree">Entrée</option>
              <option value="sortie">Sortie</option>
            </Select>
          </Champ>
          <Champ label="Produit">
            <Select value={idProduit} onChange={(e) => setIdProduit(Number(e.target.value))}>
              {(produits || []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nom} — {p.quantite} en stock
                </option>
              ))}
            </Select>
          </Champ>
          <Champ label="Quantité">
            <Input
              type="number"
              min={1}
              value={quantite}
              onChange={(e) => setQuantite(Number(e.target.value))}
              required
            />
          </Champ>
          <Champ label="Motif (optionnel)">
            <Input value={motif} onChange={(e) => setMotif(e.target.value)} />
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
