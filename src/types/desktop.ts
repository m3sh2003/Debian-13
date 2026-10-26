export type ServiceName = 'Xtigervnc' | 'xfce4-session' | 'websockify' | 'fastapi-gateway';

export interface ServiceStatus {
  name: ServiceName;
  displayName: string;
  command: string;
  port?: number;
  pid: number | null;
  status: 'running' | 'stopped' | 'restarting' | 'failed';
  uptimeSeconds: number;
  restartCount: number;
  cpuPercent: number;
  memoryMb: number;
  healthUrl?: string;
  lastChecked: string;
  lastError?: string;
}

export interface DeploymentConfig {
  pinnedId: string;
  domain: string;
  adminUser: string;
  adminPass: string;
  gatewayPort: number;
  websockifyPort: number;
  vncDisplay: number;
  vncPort: number;
  debianUser: string;
  debianUid: number;
  debianGid: number;
  nodeVersion: string;
  chrootPath: string;
  autoConnect: boolean;
  scaleMode: 'scale' | 'normal' | 'downscale';
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS' | 'DEBUG';
  file: 'bootstrap.log' | 'chroot.log' | 'vnc.log' | 'gateway.log' | 'watchdog.log';
  message: string;
}

export interface DesktopWindow {
  id: string;
  title: string;
  icon: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'terminal' | 'browser' | 'gimp' | 'libreoffice' | 'taskmanager' | 'settings' | 'gemini';
}

export interface ScriptFile {
  name: string;
  path: string;
  category: 'core' | 'service' | 'daemon' | 'container' | 'doc';
  description: string;
  content: string;
  isExecutable: boolean;
}
