import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent.parent))
from build import i, tabs

TITLE = 'Vrat & Tahevar, và chi tiết lễ hội ngay trong app'
SUB = 'Trái: danh sách vrat (Gujarati). Giữa: chi tiết Diwali, mọi nội dung của website nằm trong app. Phải: danh sách lễ hội (tiếng Anh, nền tối, BAPS). Dữ liệu minh họa.'


def actions(*names):
    return '<span class="actions">' + ''.join(f'<span class="round">{i(n, "s")}</span>' for n in names) + '</span>'


def row(day, wd, name, sub, kind, label, extra='', today=False):
    # kind/label stay in the call sites for the code pass; the list shows a chevron, the segment names the type
    return (f'<div class="item{" today" if today else ""}"><div class="dt"><b>{day}</b><span>{wd}</span></div>'
            f'<div class="it"><b>{name}{extra}</b><span>{sub}</span></div>'
            f'<span class="chev">{i("chevr", "s")}</span></div>')


def body():
    vrat_list = f'''
<div class="phone">
  <div class="island"></div>
  <div class="title-bar"><h1 class="title">વ્રત અને તહેવાર</h1>{actions('search', 'gear')}</div>
  <div class="seg"><span class="on">વ્રત</span><span>તહેવાર</span></div>
  <div class="chips"><span class="chip2 on">બધાં</span><span class="chip2">અગિયારસ</span><span class="chip2">પૂનમ</span><span class="chip2">અમાસ</span><span class="chip2">સંકષ્ટી</span></div>
  <div class="month"><h3>ઑક્ટોબર 2026</h3><span>આસો</span></div>
  <div class="card list" style="margin-bottom:18px">
    {row('23', 'આજે', 'પારણાં', 'પાપાંકુશા અગિયારસ · 6:40 – 8:58', 'vrat', 'પારણાં', today=True)}
    {row('26', 'સોમ', 'શરદ પૂનમ', 'પૂનમનું વ્રત · ચંદ્રોદય સાંજે 5:41', 'vrat', 'પૂનમ')}
    {row('29', 'ગુરુ', 'કરવા ચોથ', 'સંકષ્ટી · ચંદ્રોદય રાત્રે 8:47', 'vrat', 'સંકષ્ટી')}
  </div>
  <div class="month"><h3>નવેમ્બર 2026</h3><span>આસો · કારતક</span></div>
  <div class="card list">
    {row('5', 'ગુરુ', 'રમા અગિયારસ', 'પારણાં 6 નવે, 6:47 – 8:59', 'vrat', 'અગિયારસ')}
    {row('9', 'સોમ', 'આસો અમાસ', 'સ્નાન-દાન', 'vrat', 'અમાસ')}
    {row('21', 'શનિ', 'દેવઊઠી અગિયારસ', 'પારણાં 22 નવે, 7:01 – 9:10', 'vrat', 'અગિયારસ')}
  </div>
  {tabs('vrat')}
</div>'''

    detail = f'''
<div class="phone">
  <div class="island"></div>
  <div class="title-bar"><span class="gbtn">{i('chevl')}</span>{actions('share')}</div>
  <div class="d-hero">
    <div class="kicker">{i('diya', 's')}તહેવાર · રવિવાર, 8 નવેમ્બર</div>
    <h1>દિવાળી</h1>
    <p>આસો વદ અમાસ · દીપોત્સવની રાત: લક્ષ્મી પૂજન અને ચોપડા પૂજન.</p>
    <div class="meta"><span class="hot">{i('clock', 'xs')}16 દિવસમાં</span><span>વિ.સં. 2082</span><span>અમાસ 11:27 થી</span></div>
  </div>
  <div class="card muhurat">
    <div class="kicker" style="color:var(--accent);font-size:13px;font-weight:600">લક્ષ્મી પૂજન મુહૂર્ત · અમદાવાદ</div>
    <div class="t">સાંજે 6:21 – 8:12</div>
    <div class="muted" style="font-size:13.5px">પ્રદોષ કાળમાં, સ્થિર વૃષભ લગ્ન દરમિયાન</div>
    <div class="rows"><div>પ્રદોષ કાળ<b>5:58 – 8:31</b></div><div>વૃષભ લગ્ન<b>6:21 – 8:12</b></div><div>અમાસ<b>8 નવે 11:27 – 9 નવે 12:31</b></div></div>
  </div>
  <div class="card block">
    <h4>દિવાળીની કથા</h4>
    <div class="fade"><p>ભગવાન રામ ચૌદ વર્ષના વનવાસ પછી અયોધ્યા પાછા ફર્યા ત્યારે નગરજનોએ ઘીના દીવા પ્રગટાવી તેમનું સ્વાગત કર્યું. ગુજરાતમાં આ રાત લક્ષ્મી પૂજન અને ચોપડા પૂજનની છે: વેપારીઓ જૂના વર્ષના ચોપડા બંધ કરી નવા ચોપડાની પૂજા કરે છે.</p></div>
    <span class="readmore">આખી કથા {i('chevd', 'xs')}</span>
  </div>
  <div class="actionbar three"><span class="btn primary">{i('calplus', 's')}કેલેન્ડરમાં ઉમેરો</span><span class="btn quiet icon">{i('bell', 's')}</span><span class="btn quiet icon">{i('share', 's')}</span></div>
</div>'''

    detail2 = f'''
<div class="phone">
  <div class="island"></div>
  <div class="title-bar"><span class="gbtn">{i('chevl')}</span>{actions('share')}</div>
  <div class="card block"><h4>પૂજા વિધિ</h4>
    <ol class="steps"><li>સાંજે ઘર સાફ કરી રંગોળી પૂરો, ઉંબરે દીવો મૂકો.</li><li>બાજોઠ પર લાલ કપડું પાથરી લક્ષ્મીજી અને ગણેશજીની સ્થાપના કરો.</li><li>મુહૂર્તમાં ષોડશોપચાર પૂજા કરો, ચોપડા પર સ્વસ્તિક અને શુભ-લાભ લખો.</li><li>આરતી પછી આખા ઘરમાં દીવા કરો.</li></ol>
  </div>
  <div class="card mantra">
    <div class="muted" style="font-size:13px">મંત્ર</div>
    <div class="dev">ॐ श्रीं ह्रीं श्रीं कमले कमलालये प्रसीद प्रसीद<br>श्रीं ह्रीं श्रीं ॐ महालक्ष्म्यै नमः</div>
    <div class="tr">ૐ શ્રીં હ્રીં શ્રીં કમલે કમલાલયે પ્રસીદ પ્રસીદ શ્રીં હ્રીં શ્રીં ૐ મહાલક્ષ્મ્યૈ નમઃ</div>
    <div class="mean">હે કમળ પર બિરાજમાન લક્ષ્મીજી, પ્રસન્ન થાઓ. મહાલક્ષ્મીને નમસ્કાર.</div>
  </div>
  <div class="dd">
    <div class="card"><h5 style="color:var(--good)">{i('check', 'xs')}કરો</h5><ul><li>મુહૂર્તમાં જ પૂજા</li><li>આખું ઘર ઝળહળતું</li><li>દાન-પુણ્ય</li></ul></div>
    <div class="card"><h5 style="color:var(--bad)">{i('x', 'xs')}ન કરો</h5><ul><li>રાહુકાળમાં પૂજા</li><li>ઝઘડો, કઠોર વાણી</li><li>ઘરમાં અંધારું</li></ul></div>
  </div>
  <div class="card faq">
    <div class="q">દિવાળી 2026 ક્યારે છે? {i('chevd', 's')}</div>
    <div class="a">રવિવાર, 8 નવેમ્બર. અમાસ પ્રદોષ કાળમાં હોય તે દિવસે લક્ષ્મી પૂજન થાય છે.</div>
    <div class="q">ચોપડા પૂજન ક્યારે કરવું? {i('chevr', 's')}</div>
    <div class="q">બેસતું વર્ષ ક્યારે છે? {i('chevr', 's')}</div>
  </div>
  <div class="actionbar three"><span class="btn primary">{i('calplus', 's')}કેલેન્ડરમાં ઉમેરો</span><span class="btn quiet icon">{i('bell', 's')}</span><span class="btn quiet icon">{i('share', 's')}</span></div>
</div>'''

    fest_en = f'''
<div class="phone en dark">
  <div class="island"></div>
  <div class="title-bar"><h1 class="title">Vrat &amp; Festivals</h1>{actions('search', 'gear')}</div>
  <div class="seg"><span>Vrat</span><span class="on">Festivals</span></div>
  <div class="chips"><span class="chip2 on">All</span><span class="chip2">Main</span><span class="chip2">BAPS</span><span class="chip2">Gujarat</span></div>
  <div class="month"><h3>November 2026</h3><span>Ashwin · Kartik</span></div>
  <div class="card list" style="margin-bottom:18px">
    {row('6', 'Fri', 'Dhanteras', 'Puja 6:02 – 7:58 pm', 'fest', 'Festival')}
    {row('8', 'Sun', 'Diwali', 'Lakshmi &amp; Chopda Puja 6:09 – 8:01 pm', 'fest', 'Festival')}
    {row('10', 'Tue', 'Bestu Varas', 'Gujarati New Year · Samvat 2083', 'fest', 'Festival')}
    {row('10', 'Tue', 'Annakut', 'Food offered to Thakorji on New Year&#39;s Day', 'vrat', 'BAPS')}
  </div>
  <div class="month"><h3>December 2026</h3><span>Kartik · Margashirsha</span></div>
  <div class="card list">
    {row('17', 'Thu', 'Pramukh Swami Maharaj Jayanti', 'Margashirsha Shukla Ashtami', 'vrat', 'BAPS', extra='<span class="badge sage">BAPS</span>')}
    {row('20', 'Sun', 'Gita Jayanti', 'Mokshada Ekadashi', 'fest', 'Festival')}
  </div>
  {tabs('vrat', 'en')}
</div>'''

    notes = f'''
<aside class="notes">
  <h3>Điểm chính</h3>
  <p><b>Không còn nút "Read more" ra website.</b> Chạm vào bất kỳ dòng nào là mở màn chi tiết ngay trong app: câu chuyện, giờ puja tính cho đúng thành phố, vidhi, mantra (Devanagari và Gujarati), nên/không nên, câu hỏi thường gặp.</p>
  <p><b>Danh sách theo tháng</b>, tiêu đề tháng có cả tháng âm lịch (આસો · કારતક). Dòng "hôm nay" có ô ngày màu saffron. Chip lọc nhanh theo loại vrat. Mỗi dòng kết thúc bằng mũi tên: chạm là mở chi tiết.</p>
  <p><b>Màn chi tiết ẩn thanh tab</b> và thay bằng thanh hành động, giống cách iOS đẩy một trang con. Đếm ngược và thông tin phụ thành các viên nhỏ dưới tiêu đề, không còn ba ô vuông.</p>
  <p><b>Utsav của sampradaya nằm chung danh sách</b>, có nhãn loại riêng (BAPS, Pushtimarg, Jain) để phân biệt mà không ồn ào.</p>
  <p><b>Thanh hành động ở đáy màn chi tiết:</b> thêm vào Lịch, đặt lời nhắc, chia sẻ. Đọc truyện dài thì bấm "Aakhi katha" để mở ngay tại chỗ.</p>
  <p><b>Góc trên: tìm kiếm và Cài đặt.</b> Gõ "Janmashtami" là ra ngày, kể cả năm sau. Đăng ký Lịch iPhone chỉ còn một chỗ, trong Cài đặt.</p>
</aside>'''
    return vrat_list + detail + detail2 + fest_en + notes
