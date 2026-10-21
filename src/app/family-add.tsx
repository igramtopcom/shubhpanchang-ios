// Adding a family date. Most families know the Gregorian date of a birth or a
// death, not its tithi, so that comes first: the server finds the tithi
// (/api/v1/tithi-of, at the time of day when known) and the reader confirms.
// Those who know the tithi pick it directly.
import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { router } from 'expo-router';

import { Button, Card, Chip, Notice, Screen, Section, T, useColors } from '@/components/ui';
import { MONTH_EN, MONTH_GU, lunarLabel, tithiName, t } from '@/lib/i18n';
import type { FamilyDate } from '@/lib/types';
import { useApp } from '@/state/app';

type Lunar = FamilyDate['lunar'];

export default function FamilyAdd() {
  const { prefs, update, api } = useApp();
  const lang = prefs.lang;
  const s = t(lang);
  const c = useColors();
  const [name, setName] = useState('');
  const [kind, setKind] = useState<FamilyDate['kind']>('shraddh');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [lunar, setLunar] = useState<Lunar | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const input = { borderWidth: 1, borderColor: c.cardBorder, borderRadius: 12, padding: 12, fontSize: 16, color: c.text, backgroundColor: c.card } as const;

  async function findTithi() {
    setError(null);
    if (!/^(19|20)\d\d-\d\d-\d\d$/.test(date) || (time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time))) {
      setError(s.invalidDate);
      return;
    }
    setBusy(true);
    try {
      const r = await api.tithiOf(prefs.place!, date, time || undefined);
      setLunar({ month: r.data.month, adhik: r.data.adhik, tithi: r.data.tithi });
    } catch {
      setError(s.loadError);
    } finally {
      setBusy(false);
    }
  }

  function save() {
    if (!lunar || !name.trim()) return;
    const person: FamilyDate = {
      id: Date.now().toString(36),
      name: name.trim(),
      kind,
      lunar,
      origin: date ? { date, time: time || undefined } : undefined,
    };
    update({ family: [...prefs.family, person] });
    router.back();
  }

  const pick = (patch: Partial<Lunar>) => setLunar({ month: 6, adhik: false, tithi: 0, ...lunar, ...patch });
  const pakshaOf = (l: Lunar | null) => (l && l.tithi >= 15 ? 'krishna' : 'shukla');

  return (
    <Screen>
      <T kind="title">{s.addPerson}</T>

      <Section title={s.personName}>
        <TextInput value={name} onChangeText={setName} placeholder={s.personNamePh} placeholderTextColor={c.textMuted} style={input} />
      </Section>

      <Section title={s.whatDate}>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          <Chip label={s.shraddh} selected={kind === 'shraddh'} onPress={() => setKind('shraddh')} />
          <Chip label={s.birthday} selected={kind === 'birthday'} onPress={() => setKind('birthday')} />
        </View>
        <T kind="small">{kind === 'birthday' ? s.birthdayRule : s.shraddhRule}</T>
      </Section>

      <Section title={s.fromDate}>
        <TextInput value={date} onChangeText={setDate} placeholder={s.dateFormat} placeholderTextColor={c.textMuted} autoCorrect={false} style={input} />
        <TextInput value={time} onChangeText={setTime} placeholder={s.timeOptional} placeholderTextColor={c.textMuted} autoCorrect={false} style={input} />
        <Button kind="quiet" label={s.findTithi} onPress={findTithi} disabled={busy} />
        {error ? <Notice text={error} /> : null}
      </Section>

      <Section title={s.orPickTithi}>
        <T kind="small">{s.month}</T>
        <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
          {(lang === 'gu' ? MONTH_GU : MONTH_EN).map((m, i) => (
            <Chip key={m} label={m} selected={lunar?.month === i} onPress={() => pick({ month: i })} />
          ))}
        </View>
        <T kind="small">{s.paksha}</T>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <Chip label={lang === 'gu' ? 'સુદ' : 'Shukla'} selected={!!lunar && pakshaOf(lunar) === 'shukla'} onPress={() => pick({ tithi: (lunar?.tithi ?? 0) % 15 })} />
          <Chip label={lang === 'gu' ? 'વદ' : 'Krishna'} selected={!!lunar && pakshaOf(lunar) === 'krishna'} onPress={() => pick({ tithi: ((lunar?.tithi ?? 0) % 15) + 15 })} />
        </View>
        <T kind="small">{s.tithi}</T>
        <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
          {Array.from({ length: 15 }, (_, i) => {
            const idx = (pakshaOf(lunar) === 'krishna' ? 15 : 0) + i;
            return <Chip key={idx} label={tithiName(idx, lang)} selected={lunar?.tithi === idx} onPress={() => pick({ tithi: idx })} />;
          })}
        </View>
        <Chip label={s.adhikMonth} selected={!!lunar?.adhik} onPress={() => pick({ adhik: !lunar?.adhik })} />
      </Section>

      {lunar ? (
        <Card tone="good">
          <T kind="label">{s.tithiIs}</T>
          <T kind="heading">{lunarLabel(lunar, lang)}</T>
        </Card>
      ) : null}

      <Button label={s.save} onPress={save} disabled={!lunar || !name.trim()} />
      <Button kind="quiet" label={s.cancel} onPress={() => router.back()} />
    </Screen>
  );
}
