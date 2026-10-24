// One festival, read in the app: its day at the place, the puja muhurat for
// Diwali and Dhanteras, and the website's write-up (story, vidhi, mantra, dos
// and don'ts, FAQ) from /api/v1/festival. Nothing opens the website.
import { useState } from 'react';
import { Pressable, Share, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import { BandCard, BandEyebrow, BandFigure, BandPill, BandTitle, CardTitle, CREAM, GOLD, SOFT, useBand } from '@/components/band';
import { ActionBar, headerButtons } from '@/components/glass';
import { Diya } from '@/components/sky';
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
  const band = useBand('fest');
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
        <BandCard band={band} id="festival">
          {f.type === 'major' ? <View style={{ position: 'absolute', right: 6, top: 8 }}><Diya size={66} /></View> : null}
          <BandEyebrow color={GOLD}>{f.reason === 'sampradaya' ? s.utsav : s.kindFestival} · {longDate(f.date, lang)}</BandEyebrow>
          <BandTitle size={36} color={CREAM} right={f.type === 'major' ? 64 : 0}>{name}</BandTitle>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
            {days >= 0 ? <BandPill text={days === 0 ? s.today : s.relDays(days)} color={CREAM} /> : null}
            {detail.data?.festival.tithi ? <BandPill text={pick(detail.data.festival.tithi)} color={CREAM} /> : null}
          </View>
          {f.reason === 'india-date' ? <T style={{ color: SOFT, fontSize: 13.5, marginTop: 8 }}>{s.festIndiaShort(shortDate(f.indiaDate, lang))}</T> : null}
          {f.reason === 'local-day' ? <T style={{ color: SOFT, fontSize: 13.5, marginTop: 8 }}>{s.festLocalShort(shortDate(f.indiaDate, lang))}</T> : null}
          {muhurat ? (
            <BandFigure label={`${pick(muhurat.label)} · ${placeName(place, lang)}`} value={clockRange(muhurat.start, muhurat.end, lang, prefs.clock24, true)}
              note={muhurat.vrishabha ? s.muhuratWhy : undefined} labelColor={GOLD} color={CREAM} noteColor={SOFT} line="rgba(239,199,122,0.28)" />
          ) : null}
        </BandCard>
        {f.about || content?.calendarContext ? <T kind="small" style={{ fontSize: 14.5, lineHeight: 21, marginHorizontal: 4 }}>{[pick(f.about), pick(content?.calendarContext)].filter(Boolean).join(' ')}</T> : null}

        {detail.error && !detail.data ? <Notice text={s.detailOffline} /> : null}
        {detail.loading && !detail.data ? <Loading /> : null}

        {muhurat ? <MuhuratCard m={muhurat} lang={lang} city={placeName(place, lang)} /> : null}

        {content?.story ? <StoryCard story={content.story} lang={lang} /> : null}

        {content?.fasting?.rules.length ? (
          <Card style={{ gap: 10 }}>
            <CardTitle>{pick(content.fasting.heading) || s.fastingRules}</CardTitle>
            {content.fasting.rules.map((r, i) => <Bullet key={i} text={pick(r)} />)}
          </Card>
        ) : null}

        {content?.vidhi?.steps.length ? (
          <Card style={{ gap: 12 }}>
            <CardTitle>{pick(content.vidhi.heading) || s.pujaVidhi}</CardTitle>
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

function MuhuratCard({ m, lang, city }: { m: NonNullable<FestivalDetail['muhurat']>; lang: Lang; city: string }) {
  const { prefs } = useApp();
  const s = t(lang);
  const c = useColors();
  const span = m.tithi;
  return (
    <Card style={{ gap: 4 }}>
      <CardTitle sub={city}>{m.label[lang]}</CardTitle>
      <View style={{ marginTop: 4, borderTopWidth: 0.5, borderTopColor: c.line }}>
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
      <CardTitle>{story.heading[lang]}</CardTitle>
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
