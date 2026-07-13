// Todas as texturas do jogo são geradas em tempo real (pixel art procedural estilo mangá:
// contornos de nanquim, olhos grandes, cel shading)
import { TILE } from './levels.js';

const INK = 0x2b1e16; // cor do traço "nanquim"

// Desenha um degradê vertical em faixas (funciona em WebGL e Canvas)
export function gradientStrips(g, x, y, w, h, topColor, bottomColor, steps = 12) {
    const top = Phaser.Display.Color.ValueToColor(topColor);
    const bottom = Phaser.Display.Color.ValueToColor(bottomColor);
    const stripH = h / steps;
    for (let i = 0; i < steps; i++) {
        const c = Phaser.Display.Color.Interpolate.ColorWithColor(top, bottom, steps - 1, i);
        g.fillStyle(Phaser.Display.Color.GetColor(c.r, c.g, c.b));
        g.fillRect(x, y + i * stripH, w, stripH + 1);
    }
}

// Olhos pequenos e delicados: oval escuro com brilho (chibi fofo, sem exagero)
function mangaEye(g, cx, cy, irisColor, lashDir = 0) {
    g.fillStyle(irisColor); g.fillEllipse(cx, cy, 4.5, 6);
    g.fillStyle(0xffffff); g.fillCircle(cx - 1, cy - 1.5, 1);
    if (lashDir !== 0) {
        g.lineStyle(1.2, INK);
        g.lineBetween(cx + 2.5 * lashDir, cy - 3, cx + 4 * lashDir, cy - 4.5);
    }
}

function mangaMouthAndBlush(g, cx, cy) {
    g.lineStyle(1.5, 0x9c4a35);
    g.beginPath();
    g.arc(cx, cy, 2.5, Math.PI * 0.15, Math.PI * 0.85, false);
    g.strokePath();
    g.fillStyle(0xff9aa2, 0.35);
    g.fillCircle(cx - 10, cy - 2.5, 2.2); g.fillCircle(cx + 10, cy - 2.5, 2.2);
}

