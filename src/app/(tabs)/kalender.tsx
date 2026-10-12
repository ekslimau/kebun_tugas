import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Dot, Pill, Screen, Scroll, Title, shadow } from '@/components/ui';
import { Tugi } from '@/Asset';
import { C, F, FS, R } from '@/constants/theme';
import { useStore } from '@/db';
import { DAYS_SHORT, fmtDateLong, fmtMonth, fmtTime, startOfDay, startOfWeek } from '@/lib/date';
import { coursesOn, deadlineOf, dueLabel } from '@/lib/tasks';

export default function Kalender() {
  const { tasks, courses } = useStore();
  const router = useRouter();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(Date.now()));
  const [selected, setSelected] = useState(() => startOfDay(Date.now()));

  const days = useMemo(() => Array.from({ length: 5 }, (_, i) => startOfDay(weekStart + i * 86_400_000)), [weekStart]);
  const dayOf = (ms: number) => new Date(ms).getDay();

  const classes = coursesOn(courses, dayOf(selected));
  const deadlines = tasks.filter((t) => !t.done && t.due === selected).sort((a, b) => deadlineOf(a) - deadlineOf(b));

  const agenda = [
    ...classes.map((c) => ({
      at: c.start,
      title: c.name,
      meta: `Kuliah · ${fmtTime(c.start)} - ${fmtTime(c.end)}`,
      pill: '',
      color: c.color === C.coral ? C.coralSoft : C.skySoft,
    })),
    ...deadlines.map((t) => ({
      at: t.due_time,
      title: t.title,
      meta: `Deadline · ${t.course_name ?? 'Tanpa mata kuliah'}`,
      pill: dueLabel(t),
      color: C.coralSoft,
    })),
  ].sort((a, b) => a.at - b.at);

  const shiftWeek = (delta: number) => {
    const next = startOfWeek(weekStart + delta * 7 * 86_400_000);
    setWeekStart(next);
    setSelected(next);
  };

  return (
    <Screen>
      <Scroll>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Title>{fmtMonth(selected)}</Title>
          <View style={{ flex: 1 }} />
          <Pressable accessibilityLabel="Pekan sebelumnya" onPress={() => shiftWeek(-1)} style={[styles.round, shadow(C.line)]}>
            <Ionicons name="chevron-back" size={18} color={C.ink} />
          </Pressable>
          <View style={[styles.pill, shadow(C.line)]}>
            <Text style={styles.pillText}>Minggu</Text>
          </View>
          <Pressable accessibilityLabel="Pekan berikutnya" onPress={() => shiftWeek(1)} style={[styles.round, shadow(C.line)]}>
            <Ionicons name="chevron-forward" size={18} color={C.ink} />
          </Pressable>
        </View>

        <View style={{ flexDirection: 'row', gap: 6 }}>
          {days.map((day) => {
            const isSelected = day === selected;
            const hasClass = coursesOn(courses, dayOf(day)).length > 0;
            const hasTask = tasks.some((t) => !t.done && t.due === day);
            return (
              <Pressable
                key={day}
                onPress={() => setSelected(day)}
                style={[
                  styles.dayTile,
                  isSelected
                    ? { backgroundColor: C.purple, ...shadow(C.purpleDark, 4) }
                    : { backgroundColor: C.white, ...shadow(C.line, 4) },
                ]}>
                <Text style={[styles.dayName, isSelected && { color: C.white }]}>{DAYS_SHORT[dayOf(day)]}</Text>
                <Text style={[styles.dayNumber, isSelected && { color: C.white }]}>{new Date(day).getDate()}</Text>
                {hasClass || hasTask ? (
                  <View style={{ flexDirection: 'row', gap: 3, height: 7, alignItems: 'center' }}>
                    {hasClass ? <View style={[styles.mark, { backgroundColor: isSelected ? C.skySoft : C.sky }]} /> : null}
                    {hasTask ? <View style={[styles.mark, { backgroundColor: isSelected ? C.coralSoft : C.coral }]} /> : null}
                  </View>
                ) : (
                  <View style={{ height: 7 }} />
                )}
              </Pressable>
            );
          })}
        </View>

        <View style={{ flexDirection: 'row', gap: 14 }}>
          <Legend color={C.sky} text="Kuliah" />
          <Legend color={C.coral} text="Deadline" />
        </View>

        <Title size="h2">{fmtDateLong(selected)}</Title>
        {agenda.length === 0 ? (
          <View style={{ alignItems: 'center', gap: 8, paddingVertical: 12 }}>
            <Tugi size={72} />
            <Text style={{ fontFamily: F.body, fontSize: FS.body, color: C.dim, textAlign: 'center' }}>
              Hari bebas! Waktu luang — cocok buat nyicil tugas
            </Text>
          </View>
        ) : (
          agenda.map((row, i) => (
            <View key={`${row.title}-${i}`} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
              <Text style={styles.time}>{fmtTime(row.at)}</Text>
              <View style={[styles.agendaCard, { backgroundColor: row.color }]}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.agendaTitle}>{row.title}</Text>
                  <Text style={styles.agendaMeta}>{row.meta}</Text>
                </View>
                {row.pill ? <Pill>{row.pill}</Pill> : null}
              </View>
            </View>
          ))
        )}

        {deadlines.length === 0 && classes.length > 0 ? (
          <Pressable
            onPress={() => router.push('/tugas/baru' as Href)}
            style={{ backgroundColor: C.free, borderRadius: R.card, padding: 14 }}>
            <Text style={styles.agendaTitle}>Waktu luang</Text>
            <Text style={styles.agendaMeta}>Cocok buat nyicil tugas</Text>
          </Pressable>
        ) : null}
      </Scroll>
    </Screen>
  );
}

function Legend({ color, text }: { color: string; text: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <Dot color={color} />
      <Text style={{ fontFamily: F.caption, fontSize: FS.caption, color: C.dim }}>{text}</Text>
    </View>
  );
}

const styles = {
  round: { width: 34, height: 34, borderRadius: 17, backgroundColor: C.white, alignItems: 'center' as const, justifyContent: 'center' as const },
  pill: { backgroundColor: C.white, borderRadius: R.pill, paddingHorizontal: 14, paddingVertical: 8 },
  pillText: { fontFamily: F.body, fontSize: FS.body, color: C.ink },
  dayTile: { flex: 1, alignItems: 'center' as const, gap: 2, paddingVertical: 12, borderRadius: 20 },
  dayName: { fontFamily: F.caption, fontSize: FS.caption, color: C.dim },
  dayNumber: { fontFamily: F.display, fontSize: FS.h3, color: C.ink },
  mark: { width: 6, height: 6, borderRadius: 3 },
  time: { fontFamily: F.caption, fontSize: FS.caption, color: C.dim, paddingTop: 12, width: 44 },
  agendaCard: { flex: 1, flexDirection: 'row' as const, alignItems: 'center' as const, gap: 8, paddingHorizontal: 14, paddingVertical: 12, borderRadius: R.card },
  agendaTitle: { fontFamily: F.display, fontSize: FS.h3, color: C.ink },
  agendaMeta: { fontFamily: F.caption, fontSize: FS.caption, color: C.dim },
};
