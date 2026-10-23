// Calendar: a month of days, each with its tithi and a dot for a festival,
// a vrat or a family date. Tap the month's title to jump to any month of any
// year (or of a Vikram Samvat year); tap a day for its sheet.
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import { Glass, headerButtons } from '@/components/glass';
import { Card, DateTile, List, ListRow, Loading, Notice, Screen, Segmented, T, useColors } from '@/components/ui';
import { shortWeekday } from '@/lib/format';
import { tick } from '@/lib/haptics';
import { longDate, t } from '@/lib/i18n';
import { addMonths, CAL_FIRST, CAL_LAST, civilMonthOfLunar, LUNAR_FROM_KARTIK, samvatOfMonth, tithiShort } from '@/lib/calendar-nav';
import { weekday } from '@/lib/time';
import { familyTitle } from '@/lib/upcoming';
import type { Lang, PanchangDay } from '@/lib/types';
import { useApp } from '@/state/app';
import { useFamilyNext, useFestivals, useMonth, useNow, useObservances } from '@/state/data';

/** The vrat lists start in 2026 (/api/v1/observances refuses earlier dates). */
const LIST_FROM_MONTH = '2026-01';

const WEEK = { gu: ['ર', 'સો', 'મં', 'બુ', 'ગુ', 'શુ', 'શ'], en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] };
const MONTHS = {
  gu: ['જાન્યુઆરી', 'ફેબ્રુઆરી', 'માર્ચ', 'એપ્રિલ', 'મે', 'જૂન', 'જુલાઈ', 'ઑગસ્ટ', 'સપ્ટેમ્બર', 'ઑક્ટોબર', 'નવેમ્બર', 'ડિસેમ્બર'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};
const SHORT = {
  gu: ['જાન્યુ', 'ફેબ્રુ', 'માર્ચ', 'એપ્રિલ', 'મે', 'જૂન', 'જુલાઈ', 'ઑગસ્ટ', 'સપ્ટે', 'ઑક્ટો', 'નવે', 'ડિસે'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

export default function CalendarScreen() {
  const { prefs } = useApp();
  const lang = prefs.lang;
  const s = t(lang);
  const c = useColors();
  const now = useNow(prefs.place!.timezone);
  const [month, setMonth] = useState(now.date.slice(0, 7));
  // ?scrolled=1: open scrolled down, for the screenshot of the folded title.
  const { scrolled } = useLocalSearchParams<{ scrolled?: string }>();
  const [picker, setPicker] = useState(false);
  const days = useMonth(month);
  const [y, m] = month.split('-').map(Number);
  const first = `${month}-01`;
  const last = `${month}-${String(new Date(Date.UTC(y, m, 0)).getUTCDate()).padStart(2, '0')}`;
  const listed = month >= LIST_FROM_MONTH;
  const obs = useObservances(listed ? first : `${LIST_FROM_MONTH}-01`, listed ? last : `${LIST_FROM_MONTH}-01`);
  const fest = useFestivals(listed ? first : `${LIST_FROM_MONTH}-01`, listed ? last : `${LIST_FROM_MONTH}-01`);
  const fam = useFamilyNext(first);

  const marks = new Map<string, Set<'f' | 'v' | 'p'>>();
  const mark = (d: string, k: 'f' | 'v' | 'p') => { if (d.slice(0, 7) === month) marks.set(d, new Set([...(marks.get(d) ?? []), k])); };
  for (const f of fest.data ?? []) mark(f.date, 'f');
  for (const o of obs.data ?? []) if (prefs.notify.kinds.includes(o.kind)) mark(o.date, 'v');
  for (const r of fam.data ?? []) if (r.next) mark(r.next.date, 'p');

  const lead = weekday(first);
  const cells: (PanchangDay | null)[] = [...Array(lead).fill(null), ...(days.data ?? [])];
  while (cells.length % 7) cells.push(null);
  const lunar = [...new Set((days.data ?? []).map(d => (lang === 'gu' ? d.hinduMonth.gu : d.hinduMonth.en)))].join(' · ');
  const samvat = samvatOfMonth(days.data ?? []);

  // The month's festivals and family dates under the grid.
  const famRows = (fam.data ?? []).filter(r => r.next && r.next.date.slice(0, 7) === month);
  const rows = [
    ...famRows.map(r => ({ date: r.next!.date, title: familyTitle(r.person, lang), detail: '', href: `/person?id=${r.person.id}` })),
    ...(fest.data ?? []).filter(f => f.date.slice(0, 7) === month).map(f => ({ date: f.date, title: lang === 'gu' ? f.nameGu : f.nameEn, detail: f.about ? f.about[lang] : '', href: `/festival?slug=${encodeURIComponent(f.slug)}` })),
  ].sort((a, b) => (a.date < b.date ? -1 : 1));

  const goMonth = (x: string) => { setMonth(x < CAL_FIRST ? CAL_FIRST : x > CAL_LAST ? CAL_LAST : x); setPicker(false); };

  // The ScrollView (Screen) is the screen's own view: iOS folds the large title
  // only for that one. A wrapper View around it left "Calendar" sitting over the
  // month while it scrolled. The picker floats in its own Modal.
  return (
    <Screen header gap={14} startAt={scrolled ? 320 : undefined}>
      <Stack.Screen options={headerButtons([
        { icon: 'calendar', label: s.backToToday, text: s.today, onPress: () => goMonth(now.date.slice(0, 7)) },
        { icon: 'magnifyingglass', label: s.search, onPress: () => router.push('/search') },
        { icon: 'gearshape', label: s.tabSettings, onPress: () => router.push('/settings') },
      ], c.text)} />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Pressable accessibilityRole="button" accessibilityLabel={s.pickMonth} accessibilityState={{ expanded: picker }} onPress={() => { tick(); setPicker(!picker); }} hitSlop={8} style={{ flexShrink: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <T kind="title" color={picker ? c.brand : c.text}>{MONTHS[lang][m - 1]} {y}</T>
              <SymbolView name={picker ? 'chevron.up' : 'chevron.down'} size={13} weight="semibold" tintColor={picker ? c.brand : c.textSecondary} />
            </View>
            <T kind="caption">{[lunar, samvat ? `${s.samvatShort} ${samvat}` : ''].filter(Boolean).join(' · ')}</T>
          </Pressable>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Round icon="chevron.left" label={s.prevMonth} onPress={month > CAL_FIRST ? () => goMonth(addMonths(month, -1)) : undefined} />
            <Round icon="chevron.right" label={s.nextMonth} onPress={month < CAL_LAST ? () => goMonth(addMonths(month, 1)) : undefined} />
          </View>
        </View>

        {days.stale ? <Notice text={s.offline} /> : null}
        {days.error && !days.data ? <Notice text={s.loadError} onRetry={days.reload} retryLabel={s.retry} /> : null}
        {days.loading && !days.data ? <Loading /> : null}

        {days.data ? (
          <Card style={{ paddingHorizontal: 6, paddingVertical: 10, gap: 0 }}>
            <View style={{ flexDirection: 'row', paddingBottom: 6 }}>
              {WEEK[lang].map(w => <T key={w} kind="caption" center style={{ flex: 1, fontWeight: '500' }}>{w}</T>)}
            </View>
            {Array.from({ length: cells.length / 7 }, (_, r) => (
              <View key={r} style={{ flexDirection: 'row' }}>
                {cells.slice(r * 7, r * 7 + 7).map((d, i) => (d ? <DayCell key={d.date} d={d} today={d.date === now.date} marks={marks.get(d.date)} lang={lang} /> : <View key={i} style={{ flex: 1, height: 54 }} />))}
              </View>
            ))}
          </Card>
        ) : null}

        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16 }}>
          <Legend color={c.brand} label={s.kindFestival} />
          <Legend color={c.good} label={s.kindVrat} />
          <Legend color={c.neutral} label={s.kindFamily} />
        </View>

        {rows.length ? (
          <List>
            {rows.map((r, i) => (
              <ListRow key={`${r.href}`} first={i === 0} lead={<DateTile day={String(Number(r.date.slice(8)))} sub={shortWeekday(r.date, lang)} />}
                title={r.title} detail={r.detail || undefined} trailing="chevron" onPress={() => router.push(r.href as never)} a11y={`${r.title}, ${longDate(r.date, lang)}`} />
            ))}
          </List>
        ) : null}
      <Modal visible={picker} transparent animationType="fade" onRequestClose={() => setPicker(false)}>
        <MonthPicker month={month} lang={lang} onPick={goMonth} onToday={() => goMonth(now.date.slice(0, 7))} onClose={() => setPicker(false)} />
      </Modal>
    </Screen>
  );
}

function DayCell({ d, today, marks, lang }: { d: PanchangDay; today: boolean; marks?: Set<'f' | 'v' | 'p'>; lang: Lang }) {
  const c = useColors();
  const full = d.tithi.index === 14 || d.tithi.index === 29;
  return (
    <Pressable
      onPress={() => { tick(); router.push(`/day?date=${d.date}`); }}
      accessibilityRole="button"
      accessibilityLabel={`${longDate(d.date, lang)}, ${lang === 'gu' ? d.tithi.nameGu : d.tithi.name}${marks?.size ? `, ${[...marks].map(k => t(lang)[k === 'f' ? 'kindFestival' : k === 'v' ? 'kindVrat' : 'kindFamily']).join(', ')}` : ''}`}
      style={({ pressed }) => [{ flex: 1, height: 54, borderRadius: 12, alignItems: 'center', paddingTop: 5 },
        today && { borderWidth: 1.5, borderColor: c.brand }, pressed && { backgroundColor: c.backgroundElement }]}>
      <T style={{ fontSize: 16, fontWeight: today ? '700' : '500', color: today ? c.brand : c.text, fontVariant: ['tabular-nums'] }} maxScale={1.3}>{Number(d.date.slice(8))}</T>
      <T style={{ fontSize: 10.5, color: full ? c.text : c.textSecondary, fontWeight: full ? '600' : '400' }} maxScale={1.2} shrink>{tithiShort(d, lang)}</T>
      <View style={{ position: 'absolute', bottom: 5, flexDirection: 'row', gap: 3 }}>
        {[...(marks ?? [])].sort().map(k => <View key={k} style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: k === 'f' ? c.brand : k === 'v' ? c.good : c.neutral }} />)}
      </View>
    </Pressable>
  );
}

function Round({ icon, label, onPress }: { icon: 'chevron.left' | 'chevron.right'; label: string; onPress?: () => void }) {
  const c = useColors();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={!onPress} onPress={() => { tick(); onPress?.(); }} hitSlop={6}
      style={({ pressed }) => ({ width: 40, height: 40, borderRadius: 20, backgroundColor: c.card, borderWidth: 0.5, borderColor: c.line, alignItems: 'center', justifyContent: 'center', opacity: !onPress ? 0.35 : pressed ? 0.7 : 1 })}>
      <SymbolView name={icon} size={14} weight="semibold" tintColor={c.text} />
    </Pressable>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: color }} />
      <T kind="caption" style={{ fontSize: 12.5 }}>{label}</T>
    </View>
  );
}

