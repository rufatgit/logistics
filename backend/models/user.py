import enum
from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import String, Enum, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.database import Base

if TYPE_CHECKING:
    from backend.models.carrier import CarrierProfile
    from backend.models.shipment import Shipment


class UserRole(str, enum.Enum):
    CUSTOMER = "customer"
    CARRIER = "carrier"
    ADMIN = "admin"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)

    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole), default=UserRole.CUSTOMER, nullable=False
    )

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # A carrier user has exactly one company profile
    carrier_profile: Mapped["CarrierProfile"] = relationship(
        "CarrierProfile",
        back_populates="owner",
        uselist=False,
        cascade="all, delete-orphan",
    )

    # A customer user owns many shipments
    shipments: Mapped[list["Shipment"]] = relationship(
        "Shipment", back_populates="customer", cascade="all, delete-orphan"
    )
