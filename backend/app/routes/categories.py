from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.base_de_donnees import obtenir_session
from app.modeles.categorie import Categorie
from app.modeles.utilisateur import Utilisateur
from app.schemas.categorie import CategorieCreate, CategorieReponse, CategorieUpdate
from app.securite.jwt import obtenir_utilisateur_courant

routeur = APIRouter(prefix="/categories", tags=["categories"])


@routeur.get("", response_model=list[CategorieReponse])
def lister_categories(
    session: Session = Depends(obtenir_session),
    _: Utilisateur = Depends(obtenir_utilisateur_courant),
):
    return session.query(Categorie).order_by(Categorie.nom).all()


@routeur.post("", response_model=CategorieReponse, status_code=201)
def creer_categorie(
    donnees: CategorieCreate,
    session: Session = Depends(obtenir_session),
    _: Utilisateur = Depends(obtenir_utilisateur_courant),
):
    categorie = Categorie(**donnees.model_dump())
    session.add(categorie)
    session.commit()
    session.refresh(categorie)
    return categorie


@routeur.get("/{id_categorie}", response_model=CategorieReponse)
def obtenir_categorie(
    id_categorie: int,
    session: Session = Depends(obtenir_session),
    _: Utilisateur = Depends(obtenir_utilisateur_courant),
):
    categorie = session.query(Categorie).filter(Categorie.id == id_categorie).first()
    if categorie is None:
        raise HTTPException(status_code=404, detail="categorie_introuvable")
    return categorie


@routeur.put("/{id_categorie}", response_model=CategorieReponse)
def modifier_categorie(
    id_categorie: int,
    donnees: CategorieUpdate,
    session: Session = Depends(obtenir_session),
    _: Utilisateur = Depends(obtenir_utilisateur_courant),
):
    categorie = session.query(Categorie).filter(Categorie.id == id_categorie).first()
    if categorie is None:
        raise HTTPException(status_code=404, detail="categorie_introuvable")
    for cle, valeur in donnees.model_dump(exclude_unset=True).items():
        setattr(categorie, cle, valeur)
    session.commit()
    session.refresh(categorie)
    return categorie


@routeur.delete("/{id_categorie}", status_code=204)
def supprimer_categorie(
    id_categorie: int,
    session: Session = Depends(obtenir_session),
    utilisateur: Utilisateur = Depends(obtenir_utilisateur_courant),
):
    if utilisateur.role != "admin":
        raise HTTPException(status_code=403, detail="acces_refuse")
    categorie = session.query(Categorie).filter(Categorie.id == id_categorie).first()
    if categorie is None:
        raise HTTPException(status_code=404, detail="categorie_introuvable")
    session.delete(categorie)
    session.commit()
