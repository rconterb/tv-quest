# Em Busca da TV 📺

Jogo de plataforma 2D feito com [Phaser 3](https://phaser.io/). A TV sumiu! Explore os cômodos da casa — sala, quarto, cozinha, corredor, escritório e sótão — desviando de brinquedos, pisando em robôs e coletando estrelas até encontrar a TV lendária.

Personagens em **sprites estilo Ghibli** (arte embutida). Cenário, inimigos e UI ainda usam texturas procedurais + Web Audio sintetizado.

## Como jogar

- **← →** andar • **ESPAÇO/↑** pular (segure para pular mais alto)
- **PULO DUPLO**: aperte pular de novo no ar para dar uma cambalhota e subir mais!
- **R** reinicia a fase • **ESC** volta ao menu
- Em telas de toque aparecem botões virtuais
- Pule **na cabeça** dos robôs para derrotá-los; encostar de lado tira coração
- 3 corações por fase; caiu no buraco ou zerou os corações, a fase recomeça
- Almofadas cor-de-rosa são molas: encostou, voou! (e ainda sobra um pulo no ar)
- Colete as estrelas ⭐ de cada fase (o recorde fica salvo)
- No menu dá para jogar **com ou sem música** (botão ♪ no canto superior esquerdo)

## Conteúdo

- Personagens com sprites animados (idle / corrida / pulo) inspirados em Studio Ghibli
- 10 fases com rolagem de câmera, ambientadas nos cômodos da casa
- 2 personagens jogáveis: o menino e a menina de moletom amarelo da Colônia de Férias, mochila verde
- Inimigos patrulheiros, plataformas móveis, molas, buracos e escaladas
- Física fluida: *coyote time*, *jump buffering*, altura de pulo variável, hang no ápice e freio diferente no ar/chão
- Fases com dificuldade progressiva e gaps calibrados ao alcance real do pulo (nada impossível de alcançar)
- Progresso salvo no navegador (fases desbloqueadas + estrelas por fase)
- Trilha **rock real** (MP3 em loop, 4 faixas que alternam pelas fases) + botão de mudo

## Jogar online

**https://rconterb.github.io/tv-quest/**

## Rodando localmente

Precisa de um servidor estático (ES modules não funcionam via `file://`):

```
python -m http.server 4173
# ou: npx serve .
```

Abra `http://localhost:4173`.

## Estrutura

```
index.html                  Página do jogo (canvas + Phaser via CDN)
assets/chars/               Sprites PNG dos personagens (boy/girl)
tools/build_sprites.py      Regenera PNGs a partir das refs (opcional)
src/main.js                 Config do Phaser e registro das cenas
src/physics.js              Constantes de física + limites de design de fase
src/levels.js               Dados das 10 fases + temas dos cômodos
src/textures.js             Pixel art procedural do cenário
src/sprites.js              Preload e animações dos personagens
src/objects.js              Player (sprites) e Robot
src/audio.js                Efeitos (Web Audio) + trilha rock (MP3)
src/save.js                 Progresso no localStorage
src/scenes/MenuScene.js     Título, escolha de personagem e fases
src/scenes/GameScene.js     Gameplay
src/scenes/VictoryScene.js  Tela final
assets/music/               Loops de rock (MP3)
```

## Créditos da música

Loops royalty-free via [OpenGameArt](https://opengameart.org/):

| Arquivo | Faixa | Licença |
|---------|-------|---------|
| `rock_strut.mp3` | *Strut* — Snabisch | CC0 |
| `rock_drive.mp3` | *Background Music (LOOP)* — Pro Sensory | CC0 |
| `rock_survival.mp3` | *The Survival* — PlayOnLoop | [CC-BY 3.0](https://creativecommons.org/licenses/by/3.0/) |
| `rock_halloween.mp3` | *Halloween Rock'n'Roll* — PlayOnLoop | [CC-BY 3.0](https://creativecommons.org/licenses/by/3.0/) |

Efeitos sonoros continuam sintetizados em Web Audio.

Legenda dos mapas (em `src/levels.js`): `#` bloco, `T` TV (objetivo), `t` tênis, `l` lego, `b` livros, `c` estrela, `r` robô, `s` mola, `m`/`v` plataforma móvel (horizontal/vertical), `P` spawn do jogador.

Limites de salto (em tiles, ver `src/physics.js`): pulo simples ~4,5 de vão / ~2,4 de altura; pulo duplo ~7,5 / ~4,5; mola ~6 de altura. Gaps no mapa nunca passam desses tetos.
