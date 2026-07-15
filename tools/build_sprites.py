"""
Processa as imagens de referência em sprites PNG transparentes para o jogo.
"""
from __future__ import annotations

import shutil
from pathlib import Path

from PIL import Image, ImageFilter

SRC = Path(
    r"C:\Users\rcont\.grok\sessions"
    r"\C%3A%5CUsers%5Crcont%5CAppData%5CLocal%5CPrograms%5CMicrosoft%20VS%20Code"
    r"\019f6546-9ce1-7af0-b2fd-d5e656905eb3\assets"
)
OUT = Path(__file__).resolve().parents[1] / "assets" / "chars"
TARGET_H = 128  # altura dos sprites de gameplay


def is_bg(r, g, b, thresh=236):
    """Fundo claro das refs (branco / off-white suave)."""
    if r < thresh or g < thresh or b < thresh:
        return False
    # quase neutro (não pega pele / amarelo do moletom)
    return abs(r - g) < 18 and abs(g - b) < 18 and abs(r - b) < 22


def make_transparent(im: Image.Image, thresh=236) -> Image.Image:
    """Remove fundo por flood-fill a partir das bordas + limpeza residual."""
    im = im.convert("RGBA")
    w, h = im.size
    px = im.load()
    visited = [[False] * w for _ in range(h)]
    stack = []

    def push(x, y):
        if 0 <= x < w and 0 <= y < h and not visited[y][x]:
            r, g, b, a = px[x, y]
            if a > 0 and is_bg(r, g, b, thresh):
                stack.append((x, y))
                visited[y][x] = True

    for x in range(w):
        push(x, 0)
        push(x, h - 1)
    for y in range(h):
        push(0, y)
        push(w - 1, y)

    while stack:
        x, y = stack.pop()
        px[x, y] = (255, 255, 255, 0)
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and not visited[ny][nx]:
                r, g, b, a = px[nx, ny]
                if a > 0 and is_bg(r, g, b, thresh):
                    visited[ny][nx] = True
                    stack.append((nx, ny))

    # suaviza borda residual quase-branca colada no personagem
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            if is_bg(r, g, b, 250):
                # só apaga se vizinho for transparente (anti-halo)
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < w and 0 <= ny < h and px[nx, ny][3] == 0:
                        px[x, y] = (r, g, b, 0)
                        break
            elif is_bg(r, g, b, 242):
                # semi-transparência no contorno
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < w and 0 <= ny < h and px[nx, ny][3] == 0:
                        px[x, y] = (r, g, b, max(0, a - 140))
                        break
    return im


def trim_alpha(im: Image.Image, pad=4) -> Image.Image:
    bbox = im.getbbox()
    if not bbox:
        return im
    l, t, r, b = bbox
    l = max(0, l - pad)
    t = max(0, t - pad)
    r = min(im.width, r + pad)
    b = min(im.height, b + pad)
    return im.crop((l, t, r, b))


def normalize(im: Image.Image, target_h=TARGET_H) -> Image.Image:
    im = make_transparent(im)
    im = trim_alpha(im)
    scale = target_h / im.height
    nw = max(1, int(round(im.width * scale)))
    nh = target_h
    return im.resize((nw, nh), Image.Resampling.LANCZOS)


def save(im: Image.Image, path: Path):
    path.parent.mkdir(parents=True, exist_ok=True)
    im.save(path, "PNG", optimize=True)
    print(f"  -> {path.relative_to(OUT.parent.parent)} {im.size}")


def cell_from_sheet(sheet: Image.Image, col: int, row: int, cols=4, rows=3, label_frac=0.14):
    """Extrai uma célula de sheet 4x3 com faixa de label embaixo de cada célula."""
    w, h = sheet.size
    cw, ch = w / cols, h / rows
    # desconta a faixa de texto embaixo da pose
    usable_h = ch * (1.0 - label_frac)
    x0 = int(col * cw)
    y0 = int(row * ch)
    x1 = int((col + 1) * cw)
    y1 = int(y0 + usable_h)
    # margem interna para evitar linhas de grade
    m = int(min(cw, ch) * 0.03)
    return sheet.crop((x0 + m, y0 + m, x1 - m, y1 - m))


def process_single(name: str, src_name: str, target_h=TARGET_H):
    im = Image.open(SRC / src_name)
    out = normalize(im, target_h)
    save(out, OUT / name)


