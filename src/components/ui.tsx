import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { C, F, FS, R, Spacing, TapTarget } from '@/constants/theme';

/** Hard offset shadow, the style the whole design uses. */
export const shadow = (color: string, y = 3): ViewStyle => ({ boxShadow: `0 ${y}px 0 ${color}` });

export function Screen({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.screen, style]}>
      {children}
    </SafeAreaView>
  );
}

export function Title({ children, size = 'h1', center }: { children: ReactNode; size?: 'h1' | 'h2' | 'h3'; center?: boolean }) {
  const fontSize = size === 'h1' ? FS.h1 : size === 'h2' ? FS.h2 : FS.h3;
  return <Text style={[styles.display, { fontSize }, center && styles.center]}>{children}</Text>;
}

export function Label({ children, style }: { children: ReactNode; style?: StyleProp<import('react-native').TextStyle> }) {
  return <Text style={[styles.caption, style]}>{children}</Text>;
}

export function Body({ children, style }: { children: ReactNode; style?: StyleProp<import('react-native').TextStyle> }) {
  return <Text style={[styles.body, style]}>{children}</Text>;
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Pill({ children, bg = C.white, color = C.ink }: { children: ReactNode; bg?: string; color?: string }) {
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={[styles.caption, { color }]}>{children}</Text>
    </View>
  );
}

export function Chip({
  children,
  selected,
  onPress,
  style,
}: {
  children: ReactNode;
  selected?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        selected && { backgroundColor: C.purple, borderColor: C.purple },
        style,
      ]}>
      <Text style={[styles.chipText, selected && { color: C.white }]}>{children}</Text>
    </Pressable>
  );
}

export function Toggle({ value, onChange }: { value: boolean; onChange: (next: boolean) => void }) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      onPress={() => onChange(!value)}
      style={[styles.toggleTrack, { backgroundColor: value ? C.mint : C.line }]}>
      <View style={[styles.toggleKnob, value ? styles.toggleKnobOn : styles.toggleKnobOff]} />
    </Pressable>
  );
}

export function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (next: boolean) => void }) {
  return (
    <View style={[styles.toggleRow, shadow(C.line)]}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Toggle value={value} onChange={onChange} />
    </View>
  );
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  style,
}: {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'mint' | 'ghost' | 'danger';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const skin =
    variant === 'primary'
      ? { bg: C.purple, shadowColor: C.purpleDark, color: C.white }
      : variant === 'mint'
        ? { bg: C.mint, shadowColor: C.mintDark, color: C.ink }
        : variant === 'danger'
          ? { bg: C.coralSoft, shadowColor: 'transparent', color: C.coral }
          : { bg: 'transparent', shadowColor: 'transparent', color: C.dim };
  const flat = variant === 'ghost' || variant === 'danger';
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: skin.bg },
        !flat && shadow(skin.shadowColor, 5),
        disabled && { opacity: 0.45 },
        pressed && !disabled && !flat && { transform: [{ translateY: 2 }], boxShadow: `0 3px 0 ${skin.shadowColor}` },
        style,
      ]}>
      <Text style={[styles.buttonText, { color: skin.color }]}>{label}</Text>
    </Pressable>
  );
}

/** Read-only field that opens a picker/screen, e.g. the date and time fields. */
export function FieldButton({
  value,
  placeholder,
  onPress,
  icon,
}: {
  value?: string;
  placeholder: string;
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  const empty = !value;
  return (
    <Pressable onPress={onPress} style={[styles.field, empty && { borderColor: C.purple }]}>
      <Text style={[styles.fieldText, empty && { color: C.dim }]} numberOfLines={1}>
        {empty ? placeholder : value}
      </Text>
      {icon ? <Ionicons name={icon} size={18} color={C.dim} /> : null}
    </Pressable>
  );
}

export function BackButton({ onPress }: { onPress?: () => void }) {
  const router = useRouter();
  return (
    <Pressable
      accessibilityLabel="Kembali"
      onPress={onPress ?? (() => (router.canGoBack() ? router.back() : router.replace('/')))} 
      style={[styles.iconButton, shadow(C.line)]}>
      <Ionicons name="chevron-back" size={24} color={C.ink} />
    </Pressable>
  );
}

export function IconButton({
  name,
  onPress,
  bg = C.white,
  color = C.ink,
  label,
}: {
  name: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  bg?: string;
  color?: string;
  label?: string;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.iconButton, { backgroundColor: bg }, bg === C.white && shadow(C.line)]}>
      <Ionicons name={name} size={24} color={color} />
    </Pressable>
  );
}

export function Header({ title, right }: { title?: string; right?: ReactNode }) {
  return (
    <View style={styles.header}>
      <BackButton />
      {title ? <Title size="h1">{title}</Title> : null}
      <View style={{ flex: 1 }} />
      {right}
    </View>
  );
}

export function Divider() {
  return <View style={styles.divider} />;
}

export function Scroll({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <ScrollView
      style={style}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  );
}

export function Dot({ color }: { color: string }) {
  return <View style={[styles.dot, { backgroundColor: color }]} />;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.cream },
  scrollContent: { gap: Spacing.md, paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxl },
  display: { fontFamily: F.display, color: C.ink, lineHeight: FS.h1 * 1.15 },
  center: { textAlign: 'center' },
  body: { fontFamily: F.body, fontSize: FS.body, color: C.ink },
  caption: { fontFamily: F.caption, fontSize: FS.caption, color: C.dim },
  card: {
    backgroundColor: C.white,
    borderRadius: R.card,
    padding: 14,
    ...shadow(C.line, 4),
  },
  pill: { borderRadius: R.pill, paddingHorizontal: 11, paddingVertical: 4, alignSelf: 'flex-start' },
  chip: {
    borderWidth: 2,
    borderColor: C.line,
    backgroundColor: C.white,
    borderRadius: R.chip,
    paddingHorizontal: 18,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: TapTarget,
  },
  chipText: { fontFamily: F.body, fontSize: FS.body, color: C.ink },
  toggleTrack: { width: 50, height: 30, borderRadius: 15, justifyContent: 'center' },
  toggleKnob: { width: 24, height: 24, borderRadius: 12, backgroundColor: C.white, position: 'absolute' },
  toggleKnobOn: { right: 3 },
  toggleKnobOff: { left: 3 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: R.chipSm,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  toggleLabel: { flex: 1, fontFamily: F.body, fontSize: FS.body, color: C.ink },
  button: {
    borderRadius: R.big,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { fontFamily: F.button, fontSize: FS.button },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: 54,
    borderWidth: 2,
    borderColor: C.line,
    backgroundColor: C.white,
    borderRadius: R.chipSm,
    paddingHorizontal: 16,
  },
  fieldText: { flex: 1, fontFamily: F.body, fontSize: FS.body, color: C.ink },
  iconButton: {
    width: TapTarget,
    height: TapTarget,
    borderRadius: R.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  divider: { height: 1, backgroundColor: C.line },
  dot: { width: 10, height: 10, borderRadius: 5 },
});
