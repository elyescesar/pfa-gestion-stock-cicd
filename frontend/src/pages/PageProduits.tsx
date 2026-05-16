import { FormEvent, useEffect, useState } from "react";
import { appelApi, Categorie, Produit } from "../services/api";

export default function PageProduits() {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [afficherFormulaire, setAfficherFormulaire] = useState(false);
  const [nom, setNom] = useState("");
  const [referenceSku, setReferenceSku] = useState("");
  const [quantite, setQuantite] = useState(0);
  const [seuilAlerte, setSeuilAlerte] = useState(5);
  const [idCategorie, setIdCategorie] = useState(0);

  function charger() {
    Promise.all([
      appelApi<Produit[]>("/api/v1/produits"),
      appelApi<Categorie[]>("/api/v1/categories"),
    ]).then(([p, c]) => {
      setProduits(p);
      setCategories(c);
      if (c.length > 0 && idCategorie === 0) setIdCategorie(c[0].id);
    });
  }

  useEffect(() => {
    charger();
  }, []);

  async function soumettre(e: FormEvent) {
    e.preventDefault();
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
    setAfficherFormulaire(false);
    setNom("");
    setReferenceSku("");
    setQuantite(0);
    charger();
  }

  async function supprimer(id: number) {
    if (!confirm("Supprimer ce produit ?")) return;
    await appelApi(`/api/v1/produits/${id}`, { method: "DELETE" });
    charger();
  }

  const mapCategories = Object.fromEntries(categories.map((c) => [c.id, c.nom]));

  return (
    <div>
      <h1 className="page-titre">Produits</h1>
      <div className="actions-ligne">
        <button
          type="button"
          className="bouton bouton-primaire"
          onClick={() => setAfficherFormulaire(!afficherFormulaire)}
        >
          {afficherFormulaire ? "Annuler" : "Nouveau produit"}
        </button>
      </div>
      {afficherFormulaire && (
        <form className="formulaire" onSubmit={soumettre} style={{ marginBottom: "1.5rem" }}>
          <label>
            Nom
            <input value={nom} onChange={(e) => setNom(e.target.value)} required />
          </label>
          <label>
            Référence SKU
            <input value={referenceSku} onChange={(e) => setReferenceSku(e.target.value)} required />
          </label>
          <label>
            Quantité
            <input
              type="number"
              min={0}
              value={quantite}
              onChange={(e) => setQuantite(Number(e.target.value))}
              required
            />
          </label>
          <label>
            Seuil alerte
            <input
              type="number"
              min={0}
              value={seuilAlerte}
              onChange={(e) => setSeuilAlerte(Number(e.target.value))}
              required
            />
          </label>
          <label>
            Catégorie
            <select value={idCategorie} onChange={(e) => setIdCategorie(Number(e.target.value))}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nom}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="bouton bouton-primaire">
            Enregistrer
          </button>
        </form>
      )}
      <table className="tableau">
        <thead>
          <tr>
            <th>Nom</th>
            <th>SKU</th>
            <th>Quantité</th>
            <th>Seuil</th>
            <th>Catégorie</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {produits.map((p) => (
            <tr key={p.id}>
              <td>{p.nom}</td>
              <td>{p.reference_sku}</td>
              <td>{p.quantite <= p.seuil_alerte ? <span className="badge-alerte">{p.quantite}</span> : p.quantite}</td>
              <td>{p.seuil_alerte}</td>
              <td>{mapCategories[p.id_categorie] || "-"}</td>
              <td>
                <button type="button" className="bouton bouton-danger" onClick={() => supprimer(p.id)}>
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
