"""Rebuilds the brand icon set in static/images/icons/ from Lígia's Canva design.

The icons (issue #139) are part of the design system in #92; the source of truth is
the Canva design "GATO CATSIT". The Connect API cannot export SVG, so the design is
exported as PDF and the artwork — which Canva embeds as high-resolution bitmaps — is
segmented, snapped to the brand palette and traced back to vector.

Usage (needs CANVA_CLIENT_ID / CANVA_CLIENT_SECRET from the Developer Portal):

    python scripts/canva-icons.py auth      # one-off browser consent, caches a token
    python scripts/canva-icons.py export    # downloads the design as PDF
    python scripts/canva-icons.py build     # PDF -> static/images/icons/*.svg

Dependencies: pip install pymupdf pillow numpy scipy vtracer, plus `npx svgo` for the
final optimisation pass (skipped with a warning when npx is unavailable).
"""
import base64
import hashlib
import http.server
import json
import os
import re
import secrets
import shutil
import subprocess
import sys
import tempfile
import time
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WORK = os.path.join(ROOT, ".canva")
PDF = os.path.join(WORK, "design.pdf")
TOKENS = os.path.join(WORK, "tokens.json")
ICONS_DIR = os.path.join(ROOT, "static", "images", "icons")

API = "https://api.canva.com/rest/v1"
DESIGN_ID = "DAGrdt6apoI"
REDIRECT_URI = "http://127.0.0.1:8910/oauth/redirect"
SCOPES = "design:meta:read design:content:read"

# Page 9 of the design is the icon sheet; every shape on it is one icon.
SHEET_PAGE = 9
# Reading order on the sheet, top-left to bottom-right.
SHEET_NAMES = [
    "coffee-cup", "cat-head", "sleep-mask", "cushion", "collar",
    "bone", "speech-bubble", "mouse", "phone-in-hand", "fish",
]

# Icons the design uses in the page mockups but which are not on the sheet. They are
# picked out of the page's embedded bitmaps by their intrinsic size, which survives a
# re-export better than the PDF's internal object numbers.
EXTRAS = [
    # name, design page, bitmap size, how many ink blobs to keep (None = all)
    ("calendar", 11, (779, 800), None),
    ("brain", 11, (160, 146), None),
    ("paw", 11, (93, 160), 2),
    ("keys", 13, (770, 800), None),
    ("check", 13, (800, 126), 1),
]

SIZE = 512
BLACK = (0x00, 0x00, 0x00)
WINE = (0x74, 0x0A, 0x1E)
CRIMSON = (0x7E, 0x00, 0x01)
RED = (0xB8, 0x3C, 0x4E)
BLUSH = (0xF1, 0xAC, 0xB1)
WHITE = (0xFF, 0xFF, 0xFF)
# Painted back to front. Every layer also covers the ones stacked on top of it, so no
# hairline seams show up between neighbouring shapes.
ORDER = [BLUSH, RED, CRIMSON, WINE, BLACK]

# Each icon is quantised against its own colours only: offering an ink-only drawing
# the full palette turns its anti-aliased edges into a red fringe.
MONO = [BLACK, WHITE]
PALETTES = {
    "coffee-cup": [BLUSH, RED, WINE, BLACK, WHITE],
    "sleep-mask": [BLUSH, RED, WINE, BLACK, WHITE],
    "cushion": [BLUSH, RED, WINE, BLACK, WHITE],
    "check": [CRIMSON, WHITE],
}


# ---------------------------------------------------------------- authentication


def _b64url(raw):
    return base64.urlsafe_b64encode(raw).rstrip(b"=").decode()


