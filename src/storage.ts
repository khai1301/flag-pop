import type { Country, Question } from "./engine";
import { localDay, updateStreak, REGIONS, poolFor, makeQuestions } from "./engine";
export type HistoryItem = {
  id: string;
  title: string;
  correct: number;
  total: number;
  at: string;
};
export type Progress = {
  played: number;
  correct: number;
  answered: number;
  known: string[];
  mistakes: string[];
  streak: number;
  lastDay: string;
  best: number;
  daily: string;
  history: HistoryItem[];
  completedIds: string[];
};
export type Challenge = {
  v: 1;
  seed: string;
  region: string;
  difficulty: string;
  count: number;
  score: number;
};
export type Session = {
  id: string;
  questions: Question[];
  answers: string[];
  selected: string | null;
  mode: string;
  region: string;
  title: string;
  started: number;
  day: string;
  spec: Challenge | null;
};
export const empty: Progress = {
  played: 0,
  correct: 0,
  answered: 0,
  known: [],
  mistakes: [],
  streak: 0,
  lastDay: "",
  best: 0,
  daily: "",
  history: [],
  completedIds: [],
};
export function readJSON(key: string): unknown {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
}
export function saveJSON(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
export function removeSaved(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* Storage may be disabled. */
  }
}
// In-flight games belong to a tab, while completed progress is shared.
export function readSession(): unknown {
  try {
    const current = sessionStorage.getItem('flagpop-session-v1');
    if (current) return JSON.parse(current);
    const legacy = localStorage.getItem('flagpop-session-v1');
    if (!legacy) return null;
    const parsed = JSON.parse(legacy);
    sessionStorage.setItem('flagpop-session-v1', legacy);
    localStorage.removeItem('flagpop-session-v1');
    return parsed;
  } catch { return null; }
}
export function saveSession(value: Session): boolean {
  try { sessionStorage.setItem('flagpop-session-v1', JSON.stringify(value)); return true; } catch { return false; }
}
export function clearSession() {
  try { sessionStorage.removeItem('flagpop-session-v1'); } catch { /* Optional storage. */ }
}
export function isValidDay(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(value + 'T00:00:00Z');
  return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === value;
}
export function newId(): string {
  // randomUUID is absent on ordinary LAN HTTP previews and older browsers.
  if (typeof globalThis.crypto?.randomUUID === 'function') return globalThis.crypto.randomUUID();
  if (globalThis.crypto?.getRandomValues) return [...globalThis.crypto.getRandomValues(new Uint8Array(16))].map(x => x.toString(16).padStart(2, '0')).join('');
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
}
export async function commitProgress(session: Session, answers: string[], countries: Country[], fallback: Progress): Promise<{ progress: Progress; saved: boolean }> {
  const commit = () => {
    const latest = sanitizeProgress(readJSON('flagpop-v1'), countries);
    const progress = finishSession(latest.played >= fallback.played ? latest : fallback, session, answers);
    return { progress, saved: saveJSON('flagpop-v1', progress) };
  };
  // Serialize read-modify-write across tabs on browsers that support Web Locks.
  if (typeof navigator !== 'undefined' && navigator.locks?.request) return navigator.locks.request('flagpop-progress', commit);
  return commit();
}
const integer = (x: unknown): number =>
  typeof x === "number" && Number.isSafeInteger(x) && x >= 0 ? x : 0;
