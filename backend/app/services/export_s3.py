import csv
import io

import boto3
from sqlalchemy.orm import Session

from app.config import parametres
from app.modeles.produit import Produit


def exporter_produits_csv(session: Session) -> str:
    produits = session.query(Produit).all()
    buffer = io.StringIO()
    ecrivain = csv.writer(buffer)
    ecrivain.writerow(["id", "nom", "reference_sku", "quantite", "seuil_alerte", "id_categorie"])
    for produit in produits:
        ecrivain.writerow(
            [
                produit.id,
                produit.nom,
                produit.reference_sku,
                produit.quantite,
                produit.seuil_alerte,
                produit.id_categorie,
            ]
        )
    contenu = buffer.getvalue()
    cle_s3 = f"exports/produits_{len(produits)}.csv"
    client_kwargs = {
        "service_name": "s3",
        "region_name": parametres.aws_default_region,
        "aws_access_key_id": parametres.aws_access_key_id,
        "aws_secret_access_key": parametres.aws_secret_access_key,
    }
    if parametres.aws_endpoint_url:
        client_kwargs["endpoint_url"] = parametres.aws_endpoint_url
    client = boto3.client(**client_kwargs)
    client.put_object(
        Bucket=parametres.s3_bucket_exports,
        Key=cle_s3,
        Body=contenu.encode("utf-8"),
        ContentType="text/csv",
    )
    return cle_s3
