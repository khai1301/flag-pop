import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { makeQuestions, poolFor, type Country } from "../src/engine.ts";
import {
  empty,
  sanitizeProgress,
  sanitizeSession,
  finishSession,
  encodeChallenge,
  decodeChallenge,
  normalizeSearch,
  type Session,
  type Challenge,
} from "../src/storage.ts";
const countries: Country[] = JSON.parse(
  readFileSync(new URL("../src/data/countries.json", import.meta.url), "utf8"),
);
const session: Session = {
  id: "test-session",
  questions: makeQuestions(countries, 10, "test"),
  answers: [],
  selected: null,
  mode: "daily",
  region: "ALL",
  title: "Daily",
  started: Date.now(),
  day: "2026-11-10",
  spec: null,
};
test("corrupt progress never introduces invalid numeric state or foreign country codes", () => {
  const p = sanitizeProgress(
    {
      played: "9",
      answered: 5,
      correct: 100,
      best: Infinity,
      known: ["VN", "VN", "<script>"],
      mistakes: "VN",
      history: [null, {}],
    },
    countries,
  );
  assert.equal(p.played, 0);
  assert.equal(p.correct, 5);
  assert.equal(p.best, 0);
  assert.deepEqual(p.known, ["VN"]);
  assert.deepEqual(p.history, []);
});
test("session resumes same question, choice and options; malformed sessions are rejected", () => {
  const s = {
    ...session,
    answers: [session.questions[0].options[0].code],
    selected: session.questions[1].options[2].code,
  };
  assert.deepEqual(
    sanitizeSession(JSON.parse(JSON.stringify(s)), countries),
    s,
  );
  assert.equal(sanitizeSession({ ...s, selected: "XX" }, countries), null);
  assert.equal(sanitizeSession({ ...s, questions: [null] }, countries), null);
  assert.equal(
    sanitizeSession({ ...s, answers: Array(10).fill("VN") }, countries),
    null,
  );
});
test("completion is idempotent and daily result belongs to session start day", () => {
  const answers = session.questions.map((q) => q.country.code);
  const p = finishSession(empty, session, answers, new Date(2026, 10, 11, 12));
  assert.equal(p.played, 1);
  assert.equal(p.correct, 10);
  assert.equal(p.daily, "2026-11-10");
  assert.equal(finishSession(p, session, answers), p);
});
test("wrong answers enter review and correct review removes them", () => {
  const wrong = session.questions.map(
    (q) => q.options.find((c) => c.code !== q.country.code)!.code,
  );
  const p = finishSession(empty, session, wrong);
  assert.equal(p.mistakes.length, 10);
  const p2 = finishSession(
    p,
    { ...session, id: "review", mode: "review" },
    session.questions.map((q) => q.country.code),
  );
  assert.equal(p2.mistakes.length, 0);
  assert.equal(p2.known.length, 10);
});
test("challenge round trip reconstructs exact questions and rejects malicious payloads", () => {
  const c: Challenge = {
    v: 1,
    seed: "seed-a",
    region: "SEA",
    difficulty: "all",
    count: 10,
    score: 700,
  };
  assert.deepEqual(decodeChallenge("#challenge=" + encodeChallenge(c)), c);
  const decoded = decodeChallenge(encodeChallenge(c))!;
  const pool = poolFor(countries, decoded.region, decoded.difficulty);
  assert.deepEqual(
    makeQuestions(pool, c.count, c.seed),
    makeQuestions(pool, decoded.count, decoded.seed),
  );
  assert.equal(decodeChallenge("a".repeat(601)), null);
  assert.equal(
    decodeChallenge(btoa(JSON.stringify({ ...c, score: 90000 }))),
    null,
  );
  assert.equal(
    decodeChallenge(btoa(JSON.stringify({ ...c, region: "__proto__" }))),
    null,
  );
  assert.equal(decodeChallenge("not-json"), null);
});
test("Vietnamese search handles accents, uppercase and d-stroke", () => {
  assert.equal(normalizeSearch("  Đông Nam Á "), "dong nam a");
  assert.equal(normalizeSearch("ĐỨC"), "duc");
});
