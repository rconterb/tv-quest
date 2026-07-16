// Dados das fases — mapas longos com dificuldade progressiva.
// Legenda:
//   #  bloco    T  TV    t/l/b  perigos    c  estrela
//   r  robô     s  mola  m/v  plataforma móvel    P  spawn

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
    // 1 — tutorial longo e amigável
    {
        theme: 'sala',
        title: 'A Sala de Estar',
        tip: 'Setas para andar, ESPAÇO para pular (e de novo no ar)!',
        rows: [
            '',
            '',
            '',
            d(50) + 'c',
            '',
            d(20) + 'c' + d(18) + 'c' + d(12) + 'c',
            d(48) + '###',
            d(12) + 'c' + d(10) + 'c' + d(10) + 'c' + d(14) + 'c',
            d(35) + 's' + d(8) + '###',
            d(2) + 'P' + d(18) + 's' + d(20) + 's' + d(14) + 'T',
            g(62)
        ]
    },
    // 2 — obstáculos no chão + plataformas
    {
        theme: 'sala',
        title: 'Bagunça na Sala',
        tip: 'Pule por cima dos brinquedos e use as molas!',
        rows: [
            '',
            '',
            d(55) + 'c',
            d(40) + 'c' + d(12) + 'c',
            d(54) + '###',
            d(28) + 'c' + d(8) + '###',
            d(18) + 'c' + d(20) + 'c',
            d(12) + '###' + d(14) + '###' + d(10) + '###',
            d(8) + 'c' + d(10) + 'c' + d(12) + 'c' + d(10) + 'c' + d(8) + 'c',
            d(2) + 'P' + d(6) + 't' + d(5) + 'l' + d(5) + 'b' + d(5) + 't' + d(5) + 'l' + d(5) + 's' + d(8) + 'b' + d(6) + 'T',
            g(68)
        ]
    },
    // 3 — buracos e precisão
    {
        theme: 'quarto',
        title: 'O Quarto das Crianças',
        tip: 'Cuidado com os buracos — pulo duplo salva!',
        rows: [
            '',
            d(58) + 'c',
            '',
            d(30) + 'c' + d(20) + 'c',
            d(50) + '##',
            d(22) + 'c' + d(14) + 'c' + d(12) + 'c',
            d(18) + '##' + d(12) + '###' + d(10) + '##',
            d(40) + 'c' + d(8) + 's',
            d(10) + 'c' + d(8) + 'c' + d(12) + 'c' + d(10) + 'c' + d(8) + 'c',
            d(2) + 'P' + d(8) + 'l' + d(12) + 't' + d(10) + 'b' + d(10) + 'l' + d(8) + 'T',
            g(12) + d(3) + g(8) + d(3) + g(10) + d(4) + g(8) + d(3) + g(16)
        ]
    },
    // 4 — robôs em série
    {
        theme: 'quarto',
        title: 'Robôs de Brinquedo',
        tip: 'Pule NA CABEÇA dos robôs. Encostar do lado dói!',
        rows: [
            '',
            '',
            d(50) + 'c' + d(8) + 'c',
            d(35) + 'c',
            d(48) + '####',
            d(20) + 'c' + d(16) + 'c' + d(12) + 'c',
            d(16) + '###' + d(14) + '###' + d(12) + '###',
            d(8) + 'c' + d(14) + 'c' + d(14) + 'c' + d(12) + 'c',
            d(30) + 's' + d(18) + 's',
            d(2) + 'P' + d(8) + 'r' + d(8) + 'r' + d(8) + 'r' + d(8) + 'r' + d(6) + 'b' + d(6) + 'r' + d(6) + 'T',
            g(72)
        ]
    },
    // 5 — plataformas móveis
    {
        theme: 'cozinha',
        title: 'A Cozinha',
        tip: 'Plataformas móveis: espere o timing certo!',
        rows: [
            '',
            d(60) + 'c',
            d(45) + 'c' + d(10) + 'c',
            '',
            d(20) + 'c' + d(20) + 'c' + d(12) + 'c',
            d(55) + '###',
            d(12) + 'm' + d(10) + 'm' + d(10) + 'm' + d(10) + 'c',
            d(8) + 'c' + d(14) + 'c' + d(14) + 'c' + d(12) + 'c',
            d(40) + 'v' + d(12) + '###',
            d(2) + 'P' + d(14) + 't' + d(12) + 'l' + d(12) + 't' + d(10) + 'b' + d(8) + 'T',
            g(14) + d(5) + g(8) + d(6) + g(8) + d(6) + g(22)
        ]
    },
    // 6 — escalada vertical longa
    {
        theme: 'cozinha',
        title: 'A Grande Escalada',
        tip: 'Suba até o topo — a TV está lá em cima!',
        rows: [
            d(70) + 'c' + d(2) + 'T',
            d(70) + g(6),
            d(55) + 'c' + d(10) + 'c',
            d(62) + '####',
            d(20) + 'c' + d(20) + 'c' + d(14) + 's',
            d(48) + 'v' + d(8) + '###',
            d(12) + 'c' + d(16) + 'c' + d(16) + 'c',
            d(28) + '###' + d(12) + 'm' + d(10) + '###',
            d(8) + 'c' + d(12) + 'c' + d(14) + 'c' + d(12) + 'c',
            d(2) + 'P' + d(10) + 'r' + d(12) + 't' + d(10) + 'r' + d(12) + 'l' + d(10) + 'r',
            g(76)
        ]
    },
    // 7 — corrida de obstáculos densa
    {
        theme: 'corredor',
        title: 'O Corredor Maluco',
        tip: 'Ritmo e coragem! Molas e robôs na sequência.',
        rows: [
            '',
            d(70) + 'c',
            d(40) + 'c' + d(20) + 'c',
            d(65) + '##',
            d(25) + 'c' + d(20) + 'c' + d(15) + 'c',
            d(15) + '###' + d(15) + '###' + d(15) + '###',
            d(8) + 'c' + d(12) + 'c' + d(12) + 'c' + d(12) + 'c' + d(12) + 'c',
            d(50) + 's' + d(10) + '#' + d(8) + 's',
            d(18) + 'r' + d(10) + 'r' + d(10) + 'r' + d(12) + 'r',
            d(2) + 'P' + d(5) + 't' + d(4) + 'l' + d(4) + 'r' + d(4) + 's' + d(4) + 't' + d(4) + 'r' + d(4) + 'b' + d(4) + 'l' + d(4) + 'r' + d(4) + 's' + d(6) + 'T',
            g(80)
        ]
    },
    // 8 — precisão em plataformas flutuantes
    {
        theme: 'escritorio',
        title: 'O Escritório',
        tip: 'Plataformas curtas — um passo em falso e cai!',
        rows: [
            '',
            d(72) + 'c',
            d(50) + 'c' + d(14) + 'c',
            d(30) + 'c' + d(20) + 'c',
            d(60) + '##',
            d(12) + 'c' + d(10) + '##' + d(10) + 'c' + d(10) + '##' + d(10) + 'c',
            d(8) + '##' + d(8) + '##' + d(8) + '##' + d(8) + '##' + d(8) + '##' + d(8) + '##',
            d(20) + 'c' + d(12) + 'c' + d(12) + 'c' + d(12) + 'c',
            d(14) + '##' + d(10) + 'm' + d(10) + '##' + d(10) + 'v' + d(8) + '##',
            d(2) + 'P' + d(10) + 'l' + d(12) + 'b' + d(12) + 't' + d(12) + 'l' + d(10) + 'T',
            g(12) + d(8) + g(4) + d(8) + g(4) + d(8) + g(4) + d(8) + g(4) + d(8) + g(14)
        ]
    },
    // 9 — sótão com buracos e robôs
    {
        theme: 'sotao',
        title: 'O Sótão Misterioso',
        tip: 'A TV está perto… mas o chão é traiçoeiro!',
        rows: [
            '',
            d(65) + 'c',
            d(40) + 'c' + d(18) + 'c',
            d(55) + '###',
            d(22) + 'c' + d(16) + 'c' + d(16) + 'c',
            d(18) + '###' + d(12) + 'm' + d(12) + '###',
            d(10) + 'c' + d(14) + 'c' + d(14) + 'c' + d(14) + 'c',
            d(30) + 's' + d(20) + 's' + d(12) + '###',
            d(8) + 'r' + d(12) + 'r' + d(12) + 'r' + d(12) + 'r',
            d(2) + 'P' + d(6) + 'r' + d(8) + 'l' + d(8) + 'r' + d(8) + 'b' + d(8) + 'r' + d(8) + 't' + d(8) + 'T',
            g(14) + d(4) + g(10) + d(5) + g(12) + d(5) + g(10) + d(4) + g(18)
        ]
    },
    // 10 — chefão: longo, vertical e cheio
    {
        theme: 'sotao',
        title: 'O Desafio Final',
        tip: 'A TV lendária no topo! Use tudo que aprendeu.',
        rows: [
            d(78) + 'c' + d(2) + 'T',
            d(78) + g(6),
            d(60) + 'c' + d(12) + 'c',
            d(70) + '####',
            d(25) + 'c' + d(20) + 'c' + d(18) + 's',
            d(55) + 'v' + d(10) + '###',
            d(15) + 'c' + d(15) + 'm' + d(15) + 'c' + d(12) + '##',
            d(40) + 'c' + d(14) + 'c' + d(12) + 's',
            d(10) + 'c' + d(10) + '###' + d(10) + 'm' + d(10) + '###' + d(10) + 'c',
            d(2) + 'P' + d(6) + 'r' + d(5) + 's' + d(6) + 'r' + d(5) + 'l' + d(5) + 'r' + d(5) + 'b' + d(5) + 'r' + d(5) + 't' + d(5) + 'r',
            g(18) + d(5) + g(12) + d(5) + g(14) + d(5) + g(28)
        ]
    }
];

for (const lvl of levels) {
    const width = Math.max(...lvl.rows.map(r => r.length));
    lvl.rows = lvl.rows.map(r => r.padEnd(width, '.'));
    lvl.width = width;
    lvl.totalStars = lvl.rows.join('').split('c').length - 1;
}
