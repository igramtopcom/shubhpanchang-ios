// Adding a family date, as a sheet. Most families know the Gregorian date of a
// birth or a death, so that comes first and the tithi is found as they pick it
// (/api/v1/tithi-of, at the time of day when known); those who only remember
// the tithi ("Magshar sud 5", usual for a punyatithi) pick it directly.
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import { DateTimeFields, deviceToday } from '@/components/date-time-fields';
import { Card, Cell, Group, Notice, Segmented, T, useColors, type Symbol } from '@/components/ui';
import { shortDate, shortWeekday } from '@/lib/format';
import { success, tick } from '@/lib/haptics';
import { lunarLabel, MONTH_EN, MONTH_GU, t, tithiName } from '@/lib/i18n';
import { askAfterSuccess } from '@/lib/review';
import type { FamilyDate, TithiOccurrence } from '@/lib/types';
import { useApp } from '@/state/app';
import { useNow } from '@/state/data';

type Lunar = FamilyDate['lunar'];
/** The months in the order of the Gujarati year, Kartik first (indices into the Chaitra-first lists). */
const YEAR_ORDER = [7, 8, 9, 10, 11, 0, 1, 2, 3, 4, 5, 6];

export default function FamilyAdd() {
  const { prefs, update, api } = useApp();
  const lang = prefs.lang;
  const s = t(lang);
  const c = useColors();
  const now = useNow(prefs.place!.timezone);
  const [name, setName] = useState('');
  const [kind, setKind] = useState<FamilyDate['kind']>('birthday');
  const [mode, setMode] = useState<0 | 1>(0);
  const [date, setDate] = useState(deviceToday);
  const [time, setTime] = useState('');
  const [lunar, setLunar] = useState<Lunar | null>(null);
  const [found, setFound] = useState<FamilyDate['origin']>(undefined);
  // The next occurrence, tagged with the tithi it answers so a stale one is never shown.
  const [nextFor, setNextFor] = useState<{ key: string; occ: TithiOccurrence | null } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [remind, setRemind] = useState(true);

  // A date picked: find its tithi at the place (the server's rule: the tithi at sunrise, or at the time given).
  useEffect(() => {
    if (mode !== 0) return;
    let live = true;
    api.tithiOf(prefs.place!, date, time || undefined)
      .then(r => { if (live) { setError(null); setLunar({ month: r.data.month, adhik: r.data.adhik, tithi: r.data.tithi }); setFound({ date, time: time || undefined }); } })
      .catch(() => { if (live) setError(s.loadError); });
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, date, time]);

  // The day it falls on next, for the preview.
  useEffect(() => {
    if (!lunar) return;
    let live = true;
    const key = lunarKey(lunar, kind);
    api.tithiDates(prefs.place!, lunar, kind === 'shraddh' ? 'aparahna' : 'sunrise', now.date, 1)
      .then(r => { if (live) setNextFor({ key, occ: r.data[0] ?? null }); })
      .catch(() => { if (live) setNextFor({ key, occ: null }); });
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lunar?.month, lunar?.tithi, lunar?.adhik, kind]);

  const pick = (patch: Partial<Lunar>) => { tick(); setLunar({ month: 7, adhik: false, tithi: 0, ...lunar, ...patch }); setFound(undefined); };
  const krishna = !!lunar && lunar.tithi >= 15;
  const next = lunar && nextFor?.key === lunarKey(lunar, kind) ? nextFor.occ : null;
  const ok = !!lunar && !!name.trim();

  function save() {
    if (!ok) return;
    const person: FamilyDate = { id: Date.now().toString(36), name: name.trim(), kind, lunar: lunar!, origin: found, ...(remind ? {} : { remind: false }) };
    update({ family: [...prefs.family, person] });
    success();
    router.back();
    askAfterSuccess();
  }

  const kinds: [FamilyDate['kind'], string, Symbol][] = [['birthday', s.birthday, 'heart'], ['shraddh', s.punyatithi, 'flame'], ['anniversary', s.anniversary, 'sparkles']];

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 18, paddingBottom: 10 }}>
        <RoundBtn icon="xmark" label={s.cancel} onPress={() => router.back()} />
        <T kind="heading">{s.newPerson}</T>
        <RoundBtn icon="checkmark" label={s.save} onPress={save} tint={ok} disabled={!ok} />
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 40, gap: 16 }} keyboardShouldPersistTaps="handled">
        <Card style={{ paddingVertical: 10 }}>
          <T kind="caption">{s.personName}</T>
          <TextInput value={name} onChangeText={setName} placeholder={s.personNamePh} placeholderTextColor={c.textMuted} style={{ fontSize: 17, fontWeight: '500', color: c.text, paddingVertical: 4 }} accessibilityLabel={s.personName} />
        </Card>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          {kinds.map(([k, label, icon]) => (
            <Pressable key={k} accessibilityRole="radio" accessibilityState={{ checked: kind === k }} onPress={() => { tick(); setKind(k); }}
              style={{ flex: 1, alignItems: 'center', gap: 6, paddingVertical: 12, borderRadius: 14, backgroundColor: kind === k ? c.brandSoft : c.card, borderWidth: kind === k ? 2 : 1, borderColor: kind === k ? c.brand : c.line }}>
              <SymbolView name={icon} size={16} tintColor={c.brand} />
              <T style={{ fontSize: 13.5, fontWeight: '600', color: kind === k ? c.text : c.textSecondary }} shrink>{label}</T>
            </Pressable>
          ))}
        </View>

        <Segmented values={[s.knowDate, s.knowTithi]} index={mode} onChange={i => { setMode(i as 0 | 1); if (i === 1 && !lunar) pick({}); }} />

        {mode === 0 ? (
          <Card>
            <DateTimeFields date={date} time={time} onDate={setDate} onTime={setTime} />
            <T kind="caption">{s.timeHint}</T>
          </Card>
        ) : (
          <Card style={{ gap: 12 }}>
            <T kind="caption">{s.month}</T>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {YEAR_ORDER.map(i => <Choice key={i} label={(lang === 'gu' ? MONTH_GU : MONTH_EN)[i]} on={lunar?.month === i} onPress={() => pick({ month: i })} />)}
            </View>
            <Segmented values={[lang === 'gu' ? 'સુદ' : 'Shukla', lang === 'gu' ? 'વદ' : 'Krishna']} index={krishna ? 1 : 0} onChange={i => pick({ tithi: ((lunar?.tithi ?? 0) % 15) + (i ? 15 : 0) })} />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {Array.from({ length: 15 }, (_, i) => {
                const idx = (krishna ? 15 : 0) + i;
                return <Choice key={idx} label={tithiName(idx, lang)} on={lunar?.tithi === idx} onPress={() => pick({ tithi: idx })} />;
              })}
            </View>
            <Choice label={s.adhikMonth} on={!!lunar?.adhik} onPress={() => pick({ adhik: !lunar?.adhik })} />
          </Card>
        )}

        {error ? <Notice text={error} /> : null}

        {lunar ? (
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: c.brandSoft, alignItems: 'center', justifyContent: 'center' }}>
              <SymbolView name={kind === 'shraddh' ? 'flame' : 'moon'} size={20} tintColor={c.brand} />
            </View>
            <View style={{ flex: 1 }}>
              <T kind="caption">{kind === 'shraddh' ? s.tithiOfDeath : s.tithiIs}</T>
              <T style={{ fontSize: 17, fontWeight: '600' }}>{lunarLabel(lunar, lang)}</T>
              {next ? <T kind="small">{s.thisTime}: {shortWeekday(next.date, lang)}, {shortDate(next.date, lang)}{next.date.slice(0, 4) !== now.date.slice(0, 4) ? ` ${next.date.slice(0, 4)}` : ''}</T> : null}
            </View>
          </Card>
        ) : null}

        <Group>
          <Cell first icon="bell" tint={c.brand} label={s.remindEve} toggle={remind} onToggle={setRemind} />
        </Group>
      </ScrollView>
    </View>
  );
}

const lunarKey = (l: Lunar, kind: FamilyDate['kind']) => `${l.month}:${l.tithi}:${l.adhik}:${kind}`;

function RoundBtn({ icon, label, onPress, tint, disabled }: { icon: Symbol; label: string; onPress: () => void; tint?: boolean; disabled?: boolean }) {
  const c = useColors();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }} disabled={disabled} onPress={() => { tick(); onPress(); }} hitSlop={6}
      style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: tint ? c.brand : c.backgroundElement, opacity: disabled ? 0.5 : 1 }}>
      <SymbolView name={icon} size={15} weight="bold" tintColor={tint ? c.onBrand : c.text} />
    </Pressable>
  );
}

function Choice({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  const c = useColors();
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected: on }} onPress={onPress}
      style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, backgroundColor: on ? c.brand : c.backgroundElement }}>
      <T style={{ fontSize: 14, fontWeight: '500', color: on ? c.onBrand : c.text }}>{label}</T>
    </Pressable>
  );
}
