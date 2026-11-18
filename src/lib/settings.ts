import { load } from "@tauri-apps/plugin-store";

/** One stretch of work and the break that follows it. */
export interface Session {
  workMinutes: number;
  breakSeconds: number;
}

/** Three is the owner's ceiling: more than that and nobody reads the list. */
export const MAX_SESSIONS = 3;

export const STORE_FILE = "store.json";

/** Keys are namespaced so a future rename never collides with an older key. */
export const K = {
  schedule: "chaoem.schedule",
  strict: "chaoem.strict",
  text: "chaoem.text",
  media: "chaoem.media",
  breaks: "chaoem.breaks",
  actions: "chaoem.actions",
} as const;

export const DEFAULT_TEXT = "Hãy nhìn ra xa 6 mét để mắt được nghỉ.";

export const DEFAULT_SESSIONS: Session[] = [
  { workMinutes: 20, breakSeconds: 20 },
];

export interface Media {
  /** File name inside the app's media folder, not a path. */
  image?: string;
  soundStart?: string;
  soundEnd?: string;
}

export function openStore() {
  return load(STORE_FILE, { autoSave: false });
}

export function sanitizeSessions(input: unknown): Session[] {
  if (!Array.isArray(input) || input.length === 0) return DEFAULT_SESSIONS;
  const out: Session[] = [];
  for (const raw of input.slice(0, MAX_SESSIONS)) {
    const item = raw as Partial<Session>;
    const work = Number(item?.workMinutes);
    const rest = Number(item?.breakSeconds);
    out.push({
      workMinutes: Number.isFinite(work) ? Math.min(600, Math.max(1, Math.round(work))) : 20,
      breakSeconds: Number.isFinite(rest) ? Math.min(3600, Math.max(5, Math.round(rest))) : 20,
    });
  }
  return out.length > 0 ? out : DEFAULT_SESSIONS;
}

export async function readSessions(): Promise<Session[]> {
  const store = await openStore();
  return sanitizeSessions(await store.get<Session[]>(K.schedule));
}

export async function readMedia(): Promise<Media> {
  const store = await openStore();
  return (await store.get<Media>(K.media)) ?? {};
}

/** Local date, not UTC: a break taken at 23:30 belongs to that evening. */
export function todayKey(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export async function readBreaks(): Promise<number> {
  const store = await openStore();
  const all = (await store.get<Record<string, number>>(K.breaks)) ?? {};
  return all[todayKey()] ?? 0;
}

/** Called once per reminder actually shown, so the figure means something. */
export async function bumpBreaks(): Promise<number> {
  const store = await openStore();
  const all = (await store.get<Record<string, number>>(K.breaks)) ?? {};
  const today = todayKey();
  const next = (all[today] ?? 0) + 1;
  all[today] = next;
  // Keep a fortnight; the figure on screen only ever needs today.
  const keys = Object.keys(all).sort().slice(-14);
  const trimmed: Record<string, number> = {};
  for (const k of keys) trimmed[k] = all[k];
  await store.set(K.breaks, trimmed);
  await store.save();
  return next;
}

/** 125 -> "2 phút 5 giây", 20 -> "20 giây". */
export function describeSeconds(total: number): string {
  const s = Math.max(0, Math.round(total));
  if (s < 60) return `${s} giây`;
  const m = Math.floor(s / 60);
  const rest = s % 60;
  return rest === 0 ? `${m} phút` : `${m} phút ${rest} giây`;
}
