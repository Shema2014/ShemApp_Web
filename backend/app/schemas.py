from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class SongTagRead(BaseModel):
    categoria: str
    valor: str


class SongCreate(BaseModel):
    titulo: str
    autor: Optional[str] = None
    tom_original: str = "C"
    capotraste: int = 0
    bpm: Optional[int] = None
    compasso: Optional[str] = "4/4"
    introducao: Optional[str] = None
    finalizacao: Optional[str] = None
    cifra: str = ""
    observacoes: Optional[str] = None
    tags: List[SongTagRead] = []


class SongRead(BaseModel):
    id: int
    titulo: str
    autor: Optional[str]
    tom_original: str
    capotraste: int
    bpm: Optional[int]
    compasso: Optional[str]
    introducao: Optional[str]
    finalizacao: Optional[str]
    cifra: str
    observacoes: Optional[str]
    created_at: datetime
    tags: List[SongTagRead] = []

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    nome: str
    email: str
    senha: str
    funcoes: List[str] = []


class UserLogin(BaseModel):
    email: str
    senha: str


class UserRead(BaseModel):
    id: int
    nome: str
    email: str
    funcoes: List[str] = []
    ativo: bool

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead


class EscalaItemCreate(BaseModel):
    user_id: int
    funcao: str


class EscalaItemRead(BaseModel):
    id: int
    user_id: int
    nome_usuario: str
    funcao: str
    status: str

    class Config:
        from_attributes = True


class CelebracaoCreate(BaseModel):
    titulo: str
    tipo_celebracao: Optional[str] = None
    data_hora: datetime
    local: Optional[str] = None
    observacoes: Optional[str] = None
    playlist_id: Optional[int] = None
    escala: List[EscalaItemCreate] = []


class CelebracaoRead(BaseModel):
    id: int
    titulo: str
    tipo_celebracao: Optional[str]
    data_hora: datetime
    local: Optional[str]
    observacoes: Optional[str]
    playlist_id: Optional[int]
    escala: List[EscalaItemRead] = []

    class Config:
        from_attributes = True


class TransposeRequest(BaseModel):
    cifra: str
    semitons: int  # positivo = sobe, negativo = desce


class TransposeResponse(BaseModel):
    cifra_transposta: str
