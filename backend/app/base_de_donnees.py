from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import parametres

moteur = create_engine(parametres.database_url, pool_pre_ping=True)
SessionLocale = sessionmaker(autocommit=False, autoflush=False, bind=moteur)


class Base(DeclarativeBase):
    pass


def obtenir_session():
    session = SessionLocale()
    try:
        yield session
    finally:
        session.close()
