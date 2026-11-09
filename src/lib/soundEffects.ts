// Pure Web Audio API ambient chord generator & tactile UI audio feedback
class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isAmbientPlaying: boolean = false;
  private intervalId: number | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted && this.isAmbientPlaying) {
      this.stopAmbientTrack();
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Soft tactile click for buttons and toggles
  public playClick(pitch: number = 800) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(pitch, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(pitch * 0.5, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch {
      // Audio context might be restricted before interaction
    }
  }

  // Play ambient lo-fi chord progression
  public startAmbientTrack() {
    if (this.isMuted || this.isAmbientPlaying) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      this.isAmbientPlaying = true;
      const chords = [
        [261.63, 329.63, 392.00, 493.88], // Cmaj7
        [220.00, 261.63, 329.63, 392.00], // Am7
        [174.61, 220.00, 261.63, 329.63], // Fmaj7
        [196.00, 246.94, 293.66, 392.00], // G7
      ];

      let chordIndex = 0;
      const playChord = () => {
        if (!this.ctx || !this.isAmbientPlaying) return;
        const currentChord = chords[chordIndex % chords.length];
        chordIndex++;

        currentChord.forEach((freq) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const filter = this.ctx.createBiquadFilter();
          const gain = this.ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.value = freq;

          filter.type = 'lowpass';
          filter.frequency.value = 850;

          const now = this.ctx.currentTime;
          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(0.035, now + 1.2);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 3.8);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(now);
          osc.stop(now + 4.0);
        });
      };

      playChord();
      this.intervalId = window.setInterval(playChord, 4200);
    } catch {
      this.isAmbientPlaying = false;
    }
  }

  public stopAmbientTrack() {
    this.isAmbientPlaying = false;
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public isTrackPlaying(): boolean {
    return this.isAmbientPlaying;
  }
}

export const soundManager = new SoundManager();
