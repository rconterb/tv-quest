import { MenuScene } from './scenes/MenuScene.js';
import { GameScene } from './scenes/GameScene.js';
import { VictoryScene } from './scenes/VictoryScene.js';

const config = {
    // ?canvas na URL força o renderer Canvas (útil para depurar/capturar tela)
    type: new URLSearchParams(location.search).has('canvas') ? Phaser.CANVAS : Phaser.AUTO,
    width: 960,
    height: 540,
    parent: 'game-container',
    pixelArt: true,
    roundPixels: true, // evita subpixel shimmer em sprites pixel art
    antialias: false,
    fps: {
        target: 60,
        forceSetTimeOut: false
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1400 },
            debug: false
        }
    },
    scene: [MenuScene, GameScene, VictoryScene]
};

// Nunca cria duas instâncias do jogo na mesma página
if (!window.__tvquestGame) {
    window.__tvquestGame = new Phaser.Game(config);
}
