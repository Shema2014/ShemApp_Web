from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select

from ..database import get_session
from ..models import Song, SongTag
from ..schemas import SongCreate, SongRead, SongUpdate, TransposeRequest, TransposeResponse
from ..transpose import transpose_cifra

router = APIRouter(prefix="/songs", tags=["songs"])


@router.post("", response_model=SongRead)
def create_song(payload: SongCreate, session: Session = Depends(get_session)):
    song = Song(**payload.model_dump(exclude={"tags"}))
    session.add(song)
    session.commit()
    session.refresh(song)

    for tag in payload.tags:
        session.add(SongTag(song_id=song.id, categoria=tag.categoria, valor=tag.valor))
    session.commit()
    session.refresh(song)
    return song


@router.get("", response_model=List[SongRead])
def list_songs(
    session: Session = Depends(get_session),
    busca: Optional[str] = Query(None, description="Busca por título, autor ou trecho da letra"),
    tempo_liturgico: Optional[str] = None,
    tipo_celebracao: Optional[str] = None,
    momento_missa: Optional[str] = None,
    tema: Optional[str] = None,
):
    query = select(Song)
    if busca:
        like = f"%{busca}%"
        query = query.where(
            (Song.titulo.ilike(like)) | (Song.autor.ilike(like)) | (Song.cifra.ilike(like))
        )
    songs = session.exec(query).all()

    def has_tag(song: Song, categoria: str, valor: str) -> bool:
        return any(t.categoria == categoria and t.valor == valor for t in song.tags)

    if tempo_liturgico:
        songs = [s for s in songs if has_tag(s, "tempo_liturgico", tempo_liturgico)]
    if tipo_celebracao:
        songs = [s for s in songs if has_tag(s, "tipo_celebracao", tipo_celebracao)]
    if momento_missa:
        songs = [s for s in songs if has_tag(s, "momento_missa", momento_missa)]
    if tema:
        songs = [s for s in songs if has_tag(s, "tema", tema)]

    return songs


@router.get("/{song_id}", response_model=SongRead)
def get_song(song_id: int, session: Session = Depends(get_session)):
    song = session.get(Song, song_id)
    if not song:
        raise HTTPException(status_code=404, detail="Música não encontrada")
    return song


@router.patch("/{song_id}", response_model=SongRead)
def update_song(song_id: int, payload: SongUpdate, session: Session = Depends(get_session)):
    song = session.get(Song, song_id)
    if not song:
        raise HTTPException(status_code=404, detail="Música não encontrada")

    updates = payload.model_dump(exclude={"tags"}, exclude_unset=True)
    for field, value in updates.items():
        setattr(song, field, value)
    session.add(song)

    if payload.tags is not None:
        for tag in song.tags:
            session.delete(tag)
        session.commit()
        for tag in payload.tags:
            session.add(SongTag(song_id=song_id, categoria=tag.categoria, valor=tag.valor))

    session.commit()
    session.refresh(song)
    return song


@router.delete("/{song_id}", status_code=204)
def delete_song(song_id: int, session: Session = Depends(get_session)):
    song = session.get(Song, song_id)
    if not song:
        raise HTTPException(status_code=404, detail="Música não encontrada")
    for tag in song.tags:
        session.delete(tag)
    session.delete(song)
    session.commit()


@router.post("/transpose", response_model=TransposeResponse)
def transpose(payload: TransposeRequest):
    return TransposeResponse(cifra_transposta=transpose_cifra(payload.cifra, payload.semitons))
