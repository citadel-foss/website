"""Regenerate the four 1200 × 630 social cards (requires Pillow)."""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public"
W, H = 1200, 630
BLACK = "#13151b"
MUTED = "#4e5668"
ORANGE = "#e99327"
PURPLE = "#8a78bf"
FONT_DIR = Path("/System/Library/Fonts")


def font(size, bold=False, mono=False):
    if mono:
        path = FONT_DIR / "Menlo.ttc"
    elif bold:
        path = FONT_DIR / "Supplemental/Arial Rounded Bold.ttf"
    else:
        path = FONT_DIR / "Avenir Next.ttc"
    return ImageFont.truetype(str(path), size)


def base(accent):
    image = Image.new("RGB", (W, H))
    pixels = image.load()
    for y in range(H):
        for x in range(W):
            # The site's warm hero gradient, kept light for readable sharing cards.
            glow = max(0, 1 - ((x - 525) ** 2 / 970000 + (y - 75) ** 2 / 460000))
            lavender = max(0, 1 - ((x - 900) ** 2 / 750000 + (y - 350) ** 2 / 340000))
            pixels[x, y] = (
                int(249 - 9 * glow - 11 * lavender),
                int(246 - 46 * glow - 10 * lavender),
                int(239 - 55 * glow + 11 * lavender),
            )
    draw = ImageDraw.Draw(image)
    for x in range(0, W, 40):
        draw.line((x, 0, x, H), fill="#f0e8e3", width=1)
    for y in range(0, H, 40):
        draw.line((0, y, W, y), fill="#f0e8e3", width=1)
    draw.rounded_rectangle((34, 30, 1166, 600), radius=28, outline="#ded6d0", width=2)
    draw.rounded_rectangle((55, 49, 1145, 124), radius=35, fill="#fbf8f3", outline="#e6dcd2", width=2)
    logo = Image.open(OUT / "openswap-logo.png").convert("RGBA").resize((48, 48), Image.Resampling.LANCZOS)
    image.paste(logo, (75, 62), logo)
    draw.text((139, 65), "OpenSwap", font=font(30, bold=True), fill=BLACK)
    draw.text((865, 76), "OPEN NETWORK FOR ATOMIC SWAPS", font=font(13, mono=True), fill=MUTED)
    draw.rounded_rectangle((70, 158, 218, 194), radius=18, fill=accent)
    return image, draw


def hero(draw, label, lines, subtitle, accent):
    draw.text((86, 165), label, font=font(15, mono=True), fill="#ffffff")
    y = 226
    for line in lines:
        draw.text((82, y), line, font=font(62, bold=True), fill=BLACK, stroke_width=0)
        y += 73
    draw.multiline_text((87, 427), subtitle, font=font(23), fill=MUTED, spacing=8)
    draw.rounded_rectangle((85, 544, 255, 553), radius=4, fill=accent)
    draw.text((87, 566), "OPENSWAP.LIVE", font=font(14, mono=True), fill=MUTED)


def panel(draw, accent):
    draw.rounded_rectangle((778, 193, 1113, 519), radius=24, fill="#121929", outline="#485067", width=2)
    draw.rounded_rectangle((778, 193, 1113, 239), radius=24, fill="#20283b")
    draw.rectangle((778, 220, 1113, 239), fill="#20283b")
    for i, color in enumerate(("#f77d6e", "#f5c85c", "#66c795")):
        draw.ellipse((800 + i * 19, 211, 809 + i * 19, 220), fill=color)
    draw.line((800, 466, 1092, 466), fill="#354058", width=2)
    draw.rounded_rectangle((812, 484, 961, 503), radius=9, fill=accent)


def home_card():
    image, draw = base(ORANGE)
    hero(draw, "HOME", ["Decentralized", "atomic swaps."],
         "A Bitcoin-native marketplace for\ntrustless, non-custodial swaps.", ORANGE)
    panel(draw, ORANGE)
    draw.text((812, 260), "SWAP ROUTE", font=font(15, mono=True), fill="#b8b2d2")
    draw.line((825, 370, 1067, 370), fill="#e99327", width=6)
    for x, label in ((827, "WALLET"), (948, "ROUTER"), (1067, "WALLET")):
        draw.ellipse((x - 17, 352, x + 17, 386), fill="#e99327", outline="#f8d6aa", width=3)
        draw.text((x - 30, 407), label, font=font(13, mono=True), fill="#dbe1ec")
    draw.text((823, 485), "ATOMIC / PRIVATE", font=font(13, mono=True), fill="#10141f")
    return image


def portal_card():
    image, draw = base(PURPLE)
    hero(draw, "PORTAL", ["One app.", "Two roles."],
         "A Bitcoin Wallet and Router Console\nin one desktop or self-hosted app.", PURPLE)
    panel(draw, PURPLE)
    draw.text((810, 260), "PORTAL CONSOLE", font=font(15, mono=True), fill="#b8b2d2")
    for y, name, detail in ((296, "WALLET", "Send  ·  Receive  ·  Swap"),
                            (379, "ROUTER", "Liquidity  ·  Bonds  ·  Fees")):
        draw.rounded_rectangle((802, y, 1089, y + 67), radius=14, fill="#242d40", outline="#4c5570")
        draw.ellipse((819, y + 22, 839, y + 42), fill="#b998f0")
        draw.text((852, y + 10), name, font=font(20, bold=True), fill="#f6f4fc")
        draw.text((852, y + 39), detail, font=font(12), fill="#b7bfcd")
    return image


def market_card():
    image, draw = base("#5a8c74")
    hero(draw, "MARKET", ["Explore the", "router market."],
         "See liquidity, fidelity bonds, and\npublic fee offers across the network.", "#5a8c74")
    panel(draw, "#76bf91")
    draw.text((810, 260), "ROUTER OFFERS", font=font(15, mono=True), fill="#b8b2d2")
    for y, label, width in ((299, "ROUTER 01", 186), (357, "ROUTER 02", 225), (415, "ROUTER 03", 155)):
        draw.rounded_rectangle((803, y, 1088, y + 46), radius=12, fill="#242d40")
        draw.ellipse((817, y + 16, 829, y + 28), fill="#78d89a")
        draw.text((839, y + 12), label, font=font(14, mono=True), fill="#e8edf4")
        draw.rounded_rectangle((839, y + 33, 839 + width, y + 37), radius=2, fill="#78d89a")
    return image


def developers_card():
    image, draw = base("#5574b3")
    hero(draw, "DEVELOPERS", ["Build with", "OpenSwap."],
         "Rust core, language bindings, and\nprotocol documentation for builders.", "#5574b3")
    panel(draw, "#809de1")
    draw.text((810, 260), "OPEN CORE", font=font(15, mono=True), fill="#b8b2d2")
    for y, label in ((302, "RUST CORE"), (355, "WALLET + ROUTER"), (408, "LANGUAGE BINDINGS")):
        draw.rounded_rectangle((802, y, 1089, y + 43), radius=11, fill="#242d40")
        draw.text((820, y + 11), ">", font=font(17, mono=True), fill="#86aaff")
        draw.text((849, y + 12), label, font=font(14, mono=True), fill="#e8edf4")
    return image


for name, make in (("social-preview.png", home_card),
                   ("social/portal.png", portal_card),
                   ("social/market.png", market_card),
                   ("social/developers.png", developers_card)):
    target = OUT / name
    target.parent.mkdir(parents=True, exist_ok=True)
    make().save(target, "PNG", optimize=True)
    print(f"Wrote {target.relative_to(ROOT)}")
