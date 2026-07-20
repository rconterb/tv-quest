// Constantes de física e limites de design de fase.
// Todos os valores em pixels / tiles (TILE = 48).
//
// Alcance aproximado (corrida em velocidade máxima, mesma altura):
//   pulo simples  → ~4.5 tiles horizontal · ~2.4 tiles vertical
//   pulo duplo    → ~7.5 tiles horizontal · ~4.2 tiles vertical
//   mola          → ~5.5 tiles vertical (e ainda sobra o pulo duplo no ar)
//
// Use estes tetos ao desenhar mapas — gaps maiores que MAX_* são
// inviáveis e devem ter plataforma intermediária ou mola.

export const TILE = 48;

export const PHYS = {
    gravity: 1350,

    // movimento horizontal
    maxSpeed: 290,
    groundAccel: 2400,
    airAccel: 1550,
    turnAccel: 3200,     // reverter direção no chão (mais “snappy”)
    groundDrag: 2200,    // freio ao soltar o botão no chão
    airDrag: 280,        // pouco atrito no ar (mantém momentum)
    stopThreshold: 18,   // abaixo disso, zera velocidade no chão

    // pulos
    jumpVelocity: -560,
    airJumpVelocity: -520,
    springVelocity: -880,
    stompBounce: -440,
    hurtKnockbackX: 260,
    hurtKnockbackY: -350,

    // assistências de plataforma (kids-friendly mas precisas)
    coyoteMs: 130,
    bufferMs: 150,

    // hang time no ápice (gravidade reduzida perto de vy≈0)
    apexThreshold: 90,
    apexGravityScale: 0.55,

    // corte de pulo (soltar botão → pulo baixo)
    jumpCutMultiplier: 0.42
};

/** Limites de design de fase (em tiles). Preferir SAFE_*; nunca ultrapassar MAX_*. */
export const REACH = {
    SAFE_GAP_SINGLE: 3,
    MAX_GAP_SINGLE: 4,
    SAFE_GAP_DOUBLE: 5,
    MAX_GAP_DOUBLE: 6,
    SAFE_HEIGHT_SINGLE: 2,
    MAX_HEIGHT_SINGLE: 2,
    SAFE_HEIGHT_DOUBLE: 3,
    MAX_HEIGHT_DOUBLE: 4,
    SPRING_HEIGHT: 5
};
