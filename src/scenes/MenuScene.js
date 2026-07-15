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

        // fundo: sala escura iluminada pela TV
        const bg = this.add.graphics();
        gradientStrips(bg, 0, 0, 960, 540, 0x16213e, 0x0f0f1e, 18);

        const glow = this.add.circle(480, 152, 120, 0x9be8ff, 0.14);
        this.tweens.add({
            targets: glow, alpha: 0.05, scale: 1.25,
            duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });
        const tv = this.add.image(480, 152, 'tv_on').setScale(1.15);
        this.tweens.add({
            targets: tv, scaleY: 1.18, duration: 1400,
            yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });

        for (let i = 0; i < 14; i++) {
            const s = this.add.image(
                60 + Math.random() * 840, 30 + Math.random() * 200, 'spark'
            ).setScale(0.4 + Math.random() * 0.5).setAlpha(0.15);
            this.tweens.add({
                targets: s, alpha: 0.5, duration: 600 + Math.random() * 900,
                yoyo: true, repeat: -1, delay: Math.random() * 1000
            });
        }

        this.add.text(480, 52, 'EM BUSCA DA TV', {
            fontSize: '52px', fontFamily: 'monospace', fontStyle: 'bold',
            color: '#ffd23f', stroke: '#7a4a00', strokeThickness: 8
        }).setOrigin(0.5);
        this.add.text(480, 95, 'Uma aventura pela casa', {
            fontSize: '17px', fontFamily: 'monospace', color: '#8ecae6'
        }).setOrigin(0.5);

        this.add.text(480, 228, 'Quem vai procurar a TV?', {
            fontSize: '19px', fontFamily: 'monospace', color: '#ffffff'
        }).setOrigin(0.5);

        this.charCards = {};
        this.makeCharCard(370, 318, 'boy');
        this.makeCharCard(590, 318, 'girl');
        this.refreshCharCards();

        this.add.text(480, 412, 'Escolha a fase:', {
            fontSize: '17px', fontFamily: 'monospace', color: '#ffffff'
        }).setOrigin(0.5);

        for (let i = 0; i < levels.length; i++) {
            this.makeLevelButton(i, save);
        }

        this.add.text(480, 522, 'Setas/ESPAÇO para jogar  •  R reinicia a fase  •  ESC volta ao menu', {
            fontSize: '12px', fontFamily: 'monospace', color: '#666688'
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
            if (on) Music.start();
            else Music.stop();
        });

        this.input.once('pointerdown', () => {
            Sound.init();
            Sound.resume();
        });
    }

    makeCharCard(x, y, charKey) {
        const card = this.add.rectangle(x, y, 180, 148, 0x22223b)
            .setInteractive({ useHandCursor: true });

        const preview = this.add.sprite(x, y + 28, charTex(charKey, 'front'))
            .setOrigin(0.5, 1)
            .setScale(CHAR_DISPLAY_SCALE * 1.35);
        preview.play(`${charKey}-front`);

        this.tweens.add({
            targets: preview, y: y + 22,
            duration: 900 + Math.random() * 200,
            yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });

        this.add.text(x, y + 58, CHARACTERS[charKey].label, {
            fontSize: '17px', fontFamily: 'monospace', fontStyle: 'bold', color: '#ffffff'
        }).setOrigin(0.5);

        card.on('pointerdown', () => {
            Sound.click();
            this.selectedChar = charKey;
            updateSave({ character: charKey });
            this.refreshCharCards();
        });
        card.on('pointerover', () => {
            if (this.selectedChar !== charKey) card.setFillStyle(0x2e2e52);
            this.tweens.add({
                targets: preview, scale: CHAR_DISPLAY_SCALE * 1.48,
                duration: 140, ease: 'Back.easeOut'
            });
        });
        card.on('pointerout', () => {
            this.refreshCharCards();
            this.tweens.add({
                targets: preview, scale: CHAR_DISPLAY_SCALE * 1.35,
                duration: 140, ease: 'Quad.easeOut'
            });
        });

        this.charCards[charKey] = { card, preview };
    }

    refreshCharCards() {
        for (const [key, { card }] of Object.entries(this.charCards)) {
            if (key === this.selectedChar) {
                card.setFillStyle(0x2a4494).setStrokeStyle(4, 0xffd23f);
            } else {
                card.setFillStyle(0x22223b).setStrokeStyle(2, 0x44446a);
            }
        }
    }

    makeLevelButton(i, save) {
        const lvlNum = i + 1;
        const unlocked = lvlNum <= save.unlocked;
        const stars = save.stars[lvlNum] || 0;
        const x = 480 + (i - 4.5) * 82;
        const y = 458;

        const btn = this.add.rectangle(x, y, 66, 54, unlocked ? 0x2a6fdb : 0x2a2a3e);
        btn.setStrokeStyle(2, unlocked ? 0x8ecae6 : 0x44446a);

        this.add.text(x, y - 9, unlocked ? String(lvlNum) : '🔒', {
            fontSize: unlocked ? '22px' : '18px', fontFamily: 'monospace',
            fontStyle: 'bold', color: unlocked ? '#ffffff' : '#666688'
        }).setOrigin(0.5);

        if (unlocked && stars > 0) {
            this.add.text(x, y + 15, `★${stars}`, {
                fontSize: '13px', fontFamily: 'monospace', color: '#ffd23f'
            }).setOrigin(0.5);
        }

        if (unlocked) {
            btn.setInteractive({ useHandCursor: true });
            btn.on('pointerover', () => btn.setFillStyle(0x4a8fe8));
            btn.on('pointerout', () => btn.setFillStyle(0x2a6fdb));
            btn.on('pointerdown', () => {
                Sound.init();
                Sound.resume();
                Sound.click();
                this.scene.start('GameScene', { character: this.selectedChar, level: lvlNum });
            });
        }
    }
}
