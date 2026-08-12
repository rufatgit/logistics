from datetime import datetime, date

from pydantic import BaseModel, ConfigDict, Field

from backend.models.shipment import ShipmentStatus


class ShipmentPhotoRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    url: str


class ShipmentBase(BaseModel):
    pickup_location: str
    pickup_lat: float | None = None
    pickup_lng: float | None = None

    delivery_location: str
    delivery_lat: float | None = None
    delivery_lng: float | None = None

    cargo_type: str
    weight_kg: float = Field(gt=0)
    volume_m3: float | None = Field(default=None, gt=0)
    dimensions: str | None = None

    pickup_date: date
    special_requirements: str | None = None


class ShipmentCreate(ShipmentBase):
    photo_urls: list[str] = []


class ShipmentUpdateStatus(BaseModel):
    status: ShipmentStatus
    location: str | None = None
    note: str | None = None


class ShipmentRead(ShipmentBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    customer_id: int
    status: ShipmentStatus
    estimated_price: float | None
    created_at: datetime
    photos: list[ShipmentPhotoRead] = []
