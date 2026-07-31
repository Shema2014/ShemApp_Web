import os

from sqlmodel import SQLModel, create_engine, Session

# Em produção (Supabase/Postgres), a variável DATABASE_URL vem do ambiente,
# ex: postgresql://postgres:[SENHA]@db.[PROJETO].supabase.co:5432/postgres
# Localmente, se não houver DATABASE_URL, cai no SQLite de sempre.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./catolichord.db")

# Supabase às vezes fornece a URL como "postgres://" (formato antigo);
# o SQLAlchemy exige o prefixo "postgresql://".
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, echo=False, connect_args=connect_args)


def init_db() -> None:
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
