from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.core.deps import get_current_user, require_role
from backend.models.user import User, UserRole
from backend.models.carrier import CarrierProfile
from backend.schemas.carrier import (
    CarrierProfileCreate,
    CarrierProfileUpdate,
    CarrierProfileRead,
)

router = APIRouter(prefix="/carriers", tags=["carriers"])


@router.post(
    "",
    response_model=CarrierProfileRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role(UserRole.CARRIER))],
)
def create_carrier_profile(
    payload: CarrierProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.carrier_profile:
        raise HTTPException(status_code=400, detail="Carrier profile already exists")

    profile = CarrierProfile(user_id=current_user.id, **payload.model_dump())
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


@router.get(
    "/me",
    response_model=CarrierProfileRead,
    dependencies=[Depends(require_role(UserRole.CARRIER))],
)
def read_my_carrier_profile(current_user: User = Depends(get_current_user)):
    if not current_user.carrier_profile:
        raise HTTPException(status_code=404, detail="Carrier profile not found")
    return current_user.carrier_profile


@router.patch(
    "/me",
    response_model=CarrierProfileRead,
    dependencies=[Depends(require_role(UserRole.CARRIER))],
)
def update_my_carrier_profile(
    payload: CarrierProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = current_user.carrier_profile
    if not profile:
        raise HTTPException(status_code=404, detail="Carrier profile not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)
    db.commit()
    db.refresh(profile)
    return profile


@router.patch(
    "/{carrier_id}/verify",
    response_model=CarrierProfileRead,
    dependencies=[Depends(require_role(UserRole.ADMIN))],
)
def verify_carrier(carrier_id: int, db: Session = Depends(get_db)):
    profile = db.get(CarrierProfile, carrier_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Carrier profile not found")

    profile.is_verified = True
    db.commit()
    db.refresh(profile)
    return profile


@router.get("/{carrier_id}", response_model=CarrierProfileRead)
def read_carrier_profile(carrier_id: int, db: Session = Depends(get_db)):
    profile = db.get(CarrierProfile, carrier_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Carrier profile not found")
    return profile


@router.get("", response_model=list[CarrierProfileRead])
def list_carriers(db: Session = Depends(get_db), skip: int = 0, limit: int = 50):
    return db.query(CarrierProfile).offset(skip).limit(limit).all()
