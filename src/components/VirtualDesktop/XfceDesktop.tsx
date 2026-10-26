import React, { useState } from 'react';
import { 
  Terminal as TerminalIcon, 
  Globe, 
  Activity, 
  FileText, 
  Image as ImageIcon, 
  Settings, 
  Folder, 
  Maximize2, 
  Minimize2, 
  X, 
  ShieldCheck, 
  Wifi, 
  Volume2, 
  Power,
  Grid,
  Menu,
  Bot
} from 'lucide-react';
import { DeploymentConfig, ServiceStatus, DesktopWindow, ServiceName } from '../../types/desktop';
import { ChrootFile, ResolutionPreset } from '../../types/files';
import { audioBridge } from '../../utils/audioBridge';
import { TerminalWindow } from './TerminalWindow';
import { BrowserWindow } from './BrowserWindow';
import { TaskManagerWindow } from './TaskManagerWindow';
import { GeminiChatbot } from '../GeminiChatbot';

interface XfceDesktopProps {
  config: DeploymentConfig;
  services: ServiceStatus[];
  onKillService: (serviceName: ServiceName) => void;
  onRunHealthCheck: () => void;
  onOpenDirectNoVnc: () => void;
  files?: ChrootFile[];
  onUploadFile?: (file: ChrootFile) => void;
  onOpenFileManager?: () => void;
  onOpenResolutionModal?: () => void;
  currentPreset?: ResolutionPreset;
  currentDpi?: number;
}

