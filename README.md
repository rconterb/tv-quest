# Em Busca da TV 📺

Jogo de plataforma 2D em pixel art feito com [Phaser 3](https://phaser.io/). Ande, pule e desvie dos obstáculos espalhados pela casa (tênis, Legos e livros) até chegar na TV no final de cada fase.

## Como jogar

- **Setas / toque**: mover e pular
- 10 fases com dificuldade progressiva — da caminhada tranquila até "O Desafio Final"
- Sons gerados por síntese nativa do navegador (Web Audio API) — sem arquivos de áudio

## Rodando localmente

Opção 1 — direto no navegador (o `index.html` carrega o Phaser via CDN):

```
npx serve .
```

Opção 2 — com Vite (dev server com hot reload):

```
npm install
npm run dev
```

## Estrutura

```
index.html              Página do jogo (canvas + Phaser via CDN)
src/main.js             Jogo completo (SoundManager, fases, cenas)
src/levels/LevelData.js Dados das fases (versão modular)
src/scenes/             Cenas Menu/Game (versão modular)
```

Legenda dos mapas das fases: `1` chão/plataforma, `2` TV (objetivo), `3` tênis, `4` Lego, `5` livro, `.` vazio.
