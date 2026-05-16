import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./contexte/AuthContext";
import Layout from "./composants/Layout";
import Chargeur from "./composants/ui/Chargeur";
import PageAlertes from "./pages/PageAlertes";
import PageCategories from "./pages/PageCategories";
import PageConnexion from "./pages/PageConnexion";
import PageMouvements from "./pages/PageMouvements";
import PageProduits from "./pages/PageProduits";
import PageTableauDeBord from "./pages/PageTableauDeBord";

function RoutesProtegees() {
  const { utilisateur, chargement } = useAuth();

  if (chargement) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Chargeur texte="Vérification de la session..." />
      </div>
    );
  }

  if (!utilisateur) {
    return <Navigate to="/connexion" replace />;
  }

  return <Layout />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/connexion" element={<PageConnexion />} />
      <Route element={<RoutesProtegees />}>
        <Route index element={<PageTableauDeBord />} />
        <Route path="produits" element={<PageProduits />} />
        <Route path="categories" element={<PageCategories />} />
        <Route path="mouvements" element={<PageMouvements />} />
        <Route path="alertes" element={<PageAlertes />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
