import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Body, Label, Pill, Screen, Scroll, Title, shadow } from '@/components/ui';
import { Icon, Plant, Tugi } from '@/Asset';
import { C, F, FS, R } from '@/constants/theme';
import { useStore } from '@/db';
import { DAYS_SHORT, MINUTE, fmtDate, fmtTime } from '@/lib/date';
import { fmtCountdown, gardenStageOf, gardenTasks, nextClass, todaySummary, tugiLine, weekProgress } from '@/lib/home';
import { coursesOn, dueLabel, stageOf, statusOf, upcoming } from '@/lib/tasks';

export default function Beranda() {
  const { profile, tasks, courses, settings, streak } = useStore();
  const router = useRouter();

  const today = new Date();
  const dayStart = new Date(today).setHours(0, 0, 0, 0);
  const [nowMin, setNowMin] = useState(() => today.getHours() * 60 + today.getMinutes());
  // Countdown stays fresh: recompute every minute.
  useEffect(() => {
    const id = setInterval(() => {
      const d = new Date();
      setNowMin(d.getHours() * 60 + d.getMinutes());
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  const classes = coursesOn(courses, today.getDay());
  const open = upcoming(tasks);
  const overdue = open.filter((t) => statusOf(t) === 'overdue');
  const todayTasks = open.filter((t) => t.due === dayStart);
  const weekTasks = open.filter((t) => t.due > dayStart && t.due - dayStart <= 7 * 24 * 60 * MINUTE);

  const nc = nextClass(courses, nowMin, today.getDay());
  const summary = todaySummary(classes, tasks, dayStart);
  const week = weekProgress(tasks, dayStart);
  const garden = gardenTasks(tasks);
  const line = tugiLine(tasks, dayStart);

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

        {line ? <Body style={{ color: C.dim }}>{line}</Body> : null}

        {overdue.length > 0 ? (
          <View style={styles.banner}>
            <Plant stage="layu" size={40} />
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

        <Pressable
          accessibilityLabel="Kuliah berikutnya"
          onPress={() => router.push(`/kalender?tanggal=${dayStart}` as Href)}
          style={[styles.nextClass, shadow(C.line, 4)]}>
          {nc.kind === 'none' || nc.kind === 'done' ? (
            <View style={styles.nextClassEmpty}>
              <Tugi size={48} />
              <Text style={styles.nextClassTitle}>
                {nc.kind === 'none' ? 'Hari ini tidak ada kuliah' : 'Kuliah hari ini sudah selesai'}
              </Text>
            </View>
          ) : (
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.nextClassTitle} numberOfLines={1} ellipsizeMode="tail">
                {nc.course.name}
              </Text>
              <Text style={styles.nextClassTime}>
                {fmtTime(nc.course.start)} - {fmtTime(nc.course.end)}
              </Text>
              <Text style={styles.nextClassCountdown}>
                {nc.kind === 'ongoing' ? 'sedang berlangsung' : fmtCountdown(nc.startsIn)}
              </Text>
            </View>
          )}
        </Pressable>

        {summary.classes + summary.deadlines + summary.done > 0 ? (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <MiniStat label="Kuliah" value={summary.classes} />
            <MiniStat label="Deadline" value={summary.deadlines} />
            <MiniStat label="Selesai" value={summary.done} />
          </View>
        ) : null}

        <View style={[styles.weekCard, shadow(C.line, 4)]}>
          <Plant stage={week.ratio >= 1 ? 'mekar' : week.ratio >= 0.34 ? 'tumbuh' : 'tunas'} size={48} />
          <View style={{ flex: 1, gap: 6 }}>
            {week.y === 0 ? (
              <>
                <Text style={styles.rowTitle}>Belum ada tugas minggu ini</Text>
                <Pressable onPress={() => router.push('/tugas/baru' as Href)} style={styles.miniButton}>
                  <Icon name="plus" size={14} color={C.white} />
                  <Text style={styles.miniButtonText}>Tanam tugas</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={styles.rowTitle}>{`Tugas selesai ${week.x} dari ${week.y} minggu ini`}</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${Math.round(week.ratio * 100)}%` }]} />
                </View>
              </>
            )}
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Title size="h2">Kebun kamu</Title>
          </View>
          {garden.shown.length > 0 ? (
            <Pressable onPress={() => router.push('/tugas' as Href)} hitSlop={4}>
              <Text style={styles.linkText}>Lihat semua</Text>
            </Pressable>
          ) : null}
        </View>
        {garden.shown.length === 0 ? (
          <View style={styles.empty}>
            <Tugi size={56} />
            <Body style={{ color: C.dim, textAlign: 'center' }}>Kebunmu masih kosong</Body>
            <Pressable onPress={() => router.push('/tugas/baru' as Href)} style={styles.emptyBtn}>
              <Icon name="plus" size={16} color={C.white} />
              <Text style={styles.emptyBtnText}>Tanam tugas pertama</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 8 }}>
            {garden.shown.map((t) => (
              <Pressable
                key={t.id}
                onPress={() => router.push(`/tugas/${t.id}` as Href)}
                style={styles.gardenItem}>
                <Plant stage={gardenStageOf(t)} size={56} />
                <Text style={styles.gardenName} numberOfLines={1} ellipsizeMode="tail">
                  {t.title}
                </Text>
              </Pressable>
            ))}
            {garden.more > 0 ? (
              <Pressable onPress={() => router.push('/tugas' as Href)} style={styles.moreChip}>
                <Text style={styles.moreChipText}>{`+${garden.more} lagi`}</Text>
              </Pressable>
            ) : null}
          </ScrollView>
        )}

        <Title size="h2">Hari ini</Title>
        {agenda.length === 0 ? (
          <View style={styles.empty}>
            <Tugi size={72} />
            <Body style={{ color: C.dim, textAlign: 'center' }}>Belum ada tugas, yuk tanam yang pertama!</Body>
            <Pressable onPress={() => router.push('/tugas/baru' as Href)} style={styles.emptyBtn}>
              <Icon name="plus" size={16} color={C.white} />
              <Text style={styles.emptyBtnText}>Tanam tugas</Text>
            </Pressable>
          </View>
        ) : (
          agenda.map((row, i) => (
            <View key={`${row.kind}-${i}`} style={styles.agendaRow}>
              <Text style={styles.agendaTime}>{fmtTime(row.at)}</Text>
              <View style={[styles.agendaCard, { backgroundColor: row.color }]}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.rowTitle} numberOfLines={1} ellipsizeMode="tail">{row.title}</Text>
                  <Text style={styles.rowMeta}>{row.meta}</Text>
                </View>
                {row.pill ? <Pill>{row.pill}</Pill> : null}
              </View>
            </View>
          ))
        )}

        <Title size="h2">Minggu ini</Title>
        {weekTasks.length === 0 ? (
          <View style={styles.weekEmpty}>
            <Tugi size={40} />
            <Body style={{ color: C.dim, flex: 1 }}>Nggak ada deadline minggu ini</Body>
          </View>
        ) : (
          weekTasks.map((t) => {
            const days = Math.round((t.due - dayStart) / (24 * 60 * MINUTE));
            return (
              <Pressable
                key={t.id}
                onPress={() => router.push(`/tugas/${t.id}` as Href)}
                style={[styles.taskCard, { backgroundColor: C.skySoft }]}>
                <Plant stage={stageOf(t)} size={44} />
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

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <View style={[styles.miniStat, shadow(C.line)]}>
      <Text style={styles.miniStatValue}>{String(value)}</Text>
      <Text style={styles.miniStatLabel}>{label}</Text>
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
  bannerTitle: { fontFamily: F.display, fontSize: FS.h3, color: C.warn },
  bannerText: { fontFamily: F.caption, fontSize: FS.caption, color: C.warn },
  bannerButton: { backgroundColor: C.coral, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10 },
  bannerButtonText: { fontFamily: F.caption, fontSize: FS.caption, color: C.white },
  nextClass: {
    backgroundColor: C.skySoft,
    borderRadius: R.card,
    padding: 16,
    gap: 4,
  },
  nextClassEmpty: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 12 },
  nextClassTitle: { fontFamily: F.display, fontSize: FS.h3, color: C.ink, flex: 1 },
  nextClassTime: { fontFamily: F.body, fontSize: FS.body, color: C.ink },
  nextClassCountdown: { fontFamily: F.caption, fontSize: FS.caption, color: C.purple },
  miniStat: {
    flex: 1,
    alignItems: 'center' as const,
    gap: 2,
    backgroundColor: C.white,
    borderRadius: R.card,
    paddingVertical: 12,
  },
  miniStatValue: { fontFamily: F.display, fontSize: FS.h2, color: C.ink },
  miniStatLabel: { fontFamily: F.caption, fontSize: FS.caption, color: C.dim },
  weekCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    backgroundColor: C.white,
    borderRadius: R.card,
    padding: 14,
  },
  barTrack: { height: 10, borderRadius: R.pill, backgroundColor: C.line, overflow: 'hidden' as const },
  barFill: { height: 10, borderRadius: R.pill, backgroundColor: C.mint },
  miniButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    alignSelf: 'flex-start' as const,
    gap: 6,
    backgroundColor: C.purple,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  miniButtonText: { fontFamily: F.caption, fontSize: FS.caption, color: C.white },
  linkText: { fontFamily: F.caption, fontSize: FS.caption, color: C.purple },
  gardenItem: { width: 72, alignItems: 'center' as const, gap: 4 },
  gardenName: { fontFamily: F.caption, fontSize: FS.caption, color: C.dim, width: 72 },
  moreChip: {
    alignSelf: 'center' as const,
    backgroundColor: C.white,
    borderRadius: R.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  moreChipText: { fontFamily: F.caption, fontSize: FS.caption, color: C.dim },
  empty: { alignItems: 'center' as const, gap: 10, paddingVertical: 20 },
  emptyBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    backgroundColor: C.purple,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  emptyBtnText: { fontFamily: F.caption, fontSize: FS.caption, color: C.white },
  weekEmpty: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    backgroundColor: C.white,
    borderRadius: R.card,
    padding: 14,
  },
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
};
