import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent.parent))
from build import i, tabs

TITLE = 'Lịch tháng, bảng chi tiết ngày, nhảy nhanh tới tháng hoặc lễ ở năm xa'
SUB = 'Từ trái: tháng 11/2026; chạm một ngày; tiếng Anh nền tối; chạm tiêu đề tháng để chọn năm và tháng; bộ chọn theo Vikram Samvat (tiếng Anh); tìm "દિવાળી" ra mọi năm. Dữ liệu minh họa.'


def actions(*names):
    return '<span class="actions">' + ''.join(f'<span class="round">{i(n, "s")}</span>' for n in names) + '</span>'


# November 2026 starts on a Sunday. Sunrise tithi per day (Amanta: Aso vad, then Kartak sud from the 10th).
TITHI = {1: 7, 2: 8, 3: 9, 4: 10, 5: 11, 6: 12, 7: 13, 8: 14, 9: 30, 10: 1, 11: 2, 12: 3, 13: 4, 14: 5, 15: 6, 16: 7, 17: 8,
         18: 9, 19: 10, 20: 10, 21: 11, 22: 12, 23: 14, 24: 15, 25: 1, 26: 2, 27: 3, 28: 4, 29: 5, 30: 6}
DOTS = {5: 'v', 6: 'f', 7: 'p', 8: 'f', 9: 'v', 10: 'f', 11: 'f', 14: 'p', 21: 'v', 24: 'fv'}


def tithi_label(d, lang):
    t = TITHI[d]
    if lang == 'gu':
        if t == 30: return 'અમાસ'
        if t == 15: return 'પૂનમ'
        return ('સુદ ' if 10 <= d <= 24 else 'વદ ') + str(t)
    if t == 30: return 'Amavasya'
    if t == 15: return 'Purnima'
    return ('S ' if 10 <= d <= 24 else 'K ') + str(t)


