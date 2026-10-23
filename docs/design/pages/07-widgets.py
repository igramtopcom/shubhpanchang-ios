import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent.parent))
from build import i

TITLE = 'Widget, màn hình khóa, Live Activity'
SUB = 'Trái: widget màn hình chính (Gujarati). Giữa: màn hình khóa với Live Activity đếm ngược Parana. Phải: tiếng Anh, Live Activity báo Rahu Kaal. Dữ liệu minh họa.'


def ribbon():
    segs = [('g', 1), ('g', 1), ('f', 1), ('r', 1), ('g', 1), ('f', 1), ('g', 1), ('f', 1)]
    col = {'g': 'var(--good)', 'f': 'var(--fair)', 'r': 'var(--bad)'}
    return ('<div class="wrib">' + ''.join(f'<span style="background:{col[k]}"></span>' for k, _ in segs)
            + '<em style="left:22%"></em></div>')


def apps(n=4):
    return '<div class="apps">' + ''.join('<div><span></span><i></i></div>' for _ in range(n)) + '</div>'


def body():
    home = f'''
<div class="home">
  <div class="wgrid">
    <div class="w sq">
      <div class="lab" style="display:flex;justify-content:space-between">આજે · અમદાવાદ<span class="wmoon"></span></div>
      <div class="big2">આસો સુદ<br>બારસ</div>
      <div class="sm">પારણાં 6:40 – 8:58</div>
    </div>
    <div class="w sq">
      <div class="lab"><span class="dotg"></span>અત્યારે સારો સમય</div>
      <div class="big2">લાભ</div>
      <div class="sm">9:34 સુધી, પછી અમૃત</div>
      {ribbon()}
    </div>
    <div class="w wide">
      <div class="wl"><div class="lab">આવનારા દિવસો</div>
        <div class="wrow"><b>26</b><span>શરદ પૂનમ</span></div>
        <div class="wrow"><b>29</b><span>કરવા ચોથ</span></div>
        <div class="wrow"><b>5</b><span>રમા અગિયારસ</span></div></div>
      <div class="wr"><div class="lab">આજે</div>
        <div class="kv"><span>સૂર્યોદય</span><b>6:43</b></div>
        <div class="kv"><span>સૂર્યાસ્ત</span><b>6:07</b></div>
        <div class="kv rk"><span>રાહુકાળ</span><b>10:59 થી</b></div></div>
    </div>
  </div>
  {apps()}{apps()}
</div>'''

    lock = f'''
<div class="lock">
  <div class="ld">શુક્રવાર, 23 ઑક્ટોબર</div>
  <div class="clock">7:12</div>
  <div class="lw">
    <div><b>સુદ 12</b>આસો</div>
    <div><b>8:58 સુધી</b>પારણાં</div>
    <div><b>10:59</b>રાહુકાળ</div>
  </div>
  <div class="la">
    <div class="ring"></div>
    <div><b>પારણાંનો સમય ચાલુ</b><span>પાપાંકુશા અગિયારસ · 8:58 સુધી</span></div>
    <div class="tm">1:46</div>
  </div>
</div>'''

    lock_en = f'''
<div class="lock en-lock">
  <div class="ld">Friday 23 October</div>
  <div class="clock">10:52</div>
  <div class="lw">
    <div><b>Shukla 12</b>Ashwin</div>
    <div><b>6:07 pm</b>Sunset</div>
  </div>
  <div class="la bad">
    <div class="ring"></div>
    <div><b>Rahu Kaal now</b><span>Ends 12:10 pm · then Amrit until 12:17 pm</span></div>
    <div class="tm">1:18</div>
  </div>
</div>'''

    notes = '''
<aside class="notes">
  <h3>Điểm chính</h3>
  <p><b>Widget nhỏ 1:</b> tithi hôm nay (chữ to), hình trăng, dòng phụ là việc quan trọng nhất trong ngày (Parana, hay giờ trăng mọc ngày Sankashti).</p>
  <p><b>Widget nhỏ 2:</b> "bây giờ tốt hay xấu", đến mấy giờ, và dải choghadiya mini có vạch "bây giờ". Cùng ngôn ngữ màu với tab Hôm nay.</p>
  <p><b>Widget rộng:</b> 3 ngày vrat/lễ sắp tới bên trái, mặt trời và Rahu Kaal bên phải.</p>
  <p><b>Màn hình khóa:</b> 3 widget nhỏ (tithi, Parana, Rahu Kaal). <b>Live Activity</b> đếm ngược cửa sổ Parana (vòng xanh) hoặc Rahu Kaal (vòng đỏ), tự tắt khi hết giờ. Hiện trên Dynamic Island nữa.</p>
  <p>Chạm vào bất kỳ widget nào là mở đúng màn trong app (Hôm nay, chi tiết Ekadashi...).</p>
</aside>'''
    return home + lock + lock_en + notes