def main():
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir(parents=True)

    print("Inspecionando fontes...")
    for p in sorted(SRC.glob("*.jpg")):
        im = Image.open(p)
        print(f"  {p.name}: {im.size}")

    # Mapeamento pelas refs do chat (ordem Image #1..#16)
    MAP = {
        # girl singles
        "girl/idle.png": "image-66098d81-87e8-4954-8f85-a8d0399b3426.jpg",       # side idle
        "girl/jump.png": "image-9f399e45-bea6-492e-b5c0-939b7eb65eb3.jpg",       # jump
        "girl/run_a.png": "image-d4c0bc92-0e83-42f7-9b47-7207eaea280e.jpg",      # run side
        "girl/front.png": "image-a4e73d23-dfa8-4653-8d86-acd3006a1118.jpg",      # front
        "girl/run_b.png": "image-74547f58-af5d-4f64-9140-1fa7e0172f80.jpg",      # run 3/4
        "girl/jump_b.png": "image-8a01e27f-8c78-4469-b4dc-b258120552fb.jpg",     # jump alt
        "girl/idle_b.png": "image-1df2f86f-630d-441c-a43b-7266451333ab.jpg",     # side idle alt
        # boy singles
        "boy/idle.png": "image-de807535-cf1a-4a02-9c74-cc2df1d260a0.jpg",
        "boy/run_a.png": "image-720e60e0-cd04-47d3-93f1-dd71ba5dd58f.jpg",
        "boy/jump.png": "image-0944c948-2096-455d-886d-85aab86204e0.jpg",
        "boy/front.png": "image-5bc3f73e-8f8e-49a6-9d0e-c0f2c71e5639.jpg",
        "boy/run_b.png": "image-afc84ce9-fdba-45f8-9325-62d56d919e44.jpg",
        "boy/jump_b.png": "image-30af85aa-4864-419e-9a76-97031ce6c4ca.jpg",
        "boy/idle_b.png": "image-7368698a-de38-4a46-9962-e737dd3f0eca.jpg",
    }

    print("\nProcessando singles...")
    for rel, src in MAP.items():
        process_single(rel, src)

    # Sheets
    print("\nFatiando sprite sheets...")
    boy_sheet = Image.open(SRC / "image-7bdedac0-fb24-4a4b-9b01-33b95ce637fb.jpg")
    girl_sheet = Image.open(SRC / "image-db7fa767-9d2f-435b-b35d-11a20c99d1bd.jpg")

    # boy sheet labels:
    # r0: front idle, side idle, walk1, walk2
    # r1: run3, jump start, jump mid, crouch
    # r2: happy, backpack, front idle2
    boy_cells = {
        "boy/sheet_front.png": (0, 0),
        "boy/sheet_side.png": (1, 0),
        "boy/walk1.png": (2, 0),
        "boy/walk2.png": (3, 0),
        "boy/run3.png": (0, 1),
        "boy/jump_start.png": (1, 1),
        "boy/jump_mid.png": (2, 1),
        "boy/crouch.png": (3, 1),
        "boy/happy.png": (0, 2),
        "boy/bag_adj.png": (1, 2),
        "boy/front2.png": (2, 2),
    }
    for rel, (c, r) in boy_cells.items():
        cell = cell_from_sheet(boy_sheet, c, r)
        save(normalize(cell), OUT / rel)

    # girl sheet:
    # r0: front, side, walk1, walk2
    # r1: run3, jump start, jump mid, jump land
    # r2: crouch, happy wave, backpack
    girl_cells = {
        "girl/sheet_front.png": (0, 0),
        "girl/sheet_side.png": (1, 0),
        "girl/walk1.png": (2, 0),
        "girl/walk2.png": (3, 0),
        "girl/run3.png": (0, 1),
        "girl/jump_start.png": (1, 1),
        "girl/jump_mid.png": (2, 1),
        "girl/jump_land.png": (3, 1),
        "girl/crouch.png": (0, 2),
        "girl/happy.png": (1, 2),
        "girl/bag_adj.png": (2, 2),
    }
    for rel, (c, r) in girl_cells.items():
        cell = cell_from_sheet(girl_sheet, c, r)
        save(normalize(cell), OUT / rel)

    # Manifest simples
    files = sorted(p.relative_to(OUT).as_posix() for p in OUT.rglob("*.png"))
    (OUT / "manifest.json").write_text(
        '{\n  "height": %d,\n  "files": [\n    %s\n  ]\n}\n'
        % (TARGET_H, ",\n    ".join(f'"{f}"' for f in files)),
        encoding="utf-8",
    )
    print(f"\nOK: {len(files)} sprites em {OUT}")


if __name__ == "__main__":
    main()
