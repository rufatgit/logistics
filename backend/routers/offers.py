from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.core.deps import get_current_user, require_role
from backend.models.user import User, UserRole
from backend.models.shipment import Shipment, ShipmentStatus
from backend.models.offer import Offer, OfferStatus
from backend.models.tracking import TrackingUpdate
from backend.schemas.offer import OfferCreate, OfferRead, OfferWithCarrier

router = APIRouter(tags=["offers"])


@router.post(
    "/shipments/{shipment_id}/offers",
    response_model=OfferRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role(UserRole.CARRIER))],
)
def submit_offer(
    shipment_id: int,
    payload: OfferCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    shipment = db.get(Shipment, shipment_id)
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    if shipment.status not in (ShipmentStatus.PENDING, ShipmentStatus.QUOTED):
        raise HTTPException(
            status_code=400, detail="This shipment is no longer accepting offers"
        )

    if not current_user.carrier_profile:
        raise HTTPException(
            status_code=400, detail="Create a carrier profile before submitting offers"
        )
    if not current_user.carrier_profile.is_verified:
        raise HTTPException(
            status_code=403,
            detail="Your carrier profile must be verified before quoting",
        )

    existing = (
        db.query(Offer)
        .filter(
            Offer.shipment_id == shipment_id,
            Offer.carrier_id == current_user.carrier_profile.id,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=400, detail="You already submitted an offer for this shipment"
        )

    offer = Offer(
        shipment_id=shipment_id,
        carrier_id=current_user.carrier_profile.id,
        **payload.model_dump(),
    )
    db.add(offer)

    if shipment.status == ShipmentStatus.PENDING:
        shipment.status = ShipmentStatus.QUOTED
        db.add(
            TrackingUpdate(
                shipment_id=shipment.id,
                status=ShipmentStatus.QUOTED,
                note="First offer received",
            )
        )

    db.commit()
    db.refresh(offer)
    return offer


@router.get("/shipments/{shipment_id}/offers", response_model=list[OfferWithCarrier])
def list_offers_for_shipment(
    shipment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    shipment = db.get(Shipment, shipment_id)
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")

    is_owner = (
        current_user.role == UserRole.CUSTOMER
        and shipment.customer_id == current_user.id
    )
    is_admin = current_user.role == UserRole.ADMIN
    if not (is_owner or is_admin):
        raise HTTPException(
            status_code=403, detail="Only the shipment owner can view all offers"
        )

    return shipment.offers


@router.post("/offers/{offer_id}/accept", response_model=OfferRead)
def accept_offer(
    offer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    offer = db.get(Offer, offer_id)
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")

    shipment = offer.shipment
    if shipment.customer_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Only the shipment owner can accept an offer"
        )
    if shipment.status not in (ShipmentStatus.PENDING, ShipmentStatus.QUOTED):
        raise HTTPException(
            status_code=400, detail="This shipment already has a booked carrier"
        )

    # Accept the chosen offer, reject all others (Step 4: "Select -> Pay -> Shipment Starts")
    for o in shipment.offers:
        o.status = OfferStatus.ACCEPTED if o.id == offer.id else OfferStatus.REJECTED

    shipment.status = ShipmentStatus.BOOKED
    db.add(
        TrackingUpdate(
            shipment_id=shipment.id,
            status=ShipmentStatus.BOOKED,
            note=f"Offer #{offer.id} accepted",
        )
    )

    db.commit()
    db.refresh(offer)
    return offer
