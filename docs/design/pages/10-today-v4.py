import math
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent.parent))
from build import i

TITLE = 'Hôm nay v4: tinh gọn, văn hóa ở chi tiết'
SUB = ('Từ trái: ngày thường lúc giờ tốt (cuộn hết màn); đang Rahu Kaal; ngày Diwali; tiếng Anh nền tối. '
       'Bỏ dây toran; chất Gujarat nằm ở chữ, hoa văn kairi, vòng thêu abhla quanh mặt trăng, chấm bandhani rất nhạt.')

CSS = '''
<style>
  .v4 { padding-top: 54px; }
  .v4.tall { height: auto; padding-bottom: 120px; }
  .v4 .bar { margin-bottom: 18px; }

  /* Masthead: the day, in the household's own words */
  .m-date { display: flex; align-items: center; justify-content: space-between; margin: 0 2px; }
  .m-date span { display: inline-flex; align-items: center; gap: 7px; font-size: 14.5px; color: var(--ink2); font-weight: 500; }
  .kairi { width: 13px; height: 16px; color: var(--accent); flex: none; }
  .steps { display: flex; gap: 6px; }
  .steps b { width: 30px; height: 30px; border-radius: 15px; background: var(--sunk); display: grid; place-items: center; color: var(--ink2); }
  .steps svg { width: 14px; height: 14px; }
  .m-tithi { display: flex; align-items: center; gap: 10px; margin: 6px 0 0 2px; }
  .m-tithi h1 { flex: 1; margin: 0; font: 600 35px/1.2 var(--gu-serif); letter-spacing: -.3px; }
  .en .m-tithi h1 { font-family: 'Source Serif 4', Georgia, serif; font-size: 29px; line-height: 1.18; }
  .abhla { width: 72px; height: 72px; flex: none; }
  .m-sub { margin: 2px 2px 20px; font-size: 14.5px; color: var(--ink2); font-variant-numeric: tabular-nums; }

  /* Now: the one coloured thing on the screen */
  .now4 { border-radius: 24px; overflow: hidden; background: var(--card); box-shadow: 0 1px 2px rgba(60,35,15,.06), 0 10px 26px rgba(60,35,15,.10); margin-bottom: 28px; }
  .dark .now4 { box-shadow: 0 10px 26px rgba(0,0,0,.4); }
  .band { position: relative; padding: 15px 18px 17px; color: #fff; }
  .band::after { content: ''; position: absolute; inset: 0; pointer-events: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='26' height='26'%3E%3Cg fill='%23fff' fill-opacity='.085'%3E%3Ccircle cx='13' cy='9' r='1.1'/%3E%3Ccircle cx='17' cy='13' r='1.1'/%3E%3Ccircle cx='13' cy='17' r='1.1'/%3E%3Ccircle cx='9' cy='13' r='1.1'/%3E%3C/g%3E%3C/svg%3E"); }
  .band > * { position: relative; z-index: 1; }
  .band.good { background: linear-gradient(170deg, #3F7458 0%, #2F5D45 100%); }
  .band.bad  { background: linear-gradient(170deg, #A54A40 0%, #8A3A31 100%); }
  .dark .band.good { background: linear-gradient(170deg, #2E5842 0%, #23463A 100%); }
  .dark .band.bad  { background: linear-gradient(170deg, #7A352E 0%, #5E2823 100%); }
  .b-eye { font-size: 13.5px; font-weight: 500; color: rgba(255,255,255,.93); font-variant-numeric: tabular-nums; }
  .b-big { display: flex; align-items: baseline; gap: 10px; margin-top: 4px; }
  .b-big h2 { margin: 0; font: 700 30px/1.2 var(--gu); letter-spacing: -.2px; }
  .en .b-big h2 { font-family: Inter, sans-serif; font-size: 28px; }
  .b-big span { font-size: 15px; font-weight: 500; color: rgba(255,255,255,.93); }
  .b-until { display: flex; justify-content: space-between; align-items: baseline; margin-top: 12px; font-size: 15.5px; font-weight: 600; font-variant-numeric: tabular-nums; }
  .b-until span { font-size: 13.5px; font-weight: 500; color: rgba(255,255,255,.93); }
  .track { height: 4px; border-radius: 2px; background: rgba(255,255,255,.26); margin-top: 8px; overflow: hidden; }
  .track i { display: block; height: 100%; border-radius: 2px; background: #fff; }
  .live { display: inline-flex; align-items: center; gap: 6px; margin-top: 13px; font-size: 13px; font-weight: 600; color: #fff; padding: 6px 11px; border-radius: 999px; box-shadow: inset 0 0 0 1px rgba(255,255,255,.45); }
  .live svg { width: 13px; height: 13px; }
  .ctx { padding: 13px 18px 13px; }
  .ctx-next { font-size: 13.5px; color: var(--ink2); }
  .ctx-next b { display: block; color: var(--ink); font-size: 20px; font-weight: 600; margin-top: 1px; font-variant-numeric: tabular-nums; letter-spacing: -.2px; }
  .ctx-next em { font-style: normal; font-size: 13px; font-weight: 500; color: var(--good); margin-left: 6px; }
  .ctx .ribbon { height: 10px; margin: 14px 0 7px; }
  .ctx .nowmark { top: -5px; height: 20px; }
  .ctx .more { padding-top: 11px; margin-top: 11px; border-top: 1px solid var(--line); }

  /* A festival day: the festival leads */
  .band.fest { background: linear-gradient(165deg, #46263F 0%, #2C1A2E 100%); color: #FFF4DE; padding: 16px 18px 18px; }
  .band.fest::after { opacity: .8; }
  .band.fest .b-eye { color: #EFC77A; }
  .band.fest h2 { margin: 4px 0 0; font: 600 40px/1.15 var(--gu-serif); }
  .fsub { font-size: 15px; color: #EBD6B4; margin-top: 2px; }
  .diya { position: absolute; right: 14px; top: 12px; width: 76px; height: 76px; z-index: 1; }
  .mu { margin-top: 16px; padding-top: 13px; border-top: 1px solid rgba(239,199,122,.28); }
  .mu span { font-size: 13px; color: #EFC77A; font-weight: 500; }
  .mu b { display: block; font-size: 23px; font-weight: 600; margin-top: 1px; font-variant-numeric: tabular-nums; }
  .mu small { font-size: 13px; color: #EBD6B4; }
  .nl { display: flex; align-items: center; gap: 10px; padding: 12px 18px; font-size: 14.5px; }
  .nl + .nl { border-top: 1px solid var(--line); }
  .nl i { flex: none; }
  .nl .rb { width: 12px; height: 3px; border-radius: 2px; background: var(--bad); }
  .nl .gd { width: 8px; height: 8px; border-radius: 4px; background: var(--good); }
  .nl b { font-weight: 600; }
  .nl b.bad { color: var(--bad); }
  .nl span { color: var(--ink2); margin-left: auto; font-variant-numeric: tabular-nums; white-space: nowrap; }

  /* Sections */
  .s4 { display: flex; justify-content: space-between; align-items: baseline; margin: 0 2px 10px; }
  .s4 h3 { margin: 0; font: 600 18px/1.2 var(--gu-serif); }
  .en .s4 h3 { font-family: 'Source Serif 4', Georgia, serif; }
  .s4 a { font-size: 14px; color: var(--accent); font-weight: 600; }

  /* Coming up: quiet cards across */
  .strip { display: flex; gap: 10px; margin: 0 -20px 28px; padding: 0 20px 4px; overflow: hidden; }
  .uc { width: 132px; flex: none; border-radius: 18px; background: var(--card); box-shadow: var(--shadow); padding: 12px 13px 13px; }
  .uc .top { display: flex; justify-content: space-between; align-items: flex-start; }
  .uc .dn { font: 600 24px/1 Inter, sans-serif; letter-spacing: -.4px; }
  .uc .dm { font-size: 12.5px; color: var(--ink2); margin-top: 4px; }
  .uc .k { width: 7px; height: 7px; border-radius: 4px; margin-top: 6px; }
  .uc .k.fest { background: var(--accent); } .uc .k.vrat { background: var(--good); } .uc .k.fam { background: var(--fair-ink); }
  .uc .nm { font-size: 15px; font-weight: 600; line-height: 1.3; margin-top: 14px; min-height: 39px; }
  .uc .when { font-size: 12.5px; color: var(--ink2); margin-top: 3px; }

  /* The day: one card, hairlines inside */
  .day4 { border-radius: 20px; background: var(--card); box-shadow: var(--shadow); overflow: hidden; }
  .sunrow { padding: 10px 16px 12px; }
  .sun4 { width: 100%; height: 56px; display: block; }
  .suntimes { display: flex; justify-content: space-between; font-size: 12.5px; color: var(--ink2); margin-top: 2px; }
  .suntimes b { display: block; color: var(--ink); font-size: 15.5px; font-weight: 600; font-variant-numeric: tabular-nums; }
  .suntimes div:nth-child(2) { text-align: center; } .suntimes div:nth-child(3) { text-align: right; }
  .cells { display: grid; grid-template-columns: 1fr 1fr; border-top: 1px solid var(--line); }
  .cells div { padding: 11px 16px 12px; font-size: 12.5px; color: var(--ink2); }
  .cells div:nth-child(odd) { border-right: 1px solid var(--line); }
  .cells div:nth-child(n+3) { border-top: 1px solid var(--line); }
  .cells b { display: block; color: var(--ink); font-size: 15.5px; font-weight: 600; margin-top: 2px; font-variant-numeric: tabular-nums; }
  .cells em { display: inline-block; width: 7px; height: 7px; border-radius: 4px; margin-right: 6px; vertical-align: 0; }
</style>
'''

