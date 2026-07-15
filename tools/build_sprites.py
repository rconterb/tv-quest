"""
Sprites 128×128, pés alinhados, TODOS os perfis olhando para a DIREITA.
Detecta facing pela mochila verde / massa da cabeça (não flipa às cegas).
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

FRAME_W = 128
FRAME_H = 128
CONTENT_H = 112


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
    return im.crop((
        max(0, l - pad), max(0, t - pad),
        min(im.width, r + pad), min(im.height, b + pad)
    ))


def is_green_bag(r, g, b, a):
    if a < 40:
        return False
    # mochila verde-escura das refs
    return g > 55 and g > r + 8 and g >= b - 5 and r < 120 and b < 130


def faces_right(im: Image.Image) -> bool:
    """True se o personagem de perfil olha para a direita."""
    px = im.load()
    w, h = im.size

    # 1) mochila: se está mais à ESQUERDA → olha para a direita
    left_bag = right_bag = 0
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if is_green_bag(r, g, b, a):
                if x < w * 0.5:
                    left_bag += 1
                else:
                    right_bag += 1
    if left_bag + right_bag > 80:
        return left_bag > right_bag

    # 2) fallback: massa da cabeça (terço superior) — rosto do lado do olhar
    sx = n = 0
    for y in range(max(1, h // 3)):
        for x in range(w):
            if px[x, y][3] > 50:
                sx += x
                n += 1
    if n == 0:
        return True
    return (sx / n) >= (w * 0.48)


def ensure_faces_right(im: Image.Image, is_side: bool) -> Image.Image:
    if not is_side:
        return im
    if not faces_right(im):
        im = im.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    # segunda checagem (garantia)
    if not faces_right(im):
        im = im.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    return im


def to_fixed_canvas(im: Image.Image, is_side: bool) -> Image.Image:
    im = make_transparent(im)
    im = trim_alpha(im)
    im = ensure_faces_right(im, is_side)

    scale = CONTENT_H / im.height
    nw = max(1, int(round(im.width * scale)))
    nh = CONTENT_H
    if nw > FRAME_W - 8:
        scale = (FRAME_W - 8) / im.width
        nw = FRAME_W - 8
        nh = max(1, int(round(im.height * scale)))
    im = im.resize((nw, nh), Image.Resampling.LANCZOS)

    # re-checa facing após resize (não deveria mudar, mas...)
    im = ensure_faces_right(im, is_side)

    canvas = Image.new("RGBA", (FRAME_W, FRAME_H), (0, 0, 0, 0))
    x = (FRAME_W - nw) // 2
    y = FRAME_H - nh - 2
    canvas.paste(im, (x, y), im)
    return canvas


def cell_from_sheet(sheet: Image.Image, col: int, row: int, cols=4, rows=3, label_frac=0.16):
    w, h = sheet.size
    cw, ch = w / cols, h / rows
    usable_h = ch * (1.0 - label_frac)
    x0, y0 = int(col * cw), int(row * ch)
    x1, y1 = int((col + 1) * cw), int(y0 + usable_h)
    m = int(min(cw, ch) * 0.04)
    return sheet.crop((x0 + m, y0 + m, x1 - m, y1 - m))


def save(im: Image.Image, path: Path):
    path.parent.mkdir(parents=True, exist_ok=True)
    im.save(path, "PNG", optimize=True)
    ok = "R" if faces_right(im) or "front" in path.name or "happy" in path.name else "L?"
    print(f"  -> {path.name:14} face={ok}")


def process(src_name: str, rel: str, is_side: bool):
    im = Image.open(SRC / src_name)
    out = to_fixed_canvas(im, is_side)
    save(out, OUT / rel)


def main():
    if not SRC.exists():
        raise SystemExit(f"Fonte não encontrada: {SRC}")
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir(parents=True)

    # Só frames de perfil HQ + walk da sheet (is_side=True força normalização)
    singles = {
        "girl/idle.png": ("image-66098d81-87e8-4954-8f85-a8d0399b3426.jpg", True),
        "girl/idle_b.png": ("image-1df2f86f-630d-441c-a43b-7266451333ab.jpg", True),
        "girl/run1.png": ("image-d4c0bc92-0e83-42f7-9b47-7207eaea280e.jpg", True),
        "girl/run2.png": ("image-74547f58-af5d-4f64-9140-1fa7e0172f80.jpg", True),
        "girl/jump.png": ("image-9f399e45-bea6-492e-b5c0-939b7eb65eb3.jpg", True),
        "girl/jump_b.png": ("image-8a01e27f-8c78-4469-b4dc-b258120552fb.jpg", True),
        "girl/front.png": ("image-a4e73d23-dfa8-4653-8d86-acd3006a1118.jpg", False),
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
        process(src, rel, is_side=side)

    print("Walk cycle (sheet)...")
    boy_sheet = Image.open(SRC / "image-7bdedac0-fb24-4a4b-9b01-33b95ce637fb.jpg")
    girl_sheet = Image.open(SRC / "image-db7fa767-9d2f-435b-b35d-11a20c99d1bd.jpg")

    # walk1, walk2, run3 da sheet — todos perfil
    boy_cells = {
        "boy/walk1.png": (2, 0),
        "boy/walk2.png": (3, 0),
        "boy/walk3.png": (0, 1),
        "boy/jump_mid.png": (2, 1),
        "boy/happy.png": (0, 2),  # frente
    }
    girl_cells = {
        "girl/walk1.png": (2, 0),
        "girl/walk2.png": (3, 0),
        "girl/walk3.png": (0, 1),
        "girl/jump_mid.png": (2, 1),
        "girl/happy.png": (1, 2),
    }

    for rel, (c, r) in boy_cells.items():
        side = "happy" not in rel
        cell = cell_from_sheet(boy_sheet, c, r)
        save(to_fixed_canvas(cell, is_side=side), OUT / rel)
    for rel, (c, r) in girl_cells.items():
        side = "happy" not in rel
        cell = cell_from_sheet(girl_sheet, c, r)
        save(to_fixed_canvas(cell, is_side=side), OUT / rel)

    # Verificação final
    print("\nFacing check (perfil deve ser R):")
    for p in sorted(OUT.rglob("*.png")):
        if any(x in p.name for x in ("front", "happy")):
            continue
        im = Image.open(p)
        fr = faces_right(im)
        print(f"  {p.parent.name}/{p.name}: {'OK→' if fr else 'FAIL←'}")

    files = sorted(p.relative_to(OUT).as_posix() for p in OUT.rglob("*.png"))
    (OUT / "manifest.json").write_text(
        '{\n  "frame": [128, 128],\n  "files": [\n    %s\n  ]\n}\n'
        % ",\n    ".join(f'"{f}"' for f in files),
        encoding="utf-8",
    )
    print(f"\nOK: {len(files)} sprites")


if __name__ == "__main__":
    main()
