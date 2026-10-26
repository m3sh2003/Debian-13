import { LogEntry } from '../types/desktop';

export const INITIAL_LOGS: LogEntry[] = [
  // bootstrap.log
  {
    id: 'b-1',
    timestamp: '2026-10-25 21:10:01 UTC',
    level: 'INFO',
    file: 'bootstrap.log',
    message: '[boot.sh] Initializing Debian 13 Cloud Desktop at 2026-10-25 21:10:01 UTC'
  },
  {
    id: 'b-2',
    timestamp: '2026-10-25 21:10:01 UTC',
    level: 'INFO',
    file: 'bootstrap.log',
    message: '[boot.sh] Checking .pinned_id... Found persistent deployment identifier: c9b2f8a14e6d3091'
  },
  {
    id: 'b-3',
    timestamp: '2026-10-25 21:10:02 UTC',
    level: 'INFO',
    file: 'bootstrap.log',
    message: '[boot.sh] [1/8] Verifying and mounting chroot kernel filesystems & entropy devices...'
  },
  {
    id: 'b-4',
    timestamp: '2026-10-25 21:10:03 UTC',
    level: 'SUCCESS',
    file: 'bootstrap.log',
    message: '[mount] /proc, /sys, /dev, /dev/pts mounted. Real entropy devices verified (random, urandom, null, zero, full, tty, ptmx, kmsg).'
  },
  {
    id: 'b-5',
    timestamp: '2026-10-25 21:10:03 UTC',
    level: 'INFO',
    file: 'bootstrap.log',
    message: '[boot.sh] [2/8] Verifying Debian 13 Chroot filesystem integrity... Found /srv/debian13/etc/debian_version (trixie/sid)'
  },
  {
    id: 'b-6',
    timestamp: '2026-10-25 21:10:04 UTC',
    level: 'INFO',
    file: 'bootstrap.log',
    message: '[boot.sh] Debian User detected with dynamic UID: 1001, GID: 1001'
  },
  {
    id: 'b-7',
    timestamp: '2026-10-25 21:10:04 UTC',
    level: 'INFO',
    file: 'bootstrap.log',
    message: '[boot.sh] [3/8] Verifying noVNC static assets at /srv/debian13/usr/share/novnc... Verified (vnc.html found).'
  },
  {
    id: 'b-8',
    timestamp: '2026-10-25 21:10:05 UTC',
    level: 'INFO',
    file: 'bootstrap.log',
    message: '[boot.sh] [4/8] Launching TigerVNC :1 and XFCE4 desktop session...'
  },
  {
    id: 'b-9',
    timestamp: '2026-10-25 21:10:08 UTC',
    level: 'INFO',
    file: 'bootstrap.log',
    message: '[boot.sh] [5/8] Starting Websockify bridge (:6081 -> :5901)... Websockify launched (PID: 412)'
  },
  {
    id: 'b-10',
    timestamp: '2026-10-25 21:10:09 UTC',
    level: 'INFO',
    file: 'bootstrap.log',
    message: '[boot.sh] [6/8] Starting authenticated FastAPI Gateway (:6080)... FastAPI Gateway launched (PID: 438)'
  },
  {
    id: 'b-11',
    timestamp: '2026-10-25 21:10:10 UTC',
    level: 'INFO',
    file: 'bootstrap.log',
    message: '[boot.sh] [7/8] Starting background self-healing watchdog daemon... Watchdog active (PID: 450)'
  },
  {
    id: 'b-12',
    timestamp: '2026-10-25 21:10:13 UTC',
    level: 'SUCCESS',
    file: 'bootstrap.log',
    message: '[boot.sh] [8/8] Performing final health verification check... ALL 4 CORE SUBSYSTEMS HEALTHY.'
  },
  {
    id: 'b-13',
    timestamp: '2026-10-25 21:10:13 UTC',
    level: 'SUCCESS',
    file: 'bootstrap.log',
    message: 'DEBIAN 13 CLOUD DESKTOP ENVIRONMENT READY -> https://c9b2f8a14e6d3091.sg.agentos-app.run'
  },

  // chroot.log
  {
    id: 'c-1',
    timestamp: '2026-10-25 21:05:00 UTC',
    level: 'INFO',
    file: 'chroot.log',
    message: '[bootstrap] Starting Debian 13 (Trixie) chroot installation into /srv/debian13...'
  },
  {
    id: 'c-2',
    timestamp: '2026-10-25 21:05:30 UTC',
    level: 'INFO',
    file: 'chroot.log',
    message: '[bootstrap] debootstrap minbase trixie completed successfully from https://deb.debian.org/debian.'
  },
  {
    id: 'c-3',
    timestamp: '2026-10-25 21:06:15 UTC',
    level: 'INFO',
    file: 'chroot.log',
    message: '[bootstrap] Installed: xfce4, xfce4-terminal, tigervnc-standalone-server, novnc, websockify, firefox-esr, libreoffice, thunderbird, vlc, gimp, git, curl, wget, python3, python3-pip, python3-venv, build-essential.'
  },
  {
    id: 'c-4',
    timestamp: '2026-10-25 21:07:05 UTC',
    level: 'INFO',
    file: 'chroot.log',
    message: '[bootstrap] Installing Node.js 22 inside chroot from official archive...'
  },
  {
    id: 'c-5',
    timestamp: '2026-10-25 21:07:18 UTC',
    level: 'SUCCESS',
    file: 'chroot.log',
    message: '[bootstrap] Verified Node: v22.14.0 / NPM: 10.9.2. Symbolic links created in /usr/local/bin.'
  },
  {
    id: 'c-6',
    timestamp: '2026-10-25 21:07:22 UTC',
    level: 'INFO',
    file: 'chroot.log',
    message: '[bootstrap] Dynamic user \'debian\' provisioned: UID=1001, GID=1001 (never assuming UID=1000).'
  },
  {
    id: 'c-7',
    timestamp: '2026-10-25 21:07:25 UTC',
    level: 'SUCCESS',
    file: 'chroot.log',
    message: '[bootstrap] TigerVNC password hash stored at /home/debian/.vnc/passwd (mode 0600).'
  },

  // vnc.log
  {
    id: 'v-1',
    timestamp: '2026-10-25 21:10:05 UTC',
    level: 'INFO',
    file: 'vnc.log',
    message: '[desktop] Creating XDG runtime directory /run/user/1001 with 0700 permissions'
  },
  {
    id: 'v-2',
    timestamp: '2026-10-25 21:10:06 UTC',
    level: 'INFO',
    file: 'vnc.log',
    message: '[desktop] Starting TigerVNC server on display :1 (port 5901, geometry 1920x1080x24)...'
  },
  {
    id: 'v-3',
    timestamp: '2026-10-25 21:10:07 UTC',
    level: 'INFO',
    file: 'vnc.log',
    message: 'Xtigervnc: New desktop \'Debian 13 Cloud Desktop (Trixie)\' on :1'
  },
  {
    id: 'v-4',
    timestamp: '2026-10-25 21:10:07 UTC',
    level: 'INFO',
    file: 'vnc.log',
    message: '[desktop] Starting XFCE desktop session (startxfce4)...'
  },
  {
    id: 'v-5',
    timestamp: '2026-10-25 21:10:08 UTC',
    level: 'INFO',
    file: 'vnc.log',
    message: 'xfce4-session: Session started for user debian (display :1)'
  },
  {
    id: 'v-6',
    timestamp: '2026-10-25 21:10:08 UTC',
    level: 'INFO',
    file: 'vnc.log',
    message: 'websockify: WebSocket server listening on 0.0.0.0:6081, targeting 127.0.0.1:5901'
  },

  // gateway.log
  {
    id: 'g-1',
    timestamp: '2026-10-25 21:10:09 UTC',
    level: 'INFO',
    file: 'gateway.log',
    message: '[gateway] Initializing FastAPI Gateway on 0.0.0.0:6080...'
  },
  {
    id: 'g-2',
    timestamp: '2026-10-25 21:10:09 UTC',
    level: 'INFO',
    file: 'gateway.log',
    message: '[gateway] Loaded credentials: user=\'admin\', pass-hash validated (_AUTH_PASS active).'
  },
  {
    id: 'g-3',
    timestamp: '2026-10-25 21:10:09 UTC',
    level: 'INFO',
    file: 'gateway.log',
    message: '[gateway] Mounted static assets: /desktop -> /srv/debian13/usr/share/novnc'
  },
  {
    id: 'g-4',
    timestamp: '2026-10-25 21:10:10 UTC',
    level: 'SUCCESS',
    file: 'gateway.log',
    message: '[gateway] Uvicorn running on http://0.0.0.0:6080 (Press CTRL+C to quit)'
  },
  {
    id: 'g-5',
    timestamp: '2026-10-25 21:10:13 UTC',
    level: 'INFO',
    file: 'gateway.log',
    message: '127.0.0.1:41920 - "GET /healthz HTTP/1.1" 200 OK'
  },

  // watchdog.log
  {
    id: 'w-1',
    timestamp: '2026-10-25 21:10:10 UTC',
    level: 'INFO',
    file: 'watchdog.log',
    message: '[watchdog] Service Watchdog initialized. Monitoring Xtigervnc, xfce4-session, websockify, and FastAPI gateway.'
  },
  {
    id: 'w-2',
    timestamp: '2026-10-25 21:10:10 UTC',
    level: 'INFO',
    file: 'watchdog.log',
    message: '[watchdog] Loaded restart counters from state/restart_counters.json: all zeros.'
  },
  {
    id: 'w-3',
    timestamp: '2026-10-25 21:10:15 UTC',
    level: 'SUCCESS',
    file: 'watchdog.log',
    message: '[watchdog] Heartbeat: [Xtigervnc: OK] [xfce4-session: OK] [websockify: OK] [fastapi-gateway: OK]'
  }
];
