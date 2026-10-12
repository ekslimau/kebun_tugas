import { useRouter, type Href } from 'expo-router';

import { AddCourseButton, CourseList } from '@/components/course-list';
import { BackButton, Screen, Scroll, Title } from '@/components/ui';

export default function JadwalKuliah() {
  const router = useRouter();
  return (
    <Screen>
      <Scroll>
        <BackButton />
        <Title>Jadwal kuliah semesteran</Title>
        <CourseList />
        <AddCourseButton onPress={() => router.push('/matkul/baru' as Href)} />
      </Scroll>
    </Screen>
  );
}
