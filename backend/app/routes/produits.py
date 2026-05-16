from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.base_de_donnees import obtenir_session
from app.modeles.produit import Produit
from app.modeles.utilisateur import Utilisateur
from app.schemas.produit import ProduitCreate, ProduitReponse, ProduitUpdate
from app.securite.jwt import obtenir_utilisateur_courant

routeur = APIRouter(prefix="/produits", tags=["produits"])


@routeur.get("", response_model=list[ProduitReponse])
def lister_produits(
    session: Session = Depends(obtenir_session),
    _: Utilisateur = Depends(obtenir_utilisateur_courant),
):
    return session.query(Produit).order_by(Produit.nom).all()


@routeur.get("/alertes", response_model=list[ProduitReponse])
def lister_alertes(
    session: Session = Depends(obtenir_session),
    _: Utilisateur = Depends(obtenir_utilisateur_courant),
):
    return session.query(Produit).filter(Produit.quantite <= Produit.seuil_alerte).all()


@routeur.post("", response_model=ProduitReponse, status_code=201)
def creer_produit(
    donnees: ProduitCreate,
    session: Session = Depends(obtenir_session),
    _: Utilisateur = Depends(obtenir_utilisateur_courant),
):
    produit = Produit(**donnees.model_dump())
    session.add(produit)
    session.commit()
    session.refresh(produit)
    return produit


@routeur.get("/{id_produit}", response_model=ProduitReponse)
def obtenir_produit(
    id_produit: int,
    session: Session = Depends(obtenir_session),
    _: Utilisateur = Depends(obtenir_utilisateur_courant),
):
    produit = session.query(Produit).filter(Produit.id == id_produit).first()
    if produit is None:
        raise HTTPException(status_code=404, detail="produit_introuvable")
    return produit


@routeur.put("/{id_produit}", response_model=ProduitReponse)
def modifier_produit(
    id_produit: int,
    donnees: ProduitUpdate,
    session: Session = Depends(obtenir_session),
    _: Utilisateur = Depends(obtenir_utilisateur_courant),
):
    produit = session.query(Produit).filter(Produit.id == id_produit).first()
    if produit is None:
        raise HTTPException(status_code=404, detail="produit_introuvable")
    for cle, valeur in donnees.model_dump(exclude_unset=True).items():
        setattr(produit, cle, valeur)
    session.commit()
    session.refresh(produit)
    return produit


@routeur.delete("/{id_produit}", status_code=204)
def supprimer_produit(
    id_produit: int,
    session: Session = Depends(obtenir_session),
    utilisateur: Utilisateur = Depends(obtenir_utilisateur_courant),
):
    if utilisateur.role != "admin":
        raise HTTPException(status_code=403, detail="acces_refuse")
    produit = session.query(Produit).filter(Produit.id == id_produit).first()
    if produit is None:
        raise HTTPException(status_code=404, detail="produit_introuvable")
    session.delete(produit)
    session.commit()
