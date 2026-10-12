import { type SQLiteDatabase, openDatabaseAsync } from 'expo-sqlite';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { COURSE_COLORS } from '@/constants/theme';
import { addDays, startOfDay } from '@/lib/date';
import { cancelAllFor, syncCourseReminders, syncTaskReminders } from '@/lib/notifications';
import { deadlineOf } from '@/lib/tasks';

export type Course = {
  id: number;
  name: string;
  lecturer: string;
  day: number;
  start: number;
  end: number;
  color: string;
};

export type Task = {
  id: number;
  title: string;
  course_id: number | null;
  due: number;
  due_time: number;
  note: string;
  size: 'small' | 'medium' | 'large';
  remind_3d: number;
  remind_1d: number;
  remind_3h: number;
  done: number;
  done_at: number | null;
  /** 0 = tepat waktu, 1 = terlambat */
  late: number;
  created_at: number;
};

export type TaskWithCourse = Task & { course_name: string | null; course_color: string | null };

export type TaskInput = Omit<Task, 'id' | 'done' | 'done_at' | 'late' | 'created_at'>;

const DEFAULT_SETTINGS: Record<string, string> = {
  onboarded: '0',
  name: '',
  semester: '1',
  coins: '120',
  notify_3d: '1',
  notify_1d: '1',
  notify_3h: '1',
  notify_class: '1',
  notify_late: '1',
};

const DB_NAME = 'kebun-tugas.db';
const SCHEMA_VERSION = 2;

let dbPromise: Promise<SQLiteDatabase> | null = null;
const db = () => (dbPromise ??= openDatabaseAsync(DB_NAME));

async function migrate(conn: SQLiteDatabase) {
  await conn.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  const row = await conn.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const version = row?.user_version ?? 0;
  if (version >= SCHEMA_VERSION) return;

  if (version < 1) {
    await conn.execAsync(`
      CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        lecturer TEXT NOT NULL DEFAULT '',
        day INTEGER NOT NULL,
        start INTEGER NOT NULL,
        end INTEGER NOT NULL,
        color TEXT NOT NULL DEFAULT '${COURSE_COLORS[0]}'
      );
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        course_id INTEGER REFERENCES courses(id) ON DELETE SET NULL,
        due INTEGER NOT NULL,
        due_time INTEGER NOT NULL,
        note TEXT NOT NULL DEFAULT '',
        size TEXT NOT NULL DEFAULT 'medium',
        remind_3d INTEGER NOT NULL DEFAULT 1,
        remind_1d INTEGER NOT NULL DEFAULT 1,
        remind_3h INTEGER NOT NULL DEFAULT 0,
        done INTEGER NOT NULL DEFAULT 0,
        done_at INTEGER,
        created_at INTEGER NOT NULL
      );
    `);
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      await conn.runAsync('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)', key, value);
    }
    await conn.execAsync('PRAGMA user_version = 1');
  }

  if (version < 2) {
    await conn.execAsync(`ALTER TABLE tasks ADD COLUMN late INTEGER NOT NULL DEFAULT 0;`);
    await conn.execAsync(`PRAGMA user_version = 2`);
  }
}

/** First-run sample data, matching the content the design shows. */
async function seedSampleData(conn: SQLiteDatabase) {
  const seeded = await conn.getFirstAsync<{ value: string }>(
    "SELECT value FROM settings WHERE key = 'seeded'"
  );
  if (seeded?.value === '1') return;
  await conn.runAsync("INSERT OR REPLACE INTO settings (key, value) VALUES ('seeded', '1')");
  await insertSampleData(conn);
}

