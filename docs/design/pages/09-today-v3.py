import math
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent.parent))
from build import i

TITLE = 'Hôm nay v3: một điểm nhấn, đậm chất Gujarat'
SUB = ('Từ trái: ngày thường lúc giờ tốt (cuộn hết màn); đang Rahu Kaal; ngày Diwali, lễ thành điểm nhấn; '
       'tiếng Anh nền tối. Dữ liệu thật của Ahmedabad (24/10 và 8/11/2026) từ API.')

CSS = '''
<style>
  .v3 { padding-top: 54px; }
  .v3.tall { height: auto; padding-bottom: 120px; }
  .v3 .bar { margin-bottom: 0; position: relative; z-index: 2; }
  :root { --leaf: #4F7A3A; --leaf2: #6E9A48; --mari: #E2902B; --mari2: #F4BC45; --twine: #B5884E; }
  .dark { --leaf: #557F41; --leaf2: #6B8F4C; --mari: #C9802F; --mari2: #DDA548; --twine: #7E6243; }

  /* Toran: mango leaves and marigolds strung over the doorway */
  .toran { display: block; width: calc(100% + 40px); margin: 6px -20px 2px; height: 46px; }

  /* Masthead */
  .mast-date { display: flex; align-items: center; justify-content: space-between; margin: 6px 2px 2px; }
  .mast-date span { font-size: 14.5px; color: var(--ink2); font-weight: 500; }
  .steps { display: flex; gap: 6px; }
  .steps b { width: 30px; height: 30px; border-radius: 15px; background: var(--sunk); display: grid; place-items: center; color: var(--ink2); }
  .steps svg { width: 14px; height: 14px; }
  .mast { display: flex; align-items: center; gap: 12px; margin: 2px 2px 0; }
  .mast h1 { flex: 1; margin: 0; font: 600 36px/1.2 var(--gu-serif); letter-spacing: -.3px; }
  .en .mast h1 { font-family: 'Source Serif 4', Georgia, serif; font-size: 33px; }
  .mast .moon { width: 62px; height: 62px; }
  .mast-sub { margin: 4px 2px 16px; font-size: 14.5px; color: var(--ink2); font-variant-numeric: tabular-nums; }

  /* Hero: the one place the eye goes */
  .hero3 { border-radius: 26px; overflow: hidden; box-shadow: 0 14px 34px rgba(60,35,15,.16), 0 2px 4px rgba(60,35,15,.08); background: var(--card); margin-bottom: 26px; }
  .band { position: relative; padding: 16px 18px 18px; color: #fff; }
  .band::after { content: ''; position: absolute; inset: 0; pointer-events: none; opacity: .9;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='22'%3E%3Cg fill='%23fff' fill-opacity='.13'%3E%3Ccircle cx='11' cy='6' r='1.3'/%3E%3Ccircle cx='16' cy='11' r='1.3'/%3E%3Ccircle cx='11' cy='16' r='1.3'/%3E%3Ccircle cx='6' cy='11' r='1.3'/%3E%3C/g%3E%3C/svg%3E"); }
  .band.good { background: linear-gradient(155deg, #427A5B 0%, #2B5841 100%); }
  .band.bad  { background: linear-gradient(155deg, #B04E43 0%, #85342C 100%); }
  .dark .band.good { background: linear-gradient(155deg, #2F5C44 0%, #1F3F2E 100%); }
  .dark .band.bad  { background: linear-gradient(155deg, #7E3730 0%, #5A2520 100%); }
  .band > * { position: relative; z-index: 1; }
  .b-eyebrow { font-size: 13.5px; font-weight: 600; color: rgba(255,255,255,.93); display: flex; justify-content: space-between; font-variant-numeric: tabular-nums; }
  .b-big { display: flex; align-items: center; gap: 10px; margin-top: 8px; }
  .b-big h2 { margin: 0; font: 700 31px/1.15 var(--gu); letter-spacing: -.2px; }
  .en .b-big h2 { font-family: Inter, sans-serif; font-size: 29px; }
  .band .pill { color: #fff; font-size: 14px; font-weight: 600; padding: 4px 11px; border-radius: 999px; background: rgba(0,0,0,.18); box-shadow: inset 0 0 0 1px rgba(255,255,255,.35); }
  .b-until { display: flex; justify-content: space-between; align-items: baseline; margin-top: 12px; font-size: 16px; font-weight: 600; font-variant-numeric: tabular-nums; }
  .b-until span { font-size: 13.5px; font-weight: 500; color: rgba(255,255,255,.93); }
  .track { height: 6px; border-radius: 3px; background: rgba(255,255,255,.24); margin-top: 8px; overflow: hidden; }
  .track i { display: block; height: 100%; border-radius: 3px; background: #fff; }
  .live { display: inline-flex; align-items: center; gap: 6px; margin-top: 14px; font-size: 13.5px; font-weight: 600; padding: 7px 12px; border-radius: 999px; background: rgba(0,0,0,.18); box-shadow: inset 0 0 0 1px rgba(255,255,255,.35); }
  .live svg { width: 14px; height: 14px; }

  .ctx { padding: 14px 18px 14px; }
  .ctx-next { font-size: 14px; color: var(--ink2); }
  .ctx-next b { display: block; color: var(--ink); font-size: 21px; font-weight: 600; margin-top: 2px; font-variant-numeric: tabular-nums; letter-spacing: -.2px; }
  .ctx-next em { font-style: normal; font-size: 13px; font-weight: 600; color: var(--good); margin-left: 6px; }
  .ctx .ribbon { margin-top: 16px; }
  .ctx .more { padding-top: 12px; margin-top: 12px; border-top: 1px solid var(--line); }

  /* Festival hero (a festival day): the festival leads, now shrinks to a line */
  .band.fest { background: radial-gradient(120% 90% at 85% 10%, #6A3A4E 0%, #3A2140 45%, #22142A 100%); color: #FBEBD0; padding-bottom: 20px; }
  .band.fest::after { opacity: .7; }
  .band.fest .b-eyebrow { color: #F2C46B; }
  .band.fest h2 { margin: 6px 0 0; font: 600 44px/1.15 var(--gu-serif); color: #FFF4DE; }
  .band.fest .fsub { font-size: 16px; color: #F4DDB8; margin-top: 2px; }
  .diya { position: absolute; right: 10px; top: 4px; width: 112px; height: 112px; z-index: 1; }
  .mu { margin-top: 16px; padding: 12px 14px; border-radius: 16px; background: rgba(255,240,210,.1); box-shadow: inset 0 0 0 1px rgba(242,196,107,.35); }
  .mu span { font-size: 13px; color: #F2C46B; font-weight: 600; }
  .mu b { display: block; font-size: 23px; font-weight: 600; color: #FFF4DE; margin-top: 2px; font-variant-numeric: tabular-nums; }
  .mu small { font-size: 13px; color: #F4DDB8; }
  .nowline { display: flex; align-items: center; gap: 10px; padding: 13px 18px; font-size: 14.5px; }
  .nowline .dot { width: 12px; height: 3px; border-radius: 2px; background: var(--bad); flex: none; }
  .nowline b { color: var(--bad); font-weight: 600; }
  .nowline span { color: var(--ink2); margin-left: auto; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .nowline + .nowline { border-top: 1px solid var(--line); }
  .nowline .gdot { width: 8px; height: 8px; border-radius: 4px; background: var(--good); box-shadow: 0 0 0 3px var(--good-soft); flex: none; }
  .nowline.go b { color: var(--ink); }

  /* Coming up: cards across, little text */
  .sec3 { display: flex; justify-content: space-between; align-items: baseline; margin: 0 2px 10px; }
  .sec3 h3 { margin: 0; font: 600 19px/1.2 var(--gu-serif); }
  .en .sec3 h3 { font-family: 'Source Serif 4', Georgia, serif; }
  .sec3 a { font-size: 14px; color: var(--accent); font-weight: 600; }
  .strip { display: flex; gap: 10px; margin: 0 -20px 26px; padding: 0 20px 4px; overflow: hidden; }
  .uc { width: 138px; flex: none; border-radius: 20px; background: var(--card); box-shadow: var(--shadow); padding: 12px 12px 13px; position: relative; }
  .uc .top { display: flex; justify-content: space-between; align-items: flex-start; }
  .uc .dn { font: 700 26px/1 Inter, sans-serif; color: var(--ink); letter-spacing: -.5px; }
  .uc .dm { font-size: 12.5px; color: var(--ink2); margin-top: 3px; }
  .uc .ic { width: 32px; height: 32px; border-radius: 16px; display: grid; place-items: center; }
  .uc .ic svg { width: 17px; height: 17px; }
  .uc .ic.fest { background: var(--accent-soft); color: var(--accent); }
  .uc .ic.vrat { background: var(--good-soft); color: var(--good); }
  .uc .ic.fam { background: var(--sunk); color: var(--fair-ink); }
  .uc .nm { font-size: 15px; font-weight: 600; line-height: 1.3; margin-top: 14px; min-height: 39px; }
  .uc .when { font-size: 12.5px; color: var(--ink2); margin-top: 3px; }
  .uc.soon { box-shadow: var(--shadow), inset 0 0 0 1.5px var(--accent); }

  /* The day at a glance: small tiles */
  .grid3 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .tile { border-radius: 18px; background: var(--card); box-shadow: var(--shadow); padding: 11px 13px 12px; font-size: 12.5px; color: var(--ink2); position: relative; }
  .tile b { display: block; color: var(--ink); font-size: 15.5px; font-weight: 600; margin-top: 2px; font-variant-numeric: tabular-nums; }
  .tile.wide { grid-column: 1 / -1; padding: 10px 14px 12px; }
  .tile .lbl { display: flex; align-items: center; gap: 6px; }
  .tile .lbl i { width: 7px; height: 7px; border-radius: 4px; display: inline-block; }
  .sun3 { width: 100%; height: 64px; display: block; }
  .suntimes { display: flex; justify-content: space-between; align-items: flex-end; margin-top: -2px; }
  .suntimes div:nth-child(2) { text-align: center; } .suntimes div:nth-child(3) { text-align: right; }
</style>
'''

