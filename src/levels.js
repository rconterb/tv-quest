// Dados das fases — mapas longos com dificuldade progressiva e saltos viáveis.
// Legenda:
//   #  bloco    T  TV    t/l/b  perigos    c  estrela
//   r  robô     s  mola  m/v  plataforma móvel    P  spawn
//
// Regras de design (ver src/physics.js → REACH):
//   gap no chão com pulo simples ≤ 4 tiles (confortável: 3)
//   gap com pulo duplo ≤ 6 tiles (confortável: 5)
//   altura com pulo simples ≤ 2 tiles; com duplo ≤ 4
//   mola sobe ~5 tiles (e ainda permite pulo duplo no ar)
// Plataformas intermediárias sempre que o gap passar do teto.

export const TILE = 48;
export const ROWS = 11;

const g = (n) => '#'.repeat(n);
const d = (n) => '.'.repeat(n);

export const THEMES = {
    sala: {
        name: 'Sala de Estar',
        wallTop: 0xfffaf2, wallBottom: 0xecd2a8, wallMid: 0xf5e6d0,
        floor: 0xc4a06a, accent: 0xe8a070, block: 'block_wood',
        decor: ['sofa', 'plant', 'lamp', 'shelf'], curtainTint: 0xe07070
    },
    quarto: {
        name: 'Quarto',
        wallTop: 0xf4f8ff, wallBottom: 0xb8cce8, wallMid: 0xd8e4f8,
        floor: 0x6a8ec0, accent: 0x90b0e8, block: 'block_carpet',
        decor: ['shelf', 'box', 'plant', 'lamp'], curtainTint: 0x7090d0
    },
    cozinha: {
        name: 'Cozinha',
        wallTop: 0xf6fbf7, wallBottom: 0xb8dcc8, wallMid: 0xd8eee0,
        floor: 0xd0ccc0, accent: 0x80c0a0, block: 'block_tile',
        decor: ['fridge', 'table', 'plant', 'shelf'], curtainTint: 0x70b090
    },
    corredor: {
        name: 'Corredor',
        wallTop: 0xfff6f8, wallBottom: 0xe8b8c8, wallMid: 0xf0d0d8,
        floor: 0xc4a06a, accent: 0xe090a0, block: 'block_wood',
        decor: ['lamp', 'plant', 'shelf'], curtainTint: 0xd07090
    },
    escritorio: {
        name: 'Escritório',
        wallTop: 0xfbf7ee, wallBottom: 0xd8c8a8, wallMid: 0xece0c8,
        floor: 0xa88858, accent: 0xc0a070, block: 'block_desk',
        decor: ['shelf', 'lamp', 'plant', 'table'], curtainTint: 0xb09060
    },
    sotao: {
        name: 'Sótão',
        wallTop: 0x8a7e98, wallBottom: 0x3a3048, wallMid: 0x5a4e68,
        floor: 0x6a5a50, accent: 0xa08070, block: 'block_attic',
        decor: ['box', 'shelf', 'lamp'], curtainTint: 0x706080
    }
};

