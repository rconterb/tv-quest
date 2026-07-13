// Progresso salvo no localStorage
const KEY = 'tvquest_save_v1';

const DEFAULTS = { unlocked: 1, stars: {}, character: 'boy', muted: false };

export function loadSave() {
    try {
        return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') };
    } catch (e) {
        return { ...DEFAULTS };
    }
}

export function updateSave(patch) {
    const s = { ...loadSave(), ...patch };
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* modo anônimo */ }
    return s;
}
