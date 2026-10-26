import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Maximize2, Minimize2, X, RefreshCw } from 'lucide-react';
import { DeploymentConfig, ServiceName } from '../../types/desktop';

interface TerminalProps {
  config: DeploymentConfig;
  onKillService?: (serviceName: ServiceName) => void;
  onRunHealthCheck?: () => void;
}

interface CommandHistory {
  cmd: string;
  output: string | React.ReactNode;
}

export const TerminalWindow: React.FC<TerminalProps> = ({
  config,
  onKillService,
  onRunHealthCheck
}) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<CommandHistory[]>([
    {
      cmd: '',
      output: (
        <div className="text-slate-400 space-y-1">
          <p className="text-emerald-400 font-bold">Debian GNU/Linux 13 (trixie) [chroot environment]</p>
          <p className="text-xs text-slate-500">Kernel: 6.1.0-28-amd64 #1 SMP PREEMPT_DYNAMIC x86_64</p>
          <p className="text-xs text-slate-500">Connected as <span className="text-amber-300 font-semibold">{config.debianUser}</span> (UID: {config.debianUid}, GID: {config.debianGid})</p>
          <p className="text-xs text-indigo-400">Type <span className="font-semibold text-white">help</span> for available commands or execute bash scripts.</p>
        </div>
      )
    }
  ]);

  const [historyIndex, setHistoryIndex] = useState(-1);
  const [commandList, setCommandList] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    setCommandList(prev => [...prev, trimmed]);
    setHistoryIndex(-1);
    setInput('');

    const parts = trimmed.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    let output: React.ReactNode = '';

    switch (command) {
      case 'help':
        output = (
          <div className="text-slate-300 space-y-1 text-xs">
            <p className="font-bold text-amber-300">Available commands in Debian 13 Cloud Desktop:</p>
            <p><span className="text-emerald-400 font-mono">uname -a</span> - View Linux kernel release information</p>
            <p><span className="text-emerald-400 font-mono">cat /etc/os-release</span> - Display Debian 13 (Trixie) release metadata</p>
            <p><span className="text-emerald-400 font-mono">id</span> - Verify dynamic UID/GID (never assuming UID=1000)</p>
            <p><span className="text-emerald-400 font-mono">node -v && npm -v</span> - Verify Node.js 22 LTS in /usr/local/bin</p>
            <p><span className="text-emerald-400 font-mono">ps aux</span> - Inspect running processes (Xtigervnc, xfce4, websockify, gateway)</p>
            <p><span className="text-emerald-400 font-mono">./healthcheck.sh</span> - Execute the 4-point health verification check</p>
            <p><span className="text-emerald-400 font-mono">cat .pinned_id</span> - Inspect the persistent deployment identifier</p>
            <p><span className="text-emerald-400 font-mono">curl localhost:6080/healthz</span> - Test open gateway health endpoint</p>
            <p><span className="text-emerald-400 font-mono">ls /dev/</span> - Verify real entropy devices (random, urandom, null, zero)</p>
            <p><span className="text-emerald-400 font-mono">clear</span> - Clear the terminal output</p>
          </div>
        );
        break;

      case 'uname':
        if (args.includes('-a')) {
          output = 'Linux debian13-cloud-desktop 6.1.0-28-amd64 #1 SMP PREEMPT_DYNAMIC Debian 6.1.119-1 (2026-10) x86_64 GNU/Linux';
        } else {
          output = 'Linux';
        }
        break;

      case 'cat':
        const file = args[0] || '';
        if (file.includes('os-release') || file.includes('issue')) {
          output = `PRETTY_NAME="Debian GNU/Linux 13 (trixie)"\nNAME="Debian GNU/Linux"\nVERSION_ID="13"\nVERSION="13 (trixie)"\nVERSION_CODENAME=trixie\nID=debian\nHOME_URL="https://www.debian.org/"\nSUPPORT_URL="https://www.debian.org/support"`;
        } else if (file.includes('.pinned_id') || file.includes('pinned_id')) {
          output = config.pinnedId;
        } else if (file.includes('debian_version')) {
          output = 'trixie/sid';
        } else if (file.includes('sources.list')) {
          output = `deb https://deb.debian.org/debian trixie main contrib non-free non-free-firmware\ndeb https://deb.debian.org/debian-security trixie-security main contrib non-free non-free-firmware\ndeb https://deb.debian.org/debian trixie-updates main contrib non-free non-free-firmware`;
        } else {
          output = `cat: ${file}: No such file or directory`;
        }
        break;

      case 'id':
        output = `uid=${config.debianUid}(${config.debianUser}) gid=${config.debianGid}(${config.debianUser}) groups=${config.debianGid}(${config.debianUser}),27(sudo)`;
        break;

      case 'node':
        if (args.includes('-v') || args.includes('--version')) {
          output = config.nodeVersion;
        } else {
          output = 'Welcome to Node.js v22.14.0.\nType ".help" for more information.';
        }
        break;

      case 'npm':
        if (args.includes('-v') || args.includes('--version')) {
          output = '10.9.2';
        } else {
          output = 'npm <command>\nUsage: npm install, npm test, etc.';
        }
        break;

      case 'npx':
        output = 'npx 10.9.2';
        break;

      case 'ps':
        output = (
          <pre className="font-mono text-[11px] text-slate-300 leading-relaxed overflow-x-auto">
{`USER       PID  %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         1   0.0  0.1  21840  3240 ?        Ss   21:10   0:00 /bin/bash /workspace/debian13-server/scripts/boot.sh
root       390   0.0  0.2  48920  8400 ?        S    21:10   0:00 python3 /workspace/debian13-server/scripts/watchdog.py
debian     405   0.4  1.2 198420 48200 ?        S    21:10   0:02 Xtigervnc :1 -geometry 1920x1080 -depth 24 -rfbport 5901
debian     412   0.2  0.8 142100 32100 ?        S    21:10   0:01 xfce4-session
root       420   0.1  0.5  82400 18200 ?        S    21:10   0:00 python3 -m websockify --web /usr/share/novnc 6081 localhost:5901
root       438   0.3  0.9 112000 36400 ?        S    21:10   0:01 python3 /workspace/debian13-server/scripts/gateway.py
debian     480   0.1  0.4  52100 15600 ?        S    21:10   0:00 xfce4-panel
debian     492   0.1  0.4  64200 18900 ?        S    21:10   0:00 xfwm4
debian     510   0.0  0.2  24100  9200 pts/1    S+   21:12   0:00 xfce4-terminal`}
          </pre>
        );
        break;

      case './healthcheck.sh':
      case 'healthcheck':
      case 'healthcheck.sh':
        onRunHealthCheck?.();
        output = (
          <div className="text-xs space-y-1">
            <p className="text-slate-400">Checking Debian 13 Cloud Desktop Health...</p>
            <p className="text-emerald-400 font-mono">  [PASS] FastAPI Gateway (port 6080) is responding with HTTP 200 OK.</p>
            <p className="text-emerald-400 font-mono">  [PASS] Websockify (port 6081) process is running.</p>
            <p className="text-emerald-400 font-mono">  [PASS] Xtigervnc server (display :1 / port 5901) is active.</p>
            <p className="text-emerald-400 font-mono">  [PASS] xfce4-session graphical environment is active.</p>
            <p className="text-emerald-300 font-bold mt-1">Result: HEALTHY (All 4 core subsystems operational).</p>
          </div>
        );
        break;

      case 'curl':
        if (args.some(a => a.includes('/healthz'))) {
          output = '{"status":"ok","service":"debian13-fastapi-gateway","desktop":"xfce4","version":"1.0.0-improved-reliability"}';
        } else if (args.some(a => a.includes('6080'))) {
          output = 'HTTP/1.1 302 Found\nLocation: /desktop/vnc.html?autoconnect=1&resize=scale&path=websockify';
        } else {
          output = 'curl: try \'curl --help\' for more information';
        }
        break;

      case 'ls':
        const target = args[0] || '';
        if (target.includes('/dev') || target === '/dev') {
          output = 'crw-rw-rw- 1 root root 1, 8 random\ncrw-rw-rw- 1 root root 1, 9 urandom\ncrw-rw-rw- 1 root root 1, 3 null\ncrw-rw-rw- 1 root root 1, 5 zero\ncrw-rw-rw- 1 root root 1, 7 full\ncrw-rw-rw- 1 root root 5, 0 tty\ncrw-rw-rw- 1 root root 5, 2 ptmx\ncrw-r--r-- 1 root root 1, 11 kmsg';
        } else if (target.includes('/workspace') || target.includes('scripts')) {
          output = '-rwxr-xr-x 1 root root 3420 boot.sh\n-rwxr-xr-x 1 root root 4180 bootstrap_chroot.sh\n-rwxr-xr-x 1 root root 1850 mount_chroot.sh\n-rwxr-xr-x 1 root root 2240 start_desktop.sh\n-rw-r--r-- 1 root root 3620 gateway.py\n-rw-r--r-- 1 root root 2980 watchdog.py\n-rwxr-xr-x 1 root root 1420 healthcheck.sh\n-rwxr-xr-x 1 root root  980 cleanup.sh';
        } else {
          output = 'Desktop  Documents  Downloads  Music  Pictures  Public  Templates  Videos';
        }
        break;

      case 'clear':
        setHistory([]);
        return;

      case 'whoami':
        output = config.debianUser;
        break;

      case 'pwd':
        output = '/home/debian';
        break;

      case 'echo':
        output = args.join(' ');
        break;

      default:
        output = `bash: ${command}: command not found. Type 'help' for available actions.`;
    }

    setHistory(prev => [...prev, { cmd: trimmed, output }]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandList.length > 0) {
        const nextIndex = historyIndex === -1 ? commandList.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(nextIndex);
        setInput(commandList[nextIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const nextIndex = historyIndex + 1;
        if (nextIndex < commandList.length) {
          setHistoryIndex(nextIndex);
          setInput(commandList[nextIndex]);
        } else {
          setHistoryIndex(-1);
          setInput('');
        }
      }
    }
  };

  return (
    <div 
      className="h-full flex flex-col bg-slate-950 text-slate-100 font-mono text-xs select-text overflow-hidden"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Inner terminal body */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2">
        {history.map((h, i) => (
          <div key={i} className="space-y-1">
            {h.cmd && (
              <div className="flex items-center space-x-2 text-slate-300">
                <span className="text-emerald-400 font-bold">{config.debianUser}@debian13-cloud</span>
                <span className="text-slate-500">:</span>
                <span className="text-sky-400 font-semibold">~</span>
                <span className="text-slate-400">$</span>
                <span className="text-white font-medium">{h.cmd}</span>
              </div>
            )}
            {typeof h.output === 'string' ? (
              <pre className="text-slate-300 whitespace-pre-wrap leading-relaxed pl-2 font-mono">
                {h.output}
              </pre>
            ) : (
              <div className="pl-2">{h.output}</div>
            )}
          </div>
        ))}

        {/* Input prompt line */}
        <form onSubmit={handleCommand} className="flex items-center space-x-2 pt-1">
          <span className="text-emerald-400 font-bold shrink-0">{config.debianUser}@debian13-cloud</span>
          <span className="text-slate-500 shrink-0">:</span>
          <span className="text-sky-400 font-semibold shrink-0">~</span>
          <span className="text-slate-400 shrink-0">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-white outline-none font-mono text-xs border-none p-0 focus:ring-0"
            autoFocus
            spellCheck={false}
          />
        </form>
        <div ref={bottomRef} />
      </div>

      {/* Terminal Footer Quick buttons */}
      <div className="bg-slate-900 border-t border-slate-800 px-3 py-1.5 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center space-x-2 overflow-x-auto">
          <span className="text-slate-500">Quick run:</span>
          <button 
            type="button" 
            onClick={() => { setInput('./healthcheck.sh'); }}
            className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700"
          >
            ./healthcheck.sh
          </button>
          <button 
            type="button" 
            onClick={() => { setInput('ps aux'); }}
            className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700"
          >
            ps aux
          </button>
          <button 
            type="button" 
            onClick={() => { setInput('node -v && npm -v'); }}
            className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700"
          >
            node -v
          </button>
          <button 
            type="button" 
            onClick={() => { setInput('id'); }}
            className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-violet-300 border border-slate-700"
          >
            id
          </button>
        </div>
        <div className="text-[10px] text-slate-500 font-mono">
          UTF-8 • xterm-256color
        </div>
      </div>
    </div>
  );
};
