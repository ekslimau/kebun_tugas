import { useRouter, type Href } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AddCourseButton, CourseList } from '@/components/course-list';
import { StepHeader } from '@/components/onboarding';
import { Button, Label, Screen, Scroll, Title } from '@/components/ui';

export default function OnboardingJadwal() {
  const router = useRouter();
  return (
    <Screen>
      <Scroll>
        <StepHeader step={2} />
        <Title>Jadwal kuliah semesteran</Title>
        <Label>Cukup isi sekali. Nanti jadi pilihan pas kamu nambah tugas, dan aku ingetin 1 jam sebelum kuliah.</Label>
        <CourseList />
        <AddCourseButton onPress={() => router.push('/matkul/baru' as Href)} />
      </Scroll>
      <View style={styles.footer}>
        <Button label="Lanjut" onPress={() => router.push('/onboarding/notifikasi' as Href)} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({ footer: { paddingHorizontal: 20, paddingBottom: 24 } });
