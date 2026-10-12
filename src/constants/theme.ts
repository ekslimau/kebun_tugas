/** Design tokens from the "INCEPTION-UI-UX - Kebun Tugas" Figma file (Style Guide page). */

export const C = {
  ink: '#2a2358',
  inkDeep: '#15113a',
  purple: '#6b4eff',
  purpleDark: '#4a33c9',
  sun: '#ffc53d',
  coral: '#ff7a66',
  coralDark: '#d9564a',
  mint: '#34d3a5',
  mintDark: '#1fa67f',
  sky: '#62c6ff',
  dim: '#5b5584',
  cream: '#fff8ee',
  line: '#eadfcb',
  white: '#ffffff',
  lavender: '#e5deff',
  mintSoft: '#d6f6ea',
  coralSoft: '#ffe0da',
  skySoft: '#d9f0ff',
  free: '#fff1c9',
  warn: '#8a2e14',
} as const;

/** Course marker colours, in the order the design shows them. */
export const COURSE_COLORS = [C.sky, C.mint, C.coral, C.sun, C.purple];

export const F = {
  /** Fredoka SemiBold — H1/H2/H3 */
  display: 'Fredoka_600SemiBold',
  /** Nunito ExtraBold — body */
  body: 'Nunito_800ExtraBold',
  /** Nunito Bold — caption / labels */
  caption: 'Nunito_700Bold',
  /** Nunito Black — buttons */
  button: 'Nunito_900Black',
} as const;

export const FS = { h1: 28, h2: 21, h3: 18, body: 15, caption: 13, button: 17 } as const;

export const R = {
  card: 22,
  big: 28,
  banner: 26,
  pill: 99,
  nav: 34,
  chip: 23,
  chipSm: 20,
  tile: 18,
  icon: 22,
} as const;

export const Spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 } as const;

export const TapTarget = 44;
