// Personagens (sprites 128×128, perfil → DIREITA) e inimigos
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
 * Arte de perfil olha para a DIREITA.
 * flipX só quando facing === -1 (esquerda).
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
        this.setOrigin(0.5, 1);

        const bw = CHAR_BODY.width;
        const bh = CHAR_BODY.height;
        this.body.setSize(bw, bh);
        this.body.setOffset((128 - bw) / 2, 128 - bh - 4);
        this.body.setDragX(1800);
        this.body.setMaxVelocity(260, 920);

        this.animTime = 0;
        this.facing = 1;
        this.squash = { x: 1, y: 1 };
        this.bob = 1; // scaleY extra de respiração / passo
        this.stepMuted = false;
        this.currentAnim = null;
        this.airFrame = null;
        this.airPhase = 'mid'; // hysteresis do pulo
        this.runFrameRate = 11;

        this.playAnim('idle');
        this.applyFacing();
    }

    playAnim(name) {
        const key = `${this.charKey}-${name}`;
        if (this.currentAnim === key) return;
        if (!this.anims.animationManager.exists(key)) return;
        this.currentAnim = key;
        this.airFrame = null;
        this.anims.play(key, true);
        this.applyFacing();
    }

    applyFacing() {
        this.setFlipX(this.facing < 0);
        const sx = this.baseScale * Math.abs(this.squash.x);
        const sy = this.baseScale * this.squash.y * this.bob;
        this.setScale(sx, sy);
    }

    squashTo(sx, sy, dur = 100) {
        this.scene.tweens.killTweensOf(this.squash);
        this.scene.tweens.add({
            targets: this.squash,
            x: Math.abs(sx),
            y: sy,
            duration: dur,
            yoyo: true,
            ease: 'Sine.easeInOut',
            onUpdate: () => this.applyFacing()
        });
    }

    setAirPose(frame) {
        if (this.airFrame === frame) {
            this.applyFacing();
            return;
        }
        this.airFrame = frame;
        this.currentAnim = `${this.charKey}-jump`;
        this.anims.stop();
        this.setTexture(charTex(this.charKey, frame));
        this.applyFacing();
    }

    updateAnim(time, delta) {
        if (!this.body) return;

        const dt = Math.min(delta, 40) / 1000;
        const vx = this.body.velocity.x;
        const vy = this.body.velocity.y;
        const speed = Math.abs(vx);
        const isMoving = speed > 16;
        const isGrounded = this.body.touching.down || this.body.blocked.down;

        if (vx > 22) this.facing = 1;
        else if (vx < -22) this.facing = -1;

        // bob suave (respiração / passo) — não mexe em body.y
        let targetBob = 1;
        if (!isGrounded) {
            targetBob = 1.02;
            // hysteresis: evita trocar frame a cada frame de física
            let phase = this.airPhase;
            if (vy < -120) phase = 'up';
            else if (vy > 200) phase = 'down';
            else if (vy > -40 && vy < 80) phase = 'mid';
            this.airPhase = phase;
            const frame = phase === 'up' ? 'jump_b' : (phase === 'down' ? 'jump' : 'jump_mid');
            this.setAirPose(frame);
        } else if (isMoving) {
            this.playAnim('run');
            const prev = this.animTime;
            const pace = Phaser.Math.Clamp(speed / 210, 0.55, 1.25);
            this.animTime += delta * 0.01 * pace;
            // bob de passo sincronizado
            targetBob = 1 + Math.abs(Math.sin(this.animTime * 0.9)) * 0.035;
            if (!this.stepMuted && Math.floor(prev / 190) !== Math.floor(this.animTime / 190)) {
                Sound.step();
            }
            // frameRate estável (só ajusta de leve)
            const fr = Phaser.Math.Clamp(9 + speed / 40, 9, 14);
            if (Math.abs(fr - this.runFrameRate) > 0.8 && this.anims.currentAnim) {
                this.runFrameRate = fr;
                this.anims.msPerFrame = 1000 / fr;
            }
        } else {
            this.playAnim('idle');
            this.animTime += delta * 0.003;
            targetBob = 1 + Math.sin(this.animTime) * 0.025;
        }

        this.bob = Phaser.Math.Linear(this.bob, targetBob, 1 - Math.exp(-12 * dt));
        this.applyFacing();
    }
}

export class Robot extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, minX, maxX) {
        super(scene, x, y, 'robot');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(1.15);
        this.body.setSize(28, 24);
        this.body.setOffset(3, 7);
        this.minX = minX;
        this.maxX = maxX;
        this.dir = -1;
        this.speed = 58;
        this.squished = false;

        scene.tweens.add({
            targets: this, angle: { from: -2.5, to: 2.5 },
            duration: 420, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        if (this.squished || !this.body) return;

        if (this.x <= this.minX || this.body.blocked.left) this.dir = 1;
        else if (this.x >= this.maxX || this.body.blocked.right) this.dir = -1;

        this.setVelocityX(this.speed * this.dir);
        this.setFlipX(this.dir < 0);
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
