import type { Course, TaskWithCourse } from '@/db';
import { MINUTE, daysFromToday, startOfDay, startOfWeek } from '@/lib/date';
import { coursesOn, sortTasks, statusOf, type Stage } from '@/lib/tasks';

/** 'Kuliah berikutnya' card state. */
export type NextClass =
  | { kind: 'upcoming'; course: Course; startsIn: number }
  | { kind: 'ongoing'; course: Course }
  | { kind: 'done' }
  | { kind: 'none' };

/** Nearest class today that has not ended (end > nowMinutes). */
export function nextClass(courses: Course[], nowMinutes: number, weekday: number): NextClass {
  const list = coursesOn(courses, weekday);
  if (list.length === 0) return { kind: 'none' };
  const next = list.find((c) => c.end > nowMinutes);
  if (!next) return { kind: 'done' };
  if (next.start > nowMinutes) return { kind: 'upcoming', course: next, startsIn: next.start - nowMinutes };
  return { kind: 'ongoing', course: next };
}

/** 'mulai 1 jam 5 menit lagi' / 'mulai 2 jam lagi' / 'mulai 40 menit lagi'. */
export function fmtCountdown(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `mulai ${h} jam ${m} menit lagi`;
  if (h > 0) return `mulai ${h} jam lagi`;
  return `mulai ${m} menit lagi`;
}

/** Counts for the three mini cards of "today". */
export function todaySummary(classes: Course[], tasks: TaskWithCourse[], dayStart: number) {
  return {
    classes: classes.length,
    deadlines: tasks.filter((t) => !t.done && t.due === dayStart).length,
    done: tasks.filter((t) => t.done && t.done_at != null && startOfDay(t.done_at) === dayStart).length,
  };
}

/** Week (Mon..Sun containing refMs) task progress: y total, x done. */
export function weekProgress(tasks: TaskWithCourse[], refMs: number) {
  const from = startOfWeek(refMs);
  const to = from + 7 * 24 * 60 * MINUTE;
  const inWeek = tasks.filter((t) => t.due >= from && t.due < to);
  const y = inWeek.length;
  const x = inWeek.filter((t) => t.done).length;
  return { x, y, ratio: y === 0 ? 0 : x / y };
}

/** Plant stage for the 'Kebun kamu' block ONLY — thresholds differ from stageOf on purpose. */
export function gardenStageOf(t: TaskWithCourse): Stage {
  if (statusOf(t) === 'overdue') return 'layu';
  if (t.done) return 'mekar';
  return daysFromToday(t.due) <= 2 ? 'tunas' : 'tumbuh';
}

/** Active tasks for the garden row: sorted, first `max`, plus how many are hidden. */
export function gardenTasks(tasks: TaskWithCourse[], max = 6) {
  const active = sortTasks(tasks.filter((t) => !t.done));
  return { shown: active.slice(0, max), more: Math.max(0, active.length - max) };
}

/** One-line Tugi greeting; null = no line. Overdue is the banner's job, never duplicated here. */
export function tugiLine(tasks: TaskWithCourse[], dayStart: number): string | null {
  const active = tasks.filter((t) => !t.done);
  if (active.length === 0) return null;
  const dueToday = sortTasks(active.filter((t) => t.due === dayStart));
  if (dueToday.length > 0) {
    const first = dueToday[0].title;
    return dueToday.length > 1 ? `${first} dan ${dueToday.length - 1} lainnya` : `Deadline hari ini: ${first}`;
  }
  const late = active.some((t) => statusOf(t) === 'overdue');
  return late ? null : 'Kebunmu rapi hari ini!';
}
