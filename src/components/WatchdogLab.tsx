import React, { useState } from 'react';
import { 
  ShieldAlert, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Zap, 
  Activity, 
  Terminal, 
  Flame, 
  Play, 
  Clock, 
  Server,
  Layers,
  Database
} from 'lucide-react';
import { ServiceStatus, ServiceName, DeploymentConfig } from '../types/desktop';
import { WatchdogTelemetryChart } from './WatchdogTelemetryChart';

interface WatchdogLabProps {
  services: ServiceStatus[];
  config: DeploymentConfig;
  onKillService: (name: ServiceName) => void;
  onRestartAll: () => void;
  onRunHealthCheck: () => void;
  onSimulateColdReboot: () => void;
  onSimulateWarmReboot: () => void;
}

export const WatchdogLab: React.FC<WatchdogLabProps> = ({
  services,
  config,
  onKillService,
  onRestartAll,
  onRunHealthCheck,
  onSimulateColdReboot,
  onSimulateWarmReboot
}) => {
  const [activeTestMessage, setActiveTestMessage] = useState<string | null>(null);

  const triggerChaos = (name: ServiceName) => {
    setActiveTestMessage(`Fault injected: Sent SIGKILL to ${name}. Autonomous watchdog monitoring loop activated...`);
    onKillService(name);
    setTimeout(() => {
      setActiveTestMessage(null);
    }, 4500);
  };

  const allHealthy = services.every(s => s.status === 'running');
  const totalRestarts = services.reduce((acc, s) => acc + s.restartCount, 0);

  return (
    <div className="space-y-6">
      {/* Hero Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-white">Autonomous Service Watchdog & Self-Healing Lab</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Monitors the 4 critical cloud desktop processes every 5 seconds. If any process terminates or stops responding, the watchdog executes idempotent recovery handlers, increments restart counters in <code className="text-slate-300 font-mono">state/restart_counters.json</code>, and logs the event to <code className="text-slate-300 font-mono">logs/watchdog.log</code>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Overall Health</div>
              <div className={`font-mono font-bold text-sm flex items-center justify-center gap-1.5 ${
                allHealthy ? 'text-emerald-400' : 'text-amber-400 animate-pulse'
              }`}>
                <span className={`w-2 h-2 rounded-full ${allHealthy ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                {allHealthy ? 'HEALTHY' : 'DEGRADED'}
              </div>
            </div>

            <div className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Total Heals</div>
              <div className="font-mono font-bold text-sm text-indigo-400">
                {totalRestarts} Restarts
              </div>
            </div>
          </div>
        </div>

        {/* Chaos notification banner */}
        {activeTestMessage && (
          <div className="mt-4 p-3 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between animate-fade-in">
            <span className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400 animate-spin" />
              {activeTestMessage}
            </span>
            <span className="text-[10px] font-mono bg-amber-900/60 px-2 py-0.5 rounded text-amber-300">
              Auto-Healing in ~3s
            </span>
          </div>
        )}
      </div>

      {/* Recharts Subsystem CPU & Memory Telemetry */}
      <WatchdogTelemetryChart services={services} />

      {/* 4 Monitored Subsystems Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {services.map((svc) => {
          const isRunning = svc.status === 'running';
          const isRestarting = svc.status === 'restarting';

          return (
            <div 
              key={svc.name}
              className={`rounded-xl border p-4 flex flex-col justify-between transition-all duration-200 shadow-md ${
                isRunning
                  ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                  : isRestarting
                  ? 'bg-amber-950/30 border-amber-500/50'
                  : 'bg-rose-950/30 border-rose-500/50'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1.5 ${
                    isRunning 
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : isRestarting
                      ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      isRunning ? 'bg-emerald-400' : isRestarting ? 'bg-amber-400' : 'bg-rose-500'
                    }`} />
                    {svc.status.toUpperCase()}
                  </span>

                  <span className="text-[11px] font-mono text-slate-400">
                    Restarts: <strong className="text-amber-300">{svc.restartCount}</strong>
                  </span>
                </div>

                {/* Subsystem Name */}
                <h3 className="text-sm font-bold text-white mb-1">{svc.displayName}</h3>
                <div className="text-[11px] font-mono text-slate-400 mb-3 truncate bg-slate-950/60 px-2 py-1 rounded border border-slate-800/80">
                  {svc.command}
                </div>

                {/* Telemetry rows */}
                <div className="space-y-1.5 text-xs text-slate-300 mb-4 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">PID:</span>
                    <span className="text-white font-semibold">{svc.pid || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Port / Target:</span>
                    <span className="text-indigo-300">{svc.port ? `:${svc.port}` : 'Display :1'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">CPU Usage:</span>
                    <span className="text-slate-300">{isRunning ? `${svc.cpuPercent.toFixed(1)}%` : '0.0%'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Resident Mem:</span>
                    <span className="text-slate-300">{isRunning ? `${svc.memoryMb} MB` : '0 MB'}</span>
                  </div>
                </div>
              </div>

              {/* Chaos Trigger Button */}
              <div>
                <button
                  disabled={!isRunning}
                  onClick={() => triggerChaos(svc.name)}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                    isRunning
                      ? 'bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 active:scale-98'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>{isRunning ? 'Kill Process (SIGKILL)' : 'Healing Active...'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Resilience Simulation Scenarios */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Resilience & Restart Policy Test Suite</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Test 1: Healthcheck Verification */}
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="font-semibold text-white mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Run /scripts/healthcheck.sh</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Validates the 4 strict requirements: FastAPI responding + Websockify running + TigerVNC running + xfce4-session running.
              </p>
            </div>
            <button
              onClick={onRunHealthCheck}
              className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-xs transition"
            >
              Execute Health Probe
            </button>
          </div>

          {/* Test 2: Warm Reboot with Persistent Storage */}
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="font-semibold text-white mb-1 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-indigo-400" />
                <span>Warm Container Restart</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Simulates host restart where <code className="text-indigo-300 font-mono">.pinned_id</code> survives in storage. Verifies best-effort URL persistence retention.
              </p>
            </div>
            <button
              onClick={onSimulateWarmReboot}
              className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-xs transition"
            >
              Simulate Warm Restart
            </button>
          </div>

          {/* Test 3: Cold Wipeout / Scratch Rebuild */}
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="font-semibold text-white mb-1 flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-amber-400" />
                <span>Cold Boot (Storage Recreated)</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Simulates new container provision without previous storage. Automatically provisions a fresh persistent identifier as mandated by policy.
              </p>
            </div>
            <button
              onClick={onSimulateColdReboot}
              className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium rounded-lg text-xs transition"
            >
              Simulate Cold Wipeout
            </button>
          </div>
        </div>
      </div>

      {/* State & Counters Persistence Inspector */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>State Directory Contents (/workspace/debian13-server/state/)</span>
          </h3>
          <span className="text-[11px] font-mono text-slate-400">JSON & Text metadata</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">state/deployment_id</div>
            <div className="font-bold text-indigo-300 mt-1">{config.pinnedId}</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">state/debian_uid</div>
            <div className="font-bold text-emerald-400 mt-1">{config.debianUid}</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">state/debian_gid</div>
            <div className="font-bold text-emerald-400 mt-1">{config.debianGid}</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">state/restart_counters.json</div>
            <div className="text-[11px] text-amber-300 mt-1 truncate">
              {JSON.stringify({
                Xtigervnc: services.find(s => s.name === 'Xtigervnc')?.restartCount || 0,
                xfce4: services.find(s => s.name === 'xfce4-session')?.restartCount || 0,
                websockify: services.find(s => s.name === 'websockify')?.restartCount || 0,
                gateway: services.find(s => s.name === 'fastapi-gateway')?.restartCount || 0,
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
