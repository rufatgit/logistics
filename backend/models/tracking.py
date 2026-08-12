from datetime import datetime, timezone

from sqlalchemy import String, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.database import Base
from backend.models.shipment import ShipmentStatus

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from backend.models.shipment import Shipment


class TrackingUpdate(Base):
    """
    An append-only history of status changes for a shipment, e.g.
    'booked' -> 'in_transit' -> 'delivered'. Powers the customer-facing
    tracking timeline.
    """

    __tablename__ = "tracking_updates"

    id: Mapped[int] = mapped_column(primary_key=True)
    shipment_id: Mapped[int] = mapped_column(ForeignKey("shipments.id"), nullable=False)

    status: Mapped[ShipmentStatus] = mapped_column(Enum(ShipmentStatus), nullable=False)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    shipment: Mapped["Shipment"] = relationship(
        "Shipment", back_populates="tracking_updates"
    )
