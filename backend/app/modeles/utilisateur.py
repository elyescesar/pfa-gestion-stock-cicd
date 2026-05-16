from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.base_de_donnees import Base


class Utilisateur(Base):
    __tablename__ = "utilisateur"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    mot_de_passe_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(30), default="operateur", nullable=False)

    mouvements: Mapped[list["Mouvement"]] = relationship(back_populates="utilisateur")
