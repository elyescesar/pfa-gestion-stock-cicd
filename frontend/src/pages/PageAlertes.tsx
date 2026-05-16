import { useEffect, useState } from "react";
import { appelApi, Produit } from "../services/api";

export default function PageAlertes() {
  const [produits, setProduits] = useState<Produit[]>([]);

  useEffect(() => {
    appelApi<Produit[]>("/api/v1/produits/alertes").then(setProduits);
  }, []);

  return (
    <div>
      <h1 className="page-titre">Alertes stock</h1>
      {produits.length === 0 ? (
        <p>Aucune alerte pour le moment.</p>
      ) : (
        <table className="tableau">
          <thead>
            <tr>
              <th>Nom</th>
              <th>SKU</th>
              <th>Quantité</th>
              <th>Seuil alerte</th>
            </tr>
          </thead>
          <tbody>
            {produits.map((p) => (
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
      )}
    </div>
  );
}
