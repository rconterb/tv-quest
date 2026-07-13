// Personagens e inimigos
import { Sound } from './audio.js';

export const CHARACTERS = {
    boy: { label: 'MENINO' },
    girl: { label: 'MENINA' }
};

// Monta as partes do corpo chibi (usado pelo Player e pelas prévias do menu)
export function createCharacterParts(scene, charKey) {
    const isBoy = charKey !== 'girl';
    const img = (x, y, key, originY = 0.5) =>
        scene.add.image(x, y, key).setOrigin(0.5, originY);

    const parts = {};
    parts.leftArm = img(-11, -10, isBoy ? 'arm_boy' : 'arm_girl', 0);
    parts.leftLeg = img(-5, 6, isBoy ? 'leg_boy' : 'leg_girl', 0);
    parts.rightLeg = img(5, 6, isBoy ? 'leg_boy' : 'leg_girl', 0);
    parts.torso = img(0, -2, isBoy ? 'torso_boy' : 'torso_girl');
    parts.headBaseY = isBoy ? -25 : -28;
    parts.head = img(0, parts.headBaseY, isBoy ? 'head_boy' : 'head_girl');
    parts.rightArm = img(11, -10, isBoy ? 'arm_boy' : 'arm_girl', 0);

    const all = [
        parts.leftArm, parts.leftLeg, parts.rightLeg,
        parts.torso, parts.head, parts.rightArm
    ];
    return { parts, all };
}

export class Player extends Phaser.GameObjects.Container {
    constructor(scene, x, y, charKey) {
        super(scene, x, y);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        const { parts, all } = createCharacterParts(scene, charKey);
        this.parts = parts;
        this.add(all);

        this.body.setSize(22, 50);
        this.body.setOffset(-11, -24);
        this.body.setDragX(1800);
        this.body.setMaxVelocity(240, 900);

        this.animTime = 0;
        this.facing = 1;
        this.squash = { x: 1, y: 1 };
        this.stepMuted = false;
    }

    squashTo(sx, sy, dur = 90) {
        this.scene.tweens.add({
            targets: this.squash,
            x: sx, y: sy,
            duration: dur,
            yoyo: true,
            ease: 'Quad.easeOut'
        });
    }

    updateAnim(time, delta) {
        if (!this.body) return;

        const isMoving = Math.abs(this.body.velocity.x) > 15;
        const isGrounded = this.body.touching.down || this.body.blocked.down;

        if (this.body.velocity.x > 5) this.facing = 1;
        else if (this.body.velocity.x < -5) this.facing = -1;

        this.setScale(this.facing * this.squash.x, this.squash.y);

        const p = this.parts;
        const setBob = (bob) => {
            p.torso.y = -2 + bob;
            p.head.y = p.headBaseY + bob;
        };

        if (!isGrounded) {
            // pose de pulo
            p.leftLeg.angle = -28; p.rightLeg.angle = 18;
            p.leftArm.angle = -130; p.rightArm.angle = 130;
            p.torso.angle = 5; p.head.angle = -5;
            setBob(0);
        } else if (isMoving) {
            const prevSin = Math.sin(this.animTime);
            this.animTime += delta * 0.013;
            const s = Math.sin(this.animTime);
            if (!this.stepMuted && ((prevSin < 0 && s >= 0) || (prevSin > 0 && s <= 0))) {
                Sound.step();
            }
            p.leftLeg.angle = s * 42;
            p.rightLeg.angle = -s * 42;
            p.leftArm.angle = -s * 38;
            p.rightArm.angle = s * 38;
            p.torso.angle = 3; p.head.angle = s * 2.5;
            setBob(Math.abs(s) * 2.5 - 1.2);
        } else {
            // parado — respiração sutil
            this.animTime += delta * 0.004;
            const breathe = Math.sin(this.animTime) * 0.8;
            p.leftLeg.angle = 0; p.rightLeg.angle = 0;
            p.leftArm.angle = breathe * 3; p.rightArm.angle = -breathe * 3;
            p.torso.angle = 0; p.head.angle = 0;
            setBob(breathe * 0.5);
        }
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
            targets: this, angle: { from: -2.5, to: 2.5 },
            duration: 300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
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
        Sound.stomp();
        this.scene.tweens.add({
            targets: this,
            scaleY: 0.25, scaleX: 1.35, alpha: 0,
            y: this.y + 10,
            duration: 350,
            ease: 'Quad.easeOut',
            onComplete: () => this.destroy()
        });
    }
}
