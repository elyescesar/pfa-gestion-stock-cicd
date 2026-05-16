import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { supprimerJeton } from "../services/api";

export default function Layout() {
  const naviguer = useNavigate();

  function deconnecter() {
    supprimerJeton();
    naviguer("/connexion");
  }

  return (
    <div className="app-layout">
      <nav className="sidebar">
        <h1>Gestion de Stock</h1>
        <NavLink to="/" end className={({ isActive }) => (isActive ? "actif" : "")}>
          Tableau de bord
        </NavLink>
        <NavLink to="/produits" className={({ isActive }) => (isActive ? "actif" : "")}>
          Produits
        </NavLink>
        <NavLink to="/categories" className={({ isActive }) => (isActive ? "actif" : "")}>
          Catégories
        </NavLink>
        <NavLink to="/mouvements" className={({ isActive }) => (isActive ? "actif" : "")}>
          Mouvements
        </NavLink>
        <NavLink to="/alertes" className={({ isActive }) => (isActive ? "actif" : "")}>
          Alertes stock
        </NavLink>
        <div className="entete-utilisateur">
          <button type="button" className="bouton bouton-secondaire" onClick={deconnecter}>
            Déconnexion
          </button>
        </div>
      </nav>
      <main className="contenu-principal">
        <Outlet />
      </main>
    </div>
  );
}
