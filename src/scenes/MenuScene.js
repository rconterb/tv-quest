export class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        // Fundo escuro (estilo 8-bit night)
        this.cameras.main.setBackgroundColor('#1a1a2e');

        this.add.text(400, 100, 'EM BUSCA DA TV', {
            fontSize: '48px',
            fill: '#ffb703',
            fontFamily: 'monospace',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(400, 180, 'Escolha seu personagem:', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'monospace'
        }).setOrigin(0.5);

        // Criar textura para botão se não existir
        let g = this.make.graphics({x: 0, y: 0, add: false});

        // Botão Menino (Azul)
        let boyBg = this.add.rectangle(250, 300, 200, 80, 0x023047).setInteractive({ useHandCursor: true });
        boyBg.setStrokeStyle(4, 0x8ecae6);
        this.add.text(250, 300, 'MENINO (4a)', { 
            fontSize: '24px', fill: '#8ecae6', fontFamily: 'monospace', fontStyle: 'bold' 
        }).setOrigin(0.5);
        boyBg.on('pointerdown', () => this.startGame('boy'));
        boyBg.on('pointerover', () => boyBg.setFillStyle(0x219ebc));
        boyBg.on('pointerout', () => boyBg.setFillStyle(0x023047));

        // Botão Menina (Rosa)
        let girlBg = this.add.rectangle(550, 300, 200, 80, 0x4a0033).setInteractive({ useHandCursor: true });
        girlBg.setStrokeStyle(4, 0xffb703);
        this.add.text(550, 300, 'MENINA (8a)', { 
            fontSize: '24px', fill: '#ffb703', fontFamily: 'monospace', fontStyle: 'bold' 
        }).setOrigin(0.5);
        girlBg.on('pointerdown', () => this.startGame('girl'));
        girlBg.on('pointerover', () => girlBg.setFillStyle(0x8a005c));
        girlBg.on('pointerout', () => girlBg.setFillStyle(0x4a0033));
    }

    startGame(character) {
        this.scene.start('GameScene', { character: character, level: 1 });
    }
}
