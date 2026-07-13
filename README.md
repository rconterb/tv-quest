# Em Busca da TV 📺

Jogo de plataforma 2D em pixel art feito com [Phaser 3](https://phaser.io/). A TV sumiu! Explore os cômodos da casa — sala, quarto, cozinha, corredor, escritório e sótão — desviando de brinquedos, pisando em robôs e coletando estrelas até encontrar a TV lendária.

**Sem build e sem dependências**: Phaser vem por CDN e o código usa ES modules nativos. Todos os gráficos são pixel art procedural (gerados em código) e todos os sons/música são sintetizados com Web Audio — não há um único arquivo de imagem ou áudio no projeto.

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

- Visual estilo mangá/chibi: contornos de nanquim, olhos grandes com brilho e cel shading
- 10 fases com rolagem de câmera, ambientadas nos cômodos da casa
- 2 personagens jogáveis: o menino (4 anos, camiseta do AC/DC, cabelo castanho claro) e a menina (cabelo comprido, vestido, meia-calça vermelha e botas pretas)
- Inimigos patrulheiros, plataformas móveis, molas, buracos e escaladas
- Física com *coyote time*, *jump buffering* e altura de pulo variável
- Progresso salvo no navegador (fases desbloqueadas + estrelas por fase)
- Música chiptune em loop com botão de mudo (o som pausa sozinho quando a aba perde o foco)

## Rodando localmente

Precisa apenas de um servidor estático (ES modules não funcionam via `file://`):

```
python -m http.server 4173
# ou: npx serve .
```

Abra `http://localhost:4173`.

## Estrutura

```
index.html                  Página do jogo (canvas + Phaser via CDN)
src/main.js                 Config do Phaser e registro das cenas
src/levels.js               Dados das 10 fases + temas dos cômodos
src/textures.js             Toda a pixel art procedural (blocos, TV, móveis, partículas...)
src/objects.js              Player (animação esquelética) e Robot (inimigo)
src/audio.js                Efeitos sonoros e música sintetizados (Web Audio)
src/save.js                 Progresso no localStorage
src/scenes/MenuScene.js     Título, escolha de personagem e seleção de fases
src/scenes/GameScene.js     Gameplay
src/scenes/VictoryScene.js  Tela final
```

Legenda dos mapas (em `src/levels.js`): `#` bloco, `T` TV (objetivo), `t` tênis, `l` lego, `b` livros, `c` estrela, `r` robô, `s` mola, `m`/`v` plataforma móvel (horizontal/vertical), `P` spawn do jogador.
