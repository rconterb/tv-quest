import { levels } from '../levels.js';
import { generateTextures, gradientStrips } from '../textures.js';
import { createCharacterParts } from '../objects.js';
import { Sound } from '../audio.js';
import { loadSave } from '../save.js';

export class VictoryScene extends Phaser.Scene {
    constructor() { super('VictoryScene'); }

    preload() { generateTextures(this); }

    create(data) {
        Sound.victory();

        const bg = this.add.graphics();
        gradientStrips(bg, 0, 0, 960, 540, 0x2e2640, 0x16121f, 14);

        // TV lendária brilhando
        const glow = this.add.circle(480, 210, 160, 0x9be8ff, 0.18);
        this.tweens.add({
            targets: glow, alpha: 0.06, scale: 1.3,
            duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });
        const tv = this.add.image(480, 210, 'tv_on').setScale(1.9);
        this.tweens.add({
            targets: tv, angle: { from: -1.5, to: 1.5 },
            duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });

        // as duas crianças assistindo juntas
        const kid1 = this.add.container(400, 330);
        kid1.add(createCharacterParts(this, 'boy').all);
        kid1.setScale(1.8);
        const kid2 = this.add.container(560, 330);
        kid2.add(createCharacterParts(this, 'girl').all);
        kid2.setScale(-1.8, 1.8); // virada para a TV
        [kid1, kid2].forEach((kid, i) => {
            this.tweens.add({
                targets: kid, y: 322, duration: 500, yoyo: true, repeat: -1,
                delay: i * 250, ease: 'Quad.easeOut'
            });
        });

        this.add.text(480, 66, 'PARABÉNS!', {
            fontSize: '58px', fontFamily: 'monospace', fontStyle: 'bold',
            color: '#ffd23f', stroke: '#7a4a00', strokeThickness: 8
        }).setOrigin(0.5);
        this.add.text(480, 116, 'Vocês encontraram a TV lendária!', {
            fontSize: '20px', fontFamily: 'monospace', color: '#ffffff'
        }).setOrigin(0.5);

        // estrelas totais
        const save = loadSave();
        const total = Object.values(save.stars).reduce((a, b) => a + b, 0);
        const max = levels.reduce((a, l) => a + l.totalStars, 0);
        this.add.text(480, 400, `⭐ ${total} de ${max} estrelas coletadas`, {
            fontSize: '19px', fontFamily: 'monospace', color: '#ffd23f'
        }).setOrigin(0.5);
        if (total < max) {
            this.add.text(480, 428, 'Será que você consegue todas?', {
                fontSize: '14px', fontFamily: 'monospace', color: '#8888aa'
            }).setOrigin(0.5);
        }

        // chuva de confete
        this.add.particles(0, 0, 'confetti', {
            x: { min: 0, max: 960 }, y: -10,
            speedY: { min: 60, max: 160 }, speedX: { min: -30, max: 30 },
            rotate: { min: 0, max: 360 }, lifespan: 5000,
            scale: { min: 0.5, max: 1 }, frequency: 90,
            tint: [0xffd23f, 0xff5da2, 0x4cc9f0, 0x80ed99, 0xff9f1c]
        });

        // botão de voltar
        const btn = this.add.rectangle(480, 486, 260, 50, 0x2a6fdb)
            .setStrokeStyle(3, 0x8ecae6).setInteractive({ useHandCursor: true });
        this.add.text(480, 486, 'VOLTAR AO MENU', {
            fontSize: '18px', fontFamily: 'monospace', fontStyle: 'bold', color: '#ffffff'
        }).setOrigin(0.5);
        btn.on('pointerover', () => btn.setFillStyle(0x4a8fe8));
        btn.on('pointerout', () => btn.setFillStyle(0x2a6fdb));
        btn.on('pointerdown', () => {
            Sound.click();
            this.scene.start('MenuScene');
        });
        this.input.keyboard.once('keydown-ENTER', () => this.scene.start('MenuScene'));
    }
}
