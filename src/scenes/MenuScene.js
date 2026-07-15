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

        // fundo aquarela quente + TV
        const bg = this.add.graphics();
        gradientStrips(bg, 0, 0, 960, 540, 0xfff6e8, 0xe8c9a0, 32);

        const glow = this.add.circle(480, 148, 130, 0xfff0b0, 0.22);
        this.tweens.add({
            targets: glow, alpha: 0.08, scale: 1.2,
            duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });
        const tv = this.add.image(480, 148, 'tv_on').setScale(1.15);
        this.tweens.add({
            targets: tv, scaleY: 1.18, duration: 1400,
            yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });

        // plantas laterais
        this.add.image(90, 520, 'plant').setOrigin(0.5, 1).setScale(1.2).setAlpha(0.9);
        this.add.image(870, 520, 'plant').setOrigin(0.5, 1).setScale(1.15).setAlpha(0.9);

        this.add.text(480, 48, 'EM BUSCA DA TV', {
            fontSize: '50px', fontFamily: 'Georgia, serif', fontStyle: 'bold',
            color: '#c47a20', stroke: '#fff6e8', strokeThickness: 6
        }).setOrigin(0.5);
        this.add.text(480, 92, 'Uma aventura pela casa', {
            fontSize: '17px', fontFamily: 'Georgia, serif', color: '#7a6550'
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
            if (on) Music.start(0); // preview: classic rock no menu
            else Music.stop();
        });

        this.input.once('pointerdown', () => {
            Sound.init();
            Sound.resume();
        });
    }

    makeCharCard(x, y, charKey) {
        const card = this.add.rectangle(x, y, 180, 148, 0xfffaf0)
            .setStrokeStyle(3, 0xe0c8a0)
            .setInteractive({ useHandCursor: true });

        // preview de frente — só front/happy (nunca mistura perfil no menu)
        const preview = this.add.sprite(x, y + 30, charTex(charKey, 'front'))
            .setOrigin(0.5, 1)
            .setScale(CHAR_DISPLAY_SCALE * 1.25);
        preview.play(`${charKey}-front`);

        this.tweens.add({
            targets: preview, y: y + 24,
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
                targets: preview, scale: CHAR_DISPLAY_SCALE * 1.35,
                duration: 140, ease: 'Back.easeOut'
            });
        });
        card.on('pointerout', () => {
            this.refreshCharCards();
            this.tweens.add({
                targets: preview, scale: CHAR_DISPLAY_SCALE * 1.25,
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
