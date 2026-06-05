#!/usr/bin/env python3
"""Generate PinRoam PNG icons from scratch using Pillow."""
from PIL import Image, ImageDraw
import math, os

def draw_icon(S):
    img = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Background — dark navy
    R = int(S * 0.2)
    # rounded rect background
    bg_img = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    bg_draw = ImageDraw.Draw(bg_img)
    bg_draw.rounded_rectangle([0, 0, S-1, S-1], radius=R, fill=(7, 22, 40, 255))
    img = Image.alpha_composite(img, bg_img)

    # Pin body
    cx, cy_pin = S / 2, S * 0.47
    pin_r = S * 0.185

    # Draw pin shape (teardrop): circle on top + pointed tip below
    pin_img = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    pin_draw = ImageDraw.Draw(pin_img)

    # Circle part
    x0 = cx - pin_r - S*0.03
    y0 = cy_pin - pin_r - S*0.03
    x1 = cx + pin_r + S*0.03
    y1 = cy_pin + pin_r + S*0.03
    pin_draw.ellipse([x0, y0, x1, y1], fill=(37, 99, 235, 255))

    # Triangle / pointed bottom
    tip_y = cy_pin + pin_r + S * 0.16
    pts = [
        (cx - pin_r * 0.6, cy_pin + pin_r * 0.2),
        (cx + pin_r * 0.6, cy_pin + pin_r * 0.2),
        (cx, tip_y),
    ]
    pin_draw.polygon(pts, fill=(37, 99, 235, 255))

    img = Image.alpha_composite(img, pin_img)

    # Highlight circle (lighter blue, top-left of pin)
    hl_img = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    hl_draw = ImageDraw.Draw(hl_img)
    hr = pin_r * 0.44
    hx, hy = cx - pin_r * 0.1, cy_pin - pin_r * 0.1
    hl_draw.ellipse([hx - hr, hy - hr, hx + hr, hy + hr], fill=(30, 58, 138, 255))
    img = Image.alpha_composite(img, hl_img)

    # Specular shine (small bright spot)
    if S >= 32:
        sh_img = Image.new('RGBA', (S, S), (0, 0, 0, 0))
        sh_draw = ImageDraw.Draw(sh_img)
        sr = pin_r * 0.14
        sx, sy = cx - pin_r * 0.35, cy_pin - pin_r * 0.5
        sh_draw.ellipse([sx - sr, sy - sr, sx + sr, sy + sr], fill=(200, 220, 255, 160))
        img = Image.alpha_composite(img, sh_img)

    # Ground shadow ellipse
    sdw_img = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    sdw_draw = ImageDraw.Draw(sdw_img)
    sw, sh2 = S * 0.14, S * 0.04
    ey = cy_pin + pin_r + S * 0.14
    sdw_draw.ellipse([cx - sw, ey - sh2, cx + sw, ey + sh2], fill=(59, 130, 246, 55))
    img = Image.alpha_composite(img, sdw_img)

    return img

def main():
    out = '/home/iliukhay/GeoQuest/www'
    os.makedirs(out, exist_ok=True)

    for size, name in [(192, 'icon-192.png'), (512, 'icon-512.png')]:
        icon = draw_icon(size)
        icon.save(os.path.join(out, name), 'PNG')
        print(f"Saved {name} ({size}x{size})")

    assets_out = '/home/iliukhay/GeoQuest/assets'
    for size, name in [(256, 'icon-256.png'), (512, 'icon.png')]:
        icon = draw_icon(size)
        icon.save(os.path.join(assets_out, name), 'PNG')
        print(f"Saved assets/{name}")

    # .ico for Windows (multi-size) — save each size separately then combine
    sizes_ico = [16, 32, 48, 64, 128, 256]
    frames = [draw_icon(s).convert('RGBA') for s in sizes_ico]
    # Pillow ICO: save biggest first then append smaller
    frames[-1].save(
        os.path.join(assets_out, 'icon.ico'),
        format='ICO',
        sizes=[(s, s) for s in sizes_ico],
        append_images=frames[:-1]
    )
    print("Saved assets/icon.ico")

if __name__ == '__main__':
    main()
