from typing import List, Optional
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from pydantic import BaseModel

from ..database import get_session
from ..models import Playlist, PlaylistItem

router = APIRouter(prefix="/playlists", tags=["playlists"])


class PlaylistItemIn(BaseModel):
    song_id: int
    momento: Optional[str] = None
    ordem: int = 0


class PlaylistCreate(BaseModel):
    nome: str
    data_evento: Optional[datetime] = None
    descricao: Optional[str] = None
    items: List[PlaylistItemIn] = []


@router.post("")
def create_playlist(payload: PlaylistCreate, session: Session = Depends(get_session)):
    playlist = Playlist(nome=payload.nome, data_evento=payload.data_evento, descricao=payload.descricao)
    session.add(playlist)
    session.commit()
    session.refresh(playlist)

    for item in payload.items:
        session.add(PlaylistItem(playlist_id=playlist.id, **item.model_dump()))
    session.commit()
    session.refresh(playlist)
    return playlist


@router.get("")
def list_playlists(session: Session = Depends(get_session)):
    return session.exec(select(Playlist)).all()


@router.get("/{playlist_id}")
def get_playlist(playlist_id: int, session: Session = Depends(get_session)):
    playlist = session.get(Playlist, playlist_id)
    if not playlist:
        raise HTTPException(status_code=404, detail="Repertório não encontrado")
    return playlist
