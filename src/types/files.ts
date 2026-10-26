export interface ChrootFile {
  id: string;
  name: string;
  path: string;
  sizeBytes: number;
  type: string;
  lastModified: string;
  isDir: boolean;
  content?: string;
}

export interface ResolutionPreset {
  id: string;
  name: string;
  width: number;
  height: number;
  aspectRatio: string;
  category: 'standard' | 'widescreen' | 'compact' | 'ultrawide';
}

export const RESOLUTION_PRESETS: ResolutionPreset[] = [
  { id: '1080p', name: '1920x1080 Full HD (1080p)', width: 1920, height: 1080, aspectRatio: '16:9', category: 'standard' },
  { id: '1440p', name: '2560x1440 2K QHD', width: 2560, height: 1440, aspectRatio: '16:9', category: 'widescreen' },
  { id: '4k', name: '3840x2160 4K UHD', width: 3840, height: 2160, aspectRatio: '16:9', category: 'widescreen' },
  { id: 'ultrawide', name: '2560x1080 UltraWide (21:9)', width: 2560, height: 1080, aspectRatio: '21:9', category: 'ultrawide' },
  { id: '900p', name: '1600x900 HD+ (900p)', width: 1600, height: 900, aspectRatio: '16:9', category: 'standard' },
  { id: '720p', name: '1280x720 HD (720p Compact)', width: 1280, height: 720, aspectRatio: '16:9', category: 'compact' },
  { id: 'xga', name: '1024x768 Standard XGA (4:3)', width: 1024, height: 768, aspectRatio: '4:3', category: 'compact' }
];

export const INITIAL_CHROOT_FILES: ChrootFile[] = [
  {
    id: 'f-1',
    name: 'debian13-builder-notes.txt',
    path: '/home/debian/Documents/debian13-builder-notes.txt',
    sizeBytes: 1420,
    type: 'text/plain',
    lastModified: '2026-10-25 21:10 UTC',
    isDir: false,
    content: `Debian 13 Cloud Desktop (Trixie)\nEnvironment initialized with dynamic user 'debian'.\nPipeWire Audio sink enabled.\nWatchdog autonomous healing active.`
  },
  {
    id: 'f-2',
    name: 'sample_dataset.csv',
    path: '/home/debian/Downloads/sample_dataset.csv',
    sizeBytes: 8420,
    type: 'text/csv',
    lastModified: '2026-10-25 21:12 UTC',
    isDir: false,
    content: `subsystem,port,protocol,state\nXtigervnc,5901,RFB,healthy\nwebsockify,6081,WebSocket,healthy\nfastapi,6080,HTTP,healthy\nwatchdog,none,Daemon,healthy`
  },
  {
    id: 'f-3',
    name: '.bashrc',
    path: '/home/debian/.bashrc',
    sizeBytes: 3771,
    type: 'text/plain',
    lastModified: '2026-10-25 21:07 UTC',
    isDir: false,
    content: `export PS1='\\[\\e[32m\\]\\u@debian13-cloud\\[\\e[m\\]:\\[\\e[34m\\]\\w\\[\\e[m\\]\\$ '\nalias ll='ls -la'\nexport PATH=/usr/local/bin:$PATH`
  },
  {
    id: 'f-4',
    name: 'test-app.js',
    path: '/home/debian/Desktop/test-app.js',
    sizeBytes: 640,
    type: 'application/javascript',
    lastModified: '2026-10-25 21:15 UTC',
    isDir: false,
    content: `// Node.js 22 Test Script\nconsole.log('Running on Node ' + process.version);\nconsole.log('OS: Debian 13 Trixie');`
  }
];
