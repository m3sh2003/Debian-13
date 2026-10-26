import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  Terminal, 
  Download, 
  Trash2, 
  Search, 
  Filter, 
  Radio, 
  CheckCircle2, 
  AlertTriangle, 
  Info,
  Clock
} from 'lucide-react';
import { LogEntry } from '../types/desktop';

interface LogsViewerProps {
  logs: LogEntry[];
  onClearLogs: () => void;
}

type LogFilter = 'all' | 'bootstrap.log' | 'chroot.log' | 'vnc.log' | 'gateway.log' | 'watchdog.log';

export const LogsViewer: React.FC<LogsViewerProps> = ({ logs, onClearLogs }) => {
  const [activeFile, setActiveFile] = useState<LogFilter>('all');
  const [levelFilter, setLevelFilter] = useState<'ALL' | 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll) {
      logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const filteredLogs = logs.filter((entry) => {
    if (activeFile !== 'all' && entry.file !== activeFile) return false;
    if (levelFilter !== 'ALL' && entry.level !== levelFilter) return false;
    if (searchQuery.trim() && !entry.message.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const downloadActiveLog = () => {
    const content = filteredLogs
      .map(l => `[${l.timestamp}] [${l.level}] [${l.file}] ${l.message}`)
      .join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = activeFile === 'all' ? 'debian13_all_services.log' : activeFile;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Live System Logs Terminal (/workspace/debian13-server/logs/)</h2>
            <p className="text-xs text-slate-400">
              Captures output from bootstrap, debootstrap chroot, TigerVNC, FastAPI gateway, and autonomous watchdog.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={downloadActiveLog}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Log</span>
          </button>
          <button
            onClick={onClearLogs}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-rose-900/60 border border-slate-700 hover:border-rose-700 text-slate-300 hover:text-rose-200 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Buffer</span>
          </button>
        </div>
      </div>

      {/* Filter and Tab Controls */}
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Log File Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto bg-slate-950 p-1 rounded-lg border border-slate-800">
          {(['all', 'bootstrap.log', 'chroot.log', 'vnc.log', 'gateway.log', 'watchdog.log'] as LogFilter[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFile(tab)}
              className={`px-3 py-1 rounded font-mono transition text-xs ${
                activeFile === tab
                  ? 'bg-indigo-600 text-white font-semibold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'all' ? 'All Logs (Unified)' : tab}
            </button>
          ))}
        </div>

        {/* Search & Level Filter */}
        <div className="flex items-center space-x-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search log messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1 text-slate-200 text-xs outline-none focus:border-indigo-500 w-44 md:w-56"
            />
          </div>

          {/* Level Dropdown */}
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 text-xs outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Levels</option>
            <option value="INFO">INFO</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="WARN">WARN</option>
            <option value="ERROR">ERROR</option>
          </select>

          {/* Auto-scroll toggle */}
          <label className="flex items-center space-x-1.5 text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-0"
            />
            <span className="text-[11px]">Auto-scroll</span>
          </label>
        </div>
      </div>

      {/* Terminal Display */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl h-[580px] flex flex-col font-mono text-xs">
        {/* Terminal Titlebar */}
        <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-slate-400 text-[11px]">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="ml-2 font-semibold text-slate-300">
              /workspace/debian13-server/logs/{activeFile}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <span>Showing {filteredLogs.length} entries</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Live Tail
            </span>
          </div>
        </div>

        {/* Scrollable logs content */}
        <div className="flex-1 p-3 overflow-y-auto space-y-1.5 select-text">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              No log entries match the current filter criteria.
            </div>
          ) : (
            filteredLogs.map((entry) => {
              let badgeColor = 'text-sky-400 bg-sky-950/60 border-sky-800/80';
              if (entry.level === 'SUCCESS') badgeColor = 'text-emerald-400 bg-emerald-950/60 border-emerald-800/80';
              if (entry.level === 'WARN') badgeColor = 'text-amber-400 bg-amber-950/60 border-amber-800/80';
              if (entry.level === 'ERROR') badgeColor = 'text-rose-400 bg-rose-950/60 border-rose-800/80';

              return (
                <div key={entry.id} className="flex items-start space-x-2.5 hover:bg-slate-900/40 p-1 rounded transition">
                  <span className="text-slate-500 shrink-0 text-[11px]">{entry.timestamp}</span>
                  <span className={`px-1.5 py-0.2 rounded border text-[10px] font-bold shrink-0 ${badgeColor}`}>
                    {entry.level}
                  </span>
                  {activeFile === 'all' && (
                    <span className="text-indigo-400 text-[11px] font-semibold shrink-0">
                      [{entry.file}]
                    </span>
                  )}
                  <span className="text-slate-200 break-all leading-relaxed">
                    {entry.message}
                  </span>
                </div>
              );
            })
          )}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
};
