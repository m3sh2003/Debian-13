/**
 * Web Audio API Bridge for Debian 13 Cloud Desktop
 * Simulates low-latency PCM audio streaming from PipeWire / PulseAudio sink
 */

class AudioBridgeManager {
  private ctx: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private analyzerNode: AnalyserNode | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.8;
  private isStreaming: boolean = false;
  private oscNode: OscillatorNode | null = null;
  private lfoNode: OscillatorNode | null = null;

  public init() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtxClass();
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.value = this.volume;
      this.analyzerNode = this.ctx.createAnalyser();
      this.analyzerNode.fftSize = 64;

      this.gainNode.connect(this.analyzerNode);
      this.analyzerNode.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.gainNode) {
      this.gainNode.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx?.currentTime || 0);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.gainNode) {
      this.gainNode.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx?.currentTime || 0);
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public playSystemChime() {
    this.init();
    if (!this.ctx || !this.gainNode) return;

    const now = this.ctx.currentTime;
    
    // Pleasant Debian XFCE system notification chime (chord)
    const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    freqs.forEach((freq, idx) => {
      if (!this.ctx || !this.gainNode) return;
      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);

      noteGain.gain.setValueAtTime(0, now + idx * 0.04);
      noteGain.gain.linearRampToValueAtTime(0.18, now + idx * 0.04 + 0.02);
      noteGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.45);

      osc.connect(noteGain);
      noteGain.connect(this.gainNode);

      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.5);
    });
  }

  public playTerminalBeep() {
    this.init();
    if (!this.ctx || !this.gainNode) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const beepGain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(750, now);

    beepGain.gain.setValueAtTime(0.15, now);
    beepGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(beepGain);
    beepGain.connect(this.gainNode);

    osc.start(now);
    osc.stop(now + 0.13);
  }

  public startSimulatedStream() {
    this.init();
    if (!this.ctx || !this.gainNode || this.isStreaming) return;

    this.isStreaming = true;
    const now = this.ctx.currentTime;

    // Subtly simulated background ambient audio stream
    this.oscNode = this.ctx.createOscillator();
    this.lfoNode = this.ctx.createOscillator();
    const streamGain = this.ctx.createGain();

    this.oscNode.type = 'sine';
    this.oscNode.frequency.setValueAtTime(220, now);

    this.lfoNode.type = 'sine';
    this.lfoNode.frequency.setValueAtTime(0.5, now);

    streamGain.gain.setValueAtTime(0.02, now);

    this.oscNode.connect(streamGain);
    streamGain.connect(this.gainNode);

    this.oscNode.start(now);
    this.lfoNode.start(now);
  }

  public stopSimulatedStream() {
    if (this.oscNode) {
      try { this.oscNode.stop(); } catch (e) {}
      this.oscNode.disconnect();
      this.oscNode = null;
    }
    if (this.lfoNode) {
      try { this.lfoNode.stop(); } catch (e) {}
      this.lfoNode.disconnect();
      this.lfoNode = null;
    }
    this.isStreaming = false;
  }

  public getVisualizerData(): Uint8Array {
    if (!this.analyzerNode) {
      return new Uint8Array(16);
    }
    const data = new Uint8Array(this.analyzerNode.frequencyBinCount);
    this.analyzerNode.getByteFrequencyData(data);
    return data;
  }
}

export const audioBridge = new AudioBridgeManager();
