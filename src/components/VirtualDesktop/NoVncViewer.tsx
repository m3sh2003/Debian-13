import React, { useState } from 'react';
import { 
  Monitor, 
  Power, 
  Clipboard, 
  Keyboard, 
  Maximize, 
  Minimize, 
  Settings, 
  ShieldCheck, 
  Check, 
  RotateCw,
  Sliders,
  ExternalLink,
  Folder,
  Tv,
  Music,
  Upload
} from 'lucide-react';
import { DeploymentConfig, ServiceStatus, ServiceName } from '../../types/desktop';
import { ChrootFile, ResolutionPreset } from '../../types/files';
import { XfceDesktop } from './XfceDesktop';
import { AudioBridgeBar } from '../AudioBridgeBar';
import { ChrootFileManagerModal } from '../ChrootFileManagerModal';
import { ResolutionSelectorModal } from '../ResolutionSelectorModal';
import { audioBridge } from '../../utils/audioBridge';

interface NoVncViewerProps {
  config: DeploymentConfig;
  services: ServiceStatus[];
  onKillService: (serviceName: ServiceName) => void;
  onRunHealthCheck: () => void;
  files: ChrootFile[];
  onUploadFile: (file: ChrootFile) => void;
  onDeleteFile: (id: string) => void;
  currentPreset: ResolutionPreset;
  currentDpi: number;
  onApplyResolution: (preset: ResolutionPreset, dpi: number) => void;
  onAudioEvent?: (message: string) => void;
}

