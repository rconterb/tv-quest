// Dados das fases.
// Legenda dos mapas:
//   #  bloco sólido (chão/plataforma, textura muda por cômodo)
//   T  TV (objetivo da fase)
//   t  tênis (perigo)     l  lego (perigo)     b  livros (perigo)
//   c  estrela (colecionável)
//   r  robô de brinquedo (inimigo — pule na cabeça!)
//   s  almofada-mola (pula alto)
//   m  plataforma móvel horizontal    v  plataforma móvel vertical
//   P  posição inicial do jogador
//   .  vazio
//
// As linhas são montadas com g(n) = n blocos e d(n) = n vazios,
// para evitar erros de contagem. Linhas mais curtas são completadas com vazio.

export const TILE = 48;
export const ROWS = 11;

const g = (n) => '#'.repeat(n);
const d = (n) => '.'.repeat(n);

// Paleta aquarela / Ghibli — paredes claras, luz quente
export const THEMES = {
    sala:       { name: 'Sala de Estar',  wallTop: 0xfff6e8, wallBottom: 0xf0d2a8, block: 'block_wood',   decor: ['sofa', 'plant', 'lamp'] },
    quarto:     { name: 'Quarto',         wallTop: 0xeef4ff, wallBottom: 0xc5d8f5, block: 'block_carpet', decor: ['shelf', 'box', 'plant'] },
    cozinha:    { name: 'Cozinha',        wallTop: 0xf0faf2, wallBottom: 0xc5e8d0, block: 'block_tile',   decor: ['fridge', 'table', 'plant'] },
    corredor:   { name: 'Corredor',       wallTop: 0xfff0f4, wallBottom: 0xecc0d0, block: 'block_wood',   decor: ['lamp', 'plant'] },
    escritorio: { name: 'Escritório',     wallTop: 0xf8f2e6, wallBottom: 0xddd0b4, block: 'block_desk',   decor: ['shelf', 'lamp', 'plant'] },
    sotao:      { name: 'Sótão',          wallTop: 0x6a5f7a, wallBottom: 0x3e3550, block: 'block_attic',  decor: ['box', 'shelf', 'lamp'] }
};

