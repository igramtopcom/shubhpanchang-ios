"""Builds the design mock pages: shared head, fonts, CSS and an icon sprite around each page body.

    python docs/design/build.py        (writes docs/design/NN-*.html from pages/*.html)
"""
import pathlib

HERE = pathlib.Path(__file__).parent

ICONS = {
    'sun': '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    'moon': '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
    'people': '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.5a5 5 0 0 1 5.5 5"/>',
    'cal': '<rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    'calplus': '<rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4M12 13v5M9.5 15.5h5"/>',
    'gear': '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    'share': '<path d="M12 3v12M7 8l5-5 5 5"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/>',
    'pin': '<path d="M12 21s-7-7.6-7-12a7 7 0 0 1 14 0c0 4.4-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>',
    'chevr': '<path d="M9 6l6 6-6 6"/>', 'chevl': '<path d="M15 6l-6 6 6 6"/>', 'chevd': '<path d="M6 9l6 6 6-6"/>',
    'plus': '<path d="M12 5v14M5 12h14"/>', 'x': '<path d="M6 6l12 12M18 6L6 18"/>', 'check': '<path d="M5 12.5l4.5 4.5L19 7"/>',
    'bell': '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
    'clock': '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    'spark': '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
    'search': '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
    'globe': '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.6 2.5 14.4 0 17M12 3.5c-2.5 2.6-2.5 14.4 0 17"/>',
    'lock': '<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>',
    'info': '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8h.01"/>',
    'lotus': '<path d="M12 19c-4 0-7-2-8-5 3 0 6 1 8 5 2-4 5-5 8-5-1 3-4 5-8 5z"/><path d="M12 19c-2-3-2-8 0-12 2 4 2 9 0 12z"/>',
    'diya': '<path d="M4 14h16a8 5 0 0 1-16 0z"/><path d="M12 11c-1.5-1.5-1.5-3.5 0-6 1.5 2.5 1.5 4.5 0 6z"/>',
    'heart': '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
    'flame': '<path d="M12 21a6 6 0 0 0 6-6c0-4-3-6-4-10-2 2-3 3.5-3 6-1-1-1.5-2-1.5-3C7 10 6 12.5 6 15a6 6 0 0 0 6 6z"/>',
    'lang': '<path d="M4 6h9M8.5 4v2M6 6c0 4 3 7 6 8M11 6c0 3-2 6-6 8"/><path d="M13 20l4-9 4 9M14.3 17h5.4"/>',
    'sliders': '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',
    'wa': '<path d="M5 19l1.2-3.6A7.5 7.5 0 1 1 9 18.6z"/>',
    'doc': '<path d="M7 3.5h7l4 4V20a.5.5 0 0 1-.5.5h-10A.5.5 0 0 1 7 20z"/><path d="M14 3.5V8h4M9.5 12.5h5M9.5 16h5"/>',
    'sunrise': '<path d="M4 18h16M7 18a5 5 0 0 1 10 0M12 4v4M9 6.5l3-2.5 3 2.5M3.5 13.5l1.5.8M20.5 13.5l-1.5.8"/>',
}


def sprite() -> str:
    syms = ''.join(f'<symbol id="i-{k}" viewBox="0 0 24 24">{v}</symbol>' for k, v in ICONS.items())
    return f'<svg width="0" height="0" style="position:absolute">{syms}</svg>'


HEAD = '''<!doctype html>
<html lang="gu">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Gujarati:wght@400;500;600&family=Noto+Serif+Gujarati:wght@500;600&family=Noto+Serif+Devanagari:wght@500&family=Inter:wght@400;500;600;700&family=Source+Serif+4:opsz,wght@8..60,500;8..60,600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="ds-base.css">
<link rel="stylesheet" href="ds-more.css">
<link rel="stylesheet" href="ds-glass.css">
</head>
<body>
{sprite}
<header class="page"><h1>{title}</h1><p>{sub}</p></header>
<div class="row">
{body}
</div>
</body>
</html>
'''


def i(name: str, cls: str = '') -> str:
    """An icon from the sprite."""
    return f'<svg class="ico {cls}"><use href="#i-{name}"/></svg>'


def tabs(on: str, lang: str = 'gu') -> str:
    names = {'gu': ['આજે', 'વ્રત', 'પરિવાર', 'કેલેન્ડર'], 'en': ['Today', 'Vrat', 'Family', 'Calendar']}[lang]
    keys = ['today', 'vrat', 'family', 'cal']
    icons = ['sun', 'moon', 'people', 'cal']
    out = []
    for k, n, ic in zip(keys, names, icons):
        out.append(f'<div class="tab{" on" if k == on else ""}"><span class="pip">{i(ic)}</span>{n}</div>')
    return '<nav class="tabs">' + ''.join(out) + '</nav>'


if __name__ == '__main__':
    import importlib.util
    for src in sorted((HERE / 'pages').glob('*.py')):
        spec = importlib.util.spec_from_file_location(src.stem, src)
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        html = HEAD.format(title=mod.TITLE, sub=mod.SUB, sprite=sprite(), body=mod.body())
        out = HERE / f'{src.stem}.html'
        out.write_text(html, encoding='utf8')
        print('wrote', out.name)
