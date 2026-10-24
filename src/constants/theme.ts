// One warm system (docs/design/ds-base.css, the approved mocks): warm paper,
// one saffron accent, sage for a good time, sand for in-between, brick for
// what to avoid. Every text colour reads 4.5:1 or more on the surface it sits
// on (measured in docs/design, "Pass 3"). Dark mode keeps the hues on a warm
// near-black; there, filled accent buttons carry dark text (white reads 2.6:1).

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#2A201A',
    textSecondary: '#6A5D54',
    textMuted: '#75675E',
    background: '#FAF6F0',
    card: '#FFFFFF',
    cardBorder: '#ECE3D8',
    line: '#ECE3D8',
    backgroundElement: '#F4EEE6',
    backgroundSelected: '#F9EEE4',
    brand: '#AC5118',
    brandStrong: '#8A3F10',
    brandSoft: '#F9EEE4',
    onBrand: '#FFFFFF',
    value: '#2A201A',
    good: '#44735A',
    goodBg: '#EAF1EB',
    bad: '#A9473E',
    badBg: '#F6E6E2',
    neutral: '#80694A',
    neutralBg: '#F3EBDD',
    fair: '#D7C6A8',
    goodBorder: '#C9DCCD',
    badBorder: '#E9C9C3',
    neutralBorder: '#E5D7BF',
    moonLit: '#FBF1DC',
    moonDark: '#D6C8B2',
    moonRim: '#CBBBA2',
    shadow: 'rgba(60,35,15,0.10)',
    scrim: 'rgba(30,18,10,0.28)',
  },
  dark: {
    text: '#F3EADF',
    textSecondary: '#BDAE9F',
    textMuted: '#9A8B7E',
    background: '#15100C',
    card: '#201913',
    cardBorder: '#30261E',
    line: '#30261E',
    backgroundElement: '#2A211A',
    backgroundSelected: '#3A2618',
    brand: '#E6894A',
    brandStrong: '#F0A877',
    brandSoft: '#3A2618',
    onBrand: '#15100C',
    value: '#F3EADF',
    good: '#7DB592',
    goodBg: '#1E2E23',
    bad: '#E0877C',
    badBg: '#3A211D',
    neutral: '#CDB58A',
    neutralBg: '#33291E',
    fair: '#6A5A43',
    goodBorder: '#2E4A37',
    badBorder: '#5A2E28',
    neutralBorder: '#4A3D2A',
    moonLit: '#EFE1C4',
    moonDark: '#3A2F27',
    moonRim: '#4A3D33',
    shadow: 'rgba(0,0,0,0.45)',
    scrim: 'rgba(0,0,0,0.45)',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/**
 * The one coloured card on Today (its two gradient stops): sage for a good
 * time, brick for Rahu Kaal, sand for the rest, plum night for a festival.
 * White text reads 4.5:1 or more on every stop (docs/design/11-today-v5).
 */
export const Bands = {
  light: { good: ['#3F7458', '#2F5D45'], rahu: ['#A54A40', '#8A3A31'], fair: ['#86694A', '#6E5538'], fest: ['#46263F', '#2C1A2E'] },
  dark: { good: ['#2E5842', '#23463A'], rahu: ['#7A352E', '#5E2823'], fair: ['#5E4A34', '#4A3A28'], fest: ['#3A2034', '#241626'] },
} as const;

export const Fonts = Platform.select({
  ios: { sans: 'system-ui', serif: 'ui-serif', rounded: 'ui-rounded', mono: 'ui-monospace' },
  default: { sans: 'normal', serif: 'serif', rounded: 'normal', mono: 'monospace' },
  web: { sans: 'var(--font-display)', serif: 'var(--font-serif)', rounded: 'var(--font-rounded)', mono: 'var(--font-mono)' },
});

/** Titles: a Gujarati serif, and Source Serif for English (loaded in app/_layout.tsx). */
export const TitleFont = { gu: 'NotoSerifGujarati_600SemiBold', en: 'SourceSerif4_600SemiBold' } as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = { card: 22, tile: 12, chip: 999, button: 25 } as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 640;
