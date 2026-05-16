from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.modeles.mouvement import Mouvement
from app.modeles.produit import Produit
from app.schemas.mouvement import MouvementCreate


def calculer_quantite_apres_mouvement(quantite_actuelle: int, type_mouvement: str, quantite: int) -> int:
    if type_mouvement == "entree":
        return quantite_actuelle + quantite
    return quantite_actuelle - quantite


def creer_mouvement(session: Session, donnees: MouvementCreate, id_utilisateur: int) -> Mouvement:
    produit = session.query(Produit).filter(Produit.id == donnees.id_produit).first()
    if produit is None:
        raise HTTPException(status_code=404, detail="produit_introuvable")
    nouvelle_quantite = calculer_quantite_apres_mouvement(
        produit.quantite, donnees.type_mouvement, donnees.quantite
    )
    if nouvelle_quantite < 0:
        raise HTTPException(status_code=400, detail="stock_insuffisant")
    mouvement = Mouvement(
        type_mouvement=donnees.type_mouvement,
        quantite=donnees.quantite,
        motif=donnees.motif,
        id_produit=donnees.id_produit,
        id_utilisateur=id_utilisateur,
    )
    produit.quantite = nouvelle_quantite
    session.add(mouvement)
    session.commit()
    session.refresh(mouvement)
    return mouvement
