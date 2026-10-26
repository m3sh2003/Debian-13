import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Radio, 
  Play, 
  Square, 
  Sparkles, 
  Music,
  Check
} from 'lucide-react';
import { audioBridge } from '../utils/audioBridge';

interface AudioBridgeBarProps {
  onAudioEvent?: (message: string) => void;
}

export const AudioBridgeBar: React.FC<AudioBridgeBarProps> = ({ onAudioEvent }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isPlayingStream, setIsPlayingStream] = useState(false);
  const [waveformBars, setWaveformBars] = useState<number[]>([15, 25, 40, 20, 30, 50, 35, 18, 45, 60, 30, 20]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleToggleMute = () => {
    const muted = audioBridge.toggleMute();
    setIsMuted(muted);
    onAudioEvent?.(`Audio stream ${muted ? 'MUTED' : 'UNMUTED'}`);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    audioBridge.setVolume(val);
  };

  const handleTestChime = () => {
    audioBridge.playSystemChime();
    onAudioEvent?.('PipeWire system notification chime dispatched (48kHz Stereo)');
    
    // Animate visualizer temporarily
    setWaveformBars([40, 65, 90, 80, 70, 95, 85, 60, 75, 90, 55, 40]);
    setTimeout(() => {
      setWaveformBars([15, 25, 40, 20, 30, 50, 35, 18, 45, 60, 30, 20]);
    }, 600);
  };

  const handleTestBeep = () => {
    audioBridge.playTerminalBeep();
    onAudioEvent?.('Terminal ASCII bell tone (0x07) routed via PulseAudio bridge');
  };

  const handleToggleStream = () => {
    if (isPlayingStream) {
      audioBridge.stopSimulatedStream();
      setIsPlayingStream(false);
      onAudioEvent?.('Simulated background audio stream paused');
    } else {
      audioBridge.startSimulatedStream();
      setIsPlayingStream(true);
      onAudioEvent?.('Simulated audio stream connected (PipeWire pulse sink)');
    }
  };

  // Subtle continuous visualizer animation when stream is playing
  useEffect(() => {
    if (!isPlayingStream) return;
    const interval = setInterval(() => {
      setWaveformBars(prev =>
        prev.map(() => Math.floor(15 + Math.random() * (isMuted ? 5 : 70 * volume)))
      );
    }, 120);
    return () => clearInterval(interval);
  }, [isPlayingStream, isMuted, volume]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-1.5 flex flex-wrap items-center justify-between gap-3 text-xs select-none">
      {/* Left: Status & Controls */}
      <div className="flex items-center space-x-2">
        <button
          onClick={handleToggleMute}
          className={`p-1.5 rounded-lg border transition ${
            isMuted
              ? 'bg-rose-950/70 border-rose-700 text-rose-300'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
          }`}
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>

        {/* Volume Slider */}
        <div className="flex items-center space-x-1.5">
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-16 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            title={`Volume: ${Math.round(volume * 100)}%`}
          />
          <span className="font-mono text-[10px] text-slate-400 w-7">
            {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
          </span>
        </div>

        {/* PipeWire badge */}
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 hidden sm:flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          PipeWire 48kHz
        </span>
      </div>

      {/* Middle: Mini Waveform Visualizer */}
      <div className="hidden md:flex items-center space-x-1 bg-slate-950 px-2.5 py-1 rounded border border-slate-800 h-6">
        {waveformBars.map((bar, idx) => (
          <div
            key={idx}
            style={{ height: `${Math.max(10, bar)}%` }}
            className={`w-1 rounded-full transition-all duration-100 ${
              isMuted
                ? 'bg-slate-700'
                : isPlayingStream
                ? 'bg-gradient-to-t from-indigo-500 to-sky-400'
                : 'bg-emerald-500/60'
            }`}
          />
        ))}
      </div>

      {/* Right: Sound Trigger buttons */}
      <div className="flex items-center space-x-1.5">
        <button
          onClick={handleTestChime}
          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-medium transition flex items-center gap-1"
          title="Play XFCE notification chord through WebAudio"
        >
          <Music className="w-3 h-3 text-indigo-400" />
          <span>Play Chime</span>
        </button>

        <button
          onClick={handleTestBeep}
          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-medium transition"
          title="Play Terminal Bell (ASCII 0x07)"
        >
          ASCII Bell
        </button>

        <button
          onClick={handleToggleStream}
          className={`px-2 py-1 rounded text-[11px] font-medium border transition flex items-center gap-1 ${
            isPlayingStream
              ? 'bg-indigo-600 text-white border-indigo-500'
              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
          }`}
          title="Toggle persistent background audio bridge test"
        >
          {isPlayingStream ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
          <span>{isPlayingStream ? 'Stream: On' : 'Stream: Off'}</span>
        </button>
      </div>
    </div>
  );
};
