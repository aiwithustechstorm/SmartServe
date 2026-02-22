"""
Keep-alive self-ping for Render free-tier deployments.

Render spins down free web services after ~15 minutes of inactivity.
This module spawns a lightweight daemon thread that pings the app's
own /api/health endpoint every KEEP_ALIVE_INTERVAL seconds (default 14 min)
to prevent the instance from sleeping.

Requires the RENDER_EXTERNAL_URL environment variable to be set
(Render provides this automatically for every web service).
"""

import threading
import time
import logging
import urllib.request

logger = logging.getLogger(__name__)


def _ping_loop(url: str, interval: int) -> None:
    """Continuously ping *url* every *interval* seconds."""
    while True:
        time.sleep(interval)
        try:
            req = urllib.request.Request(url, method="GET")
            with urllib.request.urlopen(req, timeout=10) as resp:
                logger.info("Keep-alive ping %s → %s", url, resp.status)
        except Exception as exc:  # noqa: BLE001
            logger.warning("Keep-alive ping failed: %s", exc)


def start_keep_alive(app) -> None:
    """Start the keep-alive thread if RENDER_EXTERNAL_URL is configured."""
    url = app.config.get("RENDER_EXTERNAL_URL", "")
    interval = app.config.get("KEEP_ALIVE_INTERVAL", 840)

    if not url:
        logger.info("RENDER_EXTERNAL_URL not set — keep-alive disabled.")
        return

    health_url = f"{url.rstrip('/')}/api/health"
    thread = threading.Thread(
        target=_ping_loop,
        args=(health_url, interval),
        daemon=True,
        name="keep-alive",
    )
    thread.start()
    logger.info(
        "Keep-alive thread started — pinging %s every %d s", health_url, interval
    )
