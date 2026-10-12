import { useLocalSearchParams } from 'expo-router';

import { CourseForm } from '@/components/course-form';
import { Body, Screen } from '@/components/ui';
import { useStore } from '@/db';

export default function EditMataKuliah() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { courses } = useStore();
  const course = courses.find((c) => String(c.id) === String(id));

  if (!course) {
    return (
      <Screen style={{ padding: 20 }}>
        <Body>Mata kuliah tidak ditemukan.</Body>
      </Screen>
    );
  }

  return <CourseForm initial={course} />;
}