RIBBON_DAY_1024 = [('b', 86), ('g', 86), ('r', 86), ('b', 86), ('f', 86), ('g', 85), ('g', 86), ('b', 86)]
RIBBON_DAY_1108 = [('b', 83), ('f', 84), ('g', 84), ('g', 83), ('b', 84), ('g', 84), ('b', 83), ('r', 84)]


def moon(idx: int) -> str:
    """The moon for tithi index 0..29 (Shukla lit from the right, Krishna from the left)."""
    phase = (idx + 1) / 30 * 2 * math.pi
    rx = abs(math.cos(phase)) * 28
    waxing = idx < 15
    gibbous = math.cos(phase) < 0
    side = 1 if waxing else 0
    sweep = (1 if gibbous else 0) if waxing else (0 if gibbous else 1)
    lit = f'M32 4 A28 28 0 0 {side} 32 60 A{rx:.1f} 28 0 0 {sweep} 32 4 Z'
    return (f'<svg class="moon" viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="var(--moon-dark)"/>'
            f'<path d="{lit}" fill="var(--moon-lit)"/><circle cx="32" cy="32" r="28" fill="none" stroke="var(--moon-rim)"/></svg>')


def toran() -> str:
    """A toran across the top: a twine in scallops, a mango leaf at each low point, a marigold at each knot."""
    w, n = 430, 9
    step = w / n
    parts = []
    d = 'M0 6'
    for k in range(n):
        x0 = k * step
        d += f' Q{x0 + step / 2:.1f} 20 {x0 + step:.1f} 6'
    parts.append(f'<path d="{d}" fill="none" stroke="var(--twine)" stroke-width="1.6"/>')
    for k in range(n):
        cx = k * step + step / 2
        col = 'var(--leaf)' if k % 2 == 0 else 'var(--leaf2)'
        parts.append(f'<g transform="translate({cx:.1f} 13)"><path d="M0 0 C8 8 8 22 0 32 C-8 22 -8 8 0 0Z" fill="{col}"/>'
                     f'<path d="M0 2 V29" stroke="rgba(255,255,255,.35)" stroke-width="1"/></g>')
    for k in range(n + 1):
        x = k * step
        parts.append(f'<g transform="translate({x:.1f} 7)"><circle r="6.2" fill="var(--mari)"/><circle r="3.6" fill="var(--mari2)"/>'
                     f'<circle r="1.4" fill="var(--mari)"/></g>')
    return f'<svg class="toran" viewBox="0 0 {w} 46" preserveAspectRatio="xMidYMin slice">{"".join(parts)}</svg>'


