import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter, type Href } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { C, R } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ITEMS = [
  { route: '/beranda', icon: 'home', label: 'Beranda' },
  { route: '/kalender', icon: 'calendar', label: 'Kalender' },
  { route: '/tugas', icon: 'list', label: 'Tugas' },
  { route: '/atur', icon: 'options', label: 'Atur' },
] as const;

/** Height above the safe area: paddingTop 6 + bar (plus button 56 + paddingVertical 20). */
export const NAV_HEIGHT = 82;

export function BottomNav({ active }: { active: string }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(18, insets.bottom + 8) }]}>
      <View style={styles.bar}>
        {ITEMS.slice(0, 2).map((item) => (
          <NavItem key={item.route} {...item} active={active === item.route} onPress={() => router.replace(item.route as Href)} />
        ))}

        <Pressable
          accessibilityLabel="Tanam tugas baru"
          onPress={() => router.push('/tugas/baru' as Href)}
          style={({ pressed }) => [styles.plus, { boxShadow: `0 4px 0 ${C.coralDark}` }, pressed && styles.pressed]}>
          <Ionicons name="add" size={26} color={C.white} />
        </Pressable>

        {ITEMS.slice(2).map((item) => (
          <NavItem key={item.route} {...item} active={active === item.route} onPress={() => router.replace(item.route as Href)} />
        ))}
      </View>
    </View>
  );
}

function NavItem({
  icon,
  label,
  active,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityLabel={label} onPress={onPress} style={[styles.item, active && styles.itemActive]}>
      <Ionicons name={icon} size={24} color={active ? C.ink : C.white} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 18 },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.ink,
    borderRadius: R.nav,
    paddingHorizontal: 12,
    paddingVertical: 10,
    // Inline copy of shadow(C.inkDeep, 8) — avoids a ui.tsx <-> bottom-nav.tsx import cycle.
    boxShadow: `0 8px 0 ${C.inkDeep}`,
  },
  item: { padding: 12, borderRadius: R.icon },
  itemActive: { backgroundColor: C.sun },
  plus: {
    padding: 15,
    borderRadius: 30,
    backgroundColor: C.coral,
  },
  pressed: { transform: [{ translateY: 2 }] },
});
