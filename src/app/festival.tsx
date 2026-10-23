// One festival, read in the app: its day at the place, the puja muhurat for
// Diwali and Dhanteras, and the website's write-up (story, vidhi, mantra, dos
// and don'ts, FAQ) from /api/v1/festival. Nothing opens the website.
import { useState } from 'react';
import { Pressable, Share, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import { ActionBar, headerButtons } from '@/components/glass';
import { Card, Loading, Notice, Screen, T, useColors } from '@/components/ui';
import { addAllDayEvent, calendarSupported } from '@/lib/calendar';
import { clock, clockRange, shortDate } from '@/lib/format';
import { tick } from '@/lib/haptics';
import { longDate, placeName, t } from '@/lib/i18n';
import { notificationPermission, notificationsSupported } from '@/lib/notify';
import { daysBetween, shiftDate } from '@/lib/time';
import type { Bi, Festival, FestivalDetail, Lang } from '@/lib/types';
import { useApp } from '@/state/app';
import { useFestivalDetail, useFestivals, useNow } from '@/state/data';

export default function FestivalScreen() {
  const { prefs, update } = useApp();
  const lang = prefs.lang;
  const s = t(lang);
  const c = useColors();
  const place = prefs.place!;
  const now = useNow(place.timezone);
  const { slug } = useLocalSearchParams<{ slug?: string }>();
  const detail = useFestivalDetail(slug ?? null);
  // The list row, for when the write-up cannot be loaded (offline, an older server).
  const list = useFestivals(now.date, shiftDate(now.date, 365));
  const f: Festival | null = detail.data?.festival ?? list.data?.find(x => x.slug === slug) ?? null;
  const content = detail.data?.content ?? null;
  const muhurat = detail.data?.muhurat ?? null;
  const pick = (b?: Bi | null) => (b ? b[lang] : '');
  const muteId = f ? `fest:${f.slug}` : '';
  const reminded = !!f && prefs.notify.festivals.on && !(prefs.notify.muted ?? []).includes(muteId);

  if (!f) {
    return (
      <Screen header>
        {detail.loading || list.loading ? <Loading /> : <Notice text={s.loadError} onRetry={() => { detail.reload(); list.reload(); }} retryLabel={s.retry} />}
      </Screen>
    );
  }
  const name = lang === 'gu' ? f.nameGu : f.nameEn;
  const days = daysBetween(now.date, f.date);

  const toggleRemind = async () => {
    if (!reminded) {
      if (notificationsSupported && !(await notificationPermission(true))) return;
      update({ notify: { ...prefs.notify, festivals: { ...prefs.notify.festivals, on: true }, muted: (prefs.notify.muted ?? []).filter(x => x !== muteId) } });
    } else {
      update({ notify: { ...prefs.notify, muted: [...(prefs.notify.muted ?? []), muteId] } });
    }
  };
  const share = () => {
    tick();
    const mu = muhurat ? `\n🪔 ${pick(muhurat.label)} (${placeName(place, lang)}): ${clockRange(muhurat.start, muhurat.end, lang, prefs.clock24, true)}` : '';
    Share.share({ message: `${name} · ${longDate(f.date, lang, true, true)}${mu}\n\nhttps://shubhpanchang.in/festivals/${f.slug}${lang === 'en' ? '?lang=en' : ''}` }).catch(() => {});
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <Stack.Screen options={headerButtons([{ icon: 'square.and.arrow.up', label: s.share, onPress: share }], c.text)} />
      <Screen header bottom={130} gap={16}>
        <View style={{ gap: 6 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <SymbolView name="sparkles" size={14} tintColor={c.brand} />
            <T kind="eyebrow">{f.reason === 'sampradaya' ? s.utsav : s.kindFestival} · {longDate(f.date, lang)}</T>
          </View>
          <T kind="display">{name}</T>
          {f.about || content?.calendarContext ? <T kind="small" style={{ fontSize: 14.5, lineHeight: 21 }}>{[pick(f.about), pick(content?.calendarContext)].filter(Boolean).join(' ')}</T> : null}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
            {days >= 0 ? <Meta icon="clock" text={days === 0 ? s.today : s.relDays(days)} hot /> : null}
            {detail.data?.festival.tithi ? <Meta text={pick(detail.data.festival.tithi)} /> : null}
            {f.reason === 'india-date' ? <Meta text={s.festIndiaShort(shortDate(f.indiaDate, lang))} /> : null}
            {f.reason === 'local-day' ? <Meta text={s.festLocalShort(shortDate(f.indiaDate, lang))} /> : null}
          </View>
        </View>

        {detail.error && !detail.data ? <Notice text={s.detailOffline} /> : null}
        {detail.loading && !detail.data ? <Loading /> : null}

        {muhurat ? <MuhuratCard m={muhurat} lang={lang} city={placeName(place, lang)} /> : null}

        {content?.story ? <StoryCard story={content.story} lang={lang} /> : null}

        {content?.fasting?.rules.length ? (
          <Card style={{ gap: 10 }}>
            <T kind="heading">{pick(content.fasting.heading) || s.fastingRules}</T>
            {content.fasting.rules.map((r, i) => <Bullet key={i} text={pick(r)} />)}
          </Card>
        ) : null}

        {content?.vidhi?.steps.length ? (
          <Card style={{ gap: 12 }}>
            <T kind="heading">{pick(content.vidhi.heading) || s.pujaVidhi}</T>
            {content.vidhi.steps.map((st, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: c.backgroundElement, alignItems: 'center', justifyContent: 'center' }}>
                  <T style={{ fontSize: 12.5, fontWeight: '600', color: c.textSecondary }}>{i + 1}</T>
                </View>
                <T style={{ flex: 1, fontSize: 15, lineHeight: 22 }}>{pick(st)}</T>
              </View>
            ))}
          </Card>
        ) : null}

        {content?.mantra ? (
          <Card style={{ alignItems: 'center', gap: 6, paddingVertical: 18 }}>
            <T kind="small">{s.mantra}</T>
            <T style={{ fontSize: 20, lineHeight: 32, textAlign: 'center', fontWeight: '500' }}>{content.mantra.devanagari}</T>
            <T kind="small" style={{ fontStyle: 'italic', textAlign: 'center' }}>{lang === 'gu' ? content.mantra.gujarati : content.mantra.roman}</T>
            <View style={{ alignSelf: 'stretch', height: 1, backgroundColor: c.line, marginVertical: 6 }} />
            <T kind="small" center>{pick(content.mantra.meaning)}</T>
            {content.mantra.note ? <T kind="caption" center>{pick(content.mantra.note)}</T> : null}
          </Card>
        ) : null}

        {content?.dos.length || content?.donts.length ? (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <DoList title={s.dos} items={content.dos.map(pick)} tone={c.good} icon="checkmark" />
            <DoList title={s.donts} items={content.donts.map(pick)} tone={c.bad} icon="xmark" />
          </View>
        ) : null}

        {content?.faqs?.length ? <Faq faqs={content.faqs} lang={lang} /> : null}

        {!content && !detail.loading ? <T kind="caption" style={{ marginHorizontal: 6 }}>{s.noWriteUp}</T> : null}
      </Screen>
      <ActionBar actions={[
        ...(calendarSupported ? [{ icon: 'calendar.badge.plus' as const, label: s.addToCalendar, primary: true, onPress: () => addAllDayEvent({ date: f.date, title: name, notes: [pick(f.about), muhurat ? `${pick(muhurat.label)}: ${clockRange(muhurat.start, muhurat.end, lang, prefs.clock24, true)}` : null].filter(Boolean).join('\n') }) }] : []),
        { icon: reminded ? 'bell.fill' : 'bell', label: reminded ? s.reminderOn : s.remindMe, on: reminded, onPress: toggleRemind },
        { icon: 'square.and.arrow.up', label: s.share, onPress: share },
      ]} />
    </View>
  );
}

function Meta({ text, icon, hot }: { text: string; icon?: 'clock'; hot?: boolean }) {
  const c = useColors();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 11, backgroundColor: hot ? c.brandSoft : c.backgroundElement }}>
      {icon ? <SymbolView name={icon} size={12} tintColor={hot ? c.brand : c.textSecondary} /> : null}
      <T style={{ fontSize: 13, fontWeight: '600', color: hot ? c.brand : c.textSecondary }}>{text}</T>
    </View>
  );
}

