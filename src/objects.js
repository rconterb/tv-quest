// Personagens e inimigos
import { Sound } from './audio.js';

export const CHARACTERS = {
    boy: { label: 'MENINO' },
    girl: { label: 'MENINA' }
};

// Interpolação suave (frame-rate independent)
function damp(current, target, lambda, dt) {
    return Phaser.Math.Linear(current, target, 1 - Math.exp(-lambda * dt));
}

// Monta as partes do corpo chibi (usado pelo Player e pelas prévias do menu)
export function createCharacterParts(scene, charKey) {
    const isBoy = charKey !== 'girl';
    const img = (x, y, key, originY = 0.5) =>
        scene.add.image(x, y, key).setOrigin(0.5, originY);

    const parts = {};
    // originY = 0: pivot no ombro / quadril para rotação natural
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
        // facing: +1 = direita, -1 = esquerda (art desenhada de frente; espelha no eixo X)
        this.facing = 1;
        this.squash = { x: 1, y: 1 };
        this.stepMuted = false;

        // estado de pose atual (para blend suave entre idle / walk / air)
        this.pose = {
            leftLeg: 0, rightLeg: 0,
            leftArm: 0, rightArm: 0,
            torso: 0, head: 0, bob: 0
        };
    }

    squashTo(sx, sy, dur = 90) {
        // squash.x sempre positivo — a direção fica só em this.facing
        this.scene.tweens.killTweensOf(this.squash);
        this.scene.tweens.add({
            targets: this.squash,
            x: Math.abs(sx), y: sy,
            duration: dur,
            yoyo: true,
            ease: 'Quad.easeOut'
        });
    }

    updateAnim(time, delta) {
        if (!this.body) return;

        const dt = Math.min(delta, 50) / 1000; // segundos, cap de lag
        const vx = this.body.velocity.x;
        const vy = this.body.velocity.y;
        const speed = Math.abs(vx);
        const isMoving = speed > 12;
        const isGrounded = this.body.touching.down || this.body.blocked.down;

        // direção do olhar acompanha o movimento (nunca de costas)
        if (vx > 8) this.facing = 1;
        else if (vx < -8) this.facing = -1;

        // scaleX = |squash| * facing — garante que squash nunca inverta o sentido
        const sx = Math.abs(this.squash.x) * this.facing;
        const sy = this.squash.y;
        this.setScale(sx, sy);

        // alvos da pose
        let tL = 0, tR = 0, tLA = 0, tRA = 0, tTorso = 0, tHead = 0, tBob = 0;
        // velocidade de blend: no ar muda mais rápido (resposta), no chão mais suave
        let blend = isGrounded ? 14 : 18;

        if (!isGrounded) {
            // pose aérea reage à velocidade vertical (subindo vs caindo)
            const climb = Phaser.Math.Clamp(-vy / 500, -1, 1);
            tL = -22 - climb * 14;
            tR = 16 + climb * 10;
            tLA = -120 - climb * 18;
            tRA = 120 + climb * 18;
            tTorso = 4 + climb * 3;
            tHead = -4 - climb * 2;
            tBob = climb * 1.5;
            blend = 16;
        } else if (isMoving) {
            // ciclo de corrida proporcional à velocidade (mais fluido em qualquer pace)
            const pace = Phaser.Math.Clamp(speed / 200, 0.35, 1.15);
            const prevPhase = this.animTime;
            this.animTime += delta * 0.014 * pace;
            const s = Math.sin(this.animTime);
            const c = Math.cos(this.animTime);

            // passo nos cruzamentos de zero do seno
            if (!this.stepMuted) {
                const prevSin = Math.sin(prevPhase);
                if ((prevSin < 0 && s >= 0) || (prevSin > 0 && s <= 0)) Sound.step();
            }

            // pernas e braços em fases opostas (ciclo clássico de caminhada)
            // ângulos em espaço local; o flip do container cuida da direção
            const arm = Math.sin(this.animTime - 0.25);
            tL = s * 46 * pace;
            tR = -s * 46 * pace;
            tLA = -arm * 40 * pace;
            tRA = arm * 40 * pace;
            // leve inclinação para a frente do movimento (em local X positivo = direita do personagem)
            tTorso = 2.5 + Math.abs(s) * 1.5;
            tHead = s * 3.2;
            // bob: usa |cos| para um "salto" no meio do passo (mais natural que |sin|)
            tBob = Math.abs(c) * 2.8 * pace - 1.0;
            blend = 22; // persegue o ciclo de corrida com snappiness
        } else {
            // parado — respiração sutil e leve balanço
            this.animTime += delta * 0.0038;
            const breathe = Math.sin(this.animTime);
            const breathe2 = Math.sin(this.animTime * 0.5);
            tL = 2;
            tR = -2;
            tLA = 6 + breathe * 4;
            tRA = -6 - breathe * 4;
            tTorso = breathe * 0.6;
            tHead = breathe2 * 1.2;
            tBob = breathe * 0.9;
            blend = 10;
        }

        // blend suave das poses (sem "snap" ao mudar de estado)
        const p = this.pose;
        p.leftLeg = damp(p.leftLeg, tL, blend, dt);
        p.rightLeg = damp(p.rightLeg, tR, blend, dt);
        p.leftArm = damp(p.leftArm, tLA, blend, dt);
        p.rightArm = damp(p.rightArm, tRA, blend, dt);
        p.torso = damp(p.torso, tTorso, blend, dt);
        p.head = damp(p.head, tHead, blend, dt);
        p.bob = damp(p.bob, tBob, blend * 1.2, dt);

        const parts = this.parts;
        parts.leftLeg.angle = p.leftLeg;
        parts.rightLeg.angle = p.rightLeg;
        parts.leftArm.angle = p.leftArm;
        parts.rightArm.angle = p.rightArm;
        parts.torso.angle = p.torso;
        parts.head.angle = p.head;
        parts.torso.y = -2 + p.bob;
        parts.head.y = parts.headBaseY + p.bob;
        // braços e pernas sobem/descem um pouco com o bob do tronco
        parts.leftArm.y = -10 + p.bob * 0.85;
        parts.rightArm.y = -10 + p.bob * 0.85;
        parts.leftLeg.y = 6 + p.bob * 0.35;
        parts.rightLeg.y = 6 + p.bob * 0.35;
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

        // balanço lateral + “respiração” de escala (sem mexer em Y — evita luta com a física)
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
