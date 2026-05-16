import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./composants/Layout";
import PageAlertes from "./pages/PageAlertes";
import PageCategories from "./pages/PageCategories";
import PageConnexion from "./pages/PageConnexion";
import PageMouvements from "./pages/PageMouvements";
import PageProduits from "./pages/PageProduits";
import PageTableauDeBord from "./pages/PageTableauDeBord";

function RouteProtegee({ children }: { children: React.ReactNode }) {
  const jeton = sessionStorage.getItem("jeton_acces");
  if (!jeton) {
    return <Navigate to="/connexion" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/connexion" element={<PageConnexion />} />
      <Route
        element={
          <RouteProtegee>
            <Layout />
          </RouteProtegee>
        }
      >
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
