import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent.parent))
from build import i, tabs

TITLE = 'Chi tiết Ekadashi: ngày nhịn, giờ Parana, nhắc nhở'
SUB = 'Trái: phần đầu màn chi tiết (Gujarati). Giữa: kéo xuống, katha và quy tắc ăn. Phải: tiếng Anh nền tối, người theo Swaminarayan thấy ngày của truyền thống mình. Dữ liệu minh họa.'


def actions(*names):
    return '<span class="actions">' + ''.join(f'<span class="round">{i(n, "s")}</span>' for n in names) + '</span>'


def body():
    top = f'''
<div class="phone">
  <div class="island"></div>
  <div class="title-bar"><span class="gbtn">{i('chevl')}</span>{actions('share')}</div>
  <div class="d-hero">
    <div class="kicker">{i('moon', 's')}અગિયારસ · ગુરુવાર, 5 નવેમ્બર</div>
    <h1>રમા અગિયારસ</h1>
    <p>આસો વદ અગિયારસ. દિવાળી પહેલાંની અગિયારસ, લક્ષ્મીજીના નામ પરથી.</p>
  </div>
  <div class="card parana-card">
    <div class="head"><h4>ઉપવાસ અને પારણાં</h4><span>અમદાવાદ</span></div>
    <div class="tline">
      <div class="tl"><b>અગિયારસ શરૂ</b><span>બુધ, 4 નવે · સવારે 10:36</span></div>
      <div class="tl fast"><b>ઉપવાસનો દિવસ</b><span>ગુરુ, 5 નવે · સૂર્યોદય 6:46</span></div>
      <div class="tl"><b>હરિ વાસર પૂરો</b><span>ગુરુ, 5 નવે · રાત્રે 1:12</span></div>
      <div class="tl on"><b>પારણાં</b><span>શુક્ર, 6 નવે</span>
        <div class="win"><b>6:47 – 8:59</b></div></div>
      <div class="tl" style="padding-bottom:0"><b>બારસ પૂરી</b><span>શુક્ર, 6 નવે · બપોરે 2:18</span></div>
    </div>
  </div>
  <div class="note">{i('info', 's')}<div>આ તારીખ <b>સ્માર્ત</b> પરંપરા પ્રમાણે છે.</div><span class="go">પરંપરા બદલો {i('chevr', 'xs')}</span></div>
  <div class="actionbar three"><span class="btn primary">{i('calplus', 's')}કેલેન્ડરમાં ઉમેરો</span><span class="btn quiet icon on">{i('bell', 's')}</span><span class="btn quiet icon">{i('share', 's')}</span></div>
</div>'''

    more = f'''
<div class="phone">
  <div class="island"></div>
  <div class="title-bar"><span class="gbtn">{i('chevl')}</span>{actions('share')}</div>
  <div class="gh">આ અગિયારસ માટે યાદ અપાવો</div>
  <div class="card group">
    <div class="cell"><span class="tile" style="background:var(--accent)">{i('bell', 's')}</span><span class="lbl">આગલી સાંજે<small>બુધ, 4 નવે · સાંજે 7:00</small></span><span class="toggle"></span></div>
    <div class="cell"><span class="tile" style="background:var(--good)">{i('clock', 's')}</span><span class="lbl">પારણાં શરૂ થાય ત્યારે<small>શુક્ર, 6 નવે · 6:47</small></span><span class="toggle"></span></div>
  </div>
  <div class="card block">
    <h4>વ્રત કથા</h4>
    <div class="fade"><p>રાજા મુચુકુંદની પુત્રી ચંદ્રભાગાનાં લગ્ન શોભન સાથે થયાં હતાં. શોભન નબળા હતા, છતાં તેમણે રમા અગિયારસનું વ્રત કર્યું અને બારસની સવાર જોઈ ન શક્યા. વ્રતના પુણ્યથી તેમને મંદરાચળ પર દિવ્ય નગરી મળી.</p></div>
    <span class="readmore">આખી કથા {i('chevd', 'xs')}</span>
  </div>
  <div class="dd">
    <div class="card"><h5 style="color:var(--good)">{i('check', 'xs')}ફરાળમાં ખવાય</h5><ul><li>ફળ, દૂધ, દહીં</li><li>સાબુદાણા, રાજગરો</li><li>શિંગોડાનો લોટ</li></ul></div>
    <div class="card"><h5 style="color:var(--bad)">{i('x', 'xs')}ન ખવાય</h5><ul><li>અનાજ, ચોખા</li><li>કઠોળ</li><li>ડુંગળી, લસણ</li></ul></div>
  </div>
  <div class="card faq">
    <div class="q">પારણાં કેવી રીતે કરવાં? {i('chevd', 's')}</div>
    <div class="a">બારસની સવારે, હરિ વાસર પૂરો થયા પછી. ભગવાનને ભોગ ધરાવી તુલસી પાન અને જળથી શરૂ કરો.</div>
    <div class="q">ભૂલથી અનાજ ખવાઈ ગયું તો? {i('chevr', 's')}</div>
  </div>
  <div class="actionbar three"><span class="btn primary">{i('calplus', 's')}કેલેન્ડરમાં ઉમેરો</span><span class="btn quiet icon on">{i('bell', 's')}</span><span class="btn quiet icon">{i('share', 's')}</span></div>
</div>'''

    en = f'''
<div class="phone en dark">
  <div class="island"></div>
  <div class="title-bar"><span class="gbtn">{i('chevl')}</span>{actions('share')}</div>
  <div class="d-hero">
    <div class="kicker">{i('moon', 's')}Ekadashi · Friday, 6 November</div>
    <h1>Rama Ekadashi</h1>
    <p>Ashwin Krishna Ekadashi, in the week of Diwali.</p>
  </div>
  <div class="note warm">{i('lotus', 's')}<div><b>Swaminarayan</b> followers keep this fast a day later, because Dashami is still in force at dawn (arunodaya) on the 5th.</div></div>
  <div class="card cmp">
    <div><span class="me">Swaminarayan (you)</span><b>Fri, 6 Nov</b></div>
    <div><span>Smarta</span><b>Thu, 5 Nov</b></div>
    <div><span>BAPS</span><b>Fri, 6 Nov</b></div>
    <div><span>Pushtimarg</span><b>Fri, 6 Nov</b></div>
  </div>
  <div class="card parana-card">
    <div class="head"><h4>Breaking the fast</h4><span>London</span></div>
    <div class="tline">
      <div class="tl fast"><b>Fast day</b><span>Fri, 6 Nov · sunrise 7:03 am</span></div>
      <div class="tl on" style="padding-bottom:0"><b>Parana</b><span>Sat, 7 Nov</span><div class="win"><b>7:05 – 9:11 am</b></div></div>
    </div>
  </div>
  <div class="actionbar three"><span class="btn primary">{i('calplus', 's')}Add to Calendar</span><span class="btn quiet icon on">{i('bell', 's')}</span><span class="btn quiet icon">{i('share', 's')}</span></div>
</div>'''

    notes = '''
<aside class="notes">
  <h3>Điểm chính</h3>
  <p><b>Parana là trung tâm.</b> Một dòng thời gian dọc: Ekadashi bắt đầu, ngày nhịn, Hari Vasara kết thúc, cửa sổ Parana (ô xanh, số lớn), Dwadashi kết thúc. Người dùng biết ngay "khi nào được ăn" mà không phải đọc chữ.</p>
  <p><b>Truyền thống của người dùng là mặc định.</b> Với Swaminarayan/Pushtimarg, ngày nhịn có thể lệch một ngày so với Smarta; màn hình nói rõ vì sao và đặt các truyền thống cạnh nhau. Chuyển truyền thống ngay trong Cài đặt của app.</p>
  <p><b>Nhắc nhở bật tắt tại chỗ:</b> tối hôm trước và đúng giờ Parana. Không phải vào Cài đặt.</p>
  <p><b>Katha, ăn gì / không ăn gì, câu hỏi thường gặp</b> đều nằm trong app. Thanh đáy giống mọi màn chi tiết: thêm vào Lịch, chuông (đang bật thì tô màu), chia sẻ. Bỏ nút "Gia đình" vì nó chỉ là chia sẻ lần nữa.</p>
  <p>Giờ Parana luôn tính bằng engine cho thành phố đang chọn, không bao giờ gõ tay.</p>
</aside>'''
    return top + more + en + notes
