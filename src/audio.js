// Sons e música gerados por síntese (Web Audio) — nenhum arquivo de áudio é necessário

export const Sound = {
    ctx: null,
    master: null,
    muted: false,

    init() {
        if (this.ctx) return;
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        this.ctx = new AC();
        this.master = this.ctx.createGain();
        this.master.gain.value = this.muted ? 0 : 1;
        this.master.connect(this.ctx.destination);

        // Silencia por completo quando a aba perde o foco ou fica oculta —
        // evita música duplicada quando o jogo está aberto em mais de uma aba
        const suspend = () => this.ctx && this.ctx.suspend();
        const wake = () => {
            if (this.ctx && !document.hidden && document.hasFocus()) this.ctx.resume();
        };
        document.addEventListener('visibilitychange', () => document.hidden ? suspend() : wake());
        window.addEventListener('blur', suspend);
        window.addEventListener('focus', wake);
        if (!document.hasFocus()) suspend();
    },

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    },

    setMuted(m) {
        this.muted = m;
        if (this.master) this.master.gain.value = m ? 0 : 1;
    },

    tone({ type = 'sine', from = 440, to = null, dur = 0.15, vol = 0.1, delay = 0 }) {
        this.init();
        if (!this.ctx) return;
        this.resume();
        const t0 = this.ctx.currentTime + delay;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(from, t0);
        if (to) osc.frequency.exponentialRampToValueAtTime(Math.max(to, 1), t0 + dur);
        gain.gain.setValueAtTime(vol, t0);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
        osc.connect(gain);
        gain.connect(this.master);
        osc.start(t0);
        osc.stop(t0 + dur + 0.05);
    },

    step()   { this.tone({ type: 'triangle', from: 150, to: 50, dur: 0.05, vol: 0.035 }); },
    jump()   { this.tone({ type: 'sine', from: 280, to: 620, dur: 0.18, vol: 0.09 }); },
    coin()   {
        this.tone({ type: 'square', from: 880, dur: 0.08, vol: 0.045 });
        this.tone({ type: 'square', from: 1318.5, dur: 0.12, vol: 0.045, delay: 0.07 });
    },
    stomp()  { this.tone({ type: 'square', from: 200, to: 60, dur: 0.2, vol: 0.12 }); },
    hurt()   { this.tone({ type: 'sawtooth', from: 220, to: 90, dur: 0.25, vol: 0.1 }); },
    spring() { this.tone({ type: 'sine', from: 180, to: 900, dur: 0.25, vol: 0.1 }); },
    death()  { this.tone({ type: 'sawtooth', from: 300, to: 40, dur: 0.6, vol: 0.14 }); },
    click()  { this.tone({ type: 'square', from: 600, dur: 0.05, vol: 0.04 }); },

    win() {
        [523.25, 659.26, 783.99, 1046.5].forEach((f, i) =>
            this.tone({ type: 'triangle', from: f, dur: 0.22, vol: 0.09, delay: i * 0.13 }));
    },

    victory() {
        [392, 523.25, 659.26, 783.99, 1046.5, 783.99, 1046.5].forEach((f, i) =>
            this.tone({ type: 'triangle', from: f, dur: 0.3, vol: 0.1, delay: i * 0.16 }));
    }
};

// Notas usadas na trilha
const N = {
    C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0, A3: 220.0,
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0,
    B4: 493.88, C5: 523.25, D5: 587.33
};

// Trilha sonora em loop: melodia alegre em Dó maior (16 tempos)
export const Music = {
    playing: false,
    timer: null,
    nextLoopAt: 0,
    BPM: 112,

    lead: [
        [N.E4, 0, 0.5], [N.G4, 0.5, 0.5], [N.A4, 1, 1], [N.G4, 2, 0.5], [N.E4, 2.5, 0.5], [N.G4, 3, 1],
        [N.A4, 4, 0.5], [N.C5, 4.5, 0.5], [N.D5, 5, 1], [N.C5, 6, 0.5], [N.A4, 6.5, 0.5], [N.G4, 7, 1],
        [N.E4, 8, 0.5], [N.G4, 8.5, 0.5], [N.A4, 9, 1], [N.C5, 10, 0.5], [N.A4, 10.5, 0.5], [N.G4, 11, 1],
        [N.A4, 12, 0.5], [N.G4, 12.5, 0.5], [N.E4, 13, 1], [N.D4, 14, 0.5], [N.E4, 14.5, 0.5], [N.C4, 15, 1]
    ],

    bass: [
        N.C3, N.G3, N.C3, N.G3,
        N.F3, N.C3, N.F3, N.C3,
        N.A3, N.E3, N.A3, N.E3,
        N.G3, N.D3, N.C3, N.C3
    ],

    start() {
        Sound.init();
        if (!Sound.ctx || this.playing) return;
        Sound.resume();
        this.playing = true;
        this.nextLoopAt = Sound.ctx.currentTime + 0.1;
        this.timer = setInterval(() => this.tick(), 200);
        this.tick();
    },

    stop() {
        this.playing = false;
        if (this.timer) clearInterval(this.timer);
        this.timer = null;
    },

    tick() {
        if (!this.playing || !Sound.ctx) return;
        const loopDur = 16 * 60 / this.BPM;
        if (Sound.ctx.currentTime > this.nextLoopAt - 0.4) {
            this.scheduleLoop(this.nextLoopAt);
            this.nextLoopAt += loopDur;
        }
    },

    scheduleLoop(t0) {
        const b = 60 / this.BPM;
        for (const [f, at, len] of this.lead) this.note('triangle', f, t0 + at * b, len * b * 0.9, 0.05);
        this.bass.forEach((f, i) => this.note('sine', f, t0 + i * b, b * 0.8, 0.05));
    },

    note(type, freq, t, dur, vol) {
        const ctx = Sound.ctx;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(vol, t + 0.02);
        gain.gain.setValueAtTime(vol, t + dur * 0.6);
        gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
        osc.connect(gain);
        gain.connect(Sound.master);
        osc.start(t);
        osc.stop(t + dur + 0.05);
    }
};
