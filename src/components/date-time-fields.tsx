// The date (and, when known, the time) of a birth, a death, a wedding or an
// event still to come, with the iOS
// pickers: a compact date button that opens the calendar, and a time button
// once the reader says they know the time. Values stay plain strings,
// "YYYY-MM-DD" and "HH:MM" ('' = time unknown), read from the picked Date's
// own fields: a picked day is a calendar date, never an instant to convert.
// The web preview types them instead (date-time-fields.web.tsx).
import DateTimePicker from '@react-native-community/datetimepicker';
import { View } from 'react-native';

import { t } from '@/lib/i18n';
import { useApp } from '@/state/app';

import { Chip, T, useColors } from './ui';

const pad = (n: number) => String(n).padStart(2, '0');
// The range /api/v1/tithi-of answers. Future dates too: a wedding or an event
// still to come is kept by its tithi like a birth or a death.
const MIN_DATE = new Date(1900, 0, 1);
const MAX_DATE = new Date(2100, 11, 31);

/** Today's date on this device, the picker's first value. */
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
  // Gujarati month names with the Latin digits the rest of the app uses.
  const locale = prefs.lang === 'gu' ? 'gu_IN@numbers=latn' : 'en_IN';
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = (time || '12:00').split(':').map(Number);
  const row = { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 } as const;

  return (
    <View style={{ gap: 10 }}>
      <View style={row}>
        <T>{s.dateLabel}</T>
        <DateTimePicker
          mode="date"
          display="compact"
          value={new Date(y, m - 1, d, 12)}
          minimumDate={MIN_DATE}
          maximumDate={MAX_DATE}
          locale={locale}
          accentColor={c.brand}
          onValueChange={(_, v) => onDate(`${v.getFullYear()}-${pad(v.getMonth() + 1)}-${pad(v.getDate())}`)}
        />
      </View>
      <View style={row}>
        <Chip label={s.knowTime} selected={!!time} onPress={() => onTime(time ? '' : '12:00')} />
        {time ? (
          <DateTimePicker
            mode="time"
            display="compact"
            value={new Date(2000, 0, 1, hh, mm)}
            locale={locale}
            accentColor={c.brand}
            onValueChange={(_, v) => onTime(`${pad(v.getHours())}:${pad(v.getMinutes())}`)}
          />
        ) : null}
      </View>
    </View>
  );
}
