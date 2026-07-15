// Sons e rock por fase — Web Audio (sem arquivos externos)

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

    noiseHit(dur = 0.08, vol = 0.06, delay = 0) {
        this.init();
        if (!this.ctx) return;
        this.resume();
        const t0 = this.ctx.currentTime + delay;
        const len = Math.max(1, Math.floor(this.ctx.sampleRate * dur));
        const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
        const src = this.ctx.createBufferSource();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1800;
        src.buffer = buf;
        gain.gain.setValueAtTime(vol, t0);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
        src.connect(filter);
        filter.connect(gain);
        gain.connect(this.master);
        src.start(t0);
        src.stop(t0 + dur + 0.02);
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

// ---------- notas ----------
const n = (f) => f;
const N = {
    E2: 82.41, F2: 87.31, G2: 98.0, A2: 110.0, B2: 123.47,
    C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, Fs3: 185.0, G3: 196.0, A3: 220.0, B3: 246.94,
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, Fs4: 369.99, G4: 392.0, A4: 440.0, B4: 493.88,
    C5: 523.25, Cs5: 554.37, D5: 587.33, E5: 659.26, F5: 698.46, G5: 783.99, A5: 880.0, B5: 987.77
};

/**
 * 10 riffs de rock (um por fase).
 * lead: [freq, beatStart, beatLen]
 * power: baixos em power-chord (root + 5ª)
 * bpm, leadType, grit
 */
const TRACKS = [
    // 0 — classic rock (Em)
    {
        name: 'Classic Rock',
        bpm: 128,
        leadType: 'sawtooth',
        leadVol: 0.045,
        lead: [
            [N.E4, 0, 0.5], [N.G4, 0.5, 0.5], [N.A4, 1, 0.5], [N.G4, 1.5, 0.5],
            [N.E4, 2, 0.5], [N.D4, 2.5, 0.5], [N.E4, 3, 1],
            [N.B4, 4, 0.5], [N.A4, 4.5, 0.5], [N.G4, 5, 0.5], [N.A4, 5.5, 0.5],
            [N.B4, 6, 0.5], [N.A4, 6.5, 0.5], [N.G4, 7, 1],
            [N.E4, 8, 0.5], [N.G4, 8.5, 0.5], [N.A4, 9, 1],
            [N.G4, 10, 0.5], [N.E4, 10.5, 0.5], [N.D4, 11, 1],
            [N.E4, 12, 0.5], [N.G4, 12.5, 0.5], [N.B4, 13, 0.5], [N.A4, 13.5, 0.5],
            [N.G4, 14, 0.5], [N.E4, 14.5, 0.5], [N.E4, 15, 1]
        ],
        roots: [N.E2, N.E2, N.G2, N.A2, N.E2, N.E2, N.D3, N.B2, N.E2, N.E2, N.G2, N.A2, N.E2, N.D3, N.E2, N.E2]
    },
    // 1 — punk rápido (A)
    {
        name: 'Punk Burst',
        bpm: 168,
        leadType: 'square',
        leadVol: 0.038,
        lead: [
            [N.A4, 0, 0.25], [N.A4, 0.5, 0.25], [N.C5, 1, 0.5], [N.A4, 1.5, 0.5],
            [N.G4, 2, 0.25], [N.A4, 2.5, 0.25], [N.C5, 3, 0.5], [N.E5, 3.5, 0.5],
            [N.A4, 4, 0.25], [N.A4, 4.5, 0.25], [N.C5, 5, 0.5], [N.A4, 5.5, 0.5],
            [N.G4, 6, 0.5], [N.E4, 6.5, 0.5], [N.A4, 7, 1],
            [N.A4, 8, 0.25], [N.C5, 8.5, 0.25], [N.E5, 9, 0.5], [N.C5, 9.5, 0.5],
            [N.A4, 10, 0.5], [N.G4, 10.5, 0.5], [N.A4, 11, 1],
            [N.E5, 12, 0.25], [N.C5, 12.5, 0.25], [N.A4, 13, 0.5], [N.G4, 13.5, 0.5],
            [N.A4, 14, 0.5], [N.A4, 14.5, 0.25], [N.A4, 15, 0.5], [N.A4, 15.5, 0.5]
        ],
        roots: [N.A2, N.A2, N.C3, N.G2, N.A2, N.A2, N.F2, N.G2, N.A2, N.A2, N.C3, N.G2, N.A2, N.F2, N.G2, N.A2]
    },
    // 2 — blues rock (E)
    {
        name: 'Blues Rock',
        bpm: 108,
        leadType: 'sawtooth',
        leadVol: 0.042,
        lead: [
            [N.E4, 0, 0.75], [N.G4, 0.75, 0.25], [N.A4, 1, 0.5], [N.B4, 1.5, 0.5],
            [N.A4, 2, 0.5], [N.G4, 2.5, 0.5], [N.E4, 3, 1],
            [N.A4, 4, 0.5], [N.B4, 4.5, 0.5], [N.C5, 5, 0.5], [N.B4, 5.5, 0.5],
            [N.A4, 6, 0.5], [N.G4, 6.5, 0.5], [N.E4, 7, 1],
            [N.B4, 8, 0.75], [N.A4, 8.75, 0.25], [N.G4, 9, 0.5], [N.E4, 9.5, 0.5],
            [N.G4, 10, 0.5], [N.A4, 10.5, 0.5], [N.B4, 11, 1],
            [N.E4, 12, 0.5], [N.G4, 12.5, 0.5], [N.A4, 13, 0.5], [N.G4, 13.5, 0.5],
            [N.E4, 14, 1], [N.E4, 15, 1]
        ],
        roots: [N.E2, N.E2, N.E2, N.E2, N.A2, N.A2, N.E2, N.E2, N.B2, N.A2, N.E2, N.E2, N.E2, N.B2, N.E2, N.E2]
    },
    // 3 — power metal (D)
    {
        name: 'Power Drive',
        bpm: 152,
        leadType: 'square',
        leadVol: 0.04,
        lead: [
            [N.D5, 0, 0.25], [N.A4, 0.25, 0.25], [N.D5, 0.5, 0.25], [N.F5, 0.75, 0.25],
            [N.E5, 1, 0.5], [N.D5, 1.5, 0.5], [N.C5, 2, 0.5], [N.A4, 2.5, 0.5], [N.D5, 3, 1],
            [N.F5, 4, 0.25], [N.E5, 4.25, 0.25], [N.D5, 4.5, 0.5], [N.C5, 5, 0.5], [N.A4, 5.5, 0.5],
            [N.G4, 6, 0.5], [N.A4, 6.5, 0.5], [N.D5, 7, 1],
            [N.A4, 8, 0.25], [N.D5, 8.5, 0.25], [N.F5, 9, 0.5], [N.E5, 9.5, 0.5],
            [N.D5, 10, 0.5], [N.C5, 10.5, 0.5], [N.D5, 11, 1],
            [N.F5, 12, 0.5], [N.G5, 12.5, 0.5], [N.A5, 13, 0.5], [N.G5, 13.5, 0.5],
            [N.F5, 14, 0.5], [N.E5, 14.5, 0.5], [N.D5, 15, 1]
        ],
        roots: [N.D3, N.D3, N.C3, N.A2, N.D3, N.F2, N.G2, N.A2, N.D3, N.D3, N.C3, N.A2, N.F2, N.G2, N.A2, N.D3]
    },
    // 4 — garage rock (G)
    {
        name: 'Garage Riff',
        bpm: 136,
        leadType: 'sawtooth',
        leadVol: 0.044,
        lead: [
            [N.G4, 0, 0.5], [N.G4, 0.5, 0.25], [N.A4, 0.75, 0.25], [N.B4, 1, 0.5], [N.G4, 1.5, 0.5],
            [N.D5, 2, 0.5], [N.B4, 2.5, 0.5], [N.A4, 3, 0.5], [N.G4, 3.5, 0.5],
            [N.G4, 4, 0.5], [N.A4, 4.5, 0.5], [N.B4, 5, 0.5], [N.D5, 5.5, 0.5],
            [N.E5, 6, 0.5], [N.D5, 6.5, 0.5], [N.B4, 7, 1],
            [N.G4, 8, 0.5], [N.B4, 8.5, 0.5], [N.D5, 9, 0.5], [N.B4, 9.5, 0.5],
            [N.A4, 10, 0.5], [N.G4, 10.5, 0.5], [N.E4, 11, 1],
            [N.G4, 12, 0.25], [N.G4, 12.5, 0.25], [N.A4, 13, 0.5], [N.B4, 13.5, 0.5],
            [N.G4, 14, 1], [N.G4, 15, 1]
        ],
        roots: [N.G2, N.G2, N.C3, N.D3, N.G2, N.G2, N.E2, N.D3, N.G2, N.G2, N.C3, N.D3, N.G2, N.E2, N.D3, N.G2]
    },
    // 5 — indie rock (C)
    {
        name: 'Indie Drive',
        bpm: 118,
        leadType: 'triangle',
        leadVol: 0.055,
        lead: [
            [N.C5, 0, 1], [N.E5, 1, 0.5], [N.G5, 1.5, 0.5], [N.E5, 2, 0.5], [N.D5, 2.5, 0.5], [N.C5, 3, 1],
            [N.A4, 4, 0.5], [N.C5, 4.5, 0.5], [N.E5, 5, 1], [N.D5, 6, 0.5], [N.C5, 6.5, 0.5], [N.A4, 7, 1],
            [N.G4, 8, 0.5], [N.C5, 8.5, 0.5], [N.E5, 9, 0.5], [N.G5, 9.5, 0.5],
            [N.E5, 10, 0.5], [N.D5, 10.5, 0.5], [N.C5, 11, 1],
            [N.E5, 12, 0.5], [N.D5, 12.5, 0.5], [N.C5, 13, 0.5], [N.A4, 13.5, 0.5],
            [N.G4, 14, 1], [N.C5, 15, 1]
        ],
        roots: [N.C3, N.G2, N.A2, N.F2, N.C3, N.G2, N.A2, N.F2, N.C3, N.E2, N.F2, N.G2, N.A2, N.F2, N.G2, N.C3]
    },
    // 6 — hard rock (B)
    {
        name: 'Hard Rock',
        bpm: 124,
        leadType: 'sawtooth',
        leadVol: 0.048,
        lead: [
            [N.B3, 0, 0.5], [N.B3, 0.5, 0.25], [N.D4, 0.75, 0.25], [N.E4, 1, 0.5], [N.D4, 1.5, 0.5],
            [N.B3, 2, 0.5], [N.A3, 2.5, 0.5], [N.B3, 3, 1],
            [N.E4, 4, 0.5], [N.Fs4, 4.5, 0.5], [N.G4, 5, 0.5], [N.Fs4, 5.5, 0.5],
            [N.E4, 6, 0.5], [N.D4, 6.5, 0.5], [N.B3, 7, 1],
            [N.B3, 8, 0.25], [N.B3, 8.5, 0.25], [N.D4, 9, 0.5], [N.E4, 9.5, 0.5],
            [N.G4, 10, 0.5], [N.Fs4, 10.5, 0.5], [N.E4, 11, 1],
            [N.B4, 12, 0.5], [N.A4, 12.5, 0.5], [N.G4, 13, 0.5], [N.E4, 13.5, 0.5],
            [N.D4, 14, 0.5], [N.B3, 14.5, 0.5], [N.B3, 15, 1]
        ],
        roots: [N.B2, N.B2, N.E2, N.G2, N.B2, N.A2, N.G2, N.E2, N.B2, N.B2, N.E2, N.G2, N.A2, N.G2, N.E2, N.B2]
    },
    // 7 — surf rock (E major)
    {
        name: 'Surf Rock',
        bpm: 144,
        leadType: 'triangle',
        leadVol: 0.05,
        lead: [
            [N.E5, 0, 0.25], [N.G5, 0.25, 0.25], [N.A5, 0.5, 0.5], [N.G5, 1, 0.5], [N.E5, 1.5, 0.5],
            [N.B4, 2, 0.5], [N.A4, 2.5, 0.5], [N.G4, 3, 0.5], [N.E4, 3.5, 0.5],
            [N.E5, 4, 0.25], [N.G5, 4.25, 0.25], [N.B5, 4.5, 0.5], [N.A5, 5, 0.5], [N.G5, 5.5, 0.5],
            [N.E5, 6, 1], [N.E5, 7, 1],
            [N.A5, 8, 0.5], [N.G5, 8.5, 0.5], [N.E5, 9, 0.5], [N.G5, 9.5, 0.5],
            [N.A5, 10, 0.5], [N.B5, 10.5, 0.5], [N.A5, 11, 1],
            [N.G5, 12, 0.5], [N.E5, 12.5, 0.5], [N.D5, 13, 0.5], [N.E5, 13.5, 0.5],
            [N.E5, 14, 1], [N.E4, 15, 1]
        ],
        roots: [N.E2, N.A2, N.B2, N.E2, N.E2, N.A2, N.B2, N.E2, N.A2, N.E2, N.B2, N.A2, N.E2, N.B2, N.E2, N.E2]
    },
    // 8 — alternative (F# minor feel)
    {
        name: 'Alt Rock',
        bpm: 112,
        leadType: 'sawtooth',
        leadVol: 0.04,
        lead: [
            [N.Fs4, 0, 1], [N.A4, 1, 0.5], [N.B4, 1.5, 0.5], [N.A4, 2, 0.5], [N.Fs4, 2.5, 0.5], [N.E4, 3, 1],
            [N.Fs4, 4, 0.5], [N.A4, 4.5, 0.5], [N.Cs5, 5, 1], [N.B4, 6, 0.5], [N.A4, 6.5, 0.5], [N.Fs4, 7, 1],
            [N.E4, 8, 0.5], [N.Fs4, 8.5, 0.5], [N.A4, 9, 0.5], [N.B4, 9.5, 0.5],
            [N.A4, 10, 1], [N.Fs4, 11, 1],
            [N.B4, 12, 0.5], [N.A4, 12.5, 0.5], [N.Fs4, 13, 0.5], [N.E4, 13.5, 0.5],
            [N.Fs4, 14, 1], [N.Fs4, 15, 1]
        ],
        roots: [N.Fs3, N.Fs3, N.A2, N.E2, N.Fs3, N.D3, N.E2, N.Fs3, N.A2, N.B2, N.Fs3, N.E2, N.D3, N.E2, N.Fs3, N.Fs3]
    },
    // 9 — boss epic rock (D minor)
    {
        name: 'Boss Riff',
        bpm: 140,
        leadType: 'sawtooth',
        leadVol: 0.05,
        lead: [
            [N.D4, 0, 0.5], [N.D4, 0.5, 0.25], [N.F4, 0.75, 0.25], [N.A4, 1, 0.5], [N.G4, 1.5, 0.5],
            [N.F4, 2, 0.5], [N.E4, 2.5, 0.5], [N.D4, 3, 1],
            [N.A4, 4, 0.25], [N.A4, 4.5, 0.25], [N.C5, 5, 0.5], [N.A4, 5.5, 0.5],
            [N.G4, 6, 0.5], [N.F4, 6.5, 0.5], [N.D4, 7, 1],
            [N.D5, 8, 0.5], [N.C5, 8.5, 0.5], [N.A4, 9, 0.5], [N.G4, 9.5, 0.5],
            [N.F4, 10, 0.5], [N.A4, 10.5, 0.5], [N.D5, 11, 1],
            [N.F5, 12, 0.5], [N.E5, 12.5, 0.5], [N.D5, 13, 0.5], [N.C5, 13.5, 0.5],
            [N.A4, 14, 0.5], [N.G4, 14.5, 0.5], [N.D4, 15, 1]
        ],
        roots: [N.D3, N.D3, N.F2, N.C3, N.D3, N.A2, N.C3, N.D3, N.D3, N.F2, N.G2, N.A2, N.F2, N.C3, N.D3, N.D3]
    }
];

export const Music = {
    playing: false,
    timer: null,
    nextLoopAt: 0,
    trackIndex: 0,
    track: TRACKS[0],

    /** Inicia (ou troca) o rock da fase. levelIndex 0..9 */
    start(levelIndex = 0) {
        Sound.init();
        if (!Sound.ctx) return;
        Sound.resume();

        const idx = ((levelIndex % TRACKS.length) + TRACKS.length) % TRACKS.length;
        // se já toca a mesma faixa, não reinicia
        if (this.playing && this.trackIndex === idx) return;

        this.stop();
        this.trackIndex = idx;
        this.track = TRACKS[idx];
        this.playing = true;
        this.nextLoopAt = Sound.ctx.currentTime + 0.08;
        this.timer = setInterval(() => this.tick(), 120);
        this.tick();
    },

    stop() {
        this.playing = false;
        if (this.timer) clearInterval(this.timer);
        this.timer = null;
    },

    tick() {
        if (!this.playing || !Sound.ctx) return;
        const t = this.track;
        const loopDur = 16 * 60 / t.bpm;
        if (Sound.ctx.currentTime > this.nextLoopAt - 0.35) {
            this.scheduleLoop(this.nextLoopAt);
            this.nextLoopAt += loopDur;
        }
    },

    scheduleLoop(t0) {
        const t = this.track;
        const b = 60 / t.bpm;

        // bateria simples (kick + snare)
        for (let i = 0; i < 16; i++) {
            const at = t0 + i * b;
            // kick em 1 e 3
            if (i % 2 === 0) this.kick(at, 0.07);
            // snare em 2 e 4
            if (i % 2 === 1) this.snare(at, 0.045);
            // hi-hat 8ths
            this.hat(at, 0.02);
            this.hat(at + b * 0.5, 0.015);
        }

        // power bass (root + 5ª)
        t.roots.forEach((root, i) => {
            const at = t0 + i * b;
            this.note('sawtooth', root, at, b * 0.85, 0.06);
            this.note('square', root * 1.5, at, b * 0.7, 0.028); // 5ª
        });

        // lead riff
        for (const [f, at, len] of t.lead) {
            this.note(t.leadType, f, t0 + at * b, len * b * 0.88, t.leadVol);
        }
    },

    note(type, freq, t, dur, vol) {
        const ctx = Sound.ctx;
        if (!ctx || !Sound.master) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(3200, t);
        osc.type = type;
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(vol, t + 0.015);
        gain.gain.setValueAtTime(vol * 0.85, t + dur * 0.55);
        gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(Sound.master);
        osc.start(t);
        osc.stop(t + dur + 0.04);
    },

    kick(t, vol) {
        const ctx = Sound.ctx;
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, t);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.12);
        gain.gain.setValueAtTime(vol, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
        osc.connect(gain);
        gain.connect(Sound.master);
        osc.start(t);
        osc.stop(t + 0.16);
    },

    snare(t, vol) {
        Sound.noiseHit(0.09, vol, Math.max(0, t - Sound.ctx.currentTime));
        // body
        const ctx = Sound.ctx;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, t);
        gain.gain.setValueAtTime(vol * 0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        osc.connect(gain);
        gain.connect(Sound.master);
        osc.start(t);
        osc.stop(t + 0.1);
    },

    hat(t, vol) {
        Sound.noiseHit(0.03, vol, Math.max(0, t - Sound.ctx.currentTime));
    }
};
