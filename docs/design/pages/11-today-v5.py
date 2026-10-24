import importlib.util
import pathlib

HERE = pathlib.Path(__file__).parent
_spec = importlib.util.spec_from_file_location('v4', HERE / '10-today-v4.py')
v4 = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(v4)
i, moon, header, uc, day_card, tabs, KAIRI = v4.i, v4.moon, v4.header, v4.uc, v4.day_card, v4.tabs, v4.KAIRI

TITLE = 'Hôm nay v5: theo số liệu GA4 và Search Console'
SUB = ('Từ trái: chiều, giờ tốt (cuộn hết màn); tối, có thêm "ngày mai" (cuộn hết màn); sáng, đang Rahu Kaal; '
       'tiếng Anh nền tối, buổi tối. Dữ liệu thật của Ahmedabad, 24 và 25/10/2026.')

CSS = v4.CSS + '''
<style>
  /* v5: a shorter masthead, so the answer sits higher */
  .v5 .m-tithi { margin-top: 4px; }
  .v5 .m-tithi h1 { font-size: 30px; }
  .v5.en .m-tithi h1 { font-size: 26px; }
  .v5 .abhla { width: 58px; height: 58px; }
  .v5 .m-sub { margin-bottom: 16px; }

  /* The choghadiya by its own name, as people search for it */
  .band.fair { background: linear-gradient(170deg, #86694A 0%, #6E5538 100%); }
  .dark .band.fair { background: linear-gradient(170deg, #5E4A34 0%, #4A3A28 100%); }
  .n-name { display: flex; align-items: baseline; gap: 10px; margin-top: 4px; }
  .n-name h2 { margin: 0; font: 600 36px/1.15 var(--gu-serif); }
  .en .n-name h2 { font-family: 'Source Serif 4', Georgia, serif; font-size: 34px; }
  .n-name span { font-size: 14px; font-weight: 600; padding: 3px 10px; border-radius: 999px; box-shadow: inset 0 0 0 1px rgba(255,255,255,.5); }
  .n-use { font-size: 14.5px; color: rgba(255,255,255,.93); margin-top: 1px; }

  /* What comes next, by name: no legend to learn */
  .up5 { padding: 4px 0 2px; }
  .up5-h { font-size: 13px; color: var(--ink2); padding: 10px 18px 4px; }
  .up5-r { display: flex; align-items: center; gap: 12px; padding: 9px 18px; font-variant-numeric: tabular-nums; }
  .up5-r + .up5-r { border-top: 1px solid var(--line); }
  .up5-r i { width: 8px; height: 8px; border-radius: 4px; flex: none; }
  .up5-r b { font-size: 16px; font-weight: 600; width: 64px; }
  .up5-r span { font-size: 15px; color: var(--ink); flex: 1; }
  .up5-r em { font-style: normal; font-size: 13px; font-weight: 600; }
  .up5-r.tg i { background: var(--good); } .up5-r.tg em { color: var(--good); }
  .up5-r.tf i { background: var(--fair); box-shadow: inset 0 0 0 1.5px var(--fair-ink); } .up5-r.tf em { color: var(--fair-ink); }
  .up5-r.tb i { background: var(--bad); } .up5-r.tb em { color: var(--bad); }
  .now4 .more { display: flex; justify-content: space-between; align-items: center; color: var(--accent); font-weight: 600; font-size: 14px; padding: 11px 18px 13px; border-top: 1px solid var(--line); }

  /* Evening: tomorrow's good times */
  .tmr { border-radius: 20px; background: var(--card); box-shadow: var(--shadow); padding: 14px 16px 14px; margin-bottom: 28px; }
  .tmr-h { display: flex; justify-content: space-between; align-items: baseline; }
  .tmr-h b { font: 600 17px/1.2 var(--gu-serif); }
  .en .tmr-h b { font-family: 'Source Serif 4', Georgia, serif; }
  .tmr-h span { font-size: 13px; color: var(--ink2); }
  .chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
  .chip5 { display: inline-flex; flex-direction: column; padding: 8px 12px 9px; border-radius: 14px; background: var(--good-soft); font-variant-numeric: tabular-nums; }
  .chip5 small { font-size: 12.5px; color: var(--good); font-weight: 600; }
  .chip5 b { font-size: 15px; font-weight: 600; color: var(--ink); margin-top: 1px; }
  .tmr-rahu { display: flex; align-items: center; gap: 8px; font-size: 13.5px; color: var(--ink2); margin-top: 12px; font-variant-numeric: tabular-nums; }
  .tmr-rahu i { width: 12px; height: 3px; border-radius: 2px; background: var(--bad); }
</style>
'''


