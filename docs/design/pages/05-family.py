import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent.parent))
from build import i, tabs

TITLE = 'Gia đình: sinh nhật theo tithi, ngày giỗ (punyatithi), nhắc nhở'
SUB = 'Từ trái: lần đầu mở tab (chưa có ai); danh sách; thêm người khi biết ngày sinh; thêm ngày giỗ khi chỉ biết tithi; chi tiết một người (tiếng Anh, nền tối). Dữ liệu minh họa.'


def actions(*names):
    return '<span class="actions">' + ''.join(f'<span class="round">{i(n, "s")}</span>' for n in names) + '</span>'


def member(ini, tone, name, sub, date, wd):
    return (f'<div class="item"><span class="av {tone}">{ini}</span><div class="it"><b>{name}</b><span>{sub}</span></div>'
            f'<div class="nx"><b>{date}</b><span>{wd}</span></div></div>')


def body():
    lst = f'''
<div class="phone">
  <div class="island"></div>
  <div class="title-bar"><h1 class="title">પરિવાર</h1>{actions('plus', 'gear')}</div>
  <div class="card next">
    <div class="kicker">{i('diya', 's')}હવે પછી · 15 દિવસમાં</div>
    <div class="nm">બાની પુણ્યતિથિ</div>
    <div class="sb">આસો વદ તેરસ · શનિવાર, 7 નવેમ્બર</div>
  </div>
  <div class="gh">જન્મદિવસ (તિથિ પ્રમાણે)</div>
  <div class="card list" style="margin-bottom:18px">
    {member('મ', 'a', 'મમ્મી', 'કારતક સુદ પાંચમ', '14 નવે', 'શનિ')}
    {member('ર', 'g', 'રાહુલ', 'પોષ વદ બીજ', '5 જાન્યુ', 'મંગળ')}
    {member('પ', 'f', 'પપ્પા', 'ચૈત્ર સુદ નોમ', '15 એપ્રિલ', 'ગુરુ')}
  </div>
  <div class="gh">પુણ્યતિથિ અને શ્રાદ્ધ</div>
  <div class="card list">
    {member('બા', 'm', 'બા', 'આસો વદ તેરસ', '7 નવે', 'શનિ')}
    {member('દા', 'm', 'દાદાજી', 'ભાદરવા વદ સાતમ · શ્રાદ્ધ', '3 ઑક્ટો', '2027')}
  </div>
  {tabs('family')}
</div>'''

    add = f'''
<div class="phone sheeted">
  <div class="island"></div>
  <div class="sheet-grab"></div>
  <div class="title-bar"><span class="gbtn">{i('x')}</span><span class="sheet-title">નવો સભ્ય</span><span class="gbtn tint">{i('check')}</span></div>
  <div class="card group" style="margin-bottom:14px">
    <div class="field"><label>નામ</label><div class="in">મમ્મી</div></div>
  </div>
  <div class="opt"><div class="on">{i('heart', 's')}જન્મદિવસ</div><div>{i('diya', 's')}પુણ્યતિથિ</div><div>{i('spark', 's')}લગ્નતિથિ</div></div>
  <div class="seg"><span class="on">તારીખ ખબર છે</span><span>તિથિ ખબર છે</span></div>
  <div class="card group" style="margin-bottom:14px"><div class="wheel"><div>
    <div>12</div><div class="cur">13</div><div>14</div></div><div><div>ઑક્ટોબર</div><div class="cur">નવેમ્બર</div><div>ડિસેમ્બર</div></div><div><div>1971</div><div class="cur">1972</div><div>1973</div></div></div></div>
  <div class="card preview">
    <span class="tile2">{i('moon')}</span>
    <div style="flex:1"><div style="font-size:12.5px;color:var(--ink2)">જન્મ તિથિ</div><div style="font-size:17px;font-weight:600">કારતક સુદ પાંચમ</div>
      <div style="font-size:13px;color:var(--ink2)">આ વર્ષે: શનિ, 14 નવેમ્બર</div></div>
  </div>
  <div class="gh">દર વર્ષે ગણો</div>
  <div class="seg"><span class="on">તિથિ પ્રમાણે</span><span>તારીખ પ્રમાણે</span><span>બંને</span></div>
  <div class="card group">
    <div class="cell"><span class="tile" style="background:var(--accent)">{i('bell', 's')}</span><span class="lbl">આગલી સાંજે યાદ અપાવો</span><span class="toggle"></span></div>
    <div class="cell"><span class="tile" style="background:#9A8A7C">{i('clock', 's')}</span><span class="lbl">જન્મનો સમય અને સ્થળ<small>વૈકલ્પિક · સૂર્યોદય પહેલાં જન્મ હોય તો તિથિ બદલાય</small></span><span class="v">{i('chevr', 's')}</span></div>
  </div>
</div>'''

    by_tithi = f'''
<div class="phone sheeted">
  <div class="island"></div>
  <div class="sheet-grab"></div>
  <div class="title-bar"><span class="gbtn">{i('x')}</span><span class="sheet-title">નવો સભ્ય</span><span class="gbtn tint">{i('check')}</span></div>
  <div class="card group" style="margin-bottom:14px">
    <div class="field"><label>નામ</label><div class="in">નાનાજી</div></div>
  </div>
  <div class="opt"><div>{i('heart', 's')}જન્મદિવસ</div><div class="on">{i('diya', 's')}પુણ્યતિથિ</div><div>{i('spark', 's')}લગ્નતિથિ</div></div>
  <div class="seg"><span>તારીખ ખબર છે</span><span class="on">તિથિ ખબર છે</span></div>
  <div class="card group" style="margin-bottom:14px"><div class="wheel">
    <div><div>કારતક</div><div class="cur">માગશર</div><div>પોષ</div></div><div><div>&nbsp;</div><div class="cur">સુદ</div><div>વદ</div></div><div><div>ચોથ</div><div class="cur">પાંચમ</div><div>છઠ</div></div></div></div>
  <div class="card preview">
    <span class="tile2">{i('diya')}</span>
    <div style="flex:1"><div style="font-size:13px;color:var(--ink2)">આવતી પુણ્યતિથિ</div><div style="font-size:17px;font-weight:600">સોમવાર, 14 ડિસેમ્બર</div>
      <div style="font-size:13px;color:var(--ink2)">માગશર સુદ પાંચમ, અમદાવાદના સૂર્યોદયે</div></div>
  </div>
  <div class="card group">
    <div class="cell"><span class="tile" style="background:var(--accent)">{i('bell', 's')}</span><span class="lbl">આગલી સાંજે યાદ અપાવો</span><span class="toggle"></span></div>
    <div class="cell"><span class="tile" style="background:#B5793A">{i('diya', 's')}</span><span class="lbl">શ્રાદ્ધ પક્ષમાં પણ<small>ભાદરવા વદ પાંચમ</small></span><span class="toggle"></span></div>
  </div>
</div>'''

    empty = f'''
<div class="phone">
  <div class="island"></div>
  <div class="title-bar"><h1 class="title">પરિવાર</h1><span class="actions"><span class="round">{i('gear', 's')}</span></span></div>
  <div class="empty">
    <div class="art">{i('people', 'l')}</div>
    <h2>પરિવારની તિથિઓ એક જગ્યાએ</h2>
    <p>જન્મદિવસ, પુણ્યતિથિ અને લગ્નતિથિ ઉમેરો. દર વર્ષે તિથિ કઈ તારીખે આવે છે તે અમે શોધીને યાદ અપાવીશું.</p>
    <div class="btn primary">{i('plus', 's')}પહેલું નામ ઉમેરો</div>
    <p style="font-size:13px;margin-top:6px">{i('lock', 'xs')} બધું ફક્ત તમારા ફોનમાં રહે છે.</p>
  </div>
  {tabs('family')}
</div>'''

    en = f'''
<div class="phone en dark">
  <div class="island"></div>
  <div class="title-bar"><span class="gbtn">{i('chevl')}</span>{actions('share')}</div>
  <div class="who"><span class="av a big">M</span><div><h1>Mom</h1><p>Born 13 Nov 1972 · Kartik Shukla Panchami</p></div></div>
  <div class="card next" style="margin-bottom:16px">
    <div class="kicker">{i('heart', 's')}Tithi birthday · in 22 days</div>
    <div class="nm">Saturday, 14 November</div>
    <div class="sb">By date: Friday, 13 November</div>
  </div>
  <div class="gh">Coming years</div>
  <div class="card cmp">
    <div><span>2027</span><b>Wed, 3 Nov</b></div>
    <div><span>2028</span><b>Mon, 23 Oct</b></div>
    <div><span>2029</span><b>Sat, 10 Nov</b></div>
  </div>
  <div class="card group">
    <div class="cell"><span class="tile" style="background:var(--accent)">{i('bell', 's')}</span><span class="lbl">Remind me<small>The evening before, 7:00 pm</small></span><span class="toggle"></span></div>
    <div class="cell"><span class="tile" style="background:var(--good)">{i('calplus', 's')}</span><span class="lbl">Add to iPhone Calendar</span><span class="toggle"></span></div>
  </div>
  {tabs('family', 'en')}
</div>'''

    notes = '''
<aside class="notes">
  <h3>Điểm chính</h3>
  <p><b>Người dùng nhập ngày dương lịch, app tự đổi ra tithi</b> (theo giờ mặt trời mọc ở nơi sinh) và tính ngày rơi vào năm nay. Không cần biết âm lịch vẫn dùng được.</p>
  <p><b>Lần đầu mở tab</b> không để trống: một câu giải thích tab này làm gì và một nút "Thêm người đầu tiên".</p>
  <p><b>Biết ngày hay biết tithi đều nhập được.</b> Ngày giỗ thường chỉ nhớ tithi ("Magshar sud 5"), nên có lựa chọn chọn thẳng tháng, sud/vad, tithi. Ngày giỗ có thêm công tắc "cũng nhắc trong Shraddh paksha". Giờ sinh và nơi sinh là tùy chọn, chỉ cần khi sinh trước lúc mặt trời mọc.</p>
  <p><b>Ba loại:</b> sinh nhật, punyatithi/shraddh (ngày giỗ, theo tithi của ngày mất), kỷ niệm. Chọn "theo tithi", "theo ngày" hoặc "cả hai".</p>
  <p><b>Thẻ "sắp tới" ở đầu danh sách</b> nói ngay ai, bao nhiêu ngày nữa. Danh sách chia hai nhóm, mỗi dòng có chữ cái đầu trong vòng tròn màu ấm thay cho ảnh.</p>
  <p><b>Chi tiết một người:</b> các năm tới (tithi rơi vào ngày nào), lời nhắc, thêm vào Lịch iPhone. Tất cả dữ liệu nằm trên máy, không cần tài khoản.</p>
</aside>'''
    return empty + lst + add + by_tithi + en + notes
