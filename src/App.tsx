/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { 
  Monitor, 
  ShieldCheck, 
  Code2, 
  Terminal, 
  FileCheck2, 
  Sliders, 
  Download, 
  Check, 
  AlertTriangle,
  Play,
  Bot
} from 'lucide-react';
import { DeploymentConfig, ServiceStatus, LogEntry, ServiceName } from './types/desktop';
import { SCRIPTS } from './data/scriptsData';
import { INITIAL_LOGS } from './data/defaultLogs';
import { Header } from './components/Header';
import { NoVncViewer } from './components/VirtualDesktop/NoVncViewer';
import { WatchdogLab } from './components/WatchdogLab';
import { ScriptViewer } from './components/ScriptViewer';
import { LogsViewer } from './components/LogsViewer';
import { DeliveryReport } from './components/DeliveryReport';
import { ConfigSettings } from './components/ConfigSettings';
import { BootSequenceModal } from './components/BootSequenceModal';
import { GeminiChatbot } from './components/GeminiChatbot';
import { ChrootFile, ResolutionPreset, RESOLUTION_PRESETS, INITIAL_CHROOT_FILES } from './types/files';

export default function App() {
  const [isBootModalOpen, setIsBootModalOpen] = useState(false);
  const [chrootFiles, setChrootFiles] = useState<ChrootFile[]>(INITIAL_CHROOT_FILES);
  const [currentPreset, setCurrentPreset] = useState<ResolutionPreset>(RESOLUTION_PRESETS[0]);
  const [currentDpi, setCurrentDpi] = useState<number>(1.0);
  // 1. Core Deployment Configuration
  const [config, setConfig] = useState<DeploymentConfig>({
    pinnedId: 'c9b2f8a14e6d3091',
    domain: 'sg.agentos-app.run',
    adminUser: 'admin',
    adminPass: '429888',
    gatewayPort: 6080,
    websockifyPort: 6081,
    vncDisplay: 1,
    vncPort: 5901,
    debianUser: 'debian',
    debianUid: 1001,
    debianGid: 1001,
    nodeVersion: 'v22.14.0',
    chrootPath: '/srv/debian13',
    autoConnect: true,
    scaleMode: 'scale'
  });

  // 2. Monitored Subsystems for Watchdog
  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: 'Xtigervnc',
      displayName: 'TigerVNC Server (:1)',
      command: 'Xtigervnc :1 -geometry 1920x1080 -depth 24 -rfbport 5901',
      port: 5901,
      pid: 405,
      status: 'running',
      uptimeSeconds: 840,
      restartCount: 0,
      cpuPercent: 0.8,
      memoryMb: 48,
      lastChecked: 'Just now'
    },
    {
      name: 'xfce4-session',
      displayName: 'XFCE4 Desktop Session',
      command: 'startxfce4 (user: debian, display: :1)',
      pid: 412,
      status: 'running',
      uptimeSeconds: 838,
      restartCount: 0,
      cpuPercent: 1.2,
      memoryMb: 64,
      lastChecked: 'Just now'
    },
    {
      name: 'websockify',
      displayName: 'Websockify Bridge',
      command: 'websockify --web /usr/share/novnc 6081 localhost:5901',
      port: 6081,
      pid: 420,
      status: 'running',
      uptimeSeconds: 835,
      restartCount: 0,
      cpuPercent: 0.2,
      memoryMb: 24,
      lastChecked: 'Just now'
    },
    {
      name: 'fastapi-gateway',
      displayName: 'FastAPI Gateway & Proxy',
      command: 'python3 gateway.py (port: 6080, auth: admin)',
      port: 6080,
      pid: 438,
      status: 'running',
      uptimeSeconds: 832,
      restartCount: 0,
      cpuPercent: 0.4,
      memoryMb: 36,
      healthUrl: 'http://127.0.0.1:6080/healthz',
      lastChecked: 'Just now'
    }
  ]);

  // 3. Log Stream State
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);

  // 4. Active Tab
  const [activeTab, setActiveTab] = useState<'desktop' | 'watchdog' | 'scripts' | 'logs' | 'delivery' | 'config' | 'chat'>('desktop');

  // 5. Toast Feedback
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'success' | 'warn' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warn' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const addLog = (
    file: LogEntry['file'],
    level: LogEntry['level'],
    message: string
  ) => {
    const newEntry: LogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      file,
      level,
      message
    };
    setLogs(prev => [...prev, newEntry]);
  };

  // Autonomous Watchdog Self-Healing Logic
  useEffect(() => {
    const downService = services.find(s => s.status === 'stopped' || s.status === 'failed');
    if (!downService) return;

    // Trigger recovery sequence
    const serviceName = downService.name;
    const timer = setTimeout(() => {
      // Step 1: Transition to 'restarting'
      setServices(prev =>
        prev.map(s =>
          s.name === serviceName ? { ...s, status: 'restarting' } : s
        )
      );

      addLog(
        'watchdog.log',
        'WARN',
        `[watchdog] ALERT: Process ${serviceName} detected DEAD. Invoking automated recovery handler...`
      );

      // Step 2: Complete recovery after 1.5s
      setTimeout(() => {
        const newPid = Math.floor(500 + Math.random() * 800);
        setServices(prev =>
          prev.map(s =>
            s.name === serviceName
              ? {
                  ...s,
                  status: 'running',
                  pid: newPid,
                  restartCount: s.restartCount + 1,
                  uptimeSeconds: 1
                }
              : s
          )
        );

        addLog(
          'watchdog.log',
          'SUCCESS',
          `[watchdog] RECOVERED: ${serviceName} successfully revived (new PID: ${newPid}). Health status restored.`
        );

        showToast(`Watchdog auto-healed ${serviceName} (PID ${newPid})`, 'success');
      }, 1500);
    }, 1800);

    return () => clearTimeout(timer);
  }, [services]);

  // Live Subsystem Telemetry Simulation (CPU % & Memory MB)
  useEffect(() => {
    const metricTimer = setInterval(() => {
      setServices(prev =>
        prev.map(s => {
          if (s.status !== 'running') {
            return s;
          }

          let baseCpu = 0.5;
          let baseMem = 30;

          if (s.name === 'Xtigervnc') {
            baseCpu = 0.7 + (Math.random() * 0.6);
            baseMem = 48 + Math.floor(Math.random() * 4);
          } else if (s.name === 'xfce4-session') {
            baseCpu = 1.0 + (Math.random() * 0.8);
            baseMem = 64 + Math.floor(Math.random() * 5);
          } else if (s.name === 'websockify') {
            baseCpu = 0.2 + (Math.random() * 0.3);
            baseMem = 24 + Math.floor(Math.random() * 3);
          } else if (s.name === 'fastapi-gateway') {
            baseCpu = 0.3 + (Math.random() * 0.4);
            baseMem = 36 + Math.floor(Math.random() * 3);
          }

          return {
            ...s,
            cpuPercent: +baseCpu.toFixed(1),
            memoryMb: baseMem,
            uptimeSeconds: s.uptimeSeconds + 3,
            lastChecked: 'Just now'
          };
        })
      );
    }, 3000);

    return () => clearInterval(metricTimer);
  }, []);

  // Periodic Watchdog heartbeat
  useEffect(() => {
    const interval = setInterval(() => {
      const allUp = services.every(s => s.status === 'running');
      if (allUp) {
        addLog(
          'watchdog.log',
          'INFO',
          `[watchdog] Heartbeat: [Xtigervnc: OK] [xfce4-session: OK] [websockify: OK] [fastapi-gateway: OK]`
        );
      }
    }, 20000);
    return () => clearInterval(interval);
  }, [services]);

  // Handler: Kill a service (Chaos injection)
  const handleKillService = (name: ServiceName) => {
    setServices(prev =>
      prev.map(s =>
        s.name === name ? { ...s, status: 'stopped', pid: null } : s
      )
    );
    addLog(
      'watchdog.log',
      'ERROR',
      `[chaos-drill] Process '${name}' terminated abruptly (SIGKILL). Watchdog alarm tripped!`
    );
    showToast(`Injected failure into ${name}. Watchdog responding...`, 'warn');
  };

  // Handler: Run health check probe
  const handleRunHealthCheck = () => {
    const isHealthy = services.every(s => s.status === 'running');
    addLog('bootstrap.log', 'INFO', '[healthcheck.sh] Invoking 4-point health verification...');
    if (isHealthy) {
      addLog('bootstrap.log', 'SUCCESS', '[healthcheck.sh] Result: HEALTHY (All 4 core subsystems operational).');
      showToast('Health verification PASSED: All 4 subsystems operational', 'success');
    } else {
      addLog('bootstrap.log', 'WARN', '[healthcheck.sh] Result: UNHEALTHY (One or more subsystems degraded).');
      showToast('Health verification WARN: Subsystems undergoing auto-recovery', 'warn');
    }
  };

  // Handler: Regenerate Pinned ID (simulate cold boot wipeout)
  const handleRegenerateId = () => {
    const newId = Array.from({ length: 16 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    setConfig(prev => ({ ...prev, pinnedId: newId }));
    addLog(
      'bootstrap.log',
      'INFO',
      `[boot.sh] Storage recreated from scratch. Generated new deployment identifier: ${newId}`
    );
    showToast(`Generated new persistent deployment ID: ${newId}`, 'info');
  };

  // Handler: Warm restart simulation
  const handleWarmRestart = () => {
    addLog(
      'bootstrap.log',
      'INFO',
      `[boot.sh] Warm container restart detected. Reusing existing .pinned_id (${config.pinnedId}).`
    );
    showToast(`Warm restart: Reused persistent ID ${config.pinnedId}`, 'success');
  };

  // Handler: Chroot File Upload
  const handleUploadFile = (file: ChrootFile) => {
    setChrootFiles(prev => [file, ...prev.filter(f => f.id !== file.id)]);
    addLog(
      'chroot.log',
      'INFO',
      `[chroot-storage] Transferred '${file.name}' (${(file.sizeBytes / 1024).toFixed(1)} KB) into /home/debian/Downloads/`
    );
    showToast(`Transferred '${file.name}' into chroot filesystem`, 'success');
  };

  // Handler: Chroot File Delete
  const handleDeleteFile = (id: string) => {
    const file = chrootFiles.find(f => f.id === id);
    setChrootFiles(prev => prev.filter(f => f.id !== id));
    if (file) {
      addLog('chroot.log', 'INFO', `[chroot-storage] Removed '${file.name}' from chroot filesystem`);
      showToast(`Removed '${file.name}' from chroot`, 'info');
    }
  };

  // Handler: Dynamic Display Geometry (xrandr)
  const handleApplyResolution = (preset: ResolutionPreset, dpi: number) => {
    setCurrentPreset(preset);
    setCurrentDpi(dpi);
    setConfig(prev => ({ ...prev, vncDisplay: 1 }));
    addLog(
      'vnc.log',
      'INFO',
      `[desktop] xrandr applied dynamic geometry: ${preset.width}x${preset.height} at ${Math.round(dpi * 96)} DPI (${preset.name})`
    );
    showToast(`Display updated to ${preset.width}x${preset.height} (${dpi}x DPI)`, 'success');
  };

  // Handler: PipeWire Audio Stream Event
  const handleAudioEvent = (message: string) => {
    addLog('vnc.log', 'INFO', `[pipewire-audio] ${message}`);
  };

  // Handler: Download entire stack as ZIP
  const handleDownloadZip = async () => {
    try {
      const zip = new JSZip();

      // Top level files
      zip.file('.pinned_id', config.pinnedId + '\n');

      const readme = SCRIPTS.find(s => s.name === 'README.md')?.content || '';
      zip.file('README.md', readme);

      const dockerfile = SCRIPTS.find(s => s.name === 'Dockerfile')?.content || '';
      zip.file('Dockerfile', dockerfile);

      const compose = SCRIPTS.find(s => s.name === 'docker-compose.yml')?.content || '';
      zip.file('docker-compose.yml', compose);

      // scripts directory
      const scriptsFolder = zip.folder('scripts');
      SCRIPTS.filter(s => s.path.includes('/scripts/')).forEach(script => {
        scriptsFolder?.file(script.name, script.content);
      });

      // systemd directory
      const systemdFolder = zip.folder('systemd');
      const serviceUnit = SCRIPTS.find(s => s.name === 'debian13-cloud-desktop.service')?.content || '';
      systemdFolder?.file('debian13-cloud-desktop.service', serviceUnit);

      // state directory
      const stateFolder = zip.folder('state');
      stateFolder?.file('deployment_id', config.pinnedId + '\n');
      stateFolder?.file('debian_uid', config.debianUid + '\n');
      stateFolder?.file('debian_gid', config.debianGid + '\n');
      stateFolder?.file(
        'restart_counters.json',
        JSON.stringify(
          {
            Xtigervnc: services.find(s => s.name === 'Xtigervnc')?.restartCount || 0,
            xfce4: services.find(s => s.name === 'xfce4-session')?.restartCount || 0,
            websockify: services.find(s => s.name === 'websockify')?.restartCount || 0,
            gateway: services.find(s => s.name === 'fastapi-gateway')?.restartCount || 0
          },
          null,
          2
        )
      );

      // logs directory
      const logsFolder = zip.folder('logs');
      logsFolder?.file('bootstrap.log', logs.filter(l => l.file === 'bootstrap.log').map(l => `[${l.timestamp}] [${l.level}] ${l.message}`).join('\n') + '\n');
      logsFolder?.file('chroot.log', logs.filter(l => l.file === 'chroot.log').map(l => `[${l.timestamp}] [${l.level}] ${l.message}`).join('\n') + '\n');
      logsFolder?.file('vnc.log', logs.filter(l => l.file === 'vnc.log').map(l => `[${l.timestamp}] [${l.level}] ${l.message}`).join('\n') + '\n');
      logsFolder?.file('gateway.log', logs.filter(l => l.file === 'gateway.log').map(l => `[${l.timestamp}] [${l.level}] ${l.message}`).join('\n') + '\n');
      logsFolder?.file('watchdog.log', logs.filter(l => l.file === 'watchdog.log').map(l => `[${l.timestamp}] [${l.level}] ${l.message}`).join('\n') + '\n');

      // User chroot files (/srv/debian13/home/debian/)
      const chrootHome = zip.folder('srv')?.folder('debian13')?.folder('home')?.folder('debian');
      chrootFiles.forEach(f => {
        chrootHome?.file(f.name, f.content || '');
      });

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `debian13-server-${config.pinnedId}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast('Downloaded full debian13-server ZIP package!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to create ZIP package', 'warn');
    }
  };

  const overallHealthy = services.every(s => s.status === 'running');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Toast Banner */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce">
          <div className={`px-4 py-2.5 rounded-xl shadow-2xl border text-xs font-medium flex items-center gap-2 backdrop-blur-md ${
            toast.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/60 text-emerald-200'
              : toast.type === 'warn'
              ? 'bg-amber-950/90 border-amber-500/60 text-amber-200'
              : 'bg-indigo-950/90 border-indigo-500/60 text-indigo-200'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              toast.type === 'success' ? 'bg-emerald-400' : toast.type === 'warn' ? 'bg-amber-400' : 'bg-indigo-400'
            }`} />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* 1. Header */}
      <Header
        config={config}
        overallHealthy={overallHealthy}
        onRegenerateId={handleRegenerateId}
        onDownloadZip={handleDownloadZip}
        onOpenNoVncModal={() => setActiveTab('desktop')}
        onOpenBootModal={() => setIsBootModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Boot Pipeline Simulator Modal */}
      <BootSequenceModal
        isOpen={isBootModalOpen}
        onClose={() => setIsBootModalOpen(false)}
        config={config}
        onComplete={() => showToast('8-step boot.sh pipeline verified', 'success')}
      />

      {/* 2. Navigation Tabs */}
      <nav className="bg-slate-900/80 border-b border-slate-800 sticky top-0 z-40 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center space-x-1 overflow-x-auto py-2">
          <button
            onClick={() => setActiveTab('desktop')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'desktop'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>Live Cloud Desktop</span>
          </button>

          <button
            onClick={() => setActiveTab('watchdog')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'watchdog'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Watchdog & Self-Healing</span>
            {!overallHealthy && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping ml-1" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('scripts')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'scripts'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Code2 className="w-4 h-4 text-sky-400" />
            <span>Codebase & Scripts</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'logs'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>Live Logs Terminal</span>
          </button>

          <button
            onClick={() => setActiveTab('delivery')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'delivery'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <FileCheck2 className="w-4 h-4 text-violet-400" />
            <span>Delivery Report & Access</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition border ${
              activeTab === 'chat'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-950/50 border-purple-500'
                : 'text-purple-300 hover:text-white hover:bg-purple-950/40 border-purple-900/60 bg-purple-950/20'
            }`}
          >
            <Bot className="w-4 h-4 text-purple-400" />
            <span>Gemini AI Assistant</span>
            <span className="text-[10px] font-mono font-bold bg-purple-900 text-purple-200 px-1 rounded border border-purple-700">AI</span>
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'config'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4 text-slate-400" />
            <span>Config & Chroot Settings</span>
          </button>
        </div>
      </nav>

      {/* 3. Main Body Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {activeTab === 'desktop' && (
          <NoVncViewer
            config={config}
            services={services}
            onKillService={handleKillService}
            onRunHealthCheck={handleRunHealthCheck}
            files={chrootFiles}
            onUploadFile={handleUploadFile}
            onDeleteFile={handleDeleteFile}
            currentPreset={currentPreset}
            currentDpi={currentDpi}
            onApplyResolution={handleApplyResolution}
            onAudioEvent={handleAudioEvent}
          />
        )}

        {activeTab === 'watchdog' && (
          <WatchdogLab
            services={services}
            config={config}
            onKillService={handleKillService}
            onRestartAll={() => {
              setServices(prev => prev.map(s => ({ ...s, status: 'running', restartCount: s.restartCount + 1 })));
              showToast('Restarted all 4 subsystems', 'success');
            }}
            onRunHealthCheck={handleRunHealthCheck}
            onSimulateColdReboot={handleRegenerateId}
            onSimulateWarmReboot={handleWarmRestart}
          />
        )}

        {activeTab === 'scripts' && (
          <ScriptViewer onDownloadZip={handleDownloadZip} />
        )}

        {activeTab === 'logs' && (
          <LogsViewer
            logs={logs}
            onClearLogs={() => setLogs([])}
          />
        )}

        {activeTab === 'delivery' && (
          <DeliveryReport
            config={config}
            services={services}
            onRegenerateId={handleRegenerateId}
          />
        )}

        {activeTab === 'config' && (
          <ConfigSettings
            config={config}
            onChangeConfig={setConfig}
            onResetDefaults={() => {
              setConfig({
                pinnedId: 'c9b2f8a14e6d3091',
                domain: 'sg.agentos-app.run',
                adminUser: 'admin',
                adminPass: '429888',
                gatewayPort: 6080,
                websockifyPort: 6081,
                vncDisplay: 1,
                vncPort: 5901,
                debianUser: 'debian',
                debianUid: 1001,
                debianGid: 1001,
                nodeVersion: 'v22.14.0',
                chrootPath: '/srv/debian13',
                autoConnect: true,
                scaleMode: 'scale'
              });
              showToast('Configuration restored to specifications defaults', 'info');
            }}
          />
        )}

        {activeTab === 'chat' && (
          <div className="h-[760px] rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
            <GeminiChatbot />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-6 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2 font-mono">
          <span>Debian 13 (Trixie) Cloud Desktop Builder</span>
          <span>•</span>
          <span className="text-slate-400">noVNC :6080 → Websockify :6081 → TigerVNC :5901</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-slate-400 font-mono">admin / 429888</span>
          <span className="text-emerald-400 font-semibold">Self-Healing Watchdog Active</span>
        </div>
      </footer>
    </div>
  );
}