def ribbon(segs, now_pct) -> str:
    spans = ''.join(f'<span class="{c}"></span>' for c, _ in segs)
    mark = f'<i class="nowmark" style="left:{now_pct:.1f}%"></i>' if now_pct is not None else ''
    return f'<div class="ribbon">{spans}{mark}</div>'


def sun_tile(lang, rise, mid, sets, pct, labels):
    # The sun's path from sunrise to sunset, the sun where it is now.
    t = max(0.0, min(1.0, pct))
    x = 10 + t * 330
    y = 58 - 184 * t * (1 - t)
    return f'''
    <div class="tile wide">
      <svg class="sun3" viewBox="0 0 350 64" preserveAspectRatio="none">
        <path d="M10 58 Q175 -34 340 58" fill="none" stroke="var(--line)" stroke-width="2" stroke-dasharray="3 5"/>
        <path d="M10 58 Q{10 + t * 165:.0f} {58 - t * 92:.0f} {x:.0f} {y:.0f}" fill="none" stroke="var(--mari)" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="{x:.0f}" cy="{y:.0f}" r="8" fill="var(--mari2)" stroke="var(--mari)" stroke-width="2"/>
        <path d="M0 58.5 H350" stroke="var(--line)"/>
      </svg>
      <div class="suntimes">
        <div>{labels[0]}<b>{rise}</b></div><div>{labels[1]}<b>{mid}</b></div><div>{labels[2]}<b>{sets}</b></div>
      </div>
    </div>'''


