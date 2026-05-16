from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.base_de_donnees import obtenir_session
from app.modeles.utilisateur import Utilisateur
from app.securite.jwt import obtenir_utilisateur_courant
from app.services.export_s3 import exporter_produits_csv

routeur = APIRouter(prefix="/exports", tags=["exports"])


@routeur.post("/produits-csv")
def exporter_produits(
    session: Session = Depends(obtenir_session),
    utilisateur: Utilisateur = Depends(obtenir_utilisateur_courant),
):
    if utilisateur.role != "admin":
        raise HTTPException(status_code=403, detail="acces_refuse")
    cle = exporter_produits_csv(session)
    return {"cle_s3": cle, "message": "export_reussi"}
