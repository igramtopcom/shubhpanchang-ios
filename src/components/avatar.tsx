// A person's initial in a warm circle, in place of a photo.
import { View } from 'react-native';

import type { FamilyDate } from '@/lib/types';

import { T, useColors } from './ui';

/** Gujarati vowel signs, anusvara, nukta and virama, and Latin accents: marks that belong to the letter before. */
const MARKS = /^.[ઁ-ઃ઼ા-્̀-ͯ]*/u;

export function Avatar({ name, kind, size = 44 }: { name: string; kind: FamilyDate['kind']; size?: number }) {
  const c = useColors();
  const bg = kind === 'shraddh' ? c.backgroundElement : kind === 'anniversary' ? c.goodBg : c.brandSoft;
  const fg = kind === 'shraddh' ? c.textSecondary : kind === 'anniversary' ? c.good : c.brand;
  // The first letter with its vowel signs (a Gujarati akshar such as "બા"), not a lone code point.
  const first = MARKS.exec(name.trim())?.[0] ?? '?';
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <T style={{ fontSize: size * 0.38, fontWeight: '600', color: fg }}>{first.toUpperCase()}</T>
    </View>
  );
}
