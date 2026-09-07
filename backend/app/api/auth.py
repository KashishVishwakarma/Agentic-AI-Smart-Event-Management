from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.dependencies import get_current_user
from app.models.entities import User
from app.schemas.contracts import UserRegisterReq, UserLoginReq, UserRes, TokenRes

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.post("/register", response_model=UserRes, status_code=status.HTTP_201_CREATED)
async def register(req: UserRegisterReq, db: AsyncSession = Depends(get_db)):
    existing = (await db.execute(select(User).where(User.email == req.email))).scalars().first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    user = User(
        name=req.name,
        email=req.email,
        password_hash=get_password_hash(req.password),
        role=req.role or "USER"
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

@router.post("/login", response_model=TokenRes)
async def login(req: UserLoginReq, db: AsyncSession = Depends(get_db)):
    user = (await db.execute(select(User).where(User.email == req.email))).scalars().first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(subject=str(user.id), role=user.role)
    return TokenRes(access_token=token, token_type="bearer", user=user)

@router.get("/me", response_model=UserRes)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
