import React from 'react';
import { Settings, Shield, HardDrive, Monitor, Sliders, RefreshCw, Check } from 'lucide-react';
import { DeploymentConfig } from '../types/desktop';

interface ConfigSettingsProps {
  config: DeploymentConfig;
  onChangeConfig: (newConfig: DeploymentConfig) => void;
  onResetDefaults: () => void;
}

export const ConfigSettings: React.FC<ConfigSettingsProps> = ({
  config,
  onChangeConfig,
  onResetDefaults
}) => {
  const [savedNotice, setSavedNotice] = React.useState(false);

  const handleChange = (key: keyof DeploymentConfig, value: any) => {
    onChangeConfig({ ...config, [key]: value });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-white">Chroot & Orchestration Configuration</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Fine-tune environment parameters, authentication secrets, port allocations, and chroot bindings.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {savedNotice && (
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium animate-fade-in">
              <Check className="w-3.5 h-3.5" />
              Configuration Updated
            </span>
          )}
          <button
            onClick={onResetDefaults}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset to Standard Defaults</span>
          </button>
        </div>
      </div>

      {/* Grid of Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* Card 1: Standard Authentication */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
            <Shield className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">HTTP Basic & VNC Authentication</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-slate-400 block mb-1">Standard Admin Username</label>
              <input
                type="text"
                value={config.adminUser}
                onChange={(e) => handleChange('adminUser', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-indigo-500 outline-none"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Default: admin</span>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Standard Admin Password</label>
              <input
                type="text"
                value={config.adminPass}
                onChange={(e) => handleChange('adminPass', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-indigo-500 outline-none"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Default: 429888</span>
            </div>
          </div>
        </div>

        {/* Card 2: Network Ports */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
            <Monitor className="w-4 h-4 text-sky-400" />
            <h3 className="font-bold text-white text-sm">Network Port Allocation</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-slate-400 block mb-1">FastAPI Gateway Port</label>
              <input
                type="number"
                value={config.gatewayPort}
                onChange={(e) => handleChange('gatewayPort', parseInt(e.target.value) || 6080)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-indigo-500 outline-none"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Standard: 6080 (serves /healthz, noVNC, and proxy)</span>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Websockify Internal Port</label>
              <input
                type="number"
                value={config.websockifyPort}
                onChange={(e) => handleChange('websockifyPort', parseInt(e.target.value) || 6081)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-indigo-500 outline-none"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Standard: 6081</span>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">TigerVNC Server Port</label>
              <input
                type="number"
                value={config.vncPort}
                onChange={(e) => handleChange('vncPort', parseInt(e.target.value) || 5901)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-indigo-500 outline-none"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Standard: 5901 (Display :1)</span>
            </div>
          </div>
        </div>

        {/* Card 3: Dynamic User & Node.js */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
            <HardDrive className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-white text-sm">Chroot User & Runtime Detection</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-slate-400 block mb-1">Dynamic Desktop User Name</label>
              <input
                type="text"
                value={config.debianUser}
                onChange={(e) => handleChange('debianUser', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-indigo-500 outline-none"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Mandated: 'debian'</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 block mb-1">Detected UID</label>
                <input
                  type="number"
                  value={config.debianUid}
                  onChange={(e) => handleChange('debianUid', parseInt(e.target.value) || 1001)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Detected GID</label>
                <input
                  type="number"
                  value={config.debianGid}
                  onChange={(e) => handleChange('debianGid', parseInt(e.target.value) || 1001)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-indigo-500 outline-none"
                />
              </div>
            </div>
            <span className="text-[10px] text-slate-500 block">
              UID/GID detected dynamically via <code className="font-mono text-slate-400">id -u debian</code> to avoid fixed UID 1000 collision.
            </span>
          </div>
        </div>

        {/* Card 4: Node.js & Chroot Path */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
            <Settings className="w-4 h-4 text-violet-400" />
            <h3 className="font-bold text-white text-sm">Chroot Path & Node.js Engine</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-slate-400 block mb-1">Chroot Root Directory</label>
              <input
                type="text"
                value={config.chrootPath}
                onChange={(e) => handleChange('chrootPath', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-indigo-500 outline-none"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Standard: /srv/debian13</span>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Node.js Target Version</label>
              <input
                type="text"
                value={config.nodeVersion}
                onChange={(e) => handleChange('nodeVersion', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-indigo-500 outline-none"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Node 22 LTS with symlinks in /usr/local/bin</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
