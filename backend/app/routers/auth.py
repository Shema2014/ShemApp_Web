from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from ..auth import criar_access_token, get_current_user, hash_senha, verificar_senha
from ..database import get_session
from ..models import User
from ..schemas import TokenResponse, UserCreate, UserLogin, UserRead

router = APIRouter(prefix="/auth", tags=["auth"])


def _user_to_read(user: User) -> UserRead:
    return UserRead(
        id=user.id,
        nome=user.nome,
        email=user.email,
        funcoes=[f for f in user.funcoes.split(",") if f],
        ativo=user.ativo,
    )


@router.post("/register", response_model=TokenResponse)
def register(payload: UserCreate, session: Session = Depends(get_session)):
    existente = session.exec(select(User).where(User.email == payload.email)).first()
    if existente:
        raise HTTPException(status_code=400, detail="E-mail já cadastrado")

    user = User(
        nome=payload.nome,
        email=payload.email,
        senha_hash=hash_senha(payload.senha),
        funcoes=",".join(payload.funcoes),
    )
    session.add(user)
    session.commit()
    session.refresh(user)

    token = criar_access_token(user.id)
    return TokenResponse(access_token=token, user=_user_to_read(user))


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == payload.email)).first()
    if not user or not verificar_senha(payload.senha, user.senha_hash):
        raise HTTPException(status_code=401, detail="E-mail ou senha inválidos")

    token = criar_access_token(user.id)
    return TokenResponse(access_token=token, user=_user_to_read(user))


@router.get("/me", response_model=UserRead)
def me(current_user: User = Depends(get_current_user)):
    return _user_to_read(current_user)
