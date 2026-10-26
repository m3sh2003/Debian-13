import React, { useState } from 'react';
import { 
  Monitor, 
  Maximize, 
  X, 
  Check, 
  Sliders, 
  Tv, 
  Layers, 
  Sparkles,
  Command
} from 'lucide-react';
import { RESOLUTION_PRESETS, ResolutionPreset } from '../types/files';

interface ResolutionSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPreset: ResolutionPreset;
  currentDpi: number;
  onApplyResolution: (preset: ResolutionPreset, dpi: number) => void;
}

export const ResolutionSelectorModal: React.FC<ResolutionSelectorModalProps> = ({
  isOpen,
  onClose,
  currentPreset,
  currentDpi,
  onApplyResolution
}) => {
  const [selectedPreset, setSelectedPreset] = useState<ResolutionPreset>(currentPreset);
  const [dpi, setDpi] = useState<number>(currentDpi);

  if (!isOpen) return null;

  const handleApply = () => {
    onApplyResolution(selectedPreset, dpi);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-sky-600/30 text-sky-400 border border-sky-500/40">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <span>Display Geometry & Dynamic Resolution</span>
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">
                  xrandr dynamic
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Change TigerVNC frame buffer resolution and DPI scaling for HiDPI/Retina monitors.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 overflow-y-auto max-h-[70vh]">
          {/* Preset Grid */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
              Select Display Resolution Preset
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {RESOLUTION_PRESETS.map((preset) => {
                const isSelected = selectedPreset.id === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => setSelectedPreset(preset)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-sky-950/50 border-sky-500 text-white shadow-md shadow-sky-950/40'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <span>{preset.name}</span>
                        {preset.id === '1080p' && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                            Standard
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {preset.width} × {preset.height} ({preset.aspectRatio})
                      </div>
                    </div>

                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-sky-400 bg-sky-500 text-white' : 'border-slate-600'
                    }`}>
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* DPI Scaling Option */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white">HiDPI UI Scale</span>
                <p className="text-[11px] text-slate-400">Controls GTK font rendering and window scaling.</p>
              </div>
              <span className="font-mono text-xs font-bold text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                {dpi}x ({Math.round(dpi * 96)} DPI)
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-xs">
              {[
                { scale: 1.0, label: '1.0x (Standard 96)' },
                { scale: 1.25, label: '1.25x (120 DPI)' },
                { scale: 1.5, label: '1.5x (HiDPI 144)' },
                { scale: 2.0, label: '2.0x (Retina 192)' },
              ].map((opt) => (
                <button
                  key={opt.scale}
                  onClick={() => setDpi(opt.scale)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition ${
                    dpi === opt.scale
                      ? 'bg-sky-600 text-white border-sky-500'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-850'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Execution Command Preview */}
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-400">
            <div className="text-slate-500 mb-1 flex items-center gap-1">
              <Command className="w-3 h-3 text-sky-400" />
              <span>Invoked chroot command:</span>
            </div>
            <div className="text-sky-300">
              $ xrandr --fb {selectedPreset.width}x{selectedPreset.height} --dpi {Math.round(dpi * 96)}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 p-3.5 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Selected: <strong className="text-white">{selectedPreset.width}x{selectedPreset.height}</strong> at {dpi}x
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-950/40"
            >
              Apply Geometry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
