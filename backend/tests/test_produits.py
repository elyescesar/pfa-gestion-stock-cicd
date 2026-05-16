def test_connexion_et_liste_produits(client, jeton_admin):
    entetes = {"Authorization": f"Bearer {jeton_admin}"}
    reponse = client.get("/api/v1/produits", headers=entetes)
    assert reponse.status_code == 200
    assert len(reponse.json()) >= 1


def test_creer_produit(client, jeton_admin):
    entetes = {"Authorization": f"Bearer {jeton_admin}"}
    categories = client.get("/api/v1/categories", headers=entetes).json()
    id_categorie = categories[0]["id"]
    reponse = client.post(
        "/api/v1/produits",
        headers=entetes,
        json={
            "nom": "Test Produit",
            "reference_sku": "SKU-TEST-99",
            "quantite": 5,
            "seuil_alerte": 2,
            "id_categorie": id_categorie,
        },
    )
    assert reponse.status_code == 201
    assert reponse.json()["nom"] == "Test Produit"