RIBBON_1024 = ['b', 'g', 'r', 'b', 'f', 'g', 'g', 'b']

KAIRI = ('<svg class="kairi" viewBox="0 0 13 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round">'
         '<path d="M6.5 15C3.3 15 1.2 12.6 1.2 9.8 1.2 5.6 4.6 2.4 8.6 1.4c1.8-.4 3.3.2 3.3 1.6 0 1.2-1.3 1.6-2 1M8.6 1.4c2.6 2 3.8 5.2 3.2 8.4-.5 3-2.6 5.2-5.3 5.2"/>'
         '<circle cx="6.4" cy="10" r="1.3" fill="currentColor" stroke="none"/></svg>')


def moon(idx: int) -> str:
    """The moon for tithi index 0..29, inside a ring of abhla stitches (Kutch mirror work)."""
    phase = (idx + 1) / 30 * 2 * math.pi
    rx = abs(math.cos(phase)) * 26
    waxing = idx < 15
    gibbous = math.cos(phase) < 0
    side = 1 if waxing else 0
    sweep = (1 if gibbous else 0) if waxing else (0 if gibbous else 1)
    lit = f'M36 10 A26 26 0 0 {side} 36 62 A{rx:.1f} 26 0 0 {sweep} 36 10 Z'
    return (f'<svg class="abhla" viewBox="0 0 72 72">'
            f'<circle cx="36" cy="36" r="33.5" fill="none" stroke="var(--accent)" stroke-opacity=".55" stroke-width="1.6" stroke-linecap="round" stroke-dasharray="0.1 5.25"/>'
            f'<circle cx="36" cy="36" r="30" fill="none" stroke="var(--accent)" stroke-opacity=".28" stroke-width="1"/>'
            f'<circle cx="36" cy="36" r="26" fill="var(--moon-dark)"/><path d="{lit}" fill="var(--moon-lit)"/>'
            f'<circle cx="36" cy="36" r="26" fill="none" stroke="var(--moon-rim)"/></svg>')


