class RetroAudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.bgmPlaying = false;
    this.currentNoteIndex = 0;
    this.bgmInterval = null;

    // Iconic 8-bit melody sequence [frequency in Hz, duration in seconds]
    this.bgmTrack = [
      [330, 0.15], [330, 0.15], [0, 0.15], [330, 0.15], [0, 0.15],
      [262, 0.15], [330, 0.25], [392, 0.35], [0, 0.3], [196, 0.35]
    ];
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Typewriter vocal sound for dialogue
  playVoiceBlip(characterType = 'hero') {
    if (!this.ctx || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    // Differentiate pitch by speaker
    if (characterType === 'hero') {
      osc.frequency.setValueAtTime(440 + Math.random() * 40, this.ctx.currentTime);
      osc.type = 'triangle';
    } else if (characterType === 'elder') {
      osc.frequency.setValueAtTime(180 + Math.random() * 20, this.ctx.currentTime);
      osc.type = 'sawtooth';
    } else {
      osc.frequency.setValueAtTime(320 + Math.random() * 30, this.ctx.currentTime);
      osc.type = 'square';
    }

    gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.05);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  // Fireball sound
  playFireballSFX() {
    if (!this.ctx || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  // Enemy Squish sound
  playSquishSFX() {
    if (!this.ctx || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  startBGM() {
    if (this.bgmPlaying || !this.ctx) return;
    this.bgmPlaying = true;
    this.playNextBgmNote();
  }

  playNextBgmNote() {
    if (!this.bgmPlaying || this.isMuted) return;

    const [freq, duration] = this.bgmTrack[this.currentNoteIndex];

    if (freq > 0) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.015, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    }

    this.currentNoteIndex = (this.currentNoteIndex + 1) % this.bgmTrack.length;
    this.bgmInterval = setTimeout(() => this.playNextBgmNote(), duration * 1000);
  }
}

export const audio = new RetroAudioEngine();