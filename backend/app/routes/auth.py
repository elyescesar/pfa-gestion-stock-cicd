from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.base_de_donnees import obtenir_session
from app.modeles.utilisateur import Utilisateur
from app.schemas.auth import ConnexionRequete, TokenReponse, UtilisateurReponse
from app.securite.jwt import creer_jeton_acces, obtenir_utilisateur_courant
from app.securite.mots_de_passe import verifier_mot_de_passe

routeur = APIRouter(prefix="/auth", tags=["auth"])


@routeur.post("/connexion", response_model=TokenReponse)
def connexion(donnees: ConnexionRequete, session: Session = Depends(obtenir_session)):
    utilisateur = session.query(Utilisateur).filter(Utilisateur.email == donnees.email).first()
    if utilisateur is None or not verifier_mot_de_passe(donnees.mot_de_passe, utilisateur.mot_de_passe_hash):
        raise HTTPException(status_code=401, detail="identifiants_invalides")
    jeton = creer_jeton_acces({"sub": utilisateur.email, "role": utilisateur.role})
    return TokenReponse(jeton_acces=jeton)


@routeur.get("/moi", response_model=UtilisateurReponse)
def moi(utilisateur: Utilisateur = Depends(obtenir_utilisateur_courant)):
    return UtilisateurReponse(id=utilisateur.id, email=utilisateur.email, role=utilisateur.role)
