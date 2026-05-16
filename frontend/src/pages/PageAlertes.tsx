import { Link } from "react-router-dom";
import { AlertTriangle, Package } from "lucide-react";
import { useFetch } from "../hooks/useFetch";
import { Produit } from "../services/api";
import EntetePage from "../composants/ui/EntetePage";
import Badge from "../composants/ui/Badge";
import Chargeur from "../composants/ui/Chargeur";
import EtatVide from "../composants/ui/EtatVide";

export default function PageAlertes() {
  const { donnees: produits, chargement } = useFetch<Produit[]>("/api/v1/produits/alertes");

  if (chargement) return <Chargeur texte="Analyse des stocks..." />;

  return (
    <div className="space-y-6">
      <EntetePage
        titre="Alertes stock"
        description={
          produits?.length
            ? `${produits.length} produit(s) sous le seuil minimum`
            : "Tous les niveaux sont satisfaisants"
        }
      />

      {!produits?.length ? (
        <EtatVide
          icone={Package}
          titre="Aucune alerte"
          description="Tous les produits respectent le seuil d'alerte configuré."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {produits.map((p, i) => {
            const pct = Math.min(100, Math.round((p.quantite / Math.max(p.seuil_alerte, 1)) * 100));
            return (
              <article
                key={p.id}
                className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-red-500/5 p-5 animate-fade-in"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-amber-500/20 p-3 text-amber-400">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">{p.nom}</h3>
                    <p className="text-xs font-mono text-slate-500 mt-0.5">{p.reference_sku}</p>
                    <div className="mt-4 flex items-center justify-between gap-2">
                      <Badge variante="alerte">
                        {p.quantite} / {p.seuil_alerte}
                      </Badge>
                      <span className="text-xs text-amber-400/80">{pct}% du seuil</span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-red-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {produits && produits.length > 0 && (
        <p className="text-center text-sm text-slate-500">
          <Link to="/mouvements" className="text-cyan-400 hover:text-cyan-300">
            Enregistrer une entrée de stock →
          </Link>
        </p>
      )}
    </div>
  );
}
