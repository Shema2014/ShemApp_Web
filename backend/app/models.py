from datetime import datetime
from typing import Optional, List

from sqlmodel import SQLModel, Field, Relationship

# Funções possíveis dentro do ministério (lista de referência para o frontend)
FUNCOES_MINISTERIO = [
    "Vocal", "Violão", "Guitarra", "Baixo", "Teclado",
    "Bateria", "Percussão", "Sopros", "Som",
]


class SongTag(SQLModel, table=True):
    """Tag genérica de música: tempo litúrgico, tipo de celebração, momento da missa ou tema.
    Usar 'categoria' como um dos: tempo_liturgico | tipo_celebracao | momento_missa | tema
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    song_id: int = Field(foreign_key="song.id")
    categoria: str
    valor: str

    song: Optional["Song"] = Relationship(back_populates="tags")


class Song(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    titulo: str = Field(index=True)
    autor: Optional[str] = None
    tom_original: str = "C"
    capotraste: int = 0
    bpm: Optional[int] = None
    compasso: Optional[str] = "4/4"
    introducao: Optional[str] = None
    finalizacao: Optional[str] = None
    # cifra em texto com acordes entre colchetes, ex: "[C]Vem, ó [G]Espírito de [Am]Deus"
    cifra: str = ""
    observacoes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    tags: List[SongTag] = Relationship(back_populates="song")


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nome: str
    email: str = Field(unique=True, index=True)
    senha_hash: str
    funcoes: str = ""  # funções separadas por vírgula, ex: "Violão,Vocal"
    ativo: bool = True
    criado_em: datetime = Field(default_factory=datetime.utcnow)


class Celebracao(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    titulo: str  # ex: "Missa Domingo 19h"
    tipo_celebracao: Optional[str] = None  # Missa, Casamento, Batizado...
    data_hora: datetime
    local: Optional[str] = None
    observacoes: Optional[str] = None
    playlist_id: Optional[int] = Field(default=None, foreign_key="playlist.id")
    criado_em: datetime = Field(default_factory=datetime.utcnow)

    escala: List["EscalaItem"] = Relationship(back_populates="celebracao")


class EscalaItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    celebracao_id: int = Field(foreign_key="celebracao.id")
    user_id: int = Field(foreign_key="user.id")
    funcao: str  # Vocal, Violão, Guitarra, Baixo, Teclado, Bateria, Percussão, Sopros, Som
    status: str = "pendente"  # pendente | confirmado | recusado
    criado_em: datetime = Field(default_factory=datetime.utcnow)

    celebracao: Optional[Celebracao] = Relationship(back_populates="escala")


class PlaylistItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    playlist_id: int = Field(foreign_key="playlist.id")
    song_id: int = Field(foreign_key="song.id")
    momento: Optional[str] = None  # ex: "Entrada", "Ofertório"
    ordem: int = 0

    playlist: Optional["Playlist"] = Relationship(back_populates="items")


class Playlist(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nome: str
    data_evento: Optional[datetime] = None
    descricao: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    items: List[PlaylistItem] = Relationship(back_populates="playlist")
