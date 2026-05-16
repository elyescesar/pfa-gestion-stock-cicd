import { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Boxes, Mail, Lock, ArrowRight } from "lucide-react";
import { useAuth } from "../contexte/AuthContext";
import { useToast } from "../contexte/ToastContext";
import Bouton from "../composants/ui/Bouton";
import { Champ, Input } from "../composants/ui/Champ";

export default function PageConnexion() {
  const naviguer = useNavigate();
  const { connexion, utilisateur, chargement: verifSession } = useAuth();
  const { afficherToast } = useToast();
  const [email, setEmail] = useState("admin@stock.tn");
  const [motDePasse, setMotDePasse] = useState("Admin123!");
  const [soumission, setSoumission] = useState(false);

  async function soumettre(e: FormEvent) {
    e.preventDefault();
    setSoumission(true);
    try {
      await connexion(email, motDePasse);
      afficherToast("Connexion réussie", "succes");
      naviguer("/");
    } catch {
      afficherToast("Identifiants invalides", "erreur");
    } finally {
      setSoumission(false);
    }
  }

  if (verifSession) return null;
  if (utilisateur) return <Navigate to="/" replace />;

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 border-r border-slate-800/50 bg-gradient-to-br from-cyan-950/40 via-slate-950 to-violet-950/30">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500 shadow-lg shadow-cyan-500/40">
            <Boxes className="h-6 w-6 text-slate-950" />
          </div>
          <span className="text-xl font-bold text-white">StockFlow</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold leading-tight text-white">
            Pilotez votre inventaire
            <span className="block text-cyan-400">en temps réel</span>
          </h1>
          <p className="mt-4 max-w-md text-slate-400 leading-relaxed">
            Suivi des stocks, mouvements, alertes et tableaux de bord — une interface moderne pour
            votre PFA.
          </p>
        </div>
        <p className="text-xs text-slate-600">PFA — Gestion de stock · DevOps local</p>
      </div>

      <div className="flex flex-1 items-center justify-center p-6">
        <form
          onSubmit={soumettre}
          className="w-full max-w-md space-y-6 rounded-2xl border border-slate-800/50 bg-slate-900/50 p-8 shadow-2xl backdrop-blur-sm animate-fade-in"
        >
          <div className="lg:hidden flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500">
              <Boxes className="h-5 w-5 text-slate-950" />
            </div>
            <span className="font-bold text-white">StockFlow</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Connexion</h2>
            <p className="mt-1 text-sm text-slate-400">Accédez à votre espace de gestion</p>
          </div>
          <Champ label="Email">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                type="email"
                className="pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </Champ>
          <Champ label="Mot de passe">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                type="password"
                className="pl-10"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                required
              />
            </div>
          </Champ>
          <Bouton type="submit" chargement={soumission} className="w-full">
            Se connecter
            <ArrowRight className="h-4 w-4" />
          </Bouton>
        </form>
      </div>
    </div>
  );
}
