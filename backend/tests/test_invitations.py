import pytest
from app.api.v1.invitations import hash_token
from app.schemas.guest import GuestCreate
from app.schemas.invitation import (
    InvitationCreateRequest,
    ReminderRequest,
)


def test_hash_token_consistency():
    token = "a" * 64
    h1 = hash_token(token)
    h2 = hash_token(token)
    assert h1 == h2
    assert len(h1) == 64
    assert h1 != token


def test_guest_create_validation():
    valid = GuestCreate(name="Duchess of Sussex", email="guest@royal.co.uk", phone="+44123456789", role="manager")
    assert valid.name == "Duchess of Sussex"
    assert valid.email == "guest@royal.co.uk"
    assert valid.role == "manager"

    default_role = GuestCreate(name="Duke of Hastings", email="duke@hastings.co.uk")
    assert default_role.role == "guest"

    with pytest.raises(Exception):
        GuestCreate(name="", email="guest@royal.co.uk")

    with pytest.raises(Exception):
        GuestCreate(name="Valid Name", email="not-an-email")

    with pytest.raises(Exception):
        GuestCreate(name="Invalid Role", email="role@test.com", role="superadmin")


def test_guest_update_validation():
    from app.schemas.guest import GuestUpdate

    upd = GuestUpdate(phone="+1234567890", role="admin")
    assert upd.phone == "+1234567890"
    assert upd.role == "admin"

    with pytest.raises(Exception):
        GuestUpdate(role="invalid_role")


def test_invitation_schemas():
    req = InvitationCreateRequest(guestId="guest_12345")
    assert req.guestId == "guest_12345"

    rem = ReminderRequest(guestIds=["g1", "g2"], type="rsvp_reminder")
    assert len(rem.guestIds) == 2
    assert rem.type == "rsvp_reminder"

