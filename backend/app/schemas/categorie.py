from pydantic import BaseModel, ConfigDict


class CategorieBase(BaseModel):
    nom: str
    description: str | None = None


class CategorieCreate(CategorieBase):
    pass


class CategorieUpdate(BaseModel):
    nom: str | None = None
    description: str | None = None


class CategorieReponse(CategorieBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
