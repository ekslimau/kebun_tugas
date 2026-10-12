import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BackButton, Button, Label, Screen, Scroll, Title, ToggleRow } from '@/components/ui';
import { C, F, FS } from '@/constants/theme';
import { useStore } from '@/db';
import { ensurePermission, openSystemSettings, rescheduleAll } from '@/lib/notifications';

const TOGGLES = [
  { key: 'notify_3d', label: '3 hari sebelum deadline' },
  { key: 'notify_1d', label: '1 hari sebelum deadline' },
  { key: 'notify_3h', label: '3 jam sebelum deadline' },
  { key: 'notify_class', label: 'Kuliah, 1 jam sebelum mulai' },
  { key: 'notify_late', label: 'Tugas yang terlewat' },
] as const;

export default function PengaturanNotifikasi() {
  const { settings, setSetting, courses, tasks } = useStore();
  const [denied, setDenied] = useState(false);

  const onToggle = async (key: string, next: boolean) => {
    await setSetting(key, next ? '1' : '0');
    if (next) {
      const granted = await ensurePermission();
      setDenied(!granted);
      if (!granted) return;
    }
    const merged = { ...settings, [key]: next ? '1' : '0' };
    const active = tasks.filter(
      (t) =>
        !t.done &&
        ((merged.notify_3d === '1' && t.remind_3d) ||
          (merged.notify_1d === '1' && t.remind_1d) ||
          (merged.notify_3h === '1' && t.remind_3h))
    );
    await rescheduleAll(merged.notify_class === '1' ? courses : [], active);
  };

  return (
    <Screen>
      <Scroll>
        <BackButton />
        <Title>Pengaturan notifikasi</Title>
        <Label>Aku bakal ingetin kamu tepat waktu. Atur seberapa sering di sini.</Label>

        <View style={styles.card}>
          {TOGGLES.map((t) => (
            <ToggleRow
              key={t.key}
              label={t.label}
              value={settings[t.key] === '1'}
              onChange={(next) => onToggle(t.key, next)}
            />
          ))}
        </View>

        {settings.notify_late === '1' ? (
          <View style={styles.note}>
            <Text style={styles.noteText}>
              Pengingat tugas terlewat muncul saat kamu membuka aplikasi, jadi tetap sampai walau HP sempat mati.
            </Text>
          </View>
        ) : null}

        {denied ? (
          <>
            <Label>Izin notifikasi dimatikan di pengaturan HP.</Label>
            <Button label="Buka pengaturan HP" variant="danger" onPress={openSystemSettings} />
          </>
        ) : null}
      </Scroll>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: C.white, borderRadius: 24, padding: 12, gap: 10 },
  note: { backgroundColor: C.skySoft, borderRadius: 16, padding: 12 },
  noteText: { fontFamily: F.caption, fontSize: FS.caption, color: C.ink },
});
