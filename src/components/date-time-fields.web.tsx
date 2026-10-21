// Web preview stand-in for date-time-fields.tsx: the native picker has no web
// build, so the date and the time are typed (findTithi checks the format).
import { TextInput, View } from 'react-native';

import { t } from '@/lib/i18n';
import { useApp } from '@/state/app';

import { useColors } from './ui';

const pad = (n: number) => String(n).padStart(2, '0');

export function deviceToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function DateTimeFields({ date, time, onDate, onTime }: {
  date: string;
  time: string;
  onDate: (d: string) => void;
  onTime: (t: string) => void;
}) {
  const { prefs } = useApp();
  const s = t(prefs.lang);
  const c = useColors();
  const input = { borderWidth: 1, borderColor: c.cardBorder, borderRadius: 12, padding: 12, fontSize: 16, color: c.text, backgroundColor: c.card } as const;
  return (
    <View style={{ gap: 10 }}>
      <TextInput value={date} onChangeText={onDate} placeholder={s.dateFormat} placeholderTextColor={c.textMuted} autoCorrect={false} style={input} />
      <TextInput value={time} onChangeText={onTime} placeholder={s.timeOptional} placeholderTextColor={c.textMuted} autoCorrect={false} style={input} />
    </View>
  );
}
