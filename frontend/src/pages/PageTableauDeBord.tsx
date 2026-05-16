import { useEffect, useState } from "react";
import { appelApi, TableauDeBord } from "../services/api";

export default function PageTableauDeBord() {
  const [donnees, setDonnees] = useState<TableauDeBord | null>(null);

  useEffect(() => {
    appelApi<TableauDeBord>("/api/v1/tableau-de-bord").then(setDonnees);
  }, []);

  if (!donnees) {
    return <p>Chargement...</p>;
  }

  return (
    <div>
      <h1 className="page-titre">Tableau de bord</h1>
      <div className="cartes-grille">
        <div className="carte">
          <h3>Produits</h3>
          <div className="valeur">{donnees.nombre_produits}</div>
        </div>
        <div className="carte">
          <h3>Catégories</h3>
          <div className="valeur">{donnees.nombre_categories}</div>
        </div>
        <div className="carte">
          <h3>Mouvements</h3>
          <div className="valeur">{donnees.nombre_mouvements}</div>
        </div>
        <div className="carte">
          <h3>Alertes stock</h3>
          <div className="valeur">{donnees.produits_alerte.length}</div>
        </div>
      </div>
      {donnees.produits_alerte.length > 0 && (
        <>
          <h2 style={{ marginBottom: "1rem" }}>Produits sous le seuil</h2>
          <table className="tableau">
            <thead>
              <tr>
                <th>Nom</th>
                <th>SKU</th>
                <th>Quantité</th>
                <th>Seuil</th>
              </tr>
            </thead>
            <tbody>
              {donnees.produits_alerte.map((p) => (
                <tr key={p.id}>
                  <td>{p.nom}</td>
                  <td>{p.reference_sku}</td>
                  <td>
                    <span className="badge-alerte">{p.quantite}</span>
                  </td>
                  <td>{p.seuil_alerte}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
