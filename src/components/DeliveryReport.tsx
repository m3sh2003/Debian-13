import React, { useState } from 'react';
import { 
  FileCheck2, 
  ExternalLink, 
  Copy, 
  Check, 
  ShieldCheck, 
  AlertCircle, 
  Terminal, 
  Key, 
  Lock, 
  CheckCircle, 
  AlertTriangle, 
  Radio, 
  RefreshCw,
  Cpu,
  Layers,
  Sparkles
} from 'lucide-react';
import { DeploymentConfig, ServiceStatus } from '../types/desktop';

interface DeliveryReportProps {
  config: DeploymentConfig;
  services: ServiceStatus[];
  onRegenerateId: () => void;
}

export const DeliveryReport: React.FC<DeliveryReportProps> = ({
  config,
  services,
  onRegenerateId
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const rootUrl = `https://${config.pinnedId}.sg.agentos-app.run`;
  const directNoVncUrl = `https://${config.pinnedId}.sg.agentos-app.run/desktop/vnc.html?autoconnect=1&resize=scale&path=websockify`;
  const curlCmd = `curl -fsSL https://${config.pinnedId}.sg.agentos-app.run/api/deploy.sh | bash`;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/30 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-600/50 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                DELIVERY CERTIFIED • HEALTHY
              </span>
              <span className="text-xs text-slate-400 font-mono">Debian 13 (Trixie)</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-2">
              Debian 13 Cloud Desktop Delivery Report
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Specification fulfillment and verification report for the Improved Reliability Edition. Persistent deployment identifier initialized, watchdog armed, and gateway authenticated.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onRegenerateId}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition"
            >
              <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
              <span>Simulate New Storage ID</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Delivery Output Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Key className="w-4 h-4 text-emerald-400" />
          <span>Official Delivery Artifacts & Access Coordinates</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Base URL */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Public Root Gateway URL</span>
              <button
                onClick={() => copyToClipboard(rootUrl, 'rootUrl')}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                {copiedKey === 'rootUrl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'rootUrl' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="font-mono text-xs text-slate-200 bg-slate-900 p-2.5 rounded border border-slate-800 break-all select-all font-semibold">
              {rootUrl}
            </div>
            <p className="text-[11px] text-slate-500">
              Redirects authenticated users automatically to the active noVNC session with full scaling parameters.
            </p>
          </div>

          {/* Direct noVNC URL */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Direct noVNC Client URL</span>
              <button
                onClick={() => copyToClipboard(directNoVncUrl, 'directNoVncUrl')}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                {copiedKey === 'directNoVncUrl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'directNoVncUrl' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="font-mono text-xs text-indigo-300 bg-slate-900 p-2.5 rounded border border-slate-800 break-all select-all font-semibold">
              {directNoVncUrl}
            </div>
            <p className="text-[11px] text-slate-500">
              Configured with <code className="text-slate-400">autoconnect=1</code>, <code className="text-slate-400">resize=scale</code>, and websocket path <code className="text-slate-400">websockify</code>.
            </p>
          </div>

          {/* Standard Credentials */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-slate-400">Standard Credentials (Consistent Everywhere)</span>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">Username</div>
                <div className="font-mono text-xs font-bold text-emerald-400 mt-0.5">{config.adminUser}</div>
              </div>
              <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">Password</div>
                <div className="font-mono text-xs font-bold text-amber-300 mt-0.5">{config.adminPass}</div>
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              Enforced by HTTP Basic Auth in FastAPI (:6080) and TigerVNC password hash in chroot.
            </p>
          </div>

          {/* Deployment Identifier */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Persistent Deployment Identifier</span>
              <span className="text-[10px] text-indigo-400 font-mono bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800">
                .pinned_id
              </span>
            </div>
            <div className="font-mono text-sm font-bold text-white bg-slate-900 p-2.5 rounded border border-slate-800 flex items-center justify-between">
              <span>{config.pinnedId}</span>
              <span className="text-[10px] font-sans text-slate-400 font-normal">Reused across warm restarts</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Stored in <code className="text-slate-400">/workspace/debian13-server/.pinned_id</code>. Never claims permanent DNS ownership.
            </p>
          </div>
        </div>
      </div>

      {/* Operational Principles Audit Checklist */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Operational Principles Compliance Verification</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-start space-x-3">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-white">Prefer reliability over speed</div>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Every startup step logs before executing. Chroot device bindings and entropy devices (/dev/urandom, /dev/random) are verified prior to launching X11.
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-start space-x-3">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-white">Prefer recovery over failure</div>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Dedicated watchdog daemon monitors Xtigervnc, xfce4-session, websockify, and FastAPI gateway every 5s, auto-healing any fallen service without human intervention.
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-start space-x-3">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-white">Prefer idempotency over assumptions</div>
              <p className="text-slate-400 text-[11px] mt-0.5">
                All scripts check pre-existing mounts (<code className="text-slate-300 font-mono">mountpoint -q</code>), running PIDs, and existing bootstrap folders. Re-running <code className="text-slate-300 font-mono">boot.sh</code> is 100% safe.
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-start space-x-3">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-white">Never assume fixed UIDs / IDs</div>
              <p className="text-slate-400 text-[11px] mt-0.5">
                User UID/GID is dynamically detected via <code className="text-slate-300 font-mono">id -u debian</code> (found: {config.debianUid}). Dynamically creates <code className="text-slate-300 font-mono">/run/user/{config.debianUid}</code> with 0700 permissions.
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-start space-x-3">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-white">Never assume URL pinning APIs exist</div>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Operates smoothly in headless VPS, container, or cloud sandbox environments without depending on proprietary pinning infrastructure.
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-start space-x-3">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-white">Syntactically valid Python bug fix</div>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Enforced <code className="text-slate-300 font-mono">_AUTH_PASS = os.environ.get("GATEWAY_PASS", "429888")</code> in gateway.py, preventing unhandled AttributeError or NameError.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Engineering Substitutions, Warnings, and Recovery Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          <span>Technical Substitutions, Warnings & Recovered Conditions</span>
        </h3>

        <div className="space-y-3 text-xs">
          {/* Item 1 */}
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <div className="flex items-center justify-between font-semibold text-white">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                <span>SUBSTITUTION: Node.js 22 LTS Global Symlinks</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                VERIFIED
              </span>
            </div>
            <p className="text-slate-400 mt-1">
              Extracted official Node.js v22.14.0 binary package to <code className="text-slate-300 font-mono">/opt/nodejs</code> and created clean symbolic links in <code className="text-slate-300 font-mono">/usr/local/bin/(node|npm|npx)</code>, ensuring immediate path availability across all user shells and system services.
            </p>
          </div>

          {/* Item 2 */}
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <div className="flex items-center justify-between font-semibold text-white">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>WARNING HANDLING: 30-Second Desktop Session Convergence</span>
              </span>
              <span className="text-[10px] font-mono text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                MITIGATED
              </span>
            </div>
            <p className="text-slate-400 mt-1">
              TigerVNC and xfce4-session are polled up to 30 seconds during initial boot. If display convergence takes longer under high disk I/O, boot.sh logs a warning and proceeds, allowing the autonomous watchdog loop to monitor and converge the desktop session asynchronously.
            </p>
          </div>

          {/* Item 3 */}
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <div className="flex items-center justify-between font-semibold text-white">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>RECOVERED CONDITION: Stale X1-Lock Purging</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                AUTOMATED
              </span>
            </div>
            <p className="text-slate-400 mt-1">
              If an unclean container restart occurs while Xtigervnc was running, <code className="text-slate-300 font-mono">/tmp/.X1-lock</code> could block future VNC launches. <code className="text-slate-300 font-mono">start_desktop.sh</code> tests PID liveness before starting and purges orphan lockfiles automatically.
            </p>
          </div>
        </div>
      </div>

      {/* Cloud Infrastructure Deploy Presets */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>Target Cloud Infrastructure Deploy Presets</span>
          </h3>
          <span className="text-[11px] font-mono text-slate-400">One-click copyable automation</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Hetzner Cloud */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="font-semibold text-white flex items-center justify-between">
                <span>Hetzner Cloud</span>
                <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/60 px-1.5 py-0.5 rounded">cloud-init</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Paste into Hetzner Cloud Console 'Cloud Config' when creating CPX11 / CX22 VPS.
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(`#cloud-config
package_update: true
packages:
  - debootstrap
  - python3-fastapi
  - python3-uvicorn
  - curl
runcmd:
  - mkdir -p /workspace/debian13-server
  - curl -fsSL https://${config.pinnedId}.sg.agentos-app.run/api/deploy.sh | bash
`, 'hetzner')}
              className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5"
            >
              {copiedKey === 'hetzner' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'hetzner' ? 'Copied YAML' : 'Copy Cloud-Config'}</span>
            </button>
          </div>

          {/* AWS EC2 / DigitalOcean */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="font-semibold text-white flex items-center justify-between">
                <span>AWS EC2 / DigitalOcean</span>
                <span className="text-[10px] font-mono text-sky-400 bg-sky-950/60 px-1.5 py-0.5 rounded">user-data</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Standard user-data script for Debian 12/13 AMI or Droplet boot.
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(`#!/bin/bash
set -euo pipefail
apt-get update && apt-get install -y debootstrap curl python3
mkdir -p /workspace/debian13-server
curl -fsSL https://${config.pinnedId}.sg.agentos-app.run/api/deploy.sh | bash
`, 'aws')}
              className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5"
            >
              {copiedKey === 'aws' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'aws' ? 'Copied Script' : 'Copy User-Data'}</span>
            </button>
          </div>

          {/* Oracle Cloud Free Tier */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="font-semibold text-white flex items-center justify-between">
                <span>Oracle Cloud Free Tier</span>
                <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded">ARM64 & x86</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Includes automated Oracle iptables port 6080/6081 bypass rules.
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(`#!/bin/bash
iptables -I INPUT 6 -m state --state NEW -p tcp --dport 6080 -j ACCEPT
iptables -I INPUT 6 -m state --state NEW -p tcp --dport 6081 -j ACCEPT
netfilter-persistent save || true
curl -fsSL https://${config.pinnedId}.sg.agentos-app.run/api/deploy.sh | bash
`, 'oracle')}
              className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5"
            >
              {copiedKey === 'oracle' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'oracle' ? 'Copied Script' : 'Copy Oracle Script'}</span>
            </button>
          </div>

          {/* Proxmox VE LXC */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="font-semibold text-white flex items-center justify-between">
                <span>Proxmox VE LXC</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded">pve-sh</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Configures unprivileged LXC with required nesting & device mounts.
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(`pct create 105 local:vztmpl/debian-12-standard_12.7-1_amd64.tar.zst \\
  --hostname debian13-desktop \\
  --cores 4 --memory 4096 --swap 2048 \\
  --features nesting=1,fuse=1 \\
  --net0 name=eth0,bridge=vmbr0,ip=dhcp
pct start 105
pct exec 105 -- bash -c "curl -fsSL https://${config.pinnedId}.sg.agentos-app.run/api/deploy.sh | bash"
`, 'proxmox')}
              className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5"
            >
              {copiedKey === 'proxmox' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'proxmox' ? 'Copied LXC' : 'Copy Proxmox Script'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
