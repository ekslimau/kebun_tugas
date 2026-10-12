import type { Course, TaskWithCourse } from '@/db';
import { MINUTE, daysFromToday } from '@/lib/date';

export type Status = 'overdue' | 'today' | 'soon' | 'later' | 'done' | 'done_late';

export const deadlineOf = (t: Pick<TaskWithCourse, 'due' | 'due_time'>) => t.due + t.due_time * MINUTE;

export function statusOf(t: TaskWithCourse): Status {
  if (t.done) return t.late ? 'done_late' : 'done';
  if (deadlineOf(t) < Date.now()) return 'overdue';
  const days = daysFromToday(t.due);
  if (days <= 0) return 'today';
  if (days <= 3) return 'soon';
  return 'later';
}

/** 'telat 2 hari', 'Mendesak', 'besok', '3 hari lagi' — the caption under a task title. */
export function dueLabel(t: TaskWithCourse): string {
  const days = daysFromToday(t.due);
  if (statusOf(t) === 'overdue') return `telat ${Math.abs(days)} hari`;
  if (days <= 0) return 'Mendesak';
  if (days === 1) return 'besok';
  return `${days} hari lagi`;
}

/** Plant that reflects how urgent a task is, as used throughout the design. */
export const emojiFor = (t: TaskWithCourse) => {
  switch (statusOf(t)) {
    case 'overdue':
      return '🥀';
    case 'done':
    case 'done_late':
      return '🌸';
    case 'today':
    case 'soon':
      return '🌱';
    default:
      return '🌿';
  }
};

/** Overdue first (oldest first = highest priority), then by soonest deadline. */
export const sortTasks = (tasks: TaskWithCourse[]) =>
  [...tasks].sort((a, b) => {
    const sa = statusOf(a) === 'overdue' ? 0 : 1;
    const sb = statusOf(b) === 'overdue' ? 0 : 1;
    if (sa !== sb) return sa - sb;
    return deadlineOf(a) - deadlineOf(b);
  });

export const upcoming = (tasks: TaskWithCourse[]) => sortTasks(tasks.filter((t) => !t.done));

export const coursesOn = (courses: Course[], weekday: number) =>
  [...courses].filter((c) => c.day === weekday).sort((a, b) => a.start - b.start);
