from pydantic import BaseModel

from app.schemas.produit import ProduitReponse


class TableauDeBordReponse(BaseModel):
    nombre_produits: int
    nombre_categories: int
    nombre_mouvements: int
    produits_alerte: list[ProduitReponse]
