// Cenário aquarela Ghibli de alta fidelidade (procedural)
// Contornos suaves, cel shading, volume e luz quente
import { TILE } from './levels.js';

const INK = 0x5c4638;

export function gradientStrips(g, x, y, w, h, topColor, bottomColor, steps = 36) {
    const top = Phaser.Display.Color.ValueToColor(topColor);
    const bottom = Phaser.Display.Color.ValueToColor(bottomColor);
    const stripH = h / steps;
    for (let i = 0; i < steps; i++) {
        const c = Phaser.Display.Color.Interpolate.ColorWithColor(top, bottom, steps - 1, i);
        g.fillStyle(Phaser.Display.Color.GetColor(c.r, c.g, c.b));
        g.fillRect(x, y + i * stripH, w, stripH + 1.2);
    }
}

function softStroke(g, drawFn, color = INK, alpha = 0.28, width = 1.6) {
    g.lineStyle(width, color, alpha);
    drawFn();
}

export function generateTextures(scene) {
    if (scene.textures.exists('texpack_v6')) return;
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    const T = TILE;

    // pixel base
    g.clear(); g.fillStyle(0xffffff); g.fillRect(0, 0, 8, 8);
    g.generateTexture('px', 8, 8);

    // sombra elíptica reutilizável
    g.clear();
    g.fillStyle(0x000000, 0.28); g.fillEllipse(40, 12, 72, 18);
    g.fillStyle(0x000000, 0.12); g.fillEllipse(40, 12, 88, 24);
    g.generateTexture('shadow_soft', 80, 28);

    // ================= BLOCOS (cada cômodo com material distinto) =================
    const makeWoodBlock = (key, base, dark, light, grain = true) => {
        g.clear();
        // corpo
        g.fillStyle(base); g.fillRoundedRect(0, 0, T, T, 5);
        // borda superior (luz)
        g.fillStyle(light, 0.7); g.fillRoundedRect(2, 2, T - 4, 9, 3);
        // planks horizontais
        if (grain) {
            g.fillStyle(dark, 0.18);
            g.fillRect(3, 16, T - 6, 1.5);
            g.fillRect(3, 28, T - 6, 1.5);
            g.fillRect(4, 40, T - 8, 1.2);
            // nó da madeira
            g.fillStyle(dark, 0.22); g.fillEllipse(34, 22, 6, 4);
            g.fillStyle(light, 0.15); g.fillEllipse(33, 21, 3, 2);
        }
        // sombra base
        g.fillStyle(0x000000, 0.14); g.fillRect(0, T - 7, T, 7);
        g.fillStyle(dark, 0.35); g.fillRect(2, T - 11, T - 4, 4);
        softStroke(g, () => g.strokeRoundedRect(1, 1, T - 2, T - 2, 5), INK, 0.32, 1.5);
        g.generateTexture(key, T, T);
    };

    makeWoodBlock('block_wood', 0xc9a66e, 0x8f6a3c, 0xe8c998);
    makeWoodBlock('block_desk', 0xb08958, 0x7a5a38, 0xd4b07a);

    // carpete (azul com trama)
    g.clear();
    g.fillStyle(0x6a94d0); g.fillRoundedRect(0, 0, T, T, 5);
    g.fillStyle(0x8eb0e8, 0.55); g.fillRoundedRect(2, 2, T - 4, 8, 3);
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            g.fillStyle((i + j) % 2 ? 0x5a84c0 : 0x7aa4e0, 0.25);
            g.fillRect(4 + i * 8, 12 + j * 7, 7, 6);
        }
    }
    g.fillStyle(0x000000, 0.12); g.fillRect(0, T - 7, T, 7);
    softStroke(g, () => g.strokeRoundedRect(1, 1, T - 2, T - 2, 5), 0x3a5a8a, 0.3, 1.4);
    g.generateTexture('block_carpet', T, T);

    // azulejo de cozinha
    g.clear();
    g.fillStyle(0xefece4); g.fillRoundedRect(0, 0, T, T, 4);
    g.fillStyle(0xffffff, 0.5); g.fillRect(2, 2, T - 4, 6);
    g.lineStyle(1.5, 0xc8c4b8, 0.7);
    g.lineBetween(T / 2, 2, T / 2, T - 2);
    g.lineBetween(2, T / 2, T - 2, T / 2);
    g.fillStyle(0x000000, 0.08); g.fillRect(0, T - 6, T, 6);
    softStroke(g, () => g.strokeRoundedRect(1, 1, T - 2, T - 2, 4), INK, 0.2, 1.2);
    g.generateTexture('block_tile', T, T);

    // sótão (madeira escura + pregos)
    g.clear();
    g.fillStyle(0x7a6a60); g.fillRoundedRect(0, 0, T, T, 4);
    g.fillStyle(0x9a8a80, 0.45); g.fillRoundedRect(2, 2, T - 4, 8, 3);
    g.fillStyle(0x5a4a42, 0.35);
    g.fillRect(3, 18, T - 6, 2); g.fillRect(3, 32, T - 6, 2);
    g.fillStyle(0x3a3028, 0.5);
    g.fillCircle(10, 12, 1.5); g.fillCircle(T - 10, 12, 1.5);
    g.fillCircle(10, T - 12, 1.5); g.fillCircle(T - 10, T - 12, 1.5);
    g.fillStyle(0x000000, 0.18); g.fillRect(0, T - 7, T, 7);
    softStroke(g, () => g.strokeRoundedRect(1, 1, T - 2, T - 2, 4), 0x2a2018, 0.4, 1.4);
    g.generateTexture('block_attic', T, T);

    // ================= TV =================
    const tv = (key, on) => {
        g.clear();
        // antenas
        g.lineStyle(2.8, 0x8a8a98, 0.9);
        g.lineBetween(48, 16, 24, 2); g.lineBetween(48, 16, 72, 2);
        g.fillStyle(0x9a9aa8); g.fillCircle(24, 2, 3); g.fillCircle(72, 2, 3);
        // sombra
        g.fillStyle(0x000000, 0.15); g.fillEllipse(48, 78, 40, 8);
        // caixa
        g.fillStyle(0x4a4a58); g.fillRoundedRect(6, 14, 84, 58, 12);
        g.fillStyle(0x6a6a78, 0.55); g.fillRoundedRect(8, 16, 80, 10, { tl: 10, tr: 10, bl: 0, br: 0 });
        if (on) {
            gradientStrips(g, 14, 28, 56, 36, 0xc8f4ff, 0x6ec8f0, 10);
            g.fillStyle(0xffffff, 0.75); g.fillCircle(38, 44, 9);
            g.fillStyle(0xfff6c8, 0.5); g.fillEllipse(52, 42, 14, 18);
            g.fillStyle(0xffffff, 0.25); g.fillRoundedRect(18, 32, 14, 28, 3);
        } else {
            g.fillStyle(0x1a2038); g.fillRoundedRect(14, 28, 56, 36, 7);
            g.fillStyle(0x3a4568, 0.45); g.fillRect(20, 32, 10, 28);
        }
        softStroke(g, () => g.strokeRoundedRect(6, 14, 84, 58, 12), INK, 0.35, 1.6);
        softStroke(g, () => g.strokeRoundedRect(14, 28, 56, 36, 7), INK, 0.25, 1.2);
        g.fillStyle(0xa0a0b0); g.fillCircle(80, 36, 4); g.fillCircle(80, 52, 4);
        g.fillStyle(0x3a3a48); g.fillRoundedRect(16, 72, 12, 6, 2); g.fillRoundedRect(68, 72, 12, 6, 2);
        g.generateTexture(key, 96, 80);
    };
    tv('tv_off', false);
    tv('tv_on', true);

    // ================= PERIGOS (bem legíveis, estilo cartoon) =================

    // --- TÊNIS fedido (perfil, bico à direita) + espaço p/ fumacinha ---
    // canvas maior pra detalhe; origem do hazard é base
    {
        const W = 64, H = 40;
        g.clear();
        // sombra
        g.fillStyle(0x000000, 0.16); g.fillEllipse(32, 36, 34, 8);
        // sola branca/creme com perfil de tênis
        g.fillStyle(0xf2ebe0);
        g.fillRoundedRect(4, 26, 52, 9, { tl: 3, tr: 6, bl: 4, br: 8 });
        // sulcos da sola
        g.fillStyle(0xd8cfc0, 0.9);
        g.fillRect(10, 31, 6, 2); g.fillRect(20, 31, 6, 2);
        g.fillRect(30, 31, 6, 2); g.fillRect(40, 31, 6, 2);
        g.fillStyle(0xc8bfb0, 0.7); g.fillRect(6, 33, 48, 1.5);
        // cabedal vermelho
        g.fillStyle(0xe23b3b);
        g.fillRoundedRect(6, 14, 40, 14, { tl: 8, tr: 4, bl: 2, br: 2 });
        // bico arredondado
        g.fillStyle(0xe23b3b);
        g.fillEllipse(48, 22, 18, 14);
        // lateral com painel mais claro
        g.fillStyle(0xff6a5a, 0.55);
        g.fillRoundedRect(12, 16, 22, 8, 4);
        // faixa branca lateral (estilo sneaker)
        g.fillStyle(0xffffff, 0.92);
        g.fillRoundedRect(14, 20, 26, 3.5, 2);
        // costura
        g.lineStyle(1, 0xffffff, 0.45);
        g.strokeRoundedRect(8, 15, 36, 12, 6);
        // cadarço / língua
        g.fillStyle(0xc42828);
        g.fillRoundedRect(18, 8, 14, 8, 3);
        g.fillStyle(0xffffff, 0.95);
        g.fillRect(20, 11, 10, 1.6);
        g.fillRect(20, 14, 10, 1.6);
        // ilhós
        g.fillStyle(0xffd080);
        g.fillCircle(22, 12, 1.4); g.fillCircle(28, 12, 1.4);
        g.fillCircle(22, 15, 1.4); g.fillCircle(28, 15, 1.4);
        // logo bolinha
        g.fillStyle(0xffffff, 0.85); g.fillCircle(44, 20, 3.2);
        g.fillStyle(0xe23b3b, 0.9); g.fillCircle(44, 20, 1.6);
        // highlight
        g.fillStyle(0xffffff, 0.28); g.fillEllipse(18, 17, 10, 4);
        // contorno
        softStroke(g, () => {
            g.strokeRoundedRect(4, 26, 52, 9, 5);
            g.strokeRoundedRect(6, 14, 40, 14, 6);
        }, INK, 0.35, 1.4);
        // --- fumacinha verde de chulé (estática no sprite; animamos partículas em runtime) ---
        g.fillStyle(0x6ee06a, 0.22); g.fillEllipse(22, 6, 14, 8);
        g.fillStyle(0x4ecf48, 0.28); g.fillCircle(18, 5, 4.5);
        g.fillStyle(0x7dff78, 0.2); g.fillCircle(26, 3, 3.5);
        g.fillStyle(0x3aaa40, 0.18); g.fillCircle(22, 2, 2.5);
        g.fillStyle(0xa8f0a0, 0.35); g.fillCircle(16, 7, 2);
        g.fillStyle(0xa8f0a0, 0.3); g.fillCircle(28, 5, 1.8);
        g.generateTexture('sneaker', W, H);
    }

    // partícula de fedor (reutilizada no GameScene)
    g.clear();
    g.fillStyle(0x5fd85a, 0.85); g.fillCircle(6, 6, 5);
    g.fillStyle(0xb8ffb0, 0.7); g.fillCircle(4.5, 4.5, 2.2);
    g.fillStyle(0x3a9a3a, 0.35); g.fillCircle(8, 8, 2);
    g.generateTexture('stink', 12, 12);

    // --- LEGO 2×2 bem reconhecível (isométrico leve) ---
    const lego = (key, color, mid, dark, studLight) => {
        const W = 44, H = 36;
        g.clear();
        // sombra
        g.fillStyle(0x000000, 0.14); g.fillEllipse(22, 32, 22, 6);
        // corpo do tijolo (perspectiva simples: topo + frente + lado)
        // lado direito
        g.fillStyle(dark);
        g.fillPoints([
            { x: 36, y: 12 }, { x: 42, y: 15 }, { x: 42, y: 28 }, { x: 36, y: 25 }
        ], true);
        // frente
        g.fillStyle(color);
        g.fillRoundedRect(4, 14, 32, 14, 2);
        // sombra na base da frente
        g.fillStyle(dark, 0.45); g.fillRect(4, 24, 32, 4);
        // topo
        g.fillStyle(mid);
        g.fillPoints([
            { x: 4, y: 14 }, { x: 10, y: 8 }, { x: 42, y: 8 }, { x: 36, y: 14 }
        ], true);
        // linha de junção topo/frente
        g.lineStyle(1.2, dark, 0.5); g.lineBetween(4, 14, 36, 14);
        // pinos (studs) 2×2
        const studs = [[14, 9], [28, 9], [12, 12], [26, 12]];
        for (const [sx, sy] of studs) {
            // corpo do pino
            g.fillStyle(dark, 0.5); g.fillEllipse(sx + 0.5, sy + 3.5, 8, 3.5);
            g.fillStyle(color); g.fillEllipse(sx, sy + 1.5, 8, 4.5);
            g.fillStyle(mid); g.fillEllipse(sx, sy, 8, 4.5);
            // brilho no pino
            g.fillStyle(studLight, 0.7); g.fillEllipse(sx - 1.2, sy - 0.6, 3.2, 1.8);
            softStroke(g, () => g.strokeEllipse(sx, sy, 8, 4.5), INK, 0.25, 1);
        }
        // highlight frontal
        g.fillStyle(0xffffff, 0.22); g.fillRect(7, 16, 4, 8);
        // logo gravado fake
        g.fillStyle(dark, 0.25); g.fillRoundedRect(14, 18, 12, 4, 1);
        softStroke(g, () => {
            g.strokeRoundedRect(4, 14, 32, 14, 2);
        }, INK, 0.32, 1.3);
        g.generateTexture(key, W, H);
    };
    lego('lego_red', 0xe53935, 0xff6b65, 0xb71c1c, 0xffcdd2);
    lego('lego_blue', 0x1e88e5, 0x64b5f6, 0x0d47a1, 0xbbdefb);
    lego('lego_yellow', 0xfdd835, 0xffee58, 0xf9a825, 0xfff9c4);
    lego('lego_green', 0x43a047, 0x66bb6a, 0x2e7d32, 0xc8e6c9);

    // --- PILHA DE LIVROS (3 livros, bem legível) ---
    {
        const W = 52, H = 34;
        g.clear();
        g.fillStyle(0x000000, 0.14); g.fillEllipse(26, 30, 28, 7);
        // livro de baixo (azul)
        g.fillStyle(0x3d6fb8); g.fillRoundedRect(4, 20, 44, 10, 2);
        g.fillStyle(0x2a4f8a); g.fillRect(4, 27, 44, 3);
        g.fillStyle(0xe8eef8); g.fillRect(44, 21, 3, 7); // páginas
        g.fillStyle(0xffd66b); g.fillRect(8, 22, 14, 2); // título
        // livro do meio (verde)
        g.fillStyle(0x3d9a5c); g.fillRoundedRect(6, 12, 40, 10, 2);
        g.fillStyle(0x2a7040); g.fillRect(6, 19, 40, 3);
        g.fillStyle(0xeef8f0); g.fillRect(42, 13, 3, 7);
        g.fillStyle(0xfff3b0); g.fillRect(10, 14, 12, 2);
        // livro de cima (laranja/vermelho)
        g.fillStyle(0xe85a3a); g.fillRoundedRect(8, 4, 36, 10, 2);
        g.fillStyle(0xb83a20); g.fillRect(8, 11, 36, 3);
        g.fillStyle(0xfff0e8); g.fillRect(40, 5, 3, 7);
        g.fillStyle(0xffffff, 0.85); g.fillRect(12, 6, 16, 2);
        g.fillStyle(0xffffff, 0.5); g.fillRect(12, 9, 10, 1.5);
        // lombadas com linhas
        g.lineStyle(1, 0xffffff, 0.25);
        g.lineBetween(6, 22, 6, 28); g.lineBetween(8, 14, 8, 20); g.lineBetween(10, 6, 10, 12);
        // highlights
        g.fillStyle(0xffffff, 0.2); g.fillRect(10, 5, 3, 7);
        softStroke(g, () => {
            g.strokeRoundedRect(4, 20, 44, 10, 2);
            g.strokeRoundedRect(6, 12, 40, 10, 2);
            g.strokeRoundedRect(8, 4, 36, 10, 2);
        }, INK, 0.3, 1.2);
        g.generateTexture('book', W, H);
    }

    // ================= ESTRELA =================
    g.clear();
    const pts = [];
    for (let i = 0; i < 10; i++) {
        const ang = -Math.PI / 2 + i * Math.PI / 5;
        const r = i % 2 === 0 ? 13 : 5.2;
        pts.push({ x: 14 + Math.cos(ang) * r, y: 14 + Math.sin(ang) * r });
    }
    g.fillStyle(0x000000, 0.12); g.fillEllipse(14, 24, 12, 4);
    g.fillStyle(0xffd66b); g.fillPoints(pts, true);
    g.fillStyle(0xfff3b0, 0.8); g.fillCircle(12, 12, 4);
    g.fillStyle(0xffffff, 0.55); g.fillCircle(11, 11, 1.8);
    softStroke(g, () => g.strokePoints(pts, true), 0xc49020, 0.45, 1.5);
    g.generateTexture('star', 28, 28);

    // ================= ROBÔ (chibi) =================
    g.clear();
    g.fillStyle(0x000000, 0.12); g.fillEllipse(20, 38, 16, 5);
    g.fillStyle(0x5a6070); g.fillRoundedRect(3, 28, 34, 10, 5);
    g.fillStyle(0x9aa3b4); g.fillCircle(10, 33, 3.5); g.fillCircle(20, 33, 3.5); g.fillCircle(30, 33, 3.5);
    g.fillStyle(0xc8d0dc); g.fillRoundedRect(5, 8, 30, 20, 8);
    g.fillStyle(0xe8eef6, 0.7); g.fillRoundedRect(7, 10, 26, 7, 4);
    g.fillStyle(0xffffff); g.fillEllipse(14, 17, 9, 10); g.fillEllipse(26, 17, 9, 10);
    g.fillStyle(0xff6b7a); g.fillCircle(14, 18, 3); g.fillCircle(26, 18, 3);
    g.fillStyle(0xffffff); g.fillCircle(13, 16.5, 1.2); g.fillCircle(25, 16.5, 1.2);
    g.lineStyle(2.2, 0x8a92a4); g.lineBetween(20, 8, 20, 2);
    g.fillStyle(0xff6b7a); g.fillCircle(20, 2, 3);
    softStroke(g, () => g.strokeRoundedRect(5, 8, 30, 20, 8), INK, 0.28, 1.3);
    g.generateTexture('robot', 40, 40);

    // ================= MOLA / PLATAFORMA =================
    g.clear();
    g.fillStyle(0x000000, 0.1); g.fillEllipse(24, 20, 22, 5);
    g.fillStyle(0xff8aab); g.fillRoundedRect(2, 4, 44, 14, 7);
    g.fillStyle(0xffc0d4, 0.75); g.fillRoundedRect(4, 5, 40, 6, 4);
    g.fillStyle(0xe05080); g.fillCircle(24, 11, 3);
    g.fillStyle(0xffffff, 0.35); g.fillCircle(22, 9, 1.2);
    g.fillStyle(0xd44d74, 0.55); g.fillRoundedRect(0, 16, 48, 4, 2);
    g.generateTexture('cushion', 48, 22);

    g.clear();
    g.fillStyle(0x000000, 0.12); g.fillEllipse(56, 18, 50, 6);
    g.fillStyle(0xd4a86a); g.fillRoundedRect(0, 0, 112, 16, 7);
    g.fillStyle(0xecc890, 0.75); g.fillRoundedRect(3, 2, 106, 6, 4);
    g.fillStyle(0xb88848, 0.4); g.fillRect(3, 12, 106, 3);
    g.fillStyle(0x8a8a96); g.fillCircle(12, 8, 2.5); g.fillCircle(100, 8, 2.5);
    softStroke(g, () => g.strokeRoundedRect(0, 0, 112, 16, 7), INK, 0.25, 1.3);
    g.generateTexture('platform', 112, 20);

    // ================= HUD / FX =================
    const heart = (key, color, empty = false) => {
        g.clear();
        if (empty) {
            g.lineStyle(2, color, 0.7);
            g.beginPath();
            g.arc(7, 7, 5.5, Math.PI, 0, false);
            g.arc(17, 7, 5.5, Math.PI, 0, false);
            g.lineTo(12, 20);
            g.closePath();
            g.strokePath();
        } else {
            g.fillStyle(color);
            g.fillCircle(7, 7, 6); g.fillCircle(17, 7, 6);
            g.fillTriangle(2, 10, 22, 10, 12, 21);
            g.fillStyle(0xffffff, 0.5); g.fillCircle(6, 5.5, 2);
        }
        g.generateTexture(key, 24, 22);
    };
    heart('heart', 0xff6b8a);
    heart('heart_empty', 0xb0a8b8, true);

    g.clear();
    g.fillStyle(0xffffff, 0.9); g.fillCircle(5, 5, 4);
    g.fillStyle(0xffffff, 0.35); g.fillCircle(4, 4, 1.8);
    g.generateTexture('dust', 10, 10);

    g.clear();
    g.fillStyle(0xfff0b0); g.fillCircle(7, 7, 3.5);
    g.fillStyle(0xffffff, 0.85); g.fillCircle(5.5, 5.5, 1.5);
    g.fillStyle(0xfff0b0, 0.4); g.fillCircle(7, 7, 6);
    g.generateTexture('spark', 14, 14);

    g.clear();
    g.fillStyle(0xffffff); g.fillRoundedRect(0, 0, 10, 6, 2);
    g.generateTexture('confetti', 10, 6);

    // ================= PAPEL DE PAREDE (tile grande e rico) =================
    g.clear();
    g.fillStyle(0xffffff, 0.04); g.fillRect(0, 0, 96, 96);
    // flores
    const flowers = [[18, 20], [58, 24], [38, 52], [72, 60], [14, 68], [50, 14], [80, 40], [30, 78]];
    for (const [fx, fy] of flowers) {
        g.fillStyle(0xffffff, 0.16);
        for (let k = 0; k < 5; k++) {
            const a = (k / 5) * Math.PI * 2;
            g.fillCircle(fx + Math.cos(a) * 4, fy + Math.sin(a) * 4, 2.2);
        }
        g.fillStyle(0xffe8a0, 0.2); g.fillCircle(fx, fy, 1.6);
    }
    // folhas
    g.fillStyle(0xa8d0a0, 0.1);
    g.fillEllipse(40, 36, 8, 4); g.fillEllipse(70, 72, 7, 3.5);
    g.generateTexture('wallpaper', 96, 96);

    // painel de parede (meia-parede)
    g.clear();
    gradientStrips(g, 0, 0, 64, 64, 0xf8f0e4, 0xe8d8c0, 12);
    g.fillStyle(0x000000, 0.04); g.fillRect(0, 0, 2, 64);
    g.fillStyle(0xffffff, 0.12); g.fillRect(2, 0, 1, 64);
    g.generateTexture('wall_panel', 64, 64);

    // rodapé madeira detalhado
    g.clear();
    g.fillStyle(0xb89568); g.fillRect(0, 0, 96, 20);
    g.fillStyle(0xd8b888, 0.6); g.fillRect(0, 0, 96, 5);
    g.fillStyle(0x8a6a40, 0.3); g.fillRect(0, 7, 96, 1.5);
    g.fillStyle(0x000000, 0.14); g.fillRect(0, 16, 96, 4);
    g.fillStyle(0xe8c898, 0.25); g.fillRect(0, 1, 96, 2);
    g.generateTexture('wainscot', 96, 20);

    // chão de tábua rico
    g.clear();
    g.fillStyle(0xc4a070); g.fillRect(0, 0, 128, 48);
    g.fillStyle(0xd8b888, 0.4); g.fillRect(0, 0, 128, 8);
    g.lineStyle(1.2, 0x8a6a40, 0.28);
    g.lineBetween(0, 16, 128, 16); g.lineBetween(0, 32, 128, 32);
    g.lineBetween(32, 0, 32, 16); g.lineBetween(80, 16, 80, 32);
    g.lineBetween(48, 32, 48, 48); g.lineBetween(100, 0, 100, 16);
    g.fillStyle(0x000000, 0.1); g.fillRect(0, 42, 128, 6);
    // veios
    g.lineStyle(1, 0x9a7a48, 0.15);
    g.lineBetween(8, 4, 28, 6); g.lineBetween(50, 20, 75, 18);
    g.generateTexture('floorboard', 128, 48);

    // cortina plissada
    g.clear();
    g.fillStyle(0xd06060); g.fillRoundedRect(0, 0, 44, 140, 5);
    for (let i = 0; i < 5; i++) {
        g.fillStyle(i % 2 ? 0xe87878 : 0xc05050, 0.55);
        g.fillRect(3 + i * 8, 12, 5, 118);
    }
    g.fillStyle(0xb04040); g.fillRect(0, 0, 44, 12);
    g.fillStyle(0xffd080); g.fillCircle(10, 7, 3.5); g.fillCircle(34, 7, 3.5);
    g.fillStyle(0x000000, 0.12); g.fillEllipse(22, 136, 18, 5);
    g.generateTexture('curtain', 44, 140);

    // janela grande (céu Ghibli)
    g.clear();
    // moldura
    g.fillStyle(0xa88860); g.fillRoundedRect(0, 0, 150, 170, 8);
    g.fillStyle(0xc4a878, 0.5); g.fillRect(4, 4, 142, 8);
    // céu
    gradientStrips(g, 12, 14, 126, 140, 0x7ec0f0, 0xffe8b8, 16);
    // colinas distantes
    g.fillStyle(0xa8d088, 0.55); g.fillEllipse(40, 130, 50, 28);
    g.fillStyle(0x88b868, 0.5); g.fillEllipse(110, 135, 55, 30);
    // nuvens
    g.fillStyle(0xffffff, 0.6);
    g.fillEllipse(45, 55, 32, 14); g.fillEllipse(60, 52, 20, 11);
    g.fillEllipse(100, 95, 26, 12);
    // sol
    g.fillStyle(0xffe08a, 0.9); g.fillCircle(112, 42, 16);
    g.fillStyle(0xfff8c8, 0.55); g.fillCircle(112, 42, 9);
    // travessas
    g.fillStyle(0xa88860); g.fillRect(71, 14, 9, 140); g.fillRect(12, 80, 126, 9);
    // reflexo
    g.fillStyle(0xffffff, 0.22); g.fillRoundedRect(20, 22, 32, 45, 5);
    // peitoril
    g.fillStyle(0xc4a070); g.fillRect(4, 154, 142, 12);
    g.fillStyle(0x000000, 0.12); g.fillRect(4, 162, 142, 4);
    softStroke(g, () => g.strokeRoundedRect(0, 0, 150, 170, 8), INK, 0.28, 1.6);
    g.generateTexture('window', 150, 170);

    // moldura de teto / cornija
    g.clear();
    g.fillStyle(0xf0e8d8); g.fillRect(0, 0, 96, 16);
    g.fillStyle(0xffffff, 0.4); g.fillRect(0, 0, 96, 4);
    g.fillStyle(0x000000, 0.08); g.fillRect(0, 12, 96, 4);
    g.fillStyle(0xd8c8a8, 0.5); g.fillRect(0, 6, 96, 2);
    g.generateTexture('crown', 96, 16);

    // ================= MÓVEIS =================
    // sofá
    g.clear();
    g.fillStyle(0x000000, 0.14); g.fillEllipse(90, 84, 78, 12);
    g.fillStyle(0xc87868); g.fillRoundedRect(16, 8, 148, 40, 14);
    g.fillStyle(0xe8a898, 0.5); g.fillRoundedRect(24, 14, 55, 16, 8);
    g.fillStyle(0xd89080); g.fillRoundedRect(0, 40, 180, 34, 12);
    g.fillStyle(0xc87868); g.fillRoundedRect(0, 32, 32, 48, 14); g.fillRoundedRect(148, 32, 32, 48, 14);
    g.fillStyle(0xb06050, 0.3); g.fillRect(88, 46, 5, 22);
    g.fillStyle(0xa08050); g.fillRect(18, 78, 14, 10); g.fillRect(148, 78, 14, 10);
    g.fillStyle(0xf5d8c8, 0.45); g.fillEllipse(55, 54, 26, 12); g.fillEllipse(125, 54, 26, 12);
    softStroke(g, () => g.strokeRoundedRect(0, 40, 180, 34, 12), INK, 0.2, 1.2);
    g.generateTexture('sofa', 180, 90);

    // planta
    g.clear();
    g.fillStyle(0x000000, 0.12); g.fillEllipse(32, 98, 22, 7);
    g.fillStyle(0x4a8a58); g.fillEllipse(30, 30, 24, 22);
    g.fillStyle(0x68b078); g.fillEllipse(12, 44, 18, 16); g.fillEllipse(48, 42, 18, 16);
    g.fillStyle(0x3d7a4a); g.fillEllipse(30, 54, 16, 14);
    g.fillStyle(0x88c898, 0.55); g.fillEllipse(22, 24, 10, 8);
    g.fillStyle(0x2d6a3d, 0.4); g.fillEllipse(38, 48, 10, 8);
    g.fillStyle(0xc89860); g.fillRoundedRect(16, 64, 32, 34, { tl: 4, tr: 4, bl: 12, br: 12 });
    g.fillStyle(0xa87840, 0.5); g.fillRect(16, 64, 32, 8);
    g.fillStyle(0xe0c090, 0.35); g.fillRect(20, 74, 10, 14);
    g.generateTexture('plant', 64, 104);

    // abajur
    g.clear();
    g.fillStyle(0xffe8b0, 0.3); g.fillEllipse(24, 32, 36, 26);
    g.fillStyle(0xffd890); g.fillTriangle(4, 46, 44, 46, 36, 6);
    g.fillTriangle(4, 46, 12, 6, 36, 6);
    g.fillStyle(0xfff6d0, 0.5); g.fillTriangle(14, 42, 34, 42, 28, 14);
    g.fillStyle(0x9090a0); g.fillRect(21, 46, 6, 56);
    g.fillStyle(0xb0b0c0); g.fillRoundedRect(8, 102, 32, 10, 4);
    g.fillStyle(0x000000, 0.1); g.fillEllipse(24, 112, 18, 5);
    g.generateTexture('lamp', 48, 116);

    // estante
    g.clear();
    g.fillStyle(0x000000, 0.12); g.fillEllipse(62, 168, 52, 9);
    g.fillStyle(0xb89060); g.fillRoundedRect(0, 0, 124, 164, 6);
    g.fillStyle(0x9a7848);
    g.fillRect(10, 12, 104, 40); g.fillRect(10, 60, 104, 40); g.fillRect(10, 108, 104, 40);
    const bookColors = [0xef7a7a, 0x6a9adb, 0xffd66b, 0x7aba6a, 0xb07cc8, 0xf0a84a, 0x70c0c0, 0xe89060];
    for (let shelfIdx = 0; shelfIdx < 3; shelfIdx++) {
        const by = 12 + shelfIdx * 48;
        for (let bi = 0; bi < 7; bi++) {
            const h = 22 + (bi % 4) * 3;
            g.fillStyle(bookColors[(bi + shelfIdx * 3) % bookColors.length]);
            g.fillRoundedRect(14 + bi * 14, by + 36 - h, 11, h, 2);
            g.fillStyle(0xffffff, 0.22); g.fillRect(15 + bi * 14, by + 36 - h, 3, h);
        }
    }
    g.fillStyle(0xd8b888, 0.45); g.fillRect(0, 0, 124, 8);
    softStroke(g, () => g.strokeRoundedRect(0, 0, 124, 164, 6), INK, 0.22, 1.3);
    g.generateTexture('shelf', 124, 172);

    // geladeira
    g.clear();
    g.fillStyle(0x000000, 0.12); g.fillEllipse(36, 148, 30, 7);
    g.fillStyle(0xeef4f6); g.fillRoundedRect(0, 0, 72, 144, 10);
    g.fillStyle(0xffffff, 0.55); g.fillRoundedRect(5, 5, 22, 120, 5);
    g.fillStyle(0xd0dce0); g.fillRect(0, 56, 72, 6);
    g.fillStyle(0xa8b4b8); g.fillRoundedRect(56, 18, 8, 26, 3); g.fillRoundedRect(56, 72, 8, 40, 3);
    g.fillStyle(0x8ec8e8, 0.3); g.fillRoundedRect(10, 14, 40, 32, 5);
    g.fillStyle(0xffb0b0, 0.4); g.fillCircle(18, 80, 5);
    g.fillStyle(0xb0e8b0, 0.4); g.fillCircle(30, 84, 4);
    softStroke(g, () => g.strokeRoundedRect(0, 0, 72, 144, 10), INK, 0.18, 1.2);
    g.generateTexture('fridge', 72, 152);

    // mesa
    g.clear();
    g.fillStyle(0x000000, 0.12); g.fillEllipse(72, 72, 60, 9);
    g.fillStyle(0xc4a070); g.fillRoundedRect(0, 0, 144, 18, 6);
    g.fillStyle(0xe8d0a0, 0.55); g.fillRect(2, 2, 140, 6);
    g.fillStyle(0xf5ecdc, 0.75); g.fillRoundedRect(22, 4, 100, 12, 4);
    g.fillStyle(0xa88850); g.fillRect(14, 18, 12, 52); g.fillRect(118, 18, 12, 52);
    g.fillStyle(0xef7a7a); g.fillCircle(70, 9, 6);
    g.fillStyle(0xffd66b); g.fillCircle(78, 7, 5);
    g.fillStyle(0x7aba6a); g.fillCircle(64, 6, 4);
    g.generateTexture('table', 144, 72);

    // caixa
    g.clear();
    g.fillStyle(0x000000, 0.12); g.fillEllipse(36, 62, 30, 7);
    g.fillStyle(0xd4b080); g.fillRoundedRect(0, 8, 72, 52, 6);
    g.fillStyle(0xc09860); g.fillRect(0, 8, 72, 12);
    g.fillStyle(0xead4a8); g.fillRect(32, 8, 9, 52);
    g.fillStyle(0xb89058, 0.5); g.fillRoundedRect(10, 28, 20, 14, 3);
    g.fillStyle(0xffffff, 0.28); g.fillRect(6, 12, 22, 5);
    softStroke(g, () => g.strokeRoundedRect(0, 8, 72, 52, 6), INK, 0.22, 1.2);
    g.generateTexture('box', 72, 64);

    // botão touch
    g.clear();
    g.fillStyle(0xffffff, 0.9); g.fillCircle(44, 44, 42);
    g.fillStyle(0x000000, 0.06); g.fillCircle(44, 48, 38);
    softStroke(g, () => g.strokeCircle(44, 44, 42), INK, 0.3, 3);
    g.generateTexture('btn', 88, 88);

    // marcador de versão (subir para forçar regenerar texturas)
    g.clear(); g.fillStyle(0); g.fillRect(0, 0, 1, 1);
    g.generateTexture('texpack_v6', 1, 1);

    g.destroy();
}
