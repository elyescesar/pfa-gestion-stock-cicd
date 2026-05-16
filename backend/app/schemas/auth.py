from pydantic import BaseModel, EmailStr


class ConnexionRequete(BaseModel):
    email: EmailStr
    mot_de_passe: str


class TokenReponse(BaseModel):
    jeton_acces: str
    type_jeton: str = "bearer"


class UtilisateurReponse(BaseModel):
    id: int
    email: str
    role: str