def tile(label, value, dot=None):
    d = f'<i style="background:{dot}"></i>' if dot else ''
    return f'<div class="tile"><div class="lbl">{d}{label}</div><b>{value}</b></div>'


def header(place):
    return f'''<div class="bar"><span class="place">{i('pin', 's')}{place}{i('chevd', 's')}</span><span class="actions"><span class="round">{i('share', 's')}</span><span class="round">{i('gear', 's')}</span></span></div>'''


def mast(date, tithi_html, sub, idx):
    return f'''
  {toran()}
  <div class="mast-date"><span>{date}</span><span class="steps"><b>{i('chevl')}</b><b>{i('chevr')}</b></span></div>
  <div class="mast"><h1>{tithi_html}</h1>{moon(idx)}</div>
  <div class="mast-sub">{sub}</div>'''


def uc(day, mon, name, when, kind, soon=False):
    icon = {'fest': 'diya', 'vrat': 'moon', 'fam': 'flame'}[kind]
    return (f'<div class="uc{" soon" if soon else ""}"><div class="top"><div><div class="dn">{day}</div><div class="dm">{mon}</div></div>'
            f'<span class="ic {kind}">{i(icon)}</span></div><div class="nm">{name}</div><div class="when">{when}</div></div>')


def tabs(lang):
    names = {'gu': ['આજે', 'વ્રત', 'પરિવાર', 'કેલેન્ડર'], 'en': ['Today', 'Vrat', 'Family', 'Calendar']}[lang]
    icons = ['sun', 'moon', 'people', 'cal']
    return '<nav class="tabs">' + ''.join(f'<div class="tab{" on" if k == 0 else ""}"><span class="pip">{i(ic)}</span>{n}</div>' for k, (n, ic) in enumerate(zip(names, icons))) + '</nav>'