def auth():
    client_id = os.environ["CANVA_CLIENT_ID"]
    verifier = _b64url(secrets.token_bytes(96))
    challenge = _b64url(hashlib.sha256(verifier.encode()).digest())
    state = _b64url(secrets.token_bytes(16))
    url = "https://www.canva.com/api/oauth/authorize?" + urllib.parse.urlencode({
        "code_challenge": challenge,
        "code_challenge_method": "S256",
        "scope": SCOPES,
        "response_type": "code",
        "client_id": client_id,
        "state": state,
        "redirect_uri": REDIRECT_URI,
    })
    print("Open this URL in your browser and approve the integration:\n\n" + url + "\n")

    received = {}

    class Handler(http.server.BaseHTTPRequestHandler):
        def do_GET(self):
            query = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
            received.update({k: v[0] for k, v in query.items()})
            self.send_response(200)
            self.send_header("content-type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(b"<h1>Canva authorized</h1><p>You can close this tab.</p>")

        def log_message(self, *args):
            pass

    port = urllib.parse.urlparse(REDIRECT_URI).port
    with http.server.HTTPServer(("127.0.0.1", port), Handler) as server:
        while "code" not in received and "error" not in received:
            server.handle_request()

    if "error" not in received and received.get("state") != state:
        raise SystemExit("state mismatch — aborting")
    if "error" in received:
        raise SystemExit(f"authorization failed: {received['error']}")

    _save_tokens(_token_request({
        "grant_type": "authorization_code",
        "code_verifier": verifier,
        "code": received["code"],
        "redirect_uri": REDIRECT_URI,
    }))
    print("token stored in", TOKENS)


def _token_request(body):
    basic = base64.b64encode(
        f"{os.environ['CANVA_CLIENT_ID']}:{os.environ['CANVA_CLIENT_SECRET']}".encode()
    ).decode()
    req = urllib.request.Request(
        f"{API}/oauth/token",
        data=urllib.parse.urlencode(body).encode(),
        headers={"content-type": "application/x-www-form-urlencoded",
                 "authorization": f"Basic {basic}"},
    )
    with urllib.request.urlopen(req) as resp:
        return json.load(resp)


def _save_tokens(tokens):
    os.makedirs(WORK, exist_ok=True)
    tokens["obtained_at"] = time.time()
    with open(TOKENS, "w", encoding="utf8") as fh:
        json.dump(tokens, fh, indent=2)


def _access_token():
    with open(TOKENS, encoding="utf8") as fh:
        tokens = json.load(fh)
    if time.time() - tokens["obtained_at"] > tokens["expires_in"] - 120:
        tokens = _token_request({"grant_type": "refresh_token",
                                 "refresh_token": tokens["refresh_token"]})
        _save_tokens(tokens)
    return tokens["access_token"]


def _api(path, body=None):
    req = urllib.request.Request(
        API + path,
        data=json.dumps(body).encode() if body is not None else None,
        headers={"authorization": f"Bearer {_access_token()}",
                 "content-type": "application/json"},
    )
    with urllib.request.urlopen(req) as resp:
        return json.load(resp)


# ---------------------------------------------------------------------- export


def export():
    """Exports the whole design as PDF — the only format that keeps every page."""
    job = _api("/exports", {"design_id": DESIGN_ID, "format": {"type": "pdf"}})["job"]
    while job["status"] == "in_progress":
        time.sleep(2)
        job = _api(f"/exports/{job['id']}")["job"]
    if job["status"] != "success":
        raise SystemExit(f"export failed: {json.dumps(job)}")

    os.makedirs(WORK, exist_ok=True)
    with urllib.request.urlopen(job["urls"][0]) as resp, open(PDF, "wb") as fh:
        shutil.copyfileobj(resp, fh)
    print("saved", PDF, os.path.getsize(PDF), "bytes")


# ----------------------------------------------------------------------- build


def _blobs(mask, gap):
    """Bounding boxes of the ink blobs in a mask, merged across `gap` pixels."""
    from scipy import ndimage

    labels, count = ndimage.label(ndimage.binary_dilation(mask, iterations=gap))
    boxes = []
    for i in range(1, count + 1):
        ys, xs = ((labels == i) & mask).nonzero()
        if len(xs) < 500:
            continue
        boxes.append((int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())))
    return boxes


