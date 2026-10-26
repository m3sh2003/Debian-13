import React, { useState } from 'react';
import { Globe, ArrowLeft, ArrowRight, RotateCw, Shield, Lock, ExternalLink, Check } from 'lucide-react';
import { DeploymentConfig } from '../../types/desktop';

interface BrowserProps {
  config: DeploymentConfig;
  onOpenDirectNoVnc: () => void;
}

export const BrowserWindow: React.FC<BrowserProps> = ({ config, onOpenDirectNoVnc }) => {
  const [url, setUrl] = useState(`http://localhost:${config.gatewayPort}/healthz`);
  const [activeTab, setActiveTab] = useState<'health' | 'novnc' | 'fastapi'>('health');
  const [authEnteredUser, setAuthEnteredUser] = useState(config.adminUser);
  const [authEnteredPass, setAuthEnteredPass] = useState(config.adminPass);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  return (
    <div className="h-full flex flex-col bg-slate-900 text-slate-100 select-text overflow-hidden font-sans">
      {/* Browser Tab Bar */}
      <div className="bg-slate-950 px-2 pt-2 flex items-center space-x-1 border-b border-slate-800">
        <button
          onClick={() => {
            setActiveTab('health');
            setUrl(`http://localhost:${config.gatewayPort}/healthz`);
          }}
          className={`px-3 py-1.5 text-xs font-medium rounded-t-lg flex items-center space-x-1.5 transition ${
            activeTab === 'health'
              ? 'bg-slate-800 text-white border-t-2 border-indigo-500'
              : 'text-slate-400 hover:bg-slate-900'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>FastAPI Healthcheck</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('novnc');
            setUrl(`http://localhost:${config.gatewayPort}/desktop/vnc.html`);
          }}
          className={`px-3 py-1.5 text-xs font-medium rounded-t-lg flex items-center space-x-1.5 transition ${
            activeTab === 'novnc'
              ? 'bg-slate-800 text-white border-t-2 border-indigo-500'
              : 'text-slate-400 hover:bg-slate-900'
          }`}
        >
          <Lock className="w-3 h-3 text-amber-400" />
          <span>noVNC Web Portal</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('fastapi');
            setUrl(`http://localhost:${config.gatewayPort}/`);
          }}
          className={`px-3 py-1.5 text-xs font-medium rounded-t-lg flex items-center space-x-1.5 transition ${
            activeTab === 'fastapi'
              ? 'bg-slate-800 text-white border-t-2 border-indigo-500'
              : 'text-slate-400 hover:bg-slate-900'
          }`}
        >
          <Globe className="w-3 h-3 text-sky-400" />
          <span>Root / Gateway</span>
        </button>
      </div>

      {/* Navigation URL Bar */}
      <div className="bg-slate-800 px-3 py-1.5 flex items-center space-x-2 border-b border-slate-700 text-xs">
        <div className="flex items-center space-x-1 text-slate-400">
          <ArrowLeft className="w-3.5 h-3.5 hover:text-white cursor-pointer" />
          <ArrowRight className="w-3.5 h-3.5 hover:text-white cursor-pointer" />
          <RotateCw className="w-3.5 h-3.5 hover:text-white cursor-pointer" />
        </div>

        <div className="flex-1 bg-slate-950 border border-slate-700 rounded px-2.5 py-1 flex items-center space-x-2">
          <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full bg-transparent text-slate-200 outline-none font-mono text-xs"
          />
        </div>

        <button 
          onClick={onOpenDirectNoVnc}
          className="text-[11px] px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1 font-medium"
        >
          <ExternalLink className="w-3 h-3" />
          <span>Popout noVNC</span>
        </button>
      </div>

      {/* Browser Viewport Content */}
      <div className="flex-1 bg-slate-950 p-4 overflow-y-auto">
        {activeTab === 'health' && (
          <div className="max-w-xl mx-auto mt-4 p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-bold text-white">HTTP 200 OK — Open Health Endpoint</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Port {config.gatewayPort}</span>
            </div>

            <pre className="p-3 bg-slate-950 rounded-lg text-emerald-400 font-mono text-xs leading-relaxed border border-slate-800">
{`{
  "status": "ok",
  "service": "debian13-fastapi-gateway",
  "desktop": "xfce4",
  "version": "1.0.0-improved-reliability",
  "auth_required": false,
  "endpoints": {
    "root": "/",
    "desktop": "/desktop/vnc.html",
    "websockify": "ws://localhost:6080/websockify"
  }
}`}
            </pre>
            <p className="text-xs text-slate-400">
              As per specifications, the <code className="text-amber-300 font-mono">/healthz</code> route is unauthenticated so healthcheck probes and load balancers verify subsystem responsiveness without leaking admin credentials.
            </p>
          </div>
        )}

        {activeTab === 'novnc' && (
          <div className="max-w-xl mx-auto mt-2 p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
              <Shield className="w-5 h-5 text-indigo-400" />
              <div>
                <h4 className="font-bold text-sm text-white">HTTP Basic Authentication Required</h4>
                <p className="text-xs text-slate-400">Protected route: /desktop/vnc.html</p>
              </div>
            </div>

            <div className="p-3 bg-indigo-950/30 border border-indigo-800/40 rounded-lg text-xs text-indigo-200">
              Standard credentials configured across the cloud desktop builder:
              <div className="font-mono mt-1 text-slate-300">
                User: <span className="text-emerald-400 font-bold">{config.adminUser}</span> | Password: <span className="text-amber-300 font-bold">{config.adminPass}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Username</label>
                <input
                  type="text"
                  value={authEnteredUser}
                  onChange={(e) => setAuthEnteredUser(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Password</label>
                <input
                  type="password"
                  value={authEnteredPass}
                  onChange={(e) => setAuthEnteredPass(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-white"
                />
              </div>
              <button
                onClick={() => {
                  if (authEnteredUser === config.adminUser && authEnteredPass === config.adminPass) {
                    setIsAuthenticated(true);
                  } else {
                    alert('Invalid credentials! Expected admin / 429888');
                  }
                }}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-lg transition"
              >
                Log In to noVNC
              </button>
            </div>

            {isAuthenticated && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-600/40 rounded-lg text-emerald-300 text-xs flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  Authenticated Session Active (admin)
                </span>
                <button
                  onClick={onOpenDirectNoVnc}
                  className="underline hover:text-white font-semibold"
                >
                  View Canvas
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'fastapi' && (
          <div className="max-w-xl mx-auto mt-4 p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <h4 className="font-bold text-white text-sm">FastAPI Root Endpoint (/)</h4>
            <p className="text-xs text-slate-300">
              The root route redirects authenticated clients directly to noVNC with automatic parameter configuration:
            </p>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded font-mono text-xs text-indigo-300 break-all">
              /desktop/vnc.html?autoconnect=1&resize=scale&path=websockify
            </div>
            <div className="text-xs text-slate-400 space-y-2">
              <p>• <span className="text-slate-200 font-semibold">autoconnect=1</span>: Initiates remote RFB handshake instantly.</p>
              <p>• <span className="text-slate-200 font-semibold">resize=scale</span>: Dynamically adapts desktop viewport to client window.</p>
              <p>• <span className="text-slate-200 font-semibold">path=websockify</span>: Routes WebSocket traffic via the FastAPI proxy on port 6080 to websockify port 6081.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