async function insertSampleData(conn: SQLiteDatabase) {
  const courses: CourseInput[] = [
    { name: 'Basis Data', lecturer: 'Pak Budi, M.Kom', day: 1, start: 480, end: 580, color: COURSE_COLORS[0] },
    { name: 'Struktur Data', lecturer: 'Bu Sri, M.T', day: 2, start: 600, end: 700, color: COURSE_COLORS[1] },
    { name: 'Kewarganegaraan', lecturer: 'Pak Andi', day: 3, start: 780, end: 880, color: COURSE_COLORS[2] },
  ];
  for (const c of courses) {
    await conn.runAsync(
      'INSERT INTO courses (name, lecturer, day, start, end, color) VALUES (?, ?, ?, ?, ?, ?)',
      c.name,
      c.lecturer,
      c.day,
      c.start,
      c.end,
      c.color
    );
  }

  const today = startOfDay(Date.now());
  const samples: [string, number, number, Task['size']][] = [
    ['Makalah Kewarganegaraan', 2, -2, 'small'],
    ['Laporan Praktikum', 0, -1, 'medium'],
    ['Kuis Struktur Data', 1, 3, 'medium'],
    ['Tugas Normalisasi', 0, 4, 'small'],
    ['Proposal Proyek Akhir', 1, 16, 'large'],
    ['Esai Pancasila', 2, 21, 'medium'],
  ];
  for (const [title, courseId, dayOffset, size] of samples) {
    await conn.runAsync(
      'INSERT INTO tasks (title, course_id, due, due_time, note, size, remind_3d, remind_1d, remind_3h, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      title,
      courseId + 1,
      addDays(today, dayOffset),
      1439, // 23.59, the deadline time the design uses
      '',
      size,
      1,
      dayOffset <= 1 ? 1 : 0,
      0,
      Date.now()
    );
  }
}

type CourseInput = Omit<Course, 'id'>;

type Store = {
  ready: boolean;
  settings: Record<string, string>;
  profile: { name: string; semester: number };
  courses: Course[];
  tasks: TaskWithCourse[];
  /** Consecutive days (ending today or yesterday) with at least one task finished. */
  streak: number;
  reload: () => Promise<void>;
  saveProfile: (name: string, semester: number) => Promise<void>;
  setSetting: (key: string, value: string) => Promise<void>;
  saveCourse: (input: CourseInput, id?: number) => Promise<number>;
  deleteCourse: (id: number) => Promise<void>;
  saveTask: (input: TaskInput, id?: number) => Promise<number>;
  deleteTask: (id: number) => Promise<void>;
  setDone: (id: number, done: boolean) => Promise<void>;
  reset: () => Promise<void>;
};

const StoreContext = createContext<Store | null>(null);

