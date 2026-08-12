import enum
from datetime import datetime, timezone

from sqlalchemy import String, Float, Integer, Boolean, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.database import Base

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from backend.models.carrier import CarrierProfile
    from backend.models.shipment import Shipment


class OfferStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"


class Offer(Base):
    __tablename__ = "offers"

    id: Mapped[int] = mapped_column(primary_key=True)
    shipment_id: Mapped[int] = mapped_column(ForeignKey("shipments.id"), nullable=False)
    carrier_id: Mapped[int] = mapped_column(
        ForeignKey("carrier_profiles.id"), nullable=False
    )

    price: Mapped[float] = mapped_column(Float, nullable=False)
    delivery_days: Mapped[int] = mapped_column(Integer, nullable=False)
    truck_type: Mapped[str] = mapped_column(String(100), nullable=False)
    insurance_included: Mapped[bool] = mapped_column(Boolean, default=False)
    message: Mapped[str | None] = mapped_column(Text, nullable=True)

    status: Mapped[OfferStatus] = mapped_column(
        Enum(OfferStatus), default=OfferStatus.PENDING, nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    shipment: Mapped["Shipment"] = relationship("Shipment", back_populates="offers")
    carrier: Mapped["CarrierProfile"] = relationship(
        "CarrierProfile", back_populates="offers"
    )
