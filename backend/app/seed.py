from sqlalchemy.orm import Session

from app.base_de_donnees import SessionLocale
from app.modeles.categorie import Categorie
from app.modeles.produit import Produit
from app.modeles.utilisateur import Utilisateur
from app.securite.mots_de_passe import hasher_mot_de_passe


def initialiser_donnees():
    session: Session = SessionLocale()
    try:
        if session.query(Utilisateur).filter(Utilisateur.email == "admin@stock.tn").first():
            return
        admin = Utilisateur(
            email="admin@stock.tn",
            mot_de_passe_hash=hasher_mot_de_passe("Admin123!"),
            role="admin",
        )
        operateur = Utilisateur(
            email="operateur@stock.tn",
            mot_de_passe_hash=hasher_mot_de_passe("Operateur123!"),
            role="operateur",
        )
        session.add_all([admin, operateur])
        session.flush()
        cat_electronique = Categorie(nom="Électronique", description="Composants et appareils")
        cat_bureau = Categorie(nom="Bureau", description="Fournitures de bureau")
        session.add_all([cat_electronique, cat_bureau])
        session.flush()
        session.add_all(
            [
                Produit(
                    nom="Souris sans fil",
                    reference_sku="SKU-001",
                    quantite=50,
                    seuil_alerte=10,
                    id_categorie=cat_electronique.id,
                ),
                Produit(
                    nom="Clavier mécanique",
                    reference_sku="SKU-002",
                    quantite=8,
                    seuil_alerte=10,
                    id_categorie=cat_electronique.id,
                ),
                Produit(
                    nom="Cahier A4",
                    reference_sku="SKU-003",
                    quantite=120,
                    seuil_alerte=20,
                    id_categorie=cat_bureau.id,
                ),
            ]
        )
        session.commit()
    finally:
        session.close()
