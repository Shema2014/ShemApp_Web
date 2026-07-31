from typing import List

from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from ..auth import get_current_user
from ..database import get_session
from ..models import User, FUNCOES_MINISTERIO
from ..schemas import UserRead
from .auth import _user_to_read

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=List[UserRead])
def list_users(
    session: Session = Depends(get_session),
    _: User = Depends(get_current_user),
):
    """Lista os integrantes do ministério (protegido — precisa estar logado)."""
    users = session.exec(select(User).where(User.ativo == True)).all()  # noqa: E712
    return [_user_to_read(u) for u in users]


@router.get("/funcoes")
def list_funcoes():
    return FUNCOES_MINISTERIO
