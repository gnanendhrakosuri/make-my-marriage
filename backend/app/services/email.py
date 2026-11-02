from typing import Any, Dict, Optional
import os
import logging
from datetime import datetime, timezone
import resend

from app.core.config import settings

logger = logging.getLogger("app.services.email")


def generate_invitation_html(
    guest_name: str,
    couple_names: list[str],
    wedding_title: str,
    wedding_date: Optional[str],
    venue_name: Optional[str],
    invite_url: str,
) -> str:
    """
    Renders a responsive, haute atelier branded HTML wedding invitation email.
    Uses inline CSS adhering strictly to Make My Marriage design tokens
    (#C5A059 gold, #4A121A burgundy, ivory surface).
    """
    couple_str = " & ".join(couple_names) if couple_names else "Our Wedding"
    formatted_date = wedding_date if wedding_date else "A Special Commemoration"
    venue_str = venue_name if venue_name else "A Private Destination Sanctuary"

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitation to {couple_str}'s Wedding</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF7F2; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E1A18; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #FAF7F2; width: 100%; margin: 0; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Container Card -->
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; background-color: #FFFDF9; border: 1px solid #E5D5B8; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(74, 18, 26, 0.06);">
          
          <!-- Top Decorative Brand Bar -->
          <tr>
            <td style="background: linear-gradient(135deg, #4A121A 0%, #6B1D27 100%); padding: 36px 30px; text-align: center;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center">
                    <div style="width: 50px; height: 50px; border-radius: 50%; border: 1px solid rgba(197, 160, 89, 0.6); background-color: rgba(255, 255, 255, 0.08); display: inline-block; line-height: 50px; text-align: center; margin-bottom: 12px;">
                      <span style="font-family: 'Playfair Display', Georgia, serif; font-size: 20px; font-weight: 700; color: #C5A059; font-style: italic;">M</span>
                    </div>
                    <div style="font-family: 'Cinzel', Georgia, serif; font-size: 13px; font-weight: 600; letter-spacing: 0.24em; color: #E5C378; text-transform: uppercase;">Make My Marriage</div>
                    <div style="font-size: 9px; letter-spacing: 0.3em; color: #FFFDF9; text-transform: uppercase; margin-top: 4px; opacity: 0.85;">Haute Atelier Matrimonial</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Letterhead & Couple Headline -->
          <tr>
            <td style="padding: 44px 36px 20px 36px; text-align: center;">
              <div style="display: inline-block; padding: 5px 16px; border-radius: 30px; background-color: #F7F3EB; border: 1px solid #E5D5B8; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #745b1a; font-weight: 600; margin-bottom: 24px;">
                Wedding Invitation
              </div>
              <h1 style="margin: 0 0 12px 0; font-family: 'Playfair Display', Georgia, serif; font-size: 32px; font-weight: 600; line-height: 1.25; color: #1E1A18; letter-spacing: -0.02em;">
                {couple_str}
              </h1>
              <div style="font-family: 'Cinzel', Georgia, serif; font-size: 14px; color: #756D67; letter-spacing: 0.1em; text-transform: uppercase;">
                {wedding_title}
              </div>
            </td>
          </tr>

          <!-- Gold Divider -->
          <tr>
            <td align="center" style="padding: 0 36px;">
              <div style="width: 80px; height: 1px; background: linear-gradient(90deg, transparent, #C5A059, transparent);"></div>
            </td>
          </tr>

          <!-- Greeting Body -->
          <tr>
            <td style="padding: 28px 36px 24px 36px; text-align: center;">
              <p style="font-size: 16px; line-height: 1.6; color: #1E1A18; margin: 0 0 16px 0;">
                Dear <strong>{guest_name}</strong>,
              </p>
              <p style="font-size: 15px; line-height: 1.7; color: #574F4A; margin: 0 0 24px 0;">
                Together with our families, we joyfully request the pleasure of your company as we celebrate our marriage and exchange our vows of union.
              </p>
              
              <!-- Commemorative Details Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #FAF7F2; border: 1px solid #EAE3D2; border-radius: 14px; margin: 0 auto 30px auto;">
                <tr>
                  <td style="padding: 20px 24px; text-align: center;">
                    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.18em; color: #C5A059; font-weight: 700; margin-bottom: 6px;">
                      Celebration Date & Destination
                    </div>
                    <div style="font-family: 'Playfair Display', Georgia, serif; font-size: 18px; font-weight: 600; color: #4A121A; margin-bottom: 4px;">
                      {formatted_date}
                    </div>
                    <div style="font-size: 13px; color: #756D67;">
                      {venue_str}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Call to Action Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                <tr>
                  <td align="center" style="border-radius: 50px; background: linear-gradient(135deg, #4A121A 0%, #6B1D27 100%); box-shadow: 0 4px 14px rgba(74, 18, 26, 0.25);">
                    <a href="{invite_url}" target="_blank" style="display: inline-block; padding: 15px 38px; font-size: 13px; font-weight: 700; color: #FFFDF9; text-decoration: none; text-transform: uppercase; letter-spacing: 0.14em; border-radius: 50px; border: 1px solid rgba(229, 195, 120, 0.4);">
                      View Invitation & RSVP
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size: 12px; color: #9E968F; margin: 28px 0 0 0; line-height: 1.5;">
                Or copy and paste this link into your browser:<br>
                <a href="{invite_url}" style="color: #4A121A; word-break: break-all; text-decoration: underline;">{invite_url}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 36px 36px 36px; background-color: #FAF7F2; border-top: 1px solid #EAE3D2; text-align: center;">
              <p style="font-size: 11px; color: #9E968F; margin: 0; line-height: 1.6;">
                This invitation was created exclusively for you via <strong>Make My Marriage</strong> Haute Atelier.<br>
                Please do not forward this bespoke link, as it allows direct access to manage your private RSVP.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


