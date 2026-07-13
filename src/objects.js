// Personagens e inimigos
import { Sound } from './audio.js';

export const CHARACTERS = {
    boy: {
        label: 'MENINO',
        shirt: 0x2a6fdb, pants: 0x3a3f4b, skin: 0xffd6a5, hair: 0x5b3a1e
    },
    girl: {
        label: 'MENINA',
        shirt: 0x9d4edd, pants: 0xff8fb1, skin: 0xffd6a5, hair: 0x2e1a0e
    }
};

// Monta as partes do corpo (usado pelo Player e pelas prévias do menu)
export function createCharacterParts(scene, charKey) {
    const c = CHARACTERS[charKey] || CHARACTERS.boy;
    const img = (x, y, w, h, tint, originY = 0.5) =>
        scene.add.image(x, y, 'px').setTint(tint).setOrigin(0.5, originY).setDisplaySize(w, h);

    const parts = {};
    parts.leftArm = img(-6, -8, 6, 14, c.shirt, 0);
    parts.leftLeg = img(-3, 4, 6, 13, c.pants, 0);
    parts.rightLeg = img(3, 4, 6, 13, c.pants, 0);
    parts.torso = img(0, -2, 14, 16, c.shirt);
    parts.head = img(0, -16, 14, 14, c.skin);
    parts.hairTop = img(0, -22, 16, 5, c.hair);
    parts.hairSide = img(-6, -18, 4, 9, c.hair);
    parts.eye1 = img(2, -17, 2, 3, 0x22223b);
    parts.eye2 = img(6, -17, 2, 3, 0x22223b);
    parts.rightArm = img(6, -8, 6, 14, c.shirt, 0);

    const all = [
        parts.leftArm, parts.leftLeg, parts.rightLeg, parts.torso,
        parts.head, parts.hairTop, parts.hairSide, parts.eye1, parts.eye2
    ];

    if (charKey === 'girl') {
        // maria-chiquinhas
        parts.pigtail1 = img(-8, -14, 5, 12, c.hair);
        all.push(parts.pigtail1);
    }
    all.push(parts.rightArm);

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

        this.body.setSize(18, 38);
        this.body.setOffset(-9, -22);
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
        if (!isGrounded) {
            // pose de pulo
            p.leftLeg.angle = -30; p.rightLeg.angle = 20;
            p.leftArm.angle = -130; p.rightArm.angle = 130;
            p.torso.angle = 6; p.head.angle = -6;
        } else if (isMoving) {
            const prevSin = Math.sin(this.animTime);
            this.animTime += delta * 0.013;
            const s = Math.sin(this.animTime);
            if (!this.stepMuted && ((prevSin < 0 && s >= 0) || (prevSin > 0 && s <= 0))) {
                Sound.step();
            }
            p.leftLeg.angle = s * 45;
            p.rightLeg.angle = -s * 45;
            p.leftArm.angle = -s * 40;
            p.rightArm.angle = s * 40;
            p.torso.angle = 4; p.head.angle = 0;
            const bob = Math.abs(s) * 2.5 - 1.2;
            p.torso.y = -2 + bob; p.head.y = -16 + bob;
            p.hairTop.y = -22 + bob; p.hairSide.y = -18 + bob;
            p.eye1.y = -17 + bob; p.eye2.y = -17 + bob;
            if (p.pigtail1) p.pigtail1.y = -14 + bob;
        } else {
            // parado — respiração sutil
            this.animTime += delta * 0.004;
            const breathe = Math.sin(this.animTime) * 0.8;
            p.leftLeg.angle = 0; p.rightLeg.angle = 0;
            p.leftArm.angle = breathe * 3; p.rightArm.angle = -breathe * 3;
            p.torso.angle = 0; p.head.angle = 0;
            p.torso.y = -2; p.head.y = -16 + breathe * 0.5;
            p.hairTop.y = -22 + breathe * 0.5; p.hairSide.y = -18 + breathe * 0.5;
            p.eye1.y = -17 + breathe * 0.5; p.eye2.y = -17 + breathe * 0.5;
            if (p.pigtail1) p.pigtail1.y = -14 + breathe * 0.5;
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
