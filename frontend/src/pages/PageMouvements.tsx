import { FormEvent, useEffect, useState } from "react";
import { appelApi, Mouvement, Produit } from "../services/api";

export default function PageMouvements() {
  const [mouvements, setMouvements] = useState<Mouvement[]>([]);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [afficherFormulaire, setAfficherFormulaire] = useState(false);
  const [typeMouvement, setTypeMouvement] = useState("entree");
  const [quantite, setQuantite] = useState(1);
  const [motif, setMotif] = useState("");
  const [idProduit, setIdProduit] = useState(0);
  const [erreur, setErreur] = useState("");

  function charger() {
    Promise.all([
      appelApi<Mouvement[]>("/api/v1/mouvements"),
      appelApi<Produit[]>("/api/v1/produits"),
    ]).then(([m, p]) => {
      setMouvements(m);
      setProduits(p);
      if (p.length > 0 && idProduit === 0) setIdProduit(p[0].id);
    });
  }

  useEffect(() => {
    charger();
  }, []);

  async function soumettre(e: FormEvent) {
    e.preventDefault();
    setErreur("");
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
      setAfficherFormulaire(false);
      setMotif("");
      charger();
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "erreur");
    }
  }

  const mapProduits = Object.fromEntries(produits.map((p) => [p.id, p.nom]));

  return (
    <div>
      <h1 className="page-titre">Mouvements</h1>
      <div className="actions-ligne">
        <button
          type="button"
          className="bouton bouton-primaire"
          onClick={() => setAfficherFormulaire(!afficherFormulaire)}
        >
          {afficherFormulaire ? "Annuler" : "Nouveau mouvement"}
        </button>
      </div>
      {afficherFormulaire && (
        <form className="formulaire" onSubmit={soumettre} style={{ marginBottom: "1.5rem" }}>
          <label>
            Type
            <select value={typeMouvement} onChange={(e) => setTypeMouvement(e.target.value)}>
              <option value="entree">Entrée</option>
              <option value="sortie">Sortie</option>
            </select>
          </label>
          <label>
            Produit
            <select value={idProduit} onChange={(e) => setIdProduit(Number(e.target.value))}>
              {produits.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nom} ({p.quantite} en stock)
                </option>
              ))}
            </select>
          </label>
          <label>
            Quantité
            <input
              type="number"
              min={1}
              value={quantite}
              onChange={(e) => setQuantite(Number(e.target.value))}
              required
            />
          </label>
          <label>
            Motif
            <input value={motif} onChange={(e) => setMotif(e.target.value)} />
          </label>
          {erreur && <p className="message-erreur">{erreur}</p>}
          <button type="submit" className="bouton bouton-primaire">
            Enregistrer
          </button>
        </form>
      )}
      <table className="tableau">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Produit</th>
            <th>Quantité</th>
            <th>Motif</th>
          </tr>
        </thead>
        <tbody>
          {mouvements.map((m) => (
            <tr key={m.id}>
              <td>{new Date(m.date_mouvement).toLocaleString("fr-FR")}</td>
              <td>{m.type_mouvement === "entree" ? "Entrée" : "Sortie"}</td>
              <td>{mapProduits[m.id_produit] || m.id_produit}</td>
              <td>{m.quantite}</td>
              <td>{m.motif || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
