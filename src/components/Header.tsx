import React from 'react';
import { 
  Server, 
  ShieldCheck, 
  AlertTriangle, 
  Download, 
  Terminal, 
  ExternalLink, 
  RefreshCw,
  Copy,
  Check,
  Radio,
  Play,
  Bot
} from 'lucide-react';
import { DeploymentConfig } from '../types/desktop';

export type TabType = 'desktop' | 'watchdog' | 'scripts' | 'logs' | 'delivery' | 'config' | 'chat';

interface HeaderProps {
  config: DeploymentConfig;
  overallHealthy: boolean;
  onRegenerateId: () => void;
  onDownloadZip: () => void;
  onOpenNoVncModal: () => void;
  onOpenBootModal: () => void;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  overallHealthy,
  onRegenerateId,
  onDownloadZip,
  onOpenNoVncModal,
  onOpenBootModal,
  setActiveTab
}) => {
  const [copied, setCopied] = React.useState(false);

  const copyUrl = () => {
    navigator.clipboard.writeText(
      `https://${config.pinnedId}.sg.agentos-app.run/desktop/vnc.html?autoconnect=1&resize=scale&path=websockify`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 select-none">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Identity */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-red-500 to-amber-500 flex items-center justify-center shadow-lg shadow-red-950/40 border border-red-400/30">
            {/* Debian spiral logo emblem representation */}
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79.09-.39.43-.65.83-.65.48 0 .86.41.83.89-.09.5-.14 1.01-.14 1.55 0 3.31 2.69 6 6 6 .54 0 1.05-.05 1.55-.14.48-.03.89.35.89.83 0 .4-.26.74-.65.83-.58.13-1.17.21-1.79.21l-.78-.04zM16.5 13c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
            </svg>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Debian 13 Cloud Desktop Builder
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-red-950/80 border border-red-700/50 text-red-300">
                  Trixie • XFCE
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-sans">
              Improved Reliability Edition • Self-Healing Watchdog • Chroot Isolation • noVNC Gateway
            </p>
          </div>
        </div>

        {/* Status indicators & Quick Actions */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Health Badge */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium backdrop-blur-sm ${
            overallHealthy 
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' 
              : 'bg-amber-950/40 border-amber-500/40 text-amber-300 animate-pulse'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              overallHealthy ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
            }`} />
            <span className="font-semibold">{overallHealthy ? 'HEALTHY' : 'DEGRADED'}</span>
            <span className="text-[11px] text-slate-400 border-l border-slate-700/60 pl-2">
              4/4 Subsystems
            </span>
          </div>

          {/* Deployment ID Badge with Persistence Policy */}
          <div className="flex items-center bg-slate-800/90 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs">
            <Radio className="w-3.5 h-3.5 text-indigo-400 mr-1.5" />
            <span className="text-slate-400 mr-1">ID:</span>
            <span className="font-mono font-semibold text-indigo-300 mr-2">{config.pinnedId}</span>
            <button 
              onClick={onRegenerateId}
              title="Simulate Cold Boot (Regenerate .pinned_id)"
              className="text-slate-400 hover:text-slate-200 transition-colors p-0.5 rounded hover:bg-slate-700"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>

          {/* Standard Credentials Quick Tag */}
          <div className="hidden md:flex items-center bg-slate-800/80 border border-slate-700/60 rounded-lg px-2.5 py-1 text-xs font-mono text-slate-300">
            <span className="text-slate-400 mr-1.5">Auth:</span>
            <span className="text-emerald-400 font-semibold mr-1">{config.adminUser}</span>
            <span className="text-slate-500 mr-1">/</span>
            <span className="text-amber-300 font-semibold">{config.adminPass}</span>
          </div>

          {/* Action: Open Gemini Chatbot */}
          <button
            onClick={() => setActiveTab('chat')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-950/70 hover:bg-purple-900 text-purple-200 border border-purple-700/60 transition active:scale-95"
            title="Open Gemini AI Systems Assistant"
          >
            <Bot className="w-3.5 h-3.5 text-purple-400" />
            <span>AI Assistant</span>
          </button>

          {/* Action: Run boot.sh Pipeline */}
          <button
            onClick={onOpenBootModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/40 transition active:scale-95"
            title="Launch live 8-stage boot.sh pipeline simulation"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Simulate boot.sh</span>
          </button>

          {/* Action: Copy noVNC link */}
          <button
            onClick={copyUrl}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            title="Copy Direct noVNC URL"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied URL!' : 'Copy noVNC URL'}</span>
          </button>

          {/* Action: Download Full Stack ZIP */}
          <button
            onClick={onDownloadZip}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-950/40 transition active:scale-95"
            title="Download complete /workspace/debian13-server ZIP package"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download All (.zip)</span>
          </button>
        </div>
      </div>
    </header>
  );
};
