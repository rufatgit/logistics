from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

classmethod


from backend.database import get_db
from backend.core.deps import get_current_user, require_role
from backend.models.user import User, UserRole
from backend.models.shipment import Shipment, ShipmentPhoto, ShipmentStatus
from backend.models.tracking import TrackingUpdate
from backend.schemas.shipment import ShipmentCreate, ShipmentRead, ShipmentUpdateStatus
from backend.schemas.tracking import TrackingUpdateRead

router = APIRouter(prefix="/shipments", tags=["shipments"])


def _naive_price_estimate(weight_kg: float, volume_m3: float | None) -> float:
    """
    Very rough placeholder for Step 2 ('Platform Calculates and Finds Carriers').
    Replace with a real pricing/distance engine later (e.g. routing API + rate table).
    """
    base = 150.0
    weight_component = weight_kg * 0.8
    volume_component = (volume_m3 or 0) * 40.0
    return round(base + weight_component + volume_component, 2)


@router.post(
    "",
    response_model=ShipmentRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role(UserRole.CUSTOMER))],
)
def create_shipment(
    payload: ShipmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    data = payload.model_dump(exclude={"photo_urls"})
    shipment = Shipment(
        customer_id=current_user.id,
        estimated_price=_naive_price_estimate(payload.weight_kg, payload.volume_m3),
        **data,
    )
    db.add(shipment)
    db.flush()  # get shipment.id before adding photos

    for url in payload.photo_urls:
        db.add(ShipmentPhoto(shipment_id=shipment.id, url=url))

    db.add(
        TrackingUpdate(
            shipment_id=shipment.id,
            status=ShipmentStatus.PENDING,
            note="Shipment created",
        )
    )

    db.commit()
    db.refresh(shipment)
    return shipment


@router.get("", response_model=list[ShipmentRead])
def list_shipments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    status_filter: ShipmentStatus | None = None,
    skip: int = 0,
    limit: int = 50,
):
    """
    - Customers see their own shipments.
    - Carriers see open shipments available to quote on (status=pending), so they
      can browse the marketplace (Step 3 in the product doc).
    - Admins see everything.
    """
    query = db.query(Shipment)

    if current_user.role == UserRole.CUSTOMER:
        query = query.filter(Shipment.customer_id == current_user.id)
    elif current_user.role == UserRole.CARRIER:
        query = query.filter(Shipment.status == ShipmentStatus.PENDING)
    # ADMIN: no filter — sees all

    if status_filter:
        query = query.filter(Shipment.status == status_filter)

    return query.order_by(Shipment.created_at.desc()).offset(skip).limit(limit).all()


def _get_shipment_or_404(shipment_id: int, db: Session) -> Shipment:
    shipment = db.get(Shipment, shipment_id)
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    return shipment


def _assert_can_view_shipment(shipment: Shipment, user: User):
    if user.role == UserRole.ADMIN:
        return
    if user.role == UserRole.CUSTOMER and shipment.customer_id == user.id:
        return
    if user.role == UserRole.CARRIER:
        # Carriers can view: open shipments, or ones they've already quoted on
        has_offer = any(o.carrier.user_id == user.id for o in shipment.offers)
        if shipment.status == ShipmentStatus.PENDING or has_offer:
            return
    raise HTTPException(
        status_code=403, detail="You don't have access to this shipment"
    )


@router.get("/{shipment_id}", response_model=ShipmentRead)
def get_shipment(
    shipment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    shipment = _get_shipment_or_404(shipment_id, db)
    _assert_can_view_shipment(shipment, current_user)
    return shipment


@router.get("/{shipment_id}/tracking", response_model=list[TrackingUpdateRead])
def get_shipment_tracking(
    shipment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    shipment = _get_shipment_or_404(shipment_id, db)
    _assert_can_view_shipment(shipment, current_user)
    return shipment.tracking_updates


@router.patch("/{shipment_id}/status", response_model=ShipmentRead)
def update_shipment_status(
    shipment_id: int,
    payload: ShipmentUpdateStatus,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    shipment = _get_shipment_or_404(shipment_id, db)

    is_owner_customer = (
        current_user.role == UserRole.CUSTOMER
        and shipment.customer_id == current_user.id
    )
    is_assigned_carrier = current_user.role == UserRole.CARRIER and any(
        o.carrier.user_id == current_user.id and o.status.value == "accepted"
        for o in shipment.offers
    )
    if not (
        is_owner_customer or is_assigned_carrier or current_user.role == UserRole.ADMIN
    ):
        raise HTTPException(
            status_code=403, detail="You can't update this shipment's status"
        )

    shipment.status = payload.status
    db.add(
        TrackingUpdate(
            shipment_id=shipment.id,
            status=payload.status,
            location=payload.location,
            note=payload.note,
        )
    )
    db.commit()
    db.refresh(shipment)
    return shipment
