import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent.parent))
from build import i

TITLE = 'Cài đặt, chọn truyền thống, chọn nơi, giới thiệu ban đầu, About'
SUB = 'Mở từ nút bánh răng ở góc trên. Mọi trang con (truyền thống, nơi, About, quyền riêng tư) đều là màn trong app, không mở trình duyệt. Dữ liệu minh họa.'


def tile(icon, color):
    return f'<span class="tile" style="background:{color}">{i(icon, "s")}</span>'


def body():
    settings = f'''
<div class="phone sheeted">
  <div class="island"></div>
  <div class="sheet-grab"></div>
  <div class="title-bar"><h1 class="title">સેટિંગ્સ</h1><span class="round">{i('x', 's')}</span></div>
  <div class="card group">
    <div class="cell">{tile('pin', 'var(--accent)')}<span class="lbl">સ્થળ</span><span class="v">અમદાવાદ {i('chevr', 's')}</span></div>
    <div class="cell">{tile('lotus', '#B5793A')}<span class="lbl">પરંપરા</span><span class="v">સ્માર્ત {i('chevr', 's')}</span></div>
    <div class="cell">{tile('lang', '#7A6A5E')}<span class="lbl">ભાષા</span><span class="v">ગુજરાતી {i('chevr', 's')}</span></div>
    <div class="cell">{tile('sun', '#9A8A7C')}<span class="lbl">દેખાવ</span><span class="v">આપોઆપ {i('chevr', 's')}</span></div>
    <div class="cell">{tile('clock', '#9A8A7C')}<span class="lbl">સમય</span><span class="v">12 કલાક {i('chevr', 's')}</span></div>
  </div>
  <div class="gh">સૂચનાઓ</div>
  <div class="card group">
    <div class="cell">{tile('sunrise', 'var(--accent)')}<span class="lbl">રોજનું પંચાંગ<small>સવારે 6:30</small></span><span class="toggle"></span></div>
    <div class="cell">{tile('moon', 'var(--good)')}<span class="lbl">દરેક અગિયારસ અને પારણાં</span><span class="toggle"></span></div>
    <div class="cell">{tile('diya', '#B5793A')}<span class="lbl">મુખ્ય તહેવાર</span><span class="toggle off"></span></div>
  </div>
  <div class="gh">iPhone કેલેન્ડર</div>
  <div class="card group">
    <div class="cell">{tile('calplus', 'var(--good)')}<span class="lbl">વ્રત અને તહેવાર ઉમેરો<small>નવી તારીખો આપોઆપ આવે છે</small></span><span class="v">{i('chevr', 's')}</span></div>
  </div>
  <div class="card group">
    <div class="cell">{tile('people', '#7A6A5E')}<span class="lbl">iCloud માં સાચવો<small>નવા iPhone પર પરિવારની તારીખો સાથે આવે</small></span><span class="toggle"></span></div>
  </div>
  <div class="card group">
    <div class="cell">{tile('info', '#9A8A7C')}<span class="lbl">ગણતરી કેવી રીતે થાય છે</span><span class="v">{i('chevr', 's')}</span></div>
    <div class="cell">{tile('lock', '#9A8A7C')}<span class="lbl">ગોપનીયતા</span><span class="v">{i('chevr', 's')}</span></div>
  </div>
</div>'''

    trad = f'''
<div class="phone">
  <div class="island"></div>
  <div class="title-bar"><span class="gbtn">{i('chevl')}</span><div class="steps-dots" style="margin:0"><i></i><i></i><i class="on"></i></div><span style="width:44px"></span></div>
  <h1 class="title" style="margin-bottom:6px">તમારી પરંપરા</h1>
  <p class="muted" style="margin:0 0 16px;font-size:14.5px;line-height:1.5">તમારી પરંપરા પ્રમાણે વ્રત, તિથિ અને ઉત્સવ બતાવીશું.</p>
  <div class="card group plain">
    <div class="cell"><span class="lbl">સ્માર્ત<small>ગુજરાતનું સામાન્ય પંચાંગ</small></span><span class="radio on"></span></div>
    <div class="cell"><span class="lbl">સ્વામિનારાયણ<small>વડતાલ અને અમદાવાદ ગાદી</small></span><span class="radio"></span></div>
    <div class="cell"><span class="lbl">BAPS<small>BAPS સ્વામિનારાયણ સંસ્થા</small></span><span class="radio"></span></div>
    <div class="cell"><span class="lbl">પુષ્ટિમાર્ગ<small>વલ્લભ સંપ્રદાય</small></span><span class="radio"></span></div>
    <div class="cell"><span class="lbl">જૈન<small>પર્વ તિથિ, પર્યુષણ, સંવત્સરી</small></span><span class="radio"></span></div>
  </div>
  <div class="card optin"><span class="tile2">{i('bell')}</span><span class="lbl">અગિયારસની આગલી સાંજે યાદ અપાવીએ?<small>હા કહેશો તો iPhone પરવાનગી માંગશે.</small></span><span class="toggle"></span></div>
  <div class="actionbar" style="grid-template-columns:1fr;background:none;box-shadow:none;backdrop-filter:none;-webkit-backdrop-filter:none"><span class="btn primary">શરૂ કરો</span></div>
</div>'''

    onboard = f'''
<div class="phone">
  <div class="island"></div>
  <div class="ob">
    <div class="lang"><span class="on">ગુજરાતી</span><span>English</span></div>
    <div class="mark" style="margin-top:6px">{i('sunrise', 'l')}</div>
    <h1>દીવો</h1>
    <p class="lead">ગુજરાતી પંચાંગ, તમારા શહેરના સૂર્યોદય પ્રમાણે.</p>
    <svg class="ob-art" viewBox="0 0 350 120" fill="none">
      <path d="M20 108 Q175 -20 330 108" stroke="var(--line)" stroke-width="2" stroke-dasharray="3 5"/>
      <path d="M20 108 Q120 18 190 34" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="190" cy="34" r="11" fill="var(--accent)"/><circle cx="190" cy="34" r="19" fill="var(--accent)" opacity=".14"/>
      <line x1="8" y1="108" x2="342" y2="108" stroke="var(--line)" stroke-width="2"/>
    </svg>
    <div class="feat"><span class="fi">{i('clock')}</span><div><b>અત્યારે સારો સમય</b><span>ચોઘડિયું, રાહુકાળ, અભિજિત, એક નજરમાં.</span></div></div>
    <div class="feat"><span class="fi">{i('moon')}</span><div><b>અગિયારસ અને પારણાં</b><span>તમારી પરંપરા પ્રમાણે, સમયસર યાદ.</span></div></div>
    <div class="feat"><span class="fi">{i('people')}</span><div><b>પરિવારની તિથિઓ</b><span>જન્મદિવસ અને પુણ્યતિથિ, દર વર્ષે આપોઆપ.</span></div></div>
    <div class="bottom">
      <div class="steps-dots"><i class="on"></i><i></i><i></i></div>
      <div class="btn primary">આગળ</div>
      <p class="muted" style="text-align:center;font-size:12.5px;margin:12px 0 0">ખાતું જરૂરી નથી. બધું તમારા ફોનમાં રહે છે.</p>
    </div>
  </div>
</div>'''

    place = f'''
<div class="phone en dark">
  <div class="island"></div>
  <div class="steps-dots" style="margin-top:4px"><i></i><i class="on"></i><i></i></div>
  <h1 class="title" style="margin:8px 0 6px">Where are you?</h1>
  <p class="muted" style="margin:0 0 16px;font-size:14.5px;line-height:1.5">Sunrise, Rahu Kaal and the fast day all depend on your city.</p>
  <div class="search">{i('search', 's')}Search for a city</div>
  <div class="card group">
    <div class="cell" style="color:var(--accent);font-weight:600">{i('pin', 's')}Use my current location</div>
  </div>
  <div class="gh">Near you</div>
  <div class="card group plain">
    <div class="cell"><span class="lbl">London<small>United Kingdom</small></span><span class="radio on"></span></div>
    <div class="cell"><span class="lbl">Leicester<small>United Kingdom</small></span><span class="radio"></span></div>
    <div class="cell"><span class="lbl">Birmingham<small>United Kingdom</small></span><span class="radio"></span></div>
  </div>
  <div class="gh">Gujarat</div>
  <div class="card group plain">
    <div class="cell"><span class="lbl">Ahmedabad</span><span class="radio"></span></div>
    <div class="cell"><span class="lbl">Surat</span><span class="radio"></span></div>
  </div>
  <div class="actionbar" style="grid-template-columns:1fr"><span class="btn primary">Continue</span></div>
</div>'''

    about = f'''
<div class="phone">
  <div class="island"></div>
  <div class="title-bar"><span class="gbtn">{i('chevl')}</span><span></span></div>
  <h1 class="title" style="margin-bottom:14px">ગણતરી કેવી રીતે થાય છે</h1>
  <div class="card block"><h4>સૂર્યોદયથી દિવસ</h4><p>દરેક તિથિ, નક્ષત્ર અને યોગ તમારા શહેરના સૂર્યોદયના સમયે જોવાય છે. એટલે અમદાવાદ અને લંડનમાં અગિયારસ જુદા દિવસે આવી શકે.</p></div>
  <div class="card block"><h4>ચોક્કસ ખગોળ ગણતરી</h4><p>સૂર્ય અને ચંદ્રની સ્થિતિ ફોનમાં જ ગણાય છે, ઇન્ટરનેટ વગર પણ.</p></div>
  <div class="card block"><h4>ગોપનીયતા</h4><p>સ્થળ, પરિવારની તારીખો અને સેટિંગ્સ ફક્ત તમારા ફોનમાં રહે છે. અમે ખાતું માગતા નથી અને જાહેરાત બતાવતા નથી.</p></div>
  <p class="muted" style="text-align:center;font-size:12.5px">દીવો 2.0 · shubhpanchang.in ની ઍપ</p>
</div>'''

    notes = '''
<aside class="notes">
  <h3>Điểm chính</h3>
  <p><b>Cài đặt là một trang trượt lên</b> từ nút bánh răng, nhóm theo việc: nơi và truyền thống, nhắc nhở, Lịch iPhone, giới thiệu. Mỗi dòng có ô biểu tượng nhỏ màu ấm, không dùng màu iOS sặc sỡ.</p>
  <p><b>Lịch iPhone: giữ cách app đang làm.</b> "Thêm vrat và lễ" mở hộp đăng ký lịch của chính iPhone (link webcal), không xin quyền truy cập lịch, ngày mới tự về. Thêm một ngày lẻ thì dùng form sự kiện của iPhone, cũng không xin quyền. Tạo lịch riêng bằng EventKit sẽ buộc xin quyền đọc toàn bộ lịch, dễ bị Apple hỏi lại, nên không làm.</p>
  <p><b>Chọn truyền thống</b> có mô tả một dòng và ví dụ cụ thể ("Ekadashi tới rơi vào ngày nào") để người dùng thấy ngay khác biệt.</p>
  <p><b>Lần đầu mở app: 3 bước</b> theo thứ tự trên trang: giới thiệu (chọn ngôn ngữ ngay ở đây, mặc định theo ngôn ngữ của iPhone), chọn nơi, chọn truyền thống. Bước cuối hỏi luôn "nhắc Ekadashi tối hôm trước?"; chỉ khi bật mới hiện hộp xin quyền thông báo của iOS, nên người dùng hiểu vì sao được hỏi.</p>
  <p><b>Cài đặt thêm:</b> định dạng giờ (12/24) và sao lưu iCloud, để đổi iPhone không mất ngày của gia đình.</p>
  <p><b>About và Quyền riêng tư</b> là màn chữ trong app. Tên miền chỉ hiện như chữ, không phải link (Apple chấp nhận link về web của mình, nhưng cách này gọn hơn).</p>
</aside>'''
    return onboard + place + trad + settings + about + notes
