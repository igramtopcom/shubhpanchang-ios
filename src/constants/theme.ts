// The website's warm system (src/layouts/Base.astro tokens): parchment ground,
// saffron brand, navy for panchang values, green for shubh, red for Rahu /
// ashubh. No cool greys. Dark mode keeps the same hues on a warm near-black.

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#3E2723',
    textSecondary: '#6D4C41',
    // #8D6E63 read 4.39:1 on the parchment ground; this one passes 4.5:1 on every light surface.
    textMuted: '#795548',
    background: '#FFF8F0',
    card: '#FFFFFF',
    cardBorder: '#FFE0B2',
    backgroundElement: '#FBEEE2',
    backgroundSelected: '#FFCCBC',
    brand: '#C0390E',
    brandStrong: '#8D1F00',
    onBrand: '#FFFFFF',
    value: '#1A237E',
    good: '#1B5E20',
    goodBg: '#E8F5E9',
    bad: '#C62828',
    badBg: '#FFEBEE',
    neutral: '#8D5A00',
    neutralBg: '#FFF3E0',
  },
  dark: {
    text: '#F5E9E0',
    textSecondary: '#D7C2B4',
    textMuted: '#A8968A',
    background: '#1B1411',
    card: '#251C18',
    cardBorder: '#3A2C25',
    backgroundElement: '#2E231E',
    backgroundSelected: '#4A2A1C',
    brand: '#FF8A65',
    brandStrong: '#FFAB91',
    onBrand: '#1B1411',
    value: '#9FA8DA',
    good: '#81C784',
    goodBg: '#1E2E20',
    bad: '#EF9A9A',
    badBg: '#3A1F1F',
    neutral: '#FFCC80',
    neutralBg: '#3A2A14',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: { sans: 'system-ui', serif: 'ui-serif', rounded: 'ui-rounded', mono: 'ui-monospace' },
  default: { sans: 'normal', serif: 'serif', rounded: 'normal', mono: 'monospace' },
  web: { sans: 'var(--font-display)', serif: 'var(--font-serif)', rounded: 'var(--font-rounded)', mono: 'var(--font-mono)' },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = { card: 14, chip: 999, button: 12 } as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 640;
