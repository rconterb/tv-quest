import { levels, THEMES, TILE, ROWS } from '../levels.js';
import { generateTextures, gradientStrips } from '../textures.js';
import { Player, Robot } from '../objects.js';
import { preloadCharacters, createCharacterAnims } from '../sprites.js';
import { Sound, Music } from '../audio.js';
import { loadSave, updateSave } from '../save.js';
import { PHYS } from '../physics.js';

export class GameScene extends Phaser.Scene {
    constructor() { super('GameScene'); }

    init(data) {
        this.character = data.character || loadSave().character;
        this.levelIndex = data.level ? data.level - 1 : 0;
        this.isDead = false;
        this.won = false;
        this.starsCollected = 0;
        this.hearts = 3;
        this.invulnUntil = 0;
        this.lastGroundedAt = -9999;
        this.lastJumpPressedAt = -9999;
        this.jumpsUsed = 0;
        this.wasGrounded = false;
        this.lastFallSpeed = 0;
        this.nextRunDust = 0;
        this.jumpCutAllowed = false;
        this.onMover = null;
    }

    preload() {
        preloadCharacters(this);
    }

    create() {
        generateTextures(this);
        createCharacterAnims(this);
        const lvl = levels[this.levelIndex];
        this.theme = THEMES[lvl.theme];
        this.worldW = lvl.width * TILE;
        this.worldH = 540;
        this.offsetY = this.worldH - ROWS * TILE; // alinha o chão ao fundo da tela

        this.createBackground();

        // física da cena (gravidade base; hang no ápice ajusta no update)
        this.physics.world.gravity.y = PHYS.gravity;

        // grupos de física
        this.platforms = this.physics.add.staticGroup();
        this.hazards = this.physics.add.staticGroup();
        this.stars = this.physics.add.staticGroup();
        this.springs = this.physics.add.staticGroup();
        this.tvGroup = this.physics.add.staticGroup();
        this.robots = this.add.group();
        this.movers = this.physics.add.group({ allowGravity: false, immovable: true });

        this.loadLevel(lvl);

        // jogador
        this.player = new Player(this, this.spawnX, this.spawnY, this.character);
        this.player.setDepth(5);
        this.physics.world.setBounds(0, -200, this.worldW, this.worldH + 400);
        this.physics.world.setBoundsCollision(true, true, false, false);
        this.player.body.setCollideWorldBounds(true);

        // colisões
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.player, this.movers);
        this.physics.add.collider(this.robots, this.platforms);
        this.physics.add.collider(this.player, this.robots, this.onRobotHit, null, this);
        this.physics.add.overlap(this.player, this.springs, this.onSpring, null, this);
        this.physics.add.overlap(this.player, this.hazards, this.onHazard, null, this);
        this.physics.add.overlap(this.player, this.stars, this.onStar, null, this);
        this.physics.add.overlap(this.player, this.tvGroup, this.onTv, null, this);

        // câmera — follow suave + deadzone generosa (look-ahead no update)
        const cam = this.cameras.main;
        cam.setBounds(0, 0, Math.max(this.worldW, 960), this.worldH);
        cam.startFollow(this.player, true, 0.1, 0.12);
        cam.setDeadzone(120, 90);
        cam.setLerp(0.1, 0.12);
        cam.fadeIn(400, 0, 0, 0);
        this.camLookX = 0; // offset lateral suave na direção do movimento

        // partículas (curvas de alpha/scale mais suaves)
        this.dustEmitter = this.add.particles(0, 0, 'dust', {
            speed: { min: 18, max: 65 }, angle: { min: 220, max: 320 },
            lifespan: { min: 320, max: 520 },
            alpha: { start: 0.65, end: 0, ease: 'Quad.easeOut' },
            scale: { start: 1.1, end: 0.15, ease: 'Sine.easeIn' },
            gravityY: -20, emitting: false
        }).setDepth(6);
        this.sparkEmitter = this.add.particles(0, 0, 'spark', {
            speed: { min: 45, max: 140 }, lifespan: { min: 380, max: 620 },
            alpha: { start: 1, end: 0, ease: 'Quad.easeOut' },
            scale: { start: 1.15, end: 0.1, ease: 'Cubic.easeIn' },
            rotate: { min: 0, max: 360 }, emitting: false
        }).setDepth(6);
        this.confettiEmitter = this.add.particles(0, 0, 'confetti', {
            speedY: { min: 80, max: 240 }, speedX: { min: -140, max: 140 },
            rotate: { min: 0, max: 360 }, lifespan: 2200, gravityY: 280,
            scale: { min: 0.5, max: 1.15 }, emitting: false,
            alpha: { start: 1, end: 0.2 },
            tint: [0xffd23f, 0xff5da2, 0x4cc9f0, 0x80ed99, 0xff9f1c]
        }).setDepth(90);