const TASK_SELECT = `SELECT t.*, c.name AS course_name, c.color AS course_color
  FROM tasks t LEFT JOIN courses c ON c.id = t.course_id`;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [streak, setStreak] = useState(0);
  const [settings, setSettings] = useState<Record<string, string>>(DEFAULT_SETTINGS);
  const [courses, setCourses] = useState<Course[]>([]);
  const [tasks, setTasks] = useState<TaskWithCourse[]>([]);

  const load = useCallback(async () => {
    const conn = await db();
    const [settingRows, courseRows, taskRows] = await Promise.all([
      conn.getAllAsync<{ key: string; value: string }>('SELECT key, value FROM settings'),
      conn.getAllAsync<Course>('SELECT * FROM courses ORDER BY day, start'),
      conn.getAllAsync<TaskWithCourse>(`${TASK_SELECT} ORDER BY t.due + t.due_time * 60000`),
    ]);
    setSettings(Object.fromEntries(settingRows.map((r) => [r.key, r.value])));
    setCourses(courseRows);
    setTasks(taskRows);

    const doneDays = new Set(
      taskRows
        .filter((t) => t.done_at && !t.late) // selesai terlambat tidak menambah streak
        .map((t) => startOfDay(t.done_at!).toString())
    );
    const today = startOfDay(Date.now());
    let cursor = doneDays.has(today.toString()) ? today : addDays(today, -1);
    let count = 0;
    while (doneDays.has(cursor.toString())) {
      count += 1;
      cursor = addDays(cursor, -1);
    }
    setStreak(count);
  }, []);

  useEffect(() => {
    (async () => {
      const conn = await db();
      await migrate(conn);
      await seedSampleData(conn);
      await load();
      setReady(true);
    })();
  }, [load]);

  const setSetting = useCallback(
    async (key: string, value: string) => {
      const conn = await db();
      await conn.runAsync(
        'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
        key,
        value
      );
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const saveProfile = useCallback(
    (name: string, semester: number) => setSetting('name', name).then(() => setSetting('semester', String(semester))),
    [setSetting]
  );

  const saveCourse = useCallback(async (input: CourseInput, id?: number) => {
    const conn = await db();
    let courseId = id ?? 0;
    if (id) {
      await conn.runAsync(
        'UPDATE courses SET name = ?, lecturer = ?, day = ?, start = ?, end = ?, color = ? WHERE id = ?',
        input.name,
        input.lecturer,
        input.day,
        input.start,
        input.end,
        input.color,
        id
      );
    } else {
      const res = await conn.runAsync(
        'INSERT INTO courses (name, lecturer, day, start, end, color) VALUES (?, ?, ?, ?, ?, ?)',
        input.name,
        input.lecturer,
        input.day,
        input.start,
        input.end,
        input.color
      );
      courseId = res.lastInsertRowId;
    }
    const course = { ...input, id: courseId };
    if (settings.notify_class === '1') await syncCourseReminders(course);
    await load();
    return courseId;
  }, [load, settings.notify_class]);

  const deleteCourse = useCallback(async (id: number) => {
    const conn = await db();
    await conn.runAsync('DELETE FROM courses WHERE id = ?', id);
    await cancelAllFor(`course-${id}`);
    await load();
  }, [load]);

  const saveTask = useCallback(async (input: TaskInput, id?: number) => {
    const conn = await db();
    let taskId = id ?? 0;
    if (id) {
      await conn.runAsync(
        `UPDATE tasks SET title = ?, course_id = ?, due = ?, due_time = ?, note = ?, size = ?,
         remind_3d = ?, remind_1d = ?, remind_3h = ? WHERE id = ?`,
        input.title,
        input.course_id,
        input.due,
        input.due_time,
        input.note,
        input.size,
        input.remind_3d,
        input.remind_1d,
        input.remind_3h,
        id
      );
    } else {
      const res = await conn.runAsync(
        `INSERT INTO tasks (title, course_id, due, due_time, note, size, remind_3d, remind_1d, remind_3h, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        input.title,
        input.course_id,
        input.due,
        input.due_time,
        input.note,
        input.size,
        input.remind_3d,
        input.remind_1d,
        input.remind_3h,
        Date.now()
      );
      taskId = res.lastInsertRowId;
    }
    const course = courses.find((c) => c.id === input.course_id);
    await syncTaskReminders({ ...input, id: taskId }, course?.name ?? 'Tugas');
    await load();
    return taskId;
  }, [courses, load]);

  const deleteTask = useCallback(async (id: number) => {
    const conn = await db();
    await conn.runAsync('DELETE FROM tasks WHERE id = ?', id);
    await cancelAllFor(`task-${id}`);
    await load();
  }, [load]);

  const setDone = useCallback(async (id: number, done: boolean) => {
    const conn = await db();
    const before = await conn.getFirstAsync<Task>('SELECT * FROM tasks WHERE id = ?', id);
    const isLate = done && before ? deadlineOf(before) < Date.now() : false;
    await conn.runAsync(
      'UPDATE tasks SET done = ?, done_at = ?, late = ? WHERE id = ?',
      done ? 1 : 0,
      done ? Date.now() : null,
      isLate ? 1 : 0,
      id
    );
    if (done && !before?.done) {
      // shortcut: coins only ever go up; no refund when a task is un-completed.
      const coins = Number(settings.coins ?? '0') + 10;
      await conn.runAsync("INSERT INTO settings (key, value) VALUES ('coins', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value", String(coins));
      await cancelAllFor(`task-${id}`);
    } else if (!done) {
      const row = await conn.getFirstAsync<Task>('SELECT * FROM tasks WHERE id = ?', id);
      if (row) await syncTaskReminders(row, 'Tugas');
    }
    await load();
  }, [load, settings.coins]);

  const reset = useCallback(async () => {
    const conn = await db();
    await conn.execAsync('DELETE FROM tasks; DELETE FROM courses;');
    await cancelAllFor('task-');
    await cancelAllFor('course-');
    await insertSampleData(conn);
    await load();
  }, [load]);

  const value = useMemo<Store>(
    () => ({
      ready,
      settings,
      profile: { name: settings.name ?? '', semester: Number(settings.semester ?? '1') },
      courses,
      tasks,
      streak,
      reload: load,
      saveProfile,
      setSetting,
      saveCourse,
      deleteCourse,
      saveTask,
      deleteTask,
      setDone,
      reset,
    }),
    [ready, settings, courses, tasks, streak, load, saveProfile, setSetting, saveCourse, deleteCourse, saveTask, deleteTask, setDone, reset]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
}
