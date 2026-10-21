/**
 * Synthesized Web Audio API sound effects for SURAKSHA-CITY SOC
 * No external audio files or MP3 downloads required!
 */
class SOCAudio {
  constructor() {
    this.ctx = null;
    this.soundEnabled = true;
    this.activeNodes = [];
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    if (!this.soundEnabled) {
      this.stopAll();
    }
    return this.soundEnabled;
  }

  stopAll() {
    try {
      this.activeNodes.forEach(node => {
        try { node.stop(); } catch(e) {}
        try { node.disconnect(); } catch(e) {}
      });
      this.activeNodes = [];
    } catch (e) {
      console.warn("Audio stop error", e);
    }
  }

  stopAlertSiren() {
    this.stopAll();
  }

  playAlertSiren() {
    if (!this.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      this.stopAll();

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      // Siren frequency sweep: 600Hz -> 950Hz -> 600Hz
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.linearRampToValueAtTime(950, now + 0.3);
      osc.frequency.linearRampToValueAtTime(600, now + 0.6);
      osc.frequency.linearRampToValueAtTime(950, now + 0.9);
      osc.frequency.linearRampToValueAtTime(600, now + 1.2);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 1.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 1.3);

      this.activeNodes.push(osc);
      setTimeout(() => {
        const idx = this.activeNodes.indexOf(osc);
        if (idx !== -1) this.activeNodes.splice(idx, 1);
      }, 1400);
    } catch (e) {
      console.warn("Audio error", e);
    }
  }

  playSuccessChime() {
    if (!this.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);

        gain.gain.setValueAtTime(0.09, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.45);
        this.activeNodes.push(osc);
      });
    } catch (e) {
      console.warn("Audio error", e);
    }
  }

  playIsolationClank() {
    if (!this.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.28);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.32);
      this.activeNodes.push(osc);
    } catch (e) {
      console.warn("Audio error", e);
    }
  }
}

window.socAudio = new SOCAudio();
