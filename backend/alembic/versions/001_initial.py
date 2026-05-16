from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "categorie",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("nom", sa.String(length=120), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("nom"),
    )
    op.create_table(
        "utilisateur",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("mot_de_passe_hash", sa.String(length=255), nullable=False),
        sa.Column("role", sa.String(length=30), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )
    op.create_table(
        "produit",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("nom", sa.String(length=200), nullable=False),
        sa.Column("reference_sku", sa.String(length=80), nullable=False),
        sa.Column("quantite", sa.Integer(), nullable=False),
        sa.Column("seuil_alerte", sa.Integer(), nullable=False),
        sa.Column("id_categorie", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["id_categorie"], ["categorie.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("reference_sku"),
    )
    op.create_table(
        "mouvement",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("type_mouvement", sa.String(length=20), nullable=False),
        sa.Column("quantite", sa.Integer(), nullable=False),
        sa.Column("motif", sa.Text(), nullable=True),
        sa.Column("date_mouvement", sa.DateTime(), nullable=False),
        sa.Column("id_produit", sa.Integer(), nullable=False),
        sa.Column("id_utilisateur", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["id_produit"], ["produit.id"]),
        sa.ForeignKeyConstraint(["id_utilisateur"], ["utilisateur.id"]),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("mouvement")
    op.drop_table("produit")
    op.drop_table("utilisateur")
    op.drop_table("categorie")
