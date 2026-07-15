// Texturas procedurais estilo Studio Ghibli / chibi:
// contornos suaves, cel shading, olhos grandes com brilho
import { TILE } from './levels.js';

const INK = 0x4a3428; // traço quente e suave (não nanquim preto)

// Desenha um degradê vertical em faixas (funciona em WebGL e Canvas)
// steps mais altos = transição mais suave (bom para fundos full-screen)
export function gradientStrips(g, x, y, w, h, topColor, bottomColor, steps = 18) {
    const top = Phaser.Display.Color.ValueToColor(topColor);
    const bottom = Phaser.Display.Color.ValueToColor(bottomColor);
    const stripH = h / steps;
    for (let i = 0; i < steps; i++) {
        const c = Phaser.Display.Color.Interpolate.ColorWithColor(top, bottom, steps - 1, i);
        g.fillStyle(Phaser.Display.Color.GetColor(c.r, c.g, c.b));
        g.fillRect(x, y + i * stripH, w, stripH + 1);
    }
}

// Olho Ghibli: esclera + íris castanha + brilhos + cílios leves
function ghibliEye(g, cx, cy, w = 8, h = 9, lashDir = 0) {
    g.fillStyle(0xffffff);
    g.fillEllipse(cx, cy, w, h);
    g.lineStyle(1.2, INK, 0.85);
    g.strokeEllipse(cx, cy, w, h);
    g.fillStyle(0x6b3e26); g.fillEllipse(cx + 0.4, cy + 0.4, w * 0.62, h * 0.7);
    g.fillStyle(0x3a2214); g.fillEllipse(cx + 0.5, cy + 0.6, w * 0.32, h * 0.38);
    g.fillStyle(0xffffff); g.fillCircle(cx - w * 0.18, cy - h * 0.22, 1.5);
    g.fillStyle(0xffffff, 0.7); g.fillCircle(cx + w * 0.14, cy + h * 0.12, 0.7);
    if (lashDir !== 0) {
        g.lineStyle(1.3, INK, 0.9);
        g.lineBetween(cx + w * 0.35 * lashDir, cy - h * 0.35, cx + w * 0.55 * lashDir, cy - h * 0.55);
        g.lineBetween(cx + w * 0.42 * lashDir, cy - h * 0.15, cx + w * 0.62 * lashDir, cy - h * 0.28);
    }
}

function softBlush(g, cx, cy, spread = 11) {
    g.fillStyle(0xff8a90, 0.38);
    g.fillEllipse(cx - spread, cy, 5.5, 3.2);
    g.fillEllipse(cx + spread, cy, 5.5, 3.2);
}

function softSmile(g, cx, cy, open = false) {
    if (open) {
        g.fillStyle(0xc45a4a);
        g.fillEllipse(cx, cy + 1, 5, 3.5);
        g.fillStyle(0xffffff, 0.85);
        g.fillRect(cx - 2.5, cy - 0.5, 5, 1.4);
    } else {
        g.lineStyle(1.6, 0xb05a48);
        g.beginPath();
        g.arc(cx, cy, 3.2, Math.PI * 0.12, Math.PI * 0.88, false);
        g.strokePath();
    }
}

// Mini logo "Colônia de Férias" (tigre + texto) no moletom
function drawCampLogo(g, cx, cy, scale = 1) {
    const s = scale;
    // tigre simplificado
    g.fillStyle(0xf0a040);
    g.fillEllipse(cx, cy - 3 * s, 5.5 * s, 4.5 * s);
    g.fillStyle(0x5a3a20);
    g.fillEllipse(cx - 1.5 * s, cy - 3.5 * s, 1.1 * s, 1.3 * s);
    g.fillEllipse(cx + 1.5 * s, cy - 3.5 * s, 1.1 * s, 1.3 * s);
    g.fillStyle(0xffffff);
    g.fillCircle(cx - 1.5 * s, cy - 3.7 * s, 0.4 * s);
    g.fillCircle(cx + 1.5 * s, cy - 3.7 * s, 0.4 * s);
    // orelhas
    g.fillStyle(0xf0a040);
    g.fillTriangle(cx - 4 * s, cy - 5 * s, cx - 2 * s, cy - 7 * s, cx - 1 * s, cy - 4.5 * s);
    g.fillTriangle(cx + 4 * s, cy - 5 * s, cx + 2 * s, cy - 7 * s, cx + 1 * s, cy - 4.5 * s);
    // faixa colorida sob o tigre
    g.fillStyle(0x3db8e8);
    g.fillRoundedRect(cx - 9 * s, cy + 1 * s, 18 * s, 5.5 * s, 1.5 * s);
    g.fillStyle(0xff8c2a);
    g.fillRoundedRect(cx - 9 * s, cy + 1 * s, 5 * s, 5.5 * s, 1.5 * s);
    g.fillStyle(0xffffff, 0.95);
    g.fillRect(cx - 3 * s, cy + 2.2 * s, 6 * s, 1.2 * s);
    g.fillRect(cx - 2.5 * s, cy + 4 * s, 5 * s, 1.2 * s);
}

