import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter, type Href } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { Body, Label, Pill, Screen, Scroll, Title, shadow } from '@/components/ui';
import { C, F, FS, R } from '@/constants/theme';
import { useStore } from '@/db';
import { DAYS_SHORT, MINUTE, fmtDate, fmtTime } from '@/lib/date';
import { coursesOn, dueLabel, statusOf, upcoming } from '@/lib/tasks';

export default function Beranda() {
  const { profile, tasks, courses, settings, streak } = useStore();
  const router = useRouter();

  const today = new Date();
  const dayStart = new Date(today).setHours(0, 0, 0, 0);
  const classes = coursesOn(courses, today.getDay());
  const open = upcoming(tasks);
  const overdue = open.filter((t) => statusOf(t) === 'overdue');
  const todayTasks = open.filter((t) => t.due === dayStart);
  const weekTasks = open.filter((t) => t.due > dayStart && t.due - dayStart <= 7 * 24 * 60 * MINUTE);

  const agenda = [
    ...classes.map((c) => ({ kind: 'class' as const, at: c.start, title: c.name, meta: `Kuliah · ${fmtTime(c.start)} - ${fmtTime(c.end)}`, pill: '', color: C.skySoft })),
    ...todayTasks.map((t) => ({
      kind: 'task' as const,
      at: t.due_time,
      title: t.title,
      meta: `Deadline · ${t.course_name ?? 'Tanpa mata kuliah'}`,
      pill: 'Mendesak',
      color: C.coralSoft,
    })),
  ].sort((a, b) => a.at - b.at);

  return (
    <Screen>
      <Scroll>
        <View style={styles.head}>
          <View style={{ flex: 1 }}>
            <Label>{fmtDate(dayStart)}</Label>
            <Title>{`Selamat ${greeting()}, ${profile.name || 'kamu'}!`}</Title>
          </View>
          <Stat icon="leaf" color={C.mint} value={String(streak)} />
          <Stat icon="cash" color={C.sun} value={settings.coins ?? '0'} />
        </View>

        {overdue.length > 0 ? (
          <View style={styles.banner}>
            <Text style={styles.bannerEmoji}>🌱</Text>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.bannerTitle}>{overdue.length} tugas terlewat</Text>
              <Text style={styles.bannerText}>
                {overdue[0].title} {dueLabel(overdue[0])}
              </Text>
            </View>
            <Pressable onPress={() => router.push('/tugas' as Href)} style={styles.bannerButton}>
              <Text style={styles.bannerButtonText}>Beresin</Text>
            </Pressable>
          </View>
        ) : null}

        <Title size="h2">Hari ini</Title>
        {agenda.length === 0 ? (
          <Body style={{ color: C.dim }}>Belum ada agenda hari ini. Santai dulu 🌿</Body>
        ) : (
          agenda.map((row, i) => (
            <View key={`${row.kind}-${i}`} style={styles.agendaRow}>
              <Text style={styles.agendaTime}>{fmtTime(row.at)}</Text>
              <View style={[styles.agendaCard, { backgroundColor: row.color }]}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.rowTitle}>{row.title}</Text>
                  <Text style={styles.rowMeta}>{row.meta}</Text>
                </View>
                {row.pill ? <Pill>{row.pill}</Pill> : null}
              </View>
            </View>
          ))
        )}

        <Title size="h2">Minggu ini</Title>
        {weekTasks.length === 0 ? (
          <Body style={{ color: C.dim }}>Nggak ada deadline minggu ini.</Body>
        ) : (
          weekTasks.map((t) => {
            const days = Math.round((t.due - dayStart) / (24 * 60 * MINUTE));
            return (
              <Pressable
                key={t.id}
                onPress={() => router.push(`/tugas/${t.id}` as Href)}
                style={[styles.taskCard, { backgroundColor: C.skySoft }]}>
                <Text style={styles.taskEmoji}>🌱</Text>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={styles.rowTitle}>{t.title}</Text>
                  <Text style={styles.rowMeta}>
                    {DAYS_SHORT[new Date(t.due).getDay()]}, {fmtTime(t.due_time)} · {t.course_name ?? 'Tanpa mata kuliah'}
                  </Text>
                  <Pill>{days <= 1 ? 'Besok' : `${days} hari`}</Pill>
                </View>
              </Pressable>
            );
          })
        )}
      </Scroll>
    </Screen>
  );
}

function Stat({ icon, color, value }: { icon: keyof typeof Ionicons.glyphMap; color: string; value: string }) {
  return (
    <View style={[styles.stat, shadow(C.line)]}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 11) return 'pagi';
  if (h < 15) return 'siang';
  if (h < 19) return 'sore';
  return 'malam';
}

const styles = {
  head: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 8 },
  stat: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 5,
    backgroundColor: C.white,
    borderRadius: R.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  statValue: { fontFamily: F.body, fontSize: FS.body, color: C.ink },
  banner: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    backgroundColor: C.coralSoft,
    borderRadius: R.banner,
    padding: 14,
  },
  bannerEmoji: { fontSize: 40 },
  bannerTitle: { fontFamily: F.display, fontSize: FS.h3, color: C.warn },
  bannerText: { fontFamily: F.caption, fontSize: FS.caption, color: C.warn },
  bannerButton: { backgroundColor: C.coral, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10 },
  bannerButtonText: { fontFamily: F.caption, fontSize: FS.caption, color: C.white },
  agendaRow: { flexDirection: 'row' as const, alignItems: 'flex-start' as const, gap: 10 },
  agendaTime: { fontFamily: F.caption, fontSize: FS.caption, color: C.dim, paddingTop: 12, width: 44 },
  agendaCard: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: R.card,
  },
  rowTitle: { fontFamily: F.display, fontSize: FS.h3, color: C.ink },
  rowMeta: { fontFamily: F.caption, fontSize: FS.caption, color: C.dim },
  taskCard: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 14, padding: 14, borderRadius: R.big },
  taskEmoji: { fontSize: 40, width: 56, textAlign: 'center' as const },
};
