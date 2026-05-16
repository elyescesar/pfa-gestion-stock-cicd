import os

os.environ["MODE_TEST"] = "1"

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.base_de_donnees import Base, obtenir_session
from app.main import application
from app.modeles.categorie import Categorie
from app.modeles.produit import Produit
from app.modeles.utilisateur import Utilisateur
from app.securite.mots_de_passe import hasher_mot_de_passe

moteur_test = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
SessionTest = sessionmaker(autocommit=False, autoflush=False, bind=moteur_test)


def peupler_base(session):
    admin = Utilisateur(
        email="admin@stock.tn",
        mot_de_passe_hash=hasher_mot_de_passe("Admin123!"),
        role="admin",
    )
    session.add(admin)
    session.flush()
    cat = Categorie(nom="Test", description="Cat test")
    session.add(cat)
    session.flush()
    session.add(
        Produit(
            nom="Produit test",
            reference_sku="SKU-002",
            quantite=8,
            seuil_alerte=10,
            id_categorie=cat.id,
        )
    )
    session.commit()


@pytest.fixture()
def client():
    Base.metadata.drop_all(bind=moteur_test)
    Base.metadata.create_all(bind=moteur_test)
    session = SessionTest()
    peupler_base(session)

    def remplacer_session():
        try:
            yield session
        finally:
            pass

    application.dependency_overrides[obtenir_session] = remplacer_session
    with TestClient(application) as client_test:
        yield client_test
    application.dependency_overrides.clear()
    Base.metadata.drop_all(bind=moteur_test)


@pytest.fixture()
def jeton_admin(client):
    reponse = client.post(
        "/api/v1/auth/connexion",
        json={"email": "admin@stock.tn", "mot_de_passe": "Admin123!"},
    )
    return reponse.json()["jeton_acces"]
