from __future__ import annotations

import os
from collections.abc import Generator
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy import DateTime, String, create_engine, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, sessionmaker

load_dotenv()


def normalize_database_url(url: str) -> str:
    if url.startswith("postgres://"):
        return f"postgresql+psycopg://{url.removeprefix('postgres://')}"
    if url.startswith("postgresql://"):
        return f"postgresql+psycopg://{url.removeprefix('postgresql://')}"
    return url


DATABASE_URL = normalize_database_url(
    os.getenv(
        "POSTGRES_DATABASE_URL",
        "postgresql+psycopg://postgres:postgres@localhost:5432/jungle_mvp",
    )
)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


class Customer(Base):
    __tablename__ = "customers"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )


class CustomerCreate(BaseModel):
    name: str
    email: str


class CustomerRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    created_at: datetime


class CustomerUpdate(BaseModel):
    name: str | None = None
    email: str | None = None


def get_db() -> Generator[Session]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_customer_or_404(customer_id: int, db: Session) -> Customer:
    customer = db.get(Customer, customer_id)
    if customer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found.",
        )

    return customer


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="PostgreSQL ORM MVP", lifespan=lifespan)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


# C(Create): 새 customer를 DB에 생성합니다.
@app.post(
    "/customers",
    response_model=CustomerRead,
    status_code=status.HTTP_201_CREATED,
)
def create_customer(
    payload: CustomerCreate,
    db: Session = Depends(get_db),
) -> Customer:
    customer = Customer(
        name=payload.name.strip(),
        email=payload.email.strip().lower(),
    )

    try:
        db.add(customer)
        db.commit()
        db.refresh(customer)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Customer email already exists.",
        )

    return customer


# R(Read): customer 목록을 DB에서 조회합니다.
@app.get("/customers", response_model=list[CustomerRead])
def list_customers(
    limit: int = 20,
    db: Session = Depends(get_db),
) -> list[Customer]:
    safe_limit = max(1, min(limit, 100))
    return list(
        db.scalars(
            select(Customer)
            .order_by(Customer.created_at.desc())
            .limit(safe_limit)
        )
    )


# R(Read): customer 한 명을 DB에서 조회합니다.
@app.get("/customers/{customer_id}", response_model=CustomerRead)
def get_customer(
    customer_id: int,
    db: Session = Depends(get_db),
) -> Customer:
    return get_customer_or_404(customer_id, db)


# U(Update): 기존 customer 정보를 DB에서 수정합니다.
@app.patch("/customers/{customer_id}", response_model=CustomerRead)
def update_customer(
    customer_id: int,
    payload: CustomerUpdate,
    db: Session = Depends(get_db),
) -> Customer:
    customer = get_customer_or_404(customer_id, db)

    if payload.name is not None:
        customer.name = payload.name.strip()
    if payload.email is not None:
        customer.email = payload.email.strip().lower()

    try:
        db.commit()
        db.refresh(customer)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Customer email already exists.",
        )

    return customer


# D(Delete): 기존 customer를 DB에서 삭제합니다.
@app.delete("/customers/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(
    customer_id: int,
    db: Session = Depends(get_db),
) -> None:
    customer = get_customer_or_404(customer_id, db)
    db.delete(customer)
    db.commit()
