from datetime import datetime, timezone

from sqlalchemy import String, Boolean, DateTime, ForeignKey, Float, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.database import Base

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from backend.models.user import User
    from backend.models.offer import Offer


class CarrierProfile(Base):
    __tablename__ = "carrier_profiles"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"), unique=True, nullable=False
    )

    company_name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    vat_number: Mapped[str | None] = mapped_column(String(50), nullable=True)

    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)

    # Denormalized rating fields, recalculated whenever a review is added
    rating_avg: Mapped[float] = mapped_column(Float, default=0.0)
    rating_count: Mapped[int] = mapped_column(Integer, default=0)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    owner: Mapped["User"] = relationship("User", back_populates="carrier_profile")
    offers: Mapped[list["Offer"]] = relationship(
        "Offer", back_populates="carrier", cascade="all, delete-orphan"
    )
