import React from 'react';
import { Activity, Cpu, HardDrive, Zap, AlertOctagon } from 'lucide-react';
import { ServiceStatus, ServiceName } from '../../types/desktop';

interface TaskManagerProps {
  services: ServiceStatus[];
  onKillService: (serviceName: ServiceName) => void;
}

export const TaskManagerWindow: React.FC<TaskManagerProps> = ({ services, onKillService }) => {
  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden font-sans text-xs">
      {/* Top summary stats */}
      <div className="bg-slate-900 border-b border-slate-800 p-3 grid grid-cols-4 gap-2">
        <div className="bg-slate-950 border border-slate-800 rounded p-2 flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-emerald-400" />
          <div>
            <div className="text-[10px] text-slate-400">Total CPU</div>
            <div className="font-mono font-bold text-white">
              {(services.reduce((acc, s) => acc + (s.status === 'running' ? s.cpuPercent : 0), 0) + 1.2).toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded p-2 flex items-center space-x-2">
          <HardDrive className="w-4 h-4 text-indigo-400" />
          <div>
            <div className="text-[10px] text-slate-400">Memory Usage</div>
            <div className="font-mono font-bold text-white">
              {(services.reduce((acc, s) => acc + (s.status === 'running' ? s.memoryMb : 0), 0) + 320)} MB
            </div>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded p-2 flex items-center space-x-2">
          <Activity className="w-4 h-4 text-sky-400" />
          <div>
            <div className="text-[10px] text-slate-400">Active PIDs</div>
            <div className="font-mono font-bold text-white">
              {services.filter(s => s.status === 'running').length + 8}
            </div>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded p-2 flex items-center space-x-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <div>
            <div className="text-[10px] text-slate-400">Total Auto-Restarts</div>
            <div className="font-mono font-bold text-amber-300">
              {services.reduce((acc, s) => acc + s.restartCount, 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Process Table */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-800 text-[11px]">
              <th className="py-2 px-3 font-medium">Subsystem / Process</th>
              <th className="py-2 px-3 font-medium">PID</th>
              <th className="py-2 px-3 font-medium">Status</th>
              <th className="py-2 px-3 font-medium">CPU%</th>
              <th className="py-2 px-3 font-medium">Memory</th>
              <th className="py-2 px-3 font-medium">Restarts</th>
              <th className="py-2 px-3 font-medium text-right">Chaos Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
            {services.map((svc) => (
              <tr key={svc.name} className="hover:bg-slate-900/50 transition">
                <td className="py-2 px-3">
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${
                      svc.status === 'running' 
                        ? 'bg-emerald-400' 
                        : svc.status === 'restarting'
                        ? 'bg-amber-400 animate-spin'
                        : 'bg-rose-500'
                    }`} />
                    {svc.displayName}
                  </div>
                  <div className="text-[10px] text-slate-500 font-sans truncate max-w-xs">{svc.command}</div>
                </td>
                <td className="py-2 px-3 text-slate-300">{svc.pid || '—'}</td>
                <td className="py-2 px-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    svc.status === 'running'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                      : svc.status === 'restarting'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                      : 'bg-rose-950 text-rose-300 border border-rose-800/60'
                  }`}>
                    {svc.status.toUpperCase()}
                  </span>
                </td>
                <td className="py-2 px-3 text-slate-300">
                  {svc.status === 'running' ? `${svc.cpuPercent.toFixed(1)}%` : '0.0%'}
                </td>
                <td className="py-2 px-3 text-slate-300">
                  {svc.status === 'running' ? `${svc.memoryMb} MB` : '0 MB'}
                </td>
                <td className="py-2 px-3 text-amber-300 font-bold">{svc.restartCount}</td>
                <td className="py-2 px-3 text-right">
                  {svc.status === 'running' ? (
                    <button
                      onClick={() => onKillService(svc.name)}
                      className="px-2 py-1 bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white rounded border border-rose-600/50 text-[10px] font-sans font-semibold transition"
                      title={`Simulate crash/kill -9 on ${svc.displayName}`}
                    >
                      Kill PID
                    </button>
                  ) : (
                    <span className="text-[10px] text-amber-400 italic font-sans">Self-healing...</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-2 bg-slate-900 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Click "Kill PID" on any service to watch the autonomous watchdog trigger self-healing within seconds.</span>
      </div>
    </div>
  );
};