def mast(date, tithi, sub, idx):
    return f'''
  <div class="m-date"><span>{KAIRI}{date}</span><span class="steps"><b>{i('chevl')}</b><b>{i('chevr')}</b></span></div>
  <div class="m-tithi"><h1>{tithi}</h1>{moon(idx)}</div>
  <div class="m-sub">{sub}</div>'''


def now_card(tone, eye, name, tag, use, until, left, pct, head, rows, more, extra=''):
    rs = ''.join(f'<div class="up5-r t{t}"><i></i><b>{n}</b><span>{tm}</span><em>{v}</em></div>' for t, n, tm, v in rows)
    return f'''
  <div class="now4">
    <div class="band {tone}">
      <div class="b-eye">{eye}</div>
      <div class="n-name"><h2>{name}</h2><span>{tag}</span></div>
      <div class="n-use">{use}</div>
      <div class="b-until">{until}<span>{left}</span></div>
      <div class="track"><i style="width:{pct}%"></i></div>
      {extra}
    </div>
    <div class="up5"><div class="up5-h">{head}</div>{rs}</div>
    <div class="more">{more}{i('chevr', 's')}</div>
  </div>'''


def tomorrow(title, day, chips, rahu):
    cs = ''.join(f'<span class="chip5"><small>{n}</small><b>{t}</b></span>' for n, t in chips)
    return f'''
  <div class="tmr">
    <div class="tmr-h"><b>{title}</b><span>{day}</span></div>
    <div class="chips">{cs}</div>
    <div class="tmr-rahu"><i></i>{rahu}</div>
  </div>'''


MAST_GU = ('શનિવાર, 24 ઑક્ટોબર', 'આસો સુદ તેરસ', 'બપોરે 1:36 સુધી, પછી ચૌદસ · વિ.સં. 2082', 12)
DAY_GU = (['સૂર્યોદય', 'ચંદ્રોદય', 'સૂર્યાસ્ત'], '6:40', '4:44', '6:07')
CELLS_GU = [('રાહુકાળ', '9:32 – 10:58', 'var(--bad)'), ('અભિજિત', '12:01 – 12:47', 'var(--good)'), ('નક્ષત્ર', 'ઉત્તર ભાદ્રપદ', None), ('યોગ', 'વ્યાઘાત', None)]


def afternoon_gu():
    return f'''
<div class="phone v4 v5 tall">
  <div class="island"></div>
  {header('અમદાવાદ')}
  {mast(*MAST_GU)}
  {now_card('good', 'અત્યારનું ચોઘડિયું · બપોરે 2:20', 'લાભ', 'સારું', 'વેપાર, ખરીદી', 'બપોરે 3:15 સુધી', '55 મિનિટ બાકી', 35,
            'પછી', [('g', 'અમૃત', '3:15 – 4:41', 'સારું'), ('b', 'કાળ', '4:41 – 6:07', 'ટાળો'), ('g', 'લાભ', 'સાંજે 6:07 – 7:41', 'સારું')],
            'બધાં ચોઘડિયાં · દિવસ / રાત')}
  <div class="s4"><h3>આવનારા દિવસો</h3><a>બધાં</a></div>
  <div class="strip">
    {uc('26', 'ઑક્ટો · સોમ', 'શરદ પૂનમ', '2 દિવસમાં', 'fest')}
    {uc('29', 'ઑક્ટો · ગુરુ', 'કરવા ચોથ', '5 દિવસમાં', 'fest')}
    {uc('29', 'ઑક્ટો · ગુરુ', 'વક્રતુંડ સંકષ્ટી', 'ચંદ્રોદય રાત્રે 8:47', 'vrat')}
  </div>
  <div class="s4"><h3>આજનો દિવસ</h3></div>
  {day_card(*DAY_GU, 0.67, CELLS_GU)}
  {tabs('gu')}
</div>'''


