import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter, type Href } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Label, Screen, Scroll, Title } from '@/components/ui';
import { Icon } from '@/Asset';
import { C, F, FS } from '@/constants/theme';
import { useStore } from '@/db';

const MISSING = [
  'Pengingat deadline tugas',
  'Pengingat jadwal kuliah 1 jam sebelum mulai',
  'Peringatan tugas yang terlewat',
];

export default function OnboardingPeringatan() {
  const { setSetting } = useStore();
  const router = useRouter();

  // Same as choosing "Nanti saja" on the notification step: continue without reminders.
  const skip = async () => {
    await setSetting('onboarded', '1');
    router.replace('/beranda' as Href);
  };

  return (
    <Screen>
      <Scroll>
        <View style={styles.hero}>
          <Icon name="bell-off" size={44} color={C.dim} />
        </View>

        <Title center>App tidak bisa ingatkan kamu</Title>
        <Label>Kalau notifikasi mati, ini yang nggak akan kamu dapat:</Label>

        {MISSING.map((text) => (
          <View key={text} style={styles.row}>
            <View style={styles.icon}>
              <Ionicons name="close" size={18} color={C.coral} />
            </View>
            <Text style={styles.rowText}>{text}</Text>
          </View>
        ))}
      </Scroll>

      <View style={styles.footer}>
        <Button label="Aktifkan notifikasi" onPress={() => router.back()} />
        <Button label="Lanjut tanpa notifikasi" variant="ghost" onPress={skip} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: C.coralSoft,
    alignSelf: 'center',
  },
  emoji: { fontSize: 64 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.coralSoft,
  },
  rowText: { flex: 1, fontFamily: F.body, fontSize: FS.body, color: C.ink },
  footer: { paddingHorizontal: 20, paddingBottom: 24, gap: 8 },
});
