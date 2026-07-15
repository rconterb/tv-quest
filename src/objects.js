// Personagens (sprites 128×128) e inimigos
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
 * Player com sprites.
 * Arte de perfil olha para a DIREITA → flipX quando facing = -1 (esquerda).
 * Canvas fixo → sem “pulo” de hitbox/posição entre frames.
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

        // hitbox fixa (canvas 128×128)
        const bw = CHAR_BODY.width;
        const bh = CHAR_BODY.height;
        this.body.setSize(bw, bh);
        this.body.setOffset((128 - bw) / 2, 128 - bh - 4);
        this.body.setDragX(2000);
        this.body.setMaxVelocity(250, 900);

        this.animTime = 0;
        this.facing = 1;
        this.squash = { x: 1, y: 1 };
        this.stepMuted = false;
        this.currentAnim = null;
        this.airFrame = null;

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
    }

    applyFacing() {
        // sprites olham para a direita
        this.setFlipX(this.facing < 0);
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

    setAirPose(frame) {
        if (this.airFrame === frame) return;
        this.airFrame = frame;
        this.currentAnim = `${this.charKey}-jump`;
        this.anims.stop();
        this.setTexture(charTex(this.charKey, frame));
    }

    updateAnim(time, delta) {
        if (!this.body) return;

        const vx = this.body.velocity.x;
        const vy = this.body.velocity.y;
        const speed = Math.abs(vx);
        const isMoving = speed > 18;
        const isGrounded = this.body.touching.down || this.body.blocked.down;

        // deadzone maior evita flip nervoso por atrito
        if (vx > 20) this.facing = 1;
        else if (vx < -20) this.facing = -1;
        this.applyFacing();

        if (!isGrounded) {
            // um único frame estável por fase do pulo (sem trocar a cada tick)
            const frame = vy < -80 ? 'jump_b' : (vy > 160 ? 'jump' : 'jump_mid');
            this.setAirPose(frame);
        } else if (isMoving) {
            this.playAnim('run');
            const prev = this.animTime;
            this.animTime += delta * 0.011 * Phaser.Math.Clamp(speed / 200, 0.45, 1.15);
            if (!this.stepMuted && Math.floor(prev / 200) !== Math.floor(this.animTime / 200)) {
                Sound.step();
            }
            if (this.anims.currentAnim) {
                this.anims.msPerFrame = Phaser.Math.Clamp(1000 / (7 + speed / 28), 60, 130);
            }
        } else {
            this.playAnim('idle');
        }
    }
}

export class Robot extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, minX, maxX) {
        super(scene, x, y, 'robot');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setSize(28, 24);
        this.body.setOffset(3, 7);
        this.minX = minX;
        this.maxX = maxX;
        this.dir = -1;
        this.speed = 55;
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
