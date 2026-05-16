import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator

from app.base_de_donnees import Base, moteur
from app.config import parametres
from app.routes import auth, categories, exports, mouvements, produits, tableau_de_bord
from app.seed import initialiser_donnees


@asynccontextmanager
async def cycle_vie(application: FastAPI):
    if os.environ.get("MODE_TEST") != "1":
        Base.metadata.create_all(bind=moteur)
        initialiser_donnees()
    yield


application = FastAPI(title="PFA Gestion de Stock", version="1.0.0", lifespan=cycle_vie)

origines = [o.strip() for o in parametres.cors_origins.split(",") if o.strip()]
application.add_middleware(
    CORSMiddleware,
    allow_origins=origines,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

prefixe = "/api/v1"
application.include_router(auth.routeur, prefix=prefixe)
application.include_router(categories.routeur, prefix=prefixe)
application.include_router(produits.routeur, prefix=prefixe)
application.include_router(mouvements.routeur, prefix=prefixe)
application.include_router(tableau_de_bord.routeur, prefix=prefixe)
application.include_router(exports.routeur, prefix=prefixe)

Instrumentator().instrument(application).expose(application, endpoint="/metrics")


@application.get("/health")
def sante():
    return {"statut": "ok"}
