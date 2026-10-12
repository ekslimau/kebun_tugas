import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';

import { Chip, Label, Screen, Scroll, Title, shadow } from '@/components/ui';
import { C, F, FS, R } from '@/constants/theme';
import { useStore } from '@/db';

export default function Atur() {
  const { profile, saveProfile, reset, courses } = useStore();
  const router = useRouter();
  const [name, setName] = useState(profile.name);
  const [semester, setSemester] = useState(profile.semester);

  const commit = () => {
    if (name.trim() !== profile.name || semester !== profile.semester) {
      saveProfile(name.trim(), semester);
    }
  };

  return (
    <Screen>
      <Scroll>
        <Title>Atur</Title>

        <View style={styles.card}>
          <Label>Nama panggilan</Label>
          <TextInput
            value={name}
            onChangeText={setName}
            onBlur={commit}
            placeholder="Contoh: Rani"
            placeholderTextColor={C.dim}
            style={styles.input}
          />
          <Label>Semester</Label>
          <View style={styles.chips}>
            {Array.from({ length: 8 }, (_, i) => i + 1).map((n) => (
              <Chip
                key={n}
                selected={semester === n}
                onPress={() => {
                  setSemester(n);
                  saveProfile(name.trim(), n);
                }}
                style={styles.chip}>
                {n}
              </Chip>
            ))}
          </View>
        </View>

        <NavRow
          icon="calendar"
          label="Jadwal kuliah semesteran"
          hint={courses.length > 0 ? `${courses.length} mata kuliah` : 'Belum ada jadwal'}
          onPress={() => router.push('/matkul' as Href)}
        />
        <NavRow
          icon="notifications"
          label="Pengaturan notifikasi"
          onPress={() => router.push('/atur/notifikasi' as Href)}
        />

        <Pressable
          onPress={() =>
            Alert.alert('Hapus semua data', 'Semua tugas dan mata kuliah akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.', [
              { text: 'Batal', style: 'cancel' },
              { text: 'Hapus', style: 'destructive', onPress: () => reset() },
            ])
          }
          style={styles.reset}>
          <Text style={styles.resetText}>Hapus semua data</Text>
        </Pressable>
      </Scroll>
    </Screen>
  );
}

function NavRow({
  icon,
  label,
  hint,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  hint?: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.navRow, shadow(C.line, 4)]}>
      <View style={styles.navIcon}>
        <Ionicons name={icon} size={20} color={C.purple} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.navLabel}>{label}</Text>
        {hint ? <Text style={styles.navHint}>{hint}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={20} color={C.dim} />
    </Pressable>
  );
}

const styles = {
  card: { backgroundColor: C.white, borderRadius: R.card, padding: 16, gap: 8, ...shadow(C.line, 4) },
  input: {
    minHeight: 54,
    borderWidth: 2,
    borderColor: C.purple,
    borderRadius: R.chipSm,
    paddingHorizontal: 16,
    fontFamily: F.body,
    fontSize: FS.body,
    color: C.ink,
  },
  chips: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: 8 },
  chip: { width: 56 },
  navRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    backgroundColor: C.white,
    borderRadius: R.card,
    padding: 14,
  },
  navIcon: { backgroundColor: C.lavender, borderRadius: 14, padding: 9 },
  navLabel: { fontFamily: F.body, fontSize: FS.body, color: C.ink },
  navHint: { fontFamily: F.caption, fontSize: FS.caption, color: C.dim },
  reset: { alignItems: 'center' as const, paddingVertical: 12 },
  resetText: { fontFamily: F.caption, fontSize: FS.caption, color: C.coral },
};
