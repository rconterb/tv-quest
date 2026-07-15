// Personagens (sprites) e inimigos
import { Sound } from './audio.js';
import {
    CHAR_BODY,
    CHAR_DISPLAY_SCALE,
    CHARACTERS,
    charTex,
    createCharacterAnims
} from './sprites.js';

export { CHARACTERS };

/**
 * Player baseado em spritesheet/frames.
 * Arte de perfil olha para a ESQUERDA → flipX quando facing = +1 (direita).
 */
export class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, charKey) {
        createCharacterAnims(scene);
        const key = charKey === 'girl' ? 'girl' : 'boy';
        super(scene, x, y, charTex(key, 'idle'));

        this.charKey = key;
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.baseScale = CHAR_DISPLAY_SCALE;
        this.setScale(this.baseScale);
        this.setOrigin(0.5, 1); // pés no chão

        const bw = CHAR_BODY.width;
        const bh = CHAR_BODY.height;
        this.body.setSize(bw, bh);
        // origin 0.5,1 → offset do body relativo ao top-left do frame
        this.body.setOffset(
            (this.width - bw) / 2,
            this.height - bh - 2
        );
        this.body.setDragX(1800);
        this.body.setMaxVelocity(250, 900);

        this.animTime = 0;
        this.facing = 1; // +1 direita, -1 esquerda
        this.squash = { x: 1, y: 1 };
        this.stepMuted = false;
        this.currentAnim = null;

        this.playAnim('idle');
        this.applyFacing();
    }

    playAnim(name) {
        const key = `${this.charKey}-${name}`;
        if (this.currentAnim === key) return;
        if (!this.anims.animationManager.exists(key)) return;
        this.currentAnim = key;
        this.play(key, true);
    }

    applyFacing() {
        // sprites de perfil olham para a esquerda
        this.setFlipX(this.facing > 0);
        this.setScale(
            this.baseScale * Math.abs(this.squash.x),
            this.baseScale * this.squash.y
        );
    }

    squashTo(sx, sy, dur = 90) {
        this.scene.tweens.killTweensOf(this.squash);
        this.scene.tweens.add({
            targets: this.squash,
            x: Math.abs(sx),
            y: sy,
            duration: dur,
            yoyo: true,
            ease: 'Quad.easeOut',
            onUpdate: () => this.applyFacing()
        });
    }

    refreshBody() {
        if (!this.body) return;
        const bw = CHAR_BODY.width;
        const bh = CHAR_BODY.height;
        // origin 0.5,1 — body centrado nos pés
        this.body.setSize(bw, bh);
        this.body.setOffset((this.width - bw) / 2, this.height - bh - 2);
    }

    updateAnim(time, delta) {
        if (!this.body) return;

        const vx = this.body.velocity.x;
        const vy = this.body.velocity.y;
        const speed = Math.abs(vx);
        const isMoving = speed > 12;
        const isGrounded = this.body.touching.down || this.body.blocked.down;

        if (vx > 8) this.facing = 1;
        else if (vx < -8) this.facing = -1;
        this.applyFacing();

        if (!isGrounded) {
            // pose aérea estática (melhor leitura que ciclar frames)
            if (this.currentAnim !== `${this.charKey}-jump`) {
                this.currentAnim = `${this.charKey}-jump`;
                this.anims.stop();
            }
            const frame = vy < -60 ? 'jump_b' : (vy > 120 ? 'jump' : 'jump_mid');
            const tex = charTex(this.charKey, frame);
            if (this.texture.key !== tex) this.setTexture(tex);
        } else if (isMoving) {
            this.playAnim('run');
            const prev = this.animTime;
            this.animTime += delta * 0.012 * Phaser.Math.Clamp(speed / 200, 0.4, 1.2);
            if (!this.stepMuted) {
                if (Math.floor(prev / 180) !== Math.floor(this.animTime / 180)) {
                    Sound.step();
                }
            }
            if (this.anims.currentAnim) {
                this.anims.msPerFrame = Phaser.Math.Clamp(1000 / (8 + speed / 30), 55, 120);
            }
        } else {
            this.playAnim('idle');
        }

        this.refreshBody();
    }
}

export class Robot extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, minX, maxX) {
        super(scene, x, y, 'robot');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setSize(30, 26);
        this.body.setOffset(2, 6);
        this.minX = minX;
        this.maxX = maxX;
        this.dir = -1;
        this.speed = 55;
        this.squished = false;

        scene.tweens.add({
            targets: this, angle: { from: -3.5, to: 3.5 },
            duration: 380, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });
        scene.tweens.add({
            targets: this, scaleY: { from: 0.96, to: 1.05 },
            duration: 320, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
            delay: Math.random() * 200
        });
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        if (this.squished || !this.body) return;

        if (this.x <= this.minX || this.body.blocked.left) this.dir = 1;
        else if (this.x >= this.maxX || this.body.blocked.right) this.dir = -1;

        this.setVelocityX(this.speed * this.dir);
        this.setFlipX(this.dir > 0);
    }

    squish() {
        if (this.squished) return;
        this.squished = true;
        this.body.enable = false;
        this.scene.tweens.killTweensOf(this);
        this.setAngle(0);
        Sound.stomp();
        this.scene.tweens.add({
            targets: this,
            scaleY: 0.22, scaleX: 1.4, alpha: 0,
            y: this.y + 12,
            duration: 320,
            ease: 'Back.easeIn',
            onComplete: () => this.destroy()
        });
    }
}
