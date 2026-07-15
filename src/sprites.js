// Sprites embutidos — canvas 128×128, perfil olhando para a DIREITA
export const CHARACTERS = {
    boy: { label: 'MENINO' },
    girl: { label: 'MENINA' }
};

// Apenas frames usados no jogo (todos no mesmo tamanho)
const FRAMES = {
    boy: [
        'idle', 'idle_b', 'front',
        'walk1', 'walk2', 'walk3', 'run1', 'run2',
        'jump', 'jump_b', 'jump_mid', 'crouch', 'happy'
    ],
    girl: [
        'idle', 'idle_b', 'front',
        'walk1', 'walk2', 'walk3', 'run1', 'run2',
        'jump', 'jump_b', 'jump_mid', 'crouch', 'happy'
    ]
};

export function charTex(charKey, frame) {
    return `${charKey}_${frame}`;
}

export function preloadCharacters(scene) {
    for (const [char, list] of Object.entries(FRAMES)) {
        for (const frame of list) {
            const key = charTex(char, frame);
            if (scene.textures.exists(key)) continue;
            scene.load.image(key, `assets/chars/${char}/${frame}.png`);
        }
    }
}

export function createCharacterAnims(scene) {
    // recria se já existia (hot reload / troca de cena)
    for (const char of ['boy', 'girl']) {
        for (const name of ['idle', 'run', 'jump', 'happy', 'front']) {
            const key = `${char}-${name}`;
            if (scene.anims.exists(key)) scene.anims.remove(key);
        }
    }

    const mk = (key, frames, frameRate, repeat = -1) => {
        scene.anims.create({
            key,
            frames: frames.map((f) => ({ key: f })),
            frameRate,
            repeat
        });
    };

    for (const char of ['boy', 'girl']) {
        const t = (f) => charTex(char, f);

        // idle estável — só 2 frames muito parecidos de perfil
        mk(`${char}-idle`, [t('idle'), t('idle_b')], 1.6, -1);

        // corrida: walk da sheet + run HQ (mesmo canvas → sem salto)
        mk(`${char}-run`, [
            t('walk1'), t('walk2'), t('walk3'),
            t('run1'), t('run2'), t('walk2')
        ], 10, -1);

        // jump anim (fallback; no ar usamos pose estática)
        mk(`${char}-jump`, [t('jump_mid')], 1, -1);

        mk(`${char}-happy`, [t('happy'), t('front'), t('happy')], 2.5, -1);
        mk(`${char}-front`, [t('front'), t('happy'), t('front')], 2.2, -1);
    }
}

/** Escala no mundo (sprite base 128px). */
export const CHAR_DISPLAY_SCALE = 0.58;
/** Hitbox fixa (não depende do frame). */
export const CHAR_BODY = { width: 30, height: 50 };
