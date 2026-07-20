import { levels } from '../levels.js';
import { generateTextures, gradientStrips } from '../textures.js';
import { CHARACTERS } from '../objects.js';
import { preloadCharacters, createCharacterAnims, charTex, CHAR_DISPLAY_SCALE } from '../sprites.js';
import { Sound, Music } from '../audio.js';
import { loadSave, updateSave } from '../save.js';

export class MenuScene extends Phaser.Scene {
    constructor() { super('MenuScene'); }

    preload() {
        preloadCharacters(this);
    }

    create() {
        generateTextures(this);
        createCharacterAnims(this);

        const save = loadSave();
        this.selectedChar = save.character;
        Sound.setMuted(save.muted);

        // sala aquarela rica
        const bg = this.add.graphics();
        gradientStrips(bg, 0, 0, 960, 220, 0xfffaf2, 0xf5e6d0, 24);
        gradientStrips(bg, 0, 210, 960, 200, 0xf5e6d0, 0xe8c9a0, 20);
        gradientStrips(bg, 0, 400, 960, 140, 0xe8c9a0, 0xc4a06a, 14);

        this.add.tileSprite(480, 200, 960, 300, 'wallpaper').setAlpha(0.18);
        this.add.tileSprite(480, 8, 960, 16, 'crown').setAlpha(0.75);
        this.add.tileSprite(480, 450, 960, 20, 'wainscot').setAlpha(0.9);
        this.add.tileSprite(480, 505, 960, 80, 'floorboard').setAlpha(0.45).setTint(0xc4a06a);

        // janela + cortinas de fundo
        this.add.image(200, 140, 'window').setScale(0.75).setAlpha(0.9);
        this.add.image(760, 140, 'window').setScale(0.75).setAlpha(0.9);
        this.add.image(140, 150, 'curtain').setScale(0.7).setTint(0xe07070).setAlpha(0.8);
        this.add.image(260, 150, 'curtain').setScale(0.7).setFlipX(true).setTint(0xe07070).setAlpha(0.8);
        this.add.image(700, 150, 'curtain').setScale(0.7).setTint(0xe07070).setAlpha(0.8);
        this.add.image(820, 150, 'curtain').setScale(0.7).setFlipX(true).setTint(0xe07070).setAlpha(0.8);

        const glow = this.add.circle(480, 148, 140, 0xfff0b0, 0.28);
        this.tweens.add({
            targets: glow, alpha: 0.1, scale: 1.22,
            duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });
        this.add.image(480, 200, 'shadow_soft').setAlpha(0.35).setScale(1.1, 0.6);
        const tv = this.add.image(480, 148, 'tv_on').setScale(1.2);
        this.tweens.add({
            targets: tv, scaleY: 1.24, duration: 1400,
            yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });

        this.add.image(90, 520, 'plant').setOrigin(0.5, 1).setScale(1.35).setAlpha(0.95);
        this.add.image(870, 520, 'plant').setOrigin(0.5, 1).setScale(1.3).setAlpha(0.95);
        this.add.image(160, 520, 'sofa').setOrigin(0.5, 1).setScale(0.7).setAlpha(0.55);
        this.add.image(800, 520, 'lamp').setOrigin(0.5, 1).setScale(0.85).setAlpha(0.7);

        this.add.text(480, 42, 'EM BUSCA DA TV', {
            fontSize: '52px', fontFamily: 'Georgia, serif', fontStyle: 'bold',
            color: '#c47a20', stroke: '#fffaf0', strokeThickness: 7
        }).setOrigin(0.5);
        this.add.text(480, 88, 'Uma aventura pela casa', {
            fontSize: '18px', fontFamily: 'Georgia, serif', color: '#7a6550'
        }).setOrigin(0.5);

        this.add.text(480, 228, 'Quem vai procurar a TV?', {
            fontSize: '18px', fontFamily: 'Georgia, serif', color: '#5a4030'
        }).setOrigin(0.5);

        this.charCards = {};
        this.makeCharCard(370, 318, 'boy');
        this.makeCharCard(590, 318, 'girl');
        this.refreshCharCards();

        this.add.text(480, 412, 'Escolha a fase:', {
            fontSize: '17px', fontFamily: 'Georgia, serif', color: '#5a4030'
        }).setOrigin(0.5);

        for (let i = 0; i < levels.length; i++) {
            this.makeLevelButton(i, save);
        }

        this.add.text(480, 522, 'Setas/ESPAÇO para jogar  •  R reinicia a fase  •  ESC volta ao menu', {
            fontSize: '12px', fontFamily: 'Georgia, serif', color: '#8a7060'
        }).setOrigin(0.5);

        this.muteBtn = this.add.text(934, 24, save.muted ? '🔇' : '🔊', { fontSize: '22px' })
            .setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.muteBtn.on('pointerdown', () => {
            const muted = !loadSave().muted;
            updateSave({ muted });
            Sound.setMuted(muted);
            this.muteBtn.setText(muted ? '🔇' : '🔊');
        });

        const musicOn = save.music !== false;
        this.musicBtn = this.add.text(26, 24, `♪ Música: ${musicOn ? 'SIM' : 'NÃO'}`, {
            fontSize: '16px', fontFamily: 'monospace', fontStyle: 'bold',
            color: musicOn ? '#80ed99' : '#8888aa',
            backgroundColor: '#22223b', padding: { x: 10, y: 6 }
        }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });
        this.musicBtn.on('pointerdown', () => {
            Sound.init();
            Sound.resume();
            const on = !(loadSave().music !== false);
            updateSave({ music: on });
            this.musicBtn.setText(`♪ Música: ${on ? 'SIM' : 'NÃO'}`);
            this.musicBtn.setColor(on ? '#80ed99' : '#8888aa');
            Sound.click();
            if (on) Music.start(0); // preview da 1ª trilha no menu
            else Music.stop();
        });

