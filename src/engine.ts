export type Country = {
  code: string;
  name: string;
  nameEn: string;
  continent: string;
  capital: string;
};
export type Question = { country: Country; options: Country[] };
export const REGIONS: Record<string, string> = {
  ALL: "Toàn thế giới",
  AS: "Châu Á",
  EU: "Châu Âu",
  AF: "Châu Phi",
  NA: "Bắc Mỹ",
  SA: "Nam Mỹ",
  OC: "Châu Đại Dương",
  SEA: "Đông Nam Á",
};
export const SEA = "VN TH LA KH MM MY SG ID PH BN TL".split(" ");
export const EASY =
  "VN JP KR CN TH SG ID MY PH IN US CA MX BR AR GB FR DE IT ES PT NL BE CH SE NO DK FI AU NZ EG ZA TR GR RU UA PL IE AT".split(
    " ",
  );
export function randomFromSeed(seed: string) {
  let n = 2166136261;
  for (const c of seed) n = Math.imul(n ^ c.charCodeAt(0), 16777619);
  return () => {
    n += 0x6d2b79f5;
    let t = n;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function shuffle<T>(values: T[], random = Math.random) {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export function poolFor(
  countries: Country[],
  region: string,
  difficulty: string,
) {
  return countries.filter(
    (c) =>
      (region === "ALL" ||
        (region === "SEA" ? SEA.includes(c.code) : c.continent === region)) &&
      (difficulty !== "easy" || EASY.includes(c.code)),
  );
}
export function makeQuestions(
  pool: Country[],
  count: number,
  seed: string,
  distractors = pool,
): Question[] {
  if (distractors.length < 4)
    throw new Error("Cần ít nhất 4 quốc gia để tạo câu hỏi.");
  const rng = randomFromSeed(seed);
  return shuffle(pool, rng)
    .slice(0, count)
    .map((country) => ({
      country,
      options: shuffle(
        [
          country,
          ...shuffle(
            distractors.filter((c) => c.code !== country.code),
            rng,
          ).slice(0, 3),
        ],
        rng,
      ),
    }));
}
export function localDay(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function updateStreak(
  previous: string,
  streak: number,
  date = new Date(),
) {
  if (previous === localDay(date)) return streak;
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  return previous === localDay(yesterday) ? streak + 1 : 1;
}