export const levels = [
    // 1 — tutorial: chão contínuo, molas, estrelas e TV. Sem perigo real.
    {
        theme: 'sala',
        title: 'A Sala de Estar',
        tip: 'Setas para andar, ESPAÇO para pular (e de novo no ar)!',
        rows: [
            '',
            '',
            d(42) + 'c',
            d(28) + 'c' + d(16) + 'c',
            d(50) + '###',
            d(18) + 'c' + d(14) + 'c' + d(12) + 'c',
            d(36) + '##' + d(8) + '##',
            d(10) + 'c' + d(12) + 'c' + d(14) + 'c' + d(10) + 'c',
            d(30) + 's' + d(12) + 's',
            d(2) + 'P' + d(16) + 's' + d(18) + 's' + d(12) + 'T',
            g(64)
        ]
    },

    // 2 — obstáculos no chão + plataformas de 2 tiles (pulo simples)
    {
        theme: 'sala',
        title: 'Bagunça na Sala',
        tip: 'Pule por cima dos brinquedos e use as molas!',
        rows: [
            '',
            d(58) + 'c',
            d(40) + 'c' + d(14) + 'c',
            d(54) + '###',
            d(22) + 'c' + d(12) + '##' + d(10) + 'c',
            d(14) + '##' + d(16) + 'c' + d(10) + '##',
            d(8) + 'c' + d(10) + 'c' + d(12) + 'c' + d(12) + 'c',
            d(28) + '##' + d(14) + 's' + d(8) + '##',
            d(6) + 'c' + d(10) + 'c' + d(14) + 'c' + d(12) + 'c',
            d(2) + 'P' + d(5) + 't' + d(5) + 'l' + d(5) + 'b' + d(5) + 't' + d(5) + 'l' + d(4) + 's' + d(6) + 'b' + d(5) + 'T',
            g(70)
        ]
    },

    // 3 — buracos de 3 tiles (pulo simples confortável); um de 4 no final
    {
        theme: 'quarto',
        title: 'O Quarto das Crianças',
        tip: 'Cuidado com os buracos — corra e pule com confiança!',
        rows: [
            '',
            d(55) + 'c',
            d(32) + 'c' + d(18) + 'c',
            d(48) + '##',
            d(20) + 'c' + d(14) + 'c' + d(12) + 'c',
            d(16) + '##' + d(10) + '###' + d(8) + '##',
            d(8) + 'c' + d(12) + 'c' + d(12) + 'c' + d(10) + 'c',
            d(36) + 's' + d(10) + '##',
            d(10) + 'c' + d(10) + 'c' + d(12) + 'c' + d(10) + 'c',
            d(2) + 'P' + d(8) + 'l' + d(10) + 't' + d(10) + 'b' + d(8) + 'l' + d(8) + 'T',
            // gaps: 3, 3, 3, 4 — todos ≤ MAX_GAP_SINGLE (4)
            g(10) + d(3) + g(8) + d(3) + g(10) + d(3) + g(8) + d(4) + g(14)
        ]
    },

    // 4 — robôs em série; plataformas para escape vertical
    {
        theme: 'quarto',
        title: 'Robôs de Brinquedo',
        tip: 'Pule NA CABEÇA dos robôs. Encostar do lado dói!',
        rows: [
            '',
            d(52) + 'c' + d(10) + 'c',
            d(34) + 'c' + d(16) + 'c',
            d(50) + '####',
            d(18) + 'c' + d(14) + 'c' + d(14) + 'c',
            d(14) + '###' + d(12) + '###' + d(10) + '###',
            d(6) + 'c' + d(12) + 'c' + d(14) + 'c' + d(12) + 'c',
            d(28) + 's' + d(16) + 's' + d(10) + '##',
            d(8) + 'r' + d(10) + 'r' + d(10) + 'r' + d(10) + 'r',
            d(2) + 'P' + d(7) + 'r' + d(7) + 'r' + d(7) + 'r' + d(7) + 'r' + d(6) + 'b' + d(5) + 'r' + d(6) + 'T',
            g(74)
        ]
    },

    // 5 — plataformas móveis + buracos de 4–5 tiles (pulo / duplo)
    {
        theme: 'cozinha',
        title: 'A Cozinha',
        tip: 'Plataformas móveis: espere o timing certo!',
        rows: [
            '',
            d(58) + 'c',
            d(42) + 'c' + d(12) + 'c',
            d(20) + 'c' + d(18) + 'c' + d(12) + 'c',
            d(52) + '###',
            // m's em linha intermediária — gaps entre elas ≤ 4
            d(10) + 'm' + d(8) + 'm' + d(8) + 'm' + d(10) + 'c',
            d(6) + 'c' + d(12) + 'c' + d(12) + 'c' + d(12) + 'c',
            d(36) + 'v' + d(10) + '###',
            d(8) + 'c' + d(14) + 'c' + d(14) + 't' + d(10) + 'c',
            d(2) + 'P' + d(12) + 't' + d(10) + 'l' + d(10) + 't' + d(10) + 'b' + d(8) + 'T',
            // gaps no chão: 4, 4, 5 — o de 5 pede corrida + pulo (ou plataforma m/v acima)
            g(12) + d(4) + g(8) + d(4) + g(8) + d(5) + g(20)
        ]
    },

    // 6 — escalada: degraus de 2 tiles + mola + plataforma vertical
    {
        theme: 'cozinha',
        title: 'A Grande Escalada',
        tip: 'Suba até o topo — a TV está lá em cima!',
        rows: [
            d(62) + 'c' + d(2) + 'T',
            d(62) + g(6),
            d(50) + 'c' + d(8) + 'c',
            d(56) + '####',
            d(18) + 'c' + d(18) + 'c' + d(12) + 's',
            d(44) + 'v' + d(6) + '###',
            d(10) + 'c' + d(14) + 'c' + d(14) + 'c',
            // degraus: ## a cada ~6 tiles (alcançáveis com pulo simples/duplo)
            d(24) + '###' + d(8) + 'm' + d(8) + '###',
            d(6) + 'c' + d(10) + 'c' + d(12) + 'c' + d(12) + 'c',
            d(2) + 'P' + d(8) + 'r' + d(10) + 't' + d(8) + 'r' + d(10) + 'l' + d(8) + 'r',
            g(72)
        ]
    },

    // 7 — ritmo: obstáculos densos, buracos pequenos, robôs no caminho
    {
        theme: 'corredor',
        title: 'O Corredor Maluco',
        tip: 'Ritmo e coragem! Molas e robôs na sequência.',
        rows: [
            '',
            d(68) + 'c',
            d(38) + 'c' + d(18) + 'c',
            d(60) + '##',
            d(22) + 'c' + d(18) + 'c' + d(14) + 'c',
            d(12) + '###' + d(12) + '###' + d(12) + '###',
            d(6) + 'c' + d(10) + 'c' + d(10) + 'c' + d(10) + 'c' + d(10) + 'c',
            d(46) + 's' + d(8) + '#' + d(6) + 's',
            d(14) + 'r' + d(8) + 'r' + d(8) + 'r' + d(10) + 'r',
            d(2) + 'P' + d(4) + 't' + d(4) + 'l' + d(4) + 'r' + d(4) + 's' + d(4) + 't' + d(4) + 'r' + d(4) + 'b' + d(4) + 'l' + d(4) + 'r' + d(4) + 's' + d(5) + 'T',
            // um buraco de 3 no meio para quebrar o ritmo (ainda fácil)
            g(28) + d(3) + g(20) + d(3) + g(28)
        ]
    },

    // 8 — precisão: plataformas flutuantes com gaps de 3–4; chão com ilhas
    {
        theme: 'escritorio',
        title: 'O Escritório',
        tip: 'Plataformas curtas — um passo em falso e cai!',
        rows: [
            '',
            d(66) + 'c',
            d(46) + 'c' + d(12) + 'c',
            d(28) + 'c' + d(18) + 'c',
            d(56) + '##',
            // plataformas altas: gap 4 entre blocos de 2 (pulo simples com corrida)
            d(10) + 'c' + d(8) + '##' + d(8) + 'c' + d(8) + '##' + d(8) + 'c',
            // linha principal de plataformas: ## + gap 3 + ## (sempre viável)
            d(6) + '##' + d(3) + '##' + d(3) + '##' + d(3) + '##' + d(3) + '##' + d(3) + '##' + d(3) + '##',
            d(16) + 'c' + d(10) + 'c' + d(10) + 'c' + d(10) + 'c',
            // plataformas baixas + móveis para atalhos
            d(12) + '##' + d(6) + 'm' + d(6) + '##' + d(6) + 'v' + d(6) + '##',
            d(2) + 'P' + d(8) + 'l' + d(10) + 'b' + d(10) + 't' + d(10) + 'l' + d(8) + 'T',
            // ilhas no chão: gaps de 4 (máximo do pulo simples) — força uso das plataformas
            g(10) + d(4) + g(6) + d(4) + g(6) + d(4) + g(6) + d(4) + g(6) + d(4) + g(12)
        ]
    },

    // 9 — sótão: mistura buracos 3–4, robôs e molas
    {
        theme: 'sotao',
        title: 'O Sótão Misterioso',
        tip: 'A TV está perto… mas o chão é traiçoeiro!',
        rows: [
            '',
            d(62) + 'c',
            d(38) + 'c' + d(16) + 'c',
            d(52) + '###',
            d(20) + 'c' + d(14) + 'c' + d(14) + 'c',
            d(14) + '###' + d(8) + 'm' + d(8) + '###',
            d(8) + 'c' + d(12) + 'c' + d(12) + 'c' + d(12) + 'c',
            d(26) + 's' + d(16) + 's' + d(10) + '###',
            d(6) + 'r' + d(10) + 'r' + d(10) + 'r' + d(10) + 'r',
            d(2) + 'P' + d(5) + 'r' + d(6) + 'l' + d(6) + 'r' + d(6) + 'b' + d(6) + 'r' + d(6) + 't' + d(6) + 'T',
            // gaps 3–4 intercalados (viáveis; pressão dos robôs é o desafio)
            g(12) + d(3) + g(8) + d(4) + g(10) + d(3) + g(8) + d(4) + g(16)
        ]
    },

    // 10 — final: longo, vertical e denso, mas cada salto tem rota clara
    {
        theme: 'sotao',
        title: 'O Desafio Final',
        tip: 'A TV lendária no topo! Use tudo que aprendeu.',
        rows: [
            d(70) + 'c' + d(2) + 'T',
            d(70) + g(6),
            d(54) + 'c' + d(10) + 'c',
            d(64) + '####',
            d(22) + 'c' + d(18) + 'c' + d(14) + 's',
            d(50) + 'v' + d(8) + '###',
            d(12) + 'c' + d(12) + 'm' + d(12) + 'c' + d(10) + '##',
            d(36) + 'c' + d(12) + 'c' + d(10) + 's',
            // degraus intermediários: gap 4 entre ### (pulo simples/duplo)
            d(8) + 'c' + d(6) + '###' + d(4) + 'm' + d(4) + '###' + d(4) + 's' + d(4) + '###' + d(6) + 'c',
            d(2) + 'P' + d(5) + 'r' + d(4) + 's' + d(5) + 'r' + d(4) + 'l' + d(4) + 'r' + d(4) + 'b' + d(4) + 'r' + d(4) + 't' + d(4) + 'r',
            // gaps no chão 4–5 (o de 5 pede corrida + duplo ou mola no caminho)
            g(14) + d(4) + g(10) + d(4) + g(12) + d(5) + g(24)
        ]
    }
];

for (const lvl of levels) {
    const width = Math.max(...lvl.rows.map(r => r.length));
    lvl.rows = lvl.rows.map(r => r.padEnd(width, '.'));
    lvl.width = width;
    lvl.totalStars = lvl.rows.join('').split('c').length - 1;
}
