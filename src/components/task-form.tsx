import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { BackButton, Button, Chip, FieldButton, IconButton, Label, Pill, Screen, Title, ToggleRow } from '@/components/ui';
import { Plant, Tugi } from '@/Asset';
import { C, F, FS, R } from '@/constants/theme';
import { useStore, type TaskWithCourse } from '@/db';
import { DAYS_SHORT, addDays, fmtDateLong, fmtTime, startOfDay, startOfWeek } from '@/lib/date';
import { dueLabel, stageOf } from '@/lib/tasks';

const SIZES: { key: 'small' | 'medium' | 'large'; label: string }[] = [
  { key: 'small', label: 'Kecil' },
  { key: 'medium', label: 'Sedang' },
  { key: 'large', label: 'Besar' },
];

/** Leaf turns into a flower in ~800ms; the flower then holds for 600ms before leaving. */
const BLOOM_MS = 800;
const HOLD_MS = 600;

export function TaskForm({ initial }: { initial?: TaskWithCourse }) {
  const { courses, tasks, saveTask, deleteTask, setDone } = useStore();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [today] = useState(() => startOfDay(Date.now()));
  const [title, setTitle] = useState(initial?.title ?? '');
  const [courseId, setCourseId] = useState<number | null>(initial?.course_id ?? null);
  const [due, setDue] = useState(() => initial?.due ?? today);
  const [dueTime, setDueTime] = useState(initial?.due_time ?? 1439);
  const [size, setSize] = useState<'small' | 'medium' | 'large'>(initial?.size ?? 'medium');
  const [note, setNote] = useState(initial?.note ?? '');
  const [r3d, setR3d] = useState((initial?.remind_3d ?? 1) === 1);
  const [r1d, setR1d] = useState((initial?.remind_1d ?? 1) === 1);
  const [r3h, setR3h] = useState((initial?.remind_3h ?? 0) === 1);

  const [blooming, setBlooming] = useState(false);
  const leafScale = useSharedValue(1);
  const leafOpacity = useSharedValue(1);
  const flowerScale = useSharedValue(0);
  const leafStyle = useAnimatedStyle(() => ({
    transform: [{ scale: leafScale.value }],
    opacity: leafOpacity.value,
  }));
  const flowerStyle = useAnimatedStyle(() => ({ transform: [{ scale: flowerScale.value }] }));

  // Sen–Jum sesuai desain; Sabtu+Minggu muncul bila jadwal/tugas menyentuh akhir pekan.
  const weekStart = startOfWeek(due);
  const hasWeekend =
    courses.some((c) => c.day === 0 || c.day === 6) ||
    tasks.some((t) => [0, 6].includes(new Date(t.due).getDay()));
  const dayCount = hasWeekend ? 7 : 5;
  // weekStart = Senin; urutan Sen–Jum (± Sab, Min).
  const days = Array.from({ length: dayCount }, (_, i) => addDays(weekStart, i));

  const pickTime = () => {
    const base = new Date();
    base.setHours(Math.floor(dueTime / 60), dueTime % 60, 0, 0);
    DateTimePickerAndroid.open({
      mode: 'time',
      value: base,
      is24Hour: true,
      onChange: (_, picked) => {
        if (picked) setDueTime(picked.getHours() * 60 + picked.getMinutes());
      },
    });
  };

  const save = async (done?: boolean) => {
    if (title.trim().length === 0) return;
    const id = await saveTask(
      {
        title: title.trim(),
        course_id: courseId,
        due,
        due_time: dueTime,
        note: note.trim(),
        size,
        remind_3d: r3d ? 1 : 0,
        remind_1d: r1d ? 1 : 0,
        remind_3h: r3h ? 1 : 0,
      },
      initial?.id
    );
    if (done === true) await setDone(id, true);
    router.back();
  };

  /** Leaf blooms away, flower pops in, then the task is marked done. */
  const complete = () => {
    setBlooming(true);
    leafScale.set(withTiming(1.8, { duration: 260 }));
    leafOpacity.set(withDelay(180, withTiming(0, { duration: 200 })));
    flowerScale.set(
      withSequence(withDelay(300, withTiming(1.2, { duration: 320 })), withTiming(1, { duration: 180 }))
    );
    setTimeout(() => save(true), BLOOM_MS + HOLD_MS);
  };

  const remove = () =>
    Alert.alert('Hapus tugas', `Hapus "${title}"?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          if (initial) await deleteTask(initial.id);
          router.back();
        },
      },
    ]);

  const reminderText =
    [r3d && '3 hari', r1d && '1 hari', r3h && '3 jam'].filter(Boolean).join(' dan ') || 'Tidak ada';

  const fields = (
    <>
      <View style={styles.group}>
        <Label>Nama tugas</Label>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Contoh: Laporan Praktikum"
          placeholderTextColor={C.dim}
          style={styles.input}
        />
      </View>

      <View style={styles.group}>
        <Label>Mata kuliah (dari jadwalmu)</Label>
        <View style={styles.wrap}>
          {courses.map((c) => (
            <Chip key={c.id} selected={courseId === c.id} onPress={() => setCourseId(courseId === c.id ? null : c.id)}>
              {c.name}
            </Chip>
          ))}
          {courses.length === 0 ? <Label>Belum ada mata kuliah.</Label> : null}
        </View>
      </View>

      <View style={styles.group}>
        <Label>Deadline</Label>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.weekRow}>
          {days.map((d) => {
            const isDue = due === d;
            return (
              <Chip
                key={d}
                selected={isDue}
                onPress={() => setDue(d)}
                style={styles.dayChip}>
                <View style={styles.dayChipInner}>
                  <Text style={[styles.dayName, isDue && { color: C.white }]} numberOfLines={1}>
                    {DAYS_SHORT[new Date(d).getDay()]}
                  </Text>
                  <Text
                    style={[styles.dayNumber, isDue && { color: C.white }]}
                    numberOfLines={1}
                    maxFontSizeMultiplier={1.1}>
                    {new Date(d).getDate()}
                  </Text>
                </View>
              </Chip>
            );
          })}
        </ScrollView>
        <Label>Jam deadline</Label>
        <FieldButton value={fmtTime(dueTime)} placeholder="Pilih jam" icon="time" onPress={pickTime} />
      </View>

      <View style={styles.group}>
        <Label>Seberapa besar tugasnya?</Label>
        <View style={styles.wrap}>
          {SIZES.map((s) => (
            <Chip key={s.key} selected={size === s.key} onPress={() => setSize(s.key)} style={{ flex: 1 }}>
              {s.label}
            </Chip>
          ))}
        </View>
      </View>

      <View style={styles.group}>
        <Label>Catatan</Label>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Tulis catatan (opsional)"
          placeholderTextColor={C.dim}
          style={styles.input}
        />
      </View>

      <View style={styles.group}>
        <Label>Ingatkan aku</Label>
        <ToggleRow label="3 hari sebelum" value={r3d} onChange={setR3d} />
        <ToggleRow label="1 hari sebelum" value={r1d} onChange={setR1d} />
        <ToggleRow label="3 jam sebelum" value={r3h} onChange={setR3h} />
      </View>
    </>
  );

  if (!initial) {
    return (
      <Screen>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[styles.content, { paddingBottom: 120 + insets.bottom }]}
          keyboardShouldPersistTaps="handled">
          <BackButton />
          <View style={styles.titleRow}>
            <Title>Tanam tugas baru</Title>
            <Tugi size={48} />
          </View>
          {fields}
        </ScrollView>
        <View style={[styles.footer, { paddingBottom: 12 + insets.bottom }]}>
          <Button label="Tanam tugas" disabled={title.trim().length === 0} onPress={() => save()} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.content, { paddingBottom: 120 + insets.bottom }]}
        keyboardShouldPersistTaps="handled">
        <View style={styles.titleRow}>
          <BackButton />
          <View style={{ flex: 1 }} />
          <IconButton name="trash" onPress={remove} bg={C.coralSoft} color={C.coral} label="Hapus tugas" />
        </View>

        <View style={{ alignItems: 'center', gap: 8 }}>
          <View style={styles.heroEmoji}>
            <Animated.View style={[styles.heroGlyph, leafStyle]}>
              <Plant stage={stageOf(initial)} size={40} />
            </Animated.View>
            <Animated.View style={[styles.heroGlyph, styles.heroFlower, flowerStyle]}>
              <Plant stage="mekar" size={40} />
            </Animated.View>
          </View>
          <Title center>{initial.title}</Title>
          {initial.done && initial.late ? (
            <Text style={styles.lateBadge}>Selesai terlambat</Text>
          ) : null}
          <Pill bg={C.lavender} color={C.purpleDark}>
            {DAYS_SHORT[new Date(initial.due).getDay()]} · {initial.done ? 'selesai' : `sisa ${dueLabel(initial)}`}
          </Pill>
        </View>

        <Row label="Mata kuliah" value={initial.course_name ?? 'Tanpa mata kuliah'} />
        <Row label="Deadline" value={`${fmtDateLong(initial.due)} · ${fmtTime(initial.due_time)}`} />
        <Row label="Pengingat" value={reminderText} />
        <Row label="Ukuran" value={SIZES.find((s) => s.key === initial.size)?.label ?? 'Sedang'} />

        <Label>Ubah detail</Label>
        {fields}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: 12 + insets.bottom }]}>
        <Button label="Simpan perubahan" disabled={title.trim().length === 0} onPress={() => save()} />
        <Button label="Tandai selesai" variant="mint" disabled={blooming} onPress={complete} />
      </View>
    </Screen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: 16, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  heroEmoji: {
    width: 110,
    height: 110,
    borderRadius: 32,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroGlyph: { alignItems: 'center' as const, justifyContent: 'center' as const },
  heroFlower: { position: 'absolute' },
  lateBadge: { fontFamily: F.caption, fontSize: FS.caption, color: C.coral },
  group: { gap: 8 },
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
  weekRow: { flexDirection: 'row', gap: 8, paddingRight: 8 },
  dayChip: { width: 52, paddingHorizontal: 6, flexShrink: 0 },
  dayChipInner: { alignItems: 'center', gap: 2 },
  dayName: { fontFamily: F.caption, fontSize: FS.caption, color: C.dim },
  dayNumber: { fontFamily: F.display, fontSize: FS.h3, color: C.ink, fontVariant: ['tabular-nums'] },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.white,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    boxShadow: `0 3px 0 ${C.line}`,
  },
  rowLabel: { fontFamily: F.caption, fontSize: FS.caption, color: C.dim },
  rowValue: { fontFamily: F.body, fontSize: FS.body, color: C.ink },
  footer: {
    backgroundColor: C.cream,
    borderTopWidth: 1,
    borderTopColor: C.line,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 8,
  },
});
