import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { appelApi, definirJeton } from "../services/api";

export default function PageConnexion() {
  const naviguer = useNavigate();
  const [email, setEmail] = useState("admin@stock.tn");
  const [motDePasse, setMotDePasse] = useState("Admin123!");
  const [erreur, setErreur] = useState("");

  async function soumettre(e: FormEvent) {
    e.preventDefault();
    setErreur("");
    try {
      const reponse = await appelApi<{ jeton_acces: string }>("/api/v1/auth/connexion", {
        method: "POST",
        body: JSON.stringify({ email, mot_de_passe: motDePasse }),
      });
      definirJeton(reponse.jeton_acces);
      naviguer("/");
    } catch {
      setErreur("Identifiants invalides");
    }
  }

  return (
    <div className="page-connexion">
      <form className="formulaire" onSubmit={soumettre}>
        <h1 className="page-titre">Connexion</h1>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Mot de passe
          <input
            type="password"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            required
          />
        </label>
        {erreur && <p className="message-erreur">{erreur}</p>}
        <button type="submit" className="bouton bouton-primaire">
          Se connecter
        </button>
      </form>
    </div>
  );
}
