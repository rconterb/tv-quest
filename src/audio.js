// Sons (Web Audio) + trilha rock REAL (MP3 em assets/music/)
// Fallback sintético só se o arquivo não carregar.

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

// ---------- trilhas reais (MP3) ----------
// Ordem = progressão de energia nas fases. Créditos no README.
const TRACKS = [
    {
        id: 'strut',
        file: 'assets/music/rock_strut.mp3',
        name: 'Strut',
        credit: 'Snabisch (CC0)',
        vol: 0.42
    },
    {
        id: 'drive',
        file: 'assets/music/rock_drive.mp3',
        name: 'Drive',
        credit: 'Pro Sensory (CC0)',
        vol: 0.38
    },
    {
        id: 'survival',
        file: 'assets/music/rock_survival.mp3',
        name: 'The Survival',
        credit: 'PlayOnLoop (CC-BY 3.0)',
        vol: 0.45
    },
    {
        id: 'halloween',
        file: 'assets/music/rock_halloween.mp3',
        name: "Halloween Rock'n'Roll",
        credit: 'PlayOnLoop (CC-BY 3.0)',
        vol: 0.45
    }
];

// fase 0..9 → índice da trilha (variam, não repete a mesma o tempo todo)
const LEVEL_TRACK = [0, 0, 1, 1, 2, 2, 3, 3, 2, 1];

export const Music = {
    playing: false,
    trackIndex: -1,
    levelIndex: 0,
    gain: null,
    source: null,
    buffers: new Map(),   // id → AudioBuffer
    loading: null,        // Promise do preload
    wanted: true,         // usuário quer música ligada
    fadeTween: null,

    /** Pré-carrega as 4 faixas (chamar no menu / 1º play). */
    preload() {
        Sound.init();
        if (!Sound.ctx) return Promise.resolve();
        if (this.loading) return this.loading;

        this.loading = (async () => {
            // bus de música separado (volume da trilha sem afetar SFX)
            if (!this.gain) {
                this.gain = Sound.ctx.createGain();
                this.gain.gain.value = 0.4;
                this.gain.connect(Sound.master);
            }
            await Promise.all(TRACKS.map(async (t) => {
                if (this.buffers.has(t.id)) return;
                try {
                    const res = await fetch(t.file);
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    const raw = await res.arrayBuffer();
                    const buf = await Sound.ctx.decodeAudioData(raw.slice(0));
                    this.buffers.set(t.id, buf);
                } catch (err) {
                    console.warn('[Music] falha ao carregar', t.file, err);
                }
            }));
        })();
        return this.loading;
    },

    /**
     * Inicia (ou troca) a trilha da fase.
     * @param {number} levelIndex 0..9
     */
    async start(levelIndex = 0) {
        this.wanted = true;
        this.levelIndex = levelIndex;
        Sound.init();
        if (!Sound.ctx) return;
        Sound.resume();

        await this.preload();

        const idx = LEVEL_TRACK[((levelIndex % 10) + 10) % 10] ?? (levelIndex % TRACKS.length);
        // já tocando a mesma faixa
        if (this.playing && this.trackIndex === idx && this.source) return;

        const track = TRACKS[idx];
        const buffer = this.buffers.get(track.id);

        if (!buffer) {
            // fallback: rock sintético animado (bem melhor que o antigo beep)
            this._stopSource(false);
            this.trackIndex = idx;
            this.playing = true;
            SynthRock.start(levelIndex);
            return;
        }

        SynthRock.stop();
        this._stopSource(false);
        this.trackIndex = idx;
        this.playing = true;

        const src = Sound.ctx.createBufferSource();
        src.buffer = buffer;
        src.loop = true;
        // loops de rock costumam fechar bem; se houver clique, um micro-crossfade ajuda
        if (buffer.duration > 2) {
            try {
                src.loopStart = 0;
                src.loopEnd = buffer.duration;
            } catch (_) { /* ignore */ }
        }
        src.connect(this.gain);
        const now = Sound.ctx.currentTime;
        this.gain.gain.cancelScheduledValues(now);
        this.gain.gain.setValueAtTime(0.0001, now);
        this.gain.gain.linearRampToValueAtTime(track.vol, now + 0.45);
        src.start(0);
        this.source = src;

        src.onended = () => {
            // se o browser parar o source, tenta retomar se ainda queremos música
            if (this.playing && this.wanted && this.source === src) {
                this.source = null;
                this.playing = false;
                this.start(this.levelIndex);
            }
        };
    },

    stop() {
        this.wanted = false;
        this.playing = false;
        SynthRock.stop();
        this._stopSource(true);
    },

    _stopSource(fade) {
        const src = this.source;
        this.source = null;
        if (!src || !Sound.ctx || !this.gain) return;
        try {
            if (fade) {
                const now = Sound.ctx.currentTime;
                this.gain.gain.cancelScheduledValues(now);
                this.gain.gain.setValueAtTime(this.gain.gain.value, now);
                this.gain.gain.linearRampToValueAtTime(0.0001, now + 0.25);
                src.stop(now + 0.28);
            } else {
                src.stop(0);
            }
        } catch (_) { /* already stopped */ }
        try { src.disconnect(); } catch (_) { /* */ }
    }
};