function MuhuratCard({ m, lang, city }: { m: NonNullable<FestivalDetail['muhurat']>; lang: Lang; city: string }) {
  const { prefs } = useApp();
  const s = t(lang);
  const c = useColors();
  const span = m.tithi;
  return (
    <Card tone="brand" style={{ gap: 4 }}>
      <T kind="eyebrow" style={{ fontSize: 13 }}>{m.label[lang]} · {city}</T>
      <T style={{ fontSize: 26, lineHeight: 36, fontWeight: '600', fontVariant: ['tabular-nums'], color: c.text }}>{clockRange(m.start, m.end, lang, prefs.clock24, true)}</T>
      <View style={{ marginTop: 8, borderTopWidth: 1, borderTopColor: c.line }}>
        <MRow label={s.pradoshKaal} value={clockRange(m.pradoshKaal.start, m.pradoshKaal.end, lang, prefs.clock24)} />
        {m.vrishabha ? <MRow label={s.vrishabhaLagna} value={clockRange(m.vrishabha.start, m.vrishabha.end, lang, prefs.clock24)} /> : null}
        <MRow label={span.name[lang]} value={`${shortDate(span.start.date, lang)} ${clock(span.start.time, lang, prefs.clock24)} – ${shortDate(span.end.date, lang)} ${clock(span.end.time, lang, prefs.clock24)}`} />
        {m.chopda.map((x, i) => <MRow key={i} label={`${s.chopdaPujan} · ${x.names[lang]}`} value={`${shortDate(x.start.date, lang)} ${clock(x.start.time, lang, prefs.clock24)} – ${clock(x.end.time, lang, prefs.clock24)}`} />)}
      </View>
    </Card>
  );
}