def evening_gu():
    return f'''
<div class="phone v4 v5 tall">
  <div class="island"></div>
  {header('અમદાવાદ')}
  {mast(*MAST_GU)}
  {now_card('fair', 'અત્યારનું ચોઘડિયું · રાત્રે 8:30', 'ઉદ્વેગ', 'ટાળો', 'શુભ કામ પછી કરો', 'રાત્રે 9:16 સુધી', '46 મિનિટ બાકી', 52,
            'પછી', [('g', 'શુભ', '9:16 – 10:50', 'સારું'), ('g', 'અમૃત', '10:50 – 12:24', 'સારું'), ('f', 'ચલ', '12:24 – 1:58', 'સામાન્ય')],
            'બધાં ચોઘડિયાં · દિવસ / રાત')}
  {tomorrow('આવતીકાલનાં સારાં ચોઘડિયાં', 'રવિવાર, 25 ઑક્ટો',
            [('લાભ, અમૃત', 'સવારે 9:32 – 12:24'), ('શુભ', 'બપોરે 1:49 – 3:15')], 'રાહુકાળ સાંજે 4:41 – 6:06')}
  <div class="s4"><h3>આવનારા દિવસો</h3><a>બધાં</a></div>
  <div class="strip">
    {uc('26', 'ઑક્ટો · સોમ', 'શરદ પૂનમ', '2 દિવસમાં', 'fest')}
    {uc('29', 'ઑક્ટો · ગુરુ', 'કરવા ચોથ', '5 દિવસમાં', 'fest')}
    {uc('29', 'ઑક્ટો · ગુરુ', 'વક્રતુંડ સંકષ્ટી', 'ચંદ્રોદય રાત્રે 8:47', 'vrat')}
  </div>
  {tabs('gu')}
</div>'''


def rahu_gu():
    return f'''
<div class="phone v4 v5">
  <div class="island"></div>
  {header('અમદાવાદ')}
  {mast(*MAST_GU)}
  {now_card('bad', 'અત્યારે · સવારે 10:05', 'રાહુકાળ', 'ટાળો', 'ચોઘડિયું: રોગ', 'સવારે 10:58 સુધી', '53 મિનિટ બાકી', 38,
            'પછી', [('b', 'ઉદ્વેગ', '10:58 – 12:24', 'ટાળો'), ('f', 'ચલ', '12:24 – 1:50', 'સામાન્ય'), ('g', 'લાભ', '1:50 – 3:15', 'સારું')],
            'બધાં ચોઘડિયાં · દિવસ / રાત', f'<span class="live">{i("bell")}લૉક સ્ક્રીન પર ગણતરી</span>')}
  {tabs('gu')}
</div>'''


def evening_en_dark():
    return f'''
<div class="phone v4 v5 en dark tall">
  <div class="island"></div>
  {header('Ahmedabad')}
  {mast('Saturday, 24 October', 'Ashwin Shukla Trayodashi', 'until 1:36 pm, then Chaturdashi · Samvat 2082', 12)}
  {now_card('fair', 'Choghadiya now · 8:30 pm', 'Udveg', 'Avoid', 'Keep auspicious work for later', 'until 9:16 pm', '46 min left', 52,
            'Next', [('g', 'Shubh', '9:16 – 10:50 pm', 'Good'), ('g', 'Amrit', '10:50 pm – 12:24 am', 'Good'), ('f', 'Char', '12:24 – 1:58 am', 'Neutral')],
            'All choghadiya · day / night')}
  {tomorrow('Good times tomorrow', 'Sun, 25 Oct', [('Labh, Amrit', '9:32 am – 12:24 pm'), ('Shubh', '1:49 – 3:15 pm')], 'Rahu Kaal 4:41 – 6:06 pm')}
  {tabs('en')}
</div>'''


