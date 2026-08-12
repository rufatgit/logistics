from datetime import datetime

from pydantic import BaseModel, EmailStr, ConfigDict

from backend.models.user import UserRole


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: str | None = None


class UserCreate(UserBase):
    password: str
    role: UserRole = UserRole.CUSTOMER


class UserUpdate(BaseModel):
    full_name: str | None = None
    phone: str | None = None


class UserRead(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    role: UserRole
    is_active: bool
    is_verified: bool
    created_at: datetime
