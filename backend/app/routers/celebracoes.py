from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from ..auth import get_current_user
from ..database import get_session
from ..models import Celebracao, EscalaItem, User
from ..schemas import CelebracaoCreate, CelebracaoRead, EscalaItemCreate, EscalaItemRead

router = APIRouter(prefix="/celebracoes", tags=["celebracoes"])


def _escala_to_read(item: EscalaItem, session: Session) -> EscalaItemRead:
    user = session.get(User, item.user_id)
    return EscalaItemRead(
        id=item.id,
        user_id=item.user_id,
        nome_usuario=user.nome if user else "?",
        funcao=item.funcao,
        status=item.status,
    )


def _celebracao_to_read(cel: Celebracao, session: Session) -> CelebracaoRead:
    return CelebracaoRead(
        id=cel.id,
        titulo=cel.titulo,
        tipo_celebracao=cel.tipo_celebracao,
        data_hora=cel.data_hora,
        local=cel.local,
        observacoes=cel.observacoes,
        playlist_id=cel.playlist_id,
        escala=[_escala_to_read(i, session) for i in cel.escala],
    )


@router.post("", response_model=CelebracaoRead)
def create_celebracao(
    payload: CelebracaoCreate,
    session: Session = Depends(get_session),
    _: User = Depends(get_current_user),
):
    cel = Celebracao(
        titulo=payload.titulo,
        tipo_celebracao=payload.tipo_celebracao,
        data_hora=payload.data_hora,
        local=payload.local,
        observacoes=payload.observacoes,
        playlist_id=payload.playlist_id,
    )
    session.add(cel)
    session.commit()
    session.refresh(cel)

    for item in payload.escala:
        session.add(EscalaItem(celebracao_id=cel.id, user_id=item.user_id, funcao=item.funcao))
    session.commit()
    session.refresh(cel)
    return _celebracao_to_read(cel, session)


@router.get("", response_model=List[CelebracaoRead])
def list_celebracoes(
    session: Session = Depends(get_session),
    _: User = Depends(get_current_user),
    somente_futuras: bool = True,
):
    query = select(Celebracao).order_by(Celebracao.data_hora)
    if somente_futuras:
        query = query.where(Celebracao.data_hora >= datetime.utcnow())
    celebracoes = session.exec(query).all()
    return [_celebracao_to_read(c, session) for c in celebracoes]


@router.get("/{celebracao_id}", response_model=CelebracaoRead)
def get_celebracao(
    celebracao_id: int,
    session: Session = Depends(get_session),
    _: User = Depends(get_current_user),
):
    cel = session.get(Celebracao, celebracao_id)
    if not cel:
        raise HTTPException(status_code=404, detail="Celebração não encontrada")
    return _celebracao_to_read(cel, session)


@router.post("/{celebracao_id}/escala", response_model=EscalaItemRead)
def add_escala_item(
    celebracao_id: int,
    payload: EscalaItemCreate,
    session: Session = Depends(get_session),
    _: User = Depends(get_current_user),
):
    cel = session.get(Celebracao, celebracao_id)
    if not cel:
        raise HTTPException(status_code=404, detail="Celebração não encontrada")
    item = EscalaItem(celebracao_id=celebracao_id, user_id=payload.user_id, funcao=payload.funcao)
    session.add(item)
    session.commit()
    session.refresh(item)
    return _escala_to_read(item, session)


@router.patch("/{celebracao_id}/escala/{item_id}", response_model=EscalaItemRead)
def atualizar_status_escala(
    celebracao_id: int,
    item_id: int,
    status: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if status not in ("pendente", "confirmado", "recusado"):
        raise HTTPException(status_code=400, detail="Status inválido")

    item = session.get(EscalaItem, item_id)
    if not item or item.celebracao_id != celebracao_id:
        raise HTTPException(status_code=404, detail="Item de escala não encontrado")

    # Só o próprio músico escalado pode confirmar/recusar sua presença.
    if item.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Você só pode confirmar sua própria presença")

    item.status = status
    session.add(item)
    session.commit()
    session.refresh(item)
    return _escala_to_read(item, session)


@router.delete("/{celebracao_id}/escala/{item_id}", status_code=204)
def remover_escala_item(
    celebracao_id: int,
    item_id: int,
    session: Session = Depends(get_session),
    _: User = Depends(get_current_user),
):
    item = session.get(EscalaItem, item_id)
    if not item or item.celebracao_id != celebracao_id:
        raise HTTPException(status_code=404, detail="Item de escala não encontrado")
    session.delete(item)
    session.commit()