export const NoVncViewer: React.FC<NoVncViewerProps> = ({
  config,
  services,
  onKillService,
  onRunHealthCheck,
  files,
  onUploadFile,
  onDeleteFile,
  currentPreset,
  currentDpi,
  onApplyResolution,
  onAudioEvent
}) => {
  const [isConnected, setIsConnected] = useState(true);
  const [clipboardOpen, setClipboardOpen] = useState(false);
  const [clipboardText, setClipboardText] = useState('Debian 13 Trixie Cloud Desktop');
  const [copiedNotice, setCopiedNotice] = useState(false);
  const [scaleMode, setScaleMode] = useState<'scale' | 'normal'>('scale');
  const [viewMode, setViewMode] = useState<'novnc' | 'xfce'>('novnc');
  const [fps, setFps] = useState(60);
  const [latencyMs, setLatencyMs] = useState(14);
  const [isFileManagerOpen, setIsFileManagerOpen] = useState(false);
  const [isResolutionOpen, setIsResolutionOpen] = useState(false);
  const [isDragOverContainer, setIsDragOverContainer] = useState(false);

  const directUrl = `https://${config.pinnedId}.sg.agentos-app.run/desktop/vnc.html?autoconnect=1&resize=scale&path=websockify`;

  const copyUrl = () => {
    navigator.clipboard.writeText(directUrl);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2000);
  };

  const handleContainerDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverContainer(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        const file = e.dataTransfer.files[i];
        const text = await file.text().catch(() => '[Binary file content]');
        const newFile: ChrootFile = {
          id: `drop-${Date.now()}-${i}`,
          name: file.name,
          path: `/home/debian/Downloads/${file.name}`,
          sizeBytes: file.size,
          type: file.type || 'application/octet-stream',
          lastModified: new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC',
          isDir: false,
          content: text
        };
        onUploadFile(newFile);
      }
      audioBridge.playSystemChime();
      onAudioEvent?.(`File transferred into /home/debian/Downloads/ via drag-drop`);
    }
  };

  return (
    <div className="space-y-3 font-sans">
      {/* Modals */}
      <ChrootFileManagerModal
        isOpen={isFileManagerOpen}
        onClose={() => setIsFileManagerOpen(false)}
        files={files}
        onUploadFile={onUploadFile}
        onDeleteFile={onDeleteFile}
      />

      <ResolutionSelectorModal
        isOpen={isResolutionOpen}
        onClose={() => setIsResolutionOpen(false)}
        currentPreset={currentPreset}
        currentDpi={currentDpi}
        onApplyResolution={onApplyResolution}
      />

      {/* Top Banner & Mode Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
            <Monitor className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-white text-sm">noVNC Graphical Gateway Interface</h3>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700/50 text-emerald-300">
                RFB 3.8 • Port 6080
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Websockify translates WebSocket frames from <span className="font-mono text-slate-300">:6081</span> directly into native TigerVNC protocol on <span className="font-mono text-slate-300">:5901</span>.
            </p>
          </div>
        </div>

        {/* View Switcher & Action buttons */}
        <div className="flex items-center space-x-2">
          <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 flex items-center space-x-1 text-xs">
            <button
              onClick={() => setViewMode('novnc')}
              className={`px-3 py-1 rounded font-medium transition ${
                viewMode === 'novnc'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              noVNC Web Client
            </button>
            <button
              onClick={() => setViewMode('xfce')}
              className={`px-3 py-1 rounded font-medium transition ${
                viewMode === 'xfce'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Virtual Desktop Canvas
            </button>
          </div>

          <button
            onClick={copyUrl}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition"
            title="Copy noVNC Direct Link"
          >
            {copiedNotice ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <ExternalLink className="w-3.5 h-3.5" />}
            <span>{copiedNotice ? 'Copied!' : 'Copy Direct Link'}</span>
          </button>
        </div>
      </div>

      {/* Audio Streaming Bridge Toolbar */}
      <AudioBridgeBar onAudioEvent={onAudioEvent} />

      {viewMode === 'novnc' ? (
        /* noVNC Interface Container */
        <div 
          onDragOver={(e) => { e.preventDefault(); setIsDragOverContainer(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragOverContainer(false); }}
          onDrop={handleContainerDrop}
          className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl flex flex-col relative"
        >
          {/* Drag Overlay for noVNC viewport */}
          {isDragOverContainer && (
            <div className="absolute inset-0 z-50 bg-indigo-950/85 backdrop-blur-sm border-2 border-dashed border-indigo-400 flex flex-col items-center justify-center text-white pointer-events-none animate-fade-in">
              <Upload className="w-16 h-16 text-indigo-400 mb-3 animate-bounce" />
              <h3 className="text-lg font-bold">Transfer files into /home/debian/Downloads/</h3>
              <p className="text-xs text-indigo-200 mt-1">
                Drop to dispatch through noVNC gateway tunnel.
              </p>
            </div>
          )}

          {/* Authentic noVNC Control Bar */}
          <div className="bg-slate-900 border-b border-slate-800 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
            {/* Left side actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsConnected(!isConnected)}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded border text-xs font-semibold transition ${
                  isConnected
                    ? 'bg-rose-950/60 border-rose-700 text-rose-300 hover:bg-rose-900'
                    : 'bg-emerald-950/60 border-emerald-700 text-emerald-300 hover:bg-emerald-900'
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                <span>{isConnected ? 'Disconnect' : 'Connect'}</span>
              </button>

              <button
                onClick={() => setClipboardOpen(!clipboardOpen)}
                className={`p-1.5 rounded border ${
                  clipboardOpen ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
                title="Clipboard Sharing"
              >
                <Clipboard className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  audioBridge.playTerminalBeep();
                  alert('Sent Ctrl+Alt+Del signal to Xtigervnc display :1');
                }}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-mono"
                title="Send Ctrl+Alt+Del"
              >
                Ctrl+Alt+Del
              </button>

              {/* Dynamic Resolution Trigger Button */}
              <button
                onClick={() => setIsResolutionOpen(true)}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 text-[11px] font-mono flex items-center space-x-1.5 transition"
                title="Change display resolution and HiDPI scaling"
              >
                <Tv className="w-3 h-3 text-sky-400" />
                <span>{currentPreset.width}×{currentPreset.height} ({currentDpi}x)</span>
              </button>

              {/* File Transfer Hub Trigger Button */}
              <button
                onClick={() => setIsFileManagerOpen(true)}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 text-[11px] font-medium flex items-center space-x-1.5 transition"
                title="Open Chroot Bidirectional File Transfer Hub"
              >
                <Folder className="w-3 h-3 text-indigo-400" />
                <span>Files ({files.length})</span>
              </button>

              <button
                onClick={() => setScaleMode(scaleMode === 'scale' ? 'normal' : 'scale')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] flex items-center space-x-1"
                title="Toggle resize=scale mode"
              >
                <Sliders className="w-3 h-3" />
                <span>{scaleMode === 'scale' ? 'Scale: Fit' : 'Scale: 1:1'}</span>
              </button>
            </div>

            {/* Middle connection telemetry */}
            <div className="hidden md:flex items-center space-x-4 text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
                {isConnected ? 'Connected to 127.0.0.1:6081' : 'Disconnected'}
              </span>
              <span>{currentPreset.width}×{currentPreset.height} (24-bit)</span>
              <span>{latencyMs}ms RTT</span>
              <span className="text-emerald-400">{fps} FPS</span>
            </div>

            {/* Right side credentials info */}
            <div className="flex items-center space-x-2 text-xs">
              <div className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[11px] flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>BasicAuth: {config.adminUser}</span>
              </div>
            </div>
          </div>

          {/* Clipboard Panel Drawer */}
          {clipboardOpen && (
            <div className="bg-slate-900/90 border-b border-slate-800 p-3 flex items-center space-x-2 text-xs">
              <span className="text-slate-400 font-medium shrink-0">Remote Clipboard:</span>
              <input
                type="text"
                value={clipboardText}
                onChange={(e) => setClipboardText(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-slate-200 font-mono text-xs"
              />
              <button
                onClick={() => {
                  audioBridge.playSystemChime();
                  alert(`Copied "${clipboardText}" to Debian 13 X11 primary selection!`);
                }}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium text-xs"
              >
                Sync to Chroot
              </button>
            </div>
          )}

          {/* Canvas Display Viewport */}
          <div className="relative min-h-[580px] bg-black flex items-center justify-center overflow-hidden">
            {isConnected ? (
              <div className="w-full h-full">
                <XfceDesktop
                  config={config}
                  services={services}
                  onKillService={onKillService}
                  onRunHealthCheck={onRunHealthCheck}
                  onOpenDirectNoVnc={() => setViewMode('novnc')}
                  files={files}
                  onUploadFile={onUploadFile}
                  onOpenFileManager={() => setIsFileManagerOpen(true)}
                  onOpenResolutionModal={() => setIsResolutionOpen(true)}
                  currentPreset={currentPreset}
                  currentDpi={currentDpi}
                />
              </div>
            ) : (
              <div className="text-center p-8 space-y-3">
                <Power className="w-12 h-12 text-slate-600 mx-auto" />
                <h4 className="text-base font-bold text-white">noVNC Session Disconnected</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  The RFB protocol tunnel to TigerVNC on port 5901 was terminated. Click Reconnect below to re-establish authenticated WebSocket handshake.
                </p>
                <button
                  onClick={() => setIsConnected(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-lg transition"
                >
                  Reconnect to Cloud Desktop
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Full Desktop Canvas View */
        <XfceDesktop
          config={config}
          services={services}
          onKillService={onKillService}
          onRunHealthCheck={onRunHealthCheck}
          onOpenDirectNoVnc={() => setViewMode('novnc')}
          files={files}
          onUploadFile={onUploadFile}
          onOpenFileManager={() => setIsFileManagerOpen(true)}
          onOpenResolutionModal={() => setIsResolutionOpen(true)}
          currentPreset={currentPreset}
          currentDpi={currentDpi}
        />
      )}
    </div>
  );
};
