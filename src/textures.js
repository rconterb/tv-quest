// Cenário estilo aquarela Ghibli — contornos suaves, cores quentes, sem pixel hard
import { TILE } from './levels.js';

const INK = 0x6b5344; // traço marrom suave

export function gradientStrips(g, x, y, w, h, topColor, bottomColor, steps = 28) {
    const top = Phaser.Display.Color.ValueToColor(topColor);
    const bottom = Phaser.Display.Color.ValueToColor(bottomColor);
    const stripH = h / steps;
    for (let i = 0; i < steps; i++) {
        const c = Phaser.Display.Color.Interpolate.ColorWithColor(top, bottom, steps - 1, i);
        g.fillStyle(Phaser.Display.Color.GetColor(c.r, c.g, c.b));
        g.fillRect(x, y + i * stripH, w, stripH + 1);
    }
}

export function generateTextures(scene) {
    // bump versão quando o pack de texturas muda (força regenerar)
    if (scene.textures.exists('texpack_v4')) return;
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    const T = TILE;

    g.clear(); g.fillStyle(0xffffff); g.fillRect(0, 0, 10, 10);
    g.generateTexture('px', 10, 10);

    // ---------- blocos de chão (madeira/azulejo com volume) ----------
    const block = (key, base, dark, light) => {
        g.clear();
        g.fillStyle(base); g.fillRoundedRect(0, 0, T, T, 4);
        // face superior iluminada
        g.fillStyle(light, 0.65); g.fillRoundedRect(2, 2, T - 4, 10, 3);
        // sombra inferior
        g.fillStyle(0x000000, 0.12); g.fillRect(0, T - 8, T, 8);
        g.fillStyle(dark, 0.3); g.fillRect(3, T - 14, T - 6, 5);
        // veios / junta
        g.lineStyle(1.1, dark, 0.28);
        g.lineBetween(6, 18, T - 6, 20);
        g.lineBetween(8, 30, T - 8, 28);
        g.lineBetween(10, 40, T - 10, 42);
        g.lineStyle(1.4, INK, 0.28);
        g.strokeRoundedRect(0.5, 0.5, T - 1, T - 1, 4);
        g.generateTexture(key, T, T);
    };
    block('block_wood',   0xc4a574, 0x9a7548, 0xe2c89a);
    block('block_carpet', 0x7a9fd4, 0x5a7fb4, 0xa8c4ec);
    block('block_tile',   0xe8e4d8, 0xc8c2b4, 0xf6f3ea);
    block('block_desk',   0xa88860, 0x806848, 0xc8a878);
    block('block_attic',  0x8a7a72, 0x6a5a52, 0xa89890);

    // ---------- TV ----------
    const tv = (key, on) => {
        g.clear();
        g.lineStyle(2.5, 0x8a8a96, 0.8);
        g.lineBetween(42, 14, 22, 2); g.lineBetween(42, 14, 62, 2);
        g.fillStyle(0x8a8a96); g.fillCircle(22, 2, 2.5); g.fillCircle(62, 2, 2.5);
        g.fillStyle(0x5a5a68);
        g.fillRoundedRect(4, 14, 76, 50, 10);
        g.fillStyle(0x7a7a88, 0.5);
        g.fillRoundedRect(6, 16, 72, 8, { tl: 8, tr: 8, bl: 0, br: 0 });
        if (on) {
            gradientStrips(g, 12, 26, 50, 32, 0xb8f0ff, 0x7ad4f0, 8);
            g.fillStyle(0xffffff, 0.7); g.fillCircle(34, 40, 7);
            g.fillStyle(0xfff3c0, 0.55); g.fillEllipse(48, 38, 10, 14);
        } else {
            g.fillStyle(0x2a3048); g.fillRoundedRect(12, 26, 50, 32, 6);
            g.fillStyle(0x4a5578, 0.4); g.fillRect(16, 28, 8, 26);
        }
        g.lineStyle(1.5, INK, 0.4); g.strokeRoundedRect(4, 14, 76, 50, 10);
        g.fillStyle(0x9a9aa8); g.fillCircle(70, 32, 3.5); g.fillCircle(70, 46, 3.5);
        g.fillStyle(0x4a4a58); g.fillRect(14, 64, 10, 5); g.fillRect(60, 64, 10, 5);
        g.generateTexture(key, 84, 72);
    };
    tv('tv_off', false);
    tv('tv_on', true);

    // ---------- perigos (mais arredondados) ----------
    g.clear();
    g.fillStyle(0xe85a4f); g.fillRoundedRect(0, 4, 36, 14, { tl: 8, tr: 4, bl: 0, br: 0 });
    g.fillRoundedRect(24, 0, 18, 18, 8);
    g.fillStyle(0xf5f0e8); g.fillRoundedRect(0, 15, 44, 7, { bl: 4, br: 4, tl: 0, tr: 0 });
    g.fillStyle(0xffffff, 0.6); g.fillRect(6, 8, 3, 4); g.fillRect(13, 8, 3, 4);
    g.lineStyle(1.4, INK, 0.35); g.strokeRoundedRect(0.5, 0.5, 43, 21, 5);
    g.generateTexture('sneaker', 44, 22);

    const lego = (key, color, dark) => {
        g.clear();
        g.fillStyle(color); g.fillRoundedRect(0, 8, 26, 14, 4);
        g.fillRoundedRect(3, 2, 7, 7, 3); g.fillRoundedRect(15, 2, 7, 7, 3);
        g.fillStyle(dark, 0.35); g.fillRect(0, 18, 26, 4);
        g.lineStyle(1.2, INK, 0.3); g.strokeRoundedRect(0, 8, 26, 14, 4);
        g.generateTexture(key, 26, 22);
    };
    lego('lego_red', 0xef6b6b, 0xc44a4a);
    lego('lego_blue', 0x5b8fdb, 0x3d6fb4);

    g.clear();
    g.fillStyle(0xb07cc8); g.fillRoundedRect(0, 8, 38, 8, 3);
    g.fillStyle(0xf0e8f8); g.fillRect(34, 9, 3, 6);
    g.fillStyle(0xf0a84a); g.fillRoundedRect(4, 0, 30, 8, 3);
    g.fillStyle(0xfff4e0); g.fillRect(30, 1, 3, 6);
    g.lineStyle(1.2, INK, 0.3);
    g.strokeRoundedRect(0, 8, 38, 8, 3); g.strokeRoundedRect(4, 0, 30, 8, 3);
    g.generateTexture('book', 38, 16);

    // ---------- estrela ----------
    g.clear();
    const pts = [];
    for (let i = 0; i < 10; i++) {
        const ang = -Math.PI / 2 + i * Math.PI / 5;
        const r = i % 2 === 0 ? 11 : 4.5;
        pts.push({ x: 12 + Math.cos(ang) * r, y: 12 + Math.sin(ang) * r });
    }
    g.fillStyle(0xffd66b); g.fillPoints(pts, true);
    g.fillStyle(0xfff3b0, 0.7); g.fillCircle(12, 11, 3);
    g.lineStyle(1.4, 0xd4a020, 0.5); g.strokePoints(pts, true);
    g.generateTexture('star', 24, 24);

    // ---------- robô ----------
    g.clear();
    g.fillStyle(0x6a7080); g.fillRoundedRect(2, 24, 30, 8, 4);
    g.fillStyle(0x9aa3b0); g.fillCircle(8, 28, 3); g.fillCircle(17, 28, 3); g.fillCircle(26, 28, 3);
    g.fillStyle(0xc5cdd8); g.fillRoundedRect(4, 8, 26, 16, 6);
    g.fillStyle(0xe0e6ee, 0.6); g.fillRoundedRect(5, 9, 24, 5, 3);
    g.fillStyle(0xffffff); g.fillEllipse(12, 15, 7, 8); g.fillEllipse(22, 15, 7, 8);
    g.fillStyle(0xff6b7a); g.fillCircle(12, 16, 2.2); g.fillCircle(22, 16, 2.2);
    g.fillStyle(0xffffff); g.fillCircle(11.3, 15.2, 0.8); g.fillCircle(21.3, 15.2, 0.8);
    g.lineStyle(2, 0x8a92a0); g.lineBetween(17, 8, 17, 2);
    g.fillStyle(0xff6b7a); g.fillCircle(17, 2, 2.5);
    g.lineStyle(1.3, INK, 0.3); g.strokeRoundedRect(4, 8, 26, 16, 6);
    g.generateTexture('robot', 34, 32);

    // ---------- mola / plataforma ----------
    g.clear();
    g.fillStyle(0xff8aab); g.fillRoundedRect(2, 4, 40, 12, 6);
    g.fillStyle(0xffb3c9, 0.7); g.fillRoundedRect(3, 5, 38, 5, 4);
    g.fillStyle(0xe06088); g.fillCircle(22, 10, 2.5);
    g.fillStyle(0xd44d74, 0.6); g.fillRoundedRect(0, 15, 44, 3, 1);
    g.generateTexture('cushion', 44, 18);

    g.clear();
    g.fillStyle(0xd4a86a); g.fillRoundedRect(0, 0, 96, 14, 6);
    g.fillStyle(0xe8c48a, 0.7); g.fillRoundedRect(2, 1, 92, 5, 4);
    g.fillStyle(0xb88848, 0.4); g.fillRect(2, 10, 92, 3);
    g.fillStyle(0x8a8a96); g.fillCircle(10, 7, 2); g.fillCircle(86, 7, 2);
    g.generateTexture('platform', 96, 14);

    // ---------- HUD ----------
    const heart = (key, color) => {
        g.clear();
        g.fillStyle(color);
        g.fillCircle(5, 6, 5); g.fillCircle(13, 6, 5);
        g.fillTriangle(1, 9, 17, 9, 9, 17);
        g.fillStyle(0xffffff, 0.45); g.fillCircle(5, 4.5, 1.6);
        g.generateTexture(key, 18, 18);
    };
    heart('heart', 0xff6b8a);
    heart('heart_empty', 0xb0a8b8);

    g.clear();
    g.fillStyle(0xffffff, 0.85); g.fillCircle(4, 4, 3.2);
    g.generateTexture('dust', 8, 8);

    g.clear();
    g.fillStyle(0xfff0b0);
    g.fillCircle(5.5, 5.5, 2.5);
    g.fillStyle(0xffffff, 0.7); g.fillCircle(4.5, 4.5, 1);
    g.generateTexture('spark', 11, 11);

    g.clear();
    g.fillStyle(0xffffff); g.fillRoundedRect(0, 0, 8, 5, 2);
    g.generateTexture('confetti', 8, 5);

    // ---------- papel de parede (floral + listras suaves) ----------
    g.clear();
    g.fillStyle(0xffffff, 0.08); g.fillRect(0, 0, 72, 72);
    g.fillStyle(0xffffff, 0.18);
    for (const [x, y] of [[14, 16], [48, 20], [30, 42], [56, 52], [10, 54], [40, 10]]) {
        g.fillCircle(x, y, 2.4);
        g.fillCircle(x - 3.5, y + 1, 1.5);
        g.fillCircle(x + 3.5, y + 1, 1.5);
        g.fillCircle(x, y + 3.5, 1.3);
    }
    g.fillStyle(0x000000, 0.03);
    g.fillRect(0, 0, 2, 72); g.fillRect(36, 0, 1, 72);
    g.generateTexture('wallpaper', 72, 72);

    // ---------- rodapé madeira ----------
    g.clear();
    g.fillStyle(0xb89568); g.fillRect(0, 0, 64, 14);
    g.fillStyle(0xd4b888, 0.55); g.fillRect(0, 0, 64, 4);
    g.fillStyle(0x000000, 0.12); g.fillRect(0, 11, 64, 3);
    g.fillStyle(0x8a6a40, 0.35); g.fillRect(0, 5, 64, 1);
    g.generateTexture('wainscot', 64, 14);

    // ---------- chão de tábua (tile de fundo) ----------
    g.clear();
    g.fillStyle(0xc4a070); g.fillRect(0, 0, 96, 32);
    g.fillStyle(0xd8b888, 0.35); g.fillRect(0, 0, 96, 6);
    g.lineStyle(1, 0x8a6a40, 0.25);
    g.lineBetween(0, 16, 96, 16);
    g.lineBetween(32, 0, 32, 32); g.lineBetween(64, 0, 64, 32);
    g.fillStyle(0x000000, 0.08); g.fillRect(0, 28, 96, 4);
    g.generateTexture('floorboard', 96, 32);

    // ---------- cortina ----------
    g.clear();
    g.fillStyle(0xe07070); g.fillRoundedRect(0, 0, 36, 120, 4);
    g.fillStyle(0xf09090, 0.5);
    for (let i = 0; i < 4; i++) g.fillRect(4 + i * 8, 8, 4, 100);
    g.fillStyle(0xc05050); g.fillRect(0, 0, 36, 10);
    g.fillStyle(0xffd080); g.fillCircle(8, 6, 3); g.fillCircle(28, 6, 3);
    g.generateTexture('curtain', 36, 120);

    // ---------- janela realista (vidro + reflexo + sol) ----------
    g.clear();
    g.fillStyle(0xa88860); g.fillRoundedRect(0, 0, 130, 150, 6);
    // céu
    gradientStrips(g, 10, 12, 110, 126, 0x8ec8f0, 0xffe8c0, 14);
    // nuvens
    g.fillStyle(0xffffff, 0.55);
    g.fillEllipse(40, 50, 28, 12); g.fillEllipse(55, 48, 18, 10);
    g.fillEllipse(90, 90, 22, 10);
    // sol
    g.fillStyle(0xffe08a, 0.85); g.fillCircle(100, 40, 14);
    g.fillStyle(0xfff6c8, 0.5); g.fillCircle(100, 40, 8);
    // travessas
    g.fillStyle(0xa88860); g.fillRect(62, 12, 8, 126); g.fillRect(10, 72, 110, 8);
    // reflexo vidro
    g.fillStyle(0xffffff, 0.2);
    g.fillRoundedRect(18, 20, 30, 40, 4);
    // peitoril
    g.fillStyle(0xc4a070); g.fillRect(4, 138, 122, 10);
    g.fillStyle(0x000000, 0.1); g.fillRect(4, 145, 122, 3);
    g.lineStyle(1.5, INK, 0.25); g.strokeRoundedRect(0, 0, 130, 150, 6);
    g.generateTexture('window', 130, 150);

    // ---------- sofá volumoso ----------
    g.clear();
    g.fillStyle(0x000000, 0.12); g.fillEllipse(80, 72, 70, 10); // sombra
    g.fillStyle(0xc87868); g.fillRoundedRect(14, 8, 132, 36, 12);
    g.fillStyle(0xe09888, 0.55); g.fillRoundedRect(20, 12, 50, 14, 6);
    g.fillStyle(0xd89080); g.fillRoundedRect(0, 36, 160, 30, 10);
    g.fillStyle(0xc87868); g.fillRoundedRect(0, 28, 28, 44, 12); g.fillRoundedRect(132, 28, 28, 44, 12);
    g.fillStyle(0xb06050, 0.35); g.fillRect(78, 40, 5, 20);
    g.fillStyle(0xa08050); g.fillRect(16, 70, 12, 8); g.fillRect(132, 70, 12, 8);
    g.fillStyle(0xf0d0c0, 0.4); g.fillEllipse(50, 48, 22, 10); g.fillEllipse(110, 48, 22, 10);
    g.generateTexture('sofa', 160, 80);

    // ---------- planta com vaso e folhas ----------
    g.clear();
    g.fillStyle(0x000000, 0.1); g.fillEllipse(28, 82, 18, 6);
    g.fillStyle(0x4a8a58); g.fillEllipse(26, 28, 20, 18);
    g.fillStyle(0x68b078); g.fillEllipse(12, 40, 16, 14); g.fillEllipse(40, 38, 16, 14);
    g.fillStyle(0x3d7a4a); g.fillEllipse(26, 48, 14, 12);
    g.fillStyle(0x88c898, 0.5); g.fillEllipse(20, 24, 8, 6);
    g.fillStyle(0xc89860); g.fillRoundedRect(14, 56, 28, 28, { tl: 3, tr: 3, bl: 10, br: 10 });
    g.fillStyle(0xa87840, 0.45); g.fillRect(14, 56, 28, 7);
    g.fillStyle(0xe0c090, 0.3); g.fillRect(18, 64, 8, 12);
    g.generateTexture('plant', 56, 88);

    // ---------- abajur com glow ----------
    g.clear();
    g.fillStyle(0xffe8b0, 0.25); g.fillEllipse(20, 28, 28, 20);
    g.fillStyle(0xffd890); g.fillTriangle(4, 40, 36, 40, 30, 6);
    g.fillTriangle(4, 40, 10, 6, 30, 6);
    g.fillStyle(0xfff6d0, 0.45); g.fillTriangle(12, 36, 28, 36, 24, 12);
    g.fillStyle(0x9090a0); g.fillRect(18, 40, 5, 50);
    g.fillStyle(0xb0b0c0); g.fillRoundedRect(6, 90, 28, 8, 3);
    g.generateTexture('lamp', 42, 100);

    // ---------- estante com livros e objetos ----------
    g.clear();
    g.fillStyle(0x000000, 0.1); g.fillEllipse(55, 142, 48, 8);
    g.fillStyle(0xb89060); g.fillRoundedRect(0, 0, 110, 140, 5);
    g.fillStyle(0x9a7848);
    g.fillRect(8, 10, 94, 34); g.fillRect(8, 52, 94, 34); g.fillRect(8, 94, 94, 34);
    const bookColors = [0xef7a7a, 0x6a9adb, 0xffd66b, 0x7aba6a, 0xb07cc8, 0xf0a84a, 0x70c0c0];
    for (let shelfIdx = 0; shelfIdx < 3; shelfIdx++) {
        const by = 10 + shelfIdx * 42;
        for (let bi = 0; bi < 6; bi++) {
            const h = 20 + (bi % 3) * 3;
            g.fillStyle(bookColors[(bi + shelfIdx * 2) % bookColors.length]);
            g.fillRoundedRect(12 + bi * 15, by + 30 - h, 11, h, 2);
            g.fillStyle(0xffffff, 0.2); g.fillRect(13 + bi * 15, by + 30 - h, 3, h);
        }
    }
    g.fillStyle(0xd8b888, 0.4); g.fillRect(0, 0, 110, 6);
    g.lineStyle(1.2, INK, 0.22); g.strokeRoundedRect(0, 0, 110, 140, 5);
    g.generateTexture('shelf', 110, 144);

    // ---------- geladeira ----------
    g.clear();
    g.fillStyle(0x000000, 0.1); g.fillEllipse(32, 122, 28, 6);
    g.fillStyle(0xeef4f6); g.fillRoundedRect(0, 0, 64, 120, 8);
    g.fillStyle(0xffffff, 0.5); g.fillRoundedRect(4, 4, 20, 100, 4);
    g.fillStyle(0xd0dce0); g.fillRect(0, 48, 64, 5);
    g.fillStyle(0xa8b4b8); g.fillRoundedRect(50, 16, 7, 22, 2); g.fillRoundedRect(50, 60, 7, 34, 2);
    g.fillStyle(0x8ec8e8, 0.25); g.fillRoundedRect(8, 12, 36, 28, 4); // ímãs / papel
    g.lineStyle(1.2, INK, 0.18); g.strokeRoundedRect(0, 0, 64, 120, 8);
    g.generateTexture('fridge', 64, 124);

    // ---------- mesa com toalha ----------
    g.clear();
    g.fillStyle(0x000000, 0.1); g.fillEllipse(65, 62, 55, 8);
    g.fillStyle(0xc4a070); g.fillRoundedRect(0, 0, 130, 16, 5);
    g.fillStyle(0xe8d0a0, 0.5); g.fillRect(2, 2, 126, 5);
    g.fillStyle(0xf0e8d8, 0.7); g.fillRoundedRect(20, 4, 90, 10, 3); // toalha
    g.fillStyle(0xa88850); g.fillRect(12, 16, 10, 46); g.fillRect(108, 16, 10, 46);
    g.fillStyle(0xef7a7a); g.fillCircle(65, 8, 5); // fruteira
    g.fillStyle(0xffd66b); g.fillCircle(72, 6, 4);
    g.generateTexture('table', 130, 64);

    // ---------- caixa ----------
    g.clear();
    g.fillStyle(0x000000, 0.1); g.fillEllipse(32, 54, 28, 6);
    g.fillStyle(0xd4b080); g.fillRoundedRect(0, 6, 64, 46, 5);
    g.fillStyle(0xc09860); g.fillRect(0, 6, 64, 10);
    g.fillStyle(0xead4a8); g.fillRect(28, 6, 8, 46);
    g.fillStyle(0xb89058, 0.45); g.fillRoundedRect(8, 24, 18, 12, 2);
    g.fillStyle(0xffffff, 0.25); g.fillRect(4, 10, 20, 4);
    g.generateTexture('box', 64, 56);

    // ---------- botão touch ----------
    g.clear();
    g.fillStyle(0xffffff, 0.88); g.fillCircle(42, 42, 40);
    g.lineStyle(3, 0x6b5344, 0.35); g.strokeCircle(42, 42, 40);
    g.generateTexture('btn', 84, 84);

    // marcador de versão do pack
    g.clear(); g.fillStyle(0); g.fillRect(0, 0, 1, 1);
    g.generateTexture('texpack_v4', 1, 1);

    g.destroy();
}