/** Jump anywhere: a year stepper and twelve months, by the civil year or by the Vikram Samvat year. */
function MonthPicker({ month, lang, onPick, onToday, onClose }: { month: string; lang: Lang; onPick: (m: string) => void; onToday: () => void; onClose: () => void }) {
  const s = t(lang);
  const c = useColors();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<0 | 1>(0);
  const [year, setYear] = useState(Number(month.slice(0, 4)));
  // Samvat: the year whose Kartik begins in the autumn of `year - 57`.
  const [vs, setVs] = useState(Number(month.slice(0, 4)) + (Number(month.slice(5)) >= 11 ? 57 : 56));
  const minY = Number(CAL_FIRST.slice(0, 4)), maxY = Number(CAL_LAST.slice(0, 4));
  const minVs = minY + 57, maxVs = maxY + 56;
  const cur = month;
  return (
    <>
      <Pressable accessibilityRole="button" accessibilityLabel={s.close} onPress={onClose} style={[StyleSheet.absoluteFill, { backgroundColor: c.scrim }]} />
      <View style={{ position: 'absolute', left: 12, right: 12, top: insets.top + 150 }}>
        <Glass radius={30} style={{ padding: 14, gap: 12 }}>
          <Segmented values={[s.civilYear, s.vikramSamvat]} index={mode} onChange={i => setMode(i as 0 | 1)} />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Round icon="chevron.left" label={s.prevYear} onPress={mode === 0 ? (year > minY ? () => setYear(year - 1) : undefined) : (vs > minVs ? () => setVs(vs - 1) : undefined)} />
            <T style={{ fontSize: 22, fontWeight: '600', fontVariant: ['tabular-nums'] }}>{mode === 0 ? year : `${s.samvatShort} ${vs}`}</T>
            <Round icon="chevron.right" label={s.nextYear} onPress={mode === 0 ? (year < maxY ? () => setYear(year + 1) : undefined) : (vs < maxVs ? () => setVs(vs + 1) : undefined)} />
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {mode === 0
              ? SHORT[lang].map((name, i) => {
                const key = `${year}-${String(i + 1).padStart(2, '0')}`;
                const on = key === cur;
                const off = key < CAL_FIRST || key > CAL_LAST;
                return <MonthCell key={key} label={name} on={on} off={off} width="23%" onPress={() => onPick(key)} />;
              })
              : LUNAR_FROM_KARTIK.map((i, k) => {
                const key = civilMonthOfLunar(vs, k);
                const on = key === cur;
                const off = key < CAL_FIRST || key > CAL_LAST;
                const [ky, km] = key.split('-').map(Number);
                return <MonthCell key={k} label={lang === 'gu' ? GU_LUNAR[i] : EN_LUNAR[i]} sub={`≈ ${SHORT[lang][km - 1]} ${ky}`} on={on} off={off} width="31.5%" onPress={() => onPick(key)} />;
              })}
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <T kind="caption" style={{ flex: 1 }}>{mode === 1 ? s.samvatStarts : ''}</T>
            <Pressable accessibilityRole="button" onPress={onToday} hitSlop={8}><T style={{ color: c.brand, fontWeight: '600' }}>{s.today}</T></Pressable>
          </View>
        </Glass>
      </View>
    </>
  );
}

