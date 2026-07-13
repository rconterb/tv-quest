import { levels } from '../levels/LevelData.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.tileSize = 40;
    }

    init(data) {
        this.character = data.character || 'boy'; // 'boy' or 'girl'
        this.levelIndex = data.level ? data.level - 1 : 0;
    }

    preload() {
        // Gera as texturas simples "pixeladas" usando Graphics
        this.createTextures();
    }

    createTextures() {
        const g = this.make.graphics({x: 0, y: 0, add: false});

        // Chão (1)
        g.clear();
        g.fillStyle(0x4a4e69); // cor de pedra/cimento
        g.fillRect(0, 0, this.tileSize, this.tileSize);
        g.lineStyle(2, 0x22223b);
        g.strokeRect(0, 0, this.tileSize, this.tileSize);
        g.generateTexture('floor', this.tileSize, this.tileSize);

        // Menino (Azulzinho)
        g.clear();
        g.fillStyle(0x0077b6);
        g.fillRect(0, 0, this.tileSize * 0.7, this.tileSize * 0.9);
        g.fillStyle(0xffd6a5); // rosto
        g.fillRect(5, 5, 18, 12);
        g.generateTexture('boy', this.tileSize * 0.7, this.tileSize * 0.9);

        // Menina (Rosinha)
        g.clear();
        g.fillStyle(0x9d4edd);
        g.fillRect(0, 0, this.tileSize * 0.7, this.tileSize * 0.9);
        g.fillStyle(0xffd6a5); // rosto
        g.fillRect(5, 5, 18, 12);
        g.generateTexture('girl', this.tileSize * 0.7, this.tileSize * 0.9);

        // TV (Goal) (2)
        g.clear();
        g.fillStyle(0x2b2d42); // caixa
        g.fillRect(0, 0, this.tileSize, this.tileSize);
        g.fillStyle(0xedf2f4); // tela
        g.fillRect(5, 5, this.tileSize-10, this.tileSize-15);
        g.fillStyle(0x000000); // base
        g.fillRect(15, this.tileSize-10, 10, 10);
        g.generateTexture('tv', this.tileSize, this.tileSize);

        // Tênis (3)
        g.clear();
        g.fillStyle(0xd90429);
        g.fillRect(0, this.tileSize/2, this.tileSize*0.8, this.tileSize/2);
        g.fillStyle(0xffffff);
        g.fillRect(0, this.tileSize-5, this.tileSize*0.8, 5); // sola
        g.generateTexture('sneaker', this.tileSize*0.8, this.tileSize/2);

        // Lego (4)
        g.clear();
        g.fillStyle(0xfcca46);
        g.fillRect(0, 10, 20, 15);
        g.fillRect(3, 5, 5, 5); // pino
        g.fillRect(12, 5, 5, 5); // pino
        g.generateTexture('lego', 20, 25);

        // Livro (5)
        g.clear();
        g.fillStyle(0x028090);
        g.fillRect(0, 0, 30, 20);
        g.fillStyle(0xffffff);
        g.fillRect(2, 2, 26, 16);
        g.generateTexture('book', 30, 20);
    }

    create() {
        this.cameras.main.setBackgroundColor('#87CEEB'); // Céu azul claro
        
        this.platforms = this.physics.add.staticGroup();
        this.obstacles = this.physics.add.group({ allowGravity: false, immovable: true });
        this.tvs = this.physics.add.staticGroup();

        this.loadLevel();

        // Player
        this.player = this.physics.add.sprite(50, 50, this.character);
        this.player.setCollideWorldBounds(true);
        // Diminui um pouco o hitbox para ficar mais justo
        this.player.body.setSize(this.player.width * 0.8, this.player.height * 0.9);

        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.overlap(this.player, this.tvs, this.winLevel, null, this);
        this.physics.add.collider(this.player, this.obstacles, this.hitObstacle, null, this);

        // Controles de teclado
        this.cursors = this.input.keyboard.createCursorKeys();

        // UI Text
        const levelData = levels[this.levelIndex];
        this.add.text(10, 10, levelData.text, { fontSize: '20px', fill: '#000', fontFamily: 'monospace', fontStyle: 'bold' });
        
        // Fase info
        this.add.text(10, 40, `Fase ${this.levelIndex + 1}/10`, { fontSize: '16px', fill: '#000', fontFamily: 'monospace' });

        this.createVirtualControls();
    }

    createVirtualControls() {
        this.leftPressed = false;
        this.rightPressed = false;
        this.jumpPressed = false;

        // Botão Esquerda
        const btnLeft = this.add.rectangle(60, 400, 80, 80, 0xffffff, 0.5).setInteractive();
        btnLeft.setScrollFactor(0);
        this.add.text(60, 400, '<', { fontSize: '32px', fill: '#000', fontStyle: 'bold' }).setOrigin(0.5).setScrollFactor(0);
        btnLeft.on('pointerdown', () => this.leftPressed = true);
        btnLeft.on('pointerup', () => this.leftPressed = false);
        btnLeft.on('pointerout', () => this.leftPressed = false);

        // Botão Direita
        const btnRight = this.add.rectangle(160, 400, 80, 80, 0xffffff, 0.5).setInteractive();
        btnRight.setScrollFactor(0);
        this.add.text(160, 400, '>', { fontSize: '32px', fill: '#000', fontStyle: 'bold' }).setOrigin(0.5).setScrollFactor(0);
        btnRight.on('pointerdown', () => this.rightPressed = true);
        btnRight.on('pointerup', () => this.rightPressed = false);
        btnRight.on('pointerout', () => this.rightPressed = false);

        // Botão Pulo
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
                const py = y * this.tileSize + (this.tileSize / 2) + 100; // offset Y to center map

                if (char === '1') {
                    this.platforms.create(px, py, 'floor');
                } else if (char === '2') {
                    this.tvs.create(px, py, 'tv');
                } else if (char === '3') {
                    const obs = this.obstacles.create(px, py, 'sneaker');
                    obs.body.setSize(obs.width*0.8, obs.height*0.8);
                } else if (char === '4') {
                    const obs = this.obstacles.create(px, py, 'lego');
                    obs.body.setSize(obs.width*0.8, obs.height*0.8);
                } else if (char === '5') {
                    const obs = this.obstacles.create(px, py, 'book');
                    obs.body.setSize(obs.width*0.8, obs.height*0.8);
                }
            }
        }
    }

    update() {
        if (!this.player || !this.player.body) return;

        const speed = 200;
        
        // Movimentação horizontal
        if (this.cursors.left.isDown || this.leftPressed) {
            this.player.setVelocityX(-speed);
        } else if (this.cursors.right.isDown || this.rightPressed) {
            this.player.setVelocityX(speed);
        } else {
            this.player.setVelocityX(0);
        }

        // Pulo
        if ((this.cursors.up.isDown || this.jumpPressed) && this.player.body.touching.down) {
            // Se for menina, o pulo pode ser um pouco maior, se quiser, mas vamos manter igual por agora
            const jumpSpeed = this.character === 'girl' ? -550 : -500;
            this.player.setVelocityY(jumpSpeed);
            this.jumpPressed = false; // reset to avoid holding
        }

        // Caiu do mapa (buraco)
        if (this.player.y > 600) {
            this.restartLevel();
        }
    }

    hitObstacle(player, obstacle) {
        this.restartLevel();
    }

    restartLevel() {
        // Efeito de morte rápido
        this.scene.restart();
    }

    winLevel() {
        if (this.levelIndex + 1 < levels.length) {
            this.scene.start('GameScene', { character: this.character, level: this.levelIndex + 2 });
        } else {
            // Zerou!
            this.scene.start('MenuScene');
        }
    }
}
