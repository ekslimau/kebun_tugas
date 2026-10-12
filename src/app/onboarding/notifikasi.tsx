import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter, type Href } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { StepHeader } from '@/components/onboarding';
import { Button, Screen, Scroll, Title } from '@/components/ui';
import { C, F, FS } from '@/constants/theme';
import { useStore } from '@/db';
import { ensurePermission, rescheduleAll } from '@/lib/notifications';

const POINTS = [
  { text: 'Deadline tugas (H-3, H-1)', bg: C.mintSoft },
  { text: 'Kuliah, 1 jam sebelum mulai', bg: C.skySoft },
  { text: 'Tugas yang terlewat', bg: C.coralSoft },
];

export default function OnboardingNotifikasi() {
  const { setSetting, courses, tasks } = useStore();
  const router = useRouter();

  const finish = async (granted: boolean) => {
    await setSetting('onboarded', '1');
    if (granted) {
      await setSetting('notify_3d', '1');
      await setSetting('notify_1d', '1');
      await setSetting('notify_3h', '1');
      await setSetting('notify_class', '1');
      await rescheduleAll(courses, tasks.filter((t) => !t.done));
    }
    router.replace('/beranda' as Href);
  };

  const allow = async () => {
    const granted = await ensurePermission();
    await finish(granted);
  };

  return (
    <Screen>
      <Scroll>
        <StepHeader step={3} />

        <View style={styles.hero}>
          <View style={styles.bellCircle}>
            <Ionicons name="notifications" size={72} color={C.purple} />
          </View>
        </View>

        <Title center>Biar nggak ada yang ketinggalan</Title>

        {POINTS.map((p) => (
          <View key={p.text} style={styles.point}>
            <View style={[styles.check, { backgroundColor: p.bg }]}>
              <Ionicons name="checkmark" size={18} color={C.ink} />
            </View>
            <Text style={styles.pointText}>{p.text}</Text>
          </View>
        ))}

        <Text style={styles.note}>
          Setelah ini, HP kamu akan menampilkan permintaan izin notifikasi. Pilih {'"Izinkan"'} ya.
        </Text>
      </Scroll>

      <View style={styles.footer}>
        <Button label="Izinkan notifikasi" onPress={allow} />
        <Button label="Nanti saja" variant="ghost" onPress={() => router.push('/onboarding/peringatan' as Href)} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center' },
  bellCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: C.sun,
    alignItems: 'center',
    justifyContent: 'center',
  },
  point: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  check: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  pointText: { flex: 1, fontFamily: F.body, fontSize: FS.body, color: C.ink },
  note: { fontFamily: F.caption, fontSize: FS.caption, color: C.dim, textAlign: 'center' },
  footer: { paddingHorizontal: 20, paddingBottom: 24, gap: 8 },
});