def generate_reminder_html(
    guest_name: str,
    couple_names: list[str],
    wedding_title: str,
    reminder_type: str,
    message_text: Optional[str],
    invite_url: str,
    event_name: Optional[str] = None,
) -> str:
    """
    Renders a responsive HTML reminder email for RSVP or upcoming celebration.
    """
    couple_str = " & ".join(couple_names) if couple_names else "Our Wedding"
    if reminder_type == "event_reminder":
        headline = f"Upcoming Event: {event_name}" if event_name else "Upcoming Wedding Event & Schedule"
        default_msg = (
            f"We are eagerly looking forward to celebrating the {event_name or 'celebration'} with you! "
            "Please view the portal below for itinerary details, location address, and schedule timings."
        )
    else:
        headline = "A Friendly Reminder"
        default_msg = (
            "We are finalizing our arrangements and would be honored to know if you can celebrate with us. "
            "Please take a brief moment to confirm your attendance."
        )
    body_text = message_text if message_text else default_msg

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{headline} — {couple_str}'s Wedding</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF7F2; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E1A18;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #FAF7F2; width: 100%; margin: 0; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; background-color: #FFFDF9; border: 1px solid #E5D5B8; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(74, 18, 26, 0.06);">
          <tr>
            <td style="background: linear-gradient(135deg, #4A121A 0%, #6B1D27 100%); padding: 30px; text-align: center;">
              <div style="font-family: 'Cinzel', Georgia, serif; font-size: 13px; font-weight: 600; letter-spacing: 0.24em; color: #E5C378; text-transform: uppercase;">Make My Marriage</div>
            </td>
          </tr>
          <tr>
            <td style="padding: 36px 36px 24px 36px; text-align: center;">
              <div style="display: inline-block; padding: 4px 14px; border-radius: 30px; background-color: #F7F3EB; border: 1px solid #E5D5B8; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #745b1a; font-weight: 600; margin-bottom: 20px;">
                {headline}
              </div>
              <h2 style="margin: 0 0 12px 0; font-family: 'Playfair Display', Georgia, serif; font-size: 26px; color: #1E1A18;">
                {couple_str}
              </h2>
              <p style="font-size: 15px; line-height: 1.7; color: #574F4A; margin: 16px 0 24px 0;">
                Dear {guest_name},<br><br>
                {body_text}
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                <tr>
                  <td align="center" style="border-radius: 50px; background: linear-gradient(135deg, #4A121A 0%, #6B1D27 100%);">
                    <a href="{invite_url}" target="_blank" style="display: inline-block; padding: 14px 34px; font-size: 12px; font-weight: 700; color: #FFFDF9; text-decoration: none; text-transform: uppercase; letter-spacing: 0.14em; border-radius: 50px;">
                      Open Wedding Portal
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


