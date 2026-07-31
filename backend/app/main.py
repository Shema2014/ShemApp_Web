import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from .database import init_db
from .routers import songs, playlists, auth, users, celebracoes

app = FastAPI(
    title="Catolichord+ API",
    description="Plataforma para ministérios de música católicos",
    version="0.1.0",
)

# Em produção, defina ALLOWED_ORIGINS como a URL do frontend publicado,
# ex: "https://catolichord-plus.vercel.app". Aceita várias, separadas por vírgula.
# Sem essa variável, libera geral — só recomendado em desenvolvimento local.
_origins_env = os.getenv("ALLOWED_ORIGINS")
allow_origins = [o.strip() for o in _origins_env.split(",")] if _origins_env else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(songs.router)
app.include_router(playlists.router)
app.include_router(celebracoes.router)


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/")
def root():
    return {"status": "ok", "app": "Catolichord+"}
