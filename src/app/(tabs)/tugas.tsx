import { useRouter, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated as RNAnimated, Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Body, Chip, Dot, Screen, Scroll, Title, shadow } from '@/components/ui';
import { C, F, FS, R } from '@/constants/theme';
import { useStore, type TaskWithCourse } from '@/db';
import { DAYS_SHORT } from '@/lib/date';
import { dueLabel, emojiFor, statusOf, upcoming } from '@/lib/tasks';

type Filter = 'all' | 'late' | 'week';

const UNDO_MS = 4000;
const SLIDE_MS = 350;

export default function DaftarTugas() {
  const { tasks, setDone, deleteTask } = useStore();
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('all');
  const [hidden, setHidden] = useState<number[]>([]);
  const [pending, setPending] = useState<{
    task: TaskWithCourse;
    timer: ReturnType<typeof setTimeout>;
  } | null>(null);

  const commitDelete = (task: TaskWithCourse) => {
    setPending(null);
    deleteTask(task.id);
  };

  /** Hides the task right away and only deletes for real once the undo window closes. */
  const remove = (task: TaskWithCourse) => {
    if (pending) {
      clearTimeout(pending.timer);
      commitDelete(pending.task);
    }
    setHidden((prev) => [...prev, task.id]);
    setPending({ task, timer: setTimeout(() => commitDelete(task), UNDO_MS) });
  };

  const undo = () => {
    if (!pending) return;
    clearTimeout(pending.timer);
    setHidden((prev) => prev.filter((id) => id !== pending.task.id));
    setPending(null);
  };

  const open = upcoming(tasks).filter((t) => !hidden.includes(t.id));
  const late = open.filter((t) => statusOf(t) === 'overdue');
  const week = open.filter((t) => statusOf(t) === 'today' || statusOf(t) === 'soon');

  const shown =
    filter === 'late' ? late : filter === 'week' ? [...late, ...week.filter((t) => !late.includes(t))] : open;

  const soon = shown.filter((t) => statusOf(t) === 'soon' || statusOf(t) === 'today');
  const later = shown.filter((t) => statusOf(t) === 'later');
  const shownLate = shown.filter((t) => statusOf(t) === 'overdue');

  return (
    <Screen>
      <Scroll>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Title>Daftar tugas</Title>
        </View>

        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          <Chip selected={filter === 'all'} onPress={() => setFilter('all')}>{`Semua (${open.length})`}</Chip>
          <Chip selected={filter === 'late'} onPress={() => setFilter('late')}>{`Terlambat (${late.length})`}</Chip>
          <Chip selected={filter === 'week'} onPress={() => setFilter('week')}>{`Minggu ini (${week.length})`}</Chip>
        </View>

        {shown.length === 0 ? <Body style={{ color: C.dim }}>Nggak ada tugas di filter ini. Aman! 🌿</Body> : null}

        {shownLate.length > 0 ? (
          <>
            <GroupHeading dot={C.coral} text="Terlambat — prioritas #1" />
            {shownLate.map((t, i) => (
              <TaskCard
                key={t.id}
                task={t}
                accent={C.coral}
                accentShadow={C.coralSoft}
                label={`Prioritas #${i + 1}`}
                onOpen={() => router.push(`/tugas/${t.id}` as Href)}
                onDone={() => setDone(t.id, true)}
                onRemove={() => remove(t)}
              />
            ))}
          </>
        ) : null}

        {soon.length > 0 ? <GroupHeading dot={C.sun} text="Deadline dekat" /> : null}
        {soon.map((t) => (
          <TaskCard key={t.id} task={t} onOpen={() => router.push(`/tugas/${t.id}` as Href)} />
        ))}

        {later.length > 0 ? <GroupHeading dot={C.purple} text="Masih lama" /> : null}
        {later.map((t) => (
          <TaskCard key={t.id} task={t} onOpen={() => router.push(`/tugas/${t.id}` as Href)} />
        ))}

        {shownLate.length > 0 ? (
          <View style={{ backgroundColor: C.skySoft, borderRadius: 16, padding: 12 }}>
            <Text style={{ fontFamily: F.caption, fontSize: FS.caption, color: C.ink }}>
              Tugas yang diselesaikan terlambat tetap bisa ditandai, tapi tidak menambah streak.
            </Text>
          </View>
        ) : null}
      </Scroll>

      {pending ? <UndoToast onUndo={undo} /> : null}
    </Screen>
  );
}

