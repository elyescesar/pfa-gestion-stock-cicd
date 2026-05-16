from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.base_de_donnees import obtenir_session
from app.modeles.mouvement import Mouvement
from app.modeles.utilisateur import Utilisateur
from app.schemas.mouvement import MouvementCreate, MouvementReponse
from app.securite.jwt import obtenir_utilisateur_courant
from app.services.gestion_stock import creer_mouvement

routeur = APIRouter(prefix="/mouvements", tags=["mouvements"])


@routeur.get("", response_model=list[MouvementReponse])
def lister_mouvements(
    session: Session = Depends(obtenir_session),
    _: Utilisateur = Depends(obtenir_utilisateur_courant),
):
    return session.query(Mouvement).order_by(Mouvement.date_mouvement.desc()).all()


@routeur.post("", response_model=MouvementReponse, status_code=201)
def enregistrer_mouvement(
    donnees: MouvementCreate,
    session: Session = Depends(obtenir_session),
    utilisateur: Utilisateur = Depends(obtenir_utilisateur_courant),
):
    return creer_mouvement(session, donnees, utilisateur.id)