def good_gu():
    return f'''
<div class="phone v3 tall">
  <div class="island"></div>
  {header('અમદાવાદ')}
  {mast('શનિવાર, 24 ઑક્ટોબર', 'આસો સુદ તેરસ', 'બપોરે 1:36 સુધી, પછી ચૌદસ · વિ.સં. 2082', 12)}
  <div class="hero3">
    <div class="band good">
      <div class="b-eyebrow"><span>અત્યારે</span><span>બપોરે 2:20</span></div>
      <div class="b-big"><h2>સારો સમય</h2><span class="pill">લાભ</span></div>
      <div class="b-until">બપોરે 3:15 સુધી<span>55 મિનિટ બાકી</span></div>
      <div class="track"><i style="width:35%"></i></div>
    </div>
    <div class="ctx">
      <div class="ctx-next">પછી<b>અમૃત 3:15 – 4:41<em>એ પણ સારું</em></b></div>
      {ribbon(RIBBON_DAY_1024, 67)}
      <div class="scale"><span>6:40</span><span>બપોર</span><span>6:07</span></div>
      <div class="more">બધાં ચોઘડિયાં · દિવસ / રાત{i('chevr', 's')}</div>
    </div>
  </div>

  <div class="sec3"><h3>આવનારા દિવસો</h3><a>બધાં</a></div>
  <div class="strip">
    {uc('26', 'ઑક્ટો · સોમ', 'શરદ પૂનમ', '2 દિવસમાં', 'fest', True)}
    {uc('29', 'ઑક્ટો · ગુરુ', 'કરવા ચોથ', '5 દિવસમાં', 'fest')}
    {uc('29', 'ઑક્ટો · ગુરુ', 'વક્રતુંડ સંકષ્ટી', 'ચંદ્રોદય રાત્રે 8:47', 'vrat')}
  </div>

  <div class="sec3"><h3>આજનો દિવસ</h3></div>
  <div class="grid3">
    {sun_tile('gu', '6:40', '4:44', '6:07', 0.67, ['સૂર્યોદય', 'ચંદ્રોદય', 'સૂર્યાસ્ત'])}
    {tile('રાહુકાળ', '9:32 – 10:58', 'var(--bad)')}
    {tile('અભિજિત', '12:01 – 12:47', 'var(--good)')}
    {tile('નક્ષત્ર', 'ઉત્તર ભાદ્રપદ')}
    {tile('યોગ', 'વ્યાઘાત')}
  </div>
  {tabs('gu')}
</div>'''


def rahu_gu():
    return f'''
<div class="phone v3">
  <div class="island"></div>
  {header('અમદાવાદ')}
  {mast('શનિવાર, 24 ઑક્ટોબર', 'આસો સુદ તેરસ', 'બપોરે 1:36 સુધી, પછી ચૌદસ · વિ.સં. 2082', 12)}
  <div class="hero3">
    <div class="band bad">
      <div class="b-eyebrow"><span>અત્યારે</span><span>સવારે 10:05</span></div>
      <div class="b-big"><h2>રાહુકાળ</h2><span class="pill">રોગ</span></div>
      <div class="b-until">સવારે 10:58 સુધી<span>53 મિનિટ બાકી</span></div>
      <div class="track"><i style="width:38%"></i></div>
      <span class="live">{i('bell')}લૉક સ્ક્રીન પર ગણતરી</span>
    </div>
    <div class="ctx">
      <div class="ctx-next">આગામી સારો સમય, 3 કલાક 45 મિનિટમાં<b>લાભ 1:50 – 3:15</b></div>
      {ribbon(RIBBON_DAY_1024, 30)}
      <div class="scale"><span>6:40</span><span>બપોર</span><span>6:07</span></div>
    </div>
  </div>
  <div class="sec3"><h3>આવનારા દિવસો</h3><a>બધાં</a></div>
  {tabs('gu')}
</div>'''


