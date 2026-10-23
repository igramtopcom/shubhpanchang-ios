import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent.parent))
from build import i

TITLE = 'Hôm nay, Choghadiya đầy đủ, xem một ngày khác'
SUB = 'Từ trái: Hôm nay (Gujarati, Ahmedabad, giờ tốt); Hôm nay (tiếng Anh, New Jersey, nền tối, đang Rahu Kaal); màn Choghadiya ban ngày; Choghadiya ban đêm (tiếng Anh, nền tối); xem ngày Diwali từ Lịch. Dữ liệu minh họa.'

GOOD, FAIR, BAD = 'var(--good)', 'var(--fair)', 'var(--bad)'


def cg_row(name, hint, start, end, tone, state='', rahu=''):
    now = ' data-now="અત્યારે"' if state == 'now' else ''
    chip = f'<span class="rk-chip">{rahu}</span>' if rahu else ''
    return (f'<div class="cr {state}"{now}><span class="bar" style="background:{tone}"></span>'
            f'<div class="nm"><b{now}>{name}{chip}</b><span>{hint}</span></div><div class="tm">{start}<br>{end}</div></div>')


def choghadiya_gu():
    rows = [
        ('ચલ', 'સામાન્ય · મુસાફરી માટે ઠીક', '6:43', '8:08', FAIR, 'past', ''),
        ('લાભ', 'સારું · વેપાર, ખરીદી', '8:08', '9:34', GOOD, 'now', ''),
        ('અમૃત', 'સારું · દરેક શુભ કામ', '9:34', '10:59', GOOD, '', ''),
        ('કાળ', 'ટાળો', '10:59', '12:25', BAD, '', 'રાહુકાળ'),
        ('શુભ', 'સારું · પૂજા, માંગલિક કામ', '12:25', '1:50', GOOD, '', ''),
        ('રોગ', 'ટાળો', '1:50', '3:16', BAD, '', ''),
        ('ઉદ્વેગ', 'ટાળો', '3:16', '4:41', BAD, '', ''),
        ('ચલ', 'સામાન્ય · મુસાફરી માટે ઠીક', '4:41', '6:07', FAIR, '', ''),
    ]
    return f'''
<div class="phone">
  <div class="island"></div>
  <div class="title-bar"><span class="gbtn">{i('chevl')}</span><span class="sheet-title">ચોઘડિયાં</span><span class="actions"><span class="round">{i('share', 's')}</span></span></div>
  <div class="daystep"><span class="round">{i('chevl', 's')}</span><div class="d"><b>શુક્રવાર, 23 ઑક્ટોબર</b><span>અમદાવાદ · સૂર્યોદય 6:43</span></div><span class="round">{i('chevr', 's')}</span></div>
  <div class="seg"><span class="on">{i('sun', 's')} દિવસ</span><span>{i('moon', 's')} રાત</span></div>
  <div class="card cg">{''.join(cg_row(*r) for r in rows)}</div>
  <nav class="tabs"><div class="tab on"><span class="pip">{i('sun')}</span>આજે</div><div class="tab"><span class="pip">{i('moon')}</span>વ્રત</div><div class="tab"><span class="pip">{i('people')}</span>પરિવાર</div><div class="tab"><span class="pip">{i('cal')}</span>કેલેન્ડર</div></nav>
</div>'''


def choghadiya_en():
    rows = [
        ('Rog', 'Avoid', '6:07 pm', '7:42 pm', BAD), ('Kaal', 'Avoid', '7:42 pm', '9:16 pm', BAD),
        ('Labh', 'Good · business, buying', '9:16 pm', '10:51 pm', GOOD), ('Udveg', 'Avoid', '10:51 pm', '12:26 am', BAD),
        ('Shubh', 'Good · puja, auspicious work', '12:26 am', '2:00 am', GOOD), ('Amrit', 'Good · any auspicious work', '2:00 am', '3:35 am', GOOD),
        ('Chal', 'Neutral · fine for travel', '3:35 am', '5:09 am', FAIR), ('Rog', 'Avoid', '5:09 am', '6:44 am', BAD),
    ]
    return f'''
<div class="phone en dark">
  <div class="island"></div>
  <div class="title-bar"><span class="gbtn">{i('chevl')}</span><span class="sheet-title">Choghadiya</span><span class="actions"><span class="round">{i('share', 's')}</span></span></div>
  <div class="daystep"><span class="round">{i('chevl', 's')}</span><div class="d"><b>Friday, 23 October</b><span>Ahmedabad · sunset 6:07 pm</span></div><span class="round">{i('chevr', 's')}</span></div>
  <div class="seg"><span>{i('sun', 's')} Day</span><span class="on">{i('moon', 's')} Night</span></div>
  <div class="card cg">{''.join(cg_row(n, h, a, b, t) for n, h, a, b, t in rows)}</div>
  <nav class="tabs"><div class="tab on"><span class="pip">{i('sun')}</span>Today</div><div class="tab"><span class="pip">{i('moon')}</span>Vrat</div><div class="tab"><span class="pip">{i('people')}</span>Family</div><div class="tab"><span class="pip">{i('cal')}</span>Calendar</div></nav>
</div>'''


