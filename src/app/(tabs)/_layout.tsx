import { Slot, usePathname } from 'expo-router';
import { View } from 'react-native';

import { BottomNav } from '@/components/bottom-nav';
import { C } from '@/constants/theme';

export default function TabsLayout() {
  const pathname = usePathname();
  return (
    <View style={{ flex: 1, backgroundColor: C.cream }}>
      <Slot />
      <BottomNav active={pathname} />
    </View>
  );
}
