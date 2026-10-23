import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent.parent))
from build import i, tabs

TITLE = 'Liquid Glass: lớp điều hướng bằng kính, nội dung giữ nền giấy ấm'
SUB = 'Trái: danh sách Vrat đang cuộn, nội dung trôi dưới thanh trên và thanh tab đã thu nhỏ. Giữa: cùng màn đó khi bật Giảm độ trong suốt. Phải: tiếng Anh nền tối. Dữ liệu minh họa.'


def row(day, wd, name, sub):
    return (f'<div class="item"><div class="dt"><b>{day}</b><span>{wd}</span></div>'
            f'<div class="it"><b>{name}</b><span>{sub}</span></div><span class="chev">{i("chevr", "s")}</span></div>')


def scrolled(extra_cls='', lang='gu'):
    gu = lang == 'gu'
    title = 'વ્રત અને તહેવાર' if gu else 'Vrat &amp; Festivals'
    m1, m1s, m2, m2s = (('ઑક્ટોબર 2026', 'આસો', 'નવેમ્બર 2026', 'આસો · કારતક') if gu else
                        ('October 2026', 'Ashwin', 'November 2026', 'Ashwin · Kartik'))
    rows1 = ([row('26', 'સોમ', 'શરદ પૂનમ', 'પૂનમનું વ્રત · ચંદ્રોદય સાંજે 5:41'), row('29', 'ગુરુ', 'કરવા ચોથ', 'સંકષ્ટી · ચંદ્રોદય રાત્રે 8:47')] if gu else
             [row('25', 'Sun', 'Sharad Purnima', 'Moonrise 6:02 pm'), row('28', 'Wed', 'Karva Chauth', 'Moonrise 8:12 pm')])
    rows2 = ([row('5', 'ગુરુ', 'રમા અગિયારસ', 'પારણાં 6 નવે, 6:47 – 8:59'), row('9', 'સોમ', 'આસો અમાસ', 'સ્નાન-દાન'),
              row('21', 'શનિ', 'દેવઊઠી અગિયારસ', 'પારણાં 22 નવે, 7:01 – 9:10'), row('24', 'મંગળ', 'કારતકી પૂનમ', 'દેવ દિવાળી'),
              row('28', 'શનિ', 'સંકષ્ટી ચતુર્થી', 'ચંદ્રોદય રાત્રે 9:02')] if gu else
             [row('4', 'Wed', 'Rama Ekadashi', 'Parana 5 Nov, after 7:30 am'), row('8', 'Sun', 'Ashwin Amavasya', 'Holy bath and charity'),
              row('20', 'Fri', 'Dev Uthi Ekadashi', 'Parana 21 Nov, 7:12 – 9:20'), row('24', 'Tue', 'Kartik Purnima', 'Dev Diwali'),
              row('27', 'Fri', 'Sankashti Chaturthi', 'Moonrise 8:41 pm')])
    return f'''
<div class="phone {extra_cls}">
  <div class="island"></div>
  <div class="scroller">
    <div class="card list" style="margin-bottom:18px">{''.join(rows1)}</div>
    <div class="month"><h3>{m2}</h3><span>{m2s}</span></div>
    <div class="card list">{''.join(rows2)}</div>
  </div>
  <div class="topbar"><span class="gbtn">{i('search')}</span><span class="inline-title">{title}</span><span class="actions"><span class="round">{i('gear', 's')}</span></span></div>
  <nav class="tabs mini"><div class="tab on"><span class="pip">{i('moon')}</span></div></nav>
  <span class="gbtn fab">{i('calplus')}</span>
</div>'''


def body():
    notes = '''
<aside class="notes">
  <h3>Nguyên tắc</h3>
  <p><b>Kính chỉ cho lớp điều hướng:</b> thanh tab, nút trên cùng, thanh hành động, sheet nửa màn hình. Thẻ, dải choghadiya, timeline Parana, lịch tháng vẫn là giấy ấm đặc để dễ đọc.</p>
  <p><b>Nút trên cùng là vòng tròn kính 44pt.</b> Hai nút cùng phía chung một viên. Nút quay lại chỉ còn mũi tên, không kèm chữ, như iOS 26.</p>
  <p><b>Cuộn xuống thì tiêu đề lớn thu thành tiêu đề nhỏ giữa thanh trên, thanh tab thu lại</b> chỉ còn tab đang mở. Kéo lên là bung lại.</p>
  <p><b>Giảm độ trong suốt</b> (Cài đặt iPhone, Trợ năng): cùng hình dạng, nền đặc. Màu chữ đã đạt 4.5:1 nên không đổi gì khác.</p>
  <h3 style="margin-top:20px">Khi code</h3>
  <p><b>Thanh tab:</b> <code>NativeTabs</code> (đang dùng) tự là kính, thêm <code>minimizeBehavior</code> để thu khi cuộn.<br>
  <b>Nút trên cùng, nút quay lại:</b> header native của Stack, iOS tự vẽ kính.<br>
  <b>Thanh hành động:</b> <code>GlassView</code> của expo-glass-effect, máy cũ hơn iOS 26 dùng nền mờ (<code>isLiquidGlassAvailable()</code>).<br>
  <b>Bảng chi tiết ngày, Cài đặt, thêm người:</b> <code>presentation: 'formSheet'</code> với <code>sheetAllowedDetents</code>.<br>
  <b>Biểu tượng:</b> SF Symbols, cùng nét với bản vẽ.</p>
</aside>'''
    return scrolled() + scrolled('rt') + scrolled('en dark', 'en') + notes
