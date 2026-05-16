from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.base_de_donnees import obtenir_session
from app.config import parametres
from app.modeles.utilisateur import Utilisateur

schema_bearer = HTTPBearer()


def creer_jeton_acces(donnees: dict) -> str:
    expiration = datetime.now(timezone.utc) + timedelta(minutes=parametres.duree_token_minutes)
    charge = donnees.copy()
    charge.update({"exp": expiration})
    return jwt.encode(charge, parametres.secret_jwt, algorithm=parametres.algorithme_jwt)


def obtenir_utilisateur_courant(
    identifiants: HTTPAuthorizationCredentials = Depends(schema_bearer),
    session: Session = Depends(obtenir_session),
) -> Utilisateur:
    jeton = identifiants.credentials
    exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="jeton_invalide")
    try:
        charge = jwt.decode(jeton, parametres.secret_jwt, algorithms=[parametres.algorithme_jwt])
        email: str | None = charge.get("sub")
        if email is None:
            raise exception
    except JWTError:
        raise exception from None
    utilisateur = session.query(Utilisateur).filter(Utilisateur.email == email).first()
    if utilisateur is None:
        raise exception
    return utilisateur
