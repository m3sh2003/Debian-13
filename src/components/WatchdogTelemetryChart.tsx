import React, { useState, useEffect } from 'react';
import { 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  TrendingUp, 
  Maximize2, 
  Radio, 
  RefreshCw,
  Zap,
  Flame
} from 'lucide-react';
import { ServiceStatus } from '../types/desktop';

interface TelemetryPoint {
  time: string;
  timestamp: number;
  // CPU %
  tigervncCpu: number;
  xfce4Cpu: number;
  websockifyCpu: number;
  gatewayCpu: number;
  totalCpu: number;
  // Memory MB
  tigervncMem: number;
  xfce4Mem: number;
  websockifyMem: number;
  gatewayMem: number;
  totalMem: number;
}

interface WatchdogTelemetryChartProps {
  services: ServiceStatus[];
}

export const WatchdogTelemetryChart: React.FC<WatchdogTelemetryChartProps> = ({ services }) => {
  const [metricTab, setMetricTab] = useState<'cpu' | 'memory' | 'split'>('cpu');
  const [dataPoints, setDataPoints] = useState<TelemetryPoint[]>(() => {
    // Generate initial historical baseline of 12 points
    const now = Date.now();
    const initial: TelemetryPoint[] = [];
    for (let i = 12; i >= 0; i--) {
      const pointTime = new Date(now - i * 3000);
      const timeStr = pointTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      const vncCpu = +(0.7 + Math.random() * 0.5).toFixed(1);
      const xfceCpu = +(1.1 + Math.random() * 0.6).toFixed(1);
      const wsCpu = +(0.2 + Math.random() * 0.2).toFixed(1);
      const gwCpu = +(0.3 + Math.random() * 0.3).toFixed(1);
      
      const vncMem = Math.round(48 + Math.random() * 3);
      const xfceMem = Math.round(64 + Math.random() * 4);
      const wsMem = Math.round(24 + Math.random() * 2);
      const gwMem = Math.round(36 + Math.random() * 3);

      initial.push({
        time: timeStr,
        timestamp: pointTime.getTime(),
        tigervncCpu: vncCpu,
        xfce4Cpu: xfceCpu,
        websockifyCpu: wsCpu,
        gatewayCpu: gwCpu,
        totalCpu: +(vncCpu + xfceCpu + wsCpu + gwCpu).toFixed(1),
        tigervncMem: vncMem,
        xfce4Mem: xfceMem,
        websockifyMem: wsMem,
        gatewayMem: gwMem,
        totalMem: vncMem + xfceMem + wsMem + gwMem
      });
    }
    return initial;
  });

  // Extract current metrics from the services array
  const tigervnc = services.find(s => s.name === 'Xtigervnc');
  const xfce4 = services.find(s => s.name === 'xfce4-session');
  const websockify = services.find(s => s.name === 'websockify');
  const gateway = services.find(s => s.name === 'fastapi-gateway');

  // Push new data point whenever services change or on interval
  useEffect(() => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const vncCpu = tigervnc?.status === 'running' ? tigervnc.cpuPercent : tigervnc?.status === 'restarting' ? 2.4 : 0;
    const xfceCpu = xfce4?.status === 'running' ? xfce4.cpuPercent : xfce4?.status === 'restarting' ? 3.1 : 0;
    const wsCpu = websockify?.status === 'running' ? websockify.cpuPercent : websockify?.status === 'restarting' ? 1.0 : 0;
    const gwCpu = gateway?.status === 'running' ? gateway.cpuPercent : gateway?.status === 'restarting' ? 1.5 : 0;

    const vncMem = tigervnc?.status === 'running' ? tigervnc.memoryMb : 0;
    const xfceMem = xfce4?.status === 'running' ? xfce4.memoryMb : 0;
    const wsMem = websockify?.status === 'running' ? websockify.memoryMb : 0;
    const gwMem = gateway?.status === 'running' ? gateway.memoryMb : 0;

    const newPoint: TelemetryPoint = {
      time: timeStr,
      timestamp: now.getTime(),
      tigervncCpu: +vncCpu.toFixed(1),
      xfce4Cpu: +xfceCpu.toFixed(1),
      websockifyCpu: +wsCpu.toFixed(1),
      gatewayCpu: +gwCpu.toFixed(1),
      totalCpu: +(vncCpu + xfceCpu + wsCpu + gwCpu).toFixed(1),
      tigervncMem: vncMem,
      xfce4Mem: xfceMem,
      websockifyMem: wsMem,
      gatewayMem: gwMem,
      totalMem: vncMem + xfceMem + wsMem + gwMem
    };

    setDataPoints(prev => {
      const updated = [...prev, newPoint];
      // Keep last 25 telemetry samples for smooth rolling window
      return updated.slice(-25);
    });
  }, [services]);

  const latest = dataPoints[dataPoints.length - 1] || {
    totalCpu: 0,
    totalMem: 0,
    tigervncCpu: 0,
    xfce4Cpu: 0,
    websockifyCpu: 0,
    gatewayCpu: 0
  };

  // Custom Dark Tooltip Component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 backdrop-blur border border-slate-700/80 p-3 rounded-lg shadow-xl text-xs font-mono space-y-1.5 z-50">
          <div className="text-slate-400 font-semibold border-b border-slate-800 pb-1 flex items-center justify-between gap-4">
            <span>Time: {label}</span>
            <span className="text-[10px] text-emerald-400">Watchdog Telemetry</span>
          </div>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between space-x-4">
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: entry.color }} />
                <span className="text-slate-300">{entry.name}:</span>
              </span>
              <span className="font-bold text-white">
                {entry.value} {entry.dataKey?.toLowerCase().includes('mem') ? 'MB' : '%'}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
      {/* Top Header & View Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-white text-sm">Real-Time Subsystem Resource Telemetry</h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                RECHARTS LIVE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Live time-series tracking CPU utilization and RSS memory for all 4 monitored services.
            </p>
          </div>
        </div>

        {/* View Switcher Controls */}
        <div className="flex items-center space-x-2">
          <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 flex items-center space-x-1 text-xs">
            <button
              onClick={() => setMetricTab('cpu')}
              className={`px-3 py-1 rounded font-medium transition flex items-center gap-1.5 ${
                metricTab === 'cpu'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>CPU (%)</span>
            </button>

            <button
              onClick={() => setMetricTab('memory')}
              className={`px-3 py-1 rounded font-medium transition flex items-center gap-1.5 ${
                metricTab === 'memory'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>Memory (MB)</span>
            </button>

            <button
              onClick={() => setMetricTab('split')}
              className={`px-3 py-1 rounded font-medium transition flex items-center gap-1.5 ${
                metricTab === 'split'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Split Dual</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-950 border border-slate-800/80 p-3 rounded-lg">
          <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider flex items-center justify-between">
            <span>Total Subsystem CPU</span>
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="font-mono font-bold text-base text-white mt-1">
            {latest.totalCpu}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Across all 4 processes</div>
        </div>

        <div className="bg-slate-950 border border-slate-800/80 p-3 rounded-lg">
          <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider flex items-center justify-between">
            <span>Total RSS Memory</span>
            <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="font-mono font-bold text-base text-indigo-300 mt-1">
            {latest.totalMem} MB
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Allocated in Debian chroot</div>
        </div>

        <div className="bg-slate-950 border border-slate-800/80 p-3 rounded-lg">
          <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider flex items-center justify-between">
            <span>Highest CPU Consumer</span>
            <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="font-mono font-bold text-sm text-sky-300 mt-1 truncate">
            {latest.xfce4Cpu >= latest.tigervncCpu ? 'xfce4-session' : 'Xtigervnc'} ({Math.max(latest.xfce4Cpu, latest.tigervncCpu)}%)
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">X11 desktop compositor</div>
        </div>

        <div className="bg-slate-950 border border-slate-800/80 p-3 rounded-lg">
          <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider flex items-center justify-between">
            <span>Watchdog Polling Rate</span>
            <Radio className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="font-mono font-bold text-sm text-amber-300 mt-1">
            3.0s Interval
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Self-healing armed</div>
        </div>
      </div>

      {/* Recharts Visualizations */}
      {metricTab === 'cpu' && (
        <div className="bg-slate-950 border border-slate-800/90 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>CPU Usage by Subsystem (%) Over Time</span>
            </span>
            <span className="text-[11px] font-mono text-slate-500">Live Rolling Window (25 samples)</span>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradVnc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="gradXfce" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="gradWs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="gradGw" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} domain={[0, 'dataMax + 1.5']} unit="%" />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} 
                  iconType="circle"
                />

                <Area 
                  type="monotone" 
                  dataKey="xfce4Cpu" 
                  name="xfce4-session" 
                  stroke="#0284c7" 
                  fillOpacity={1} 
                  fill="url(#gradXfce)" 
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="tigervncCpu" 
                  name="Xtigervnc (:1)" 
                  stroke="#10b981" 
                  fillOpacity={1} 
                  fill="url(#gradVnc)" 
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="gatewayCpu" 
                  name="FastAPI Gateway (:6080)" 
                  stroke="#8b5cf6" 
                  fillOpacity={1} 
                  fill="url(#gradGw)" 
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="websockifyCpu" 
                  name="Websockify (:6081)" 
                  stroke="#f59e0b" 
                  fillOpacity={1} 
                  fill="url(#gradWs)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {metricTab === 'memory' && (
        <div className="bg-slate-950 border border-slate-800/90 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-indigo-400" />
              <span>Resident Memory Footprint (MB) by Subsystem</span>
            </span>
            <span className="text-[11px] font-mono text-slate-500">Peak: {latest.totalMem} MB Total</span>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataPoints} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="memVnc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="memXfce" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="memGw" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="memWs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} unit="MB" />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} 
                  iconType="circle"
                />

                <Area 
                  type="monotone" 
                  dataKey="xfce4Mem" 
                  name="xfce4-session" 
                  stackId="1"
                  stroke="#0284c7" 
                  fill="url(#memXfce)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="tigervncMem" 
                  name="Xtigervnc (:1)" 
                  stackId="1"
                  stroke="#10b981" 
                  fill="url(#memVnc)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="gatewayMem" 
                  name="FastAPI Gateway (:6080)" 
                  stackId="1"
                  stroke="#8b5cf6" 
                  fill="url(#memGw)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="websockifyMem" 
                  name="Websockify (:6081)" 
                  stackId="1"
                  stroke="#f59e0b" 
                  fill="url(#memWs)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {metricTab === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left: CPU Split */}
          <div className="bg-slate-950 border border-slate-800/90 rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-2 text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                <span>CPU Usage (%)</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">Total: {latest.totalCpu}%</span>
            </div>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dataPoints} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 9 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 9 }} unit="%" />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="xfce4Cpu" name="xfce4-session" stroke="#0284c7" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="tigervncCpu" name="Xtigervnc" stroke="#10b981" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="gatewayCpu" name="FastAPI" stroke="#8b5cf6" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="websockifyCpu" name="Websockify" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right: Memory Split */}
          <div className="bg-slate-950 border border-slate-800/90 rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-2 text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
                <span>Memory Footprint (MB)</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">Total: {latest.totalMem} MB</span>
            </div>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dataPoints} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 9 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 9 }} unit="MB" />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="xfce4Mem" name="xfce4-session" stroke="#0284c7" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="tigervncMem" name="Xtigervnc" stroke="#10b981" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="gatewayMem" name="FastAPI" stroke="#8b5cf6" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="websockifyMem" name="Websockify" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Footer note explaining chaos reaction */}
      <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>Clicking "Kill Process" below will immediately drop that subsystem's metrics to 0, followed by a recovery spike when the watchdog revives it.</span>
        </span>
        <span className="font-mono text-slate-500">Recharts v2.x • SVG Accelerated</span>
      </div>
    </div>
  );
};