        this.input.once('pointerdown', () => {
            Sound.init();
            Sound.resume();
            // pré-carrega MP3s de rock no primeiro clique (política de autoplay)
            Music.preload();
        });
    }

    makeCharCard(x, y, charKey) {
        const card = this.add.rectangle(x, y, 180, 148, 0xfffaf0)
            .setStrokeStyle(3, 0xe0c8a0)
            .setInteractive({ useHandCursor: true });

        // preview de frente — só front/happy (nunca mistura perfil no menu)
        const preview = this.add.sprite(x, y + 36, charTex(charKey, 'front'))
            .setOrigin(0.5, 1)
            .setScale(CHAR_DISPLAY_SCALE * 0.95);
        preview.play(`${charKey}-front`);

        this.tweens.add({
            targets: preview, y: y + 30,
            duration: 1000 + Math.random() * 200,
            yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });

        this.add.text(x, y + 58, CHARACTERS[charKey].label, {
            fontSize: '16px', fontFamily: 'Georgia, serif', fontStyle: 'bold', color: '#6b5344'
        }).setOrigin(0.5);

        card.on('pointerdown', () => {
            Sound.click();
            this.selectedChar = charKey;
            updateSave({ character: charKey });
            this.refreshCharCards();
        });
        card.on('pointerover', () => {
            if (this.selectedChar !== charKey) card.setFillStyle(0xfff0d8);
            this.tweens.add({
                targets: preview, scale: CHAR_DISPLAY_SCALE * 1.05,
                duration: 140, ease: 'Back.easeOut'
            });
        });
        card.on('pointerout', () => {
            this.refreshCharCards();
            this.tweens.add({
                targets: preview, scale: CHAR_DISPLAY_SCALE * 0.95,
                duration: 140, ease: 'Quad.easeOut'
            });
        });

        this.charCards[charKey] = { card, preview };
    }

    refreshCharCards() {
        for (const [key, { card }] of Object.entries(this.charCards)) {
            if (key === this.selectedChar) {
                card.setFillStyle(0xfff4d0).setStrokeStyle(4, 0xe8a020);
            } else {
                card.setFillStyle(0xfffaf0).setStrokeStyle(3, 0xe0c8a0);
            }
        }
    }

    makeLevelButton(i, save) {
        const lvlNum = i + 1;
        const unlocked = lvlNum <= save.unlocked;
        const stars = save.stars[lvlNum] || 0;
        const x = 480 + (i - 4.5) * 82;
        const y = 458;

        const btn = this.add.rectangle(x, y, 66, 54, unlocked ? 0xd49040 : 0xc8b8a0);
        btn.setStrokeStyle(2, unlocked ? 0xffd080 : 0xa09080);

        this.add.text(x, y - 9, unlocked ? String(lvlNum) : '🔒', {
            fontSize: unlocked ? '22px' : '18px', fontFamily: 'Georgia, serif',
            fontStyle: 'bold', color: unlocked ? '#fff8e8' : '#8a7a6a'
        }).setOrigin(0.5);

        if (unlocked && stars > 0) {
            this.add.text(x, y + 15, `★${stars}`, {
                fontSize: '13px', fontFamily: 'Georgia, serif', color: '#fff0a0'
            }).setOrigin(0.5);
        }

        if (unlocked) {
            btn.setInteractive({ useHandCursor: true });
            btn.on('pointerover', () => btn.setFillStyle(0xe8a850));
            btn.on('pointerout', () => btn.setFillStyle(0xd49040));
            btn.on('pointerdown', () => {
                Sound.init();
                Sound.resume();
                Sound.click();
                this.scene.start('GameScene', { character: this.selectedChar, level: lvlNum });
            });
        }
    }
}