function GroupHeading({ dot, text }: { dot: string; text: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 4 }}>
      <Dot color={dot} />
      <Text style={{ fontFamily: F.display, fontSize: FS.h3, color: C.ink }}>{text}</Text>
    </View>
  );
}

function TaskCard({
  task,
  accent,
  accentShadow,
  label,
  onOpen,
  onDone,
  onRemove,
}: {
  task: TaskWithCourse;
  accent?: string;
  accentShadow?: string;
  label?: string;
  onOpen: () => void;
  onDone?: () => void;
  onRemove?: () => void;
}) {
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  const finish = () => {
    translateX.set(withTiming(300, { duration: SLIDE_MS }));
    opacity.set(withTiming(0, { duration: SLIDE_MS }));
    setTimeout(() => onDone?.(), SLIDE_MS);
  };

  return (
    <Animated.View style={anim}>
      <Pressable
        onPress={onOpen}
        style={[
          styles.card,
          shadow(accentShadow ?? C.line, 4),
          accent ? { borderWidth: 2, borderColor: accent, gap: 10 } : null,
        ]}>
        <View style={styles.cardHead}>
          <View style={{ backgroundColor: C.lavender, borderRadius: 16, padding: 8 }}>
            <Text style={{ fontSize: 21 }}>{emojiFor(task)}</Text>
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.cardTitle}>{task.title}</Text>
            <Text style={[styles.cardMeta, statusOf(task) === 'overdue' && { color: C.coral }]}>
              {task.course_name ?? 'Tanpa mata kuliah'} • {dueLabel(task)}
            </Text>
          </View>
          <Text style={[styles.cardLabel, statusOf(task) === 'overdue' && { color: C.coral }]}>
            {label ?? DAYS_SHORT[new Date(task.due).getDay()]}
          </Text>
        </View>

        {onDone && onRemove ? (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable style={[styles.action, { backgroundColor: C.mint }]} onPress={finish}>
              <Text style={styles.actionText}>Tandai selesai</Text>
            </Pressable>
            <Pressable style={[styles.action, { backgroundColor: C.coralSoft }]} onPress={onRemove}>
              <Text style={[styles.actionText, { color: C.coral }]}>Hapus</Text>
            </Pressable>
          </View>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

function UndoToast({ onUndo }: { onUndo: () => void }) {
  const [anim] = useState(() => new RNAnimated.Value(0));

  useEffect(() => {
    RNAnimated.timing(anim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  }, [anim]);

  return (
    <RNAnimated.View
      style={[
        styles.toast,
        {
          opacity: anim,
          transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }],
        },
      ]}>
      <Text style={styles.toastText}>Tugas dihapus</Text>
      <Pressable accessibilityRole="button" onPress={onUndo}>
        <Text style={styles.toastAction}>Urungkan</Text>
      </Pressable>
    </RNAnimated.View>
  );
}

const styles = {
  card: { backgroundColor: C.white, borderRadius: R.card, padding: 14, shadowColor: C.line },
  cardHead: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 12 },
  cardTitle: { fontFamily: F.display, fontSize: FS.h3, color: C.ink },
  cardMeta: { fontFamily: F.caption, fontSize: FS.caption, color: C.dim },
  cardLabel: { fontFamily: F.caption, fontSize: FS.caption, color: C.dim },
  action: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 10,
    borderRadius: 18,
  },
  actionText: { fontFamily: F.caption, fontSize: FS.caption, color: C.ink },
  toast: {
    position: 'absolute' as const,
    left: 20,
    right: 20,
    bottom: 12,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    backgroundColor: C.ink,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  toastText: { flex: 1, fontFamily: F.body, fontSize: FS.body, color: C.white },
  toastAction: { fontFamily: F.body, fontSize: FS.body, color: C.sun },
};
