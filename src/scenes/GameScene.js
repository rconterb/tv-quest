import { levels, THEMES, TILE, ROWS } from '../levels.js';
import { generateTextures, gradientStrips } from '../textures.js';
import { Player, Robot } from '../objects.js';
import { preloadCharacters, createCharacterAnims } from '../sprites.js';
import { Sound, Music } from '../audio.js';
import { loadSave, updateSave } from '../save.js';

const JUMP_VELOCITY = -540;
const AIR_JUMP_VELOCITY = -500;  // segundo pulo (no ar)
const SPRING_VELOCITY = -850;
const COYOTE_MS = 110;      // tempo extra para pular depois de sair da borda
const BUFFER_MS = 140;      // aperta pulo um pouco antes de pousar e ele acontece

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
        cam.startFollow(this.player, true, 0.08, 0.1);
        cam.setDeadzone(140, 100);
        cam.setLerp(0.08, 0.1);
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

        // trilha sonora conforme a opção do menu
        if (loadSave().music !== false) Music.start();
        else Music.stop();
    }

    // ---------- construção da fase ----------

    createBackground() {
        // parede aquarela (muitas faixas = degradê suave)
        const bg = this.add.graphics().setScrollFactor(0).setDepth(-30);
        gradientStrips(bg, 0, 0, 960, 540, this.theme.wallTop, this.theme.wallBottom, 36);

        // faixa de luz do teto
        const light = this.add.graphics().setScrollFactor(0).setDepth(-29);
        light.fillStyle(0xffffff, 0.12);
        light.fillEllipse(480, -20, 900, 160);

        // papel de parede floral bem sutil
        this.wallpaper = this.add.tileSprite(480, 250, 960, 420, 'wallpaper')
            .setScrollFactor(0).setDepth(-25).setAlpha(0.14);

        // rodapé
        this.add.tileSprite(480, 470, 960, 16, 'wainscot')
            .setScrollFactor(0).setDepth(-24).setAlpha(0.5);

        // janelas com luz dourada (parallax)
        const winCover = (this.worldW - 960) * 0.35 + 960;
        for (let x = 220; x < winCover; x += 460) {
            this.add.image(x, 150, 'window')
                .setScrollFactor(0.3).setDepth(-15).setAlpha(0.92).setScale(0.95);
            // mancha de sol no chão
            const sun = this.add.ellipse(x + 20, 420, 90, 24, 0xffe8a0, 0.12)
                .setScrollFactor(0.35).setDepth(-14);
            this.tweens.add({
                targets: sun, alpha: 0.06, duration: 2200,
                yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
            });
        }

        // móveis do cômodo (sem "quadros" hard-edged competindo com os sprites)
        const rand = this.seededRandom(this.levelIndex * 1000 + 7);
        const decorCover = (this.worldW - 960) * 0.55 + 960;
        for (let x = 160; x < decorCover; x += 260 + Math.floor(rand() * 100)) {
            const key = this.theme.decor[Math.floor(rand() * this.theme.decor.length)];
            this.add.image(x, this.worldH - TILE + 2, key)
                .setOrigin(0.5, 1).setScrollFactor(0.5).setDepth(-10).setAlpha(0.88);
        }
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
                    case '#':
                        this.platforms.create(cx, cy, this.theme.block);
                        break;
                    case 'T': {
                        const tv = this.tvGroup.create(cx + 10, floorY - 37, 'tv_off');
                        tv.body.setSize(60, 60);
                        this.tvSprite = tv;
                        break;
                    }
                    case 't': this.addHazard(cx, floorY, 'sneaker'); break;
                    case 'l': this.addHazard(cx, floorY, Math.random() < 0.5 ? 'lego_red' : 'lego_blue'); break;
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
                        const robot = new Robot(this, cx, floorY - 16,
                            (col - 3) * TILE + TILE / 2, (col + 3) * TILE + TILE / 2);
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
                        plat.min = (ch === 'm' ? cx : cy) - TILE * 2;
                        plat.max = (ch === 'm' ? cx : cy) + TILE * 2;
                        plat.moveSpeed = ch === 'm' ? 60 : 45;
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

    addHazard(cx, floorY, key) {
        const h = this.hazards.create(cx, floorY, key);
        h.setOrigin(0.5, 1);
        h.body.setSize(h.width * 0.7, h.height * 0.7);
        // static body precisa ser reposicionado após mudar a origem
        h.body.updateFromGameObject();
        h.body.setOffset(h.width * 0.15, h.height * 0.25);
    }

    // ---------- HUD ----------

    createHud(lvl) {
        this.heartIcons = [];
        for (let i = 0; i < 3; i++) {
            this.heartIcons.push(
                this.add.image(26 + i * 26, 26, 'heart').setScrollFactor(0).setDepth(100)
            );
        }

        this.add.image(120, 26, 'star').setScrollFactor(0).setDepth(100).setScale(0.9);
        this.starText = this.add.text(136, 26, `0/${lvl.totalStars}`, {
            fontSize: '18px', fontFamily: 'monospace', fontStyle: 'bold', color: '#ffffff',
            stroke: '#22223b', strokeThickness: 4
        }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(100);

        this.add.text(480, 22, `Fase ${this.levelIndex + 1}/10 — ${lvl.title}`, {
            fontSize: '16px', fontFamily: 'monospace', fontStyle: 'bold', color: '#ffffff',
            stroke: '#22223b', strokeThickness: 4
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
        const bgRect = this.add.rectangle(0, 0, 560, 78, 0x22223b, 0.88).setStrokeStyle(3, 0xffd23f);
        const title = this.add.text(0, -16, `Fase ${this.levelIndex + 1}: ${lvl.title}`, {
            fontSize: '22px', fontFamily: 'monospace', fontStyle: 'bold', color: '#ffd23f'
        }).setOrigin(0.5);
        const tip = this.add.text(0, 14, lvl.tip, {
            fontSize: '15px', fontFamily: 'monospace', color: '#ffffff'
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
        const accel = 1600;
        const left = this.keys.LEFT.isDown || this.keys.A.isDown || this.leftPressed;
        const right = this.keys.RIGHT.isDown || this.keys.D.isDown || this.rightPressed;

        if (left && !right) body.setAccelerationX(-accel);
        else if (right && !left) body.setAccelerationX(accel);
        else body.setAccelerationX(0);

        // pulo com coyote time + jump buffer + altura variável + PULO DUPLO
        const grounded = body.touching.down || body.blocked.down;
        if (grounded) {
            this.lastGroundedAt = time;
            this.jumpsUsed = 0;
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.UP) ||
            Phaser.Input.Keyboard.JustDown(this.keys.W) ||
            Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) {
            this.lastJumpPressedAt = time;
        }

        if (time - this.lastJumpPressedAt < BUFFER_MS) {
            const firstJump = time - this.lastGroundedAt < COYOTE_MS && this.jumpsUsed === 0;
            const airJump = !firstJump && this.jumpsUsed < 2;
            if (firstJump || airJump) {
                body.setVelocityY(firstJump ? JUMP_VELOCITY : AIR_JUMP_VELOCITY);
                this.jumpsUsed = firstJump ? 1 : 2;
                this.lastJumpPressedAt = -9999;
                this.jumpCutAllowed = true; // só corta subida de pulo do jogador (mola não)
                Sound.jump();
                this.player.squashTo(0.82, 1.18, 100);
                if (airJump) {
                    // cambalhota do pulo duplo
                    this.tweens.add({
                        targets: this.player, angle: this.player.facing * 360,
                        duration: 380, ease: 'Quad.easeOut',
                        onComplete: () => { if (!this.isDead) this.player.setAngle(0); }
                    });
                    this.sparkEmitter.explode(6, this.player.x, this.player.y - 40);
                } else {
                    this.dustEmitter.explode(5, this.player.x, this.player.y - 2);
                }
            }
        }

        // soltar o botão no meio do pulo corta a subida (pulo curto)
        const jumpHeld = this.keys.UP.isDown || this.keys.W.isDown ||
            this.keys.SPACE.isDown || this.jumpTouchHeld;
        if (!grounded && !jumpHeld && this.jumpCutAllowed && body.velocity.y < -180) {
            body.setVelocityY(body.velocity.y * 0.82);
        }
        if (grounded || body.velocity.y >= 0) this.jumpCutAllowed = false;

        // aterrissagem: squash + poeira
        if (!this.wasGrounded && grounded && this.lastFallSpeed > 300) {
            this.player.squashTo(1.22, 0.78, 90);
            this.dustEmitter.explode(7, this.player.x, this.player.y - 2);
            Sound.step();
        }
        this.wasGrounded = grounded;
        this.lastFallSpeed = body.velocity.y;

        // poeirinha ao correr (mais densa conforme a velocidade)
        if (grounded && Math.abs(body.velocity.x) > 100 && time > this.nextRunDust) {
            this.dustEmitter.explode(1, this.player.x - this.player.facing * 8, this.player.y - 2);
            this.nextRunDust = time + Phaser.Math.Clamp(180 - Math.abs(body.velocity.x) * 0.25, 90, 180);
        }

        // plataformas móveis: inverte nos limites e carrega o jogador junto
        this.movers.getChildren().forEach(p => {
            if (p.moveAxis === 'x') {
                if (p.x <= p.min) p.setVelocityX(p.moveSpeed);
                else if (p.x >= p.max) p.setVelocityX(-p.moveSpeed);
            } else {
                if (p.y <= p.min) p.setVelocityY(p.moveSpeed);
                else if (p.y >= p.max) p.setVelocityY(-p.moveSpeed);
            }
            if (body.touching.down && p.body.touching.up) {
                this.player.x += p.body.deltaX();
                if (p.body.deltaY() > 0) this.player.y += p.body.deltaY();
            }
        });

        // câmera: look-ahead suave na direção do movimento
        const lookTarget = Phaser.Math.Clamp(body.velocity.x * 0.28, -70, 70);
        this.camLookX = Phaser.Math.Linear(this.camLookX, lookTarget, 1 - Math.exp(-6 * (delta / 1000)));
        this.cameras.main.setFollowOffset(-this.camLookX, 0);

        // parallax do papel de parede (acompanha o scroll com atraso)
        if (this.wallpaper) {
            this.wallpaper.tilePositionX = this.cameras.main.scrollX * 0.12;
            this.wallpaper.tilePositionY = this.cameras.main.scrollY * 0.06;
        }

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
            player.body.setVelocityY(SPRING_VELOCITY);
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
        if (robot.body.touching.up && player.body.touching.down) {
            robot.squish();
            player.body.setVelocityY(-420);
            this.jumpsUsed = 1; // pisão devolve o pulo duplo
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
        this.player.body.setVelocity(dir * 240, -330);
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