const GU_LUNAR = ['ચૈત્ર', 'વૈશાખ', 'જેઠ', 'અષાઢ', 'શ્રાવણ', 'ભાદરવો', 'આસો', 'કારતક', 'માગસર', 'પોષ', 'મહા', 'ફાગણ'];
const EN_LUNAR = ['Chaitra', 'Vaishakh', 'Jyeshtha', 'Ashadh', 'Shravan', 'Bhadrapad', 'Ashwin', 'Kartik', 'Margashirsh', 'Posh', 'Maha', 'Falgun'];

function MonthCell({ label, sub, on, off, width, onPress }: { label: string; sub?: string; on: boolean; off: boolean; width: `${number}%`; onPress: () => void }) {
  const c = useColors();
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected: on, disabled: off }} disabled={off} onPress={() => { tick(); onPress(); }}
      style={({ pressed }) => ({ width, paddingVertical: sub ? 9 : 12, borderRadius: 14, alignItems: 'center', backgroundColor: on ? c.brand : c.card, borderWidth: on ? 0 : 1, borderColor: c.line, opacity: off ? 0.35 : pressed ? 0.75 : 1 })}>
      <T style={{ fontSize: 15, fontWeight: '600', color: on ? c.onBrand : c.text }} shrink>{label}</T>
      {sub ? <T style={{ fontSize: 11.5, color: on ? c.onBrand : c.textSecondary }} shrink>{sub}</T> : null}
    </Pressable>
  );
}

