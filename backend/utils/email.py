"""Email utility — send premium branded OTP emails via SMTP."""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

from flask import current_app


# ── Premium HTML template (hosted logo URL) ─────────────────────────
def _build_html(otp: str, logo_url: str) -> str:
    year = datetime.utcnow().year

    # Individual digit cells
    otp_cells = ""
    for d in otp:
        otp_cells += (
            '<td style="width:42px;height:50px;background:#f0f4f8;'
            'border:2px solid #d6dfe8;border-radius:10px;text-align:center;'
            "vertical-align:middle;font-family:'SF Mono',Consolas,"
            "'Courier New',monospace;font-size:24px;font-weight:700;"
            f'color:#1b3a5c;">{d}</td>\n'
        )

    return f"""\
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f2f2f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2f2f7;">
  <tr><td style="padding:40px 16px;" align="center">

    <table role="presentation" width="460" cellpadding="0" cellspacing="0"
           style="background:#ffffff;border-radius:16px;overflow:hidden;">

      <!-- Orange accent bar -->
      <tr><td style="height:5px;background:#e8652e;"></td></tr>

      <!-- Logo + Brand -->
      <tr><td style="padding:32px 40px 0;" align="center">
        <table role="presentation" cellpadding="0" cellspacing="0"><tr>
          <td style="vertical-align:middle;">
            <img src="{logo_url}" alt="SmartServe" width="52" height="52"
                 style="display:block;border-radius:12px;" />
          </td>
          <td style="padding-left:14px;vertical-align:middle;">
            <p style="margin:0;font-size:22px;font-weight:800;color:#1b3a5c;line-height:1.1;">
              Smart<span style="color:#e8652e;">Serve</span>
            </p>
            <p style="margin:2px 0 0;font-size:11px;color:#8e99a4;font-weight:600;
                      text-transform:uppercase;letter-spacing:1.2px;">
              Smart Campus Canteen
            </p>
          </td>
        </tr></table>
      </td></tr>

      <!-- Divider -->
      <tr><td style="padding:24px 40px 0;">
        <div style="height:1px;background:#eef0f3;"></div>
      </td></tr>

      <!-- Greeting -->
      <tr><td style="padding:24px 40px 0;text-align:center;">
        <p style="margin:0;font-size:15px;color:#555e68;line-height:1.5;">
          Your one-time verification code is
        </p>
      </td></tr>

      <!-- OTP digits -->
      <tr><td style="padding:20px 40px 0;" align="center">
        <table role="presentation" cellpadding="0" cellspacing="6" style="margin:0 auto;">
          <tr>
            {otp_cells}
          </tr>
        </table>
      </td></tr>

      <!-- Expires badge -->
      <tr><td style="padding:18px 40px 0;" align="center">
        <table role="presentation" cellpadding="0" cellspacing="0"><tr>
          <td style="background:#fff3ed;border-radius:20px;padding:6px 16px;
                     font-size:12px;font-weight:700;color:#e8652e;">
            &#9200; Expires in 5 minutes
          </td>
        </tr></table>
      </td></tr>

      <!-- Security tip -->
      <tr><td style="padding:24px 40px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
               style="background:#f8f9fb;border-radius:10px;">
          <tr><td style="padding:14px 18px;font-size:13px;color:#6b7685;line-height:1.5;text-align:center;">
            &#128274; <strong>Security tip:</strong> Never share this code.
            SmartServe staff will never ask for your OTP.
          </td></tr>
        </table>
      </td></tr>

      <!-- Divider -->
      <tr><td style="padding:24px 40px 0;">
        <div style="height:1px;background:#eef0f3;"></div>
      </td></tr>

      <!-- Footer -->
      <tr><td style="padding:18px 40px 28px;text-align:center;">
        <p style="margin:0 0 6px;font-size:11px;color:#aab2bc;">
          This is an automated message. Please do not reply.
        </p>
        <p style="margin:0;font-size:11px;color:#c5cbd3;">
          &copy; {year} SmartServe &mdash; All rights reserved
        </p>
      </td></tr>

    </table>

  </td></tr>
</table>
</body>
</html>"""


# ── Send email ──────────────────────────────────────────────────────
def send_otp_email(to_email: str, otp: str) -> None:
    """Send a premium branded 6-digit OTP email.

    Uses SMTP settings from Flask app config:
        SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM_NAME
    """
    cfg = current_app.config
    smtp_host = cfg.get("SMTP_HOST", "smtp.gmail.com")
    smtp_port = cfg.get("SMTP_PORT", 587)
    smtp_user = cfg.get("SMTP_USER", "")
    smtp_pass = cfg.get("SMTP_PASSWORD", "")
    from_name = cfg.get("SMTP_FROM_NAME", "SmartServe")

    # Build logo URL from backend's public URL
    base_url = cfg.get("RENDER_EXTERNAL_URL", "http://localhost:5000")
    if base_url and not base_url.startswith("http"):
        base_url = f"https://{base_url}"
    logo_url = f"{base_url.rstrip('/')}/api/logo.png"

    if not smtp_user or not smtp_pass:
        current_app.logger.warning(
            "SMTP_USER / SMTP_PASSWORD not configured — OTP email NOT sent. "
            "Set them in your .env file."
        )
        return

    # Simple alternative MIME — zero attachments
    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Your SmartServe Login Code: {otp}"
    msg["From"] = f"{from_name} <{smtp_user}>"
    msg["To"] = to_email

    # Plain text fallback
    text = (
        f"SmartServe — Login Code\n"
        f"{'=' * 30}\n\n"
        f"Your one-time verification code is: {otp}\n\n"
        f"This code expires in 5 minutes.\n"
        f"Never share this code with anyone.\n\n"
        f"— SmartServe Team\n"
    )
    msg.attach(MIMEText(text, "plain", "utf-8"))

    # Premium HTML with hosted logo
    html = _build_html(otp, logo_url)
    msg.attach(MIMEText(html, "html", "utf-8"))

    # Send — use SSL (port 465) or STARTTLS (port 587) depending on config
    try:
        if smtp_port == 465:
            with smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=15) as server:
                server.login(smtp_user, smtp_pass)
                server.sendmail(smtp_user, to_email, msg.as_string())
        else:
            with smtplib.SMTP(smtp_host, smtp_port, timeout=15) as server:
                server.ehlo()
                server.starttls()
                server.ehlo()
                server.login(smtp_user, smtp_pass)
                server.sendmail(smtp_user, to_email, msg.as_string())
        current_app.logger.info(f"OTP email sent to {to_email}")
    except Exception as exc:
        current_app.logger.error(f"Failed to send OTP email to {to_email}: {exc}")
        raise RuntimeError("Could not send OTP email. Please try again later.") from exc
