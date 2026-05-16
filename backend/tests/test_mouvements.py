def test_sortie_stock_insuffisant(client, jeton_admin):
    entetes = {"Authorization": f"Bearer {jeton_admin}"}
    produits = client.get("/api/v1/produits", headers=entetes).json()
    produit = next(p for p in produits if p["reference_sku"] == "SKU-002")
    reponse = client.post(
        "/api/v1/mouvements",
        headers=entetes,
        json={
            "type_mouvement": "sortie",
            "quantite": 999,
            "motif": "test",
            "id_produit": produit["id"],
        },
    )
    assert reponse.status_code == 400
    assert reponse.json()["detail"] == "stock_insuffisant"


def test_entree_mouvement(client, jeton_admin):
    entetes = {"Authorization": f"Bearer {jeton_admin}"}
    produits = client.get("/api/v1/produits", headers=entetes).json()
    produit = produits[0]
    reponse = client.post(
        "/api/v1/mouvements",
        headers=entetes,
        json={
            "type_mouvement": "entree",
            "quantite": 3,
            "motif": "reappro",
            "id_produit": produit["id"],
        },
    )
    assert reponse.status_code == 201
