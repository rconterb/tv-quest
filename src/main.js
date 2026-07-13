// === Sound Manager ===
// Sintetizador de áudio nativo do navegador para não precisarmos de arquivos MP3
class SoundManager {
    static init() {
        if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }
    
    static playWalk() {
        if (!this.ctx) this.init();
        if (!this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();
        
        // Som de passo rápido (um bloop seco)
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
    }

    static playDeath() {
        if (!this.ctx) this.init();
        if (!this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();
        
        // Som caindo / engraçado (boooing para baixo)
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.6);
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.6);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.6);
    }
    
    static playJump() {
        if (!this.ctx) this.init();
        if (!this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();
        
        // Som de pulo para cima
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.2);
    }
}

// === Level Data ===
const levels = [
    { map: ["....................", "....................", "....................", "....................", "...................2", "11111111111111111111"], text: "Fase 1: Ande ate a TV!" },
    { map: ["....................", "....................", "....................", "....................", ".......3...........2", "11111111111111111111"], text: "Fase 2: Pule o Tenis!" },
    { map: ["....................", "....................", "....................", "....................", "......4....4.......2", "11111111111111111111"], text: "Fase 3: Cuidado com os Legos!" },
    { map: ["....................", "....................", "....................", "....................", ".....5...3...5.....2", "11111111111111111111"], text: "Fase 4: Pulos rapidos!" },
    { map: ["....................", "....................", "....................", ".......11...........", ".....5.............2", "1111......1111111111"], text: "Fase 5: Pule o buraco!" },
    { map: ["....................", "....................", "....................", "..........11........", ".....44............2", "1111.....1...1111111"], text: "Fase 6: Precisao!" },
    { map: ["...................2", ".................111", "............11......", ".......11...........", "....3...............", "1111.........1111111"], text: "Fase 7: Subida!" },
    { map: ["....................", "....................", "....................", "....................", "...3..4..5..3..4...2", "11111111111111111111"], text: "Fase 8: Corrida de obstaculos!" },
    { map: ["...................2", "................1111", "...........11.......", ".......11.....5.....", "...4.4..............", "111...1...1........."], text: "Fase 9: Quase la!" },
    { map: ["...................2", "............1111...1", ".......11...........", "...11.....3....4....", "......11............", "111.........1...1..."], text: "Fase 10: O Desafio Final!" }
];

// === Menu Scene ===
class MenuScene extends Phaser.Scene {
    constructor() { super('MenuScene'); }
    create() {
        this.cameras.main.setBackgroundColor('#1a1a2e');
        this.add.text(400, 100, 'EM BUSCA DA TV', { fontSize: '48px', fill: '#ffb703', fontFamily: 'monospace', fontStyle: 'bold' }).setOrigin(0.5);
        this.add.text(400, 180, 'Escolha seu personagem:', { fontSize: '24px', fill: '#ffffff', fontFamily: 'monospace' }).setOrigin(0.5);

        let boyBg = this.add.rectangle(250, 300, 200, 80, 0x023047).setInteractive({ useHandCursor: true });
        boyBg.setStrokeStyle(4, 0x8ecae6);
        this.add.text(250, 300, 'MENINO (4a)', { fontSize: '24px', fill: '#8ecae6', fontFamily: 'monospace', fontStyle: 'bold' }).setOrigin(0.5);
        boyBg.on('pointerdown', () => this.startGame('boy'));
        boyBg.on('pointerover', () => boyBg.setFillStyle(0x219ebc));
        boyBg.on('pointerout', () => boyBg.setFillStyle(0x023047));

        let girlBg = this.add.rectangle(550, 300, 200, 80, 0x4a0033).setInteractive({ useHandCursor: true });
        girlBg.setStrokeStyle(4, 0xffb703);
        this.add.text(550, 300, 'MENINA (8a)', { fontSize: '24px', fill: '#ffb703', fontFamily: 'monospace', fontStyle: 'bold' }).setOrigin(0.5);
        girlBg.on('pointerdown', () => this.startGame('girl'));
        girlBg.on('pointerover', () => girlBg.setFillStyle(0x8a005c));
        girlBg.on('pointerout', () => girlBg.setFillStyle(0x4a0033));
    }
    startGame(character) {
        // Inicializa o contexto de áudio em uma interação do usuário (regra dos navegadores)
        SoundManager.init();
        this.scene.start('GameScene', { character: character, level: 1, lives: 5 });
    }
}