def month_grid(lang, sel=None, today=None):
    wk = {'gu': ['ર', 'સો', 'મં', 'બુ', 'ગુ', 'શુ', 'શ'], 'en': ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']}[lang]
    cells = []
    for d in range(1, 31):
        cls = ' '.join(c for c in ['sel' if d == sel else '', 'today' if d == today else ''] if c)
        dots = ''.join(f'<em class="d-{k}"></em>' for k in DOTS.get(d, ''))
        # Punam and Amas are named in the cell itself, in ink, rather than marked with a moon dot next to the number
        strong = ' class="pn"' if TITHI[d] in (15, 30) else ''
        cells.append(f'<div class="{cls}"><b>{d}</b><i{strong}>{tithi_label(d, lang)}</i><span class="dots">{dots}</span></div>')
    for d in range(1, 6):
        cells.append(f'<div class="muted"><b>{d}</b><i>{"વદ" if lang == "gu" else "K"} {6 + d}</i></div>')
    return ('<div class="card grid"><div class="wk">' + ''.join(f'<span>{w}</span>' for w in wk) + '</div>'
            '<div class="days">' + ''.join(cells) + '</div></div>')


def legend(lang):
    names = {'gu': ['તહેવાર', 'વ્રત', 'પરિવાર'], 'en': ['Festival', 'Vrat', 'Family']}[lang]
    return ('<div class="legend">' + ''.join(f'<span><em class="d-{k}"></em>{n}</span>' for k, n in zip('fvp', names)) + '</div>')


def body():
    month = f'''
<div class="phone">
  <div class="island"></div>
  <div class="title-bar"><h1 class="title">કેલેન્ડર</h1><span class="actions"><span class="pill">આજે</span><span class="round">{i('search', 's')}</span><span class="round">{i('gear', 's')}</span></span></div>
  <div class="cal-head"><div><div class="m">નવેમ્બર 2026 {i('chevd', 's')}</div><div class="lm">આસો · કારતક · વિ.સં. 2082–83</div></div>
    <div class="nav2"><span class="round">{i('chevl', 's')}</span><span class="round">{i('chevr', 's')}</span></div></div>
  {month_grid('gu', sel=8)}
  {legend('gu')}
  <div class="card list">
    <div class="item"><div class="dt"><b>7</b><span>શનિ</span></div><div class="it"><b>બાની પુણ્યતિથિ</b><span>આસો વદ તેરસ</span></div><span class="chev">{i('chevr', 's')}</span></div>
    <div class="item"><div class="dt"><b>8</b><span>રવિ</span></div><div class="it"><b>દિવાળી</b><span>લક્ષ્મી પૂજન 6:21 – 8:12</span></div><span class="chev">{i('chevr', 's')}</span></div>
    <div class="item"><div class="dt"><b>10</b><span>મંગળ</span></div><div class="it"><b>બેસતું વર્ષ</b><span>નૂતન વર્ષ · વિ.સં. 2083</span></div><span class="chev">{i('chevr', 's')}</span></div>
  </div>
  {tabs('cal')}
</div>'''

    sheet = f'''
<div class="phone">
  <div class="island"></div>
  <div class="title-bar"><h1 class="title">કેલેન્ડર</h1><span class="actions"><span class="pill">આજે</span><span class="round">{i('search', 's')}</span><span class="round">{i('gear', 's')}</span></span></div>
  <div class="cal-head"><div><div class="m">નવેમ્બર 2026 {i('chevd', 's')}</div><div class="lm">આસો · કારતક · વિ.સં. 2082–83</div></div>
    <div class="nav2"><span class="round">{i('chevl', 's')}</span><span class="round">{i('chevr', 's')}</span></div></div>
  {month_grid('gu', sel=8)}
  <div class="scrim"></div>
  <div class="sheet">
    <div class="grab"></div>
    <div class="sh-top"><div><div class="sh-d">રવિવાર, 8 નવેમ્બર</div><div class="sh-t">આસો વદ ચૌદસ; 11:27 થી અમાસ</div></div><span class="round">{i('x', 's')}</span></div>
    <div class="card list" style="margin:14px 0 12px;box-shadow:inset 0 0 0 1px var(--line)">
      <div class="item"><div class="dt" style="background:var(--accent-soft)"><span style="color:var(--accent)">{i('diya')}</span></div><div class="it"><b>દિવાળી</b><span>લક્ષ્મી પૂજન 6:21 – 8:12</span></div><span class="chev">{i('chevr', 's')}</span></div>
    </div>
    <div class="facts" style="margin-bottom:12px"><span class="fact">નક્ષત્ર <b>ચિત્રા</b></span><span class="fact">યોગ <b>પ્રીતિ</b></span><span class="fact">કરણ <b>શકુનિ</b></span></div>
    <div class="mini3"><div><b>6:48</b>સૂર્યોદય</div><div><b>5:56</b>સૂર્યાસ્ત</div><div class="rk"><b>4:32 – 5:56</b>રાહુકાળ</div></div>
    <div class="btn quiet" style="margin-top:14px">આખો દિવસ જુઓ {i('chevr', 's')}</div>
  </div>
</div>'''

    en = f'''
<div class="phone en dark">
  <div class="island"></div>
  <div class="title-bar"><h1 class="title">Calendar</h1><span class="actions"><span class="pill">Today</span><span class="round">{i('search', 's')}</span><span class="round">{i('gear', 's')}</span></span></div>
  <div class="cal-head"><div><div class="m">November 2026 {i('chevd', 's')}</div><div class="lm">Ashwin · Kartik · Samvat 2082–83</div></div>
    <div class="nav2"><span class="round">{i('chevl', 's')}</span><span class="round">{i('chevr', 's')}</span></div></div>
  {month_grid('en', sel=24)}
  {legend('en')}
  <div class="card list">
    <div class="item"><div class="dt"><b>24</b><span>Tue</span></div><div class="it"><b>Dev Diwali</b><span>Kartik Purnima · moonrise 5:12 pm</span></div><span class="chev">{i('chevr', 's')}</span></div>
    <div class="item"><div class="dt"><b>24</b><span>Tue</span></div><div class="it"><b>Purnima Vrat</b><span>Full-moon fast</span></div><span class="chev">{i('chevr', 's')}</span></div>
  </div>
  {tabs('cal', 'en')}
</div>'''

    notes = '''
<aside class="notes">
  <h3>Điểm chính</h3>
  <p><b>Mỗi ô ngày:</b> số dương lịch lớn, tithi nhỏ bên dưới (સુદ/વદ + số), chấm màu ở đáy cho loại ngày (saffron = lễ hội, xanh = vrat, nâu nhạt = ngày của gia đình), Punam/Amas ghi rõ bằng chữ đậm. Chỉ 3 màu, không cầu vồng.</p>
  <p><b>Tiêu đề tháng có cả tháng âm lịch và Vikram Samvat</b>, vì tháng 11 là tháng giao năm Gujarati (2082 sang 2083).</p>
  <p><b>Chạm một ngày:</b> bảng trượt lên với tithi, lễ hội (chạm để mở chi tiết), nakshatra/yoga/karana, mặt trời, Rahu Kaal. "Aakho divas juo" mở màn Hôm nay của đúng ngày đó, vẫn trong app.</p>
  <p><b>Nhảy tới năm xa: chạm tiêu đề tháng</b> (có mũi tên ▾). Bảng chọn mở ngay dưới: chọn năm bằng ‹ ›, chạm một trong 12 tháng, xong. Tối đa 2–3 lần chạm cho bất kỳ tháng nào. Chấm nhỏ = tháng có lễ lớn. Chuyển sang "Vikram Samvat" thì 12 ô là Kartik đến Ashwin, mỗi ô ghi kèm tháng dương tương ứng.</p>
  <p><b>Tìm theo tên lễ:</b> nút kính lúp (ở tab Lịch và tab Vrat). Gõ "દિવાળી" ra ngày của 5 năm liền; chạm một dòng là mở lịch tháng đúng ngày đó, hoặc mở chi tiết lễ.</p>
  <p><b>Nút "Hôm nay" ở góc trên</b> đưa về tháng hiện tại sau khi lướt sang tháng khác. Ngày giỗ, sinh nhật của gia đình hiện ngay trên lịch tháng.</p>
</aside>'''
    gu_months = ['જાન્યુ', 'ફેબ્રુ', 'માર્ચ', 'એપ્રિલ', 'મે', 'જૂન', 'જુલાઈ', 'ઑગસ્ટ', 'સપ્ટે', 'ઑક્ટો', 'નવે', 'ડિસે']
    big = {0, 2, 9, 10}  # months of 2029 with a major festival: Uttarayan, Holi, Navratri, Diwali
    cells = ''.join(f'<div class="{"on" if k == 2 else ""}">{m}{"<em></em>" if k in big else ""}</div>' for k, m in enumerate(gu_months))
    picker_gu = f'''
<div class="phone">
  <div class="island"></div>
  <div class="title-bar"><h1 class="title">કેલેન્ડર</h1><span class="actions"><span class="pill">આજે</span><span class="round">{i('search', 's')}</span><span class="round">{i('gear', 's')}</span></span></div>
  <div class="cal-head"><div><div class="m" style="color:var(--accent)">નવેમ્બર 2026 {i('chevd', 's')}</div><div class="lm">આસો · કારતક · વિ.સં. 2082–83</div></div></div>
  {month_grid('gu', sel=8)}
  <div class="scrim" style="top:200px;background:rgba(30,18,10,.18)"></div>
  <div class="mpick">
    <div class="seg" style="margin-bottom:12px"><span class="on">તારીખનું વર્ષ</span><span>વિક્રમ સંવત</span></div>
    <div class="ystep"><span class="round">{i('chevl', 's')}</span><b>2029</b><span class="round">{i('chevr', 's')}</span></div>
    <div class="mgrid">{cells}</div>
    <div class="mfoot"><span><i class="mdot"></i>મોટો તહેવાર</span><span class="pill" style="height:36px">આજે</span></div>
  </div>
  {tabs('cal')}
</div>'''

    vs = [('Kartik', 'Oct–Nov 2028'), ('Margashirsha', 'Nov–Dec'), ('Pausha', 'Dec–Jan 2029'), ('Magha', 'Jan–Feb'),
          ('Phalguna', 'Feb–Mar'), ('Chaitra', 'Mar–Apr'), ('Vaishakha', 'Apr–May'), ('Jyeshtha', 'May–Jun'),
          ('Ashadha', 'Jun–Jul'), ('Shravana', 'Jul–Aug'), ('Bhadrapada', 'Aug–Sep'), ('Ashwin', 'Sep–Oct 2029')]
    vcells = ''.join(f'<div class="{"on" if k == 0 else ""}">{m}<small>{g}</small>{"<em></em>" if k in (0, 4, 11) else ""}</div>' for k, (m, g) in enumerate(vs))
    picker_en = f'''
<div class="phone en dark">
  <div class="island"></div>
  <div class="title-bar"><h1 class="title">Calendar</h1><span class="actions"><span class="pill">Today</span><span class="round">{i('search', 's')}</span><span class="round">{i('gear', 's')}</span></span></div>
  <div class="cal-head"><div><div class="m" style="color:var(--accent)">November 2026 {i('chevd', 's')}</div><div class="lm">Ashwin · Kartik · Samvat 2082–83</div></div></div>
  {month_grid('en', sel=24)}
  <div class="scrim" style="top:200px;background:rgba(0,0,0,.35)"></div>
  <div class="mpick">
    <div class="seg" style="margin-bottom:12px"><span>Calendar year</span><span class="on">Vikram Samvat</span></div>
    <div class="ystep"><span class="round">{i('chevl', 's')}</span><b>Samvat 2085</b><span class="round">{i('chevr', 's')}</span></div>
    <div class="mgrid vs">{vcells}</div>
    <div class="mfoot"><span>Starts on Bestu Varas · Kartik Shukla 1</span><span class="pill" style="height:36px">Today</span></div>
  </div>
  {tabs('cal', 'en')}
</div>'''

    def hit(year, wd, date, sub, now=False):
        return (f'<div class="item{" today" if now else ""}"><div class="dt"><b style="font-size:14px">{year}</b></div>'
                f'<div class="it"><b>{wd}, {date}</b><span>{sub}</span></div><span class="chev">{i("chevr", "s")}</span></div>')

    search = f'''
<div class="phone">
  <div class="island"></div>
  <div class="srow"><span class="gsearch2">{i('search', 's')}<b>દિવાળી</b><span class="caret"></span><span class="clr">{i('x', 'xs')}</span></span><span class="gbtn">{i('x')}</span></div>
  <div class="gh">દિવાળી · લક્ષ્મી પૂજન</div>
  <div class="card list" style="margin-bottom:18px">
    {hit('2026', 'રવિવાર', '8 નવેમ્બર', '16 દિવસમાં · લક્ષ્મી પૂજન સાંજે 6:21', True)}
    {hit('2027', 'શુક્રવાર', '29 ઑક્ટોબર', 'આસો વદ અમાસ')}
    {hit('2028', 'મંગળવાર', '17 ઑક્ટોબર', 'આસો વદ અમાસ')}
    {hit('2029', 'સોમવાર', '5 નવેમ્બર', 'આસો વદ અમાસ')}
    {hit('2030', 'શનિવાર', '26 ઑક્ટોબર', 'આસો વદ અમાસ')}
  </div>
  <div class="gh">બીજાં પરિણામ</div>
  <div class="card list">
    <div class="item"><div class="dt" style="background:var(--accent-soft);color:var(--accent)">{i('diya')}</div><div class="it"><b>દેવ દિવાળી</b><span>કારતક સુદ પૂનમ · 24 નવેમ્બર</span></div><span class="chev">{i('chevr', 's')}</span></div>
    <div class="item"><div class="dt" style="background:var(--accent-soft);color:var(--accent)">{i('doc')}</div><div class="it"><b>દિવાળીની કથા અને પૂજા વિધિ</b><span>તહેવારની વિગત</span></div><span class="chev">{i('chevr', 's')}</span></div>
  </div>
</div>'''
    return month + sheet + en + picker_gu + picker_en + search + notes