DIYA = '''<svg class="diya" viewBox="0 0 120 120">
  <defs><radialGradient id="glow" cx="50%" cy="42%" r="50%"><stop offset="0" stop-color="#FFD37A" stop-opacity=".75"/><stop offset=".45" stop-color="#F2A43A" stop-opacity=".25"/><stop offset="1" stop-color="#F2A43A" stop-opacity="0"/></radialGradient>
  <linearGradient id="clay" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E08A3C"/><stop offset="1" stop-color="#A4501F"/></linearGradient></defs>
  <circle cx="60" cy="48" r="50" fill="url(#glow)"/>
  <path d="M60 22 C67 34 69 44 60 56 C51 44 53 34 60 22Z" fill="#FFE29A"/>
  <path d="M60 33 C64 40 64 47 60 53 C56 47 56 40 60 33Z" fill="#FFF7DF"/>
  <path d="M20 66 H100 C98 84 82 94 60 94 C38 94 22 84 20 66Z" fill="url(#clay)"/>
  <path d="M20 66 C30 72 90 72 100 66" fill="none" stroke="#F6C56E" stroke-width="2.4"/>
  <g fill="#F6C56E"><circle cx="42" cy="81" r="2.2"/><circle cx="60" cy="84" r="2.2"/><circle cx="78" cy="81" r="2.2"/></g>
</svg>'''


def diwali_gu():
    return f'''
<div class="phone v3">
  <div class="island"></div>
  {header('અમદાવાદ')}
  {mast('રવિવાર, 8 નવેમ્બર', 'આસો વદ ચૌદસ', 'સવારે 11:27 સુધી, પછી અમાસ · વિ.સં. 2082', 28)}
  <div class="hero3">
    <div class="band fest">
      {DIYA}
      <div class="b-eyebrow"><span>આજે તહેવાર</span></div>
      <h2>દિવાળી</h2>
      <div class="fsub">લક્ષ્મી પૂજન</div>
      <div class="mu"><span>પૂજાનું મુહૂર્ત · 52 મિનિટમાં</span><b>સાંજે 6:22 – 8:21</b><small>પ્રદોષ કાળ અને સ્થિર વૃષભ લગ્ન</small></div>
    </div>
    <div class="nowline"><i class="dot"></i><b>અત્યારે રાહુકાળ</b><span>સાંજે 5:58 સુધી</span></div>
    <div class="nowline go"><i class="gdot"></i><b>પછી શુભ</b><span>5:58 – 7:34</span></div>
  </div>
  <div class="sec3"><h3>આવનારા દિવસો</h3><a>બધાં</a></div>
  <div class="strip">
    {uc('10', 'નવે · મંગળ', 'બેસતું વર્ષ', '2 દિવસમાં', 'fest', True)}
    {uc('11', 'નવે · બુધ', 'ભાઈ બીજ', '3 દિવસમાં', 'fest')}
    {uc('14', 'નવે · શનિ', 'લાભ પાંચમ', '6 દિવસમાં', 'fest')}
  </div>
  {tabs('gu')}
</div>'''


def good_en_dark():
    return f'''
<div class="phone v3 en dark">
  <div class="island"></div>
  {header('Ahmedabad')}
  {mast('Saturday, 24 October', 'Ashwin Shukla Trayodashi', 'until 1:36 pm, then Chaturdashi · Samvat 2082', 12).replace('<h1>', '<h1 style="font-size:28px">')}
  <div class="hero3">
    <div class="band good">
      <div class="b-eyebrow"><span>Now</span><span>2:20 pm</span></div>
      <div class="b-big"><h2>Good time</h2><span class="pill">Labh</span></div>
      <div class="b-until">until 3:15 pm<span>55 min left</span></div>
      <div class="track"><i style="width:35%"></i></div>
    </div>
    <div class="ctx">
      <div class="ctx-next">Next<b>Amrit 3:15 – 4:41 pm<em>also good</em></b></div>
      {ribbon(RIBBON_DAY_1024, 67)}
      <div class="scale"><span>6:40 am</span><span>noon</span><span>6:07 pm</span></div>
      <div class="more">All choghadiya · day / night{i('chevr', 's')}</div>
    </div>
  </div>
  <div class="sec3"><h3>Coming up</h3><a>All</a></div>
  <div class="strip">
    {uc('26', 'Oct · Mon', 'Sharad Purnima', 'in 2 days', 'fest', True)}
    {uc('29', 'Oct · Thu', 'Karva Chauth', 'in 5 days', 'fest')}
    {uc('29', 'Oct · Thu', 'Vakratunda Sankashti', 'moonrise 8:47 pm', 'vrat')}
  </div>
  {tabs('en')}
</div>'''