// === Player Skeletal Animation Class ===
class Player extends Phaser.GameObjects.Container {
    constructor(scene, x, y, character) {
        super(scene, x, y);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        const color = character === 'boy' ? 0x0077b6 : 0x9d4edd;
        const skin = 0xffd6a5;

        this.leftLeg = scene.add.image(0, 4, 'rect').setTint(color).setOrigin(0.5, 0).setDisplaySize(6, 12);
        this.rightLeg = scene.add.image(0, 4, 'rect').setTint(color).setOrigin(0.5, 0).setDisplaySize(6, 12);
        this.leftArm = scene.add.image(0, -4, 'rect').setTint(color).setOrigin(0.5, 0).setDisplaySize(6, 14);
        this.rightArm = scene.add.image(0, -4, 'rect').setTint(color).setOrigin(0.5, 0).setDisplaySize(6, 14);
        this.torso = scene.add.image(0, -2, 'rect').setTint(color).setOrigin(0.5, 0.5).setDisplaySize(14, 16);
        this.head = scene.add.image(0, -16, 'rect').setTint(skin).setOrigin(0.5, 0.5).setDisplaySize(14, 14);
        
        this.add([this.leftArm, this.leftLeg, this.rightLeg, this.torso, this.head, this.rightArm]);

        this.body.setSize(18, 36);
        this.body.setOffset(-9, -23); 
        this.body.setDragX(1200); 
        this.body.setMaxVelocity(200, 600);

        this.animTime = 0;
        this.facing = 1;
    }

    updateAnim(time, delta) {
        if (!this.body) return;
        
        const isMoving = Math.abs(this.body.velocity.x) > 10;
        const isGrounded = this.body.touching.down || this.body.blocked.down;
        
        if (this.body.velocity.x > 5) this.facing = 1;
        else if (this.body.velocity.x < -5) this.facing = -1;
        
        this.setScale(this.facing, 1);

        if (!isGrounded) {
            this.leftLeg.angle = -30;
            this.rightLeg.angle = 20;
            this.leftArm.angle = -120;
            this.rightArm.angle = 120;
            this.torso.angle = 10;
            this.head.angle = -10;
            this.torso.y = -2;
            this.head.y = -16;
        } else if (isMoving) {
            const prevSin = Math.sin(this.animTime);
            this.animTime += delta * 0.012;
            const currSin = Math.sin(this.animTime);

            // Som de passos quando o pé bate no chão (cruzamento do zero)
            if ((prevSin < 0 && currSin >= 0) || (prevSin > 0 && currSin <= 0)) {
                SoundManager.playWalk();
            }
            
            this.leftLeg.angle = currSin * 45;
            this.rightLeg.angle = Math.sin(this.animTime + Math.PI) * 45;
            this.leftArm.angle = Math.sin(this.animTime + Math.PI) * 45;
            this.rightArm.angle = currSin * 45;
            this.torso.angle = 5;
            this.head.angle = 0;
            this.torso.y = -2 + Math.abs(currSin) * 3 - 1.5;
            this.head.y = -16 + Math.abs(currSin) * 3 - 1.5;
        } else {
            this.animTime = 0;
            this.leftLeg.angle = 0;
            this.rightLeg.angle = 0;
            this.leftArm.angle = 0;
            this.rightArm.angle = 0;
            this.torso.angle = 0;
            this.head.angle = 0;
            this.torso.y = -2;
            this.head.y = -16;
        }
    }
}