def ribbon(segs, now_pct) -> str:
    return '<div class="ribbon">' + ''.join(f'<span class="{c}"></span>' for c in segs) + f'<i class="nowmark" style="left:{now_pct:.1f}%"></i></div>'


def header(place):
    return f'<div class="bar"><span class="place">{i("pin", "s")}{place}{i("chevd", "s")}</span><span class="actions"><span class="round">{i("share", "s")}</span><span class="round">{i("gear", "s")}</span></span></div>'


def mast(date, tithi, sub, idx, en=False):
    return f'''
  <div class="m-date"><span>{KAIRI}{date}</span><span class="steps"><b>{i('chevl')}</b><b>{i('chevr')}</b></span></div>
  <div class="m-tithi"><h1>{tithi}</h1>{moon(idx)}</div>
  <div class="m-sub">{sub}</div>'''


def uc(day, mon, name, when, kind):
    return f'<div class="uc"><div class="top"><div><div class="dn">{day}</div><div class="dm">{mon}</div></div><i class="k {kind}"></i></div><div class="nm">{name}</div><div class="when">{when}</div></div>'


def day_card(labels, rise, moonrise, sets, pct, cells):
    t = max(0.0, min(1.0, pct))
    x, y = 10 + 330 * t, 52 - 168 * t * (1 - t)
    cx, cy = 10 + 165 * t, 52 - 84 * t
    cl = ''.join(f'<div>{f"<em style=background:{dot}></em>" if dot else ""}{lab}<b>{val}</b></div>' for lab, val, dot in cells)
    return f'''
  <div class="day4">
    <div class="sunrow">
      <svg class="sun4" viewBox="0 0 350 58" preserveAspectRatio="none">
        <path d="M10 52 Q175 -32 340 52" fill="none" stroke="var(--line)" stroke-width="1.6" stroke-dasharray="2 5" stroke-linecap="round"/>
        <path d="M10 52 Q{cx:.0f} {cy:.0f} {x:.0f} {y:.0f}" fill="none" stroke="var(--accent)" stroke-opacity=".7" stroke-width="2" stroke-linecap="round"/>
        <circle cx="{x:.0f}" cy="{y:.0f}" r="6.5" fill="var(--card)" stroke="var(--accent)" stroke-width="2"/>
        <circle cx="{x:.0f}" cy="{y:.0f}" r="2.6" fill="var(--accent)"/>
      </svg>
      <div class="suntimes"><div>{labels[0]}<b>{rise}</b></div><div>{labels[1]}<b>{moonrise}</b></div><div>{labels[2]}<b>{sets}</b></div></div>
    </div>
    <div class="cells">{cl}</div>
  </div>'''


