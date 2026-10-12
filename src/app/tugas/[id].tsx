import { useLocalSearchParams } from 'expo-router';

import { TaskForm } from '@/components/task-form';
import { Body, Screen } from '@/components/ui';
import { useStore } from '@/db';

export default function DetailTugas() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tasks } = useStore();
  const task = tasks.find((t) => String(t.id) === String(id));

  if (!task) {
    return (
      <Screen style={{ padding: 20 }}>
        <Body>Tugas tidak ditemukan.</Body>
      </Screen>
    );
  }

  return <TaskForm initial={task} />;
}