export const levels = [
    {
        theme: 'sala',
        title: 'A Sala de Estar',
        tip: 'Use as SETAS para andar e ESPAÇO para pular!',
        rows: [
            /* r0 */ '',
            /* r1 */ '',
            /* r2 */ '',
            /* r3 */ '',
            /* r4 */ '',
            /* r5 */ d(28) + 'c',
            /* r6 */ '',
            /* r7 */ d(10) + 'c' + d(5) + 'c' + d(5) + 'c',
            /* r8 */ '',
            /* r9 */ d(2) + 'P' + d(25) + 's' + d(7) + 'T',
            /* r10 */ g(40)
        ]
    },
    {
        theme: 'sala',
        title: 'Bagunça na Sala',
        tip: 'Pule por cima dos brinquedos espalhados!',
        rows: [
            '',
            '',
            '',
            '',
            '',
            '',
            d(32) + 'c',
            d(31) + '###',
            d(11) + 'c' + d(7) + 'c' + d(6) + 'c',
            d(2) + 'P' + d(8) + 't' + d(7) + 'l' + d(6) + 'b' + d(12) + 'T',
            g(44)
        ]
    },
    {
        theme: 'quarto',
        title: 'O Quarto das Crianças',
        tip: 'Cuidado com os buracos no chão!',
        rows: [
            '',
            '',
            '',
            '',
            '',
            d(24) + 'c',
            '',
            d(24) + '##',
            d(14) + 'cc' + d(17) + 'c',
            d(2) + 'P' + d(27) + 'l' + d(9) + 'T',
            g(14) + d(2) + g(8) + d(3) + g(19)
        ]
    },
    {
        theme: 'quarto',
        title: 'Robôs de Brinquedo',
        tip: 'Pule NA CABEÇA dos robôs para derrotá-los!',
        rows: [
            '',
            '',
            '',
            '',
            '',
            '',
            d(21) + 'c',
            d(20) + '###',
            d(8) + 'c' + d(15) + 'c' + d(11) + 'c',
            d(2) + 'P' + d(11) + 'r' + d(15) + 'r' + d(10) + 'b' + d(3) + 'T',
            g(48)
        ]
    },
    {
        theme: 'cozinha',
        title: 'A Cozinha',
        tip: 'Suba nas plataformas que se mexem!',
        rows: [
            '',
            '',
            '',
            '',
            '',
            '',
            d(15) + 'c' + d(11) + 'c',
            '',
            d(15) + 'm' + d(11) + 'm' + d(8) + 'c' + d(7) + 'c',
            d(2) + 'P' + d(35) + 't' + d(9) + 'T',
            g(12) + d(6) + g(6) + d(8) + g(20)
        ]
    },
    {
        theme: 'cozinha',
        title: 'A Grande Escalada',
        tip: 'Suba até o alto da cozinha!',
        rows: [
            /* r0 */ '',
            /* r1 */ d(36) + 'c' + d(1) + 'T',
            /* r2 */ d(36) + g(5),
            /* r3 */ d(12) + 'c' + d(18) + 'c',
            /* r4 */ d(30) + '###',
            /* r5 */ d(25) + 'c',
            /* r6 */ d(12) + 'v' + d(11) + '###',
            /* r7 */ d(19) + 'c',
            /* r8 */ d(18) + '###',
            /* r9 */ d(2) + 'P' + d(25) + 'r' + d(11) + 't',
            /* r10 */ g(50)
        ]
    },
    {
        theme: 'corredor',
        title: 'O Corredor Maluco',
        tip: 'Uma corrida de obstáculos!',
        rows: [
            '',
            '',
            '',
            '',
            '',
            d(28) + 'c' + d(1) + 'c',
            '',
            '',
            d(10) + 'c' + d(5) + 'c' + d(13) + '#' + d(11) + 'c',
            d(2) + 'P' + d(7) + 't' + d(5) + 'l' + d(5) + 'r' + d(5) + 's' + d(1) + '#' + d(5) + 'b' + d(5) + 'r' + d(9) + 'T',
            g(56)
        ]
    },
    {
        theme: 'escritorio',
        title: 'O Escritório',
        tip: 'Cuidado onde pisa!',
        rows: [
            '',
            '',
            '',
            '',
            '',
            '',
            d(28) + 'c',
            d(12) + 'c' + d(9) + 'c' + d(5) + 'l' + d(10) + 'c',
            d(17) + '##' + d(8) + '###' + d(3) + 'c' + d(4) + '##',
            d(2) + 'P' + d(9) + '##' + d(8) + '##' + d(9) + '##' + d(8) + '##' + d(5) + 'T',
            g(10) + d(36) + g(10)
        ]
    },
    {
        theme: 'sotao',
        title: 'O Sótão Misterioso',
        tip: 'A TV está perto... eu sinto!',
        rows: [
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            d(18) + 'c',
            d(12) + 'c' + d(4) + '###' + d(10) + 'c' + d(4) + 'm',
            d(2) + 'P' + d(5) + 'r' + d(17) + 'r' + d(16) + 'l' + d(4) + 'b' + d(3) + 't' + d(4) + 'T',
            g(16) + d(5) + g(12) + d(7) + g(20)
        ]
    },
    {
        theme: 'sotao',
        title: 'O Desafio Final',
        tip: 'A TV lendária te espera no alto!',
        rows: [
            /* r0 */ '',
            /* r1 */ '',
            /* r2 */ '',
            /* r3 */ d(54) + 'c' + d(1) + 'T',
            /* r4 */ d(54) + g(5),
            /* r5 */ d(50) + 'c',
            /* r6 */ d(22) + 'c' + d(27) + '##',
            /* r7 */ d(46) + 'c',
            /* r8 */ d(13) + 'c' + d(8) + 'm' + d(12) + 'c' + d(10) + '##',
            /* r9 */ d(2) + 'P' + d(7) + 'r' + d(5) + 's' + d(13) + 'r' + d(3) + 'l' + d(3) + 'r' + d(3) + 'b',
            /* r10 */ g(20) + d(6) + g(34)
        ]
    }
];

// Normaliza: garante que todas as linhas de uma fase tenham a mesma largura
for (const lvl of levels) {
    const width = Math.max(...lvl.rows.map(r => r.length));
    lvl.rows = lvl.rows.map(r => r.padEnd(width, '.'));
    lvl.width = width;
    lvl.totalStars = lvl.rows.join('').split('c').length - 1;
}