export function sanitizeProgress(
  value: unknown,
  countries: Country[],
): Progress {
  if (!value || typeof value !== "object") return { ...empty };
  const p = value as Partial<Progress>;
  const codes = new Set(countries.map((c) => c.code));
  const list = (v: unknown) =>
    Array.isArray(v)
      ? [
          ...new Set(
            v.filter((x): x is string => typeof x === "string" && codes.has(x)),
          ),
        ]
      : [];
  const date = (v: unknown) => isValidDay(v) ? v : '';
  return {
    played: integer(p.played),
    answered: integer(p.answered),
    correct: Math.min(integer(p.correct), integer(p.answered)),
    known: list(p.known),
    mistakes: list(p.mistakes),
    streak: integer(p.streak),
    lastDay: date(p.lastDay),
    daily: date(p.daily),
    best: Math.min(100, integer(p.best)),
    completedIds: [...new Set([...(Array.isArray(p.completedIds) ? p.completedIds : []), ...(Array.isArray(p.history) ? p.history.map(h => h?.id) : [])].filter((id): id is string => typeof id === 'string' && id.length > 0 && id.length <= 128))],
    history: Array.isArray(p.history)
      ? p.history
          .filter(
            (h) =>
              h &&
              typeof h.id === "string" &&
              typeof h.title === "string" &&
              typeof h.at === "string" &&
              Number.isFinite(Date.parse(h.at)) &&
              Number.isInteger(h.correct) &&
              h.correct >= 0 &&
              Number.isInteger(h.total) &&
              h.total > 0 &&
              h.total <= 30 &&
              h.correct <= h.total,
          )
          .slice(0, 20)
      : [],
  };
}
export function sanitizeSession(
  value: unknown,
  countries: Country[],
): Session | null {
  try {
    const s = value as Session;
    if (
      !s ||
      typeof s.id !== "string" ||
      !s.id.length || s.id.length > 128 ||
      !Array.isArray(s.questions) ||
      s.questions.length < 1 ||
      s.questions.length > 30 ||
      !Array.isArray(s.answers) ||
      s.answers.length >= s.questions.length ||
      !Number.isFinite(s.started) ||
      s.started <= 0 ||
      typeof s.title !== "string" ||
      typeof s.region !== "string" ||
      typeof s.mode !== "string"
      || !['classic', 'daily', 'review', 'challenge', 'unseen', 'saved'].includes(s.mode)
      || !Object.hasOwn(REGIONS, s.region)
      || !isValidDay(s.day)
    )
      return null;
    const lookup = new Map(countries.map((c) => [c.code, c]));
    const qs: Question[] = [];
    for (const q of s.questions) {
      const country = lookup.get(q.country?.code);
      const options = q.options?.map((c) => lookup.get(c.code));
      if (
        !country ||
        !options ||
        options.length !== 4 ||
        options.some((c) => !c) ||
        new Set(options.map((c) => c!.code)).size !== 4 ||
        !options.some((c) => c?.code === country.code)
      )
        return null;
      qs.push({ country, options: options as Country[] });
    }
    if (
      new Set(qs.map((q) => q.country.code)).size !== qs.length ||
      s.answers.some((a, i) => !qs[i].options.some((c) => c.code === a))
    )
      return null;
    if (
      s.selected !== null &&
      !qs[s.answers.length].options.some((c) => c.code === s.selected)
    )
      return null;
    if (s.spec) {
      if (!validChallenge(s.spec)) return null;
      const pool = poolFor(countries, s.spec.region, s.spec.difficulty);
      if (s.spec.count > pool.length) return null;
      const expected = makeQuestions(pool, s.spec.count, s.spec.seed, pool.length >= 4 ? pool : countries);
      if (JSON.stringify(expected.map(q => [q.country.code, ...q.options.map(c => c.code)])) !== JSON.stringify(qs.map(q => [q.country.code, ...q.options.map(c => c.code)]))) return null;
    }
    return {
      ...s,
      questions: qs,
      spec: validChallenge(s.spec) ? s.spec : null,
    };
  } catch {
    return null;
  }
}
export function finishSession(
  p: Progress,
  session: Session,
  answers: string[],
  date = new Date(),
): Progress {
  if (p.completedIds.includes(session.id) || p.history.some((h) => h.id === session.id)) return p;
  if (answers.length !== session.questions.length)
    throw new Error("Incomplete session");
  let correct = 0;
  const known = new Set(p.known),
    mistakes = new Set(p.mistakes);
  session.questions.forEach((q, i) => {
    if (!q.options.some((c) => c.code === answers[i]))
      throw new Error("Invalid answer");
    if (q.country.code === answers[i]) {
      correct++;
      known.add(q.country.code);
      mistakes.delete(q.country.code);
    } else mistakes.add(q.country.code);
  });
  return {
    ...p,
    played: p.played + 1,
    correct: p.correct + correct,
    answered: p.answered + answers.length,
    known: [...known],
    mistakes: [...mistakes],
    best: Math.max(p.best, Math.round((correct / answers.length) * 100)),
    streak: updateStreak(p.lastDay, p.streak, date),
    lastDay: localDay(date),
    daily: session.mode === 'daily' && isValidDay(session.day) && session.day > p.daily ? session.day : p.daily,
    completedIds: [...p.completedIds, session.id],
    history: [
      {
        id: session.id,
        title: session.title,
        correct,
        total: answers.length,
        at: date.toISOString(),
      },
      ...p.history,
    ].slice(0, 20),
  };
}
export function validChallenge(value: unknown): value is Challenge {
  if (!value || typeof value !== "object") return false;
  const c = value as Challenge;
  return (
    c.v === 1 &&
    typeof c.seed === "string" &&
    /^[a-zA-Z0-9._-]{1,80}$/.test(c.seed) &&
    ["ALL", "AS", "EU", "AF", "NA", "SA", "OC", "SEA"].includes(c.region) &&
    ["all", "easy"].includes(c.difficulty) &&
    Number.isInteger(c.count) &&
    c.count >= 1 &&
    c.count <= 30 &&
    Number.isInteger(c.score) &&
    c.score >= 0 &&
    c.score <= c.count * 100 &&
    c.score % 100 === 0
  );
}
export function encodeChallenge(c: Challenge): string {
  if (!validChallenge(c)) throw new Error("Invalid challenge");
  return btoa(JSON.stringify(c))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
export function decodeChallenge(hash: string): Challenge | null {
  try {
    const raw = hash.replace(/^#challenge=/, "");
    if (raw.length > 600 || !/^[\w-]+$/.test(raw)) return null;
    const value = JSON.parse(atob(raw.replace(/-/g, "+").replace(/_/g, "/")));
    return validChallenge(value) ? value : null;
  } catch {
    return null;
  }
}
export function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}