NOTES = '''
<div class="notes">
  <h3>Vì sao mắt chưa biết nhìn đâu</h3>
  <p>Ở bản hiện tại, mọi khối đều là thẻ trắng, chữ cùng cỡ, cách nhau đều. Thẻ quan trọng nhất ("bây giờ có phải giờ tốt không") trông giống hệt thẻ mặt trời ở cuối màn.</p>
  <h3>Ba tầng, một điểm nhấn</h3>
  <p><b>1. Điểm nhấn duy nhất:</b> thẻ "Bây giờ" có nền màu theo trạng thái: xanh lá là giờ tốt, đỏ gạch là Rahu Kaal. Chữ lớn trả lời ngay, thanh đếm cho biết còn bao lâu. Đây là thứ người Gujarat mở app để xem (choghadiya cũng là trang có nhiều lượt tìm nhất trên web).</p>
  <p><b>Ngày lễ lớn:</b> điểm nhấn đổi thành lễ. Diwali thì hiện đèn diya và giờ Lakshmi Pujan, còn "bây giờ" thu lại thành hai dòng ngay dưới.</p>
  <p><b>2. Tithi:</b> chữ serif Gujarati lớn, mặt trăng bên cạnh, nằm trên nền giấy, không đóng khung.</p>
  <p><b>3. Phần còn lại:</b> ô nhỏ, ít chữ. "Sắp tới" thành thẻ ngang (ngày to, tên, bao lâu nữa). Nakshatra và yoga chuyển xuống ô "Hôm nay". Bảng chú giải màu chuyển vào màn Choghadiya.</p>
  <h3>Chất Gujarat</h3>
  <p><b>Toran:</b> dây lá xoài và hoa vạn thọ treo trên cửa nhà Gujarat ngày lễ, ở đầu màn như bước qua cửa. Nó cuộn đi cùng nội dung, không đè lên chữ.</p>
  <p><b>Bandhani:</b> hoa văn chấm buộc nhuộm (Kutch, Jamnagar) in chìm trong thẻ màu.</p>
  <p><b>Diya</b> cho Diwali. Có thể làm thêm một hình cho mỗi lễ lớn: diều cho Uttarayan, garba cho Navratri.</p>
  <p>Màu lá xoài và vạn thọ chỉ dùng để trang trí. Chữ vẫn giữ các màu đã đo tương phản; chữ trắng trên thẻ xanh và thẻ đỏ đều trên 4.5:1.</p>
  <div class="sw">
    <div style="background:#4F7A3A"></div><div style="background:#E2902B"></div><div style="background:#F4BC45"></div>
    <div style="background:#2B5841"></div><div style="background:#85342C"></div><div style="background:#3A2140"></div>
  </div>
  <h3>Cần bạn chốt</h3>
  <p>1. Hướng chung: thẻ "Bây giờ" có màu làm điểm nhấn.<br>2. Toran ở đầu màn: giữ, làm mảnh hơn, hay bỏ.<br>3. Ngày lễ lớn thì lễ thay chỗ thẻ "Bây giờ".</p>
  <p>Không cần thêm dữ liệu hay API mới. Giờ muhurat của Diwali và Dhanteras đã có sẵn từ /api/v1/festival.</p>
</div>'''


def body():
    return CSS + good_gu() + rahu_gu() + diwali_gu() + good_en_dark() + NOTES
