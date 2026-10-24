// "Count down on the Lock Screen": starts the Countdown Live Activity for a
// Parana, a Sankashti moonrise or Rahu Kaal, when that moment is within eight
// hours (offerCountdown). One countdown at a time: starting one ends the rest.
import { useState } from 'react';
import { Platform, Pressable } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { WIDGETS } from '@/lib/features';
import { success } from '@/lib/haptics';
import { t } from '@/lib/i18n';
import { askAfterSuccess } from '@/lib/review';
import { offerCountdown, type CountdownProps } from '@/lib/widget-feed';
import { useApp } from '@/state/app';
import CountdownActivity from '@/widgets/countdown-activity';

import { Button, T, useColors } from './ui';

export function LiveCountdownButton({ countdown, nowMs, kind = 'primary' }: {
  countdown: CountdownProps | null; nowMs: number;
  /** onColor: a white outlined pill, for the coloured card on Today. */
  kind?: 'primary' | 'quiet' | 'onColor';
}) {
  const s = t(useApp().prefs.lang);
  const c = useColors();
  const [started, setStarted] = useState(false);
  if (Platform.OS !== 'ios' || !WIDGETS || !offerCountdown(countdown, nowMs)) return null;
  if (started) return <T kind="small" color={kind === 'onColor' ? '#FFFFFF' : c.good}>{s.liveShowing}</T>;

  const start = () => {
    try {
      for (const a of CountdownActivity.getInstances()) a.end('immediate').catch(() => {});
      CountdownActivity.start(countdown, countdown.url, new Date(countdown.endMs));
      setStarted(true);
      success();
      askAfterSuccess();
    } catch { /* Live Activities switched off in Settings */ }
  };
  if (kind === 'onColor') {
    return (
      <Pressable accessibilityRole="button" onPress={start} hitSlop={6}
        style={({ pressed }) => ({ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 11, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)', opacity: pressed ? 0.7 : 1 })}>
        <SymbolView name="bell" size={13} tintColor="#FFFFFF" />
        <T style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '600' }}>{s.trackLive}</T>
      </Pressable>
    );
  }
  return <Button kind={kind} label={s.trackLive} onPress={start} />;
}
