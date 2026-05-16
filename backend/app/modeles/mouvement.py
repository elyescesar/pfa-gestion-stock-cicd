from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.base_de_donnees import Base


class Mouvement(Base):
    __tablename__ = "mouvement"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    type_mouvement: Mapped[str] = mapped_column(String(20), nullable=False)
    quantite: Mapped[int] = mapped_column(Integer, nullable=False)
    motif: Mapped[str | None] = mapped_column(Text, nullable=True)
    date_mouvement: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    id_produit: Mapped[int] = mapped_column(ForeignKey("produit.id"), nullable=False)
    id_utilisateur: Mapped[int] = mapped_column(ForeignKey("utilisateur.id"), nullable=False)

    produit: Mapped["Produit"] = relationship(back_populates="mouvements")
    utilisateur: Mapped["Utilisateur"] = relationship(back_populates="mouvements")
