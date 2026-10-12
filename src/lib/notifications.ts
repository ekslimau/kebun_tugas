import * as Notifications from 'expo-notifications';
import { Linking, Platform } from 'react-native';

import type { Course, Task } from '@/db';
import { MINUTE, fmtTime } from '@/lib/date';

const CHANNEL = 'kebun-reminders';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL, {
    name: 'Pengingat tugas & kuliah',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
  });
}

/** Returns true when the OS has granted permission to post notifications. */
export async function ensurePermission(): Promise<boolean> {
  await ensureAndroidChannel();
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

export async function openSystemSettings() {
  await Linking.openSettings();
}

export const idsFor = (prefix: string) => [`${prefix}-3d`, `${prefix}-1d`, `${prefix}-3h`];

export async function cancelAllFor(prefix: string) {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    all
      .filter((n) => n.identifier.startsWith(prefix))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier))
  );
}

async function at(identifier: string, when: number, title: string, body: string) {
  if (when <= Date.now() + 5_000) return; // skip reminders already in the past
  await Notifications.scheduleNotificationAsync({
    identifier,
    content: { title, body, sound: 'default' },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(when), channelId: CHANNEL },
  });
}

export type TaskReminderInput = Pick<
  Task,
  'id' | 'title' | 'due' | 'due_time' | 'remind_3d' | 'remind_1d' | 'remind_3h'
> & { done?: number };

export async function syncTaskReminders(task: TaskReminderInput, courseName: string) {
  const prefix = `task-${task.id}`;
  await cancelAllFor(prefix);
  if (task.done) return;
  const deadline = task.due + task.due_time * MINUTE;
  const label = `Deadline ${fmtTime(task.due_time)}`;
  if (task.remind_3d) await at(`${prefix}-3d`, deadline - 3 * 1440 * MINUTE, task.title, `${label} · 3 hari lagi · ${courseName}`);
  if (task.remind_1d) await at(`${prefix}-1d`, deadline - 1440 * MINUTE, task.title, `${label} · besok · ${courseName}`);
  if (task.remind_3h) await at(`${prefix}-3h`, deadline - 3 * 60 * MINUTE, task.title, `${label} · 3 jam lagi · ${courseName}`);
}

/** Weekly reminder, one hour before a recurring class. */
export async function syncCourseReminders(course: Course) {
  const prefix = `course-${course.id}`;
  await cancelAllFor(prefix);
  const total = course.start - 60;
  if (total < 0) return;
  // expo's weekly trigger uses 1 = Sunday.
  const weekday = course.day + 1;
  const hour = Math.floor(total / 60);
  const minute = total % 60;
  await Notifications.scheduleNotificationAsync({
    identifier: `${prefix}-1h`,
    content: {
      title: `${course.name} mulai sebentar lagi`,
      body: `Kuliah ${fmtTime(course.start)} - ${fmtTime(course.end)}${course.lecturer ? ` · ${course.lecturer}` : ''}`,
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday,
      hour,
      minute,
      channelId: CHANNEL,
    },
  });
}

export async function rescheduleAll(courses: Course[], tasks: Task[]) {
  await Notifications.cancelAllScheduledNotificationsAsync();
  for (const course of courses) await syncCourseReminders(course);
  for (const task of tasks) await syncTaskReminders(task, 'Tugas');
}

/** Immediate nudge, posted when the app opens with late tasks and reminders are on. */
export async function notifyOverdue(count: number, firstTitle: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `${count} tugas terlewat`,
      body: count > 1 ? `${firstTitle} dan ${count - 1} lainnya menunggu kamu` : `${firstTitle} menunggu kamu`,
      sound: 'default',
    },
    trigger: null,
  });
}
