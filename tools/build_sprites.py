"""
Gera sprites PNG transparentes, canvas FIXO e pés alinhados (sem pulo de frame).
Todos os frames de perfil olham para a DIREITA.
"""
from __future__ import annotations

import shutil
from pathlib import Path

from PIL import Image

SRC = Path(
    r"C:\Users\rcont\.grok\sessions"
    r"\C%3A%5CUsers%5Crcont%5CAppData%5CLocal%5CPrograms%5CMicrosoft%20VS%20Code"
    r"\019f6546-9ce1-7af0-b2fd-d5e656905eb3\assets"
)
OUT = Path(__file__).resolve().parents[1] / "assets" / "chars"

# Canvas único — evita o personagem “pular” ao trocar de frame
FRAME_W = 128
FRAME_H = 128
CONTENT_H = 112  # altura útil do personagem dentro do canvas


def is_bg(r, g, b, thresh=236):
    if r < thresh or g < thresh or b < thresh:
        return False
    return abs(r - g) < 18 and abs(g - b) < 18 and abs(r - b) < 22


def make_transparent(im: Image.Image, thresh=236) -> Image.Image:
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

    # anti-halo nas bordas
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            if is_bg(r, g, b, 248):
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < w and 0 <= ny < h and px[nx, ny][3] == 0:
                        px[x, y] = (r, g, b, 0)
                        break
    return im


def trim_alpha(im: Image.Image, pad=2) -> Image.Image:
    bbox = im.getbbox()
    if not bbox:
        return im
    l, t, r, b = bbox
    l = max(0, l - pad)
    t = max(0, t - pad)
    r = min(im.width, r + pad)
    b = min(im.height, b + pad)
    return im.crop((l, t, r, b))


def mass_center_x(im: Image.Image) -> float:
    px = im.load()
    w, h = im.size
    sx = n = 0
    for y in range(h):
        for x in range(w):
            if px[x, y][3] > 40:
                sx += x
                n += 1
    return (sx / n) if n else w / 2


def face_right(im: Image.Image, force_side: bool) -> Image.Image:
    """Refs originais olham para a esquerda; espelha para a direita."""
    if not force_side:
        return im
    # heurística: se o "nariz" (conteúdo) está mais à esquerda do centro geométrico
    # das refs de perfil, espelha. Na prática todas as de perfil das refs olham p/ esquerda.
    return im.transpose(Image.Transpose.FLIP_LEFT_RIGHT)


def to_fixed_canvas(im: Image.Image, face_side_right=True) -> Image.Image:
    im = make_transparent(im)
    im = trim_alpha(im)
    if face_side_right:
        im = face_right(im, True)

    # escala para CONTENT_H
    scale = CONTENT_H / im.height
    nw = max(1, int(round(im.width * scale)))
    nh = CONTENT_H
    if nw > FRAME_W - 8:
        scale = (FRAME_W - 8) / im.width
        nw = FRAME_W - 8
        nh = max(1, int(round(im.height * scale)))
    im = im.resize((nw, nh), Image.Resampling.LANCZOS)

    canvas = Image.new("RGBA", (FRAME_W, FRAME_H), (0, 0, 0, 0))
    x = (FRAME_W - nw) // 2
    y = FRAME_H - nh - 2  # pés perto da base
    canvas.paste(im, (x, y), im)
    return canvas


def cell_from_sheet(sheet: Image.Image, col: int, row: int, cols=4, rows=3, label_frac=0.16):
    w, h = sheet.size
    cw, ch = w / cols, h / rows
    usable_h = ch * (1.0 - label_frac)
    x0 = int(col * cw)
    y0 = int(row * ch)
    x1 = int((col + 1) * cw)
    y1 = int(y0 + usable_h)
    m = int(min(cw, ch) * 0.04)
    return sheet.crop((x0 + m, y0 + m, x1 - m, y1 - m))


def save(im: Image.Image, path: Path):
    path.parent.mkdir(parents=True, exist_ok=True)
    im.save(path, "PNG", optimize=True)
    print(f"  -> {path.as_posix()} {im.size}")


