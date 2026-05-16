import { FormEvent, useEffect, useState } from "react";
import { appelApi, Categorie } from "../services/api";

export default function PageCategories() {
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [afficherFormulaire, setAfficherFormulaire] = useState(false);
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");

  function charger() {
    appelApi<Categorie[]>("/api/v1/categories").then(setCategories);
  }

  useEffect(() => {
    charger();
  }, []);

  async function soumettre(e: FormEvent) {
    e.preventDefault();
    await appelApi("/api/v1/categories", {
      method: "POST",
      body: JSON.stringify({ nom, description: description || null }),
    });
    setAfficherFormulaire(false);
    setNom("");
    setDescription("");
    charger();
  }

  async function supprimer(id: number) {
    if (!confirm("Supprimer cette catégorie ?")) return;
    await appelApi(`/api/v1/categories/${id}`, { method: "DELETE" });
    charger();
  }

  return (
    <div>
      <h1 className="page-titre">Catégories</h1>
      <div className="actions-ligne">
        <button
          type="button"
          className="bouton bouton-primaire"
          onClick={() => setAfficherFormulaire(!afficherFormulaire)}
        >
          {afficherFormulaire ? "Annuler" : "Nouvelle catégorie"}
        </button>
      </div>
      {afficherFormulaire && (
        <form className="formulaire" onSubmit={soumettre} style={{ marginBottom: "1.5rem" }}>
          <label>
            Nom
            <input value={nom} onChange={(e) => setNom(e.target.value)} required />
          </label>
          <label>
            Description
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
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
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((c) => (
            <tr key={c.id}>
              <td>{c.nom}</td>
              <td>{c.description || "-"}</td>
              <td>
                <button type="button" className="bouton bouton-danger" onClick={() => supprimer(c.id)}>
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