export const XfceDesktop: React.FC<XfceDesktopProps> = ({
  config,
  services,
  onKillService,
  onRunHealthCheck,
  onOpenDirectNoVnc,
  files = [],
  onUploadFile,
  onOpenFileManager,
  onOpenResolutionModal,
  currentPreset,
  currentDpi = 1.0
}) => {
  const [isDragOverCanvas, setIsDragOverCanvas] = useState(false);
  const [windows, setWindows] = useState<DesktopWindow[]>([
    {
      id: 'term-1',
      title: 'Terminal - debian@debian13-cloud:~',
      icon: 'terminal',
      isOpen: true,
      isMinimized: false,
      isMaximized: false,
      zIndex: 20,
      x: 40,
      y: 40,
      width: 640,
      height: 380,
      type: 'terminal'
    },
    {
      id: 'task-1',
      title: 'Task Manager (Watchdog Subsystems)',
      icon: 'taskmanager',
      isOpen: true,
      isMinimized: false,
      isMaximized: false,
      zIndex: 10,
      x: 520,
      y: 90,
      width: 580,
      height: 340,
      type: 'taskmanager'
    }
  ]);

  const [activeWindowId, setActiveWindowId] = useState<string>('term-1');
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  // Keep clock updated
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const bringToFront = (id: string) => {
    setActiveWindowId(id);
    setWindows(prev =>
      prev.map(w => {
        if (w.id === id) {
          return { ...w, isMinimized: false, zIndex: 30 };
        }
        return { ...w, zIndex: Math.max(1, w.zIndex - 1) };
      })
    );
  };

  const toggleMinimize = (id: string) => {
    setWindows(prev =>
      prev.map(w => (w.id === id ? { ...w, isMinimized: !w.isMinimized } : w))
    );
  };

  const toggleMaximize = (id: string) => {
    setWindows(prev =>
      prev.map(w => (w.id === id ? { ...w, isMaximized: !w.isMaximized } : w))
    );
  };

  const closeWindow = (id: string) => {
    setWindows(prev => prev.map(w => (w.id === id ? { ...w, isOpen: false } : w)));
  };

  const openApp = (type: DesktopWindow['type'], title: string) => {
    setMenuOpen(false);
    const existing = windows.find(w => w.type === type);
    if (existing) {
      setWindows(prev =>
        prev.map(w =>
          w.id === existing.id ? { ...w, isOpen: true, isMinimized: false } : w
        )
      );
      bringToFront(existing.id);
      return;
    }

    const newWin: DesktopWindow = {
      id: `${type}-${Date.now()}`,
      title,
      icon: type,
      isOpen: true,
      isMinimized: false,
      isMaximized: false,
      zIndex: 35,
      x: 100 + Math.random() * 80,
      y: 60 + Math.random() * 60,
      width: 600,
      height: 400,
      type
    };

    setWindows(prev => [...prev, newWin]);
    setActiveWindowId(newWin.id);
  };

  return (
    <div className="relative w-full h-[640px] md:h-[700px] bg-slate-950 overflow-hidden select-none border border-slate-800 rounded-xl shadow-2xl flex flex-col">
      {/* 1. Top XFCE Panel */}
      <div className="h-8 bg-slate-900/95 backdrop-blur border-b border-slate-800 flex items-center justify-between px-2 text-xs text-slate-200 z-50">
        {/* Left: Applications Menu Button */}
        <div className="flex items-center space-x-1.5">
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`flex items-center space-x-1.5 px-2 py-1 rounded transition text-xs font-semibold ${
                menuOpen ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-200'
              }`}
            >
              <div className="w-3.5 h-3.5 rounded bg-red-600 flex items-center justify-center text-[10px] text-white font-bold">
                D
              </div>
              <span>Applications</span>
            </button>

            {/* Applications Menu Popout */}
            {menuOpen && (
              <div className="absolute top-8 left-0 w-64 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl p-1.5 z-50 text-xs">
                <div className="px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 mb-1">
                  Debian 13 (Trixie) Desktop
                </div>

                <button
                  onClick={() => openApp('terminal', 'Terminal - debian@debian13-cloud:~')}
                  className="w-full flex items-center space-x-2.5 px-2 py-1.5 rounded hover:bg-slate-800 text-slate-200 text-left transition"
                >
                  <TerminalIcon className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="font-medium text-white">XFCE Terminal</div>
                    <div className="text-[10px] text-slate-400">Bash shell with dynamic user detection</div>
                  </div>
                </button>

                <button
                  onClick={() => openApp('browser', 'Firefox ESR - Gateway & noVNC')}
                  className="w-full flex items-center space-x-2.5 px-2 py-1.5 rounded hover:bg-slate-800 text-slate-200 text-left transition"
                >
                  <Globe className="w-4 h-4 text-sky-400" />
                  <div>
                    <div className="font-medium text-white">Firefox ESR</div>
                    <div className="text-[10px] text-slate-400">Access FastAPI (:6080) & noVNC</div>
                  </div>
                </button>

                <button
                  onClick={() => openApp('taskmanager', 'Task Manager (Subsystems)')}
                  className="w-full flex items-center space-x-2.5 px-2 py-1.5 rounded hover:bg-slate-800 text-slate-200 text-left transition"
                >
                  <Activity className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="font-medium text-white">Task Manager</div>
                    <div className="text-[10px] text-slate-400">Process tree, CPU & watchdog stats</div>
                  </div>
                </button>

                <button
                  onClick={() => openApp('libreoffice', 'LibreOffice Calc - debian13_specs.ods')}
                  className="w-full flex items-center space-x-2.5 px-2 py-1.5 rounded hover:bg-slate-800 text-slate-200 text-left transition"
                >
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="font-medium text-white">LibreOffice Suite</div>
                    <div className="text-[10px] text-slate-400">Productivity suite in chroot</div>
                  </div>
                </button>

                <button
                  onClick={() => openApp('gimp', 'GNU Image Manipulation Program (GIMP 2.10)')}
                  className="w-full flex items-center space-x-2.5 px-2 py-1.5 rounded hover:bg-slate-800 text-slate-200 text-left transition"
                >
                  <ImageIcon className="w-4 h-4 text-violet-400" />
                  <div>
                    <div className="font-medium text-white">GIMP 2.10</div>
                    <div className="text-[10px] text-slate-400">Graphics package in chroot</div>
                  </div>
                </button>

                <button
                  onClick={() => openApp('gemini', 'Gemini AI Systems Assistant')}
                  className="w-full flex items-center space-x-2.5 px-2 py-1.5 rounded hover:bg-slate-800 text-slate-200 text-left transition"
                >
                  <Bot className="w-4 h-4 text-purple-400" />
                  <div>
                    <div className="font-medium text-white flex items-center gap-1.5">
                      <span>Gemini Assistant</span>
                      <span className="text-[9px] font-mono font-bold bg-purple-950 text-purple-300 px-1 rounded border border-purple-800">AI</span>
                    </div>
                    <div className="text-[10px] text-slate-400">Multi-turn systems engineer chatbot</div>
                  </div>
                </button>

                <div className="border-t border-slate-800 my-1"></div>

                <div className="px-2 py-1 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>User: <strong className="text-white">{config.debianUser}</strong> (UID {config.debianUid})</span>
                  <span className="font-mono text-emerald-400 text-[10px]">Trixie</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Launch Icons on Panel */}
          <div className="flex items-center space-x-0.5 border-l border-slate-800 pl-2 ml-1">
            <button
              onClick={() => openApp('terminal', 'Terminal - debian@debian13-cloud:~')}
              className="p-1 rounded hover:bg-slate-800 text-slate-300"
              title="Terminal"
            >
              <TerminalIcon className="w-3.5 h-3.5 text-emerald-400" />
            </button>
            <button
              onClick={() => openApp('browser', 'Firefox ESR - Gateway & noVNC')}
              className="p-1 rounded hover:bg-slate-800 text-slate-300"
              title="Web Browser"
            >
              <Globe className="w-3.5 h-3.5 text-sky-400" />
            </button>
            <button
              onClick={() => openApp('taskmanager', 'Task Manager (Subsystems)')}
              className="p-1 rounded hover:bg-slate-800 text-slate-300"
              title="Task Manager"
            >
              <Activity className="w-3.5 h-3.5 text-amber-400" />
            </button>
          </div>

          {/* Active Window Tasks on Panel */}
          <div className="hidden sm:flex items-center space-x-1 border-l border-slate-800 pl-2">
            {windows.filter(w => w.isOpen).map(w => (
              <button
                key={w.id}
                onClick={() => {
                  if (w.isMinimized || activeWindowId !== w.id) {
                    bringToFront(w.id);
                  } else {
                    toggleMinimize(w.id);
                  }
                }}
                className={`px-2 py-0.5 rounded text-[11px] flex items-center space-x-1.5 max-w-[140px] truncate transition ${
                  activeWindowId === w.id && !w.isMinimized
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'text-slate-400 hover:bg-slate-800/60'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0"></span>
                <span className="truncate">{w.title.split('-')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Panel Tray */}
        <div className="flex items-center space-x-2.5 text-[11px]">
          {/* Display & Geometry clickable tag */}
          <button
            onClick={onOpenResolutionModal}
            className="hidden sm:flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-sky-300 font-mono text-[10px] border border-slate-700 transition"
            title="Configure Display Resolution & DPI Scale"
          >
            <span>{currentPreset?.width || 1920}×{currentPreset?.height || 1080}</span>
            <span className="text-slate-500">({currentDpi}x)</span>
          </button>

          {/* Files shortcut */}
          <button
            onClick={onOpenFileManager}
            className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white flex items-center gap-1"
            title="Open Chroot File Transfer Hub"
          >
            <Folder className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[10px] text-slate-400 font-mono hidden md:inline">({files.length})</span>
          </button>

          {/* Sound icon with click-to-chime */}
          <button
            onClick={() => audioBridge.playSystemChime()}
            className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition"
            title="PipeWire Audio Sink (Click to test chime)"
          >
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
          </button>

          <Wifi className="w-3.5 h-3.5 text-emerald-400" />

          {/* Clock */}
          <div className="font-mono text-slate-300 font-semibold px-1">
            {currentTime}
          </div>

          {/* User Profile */}
          <div className="flex items-center space-x-1 px-1.5 py-0.5 bg-slate-800/80 rounded border border-slate-700 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="font-mono text-[10px]">{config.debianUser}</span>
          </div>
        </div>
      </div>

      {/* 2. Desktop Canvas Area with Wallpaper */}
      <div 
        className="relative flex-1 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/80 overflow-hidden"
        onClick={() => setMenuOpen(false)}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOverCanvas(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragOverCanvas(false);
        }}
        onDrop={async (e) => {
          e.preventDefault();
          setIsDragOverCanvas(false);
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
              onUploadFile?.(newFile);
            }
            audioBridge.playSystemChime();
          }
        }}
      >
        {/* Drag & Drop Visual Overlay */}
        {isDragOverCanvas && (
          <div className="absolute inset-0 z-50 bg-indigo-950/85 backdrop-blur-sm border-2 border-dashed border-indigo-400 flex flex-col items-center justify-center text-white pointer-events-none animate-fade-in">
            <Folder className="w-16 h-16 text-indigo-400 mb-3 animate-bounce" />
            <h3 className="text-lg font-bold">Drop files to transfer into Debian 13</h3>
            <p className="text-xs text-indigo-200 mt-1">
              Destination: <code className="font-mono bg-indigo-900/60 px-2 py-0.5 rounded">/home/debian/Downloads/</code>
            </p>
          </div>
        )}

        {/* Subtle decorative Debian galaxy wallpaper pattern */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-red-600 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-600 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-slate-700/20 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-slate-700/10 rounded-full"></div>
        </div>

        {/* Center watermark logo */}
        <div className="absolute bottom-6 right-6 opacity-30 pointer-events-none flex items-center space-x-3 select-none">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold text-sm">
            D
          </div>
          <div className="text-right">
            <div className="font-mono text-xs font-bold text-white tracking-widest uppercase">Debian 13 Trixie</div>
            <div className="text-[10px] text-slate-400 font-mono">XFCE 4.18 • Cloud Desktop</div>
          </div>
        </div>

        {/* Desktop Shortcuts */}
        <div className="absolute top-4 left-4 grid grid-cols-1 gap-3 p-2 z-0">
          <button
            onDoubleClick={() => openApp('terminal', 'Terminal - debian@debian13-cloud:~')}
            onClick={() => {}}
            className="group flex flex-col items-center w-20 p-2 rounded-lg hover:bg-slate-800/60 focus:bg-indigo-600/30 text-center transition cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-slate-800 group-hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-emerald-400 shadow-md">
              <TerminalIcon className="w-5 h-5" />
            </div>
            <span className="mt-1 text-[11px] text-slate-200 group-hover:text-white drop-shadow truncate w-full">
              Terminal
            </span>
          </button>

          <button
            onDoubleClick={() => openApp('browser', 'Firefox ESR - Gateway & noVNC')}
            onClick={() => {}}
            className="group flex flex-col items-center w-20 p-2 rounded-lg hover:bg-slate-800/60 focus:bg-indigo-600/30 text-center transition cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-slate-800 group-hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-sky-400 shadow-md">
              <Globe className="w-5 h-5" />
            </div>
            <span className="mt-1 text-[11px] text-slate-200 group-hover:text-white drop-shadow truncate w-full">
              Firefox ESR
            </span>
          </button>

          <button
            onDoubleClick={() => openApp('gemini', 'Gemini AI Systems Assistant')}
            onClick={() => openApp('gemini', 'Gemini AI Systems Assistant')}
            className="group flex flex-col items-center w-20 p-2 rounded-lg hover:bg-slate-800/60 focus:bg-purple-600/30 text-center transition cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-purple-950 to-indigo-950 group-hover:from-purple-900 group-hover:to-indigo-900 border border-purple-500/50 flex items-center justify-center text-purple-300 shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <span className="mt-1 text-[11px] text-purple-200 group-hover:text-white drop-shadow truncate w-full font-medium">
              Gemini AI
            </span>
          </button>

          <button
            onDoubleClick={onOpenFileManager}
            onClick={onOpenFileManager}
            className="group flex flex-col items-center w-20 p-2 rounded-lg hover:bg-slate-800/60 focus:bg-indigo-600/30 text-center transition cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-slate-800 group-hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-indigo-400 shadow-md">
              <Folder className="w-5 h-5" />
            </div>
            <span className="mt-1 text-[11px] text-slate-200 group-hover:text-white drop-shadow truncate w-full">
              File System
            </span>
          </button>

          <button
            onDoubleClick={onOpenResolutionModal}
            onClick={onOpenResolutionModal}
            className="group flex flex-col items-center w-20 p-2 rounded-lg hover:bg-slate-800/60 focus:bg-indigo-600/30 text-center transition cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-slate-800 group-hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-sky-400 shadow-md">
              <Settings className="w-5 h-5" />
            </div>
            <span className="mt-1 text-[11px] text-slate-200 group-hover:text-white drop-shadow truncate w-full">
              Display & DPI
            </span>
          </button>

          <button
            onDoubleClick={() => openApp('taskmanager', 'Task Manager (Subsystems)')}
            onClick={() => {}}
            className="group flex flex-col items-center w-20 p-2 rounded-lg hover:bg-slate-800/60 focus:bg-indigo-600/30 text-center transition cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-slate-800 group-hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-amber-400 shadow-md">
              <Activity className="w-5 h-5" />
            </div>
            <span className="mt-1 text-[11px] text-slate-200 group-hover:text-white drop-shadow truncate w-full">
              Task Mgr
            </span>
          </button>

          <button
            onDoubleClick={() => openApp('libreoffice', 'LibreOffice Calc - debian13_specs.ods')}
            onClick={() => {}}
            className="group flex flex-col items-center w-20 p-2 rounded-lg hover:bg-slate-800/60 focus:bg-indigo-600/30 text-center transition cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-slate-800 group-hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-emerald-400 shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <span className="mt-1 text-[11px] text-slate-200 group-hover:text-white drop-shadow truncate w-full">
              LibreOffice
            </span>
          </button>

          <button
            onDoubleClick={() => openApp('gimp', 'GNU Image Manipulation Program (GIMP 2.10)')}
            onClick={() => {}}
            className="group flex flex-col items-center w-20 p-2 rounded-lg hover:bg-slate-800/60 focus:bg-indigo-600/30 text-center transition cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-slate-800 group-hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-violet-400 shadow-md">
              <ImageIcon className="w-5 h-5" />
            </div>
            <span className="mt-1 text-[11px] text-slate-200 group-hover:text-white drop-shadow truncate w-full">
              GIMP
            </span>
          </button>

          <button
            onDoubleClick={() => openApp('gemini', 'Gemini AI Systems Assistant')}
            onClick={() => {}}
            className="group flex flex-col items-center w-20 p-2 rounded-lg hover:bg-slate-800/60 focus:bg-indigo-600/30 text-center transition cursor-pointer"
            title="Double-click to launch Gemini AI Systems Assistant"
          >
            <div className="w-10 h-10 rounded-lg bg-slate-800 group-hover:bg-slate-700 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <span className="mt-1 text-[11px] text-slate-200 group-hover:text-white drop-shadow truncate w-full flex items-center justify-center gap-0.5">
              <span>Gemini</span>
              <span className="text-[8px] bg-purple-950 text-purple-300 px-0.5 rounded border border-purple-800 font-mono">AI</span>
            </span>
          </button>
        </div>

        {/* 3. Managed Active Desktop Windows */}
        {windows.map((win) => {
          if (!win.isOpen || win.isMinimized) return null;

          const isActive = activeWindowId === win.id;

          return (
            <div
              key={win.id}
              onClick={() => bringToFront(win.id)}
              style={{
                zIndex: win.zIndex,
                top: win.isMaximized ? 0 : `${win.y}px`,
                left: win.isMaximized ? 0 : `${win.x}px`,
                width: win.isMaximized ? '100%' : `${win.width}px`,
                height: win.isMaximized ? '100%' : `${win.height}px`,
              }}
              className={`absolute rounded-lg border shadow-2xl flex flex-col overflow-hidden transition-all duration-75 ${
                isActive
                  ? 'border-indigo-500/80 shadow-indigo-950/50 bg-slate-900'
                  : 'border-slate-700/60 shadow-slate-950/80 bg-slate-900/95'
              }`}
            >
              {/* Window Titlebar */}
              <div
                className={`h-7 px-2.5 flex items-center justify-between text-xs select-none cursor-move ${
                  isActive
                    ? 'bg-slate-800 text-slate-100 border-b border-indigo-500/40'
                    : 'bg-slate-800/70 text-slate-400 border-b border-slate-700/60'
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                  {win.type === 'terminal' && <TerminalIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  {win.type === 'browser' && <Globe className="w-3.5 h-3.5 text-sky-400 shrink-0" />}
                  {win.type === 'taskmanager' && <Activity className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                  {win.type === 'libreoffice' && <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  {win.type === 'gimp' && <ImageIcon className="w-3.5 h-3.5 text-violet-400 shrink-0" />}
                  {win.type === 'gemini' && <Bot className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
                  <span className="font-semibold text-xs truncate">{win.title}</span>
                </div>

                <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMinimize(win.id);
                    }}
                    className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
                  >
                    <Minimize2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMaximize(win.id);
                    }}
                    className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
                  >
                    <Maximize2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closeWindow(win.id);
                    }}
                    className="p-1 hover:bg-rose-600 rounded text-slate-400 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Window Content */}
              <div className="flex-1 overflow-hidden relative">
                {win.type === 'terminal' && (
                  <TerminalWindow
                    config={config}
                    onKillService={onKillService}
                    onRunHealthCheck={onRunHealthCheck}
                  />
                )}
                {win.type === 'browser' && (
                  <BrowserWindow
                    config={config}
                    onOpenDirectNoVnc={onOpenDirectNoVnc}
                  />
                )}
                {win.type === 'taskmanager' && (
                  <TaskManagerWindow
                    services={services}
                    onKillService={onKillService}
                  />
                )}
                {win.type === 'libreoffice' && (
                  <div className="h-full p-4 bg-slate-900 text-slate-200 text-xs overflow-auto font-mono">
                    <div className="font-bold text-white mb-2">LibreOffice 24.8 — debian13_specs.ods</div>
                    <table className="w-full border border-slate-700 text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-800 text-slate-300">
                          <th className="p-1.5 border border-slate-700">Property</th>
                          <th className="p-1.5 border border-slate-700">Debian 13 Target</th>
                          <th className="p-1.5 border border-slate-700">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr><td className="p-1.5 border border-slate-700">OS Codename</td><td className="p-1.5 border border-slate-700">Trixie</td><td className="p-1.5 border border-slate-700 text-emerald-400 font-bold">Installed</td></tr>
                        <tr><td className="p-1.5 border border-slate-700">Node.js Engine</td><td className="p-1.5 border border-slate-700">22.14.0 (symlinked /usr/local/bin)</td><td className="p-1.5 border border-slate-700 text-emerald-400 font-bold">Active</td></tr>
                        <tr><td className="p-1.5 border border-slate-700">Dynamic User</td><td className="p-1.5 border border-slate-700">{config.debianUser} (UID: {config.debianUid})</td><td className="p-1.5 border border-slate-700 text-emerald-400 font-bold">Verified</td></tr>
                        <tr><td className="p-1.5 border border-slate-700">Entropy Devices</td><td className="p-1.5 border border-slate-700">random, urandom, null, zero, tty, ptmx</td><td className="p-1.5 border border-slate-700 text-emerald-400 font-bold">Verified</td></tr>
                        <tr><td className="p-1.5 border border-slate-700">Self-Healing Watchdog</td><td className="p-1.5 border border-slate-700">Autonomous restart & counters</td><td className="p-1.5 border border-slate-700 text-emerald-400 font-bold">Monitoring</td></tr>
                      </tbody>
                    </table>
                  </div>
                )}
                {win.type === 'gimp' && (
                  <div className="h-full p-4 bg-slate-900 text-slate-200 text-xs flex flex-col items-center justify-center text-center space-y-3">
                    <ImageIcon className="w-12 h-12 text-violet-400" />
                    <div>
                      <h4 className="font-bold text-white text-sm">GIMP 2.10 Image Editor</h4>
                      <p className="text-slate-400 text-xs">Installed inside /srv/debian13 chroot via apt-get.</p>
                    </div>
                    <div className="px-3 py-1.5 bg-slate-800 rounded border border-slate-700 text-[11px] text-slate-300">
                      Supports direct X11 rendering via TigerVNC buffer (:1)
                    </div>
                  </div>
                )}
                {win.type === 'gemini' && (
                  <div className="h-full overflow-hidden bg-slate-950">
                    <GeminiChatbot />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
