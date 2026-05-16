from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.base_de_donnees import Base


class Categorie(Base):
    __tablename__ = "categorie"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    nom: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    produits: Mapped[list["Produit"]] = relationship(back_populates="categorie")
