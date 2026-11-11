import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import {
  makeQuestions,
  poolFor,
  updateStreak,
  localDay,
  type Country,
} from "../src/engine.ts";
const data: Country[] = JSON.parse(
  readFileSync(new URL("../src/data/countries.json", import.meta.url), "utf8"),
);

test("195 unique countries with real local SVG assets", () => {
  assert.equal(data.length, 195);
  assert.equal(new Set(data.map((c) => c.code)).size, 195);
  for (const c of data) {
    assert.ok(c.name && c.nameEn && c.continent);
    const path = new URL(
      `../public/flags/${c.code.toLowerCase()}.svg`,
      import.meta.url,
    );
    assert.ok(existsSync(path), c.code);
    assert.match(readFileSync(path, "utf8"), /<svg/);
  }
});
test("daily seed yields identical questions and answer order", () => {
  assert.deepEqual(
    makeQuestions(data, 10, "2026-11-10"),
    makeQuestions(data, 10, "2026-11-10"),
  );
  assert.notDeepEqual(
    makeQuestions(data, 10, "2026-11-10"),
    makeQuestions(data, 10, "2026-11-11"),
  );
});
test("no repeats and exactly four unique options including the answer", () => {
  for (const region of ["ALL", "AS", "EU", "AF", "NA", "SA", "OC", "SEA"]) {
    for (const difficulty of ["all", "easy"]) {
      const pool = poolFor(data, region, difficulty);
      const q = makeQuestions(
        pool,
        30,
        `${region}-${difficulty}`,
        pool.length >= 4 ? pool : data,
      );
      assert.equal(q.length, Math.min(30, pool.length));
      assert.equal(new Set(q.map((x) => x.country.code)).size, q.length);
      for (const x of q) {
        assert.equal(new Set(x.options.map((o) => o.code)).size, 4);
        assert.equal(
          x.options.filter((o) => o.code === x.country.code).length,
          1,
        );
      }
    }
  }
});
test("Southeast Asia has 11 countries and contains Vietnam", () => {
  const pool = poolFor(data, "SEA", "all");
  assert.equal(pool.length, 11);
  assert.ok(pool.some((c) => c.code === "VN"));
});
test("single mistake can be reviewed with three valid distractors", () => {
  const q = makeQuestions([data[0]], 10, "review", data);
  assert.equal(q.length, 1);
  assert.equal(q[0].options.length, 4);
});
test("streak increments once a day, survives month boundary, resets after gap", () => {
  const day = new Date(2026, 10, 1, 12);
  assert.equal(localDay(day), "2026-11-01");
  assert.equal(updateStreak("2026-11-01", 5, day), 5);
  assert.equal(updateStreak("2026-10-31", 5, day), 6);
  assert.equal(updateStreak("2026-10-29", 5, day), 1);
});