def process(src_name: str, rel: str, side=True):
    im = Image.open(SRC / src_name)
    out = to_fixed_canvas(im, face_side_right=side)
    save(out, OUT / rel)


def main():
    if not SRC.exists():
        raise SystemExit(f"Fonte das refs não encontrada: {SRC}")

    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir(parents=True)

    # Singles de alta qualidade (perfil = side True; frente = side False)
    singles = {
        # girl
        "girl/idle.png": ("image-66098d81-87e8-4954-8f85-a8d0399b3426.jpg", True),
        "girl/idle_b.png": ("image-1df2f86f-630d-441c-a43b-7266451333ab.jpg", True),
        "girl/run1.png": ("image-d4c0bc92-0e83-42f7-9b47-7207eaea280e.jpg", True),
        "girl/run2.png": ("image-74547f58-af5d-4f64-9140-1fa7e0172f80.jpg", True),
        "girl/jump.png": ("image-9f399e45-bea6-492e-b5c0-939b7eb65eb3.jpg", True),
        "girl/jump_b.png": ("image-8a01e27f-8c78-4469-b4dc-b258120552fb.jpg", True),
        "girl/front.png": ("image-a4e73d23-dfa8-4653-8d86-acd3006a1118.jpg", False),
        # boy
        "boy/idle.png": ("image-de807535-cf1a-4a02-9c74-cc2df1d260a0.jpg", True),
        "boy/idle_b.png": ("image-7368698a-de38-4a46-9962-e737dd3f0eca.jpg", True),
        "boy/run1.png": ("image-720e60e0-cd04-47d3-93f1-dd71ba5dd58f.jpg", True),
        "boy/run2.png": ("image-afc84ce9-fdba-45f8-9325-62d56d919e44.jpg", True),
        "boy/jump.png": ("image-0944c948-2096-455d-886d-85aab86204e0.jpg", True),
        "boy/jump_b.png": ("image-30af85aa-4864-419e-9a76-97031ce6c4ca.jpg", True),
        "boy/front.png": ("image-5bc3f73e-8f8e-49a6-9d0e-c0f2c71e5639.jpg", False),
    }

    print("Singles...")
    for rel, (src, side) in singles.items():
        process(src, rel, side=side)

    print("Sheets (walk cycle)...")
    boy_sheet = Image.open(SRC / "image-7bdedac0-fb24-4a4b-9b01-33b95ce637fb.jpg")
    girl_sheet = Image.open(SRC / "image-db7fa767-9d2f-435b-b35d-11a20c99d1bd.jpg")

    # walk frames da sheet (perfil) + jump mid + crouch + happy
    boy_cells = {
        "boy/walk1.png": ((2, 0), True),
        "boy/walk2.png": ((3, 0), True),
        "boy/walk3.png": ((0, 1), True),
        "boy/jump_mid.png": ((2, 1), True),
        "boy/crouch.png": ((3, 1), True),
        "boy/happy.png": ((0, 2), False),
    }
    girl_cells = {
        "girl/walk1.png": ((2, 0), True),
        "girl/walk2.png": ((3, 0), True),
        "girl/walk3.png": ((0, 1), True),
        "girl/jump_mid.png": ((2, 1), True),
        "girl/crouch.png": ((0, 2), True),
        "girl/happy.png": ((1, 2), False),
    }

    for rel, ((c, r), side) in boy_cells.items():
        cell = cell_from_sheet(boy_sheet, c, r)
        save(to_fixed_canvas(cell, face_side_right=side), OUT / rel)
    for rel, ((c, r), side) in girl_cells.items():
        cell = cell_from_sheet(girl_sheet, c, r)
        save(to_fixed_canvas(cell, face_side_right=side), OUT / rel)

    files = sorted(p.relative_to(OUT).as_posix() for p in OUT.rglob("*.png"))
    (OUT / "manifest.json").write_text(
        '{\n  "frame": [%d, %d],\n  "files": [\n    %s\n  ]\n}\n'
        % (FRAME_W, FRAME_H, ",\n    ".join(f'"{f}"' for f in files)),
        encoding="utf-8",
    )
    print(f"\nOK: {len(files)} sprites {FRAME_W}x{FRAME_H} em {OUT}")


if __name__ == "__main__":
    main()