export function generateTextures(scene) {
    if (scene.textures.exists('block_wood')) return; // já gerado nesta sessão
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    const T = TILE;

    // ---------- pixel branco básico ----------
    g.clear(); g.fillStyle(0xffffff); g.fillRect(0, 0, 10, 10);
    g.generateTexture('px', 10, 10);

    // ================= PERSONAGENS (chibi mangá) =================

    // --- cabeça do menino: pele branca, cabelo castanho claro espetado ---
    g.clear();
    const boySkin = 0xffe3d0, boyHair = 0xb08954;
    g.fillStyle(boySkin); g.fillRoundedRect(4, 10, 32, 26, 10);
    g.lineStyle(2, INK); g.strokeRoundedRect(4, 10, 32, 26, 10);
    g.fillStyle(boyHair);
    g.fillRoundedRect(2, 2, 36, 13, { tl: 12, tr: 12, bl: 3, br: 3 });
    g.fillTriangle(4, 13, 11, 13, 7, 21);      // franja espetada
    g.fillTriangle(12, 13, 19, 13, 15, 22);
    g.fillTriangle(20, 13, 27, 13, 23, 22);
    g.fillTriangle(28, 13, 35, 13, 32, 20);
    g.lineStyle(2, INK);
    g.strokeRoundedRect(2, 2, 36, 13, { tl: 12, tr: 12, bl: 3, br: 3 });
    mangaEye(g, 15, 24.5, 0x3a2a1e);
    mangaEye(g, 26, 24.5, 0x3a2a1e);
    mangaMouthAndBlush(g, 20.5, 30.5);
    g.generateTexture('head_boy', 40, 38);

    // --- cabeça da menina: pele morena, cabelo comprido escuro em mechas laterais ---
    g.clear();
    const girlSkin = 0xc98a5e, girlHair = 0x35221a, girlHairLight = 0x4d3325;
    g.fillStyle(girlHair);                      // mechas compridas dos lados (afastadas do rosto)
    g.fillRoundedRect(1, 10, 8, 38, { tl: 2, tr: 2, bl: 5, br: 5 });
    g.fillRoundedRect(35, 10, 8, 38, { tl: 2, tr: 2, bl: 5, br: 5 });
    g.lineStyle(2, INK);
    g.strokeRoundedRect(1, 10, 8, 38, { tl: 2, tr: 2, bl: 5, br: 5 });
    g.strokeRoundedRect(35, 10, 8, 38, { tl: 2, tr: 2, bl: 5, br: 5 });
    g.fillStyle(girlSkin);                      // rosto (contorno suave em tom de pele, sem "barba")
    g.fillRoundedRect(10, 12, 24, 22, 8);
    g.lineStyle(1.5, 0x9c6a44); g.strokeRoundedRect(10, 12, 24, 22, 8);
    g.fillStyle(girlHair);                      // topo + franja
    g.fillRoundedRect(4, 3, 36, 13, { tl: 14, tr: 14, bl: 3, br: 3 });
    g.lineStyle(2, INK); g.strokeRoundedRect(4, 3, 36, 13, { tl: 14, tr: 14, bl: 3, br: 3 });
    g.fillStyle(girlHairLight);                 // brilho do cabelo
    g.fillRoundedRect(9, 5, 9, 3.5, 2);
    g.fillStyle(0xd9273e);                      // lacinho vermelho
    g.fillTriangle(33, 4, 39, 1, 38, 8);
    g.fillTriangle(33, 4, 28, 1, 29, 8);
    g.fillCircle(33, 4, 2);
    mangaEye(g, 17, 24.5, 0x2e1f14, -1);
    mangaEye(g, 27, 24.5, 0x2e1f14, 1);
    mangaMouthAndBlush(g, 22, 30.5);
    g.generateTexture('head_girl', 44, 54);

    // --- tronco do menino: camiseta preta do AC/DC (via RenderTexture p/ o texto) ---
    g.clear();
    g.fillStyle(0x191919); g.fillRoundedRect(0, 0, 26, 20, 5);
    g.lineStyle(2, INK); g.strokeRoundedRect(0, 0, 26, 20, 5);
    g.fillStyle(0x333333); g.fillRoundedRect(2, 1, 22, 4, 2);   // brilho da malha
    g.fillStyle(0xffd23f);                                       // raio ⚡ do logo
    g.fillTriangle(14, 4.5, 11.5, 10.5, 13.5, 10);
    g.fillTriangle(13, 10, 15, 9.5, 12, 15.5);
    const rtBoy = scene.make.renderTexture({ width: 26, height: 20, add: false });
    rtBoy.draw(g, 0, 0);
    const acdcStyle = {
        fontFamily: 'Arial Black, Arial, sans-serif', fontSize: '7px',
        fontStyle: 'bold', color: '#ffffff'
    };
    const tAC = scene.make.text({ add: false, text: 'AC', style: acdcStyle });
    const tDC = scene.make.text({ add: false, text: 'DC', style: acdcStyle });
    rtBoy.draw(tAC, 1, 6); rtBoy.draw(tDC, 15.5, 6);
    tAC.destroy(); tDC.destroy();
    rtBoy.saveTexture('torso_boy'); // (o RT precisa continuar vivo para manter a textura)

    // --- tronco da menina: vestido verde-água ---
    g.clear();
    const dress = 0x2fb8ac, dressDark = 0x1f8d84;
    g.fillStyle(dress);
    g.fillPoints([{ x: 8, y: 0 }, { x: 22, y: 0 }, { x: 28, y: 25 }, { x: 2, y: 25 }], true);
    g.lineStyle(2, INK);
    g.strokePoints([{ x: 8, y: 0 }, { x: 22, y: 0 }, { x: 28, y: 25 }, { x: 2, y: 25 }], true);
    g.fillStyle(dressDark);                                      // barra da saia
    g.fillPoints([{ x: 3.5, y: 21 }, { x: 26.5, y: 21 }, { x: 28, y: 25 }, { x: 2, y: 25 }], true);
    g.fillStyle(0xffffff); g.fillCircle(15, 2.5, 2.6);           // golinha
    g.fillStyle(0xff9aa2);                                       // coração estampado
    g.fillCircle(13.4, 10, 1.7); g.fillCircle(16.6, 10, 1.7);
    g.fillTriangle(11.7, 11, 18.3, 11, 15, 15);
    g.generateTexture('torso_girl', 30, 26);

    // --- braços ---
    g.clear();                                                   // menino: manga preta + pele branca
    g.fillStyle(boySkin); g.fillRoundedRect(0, 0, 8, 18, 4);
    g.fillStyle(0x191919); g.fillRoundedRect(0, 0, 8, 7, { tl: 4, tr: 4, bl: 0, br: 0 });
    g.lineStyle(1.5, INK); g.strokeRoundedRect(0, 0, 8, 18, 4);
    g.generateTexture('arm_boy', 8, 18);

    g.clear();                                                   // menina: manguinha do vestido + pele morena
    g.fillStyle(girlSkin); g.fillRoundedRect(0, 0, 8, 18, 4);
    g.fillStyle(dress); g.fillRoundedRect(0, 0, 8, 6, { tl: 4, tr: 4, bl: 2, br: 2 });
    g.lineStyle(1.5, INK); g.strokeRoundedRect(0, 0, 8, 18, 4);
    g.generateTexture('arm_girl', 8, 18);

    // --- pernas ---
    g.clear();                                                   // menino: shorts jeans + tênis
    g.fillStyle(boySkin); g.fillRoundedRect(1, 6, 8, 9, 2);
    g.fillStyle(0x4a6d9e); g.fillRoundedRect(0, 0, 10, 8, { tl: 3, tr: 3, bl: 1, br: 1 });
    g.fillStyle(0xf1f1f1); g.fillRoundedRect(0, 14, 10, 6, { tl: 2, tr: 2, bl: 3, br: 3 });
    g.fillStyle(0xd90429); g.fillRect(0, 15.5, 10, 2);
    g.lineStyle(1.5, INK); g.strokeRoundedRect(0, 0, 10, 20, 3);
    g.generateTexture('leg_boy', 10, 20);

    g.clear();                                                   // menina: meia-calça vermelha + bota preta
    g.fillStyle(0xd9273e); g.fillRoundedRect(1, 0, 8, 13, 2);
    g.fillStyle(0x1c1c22); g.fillRoundedRect(0, 12, 10, 8, { tl: 2, tr: 2, bl: 3, br: 3 });
    g.fillStyle(0x3a3a44); g.fillRect(0, 12, 10, 2);             // cano da bota
    g.lineStyle(1.5, INK); g.strokeRoundedRect(0, 0, 10, 20, 3);
    g.generateTexture('leg_girl', 10, 20);

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

    // ---------- partículas ----------
    g.clear(); g.fillStyle(0xffffff); g.fillCircle(4, 4, 3.5);
    g.generateTexture('dust', 8, 8);

    g.clear(); g.fillStyle(0xfff3b0);
    g.fillRect(4, 0, 3, 11); g.fillRect(0, 4, 11, 3);
    g.generateTexture('spark', 11, 11);

    g.clear(); g.fillStyle(0xffffff); g.fillRect(0, 0, 8, 8);
    g.generateTexture('confetti', 8, 8);

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