function MRow({ label, value }: { label: string; value: string }) {
  const c = useColors();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 9, borderBottomWidth: 0.5, borderBottomColor: c.line }}>
      <T kind="small" style={{ flex: 1 }}>{label}</T>
      <T kind="value" style={{ fontSize: 14, flexShrink: 1, textAlign: 'right' }}>{value}</T>
    </View>
  );
}

function StoryCard({ story, lang }: { story: NonNullable<NonNullable<FestivalDetail['content']>['story']>; lang: Lang }) {
  const s = t(lang);
  const c = useColors();
  const [open, setOpen] = useState(false);
  const paras = [...story.paragraphs.map(p => p[lang]), ...story.subsections.flatMap(x => [x.heading[lang], x[lang]])];
  const shown = open ? paras : paras.slice(0, 1);
  return (
    <Card style={{ gap: 10 }}>
      <T kind="heading">{story.heading[lang]}</T>
      {shown.map((p, i) => <T key={i} style={{ fontSize: 15, lineHeight: 24 }} numberOfLines={open ? undefined : 5}>{p}</T>)}
      {paras.length > 1 || !open ? (
        <Pressable accessibilityRole="button" onPress={() => { tick(); setOpen(!open); }} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <T style={{ color: c.brand, fontWeight: '600', fontSize: 14 }}>{open ? s.showLess : s.readWhole}</T>
          <SymbolView name={open ? 'chevron.up' : 'chevron.down'} size={11} weight="semibold" tintColor={c.brand} />
        </Pressable>
      ) : null}
    </Card>
  );
}

function Bullet({ text }: { text: string }) {
  const c = useColors();
  return (
    <View style={{ flexDirection: 'row', gap: 10 }}>
      <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: c.brand, marginTop: 9 }} />
      <T style={{ flex: 1, fontSize: 15, lineHeight: 22 }}>{text}</T>
    </View>
  );
}

function DoList({ title, items, tone, icon }: { title: string; items: string[]; tone: string; icon: 'checkmark' | 'xmark' }) {
  return (
    <Card style={{ flex: 1, gap: 6 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <SymbolView name={icon} size={12} weight="bold" tintColor={tone} />
        <T style={{ color: tone, fontWeight: '600', fontSize: 14 }}>{title}</T>
      </View>
      {items.map((x, i) => <T key={i} style={{ fontSize: 13.5, lineHeight: 19 }}>{x}</T>)}
    </Card>
  );
}

function Faq({ faqs, lang }: { faqs: { q: Bi; a: Bi }[]; lang: Lang }) {
  const c = useColors();
  const [open, setOpen] = useState(0);
  return (
    <Card style={{ padding: 0, gap: 0, overflow: 'hidden' }}>
      {faqs.map((f, i) => (
        <View key={i} style={i > 0 ? { borderTopWidth: 0.5, borderTopColor: c.line } : null}>
          <Pressable accessibilityRole="button" accessibilityState={{ expanded: open === i }} onPress={() => { tick(); setOpen(open === i ? -1 : i); }}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16 }}>
            <T style={{ flex: 1, fontWeight: '600', fontSize: 15 }}>{f.q[lang]}</T>
            <SymbolView name={open === i ? 'chevron.up' : 'chevron.down'} size={12} weight="semibold" tintColor={c.textMuted} />
          </Pressable>
          {open === i ? <T kind="small" style={{ paddingHorizontal: 16, paddingBottom: 14, fontSize: 14.5, lineHeight: 22 }}>{f.a[lang]}</T> : null}
        </View>
      ))}
    </Card>
  );
}
