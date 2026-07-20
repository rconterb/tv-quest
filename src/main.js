import { MenuScene } from './scenes/MenuScene.js';
import { GameScene } from './scenes/GameScene.js';
import { VictoryScene } from './scenes/VictoryScene.js';

const config = {
    // ?canvas na URL força o renderer Canvas (útil para depurar/capturar tela)
    type: new URLSearchParams(location.search).has('canvas') ? Phaser.CANVAS : Phaser.AUTO,
    width: 960,
    height: 540,
    parent: 'game-container',
    // sprites Ghibli suaves (não pixel art)
    pixelArt: false,
    roundPixels: false,
    antialias: true,
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
            // valor base; GameScene aplica PHYS.gravity (src/physics.js)
            gravity: { y: 1350 },
            debug: false
        }
    },
    scene: [MenuScene, GameScene, VictoryScene]
};

// Nunca cria duas instâncias do jogo na mesma página
if (!window.__tvquestGame) {
    window.__tvquestGame = new Phaser.Game(config);
}
