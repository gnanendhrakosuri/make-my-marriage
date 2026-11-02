import pytest
from app.services.email import generate_invitation_html, generate_reminder_html, send_invitation_email


def test_generate_invitation_html():
    html = generate_invitation_html(
        guest_name="Lord Montgomery",
        couple_names=["Sophia", "Julian"],
        wedding_title="A Venetian Celebration",
        wedding_date="October 24, 2026",
        venue_name="Villa San Giacomo, Amalfi Coast",
        invite_url="http://localhost:3000/w/sophia-julian/invite/test_token_123",
    )

    assert "Lord Montgomery" in html
    assert "Sophia &amp; Julian" in html or "Sophia & Julian" in html
    assert "Villa San Giacomo" in html
    assert "http://localhost:3000/w/sophia-julian/invite/test_token_123" in html
    assert "Make My Marriage" in html
    assert "#4A121A" in html  # Brand burgundy
    assert "#C5A059" in html  # Brand gold


def test_generate_reminder_html():
    html = generate_reminder_html(
        guest_name="Lady Victoria",
        couple_names=["Elena", "Marcus"],
        wedding_title="Château Renaissance Gala",
        reminder_type="rsvp_reminder",
        message_text="Kindly confirm your soirée attendance.",
        invite_url="http://localhost:3000/w/elena-marcus/invite/rem_token_456",
    )

    assert "Lady Victoria" in html
    assert "Kindly confirm your soirée attendance." in html
    assert "http://localhost:3000/w/elena-marcus/invite/rem_token_456" in html
    assert "A Friendly Reminder" in html


@pytest.mark.asyncio
async def test_send_invitation_email_emulation(monkeypatch):
    from app.core.config import settings
    # Test emulation mode when key is absent
    monkeypatch.setattr(settings, "resend_api_key", "")
    result = await send_invitation_email(
        recipient_email="guest.test@example.com",
        guest_name="Test Guest",
        couple_names=["Aria", "Leo"],
        wedding_title="Grand Tuscan Union",
        wedding_date="December 12, 2026",
        venue_name="Borgo Santo Pietro",
        invite_url="http://localhost:3000/w/aria-leo/invite/token_999",
    )

    assert result["success"] is True
    assert result["status"] == "sent"
    assert "providerMessageId" in result
    assert result["providerMessageId"] is not None


@pytest.mark.asyncio
async def test_send_invitation_email_resend_delivered():
    # Test with Resend's official deliverable test address
    result = await send_invitation_email(
        recipient_email="delivered@resend.dev",
        guest_name="Test Guest",
        couple_names=["Aria", "Leo"],
        wedding_title="Grand Tuscan Union",
        wedding_date="December 12, 2026",
        venue_name="Borgo Santo Pietro",
        invite_url="http://localhost:3000/w/aria-leo/invite/token_999",
    )

    assert result["success"] is True
    assert result["status"] == "sent"
    assert result["providerMessageId"] is not None