def other_day():
    return f'''
<div class="phone">
  <div class="island"></div>
  <div class="bar"><span class="place">{i('pin', 's')}અમદાવાદ</span><span class="actions"><span class="pill">આજે</span><span class="round">{i('share', 's')}</span><span class="round">{i('gear', 's')}</span></span></div>
  <div class="daystep"><span class="round">{i('chevl', 's')}</span><div class="d"><b>રવિવાર, 8 નવેમ્બર</b><span>16 દિવસમાં · વિ.સં. 2082</span></div><span class="round">{i('chevr', 's')}</span></div>
  <div class="hero">
    <svg class="moon" viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="var(--moon-dark)"/><path d="M32 4 A28 28 0 0 0 32 60 A24 28 0 0 1 32 4 Z" fill="var(--moon-lit)"/><circle cx="32" cy="32" r="28" fill="none" stroke="var(--moon-rim)"/></svg>
    <div><h1 class="tithi">આસો વદ ચૌદસ</h1><div class="tithi-sub">સવારે 11:27 સુધી, પછી અમાસ</div></div>
  </div>
  <div class="card list" style="margin-bottom:16px">
    <div class="item"><div class="dt" style="background:var(--accent-soft);color:var(--accent)">{i('diya')}</div><div class="it"><b>દિવાળી</b><span>લક્ષ્મી પૂજન સાંજે 6:21 – 8:12</span></div><span class="chev">{i('chevr', 's')}</span></div>
  </div>
  <div class="facts"><span class="fact">નક્ષત્ર <b>ચિત્રા</b></span><span class="fact">યોગ <b>પ્રીતિ</b></span><span class="fact">કરણ <b>શકુનિ</b></span></div>
  <div class="card now">
    <div class="now-top"><span class="state" style="color:var(--ink)">ચોઘડિયાં</span><span class="until">રવિવાર</span></div>
    <div class="ribbon"><span class="b"></span><span class="f"></span><span class="g"></span><span class="g"></span><span class="b"></span><span class="g"></span><span class="b"></span><span class="r"></span></div>
    <div class="scale"><span>6:48</span><span>બપોર</span><span>5:56</span></div>
    <div class="more"><span>બધાં ચોઘડિયાં · દિવસ / રાત</span>{i('chevr', 's')}</div>
  </div>
  <nav class="tabs"><div class="tab on"><span class="pip">{i('sun')}</span>આજે</div><div class="tab"><span class="pip">{i('moon')}</span>વ્રત</div><div class="tab"><span class="pip">{i('people')}</span>પરિવાર</div><div class="tab"><span class="pip">{i('cal')}</span>કેલેન્ડર</div></nav>
</div>'''


def body():
    phones = (pathlib.Path(__file__).parent / '01-today.body.html').read_text(encoding='utf8')
    notes = '''
<aside class="notes">
  <h3>Điểm chính</h3>
  <p><b>Một câu trả lời trước tiên:</b> bây giờ là giờ tốt hay xấu, đến mấy giờ, giờ tốt tiếp theo. Chữ dùng "સારો સમય" (giờ tốt), không dùng "શુભ", vì Shubh cũng là tên một choghadiya.</p>
  <p><b>Màn Choghadiya đầy đủ</b> (từ "બધાં ચોઘડિયાં"): ngày/đêm, 8 khung giờ, khung đang diễn ra có nền xanh và nhãn "અત્યારે", khung đã qua mờ đi, Rahu Kaal gắn nhãn đỏ ngay trên khung trùng. Mỗi khung có một dòng "dùng cho việc gì".</p>
  <p><b>Đổi ngày:</b> vuốt ngang hoặc bấm mũi tên ở dòng ngày. Khi không phải hôm nay, nút "આજે" hiện ở góc trên để quay về. "Xem cả ngày" từ tab Lịch mở đúng màn này.</p>
  <p><b>"Sắp tới"</b> trộn vrat, lễ hội và ngày của gia đình. 4 tab; Cài đặt và chia sẻ ở góc trên bên phải.</p>
</aside>'''
    return phones + choghadiya_gu() + choghadiya_en() + other_day() + notes
