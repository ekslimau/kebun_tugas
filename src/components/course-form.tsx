import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { BackButton, Button, Chip, Label, Screen, Title } from '@/components/ui';
import { C, COURSE_COLORS, F, FS, R } from '@/constants/theme';
import { useStore, type Course } from '@/db';
import { DAYS, WEEK_ORDER, fmtTime } from '@/lib/date';

export function CourseForm({ initial }: { initial?: Course }) {
  const { saveCourse, deleteCourse } = useStore();
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? '');
  const [lecturer, setLecturer] = useState(initial?.lecturer ?? '');
  const [day, setDay] = useState(initial?.day ?? 1);
  const [start, setStart] = useState<number | null>(initial?.start ?? null);
  const [end, setEnd] = useState<number | null>(initial?.end ?? null);
  const [color, setColor] = useState(initial?.color ?? COURSE_COLORS[0]);
  const [picker, setPicker] = useState<'start' | 'end' | null>(null);

  const valid = name.trim().length > 0 && start !== null && end !== null && end > start;

  const submit = async () => {
    if (!valid) return;
    await saveCourse({ name: name.trim(), lecturer: lecturer.trim(), day, start: start!, end: end!, color }, initial?.id);
    router.back();
  };

  const remove = () =>
    Alert.alert('Hapus mata kuliah', `Hapus "${name}"? Tugas yang terkait tetap ada, tanpa mata kuliah.`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          if (initial) await deleteCourse(initial.id);
          router.back();
        },
      },
    ]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <BackButton />
        <Title>{initial ? 'Edit mata kuliah' : 'Tambah mata kuliah'}</Title>

        <View style={{ gap: 8 }}>
          <Label>Nama mata kuliah</Label>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Contoh: Basis Data"
            placeholderTextColor={C.dim}
            style={styles.input}
          />
        </View>

        <View style={{ gap: 8 }}>
          <Label>Nama dosen</Label>
          <TextInput
            value={lecturer}
            onChangeText={setLecturer}
            placeholder="Contoh: Pak Budi, M.Kom"
            placeholderTextColor={C.dim}
            style={styles.input}
          />
        </View>

        <View style={{ gap: 8 }}>
          <Label>Hari kuliah</Label>
          <View style={styles.wrap}>
            {WEEK_ORDER.slice(0, 6).map((d) => (
              <Chip key={d} selected={day === d} onPress={() => setDay(d)}>
                {DAYS[d]}
              </Chip>
            ))}
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1, gap: 8 }}>
            <Label>Jam mulai</Label>
            <Button
              variant="ghost"
              label={start === null ? '--.--' : fmtTime(start)}
              onPress={() => setPicker(picker === 'start' ? null : 'start')}
              style={styles.timeButton}
            />
          </View>
          <View style={{ flex: 1, gap: 8 }}>
            <Label>Jam selesai</Label>
            <Button
              variant="ghost"
              label={end === null ? '--.--' : fmtTime(end)}
              onPress={() => setPicker(picker === 'end' ? null : 'end')}
              style={styles.timeButton}
            />
          </View>
        </View>

        {picker ? (
          <View style={styles.wrap}>
            {Array.from({ length: 14 }, (_, i) => 7 * 60 + i * 60).map((m) => (
              <Chip
                key={m}
                selected={(picker === 'start' ? start : end) === m}
                onPress={() => {
                  if (picker === 'start') setStart(m);
                  else setEnd(m);
                  setPicker(null);
                }}>
                {fmtTime(m)}
              </Chip>
            ))}
          </View>
        ) : null}

        <View style={{ gap: 8 }}>
          <Label>Warna penanda</Label>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {COURSE_COLORS.map((c) => (
              <Pressable
                key={c}
                accessibilityLabel={`Warna ${c}`}
                onPress={() => setColor(c)}
                style={[styles.swatch, { backgroundColor: c }, color === c && styles.swatchOn]}
              />
            ))}
          </View>
        </View>

        {initial ? <Button label="Hapus mata kuliah" variant="danger" onPress={remove} /> : null}
      </ScrollView>

      <View style={styles.footer}>
        <Button label={initial ? 'Simpan perubahan' : 'Simpan mata kuliah'} disabled={!valid} onPress={submit} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: 16, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 },
  input: {
    minHeight: 54,
    borderWidth: 2,
    borderColor: C.purple,
    borderRadius: R.chipSm,
    backgroundColor: C.white,
    paddingHorizontal: 16,
    fontFamily: F.body,
    fontSize: FS.body,
    color: C.ink,
  },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeButton: { borderWidth: 2, borderColor: C.purple, backgroundColor: C.white, borderRadius: R.chipSm, minHeight: 54 },
  swatch: { width: 40, height: 40, borderRadius: 20 },
  swatchOn: { borderWidth: 3, borderColor: C.ink },
  footer: { paddingHorizontal: 20, paddingBottom: 24 },
});