NOTES = '''
<div class="notes">
  <h3>Số liệu đã đọc (chỉ đọc)</h3>
  <p><b>Search Console, 3 tháng (23/7 đến 22/10):</b> 93,3 nghìn lượt nhấp, 6 triệu lượt hiển thị. Trong 1.000 từ khóa đầu:</p>
  <p>Choghadiya khoảng <b>32,6 nghìn lượt nhấp, gần 60%</b>. Người ta gọi đúng tên: "aaj na choghadiya", "today choghadiya". Trong số đó khoảng 20% kèm tên thành phố, <b>1.216 lượt hỏi "ngày mai"</b>, chỉ 154 lượt hỏi choghadiya ban đêm.</p>
  <p>Lịch năm (Gujarati calendar 2027) khoảng 12,6 nghìn; hỏi ngày lễ ("Bhadarvi Poonam", "Shitala Satam" khi nào) khoảng 4,3 nghìn; "muhurat today" khoảng 2 nghìn; tithi hôm nay khoảng 1,8 nghìn; Rahu Kaal gần như không ai tìm riêng.</p>
  <p><b>GA4, 28 ngày (giờ Ấn Độ):</b> /choghadiya/ahmedabad chiếm 26% lượt xem; mỗi lần ghé khoảng 30 giây. 37% người dùng cuộn tới gần cuối trang (sự kiện scroll 90%); trên trang choghadiya, phần cuối là bảng đầy đủ. Lượt xem đều từ 11 giờ đến 18 giờ, và từ 19 đến 22 giờ vẫn còn khoảng 80% mức đó.</p>
  <h3>Mock đổi gì, dựa vào đâu</h3>
  <p><b>1. Tên choghadiya đứng đầu</b> ("લાભ", kèm "સારું" và việc nên làm). Người dùng tìm bằng tên và hiểu Labh, Amrit, Shubh nghĩa là gì.</p>
  <p><b>2. Ba choghadiya kế tiếp, ghi bằng chữ</b>, thay cho dải màu. 37% cuộn để xem cả bảng và mỗi lần ghé chỉ 30 giây, nên câu trả lời phải đọc được ngay, không cần chú giải.</p>
  <p><b>3. Buổi tối có thẻ "Ngày mai"</b> với các giờ tốt của ngày mai và Rahu Kaal. Có 1.216 lượt hỏi choghadiya ngày mai, và buổi tối vẫn còn khoảng 80% lượng xem ban ngày.</p>
  <p><b>4. Phần tithi thấp hơn</b> để thẻ choghadiya lên cao hơn. Tithi hôm nay chỉ khoảng 3% lượt nhấp, nhưng vẫn giữ vì là nhận diện của app.</p>
  <p><b>Giữ nguyên:</b> "Sắp tới", vì người ta hay hỏi ngày lễ khi nào; thẻ "Hôm nay"; ngày lễ lớn thay chỗ điểm nhấn như v4.</p>
  <h3>Ngoài màn Hôm nay</h3>
  <p>/kundali có 2,3 nghìn lượt xem và thời gian ở lại lâu nhất site (1 phút 35 giây), nhưng app chưa có. Lịch năm và PDF là nhu cầu lớn theo mùa (tháng 11 đến tháng 1), thuộc tab Lịch.</p>
</div>'''


def body():
    return CSS + afternoon_gu() + evening_gu() + rahu_gu() + evening_en_dark() + NOTES
