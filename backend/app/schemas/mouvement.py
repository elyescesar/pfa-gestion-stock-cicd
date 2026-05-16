from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class MouvementCreate(BaseModel):
    type_mouvement: str = Field(pattern="^(entree|sortie)$")
    quantite: int = Field(gt=0)
    motif: str | None = None
    id_produit: int


class MouvementReponse(BaseModel):
    id: int
    type_mouvement: str
    quantite: int
    motif: str | None
    date_mouvement: datetime
    id_produit: int
    id_utilisateur: int
    model_config = ConfigDict(from_attributes=True)