export function generateTextures(scene) {
    if (scene.textures.exists('block_wood')) return; // já gerado nesta sessão
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    const T = TILE;

    // Paleta das refs (Colônia de Férias / Ghibli kids)
    const boySkin = 0xffe0c8, girlSkin = 0xf5c9a8;
    const boyHair = 0x5c3d2e, boyHairDark = 0x3d281c, boyHairLight = 0x7a5540;
    const girlHair = 0x4a3226, girlHairDark = 0x2e1e16, girlHairLight = 0x6b4a38;
    const sweater = 0xf5c842, sweaterHi = 0xffe06a, sweaterSh = 0xd4a82e;
    const bag = 0x2d6b4f, bagHi = 0x3d8a66, bagSh = 0x1e4a36;
    const olive = 0x6b7048, oliveSh = 0x525738;
    const floralBase = 0xe8dcc8;

    // ---------- pixel branco básico ----------
    g.clear(); g.fillStyle(0xffffff); g.fillRect(0, 0, 10, 10);
    g.generateTexture('px', 10, 10);

    // ================= PERSONAGENS (estilo Ghibli das refs) =================

    // --- cabeça do menino: cabelo castanho bagunçado, olhos grandes ---
    g.clear();
    // orelhas
    g.fillStyle(boySkin); g.fillEllipse(5, 24, 6, 7); g.fillEllipse(37, 24, 6, 7);
    g.lineStyle(1.4, INK, 0.7); g.strokeEllipse(5, 24, 6, 7); g.strokeEllipse(37, 24, 6, 7);
    // rosto
    g.fillStyle(boySkin); g.fillRoundedRect(6, 12, 30, 26, 12);
    g.fillStyle(0xffffff, 0.25); g.fillEllipse(28, 20, 8, 10); // highlight pele
    g.lineStyle(1.8, INK, 0.85); g.strokeRoundedRect(6, 12, 30, 26, 12);
    // cabelo espetado (topo + franja)
    g.fillStyle(boyHair);
    g.fillRoundedRect(4, 2, 34, 16, { tl: 14, tr: 14, bl: 4, br: 4 });
    g.fillTriangle(6, 14, 12, 14, 8, 24);
    g.fillTriangle(12, 14, 19, 14, 15, 26);
    g.fillTriangle(18, 12, 26, 12, 22, 25);
    g.fillTriangle(25, 13, 33, 13, 30, 23);
    g.fillTriangle(30, 10, 38, 8, 34, 20); // mecha lateral
    g.fillStyle(boyHairDark);
    g.fillTriangle(8, 4, 14, 2, 11, 12);
    g.fillTriangle(22, 1, 28, 3, 24, 12);
    g.fillStyle(boyHairLight, 0.55);
    g.fillEllipse(14, 7, 6, 3);
    g.lineStyle(1.6, INK, 0.75); g.strokeRoundedRect(4, 2, 34, 16, { tl: 14, tr: 14, bl: 4, br: 4 });
    ghibliEye(g, 15, 24, 7.5, 8.5);
    ghibliEye(g, 27, 24, 7.5, 8.5);
    softBlush(g, 21, 29, 10);
    softSmile(g, 21, 32.5, true);
    g.generateTexture('head_boy', 42, 40);

    // --- cabeça da menina: cabelo longo + flor laranja ---
    g.clear();
    // cabelo longo dos lados (atrás do rosto)
    g.fillStyle(girlHair);
    g.fillRoundedRect(0, 14, 10, 42, { tl: 4, tr: 2, bl: 8, br: 4 });
    g.fillRoundedRect(34, 12, 12, 44, { tl: 2, tr: 5, bl: 4, br: 10 });
    g.fillStyle(girlHairDark);
    g.fillEllipse(5, 48, 6, 10);
    g.fillEllipse(40, 50, 7, 12);
    // orelhas / rosto
    g.fillStyle(girlSkin);
    g.fillEllipse(8, 26, 5, 6); g.fillEllipse(36, 26, 5, 6);
    g.fillRoundedRect(8, 12, 28, 26, 11);
    g.fillStyle(0xffffff, 0.22); g.fillEllipse(28, 20, 7, 9);
    g.lineStyle(1.5, 0xc48a62, 0.7); g.strokeRoundedRect(8, 12, 28, 26, 11);
    // topo + franja
    g.fillStyle(girlHair);
    g.fillRoundedRect(3, 2, 38, 16, { tl: 16, tr: 16, bl: 3, br: 3 });
    g.fillTriangle(8, 14, 16, 14, 11, 24);
    g.fillTriangle(15, 14, 24, 14, 19, 25);
    g.fillTriangle(23, 13, 34, 13, 28, 23);
    g.fillStyle(girlHairLight, 0.5);
    g.fillEllipse(14, 7, 7, 3);
    g.lineStyle(1.6, INK, 0.75); g.strokeRoundedRect(3, 2, 38, 16, { tl: 16, tr: 16, bl: 3, br: 3 });
    // flor laranja no cabelo
    g.fillStyle(0xf07828);
    for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 - 0.4;
        g.fillCircle(34 + Math.cos(a) * 3.2, 10 + Math.sin(a) * 3.2, 2.2);
    }
    g.fillStyle(0xffe066); g.fillCircle(34, 10, 1.6);
    ghibliEye(g, 16, 25, 7.2, 8.2, -1);
    ghibliEye(g, 28, 25, 7.2, 8.2, 1);
    softBlush(g, 22, 30, 9.5);
    softSmile(g, 22, 33, false);
    g.generateTexture('head_girl', 46, 58);

    // --- tronco: moletom amarelo baggy + logo (mesmo para boy/girl, proporções leves) ---
    const makeSweater = (key, w, h) => {
        g.clear();
        // corpo do moletom (forma de "balão")
        g.fillStyle(sweater);
        g.fillRoundedRect(2, 2, w - 4, h - 4, 8);
        g.fillStyle(sweaterHi, 0.55);
        g.fillRoundedRect(4, 3, w - 10, 5, 3); // brilho superior
        g.fillStyle(sweaterSh, 0.35);
        g.fillRoundedRect(3, h - 10, w - 6, 6, 2); // sombra barra
        // gola
        g.fillStyle(sweaterSh);
        g.fillEllipse(w / 2, 4, 10, 5);
        g.fillStyle(sweater);
        g.fillEllipse(w / 2, 5.5, 7, 3.5);
        drawCampLogo(g, w / 2, h * 0.48, 0.95);
        g.lineStyle(1.8, INK, 0.8);
        g.strokeRoundedRect(2, 2, w - 4, h - 4, 8);
        g.generateTexture(key, w, h);
    };
    makeSweater('torso_boy', 30, 24);
    makeSweater('torso_girl', 30, 24);

    // --- mochila verde (atrás do corpo) ---
    g.clear();
    g.fillStyle(bag);
    g.fillRoundedRect(2, 4, 16, 22, 5);
    g.fillStyle(bagHi, 0.5);
    g.fillRoundedRect(4, 6, 6, 10, 2);
    g.fillStyle(bagSh);
    g.fillRoundedRect(4, 18, 12, 6, 2); // bolso
    g.lineStyle(1.4, INK, 0.75);
    g.strokeRoundedRect(2, 4, 16, 22, 5);
    g.strokeRoundedRect(4, 18, 12, 6, 2);
    // alças
    g.lineStyle(2.2, bagHi, 0.95);
    g.lineBetween(4, 6, 1, 0);
    g.lineBetween(16, 6, 19, 0);
    g.fillStyle(bagSh); g.fillCircle(10, 8, 1.5); // botão
    g.generateTexture('backpack', 22, 28);

    // --- braços: manga amarela + mão ---
    g.clear();
    g.fillStyle(boySkin); g.fillRoundedRect(0.5, 11, 8, 9, 3.5);
    g.fillStyle(sweater); g.fillRoundedRect(0, 0, 9, 13, { tl: 4, tr: 4, bl: 3, br: 3 });
    g.fillStyle(sweaterHi, 0.45); g.fillRect(1, 1, 3, 8);
    g.lineStyle(1.4, INK, 0.8); g.strokeRoundedRect(0, 0, 9, 20, 4);
    g.generateTexture('arm_boy', 9, 20);

    g.clear();
    g.fillStyle(girlSkin); g.fillRoundedRect(0.5, 11, 8, 9, 3.5);
    g.fillStyle(sweater); g.fillRoundedRect(0, 0, 9, 13, { tl: 4, tr: 4, bl: 3, br: 3 });
    g.fillStyle(sweaterHi, 0.45); g.fillRect(1, 1, 3, 8);
    g.lineStyle(1.4, INK, 0.8); g.strokeRoundedRect(0, 0, 9, 20, 4);
    g.generateTexture('arm_girl', 9, 20);

    // --- perna menino: calça oliva + tênis azul velcro ---
    g.clear();
    g.fillStyle(olive); g.fillRoundedRect(0, 0, 11, 14, { tl: 3, tr: 3, bl: 1, br: 1 });
    g.fillStyle(oliveSh, 0.4); g.fillRect(1, 10, 9, 3);
    // bolso cargo
    g.fillStyle(oliveSh); g.fillRoundedRect(6, 4, 4, 5, 1);
    // tênis azul
    g.fillStyle(0x3a7bd5); g.fillRoundedRect(0, 13, 12, 8, { tl: 2, tr: 3, bl: 3, br: 3 });
    g.fillStyle(0x2d5fa8); g.fillRect(0, 18, 12, 2.5); // sola
    g.fillStyle(0x5fd38a); g.fillRect(1, 14, 4, 1.5); // detalhe verde
    g.fillStyle(0x2a4a80); g.fillRect(3, 15.5, 5, 1.2); // velcro
    g.fillStyle(0xe8eef5); g.fillRect(0, 19.5, 12, 1.5); // sola clara
    g.lineStyle(1.3, INK, 0.8); g.strokeRoundedRect(0, 0, 11, 14, 2);
    g.strokeRoundedRect(0, 13, 12, 8, 2);
    g.generateTexture('leg_boy', 12, 22);

    // --- perna menina: calça floral + tênis branco/azul ---
    g.clear();
    g.fillStyle(floralBase); g.fillRoundedRect(0, 0, 11, 14, { tl: 3, tr: 3, bl: 1, br: 1 });
    // flores coloridas
    const petals = [0xf48fb1, 0x90caf9, 0xce93d8, 0xffcc80, 0x81c784];
    const flowerDots = [[2, 3], [7, 5], [4, 8], [8, 10], [3, 11], [6, 2]];
    flowerDots.forEach(([fx, fy], i) => {
        g.fillStyle(petals[i % petals.length]);
        g.fillCircle(fx, fy, 1.6);
        g.fillStyle(0xfff59d); g.fillCircle(fx, fy, 0.6);
    });
    g.fillStyle(0xd4c4a8, 0.5); g.fillRect(1, 11, 9, 2.5); // barra
    // tênis branco
    g.fillStyle(0xf5f5f0); g.fillRoundedRect(0, 13, 12, 8, { tl: 2, tr: 3, bl: 3, br: 3 });
    g.fillStyle(0x4fc3f7); g.fillRect(1, 15, 4, 3); // detalhe azul
    g.fillStyle(0xe0e0d8); g.fillRect(0, 18.5, 12, 2.5);
    g.lineStyle(1.3, INK, 0.75); g.strokeRoundedRect(0, 0, 11, 14, 2);
    g.strokeRoundedRect(0, 13, 12, 8, 2);
    g.generateTexture('leg_girl', 12, 22);

    // ================= CENÁRIO =================

    // ---------- blocos de chão por cômodo (com contorno de nanquim) ----------
    const block = (key, base, dark, light) => {
        g.clear();
        g.fillStyle(base); g.fillRect(0, 0, T, T);
        g.fillStyle(light); g.fillRect(0, 0, T, 5);              // borda de cima iluminada
        g.fillStyle(dark);
        g.fillRect(0, 17, T, 3); g.fillRect(0, 33, T, 3);        // frisos horizontais
        g.fillRect(14, 5, 3, 12); g.fillRect(34, 20, 3, 13);     // emendas verticais
        g.fillRect(6, 36, 3, 12); g.fillRect(26, 36, 3, 12);
        g.fillStyle(0x000000, 0.18); g.fillRect(0, T - 4, T, 4); // sombra de baixo
        g.lineStyle(2, INK, 0.8); g.strokeRect(1, 1, T - 2, T - 2);
        g.generateTexture(key, T, T);
    };
    block('block_wood',   0xa9743f, 0x84582d, 0xc98f57);
    block('block_carpet', 0x5b7bd5, 0x4763ac, 0x7b97e8);
    block('block_tile',   0xd8d8d0, 0xb2b2a8, 0xefefe8);
    block('block_desk',   0x7a5230, 0x5e3d20, 0x976a41);
    block('block_attic',  0x5a4a42, 0x453830, 0x6e5a50);

    // ---------- TV (desligada e ligada) ----------
    const tv = (key, on) => {
        g.clear();
        g.lineStyle(3, 0x6e6e78);
        g.lineBetween(42, 16, 20, 2); g.lineBetween(42, 16, 64, 2); // antenas
        g.fillStyle(0x6e6e78); g.fillCircle(20, 2, 3); g.fillCircle(64, 2, 3);
        g.fillStyle(0x3a3a44); g.fillRoundedRect(2, 14, 80, 54, 8);  // caixa
        g.lineStyle(2.5, INK); g.strokeRoundedRect(2, 14, 80, 54, 8);
        g.fillStyle(0x24242c); g.fillRoundedRect(2, 14, 80, 6, { tl: 8, tr: 8, bl: 0, br: 0 });
        if (on) {
            g.fillStyle(0x9be8ff); g.fillRoundedRect(9, 24, 54, 38, 5);
            g.fillStyle(0xffffff, 0.9); g.fillCircle(36, 42, 8);
            g.fillStyle(0xfff3b0, 0.8); g.fillRect(12, 27, 10, 32);
        } else {
            g.fillStyle(0x1c2340); g.fillRoundedRect(9, 24, 54, 38, 5);
            g.fillStyle(0x3d4a7a, 0.8); g.fillRect(14, 27, 8, 30);   // reflexo
        }
        g.lineStyle(2, INK); g.strokeRoundedRect(9, 24, 54, 38, 5);
        g.fillStyle(0x8a8a96); g.fillCircle(72, 32, 4); g.fillCircle(72, 46, 4); // botões
        g.lineStyle(1.5, INK); g.strokeCircle(72, 32, 4); g.strokeCircle(72, 46, 4);
        g.fillStyle(0x24242c); g.fillRect(12, 68, 12, 6); g.fillRect(60, 68, 12, 6); // pés
        g.generateTexture(key, 84, 74);
    };
    tv('tv_off', false);
    tv('tv_on', true);

    // ---------- perigos ----------
    g.clear(); // tênis
    g.fillStyle(0xd90429); g.fillRoundedRect(0, 4, 36, 14, { tl: 6, tr: 3, bl: 0, br: 0 });
    g.fillRoundedRect(24, 0, 20, 18, { tl: 8, tr: 8, bl: 0, br: 0 });
    g.fillStyle(0xffffff); g.fillRoundedRect(0, 15, 44, 7, { bl: 3, br: 3, tl: 0, tr: 0 }); // sola
    g.fillStyle(0xf1f1f1); g.fillRect(6, 8, 3, 5); g.fillRect(13, 8, 3, 5); // cadarço
    g.lineStyle(2, INK); g.strokeRoundedRect(0.5, 0.5, 43, 21, 4);
    g.generateTexture('sneaker', 44, 22);

    const lego = (key, color, dark) => {
        g.clear();
        g.fillStyle(color); g.fillRoundedRect(0, 8, 26, 14, 2);
        g.fillRoundedRect(3, 2, 7, 7, 2); g.fillRoundedRect(15, 2, 7, 7, 2); // pinos
        g.fillStyle(dark); g.fillRect(0, 18, 26, 4);
        g.lineStyle(1.5, INK); g.strokeRoundedRect(0, 8, 26, 14, 2);
        g.strokeRoundedRect(3, 2, 7, 7, 2); g.strokeRoundedRect(15, 2, 7, 7, 2);
        g.generateTexture(key, 26, 22);
    };
    lego('lego_red', 0xe63946, 0xb52734);
    lego('lego_blue', 0x2a6fdb, 0x1d55af);

    g.clear(); // pilha de livros
    g.fillStyle(0x9d4edd); g.fillRoundedRect(0, 8, 38, 8, 2);
    g.fillStyle(0xefe9f7); g.fillRect(34, 9, 3, 6);
    g.fillStyle(0xff9f1c); g.fillRoundedRect(4, 0, 30, 8, 2);
    g.fillStyle(0xfff3e0); g.fillRect(30, 1, 3, 6);
    g.lineStyle(1.5, INK); g.strokeRoundedRect(0, 8, 38, 8, 2); g.strokeRoundedRect(4, 0, 30, 8, 2);
    g.generateTexture('book', 38, 16);

    // ---------- estrela ----------
    g.clear();
    const pts = [];
    for (let i = 0; i < 10; i++) {
        const ang = -Math.PI / 2 + i * Math.PI / 5;
        const r = i % 2 === 0 ? 10 : 4.2;
        pts.push({ x: 11 + Math.cos(ang) * r, y: 11 + Math.sin(ang) * r });
    }
    g.fillStyle(0xffd23f); g.fillPoints(pts, true);
    g.lineStyle(1.8, 0xb8860b); g.strokePoints(pts, true);
    g.fillStyle(0xfff3b0); g.fillCircle(11, 10, 2.5);
    g.generateTexture('star', 22, 22);

    // ---------- robô (fofinho estilo mangá) ----------
    g.clear();
    g.fillStyle(0x333640); g.fillRoundedRect(2, 24, 30, 8, 4);    // esteira
    g.fillStyle(0x777d8a); g.fillCircle(8, 28, 3); g.fillCircle(17, 28, 3); g.fillCircle(26, 28, 3);
    g.fillStyle(0x9aa5b1); g.fillRoundedRect(4, 8, 26, 16, 5);    // corpo
    g.fillStyle(0xb8c2cc); g.fillRoundedRect(4, 8, 26, 4, { tl: 5, tr: 5, bl: 0, br: 0 });
    g.lineStyle(2, INK); g.strokeRoundedRect(4, 8, 26, 16, 5);
    g.fillStyle(0xffffff); g.fillEllipse(12, 15, 7, 8);           // olhões
    g.fillEllipse(22, 15, 7, 8);
    g.lineStyle(1.2, INK); g.strokeEllipse(12, 15, 7, 8); g.strokeEllipse(22, 15, 7, 8);
    g.fillStyle(0xff4757); g.fillCircle(12, 16, 2); g.fillCircle(22, 16, 2);
    g.fillStyle(0xffffff); g.fillCircle(11.3, 15.2, 0.8); g.fillCircle(21.3, 15.2, 0.8);
    g.lineStyle(2, 0x777d8a); g.lineBetween(17, 8, 17, 2);        // antena
    g.fillStyle(0xff4757); g.fillCircle(17, 2, 2.5);
    g.generateTexture('robot', 34, 32);

    // ---------- almofada-mola ----------
    g.clear();
    g.fillStyle(0xff7096); g.fillRoundedRect(2, 4, 40, 12, 5);
    g.fillStyle(0xffa5c0); g.fillRoundedRect(2, 4, 40, 5, { tl: 5, tr: 5, bl: 0, br: 0 });
    g.fillStyle(0xd44d74); g.fillRect(2, 13, 40, 3);
    g.lineStyle(1.8, INK); g.strokeRoundedRect(2, 4, 40, 12, 5);
    g.fillStyle(0xb23557); g.fillCircle(22, 10, 2.5);             // botão central
    g.fillStyle(0xd44d74); g.fillRoundedRect(0, 15, 44, 3, 1);    // base
    g.generateTexture('cushion', 44, 18);

    // ---------- plataforma móvel ----------
    g.clear();
    g.fillStyle(0xc98f57); g.fillRoundedRect(0, 0, 96, 14, 4);
    g.fillStyle(0xe0aa70); g.fillRoundedRect(0, 0, 96, 4, { tl: 4, tr: 4, bl: 0, br: 0 });
    g.fillStyle(0x84582d); g.fillRect(0, 11, 96, 3);
    g.lineStyle(2, INK); g.strokeRoundedRect(0, 0, 96, 14, 4);
    g.fillStyle(0x5e5e66); g.fillCircle(8, 7, 2.5); g.fillCircle(88, 7, 2.5); // parafusos
    g.generateTexture('platform', 96, 14);

    // ---------- corações (HUD) ----------
    const heart = (key, color) => {
        g.clear();
        g.fillStyle(color);
        g.fillCircle(5, 6, 5); g.fillCircle(13, 6, 5);
        g.fillTriangle(1, 9, 17, 9, 9, 17);
        g.fillStyle(0xffffff, 0.5); g.fillCircle(5, 4.5, 1.6);
        g.generateTexture(key, 18, 18);
    };
    heart('heart', 0xff4d6d);
    heart('heart_empty', 0x5a5a6e);

    // ---------- partículas (formas um pouco mais orgânicas) ----------
    g.clear();
    g.fillStyle(0xffffff, 0.9); g.fillCircle(4, 4, 3.5);
    g.fillStyle(0xffffff, 0.35); g.fillCircle(3, 3, 1.6); // highlight
    g.generateTexture('dust', 8, 8);

    g.clear();
    g.fillStyle(0xfff3b0);
    g.fillRect(4.5, 0, 2, 11); g.fillRect(0, 4.5, 11, 2);
    g.fillStyle(0xffffff, 0.85); g.fillCircle(5.5, 5.5, 1.4);
    g.generateTexture('spark', 11, 11);

    g.clear();
    g.fillStyle(0xffffff); g.fillRoundedRect(0, 0, 8, 5, 1.5);
    g.generateTexture('confetti', 8, 5);

    // ---------- padrão de papel de parede ----------
    g.clear();
    g.fillStyle(0xffffff, 0.5);
    g.fillCircle(12, 12, 2); g.fillCircle(36, 36, 2);
    g.fillCircle(36, 12, 1.2); g.fillCircle(12, 36, 1.2);
    g.generateTexture('wallpaper', 48, 48);

    // ---------- decoração de fundo ----------
    g.clear(); // janela
    g.fillStyle(0x8a5a2e); g.fillRoundedRect(0, 0, 110, 130, 4);
    gradientStrips(g, 8, 8, 94, 114, 0x9fd8ff, 0xd8f0ff, 8);
    g.fillStyle(0xffffff, 0.9); g.fillRoundedRect(18, 30, 30, 8, 4); g.fillRoundedRect(30, 38, 30, 8, 4);
    g.fillRoundedRect(55, 70, 34, 8, 4);
    g.fillStyle(0xffd23f); g.fillCircle(80, 26, 9);              // sol
    g.fillStyle(0x8a5a2e); g.fillRect(51, 8, 8, 114); g.fillRect(8, 61, 94, 8); // travessas
    g.lineStyle(2, INK, 0.7); g.strokeRoundedRect(0, 0, 110, 130, 4);
    g.generateTexture('window', 110, 130);

    g.clear(); // sofá
    g.fillStyle(0xc45b4e); g.fillRoundedRect(10, 8, 140, 34, 8); // encosto
    g.fillStyle(0xd97a6c); g.fillRoundedRect(0, 34, 160, 24, 6); // assento
    g.fillStyle(0xc45b4e); g.fillRoundedRect(0, 24, 24, 40, 8); g.fillRoundedRect(136, 24, 24, 40, 8); // braços
    g.fillStyle(0xa8443a); g.fillRect(78, 36, 4, 20);            // divisão almofadas
    g.fillStyle(0x5e3d20); g.fillRect(12, 64, 10, 10); g.fillRect(138, 64, 10, 10); // pés
    g.lineStyle(2, INK, 0.6); g.strokeRoundedRect(0, 24, 24, 40, 8); g.strokeRoundedRect(136, 24, 24, 40, 8);
    g.generateTexture('sofa', 160, 74);

    g.clear(); // quadro
    g.fillStyle(0xd4a017); g.fillRoundedRect(0, 0, 58, 68, 3);
    g.fillStyle(0xeef2f5); g.fillRect(6, 6, 46, 56);
    g.fillStyle(0x80b918); g.fillTriangle(10, 56, 30, 26, 48, 56); // montanha
    g.fillStyle(0x55952c); g.fillTriangle(24, 56, 42, 34, 52, 56);
    g.fillStyle(0xffd23f); g.fillCircle(17, 17, 6);              // sol
    g.lineStyle(2, INK, 0.6); g.strokeRoundedRect(0, 0, 58, 68, 3);
    g.generateTexture('painting', 58, 68);

    g.clear(); // planta
    g.fillStyle(0x2d6a4f); g.fillCircle(26, 26, 16);
    g.fillStyle(0x40916c); g.fillCircle(14, 36, 12); g.fillCircle(38, 36, 12);
    g.fillStyle(0x2d6a4f); g.fillCircle(26, 44, 12);
    g.fillStyle(0xb5651d); g.fillRoundedRect(12, 54, 28, 26, { tl: 2, tr: 2, bl: 6, br: 6 });
    g.fillStyle(0x94500f); g.fillRect(12, 54, 28, 6);
    g.lineStyle(2, INK, 0.5); g.strokeRoundedRect(12, 54, 28, 26, { tl: 2, tr: 2, bl: 6, br: 6 });
    g.generateTexture('plant', 52, 84);

    g.clear(); // abajur de pé
    g.fillStyle(0xffd166); g.fillTriangle(4, 34, 34, 34, 28, 4);
    g.fillTriangle(4, 34, 10, 4, 28, 4);
    g.fillStyle(0x5e5e66); g.fillRect(17, 34, 5, 56);
    g.fillRoundedRect(6, 90, 27, 8, 3);
    g.generateTexture('lamp', 39, 98);

    g.clear(); // estante com livros
    g.fillStyle(0x8a5a2e); g.fillRoundedRect(0, 0, 110, 140, 4);
    g.fillStyle(0x6d4522);
    g.fillRect(8, 8, 94, 34); g.fillRect(8, 52, 94, 34); g.fillRect(8, 96, 94, 34);
    const bookColors = [0xe63946, 0x2a6fdb, 0xffd23f, 0x80b918, 0x9d4edd, 0xff9f1c];
    for (let shelfIdx = 0; shelfIdx < 3; shelfIdx++) {
        const by = 8 + shelfIdx * 44;
        for (let bi = 0; bi < 6; bi++) {
            g.fillStyle(bookColors[(bi + shelfIdx * 2) % bookColors.length]);
            g.fillRect(12 + bi * 15, by + 8, 11, 26);
        }
    }
    g.lineStyle(2, INK, 0.6); g.strokeRoundedRect(0, 0, 110, 140, 4);
    g.generateTexture('shelf', 110, 140);

    g.clear(); // geladeira
    g.fillStyle(0xdfe7ea); g.fillRoundedRect(0, 0, 64, 120, 6);
    g.fillStyle(0xc3ced4); g.fillRect(0, 44, 64, 4);
    g.fillStyle(0x8a969c); g.fillRoundedRect(52, 14, 5, 22, 2); g.fillRoundedRect(52, 56, 5, 34, 2);
    g.fillStyle(0xf2f7f9); g.fillRoundedRect(0, 0, 64, 5, { tl: 6, tr: 6, bl: 0, br: 0 });
    g.lineStyle(2, INK, 0.5); g.strokeRoundedRect(0, 0, 64, 120, 6);
    g.generateTexture('fridge', 64, 120);

    g.clear(); // mesa
    g.fillStyle(0x8a5a2e); g.fillRoundedRect(0, 0, 130, 12, 3);
    g.fillStyle(0xa9743f); g.fillRect(0, 0, 130, 4);
    g.fillStyle(0x6d4522); g.fillRect(8, 12, 10, 52); g.fillRect(112, 12, 10, 52);
    g.generateTexture('table', 130, 64);

    g.clear(); // caixa de papelão
    g.fillStyle(0xc89b6a); g.fillRoundedRect(0, 6, 64, 46, 3);
    g.fillStyle(0xb0854f); g.fillRect(0, 6, 64, 8);
    g.fillStyle(0xe8cfa0); g.fillRect(28, 6, 8, 46);             // fita
    g.fillStyle(0x8a6a3e); g.fillRect(6, 24, 20, 12);            // "etiqueta"
    g.lineStyle(2, INK, 0.5); g.strokeRoundedRect(0, 6, 64, 46, 3);
    g.generateTexture('box', 64, 52);

    // ---------- botão dos controles de toque ----------
    g.clear();
    g.fillStyle(0xffffff, 0.9); g.fillCircle(42, 42, 40);
    g.lineStyle(4, 0x333333, 0.6); g.strokeCircle(42, 42, 40);
    g.generateTexture('btn', 84, 84);

    g.destroy();
}
