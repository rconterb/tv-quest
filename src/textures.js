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
    if (scene.textures.exists('block_wood')) return;
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    const T = TILE;

    g.clear(); g.fillStyle(0xffffff); g.fillRect(0, 0, 10, 10);
    g.generateTexture('px', 10, 10);

    // ---------- blocos de chão (madeira/azulejo suaves) ----------
    const block = (key, base, dark, light) => {
        g.clear();
        g.fillStyle(base); g.fillRoundedRect(1, 1, T - 2, T - 2, 6);
        g.fillStyle(light, 0.55); g.fillRoundedRect(3, 3, T - 6, 8, 4);
        g.fillStyle(dark, 0.25); g.fillRect(4, T - 12, T - 8, 6);
        // veios suaves
        g.lineStyle(1.2, dark, 0.22);
        g.lineBetween(8, 16, T - 8, 18);
        g.lineBetween(10, 28, T - 10, 26);
        g.lineStyle(1.5, INK, 0.35);
        g.strokeRoundedRect(1, 1, T - 2, T - 2, 6);
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

    // ---------- papel de parede (padrão floral sutil) ----------
    g.clear();
    g.fillStyle(0xffffff, 0.0); g.fillRect(0, 0, 64, 64);
    g.fillStyle(0xffffff, 0.22);
    for (const [x, y] of [[12, 14], [44, 18], [28, 40], [50, 48], [8, 50]]) {
        g.fillCircle(x, y, 2.2);
        g.fillCircle(x - 3, y + 1, 1.4);
        g.fillCircle(x + 3, y + 1, 1.4);
    }
    g.generateTexture('wallpaper', 64, 64);

    // ---------- rodapé / moldura de parede ----------
    g.clear();
    g.fillStyle(0xffffff, 0.15); g.fillRect(0, 0, 64, 8);
    g.fillStyle(0x000000, 0.06); g.fillRect(0, 6, 64, 2);
    g.generateTexture('wainscot', 64, 8);

    // ---------- janela (luz dourada Ghibli) ----------
    g.clear();
    g.fillStyle(0xc4a070); g.fillRoundedRect(0, 0, 120, 140, 8);
    gradientStrips(g, 10, 10, 100, 120, 0xb8e4ff, 0xfff0d0, 12);
    g.fillStyle(0xffffff, 0.55);
    g.fillRoundedRect(18, 28, 36, 10, 5);
    g.fillRoundedRect(30, 42, 40, 10, 5);
    g.fillStyle(0xffe08a, 0.7); g.fillCircle(88, 32, 12); // sol
    g.fillStyle(0xc4a070); g.fillRect(56, 10, 8, 120); g.fillRect(10, 66, 100, 8);
    g.fillStyle(0xe8c898, 0.5); g.fillRect(4, 4, 112, 6);
    g.lineStyle(1.5, INK, 0.3); g.strokeRoundedRect(0, 0, 120, 140, 8);
    g.generateTexture('window', 120, 140);

    // ---------- sofá ----------
    g.clear();
    g.fillStyle(0xd48a78); g.fillRoundedRect(12, 10, 136, 32, 10);
    g.fillStyle(0xe2a898); g.fillRoundedRect(0, 34, 160, 26, 8);
    g.fillStyle(0xd48a78); g.fillRoundedRect(0, 26, 26, 40, 10); g.fillRoundedRect(134, 26, 26, 40, 10);
    g.fillStyle(0xc07060, 0.4); g.fillRect(78, 38, 4, 18);
    g.fillStyle(0xb88860); g.fillRect(14, 66, 10, 8); g.fillRect(136, 66, 10, 8);
    g.fillStyle(0xf0d0c0, 0.35); g.fillRoundedRect(20, 14, 50, 12, 6);
    g.generateTexture('sofa', 160, 76);

    // ---------- quadro (aquarela paisagem — sem moldura “pixel”) ----------
    g.clear();
    g.fillStyle(0xd8c0a0); g.fillRoundedRect(0, 0, 64, 74, 5);
    gradientStrips(g, 6, 6, 52, 62, 0xc8e8f8, 0xf8e8c8, 10);
    g.fillStyle(0x8fbf6a, 0.85); g.fillEllipse(22, 52, 28, 16);
    g.fillStyle(0x6fa050, 0.8); g.fillEllipse(42, 54, 24, 14);
    g.fillStyle(0xffe08a, 0.75); g.fillCircle(44, 20, 7);
    g.fillStyle(0xe8d8c0, 0.5); g.fillRect(2, 2, 60, 5);
    g.lineStyle(1.4, INK, 0.25); g.strokeRoundedRect(0, 0, 64, 74, 5);
    g.generateTexture('painting', 64, 74);

    // ---------- planta ----------
    g.clear();
    g.fillStyle(0x5a9a6a); g.fillCircle(26, 24, 15);
    g.fillStyle(0x78b888); g.fillCircle(14, 34, 12); g.fillCircle(38, 34, 12);
    g.fillStyle(0x4a8a5a); g.fillCircle(26, 42, 11);
    g.fillStyle(0xc48a50); g.fillRoundedRect(14, 52, 24, 28, { tl: 3, tr: 3, bl: 8, br: 8 });
    g.fillStyle(0xa87040, 0.5); g.fillRect(14, 52, 24, 6);
    g.generateTexture('plant', 52, 84);

    // ---------- abajur ----------
    g.clear();
    g.fillStyle(0xffe0a0); g.fillTriangle(6, 36, 34, 36, 28, 4);
    g.fillTriangle(6, 36, 12, 4, 28, 4);
    g.fillStyle(0xfff3c8, 0.4); g.fillTriangle(12, 32, 28, 32, 24, 10);
    g.fillStyle(0xa0a0b0); g.fillRect(18, 36, 5, 52);
    g.fillRoundedRect(8, 88, 24, 8, 3);
    g.generateTexture('lamp', 40, 98);

    // ---------- estante ----------
    g.clear();
    g.fillStyle(0xc4a070); g.fillRoundedRect(0, 0, 110, 140, 6);
    g.fillStyle(0xa88850);
    g.fillRect(8, 10, 94, 32); g.fillRect(8, 52, 94, 32); g.fillRect(8, 94, 94, 32);
    const bookColors = [0xef7a7a, 0x6a9adb, 0xffd66b, 0x7aba6a, 0xb07cc8, 0xf0a84a];
    for (let shelfIdx = 0; shelfIdx < 3; shelfIdx++) {
        const by = 10 + shelfIdx * 42;
        for (let bi = 0; bi < 6; bi++) {
            g.fillStyle(bookColors[(bi + shelfIdx * 2) % bookColors.length]);
            g.fillRoundedRect(12 + bi * 15, by + 6, 11, 24, 2);
        }
    }
    g.lineStyle(1.3, INK, 0.25); g.strokeRoundedRect(0, 0, 110, 140, 6);
    g.generateTexture('shelf', 110, 140);

    // ---------- geladeira ----------
    g.clear();
    g.fillStyle(0xeef4f6); g.fillRoundedRect(0, 0, 64, 120, 8);
    g.fillStyle(0xd0dce0); g.fillRect(0, 46, 64, 4);
    g.fillStyle(0xa8b4b8); g.fillRoundedRect(50, 16, 6, 20, 2); g.fillRoundedRect(50, 58, 6, 32, 2);
    g.fillStyle(0xffffff, 0.5); g.fillRoundedRect(4, 4, 56, 10, 4);
    g.lineStyle(1.3, INK, 0.2); g.strokeRoundedRect(0, 0, 64, 120, 8);
    g.generateTexture('fridge', 64, 120);

    // ---------- mesa ----------
    g.clear();
    g.fillStyle(0xc4a070); g.fillRoundedRect(0, 0, 130, 14, 5);
    g.fillStyle(0xd8b888, 0.6); g.fillRect(2, 1, 126, 5);
    g.fillStyle(0xa88850); g.fillRect(10, 14, 10, 48); g.fillRect(110, 14, 10, 48);
    g.generateTexture('table', 130, 64);

    // ---------- caixa ----------
    g.clear();
    g.fillStyle(0xd4b080); g.fillRoundedRect(0, 6, 64, 46, 5);
    g.fillStyle(0xc09860); g.fillRect(0, 6, 64, 8);
    g.fillStyle(0xead4a8); g.fillRect(28, 6, 8, 46);
    g.fillStyle(0xb89058, 0.5); g.fillRoundedRect(8, 24, 18, 12, 2);
    g.generateTexture('box', 64, 52);

    // ---------- botão touch ----------
    g.clear();
    g.fillStyle(0xffffff, 0.88); g.fillCircle(42, 42, 40);
    g.lineStyle(3, 0x6b5344, 0.35); g.strokeCircle(42, 42, 40);
    g.generateTexture('btn', 84, 84);

    g.destroy();
}