def tabs(lang):
    names = {'gu': ['આજે', 'વ્રત', 'પરિવાર', 'કેલેન્ડર'], 'en': ['Today', 'Vrat', 'Family', 'Calendar']}[lang]
    icons = ['sun', 'moon', 'people', 'cal']
    return '<nav class="tabs">' + ''.join(f'<div class="tab{" on" if k == 0 else ""}"><span class="pip">{i(ic)}</span>{n}</div>' for k, (n, ic) in enumerate(zip(names, icons))) + '</nav>'


def good_gu():
    return f'''
<div class="phone v4 tall">
  <div class="island"></div>
  {header('અમદાવાદ')}
  {mast('શનિવાર, 24 ઑક્ટોબર', 'આસો સુદ તેરસ', 'બપોરે 1:36 સુધી, પછી ચૌદસ · વિ.સં. 2082', 12)}
  <div class="now4">
    <div class="band good">
      <div class="b-eye">અત્યારે · બપોરે 2:20</div>
      <div class="b-big"><h2>સારો સમય</h2><span>લાભ</span></div>
      <div class="b-until">બપોરે 3:15 સુધી<span>55 મિનિટ બાકી</span></div>
      <div class="track"><i style="width:35%"></i></div>
    </div>
    <div class="ctx">
      <div class="ctx-next">પછી<b>અમૃત 3:15 – 4:41<em>એ પણ સારું</em></b></div>
      {ribbon(RIBBON_1024, 67)}
      <div class="scale"><span>6:40</span><span>બપોર</span><span>6:07</span></div>
      <div class="more">બધાં ચોઘડિયાં · દિવસ / રાત{i('chevr', 's')}</div>
    </div>
  </div>
  <div class="s4"><h3>આવનારા દિવસો</h3><a>બધાં</a></div>
  <div class="strip">
    {uc('26', 'ઑક્ટો · સોમ', 'શરદ પૂનમ', '2 દિવસમાં', 'fest')}
    {uc('29', 'ઑક્ટો · ગુરુ', 'કરવા ચોથ', '5 દિવસમાં', 'fest')}
    {uc('29', 'ઑક્ટો · ગુરુ', 'વક્રતુંડ સંકષ્ટી', 'ચંદ્રોદય રાત્રે 8:47', 'vrat')}
  </div>
  <div class="s4"><h3>આજનો દિવસ</h3></div>
  {day_card(['સૂર્યોદય', 'ચંદ્રોદય', 'સૂર્યાસ્ત'], '6:40', '4:44', '6:07', 0.67,
            [('રાહુકાળ', '9:32 – 10:58', 'var(--bad)'), ('અભિજિત', '12:01 – 12:47', 'var(--good)'), ('નક્ષત્ર', 'ઉત્તર ભાદ્રપદ', None), ('યોગ', 'વ્યાઘાત', None)])}
  {tabs('gu')}
</div>'''