// ---------- fallback: rock sintético animado (só se MP3 falhar) ----------
const N = {
    E2: 82.41, G2: 98.0, A2: 110.0, B2: 123.47,
    C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0, A3: 220.0, B3: 246.94,
    C4: 261.63, D4: 293.66, E4: 329.63, G4: 392.0, A4: 440.0, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.26, G5: 783.99, A5: 880.0
};

const SynthRock = {
    playing: false,
    timer: null,
    nextAt: 0,
    bpm: 148,
    level: 0,

    start(levelIndex = 0) {
        this.stop();
        Sound.init();
        if (!Sound.ctx) return;
        this.level = levelIndex;
        this.bpm = 140 + (levelIndex % 5) * 6;
        this.playing = true;
        this.nextAt = Sound.ctx.currentTime + 0.05;
        this.timer = setInterval(() => this.tick(), 80);
        this.tick();
    },

    stop() {
        this.playing = false;
        if (this.timer) clearInterval(this.timer);
        this.timer = null;
    },

    tick() {
        if (!this.playing || !Sound.ctx) return;
        const bars = 4; // 4 compassos × 4 beats = 16 beats, mas com fills e variação
        const loopBeats = 32;
        const loopDur = loopBeats * 60 / this.bpm;
        if (Sound.ctx.currentTime > this.nextAt - 0.4) {
            this.schedule(this.nextAt);
            this.nextAt += loopDur;
        }
    },

    schedule(t0) {
        const b = 60 / this.bpm;
        const roots = this.level % 2 === 0
            ? [N.E2, N.E2, N.G2, N.A2, N.E2, N.E2, N.D3, N.B2,
               N.E2, N.E2, N.G2, N.A2, N.C3, N.D3, N.E2, N.E2,
               N.A2, N.A2, N.G2, N.G2, N.E2, N.E2, N.D3, N.D3,
               N.E2, N.G2, N.A2, N.B2, N.E2, N.D3, N.E2, N.E2]
            : [N.A2, N.A2, N.C3, N.G2, N.A2, N.A2, N.F3, N.G2,
               N.A2, N.A2, N.C3, N.G2, N.A2, N.F3, N.G2, N.A2,
               N.C3, N.C3, N.G2, N.G2, N.A2, N.A2, N.E2, N.E2,
               N.A2, N.C3, N.D3, N.E3, N.A2, N.G2, N.A2, N.A2];

        // bateria rock (backbeat + hi-hat 8ths + fills)
        for (let i = 0; i < 32; i++) {
            const at = t0 + i * b;
            const beat = i % 4;
            // kick no 1 e “e” do 3, às vezes no 2.5
            if (beat === 0 || beat === 2) this.kick(at, 0.11);
            if (beat === 2) this.kick(at + b * 0.5, 0.05);
            // snare no 2 e 4
            if (beat === 1 || beat === 3) this.snare(at, 0.07);
            // hi-hat aberto no offbeat
            this.hat(at, 0.022, false);
            this.hat(at + b * 0.5, 0.03, true);
            // fill a cada 8 compassos (últimos 2 beats do loop)
            if (i >= 30) {
                this.snare(at, 0.06);
                this.snare(at + b * 0.25, 0.05);
                this.snare(at + b * 0.5, 0.05);
                this.snare(at + b * 0.75, 0.06);
            }
        }

        // guitarra rítmica (power chords com palm-mute)
        for (let i = 0; i < 32; i++) {
            const root = roots[i];
            const at = t0 + i * b;
            const open = i % 4 === 0 || i % 8 === 4;
            const dur = open ? b * 0.9 : b * 0.28;
            const vol = open ? 0.055 : 0.04;
            this.power(root, at, dur, vol);
            if (!open) {
                this.power(root, at + b * 0.5, b * 0.22, 0.035);
            }
        }

        // baixo sincronizado com kick
        for (let i = 0; i < 32; i++) {
            const root = roots[i];
            const at = t0 + i * b;
            this.bass(root, at, b * 0.55, 0.07);
            if (i % 4 === 2) this.bass(root * 1.5, at + b * 0.5, b * 0.35, 0.04);
        }

        // lead — riff com call & response (não monótono)
        const riffA = [
            [N.E4, 0, 0.5], [N.G4, 0.5, 0.5], [N.A4, 1, 0.5], [N.B4, 1.5, 0.5],
            [N.A4, 2, 0.5], [N.G4, 2.5, 0.5], [N.E4, 3, 1],
            [N.B4, 4, 0.5], [N.A4, 4.5, 0.5], [N.G4, 5, 0.5], [N.E4, 5.5, 0.5],
            [N.G4, 6, 0.5], [N.A4, 6.5, 0.5], [N.B4, 7, 1]
        ];
        const riffB = [
            [N.E5, 0, 0.25], [N.D5, 0.25, 0.25], [N.B4, 0.5, 0.5], [N.A4, 1, 0.5],
            [N.G4, 1.5, 0.5], [N.A4, 2, 0.5], [N.B4, 2.5, 0.5], [N.E5, 3, 1],
            [N.G5, 4, 0.5], [N.E5, 4.5, 0.5], [N.D5, 5, 0.5], [N.B4, 5.5, 0.5],
            [N.A4, 6, 0.5], [N.G4, 6.5, 0.5], [N.E4, 7, 1]
        ];
        for (const [f, start, len] of riffA) {
            this.lead(f, t0 + start * b, len * b * 0.9, 0.04);
        }
        for (const [f, start, len] of riffB) {
            this.lead(f, t0 + (16 + start) * b, len * b * 0.9, 0.045);
        }
    },

    power(root, t, dur, vol) {
        // root + 5ª + oitava com distorção leve (waveshape via overdrive de saw)
        this.note('sawtooth', root, t, dur, vol);
        this.note('sawtooth', root * 1.5, t, dur, vol * 0.55);
        this.note('square', root * 2, t, dur * 0.85, vol * 0.25);
    },

    bass(freq, t, dur, vol) {
        this.note('triangle', freq, t, dur, vol);
        this.note('sine', freq * 0.5, t, dur, vol * 0.5);
    },

    lead(freq, t, dur, vol) {
        this.note('square', freq, t, dur, vol);
        this.note('triangle', freq * 2, t, dur * 0.7, vol * 0.25);
    },

    note(type, freq, t, dur, vol) {
        const ctx = Sound.ctx;
        if (!ctx || !Sound.master) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2800, t);
        filter.Q.value = 0.7;
        osc.type = type;
        osc.frequency.setValueAtTime(Math.max(freq, 20), t);
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(vol, t + 0.012);
        gain.gain.setValueAtTime(vol * 0.8, t + dur * 0.5);
        gain.gain.exponentialRampToValueAtTime(0.001, t + Math.max(dur, 0.05));
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(Sound.master);
        osc.start(t);
        osc.stop(t + dur + 0.05);
    },

    kick(t, vol) {
        const ctx = Sound.ctx;
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(38, t + 0.14);
        gain.gain.setValueAtTime(vol, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
        osc.connect(gain);
        gain.connect(Sound.master);
        osc.start(t);
        osc.stop(t + 0.18);
    },

    snare(t, vol) {
        Sound.noiseHit(0.1, vol, Math.max(0, t - Sound.ctx.currentTime));
        const ctx = Sound.ctx;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(190, t);
        gain.gain.setValueAtTime(vol * 0.45, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        osc.connect(gain);
        gain.connect(Sound.master);
        osc.start(t);
        osc.stop(t + 0.1);
    },

    hat(t, vol, open) {
        Sound.noiseHit(open ? 0.06 : 0.025, vol, Math.max(0, t - Sound.ctx.currentTime));
    }
};
