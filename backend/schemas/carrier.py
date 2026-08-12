from datetime import datetime

from pydantic import BaseModel, ConfigDict

from backend.schemas.user import UserRead


class CarrierProfileBase(BaseModel):
    company_name: str
    description: str | None = None
    vat_number: str | None = None


class CarrierProfileCreate(CarrierProfileBase):
    pass


class CarrierProfileUpdate(BaseModel):
    company_name: str | None = None
    description: str | None = None
    vat_number: str | None = None


class CarrierProfileRead(CarrierProfileBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    is_verified: bool
    rating_avg: float
    rating_count: int
    created_at: datetime


class CarrierProfileWithOwner(CarrierProfileRead):
    owner: UserRead