def _sheet_crops(doc):
    """Splits the icon sheet page into one transparent PNG per icon."""
    import numpy as np
    from PIL import Image

    dpi = 600
    pix = doc[SHEET_PAGE - 1].get_pixmap(dpi=dpi, alpha=False)
    page = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
    arr = np.asarray(page).astype(np.int16)
    ink = (255 - arr.min(axis=2)) > 40

    boxes = _blobs(ink, dpi // 24)
    # Rows top to bottom, then left to right within each row.
    boxes.sort(key=lambda b: (round(b[1] / (dpi * 0.9)), b[0]))
    # The dots inside the speech bubble are separate blobs; fold them into it.
    boxes = [b for b in boxes if not any(
        o is not b and o[0] <= b[0] and o[1] <= b[1] and o[2] >= b[2] and o[3] >= b[3]
        for o in boxes)]
    if len(boxes) != len(SHEET_NAMES):
        raise SystemExit(f"expected {len(SHEET_NAMES)} icons on the sheet, found {len(boxes)}")

    for name, (x0, y0, x1, y1) in zip(SHEET_NAMES, boxes):
        yield name, page.crop((x0, y0, x1 + 1, y1 + 1))


def _extra_crops(doc):
    """Pulls the icons the design only uses inside the page mockups."""
    import numpy as np
    import pymupdf
    from PIL import Image

    for name, page_no, size, keep in EXTRAS:
        page = doc[page_no - 1]
        matches = [i for i in page.get_image_info(xrefs=True)
                   if (i["width"], i["height"]) == size and i["xref"] > 0]
        if not matches:
            raise SystemExit(f"{name}: no {size[0]}x{size[1]} bitmap on page {page_no}")

        raw = doc.extract_image(matches[0]["xref"])
        pix = pymupdf.Pixmap(raw["image"])
        if raw.get("smask"):
            pix = pymupdf.Pixmap(pix, pymupdf.Pixmap(doc.extract_image(raw["smask"])["image"]))
        img = Image.open(__import__("io").BytesIO(pix.tobytes("png"))).convert("RGBA")

        alpha = np.asarray(img)[:, :, 3] > 40
        boxes = sorted(_blobs(alpha, 2), key=lambda b: (b[1], b[0]))
        if keep:
            boxes = boxes[:keep]
            # Clear everything outside the blobs we keep: their union rectangle can
            # still overlap a neighbouring shape (the paw trail, for instance).
            kept = np.zeros(alpha.shape, dtype=bool)
            for x0, y0, x1, y1 in boxes:
                kept[y0:y1 + 1, x0:x1 + 1] = True
            data = np.asarray(img).copy()
            data[:, :, 3] = np.where(kept, data[:, :, 3], 0)
            img = Image.fromarray(data).crop((
                min(b[0] for b in boxes), min(b[1] for b in boxes),
                max(b[2] for b in boxes) + 1, max(b[3] for b in boxes) + 1))

        flat = Image.new("RGBA", img.size, WHITE + (255,))
        flat.alpha_composite(img)
        yield name, flat.convert("RGB")


def _square(img, pad=0.06):
    """Centres the artwork on a square canvas so every icon shares one geometry."""
    from PIL import Image

    side = int(max(img.size) * (1 + 2 * pad))
    canvas = Image.new("RGB", (side, side), WHITE)
    canvas.paste(img, ((side - img.width) // 2, (side - img.height) // 2))
    return canvas.resize((SIZE, SIZE), Image.LANCZOS)


def _quantise(img, palette):
    """Snaps every pixel to the nearest design colour."""
    import numpy as np

    arr = np.asarray(img.convert("RGB")).astype(np.int32)
    pal = np.array(palette, dtype=np.int32)
    idx = ((arr[:, :, None, :] - pal[None, None, :, :]) ** 2).sum(axis=3).argmin(axis=2)
    return pal[idx].astype(np.uint8)


def _trace(mask):
    """Traces one colour layer and returns the path elements vtracer produced."""
    import numpy as np
    from PIL import Image
    import vtracer

    flat = np.where(mask, 0, 255).astype(np.uint8)
    img = Image.fromarray(np.dstack([flat, flat, flat]))
    with tempfile.TemporaryDirectory() as tmp:
        src, dst = os.path.join(tmp, "layer.png"), os.path.join(tmp, "layer.svg")
        img.save(src)
        vtracer.convert_image_to_svg_py(
            src, dst, colormode="binary", mode="spline",
            filter_speckle=6, corner_threshold=60, length_threshold=4.0,
            splice_threshold=45, path_precision=1,
        )
        with open(dst, encoding="utf8") as fh:
            return re.findall(r"<path[^>]*/>", fh.read())


def _to_svg(quantised, palette):
    import numpy as np

    layers = []
    for colour in [c for c in ORDER if c in palette]:
        mask = np.zeros(quantised.shape[:2], dtype=bool)
        for above in [c for c in ORDER[ORDER.index(colour):] if c in palette]:
            mask |= (quantised == np.array(above, dtype=np.uint8)).all(axis=2)
        if not mask.any():
            continue
        hexcode = "#%02X%02X%02X" % colour
        layers += [re.sub(r'fill="[^"]*"', f'fill="{hexcode}"', p) for p in _trace(mask)]
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {SIZE} {SIZE}">\n'
            + "\n".join(layers) + "\n</svg>\n")


def build():
    import pymupdf

    doc = pymupdf.open(PDF)
    os.makedirs(ICONS_DIR, exist_ok=True)
    for name, art in list(_sheet_crops(doc)) + list(_extra_crops(doc)):
        palette = PALETTES.get(name, MONO)
        svg = _to_svg(_quantise(_square(art), palette), palette)
        path = os.path.join(ICONS_DIR, f"{name}.svg")
        with open(path, "w", encoding="utf8") as fh:
            fh.write(svg)
        print(f"{name:<14} {os.path.getsize(path):>7} bytes")

    npx = shutil.which("npx") or shutil.which("npx.cmd")
    if not npx:
        print("warning: npx not found, skipping the svgo pass")
        return
    subprocess.run([npx, "--yes", "svgo@3", "-q", "-f", ICONS_DIR, "-o", ICONS_DIR,
                    "--multipass", "-p", "1"], check=True)
    total = sum(os.path.getsize(os.path.join(ICONS_DIR, f)) for f in os.listdir(ICONS_DIR))
    print(f"optimised, {total / 1024:.1f} KB total")


if __name__ == "__main__":
    command = sys.argv[1] if len(sys.argv) > 1 else ""
    if command not in {"auth", "export", "build"}:
        raise SystemExit(__doc__)
    globals()[command]()
