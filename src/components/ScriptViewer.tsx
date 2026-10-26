import React, { useState } from 'react';
import { 
  FileCode, 
  Copy, 
  Check, 
  Download, 
  Terminal, 
  Folder, 
  File, 
  ShieldCheck, 
  ExternalLink,
  Code2,
  PackageCheck
} from 'lucide-react';
import { ScriptFile } from '../types/desktop';
import { SCRIPTS } from '../data/scriptsData';

interface ScriptViewerProps {
  onDownloadZip: () => void;
}

export const ScriptViewer: React.FC<ScriptViewerProps> = ({ onDownloadZip }) => {
  const [selectedScript, setSelectedScript] = useState<ScriptFile>(SCRIPTS[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedScript.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingle = () => {
    const blob = new Blob([selectedScript.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = selectedScript.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const lines = selectedScript.content.split('\n');

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Generated Production Scripts & Filesystem</h2>
            <p className="text-xs text-slate-400">
              All scripts strictly enforce <code className="text-slate-300 font-mono">set -euo pipefail</code>, dynamic UID detection, idempotent restarts, and non-blocking logging.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onDownloadZip}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Download Full Stack (.zip)</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Code Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[680px]">
        {/* Left File Tree Sidebar (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
          <div className="p-3 bg-slate-950 border-b border-slate-800 text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Folder className="w-4 h-4 text-indigo-400" />
              <span>/workspace/debian13-server/</span>
            </span>
            <span className="text-[11px] font-mono text-slate-500">{SCRIPTS.length} files</span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {/* Scripts directory section */}
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 pt-2 pb-1 flex items-center gap-1">
              <Folder className="w-3 h-3 text-amber-400" />
              <span>scripts/</span>
            </div>

            {SCRIPTS.filter(s => s.path.includes('/scripts/')).map((file) => {
              const isSelected = selectedScript.name === file.name;
              return (
                <button
                  key={file.name}
                  onClick={() => setSelectedScript(file)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center justify-between transition ${
                    isSelected
                      ? 'bg-indigo-600/20 text-white border border-indigo-500/40 font-semibold'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <FileCode className={`w-3.5 h-3.5 shrink-0 ${file.isExecutable ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span className="truncate">{file.name}</span>
                  </span>
                  {file.isExecutable && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 shrink-0">
                      +x
                    </span>
                  )}
                </button>
              );
            })}

            {/* Root / Container / Systemd Section */}
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 pt-4 pb-1 flex items-center gap-1">
              <Folder className="w-3 h-3 text-indigo-400" />
              <span>orchestration & config/</span>
            </div>

            {SCRIPTS.filter(s => !s.path.includes('/scripts/')).map((file) => {
              const isSelected = selectedScript.name === file.name;
              return (
                <button
                  key={file.name}
                  onClick={() => setSelectedScript(file)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center justify-between transition ${
                    isSelected
                      ? 'bg-indigo-600/20 text-white border border-indigo-500/40 font-semibold'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <File className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{file.name}</span>
                  </span>
                  <span className="text-[10px] text-slate-500 shrink-0 uppercase">
                    {file.category}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="p-3 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-400">
            <p>Every file is validated against Debian 13 (Trixie) and FastAPI specifications.</p>
          </div>
        </div>

        {/* Right Code Display (8 cols) */}
        <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-2xl">
          {/* File Header Details */}
          <div className="p-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm font-bold text-white">{selectedScript.name}</span>
                <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  {selectedScript.path}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{selectedScript.description}</p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 font-medium transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>

              <button
                onClick={handleDownloadSingle}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 font-medium transition"
                title="Download this file"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save File</span>
              </button>
            </div>
          </div>

          {/* Code Viewer with Line Numbers */}
          <div className="flex-1 overflow-auto bg-slate-950 font-mono text-xs p-3 leading-relaxed select-text">
            <div className="grid grid-cols-[auto_1fr] gap-x-4 min-w-full">
              {/* Line numbers column */}
              <div className="text-slate-600 select-none text-right pr-2 border-r border-slate-800/80">
                {lines.map((_, idx) => (
                  <div key={idx}>{idx + 1}</div>
                ))}
              </div>

              {/* Code lines */}
              <div className="text-slate-200 overflow-x-auto whitespace-pre pl-1">
                {lines.map((line, idx) => {
                  let formatted = line;
                  let colorClass = "text-slate-300";

                  if (line.trim().startsWith('#')) {
                    colorClass = "text-slate-500 italic";
                  } else if (line.includes('set -euo pipefail')) {
                    colorClass = "text-emerald-400 font-bold";
                  } else if (line.includes('apt-get') || line.includes('chroot')) {
                    colorClass = "text-sky-300";
                  } else if (line.includes('_AUTH_PASS') || line.includes('429888')) {
                    colorClass = "text-amber-300 font-bold";
                  } else if (line.startsWith('echo')) {
                    colorClass = "text-slate-400";
                  }

                  return (
                    <div key={idx} className={colorClass}>
                      {line || ' '}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer Bar */}
          <div className="bg-slate-900 border-t border-slate-800 px-4 py-2 text-[11px] text-slate-400 flex items-center justify-between font-mono">
            <span>Encoding: UTF-8 • LF (Unix)</span>
            <span>Lines: {lines.length} • Size: {(new Blob([selectedScript.content]).size / 1024).toFixed(1)} KB</span>
          </div>
        </div>
      </div>
    </div>
  );
};