// === Game Scene ===
class GameScene extends Phaser.Scene {
    constructor() { super('GameScene'); this.tileSize = 40; }
    init(data) {
        this.character = data.character || 'boy';
        this.levelIndex = data.level ? data.level - 1 : 0;
        this.lives = data.lives !== undefined ? data.lives : 5;
        this.isDead = false;
    }
    preload() { this.createTextures(); }
    createTextures() {
        const g = this.make.graphics({x: 0, y: 0, add: false});

        g.clear(); g.fillStyle(0xffffff); g.fillRect(0, 0, 10, 10);
        g.generateTexture('rect', 10, 10);

        g.clear(); g.fillStyle(0x4a4e69); g.fillRect(0, 0, this.tileSize, this.tileSize);
        g.lineStyle(2, 0x22223b); g.strokeRect(0, 0, this.tileSize, this.tileSize);
        g.generateTexture('floor', this.tileSize, this.tileSize);

        g.clear(); g.fillStyle(0x2b2d42); g.fillRect(0, 0, this.tileSize, this.tileSize);
        g.fillStyle(0xedf2f4); g.fillRect(5, 5, this.tileSize-10, this.tileSize-15);
        g.fillStyle(0x000000); g.fillRect(15, this.tileSize-10, 10, 10);
        g.generateTexture('tv', this.tileSize, this.tileSize);

        g.clear(); g.fillStyle(0xd90429); g.fillRect(0, 0, this.tileSize*0.8, this.tileSize/2);
        g.fillStyle(0xffffff); g.fillRect(0, this.tileSize/2 - 5, this.tileSize*0.8, 5);
        g.generateTexture('sneaker', this.tileSize*0.8, this.tileSize/2);

        g.clear(); g.fillStyle(0xfcca46); g.fillRect(0, 10, 20, 15);
        g.fillRect(3, 5, 5, 5); g.fillRect(12, 5, 5, 5);
        g.generateTexture('lego', 20, 25);

        g.clear(); g.fillStyle(0x028090); g.fillRect(0, 0, 30, 20);
        g.fillStyle(0xffffff); g.fillRect(2, 2, 26, 16);
        g.generateTexture('book', 30, 20);
    }
    create() {
        this.cameras.main.setBackgroundColor('#87CEEB');
        
        // CORREÇÃO: Permite que o jogador caia para fora da tela (removendo colisão no chão do mundo)
        this.physics.world.setBoundsCollision(true, true, true, false);

        this.platforms = this.physics.add.staticGroup();
        this.obstacles = this.physics.add.group({ allowGravity: false, immovable: true });
        this.tvs = this.physics.add.staticGroup();

        this.loadLevel();

        this.player = new Player(this, 50, 50, this.character);
        this.player.body.setCollideWorldBounds(true);

        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.overlap(this.player, this.tvs, this.winLevel, null, this);
        this.physics.add.collider(this.player, this.obstacles, this.hitObstacle, null, this);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        const levelData = levels[this.levelIndex];
        this.add.text(10, 10, levelData.text, { fontSize: '20px', fill: '#000', fontFamily: 'monospace', fontStyle: 'bold' });
        this.add.text(10, 40, `Fase ${this.levelIndex + 1}/10`, { fontSize: '16px', fill: '#000', fontFamily: 'monospace' });
        this.add.text(10, 60, `Vidas: ${this.lives}`, { fontSize: '18px', fill: '#d90429', fontFamily: 'monospace', fontStyle: 'bold' });

        this.createVirtualControls();
    }
    createVirtualControls() {
        this.leftPressed = false;
        this.rightPressed = false;
        this.jumpPressed = false;

        const btnLeft = this.add.rectangle(60, 400, 80, 80, 0xffffff, 0.5).setInteractive();
        btnLeft.setScrollFactor(0);
        this.add.text(60, 400, '<', { fontSize: '32px', fill: '#000', fontStyle: 'bold' }).setOrigin(0.5).setScrollFactor(0);
        btnLeft.on('pointerdown', () => this.leftPressed = true);
        btnLeft.on('pointerup', () => this.leftPressed = false);
        btnLeft.on('pointerout', () => this.leftPressed = false);

        const btnRight = this.add.rectangle(160, 400, 80, 80, 0xffffff, 0.5).setInteractive();
        btnRight.setScrollFactor(0);
        this.add.text(160, 400, '>', { fontSize: '32px', fill: '#000', fontStyle: 'bold' }).setOrigin(0.5).setScrollFactor(0);
        btnRight.on('pointerdown', () => this.rightPressed = true);
        btnRight.on('pointerup', () => this.rightPressed = false);
        btnRight.on('pointerout', () => this.rightPressed = false);

        const btnJump = this.add.rectangle(740, 400, 80, 80, 0xffffff, 0.5).setInteractive();
        btnJump.setScrollFactor(0);
        this.add.text(740, 400, '^', { fontSize: '32px', fill: '#000', fontStyle: 'bold' }).setOrigin(0.5).setScrollFactor(0);
        btnJump.on('pointerdown', () => this.jumpPressed = true);
        btnJump.on('pointerup', () => this.jumpPressed = false);
        btnJump.on('pointerout', () => this.jumpPressed = false);
    }
    loadLevel() {
        const levelData = levels[this.levelIndex];
        const map = levelData.map;
        for (let y = 0; y < map.length; y++) {
            const row = map[y];
            for (let x = 0; x < row.length; x++) {
                const char = row[x];
                const px = x * this.tileSize + (this.tileSize / 2);
                const py = y * this.tileSize + (this.tileSize / 2) + 100;
                if (char === '1') { this.platforms.create(px, py, 'floor'); }
                else if (char === '2') { this.tvs.create(px, py, 'tv'); }
                else if (char === '3') { 
                    const obs = this.obstacles.create(px, py + 10, 'sneaker'); 
                    obs.body.setSize(obs.width*0.8, obs.height*0.8); 
                }
                else if (char === '4') { const obs = this.obstacles.create(px, py, 'lego'); obs.body.setSize(obs.width*0.8, obs.height*0.8); }
                else if (char === '5') { const obs = this.obstacles.create(px, py, 'book'); obs.body.setSize(obs.width*0.8, obs.height*0.8); }
            }
        }
    }
    update(time, delta) {
        if (this.isDead || !this.player || !this.player.body) return;
        
        const accel = 800;
        
        if (this.cursors.left.isDown || this.leftPressed) { 
            this.player.body.setAccelerationX(-accel); 
        }
        else if (this.cursors.right.isDown || this.rightPressed) { 
            this.player.body.setAccelerationX(accel); 
        }
        else { 
            this.player.body.setAccelerationX(0); 
        }

        const isJumpIntent = this.cursors.up.isDown || this.spaceKey.isDown || this.jumpPressed;
        if (isJumpIntent && (this.player.body.touching.down || this.player.body.blocked.down)) {
            const jumpSpeed = this.character === 'girl' ? -550 : -500;
            this.player.body.setVelocityY(jumpSpeed);
            SoundManager.playJump();
            this.jumpPressed = false;
        }

        if (this.player.y > 600) { this.die(); }

        this.player.updateAnim(time, delta);
    }
    
    hitObstacle(player, obstacle) {
        this.die();
    }
    
    die() {
        if (this.isDead) return;
        this.isDead = true;
        
        SoundManager.playDeath();
        
        this.lives--;
        
        // Pausa física e pinta de vermelho para indicar morte
        this.physics.pause();
        this.player.each(child => child.setTint(0xff0000));
        
        this.time.delayedCall(800, () => {
            if (this.lives > 0) {
                this.scene.restart({ character: this.character, level: this.levelIndex + 1, lives: this.lives });
            } else {
                this.scene.start('MenuScene');
            }
        });
    }

    winLevel() {
        if (this.isDead) return;
        if (this.levelIndex + 1 < levels.length) {
            this.scene.start('GameScene', { character: this.character, level: this.levelIndex + 2, lives: this.lives });
        } else {
            this.scene.start('MenuScene');
        }
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 450,
    parent: 'game-container',
    pixelArt: true,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1000 },
            debug: false
        }
    },
    scene: [MenuScene, GameScene]
};

const game = new Phaser.Game(config);
