from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from backend.models.offer import OfferStatus
from backend.schemas.carrier import CarrierProfileRead


class OfferBase(BaseModel):
    price: float = Field(gt=0)
    delivery_days: int = Field(gt=0)
    truck_type: str
    insurance_included: bool = False
    message: str | None = None


class OfferCreate(OfferBase):
    pass


class OfferRead(OfferBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    shipment_id: int
    carrier_id: int
    status: OfferStatus
    created_at: datetime


class OfferWithCarrier(OfferRead):
    carrier: CarrierProfileRead