def rahu_gu():
    return f'''
<div class="phone v4">
  <div class="island"></div>
  {header('અમદાવાદ')}
  {mast('શનિવાર, 24 ઑક્ટોબર', 'આસો સુદ તેરસ', 'બપોરે 1:36 સુધી, પછી ચૌદસ · વિ.સં. 2082', 12)}
  <div class="now4">
    <div class="band bad">
      <div class="b-eye">અત્યારે · સવારે 10:05</div>
      <div class="b-big"><h2>રાહુકાળ</h2><span>રોગ</span></div>
      <div class="b-until">સવારે 10:58 સુધી<span>53 મિનિટ બાકી</span></div>
      <div class="track"><i style="width:38%"></i></div>
      <span class="live">{i('bell')}લૉક સ્ક્રીન પર ગણતરી</span>
    </div>
    <div class="ctx">
      <div class="ctx-next">આગામી સારો સમય, 3 કલાક 45 મિનિટમાં<b>લાભ 1:50 – 3:15</b></div>
      {ribbon(RIBBON_1024, 30)}
      <div class="scale"><span>6:40</span><span>બપોર</span><span>6:07</span></div>
    </div>
  </div>
  <div class="s4"><h3>આવનારા દિવસો</h3><a>બધાં</a></div>
  {tabs('gu')}
</div>'''


DIYA = '''<svg class="diya" viewBox="0 0 80 80">
  <defs><radialGradient id="glow4" cx="50%" cy="40%" r="50%"><stop offset="0" stop-color="#FFD37A" stop-opacity=".45"/><stop offset="1" stop-color="#FFD37A" stop-opacity="0"/></radialGradient></defs>
  <circle cx="40" cy="32" r="30" fill="url(#glow4)"/>
  <path d="M40 14 C45 22 46 29 40 37 C34 29 35 22 40 14Z" fill="#F7CF7A"/>
  <path d="M40 22 C42.5 26.5 42.5 31 40 35 C37.5 31 37.5 26.5 40 22Z" fill="#FFF3D6"/>
  <path d="M14 44 H66 C64.5 56 54 62 40 62 C26 62 15.5 56 14 44Z" fill="none" stroke="#EFC77A" stroke-width="1.8" stroke-linejoin="round"/>
  <path d="M22 50 H58" stroke="#EFC77A" stroke-opacity=".5" stroke-width="1" stroke-dasharray="0.1 4" stroke-linecap="round"/>
</svg>'''


