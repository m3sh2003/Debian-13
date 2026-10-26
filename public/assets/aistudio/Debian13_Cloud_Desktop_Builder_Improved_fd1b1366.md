# Debian 13 Cloud Desktop Builder (Improved Reliability Edition)

## ROLE
You are a senior Linux systems engineer.

Build, validate, repair, and deliver a Debian 13 (Trixie) XFCE graphical cloud desktop environment that:

- Runs inside a Debian 13 chroot.
- Exposes a browser-accessible desktop through noVNC.
- Uses HTTP Basic Authentication.
- Automatically recovers from common failures.
- Persists configuration whenever workspace storage survives container restarts.
- Produces a unique deployment identifier.
- Favors reliability and maintainability over aggressive optimization.
- Intended for personal testing, development, and evaluation.

## STANDARD CREDENTIALS
Username: admin
Password: 429888

Use these values consistently everywhere.

## DESIGN GOALS

1. Self-healing services.
2. Idempotent execution.
3. Safe re-runs.
4. Restart resilience.
5. Detailed logging.
6. Dynamic user detection.
7. Minimal manual intervention.
8. Best-effort URL persistence.

## ARCHITECTURE

Browser
  -> HTTPS Gateway
  -> FastAPI Gateway :6080
  -> noVNC Static Assets
  -> Websockify :6081
  -> TigerVNC :5901
  -> XFCE Desktop
  -> Debian 13 Chroot (/srv/debian13)

## STEP 0 – Workspace Initialization

Create:

/workspace/debian13-server/
/workspace/debian13-server/scripts/
/workspace/debian13-server/logs/
/workspace/debian13-server/state/

Generate a persistent identifier:

if [ ! -f .pinned_id ]; then
    openssl rand -hex 8 > .pinned_id || head -c 8 /dev/urandom | xxd -p > .pinned_id
fi

Store all runtime metadata inside:

state/

## RELIABILITY REQUIREMENTS

All scripts must:

- Use set -euo pipefail
- Create logs before execution
- Be safe to execute repeatedly
- Check prerequisites before performing changes
- Exit with meaningful error messages

## CHROOT BUILD

Bootstrap Debian 13 using:

https://deb.debian.org/debian

Install:

- XFCE
- TigerVNC
- noVNC
- Firefox ESR
- LibreOffice
- Thunderbird
- VLC
- GIMP
- Git
- Curl
- Wget
- Python3
- Python3-pip
- Python3-venv
- Build tools

Create user:

Debian user: debian

Store UID and GID dynamically.

Never assume UID=1000.

## NODE INSTALLATION

Install Node.js 22 inside the chroot.

Provide:

node
npm
npx

through symbolic links in:

/usr/local/bin

## DEVICE MOUNTS

Bind:

/proc
/sys
/dev
/dev/pts

Ensure real entropy devices are available:

random
urandom
null
zero
full
tty
ptmx
kmsg

## XFCE STARTUP

Determine runtime UID dynamically:

id -u debian

Create:

/run/user/<uid>

Start:

Xtigervnc :1
startxfce4

Wait until desktop session is available.

Maximum wait:

30 seconds.

## GATEWAY

FastAPI service on port 6080.

Required routes:

/
/healthz
/desktop/*
/websockify

Authentication:

admin / 429888

Health endpoint remains open.

## REQUIRED BUG FIX

Use:

_AUTH_PASS = os.environ.get("GATEWAY_PASS", "429888")

The configuration must be syntactically valid Python.

## URL PERSISTENCE POLICY

Persistent URL is best-effort.

Reuse:

.pinned_id

when workspace storage survives restart.

If workspace is recreated from scratch, generate a new ID automatically.

Never claim permanent DNS ownership.

## SERVICE WATCHDOG

Monitor:

1. Xtigervnc
2. xfce4-session
3. websockify
4. FastAPI gateway

Restart failed components automatically.

Keep restart counters.

Record events in:

logs/watchdog.log

## HEALTH VERIFICATION

Successful state requires:

- FastAPI responding.
- Websockify running.
- Xtigervnc running.
- xfce4-session running.

Only then return HEALTHY.

## LOGGING

Create:

logs/bootstrap.log
logs/chroot.log
logs/vnc.log
logs/gateway.log
logs/watchdog.log

All major actions must be logged.

## STARTUP ENTRYPOINT

boot.sh must:

1. Mount chroot resources.
2. Verify filesystem state.
3. Verify noVNC assets.
4. Start desktop.
5. Start websockify.
6. Start gateway.
7. Start watchdog.
8. Verify health.

## DELIVERY OUTPUT

Provide:

https://<unique-id>.sg.agentos-app.run

Credentials:

Username: admin
Password: 429888

Direct noVNC URL:

https://<unique-id>.sg.agentos-app.run/desktop/vnc.html?autoconnect=1&resize=scale&path=websockify

## OPERATIONAL PRINCIPLES

- Prefer reliability over speed.
- Prefer recovery over failure.
- Prefer idempotency over assumptions.
- Never assume fixed runtime IDs.
- Never assume fixed UIDs.
- Never assume URL pinning APIs exist.
- If a pinning API is unavailable, continue operating normally.
- Produce a final report describing substitutions, warnings, failures, and recovered conditions.
