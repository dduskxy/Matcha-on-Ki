class AudioController {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // A soft, woody "thock" sound (like bamboo hitting wood)
  playBambooClick() {
    try {
      this.init();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      // Bamboo block characteristics: short, woody, percussive
      osc.type = 'sine';
      
      // Pitch drop for the percussive hit
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.exponentialRampToValueAtTime(100, t + 0.05);

      // Volume envelope (very quick fade out)
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.3, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

      osc.start(t);
      osc.stop(t + 0.1);
    } catch (e) {
      // Ignore audio errors (e.g., user hasn't interacted with page yet)
    }
  }

  // A gentle, high-pitched chime (like a small bell)
  playChime() {
    try {
      this.init();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, t);
      
      // Volume envelope (slow fade out for resonance)
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.1, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);

      osc.start(t);
      osc.stop(t + 1.5);
    } catch (e) {
      // Ignore audio errors
    }
  }
}

export const audio = new AudioController();
