import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter, type Href } from 'expo-router';
import { Alert, Pressable, Text, View } from 'react-native';

import { Body, shadow } from '@/components/ui';
import { C, F, FS, R } from '@/constants/theme';
import { useStore } from '@/db';
import { DAYS, fmtTime } from '@/lib/date';

export function CourseList() {
  const { courses, deleteCourse } = useStore();
  const router = useRouter();

  if (courses.length === 0) {
    return <Body style={{ color: C.dim }}>Belum ada mata kuliah. Tambahkan jadwalmu dulu ya.</Body>;
  }

  return (
    <>
      {courses.map((course) => (
        <Pressable
          key={course.id}
          onPress={() => router.push(`/matkul/${course.id}` as Href)}
          onLongPress={() =>
            Alert.alert('Hapus mata kuliah', `Hapus "${course.name}"?`, [
              { text: 'Batal', style: 'cancel' },
              { text: 'Hapus', style: 'destructive', onPress: () => deleteCourse(course.id) },
            ])
          }
          style={[styles.card, shadow(C.line, 4)]}>
          <View style={[styles.bar, { backgroundColor: course.color }]} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.name}>{course.name}</Text>
            <Text style={styles.meta}>
              {DAYS[course.day]} · {fmtTime(course.start)} - {fmtTime(course.end)}
            </Text>
            {course.lecturer ? <Text style={styles.meta}>{course.lecturer}</Text> : null}
          </View>
          <Ionicons name="pencil" size={20} color={C.dim} />
        </Pressable>
      ))}
    </>
  );
}

export function AddCourseButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.add, shadow(C.line)]}>
      <Ionicons name="add" size={20} color={C.purple} />
      <Text style={styles.addText}>Tambah mata kuliah</Text>
    </Pressable>
  );
}

const styles = {
  card: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 14,
    backgroundColor: C.white,
    borderRadius: R.card,
    padding: 14,
  },
  bar: { width: 12, height: 44, borderRadius: 6 },
  name: { fontFamily: F.display, fontSize: FS.h3, color: C.ink },
  meta: { fontFamily: F.caption, fontSize: FS.caption, color: C.dim },
  add: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    backgroundColor: C.white,
    borderRadius: 20,
    paddingVertical: 16,
  },
  addText: { fontFamily: F.body, fontSize: FS.body, color: C.purple },
};