def diwali_gu():
    return f'''
<div class="phone v4">
  <div class="island"></div>
  {header('અમદાવાદ')}
  {mast('રવિવાર, 8 નવેમ્બર', 'આસો વદ ચૌદસ', 'સવારે 11:27 સુધી, પછી અમાસ · વિ.સં. 2082', 28)}
  <div class="now4">
    <div class="band fest">
      {DIYA}
      <div class="b-eye">આજે તહેવાર</div>
      <h2>દિવાળી</h2>
      <div class="fsub">લક્ષ્મી પૂજન</div>
      <div class="mu"><span>પૂજાનું મુહૂર્ત · 52 મિનિટમાં</span><b>સાંજે 6:22 – 8:21</b><small>પ્રદોષ કાળ અને સ્થિર વૃષભ લગ્ન</small></div>
    </div>
    <div class="nl"><i class="rb"></i><b class="bad">અત્યારે રાહુકાળ</b><span>સાંજે 5:58 સુધી</span></div>
    <div class="nl"><i class="gd"></i><b>પછી શુભ</b><span>5:58 – 7:34</span></div>
  </div>
  <div class="s4"><h3>આવનારા દિવસો</h3><a>બધાં</a></div>
  <div class="strip">
    {uc('10', 'નવે · મંગળ', 'બેસતું વર્ષ', '2 દિવસમાં', 'fest')}
    {uc('11', 'નવે · બુધ', 'ભાઈ બીજ', '3 દિવસમાં', 'fest')}
    {uc('14', 'નવે · શનિ', 'લાભ પાંચમ', '6 દિવસમાં', 'fest')}
  </div>
  {tabs('gu')}
</div>'''


def good_en_dark():
    return f'''
<div class="phone v4 en dark">
  <div class="island"></div>
  {header('Ahmedabad')}
  {mast('Saturday, 24 October', 'Ashwin Shukla Trayodashi', 'until 1:36 pm, then Chaturdashi · Samvat 2082', 12)}
  <div class="now4">
    <div class="band good">
      <div class="b-eye">Now · 2:20 pm</div>
      <div class="b-big"><h2>Good time</h2><span>Labh</span></div>
      <div class="b-until">until 3:15 pm<span>55 min left</span></div>
      <div class="track"><i style="width:35%"></i></div>
    </div>
    <div class="ctx">
      <div class="ctx-next">Next<b>Amrit 3:15 – 4:41 pm<em>also good</em></b></div>
      {ribbon(RIBBON_1024, 67)}
      <div class="scale"><span>6:40 am</span><span>noon</span><span>6:07 pm</span></div>
      <div class="more">All choghadiya · day / night{i('chevr', 's')}</div>
    </div>
  </div>
  <div class="s4"><h3>Coming up</h3><a>All</a></div>
  <div class="strip">
    {uc('26', 'Oct · Mon', 'Sharad Purnima', 'in 2 days', 'fest')}
    {uc('29', 'Oct · Thu', 'Karva Chauth', 'in 5 days', 'fest')}
    {uc('29', 'Oct · Thu', 'Vakratunda Sankashti', 'moonrise 8:47 pm', 'vrat')}
  </div>
  {tabs('en')}
</div>'''


NOTES = '''
<div class="notes">
  <h3>Thay đổi so với v3</h3>
  <p><b>Bỏ dây toran.</b> Chất Gujarat chuyển vào các chi tiết nhỏ, một màu, nằm đúng chỗ của chúng:</p>
  <p><b>Kairi</b> (hoa văn hình quả xoài non, có mặt khắp vải và trang sức Gujarat): một nét nhỏ màu nghệ trước dòng ngày, như con dấu.</p>
  <p><b>Abhla</b> (vòng thêu gương Kutch): một vòng chấm khâu mảnh quanh mặt trăng.</p>
  <p><b>Bandhani:</b> chấm nhạt hơn, thưa hơn; nhìn gần mới thấy.</p>
  <p><b>Diya:</b> nét vẽ mảnh màu vàng, không còn chén đất tô đậm và quầng sáng lớn.</p>
  <h3>Gọn hơn</h3>
  <p>Thẻ "Bây giờ": bỏ viên tên choghadiya, tên chỉ còn là chữ nhỏ cạnh câu trả lời. Màu nền trầm hơn, bóng nhẹ hơn, thanh đếm mảnh hơn.</p>
  <p>Thẻ "Sắp tới": bỏ viền cam và ô biểu tượng, loại sự kiện chỉ còn một chấm màu.</p>
  <p>"Hôm nay": năm ô rời gộp thành một thẻ, chia bằng đường kẻ mảnh.</p>
  <p>Chữ trắng trên thẻ xanh và thẻ đỏ vẫn trên 4.5:1. Không thêm màu nào ngoài bảng màu hiện có.</p>
</div>'''


def body():
    return CSS + good_gu() + rahu_gu() + diwali_gu() + good_en_dark() + NOTES
