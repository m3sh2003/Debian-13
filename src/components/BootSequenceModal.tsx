import React, { useState, useEffect } from 'react';
import { 
  Play, 
  CheckCircle2, 
  Loader2, 
  AlertCircle, 
  X, 
  Terminal, 
  RefreshCw, 
  ShieldCheck, 
  ExternalLink,
  Layers
} from 'lucide-react';
import { DeploymentConfig } from '../types/desktop';

interface BootSequenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: DeploymentConfig;
  onComplete?: () => void;
}

interface BootStep {
  id: number;
  title: string;
  command: string;
  description: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  logs: string[];
}

export const BootSequenceModal: React.FC<BootSequenceModalProps> = ({
  isOpen,
  onClose,
  config,
  onComplete
}) => {
  const [steps, setSteps] = useState<BootStep[]>([
    {
      id: 1,
      title: 'Step 1: Mount Chroot Kernel Resources & Entropy',
      command: '/workspace/debian13-server/scripts/mount_chroot.sh',
      description: 'Mounts /proc, /sys, /dev, /dev/pts and verifies entropy devices (random, urandom, null, zero).',
      status: 'pending',
      logs: []
    },
    {
      id: 2,
      title: 'Step 2: Verify Filesystem & User State',
      command: 'chroot /srv/debian13 id -u debian',
      description: 'Checks /srv/debian13/etc/debian_version and dynamically extracts debian user UID/GID.',
      status: 'pending',
      logs: []
    },
    {
      id: 3,
      title: 'Step 3: Verify noVNC Static Web Assets',
      command: 'test -f /srv/debian13/usr/share/novnc/vnc.html',
      description: 'Validates presence of noVNC HTML/JS/CSS distribution in chroot assets directory.',
      status: 'pending',
      logs: []
    },
    {
      id: 4,
      title: 'Step 4: Launch TigerVNC :1 & XFCE4 Session',
      command: '/workspace/debian13-server/scripts/start_desktop.sh',
      description: 'Creates /run/user/<uid>, launches Xtigervnc on port 5901 and startxfce4 with 30s session poll.',
      status: 'pending',
      logs: []
    },
    {
      id: 5,
      title: 'Step 5: Start Websockify Bridge (:6081)',
      command: 'websockify --web /usr/share/novnc 6081 localhost:5901',
      description: 'Establishes WebSocket-to-TCP proxy translating browser frames to TigerVNC.',
      status: 'pending',
      logs: []
    },
    {
      id: 6,
      title: 'Step 6: Start Authenticated FastAPI Gateway (:6080)',
      command: 'python3 /workspace/debian13-server/scripts/gateway.py',
      description: 'Launches Uvicorn with HTTP Basic Auth (admin:429888), open /healthz, and /desktop mount.',
      status: 'pending',
      logs: []
    },
    {
      id: 7,
      title: 'Step 7: Start Background Self-Healing Watchdog',
      command: 'python3 /workspace/debian13-server/scripts/watchdog.py',
      description: 'Arms 5-second monitoring loop for Xtigervnc, xfce4, websockify, and gateway with restart counters.',
      status: 'pending',
      logs: []
    },
    {
      id: 8,
      title: 'Step 8: Final 4-Point Health Verification',
      command: '/workspace/debian13-server/scripts/healthcheck.sh',
      description: 'Strict verification requiring all 4 core subsystems active before returning HEALTHY.',
      status: 'pending',
      logs: []
    }
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [activeConsoleLog, setActiveConsoleLog] = useState<string[]>([]);

  const startBootPipeline = async () => {
    setIsRunning(true);
    setCurrentStepIdx(0);
    setActiveConsoleLog([
      `[boot.sh] Initializing Debian 13 Cloud Desktop orchestrator...`,
      `[boot.sh] Reusing persistent deployment identifier: ${config.pinnedId}`,
      `[boot.sh] Working directory: /workspace/debian13-server`
    ]);

    // Reset steps
    setSteps(prev => prev.map(s => ({ ...s, status: 'pending', logs: [] })));

    for (let i = 0; i < 8; i++) {
      setCurrentStepIdx(i);
      setSteps(prev =>
        prev.map((s, idx) => (idx === i ? { ...s, status: 'running' } : s))
      );

      // Simulate execution time
      await new Promise(r => setTimeout(r, 650 + Math.random() * 400));

      const logMsg = `[step-${i + 1}] Successfully executed step ${i + 1} (${steps[i].title.split(':')[1].trim()})`;
      setActiveConsoleLog(prev => [...prev, logMsg]);

      setSteps(prev =>
        prev.map((s, idx) =>
          idx === i ? { ...s, status: 'success', logs: [logMsg] } : s
        )
      );
    }

    setIsRunning(false);
    setActiveConsoleLog(prev => [
      ...prev,
      `======================================================================`,
      `DEBIAN 13 CLOUD DESKTOP ENVIRONMENT READY (HEALTHY)`,
      `Deployment ID : ${config.pinnedId}`,
      `Public URL    : https://${config.pinnedId}.sg.agentos-app.run`,
      `Direct noVNC  : https://${config.pinnedId}.sg.agentos-app.run/desktop/vnc.html?autoconnect=1&resize=scale&path=websockify`,
      `Credentials   : ${config.adminUser} / ${config.adminPass}`,
      `======================================================================`
    ]);

    onComplete?.();
  };

  useEffect(() => {
    if (isOpen) {
      startBootPipeline();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const allFinished = steps.every(s => s.status === 'success');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-indigo-600/30 text-indigo-400 border border-indigo-500/40">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <span>Interactive Boot Sequence Simulator</span>
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  8-Stage Pipeline
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Simulating execution of <code className="text-slate-300 font-mono">/workspace/debian13-server/scripts/boot.sh</code>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Split between Step Tracker & Streaming Log */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Step Tracker (7 cols) */}
          <div className="md:col-span-7 p-4 overflow-y-auto space-y-2 border-r border-slate-800 bg-slate-900/60">
            {steps.map((step, idx) => (
              <div
                key={step.id}
                className={`p-3 rounded-xl border text-xs transition-all ${
                  step.status === 'running'
                    ? 'bg-indigo-950/40 border-indigo-500/80 shadow-md shadow-indigo-950/40'
                    : step.status === 'success'
                    ? 'bg-slate-950/70 border-emerald-900/50'
                    : 'bg-slate-950/40 border-slate-800/60 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="font-semibold text-white flex items-center gap-2">
                    {step.status === 'running' && (
                      <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                    )}
                    {step.status === 'success' && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                    {step.status === 'pending' && (
                      <span className="w-3.5 h-3.5 rounded-full border border-slate-600 text-[10px] flex items-center justify-center text-slate-500">
                        {step.id}
                      </span>
                    )}
                    <span>{step.title}</span>
                  </div>

                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                    step.status === 'running'
                      ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                      : step.status === 'success'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-slate-800 text-slate-500'
                  }`}>
                    {step.status}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 pl-5 mb-1.5">
                  {step.description}
                </div>

                <div className="font-mono text-[10px] text-indigo-300/80 pl-5 bg-slate-950/80 p-1.5 rounded border border-slate-800/80 truncate">
                  $ {step.command}
                </div>
              </div>
            ))}
          </div>

          {/* Real-time Streaming Output Console (5 cols) */}
          <div className="md:col-span-5 bg-slate-950 p-4 flex flex-col font-mono text-xs overflow-hidden">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400 text-[11px]">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>Console stdout & stderr</span>
              </span>
              <span className="text-[10px] text-slate-500">set -euo pipefail</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 text-slate-300 text-[11px] leading-relaxed select-text p-1">
              {activeConsoleLog.map((line, idx) => (
                <div 
                  key={idx} 
                  className={
                    line.includes('HEALTHY') || line.includes('READY') 
                      ? 'text-emerald-400 font-bold' 
                      : line.includes('Step') || line.includes('[step')
                      ? 'text-sky-300'
                      : 'text-slate-400'
                  }
                >
                  {line}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 p-3.5 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            {isRunning ? (
              <span className="flex items-center gap-2 text-indigo-300">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                <span>Executing stage {currentStepIdx + 1} of 8...</span>
              </span>
            ) : allFinished ? (
              <span className="flex items-center gap-2 text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>All 8 boot stages verified successfully. System convergence achieved.</span>
              </span>
            ) : (
              <span>Ready to start pipeline</span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              disabled={isRunning}
              onClick={startBootPipeline}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                isRunning
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Re-run Pipeline</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
