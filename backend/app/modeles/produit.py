from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.base_de_donnees import Base

if TYPE_CHECKING:
    from app.modeles.categorie import Categorie
    from app.modeles.mouvement import Mouvement


class Produit(Base):
    __tablename__ = "produit"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    nom: Mapped[str] = mapped_column(String(200), nullable=False)
    reference_sku: Mapped[str] = mapped_column(String(80), unique=True, nullable=False)
    quantite: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    seuil_alerte: Mapped[int] = mapped_column(Integer, default=5, nullable=False)
    id_categorie: Mapped[int] = mapped_column(ForeignKey("categorie.id"), nullable=False)

    categorie: Mapped[Categorie] = relationship(back_populates="produits")
    mouvements: Mapped[list[Mouvement]] = relationship(back_populates="produit")
