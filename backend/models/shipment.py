import enum
from datetime import datetime, date, timezone

from sqlalchemy import String, Float, DateTime, Date, ForeignKey, Text, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.database import Base

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from backend.models.shipment import Shipment
    from backend.models.user import User
    from backend.models.offer import Offer
    from backend.models.tracking import TrackingUpdate


class ShipmentStatus(str, enum.Enum):
    PENDING = "pending"  # created, waiting for offers
    QUOTED = "quoted"  # has at least one offer
    BOOKED = "booked"  # customer accepted an offer
    IN_TRANSIT = "in_transit"  # carrier picked up cargo
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class Shipment(Base):
    __tablename__ = "shipments"

    id: Mapped[int] = mapped_column(primary_key=True)
    customer_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)

    # Route
    pickup_location: Mapped[str] = mapped_column(String(255), nullable=False)
    pickup_lat: Mapped[float | None] = mapped_column(Float, nullable=True)
    pickup_lng: Mapped[float | None] = mapped_column(Float, nullable=True)

    delivery_location: Mapped[str] = mapped_column(String(255), nullable=False)
    delivery_lat: Mapped[float | None] = mapped_column(Float, nullable=True)
    delivery_lng: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Cargo details
    cargo_type: Mapped[str] = mapped_column(String(255), nullable=False)
    weight_kg: Mapped[float] = mapped_column(Float, nullable=False)
    volume_m3: Mapped[float | None] = mapped_column(Float, nullable=True)
    dimensions: Mapped[str | None] = mapped_column(
        String(255), nullable=True
    )  # e.g. "120x80x100 cm"

    pickup_date: Mapped[date] = mapped_column(Date, nullable=False)
    special_requirements: Mapped[str | None] = mapped_column(Text, nullable=True)

    status: Mapped[ShipmentStatus] = mapped_column(
        Enum(ShipmentStatus), default=ShipmentStatus.PENDING, nullable=False
    )

    # System-estimated price (Step 2 in the product doc), separate from carrier offers
    estimated_price: Mapped[float | None] = mapped_column(Float, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    customer: Mapped["User"] = relationship("User", back_populates="shipments")
    photos: Mapped[list["ShipmentPhoto"]] = relationship(
        "ShipmentPhoto", back_populates="shipment", cascade="all, delete-orphan"
    )
    offers: Mapped[list["Offer"]] = relationship(
        "Offer", back_populates="shipment", cascade="all, delete-orphan"
    )
    tracking_updates: Mapped[list["TrackingUpdate"]] = relationship(
        "TrackingUpdate",
        back_populates="shipment",
        cascade="all, delete-orphan",
        order_by="TrackingUpdate.created_at",
    )


class ShipmentPhoto(Base):
    __tablename__ = "shipment_photos"

    id: Mapped[int] = mapped_column(primary_key=True)
    shipment_id: Mapped[int] = mapped_column(ForeignKey("shipments.id"), nullable=False)
    url: Mapped[str] = mapped_column(String(500), nullable=False)

    shipment: Mapped["Shipment"] = relationship("Shipment", back_populates="photos")
