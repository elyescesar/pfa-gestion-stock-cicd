from pydantic import BaseModel, ConfigDict, Field


class ProduitBase(BaseModel):
    nom: str
    reference_sku: str
    quantite: int = Field(ge=0)
    seuil_alerte: int = Field(ge=0, default=5)
    id_categorie: int


class ProduitCreate(ProduitBase):
    pass


class ProduitUpdate(BaseModel):
    nom: str | None = None
    reference_sku: str | None = None
    quantite: int | None = Field(default=None, ge=0)
    seuil_alerte: int | None = Field(default=None, ge=0)
    id_categorie: int | None = None


class ProduitReponse(ProduitBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
