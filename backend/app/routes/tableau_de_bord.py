from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.base_de_donnees import obtenir_session
from app.modeles.categorie import Categorie
from app.modeles.mouvement import Mouvement
from app.modeles.produit import Produit
from app.modeles.utilisateur import Utilisateur
from app.schemas.tableau_de_bord import TableauDeBordReponse
from app.securite.jwt import obtenir_utilisateur_courant

routeur = APIRouter(prefix="/tableau-de-bord", tags=["tableau-de-bord"])


@routeur.get("", response_model=TableauDeBordReponse)
def obtenir_tableau_de_bord(
    session: Session = Depends(obtenir_session),
    _: Utilisateur = Depends(obtenir_utilisateur_courant),
):
    produits_alerte = session.query(Produit).filter(Produit.quantite <= Produit.seuil_alerte).all()
    return TableauDeBordReponse(
        nombre_produits=session.query(Produit).count(),
        nombre_categories=session.query(Categorie).count(),
        nombre_mouvements=session.query(Mouvement).count(),
        produits_alerte=produits_alerte,
    )