async def send_invitation_email(
    recipient_email: str,
    guest_name: str,
    couple_names: list[str],
    wedding_title: str,
    wedding_date: Optional[str],
    venue_name: Optional[str],
    invite_url: str,
) -> Dict[str, Any]:
    """
    Sends a personalized digital invitation email using Resend.
    If RESEND_API_KEY is unset or is a placeholder, logs cleanly to console
    and returns a simulated successful delivery record.
    """
    couple_str = " & ".join(couple_names) if couple_names else "Our Wedding"
    subject = f"Wedding Invitation: {couple_str} Request the Honor of Your Presence"
    html_content = generate_invitation_html(
        guest_name=guest_name,
        couple_names=couple_names,
        wedding_title=wedding_title,
        wedding_date=wedding_date,
        venue_name=venue_name,
        invite_url=invite_url,
    )

    api_key = settings.resend_api_key.strip()
    is_live = bool(api_key and not api_key.startswith("re_your_api"))

    if not is_live:
        logger.info(
            "[DEV EMAIL EMULATION] Resend API Key is empty or template default.\n"
            "To: %s (%s)\n"
            "Subject: %s\n"
            "Invitation Link: %s",
            recipient_email,
            guest_name,
            subject,
            invite_url,
        )
        return {
            "success": True,
            "status": "sent",
            "providerMessageId": f"simulated_{datetime.now(timezone.utc).timestamp()}",
            "emulated": True,
        }

    try:
        resend.api_key = api_key
        params: resend.Emails.SendParams = {
            "from": settings.email_from,
            "to": [recipient_email],
            "subject": subject,
            "html": html_content,
        }
        response = resend.Emails.send(params)
        message_id = response.get("id") if isinstance(response, dict) else getattr(response, "id", None)
        return {
            "success": True,
            "status": "sent",
            "providerMessageId": message_id or "resend_sent",
            "emulated": False,
        }
    except Exception as exc:
        logger.error("Resend delivery failed to %s: %s", recipient_email, str(exc))
        return {
            "success": False,
            "status": "failed",
            "error": str(exc),
            "providerMessageId": None,
            "emulated": False,
        }


async def send_reminder_email(
    recipient_email: str,
    guest_name: str,
    couple_names: list[str],
    wedding_title: str,
    reminder_type: str,
    message_text: Optional[str],
    invite_url: str,
    event_name: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Sends an invitation or RSVP reminder email using Resend.
    """
    couple_str = " & ".join(couple_names) if couple_names else "Our Wedding"
    if reminder_type == "event_reminder" and event_name:
        subject = f"Wedding Reminder: Upcoming {event_name} — {couple_str}'s Wedding"
    else:
        subject = f"Wedding Reminder: {couple_str}'s Upcoming Celebration"
    html_content = generate_reminder_html(
        guest_name=guest_name,
        couple_names=couple_names,
        wedding_title=wedding_title,
        reminder_type=reminder_type,
        message_text=message_text,
        invite_url=invite_url,
        event_name=event_name,
    )

    api_key = settings.resend_api_key.strip()
    is_live = bool(api_key and not api_key.startswith("re_your_api"))

    if not is_live:
        logger.info(
            "[DEV REMINDER EMULATION] Resend API Key is empty or template default.\n"
            "To: %s (%s)\n"
            "Subject: %s\n"
            "Portal Link: %s",
            recipient_email,
            guest_name,
            subject,
            invite_url,
        )
        return {
            "success": True,
            "status": "sent",
            "providerMessageId": f"simulated_rem_{datetime.now(timezone.utc).timestamp()}",
            "emulated": True,
        }

    try:
        resend.api_key = api_key
        params: resend.Emails.SendParams = {
            "from": settings.email_from,
            "to": [recipient_email],
            "subject": subject,
            "html": html_content,
        }
        response = resend.Emails.send(params)
        message_id = response.get("id") if isinstance(response, dict) else getattr(response, "id", None)
        return {
            "success": True,
            "status": "sent",
            "providerMessageId": message_id or "resend_sent",
            "emulated": False,
        }
    except Exception as exc:
        logger.error("Resend reminder delivery failed to %s: %s", recipient_email, str(exc))
        return {
            "success": False,
            "status": "failed",
            "error": str(exc),
            "providerMessageId": None,
            "emulated": False,
        }