        // poeirinha flutuante no ar (atmosfera)
        this.add.particles(0, 0, 'dust', {
            x: { min: 0, max: this.worldW },
            y: { min: 40, max: this.worldH - 80 },
            speedX: { min: -14, max: 14 },
            speedY: { min: -22, max: -6 },
            lifespan: { min: 3000, max: 5500 },
            alpha: { start: 0.4, end: 0, ease: 'Sine.easeIn' },
            scale: { start: 0.45, end: 0.12 },
            frequency: 240,
            quantity: 1,
            blendMode: 'ADD',
            tint: [0xffffff, 0xfff3b0, 0xcdefff]
        }).setDepth(-5);

        // controles
        this.keys = this.input.keyboard.addKeys('LEFT,RIGHT,UP,DOWN,SPACE,W,A,D,R,ESC,ENTER');
        this.leftPressed = false;
        this.rightPressed = false;
        this.jumpHeld = false;
        if (this.sys.game.device.input.touch) this.createTouchControls();

        this.createHud(lvl);
        this.showIntroBanner(lvl);

        // rock diferente por fase (se música ligada no menu)
        if (loadSave().music !== false) Music.start(this.levelIndex);
        else Music.stop();
    }

    // ---------- construção da fase ----------

    createBackground() {
        const th = this.theme;
        const isDark = th.name === 'Sótão';

        // 1) parede — degradê aquarela em 3 faixas (topo / meio / base)
        const bg = this.add.graphics().setScrollFactor(0).setDepth(-50);
        gradientStrips(bg, 0, 0, 960, 220, th.wallTop, th.wallMid || th.wallBottom, 28);
        gradientStrips(bg, 0, 210, 960, 200, th.wallMid || th.wallTop, th.wallBottom, 24);
        gradientStrips(bg, 0, 400, 960, 140, th.wallBottom, th.floor || th.wallBottom, 16);

        // 2) luz do teto + vinheta cinematográfica
        const light = this.add.graphics().setScrollFactor(0).setDepth(-49);
        light.fillStyle(0xffffff, isDark ? 0.06 : 0.16);
        light.fillEllipse(480, -20, 1100, 200);
        // raios de luz suaves
        if (!isDark) {
            light.fillStyle(0xfff6d0, 0.04);
            light.fillTriangle(200, 0, 320, 0, 280, 420);
            light.fillTriangle(620, 0, 760, 0, 700, 400);
        }
        light.fillStyle(0x000000, isDark ? 0.18 : 0.07);
        light.fillRect(0, 0, 50, 540);
        light.fillRect(910, 0, 50, 540);
        light.fillRect(0, 500, 960, 40);

        // 3) cornija do teto
        this.crown = this.add.tileSprite(480, 8, 960, 16, 'crown')
            .setScrollFactor(0).setDepth(-45).setAlpha(isDark ? 0.35 : 0.7);

        // 4) papel de parede floral
        this.wallpaper = this.add.tileSprite(480, 200, 960, 320, 'wallpaper')
            .setScrollFactor(0).setDepth(-44).setAlpha(isDark ? 0.08 : 0.2);

        // 5) painel / meia-parede
        this.wallPanel = this.add.tileSprite(480, 390, 960, 140, 'wall_panel')
            .setScrollFactor(0).setDepth(-43).setAlpha(isDark ? 0.25 : 0.45)
            .setTint(th.wallMid || th.wallBottom);

        // 6) rodapé
        this.add.tileSprite(480, 452, 960, 20, 'wainscot')
            .setScrollFactor(0).setDepth(-42).setAlpha(isDark ? 0.5 : 0.9);

        // 7) chão de tábua (parallax)
        this.floorDecor = this.add.tileSprite(480, 505, 960, 90, 'floorboard')
            .setScrollFactor(0).setDepth(-41).setAlpha(isDark ? 0.4 : 0.5)
            .setTint(th.floor || 0xc4a06a);

        // 8) janelas + cortinas + manchas de sol (mundo com parallax)
        const winCover = (this.worldW - 960) * 0.42 + 960;
        const curtainTint = th.curtainTint || 0xe07070;
        for (let x = 180; x < winCover; x += 400) {
            // glow atrás da janela
            this.add.ellipse(x, 150, 160, 180, 0xfff0c0, isDark ? 0.06 : 0.1)
                .setScrollFactor(0.22).setDepth(-28);

            this.add.image(x, 142, 'window')
                .setScrollFactor(0.25).setDepth(-26).setAlpha(0.96).setScale(0.88);

            const c1 = this.add.image(x - 68, 155, 'curtain')
                .setScrollFactor(0.25).setDepth(-25).setAlpha(0.82).setScale(0.88)
                .setTint(curtainTint);
            const c2 = this.add.image(x + 68, 155, 'curtain')
                .setScrollFactor(0.25).setDepth(-25).setAlpha(0.82).setScale(0.88)
                .setFlipX(true).setTint(curtainTint);

            // leve balanço das cortinas
            this.tweens.add({
                targets: c1, scaleX: 0.92, duration: 2800 + (x % 5) * 200,
                yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
            });
            this.tweens.add({
                targets: c2, scaleX: 0.92, duration: 3000 + (x % 7) * 150,
                yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: 400
            });

            // mancha de sol no chão
            if (!isDark) {
                const sun = this.add.ellipse(x + 40, 405, 130, 32, 0xffe8a0, 0.16)
                    .setScrollFactor(0.3).setDepth(-24);
                this.tweens.add({
                    targets: sun, alpha: 0.07, scaleX: 1.1,
                    duration: 2800 + (x % 9) * 80,
                    yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
                });
            }
        }

        // 9) móveis densos com sombra
        const rand = this.seededRandom(this.levelIndex * 1000 + 7);
        const decorCover = (this.worldW - 960) * 0.62 + 960;
        for (let x = 100; x < decorCover; x += 180 + Math.floor(rand() * 100)) {
            const key = th.decor[Math.floor(rand() * th.decor.length)];
            const sc = 0.95 + rand() * 0.3;
            this.add.image(x + 4, this.worldH - TILE + 6, 'shadow_soft')
                .setOrigin(0.5, 0.5).setScrollFactor(0.45).setDepth(-14)
                .setAlpha(0.35).setScale(sc * 0.9, 0.7);
            this.add.image(x, this.worldH - TILE + 2, key)
                .setOrigin(0.5, 1).setScrollFactor(0.45).setDepth(-13)
                .setAlpha(0.94).setScale(sc);
        }

        // 10) poeira de luz (god rays dust)
        this.add.particles(0, 0, 'dust', {
            x: { min: 0, max: this.worldW },
            y: { min: 40, max: 340 },
            speedX: { min: -6, max: 6 },
            speedY: { min: -14, max: -2 },
            lifespan: { min: 4500, max: 8000 },
            alpha: { start: isDark ? 0.2 : 0.4, end: 0 },
            scale: { start: 0.55, end: 0.12 },
            frequency: 220,
            blendMode: 'ADD',
            tint: isDark ? [0xc8b0e0, 0xffffff] : [0xffffff, 0xfff3c0, 0xd0e8ff]
        }).setDepth(-7).setScrollFactor(0.18);
    }

    seededRandom(seed) {
        let s = seed;
        return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    }

    loadLevel(lvl) {
        this.spawnX = 100;
        this.spawnY = 300;
        for (let r = 0; r < lvl.rows.length; r++) {
            const row = lvl.rows[r];
            for (let col = 0; col < row.length; col++) {
                const ch = row[col];
                if (ch === '.') continue;
                const cx = col * TILE + TILE / 2;
                const cy = this.offsetY + r * TILE + TILE / 2;
                const floorY = this.offsetY + (r + 1) * TILE; // base da célula

                switch (ch) {
                    case '#': {
                        const block = this.platforms.create(cx, cy, this.theme.block);
                        // sombra sob o bloco (profundidade)
                        this.add.image(cx + 2, cy + TILE * 0.42, 'shadow_soft')
                            .setDepth(1).setAlpha(0.22).setScale(0.55, 0.45);
                        block.setDepth(2);
                        break;
                    }
                    case 'T': {
                        this.add.image(cx + 12, floorY - 2, 'shadow_soft')
                            .setDepth(2).setAlpha(0.3).setScale(0.7, 0.5);
                        const tv = this.tvGroup.create(cx + 10, floorY - 40, 'tv_off');
                        tv.body.setSize(60, 60);
                        tv.setDepth(3);
                        this.tvSprite = tv;
                        break;
                    }
                    case 't': this.addHazard(cx, floorY, 'sneaker', true); break;
                    case 'l': {
                        const legos = ['lego_red', 'lego_blue', 'lego_yellow', 'lego_green'];
                        this.addHazard(cx, floorY, legos[(col + r) % legos.length]);
                        break;
                    }
                    case 'b': this.addHazard(cx, floorY, 'book'); break;
                    case 'c': {
                        const star = this.stars.create(cx, cy, 'star');
                        star.setDepth(2);
                        star.baseY = cy;
                        // flutuação + brilho + rotação em camadas (mais orgânico)
                        this.tweens.add({
                            targets: star,
                            y: cy - 7,
                            duration: 700 + (col % 4) * 80,
                            yoyo: true, repeat: -1,
                            delay: (col % 5) * 100,
                            ease: 'Sine.easeInOut'
                        });
                        this.tweens.add({
                            targets: star,
                            scale: { from: 0.95, to: 1.18 },
                            angle: { from: -14, to: 14 },
                            duration: 900 + (col % 3) * 100,
                            yoyo: true, repeat: -1,
                            delay: (col % 5) * 80,
                            ease: 'Sine.easeInOut'
                        });
                        break;
                    }
                    case 'r': {
                        // robôs mais rápidos e com patrulha um pouco maior nas fases avançadas
                        const difficulty = this.levelIndex; // 0..9
                        const speed = 52 + difficulty * 5;  // 52 → 97
                        const patrol = 2.5 + Math.min(difficulty, 6) * 0.25; // tiles cada lado
                        const robot = new Robot(
                            this, cx, floorY - 16,
                            cx - patrol * TILE, cx + patrol * TILE,
                            speed
                        );
                        robot.setDepth(4);
                        this.robots.add(robot);
                        break;
                    }
                    case 's': {
                        const spring = this.springs.create(cx, floorY - 9, 'cushion');
                        spring.body.setSize(40, 12).setOffset(2, 6);
                        break;
                    }
                    case 'm':
                    case 'v': {
                        const plat = this.movers.create(cx, cy, 'platform');
                        plat.moveAxis = ch === 'm' ? 'x' : 'y';
                        // alcance e velocidade sobem um pouco com a fase
                        const range = TILE * (2 + Math.min(this.levelIndex, 6) * 0.15);
                        const baseSpeed = ch === 'm' ? 55 : 42;
                        plat.min = (ch === 'm' ? cx : cy) - range;
                        plat.max = (ch === 'm' ? cx : cy) + range;
                        plat.moveSpeed = baseSpeed + this.levelIndex * 3;
                        if (ch === 'm') plat.setVelocityX(plat.moveSpeed);
                        else plat.setVelocityY(plat.moveSpeed);
                        break;
                    }
                    case 'P':
                        this.spawnX = cx;
                        // pés no chão (Player usa origin 0.5, 1)
                        this.spawnY = floorY;
                        break;
                }
            }
        }

        // dica de controles na primeira fase
        if (this.levelIndex === 0 && !this.sys.game.device.input.touch) {
            this.add.text(this.spawnX, this.spawnY - 96, '← → andar    ESPAÇO pular (2x no ar!)', {
                fontSize: '16px', fontFamily: 'monospace', color: '#5e3d20'
            }).setOrigin(0.5).setDepth(1);
        }
    }

    addHazard(cx, floorY, key, stinky = false) {
        const h = this.hazards.create(cx, floorY, key);
        h.setOrigin(0.5, 1);
        h.setDepth(3);

        // escala visual primeiro (mais legível em tela)
        if (key === 'sneaker') h.setScale(1.25);
        else if (key.startsWith('lego')) h.setScale(1.2);
        else if (key === 'book') h.setScale(1.15);

        // hitbox centrada na base do objeto
        const bw = Math.max(20, h.displayWidth * 0.7);
        const bh = Math.max(12, h.displayHeight * 0.5);
        h.body.setSize(bw / h.scaleX, bh / h.scaleY);
        h.body.updateFromGameObject();

        // tênis fedido: fumacinha verde subindo
        if (stinky || key === 'sneaker') {
            this.add.particles(cx, floorY - 20, 'stink', {
                speedX: { min: -14, max: 14 },
                speedY: { min: -32, max: -12 },
                lifespan: { min: 550, max: 1000 },
                alpha: { start: 0.75, end: 0, ease: 'Sine.easeIn' },
                scale: { start: 0.65, end: 1.7, ease: 'Sine.easeOut' },
                frequency: 160,
                quantity: 1,
                tint: [0x5fd85a, 0x8fff7a, 0x3aaa40, 0xc8ffb0],
                advance: 220
            }).setDepth(4);
        }
    }

    // ---------- HUD ----------

    createHud(lvl) {
        // barra superior semi-transparente
        this.add.rectangle(480, 22, 960, 48, 0x2a2018, 0.28)
            .setScrollFactor(0).setDepth(99);

        this.heartIcons = [];
        for (let i = 0; i < 3; i++) {
            this.heartIcons.push(
                this.add.image(30 + i * 28, 24, 'heart').setScrollFactor(0).setDepth(100).setScale(1.05)
            );
        }

        this.add.image(128, 24, 'star').setScrollFactor(0).setDepth(100).setScale(0.95);
        this.starText = this.add.text(146, 24, `0/${lvl.totalStars}`, {
            fontSize: '18px', fontFamily: 'Georgia, serif', fontStyle: 'bold', color: '#fff8e8',
            stroke: '#4a3020', strokeThickness: 4
        }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(100);

        this.add.text(480, 22, `Fase ${this.levelIndex + 1}/10 — ${lvl.title}`, {
            fontSize: '17px', fontFamily: 'Georgia, serif', fontStyle: 'bold', color: '#fff8e8',
            stroke: '#4a3020', strokeThickness: 4
        }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(100);

        const save = loadSave();
        Sound.setMuted(save.muted);
        this.muteBtn = this.add.text(934, 24, save.muted ? '🔇' : '🔊', { fontSize: '22px' })
            .setOrigin(0.5).setScrollFactor(0).setDepth(100)
            .setInteractive({ useHandCursor: true });
        this.muteBtn.on('pointerdown', () => {
            const muted = !loadSave().muted;
            updateSave({ muted });
            Sound.setMuted(muted);
            this.muteBtn.setText(muted ? '🔇' : '🔊');
        });
    }

    updateHearts() {
        this.heartIcons.forEach((icon, i) => {
            icon.setTexture(i < this.hearts ? 'heart' : 'heart_empty');
        });
    }

    showIntroBanner(lvl) {
        const banner = this.add.container(480, -70).setScrollFactor(0).setDepth(110);
        const bgRect = this.add.rectangle(0, 0, 580, 82, 0x3a2a1c, 0.9).setStrokeStyle(3, 0xe8b050);
        const title = this.add.text(0, -16, `Fase ${this.levelIndex + 1}: ${lvl.title}`, {
            fontSize: '22px', fontFamily: 'Georgia, serif', fontStyle: 'bold', color: '#ffd66b'
        }).setOrigin(0.5);
        const tip = this.add.text(0, 14, lvl.tip, {
            fontSize: '15px', fontFamily: 'Georgia, serif', color: '#fff8e8'
        }).setOrigin(0.5);
        banner.add([bgRect, title, tip]);
        this.tweens.add({
            targets: banner, y: 90, duration: 450, ease: 'Back.easeOut',
            onComplete: () => this.tweens.add({
                targets: banner, y: -70, delay: 2100, duration: 350, ease: 'Back.easeIn',
                onComplete: () => banner.destroy()
            })
        });
    }

    // ---------- controles de toque ----------

    createTouchControls() {
        const mk = (x, y, glyph) => {
            const btn = this.add.image(x, y, 'btn').setScrollFactor(0).setDepth(150)
                .setAlpha(0.4).setInteractive();
            this.add.text(x, y, glyph, {
                fontSize: '34px', fontFamily: 'monospace', fontStyle: 'bold', color: '#22223b'
            }).setOrigin(0.5).setScrollFactor(0).setDepth(151).setAlpha(0.75);
            return btn;
        };
        const left = mk(70, 465, '←');
        const right = mk(180, 465, '→');
        const jump = mk(880, 465, '▲');

        left.on('pointerdown', () => this.leftPressed = true);
        left.on('pointerup', () => this.leftPressed = false);
        left.on('pointerout', () => this.leftPressed = false);
        right.on('pointerdown', () => this.rightPressed = true);
        right.on('pointerup', () => this.rightPressed = false);
        right.on('pointerout', () => this.rightPressed = false);
        jump.on('pointerdown', () => {
            this.lastJumpPressedAt = this.time.now;
            this.jumpTouchHeld = true;
        });
        jump.on('pointerup', () => this.jumpTouchHeld = false);
        jump.on('pointerout', () => this.jumpTouchHeld = false);
    }

    // ---------- loop principal ----------

    update(time, delta) {
        if (this.won) {
            if (Phaser.Input.Keyboard.JustDown(this.keys.ENTER) ||
                Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) {
                if (this.nextAction) this.nextAction();
            }
            return;
        }
        if (Phaser.Input.Keyboard.JustDown(this.keys.R)) return this.restart();
        if (Phaser.Input.Keyboard.JustDown(this.keys.ESC)) {
            Sound.click();
            return this.scene.start('MenuScene');
        }
        if (this.isDead || !this.player || !this.player.body) return;

        const body = this.player.body;
        const dt = Math.min(delta, 40) / 1000;
        const left = this.keys.LEFT.isDown || this.keys.A.isDown || this.leftPressed;
        const right = this.keys.RIGHT.isDown || this.keys.D.isDown || this.rightPressed;
        const grounded = body.touching.down || body.blocked.down;

        // ---------- movimento horizontal (aceleração + freio manuais) ----------
        // drag do body fica em 0; controlamos aqui para ar ≠ chão e virada snappy
        body.setDragX(0);
        body.setAccelerationX(0);

        const inputDir = left && !right ? -1 : (right && !left ? 1 : 0);
        const vx = body.velocity.x;

        if (inputDir !== 0) {
            const reversing = Math.sign(vx) === -inputDir && Math.abs(vx) > 40;
            let accel = grounded
                ? (reversing ? PHYS.turnAccel : PHYS.groundAccel)
                : PHYS.airAccel;
            // se já está acima da maxSpeed (knockback etc.), não acelera mais na mesma direção
            if (Math.sign(vx) === inputDir && Math.abs(vx) >= PHYS.maxSpeed) {
                body.setVelocityX(inputDir * PHYS.maxSpeed);
            } else {
                body.setAccelerationX(inputDir * accel);
            }
        } else {
            // freio: forte no chão, leve no ar (preserva momentum do pulo)
            const drag = grounded ? PHYS.groundDrag : PHYS.airDrag;
            if (Math.abs(vx) < PHYS.stopThreshold && grounded) {
                body.setVelocityX(0);
            } else if (vx !== 0) {
                const decel = drag * dt;
                const nv = Math.abs(vx) <= decel ? 0 : vx - Math.sign(vx) * decel;
                body.setVelocityX(nv);
            }
        }

        // cap de velocidade horizontal (não mexe no Y)
        if (Math.abs(body.velocity.x) > PHYS.maxSpeed) {
            body.setVelocityX(Math.sign(body.velocity.x) * PHYS.maxSpeed);
        }

        // ---------- pulo: coyote + buffer + altura variável + duplo ----------
        if (grounded) {
            this.lastGroundedAt = time;
            this.jumpsUsed = 0;
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.UP) ||
            Phaser.Input.Keyboard.JustDown(this.keys.W) ||
            Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) {
            this.lastJumpPressedAt = time;
        }

        if (time - this.lastJumpPressedAt < PHYS.bufferMs) {
            const firstJump = time - this.lastGroundedAt < PHYS.coyoteMs && this.jumpsUsed === 0;
            const airJump = !firstJump && this.jumpsUsed < 2 && !grounded;
            // permite airJump também se saiu da borda sem pular (jumpsUsed 0 mas coyote expirou)
            const canAir = airJump || (!firstJump && this.jumpsUsed === 0 && !grounded);
            if (firstJump || canAir) {
                const isAir = !firstJump;
                body.setVelocityY(isAir ? PHYS.airJumpVelocity : PHYS.jumpVelocity);
                this.jumpsUsed = isAir ? 2 : 1;
                this.lastJumpPressedAt = -9999;
                this.jumpCutAllowed = true;
                // pequeno boost horizontal se estiver segurando direção (ajuda a cruzar gaps)
                if (inputDir !== 0 && Math.abs(body.velocity.x) < PHYS.maxSpeed * 0.85) {
                    body.setVelocityX(body.velocity.x + inputDir * 40);
                }
                Sound.jump();
                this.player.squashTo(0.8, 1.2, 95);
                if (isAir) {
                    // só cancela a cambalhota anterior — não mata flash de dano etc.
                    if (this.flipTween) this.flipTween.stop();
                    this.player.setAngle(0);
                    this.flipTween = this.tweens.add({
                        targets: this.player, angle: this.player.facing * 360,
                        duration: 360, ease: 'Quad.easeOut',
                        onComplete: () => {
                            this.flipTween = null;
                            if (!this.isDead) this.player.setAngle(0);
                        }
                    });
                    this.sparkEmitter.explode(6, this.player.x, this.player.y - 40);
                } else {
                    this.dustEmitter.explode(5, this.player.x, this.player.y - 2);
                }
            }
        }

        // corte de pulo: uma vez ao soltar o botão (pulo curto/longo clássico)
        const jumpHeld = this.keys.UP.isDown || this.keys.W.isDown ||
            this.keys.SPACE.isDown || this.jumpTouchHeld;
        if (!grounded && !jumpHeld && this.jumpCutAllowed && body.velocity.y < -100) {
            body.setVelocityY(body.velocity.y * PHYS.jumpCutMultiplier);
            this.jumpCutAllowed = false;
        }
        if (grounded || body.velocity.y >= 0) this.jumpCutAllowed = false;

        // hang time no ápice — gravidade reduzida perto de vy≈0 (sensação mais fluida)
        if (!grounded && Math.abs(body.velocity.y) < PHYS.apexThreshold) {
            this.player.body.setGravityY(PHYS.gravity * (PHYS.apexGravityScale - 1));
        } else {
            this.player.body.setGravityY(0); // usa só a gravidade do mundo
        }

        // aterrissagem: squash + poeira (limiar um pouco menor = feedback mais frequente)
        if (!this.wasGrounded && grounded && this.lastFallSpeed > 260) {
            const impact = Phaser.Math.Clamp(this.lastFallSpeed / 700, 0.7, 1.35);
            this.player.squashTo(1.15 * impact, 0.82 / Math.min(impact, 1.1), 85);
            this.dustEmitter.explode(Math.round(5 * impact), this.player.x, this.player.y - 2);
            Sound.step();
        }
        this.wasGrounded = grounded;
        this.lastFallSpeed = body.velocity.y;

        // poeirinha ao correr
        if (grounded && Math.abs(body.velocity.x) > 90 && time > this.nextRunDust) {
            this.dustEmitter.explode(1, this.player.x - this.player.facing * 8, this.player.y - 2);
            this.nextRunDust = time + Phaser.Math.Clamp(170 - Math.abs(body.velocity.x) * 0.28, 70, 170);
        }

        // plataformas móveis: inverte nos limites e carrega o jogador junto
        this.onMover = null;
        this.movers.getChildren().forEach(p => {
            if (p.moveAxis === 'x') {
                if (p.x <= p.min) p.setVelocityX(Math.abs(p.moveSpeed));
                else if (p.x >= p.max) p.setVelocityX(-Math.abs(p.moveSpeed));
            } else {
                if (p.y <= p.min) p.setVelocityY(Math.abs(p.moveSpeed));
                else if (p.y >= p.max) p.setVelocityY(-Math.abs(p.moveSpeed));
            }
            if (body.touching.down && p.body.touching.up) {
                this.onMover = p;
                this.player.x += p.body.deltaX();
                // sobe e desce com a plataforma (antes só descia)
                this.player.y += p.body.deltaY();
            }
        });

        // câmera: look-ahead suave na direção do movimento
        const lookTarget = Phaser.Math.Clamp(body.velocity.x * 0.32, -80, 80);
        this.camLookX = Phaser.Math.Linear(this.camLookX, lookTarget, 1 - Math.exp(-7 * dt));
        this.cameras.main.setFollowOffset(-this.camLookX, 0);

        // parallax de camadas de fundo
        const scr = this.cameras.main.scrollX;
        if (this.wallpaper) {
            this.wallpaper.tilePositionX = scr * 0.08;
            this.wallpaper.tilePositionY = this.cameras.main.scrollY * 0.04;
        }
        if (this.wallPanel) this.wallPanel.tilePositionX = scr * 0.12;
        if (this.crown) this.crown.tilePositionX = scr * 0.05;
        if (this.floorDecor) this.floorDecor.tilePositionX = scr * 0.2;

        // caiu do mundo
        if (this.player.y > this.worldH + 80) this.die(true);

        this.player.updateAnim(time, delta);
    }

    // ---------- eventos ----------

    onStar(player, star) {
        star.destroy();
        this.starsCollected++;
        this.starText.setText(`${this.starsCollected}/${levels[this.levelIndex].totalStars}`);
        Sound.coin();
        this.sparkEmitter.explode(8, star.x, star.y);
    }

    onSpring(player, spring) {
        // quica sempre que encostar caindo ou andando (nunca corta um pulo em subida)
        if (player.body.velocity.y >= -50) {
            player.body.setVelocityY(PHYS.springVelocity);
            this.jumpCutAllowed = false; // impulso da mola nunca é cortado
            this.jumpsUsed = 1;          // ainda dá para usar o pulo duplo no ar
            Sound.spring();
            player.squashTo(0.7, 1.3, 130);
            this.tweens.killTweensOf(spring);
            spring.setScale(1, 1);
            this.tweens.add({
                targets: spring, scaleY: 0.45, scaleX: 1.15, duration: 80,
                yoyo: true, ease: 'Back.easeOut',
                onComplete: () => spring.setScale(1, 1)
            });
            this.dustEmitter.explode(8, spring.x, spring.y);
        }
    }

    onRobotHit(player, robot) {
        if (robot.squished || this.isDead) return;
        // aceita stomp se o jogador está caindo em cima (mais generoso para crianças)
        const stomping = player.body.velocity.y > 40 &&
            player.body.bottom <= robot.body.top + 18;
        if (stomping || (robot.body.touching.up && player.body.touching.down)) {
            robot.squish();
            player.body.setVelocityY(PHYS.stompBounce);
            this.jumpsUsed = 1; // pisão devolve o pulo duplo
            this.jumpCutAllowed = true;
            this.sparkEmitter.explode(6, robot.x, robot.y - 10);
        } else {
            this.hurt(robot.x);
        }
    }

    onHazard(player, hazard) {
        this.hurt(hazard.x);
    }

    hurt(fromX) {
        if (this.isDead || this.won || this.time.now < this.invulnUntil) return;
        this.hearts--;
        this.updateHearts();
        Sound.hurt();
        this.cameras.main.shake(150, 0.006);

        if (this.hearts <= 0) return this.die(false);

        this.invulnUntil = this.time.now + 1500;
        const dir = this.player.x < fromX ? -1 : 1;
        this.player.body.setVelocity(dir * PHYS.hurtKnockbackX, PHYS.hurtKnockbackY);
        this.tweens.add({
            targets: this.player, alpha: 0.25,
            duration: 110, yoyo: true, repeat: 6,
            onComplete: () => this.player.setAlpha(1)
        });
    }

    die(fell) {
        if (this.isDead) return;
        this.isDead = true;
        Sound.death();
        this.cameras.main.shake(250, 0.01);

        const body = this.player.body;
        body.checkCollision.none = true;
        body.setAcceleration(0, 0);
        if (!fell) body.setVelocity(-this.player.facing * 120, -420);
        this.tweens.add({ targets: this.player, angle: 540, duration: 800 });

        this.cameras.main.fadeOut(650, 0, 0, 0);
        this.time.delayedCall(800, () => this.restart());
    }

    restart() {
        this.scene.restart({ character: this.character, level: this.levelIndex + 1 });
    }

    onTv(player, tv) {
        if (this.won || this.isDead) return;
        this.won = true;

        // congela o jogador comemorando
        player.body.setAcceleration(0, 0);
        player.body.setVelocityX(0);

        tv.setTexture('tv_on');
        Sound.win();
        this.confettiEmitter.explode(50, tv.x, tv.y - 40);
        this.tweens.add({
            targets: tv, scale: 1.08, duration: 180, yoyo: true, repeat: 2
        });

        // brilho da TV
        const glow = this.add.circle(tv.x, tv.y, 70, 0x9be8ff, 0.25).setDepth(3);
        this.tweens.add({
            targets: glow, alpha: 0.05, scale: 1.4,
            duration: 700, yoyo: true, repeat: -1
        });

        // salva progresso
        const save = loadSave();
        const lvlNum = this.levelIndex + 1;
        const bestStars = Math.max(save.stars[lvlNum] || 0, this.starsCollected);
        updateSave({
            unlocked: Math.max(save.unlocked, Math.min(lvlNum + 1, levels.length)),
            stars: { ...save.stars, [lvlNum]: bestStars }
        });

        this.time.delayedCall(900, () => this.showWinPanel());
    }

    showWinPanel() {
        const lvl = levels[this.levelIndex];
        const isLast = this.levelIndex === levels.length - 1;

        this.add.rectangle(480, 270, 960, 540, 0x000000, 0.55)
            .setScrollFactor(0).setDepth(199);
        const panel = this.add.container(480, 270).setScrollFactor(0).setDepth(200);
        const bgRect = this.add.rectangle(0, 0, 460, 240, 0x22223b, 0.97)
            .setStrokeStyle(4, 0xffd23f);
        const title = this.add.text(0, -80, `Fase ${this.levelIndex + 1} completa!`, {
            fontSize: '28px', fontFamily: 'monospace', fontStyle: 'bold', color: '#ffd23f'
        }).setOrigin(0.5);
        const starsLine = this.add.text(0, -34, `⭐ ${this.starsCollected} de ${lvl.totalStars} estrelas`, {
            fontSize: '20px', fontFamily: 'monospace', color: '#ffffff'
        }).setOrigin(0.5);

        const btnLabel = isLast ? 'VER A TV LENDÁRIA!' : 'PRÓXIMA FASE  ➜';
        const btn = this.add.rectangle(0, 46, 300, 54, 0x2a6fdb)
            .setStrokeStyle(3, 0x8ecae6).setInteractive({ useHandCursor: true });
        const btnText = this.add.text(0, 46, btnLabel, {
            fontSize: '18px', fontFamily: 'monospace', fontStyle: 'bold', color: '#ffffff'
        }).setOrigin(0.5);
        const hint = this.add.text(0, 96, 'ou aperte ENTER', {
            fontSize: '13px', fontFamily: 'monospace', color: '#8888aa'
        }).setOrigin(0.5);

        panel.add([bgRect, title, starsLine, btn, btnText, hint]);
        panel.setScale(0.6).setAlpha(0);
        this.tweens.add({ targets: panel, scale: 1, alpha: 1, duration: 300, ease: 'Back.easeOut' });

        this.nextAction = () => {
            Sound.click();
            if (isLast) this.scene.start('VictoryScene', { character: this.character });
            else this.scene.start('GameScene', { character: this.character, level: this.levelIndex + 2 });
        };
        btn.on('pointerover', () => btn.setFillStyle(0x4a8fe8));
        btn.on('pointerout', () => btn.setFillStyle(0x2a6fdb));
        btn.on('pointerdown', () => this.nextAction());
    }
}
