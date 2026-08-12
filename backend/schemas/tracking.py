from datetime import datetime

from pydantic import BaseModel, ConfigDict

from backend.models.shipment import ShipmentStatus


class TrackingUpdateRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    status: ShipmentStatus
    location: str | None
    note: str | None
    created_at: datetime
