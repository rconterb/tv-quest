// Carrega e registra animações dos personagens (sprites embutidos)
export const CHARACTERS = {
    boy: { label: 'MENINO' },
    girl: { label: 'MENINA' }
};

// arquivos em assets/chars/{boy|girl}/
const FRAMES = {
    boy: [
        'idle', 'idle_b', 'front', 'front2',
        'walk1', 'walk2', 'run3', 'run_a', 'run_b',
        'jump', 'jump_b', 'jump_start', 'jump_mid',
        'crouch', 'happy', 'bag_adj', 'sheet_side', 'sheet_front'
    ],
    girl: [
        'idle', 'idle_b', 'front',
        'walk1', 'walk2', 'run3', 'run_a', 'run_b',
        'jump', 'jump_b', 'jump_start', 'jump_mid', 'jump_land',
        'crouch', 'happy', 'bag_adj', 'sheet_side', 'sheet_front'
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
    if (scene.anims.exists('boy-idle')) return;

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

        // idle: troca sutil entre dois lados
        mk(`${char}-idle`, [t('idle'), t('idle_b'), t('idle'), t('sheet_side')], 2.2, -1);

        // corrida: walk cycle + frames de run em alta qualidade
        mk(`${char}-run`, [
            t('walk1'), t('walk2'), t('run3'),
            t('run_a'), t('run_b'), t('walk2')
        ], 11, -1);

        // pulo: um frame estável (anim trocada por pose no ar)
        mk(`${char}-jump`, [t('jump_mid'), t('jump'), t('jump_b')], 6, 0);

        // crouch / happy (vitória / extras)
        mk(`${char}-crouch`, [t('crouch')], 1, -1);
        mk(`${char}-happy`, [t('happy'), t('front'), t('happy')], 3, -1);
        mk(`${char}-front`, [t('front'), t(char === 'boy' ? 'front2' : 'bag_adj'), t('front')], 2.5, -1);
    }
}

/** Escala visual padrão do personagem no mundo (sprite base ~128px de altura). */
export const CHAR_DISPLAY_SCALE = 0.55;
export const CHAR_BODY = { width: 28, height: 48, offsetX: 0, offsetY: 0 };
