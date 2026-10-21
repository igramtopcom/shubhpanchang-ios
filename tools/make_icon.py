"""App icon, light / dark / tinted, 1024 px:  python tools/make_icon.py assets/images
(needs Pillow, numpy, scipy and the Windows font Nirmala UI). Writes
icon-light/dark/tinted.png and icon-preview.png (move the preview out).

Om in cream on a saffron-to-vermilion ground; its chandrabindu (the crescent
and dot on top) in gold, the lunar mark of a tithi app. Dark: the glyph alone
on transparency (iOS lays its own dark ground). Tinted: a greyscale glyph on
black (iOS tints by luminance).
"""
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from scipy import ndimage

OUT = sys.argv[1]
S = 1024
font = ImageFont.truetype('C:/Windows/Fonts/Nirmala.ttc', 700, index=0)

# Glyph mask, centred on its ink box (optical centre a little above middle).
m = Image.new('L', (S * 2, S * 2), 0)
ImageDraw.Draw(m).text((S, S), '\u0950', font=font, fill=255, anchor='mm')
m = m.filter(ImageFilter.MaxFilter(9))  # a touch bolder than Nirmala's regular weight
bbox = m.getbbox()
glyph = m.crop(bbox)
target_h = int(S * 0.56)
scale = target_h / glyph.height
glyph = glyph.resize((int(glyph.width * scale), target_h), Image.LANCZOS)
mask = Image.new('L', (S, S), 0)
ox = (S - glyph.width) // 2
oy = (S - glyph.height) // 2 - int(S * 0.01)
mask.paste(glyph, (ox, oy))

# Split the chandrabindu off: connected parts whose centre is in the top third of the ink.
a = np.array(mask) > 127
lab, n = ndimage.label(a)
top_cut = oy + glyph.height * 0.34
moon = np.zeros_like(a)
for i in range(1, n + 1):
    ys, xs = np.nonzero(lab == i)
    if ys.mean() < top_cut:
        moon |= lab == i
moon_mask = Image.fromarray((ndimage.binary_dilation(moon, iterations=3) * 255).astype('uint8')).filter(ImageFilter.GaussianBlur(0.8))
moon_mask = Image.fromarray(np.minimum(np.array(moon_mask), np.array(mask)))
body_mask = Image.fromarray(np.clip(np.array(mask).astype(int) - np.array(moon_mask).astype(int), 0, 255).astype('uint8'))
print('parts', n, 'moon px', int(moon.sum()))


def gradient(top, bottom):
    t = np.linspace(0, 1, S)[:, None, None]
    g = (1 - t) * np.array(top, float) + t * np.array(bottom, float)
    return Image.fromarray(np.repeat(g, S, axis=1).astype('uint8'), 'RGB')


def solid(rgb):
    return Image.new('RGB', (S, S), rgb)


# Light
bg = gradient((238, 108, 32), (183, 38, 14))
glow = Image.new('L', (S, S), 0)
ImageDraw.Draw(glow).ellipse((S * 0.18, S * 0.16, S * 0.82, S * 0.80), fill=70)
glow = glow.filter(ImageFilter.GaussianBlur(120))
bg = Image.composite(solid((255, 196, 120)), bg, glow)
shadow = mask.filter(ImageFilter.GaussianBlur(14)).point(lambda v: v * 0.35)
bg = Image.composite(solid((110, 20, 0)), bg, Image.fromarray(np.roll(np.array(shadow), 10, axis=0)))
light = Image.composite(solid((255, 246, 232)), bg, body_mask)
light = Image.composite(solid((255, 210, 110)), light, moon_mask)
light.save(f'{OUT}/icon-light.png')

# Dark: transparent ground, saffron glyph, gold moon.
dark = Image.new('RGBA', (S, S), (0, 0, 0, 0))
fg = gradient((255, 150, 80), (240, 96, 40)).convert('RGBA')
dark = Image.composite(fg, dark, body_mask)
dark = Image.composite(Image.new('RGBA', (S, S), (255, 210, 110, 255)), dark, moon_mask)
dark.save(f'{OUT}/icon-dark.png')

# Tinted: greyscale on black.
tint = Image.new('L', (S, S), 0)
tint = Image.composite(Image.new('L', (S, S), 235), tint, body_mask)
tint = Image.composite(Image.new('L', (S, S), 255), tint, moon_mask)
tint.convert('RGB').save(f'{OUT}/icon-tinted.png')

# Preview: the three side by side, rounded like the Home Screen, dark one on iOS's dark ground.
def rounded(im):
    r = Image.new('L', (S, S), 0)
    ImageDraw.Draw(r).rounded_rectangle((0, 0, S, S), radius=int(S * 0.225), fill=255)
    out = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    out.paste(im.convert('RGBA'), (0, 0), r)
    return out
dark_on = Image.alpha_composite(gradient((40, 40, 44), (18, 18, 20)).convert('RGBA'), dark)
tint_on = Image.merge('RGB', [tint.point(lambda v: int(v * k)) for k in (0.55, 0.85, 1.0)])
prev = Image.new('RGBA', (S * 3 + 80, S + 40), (235, 235, 240, 255))
for i, im in enumerate([light, dark_on, tint_on]):
    prev.alpha_composite(rounded(im), (20 + i * (S + 20), 20))
prev.convert('RGB').resize(((S * 3 + 80) // 3, (S + 40) // 3), Image.LANCZOS).save(f'{OUT}/icon-preview.png')
