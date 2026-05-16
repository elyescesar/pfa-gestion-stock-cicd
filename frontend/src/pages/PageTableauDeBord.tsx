import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Package, FolderOpen, ArrowLeftRight, AlertTriangle, TrendingUp } from "lucide-react";
import { useFetch } from "../hooks/useFetch";
import { TableauDeBord } from "../services/api";
import CarteStat from "../composants/ui/CarteStat";
import Chargeur from "../composants/ui/Chargeur";
import EntetePage from "../composants/ui/EntetePage";
import Badge from "../composants/ui/Badge";
import EtatVide from "../composants/ui/EtatVide";

export default function PageTableauDeBord() {
  const { donnees, chargement } = useFetch<TableauDeBord>("/api/v1/tableau-de-bord");

  const maxQuantite = useMemo(() => {
    if (!donnees?.produits_alerte.length) return 1;
    return Math.max(...donnees.produits_alerte.map((p) => p.seuil_alerte), 1);
  }, [donnees]);

  if (chargement || !donnees) return <Chargeur texte="Chargement du tableau de bord..." />;

  return (
    <div className="space-y-8">
      <EntetePage
        titre="Tableau de bord"
        description="Vue d'ensemble de votre inventaire"
        actions={
          <Link
            to="/mouvements"
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500/15 px-4 py-2 text-sm font-medium text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25 transition-colors"
          >
            <TrendingUp className="h-4 w-4" />
            Nouveau mouvement
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CarteStat titre="Produits" valeur={donnees.nombre_produits} icone={Package} variante="cyan" />
        <CarteStat titre="Catégories" valeur={donnees.nombre_categories} icone={FolderOpen} variante="violet" />
        <CarteStat
          titre="Mouvements"
          valeur={donnees.nombre_mouvements}
          icone={ArrowLeftRight}
          variante="emerald"
        />
        <CarteStat
          titre="Alertes actives"
          valeur={donnees.produits_alerte.length}
          icone={AlertTriangle}
          variante="amber"
          tendance={donnees.produits_alerte.length > 0 ? "Action requise" : "Tout est OK"}
        />
      </div>

      <div className="rounded-2xl border border-slate-800/50 bg-slate-900/40 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-800/50 px-6 py-4">
          <h2 className="font-semibold text-white">Produits sous le seuil d'alerte</h2>
          {donnees.produits_alerte.length > 0 && (
            <Link to="/alertes" className="text-sm text-cyan-400 hover:text-cyan-300">
              Voir tout →
            </Link>
          )}
        </div>
        {donnees.produits_alerte.length === 0 ? (
          <EtatVide
            icone={Package}
            titre="Aucune alerte"
            description="Tous les produits sont au-dessus du seuil minimum."
          />
        ) : (
          <div className="divide-y divide-slate-800/50">
            {donnees.produits_alerte.map((p) => (
              <div
                key={p.id}
                className="flex flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between hover:bg-slate-800/20 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-white truncate">{p.nom}</p>
                  <p className="text-xs text-slate-500 font-mono">{p.reference_sku}</p>
                </div>
                <div className="flex items-center gap-4 sm:w-64">
                  <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-red-500 transition-all duration-500"
                      style={{ width: `${Math.min(100, (p.quantite / maxQuantite) * 100)}%` }}
                    />
                  </div>
                  <Badge variante="alerte">
                    {p.quantite} / {p.seuil_alerte}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
